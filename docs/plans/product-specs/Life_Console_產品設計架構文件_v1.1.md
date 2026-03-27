# Life Console — 產品設計架構與規劃文件

> **版本：** v1.1
> **建立日期：** 2026-03-10
> **最後更新：** 2026-03-25
> **狀態：** 架構迭代中 (Pre-Alpha)

---

## 變更紀錄 (Changelog)

| 版本 | 日期 | 變更摘要 |
|------|------|----------|
| v1.0 | 2026-03-10 | 初始文件建立：完整產品定位、系統架構、UI 策略、商業模式、風險評估 |
| v1.1 | 2026-03-25 | **重大更新：** (1) 新增 Personal Skills 系統設計（§7.5）作為核心差異化第二軸 (2) 產品定位語言修訂：新增對外 Positioning Statement，去除「OS」過度承諾（§1.1） (3) 核心差異化三軸重構：氛圍編程降級為進階能力，Personal Skills 取代為第二軸（§1.2） (4) MVP 場景收窄至技術專案管理核心（§2.2） (5) Schema 推斷錯誤處理流程補全（§4.1.4） (6) 可解釋性 UI 從附屬功能提升為介面一等公民（§6.4） (7) 護城河新增「認知模型不可遷移性」（§12） (8) 風險登記簿新增 R10-R12（§13） (9) Roadmap 更新：Personal Skills Phase 1 納入 MVP（§15） (10) 待決議事項新增 Q11-Q12（§16） |

---

## 目錄

