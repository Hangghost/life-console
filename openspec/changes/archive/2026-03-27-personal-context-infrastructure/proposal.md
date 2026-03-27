## Why

Life Console 目前是 skill 執行平台，缺乏知識累積和個人化 context 的能力。使用者無法將閱讀的知識系統化沉澱，也無法讓外部 AI 工具（Claude Code、Cursor 等）理解自己的思考方式和決策原則——每次開新 session，AI 都是從零開始。

## What Changes

- **新增知識庫層**：以 Zettelkasten 方式，用 Markdown 檔案儲存 KnowledgeCard、SourceArticle、Argument、OpenQuestion，支援 Obsidian 相容格式，存於使用者自訂目錄
- **新增 Agent 層**：以 Markdown 檔案儲存使用者的 axioms、methodologies、skills（工作 SOP），存於 Life Console userData，由 LC 統一管理
- **新增 MCP Server**：常駐背景服務，讓任何 AI 工具可查詢 Agent 層和知識庫
- **新增 Skill Loader Skill**：讀取 Agent 層，生成各 IDE 對應的本地 context 檔案（CLAUDE.md、.cursor/rules/ 等），讓 Agent 層被動載入到任何工具
- **新增知識庫拆解器 Skill**：輸入文章，AI 自動拆解成 KnowledgeCard Markdown
- **新增 Chat 蒸餾介面（情境三）**：Life Console UI 內建 Chat，全量注入 Agent 層 context，讓使用者主動觸發蒸餾，把洞察寫回 Agent 層
- **新增知識庫管理介面（情境四）**：UI 介面瀏覽、確認 AI 分類、編輯 KnowledgeCard

## Capabilities

### New Capabilities

- `knowledge-base`: Zettelkasten 風格的知識庫，以 Markdown 檔案儲存 KnowledgeCard、SourceArticle、Argument、OpenQuestion，支援 Obsidian vault 相容格式
- `agent-layer`: 使用者個人的 axioms、methodologies、skills，以 Markdown 儲存於 LC userData，是 MCP 對外暴露的核心內容
- `mcp-server`: 常駐背景 MCP Server，提供 getMethodology、listAxioms、searchKnowledge、getCard 等工具，讓外部 AI 工具按需查詢
- `skill-loader`: Skill，讀取 Agent 層並生成各 IDE/agent 對應的本地 context 檔案，實現被動載入
- `knowledge-ingestion`: Skill，輸入文章文字或 URL，AI 拆解成原子 KnowledgeCard，使用者確認分類後寫入知識庫
- `distillation-chat`: Life Console UI Chat 介面，外接 Model API，全量注入 Agent 層，支援使用者主動觸發蒸餾並寫回 Agent 層
- `knowledge-ui`: Life Console UI 知識庫管理頁面，支援瀏覽、搜索、確認 AI 分類、編輯 KnowledgeCard

### Modified Capabilities

- `context-store`: 現有 records 表維持不變，但未來可作為 Agent 層觀察的原料來源（目前不自動蒸餾）

## Impact

- **新增目錄**：`src/main/mcp/`（MCP server）、`src/main/knowledge/`（知識庫讀寫）、`src/main/agent/`（Agent 層讀寫）
- **新增 Skills**：`skills/knowledge-ingestion/`、`skills/skill-loader/`
- **新增 UI 頁面**：`src/renderer/src/pages/KnowledgePage.tsx`、`src/renderer/src/pages/DistillationPage.tsx`
- **新增 IPC channels**：`knowledge:*`、`agent:*`、`mcp:*`
- **依賴**：MCP SDK（`@modelcontextprotocol/sdk`）、向量搜索庫（TBD）
- **外部影響**：Life Console 啟動後需監聽 MCP port（預設 localhost:7777）
