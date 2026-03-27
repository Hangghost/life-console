# Life Console vs RunJobs.ai — 競品分析與戰略啟示

> **日期：** 2026-03-26
> **基於：** RunJobs.ai 官網及文件、Life Console Proposal（redefine-as-skill-platform）
> **背景：** 創辦人在產品重新定位為 Personal Skill Platform 後，發現 RunJobs.ai 在做相似的事，需要分析兩者的異同與戰略啟示

---

## 目錄

1. [RunJobs.ai 產品摘要](#1-runjobsai-產品摘要)
2. [產品定位對比](#2-產品定位對比)
3. [核心差異分析](#3-核心差異分析)
4. [RunJobs 的優勢（Life Console 需注意）](#4-runjobs-的優勢life-console-需注意)
5. [RunJobs 的弱點（Life Console 的機會）](#5-runjobs-的弱點life-console-的機會)
6. [關鍵概念借鏡](#6-關鍵概念借鏡)
7. [戰略結論：競品還是參考？](#7-戰略結論競品還是參考)

---

## 1. RunJobs.ai 產品摘要

### 一句話定義

**RunJobs.ai 是一個「AI 員工平台」——AI Agent 在真實的雲端桌面上執行任務，你可以透過 VNC 即時觀看它們工作。**

### 公司資訊

- **公司：** INVENTOR PTE. LTD.（新加坡）
- **上線時間：** 2026 年（搜尋引擎尚未收錄，非常早期）
- **定價：** Pay-as-you-go，無訂閱制，1 unit = $0.0001 USD，典型任務 $0.05–$0.60
- **支援模型：** OpenAI、Claude、DeepSeek、Gemini、Llama、Mistral、Qwen

### 核心架構

```
┌─────────────────────────────────────────────────────┐
│                   RunJobs.ai                         │
│                                                      │
│  ┌─────────────┐   ┌──────────────┐                 │
│  │  Project     │   │  Builder     │                 │
│  │  Marketplace │   │  Mode        │                 │
│  │  (用現成的)  │   │  (自己建)    │                 │
│  └──────┬──────┘   └──────┬───────┘                 │
│         │                  │                         │
│         ▼                  ▼                         │
│  ┌──────────────────────────────────┐               │
│  │          Workspace               │               │
│  │   (多 Agent 協作聊天室)          │               │
│  │                                   │               │
│  │   Leader Agent ──► Writer Agent   │               │
│  │        │                          │               │
│  │        └──────► Researcher Agent  │               │
│  └──────────────────┬───────────────┘               │
│                     │                                │
│  ┌──────────────────▼───────────────┐               │
│  │     Cloud Desktop (Linux VM)      │               │
│  │     Browser + Terminal + Apps     │               │
│  │     ← 使用者可透過 VNC 觀看 →    │               │
│  └───────────────────────────────────┘               │
│                                                      │
│  產出 → Deliveries → 發送至 Slack/Telegram/Email    │
└─────────────────────────────────────────────────────┘
```

### 核心概念對照表

| RunJobs 概念 | 說明 |
|-------------|------|
| **Agent** | AI 工作者，有名字、人格、系統 prompt、Skills、記憶體 |
| **Skill** | 可安裝的能力包，包含指令文本和參考文件，注入 Agent 的 context |
| **Workspace** | 多 Agent 協作聊天室，類似 Slack channel |
| **Project** | Marketplace 上的模板，打包了預配置的 Agent 團隊 + 工作流 |
| **Computer** | 雲端 Linux 桌面環境（或 Local Computer），Agent 在上面操作 |
| **Delivery** | Agent 產出的最終交付物，可發送到外部平台 |

---

## 2. 產品定位對比

| 維度 | RunJobs.ai | Life Console (新定位) |
|------|-----------|----------------------|
| **核心定位** | AI 員工平台：雲端 Agent 團隊幫你做事 | 個人技能平台：自己的小工具統合 + context 累積 |
| **核心隱喻** | 「雇用 AI 員工」 | 「我的工具工作台」 |
| **目標族群** | 不會寫 code 的知識工作者 + 會寫的 power users | 技術人（會 vibe coding） |
| **AI 在哪裡** | 平台核心（Agent 是主角） | 外部（Claude Code 是主角，平台是 context 提供者） |
| **Skills 的意思** | 注入 Agent 的指令和參考資料 | 使用者自己寫的可執行工具 |
| **資料架構** | 雲端（Agent 在雲端 VM 上工作） | Local-first（SQLite 在本地） |
| **商業模式** | Pay-per-use 平台（抽成 AI token） | 自用工具（暫無商業化） |
| **協作模式** | 多 Agent 自動協作 | 單人使用，Claude Code 輔助 |
| **透明度策略** | VNC 看 Agent 在桌面做什麼 | 不需要，因為你自己寫的 Skill |

---

## 3. 核心差異分析

### 3.1 「Skill」的定義完全不同

這是最容易混淆、但最根本的差異：

```
RunJobs 的 Skill                      Life Console 的 Skill
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

給 AI Agent 的「知識注入」             使用者自己寫的「可執行程式」

= prompt 片段 + 參考文件              = code + UI + 處理邏輯
= 讓 Agent 「知道怎麼做某件事」        = 一個實際的小工具

類比：給員工一本 SOP 手冊              類比：給自己做一把螺絲起子

Agent 在 runtime 搜尋相關              使用者主動選擇要用哪個 Skill
Skills 注入 context                    點進去操作
```

**啟示：** 兩個產品用了同一個詞，但指完全不同的東西。Life Console 的 Skill 更接近 RunJobs 的 **Project**（一個可執行的工作流），而不是 RunJobs 的 Skill（一個知識包）。

### 3.2 誰在做事？

```
RunJobs:    使用者 → 下指令 → AI Agent 做事 → 使用者看結果
                              ↑
                          Agent 是執行者

Life Console: 使用者 → 開 Skill → 自己操作 → 結果存入 Context
                                  ↑
                              使用者是執行者（AI 輔助）
```

RunJobs 的價值是「你不用動手，AI 替你做」。Life Console 的價值是「你動手做，但有更好的工具和自動累積」。

### 3.3 平台 vs 工具

| 維度 | RunJobs | Life Console |
|------|---------|--------------|
| 使用門檻 | 低（選一個 Project，填表，等結果） | 高（要會 vibe coding 做 Skill） |
| 自訂程度 | 中（可建 Agent 和 Workspace） | 極高（Skill 的 code 完全自己寫） |
| 使用者數量天花板 | 高（不需技術背景） | 低（只服務技術人） |
| 單人價值密度 | 中（通用工作流） | 極高（完全客製化） |

---

## 4. RunJobs 的優勢（Life Console 需注意）

### 4.1 已經是一個完整的產品

RunJobs 有完整的文件系統、Marketplace、計費、整合（Slack/Discord/Telegram）、API、排程等。Life Console 目前是 Phase 1 的 Electron 空殼。這不是直接威脅（因為定位不同），但代表「AI 工具平台」這個概念已經有人在執行了。

### 4.2 Marketplace 模式的網路效應

RunJobs 的 Project Marketplace 讓「創建者」和「使用者」分離——有人做工作流模板，有人付費使用。這形成雙邊網路效應。Life Console 目前是純個人使用，沒有這個維度。

### 4.3 幾個值得注意的設計

- **Agent Memory（跨對話記憶）**：Agent 可以記住過去的偏好和知識，逐漸變聰明。這跟 Life Console 原本想做的 Personal Skills Engine 有異曲同工之處。
- **Delivery 機制**：Agent 產出被標記為「交付物」，自動發送到外部平台。這個「產出的最後一哩路」設計得很好。
- **Local Computer 模式**：Agent 可以連接到你自己的電腦上操作（而非只能用雲端 VM），免費。

---

## 5. RunJobs 的弱點（Life Console 的機會）

### 5.1 資料不在你手上

RunJobs 是雲端平台。你的所有資料、對話、產出都在他們的伺服器上。Life Console 是 local-first，資料在你的電腦裡。對隱私敏感的技術人來說，這是根本差異。

### 5.2 Agent 的產出是一次性的

RunJobs 的 Delivery 是「交付然後結束」。產出發到 Slack 或 Email 之後就散落了。**沒有結構化的 Context Store 把所有歷史產出累積起來。** 這正是 Life Console 的核心差異——每次 Skill 的產出自動存入 Object Store，越用越有價值。

### 5.3 使用者無法控制執行邏輯

RunJobs 的 Agent 是「你下指令，AI 自己決定怎麼做」。如果 Agent 的做法不合你意，你只能調 prompt。Life Console 的 Skill 是你自己寫的 code，你有完全的控制權。

### 5.4 不適合高度客製化的個人工作流

RunJobs 的 Project 是通用模板（SEO 文章、競品分析、社交發文）。如果你需要的是「抓 YouTube 字幕 → 用我自己的翻譯風格 → 存成我自己的格式」，RunJobs 很難做到這種程度的客製化。

### 5.5 技術人不需要「看 AI 工作」

RunJobs 的核心賣點是 VNC 即時觀看（「透明度建立信任」）。但技術人更在意的是**可控性**和**可重現性**，而不是看 AI 操作桌面。如果 Skill 是自己寫的 code，你天然就信任它。

---

## 6. 關鍵概念借鏡

雖然兩個產品定位不同，RunJobs 有幾個設計概念值得 Life Console 參考：

### 6.1 Delivery 機制 → Context Store 的「推送」能力

RunJobs 的 Delivery 可以推送到 Slack/Telegram/Email。Life Console 未來可以考慮讓 Context Store 的特定產出自動推送到外部——不一定是發送結果，而是「讓 Claude Code 知道有新的 context 可以用」。

### 6.2 Agent Template → Skill Template

RunJobs 的 Agent Templates 是預配置的 Agent。Life Console 可以有 Skill Templates——預配置的工具模板，讓 vibe coding 更快。例如「翻譯類 Skill 模板」「社交發文類 Skill 模板」，使用者 fork 後修改。

### 6.3 Workspace 的 Chat Interface → Skill 的交互模式

RunJobs 用聊天介面跟 Agent 互動。Life Console 的 Skill 目前是「表單式 UI」（填入 → 處理 → 結果）。未來可以考慮 Skill 也支援對話式交互——特別是透過 MCP 被 Claude Code 調用時，天然就是對話式的。

### 6.4 排程（Cron Schedule） → Skill 定期執行

RunJobs 支援 cron 排程定期執行 Project。Life Console 的 Phase 3 可能也需要這個——例如「每天早上自動執行新聞摘要 Skill」。這可以成為 Today View 的替代方案：不是 AI 排程，而是使用者自己排程。

### 6.5 Local Computer → 已經是 Life Console 的天然優勢

RunJobs 需要特別做一個 Local Computer 功能讓 Agent 連到本地。Life Console 天生就是 local app，Skill 直接在本機跑，不需要任何額外設定。

---

## 7. 戰略結論：競品還是參考？

### 結論：不是競品，是不同物種

```
RunJobs.ai                           Life Console
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

「雇一個 AI 團隊幫你做事」           「打造你自己的工具箱」

使用者是老闆                          使用者是工匠
Agent 是員工                          Skill 是工具
Workspace 是辦公室                    Life Console 是工作台

核心賣點：你不用動手                  核心賣點：你自己做得更好更快
信任機制：看 AI 工作（VNC）           信任機制：code 是你自己寫的

適合：不想碰技術細節的人              適合：享受自己做工具的技術人
```

**RunJobs 和 Life Console 服務的是同一個大趨勢（AI 做事）下完全不同的人群和需求。** RunJobs 的使用者想要「我不用動手」，Life Console 的使用者想要「我自己做的工具更好用」。

### 值得警惕的一件事

RunJobs 的 Builder Mode（自建 Agent + Skill + Workspace）跟 Life Console 有一定重疊——都是讓技術人自建工作流。但兩者的執行環境完全不同：RunJobs 在雲端 VM、Life Console 在本地 Electron。如果 RunJobs 未來加強 Builder Mode 的自訂程度並降低技術門檻，可能會搶到一些 Life Console 潛在用戶。

### 行動建議

1. **不需要因為 RunJobs 改變方向。** 兩個產品的基因不同（雲端 SaaS vs Local-first 個人工具），短期不會正面衝突。
2. **借鏡 RunJobs 的 Delivery 和排程設計。** 這兩個功能在 Life Console Phase 3 可能有用。
3. **強化「context 累積」這個 RunJobs 沒有的差異。** RunJobs 的產出是一次性的，Life Console 的產出自動結構化累積——這是最根本的護城河。
4. **觀察 RunJobs 的 Skill 概念演化。** 如果它從「prompt 注入」演化成「可執行 code」，那就更值得關注了。
