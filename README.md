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

## Modules

| Module | Files | Mount point on the page | Sheet tab |
|---|---|---|---|
| Quotes slider | `tdr-quotes.js` | `#quotes-slider` | `Quotes` (A:B) |
| Calendar | `tdr-calendar.js/.css` | `#tdr-calendar` | `Calendar` (A:G) |
| Header bar & slide-out menu | `navbar.js`, `tdr-header.css`, `tdr-menu.js/.css` | built by `navbar.js` (none needed on the page) | none (see *Navbar config*) |
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

### Navbar config

`navbar.js` builds the fixed header and the slide-out menu on every page, so no
header or code block is needed on the pages. Squarespace's own header is hidden
in `tdr-header.css`. `tdr-menu.js` then adds the open/close behavior, so it
must stay after `navbar.js` in `build.js`.

The editable content lives in the Squarespace site-wide code injection (below
the tdr.css / tdr.js includes), so changing it doesn't need a commit:

```html
<script>
window.TDR_NAV = {
    lines: ['The Pulitzer Prize Finalist On', 'Broadway for 16 Weeks Only'], // 1 or 2 lines
    ticketsUrl: 'https://example.com/tickets',   // '' = no button
    ticketsLabel: 'Get Tickets',                 // optional
    links: [
        { label: 'Home',    href: '/' },
        { label: 'Tickets', href: '/tickets' }
    ],
    excludePaths: ['/landing', '/events/*']      // optional: pages with no header
};
</script>
```

`excludePaths` entries are page paths (case and trailing slash are ignored; a
trailing `*` also matches everything under that path). On an excluded page no
header is built and Squarespace's own header stays hidden. There may be a brief
flash of the reserved header bar on those pages while the deferred script loads.

A single page can instead opt out without path matching: in that page's Page
Settings > Advanced > Page Header Code Injection, add
`<script>document.documentElement.classList.add('tdr-no-nav');</script>`.
That runs before the page paints, so there is no flash.

The header color and height are CSS variables at the top of `tdr-header.css`.

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