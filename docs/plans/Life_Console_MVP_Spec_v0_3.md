# Life Console — MVP 規格文件

> **版本：** v0.3
> **建立日期：** 2026-03-25
> **最後更新：** 2026-03-25
> **狀態：** 決議稿
> **基於：** 產品設計架構文件 v1.1 + MVP 討論紀錄 + M1-M5 決議 + M6-M8 決議

---

## 變更紀錄 (Changelog)

| 版本 | 日期 | 變更摘要 |
|------|------|----------|
| v0.1 | 2026-03-25 | 初始討論稿：MVP 重新定位、Object Model、外掛機制、架構保護策略 |
| v0.2 | 2026-03-25 | **M1-M5 全數定案：** (1) Today View 採規則排序 + 預留 AI 介入點（§3.1） (2) Workflow SDK 定義三類原子 API（§3.4） (3) 外掛權限採宣告制，不做執行期強制檢查（§3.3） (4) Inbox 推斷採 Claude API + 非同步推斷（§3.1） (5) Electron 採最新穩定版，不對齊 PhotoSift（§5） (6) 技術棧從「暫定」改為「確定」（§5） (7) 新增 §3.1 Inbox 推斷流程與 Today View 排程邏輯詳述 |
| v0.3 | 2026-03-25 | **M6-M8 實作架構決議：** (1) UI 採 Sidebar 導航佈局（§3.5） (2) Electron IPC 通訊設計，~9 個 channel（§3.6） (3) Workflow Plugin 採同 process 直接注入，Phase 2 再加隔離（§3.7） |

---

## 1. MVP 重新定位

### 1.1 從架構文件到 MVP 的思路轉變

架構文件 v1.1 定義了一個完整的「Context-Driven Agentic Workspace」，涵蓋知識圖譜、Personal Skills、氛圍編程、MCP 整合等大量模組。經過討論後，MVP 從以下角度重新定位：

**原始定位：** AI 原生第二大腦（偏資料儲存與知識管理）

**MVP 定位：** 任務指揮中心 + 工具載入器（偏日常工作自動化）

**轉變理由：**

- 知識庫/第二大腦市場競品極多（Notion、Obsidian、Heptabase、Mem.ai），正面競爭不利
- 使用者的核心痛點不是「缺一個存東西的地方」，而是「事情多又雜，切換工具消耗認知，排程需要先收集整理資訊」
- 工具平台有明確的完成感（翻譯完一篇、篩選完照片），知識庫很難感受到投入回報
- 知識沉澱可以作為工具使用的自然副產品，不需要獨立建構

### 1.2 MVP 核心策略

**先做工具平台（Tool Platform），讓知識庫（Knowledge Base）自然長出來。**

具體原則：
- 工具的輸出自動存成可搜尋、可關聯的 Object，知識庫被使用過程自然填滿
- 使用者不需要「刻意整理」，系統自動結構化
- 架構預留擴展空間，但 MVP 不實作知識圖譜、Personal Skills、氛圍編程等進階模組

### 1.3 MVP 的三個核心模組

| 模組 | 功能 | 解決的痛點 |
|------|------|-----------|
| **Inbox（收件匣）** | 所有待處理事項的統一入口，AI 自動推斷類型 | 東西散落各處（Notion、Heptabase、資料夾） |
| **Today View（今日面板）** | 基於 deadline、優先級、預估耗時，規則排序出今日建議 | 花太多時間規劃，規劃好又被新事打斷 |
| **Toolbox（工具區）** | 載入自製小工具，工具輸出自動回寫為 Object | 切換不同工具消耗認知資源 |

---

## 2. Object Model Schema

### 2.1 設計原則

1. **所有東西都是 Object，差別只在 type。** 未來加新 type 不需要改資料庫結構。
2. **Properties 用 JSON 欄位存，不為每個 type 建獨立表。** MVP 追求靈活。
3. **每個 Object 保留 source 和 AI metadata。** 為未來 Personal Skills 和可解釋性 UI 預留基礎。
4. **Relations 用最簡單的方式做。** 單張表、三個欄位、不做圖譜遍歷。
5. **Schema 要想清楚，程式碼可以隨便改。** 資料格式一旦有真實資料，遷移成本高。

