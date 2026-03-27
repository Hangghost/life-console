## Why

目前 Knowledge Ingestion 的 LLM prompt 缺乏方法論指導，僅要求「拆成 3-15 張卡片」，產出的卡片常常：內容重疊、不夠原子化、缺乏自治性（脫離文章後難以理解）、也未引導 AI 以使用者的視角進行轉述（淪為純摘要）。根據卡片盒筆記法（Zettelkasten）的核心原則——原子性（Atomicity）、自治性（Autonomy）、連結性（Connectivity）——以及 Heptabase 的實踐，prompt 應能產出真正有價值的永久筆記（Permanent Notes）。

此外，KnowledgePage 目前只能 Confirm / Edit card，無法刪除，使用者無法清理品質不佳或不需要的卡片。

## What Changes

- 重新設計 `skills/knowledge-ingestion/core.ts` 的 system prompt 與 user prompt，嵌入 Zettelkasten 原則
- 新增 KnowledgePage 的卡片刪除功能（UI + IPC handler + 檔案系統操作）

## Capabilities

### New Capabilities

- `knowledge-card-delete`：使用者可在 KnowledgePage 刪除單張 KnowledgeCard（從磁碟移除對應 `.md` 檔案）

### Modified Capabilities

- `knowledge-ingestion`：LLM prompt 升級為 Zettelkasten 方法論導向，強調原子性、自治性、以個人語言轉述，並輸出繁體中文

## Impact

- `skills/knowledge-ingestion/core.ts`：修改 system prompt 與 user prompt
- `src/renderer/src/pages/KnowledgePage.tsx`：新增 Delete 按鈕與確認邏輯
- `src/main/ipc/knowledge.ts`：新增 `knowledge:delete` IPC handler
- `src/preload/index.ts`：expose `knowledge.delete` API
- `src/shared/types.ts`：如需新增 API 型別
