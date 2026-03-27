## Why

Knowledge Ingestion 目前的 LLM prompt 以英文為主，導致產出的 KnowledgeCard（topic、tags、content）全為英文，對以中文思考的使用者來說閱讀體驗差、也不利於後續的中文搜尋與整理。

## What Changes

- 修改 `skills/knowledge-ingestion/core.ts` 中的 system prompt，指示 LLM 以中文輸出
- 修改 user prompt，明確要求 topic、tags、content 皆以繁體中文為主，專有名詞附英文補充
- 更新 fallback 解析路徑中的預設字串（`'Unknown'`、`'Extracted Knowledge'`）為中文

## Capabilities

### New Capabilities

（無新 capability，屬於既有 knowledge-ingestion skill 的行為修改）

### Modified Capabilities

- `knowledge-ingestion`：LLM 輸出語言從英文改為中文（繁體），專有名詞保留英文對照

## Impact

- `skills/knowledge-ingestion/core.ts`：修改 system prompt、user prompt、fallback 文字
- 不影響 API 呼叫格式、資料結構（topic/tags/content 欄位不變）
- 不影響 writer.ts、reader.ts、search.ts
- 已存在的英文 card 不受影響
