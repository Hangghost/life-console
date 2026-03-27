## ADDED Requirements

### Requirement: 使用者可從 KnowledgePage 刪除單張卡片
KnowledgePage 的每張 CardItem SHALL 顯示 Delete 按鈕。點擊後 SHALL 彈出確認提示，確認後 SHALL 呼叫 `knowledge:delete` IPC channel 刪除磁碟上的 `.md` 檔案，並從 UI 的卡片列表中移除該卡片。

#### Scenario: 使用者確認刪除
- **WHEN** 使用者點擊某張卡片的 Delete 按鈕
- **THEN** 出現確認提示
- **WHEN** 使用者確認
- **THEN** 該卡片的 `.md` 檔案從磁碟刪除
- **THEN** 該卡片從 UI 列表中消失

#### Scenario: 使用者取消刪除
- **WHEN** 使用者點擊 Delete 按鈕後取消確認
- **THEN** 不執行任何操作，卡片保持原狀

#### Scenario: 刪除不存在的檔案
- **WHEN** `knowledge:delete` 被呼叫但檔案不存在
- **THEN** main process 回傳 `{ success: false, error: string }`
- **THEN** UI 仍從列表中移除該卡片（容錯處理）

### Requirement: knowledge:delete IPC handler
Main process SHALL 註冊 `knowledge:delete` handler，接收 `filePath: string`，執行 `fs.unlinkSync(filePath)`，回傳 `{ success: boolean; error?: string }`。

#### Scenario: 成功刪除
- **WHEN** `knowledge:delete` 收到有效 filePath
- **THEN** 檔案從磁碟移除
- **THEN** 回傳 `{ success: true }`

### Requirement: preload 暴露 knowledge.delete API
`src/preload/index.ts` 的 `knowledge` 物件 SHALL 新增 `delete(filePath: string): Promise<{ success: boolean; error?: string }>` 方法。

#### Scenario: renderer 呼叫 delete
- **WHEN** renderer 呼叫 `api.knowledge.delete(filePath)`
- **THEN** 透過 IPC 轉發至 main process 的 `knowledge:delete` handler
