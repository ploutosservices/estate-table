# estate-table

One look and one behaviour for plain HTML tables — a stylesheet and a small script. Sort, filter, format, page, and
copy to a spreadsheet or an email. No framework, no build step, nothing generated: you write a normal `<table>`, add class
names, and link two files. With JavaScript off, the reader still gets the whole table.

## Use it

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ploutosservices/estate-table@1/table/estate-table.css">
<script src="https://cdn.jsdelivr.net/npm/@ploutosservices/estate-table@1/table/estate-table.js" defer></script>
```

(or `https://unpkg.com/@ploutosservices/estate-table@1/table/…`, or `npm install @ploutosservices/estate-table`).
`@1` follows every 1.x release; pin an exact version (`@1.0.0`) to freeze it. The icons the stylesheet draws are
loaded from `../icons/` beside it, so keep the package's folders together if you host the files yourself.

**See it working:** https://cdn.ploutos.xyz/estate/table/example.html — the classes and behaviours on invented data.
The package also carries `table/example.html`, a test page with one table per behaviour; `table/example-react.html`,
the same tables mounted by React; and `table/example-needs.html` with `table/example-needs-server.js`
(`node example-needs-server.js 8080` from the package folder) for the Excel button and the peek card.

**The whole contract** is `SPEC.md`: every class and attribute, what each does, and which renderer has measured it.
Questions and issues: https://github.com/ploutosservices/estate-table/issues

## Under React

The plain script works under React as it is. Where React owns the rows, `table/estate-table-react.js` is a second
renderer of the same markup — one ES module, no JSX, no build; `react` and `react-dom` are your page's imports:

```js
import { Estate } from '@ploutosservices/estate-table/table/estate-table-react.js';
// <Estate>{ the same markup: a box with its band, scroller and footer, or a plain table }</Estate>
```