### 2.2 資料庫表結構

#### objects 表

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | TEXT PRIMARY KEY | UUID |
| `type` | TEXT NOT NULL | `'inbox_item'` / `'task'` / `'note'` / `'workflow_run'` |
| `title` | TEXT | 簡短標題 |
| `content` | TEXT | 主體內容（Markdown） |
| `properties` | TEXT (JSON) | 依 type 不同的結構化屬性 |
| `source` | TEXT | `'manual'` / `'mcp_import'` / `'tool_output'` / `'ai_generated'` |
| `ai_metadata` | TEXT (JSON) | AI 推斷相關的 metadata |
| `created_at` | TEXT (ISO 8601) | 建立時間 |
| `updated_at` | TEXT (ISO 8601) | 更新時間 |
| `archived` | INTEGER DEFAULT 0 | 軟刪除 / 歸檔 |

#### relations 表

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | TEXT PRIMARY KEY | UUID |
| `from_id` | TEXT REFERENCES objects(id) | 來源 Object |
| `to_id` | TEXT REFERENCES objects(id) | 目標 Object |
| `type` | TEXT NOT NULL | `'produces'` / `'relates_to'` / `'subtask_of'` / `'derived_from'` |
| `created_at` | TEXT (ISO 8601) | 建立時間 |

#### embeddings 表（MVP 先不做，預留）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `object_id` | TEXT REFERENCES objects(id) | 關聯 Object |
| `vector` | BLOB | 語意向量 |

### 2.3 各 Type 的 Properties 定義

#### inbox_item — 未分類的原始輸入

```json
{
  "suggested_type": "task",
  "suggested_confidence": 0.82,
  "raw_input": "..."
}
```

最輕量，什麼都不強制。AI 推斷 `suggested_type` 後，使用者確認即直接修改 Object 的 `type` 欄位（見 §2.5 決策紀錄）。

#### task — 排程核心

```json
{
  "status": "todo",
  "priority": "medium",
  "due_date": "2026-04-01",
  "estimated_minutes": 30,
  "category": "線上課程",
  "recurrence": null
}
```

`status` 可選值：`todo` / `in_progress` / `done` / `blocked`
`priority` 可選值：`low` / `medium` / `high` / `urgent`

#### note — 資訊沉澱

```json
{
  "tags": ["架構", "MCP"],
  "source_url": "https://...",
  "source_tool": "learning_hacker"
}
```

#### workflow_run — 工具執行紀錄

```json
{
  "tool_name": "learning_hacker",
  "tool_version": "1.0.0",
  "input_params": { "url": "https://youtube.com/..." },
  "status": "completed",
  "duration_ms": 45000,
  "output_object_ids": ["uuid-1", "uuid-2"]
}
```

`status` 可選值：`running` / `completed` / `failed`

### 2.4 ai_metadata 欄位（所有 type 共用）

```json
{
  "inferred_type": "task",
  "inference_confidence": 0.85,
  "last_inference_model": "claude",
  "user_corrections": [
    {
      "field": "type",
      "from": "note",
      "to": "task",
      "timestamp": "2026-03-25T10:00:00Z"
    }
  ]
}
```

`last_inference_model` 可選值：`claude` / `manual`（v0.2 移除 `local`，MVP 不做本地模型）

`user_corrections` 是 Personal Skills 的種子資料。MVP 不做 Skills 系統，但先記錄修正行為，Phase 2 做隱式學習時資料已在。

### 2.5 關鍵設計決策紀錄

#### 決策 1：Inbox item 確認後的處理方式

**選擇：直接修改 Object 的 type 欄位（原地升級）**

| 考慮過的方案 | 優點 | 缺點 | 結論 |
|-------------|------|------|------|
| 直接改 type（選擇此方案） | 簡單、資料庫乾淨、無重複資料 | 丟失「曾是 inbox_item」的歷史 | `ai_metadata.user_corrections` 已記錄歷史，不需要用兩筆資料做一筆能完成的事 |
| 保留原 inbox_item + 另建新 Object | 完整歷史軌跡 | 資料量翻倍、查詢變複雜、邊界問題多 | MVP 不需要這個複雜度 |

