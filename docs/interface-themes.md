# Interface themes

Open **Settings → Appearance → Interface theme** to choose Paper & ink, Silver mist,
Rose sand, or Original dark. Changes apply immediately and survive a restart.
Paper & ink is the default for installations that have not selected a theme yet.

Each preset supplies semantic surface, text, border and status colours, plus a
recommended accent and code palette. Selecting a preset resets those two choices;
they can then be adjusted independently below the picker. Bright custom accents
are displayed in a darker tone on light surfaces so accent text stays legible.
Story backgrounds and saved profile colours are not rewritten.

Presets also control the existing interface's material: corner radii, panel edges,
subtle surface shading, resting input depth and button highlights. They preserve
the layout and control sizes. Paper & ink has smaller, matte corners; Silver mist
has precise medium corners and a slight lift; Rose sand has softer, wider curves
and warm shadows. These choices use the same theme preference as the colours.
Full circles, individual corner treatments, keyboard focus rings and image-backed
workspace surfaces keep their existing roles. Returning to Original dark clears
the light material variables as well as the palette.

Palette definitions and contrast helpers live in
`src/renderer/features/settings/interfaceThemes.js`. Add a light preset to
`LIGHT_THEMES` with the same colour roles, then translate its label and description
in the locale pack. Shared light-surface styling lives in `lightThemes.css` next to
that module. Original dark uses the existing CSS defaults. The preference is
stored in `settings.interface.theme`; a small local cache restores its colours
before React renders. There is no external theme-file import yet.

`tests/interface-themes.test.ts` checks normal reading text against all principal
light surfaces at a minimum 4.5:1 contrast ratio, custom accent adaptation, legacy
settings and cleanup when returning to dark mode. This does not imply that every
existing image-backed screen or user-supplied colour has passed an accessibility
audit.
