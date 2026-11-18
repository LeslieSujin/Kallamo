# Interface localization

The `zh-cn` branch adds an interface-language layer to the upstream application.
Select **Settings → Appearance → Interface language → 简体中文**. The selection is
saved on this computer and applied without restarting.

## Language packs

Packs live in `src/renderer/i18n/locales/`. Each pack exports a display `label`
and a `messages` object. Both flat keys and nested keys are supported. An absent
translation falls back to the English pack, an explicit fallback, or the source
text, in that order. This means a new upstream label remains readable before it
is translated.

Components read `t` from `useI18n()`:

```jsx
const { t } = useI18n();
t('Save changes');
t('settings.appearance', 'Appearance');
t('Options for {title}', { title: workspace.title });
```

Keep variables inside named placeholders and preserve all placeholder names in
translations. Use separate singular and plural English source strings when
needed. Import a new pack and call `registerLocale` before mounting the provider
to add another bundled language. Runtime registration is a source extension
point; there is no file-import button for external packs yet.

Translate interface copy at its display site. Keep API values, enum identifiers,
saved document text, user names, custom field labels, model identifiers, and AI
prompts unchanged. Translate built-in option labels while retaining their stored
values. When templates override a default label, retain the user's replacement.

## Current coverage

Simplified Chinese covers the dashboard, Library, connection and appearance
settings, chat controls, memory management, Writing Desk controls, worldbuilding
editors, calendars, resources, progression, skills, narrative review and many
dialogs. Some generated diagnostic sentences, onboarding guides, backend error
messages and release notes still use English. This is an incremental translation,
not a claim of complete coverage.

## Keeping the fork current

Keep `main` aligned with the official repository and keep localization on
`zh-cn`. To update, commit current work, fetch `upstream`, and merge the upstream
default branch into `zh-cn`. Resolve conflicts around interface copy, add any new
translations, then run `npm test` and `npm run build`. Keep language-pack changes
separate from unrelated application behavior to make later merges easier.

A public GitHub Release or installer is not required for personal use. Build an
unpacked desktop application with `npm run pack` and run the executable under
`release/win-unpacked/`. Distribution and automatic update publishing are separate
from source synchronization; merging upstream does not update an already built
local executable.
