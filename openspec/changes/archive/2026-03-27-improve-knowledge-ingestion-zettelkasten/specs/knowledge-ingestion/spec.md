## MODIFIED Requirements

### Requirement: LLM 輸出語言為繁體中文
Knowledge Ingestion 的 LLM system prompt SHALL 要求模型以繁體中文輸出 KnowledgeCard 的 topic、tags、content，技術專有名詞 SHALL 保留英文對照（如「檢索增強生成（RAG）」）。System prompt SHALL 嵌入 Zettelkasten 三原則作為角色定義：原子性（每張卡片只討論一個核心概念）、自治性（脫離原文仍能完全理解）、以個人語言轉述（禁止直接剪貼原文）。

#### Scenario: 英文文章輸入，輸出符合 Zettelkasten 原則的中文 card
- **WHEN** 使用者輸入一篇英文技術文章進行 ingestion
- **THEN** 每張 KnowledgeCard 的 content 只討論一個概念（原子性）
- **THEN** content 為使用者語言的轉述而非原文翻譯（自治性 + 個人化）
- **THEN** topic 為 3-6 字的繁體中文標籤，技術術語附英文對照

#### Scenario: User prompt 包含 Zettelkasten 規則清單
- **WHEN** callLLM 被呼叫
- **THEN** user prompt 包含明確的卡片品質規則：原子性、自治性、以個人語言轉述、繁體中文輸出
- **THEN** JSON schema 的欄位說明（topic/tags/content）包含語言與品質要求