#### 決策 2：Workflow 輸出的呈現方式

**選擇：自動建立 Note Object + 用 relation 追溯到 workflow_run**

| 考慮過的方案 | 優點 | 缺點 | 結論 |
|-------------|------|------|------|
| 只存在 workflow_run 裡 | 最簡單 | 輸出不可搜尋、不進知識體系、違背「統一資訊」初衷 | 工具輸出被鎖死在工具區 |
| 自動建 Note + relation（選擇此方案） | 工具輸出自然流入知識庫、可搜尋可關聯、可追溯來源 | 實作多一步 | 這是「工具平台自然長成知識庫」的核心機制 |

**補充：** 並非所有工具都需要自動建 Object。由工具的 manifest 中 `output.auto_create_object` 欄位控制。例如 PhotoSift 篩選完照片不需要建 Object，LearningHacker 的翻譯筆記需要。

---

## 3. 核心模組設計（v0.2 新增）

### 3.1 Inbox 推斷流程

**決議（M4）：採用 Claude API（BYOK）+ 非同步推斷。**

```
使用者輸入文字 / 貼上內容
         │
         ▼
立即儲存為 inbox_item Object（使用者無需等待）
  ├── type = 'inbox_item'
  ├── source = 'manual'
  └── ai_metadata = { inferred_type: null, inference_confidence: null }
         │
         ▼
背景發送 Claude API 呼叫（非同步）
  ├── Prompt：分類為 task 或 note，提取結構化屬性
  ├── 期望輸出：JSON { type, confidence, properties }
  └── 超時 / 失敗 → 保留為 inbox_item，不強制分類
         │
         ▼
推斷結果回來（約 1-2 秒）
         │
         ▼
UI 浮現確認提示
  ┌─────────────────────────────────────────────────┐
  │ 💡 這看起來像一個 Task：                          │
  │    「明天跟 John 討論 API 設計」                   │
  │    優先級：medium ｜ 截止：明天                     │
  │                                                  │
  │ [確認] [改為 Note] [保持未分類]                    │
  └─────────────────────────────────────────────────┘
         │
         ├── 確認 → 原地升級：type 改為 task，填入 properties
         ├── 改為 Note → 原地升級：type 改為 note
         └── 保持未分類 → 不動，留在 Inbox
         │
         ▼
所有操作記錄至 ai_metadata.user_corrections
```

**Prompt 設計要點：**
- 輸入：使用者的原始文字
- 輸出格式：嚴格 JSON，包含 `type`、`confidence`、`title`、`properties`
- 只需要分辨 `task` vs `note`，不做更細的分類
- 屬性提取包含：priority、due_date、estimated_minutes（task）；tags（note）
- 無法判斷時，回傳 `type: null` 讓使用者自己決定

### 3.2 Today View 排程邏輯

**決議（M1）：規則排序，預留 AI 介入點。**

#### 排序演算法

Today View 顯示所有 `status` 為 `todo` 或 `in_progress` 的 Task，按以下加權分數排序：

```
score = urgency_score + priority_score + staleness_score

urgency_score:
  過期          → 100
  今天截止      → 80
  明天截止      → 60
  3 天內截止    → 40
  7 天內截止    → 20
  無截止日期    → 10

priority_score:
  urgent → 40
  high   → 30
  medium → 20
  low    → 10

staleness_score:
  建立超過 7 天且仍為 todo → +15
  建立超過 3 天且仍為 todo → +5
  其他                     → 0
```

#### 每日容量估算

如果 Task 有 `estimated_minutes`，Today View 可顯示「今日預估總耗時」。MVP 不做自動截斷（「今天做不完」的提示），但 UI 上顯示累計時間供使用者自行判斷。

#### AI 介入點（Phase 2 預留）

