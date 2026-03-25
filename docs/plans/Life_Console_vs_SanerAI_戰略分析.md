# Life Console vs Saner.AI — 競品分析與開發產品行銷戰略

> **日期：** 2026-03-25
> **基於：** 產品架構文件 v1.1、MVP Spec v0.2、Obsidian 競品分析、SaaS AI Agent 時代路徑圖、Saner.AI 公開資料

---

## 目錄

1. [產品定位對比](#1-產品定位對比)
2. [核心差異分析](#2-核心差異分析)
3. [Saner.AI 的優勢（Life Console 需注意）](#3-sanerai-的優勢life-console-需注意)
4. [Saner.AI 的弱點（Life Console 的機會）](#4-sanerai-的弱點life-console-的機會)
5. [劣勢分析：六個風險點與行動計畫](#5-劣勢分析六個風險點與行動計畫)
6. [優勢分析：六個差異點與放大策略](#6-優勢分析六個差異點與放大策略)
7. [開發戰略建議](#7-開發戰略建議)
8. [行銷戰略建議](#8-行銷戰略建議)
9. [關鍵決策建議摘要](#9-關鍵決策建議摘要)

---

## 1. 產品定位對比

| 維度 | Saner.AI | Life Console (MVP) |
|------|----------|-------------------|
| **核心定位** | ADHD 友善的 AI 生產力助理 | 任務指揮中心 + 工具載入器 |
| **目標族群** | 知識工作者（尤其 ADHD 族群），B2C 消費者市場 | 技術導向的專業知識工作者（工程師、技術主管） |
| **核心隱喻** | 你的 AI 個人助理（Jarvis） | 你的任務指揮中心 + 工具平台 |
| **資料架構** | 雲端優先，非結構化筆記 + AI 標籤 | Local-first，AI-Native Schema（結構化 Object Model） |
| **AI 角色** | 反應式助理（Skai：搜尋、摘要、回答） | 主動式代理（推斷分類、排程建議，未來 Personal Skills） |
| **使用者心態** | 「AI 幫我整理筆記和回答問題」 | 「系統幫我分類行動，工具做完自動記錄」 |

**關鍵洞察：** 兩者看似有重疊（都服務知識工作者），但切入角度完全不同。Saner.AI 是「更聰明的筆記 App + 通用 AI 助理」，Life Console 是「工具平台 + 任務管理 + 自動知識沉澱」。

---

## 2. 核心差異分析

### 2.1 架構哲學

Saner.AI 是雲端優先的 SaaS，資料存在他們的伺服器上，離線功能有限，大部分 AI 功能需要網路。Life Console 則是 Local-first，資料加密存在本地 SQLite，雲端只用來做 LLM 推理。這對隱私敏感的技術人是一個重要差異。

### 2.2 資料結構化程度

Saner.AI 用 AI 自動標籤和分類來組織筆記，但底層資料仍然是非結構化的筆記和文件。Life Console 從架構層就是 AI-Native Schema（Object Model），所有資料在進入系統時就被結構化為有型別的 Object——這是兩個產品最根本的差異。

### 2.3 AI 的角色

Saner.AI 的核心是 Skai 個人助理，主要做筆記組織、語意搜尋、和多 AI 模型整合（GPT-4, Claude, Gemini）。它的 AI 偏「反應式」——你問它問題，它從你的筆記中找答案。Life Console 的 AI 設計是「主動式代理」，未來會基於 Personal Skills 做習慣追蹤、預測推薦、自動執行。

### 2.4 整合策略

Saner.AI 已經整合了 Google Drive、Gmail、Slack、Google Calendar，還有 Chrome Extension 做即時捕捉。Life Console MVP 目前不做任何外部整合（MCP 排在 Phase 2），這是 Saner.AI 目前明顯的領先點。

### 2.5 工具平台 vs 筆記平台

這是最關鍵的定位差異。Saner.AI 本質上是一個「更聰明的筆記 App」，加上任務和行事曆整合。Life Console 的 MVP 定位是「工具載入平台」——外掛系統（Panel Plugin + Workflow Plugin）是核心，知識沉澱是工具使用的副產品。這個角度在市場上幾乎沒有直接競品。

---

## 3. Saner.AI 的優勢（Life Console 需注意）

| 優勢 | 說明 | 對 Life Console 的影響 |
|------|------|----------------------|
| **已上線且有真實用戶** | App Store / Google Play 都有產品，Product Hunt 拿過 Product of the Day | Life Console 尚未公開，需加速驗證 |
| **整合生態成熟** | Google Drive、Gmail、Slack、Calendar 整合已就緒，Chrome Extension 可即時捕捉 | MVP 沒有外部整合，使用者需手動輸入 |
| **低門檻** | 學習曲線極低，開箱即用，AI 自動組織 | Life Console 的 BYOK 模式對非技術人有門檻 |
| **定價親民** | 免費方案可用，付費只要 $8/月 | BYOK 模式有 API 帳單心理障礙 |
| **ADHD 品牌定位清晰** | 在擁擠市場裡找到明確利基 | Life Console 需要同樣清晰的品牌定位 |
| **多平台覆蓋** | Web + iOS + Android + Chrome Extension | MVP 只有桌面端 |

---

## 4. Saner.AI 的弱點（Life Console 的機會）

| 弱點 | 說明 | Life Console 的機會 |
|------|------|-------------------|
| **資料不在使用者手上** | 雲端架構，隱私風險 | Local-first 是對技術人的殺手優勢 |
| **結構化不夠深** | 自動標籤 ≠ 真正結構化，無法對「決策」「會議紀錄」做精確型別查詢 | AI-Native Schema 的 Object Model 是根本性差異 |
| **沒有外掛/工具平台** | 不提供 API，無法擴展自訂工具 | Plugin SDK 是市場上獨一無二的能力 |
| **AI 深度有限** | 主要是搜尋和摘要，無主動推理、知識圖譜、認知模式學習 | Personal Skills（Phase 2）將是明確超越點 |
| **用戶評價兩極** | 部分用戶反映 UI 不佳、AI 表現差、設定繁瑣、整合常失敗 | 體驗可靠性是可攻擊的弱點 |
| **無離線能力** | 離線功能有限，大部分 AI 功能需要網路 | Local-first 架構天然支持離線 |

---

## 5. 劣勢分析：六個風險點與行動計畫

### 劣勢 1：外掛生態的冷啟動（風險最高）

**問題：** MVP 定位是「工具載入器」，但上線時只有 LearningHacker + PhotoSift 兩個工具。Saner.AI 雖然不是工具平台，但它至少整合了 Gmail、Google Drive、Slack、Calendar，使用者第一天就有東西可用。工具區如果只有兩張卡片，會顯得很空。

**風險等級：** 高。這是 MVP 策略的最大矛盾。

**行動計畫：**

- Phase 1（第 5-10 週）必須再多做 2-3 個 Workflow Plugin。優先做「GitHub PR 摘要器」和「瀏覽器書籤匯入器」——開發成本低、目標用戶高度需要、能快速驗證 SDK 的通用性。
- 提供 `create-life-console-plugin` CLI scaffolding + 5 分鐘 quickstart 教學，讓封測用戶自己也能寫工具。目標用戶是技術人，他們願意自己動手——前提是開發體驗要極好。
- UI 上不要把工具區設計成空蕩蕩的貨架，而是一個「任務完成流」的介面：重點是 Inbox → Tool → Object 的完整迴圈感，而非工具的數量。

### 劣勢 2：筆記編輯體驗的天花板

**問題：** MVP 的 content 是純 Markdown，沒有雙向連結、沒有 Block Editor、沒有 Graph View。對習慣 Obsidian 的人來說是退步。Saner.AI 在這點上也一般，但人家至少不打「知識管理」這張牌。

**風險等級：** 中。因為 MVP 定位已轉向「任務管理 + 工具平台」。

**行動計畫：**

- 不要在 MVP 階段花任何時間在編輯器上。定位是任務指揮中心，不是筆記工具。
- 在 onboarding 訊息中明確告知：「Life Console 管行動和工具，深度寫作推薦搭配你喜歡的編輯器。」
- Phase 2 考慮 MCP 整合 Obsidian vault 讀取，變成互補而非競爭。

### 劣勢 3：行動端完全缺席

**問題：** Saner.AI 有 iOS + Android App，使用者可以隨時捕捉想法。MVP 只有桌面端，「隨手記錄」場景完全空白。

**風險等級：** 中。行動端缺席會降低 Today View 和 Inbox 的觸及率。

**行動計畫：**

- Phase 2 之前不碰行動端（正確決策，堅持住）。
- 提供成本極低的「捕捉入口」替代方案：做一個 Telegram Bot 或 iOS Shortcuts 整合。使用者在手機輸入文字 → 自動進入 Inbox。開發成本約 1-2 天，解決最核心的行動端痛點。
- 未來若做行動端，只做「唯讀 + 快速捕捉」：Today View（看今天該做什麼）+ Inbox 輸入（快速記錄），不做編輯、不做工具區。

### 劣勢 4：MVP 沒有任何外部整合

**問題：** Saner.AI 已有 Google Drive + Gmail + Slack + Calendar 整合，Life Console MVP 不做 MCP 整合。使用者必須手動把所有東西貼進 Inbox，增加使用摩擦。

**風險等級：** 中高。整合是 Saner.AI 的殺手功能之一。

**行動計畫：**

- Phase 2（第 15-16 週）把 Google Calendar 讀取作為第一個 MCP 整合，直接影響 Today View（「今天有 3 小時會議，可用時間 5 小時」）。此整合的 ROI 最高。
- MVP 階段用 Workflow Plugin 作為「窮人版整合」——例如一個 Plugin 讓使用者貼入 Calendar URL 就能匯入行程。

### 劣勢 5：AI 推斷的成本與延遲

**問題：** BYOK 模式雖然沒有平台方的成本壓力，但使用者看到 API 帳單可能會減少使用。Saner.AI 免費方案就包含 AI 功能，使用者沒有這個心理障礙。

**風險等級：** 中低。

**行動計畫：**

- 批量推斷優化：連續 5 條輸入合併為一次 API 呼叫，一次推斷所有的類型和屬性。
- 在設定頁面顯示 API 用量統計：「本月 Life Console 使用了你的 Claude API $0.30」——透明度建立信任。
- Phase 2 考慮本地輕量模型：regex + 關鍵字做第一層篩選，70% 明確情況本地處理，只有 30% 模糊的送雲端。

### 劣勢 6：單人開發的速度瓶頸

**問題：** 面對 Obsidian（成熟公司 + 數千社群開發者）和 Saner.AI（已有完整團隊和產品）的競爭。

**風險等級：** 高。但這是所有獨立開發者的結構性問題。

**行動計畫：**

- 極度聚焦。每週問自己：「這個功能在強化 Inbox + Today View + Toolbox 嗎？不是就不做。」
- 用 Cursor / Claude Code 把生產力拉到 3-5 倍。UI 元件（卡片、確認 Dialog、排序列表）幾乎可以全部 AI 生成。
- 不自建基礎設施：SQLite、Claude API、Electron——都用現成的，把精力集中在核心差異化。

---

## 6. 優勢分析：六個差異點與放大策略

### 優勢 1：零配置結構化（Inbox 推斷）

**你有什麼：** Inbox 輸入任何文字 → Claude API 非同步推斷 type + 屬性 → 一鍵確認。使用者從未被要求「先選類型再填欄位」。

**為什麼是優勢：** Saner.AI 也有 AI 自動標籤，但它的底層仍是非結構化筆記。Life Console 的 Inbox 推斷是真正的型別推斷——文字進來就變成有 Schema 的 Object。這是體驗上的斷層式跳躍，不是漸進式改善。

**放大策略：**

- 產品 Demo 的第一個畫面就是 Inbox 推斷。使用者貼進一段 Slack 訊息或會議紀錄 → 2 秒後 AI 拆成 3 個 Task + 1 個 Note → 一鍵確認。這個「魔法時刻」要在 15 秒內呈現。
- Landing page 的核心 GIF 就拍這個流程。
- 確保推斷準確率在封閉測試中達到 80%+ 才上線。推斷不準會直接摧毀這個優勢。寧可只分 task/note 兩類（高準確），不要分五種類型（低準確）。
- 在 UI 加一個修正計數器：「系統已從你的 47 次修正中學習」——Phase 2 才做 Personal Skills，但這個計數器提前建立預期。

### 優勢 2：Today View 的「有限承諾」設計

**你有什麼：** 規則加權排序（urgency + priority + staleness），顯示每日預估總耗時，預留 AI reranker 介入點。

**為什麼是優勢：** Saner.AI 主打「Skai 每天早上主動告訴你該做什麼」。Life Console 的 Today View 用規則排序，看似沒有 AI 那麼炫，但更可靠、更可解釋、更有利於早期信任建立。

**放大策略：**

- 行銷訊息不要說「AI 幫你排程」（MVP 還沒做到），要說「打開就看到今天該做的事，按重要程度排好」。誠實承諾比過度承諾更好。
- 「預估總耗時 > 8 小時」的視覺警告是殺手功能。Saner.AI 和 Obsidian Tasks 都做不到，因為它們沒有統一的 `estimated_minutes` 欄位。
- Phase 2 升級故事：「你用了三個月，系統已經知道你週一上午產能最高、週五下午最低，現在 Today View 根據你的節奏排列。」

### 優勢 3：工具輸出自動沉澱——「知識庫是副產品」

**你有什麼：** Workflow Plugin 的 `output.auto_create_object` + `output_mapping` 機制，工具執行完自動建 Note Object + relation 追溯到 workflow_run。

**為什麼是優勢：** Saner.AI 的知識需要使用者主動捕捉（Chrome Extension、手動輸入）。Life Console 的 Workflow Plugin 做完事自動建 Object——知識庫是副產品，不需要刻意整理。三個月後使用者會發現自己不知不覺累積了一個結構化的知識庫。

**放大策略：**

- 在 LearningHacker 之外，盡快再做 2-3 個 Workflow Plugin 來豐富「自動沉澱」場景。建議優先級：(1) GitHub PR 摘要器 (2) 瀏覽器書籤匯入 (3) RSS/Newsletter 閱讀摘要。
- UI 上做一個「知識庫成長儀表板」：「這個月系統自動累積了 23 則筆記、47 個任務」。讓使用者感受到「我不需要做任何額外的事，系統自己在長大」。
- 行銷對比：「Obsidian 需要你把工具輸出手動貼進筆記。Life Console 的工具做完自動記錄，你只需要在想找的時候搜尋。」

### 優勢 4：Local-first 隱私

**你有什麼：** 資料加密存在本地 SQLite，雲端只用來做 LLM 推理，BYOK 模式。

**為什麼是優勢：** Saner.AI 完全雲端，資料在他們的伺服器上。對技術人——特別是處理敏感專案資訊的工程師——Local-first 是硬性加分。

**放大策略：**

- Landing page 明確標注：「你的資料永遠不離開你的電腦。」
- 開源 Object Model Schema——讓使用者驗證資料格式。
- 支援完整資料匯出（JSON + Markdown），消除鎖定疑慮。
- BYOK 模式本身就是信任信號：「你的 AI 帳戶也是你自己的，我們碰不到。」

### 優勢 5：外掛平台定位（獨一無二）

**你有什麼：** Workflow Plugin SDK（三類原子 API：llm / tools / store）+ manifest 格式 + 自動生成輸入表單 + 輸出自動建 Object。

**為什麼是優勢：** 市場上沒有一個「AI 工具平台」讓你載入自訂 Workflow 並自動回寫知識庫。Saner.AI 不提供 API，更沒有外掛系統。Obsidian 有外掛但不會自動結構化輸出。這是最大的結構性優勢。

**放大策略：**

- 在技術社群強調：「你可以用 50 行 TypeScript 寫一個工具，它自動變成表單、自動執行、自動記錄結果。」
- 開源 Plugin SDK，在 GitHub 建立生態。
- 提供 `create-life-console-plugin` CLI scaffolding + 5 分鐘 quickstart 教學。

### 優勢 6：Personal Skills 的長線壁壘

**你有什麼：** `ai_metadata.user_corrections` 從 MVP Day 1 就開始記錄修正行為。Phase 2 啟動 Personal Skills 後，將成為真正的護城河。

**為什麼是優勢：** Saner.AI 的 Skai 是通用 AI 助理，不會「學習你的思考方式」。Life Console 的 Personal Skills 系統學習使用者的認知模式、分析習慣與處理偏好，累積為可複用的個人化技能——使用者的認知模式無法帶到其他平台復現相同效果。

**放大策略：**

- MVP 就開始記錄 user_corrections，但不要過早宣傳。等 Phase 2 有真實 before/after 案例再行銷。
- 核心訊息（Phase 2 啟用時）：「唯一一個會學習你怎麼思考的工具。」
- 用 before/after 影片展示 Day 1 vs Day 30 的 AI 輸出品質差異。

---

## 7. 開發戰略建議

### 7.1 Phase 0：核心驗證（第 1-4 週）

**目標：** 驗證 Inbox 推斷的可用性和 Object Model 的穩定性。

| 週次 | 開發重點 | 驗證指標 |
|------|---------|---------|
| 1 | SQLite Object Model CRUD + Inbox 推斷 Prompt 設計 | 100 條真實輸入的推斷準確率 ≥ 80% |
| 2 | 推斷確認 UI + ai_metadata 記錄 + 手動修正流程 | 修正流程 < 2 次點擊完成 |
| 3 | Today View 排序引擎 + 基本 Task CRUD | 排序結果在 10 筆任務上符合直覺 |
| 4 | 全文搜尋 + 最簡可用的整體 UI 骨架 | 自己能用它管理 Life Console 的開發任務 |

**關鍵原則：** 第 4 週結束時，必須開始「吃自己的狗糧」。如果自己不想用它管理開發任務，使用者也不會想用。

**vs Saner.AI 調整：** 第 1 週同步建立個人 Blog 和 Twitter 帳號，開始 Building in Public。不要等產品做完才開始行銷。第 4 週的自我檢驗標準：「如果 Saner.AI 的免費版已經能做到的事，我的 MVP 做得更快嗎？」

**Phase 0 結束 Gate：** Inbox 推斷準確率 ≥ 80%。如果未達標，收窄到 task/note 二分類（高準確），不要分五種類型。

### 7.2 Phase 1：工具系統 + 第一批使用者（第 5-10 週）

**目標：** Workflow Plugin SDK 上線 + LearningHacker 改造 + 找到 10 個封測用戶。

| 週次 | 開發重點 | 驗證指標 |
|------|---------|---------|
| 5-6 | WorkflowContext 介面實作（llm / tools / store 三類 API） | LearningHacker 能在 SDK 上跑通 |
| 7-8 | LearningHacker 改造 + manifest 載入流程 + 自動生成輸入表單 | 從輸入 URL → 自動建 Note Object 的端到端流程 |
| 9 | PhotoSift 快捷啟動 + 工具區 UI + 2 個新 Plugin | 工具區有至少 4 張卡片 |
| 10 | Bug 修復 + 體驗打磨 + 邀請封測 | 找到 10 個願意每天用的封測用戶 |

**封測用戶畫像（精準定位）：** 軟體工程師或技術主管、同時管理 3+ 個專案、已經嘗試過 Obsidian/Notion 但覺得「花太多時間整理」、對隱私有要求。這種人 Saner.AI 也吸引不了（雲端 + 沒有外掛）。

**招募渠道：** Twitter/X 技術圈、開發者 Discord、個人人脈。給他們 1:1 的 onboarding，觀察使用行為。

**Phase 1 結束 Gate：** 找到 10 個願意每天使用的封測用戶。

### 7.3 Phase 2：Personal Skills 種子 + 第二波工具（第 11-16 週）

**目標：** 開始兌現「越用越懂你」的承諾，擴充工具生態。

| 週次 | 開發重點 | 驗證指標 |
|------|---------|---------|
| 11-12 | 分析封測用戶的 user_corrections 資料，設計 Personal Skills Phase 1 的隱式學習邏輯 | 能從修正資料中識別出至少 3 種行為模式 |
| 13-14 | 再開發 2-3 個 Workflow Plugin（GitHub 摘要器、書籤匯入、RSS 閱讀器） | 工具區有 5+ 張卡片 |
| 15-16 | MCP 整合第一步：Google Calendar 讀取 → 影響 Today View 排序 | 「今天有 3 小時的會議，可用時間只有 5 小時」的提示出現 |

### 7.4 關鍵決策點時間表

| 時間點 | 決策 | 選項 | 建議 |
|--------|------|------|------|
| 第 4 週 | Schema 是否穩定？ | 保持現有 4 type vs 新增 type | 封測前必須 freeze，有真實資料後遷移成本極高 |
| 第 8 週 | Workflow SDK 是否足夠？ | 最小 API vs 擴充更多工具函數 | 先用 LearningHacker 端到端驗證，不足再加 |
| 第 10 週 | 封測回饋後的方向修正 | 強化 Inbox vs 強化 Today View vs 強化 Toolbox | 看使用者實際最常用哪個模組，資源往那邊傾斜 |
| 第 12 週 | 是否開始 Personal Skills | 立即開始 vs 等到用戶量更大 | 如果 user_corrections 資料夠多（100+ 筆），就開始 |
| 第 14 週 | 行動端的優先級 | Telegram Bot vs PWA vs 原生 App vs 繼續不做 | Telegram Bot 成本最低，先做這個測試需求 |
| 第 16 週 | 公開上線策略 | Product Hunt vs Hacker News vs 軟上線 | Hacker News 先（技術文章），PH 後（產品 Demo） |

---

## 8. 行銷戰略建議

### 8.1 定位語言

**核心訊息框架：**

| 層級 | 訊息 | 使用場景 |
|------|------|---------|
| 一句話版本 | 「別花時間整理，打開就知道今天該做什麼。」 | Twitter bio、Product Hunt tagline |
| 電梯演說 | 「Life Console 是給技術人的任務指揮中心。你只要把事情丟進來，AI 自動分類、自動排程、工具做完自動記錄。不需要學配置、不需要手動整理。」 | Landing page hero、Demo 開場 |
| 深度版本 | 「我們不是另一個筆記工具。Obsidian 管知識，Notion 管協作，Life Console 管行動。你的工具輸出自動變成可搜尋的知識，不需要多做任何事。」 | Blog 文章、社群回覆 |
| vs Saner.AI 差異化 | 「你的資料不離開你的電腦。你可以自己寫工具。它會學你的思考方式。」 | 競品比較場景 |

**絕對不要說的話：**

- ~~「取代 Obsidian」「比 Notion 更好」~~——會引發社群敵意，而且不是事實
- ~~「AI 第二大腦」~~——Saner.AI 已經用這個詞，市場已經免疫
- ~~「作業系統」「OS for life」~~——過度承諾
- ~~「ADHD 友善」~~——這是 Saner.AI 的地盤，不要正面搶

### 8.2 內容行銷時間表

**Month 1-2（產品尚未公開）：建立個人品牌**

用「Building in Public」模式，每週發 2-3 篇開發日誌：

- 「為什麼我放棄用 Obsidian 管理我的 Side Projects（以及我在做什麼替代方案）」——不是攻擊 Obsidian，而是誠實描述「整理筆記太花時間」的痛點，自然帶出 Life Console 的想法。
- 「我如何設計一個讓 AI 自動分類的 Object Model」——技術深度文章，目標 Hacker News / Reddit r/programming。
- 「Inbox Zero 的問題不是收件匣太多，是分類太累」——產品理念文章。

**發佈渠道：** 個人 Blog + Twitter/X + Hacker News + Reddit r/SideProject

**Month 3-4（封測期）：展示真實使用場景**

- 封測用戶的使用案例故事（需用戶同意）
- 15 秒 GIF/短影片：「貼進一段 Slack 訊息 → 自動變成 3 個任務 → 出現在 Today View」
- 「我用 Life Console 管理 Life Console 的開發」——自己吃狗糧的紀錄

**Month 5+（公開上線）：擴大觸及**

- Product Hunt 發佈（等到有 10+ 真實用戶 + 好看 Demo）
- 「從 Todoist/TickTick 遷移到 Life Console」遷移指南（對標任務管理工具，不是 Obsidian）
- Workflow Plugin 開發教學——吸引技術人自己寫工具
- 「Life Console + Obsidian：我如何同時用兩者」——共存策略文章，拉攏 Obsidian 社群而非對抗

### 8.3 社群策略

**目標社群優先級：**

| 社群 | 目的 | 行動 | 優先級 |
|------|------|------|--------|
| Twitter/X 技術圈 | 品牌建立 + 早期使用者 | Building in Public、短影片 Demo | P0 |
| Hacker News | 爆發性曝光 | 技術深度文章（Object Model、AI 推斷設計） | P0 |
| Reddit r/SideProject | 獨立開發者同溫層 | 開發進度更新、互相支持 | P1 |
| Reddit r/productivity | 目標用戶密集 | 使用案例、與現有工具的對比 | P1 |
| Discord 開發者社群 | 封測用戶招募 + 外掛開發者 | 建立自己的 Discord server | P1 |
| Reddit r/ObsidianMD | 拉攏而非對抗 | 等共存文章寫好再進 | P2 |
| Product Hunt | 正式發佈 | 等到 10+ 真實用戶 + 好看 Demo | P2 |

### 8.4 Landing Page 設計要點

**首屏（Above the fold）：**

- 標題：「別花時間整理，打開就知道今天該做什麼。」
- 副標題：「AI 自動分類你的任務和筆記，工具做完自動記錄。專為技術人打造。」
- CTA：「加入等待清單」
- 核心視覺：Inbox 推斷的 15 秒 GIF（文字輸入 → AI 推斷 → 一鍵確認）

**三個價值區塊：**

1. 「丟進來就好」——展示 Inbox 推斷
2. 「打開就知道先做什麼」——展示 Today View + 預估總耗時
3. 「工具做完，筆記自動長出來」——展示 Workflow Plugin → 自動建 Object

**信任建立區塊：**

- 「你的資料 100% 在你的電腦上，用你自己的 AI API Key」——Local-first + BYOK
- 「完全可匯出：JSON + Markdown」——消除鎖定疑慮

---

## 9. 關鍵決策建議摘要

1. **Phase 0 結束的 kill switch：** 如果 Inbox 推斷準確率 < 80%，先收窄到 task/note 二分類（高準確），不要分五種類型。推斷不準會直接毀掉最大的優勢。

2. **不要在筆記編輯器上花時間。** 戰場是 Inbox + Today View + Toolbox，不是跟 Obsidian 比富文本編輯。

3. **Saner.AI 的免費方案是參照物。** MVP 體驗必須比 Saner.AI 免費版更快解決「我今天該做什麼」這個問題——如果做不到，說明還沒找到正確的切入點。

4. **Phase 2 的 Personal Skills 是終極武器，但不要太早宣傳。** 等有真實 before/after 案例（Day 1 vs Day 30 的 AI 輸出品質差異），再用影片行銷。

5. **Local-first + Plugin Platform + Personal Skills 三者組合是 Saner.AI 無法複製的。** Saner.AI 要做到這三件事，需要重寫整個架構。這是結構性護城河。

6. **跟 Obsidian 做朋友，不做敵人。** 所有外部溝通都定位為互補關係。跟 Saner.AI 也不要正面衝突——目標族群本來就不完全重疊。

---

## 附錄：競品定位圖譜

```
                    高結構化
                       │
           Tana ●      │      ● Life Console (目標)
                       │
    Anytype ●          │
                       │
  ─────────────────────┼──────────────────── 高 AI 自動化
                       │
         Obsidian ●    │     ● Saner.AI
                       │
          Logseq ●     │     ● Reflect
                       │
                    低結構化
```

| 競品 | 結構化程度 | AI 深度 | 本地優先 | 外掛平台 | Personal Skills | 工具自動沉澱 |
|------|-----------|---------|---------|---------|----------------|-------------|
| Saner.AI | 低 | 中高 | ❌ | ❌ | ❌ | ❌ |
| Notion | 高 | 中 | ❌ | ❌ | ❌ | ❌ |
| Tana | 極高 | 中高 | ❌ | ❌ | ❌ | ❌ |
| Obsidian | 低 | 低（靠外掛） | ✅ | ✅（2700+） | ❌ | ❌ |
| Mem.ai | 低 | 中高 | ❌ | ❌ | ❌ | ❌ |
| **Life Console** | **高** | **高** | **✅** | **✅（自建）** | **✅（Phase 2）** | **✅** |

---

> **下一步行動：** 從 Phase 0 開始，同步驗證 Inbox 推斷準確度和開始 Building in Public 行銷。MVP 的核心勝負手是「Inbox + Today View + Toolbox」三件事的體驗閉環，所有開發精力集中在這裡。
