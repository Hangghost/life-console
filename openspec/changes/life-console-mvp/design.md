## Context

Life Console 是一個全新的 Electron 桌面應用，定位為「任務指揮中心 + 工具載入器」。目前專案只有規格文件（v0.3），尚無任何程式碼。核心需求是：Inbox 收集 → AI 分類 → Today View 排程 → Toolbox 執行工具 → 輸出自動回寫為 Object，形成閉環。

技術約束：
- Local-first：所有資料存在本地 SQLite，不依賴後端
- BYOK：Claude API key 由使用者自行提供
- 外掛作者目前只有開發者自己

## Goals / Non-Goals

**Goals:**
- 建立可運行的 Electron 應用骨架，含 Sidebar 導航和三個核心頁面
- 實作 Object Model CRUD + 全文搜尋
- 實作 Inbox → AI 推斷 → 確認的完整流程
- 實作 Today View 規則排序
- 實作 Workflow Plugin SDK 並完成 LearningHacker 端到端驗證
- 架構保護：Object Model schema 和 Plugin manifest 格式要穩定

**Non-Goals:**
- Personal Skills、知識圖譜、GraphRAG、語意搜尋
- MCP 外部服務整合
- 跨設備同步、行動端
- 外掛商城、執行期權限強制檢查
- AI 排程 reranker、本地輕量模型

## Decisions

### D1: Electron 程序架構——Main/Renderer 分離 + Preload Bridge

所有資料存取（SQLite）、外部 API 呼叫（Claude）、外掛執行都在 main process。Renderer 透過 `contextBridge` 暴露的 typed API 存取，不直接持有 DB 連線或 API key。

**替代方案：** Renderer 直接存取 SQLite（透過 node integration）。拒絕原因：安全性差、違反 Electron 最佳實踐。

### D2: IPC 通訊模式——invoke/handle + event push

- Request/Response：`ipcRenderer.invoke()` → `ipcMain.handle()`，涵蓋所有 CRUD 和查詢
- Server Push：`webContents.send()` 用於非同步事件（Inbox 推斷完成、外掛狀態更新）

9 個 channel：`objects:create`、`objects:update`、`objects:query`、`objects:delete`、`inbox:infer`、`plugins:list`、`plugins:run`、`plugins:status`、`search:query`

**替代方案：** 用 WebSocket 或 HTTP server。拒絕原因：過度工程，Electron IPC 已是內建且高效的方案。

### D3: 資料庫——SQLite + better-sqlite3（同步 API）

使用 `better-sqlite3` 而非 `sql.js` 或 Electron 內建 storage。better-sqlite3 是原生 C++ binding，效能好，同步 API 簡化 main process 程式碼。

**替代方案：** `sql.js`（WASM 版）。拒絕原因：效能較差，且我們已在 main process 不需要 WASM 的跨環境能力。

### D4: 外掛執行——同 process 直接注入 WorkflowContext

Main process 直接 `require()` 外掛的 workflow entry，傳入實作好的 WorkflowContext 物件。外掛函式回傳結果後，系統根據 manifest 的 `output_mapping` 自動建立 Object。

**替代方案：** `fork()` 子程序 + IPC message passing。拒絕原因：MVP 外掛作者只有自己，隔離的實作成本不值得。Phase 2 可遷移至 fork 模式，WorkflowContext interface 不變。

### D5: 前端狀態管理——React Context + useReducer

MVP 不引入 Redux / Zustand 等外部狀態管理。三個頁面（Inbox、Today、Toolbox）各自管理狀態，共享資料透過 IPC 重新查詢。

**替代方案：** 引入 Zustand。拒絕原因：MVP 狀態簡單，跨頁面共享需求少，直接 IPC 查詢更直觀。

### D6: 專案目錄結構

```
src/
├── main/                  # Electron main process
│   ├── index.ts           # App 啟動、window 管理
│   ├── ipc/               # IPC handler 註冊
│   │   ├── objects.ts     # objects:* channel handlers
│   │   ├── inbox.ts       # inbox:* channel handlers
│   │   ├── plugins.ts     # plugins:* channel handlers
│   │   └── search.ts      # search:* channel handler
│   ├── db/                # SQLite 操作
│   │   ├── schema.ts      # 建表語句、migration
│   │   └── queries.ts     # CRUD 函數
│   ├── ai/                # Claude API 呼叫
│   │   └── inference.ts   # Inbox 推斷邏輯
│   └── plugins/           # 外掛 runtime
│       ├── loader.ts      # manifest 解析、載入
│       └── runner.ts      # WorkflowContext 注入、執行
├── renderer/              # React 前端
│   ├── App.tsx            # Sidebar 導航 + Router
│   ├── pages/
│   │   ├── InboxPage.tsx
│   │   ├── TodayPage.tsx
│   │   └── ToolboxPage.tsx
│   ├── components/        # 共用元件
│   └── hooks/             # 自定義 hooks（useIPC 等）
├── shared/                # Main/Renderer 共用型別
│   └── types.ts           # Object, Task, Note 等 TypeScript 型別
├── preload/
│   └── index.ts           # contextBridge 暴露 API
plugins/                   # 內建外掛（dev 用）
│   └── learning-hacker/
│       ├── manifest.json
│       └── workflow.ts
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| better-sqlite3 需要 native rebuild for Electron | 使用 `electron-rebuild` 或 `@electron/rebuild`，CI 中加入 rebuild 步驟 |
| 同 process 外掛可能 block main process | MVP 可接受；長時間操作用 `async/await` 保持非阻塞；Phase 2 遷移至 fork |
| Claude API 推斷延遲影響 UX | 已設計為非同步：先顯示 inbox_item，推斷完成後浮現確認提示 |
| Object Model schema 變更困難 | MVP 前充分驗證 schema（已在 spec v0.3 定案），properties 用 JSON 保持彈性 |
| TypeScript workflow plugin 需要編譯 | MVP 先用 `ts-node` 或 `tsx` 直接執行，不做預編譯 |