```typescript
// MVP 實作
function getTodayTasks(tasks: Task[]): Task[] {
  return tasks
    .filter(t => t.status === 'todo' || t.status === 'in_progress')
    .sort((a, b) => scoreTask(b) - scoreTask(a))
}

// Phase 2 擴展：在規則排序後加入 AI reranker
// function getTodayTasks(tasks: Task[]): Task[] {
//   const ruleSorted = ruleBasedSort(tasks)
//   return aiRerank(ruleSorted, userContext)
// }
```

### 3.3 外掛權限系統

**決議（M3）：manifest 宣告 + 安裝提示，不做執行期強制檢查。**

#### MVP 權限清單

| 權限 | 說明 | 適用場景 |
|------|------|---------|
| `fs:read` | 讀取本地檔案 | PhotoSift 讀取照片資料夾 |
| `fs:write` | 寫入本地檔案 | 匯出處理結果 |
| `network:external` | 存取外部網路 | LearningHacker 抓取字幕 |
| `llm:claude` | 呼叫 Claude API | LearningHacker 翻譯整理 |
| `store:read` | 查詢 Object 資料庫 | 讀取現有筆記/任務 |
| `store:write` | 建立/修改 Object | 工具輸出回寫為 Object |

#### 安裝流程

```
載入外掛 manifest.json
         │
         ▼
解析 permissions 欄位
         │
         ▼
顯示權限確認 Dialog
  ┌─────────────────────────────────┐
  │ 安裝外掛「影片學習筆記」？        │
  │                                  │
  │ 此外掛需要以下權限：              │
  │  🌐 存取外部網路                  │
  │  🤖 呼叫 AI 模型                 │
  │                                  │
  │ [安裝] [取消]                     │
  └─────────────────────────────────┘
         │
         ▼
使用者確認 → 外掛啟用（不做執行期攔截）
```

**Phase 2+ 擴展方向：** 加入執行期權限檢查，外掛呼叫未宣告的權限時拋出 `PermissionDeniedError`。

### 3.4 Workflow Plugin SDK

**決議（M2）：三類原子 API——llm / tools / store。**

#### WorkflowContext 介面定義

```typescript
interface WorkflowContext {
  /** AI 呼叫 */
  llm: {
    ask(prompt: string, options?: {
      model?: string        // 預設 'claude-sonnet'
      maxTokens?: number    // 預設 1000
    }): Promise<{ text: string }>
  }

  /** 通用工具 */
  tools: {
    fetchUrl(url: string, options?: {
      method?: 'GET' | 'POST'
      headers?: Record<string, string>
      body?: string
    }): Promise<{ status: number; text: string }>

    readFile(path: string): Promise<string>

    writeFile(path: string, content: string): Promise<void>
  }

  /** Object 資料庫操作 */
  store: {
    create(type: string, data: {
      title?: string
      content?: string
      properties?: Record<string, any>
      source?: string
    }): Promise<{ id: string }>

    query(filter: {
      type?: string
      status?: string
      tags?: string[]
      limit?: number
    }): Promise<Array<{
      id: string
      type: string
      title: string
      properties: Record<string, any>
    }>>
  }
}
```

#### Workflow Plugin 完整範例（LearningHacker）

```typescript
import type { WorkflowContext, WorkflowResult } from '@life-console/sdk'

export async function run(
  input: { url: string; target_language: string },
  context: WorkflowContext
): Promise<WorkflowResult> {

  // 1. 抓取影片頁面，取得字幕資訊
  const page = await context.tools.fetchUrl(input.url)

  // 2. 用 LLM 翻譯整理
  const result = await context.llm.ask(
    `從以下影片頁面內容中提取字幕並翻譯為 ${input.target_language} 的學習筆記。
     整理為重點摘要格式。\n\n${page.text}`
  )

  // 3. 回傳結果（系統根據 manifest 的 output_mapping 建 Object）
  return {
    video_title: '影片標題', // 實際從頁面解析
    translated_summary: result.text,
    topic: '待分類',
    url: input.url
  }
}
```

