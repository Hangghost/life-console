## Why

使用者的核心痛點不是「缺一個存東西的地方」，而是「事情多又雜，切換工具消耗認知，排程需要先收集整理資訊」。市面上知識庫/第二大腦競品極多（Notion、Obsidian、Heptabase），正面競爭不利。Life Console MVP 定位為**任務指揮中心 + 工具載入器**，先做工具平台讓知識庫自然長出來。

## What Changes

這是全新專案，從零建立以下能力：

- **Inbox（收件匣）**：統一的待處理事項入口，支援手動輸入，Claude API 非同步推斷 type（task/note），使用者確認後原地升級
- **Today View（今日面板）**：規則加權排序（urgency + priority + staleness）顯示今日建議任務，含每日預估總耗時
- **Toolbox（工具區）**：載入外掛 manifest、權限確認、Workflow Plugin 自動生成輸入表單並執行、輸出回寫為 Object
- **Object Model**：統一資料模型（SQLite），所有東西都是 Object，差別在 type（inbox_item / task / note / workflow_run），properties 用 JSON 存
- **Workflow Plugin SDK**：三類原子 API（llm / tools / store），外掛在同 process 中執行
- **全域搜尋**：全文搜尋所有 Object
- **Electron 桌面應用**：Sidebar 導航佈局，React + TypeScript 前端，IPC 通訊架構

## Capabilities

### New Capabilities

- `object-model`: SQLite 資料庫核心——objects 表、relations 表、CRUD 操作、全文搜尋
- `inbox`: Inbox 輸入、Claude API 非同步推斷 type、確認 UI、原地升級流程
- `today-view`: Task 加權排序演算法（urgency + priority + staleness）、每日預估耗時顯示
- `toolbox`: 外掛 manifest 載入、權限確認 Dialog、Workflow Plugin 執行、輸出回寫 Object
- `plugin-sdk`: WorkflowContext 介面（llm.ask / tools.fetchUrl / tools.readFile / tools.writeFile / store.create / store.query）
- `electron-shell`: Electron main/renderer 架構、IPC channel 定義、Sidebar 導航 UI 骨架

### Modified Capabilities

（無，全新專案）

## Impact

- **新增依賴**：Electron（最新穩定版）、React、TypeScript、better-sqlite3（或同類）、Anthropic Claude SDK
- **外部服務**：Claude API（BYOK 模式，使用者自備 API key）
- **檔案系統**：`~/.life-console/plugins/` 為外掛目錄，`~/.life-console/data.db` 為 SQLite 資料庫
- **現有工具整合**：LearningHacker 改造為第一個 Workflow Plugin；PhotoSift 快捷啟動（不嵌入）
