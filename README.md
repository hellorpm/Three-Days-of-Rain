# TDR site scripts & styles

Custom CSS and JavaScript for the Three Days of Rain (TDR) Squarespace site.
Most of the dynamic content (quotes, FAQs, cast, creative team, calendar, videos)
is read from a Google Sheet at page load and rendered by these scripts.

## Layout

```
css/    one stylesheet per feature (source, edit these)
js/     one script per feature (source, edit these)
dist/   GENERATED bundles: tdr.css and tdr.js (do not edit by hand)
build.js  combines css/ and js/ into dist/
```

## Building

Requires Node.

```
node build.js
```

Run it from the repo root after editing anything in `css/` or `js/`, then commit
the updated `dist/` files along with your source changes.

- `dist/tdr.css` = the files in the `CSS` array in `build.js`, in that order.
- `dist/tdr.js` = the files in the `JS` array, in that order. Each file is wrapped
  in its own `try/catch`, so an error in one module doesn't stop the others.
- The build fails on a JS syntax error rather than writing a broken bundle.
- **Adding a new file:** create it in `css/` or `js/`, then add it to the `CSS` or
  `JS` array in `build.js`. The build warns by name about any file in those
  folders that is neither bundled nor listed in `EXCLUDED`.
- Each build stamps a timestamp in the banner of the dist files, so `dist/` will
  show as changed after every build even if the sources didn't change.

### Not in the bundle

`tdr-videos.js` and `tdr-videos.css` are deliberately excluded (see `EXCLUDED` in
`build.js`). They are loaded separately, only on the page that needs them.

## Modules

| Module | Files | Mount point on the page | Sheet tab |
|---|---|---|---|
| Quotes slider | `tdr-quotes.js` | `#quotes-slider` | `Quotes` (A:B) |
| Calendar | `tdr-calendar.js/.css` | `#tdr-calendar` | `Calendar` (A:G) |
| Slide-out menu | `tdr-menu.js/.css` | `#tdr-menu`, `.tdr-menu-toggle`, `.tdr-menu-overlay` | none |
| FAQs | `tdr-faqs.js/.css` | `#tdr-faq` | `FAQs` (A:B) |
| Cast | `tdr-cast-creative.js/.css` | `#tdr-cast` (modal: `#tdr-cast-modal`) | `Cast` (A:J) |
| Creative team | `tdr-creative.js/.css` | `#tdr-creative` (modal: `#tdr-creative-modal`) | `Creative` (A:J) |
| Shared styles | `tdr-new.css` | n/a | n/a |

Each module quietly does nothing if its mount point isn't on the page, so it's
safe to load the whole bundle on every page. Console messages are prefixed with
the module name, e.g. `[TDR Calendar]`.

### Calendar

Month grid of performances (a vertical list on narrow screens), each linking to
the ticketing site. Each date in the run is one sheet row:

| Col | Content |
|---|---|
| A | DATE, `MM/DD/YYYY` |
| B | Matinee time, e.g. `2:00 PM` (blank = no matinee) |
| C | Matinee "best available" checkbox |
| D | Evening time (blank = no evening) |
| E | Evening "best available" checkbox |

`tdr-calendar.js` also defines the small shared helper object (`window.TDR`) that
it needs. No other module uses it.

## Deploying to Squarespace

<!-- Fill in how dist/tdr.css and dist/tdr.js are served on the TDR site (header
     code injection, a hosted URL, pasted inline, etc.) so the next person
     doesn't have to guess. -->

The calendar's setup notes call for the CSS in the page `<head>` and the JS loaded
with `defer`. `build.js` lists the files in the same order the Squarespace
header injection used.
After rebuilding, re-publish the updated `dist/` files wherever they're served, and
hard-refresh to bypass caching.

## Conventions

- CSS classes use the `tdr-` prefix (BEM-style, e.g. `tdr-calendar__day`) so they
  can't collide with Squarespace's own classes.
- Content is edited in the Google Sheet, not in these files. The quotes slider
  accepts a small set of HTML tags in the sheet (`<br>`, `<em>`, `<i>`,
  `<strong>`, `<b>`); anything else is escaped.
- Don't edit anything in `dist/`. It's overwritten on every build.