**設計原則：** 平台提供原子能力（網路、檔案、AI、資料庫），外掛自己組合成業務邏輯。`fetchSubtitles()` 這類特化功能由外掛自行實現，不內建於 SDK。

### 3.5 UI 佈局（v0.3 新增）

**決議（M6）：Sidebar 導航佈局。**

```
┌──────┬──────────────────────────────┐
│      │                              │
│ Nav  │       Main Content           │
│      │                              │
│☐ Inbox│  （根據選中的導航項切換）      │
│☐ Today│                              │
│☐ Tools│                              │
│      │                              │
│      ├──────────────────────────────┤
│  🔍  │                              │
└──────┴──────────────────────────────┘
```

- 左側為固定 Sidebar，包含 Inbox、Today View、Toolbox 三個導航項，以及全域搜尋入口
- 右側為主內容區，根據當前選中的導航項顯示對應模組
- Sidebar 寬度固定，不做收合（MVP 簡化）
- 類似 Notion / Linear 的導航模式，使用者已有心智模型

### 3.6 Electron IPC 通訊設計（v0.3 新增）

**決議（M7）：renderer 發 request、main 回 response 為主，少量 main→renderer push。**

SQLite、Claude API、Plugin Runtime 全部在 main process 中執行，renderer 透過 IPC 存取。API key 不暴露給 renderer。

| Channel | 方向 | 用途 |
|---------|------|------|
| `objects:create` | renderer → main | 建立 Object（Inbox 輸入） |
| `objects:update` | renderer → main | 更新 Object（確認推斷、改 status） |
| `objects:query` | renderer → main → renderer | 查詢（Today View、搜尋、列表） |
| `objects:delete` | renderer → main | 軟刪除 / 歸檔 |
| `inbox:infer` | main → renderer | 推斷完成，推送結果給 UI 顯示確認提示 |
| `plugins:list` | renderer → main | 取得已安裝外掛清單 |
| `plugins:run` | renderer → main | 執行 workflow plugin |
| `plugins:status` | main → renderer | 外掛執行狀態更新（running / completed / failed） |
| `search:query` | renderer → main → renderer | 全文搜尋 |

**實作方式：** 使用 Electron 的 `contextBridge` + `ipcRenderer.invoke()` / `ipcMain.handle()` 模式，main→renderer push 使用 `webContents.send()`。

### 3.7 Workflow Plugin 執行方式（v0.3 新增）

**決議（M8）：MVP 採同 process 直接注入 WorkflowContext，不做子程序隔離。**

```typescript
// Main process 載入並執行 workflow plugin
import { run } from '~/.life-console/plugins/learning-hacker/workflow.ts'

const context: WorkflowContext = {
  llm:   { ask: (prompt, opts) => callClaudeAPI(prompt, opts) },
  tools: { fetchUrl: ..., readFile: ..., writeFile: ... },
  store: { create: ..., query: ... }
}

const result = await run(input, context)
// 根據 manifest.output_mapping 建立 Object
```

| 考慮過的方案 | 優點 | 缺點 | 結論 |
|-------------|------|------|------|
| fork() 子程序 + IPC message passing | 完全隔離，外掛崩潰不影響主程式 | 實作複雜（所有 context 呼叫需序列化為 IPC）、除錯困難 | Phase 2 開放外掛給第三方時再考慮 |
| 同 process 直接注入（選擇此方案） | 最簡單、除錯方便、同一個 stack trace | 外掛可以搞壞 main process | MVP 外掛作者只有自己，風險可控；§6.2 已確認此項可隨時更換 |

**Phase 2+ 擴展方向：** 改為 `fork()` + IPC proxy 模式，WorkflowContext 的每個方法變成跨 process 的 RPC call，外掛程式碼不需要修改（interface 不變）。

---

## 4. 外掛載入機制

### 4.1 兩種外掛類型

現有工具形態差異大（PhotoSift 是完整 Electron App，LearningHacker 是 Claude Skill），不適合強制統一為一種格式。

