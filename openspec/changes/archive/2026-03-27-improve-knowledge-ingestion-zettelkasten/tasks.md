## 1. 升級 Knowledge Ingestion Prompt

- [x] 1.1 修改 `skills/knowledge-ingestion/core.ts` 的 system prompt，嵌入 Zettelkasten 三原則（原子性、自治性、個人語言轉述）並要求繁體中文輸出
- [x] 1.2 重寫 user prompt，加入結構化卡片品質規則清單，更新 JSON schema 欄位說明為中文並強化語言與品質要求

## 2. 新增卡片刪除 IPC Handler

- [x] 2.1 在 `src/main/ipc/knowledge.ts` 新增 `knowledge:delete` handler，接收 filePath，執行 unlinkSync，回傳 `{ success, error? }`
- [x] 2.2 在 `src/preload/index.ts` 的 `knowledge` 物件新增 `delete(filePath)` 方法

## 3. KnowledgePage 刪除 UI

- [x] 3.1 在 `KnowledgePage.tsx` 的 `CardItem` 新增 Delete 按鈕，樣式與現有 btnAction 一致但為紅色系
- [x] 3.2 實作 `handleDelete` 函式：window.confirm 確認 → 呼叫 `api.knowledge.delete` → 更新 cards state
