---
name: add-translations
description: Replace hardcoded user-facing text in Ember components/templates with ember-intl translations, adding English and Japanese entries to translations/en.json and translations/ja.json. Use when the user asks to translate component text, internationalize/i18n a component, or add missing translation keys.
---

# Add Translations

Replace hardcoded user-facing strings in Ember templates/components with
`{{t ...}}` / `this.intl.t(...)` lookups, keeping `translations/en.json` and
`translations/ja.json` in sync.

## Step 1 — Ask where new keys should live

**Always** ask the user (via AskUserQuestion) where new translation keys
should be added, e.g. "Root object" vs "A nested object (provide the name)".
**Default to the root object if they don't answer or skip the question.**

## Step 2 — Inventory hardcoded text

Scan the target component files (`.hbs` first, then `.ts` for notify/intl
strings) for user-facing text that is not already inside `{{t ...}}` or
`this.intl.t(...)`:

- Visible text content (typography, buttons, labels, headings, kbd hints)
- `aria-label`, `alt`, `placeholder`, `title` attributes
- Dynamic strings — use ember-intl placeholders: `"Screenshot of {title}"`
  and pass params: `{{t 'key' title=this.value}}`

Skip: values that come from API data, CSS class strings, test selectors.

## Step 3 — Search for existing translations BEFORE adding anything

For every string, search BOTH `translations/en.json` and
`translations/ja.json` for an existing key (match by value, case-insensitive,
and by likely camelCase key name):

```bash
grep -n '"close"' translations/en.json translations/ja.json
grep -in '"Close"' translations/en.json | head
```

Then apply these rules in order:

1. **Exists at the root** → use that key as-is. Do not duplicate it.
2. **Exists under another nested object** (e.g. `someModule.close`) → move it
   to the root object in BOTH language files, then update **every** usage of
   the old nested key across the app (`grep -rn "someModule.close" app/`),
   and use the new root key in the component being worked on.
3. **Does not exist** → add a new key in BOTH language files under the
   location chosen in Step 1.

## Step 4 — Add new keys

- Keys are camelCase; keep root-level keys in alphabetical order (match the
  file's existing ordering).
- Add the English value to `translations/en.json` and the Japanese value to
  `translations/ja.json` — never one without the other, and both files must
  keep identical key structure.
- If a nested object is requested but a root key with the same name already
  exists as a string (or vice versa), restructure: move the string into the
  object (e.g. `navigationGraph` → `navigationGraph.title`) and update all
  existing usages of the old key.

## Step 5 — Update the templates/components

- Templates: `{{t 'key'}}` or `{{t 'nested.key'}}`, attribute form
  `alt={{t 'key' param=value}}`
- TS/controllers: `this.intl.t('key')`

## Step 6 — Verify

```bash
jq -e . translations/en.json > /dev/null && jq -e . translations/ja.json > /dev/null && echo json-ok
npx ember-template-lint <changed .hbs files>
npx tsc --noEmit -p tsconfig.json
```

Also grep for any remaining usages of moved/renamed keys to confirm nothing
still references the old path.
