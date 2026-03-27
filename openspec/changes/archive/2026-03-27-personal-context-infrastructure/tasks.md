## 1. 基礎設施與設定

- [x] 1.1 在 settings 表新增 KB 目錄路徑設定（`kb_directory`）
- [x] 1.2 在 settings 表新增 Agent Layer 設定（`agent_layer_path` 使用預設 userData）
- [x] 1.3 在 settings 表新增 MCP Server port 設定（`mcp_port`，預設 7777）
- [x] 1.4 在 settings 表新增 Model API 設定（`model_api_key`、`model_api_base_url`、`model_name`）
- [x] 1.5 在 settings 表新增 Skill Loader 目標設定（`skill_loader_targets`，JSON array）
- [x] 1.6 在 Life Console 啟動時初始化 Agent Layer 目錄結構（axioms/、methodologies/、skills/、README）

## 2. 知識庫層（Knowledge Base）

- [x] 2.1 實作 `src/main/knowledge/reader.ts`：讀取 KB 目錄，解析 Markdown + frontmatter
- [x] 2.2 實作 `src/main/knowledge/writer.ts`：寫入 KnowledgeCard 和 SourceArticle Markdown 檔
- [x] 2.3 實作 `src/main/knowledge/search.ts`：全文搜索（跨所有 KnowledgeCard 檔案）
- [x] 2.4 實作 IPC channels：`knowledge:list`、`knowledge:get`、`knowledge:search`、`knowledge:update`
- [x] 2.5 實作 KB 目錄匯出功能（zip 打包，IPC: `knowledge:export`）

## 3. Agent 層（Agent Layer）

- [x] 3.1 實作 `src/main/agent/reader.ts`：讀取 Agent Layer 目錄，解析 axioms/methodologies/skills
- [x] 3.2 實作 `src/main/agent/writer.ts`：寫入/更新 axiom 和 methodology 檔案，含 version history 追加
- [x] 3.3 實作 IPC channels：`agent:list-axioms`、`agent:get-methodology`、`agent:write-back`

## 4. MCP Server

- [x] 4.1 安裝 `@modelcontextprotocol/sdk` 依賴
- [x] 4.2 實作 `src/main/mcp/server.ts`：HTTP MCP Server，localhost only
- [x] 4.3 實作 MCP tool：`listAxioms(category?)`
- [x] 4.4 實作 MCP tool：`getMethodology(topic)`
- [x] 4.5 實作 MCP tool：`searchKnowledge(query, limit?)`
- [x] 4.6 實作 MCP tool：`getCard(id)`
- [x] 4.7 在 Life Console 啟動時啟動 MCP Server，關閉時停止
- [x] 4.8 Port 衝突偵測與錯誤通知

## 5. Skill Loader Skill

- [x] 5.1 建立 `skills/skill-loader/manifest.json`
- [x] 5.2 實作 `skills/skill-loader/core.ts`：讀 Agent Layer → 格式化 context → 寫入各目標路徑
- [x] 5.3 支援 Claude Code 目標（`~/.claude/CLAUDE.md` append 模式）
- [x] 5.4 支援 Cursor 目標（`.cursor/rules/life-console.md`）
- [x] 5.5 生成的 context 檔包含時間戳、MCP URL、axioms、methodologies 摘要、工具使用說明
- [x] 5.6 實作 auto-trigger hook：Agent Layer 寫入後自動呼叫 Skill Loader

## 6. 知識庫拆解器 Skill（Knowledge Ingestion）

- [x] 6.1 建立 `skills/knowledge-ingestion/manifest.json`（input: text or url）
- [x] 6.2 實作 `skills/knowledge-ingestion/core.ts`：呼叫 Model API 拆解文章成 KnowledgeCard 草稿
- [x] 6.3 實作 `skills/knowledge-ingestion/ui.tsx`：顯示草稿卡片，支援確認/拒絕/編輯
- [x] 6.4 確認後寫入 KnowledgeCard 和 SourceArticle Markdown 檔
- [x] 6.5 寫入完成後記錄到 records 表

## 7. 知識庫管理 UI（情境四）

- [x] 7.1 建立 `src/renderer/src/pages/KnowledgePage.tsx`
- [x] 7.2 實作卡片列表：依 topic 分組，顯示 source_type 標示
- [x] 7.3 實作全文搜索 input（即時過濾）
- [x] 7.4 實作卡片確認功能（ai_inferred → ai_confirmed）
- [x] 7.5 實作卡片 inline 編輯（Markdown 內容 + topic + tags）
- [x] 7.6 實作 SourceArticle 連結與唯讀預覽
- [x] 7.7 在 App.tsx 和 sidebar 加入 Knowledge 頁面路由

## 8. 蒸餾 Chat UI（情境三）

- [x] 8.1 建立 `src/renderer/src/pages/DistillationPage.tsx`
- [x] 8.2 實作 Chat 介面（訊息列表 + 輸入框）
- [x] 8.3 實作 system prompt 建構：注入 Agent Layer 全量內容
- [x] 8.4 實作 LLM 呼叫（使用設定的 API key + model）
- [x] 8.5 實作 KB 搜索工具呼叫（LLM tool call → `knowledge:search` IPC）
- [x] 8.6 實作寫回流程：LLM 提案 → 使用者確認對話框 → `agent:write-back` IPC
- [x] 8.7 寫回後自動觸發 Skill Loader
- [x] 8.8 在 App.tsx 和 sidebar 加入 Distillation 頁面路由

## 9. Settings UI 更新

- [x] 9.1 在 Settings 頁面新增 Knowledge Base 目錄選擇器（使用 Electron file dialog）
- [x] 9.2 在 Settings 頁面新增 Model API 設定區塊（key、base URL、model name）
- [x] 9.3 在 Settings 頁面新增 MCP Server 狀態顯示（port、連線狀態）
- [x] 9.4 在 Settings 頁面新增 MCP 設定複製功能（Claude Code / Cursor JSON snippet）
- [x] 9.5 在 Settings 頁面新增 Skill Loader 目標管理（新增/刪除目標路徑）