| 類型 | 說明 | 適用場景 | 範例 |
|------|------|---------|------|
| **Panel Plugin（UI 外掛）** | 有介面，渲染在工具區的面板中 | 需要互動式 UI 的工具 | PhotoSift |
| **Workflow Plugin（流程外掛）** | 無獨立 UI，是「輸入→處理→輸出」的 pipeline | 自動化流程、AI Skill | LearningHacker |

### 4.2 Manifest 格式

兩種外掛共用同一個 manifest.json 格式，用 `plugin_type` 區分。

#### Panel Plugin 範例（PhotoSift）

```json
{
  "name": "photo-sift",
  "version": "1.0.0",
  "display_name": "相片篩選器",
  "plugin_type": "panel",
  "description": "快速篩選和分類照片",

  "entry": {
    "panel": "./component.tsx"
  },

  "input_schema": {
    "type": "object",
    "properties": {
      "folder_path": { "type": "string", "description": "照片資料夾路徑" }
    }
  },

  "output": {
    "auto_create_object": false,
    "output_type": null
  },

  "permissions": [
    "fs:read",
    "fs:write"
  ]
}
```

#### Workflow Plugin 範例（LearningHacker）

```json
{
  "name": "learning-hacker",
  "version": "1.0.0",
  "display_name": "影片學習筆記",
  "plugin_type": "workflow",
  "description": "輸入影片網址，自動抓字幕、翻譯、整理成筆記",

  "entry": {
    "workflow": "./workflow.ts"
  },

  "input_schema": {
    "type": "object",
    "properties": {
      "url": { "type": "string", "description": "影片網址" },
      "target_language": { "type": "string", "default": "zh-TW" }
    },
    "required": ["url"]
  },

  "output": {
    "auto_create_object": true,
    "output_type": "note",
    "output_mapping": {
      "title": "{{video_title}} - 學習筆記",
      "content": "{{translated_summary}}",
      "properties": {
        "tags": ["影片筆記", "{{topic}}"],
        "source_url": "{{url}}",
        "source_tool": "learning-hacker"
      }
    }
  },

  "permissions": [
    "network:external",
    "llm:claude"
  ]
}
```

### 4.3 Manifest 關鍵欄位說明

| 欄位 | 說明 |
|------|------|
| `plugin_type` | `"panel"` 或 `"workflow"`，決定載入方式 |
| `entry.panel` | Panel 外掛的 React 元件路徑 |
| `entry.workflow` | Workflow 外掛的執行入口路徑 |
| `input_schema` | JSON Schema 格式，系統據此自動生成輸入表單（Workflow 外掛不需寫 UI） |
| `output.auto_create_object` | 是否在工具執行完後自動建立 Object |
| `output.output_type` | 自動建立的 Object type（如 `"note"`） |
| `output.output_mapping` | 定義工具輸出變數如何對應到 Object 欄位，用 `{{placeholder}}` 引用 |
| `permissions` | 宣告所需權限，安裝時由使用者批准（見 §3.3） |

### 4.4 外掛載入流程

```
使用者把外掛資料夾放進 ~/.life-console/plugins/
         │
         ▼
系統掃描 manifest.json → 驗證格式 + 權限確認 Dialog（§3.3）
         │
         ▼
  ┌──────┴──────┐
  │             │
panel          workflow
  │             │
渲染在工具區    註冊到工具列表
的面板中        顯示為可執行的工具卡片
                （根據 input_schema 自動生成輸入表單）
```

### 4.5 現有工具的最小整合路徑

| 工具 | 整合方式 | MVP 工作量 | 說明 |
|------|---------|-----------|------|
| **PhotoSift** | 快捷啟動模式 | 極小 | 在工具區放一張卡片，點擊後啟動外部 PhotoSift 程式。不嵌入、不建 Object。未來再考慮重寫為嵌入式元件 |
| **LearningHacker** | 改造為 Workflow Plugin | 中等 | 將 Claude Skill 包成 `workflow.ts`，定義 manifest 的 `output_mapping`，自動建 Note Object |

---

## 5. 技術棧（確定）

