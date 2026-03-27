## 1. SQLite Schema Migration

- [x] 1.1 Drop `objects`, `relations` tables; create `records` table with fields `id`, `skill_name`, `input`, `output`, `error`, `created_at`
- [x] 1.2 Update database initialization code in main process to use new schema
- [x] 1.3 Expose `context:insert` and `context:query` IPC channels from main process
- [x] 1.4 Add `context:query` and `context:insert` to preload bridge

## 2. Skill Manifest Schema

- [x] 2.1 Define TypeScript type for Skill manifest (`name`, `displayName`, `description`, `inputSchema`, `outputSchema?`)
- [x] 2.2 Update `subtitle-translator/manifest.json` to new schema (remove `plugin_type`, `permissions`, `output.auto_create_object`; add `inputSchema`, `outputSchema`)

## 3. Skill Host — Discovery & Loading

- [x] 3.1 Implement `skills/` directory scanner that finds subdirectories with `manifest.json`
- [x] 3.2 Validate manifest format; log and skip invalid manifests
- [x] 3.3 Detect presence of `ui.tsx` per Skill and include `hasUI` in registered metadata
- [x] 3.4 Expose `skills:list` IPC channel returning registered Skills metadata

## 4. Skill Runner

- [x] 4.1 Implement Skill runner that loads `.env` from `skills/<name>/.env` before execution
- [x] 4.2 Runner imports and calls Skill's `core.ts` default export with validated input
- [x] 4.3 Runner writes success record to Context Store (`skill_name`, `input`, `output`, `created_at`)
- [x] 4.4 Runner catches errors and writes failure record to Context Store (`output=null`, `error` message)
- [x] 4.5 Expose `skills:run` IPC channel; push result back to renderer via `skills:result`

## 5. Skill SDK — Update subtitle-translator

- [x] 5.1 Rewrite `subtitle-translator/core.ts` to call Anthropic SDK directly (remove `context.llm.ask()`)
- [x] 5.2 Add `subtitle-translator/.env` with `ANTHROPIC_API_KEY` placeholder
- [x] 5.3 Update `subtitle-translator/ui.tsx` to use new `onRun(input)` / `result` props interface

## 6. Electron Shell — Sidebar & Routing

- [x] 6.1 Replace sidebar navigation (remove Inbox, Today View, Toolbox items)
- [x] 6.2 Sidebar renders dynamic list of Skills from `skills:list` IPC response
- [x] 6.3 Clicking a Skill navigates main content area to that Skill's route
- [x] 6.4 Skill route renders `ui.tsx` component if `hasUI=true`, otherwise renders auto-generated form from `inputSchema`
- [x] 6.5 Auto-generated form submits via `skills:run` IPC and displays result from `skills:result`
- [x] 6.6 Add empty state UI when no Skills are found in `skills/`
- [x] 6.7 Remove (or hide) Inbox and Today View routes from primary navigation (preserve code)

## 7. Cleanup

- [x] 7.1 Remove `plugins:list`, `plugins:run`, `plugins:status` IPC channels (replaced by `skills:*`)
- [x] 7.2 Remove `inbox:infer` IPC channel from main process and preload bridge
- [x] 7.3 Delete or archive old plugin SDK code (`context.llm.ask`, `context.tools.*`, `context.store.*`)
- [x] 7.4 Remove `~/.life-console/plugins/` scanner logic
