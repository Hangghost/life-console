## Context

兩個獨立的改動：

**1. Prompt 重設計**：`skills/knowledge-ingestion/core.ts` 的 system + user prompt 缺乏 Zettelkasten 方法論指引，產出卡片品質不穩定。

**2. 卡片刪除**：KnowledgePage 目前無刪除路徑。刪除需要三層協作：renderer UI → preload IPC bridge → main process 的 fs.unlinkSync。

## Goals / Non-Goals

**Goals:**
- Prompt 依 Zettelkasten 三原則（原子性、自治性、連結性）重設計，以繁體中文輸出
- KnowledgePage 新增 Delete 按鈕，附確認提示，刪除磁碟上的 `.md` 檔案

**Non-Goals:**
- 不新增「軟刪除」或垃圾桶機制，直接從磁碟刪除
- 不修改 KnowledgeCard 的資料結構
- 不處理 source article 的連動刪除

## Decisions

### Prompt 設計策略

**決定**：system prompt 嵌入 Zettelkasten 三原則作為 AI 角色定義，user prompt 以結構化規則列表引導輸出，並在 JSON schema 的欄位說明中強化各原則。

**理由**：研究文件指出，高品質永久筆記需同時滿足：(1) 原子性——一張卡片只討論一個核心論點；(2) 自治性——脫離原文仍能理解；(3) 以自己的語言轉述而非剪貼。將這些規則嵌入 prompt 而非只說「3-15 張卡片」，能顯著提升卡片品質。

**tags 語言決定**：tags 允許中英混用（技術術語可直接用英文 tag，如 `RAG`、`LLM`），content 和 topic 要求繁體中文主體。

### 刪除架構

**決定**：新增 `knowledge:delete` IPC channel，接收 `filePath`，在 main process 執行 `fs.unlinkSync`；UI 層以 `window.confirm` 做確認提示。

**理由**：刪除操作不可逆，確認提示是最低安全門檻。`filePath` 已是 KnowledgeCard 的已知欄位，不需新增 type。`unlinkSync` 在 main process 執行符合 Electron 安全模型（renderer 不直接操作 fs）。

## Risks / Trade-offs

- [風險] 刪除後 renderer 的 `cards` state 需手動過濾，否則 UI 不同步 → 在 `handleDelete` callback 中直接 filter state
- [風險] `unlinkSync` 若檔案不存在會拋出例外 → main process 加 try/catch，回傳 `{ success, error }`
- [Trade-off] `window.confirm` 是同步 blocking dialog，但對 Electron renderer 是可接受的簡單方案
