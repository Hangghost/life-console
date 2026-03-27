## 1. 修改 LLM Prompt

- [x] 1.1 修改 `skills/knowledge-ingestion/core.ts` 的 system prompt，加入繁體中文輸出指令與專有名詞附英文對照的要求
- [x] 1.2 修改 user prompt，將 JSON 格式說明改為中文，並在 topic/tags/content 欄位說明中加入語言要求

## 2. 漢化 Fallback 字串

- [x] 2.1 將 `parseCardsFromLLMOutput` 中的 `'Unknown'` 改為 `'未知主題'`
- [x] 2.2 將 `parseCardsFromLLMOutput` 中的 `'Extracted Knowledge'` 改為 `'擷取的知識'`