| 項目 | 選擇 | 理由 | 決議來源 |
|------|------|------|---------|
| 桌面框架 | **Electron（最新穩定版）** | MVP 速度優先於效能；PhotoSift 為外部啟動，不需對齊版本 | M5 |
| 資料庫 | **SQLite** | 本地優先、零依賴、跨平台；與架構文件 v1.1 一致 | — |
| 前端 | **React + TypeScript** | 外掛系統基於 React 元件 | — |
| AI 推理 | **Claude API（BYOK）** | Inbox 推斷採非同步 Claude API 呼叫；MVP 不做本地模型 | M4 |
| 外掛執行 | **Node.js 子程序** | Workflow 外掛在隔離環境中執行 | — |

---

## 6. 架構保護策略

### 6.1 MVP 需要定好的（改動成本高）

| 項目 | 原因 |
|------|------|
| Object Model 核心欄位 | 有真實資料後遷移成本高 |
| `type` 欄位的擴充機制 | 確保新 type 不需要改 DB schema |
| `properties` 用 JSON 存 | 一旦改成獨立表，所有查詢都要重寫 |
| `ai_metadata` 結構 | Personal Skills 的種子資料格式要穩定 |
| Plugin manifest 格式 | 外掛開發者依賴此格式 |
| 權限清單定義（6 種） | 未來加入執行期檢查時需向後相容 |

### 6.2 MVP 可以隨便改的（AI 時代寫程式成本低）

| 項目 | 原因 |
|------|------|
| UI 介面與互動方式 | 純前端，隨時可重寫 |
| Today View 的排程演算法 | 業務邏輯，不影響資料結構；已預留 AI 介入點 |
| 外掛沙盒的隔離方式 | iframe / Shadow DOM / 直接掛載，可以換 |
| 具體的 Plugin SDK API 簽名 | 初期使用者只有自己，API 可以邊用邊改 |

### 6.3 MVP 不做但預留介面的

| 項目 | 預留方式 | 啟用時機 |
|------|---------|---------|
| Personal Skills | `ai_metadata.user_corrections` 持續記錄修正行為 | Phase 2 隱式學習 |
| 知識圖譜 | `relations` 表已建立，但不做圖譜遍歷 | Phase 3 GraphRAG |
| 語意搜尋 | `embeddings` 表預留，MVP 用全文搜尋 | Phase 2 向量引擎整合 |
| MCP 整合 | 架構上支援，MVP 只做手動輸入 | Phase 2 Google Calendar / Email |
| 可解釋性 UI | `ai_metadata` 已記錄推斷過程 | Phase 2 推理溯源面板 |
| AI 排程 | `getTodayTasks()` 預留 reranker 介入點 | Phase 2 AI reranker |
| 執行期權限檢查 | manifest 已宣告權限 | Phase 2+ 沙盒強化 |

---

## 7. MVP 範圍邊界

### 做

- [ ] Inbox：手動輸入 + Claude API 非同步推斷 type + 使用者確認
- [ ] Task 管理：基本 CRUD、status、priority、due_date、estimated_minutes
- [ ] Today View：規則加權排序（urgency + priority + staleness），顯示每日預估總耗時
- [ ] 工具區：載入外掛 manifest、權限確認 Dialog、Workflow 外掛自動生成表單、執行、回寫 Object
- [ ] Workflow Plugin SDK：三類原子 API（llm / tools / store）
- [ ] 全域搜尋：全文搜尋所有 Object
- [ ] LearningHacker 改造為 Workflow Plugin
- [ ] PhotoSift 快捷啟動整合

### 不做

- Personal Skills 系統
- 知識圖譜與 GraphRAG
- 語意向量搜尋
- MCP 外部服務整合
- 氛圍編程（JSON 藍圖模式）
- 跨設備同步
- 外掛商城
- 行動端 App
- 執行期權限強制檢查
- AI 排程 reranker
- 本地輕量模型

---

## 8. 與架構文件 v1.1 的對應關係

