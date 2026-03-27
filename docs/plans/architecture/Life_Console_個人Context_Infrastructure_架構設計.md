# Life Console 個人 Context Infrastructure 架構設計

> **日期：** 2026-03-27
> **狀態：** 架構確認，待實作
> **基於：** 知識庫設計討論紀錄、Zettelkasten 研究、grapeot/context-infrastructure 分析

---

## 一、設計背景

### 1.1 參考來源

- `docs/plans/Life_Console_知識庫與個人系統設計討論紀錄.md`
- `docs/plans/卡片盒筆記法與 Heptabase 探討.md`
- [grapeot/context-infrastructure](https://github.com/grapeot/context-infrastructure)

### 1.2 grapeot/context-infrastructure 的關鍵洞察

grapeot 實作了一個以檔案系統為基礎的三層記憶系統，運行超過一年：

| 層 | 位置 | 載入方式 | 內容 |
|----|------|----------|------|
| L3（永久層） | `rules/` | 每次 session 被動載入 | SOUL, USER, axioms, skills |
| L1/L2（動態層） | `contexts/memory/OBSERVATIONS.md` | AI 主動 grep/語義搜索 | 每日觀察，每週蒸餾 |

**Observer（每日）：** 掃 workspace 檔案變動 → 寫入三級觀察（🔴🟡🟢）
**Reflector（每週）：** 把 🔴 高價值觀察「晉升」到 `rules/`（axioms, skills）+ GC 過期記錄

**蒸餾的原料：** 使用者實際工作行為（code 改動、決策記錄），**不是**閱讀的文章。

**使用方式：** 以 context-infrastructure 目錄為工作主目錄，所有工作在此進行（grapeot 模式 = 把工作帶進 context 空間）。

### 1.3 Life Console 的不同定位

Life Console 採用**推送模式（push）**，不採用 grapeot 的拉入模式（pull）：

```
grapeot：  使用者 → 進入 context repo → 從裡面工作
Life Console：使用者 → 在任何工具工作 → 工具透過 MCP 拉取 context
```

Life Console 是**背景常駐的個人 context server**，任何工具都可以連接，不改變使用者的工作習慣。

---

## 二、兩層知識架構

Life Console 的知識分成性質根本不同的兩層：

| 維度 | 知識庫 | Agent 層 |
|------|--------|----------|
| 內容 | 我知道什麼、我讀到什麼 | 我怎麼行動、思考、決策 |
| 原料 | 外部輸入（文章、書、對話） | 工作行為 + 主動反思 |
| 典型條目 | 「RAG 的 recall/precision 有 trade-off」 | 「評估技術方案：先 prototype 再設計」 |
| 組織方式 | Zettelkasten（卡片網絡） | grapeot 模式（axioms, skills, methodologies） |
| 成長方式 | AI 自動拆解，使用者確認 | 使用者主動觸發蒸餾 |
| 位置 | 使用者自訂目錄（Obsidian 相容） | Life Console userData（LC 管理） |

---

## 三、四個使用情境

### 情境一：Claude Code + Agent 層 + 知識庫（最高價值）

- **方式：** Skill Loader 推送 Agent 層到本地 .md 檔 + MCP server 提供深度查詢
- **被動載入：** Claude Code 讀 `CLAUDE.md`（含核心 axioms）
- **主動查詢：** `getMethodology(topic)` / `searchKnowledge(query)`
- **跨 agent：** 同一個 Skill 可生成 `.cursor/rules/`、`.windsurfrules` 等不同 IDE 格式
- **適合：** 用我的原則寫 code、code review、技術決策

### 情境二：Claude 直接讀取知識庫（技術最簡單，可早實作）

- **方式：** MCP 提供唯讀知識庫存取
- **工具：** `searchKnowledge(query)` / `getCard(id)` / `listTopics()`
- **適合：** 讓 AI 知道我讀過什麼、查詢特定主題的背景知識

### 情境三：Life Console UI Chat（核心飛輪）

- **方式：** 外接 Model API，全量注入 Agent 層 + 按需載入相關知識卡片到 system prompt
- **蒸餾流程：**
  1. 使用者說「把這個想法整合進我的決策原則」
  2. AI 讀取現有 Agent 層，分析衝突/互補
  3. 和使用者討論取捨與融合方式
  4. 確認後寫回 Agent 層 Markdown 檔
  5. 自動觸發 Skill Loader，同步到本地 .md 檔
- **適合：** 思考、反思、提煉方法論、討論如何整合新洞察

### 情境四：Life Console UI 知識庫管理（基礎）

- **方式：** Electron UI 直接讀寫 Markdown 檔
- **功能：** 貼入文章 → AI 拆解成 KnowledgeCard → 使用者確認分類 → 瀏覽/搜索/編輯
- **適合：** 整理知識庫、管理卡片關係

---

## 四、整體架構圖

```
外部工具（Claude Code, Cursor, Windsurf, 任何 AI）
         │
         │ ① 讀本地 .md（Skill Loader 推送）
         │ ② MCP query（深度查詢）
         ▼
┌─────────────────────────────────────────────┐
│         Life Console MCP Server（常駐）      │
│  getMethodology / listAxioms / searchKnowledge │
└────────┬────────────────────────┬────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌──────────────────────┐
│    Agent 層      │    │       知識庫          │
│ (LC userData)   │    │  (使用者自訂目錄)     │
│                 │    │                      │
│ axioms/         │◄───┤  KnowledgeCard       │
│ methodologies/  │蒸餾│  SourceArticle        │
│ skills/         │    │  Argument            │
└────────▲────────┘    │  OpenQuestion        │
         │             └──────────┬───────────┘
         │                        │
         │         ┌──────────────┘
         │         │ AI 自動拆解文章
         ▼         ▼
┌─────────────────────────────────────────────┐
│          Life Console UI（Electron）         │
│                                             │
│  情境三：Chat 蒸餾介面  情境四：KB 管理介面  │
│  ├── 全量注入 Agent 層  ├── 貼入文章        │
│  ├── 查詢相關 KB 卡片   ├── 確認 AI 分類    │
│  └── 寫回 Agent 層      └── 瀏覽/編輯卡片  │
│                                             │
│  現有：Inbox / Today / Toolbox / Skills     │
└─────────────────────────────────────────────┘
```

---

## 五、閉環飛輪

```
情境四（收資料）
  貼入文章 → AI 拆解成 KnowledgeCard → 使用者確認分類
       ↓ 知識庫累積
情境三（提煉，核心飛輪）
  讀相關卡片 + 現有 Agent 層 → 和 AI 討論 → 寫回 Agent 層
       ↓ 自動觸發
  Skill Loader
  生成各 IDE 對應的本地 .md 檔（CLAUDE.md, .cursor/rules/, ...）
       ↓
情境一（使用）
  Claude Code 被動讀 context → 用我的原則做事
       ↓ 工作行為 → 未來可作為觀察原料
```

---

## 六、Skill Loader 設計

取代直接寫 `~/.claude/CLAUDE.md` 的方案，做成 Life Console 的一個 Skill：

**執行內容：**
1. 讀取 Agent 層所有 Markdown（axioms, methodologies, skills）
2. 生成格式化的 context 檔案，輸出到：
   - `~/.claude/CLAUDE.md`（Claude Code）
   - `.cursor/rules/life-console.md`（Cursor）
   - `.windsurfrules`（Windsurf）
   - 任何其他可設定的目標
3. 包含 MCP server 連線說明和工具使用指引

**觸發方式：**
- 情境三 完成蒸餾後自動觸發
- 使用者手動觸發（Toolbox 裡執行）
- Life Console 啟動時可選擇自動觸發

**好處：** Agent-agnostic，不綁定 Claude Code；可載入 MCP 設定、腳本說明等更豐富的資訊；可像 OpenSpec 一樣指導本地 .md 檔的建立。

---

## 七、關鍵技術決策

| 維度 | 決策 | 原因 |
|------|------|------|
| 知識庫儲存格式 | 先 Markdown，逐步轉混合（SQLite 索引 + Markdown 內容） | Obsidian 相容，AI 原生讀寫 |
| Agent 層位置 | Life Console userData（不開放使用者自訂） | 是 LC 的核心 knowhow，統一管理 |
| 知識庫位置 | 使用者自訂目錄，有匯出功能 | Obsidian 相容，使用者有掌控感 |
| Agent 層成長 | 使用者主動在情境三觸發，不自動 | 確保使用者理解並同意每個新增的原則；可先討論如何與現有體系融合 |
| 被動載入方式 | Skill Loader 推送本地 .md 檔 | 跨 IDE、跨 agent，不只綁 Claude Code |
| MCP 暴露範圍 | Agent 層 + 知識庫查詢，從唯讀開始 | 最小可行，後續擴展寫入能力 |
| 情境優先順序 | 4 → 3 → 2 → 1 | 先有資料，再有飛輪，再對外暴露 |

---

## 八、與現有架構的關係

### records 表
繼續保留作為 Skill 執行紀錄（原始行為痕跡）。目前不自動蒸餾到 Agent 層，未來可作為觀察原料。

### Skills 架構擴展
- **知識庫拆解器 Skill：** 輸入文章 URL 或文字 → AI 拆解 → 輸出 KnowledgeCard Markdown
- **Skill Loader Skill：** 讀 Agent 層 → 生成各 IDE 對應的本地 context 檔
- 現有 Skill 機制（manifest.json + core.ts）不需要改動

### Object Model（已移除）
MVP v0.1 的 Object Model（objects/relations 表）已在 redefine-as-skill-platform 中移除。新的知識庫改用 Markdown 檔案實作，不再回到 SQLite Object Model。

---

## 九、待解決問題

| ID | 問題 | 狀態 |
|----|------|------|
| A1 | Skill Loader 觸發時機：啟動時自動？情境三完成後自動？或純手動？ | 🔴 待決議 |
| A2 | 知識庫 Markdown 檔與未來 SQLite 索引的同步策略 | 🔴 待設計 |
| A3 | 情境三 system prompt 結構：如何在 context 完整性和 token 成本之間取捨？ | 🟡 討論中 |
| A4 | MCP server port 管理和安全性（只開 localhost？） | 🟡 討論中 |
| A5 | Agent 層 Methodology 的 Markdown 格式，確保主流 LLM 都能正確理解 | 🟡 討論中 |
| A6 | 知識庫和 Agent 層之間的 `distilled_from` 關係如何追蹤（Markdown frontmatter？） | 🟡 討論中 |
| A7 | 情境三的 Chat UI 是否需要支援多輪對話歷史？如何儲存？ | 🟡 討論中 |