`Estate` takes no prop but its children. Every row and cell must be an element in the tree you give it — a component
may draw what is inside a cell, never a row or a cell itself. `SPEC.md` marks what it has not built (`estate-copy-box`
draws each table's own copy pair instead).

## The skeleton

```html
<div class="estate-table-box">
  <div class="estate-table-title">Payments</div>
  <div class="estate-table-scroll">
    <table class="estate-table estate-sort estate-filter estate-copy">
      <thead><tr><th>Date</th><th>Payee</th><th class="estate-num">Amount</th></tr></thead>
      <tbody>
        <tr><td>2026-10-01</td><td>ACME</td><td class="estate-num">1,250.00</td></tr>
        <tr class="estate-total"><td>Total</td><td></td><td class="estate-num">1,250.00</td></tr>
      </tbody>
    </table>
  </div>
  <div class="estate-table-footer">1 row</div>
</div>
```

## The look — classes

| class | on | what it does |
|---|---|---|
| `estate-table-box` · `estate-table-title` · `estate-table-actions` · `estate-table-toolbar` · `estate-table-scroll` · `estate-table-footer` · `estate-table-note` | the wrapper and its parts | framed box, title band with buttons at its right, a strip for your own controls, a wide table scrolling inside, a footer band; a plain line under a table outside any box |
| `estate-table` | `table` | the table itself |
| `estate-num` | `td` and its `th` | right-aligned, tabular figures |
| `estate-text` · `estate-sm` · `estate-mono` · `estate-center` · `estate-nowrap` | cells | body size · small · monospace · centred · never wraps |
| `estate-action` · `estate-link` · `estate-label` | cells | narrow icon column · hand cursor and hover tint · label column of a label/value table |
| `estate-total` · `estate-row-section` | `tr` | totals row · group band |
| `estate-fit` · `estate-numbered` · `estate-striped` · `estate-top` | `table` (`estate-fit` on the box too) | content width · a row-number column · visible stripes · top-aligned cells |
| `estate-sticky` | the box | the header row stays in view while the table scrolls inside the box; `data-rows="8"` or `data-height="calc(100vh - 12rem)"` on the box says how tall |
| `estate-narrow` · `estate-medium` | the box | at most 32rem · 42rem wide |
| `estate-pin` | a column's `th` and `td`s | the column stays in view while a wide table scrolls sideways (the script places a second pinned column after the first) |
| `estate-link` holding one `<a>` | `td` | the link fills the cell |
| `estate-tint-primary` … `-dark` | `table`, `tr`, `td`, `th` | eight hand-picked tints |

Every colour, size and space is a CSS variable (`--estate-table-*`) at the top of the stylesheet — override them on
`:root` to restyle.

## The behaviour — opt in by class

| class / attribute | on | what happens |
|---|---|---|
| `estate-sort` | `table` | click a header (or Enter): ascending, descending, back to the opening order; shift-click adds a column after the ones in force |
| `data-sort-by="3 desc, 1"` | `table` | the order the table opens in (columns from 1) |
| `estate-filter` | `table` | one box above the table — every word typed must appear in the row; "N of M shown" |
| `estate-filter-columns` | `table` | a row of boxes under the headers, one per column, all applied together: text matches any part of the value (the column's values are offered as you type); a number column also takes `>1000`, `<=50`, `=50`, `1000..5000`; a filtering column's header is marked; a button in the bar, or `f` while you are in the table, shows or hides the row |
| `estate-drop-empty` | `table` | hides every column whose data cells are all empty (totals and group bands do not count; an icon does); re-judged after every filter, so a column comes back when a row that fills it does |
| `estate-text-filter` | `th` | this column's box is always text, even when every value is a number |
| `estate-as-text` · `estate-id` | `th` | the column is text for every rule · holds identities (by size when all digits, never formatted, every digit kept in a copy) |
| `estate-keep` | `th` | the column stays under `estate-drop-empty` even when empty |
| `data-filter-row="hidden"` | `table` | the column boxes open hidden until the reader chooses |
| `estate-format` | `th` or `table` | numbers formatted: grouped thousands, `data-decimals` on the `th` or table, else the most any value shows; the copy carries the value as it arrived |
| `estate-sum` | `td` in a `tr.estate-total` | the script writes the column's sum over the rows the filters leave |
| `estate-page` | `table` | a pager in the footer: `data-page-size`, `data-page-sizes="5 10 20"`, the reader's choice remembered under `data-store="key"` |
| `data-total="631"` | `table` | the rows are part of a larger set on the server; the count says so |
| `data-href="…"` | `td.estate-link` | the cell opens the address: a click, a Ctrl- or middle click (new tab), Enter |
| `data-source="#id"` | `table` | the copy and the export read that other (hidden, fuller) table |
| `estate-excel` | `table` | an Excel button beside the copy button when a workbook writer is on the page (a global `ExcelJS`); inert without one. `data-excel-href="…"` and `data-excel-title="…"` make it a link to your own workbook instead |
| `data-peek="…"` | any element in the table | hovering or focusing it shows a card holding what the address answers (fetched once, as the page itself would) |
| `estate-resize` | `table` | drag a header's right edge to make the column wider or narrower; remembered under `data-store` |
| `estate-copy` | `table` | a copy button (title band, else caption, else a bar above the table): `text/html` with inline styles for Excel, Google Sheets and Gmail, plus tab-separated `text/plain` |
| `estate-no-sort` | `th` | this column is not sortable |
| `estate-sort-abs` | `th` or `table` | numbers sort by size, sign ignored |
| `estate-copy-body` | `table` | the copy leaves the `tfoot` out |
| `estate-copy-markup` | `table` | a second button copying the table's HTML as text — structure and cell text only, for a page's source |
| `estate-keep-foot` | `table` | the `tfoot` rows stay shown while a filter narrows the rows |
| `estate-copy-box` | `.estate-table-box` | one copy pair on the box's band copies every table in the box, in order; no table in it draws its own |
| `data-sort="…"` | `td` | sort the cell by this value instead of its text |
| `data-raw="…"` | `td` | the plain-text copy carries this value instead of the formatted text |

- **A column has one type, or it is text:** dates (ISO — a timestamp with a zone such as `Z` or `-04:00` is compared
  in UTC — `11 May 2011`, `May 11, 2011` — never `05/11/2011`, which means two different days), phone numbers
  (`(305) 555-1212`, `305.555.1212`, `+1 305 555 1212` — compared as digit strings), numbers (`$1,234.50`, `-1,234.50`,
  `(1,234.50)`, `12%`), else text — case- and accent-insensitive, `Item 9` before `Item 10`. Empty cells sort last
  both ways.
- **Groups and totals stay in place:** rows sort within each group band — a `tr.estate-row-section`, or any row that is
  one cell spanning the table — and an `estate-total` row stays after the rows it sums. While a filter narrows the
  rows, totals (in the body or the `tfoot`) are hidden: they no longer sum what is shown — unless the script sums them
  (`estate-sum`), which is true again.
- **A copy is what is shown:** current order, filtered-out rows and hidden columns left out, numbers unformatted in
  the plain text (as text: a long id keeps every digit).
- A table added after load: `document.dispatchEvent(new Event('estate:tables-added'))`, or `EstateTable.init(root)`.
  `data-manual` on the script element stops it decorating anything on load, so your announcement, or `EstateTable.init`/`.refresh`, is the only start.
- A cell may hold a form control: a select is what it shows, a checkbox ✓ or nothing, a field its value. A header that
  shows only an icon is labelled by its `aria-label`. `EstateTable.tooltip = (node, text) => …` draws the script's
  tooltips your way.
- **Rows that change after load need nothing:** each table watches its own body, so rows a framework re-renders or a
  reload replaces get the current sort, filters and empty-column hiding, and a table drawn empty gets its controls when
  its rows arrive. To say it yourself: dispatch `estate:rows-changed` on the table, or call `EstateTable.refresh(root)`.

## Licence

Apache License 2.0 — see `LICENSE`. The icons in `icons/` are from [Heroicons](https://heroicons.com) (MIT); see
`NOTICE`.
