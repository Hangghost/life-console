## 1. Project Scaffolding

- [ ] 1.1 Initialize Electron + React + TypeScript project (electron-forge or electron-vite)
- [ ] 1.2 Set up directory structure: src/main, src/renderer, src/shared, src/preload
- [ ] 1.3 Configure contextBridge preload script with typed API stub
- [ ] 1.4 Install and configure better-sqlite3 with electron-rebuild
- [ ] 1.5 Verify dev server: Electron window opens with React rendering "Hello World"

## 2. Object Model & Database

- [ ] 2.1 Create SQLite schema: objects table, relations table, FTS5 virtual table
- [ ] 2.2 Implement db/queries.ts: create, read, update, softDelete for objects
- [ ] 2.3 Implement db/queries.ts: create and query for relations
- [ ] 2.4 Implement full-text search query using FTS5
- [ ] 2.5 Define TypeScript types in shared/types.ts (Object, Task, Note, InboxItem, WorkflowRun, Relation)

## 3. IPC Layer

- [ ] 3.1 Implement ipc/objects.ts: register handlers for objects:create, objects:update, objects:query, objects:delete
- [ ] 3.2 Implement ipc/search.ts: register handler for search:query
- [ ] 3.3 Expose all IPC channels via preload contextBridge with typed API
- [ ] 3.4 Create renderer-side useIPC hook or api module for calling IPC channels

## 4. Electron Shell & Navigation

- [ ] 4.1 Implement App.tsx with Sidebar layout (fixed left nav + main content area)
- [ ] 4.2 Add navigation items: Inbox, Today, Toolbox, Search
- [ ] 4.3 Implement client-side routing between pages (InboxPage, TodayPage, ToolboxPage)
- [ ] 4.4 Implement basic Settings page with API key input (stored via IPC to main process)

## 5. Inbox Module

- [ ] 5.1 Implement InboxPage: list all inbox_item objects, ordered by created_at desc
- [ ] 5.2 Implement inbox text input component (free-form text → objects:create)
- [ ] 5.3 Implement ai/inference.ts: Claude API call with structured JSON prompt for type inference
- [ ] 5.4 Implement ipc/inbox.ts: trigger async inference on inbox_item creation, push result via inbox:infer
- [ ] 5.5 Implement confirmation UI component: show suggested type/properties, confirm/override/keep buttons
- [ ] 5.6 Implement in-place upgrade logic: update object type and properties on confirmation, record user_corrections
- [ ] 5.7 Handle missing API key: skip inference, show setup prompt

## 6. Today View Module

- [ ] 6.1 Implement scoreTask() function with urgency_score + priority_score + staleness_score
- [ ] 6.2 Implement TodayPage: query tasks (todo/in_progress), sort by score, display list
- [ ] 6.3 Display estimated daily total time (sum of estimated_minutes)
- [ ] 6.4 Implement task status actions: toggle todo → in_progress → done from the list

## 7. Plugin System

- [ ] 7.1 Implement plugins/loader.ts: scan plugin directory, parse and validate manifest.json
- [ ] 7.2 Implement permission confirmation dialog component
- [ ] 7.3 Implement ipc/plugins.ts: handlers for plugins:list, plugins:run, plugins:status
- [ ] 7.4 Implement plugins/runner.ts: require workflow entry, inject WorkflowContext, execute run()
- [ ] 7.5 Implement WorkflowContext: llm.ask (Claude API), tools.fetchUrl, tools.readFile, tools.writeFile, store.create, store.query
- [ ] 7.6 Implement output_mapping: parse manifest template, create object + produces relation on completion
- [ ] 7.7 Implement ToolboxPage: display plugin cards, input form generation from input_schema, execution status

## 8. Search

- [ ] 8.1 Implement search UI: search input in sidebar or dedicated search overlay
- [ ] 8.2 Connect to search:query IPC channel, display results with object type badge

## 9. LearningHacker Plugin (End-to-End Validation)

- [ ] 9.1 Create plugins/learning-hacker/manifest.json with input_schema and output_mapping
- [ ] 9.2 Implement plugins/learning-hacker/workflow.ts: fetchUrl → llm.ask → return result
- [ ] 9.3 End-to-end test: run LearningHacker from Toolbox, verify note object is created with correct relation

## 10. PhotoSift Quick-Launch

- [ ] 10.1 Create PhotoSift card in Toolbox that launches external application via shell.openExternal or child_process
