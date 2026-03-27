## Context

Knowledge Ingestion skill 透過 `skills/knowledge-ingestion/core.ts` 的 `callLLM()` 呼叫 LLM API，以一個 system prompt + user prompt 指示模型將文章拆分為 KnowledgeCard。目前兩個 prompt 皆為英文，導致輸出語言依文章語言而定——英文文章必然輸出英文 card，中文文章也可能輸出英文。

## Goals / Non-Goals

**Goals:**
- KnowledgeCard 的 topic、tags、content 預設以繁體中文輸出
- 專有名詞（技術術語、產品名稱等）保留英文對照，格式如「知識卡片（KnowledgeCard）」
- fallback parsing 路徑的預設字串改為中文

**Non-Goals:**
- 不新增語言切換 UI 設定
- 不修改 KnowledgeCard 的資料結構或欄位定義
- 不影響 Distillation Chat 的語言行為

## Decisions

### 修改 system prompt 語言指令

**決定**：在 system prompt 明確加入「請以繁體中文回答，專有名詞附英文對照」的指令。

**理由**：system prompt 比 user prompt 更受 LLM 遵循，語言指令放在 system level 可確保即使輸入文章為英文，輸出仍為中文。相較於只改 user prompt，此方式更穩定。

### 在 user prompt 也重申語言要求

**決定**：user prompt 中的 JSON 格式說明改為中文，並在 `topic`、`tags`、`content` 的說明加上語言要求。

**理由**：雙重強調可降低模型「跟著輸入語言走」的傾向，對英文長文尤其有效。

### fallback 字串漢化

**決定**：將 `'Unknown'` → `'未知主題'`、`'Extracted Knowledge'` → `'擷取的知識'`。

**理由**：fallback 路徑雖然少走，但若走到時不應出現英文孤立字串。

## Risks / Trade-offs

- [風險] LLM 仍可能部分輸出英文（尤其面對全英文技術文章）→ 可接受，使用者可手動 Edit card
- [風險] `parseCardsFromLLMOutput` 的 regex 依賴英文關鍵字（`CARD:`、`Tags:`、`Content:`）→ 不影響 JSON 路徑，fallback 路徑的 regex 僅用於結構解析而非翻譯
- [Trade-off] 無語言設定 UI：語言固定為繁中，若未來需要多語言需另外設計 setting
