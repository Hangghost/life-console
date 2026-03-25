# Life Console — 競品分析與開發戰略總覽

> **日期：** 2026-03-25
> **版本：** v1.0（整合版）
> **基於：** 產品架構文件 v1.1、MVP Spec v0.2、Obsidian 2026 最新動態、SaaS AI Agent 時代路徑圖
> **涵蓋範圍：** 競品分析（vs Obsidian）→ 優劣勢矩陣 → 開發路徑計畫 → 行銷戰略 → 關鍵決策點

---

## 目錄

1. [競品分析：Life Console vs Obsidian](#1-競品分析life-console-vs-obsidian)
2. [優勢矩陣：放大這些點](#2-優勢矩陣放大這些點)
3. [劣勢矩陣：守住或迴避](#3-劣勢矩陣守住或迴避)
4. [開發路徑戰略計畫（16 週）](#4-開發路徑戰略計畫16-週)
5. [行銷戰略計畫](#5-行銷戰略計畫)
6. [關鍵決策點時間表](#6-關鍵決策點時間表)
7. [核心原則摘要](#7-核心原則摘要)

---

## 1. 競品分析：Life Console vs Obsidian

### 1.1 定位對比：根本上不同的產品哲學

| 維度 | Obsidian | Life Console (MVP) |
|------|----------|-------------------|
| **核心隱喻** | 本地 Markdown 知識庫 + 外掛生態 | 任務指揮中心 + 工具載入器 |
| **資料單位** | 檔案（.md 文件） | Object（結構化物件） |
| **組織方式** | 使用者手動（資料夾 + 標籤 + 雙向連結） | AI 自動推斷 + 使用者確認 |
| **AI 角色** | 附加層（透過外掛接入） | 內建核心（Inbox 推斷、排程建議） |
| **使用者心態** | 「我來整理我的知識」 | 「系統幫我整理，我確認就好」 |

**關鍵洞察：** Obsidian 的哲學是「給你最強大的工具，你自己組裝」；Life Console 的哲學是「系統先幫你做好，你來修正」。這不是功能多寡的差異，而是對「誰承擔認知負擔」的根本分歧。

### 1.2 Obsidian 2026 年的競爭力盤點

#### 核心優勢

**生態系統規模：** 2,700+ 社群外掛，150 萬用戶，22% 年增長。這是 Life Console 短期內不可能追上的護城河。

**Bases 功能（v1.9+）：** Obsidian 在 2025 年推出的 Bases 核心外掛，讓 Markdown 筆記可以用類似 Notion 資料庫的方式呈現（表格、卡片視圖）。資料來源是 YAML frontmatter 屬性。這代表 Obsidian 正在往「結構化資料」方向補強，但方式是讓使用者手動在 frontmatter 定義屬性，而非 AI 自動推斷。

**AI Agent 整合（Obsidian Skills）：** CEO Steph Ango 親自推出的官方 Agent Skills（13.9k+ GitHub stars），讓 Claude Code 等 AI Agent 能原生操作 Obsidian vault——建立筆記、管理 Bases 資料庫、繪製 Canvas 白板。AI 仍然是外部工具，不是內建能力。

**CLI 工具（2026 年初）：** 新推出的命令列介面讓自動化和外部工具整合更方便。

**MCP 整合：** 社群已有多個 MCP Server 可以讓 AI 讀寫 Obsidian vault，形成「Obsidian 作為 AI 知識底座」的使用模式。

#### 結構性弱點

**AI 是「外接」而非「內建」：** 所有 AI 能力都依賴外掛（Smart Connections、Copilot、Nova 等），沒有統一的 AI 架構。不同外掛之間不共享上下文，使用者需要自己選擇、配置、維護多個 AI 外掛。

**結構化的負擔在使用者身上：** Bases 雖然強大，但使用者需要手動維護 YAML frontmatter 屬性。沒有 AI 自動推斷型別、自動提取屬性的能力。要讓 Bases 好用，使用者必須從 Day 1 就嚴格遵守 frontmatter 規範。

**缺乏主動性：** Obsidian 不會主動告訴你「今天應該做什麼」「這個任務快到期了」。它是一個被動的知識容器，依賴使用者主動搜尋、主動組織。

**任務管理是拼裝的：** 雖然有 Tasks 外掛、Kanban 外掛等，但任務管理不是 Obsidian 的核心能力。deadline 排序、優先級加權、每日容量估算等功能需要使用者自己用外掛和 Dataview 拼出來。

### 1.3 差異化對比

#### MVP 階段就能拉開差距的點

| 差異化能力 | Life Console 做法 | Obsidian 對應方案 | 差距大小 |
|-----------|------------------|-------------------|---------|
| **Inbox AI 推斷** | 輸入任何文字 → Claude API 自動判斷 task/note → 提取屬性 → 一鍵確認 | 無。使用者需手動選擇筆記類型、手動填 frontmatter | **大** |
| **Today View 排程** | 自動加權排序（urgency + priority + staleness），顯示每日預估總耗時 | 需要 Tasks + Dataview + 手動配置才能拼出類似效果 | **大** |
| **工具輸出自動沉澱** | Workflow Plugin 執行完自動建 Object + relation | 需要手動把工具輸出貼進筆記 | **中** |
| **統一 Object Model** | 所有資料都是 Object，結構一致，跨類型可關聯 | 每個 .md 檔案格式自由，結構化程度取決於使用者紀律 | **中** |
| **修正行為記錄** | `ai_metadata.user_corrections` 自動記錄，為未來 Personal Skills 預留 | 無對應機制 | **中** |

#### MVP 階段 Obsidian 仍然更強的點

| 能力 | Obsidian 優勢 | Life Console 現狀 |
|------|-------------|------------------|
| **筆記編輯體驗** | 成熟的 Markdown 編輯器、雙向連結、Graph View | MVP 只有基本的 content 欄位 |
| **外掛生態** | 2,700+ 外掛，幾乎任何需求都有 | 只有 2 個自有工具（PhotoSift、LearningHacker） |
| **知識圖譜視覺化** | Graph View 是殺手功能 | MVP 不做圖譜 |
| **社群與內容** | 龐大的教學、模板、工作流分享社群 | 零 |
| **行動端** | Mobile 2.0 + Siri 整合 + 原生小工具 | MVP 不做行動端 |
| **跨裝置同步** | Obsidian Sync 或第三方方案 | MVP 不做 |

### 1.4 戰略定位分析

#### 不應該正面競爭的領域

**知識管理 / PKM：** 這是 Obsidian 的主場。Life Console MVP 正確地避開了這個戰場，將定位從「AI 第二大腦」轉向「任務指揮中心 + 工具載入器」。如果 Life Console 試圖在知識管理上與 Obsidian 競爭，需要追趕的差距（編輯器、外掛生態、社群）幾乎不可能在早期彌補。

**外掛數量：** Life Console 的外掛生態不可能在短期內與 Obsidian 競爭。但 Life Console 外掛的差異化在於「自動回寫 Object」機制——工具的輸出自然流入知識庫，這是 Obsidian 外掛做不到的。

#### 應該強力攻佔的領域

**「事情太多太雜」的日常痛點：** Obsidian 使用者的典型抱怨是「我花在整理筆記的時間比寫筆記還多」「Obsidian 很強但設定太複雜」。Life Console 的 Inbox + Today View 直接解決這個痛點，而且不需要使用者學習任何配置。

**AI 原生體驗：** Obsidian 的 AI 是「後天接上去的」——需要安裝外掛、配置 API key、選擇模型、理解 RAG 原理。Life Console 的 AI 是「生下來就有的」——輸入文字就自動分類，打開就看到今日排程。

**工具整合的「零摩擦」：** Life Console 的 Workflow Plugin 機制讓工具的輸入和輸出都自動結構化。在 Obsidian 中，使用者需要手動把外部工具的結果複製貼上到筆記裡。

#### 潛在的互補/共存關係

Life Console 和 Obsidian 不一定是純競爭關係。一個可能的使用場景是：使用者用 Obsidian 做深度知識管理（寫長文、研究、雙向連結），用 Life Console 做日常任務管理和工具自動化。Phase 2+ 的 MCP 整合甚至可以讓 Life Console 讀取 Obsidian vault 的內容。

### 1.5 來自 Obsidian 生態演進的風險

| 風險 | 可能性 | 影響 | 應對 |
|------|--------|------|------|
| Obsidian 推出官方 AI 功能（自動分類、排程建議） | 中 | 高 | Obsidian 的哲學一直是「核心精簡、外掛擴展」，官方很少做 AI。但 Bases + Skills 的方向顯示他們在往結構化 + AI 靠攏 |
| 社群外掛組合出類似 Life Console 的體驗 | 高 | 中 | 外掛拼裝的體驗碎片化、維護成本高、無統一 Object Model。但對於技術能力強的使用者，這可能已經「夠用」 |
| Obsidian Skills 讓 Claude Code 等 Agent 直接在 vault 中做任務管理 | 中高 | 高 | 這是最大威脅。如果使用者透過 Claude Code + Obsidian Skills 就能實現「AI 自動建立任務、排序優先級」，Life Console 的差異化會被壓縮 |

### 1.6 Life Console 的獨特機會

**Obsidian 使用者的「配置疲勞」：** 大量 Obsidian 使用者抱怨花太多時間在配置外掛、設計工作流上。Life Console 的「零配置、AI 先做、你來確認」哲學對這群人有吸引力。

**non-Obsidian 使用者：** 很多人嘗試 Obsidian 後因為學習曲線放棄了。Life Console 的目標用戶不一定是從 Obsidian 搶過來的，而是那些「知道自己需要管理工具但覺得 Obsidian 太複雜」的人。

**Personal Skills（Phase 2）的長期護城河：** 這是 Obsidian 生態目前完全沒有的能力。系統從使用者的修正行為中學習認知模式，並將其結構化為可複用的 Skill——這不是外掛能簡單實現的，因為它需要統一的 Object Model 和 ai_metadata 架構作為基礎。Life Console 在 MVP 就透過 `user_corrections` 預埋了這個能力的種子資料。

---

## 2. 優勢矩陣：放大這些點

### 優勢 1：「零配置結構化」的體驗斷層

**你有什麼：** Inbox 輸入任何文字 → Claude API 非同步推斷 type + 屬性 → 一鍵確認。使用者從未被要求「先選類型再填欄位」。

**為什麼是優勢：** 這不是漸進式改善，而是體驗上的斷層式跳躍。Obsidian 的 Bases 需要使用者手動在 YAML frontmatter 定義屬性，Notion 需要你先建好資料庫 Schema。Life Console 的做法是「你隨便寫，我幫你歸類」——這對目標用戶（事情多又雜的技術人）是直接解決痛點。

**如何放大：**

- 把 Inbox 推斷做成產品 Demo 的第一個畫面。使用者貼進一段雜亂的會議紀錄或 Slack 訊息，2 秒後看到 AI 把它拆成 3 個 Task + 1 個 Decision——這個「魔法時刻」要讓人在 15 秒內感受到。
- 確保推斷準確率在封閉測試中達到 80%+ 才上線。推斷不準會直接摧毀這個優勢。寧可只分 task/note 兩類（高準確），不要分五種類型（低準確）。
- `ai_metadata.user_corrections` 的記錄機制已經預留。在 MVP 階段就在 UI 上加一個微小但可見的計數器：「系統已從你的 47 次修正中學習」——即使 Phase 2 才做 Personal Skills，這個計數器提前建立預期。

### 優勢 2：Today View 的「有限承諾」設計

**你有什麼：** 規則加權排序（urgency + priority + staleness），顯示每日預估總耗時，預留 AI reranker 介入點。

**為什麼是優勢：** MVP 選擇規則排序而非 AI 排序是一個正確但容易被低估的決策。原因有三：第一，MVP 階段缺乏行為歷史讓 AI 排得比規則好；第二，規則排序可預測、可解釋，有利於早期信任建立；第三，「規則排序 + 預留 AI 介入點」的架構讓你在 Phase 2 有明確的升級故事可以講。

**如何放大：**

- Today View 的核心價值不是「排得最完美」，而是「每天早上打開就知道先做什麼」。行銷訊息不要說「AI 幫你排程」（MVP 還沒做到），要說「打開就看到今天該做的事，按重要程度排好」。
- 「預估總耗時」功能要做得很醒目。當累計超過 8 小時，用視覺化提示告訴使用者「今天可能做不完」——這是 Obsidian + Tasks 外掛做不到的體驗，因為 Obsidian 的任務管理沒有統一的 estimated_minutes 欄位。
- Phase 2 升級時，講一個清楚的故事：「你用了三個月，系統已經知道你週一上午產能最高、週五下午最低，現在 Today View 會根據你的節奏重新排列」。

### 優勢 3：工具輸出自動沉澱——「知識庫是副產品」

**你有什麼：** Workflow Plugin 的 `output.auto_create_object` + `output_mapping` 機制，工具執行完自動建 Note Object + relation 追溯到 workflow_run。

**為什麼是優勢：** 這是 MVP 策略「先做工具平台，讓知識庫自然長出來」的技術實現。使用者不需要「刻意整理」，每次用 LearningHacker 看完一個影片，學習筆記就自動進入系統、自動加上 tags、自動可搜尋。三個月後使用者會發現自己不知不覺累積了一個結構化的知識庫。

**如何放大：**

- 在 LearningHacker 之外，盡快再做 2-3 個 Workflow Plugin 來豐富「自動沉澱」的場景。例如：一個把 GitHub PR description 整理成技術決策紀錄的工具、一個把瀏覽器書籤批量匯入並自動分類的工具。每多一個工具，知識庫的自然增長速度就快一分。
- UI 上要有一個「知識庫成長儀表板」：這個月你的系統自動累積了 23 則筆記、47 個任務。讓使用者感受到「我不需要做任何額外的事，系統自己在長大」。
- 這個機制在行銷上可以對比 Obsidian：「Obsidian 需要你把工具的輸出手動貼進筆記。Life Console 的工具做完事就自動記錄，你只需要在想找的時候搜尋。」

### 優勢 4：Object Model 的架構前瞻性

**你有什麼：** 統一的 Object Model（4 個 type、JSON properties、relations 表）、ai_metadata 預留種子資料、embeddings 表預留。

**為什麼是優勢：** 這是「Schema 要想清楚，程式碼可以隨便改」原則的落地。Obsidian 的底層是檔案系統 + Markdown，任何結構化改進都受限於 YAML frontmatter 的天花板。Life Console 從 Day 1 就是物件導向的結構化資料庫，未來加新 type、加向量搜尋、加 GraphRAG 都是在已有架構上擴展，不需要底層重構。

**如何放大：**

- 現在不需要對外強調架構優勢（使用者不關心你的資料庫設計），但在開發者社群和技術 blog 中可以深入討論。標題例如：「為什麼我不用 Markdown 文件而用 SQLite Object Model 來建知識系統」——這類文章在 Hacker News 上容易引起討論。
- 確保 JSON properties 的 Schema 穩定。一旦有外部使用者的真實資料，遷移成本極高。建議在 MVP 上線前做一輪「Schema stress test」：拿 100 條真實輸入（會議紀錄、Slack 訊息、Email、隨手記事），跑一遍 Inbox 推斷流程，看 properties 格式是否需要調整。

---

## 3. 劣勢矩陣：守住或迴避

### 劣勢 1：外掛生態的冷啟動（風險：高）

**問題：** MVP 只有 PhotoSift（快捷啟動）和 LearningHacker（Workflow Plugin）。Obsidian 有 2,700+ 外掛。工具平台沒有工具就是空殼。這是 MVP 策略的最大矛盾——定位是「工具載入器」，但工具只有兩個。

**防守策略：**

- **不要試圖追數量，聚焦「殺手工具鏈」。** 找出目標用戶（技術人）每天重複做的 3-5 件事，為它們各做一個 Workflow Plugin。建議優先級：(1) GitHub Issue/PR 摘要器 (2) 瀏覽器書籤批量匯入 (3) 會議錄音轉紀錄 (4) RSS/Newsletter 閱讀摘要。
- **降低外掛開發門檻。** Workflow Plugin 的 `run(input, context)` 介面已經夠簡單，但還需要一個 5 分鐘的 quickstart 教學和一個 `create-life-console-plugin` CLI scaffolding 工具。如果你的目標用戶是技術人，他們可能願意自己寫外掛——但前提是開發體驗極好。
- **自己的工具自己先用。** 在公開發佈前，自己用 Life Console 管理 Life Console 的開發專案。用 Inbox 收集需求、用 Today View 排開發任務、用 LearningHacker 學習技術文件。這會幫你發現大量體驗問題，也產出真實的使用案例。

### 劣勢 2：筆記編輯體驗的天花板（風險：中）

**問題：** MVP 的 content 欄位是純 Markdown 文字，沒有雙向連結、沒有富文本編輯器、沒有 Graph View。對於習慣 Obsidian 編輯體驗的用戶，Life Console 的筆記功能會感覺像退步。

**防守策略：**

- **MVP 不要在編輯器上花時間。** Note 的 content 就是純 Markdown，搜尋就是全文搜尋。把精力省下來放在 Inbox 推斷和工具系統上。
- **明確告訴使用者這不是 Obsidian 替代品。** 初期的 onboarding 訊息可以說：「Life Console 幫你管理行動和工具，深度寫作推薦搭配你喜歡的編輯器。」
- **Phase 2 考慮整合 Obsidian vault。** 透過 MCP 讓 Life Console 讀取 Obsidian 筆記，形成互補關係。這同時也是一個拉攏 Obsidian 社群的行銷策略。

### 劣勢 3：行動端缺席（風險：中）

**問題：** MVP 不做行動端。Obsidian Mobile 2.0 已經有原生小工具、Siri 整合、Share Extension。對於「隨時隨地快速記錄想法」的場景，Life Console 完全缺席。

**防守策略：**

- **Phase 2 之前不碰行動端。** 這個決策是正確的，堅持住。
- **但要有一個「捕捉入口」的替代方案。** 考慮做一個極簡的 Telegram Bot 或 Shortcuts/快捷指令整合：使用者在手機上快速輸入一段文字 → 發到 Telegram Bot → 自動進入 Life Console 的 Inbox。開發成本極低，但解決了「行動端捕捉」的核心需求。
- **如果做行動端，做「唯讀 + 快速捕捉」就好。** 不做編輯，不做工具區，只做 Today View（看今天該做什麼）+ Inbox 輸入（快速記錄）。

### 劣勢 4：AI 推斷的成本與延遲（風險：中低）

**問題：** 每次 Inbox 輸入都呼叫 Claude API。即使是 BYOK 模式，頻繁使用者的 API 成本可能累積，而且 1-2 秒的推斷延遲在快速輸入場景下會被感知。

**防守策略：**

- **非同步推斷是正確的（已決議）。** 先存 inbox_item、背景推斷、結果回來後浮現確認。使用者不需要等。
- **批量推斷優化。** 如果使用者連續快速輸入 5 條，不要發 5 次 API 呼叫。合併為一次呼叫，一次推斷 5 條的類型和屬性。
- **Phase 2 考慮本地輕量模型。** task vs note 的二分類其實不需要 Claude 等級的模型。一個 fine-tuned 的小模型（甚至 regex + 關鍵字規則作為第一層篩選）可以處理 70% 的明確情況，只把模糊的 30% 送到雲端。
- **在設定頁面顯示 API 用量統計。** 讓使用者知道「本月 Life Console 使用了你的 Claude API 0.3 美元」。透明度建立信任。

### 劣勢 5：單人開發的速度瓶頸（風險：高）

**問題：** 獨立或小團隊開發，面對的卻是 Obsidian（成熟公司 + 數千社群開發者）的生態。

**防守策略：**

- **極度聚焦。** MVP 的範圍邊界已經很好，但執行時仍要抵抗 feature creep。每週問自己：「這個功能是在強化 Inbox + Today View + Toolbox 三件事嗎？不是就不做。」
- **用 AI 開發工具 (Cursor/Claude Code) 把自己的生產力拉到 3-5 倍。** 特別是 UI 開發——Inbox 確認提示、Today View 卡片、工具區面板這些前端元件，用 AI 可以快速產出。
- **不要自建不必要的基礎設施。** SQLite 作為資料庫（正確）、Claude API 作為 AI（正確）、Electron 作為桌面框架（正確）。不要在 MVP 階段自建事件系統、權限引擎或同步機制。

---

## 4. 開發路徑戰略計畫（16 週）

### Phase 0：核心驗證（第 1-4 週）

**目標：驗證 Inbox 推斷的可用性和 Object Model 的穩定性。**

| 週次 | 開發重點 | 驗證指標 |
|------|---------|---------|
| 1 | SQLite Object Model CRUD + Inbox 推斷 Prompt 設計 | 100 條真實輸入的推斷準確率 ≥ 80% |
| 2 | 推斷確認 UI + ai_metadata 記錄 + 手動修正流程 | 修正流程 < 2 次點擊完成 |
| 3 | Today View 排序引擎 + 基本 Task CRUD | 排序結果在 10 筆任務上符合直覺 |
| 4 | 全文搜尋 + 最簡可用的整體 UI 骨架 | 自己能用它管理 Life Console 的開發任務 |

**關鍵原則：** 第 4 週結束時，你自己必須開始「吃自己的狗糧」。如果你自己不想用它管理自己的開發任務，使用者也不會想用。

### Phase 1：工具系統 + 第一批使用者（第 5-10 週）

**目標：Workflow Plugin SDK 上線 + LearningHacker 改造 + 找到 10 個封測用戶。**

| 週次 | 開發重點 | 驗證指標 |
|------|---------|---------|
| 5-6 | WorkflowContext 介面實作（llm / tools / store 三類 API） | LearningHacker 能在 SDK 上跑通 |
| 7-8 | LearningHacker 改造 + manifest 載入流程 + 自動生成輸入表單 | 從輸入 URL → 自動建 Note Object 的端到端流程 |
| 9 | PhotoSift 快捷啟動 + 工具區 UI | 工具區有至少 2 張卡片 |
| 10 | Bug 修復 + 體驗打磨 + 邀請封測 | 找到 10 個願意每天用的封測用戶 |

**找封測用戶的策略：** 不要廣撒網，精準找 5-10 個符合你目標畫像的人。理想畫像：軟體工程師或技術主管、同時管理 3+ 個專案、已經嘗試過 Obsidian/Notion 但覺得「花太多時間整理」。在 Twitter/X、開發者 Discord、或你自己的人脈中找。給他們 1:1 的 onboarding，觀察他們的使用行為。

### Phase 2：Personal Skills 種子 + 第二波工具（第 11-16 週）

**目標：開始兌現「越用越懂你」的承諾，擴充工具生態。**

| 週次 | 開發重點 | 驗證指標 |
|------|---------|---------|
| 11-12 | 分析封測用戶的 user_corrections 資料，設計 Personal Skills Phase 1 的隱式學習邏輯 | 能從修正資料中識別出至少 3 種行為模式 |
| 13-14 | 再開發 2-3 個 Workflow Plugin（GitHub 摘要器、書籤匯入、RSS 閱讀器） | 工具區有 5+ 張卡片 |
| 15-16 | MCP 整合第一步：Google Calendar 讀取 → 影響 Today View 排序 | 「今天有 3 小時的會議，可用時間只有 5 小時」的提示出現 |

---

## 5. 行銷戰略計畫

### 5.1 定位語言：不是取代 Obsidian，是解決 Obsidian 解決不了的問題

**核心訊息框架：**

| 層級 | 訊息 | 使用場景 |
|------|------|---------|
| 一句話版本 | 「別花時間整理，打開就知道今天該做什麼。」 | Twitter bio、Product Hunt tagline |
| 電梯演說 | 「Life Console 是給技術人的任務指揮中心。你只要把事情丟進來，AI 自動分類、自動排程、工具做完自動記錄。不需要學配置、不需要手動整理。」 | Landing page hero、Demo 開場 |
| 深度版本 | 「我們不是另一個筆記工具。Obsidian 管知識，Notion 管協作，Life Console 管行動。你的工具輸出自動變成可搜尋的知識，不需要多做任何事。」 | Blog 文章、社群回覆 |

**絕對不要說的話：**

- 「取代 Obsidian」「比 Notion 更好」——會引發社群敵意，而且不是事實
- 「AI 第二大腦」——市場已經對這個詞免疫了
- 「作業系統」「OS for life」——過度承諾

### 5.2 內容行銷時間表

**Month 1-2（產品尚未公開）：建立個人品牌**

用「Building in Public」模式，每週發 2-3 篇開發日誌：

- 「為什麼我放棄用 Obsidian 管理我的 Side Projects（以及我在做什麼替代方案）」——這篇不是攻擊 Obsidian，而是誠實描述「整理筆記太花時間」的痛點，自然帶出 Life Console 的想法。
- 「我如何設計一個讓 AI 自動分類的 Object Model」——技術深度文章，目標是 Hacker News / Reddit r/programming。
- 「Inbox Zero 的問題不是收件匣太多，是分類太累」——產品理念文章。

發佈渠道：個人 Blog + Twitter/X + Hacker News + Reddit r/SideProject

**Month 3-4（封測期）：展示真實使用場景**

- 封測用戶的使用案例故事（需用戶同意）
- 15 秒 GIF/短影片：「貼進一段 Slack 訊息 → 自動變成 3 個任務 → 出現在 Today View」
- 「我用 Life Console 管理 Life Console 的開發」——自己吃自己狗糧的紀錄

**Month 5+（公開上線）：擴大觸及**

- Product Hunt 發佈
- 「從 Todoist/TickTick 遷移到 Life Console」遷移指南（注意：對標任務管理工具，不是 Obsidian）
- Workflow Plugin 開發教學——吸引技術人自己寫工具
- 「Life Console + Obsidian：我如何同時用兩者」——共存策略文章，拉攏 Obsidian 社群而非對抗

### 5.3 社群策略

**目標社群優先級：**

| 社群 | 目的 | 行動 |
|------|------|------|
| Twitter/X 技術圈 | 品牌建立 + 早期使用者 | Building in Public、短影片 Demo |
| Hacker News | 爆發性曝光 | 技術深度文章（Object Model、AI 推斷設計） |
| Reddit r/SideProject | 獨立開發者同溫層 | 開發進度更新、互相支持 |
| Reddit r/productivity | 目標用戶密集 | 使用案例、與現有工具的對比 |
| Discord 開發者社群 | 封測用戶招募 + 外掛開發者 | 建立自己的 Discord server |

**不要急著進的社群：**

- Reddit r/ObsidianMD——除非你的文章是「Life Console + Obsidian 如何搭配使用」，否則在 Obsidian 社群推銷替代品只會引起反感。
- ProductHunt——等到產品有 10+ 個真實用戶和好看的 Demo 再上。太早上 PH 是浪費彈藥。

### 5.4 Landing Page 設計建議

**Above the fold（首屏）：**

- 標題：「別花時間整理，打開就知道今天該做什麼。」
- 副標題：「AI 自動分類你的任務和筆記，工具做完自動記錄。專為技術人打造。」
- CTA：「加入等待清單」
- GIF/影片：Inbox 推斷的 15 秒 Demo（文字輸入 → AI 推斷 → 一鍵確認）

**三個價值區塊：**

1. 「丟進來就好」——展示 Inbox 推斷
2. 「打開就知道先做什麼」——展示 Today View
3. 「工具做完，筆記自動長出來」——展示 Workflow Plugin → 自動建 Object

**信任建立：**

- 「你的資料 100% 在你的電腦上，用你自己的 AI API Key」——Local-first + BYOK 是對隱私敏感的技術人的殺手訊息
- 「完全可匯出：JSON + Markdown」——消除鎖定疑慮

---

## 6. 關鍵決策點時間表

這些是你在接下來 6 個月需要做出的重大決策，每一個都會影響產品方向：

| 時間點 | 決策 | 選項 | 建議 |
|--------|------|------|------|
| 第 4 週 | Schema 是否穩定？ | 保持現有 4 type vs 新增 type | 封測前必須 freeze，有真實資料後遷移成本極高 |
| 第 8 週 | Workflow SDK 是否足夠？ | 最小 API vs 擴充更多工具函數 | 先用 LearningHacker 端到端驗證，不足再加 |
| 第 10 週 | 封測回饋後的方向修正 | 強化 Inbox vs 強化 Today View vs 強化 Toolbox | 看使用者實際最常用哪個模組，資源往那邊傾斜 |
| 第 12 週 | 是否開始 Personal Skills | 立即開始 vs 等到用戶量更大 | 如果 user_corrections 資料夠多（100+ 筆），就開始 |
| 第 14 週 | 行動端的優先級 | Telegram Bot vs PWA vs 原生 App vs 繼續不做 | Telegram Bot 成本最低，先做這個測試需求 |
| 第 16 週 | 公開上線策略 | Product Hunt vs Hacker News vs 軟上線 | Hacker News 先（技術文章），PH 後（產品 Demo） |

---

## 7. 核心原則摘要

1. **Inbox 推斷是生死線。** 推斷不準，整個「零配置結構化」的故事就垮了。推斷準確率 80% 是最低門檻。
2. **吃自己的狗糧。** 從第 4 週起用 Life Console 管理 Life Console 開發。
3. **工具比筆記重要。** MVP 階段每新增一個好用的 Workflow Plugin，產品價值就增加一倍。筆記編輯器好不好用是 Phase 3 的事。
4. **跟 Obsidian 做朋友，不做敵人。** 所有外部溝通都定位為互補關係。
5. **記錄一切修正行為。** user_corrections 是你的護城河種子。即使 Phase 2 才做 Personal Skills，這些資料從 Day 1 就要累積。
6. **透明度建立信任。** API 用量、推斷信心分數、排序依據——所有 AI 行為都讓使用者看得到為什麼。
