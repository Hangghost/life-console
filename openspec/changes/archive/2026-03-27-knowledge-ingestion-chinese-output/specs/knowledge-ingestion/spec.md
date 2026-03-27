## ADDED Requirements

### Requirement: LLM 輸出語言為繁體中文
Knowledge Ingestion 的 LLM system prompt SHALL 要求模型以繁體中文輸出 KnowledgeCard 的 topic、tags、content，專有名詞 SHALL 保留英文對照（如「知識卡片（KnowledgeCard）」）。

#### Scenario: 英文文章輸入，輸出中文 card
- **WHEN** 使用者輸入一篇英文文章進行 ingestion
- **THEN** 產出的 KnowledgeCard 的 topic 為中文標籤
- **THEN** 產出的 KnowledgeCard 的 content 為中文描述，技術術語附英文對照

#### Scenario: 中文文章輸入，輸出中文 card
- **WHEN** 使用者輸入一篇中文文章進行 ingestion
- **THEN** 產出的 KnowledgeCard 全部為繁體中文，專有名詞附英文對照

### Requirement: Fallback 解析路徑使用中文預設字串
當 LLM 輸出無法解析為 JSON 且 fallback 路徑啟動時，預設的 topic 字串 SHALL 為中文。

#### Scenario: LLM 輸出格式異常時 fallback
- **WHEN** LLM 回傳無法解析為 JSON 的純文字
- **THEN** fallback card 的 topic 為「擷取的知識」（而非英文 `Extracted Knowledge`）