| 架構文件模組 | MVP 狀態 | 說明 |
|-------------|---------|------|
| AI-Native Schema（§4.1） | ✅ 簡化實作 | 4 個 Type、JSON properties、無圖譜 |
| Schema 推斷（§4.1.2） | ✅ 基礎版 | Inbox → Claude API 非同步推斷 type，使用者確認 |
| Schema 錯誤處理（§4.1.4） | ✅ 簡化版 | 推斷錯誤 → 保留為 inbox_item，不強制分類 |
| Hybrid RAG（§4.2） | ❌ 不做 | 先用全文搜尋 |
| Event Bus（§4.3） | ❌ 不做 | MVP 用直接函數呼叫 |
| LLM Gateway（§4.4） | ✅ 簡化版 | 只做 Claude API BYOK，無 Token Budgeter |
| 外掛系統（§5） | ✅ 基礎版 | manifest + 兩種 plugin type + 三類原子 SDK API |
| 三層 UI（§6） | ⚠️ 部分 | Inbox + Today View + Toolbox + 搜尋，無 Spaces |
| Personal Skills（§7.5） | ❌ 不做 | 但透過 ai_metadata 預留種子資料 |
| 氛圍編程（§8） | ❌ 不做 | |
| MCP 整合（§9） | ❌ 不做 | |
| 隱私安全（§10） | ⚠️ 基礎 | Local-first SQLite、BYOK、無 PII 遮罩 |

---

## 9. 已決議事項（M1-M8）

| ID | 問題 | 決議 | 理由 |
|----|------|------|------|
| M1 | Today View 排程邏輯 | **規則排序**（urgency + priority + staleness 加權），預留 AI reranker 介入點 | MVP 缺乏足夠脈絡（無行事曆、無行為歷史）讓 AI 排得比規則好；規則排序可預測，有利信任建立 |
| M2 | Workflow Plugin SDK API | **三類原子 API**：`context.llm`（ask）、`context.tools`（fetchUrl / readFile / writeFile）、`context.store`（create / query） | 平台提供原子能力，外掛自組業務邏輯；避免 SDK 因特化需求不斷膨脹 |
| M3 | 外掛權限粒度 | **manifest 宣告 + 安裝提示**，不做執行期強制檢查。6 種權限：fs:read/write、network:external、llm:claude、store:read/write | MVP 外掛使用者只有自己，執行期攔截是 Phase 2+ 的工作；但 manifest 格式現在就定好 |
| M4 | Inbox AI 推斷方案 | **Claude API（BYOK）+ 非同步推斷**，先存 inbox_item 立即顯示，背景分類完成後浮現確認提示 | Inbox 推斷是核心體驗，regex 品質不足以支撐；4 個 type 的分類 token 成本極低；BYOK 模式無成本壓力 |
| M5 | Electron 版本 | **最新穩定版**，PhotoSift 為外部啟動，兩者版本獨立 | PhotoSift 不嵌入 Life Console，無版本對齊需求 |
| M6 | UI 佈局 | **Sidebar 導航**（左側固定 Nav + 右側主內容區），類似 Notion / Linear | 使用者已有心智模型；三個核心模組適合切換式導航而非並排 |
| M7 | Electron IPC 設計 | **~9 個 channel**，renderer invoke → main handle 為主，少量 main→renderer push（推斷完成、外掛狀態） | SQLite / Claude API / Plugin 全在 main process，renderer 不直接持有 API key 或 DB 連線 |
| M8 | Workflow Plugin 執行方式 | **同 process 直接注入 WorkflowContext**，不做子程序隔離 | MVP 外掛作者只有自己，風險可控；同 process 實作最簡單、除錯最方便；Phase 2 可遷移至 fork + IPC proxy，外掛 interface 不變 |

---

## 10. 下一步行動

1. **初始化專案骨架：** Electron + React + TypeScript + SQLite，建立 Object Model 的 CRUD 基礎
2. **實作 Inbox 推斷流程：** Claude API 非同步呼叫 + 確認 UI
3. **實作 Today View 排程：** `scoreTask()` 加權排序函數
4. **定義 Workflow Plugin SDK：** 實作 `WorkflowContext` 介面
5. **將 LearningHacker 改造為第一個 Workflow Plugin 作為端到端驗證**
