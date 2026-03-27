# Proposal: 重新定位 Life Console 為 Personal Skill Platform

> **日期：** 2026-03-26
> **狀態：** Draft
> **基於：** 產品設計架構文件 v1.1、MVP Spec v0.3、探索討論紀錄

---

## 背景：為什麼需要重新定位

架構文件 v1.1 將 Life Console 定義為「Context-Driven Agentic Workspace」，核心價值是讓 AI 代理主動推進工作。經過實際思考使用場景後，發現：

1. **創辦人真正想用的場景**不是「AI 主動推進工作」，而是「在一個平台上使用自己 vibe coding 做的小工具」和「讓 Claude Code 調用自己累積的 context」
2. **架構文件 50% 以上的複雜度**（AI Agent 系統、Personal Skills Engine、LLM Gateway、Today View 排程、Inbox AI 推斷）在實際使用場景中不被需要
3. **核心痛點**不是缺 AI agent，而是「每個小工具都要獨立開 app、切換成本高、產出散落各處不能被 AI 利用」

---

## 新定位

**舊定位：** Context-Driven Agentic Workspace（脈絡驅動的代理化工作區）

**新定位：** Personal Skill Platform（個人技能平台）

> 一個平台，裝你自己做的小工具（Skills），所有工具的 input/output 自動結構化存入 Context Store，累積的 context 可被 Claude Code 等外部 AI agent 調用。

### 核心價值主張

- **統合工具**：不再為每個小工具開獨立 app，一個平台裝所有 Skill
- **自動累積 Context**：用 Skill 做事就是在建資料庫，做越多 AI 越懂你
- **開放給 AI 調用**：Context Store 透過 MCP Server 暴露，Claude Code 可以讀寫

### 飛輪

```
Vibe code 新 Skill
       │
       ▼
在 Life Console 上使用
       │
       ▼
產出自動存入 Context Store
       │
       ▼
Claude Code 讀 Context → 做更好的事 → 發現新需求 → 再做新 Skill
```

---

## 與架構文件 v1.1 的關係

本 proposal **不取代**架構文件 v1.1，而是提出一個更聚焦的起步方向。架構文件中的模組按以下方式重新分級：

| 模組 | 架構文件定位 | 新定位 |
|------|-------------|--------|
| Plugin/Skill Host | Toolbox（三大模組之一） | **核心中的核心** |
| Object Store (SQLite) | L1 核心大腦的一部分 | **核心**（Context Store） |
| MCP Server | 系統互操作性 | **核心**（Phase 2） |
| Skill SDK | Plugin API | **核心**（雙介面：UI + API） |
| Inbox + AI 推斷 | P0 核心場景 | 暫緩，邊用邊評估 |
| Today View + 排程 | P0 核心場景 | 暫緩，邊用邊評估 |
| Personal Skills Engine | 核心差異化第二軸 | 暫緩，邊用邊評估 |
| LLM Gateway | L1 核心元件 | 不做，AI 推理由 Skill 自行呼叫或外部 agent 處理 |
| Knowledge Graph | 中期規劃 | 不做 |
| Event Bus | L1 核心元件 | 暫緩 |

---

## Skill 的結構

每個 Skill 是一個獨立的資料夾，包含處理邏輯和（可選的）UI：

```
skills/subtitle-translator/
├── manifest.json        # 名稱、描述、input/output schema
├── core.ts              # 處理邏輯（純 function）
├── ui.tsx               # (選用) React UI 元件
└── .env                 # (選用) Skill 自帶的 API keys
```

### 雙介面設計

同一個 Skill 同時支援兩種使用方式：

```
方式 A: 人在 UI 裡操作
  按鈕 → 輸入框 → 處理 → 預覽確認 → 執行 → 結果存入 Context Store

方式 B: Claude Code 透過 MCP 調用
  MCP call → 傳入 input → 處理 → 回傳 result → 結果存入 Context Store
```

兩者共用 `core.ts` 的處理邏輯，差別只在介面層。

### API Key 管理策略

- **Phase 1：** Skill 自帶 `.env`，最快能跑
- **Phase 2：** 平台提供統一 config，Skill SDK 提供 `sdk.getApiKey()`，優先讀平台 config，fallback 到 Skill 的 `.env`

---

## 新 MVP 分期

### Phase 1: 能用（自己用）

- Electron Shell（Sidebar 列出 Skills + 主區域載入 Skill UI）
- Skill 載入機制（讀 skills/ 資料夾）
- SQLite Context Store（Skill output 自動存）
- 第一個 Skill：字幕翻譯（已完成）
- API Keys：Skill 自帶 .env

### Phase 2: 能被調用（Claude Code 接入）

- MCP Server（讀寫 Context Store、觸發 Skills headless 執行、查詢歷史產出）
- API Key 統一管理

### Phase 3: 邊用邊發現

不預設功能。可能的方向包括：
- Context 瀏覽 UI
- Skill 之間的串接 / Workflow
- 某種排程或自動觸發
- Inbox / Today View（如果實際使用中發現需要）

---

## 不做的事 (Non-goals)

- 不做內建 AI Agent（推理能力交給外部 LLM / Claude Code）
- 不做 Personal Skills Engine（AI 自動學習偏好）
- 不做 Knowledge Graph
- 不做雲端同步
- 不追求完整的 Object Model schema 定義（邊用邊長）

---

## 驗證策略

**核心假設：** 「把小工具統合在一個平台、產出自動結構化存儲、能被 AI 調用」這個組合對創辦人自己有實際價值。

**驗證方式：** 創辦人自己用。Phase 1 做完後實際使用，從使用過程中發現 Phase 2/3 的需求。不預先規劃過多功能。

**成功指標：** 創辦人日常真的打開 Life Console 用，而不是繼續用獨立的 script/app。
