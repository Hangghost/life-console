## Context

Life Console 目前是 skill 執行平台（schema: `records` 表儲存 skill 執行紀錄）。使用者缺乏兩個關鍵能力：(1) 系統化累積閱讀的知識；(2) 讓外部 AI 工具持續理解自己的思維框架。

grapeot/context-infrastructure 的三層記憶架構（L3 被動載入 / L1 主動查詢 / 自動蒸餾）提供了重要參考，但其「把工作帶進 context repo」的使用模式不適合 Life Console。Life Console 採用反向的「把 context 推出去給任何工具」模式。

## Goals / Non-Goals

**Goals:**
- 知識庫：AI 輔助的 Zettelkasten，Obsidian 相容，Markdown 檔案儲存
- Agent 層：使用者個人 axioms/methodologies/skills，MCP 對外暴露
- Skill Loader：推送 Agent 層 context 到本地 IDE 設定檔，跨 agent 相容
- MCP Server：常駐，讓外部工具按需查詢 Agent 層和知識庫
- Chat 蒸餾介面：全量注入 Agent 層，使用者主動觸發蒸餾
- 閉環飛輪：知識庫 → 蒸餾 → Agent 層 → Skill Loader → 外部工具

**Non-Goals:**
- 不實作自動蒸餾（Observer/Reflector cron），蒸餾由使用者主動觸發
- 不支援 Agent 層寫入的 MCP 端點（Phase 1 唯讀）
- 不替代 Obsidian 或 Notion，LC 的知識庫管理 UI 是輔助，非主體
- 不實作知識庫的向量索引（Phase 1 用全文搜索，Phase 2 再加向量）

## Decisions

### D1：知識庫儲存格式 — Markdown 檔案（非 SQLite）

**選擇：** Markdown 檔案 + frontmatter，存於使用者自訂目錄。

**理由：** Obsidian 相容是核心需求；AI 可直接讀寫；git 可版本控制；格式可讀性高。SQLite 在查詢效能上有優勢，但 Phase 1 規模下全文搜索已足夠，未來可加 SQLite 索引層作為 Phase 2 優化。

**替代方案：** SQLite（查詢快但不 Obsidian 相容）；JSON（不易手動編輯）。

### D2：Agent 層位置 — Life Console userData，不開放自訂

**選擇：** `~/Library/Application Support/life-console/agent/`

**理由：** Agent 層是 Life Console 的核心 knowhow，需要 LC 統一管理版本和格式。開放使用者自訂路徑會增加同步複雜度且無明顯好處。知識庫才是使用者應該有完整掌控的部分。

### D3：被動載入策略 — Skill Loader 推送本地檔案（非直接寫 CLAUDE.md）

**選擇：** 做成 Skill，由 Life Console 執行，生成各 IDE 對應的 context 檔。

**理由：** Agent-agnostic（支援 Claude Code、Cursor、Windsurf、任意 agent）；可包含 MCP 連線說明、腳本說明等比 axioms 更豐富的資訊；可像 OpenSpec 一樣指導本地 .md 結構；觸發時機可控（手動、蒸餾後自動、啟動時）。

**替代方案：** 直接寫 `~/.claude/CLAUDE.md`（只支援 Claude Code，且是全域副作用）。

### D4：MCP Server 實作 — Electron main process 內嵌，HTTP/SSE

**選擇：** 在 Electron main process 中起 HTTP server（localhost:7777），實作 MCP over HTTP/SSE。

**理由：** Life Console 已是常駐 Electron App；無需額外 process；port 固定，IDE 設定一次即可；關閉 App 時 MCP 自動停止，符合使用者預期。

**風險：** port 衝突。緩解：在 settings 中允許使用者修改 port；啟動時檢查 port 是否被佔用。

### D5：蒸餾觸發 — 使用者主動，不自動

**選擇：** 情境三 Chat 介面中，使用者明確說「把這個整合進我的方法論」才觸發寫入。

**理由：** 使用者需要理解並同意每個進入 Agent 層的原則；可在寫入前與現有體系討論融合/取捨；避免垃圾自動進入 Agent 層降低品質。

### D6：知識庫卡片格式 — Markdown + YAML frontmatter

```markdown
---
id: kc-20260327-001
type: KnowledgeCard
topic: AI導入企業
source: sources/article-20260327.md
source_type: ai_inferred        # ai_inferred | ai_confirmed | user_defined
created_at: 2026-03-27
tags: [AI, 企業, 變革管理]
---

# RAG 的 recall 與 precision 存在 trade-off

...（卡片內容）...

## 我的筆記

<!-- 使用者手寫區，AI 不填充 -->
```

`source_type` 三級（ai_inferred / ai_confirmed / user_defined）決定重新分類時的處理策略。

## Risks / Trade-offs

- **Markdown 同步衝突** → 若使用者同時用 Obsidian 和 LC UI 編輯同一檔案，可能衝突。緩解：LC UI 存檔前讀取最新版本；Phase 2 加 file watcher。

- **MCP Port 安全性** → 本機 localhost 只接受本機連線，風險低。但若使用者開了 port forwarding 則有暴露風險。緩解：文件說明；Phase 2 加 token 驗證。

- **情境三 Token 成本** → 全量注入 Agent 層可能消耗大量 token。緩解：Agent 層 Markdown 設計時保持精簡（axioms 通常 <2000 tokens）；支援使用者選擇注入哪些部分。

- **Skill Loader 時效性** → Agent 層更新後，若不重跑 Skill Loader，本地 context 檔案會過時。緩解：情境三完成蒸餾後自動觸發；在生成的 context 檔案標註生成時間戳。

- **知識庫規模成長** → KnowledgeCard 多了之後全文搜索效能下降。緩解：Phase 1 接受此限制；Phase 2 加 SQLite FTS5 索引。

## Open Questions

| ID | 問題 | 影響範圍 |
|----|------|----------|
| Q1 | Skill Loader 啟動時是否自動觸發？還是純手動？ | skill-loader spec |
| Q2 | 情境三 Chat 的對話歷史是否需要持久化？儲存在哪？ | distillation-chat spec |
| Q3 | MCP Server 是否需要支援 Streamable HTTP（2025 MCP 新標準）還是 SSE？ | mcp-server spec |
| Q4 | 知識庫目錄選擇後，是否允許中途更換？migration 策略？ | knowledge-base spec |
| Q5 | Agent 層的 Methodology Markdown 格式需要標準化範例，讓主流 LLM 都能解析 | agent-layer spec |