1. [產品願景與定位](#1-產品願景與定位)
2. [目標用戶與使用場景](#2-目標用戶與使用場景)
3. [系統架構：微核心雙層設計](#3-系統架構微核心雙層設計)
4. [L1 核心大腦：資料與 AI 架構](#4-l1-核心大腦資料與-ai-架構)
5. [L2 外掛容器：UI 與外掛系統](#5-l2-外掛容器ui-與外掛系統)
6. [UI/UX 策略：三層導航架構](#6-uiux-策略三層導航架構)
7. [AI 代理系統設計](#7-ai-代理系統設計)
8. [氛圍編程 (Vibe Coding) 策略](#8-氛圍編程-vibe-coding-策略)
9. [系統互操作性：MCP 整合](#9-系統互操作性mcp-整合)
10. [隱私與安全架構](#10-隱私與安全架構)
11. [商業模式與 GTM 策略](#11-商業模式與-gtm-策略)
12. [產品護城河分析](#12-產品護城河分析)
13. [風險登記簿 (Risk Register)](#13-風險登記簿-risk-register)
14. [競品定位圖譜](#14-競品定位圖譜)
15. [開發路線圖 (Roadmap)](#15-開發路線圖-roadmap)
16. [待決議事項 (Open Questions)](#16-待決議事項-open-questions)

---

## 1. 產品願景與定位

### 1.1 產品定義

**內部技術定義：**
Life Console 是一款 Context-Driven Agentic Workspace（脈絡驅動的代理化工作區），將個人知識、經驗與習慣轉化為 AI 可理解的結構化脈絡，讓 AI 代理從被動問答工具進化為主動推進工作的數位協作者。

**對外 Positioning Statement（v1.1 新增）：**
> **「專為技術人打造的 AI 第二大腦：你只管記錄，它自動結構化、學會你的思考方式、主動推進你的專案。」**

**定位語言設計原則：** 對外溝通避免使用「OS」「脈絡驅動」等技術術語。核心訊息聚焦在使用者可感知的三個價值——自動結構化（省去手動整理）、學習思考方式（越用越懂你）、主動推進（不只被動回答）。

### 1.2 核心差異化三軸（v1.1 重構）

| 維度 | 傳統 PKM | Life Console |
|------|----------|--------------|
| 資料架構 | 人類可讀（Markdown / 資料夾） | 機器原生（AI-Native Schema：物件導向 + 向量 + 圖譜） |
| **個人化認知** | 無記憶，每次對話重新開始 | **Personal Skills：系統持續學習使用者的認知模式、分析習慣與處理偏好，累積為可複用的個人化技能** |
| AI 角色 | 反應式助理（被動搜尋與摘要） | 主動式代理（基於 Personal Skills 進行習慣追蹤、預測推薦、自動執行） |

**v1.1 變更說明：** 原第二軸「Skill-Guided 氛圍編程」降級為進階能力（見 §8），由 Personal Skills 取代。理由：氛圍編程僅服務 ~5% 重度自訂用戶，而 Personal Skills 對 100% 使用者產生價值且是最強留存機制。三軸的邏輯鏈更緊密——Schema 讓 AI 能讀懂資料，Personal Skills 讓 AI 能讀懂你，代理把兩者結合起來主動行動。

### 1.3 設計原則

1. **Local-First, Cloud-Augmented：** 資料與記憶留在本地，雲端僅用於高階推理。
2. **Structure at Ingestion：** 資料在進入系統的瞬間即被結構化，而非事後整理。
3. **AI Maintains, Human Overrides：** AI 負責日常組織，使用者保有最終覆寫權。
4. **Progressive Trust：** 使用者對 AI 的控制權隨信任度逐步釋放，不強制自動化。
5. **Explainable by Default：** 所有 AI 決策皆提供可視化推理路徑。
6. **Learn by Observing（v1.1 新增）：** 系統透過觀察使用者行為隱式學習，而非要求使用者主動配置偏好。

---

## 2. 目標用戶與使用場景

### 2.1 主要目標族群 (Primary Persona)

**技術導向的專業知識工作者 (Technical Knowledge Workers)**

- 軟體工程師、架構師、技術主管
- 獨立研究者、技術寫作者
- 跨領域的數位遊牧工作者

**特徵：** 高度碎片化的資訊來源（GitHub、Slack、Notion、Email、技術文件），對資料主權敏感，對 CLI / 自動化工具有天然親和力。

### 2.2 核心使用場景（v1.1 收窄與分級）

**MVP 核心場景（Phase 0-1 驗證焦點）：**

| 場景 | 描述 | 涉及模組 | 驗證優先級 |
|------|------|----------|-----------|
| 晨間簡報 | 打開 Life Console，AI 根據行事曆、進行中專案、昨日筆記，自動呈現今日優先事項面板 | AI 代理、動態視圖、MCP (Calendar) | P0 |
| 自動 Task 提取 | 從 Slack、Email、會議紀錄中自動識別並建立 Task Objects | Schema 推斷、MCP 整合 | P0 |
| 專案回溯分析 | 詢問「上季度專案 X 延遲的根本原因」，AI 串連會議紀錄、決策節點與任務歷史進行推理 | Hybrid RAG、可解釋性 UI | P0 |

**延伸場景（Phase 2+ 逐步開放）：**

| 場景 | 描述 | 涉及模組 | 階段 |
|------|------|----------|------|
| 學習筆記累積 | 閱讀技術文章後快速記錄想法，AI 自動關聯到既有知識節點並標記知識缺口 | Schema 推斷、知識圖譜、主動推薦 | Phase 2 |
| 自訂儀表板 | 用自然語言描述「每週顯示我閱讀量最多的三個技術領域」，系統生成視覺化面板 | 氛圍編程、外掛沙盒 | Phase 2 |
| 週五自動摘要 | AI 偵測到週五下午的固定習慣，預先生成本週會議紀錄摘要草稿 | Personal Skills、行為模式辨識 | Phase 2 |
| 健康 / 個人追蹤 | 透過外掛追蹤個人習慣與健康指標 | 外掛生態 | Phase 3+ |

**v1.1 變更說明：** 原 v1.0 將五個場景並列，無優先級區分。v1.1 將 MVP 聚焦於「技術專案管理」三件事（晨間簡報 + Task 提取 + 專案回溯），學習筆記、自訂儀表板、週五摘要等移至 Phase 2+。理由：MVP 場景過寬等於什麼都沒驗證；技術專案管理場景的資料結構化程度最高，最適合驗證 Schema 推斷的核心假設。

---

## 3. 系統架構：微核心雙層設計

```
┌─────────────────────────────────────────────────────────┐
│                    L2 外掛容器層                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Plugin A │  │ Plugin B │  │ Plugin C │  ...          │
│  │ (React)  │  │ (React)  │  │ (React)  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                    │
│  ─────┴──────────────┴──────────────┴──── Plugin API ── │
│                                          (Sandboxed)     │
├─────────────────────────────────────────────────────────┤
│                    L1 核心大腦層                          │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  AI-Native  │  │  Event Bus  │  │   LLM Gateway   │ │
│  │   Schema    │  │  (事件總線)  │  │  (雲端 API 橋)  │ │
│  │             │  │             │  │                   │ │
│  │ ┌─────────┐ │  │ 時間觸發器  │  │ Context Packer  │ │
│  │ │ SQLite  │ │  │ 資料變更事件│  │ Token Budgeter  │ │
│  │ │ + Vec   │ │  │ 外部 MCP 事件│ │ Model Router    │ │
│  │ │ + Graph │ │  │ 使用者行為  │  │ Skill Injector  │ │
│  │ └─────────┘ │  └─────────────┘  └────────┬──────────┘ │
│  └─────────────┘                            │            │
│       │                                     ▼            │
│  ┌─────────────┐                   ┌──────────────┐     │
│  │  Personal   │                   │ Cloud LLMs   │     │
│  │  Skills     │                   │ (Claude, etc)│     │
│  │  Engine     │                   └──────────────┘     │
│  └─────────────┘                                         │
├─────────────────────────────────────────────────────────┤
│                    MCP 整合層                             │
│  Google Drive │ Slack │ GitHub │ Calendar │ Email │ ... │
└─────────────────────────────────────────────────────────┘
```

**v1.1 架構變更：** L1 核心大腦層新增 Personal Skills Engine 模組；LLM Gateway 新增 Skill Injector 元件（負責將啟用的 Skills 注入 Prompt Context）。

### 3.1 核心設計決策

| 決策 | 選擇 | 理由 |
|------|------|------|
| 桌面框架 | Tauri (優先) / Electron (備案) | Tauri 體積更小、安全性更高（Rust 後端）；Electron 生態更成熟 |
| 主要開發語言 | Rust (L1 核心) + TypeScript (L2 前端) | Rust 保障本地效能與記憶體安全；TS 生態適合 UI 與外掛 |
| 資料庫 | SQLite (結構化) + 本地向量引擎 | 本地優先、零依賴、跨平台、效能足夠 |
| AI 推理 | 雲端 API 為主，本地輕量模型為輔 | 複雜推理需要大模型能力，本地模型處理分類與實體擷取 |

---

## 4. L1 核心大腦：資料與 AI 架構

### 4.1 AI-Native Schema 設計

#### 4.1.1 物件模型 (Object Model)

系統中的每一則資料皆為**物件 (Object)**，而非檔案。每個物件具備：

```
Object {
  id:          UUID
  type:        ObjectType        // 如 Note, Task, Person, Project, Decision...
  properties:  Map<Key, Value>   // 結構化屬性（依 Type 定義）
  content:     RichText          // 人類可讀的主體內容
  embedding:   Vector            // 語意向量（自動生成）
  relations:   List<Relation>    // 與其他物件的具名關聯
  metadata: {
    created_at:   Timestamp
    updated_at:   Timestamp
    source:       Source          // 手動輸入 / MCP 匯入 / AI 生成
    confidence:   Float           // AI 推斷的信心分數
    access_freq:  Int             // 存取頻率（用於遺忘機制）
  }
}
```

#### 4.1.2 Schema 推斷機制 (Type Inference)

**核心問題：** 如何在不強迫使用者預先定義 Schema 的前提下，確保資料結構化？

**策略：漸進式結構化 (Progressive Structuring)**

1. **輸入時：** 使用者可以像寫隨筆一樣直接輸入，不需要選擇型別。
2. **即時推斷：** 本地輕量模型在背景分析內容，推斷可能的 ObjectType，並提取候選屬性。
3. **輕量確認：** 底部浮現一行提示，例如：「這看起來像一則 `會議紀錄`，包含 `決策` 與 `待辦`，要套用嗎？」使用者可一鍵確認、修改、或忽略。
4. **學習回饋：** 使用者的確認/修改行為會回饋至推斷模型，逐步提高準確度。此回饋同時寫入 Personal Skills 的偏好記憶（見 §7.5）。

```
使用者輸入 ──► 本地模型推斷 Type + Properties
                    │
                    ▼
              ┌───────────┐     使用者確認
              │ 候選建議   │ ──────────────► 結構化儲存
              │ (浮動提示) │                   + 回饋寫入 Personal Skills
              └───────────┘     使用者忽略
                    │ ──────────────────────► 以 Generic Note 儲存
                    │                          （保留 embedding，待後續重分類）
```

#### 4.1.3 預設 ObjectType 清單 (可擴充)

| Type | 預設屬性 | 說明 |
|------|----------|------|
| `Note` | tags, topic | 通用筆記，最低結構 |
| `Task` | status, priority, due_date, assignee | 待辦事項 |
| `Decision` | context, options, chosen, rationale | 決策紀錄 |
| `Meeting` | date, participants, decisions, action_items | 會議紀錄 |
| `Person` | role, organization, relationship | 人物檔案 |
| `Project` | status, timeline, stakeholders | 專案節點 |
| `Insight` | source, confidence, related_topics | 學習洞見 |
| `SOP` | steps, triggers, owner | 標準作業流程 |
| `Skill` | trigger, prompt_template, learning_history, version | **v1.1 新增：** Personal Skill 物件（見 §7.5） |

#### 4.1.4 Schema 推斷錯誤處理流程（v1.1 新增）

**核心原則：** 推斷錯誤是常態，不是例外。系統必須讓修正比推斷更容易。

```
AI 推斷結果
    │
    ├── 正確 → 使用者確認 → 強化 Personal Skills 偏好
    │
    ├── 部分正確 → 使用者修改 Type 或 Properties
    │   │
    │   ├── 修正 UI：點擊推斷結果 → 展開候選清單（含 AI 信心分數排序）
    │   ├── 快速修正：一鍵切換 Type，自動重新填充屬性
    │   └── 修正行為 → 回饋至 Personal Skills（記錄「使用者不喜歡把 X 歸為 Y」）
    │
    └── 完全錯誤 → 使用者忽略推斷
        │
        ├── 以 Generic Note 儲存（零損失）
        ├── 所有內容保留 embedding（仍可被搜尋找到）
        └── 系統記錄「此類內容推斷失敗」→ 調整未來推斷策略
```

**Fallback 保障：**
- 即使推斷完全失敗，使用者的內容也不會遺失或被錯誤分類——最差情況是儲存為無型別的 Generic Note。
- Generic Note 仍保有完整的語意向量，可透過全域搜尋和時間軸找到。
- 系統每週在背景掃描 Generic Notes，嘗試基於新累積的 Personal Skills 偏好重新推斷，並以非侵入式通知詢問使用者。

### 4.2 記憶檢索架構：漸進式 Hybrid RAG

**初期（v1–v2）：向量搜尋 + 屬性標記**

- 所有 Object 自動生成 embedding，存入本地向量引擎（如 `sqlite-vss` 或 `hnswlib`）。
- 利用 ObjectType 和 Properties 作為過濾條件，縮小向量搜尋範圍。
- 查詢流程：`使用者問題 → 語意向量匹配 → 依 Type/Property 過濾 → 排序返回`。

**中期（v3+）：引入知識圖譜層**

- 在 SQLite 中建立 `relations` 表，儲存物件間的具名關係（如 `Decision X → caused_by → Issue Y`）。
- 查詢流程升級：`語意召回 → 圖譜遍歷（多跳推理）→ 邏輯一致性檢查 → 返回`。
- 可解釋性：每個推薦結果附帶推理路徑的節點鏈。

**長期（v4+）：完整 Hybrid GraphRAG**

- 向量資料庫負責廣泛語意召回（高 Recall）。
- 知識圖譜負責精確邏輯推導（高 Precision）。
- 兩者結果合併排序，提供精確且具脈絡的答案。

### 4.3 Event Bus（事件總線）

系統的中央神經系統，所有狀態變化皆以事件形式流通。

**事件類型：**

| 事件類別 | 範例 | 觸發來源 |
|----------|------|----------|
| 資料事件 | `object.created`, `object.updated`, `relation.added` | 使用者操作 / MCP 匯入 |
| 時間事件 | `schedule.morning_brief`, `schedule.weekly_review` | 系統排程器 |
| 行為事件 | `user.search_pattern`, `user.focus_shift`, `user.correction` | 行為追蹤模組 |
| 外部事件 | `mcp.calendar.event_added`, `mcp.email.received` | MCP 伺服器 |
| 代理事件 | `agent.recommendation_ready`, `agent.anomaly_detected` | AI 代理 |
| Skill 事件（v1.1） | `skill.created`, `skill.activated`, `skill.feedback` | Personal Skills Engine |

**作用：** 外掛與 AI 代理訂閱感興趣的事件類型，實現鬆耦合的響應式架構。Personal Skills Engine 訂閱 `user.correction` 和行為事件來持續學習。

### 4.4 LLM Gateway

負責管理所有與雲端 LLM 的通訊。

**核心元件：**

- **Context Packer：** 將使用者問題 + 相關 Objects + 關係圖譜壓縮為最佳化的 Prompt。
- **Token Budgeter：** 根據模型的 context window 限制，智慧分配 token 預算給不同資料來源。
- **Model Router：** 依任務複雜度選擇模型（簡單分類 → 本地模型；複雜推理 → Claude / GPT）。
- **Cost Tracker：** 追蹤 API 使用量，支援 BYOK（自備 API Key）模式的用量報告。
- **Skill Injector（v1.1 新增）：** 根據當前 Object 的 Type 和 Context，從 Personal Skills 中選擇相關 Skills，將其 Prompt 模板和 few-shot examples 注入 LLM 呼叫。包含 Skill 優先級解析器，處理多個 Skills 衝突的情況。

---

## 5. L2 外掛容器：UI 與外掛系統

### 5.1 外掛架構

```
plugin-folder/
├── manifest.json        # 外掛宣告：名稱、版本、所需權限、訂閱事件
├── component.tsx        # React UI 組件（渲染於主控台面板中）
├── background.ts        # (選用) 背景邏輯：事件處理、資料轉換
└── README.md            # 使用說明
```

#### manifest.json 結構

```json
{
  "name": "weekly-reading-stats",
  "version": "1.0.0",
  "display_name": "每週閱讀統計",
  "description": "視覺化本週閱讀量與主題分佈",
  "permissions": [
    "read:objects(type=Note,Insight)",
    "read:metadata(access_freq)"
  ],
  "subscriptions": [
    "object.created",
    "schedule.weekly_review"
  ],
  "ui": {
    "mount_point": "panel",
    "default_size": "medium"
  }
}
```

### 5.2 Plugin API（沙盒 API）

外掛只能透過受控的 API 與 L1 互動，無法直接存取檔案系統或網路。

```typescript
// Plugin SDK 介面 (草案)
interface LifeConsolePluginAPI {
  // 資料讀取
  query(filter: ObjectFilter): Promise<Object[]>
  getRelations(objectId: string, depth?: number): Promise<RelationGraph>
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>

  // 資料寫入 (需權限)
  createObject(type: string, data: ObjectInput): Promise<Object>
  updateObject(id: string, patch: ObjectPatch): Promise<Object>
  addRelation(from: string, to: string, type: string): Promise<Relation>

  // 事件系統
  on(event: EventType, handler: EventHandler): Unsubscribe
  emit(event: CustomEvent): void

  // AI 呼叫 (受 Token Budget 管控)
  askAI(prompt: string, context?: AIContext): Promise<AIResponse>

  // Personal Skills (v1.1 新增)
  getActiveSkills(context?: SkillContext): Promise<Skill[]>
  suggestSkillCreation(pattern: SkillPattern): Promise<void>

  // UI 輔助
  showNotification(msg: string, level: 'info' | 'warn'): void
  requestUserConfirmation(msg: string): Promise<boolean>
}
```

### 5.3 Skill-Guided 外掛開發流程

```
1. 使用者需求
   「我想要一個追蹤每日咖啡因攝取的面板」

2. 在外部 IDE (Cursor / Windsurf) 載入 Life Console SDK + Skill 文件

3. 使用者用自然語言描述需求，IDE 的 AI 生成外掛程式碼

4. 產出 plugin-folder/ 結構

5. 拖曳資料夾至 Life Console → 自動解析 manifest → 掛載 UI → 註冊事件

6. 外掛立即獲得使用者的歷史脈絡
```

---

## 6. UI/UX 策略：三層導航架構

### 6.1 設計哲學

**「給使用者一個看得見的家，但讓 AI 負責打掃和佈置。」**

不走 Mem.ai 的純 AI 搜尋路線（使用者焦慮），也不走 Notion 的手動組織路線（管理負擔過重）。採用三層並存的漸進式設計。

### 6.2 三層結構

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│  Layer 1: Spaces（空間）── 使用者手動建立的粗粒度分區  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐            │
│  │ 工作  │  │ 個人  │  │ 學習  │  │ 健康  │  ...      │
│  └──┬───┘  └──┬───┘  └──┬───┘  └──────┘            │
│     │         │         │                            │
│     ▼         ▼         ▼                            │
│  Layer 2: AI 動態面板 ── AI 根據脈絡自動生成的視圖     │
│  ┌────────────────────────────────────────────┐      │
│  │  📋 今日優先任務    │  📊 專案 X 最新進展  │      │
│  │  📝 相關近期筆記    │  ⚠️ 需要注意的矛盾   │      │
│  │  💡 AI 推薦閱讀     │  🔧 自訂面板 A       │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
│  Layer 3: 全域兜底 ── 永遠可用的搜尋與時間軸           │
│  ┌──────────────────────────────────────────┐        │
│  │  🔍 全域搜尋 │ 📅 時間軸 (Journal)       │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Layer 1 — Spaces（空間）：**
- 使用者手動建立的頂層分區（如「工作」「個人」「學習」）。
- 提供「我知道東西放在哪」的安全感與掌控感。
- 粗粒度分類，不鼓勵深層巢狀結構。

**Layer 2 — AI 動態面板：**
- 進入 Space 後，AI 根據時間、近期行為、專案狀態自動編排面板。
- 面板可透過自然語言調整佈局（氛圍編程入口）。
- 外掛以面板 (Panel) 的形式掛載於此層。
- **v1.1 新增：** 面板排列與內容受 Personal Skills 影響。例如使用者的「晨間簡報 Skill」會決定簡報面板的結構與資訊密度。

**Layer 3 — 全域搜尋 + 時間軸：**
- 不管 AI 怎麼組織，使用者永遠可以透過搜尋找到任何 Object。
- 時間軸（Journal View）：以日期為軸心的流水帳檢視，支援「我大概是上週記的」這類模糊回憶。

### 6.3 信任建立的漸進路徑

```
新用戶初期                              熟練用戶
├── 大量使用 Layer 1 (手動分類)          ├── 幾乎不碰 Layer 1
├── 偶爾看 Layer 2 (AI 建議)            ├── 主要依賴 Layer 2 (AI 面板)
├── 頻繁使用 Layer 3 (搜尋兜底)          ├── 搜尋僅用於特殊情況
├── AI 自動化 = OFF                     ├── AI 自動化 = 大部分 ON
└── Personal Skills = 少量/通用          └── Personal Skills = 豐富/高度客製
```

**設計決策備註：** 有外部回饋建議「直接砍掉 Layer 1，只留 AI 動態首頁」。經評估後決定保留，理由如下：(1) 使用者在不信任 AI 的 Day 1 需要手動結構作為安全網；(2) Mem.ai 的純 AI 路線已驗證會導致使用者焦慮；(3) 使用者從 Layer 1 漸進遷移到 Layer 2 本身就是信任建立成功的信號，不是設計失敗。但 Layer 1 應保持極度精簡（3-5 個粗粒度空間，無巢狀）。

### 6.4 可解釋性 UI：介面一等公民（v1.1 提升）

**v1.1 變更說明：** 原 v1.0 將可解釋性 UI 僅放在 §7.4 作為推薦卡片的展開功能。v1.1 將其提升為介面設計的核心原則，貫穿所有 AI 產出。

**設計原則：每一個 AI 行為都必須有可見的「為什麼」入口。**

```
┌─────────────────────────────────────────────────────┐
│  全域可解釋性 UI 元素                                 │
│                                                      │
│  1. 推薦卡片 → 「為什麼推薦？」展開推理路徑            │
│  2. Schema 推斷 → 推斷結果旁顯示信心分數 + 候選清單    │
│  3. 動態面板排列 → 面板角落顯示「排列依據」圖示        │
│  4. Personal Skill 啟用 → 標註「使用了你的 XX Skill」  │
│  5. 晨間簡報 → 每個優先項目標註「排序原因」            │
│  6. 自動 Task 提取 → 標註來源（哪封 Email/哪則 Slack） │
│                                                      │
│  互動模式：                                           │
│  - 預設收合，僅顯示小圖示（不打擾日常使用）             │
│  - 滑鼠懸停顯示一行摘要（如「基於你 3/15 的會議決策」）  │
│  - 點擊展開完整推理路徑（節點鏈 + 信心分數）            │
│  - 「這個推薦不好」按鈕 → 回饋至 Personal Skills        │
└─────────────────────────────────────────────────────┘
```

**推薦結果卡片範例：**

```
┌─────────────────────────────────────────┐
│ 📎 推薦：將「API 設計筆記」加入專案 X     │
│                                  🧠 Skill: 技術決策追蹤
│                                          │
│ 🔍 為什麼推薦？ (點擊展開)               │
│ ┌──────────────────────────────────────┐ │
│ │ 「API 設計筆記」                      │ │
│ │      ↓ 提到實體: REST Gateway        │ │
│ │ 「專案 X 架構會議」                   │ │
│ │      ↓ 決策: 採用 REST Gateway       │ │
│ │ 「專案 X」                            │ │
│ │                                      │ │
│ │ 信心分數: 0.87                        │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [採納] [忽略] [這個推薦不好 ←回饋按鈕]    │
└─────────────────────────────────────────┘
```

---

## 7. AI 代理系統設計

### 7.1 多層次記憶框架

| 記憶層 | 技術實現 | 存活週期 | 用途 |
|--------|----------|----------|------|
| 工作記憶 | 記憶體快取 (Redis-like) | 當前工作階段 | 維持對話與任務的即時狀態 |
| 短期記憶 | 本地 SQLite 時序表 | 數天~數週 | 近期互動紀錄、暫時性偏好 |
| 語意記憶 | 向量資料庫 + 知識圖譜 | 持久 | 實體知識、概念關聯、事實 |
| 情節記憶 | 時序知識圖譜 | 持久（含衰減） | 時間感知的經歷與事件序列 |
| 偏好記憶 | 結構化設定檔 | 持久（可覆寫） | 使用者明確/隱性表達的偏好與規則 |
| **Skill 記憶（v1.1）** | **Personal Skills Engine** | **持久（含版本控制）** | **使用者的認知模式、處理習慣、分析框架** |

### 7.2 主動遺忘機制

**原則：AI 建議「歸檔」，不自動「刪除」。使用者保有最終決定權。**

- **時間衰減：** 長時間未存取的 Object，AI 降低其在推薦中的權重（但不移除）。
- **相關性評分：** 持續評估 Object 與使用者當前 Focus Area 的相關性。
- **歸檔建議：** 當 Object 同時滿足「長時間未存取」+「低相關性」，AI 提出歸檔建議。
- **歷史摘要壓縮：** 對已歸檔的 Objects 群組生成摘要節點，保留高階知識、釋放細節。

### 7.3 主動行為模式

| 模式 | 描述 | 觸發條件 |
|------|------|----------|
| 知識缺口填補 | 偵測到某主題筆記零散且缺乏關鍵資訊，主動搜尋補充資料 | 新主題的 Object 數量 > 3 且缺乏 Relation |
| 自動化流程觸發 | 學習使用者的重複性操作模式，預先準備草稿 | 行為模式重複 ≥ 3 次 |
| 矛盾偵測 | 標記知識庫中相互矛盾的資訊 | 新 Object 與既有 Object 語意衝突 |
| 過時標記 | 標記可能過時的資訊，建議更新 | Object 年齡 > 閾值 且屬於快速變化領域 |
| 關聯發現 | 發現看似不相關的 Objects 之間的潛在連結 | 跨 Space 的向量相似度超過閾值 |
| **Skill 提煉（v1.1）** | **從重複的使用者修正行為中提煉出新的 Personal Skill** | **同類修正行為累積 ≥ 3 次** |

### 7.4 Skill 啟用的可解釋性

每當 AI 輸出受到 Personal Skill 影響時，UI 上必須有可見標記：

```
AI 摘要輸出
┌─────────────────────────────────────────┐
│ 📝 專案 X 本週進展摘要                    │
│                                          │
│ 🧠 使用了你的「簡潔技術摘要」Skill         │
│    (點擊查看 Skill 內容與學習歷史)         │
│                                          │
│ [內容區域...]                             │
│                                          │
│ [滿意] [不太對 → 調整 Skill]              │
└─────────────────────────────────────────┘
```

### 7.5 Personal Skills 系統設計（v1.1 新增）

#### 7.5.1 核心概念

Personal Skill 是使用者與 AI 協作模式的結構化累積。它不是簡單的偏好設定，而是**外化的認知模型**——記錄使用者如何思考、如何分析、如何處理特定類型的資訊。

**與偏好設定的本質區別：**

| 維度 | 傳統偏好設定 | Personal Skills |
|------|-------------|-----------------|
| 粒度 | 全域（「摘要用條列式」） | 情境化（「技術 Postmortem 用根因分析框架，會議紀錄用行動導向摘要」） |
| 學習方式 | 使用者手動設定 | 系統從行為中隱式學習 + 使用者可顯式調整 |
| 內容 | 格式偏好 | 認知框架（分析維度、決策權重、關注焦點） |
| 累積性 | 靜態 | 隨使用持續進化，附帶版本歷史 |

#### 7.5.2 Skill 資料模型

```
PersonalSkill {
  id:              UUID
  name:            String              // 如「簡潔技術摘要」「架構決策評估」
  type:            SkillType           // summary | analysis | classification | workflow
  trigger: {
    object_types:  List<ObjectType>    // 此 Skill 適用的物件型別
    contexts:      List<String>        // 觸發情境描述
    auto_activate: Boolean             // 是否自動啟用（vs 手動選擇）
  }
  template: {
    system_prompt: String              // 注入 LLM 的指令模板
    few_shot_examples: List<Example>   // 從使用者歷史修正中提煉的範例
    parameters:    Map<Key, Value>     // 可調參數（如「摘要長度」「分析深度」）
  }
  learning_history: {
    created_from:  String              // 「隱式學習」或「使用者建立」
    corrections:   List<Correction>    // 使用者對 Skill 輸出的修正紀錄
    version:       Int                 // 版本號（每次重大修正 +1）
    last_used:     Timestamp
    usage_count:   Int
    satisfaction:  Float               // 基於使用者回饋的滿意度分數
  }
  metadata: {
    created_at:    Timestamp
    updated_at:    Timestamp
    confidence:    Float               // 系統對此 Skill 穩定度的評估
  }
}
```

#### 7.5.3 Skill 學習三階段

**階段一：隱式學習（Phase 1 MVP 納入）**

系統在背景觀察使用者的修正行為，當同類修正累積到閾值時，主動提煉為 Skill。

```
使用者行為觀察
    │
    ├── 觀察點 1：使用者修改 AI 摘要的方式
    │   例：連續 3 次把 AI 的長段落摘要改寫為 3-5 個 bullet points
    │
    ├── 觀察點 2：使用者對 Schema 推斷的修正模式
    │   例：連續 4 次把「Note」重新分類為「Decision」
    │
    └── 觀察點 3：使用者對推薦結果的接受/拒絕模式
        例：總是忽略低信心分數 (<0.7) 的推薦
    │
    ▼
行為模式識別（本地輕量模型）
    │
    ├── 模式足夠穩定？（≥ 3 次同類行為）
    │   │
    │   ├── 是 → 生成候選 Skill
    │   │        │
    │   │        ▼
    │   │   ┌─────────────────────────────────────────┐
    │   │   │ 💡 我注意到你通常偏好簡短的 bullet-point  │
    │   │   │    式摘要。要把這個存成你的                │
    │   │   │    「簡潔摘要」Skill 嗎？                  │
    │   │   │                                          │
    │   │   │ [查看範例] [儲存 Skill] [不用了]           │
    │   │   └─────────────────────────────────────────┘
    │   │
    │   └── 否 → 繼續觀察
    │
    └── 特殊情況：使用者明確拒絕 → 記錄「不要從此模式建立 Skill」
```

**階段二：顯式建立（Phase 2）**

使用者主動用自然語言描述處理方式，系統轉化為結構化 Skill。

```
使用者輸入：
「當我標記文章為 #深度閱讀 時，幫我用費曼技巧生成三個我應該能回答的問題，
  並關聯到我現有的相關筆記。」

    ▼

系統解析為 Skill 定義：
{
  "name": "費曼深度閱讀",
  "trigger": {
    "object_types": ["Insight"],
    "contexts": ["tag:#深度閱讀"],
    "auto_activate": true
  },
  "template": {
    "system_prompt": "基於以下文章，用費曼技巧生成 3 個核心問題...",
    "parameters": { "question_count": 3, "link_existing": true }
  }
}
```

**階段三：Skill 自動進化（Phase 2+）**

隨使用者持續使用和回饋，Skill 自動微調。

```
Skill 輸出 ──► 使用者回饋
                  │
                  ├── [滿意] → satisfaction +1, 強化現有模式
                  │
                  ├── [微調] → 使用者修改輸出 → 修正記錄加入 few_shot_examples
                  │              → Skill version +0.1
                  │
                  └── [不太對] → 觸發 Skill 回顧
                                 │
                                 ▼
                          ┌──────────────┐
                          │ 你的「簡潔摘要」│
                          │ Skill 最近的   │
                          │ 滿意度下降了    │
                          │               │
                          │ [查看修正歷史] │
                          │ [重置到 v2]    │
                          │ [重新訓練]     │
                          └──────────────┘
```

#### 7.5.4 Skill 衝突解析

當多個 Skills 同時適用時，Skill Injector 依以下優先序解析：

| 優先級 | 規則 | 範例 |
|--------|------|------|
| 1 | 使用者在此次操作中手動選擇的 Skill | 使用者點擊「用技術摘要 Skill」 |
| 2 | 與當前 ObjectType 完全匹配的 Skill | Meeting Object → 「會議摘要 Skill」 |
| 3 | 與當前 Context 標籤匹配的 Skill | #架構決策 → 「架構評估 Skill」 |
| 4 | 使用頻率最高的通用 Skill | 「簡潔摘要 Skill」作為 fallback |

衝突不可自動解決時，系統以非侵入方式詢問：
「這則內容同時符合你的『技術摘要』和『決策分析』Skill，要用哪一個？」

#### 7.5.5 Skill Library UI

```
┌─────────────────────────────────────────────────────┐
│  🧠 我的 Skills                              [+ 新增] │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 📊 技術決策評估         v3  │ 使用 47 次 │ ⭐ 92% │ │
│  │ 觸發：Decision 物件                              │ │
│  │ 上次使用：2 天前                                  │ │
│  │ [查看] [編輯] [版本歷史] [暫停]                    │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 📝 簡潔會議摘要          v5  │ 使用 83 次 │ ⭐ 88% │ │
│  │ 觸發：Meeting 物件                               │ │
│  │ 學習自：你的修正行為（隱式學習）                    │ │
│  │ [查看] [編輯] [版本歷史] [暫停]                    │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 🔍 Bug Triage 分類        v2  │ 使用 31 次 │ ⭐ 79% │ │
│  │ 觸發：Task 物件 + tag:#bug                       │ │
│  │ ⚠️ 近期滿意度下降，建議回顧                       │ │
│  │ [查看] [編輯] [版本歷史] [重新訓練]                │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  📦 Skill 範本庫                                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 官方範本：工程師會議摘要 │ 技術文獻分析 │ ...     │ │
│  │ 社群分享：[未來 Phase 3]                          │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

#### 7.5.6 預建 Skill 範本（冷啟動緩解）

新用戶 Day 1 可一鍵套用的通用 Skill 範本：

| 範本名稱 | 觸發條件 | 預設行為 | 目標用戶 |
|----------|----------|----------|----------|
| 工程師會議摘要 | Meeting 物件 | 提取決策 + Action Items，忽略閒聊 | 所有技術人員 |
| 技術文章閱讀筆記 | Insight 物件 + tag:#閱讀 | 生成核心論點 + 與既有知識的關聯 | 研究者 |
| Bug Triage 分類 | Task 物件 + tag:#bug | 自動評估嚴重度 + 建議負責人 | 工程主管 |
| 週報生成 | schedule.weekly_review 事件 | 彙整本週完成/進行中/阻塞項目 | 所有人 |
| Postmortem 根因分析 | Decision 物件 + tag:#postmortem | 用 5-Whys 框架結構化分析 | 架構師 |

使用者套用範本後，系統立即以範本的邏輯處理資料。隨著使用者的修正和回饋，範本會逐步個人化，最終與範本完全不同——這就是從「通用」到「個人化」的自然過渡。

#### 7.5.7 Skill 安全與隱私

- **Skills 完全儲存於本地：** Skill 定義、學習歷史、few-shot examples 皆加密存於本地 SQLite。
- **雲端呼叫時的 Skill 注入：** Skill Injector 僅將 Prompt 模板和匿名化的 examples 傳送至雲端 LLM，不傳送原始修正紀錄。
- **Skill 匯出：** 使用者可匯出 Skill 定義（JSON 格式），但 few-shot examples 需手動審閱後才能匯出（防止意外洩漏敏感資料）。

---

## 8. 氛圍編程 (Vibe Coding) 策略

> **v1.1 定位調整：** 氛圍編程從「核心差異化三軸之一」降級為「進階自訂能力」。理由：(1) 僅 ~5% 重度用戶會使用外部 Vibe Coding 生成外掛；(2) Personal Skills 覆蓋了大多數個人化需求且門檻更低；(3) 氛圍編程的價值在生態成熟後才會顯現。但它仍然是產品架構的重要組成部分，為高階用戶和外掛生態提供擴展能力。

### 8.1 雙軌策略

| 層級 | 方式 | 安全等級 | 適用場景 |
|------|------|----------|----------|
| **內部氛圍（Vibe No-Coding）** | AI 生成 JSON 配置檔 → 系統用預審元件渲染 | 高（沙盒內） | 面板佈局、資料視圖、簡單自動化 |
| **外部氛圍（Skill-Guided Vibe Coding）** | 使用者在外部 IDE 生成完整外掛 | 中（依賴外掛沙盒） | 複雜自訂工具、進階自動化、第三方整合 |

### 8.2 內部氛圍：JSON 藍圖模式

```
使用者輸入：「顯示本月所有會議紀錄，按專案分組，標記有未完成 Action Item 的」

AI 生成 JSON 藍圖：
{
  "type": "panel",
  "title": "本月會議總覽",
  "data_source": {
    "query": { "type": "Meeting", "created_at": { "$gte": "2026-03-01" } },
    "group_by": "properties.project",
    "highlight": { "condition": "action_items.status != 'done'" }
  },
  "layout": "grouped_list",
  "components": ["card", "badge", "progress_bar"]
}

系統解析藍圖 → 使用預審安全元件庫渲染 → 無底層程式碼執行
```

### 8.3 自我修復 (Vibe Ops) 機制

```
外掛執行錯誤 ──► 監控代理捕捉 Error Log
                      │
                      ▼
              AI 分析錯誤根因
                      │
                      ▼
              ┌───────────────┐
              │ 自動修復方案   │
              │ (自然語言描述) │
              └───────┬───────┘
                      │
                      ▼
              詢問使用者確認 ──► 套用修補 + 版本紀錄
```

---

## 9. 系統互操作性：MCP 整合

### 9.1 MCP 架構角色

Life Console 作為 **MCP 客戶端**，透過標準化協定與外部資源通訊。

### 9.2 優先整合的 MCP 伺服器

| 優先級 | 外部服務 | 資料類型 | 用途 |
|--------|----------|----------|------|
| P0 | 本地檔案系統 | 文件、圖片 | 基礎資料匯入 |
| P0 | Google Calendar | 行事曆事件 | 時間感知、晨間簡報 |
| P0 | Email (Gmail / Outlook) | 郵件 | 任務提取、溝通脈絡 |
| P1 | Notion | 頁面、資料庫 | 冷啟動匯入、遷移 |
| P1 | Slack | 訊息、頻道 | 工作溝通脈絡 |
| P1 | GitHub | Issues, PRs, Repos | 技術專案追蹤 |
| P2 | Google Drive | 文件 | 延伸知識庫 |
| P2 | 瀏覽器書籤/歷史 | URLs | 閱讀習慣追蹤 |

### 9.3 冷啟動匯入流程

```
安裝 Day 1
    │
    ▼
授權 MCP 連線 (OAuth)
    │
    ├── Google Calendar → 提取近 3 個月事件 → 建立 Meeting Objects
    ├── Notion → 匯出頁面 → AI 推斷 Type → 建立 Objects + Relations
    ├── Slack → 提取含 Action Item 的訊息 → 建立 Task Objects
    └── Email → 提取重要郵件鏈 → 建立 Person + Decision Objects
    │
    ▼
背景語意處理 (Embedding + Relation 建立)
    │
    ▼
初始知識圖譜就緒 → 使用者立即看到 AI 生成的面板
    │
    ▼  (v1.1 新增)
套用預建 Skill 範本 → AI 立即用合理的方式處理匯入資料
```

### 9.4 匯入品質分級

| 等級 | 條件 | 處理方式 |
|------|------|----------|
| A — 高價值 | 結構化資料（行事曆、任務、決策） | 直接建立強型別 Object |
| B — 中價值 | 半結構化（Notion 頁面、長 Email） | AI 推斷型別，需使用者確認 |
| C — 低價值 | 非結構化雜訊（閒聊 Slack、轉發郵件） | 僅建立 embedding，不建立 Object；待使用者主動提取 |

---

## 10. 隱私與安全架構

### 10.1 資料分層處理

```
┌───────────────────────────────────┐
│         本地端 (Local)             │
│                                    │
│  ✅ 知識圖譜 (加密儲存)            │
│  ✅ 向量索引                       │
│  ✅ 使用者偏好與行為資料            │
│  ✅ Personal Skills 完整資料       │
│  ✅ 輕量模型推斷 (分類/實體擷取)    │
│                                    │
├───────────────────────────────────┤
│         雲端 (Cloud)               │
│                                    │
│  ☁️ 複雜推理 (傳送匿名化資料切片)  │
│  ☁️ 長文本生成                     │
│  ☁️ Skill Prompt 模板 + 匿名範例  │
│  ☁️ 氛圍編程碼生成                 │
│                                    │
│  🚫 不傳送：原始筆記全文            │
│  🚫 不傳送：個人識別資訊 (PII)      │
│  🚫 不傳送：完整知識圖譜            │
│  🚫 不傳送：Skill 原始修正紀錄      │
└───────────────────────────────────┘
```

### 10.2 安全機制

- **傳輸加密：** 所有雲端 API 通訊使用 TLS 1.3。
- **靜態加密：** 本地 SQLite 與向量索引使用 AES-256 加密。
- **PII 偵測與遮罩：** 雲端呼叫前自動掃描並遮罩個人識別資訊。
- **外掛沙盒：** 外掛只能透過 Plugin API 存取授權範圍的資料，無法直接讀取檔案系統或網路。
- **權限最小化原則：** 外掛在 manifest.json 中宣告所需權限，安裝時由使用者批准。
- **Skill 匯出審查（v1.1）：** Personal Skills 的 few-shot examples 匯出前需使用者逐條審閱，防止敏感資料意外洩漏。

---

## 11. 商業模式與 GTM 策略

### 11.1 Open Core 模式

| 項目 | 開源 (Free) | 閉源 (Pro / Team) |
|------|-------------|-------------------|
| L1 資料 Schema | ✅ | ✅ |
| Plugin SDK + Skill 文件 | ✅ | ✅ |
| 核心桌面容器 (L2) | ✅ (基礎版) | ✅ (完整版) |
| 本地 AI 推斷 | ✅ | ✅ |
| Personal Skills（基礎）| ✅ (≤5 個 Skills) | ✅ (無限制) |
| 雲端 AI 推理 | BYOK | 內建 (訂閱制) |
| 跨設備同步 | ❌ | ✅ |
| 進階自動化 (主動代理) | 有限 | 完整 |
| Skill 範本庫 | 基礎範本 | 完整範本 + 社群分享 |
| 團隊共享知識圖譜 | ❌ | ✅ (Team plan) |

### 11.2 營收時序

| 階段 | 時間 | 營收來源 |
|------|------|----------|
| 早期 | Year 1 | BYOK 免費 + Pro 訂閱 ($12-20/月) 提供內建 AI + 同步 + 無限 Skills |
| 成長期 | Year 2 | 外掛商城抽成 (30%) + Team Plan ($25/人/月) + Skill 範本商城 |
| 成熟期 | Year 3+ | 企業授權 (B2B Agent Matrix) + 資料分析附加服務 |

### 11.3 GTM 策略

1. **殺手級範本 (Killer Templates)：** 針對技術人員提供「技術決策追蹤器」「Postmortem 分析器」「專案回溯分析器」等開箱即用 Skill 範本，創造 Day 1 的 Aha Moment。
2. **開發者社群優先：** 開源 SDK，在 GitHub、Hacker News、Reddit/r/PKM 建立聲量。
3. **內容行銷：** 產出「從 Notion 遷移到 Life Console」「我如何用 AI 管理 10 個 Side Project」等深度文章。
4. **Personal Skills 展示（v1.1）：** 以「唯一一個會學習你怎麼思考的知識系統」為核心行銷訊息，用 before/after 影片展示 Day 1 vs Day 30 的 AI 輸出品質差異。
5. **Vibe Coding 共創：** 舉辦外掛創作比賽，獎勵最佳社群外掛。

---

## 12. 產品護城河分析

| 護城河 | 說明 | 強度 | 風險 |
|--------|------|------|------|
| **認知模型不可遷移性（v1.1 新增）** | **Personal Skills 深度耦合 AI 引擎與 Schema 結構，使用者的認知模式無法在其他平台復現相同效果** | **高** | **需避免使用者感覺被「綁架」→ 允許匯出 Skill 定義（JSON），但效果僅在本平台最佳** |
| 脈絡資料引力 | 累積越多個人決策/習慣資料，AI 品質越高 | 高 | 使用者對「資料鎖定」敏感 → 需提供完善匯出 |
| 工具生態鎖定 | 專為 Life Console Schema 打造的外掛無法移植 | 中 | 生態規模不足時反成劣勢 |
| 規格定義者優勢 | Plugin Spec 成為事實標準 → 網路效應 | 中（需達臨界量） | 競品可能推出相容 Spec |
| 學習曲線投資 | 使用者投入時間理解系統後不願遷移 | 低~中 | 對新用戶是門檻 |

**護城河策略：** 護城河建立在「AI 理解你的方式無法帶走」（Personal Skills、偏好模型、行為圖譜），而非「資料本身無法帶走」。系統必須支援完整的資料匯出（JSON / Markdown）與 Skill 定義匯出，以消除早期採用者的鎖定疑慮。使用者帶走的是資料和 Skill 定義，但帶不走的是 Skill 在本平台累積的 few-shot examples 與 AI 引擎的最佳化效果。

---

## 13. 風險登記簿 (Risk Register)

| ID | 風險 | 嚴重度 | 可能性 | 緩解策略 |
|----|------|--------|--------|----------|
| R1 | Schema 推斷準確度不足，導致 AI 推薦品質低落 | 高 | 高 | 優先驗證：用真實資料做 10-20 人封閉測試；漸進式結構化允許手動覆寫；v1.1 新增完整錯誤處理流程（§4.1.4） |
| R2 | 冷啟動匯入品質差，低品質資料淹沒初始圖譜 | 高 | 中 | 匯入品質分級器 (A/B/C)；僅 A 級資料建立 Object，C 級僅保留 embedding；v1.1 新增預建 Skill 範本緩解 |
| R3 | 本地 SQLite + 向量引擎在大規模資料下效能瓶頸 | 中 | 中 | 分層索引（熱/冷資料）；歸檔資料做摘要壓縮 |
| R4 | AI 自動化引發使用者信任崩塌（錯誤分類/錯誤刪除） | 高 | 中 | 主動遺忘 → 改為「歸檔建議」；所有自動操作需使用者確認 |
| R5 | 氛圍編程生成的外掛存在安全漏洞 | 高 | 高 | 內部氛圍採 JSON 藍圖模式（無程式碼）；外部外掛在嚴格沙盒內執行 |
| R6 | LLM API 成本過高 / 價格波動影響商業模式 | 中 | 中 | BYOK 模式分攤成本；本地模型處理簡單任務；Token Budgeter 控制用量 |
| R7 | 外掛生態冷啟動，缺乏足夠第三方開發者 | 中 | 高 | 官方提供 10+ 高品質內建範本；Skill 文件降低開發門檻；外掛比賽激勵 |
| R8 | 競品（Notion AI / Tana）快速跟進類似功能 | 中 | 高 | 以 Local-first + 可解釋性 + Personal Skills 的組合優勢拉開差距 |
| R9 | 隱私法規（GDPR / 個資法）限制 AI 處理範圍 | 中 | 中 | Local-first 架構天然合規；雲端呼叫採 PII 遮罩；提供完整資料刪除功能 |
| **R10** | **Personal Skill 品質退化迴圈：錯誤模式被編碼進 Skill，影響未來所有輸出** | **高** | **中** | **Skill 版本控制 + 一鍵回溯；滿意度下降自動觸發回顧提醒；使用者可隨時重置 Skill 至任意歷史版本** |
| **R11** | **Personal Skill 的「詭異谷」效應：AI 表現太懂使用者導致不安** | **中** | **中** | **所有 Skill 啟用皆有可見標記（§7.4）；使用者可隨時查看 Skill 學了什麼；提供「暫停 Skill」選項** |
| **R12** | **Skill 衝突導致 AI 輸出不一致** | **中** | **高** | **Skill 優先級解析器（§7.5.4）；衝突時詢問使用者；限制同時啟用的 Skill 數量** |

---

## 14. 競品定位圖譜

```
                    高結構化
                       │
           Tana ●      │      ● Life Console (目標)
                       │
    Anytype ●          │
                       │
  ─────────────────────┼──────────────────── 高 AI 自動化
                       │
         Obsidian ●    │          ● Mem.ai
                       │
          Logseq ●     │     ● Reflect
                       │
                    低結構化
```

| 競品 | 結構化程度 | AI 深度 | 本地優先 | Personal Skills | 主動代理 |
|------|-----------|---------|---------|----------------|---------|
| Notion | 高 | 中 | ❌ | ❌ | ❌ |
| Tana | 極高 | 中高 | ❌ | ❌ | 部分 |
| Obsidian | 低 | 低 (靠外掛) | ✅ | ❌ | ❌ |
| Anytype | 高 | 低 | ✅ | ❌ | ❌ |
| Mem.ai | 低 | 中高 | ❌ | ❌ | 部分 |
| Reflect | 低 | 中 | ❌ | ❌ | ❌ |
| Heptabase | 中 | 低 | 部分 | ❌ | ❌ |
| **Life Console** | **高** | **高** | **✅** | **✅** | **✅** |

**v1.1 更新：** 競品比較表將「氛圍編程」欄位替換為「Personal Skills」，更準確反映核心差異化。目前市場上無競品提供結構化的個人認知模式學習功能。

---

## 15. 開發路線圖 (Roadmap)

### Phase 0 — 核心驗證 (Month 1-3)

- [ ] 定義並實作 AI-Native Schema (ObjectType + Properties)
- [ ] 本地 SQLite + 向量引擎 (sqlite-vss) 原型
- [ ] Schema 推斷準確度測試（10-20 人封閉測試）
- [ ] **Schema 推斷錯誤處理流程驗證（v1.1）**
- [ ] 極簡 CLI / Web 介面用於測試資料匯入與查詢
- [ ] 技術決策：確認 Tauri vs Electron

### Phase 1 — MVP Desktop App (Month 4-7)

- [ ] Tauri 桌面外殼 + 三層 UI 骨架 (Spaces / 面板 / 搜尋+時間軸)
- [ ] 基礎 Plugin SDK + 3 個官方範本外掛
- [ ] LLM Gateway (BYOK 模式)
- [ ] Event Bus 基礎實作
- [ ] MCP 整合：本地檔案系統 + Google Calendar
- [ ] AI 動態面板 v1（基於規則，非完全 AI 生成）
- [ ] **可解釋性 UI 基礎框架（所有 AI 輸出附帶「為什麼」入口）（v1.1）**
- [ ] **Personal Skills Phase 1：隱式學習 + 系統主動提煉（v1.1）**
- [ ] **預建 Skill 範本 5 個（工程師會議摘要、Bug Triage 等）（v1.1）**
- [ ] **Skill Library UI 基礎版（v1.1）**

### Phase 2 — AI 代理上線 (Month 8-12)

- [ ] 多層次記憶框架實作
- [ ] 主動推薦 v1（知識關聯、缺口偵測）
- [ ] 內部氛圍編程（JSON 藍圖模式）
- [ ] MCP 整合：Notion / Slack / Email
- [ ] 冷啟動匯入流程 + 品質分級器
- [ ] 可解釋性 UI 完整版（推理溯源面板）
- [ ] **Personal Skills Phase 2：顯式建立 + Skill 自動進化（v1.1）**
- [ ] **Skill 衝突解析器（v1.1）**
- [ ] **Skill 版本控制 + 回溯機制（v1.1）**

### Phase 3 — 生態擴張 (Month 13-18)

- [ ] 外掛商城 v1
- [ ] 跨設備同步 (Pro feature)
- [ ] 完整 Skill-Guided 外掛開發文件
- [ ] 外掛比賽 / 社群營運
- [ ] 引入知識圖譜層（Relations 表 + 圖譜遍歷）
- [ ] Vibe Ops 自我修復機制
- [ ] **Skill 範本商城 / 社群 Skill 分享（v1.1）**

### Phase 4 — 企業與進階 (Month 18+)

- [ ] Team Plan / 共享知識圖譜
- [ ] 完整 Hybrid GraphRAG
- [ ] 本地輕量模型整合 (Ollama / llama.cpp)
- [ ] B2B 企業授權模式探索
- [ ] 行動端輕量伴侶 App (捕捉 + 檢視)
- [ ] **團隊 Skill 共享與繼承（v1.1）**

---

## 16. 待決議事項 (Open Questions)

| ID | 問題 | 影響範圍 | 狀態 |
|----|------|----------|------|
| Q1 | Tauri vs Electron 最終選擇？需評估 Tauri 對 WebView 渲染的限制 | 整體架構 | 🔴 待決 |
| Q2 | 向量引擎選型：sqlite-vss vs hnswlib vs LanceDB？ | L1 效能 | 🔴 待決 |
| Q3 | 本地輕量模型選型：用於 Schema 推斷的最佳模型與量化方案？ | Schema 品質 | 🔴 待決 |
| Q4 | Object 的 RichText 格式標準？自定義格式 vs 相容 Markdown 子集？ | 資料相容性 | 🟡 討論中 |
| Q5 | 外掛 UI 渲染方式：iframe 隔離 vs Shadow DOM vs 直接掛載？ | 安全 vs 效能 | 🔴 待決 |
| Q6 | 初始 ObjectType 清單是否足夠？需要更多領域特定 Type 嗎？ | Schema 設計 | 🟡 討論中 |
| Q7 | BYOK 模式下，如何處理使用者的 API Key 安全儲存？ | 安全 | 🔴 待決 |
| Q8 | 資料匯出格式標準？JSON + Markdown 雙格式？ | 使用者信任 | 🟡 討論中 |
| Q9 | 第一個目標場景要收窄到什麼程度？ | 產品策略 | 🟢 **v1.1 已決：收窄至技術專案管理（晨間簡報 + Task 提取 + 專案回溯）** |
| Q10 | 是否需要行動端 App？還是 Phase 4 再考慮？ | 產品範圍 | 🟡 討論中 |
| **Q11** | **Personal Skill 隱式學習的觸發閾值？3 次同類行為是否合適？太靈敏會騷擾、太遲鈍會感覺不到學習** | **Skill 體驗** | **🔴 待決** |
| **Q12** | **Free 方案的 Skill 數量限制（≤5）是否合理？太少會限制價值感知、太多會削弱付費轉換** | **商業模式** | **🔴 待決** |

---

> **下一步行動：** 從 Phase 0 開始，同步驗證 (1) Schema 推斷準確度（R1）與 (2) Personal Skills 隱式學習的使用者接受度（Q11），以最小成本確認兩個核心假設。MVP 場景聚焦技術專案管理三件事：晨間簡報、自動 Task 提取、專案回溯分析。
