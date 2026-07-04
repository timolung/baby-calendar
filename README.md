# Baby Calendar

A small static calendar for planning baby care, family visits, time off, and schedule blocks across multiple months.

The app runs in the browser with plain HTML, CSS, and JavaScript modules. There is no build step and no package install required.

## Local Preview

Because the app uses JavaScript modules, preview it from a local web server:

```sh
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Data Source

Events are loaded from `js/config.js`.

```js
export const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1bcqLr9Ee2oXQY5Id28onFIn48Zo8H4Zta7dKjRL3WUM/edit#gid=1547928087";
export const GOOGLE_SHEET_CATEGORIES_URL = "https://docs.google.com/spreadsheets/d/e/.../pub?gid=470538468&single=true&output=csv";
```

When `GOOGLE_SHEET_URL` is empty, the app uses the sample events in `js/sampleEvents.js`.

`GOOGLE_SHEET_URL` can be either:

- a public Google Sheet share URL
- a published Google Sheet CSV URL
- any direct CSV URL

The Google Sheet CSV is expected to have these columns:

```csv
title,start,end,category,notes,category_label,category_color
Baby born,2026-09-11,2026-09-12,baby,,Baby milestone,#C9694F
Family visit,2026-09-14,2026-10-11,family,,Family visit,#6E8F73
```

Dates should use `YYYY-MM-DD`. Supported categories are defined in `js/categories.js`:

- `baby`
- `family`
- `shay`
- `vacation`
- `tbd`

Unknown categories are shown as `tbd`.

Category labels and colors can be loaded from the event CSV columns `category_label` and `category_color`. They can also be loaded from a separate Google Sheet CSV if that tab is publicly published. A separate categories sheet should have these columns:

```csv
key,label,color
baby,Baby milestone,#C9694F
family,Family visit,#6E8F73
```

The event `category` value must match a category key to use that label and color.

For Google Sheets:

1. Create a sheet with the columns above in the first row.
2. Add one event per row.
3. Make the sheet public enough for the browser to fetch it.
4. Paste the Sheet URL into `GOOGLE_SHEET_URL` in `js/config.js`.

The current event sheet is:

```text
https://docs.google.com/spreadsheets/d/1bcqLr9Ee2oXQY5Id28onFIn48Zo8H4Zta7dKjRL3WUM/edit#gid=1547928087
```

The current categories tab is:

```text
https://docs.google.com/spreadsheets/d/1bcqLr9Ee2oXQY5Id28onFIn48Zo8H4Zta7dKjRL3WUM/edit#gid=470538468
```

For GitHub Pages, the configured CSV URL must be anonymously readable. The current setup uses the public `Events` CSV with `category_label` and `category_color` columns, so the page does not require the separate `Categories` tab to be public.

## Project Structure

```text
index.html          App shell
css/styles.css      Layout, calendar, sidebar, and modal styles
js/main.js          Startup, event loading, and controls
js/render.js        Calendar, legend, and event-list rendering
js/modal.js         Event detail modal
js/dom.js           Small DOM helpers
js/dateUtils.js     Month grids and date formatting
js/categories.js    Category labels and colors
js/sheets.js        CSV loading and parsing
js/sampleEvents.js  Built-in fallback data
```

## Notes

- Events are edited in the source Google Sheet once connected.
- The sidebar moves below the calendar at `700px` and narrower.
- The app intentionally avoids a framework so it can stay easy to deploy as static files.

## Styling

Use the design tokens at the top of `css/styles.css` before adding new one-off values. Shared UI should follow the existing patterns there:

- `--color-*` for palette changes
- `--space-*` for layout gaps
- `--radius-*` for rounded corners
- `.control-btn`, `.seg`, and `.stepper` for header controls
- `.month-card` and `.sidebar` for framed surfaces
