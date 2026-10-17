# The estate table — one markup, any renderer

**What a reader sees is a renderer — a browser, a stylesheet and a script — interpreting markup. The contract — the
names and what each means — is the standard, and it stands on its own: its names come from what a person wants to see
or do with a table, and they change slowly. Renderers change all the time. The markup is the instance: an author
expresses a wish in the contract's names, and each renderer interprets and draws it in its own way.**

So this standard is a markup contract, and the contract is its most valuable part: a renderer can be rewritten in a
release, a name is worn by every page that ever used it. An author writes any `<table>` and says what they want in the
standard's names: a class on the table, a class on a header, an attribute on a cell. Nothing is generated for the
author and nothing is configured in code: the same markup is delivered to a page rendered by a server, by a template
engine, by a static site, or by a framework that re-renders in the browser.

**The standard is a superset, and it never compromises.** Every declaration that any table in the estate has ever
needed is listed here, once. A renderer delivers what it can; a declaration a renderer does not deliver yet keeps its
name and is marked with the reason, never dropped. A feature is never traded away because one renderer lacks it, and
no renderer gets a vocabulary of its own. Nobody is required to use any renderer, or this standard.

This document is written to be published with the files. Nothing in it is specific to the applications that first
wore it; their record is a separate file. Two words are used throughout: **in the files** means a renderer's files do
it at the commit that last changed them; **designed** means this document says it and the files do not yet.

## Renderers

A **renderer** is a browser, a stylesheet and a script, and whatever else its description says must be installed on
the page. There may be any number: nothing requires one stylesheet, nothing requires every renderer to deliver every
name, and anyone may write a renderer of their own for this contract. A page chooses its renderer by what it loads. A
browser is assumed to run JavaScript; what a page shows without it is the renderer's matter, not the contract's.

**What ships is only what this standard makes** — its stylesheets and scripts. A component another party makes (a
framework, a workbook writer) is never carried in a version; a renderer's description names it, with the version the
renderer was tested on, and the page installs it. A description says how this standard renders the contract; it does
not oblige anyone to install anything. A mark is true of the versions the description names; an upgrade is measured
again and the description says what changed.

| renderer | its files | what the page installs (tested version) | the page it is for |
|---|---|---|---|
| **plain** | `estate-table.css`, `estate-table.js` (one file, no framework, no build) | for `estate-excel`: a workbook writer as a global `ExcelJS` — ExcelJS 4.4.0 | a page whose markup arrives finished (a server-rendered page, a template, a static file; rows may still be appended or swapped later) — linked with `defer`, or anywhere after the table, a table added later announced with `estate:tables-added`; or a page a framework keeps re-rendering, under the ownership rule below, started after the framework has taken the page |
| **React** | `estate-table.css`, `estate-table-react.js` | React 19.3.0 and its DOM renderer `react-dom` 19.3.0 (the module imports `react` and, for `flushSync`, `react-dom`; a page without a bundler maps both in an import map); for `estate-excel`, ExcelJS 4.4.0 as above | a React page whose table rows and cells are written as elements (a component may draw inside a cell; a cell's text is read when its row renders) |

The plain and React renderers share the plain script's pure functions (what a cell holds, how two cells compare, the
column test, what a copy carries, the formatter, the opening order's parser): they sit between two marked comments in
the script, and `estate-table-core.js` in the repository holds that block byte for byte with an export tail, so a test
imports them without a page; the release refuses a script whose block differs from the core file. Whether two
renderers share code is decided by what serves the function, not by rule.

A declaration may also need an **address**: a door the page's own server answers (a row's detail, the record behind
an id). The renderer fetches it as the page itself would — same origin, the page's own credentials — and shows what
comes back. What the door answers is the application's; the standard only carries it.

**How a mark is earned.** The check page holds one table per declaration with its expected answers. A declaration is
marked **✓** for a renderer when the check page has been run under that renderer and every one of its checks passed. A
declaration that needs something installed or an address is measured on the check page's second page (§The check
page), with the need met; a run with the need absent proves only that the declaration draws nothing. A mark no run
backs is **—**, and the reason stands beside it. A renderer that draws or behaves differently from the expected answers
on a check says so beside its mark. The *plain under React* mark is the plain renderer's on the framework check page
(`example-react.html`, §The check page), every producer re-rendering its rows on a timer. The run that backs each mark
is named in the estate's record. A published version carries the contract and every renderer some page wears; a
renderer no page wears is kept in the repository and left out of the version.

## The files, and where they are

    <base>/estate/table/estate-table.css        the look
    <base>/estate/table/estate-table.js         the plain renderer's script
    table/example.html (in a published version) the check page: one table per declaration, the measurement

A further stylesheet or script — the React renderer's `estate-table-react.js`, in the files and not served at
`<base>` (an application wearing it carries it as its own module) — is one more file beside these, named in the
version that carries it. An address that serves the files may serve a page of its own beside
them (a public showcase); that page is the address's, not the check page, and is not measured. The check page's
companions (§The check page) are not served at `<base>`; a version's package carries `example-react.html` beside
`example.html` when it carries a framework renderer or a *plain under React* mark — the page that earned the mark
travels with it.

`<base>` is configuration in the application that links them, never an address written into its code. The file
names carry no version, so an edit reaches every page on its next load — which holds only while the address serves
them so that a browser asks again soon: a file cached for a year under a versionless name is a version in disguise.
The icons the stylesheet draws are loaded from `../icons/` beside it.

## The skeleton

```html
<div class="estate-table-box">
  <div class="estate-table-title">Payments
    <div class="estate-table-actions">…the author's own icon buttons…</div>
  </div>
  <div class="estate-table-scroll">
    <table class="estate-table estate-sort estate-filter estate-copy">
      <thead><tr><th>Date</th><th>Payee</th><th class="estate-num">Amount</th></tr></thead>
      <tbody>
        <tr><td>2026-10-01</td><td class="estate-link" data-href="…">ACME</td><td class="estate-num">1,250.00</td></tr>
      </tbody>
      <tfoot><tr class="estate-total"><td>Total</td><td></td><td class="estate-num">1,250.00</td></tr></tfoot>
    </table>
  </div>
  <div class="estate-table-footer">…a note; the pager when asked for…</div>
</div>
```

**Every part outside the `<table>` is optional, and leaving one out is how an author asks for less.** A table with no
title band has no band. A table with no footer has none; the one exception is `estate-page`, which makes a footer for
its pager when the author gave none — an `estate-table-footer` under a boxed table, an `estate-table-note` under a
plain one. A `<table class="estate-table">` outside any box is the **plain** variant — no
frame, no band — for a table that sits inside something already framed and titled. A box may hold more than one
table, each in its own `estate-table-scroll`, when the rows below belong to the rows above (a family's children under
its parents): one frame, not two boxes touching; the band and its buttons belong to the first table, and a later
table's own bar and buttons are made directly above it, inside its scroller. A browser is assumed to run JavaScript;
what a page shows without it is the renderer's, not the contract's. Under the plain renderer it is the whole
table in the author's order, its `estate-format` numbers as the producer wrote them and its `estate-sum` cells empty.

**The band's buttons — one convention, so every table's band reads the same.** Left to right: *New* (the estate add
icon alone); then the table's own verbs — copy, Excel, the author's — each as its icon alone, its words on hover and
in `aria-label`; then a way to another screen, as its words plus the estate go icon, always last. Every button in the
band is bare — an icon alone, or for the last one its words and an icon — in the band's colour, with no fill and no
outline at rest, never smaller than `--estate-table-target` each way, and hover draws a thin ring in the band's colour; its words keep the author's case. The copy and Excel buttons the script makes in a band follow it. In the table's own bar, or in a `caption`, there is no band colour to borrow, and they are the filled buttons the
stylesheet draws from `--estate-table-copy-bg` and `--estate-table-excel-bg`. A refused press on a bare button shows on the icon's colour
(`--estate-table-failed`), since there is no fill to turn red — the Excel button's brand mark, which has colours of its own, gives way to the failed icon in that colour.

**Facts the producer declares — one shape.** Some things a table needs are known only to what produced it: the
whole set's size when the page holds one slice, where the fuller set lives for an export, the address behind an id,
the order the table should open in. Every such fact is one `data-…` attribute written by the producer on the `table`
(or on the cell it belongs to) and read when the script needs it; the script sets none of them, save `data-raw`,
which it writes only where the author gave none and only when it formats or sums. The next fact is the next
attribute — never a new element, a script call or a configuration object. The ones named here: on the table
`data-sort-by`, `data-page-size`, `data-page-sizes`, `data-store`, `data-filter-row`, `data-total`, `data-source`,
`data-excel-href`, `data-excel-title`; on a `th` or the table `data-decimals`; on the box `data-rows`, `data-height`;
on a cell `data-sort`, `data-raw`, `data-href`, `data-peek`.

## The declarations — the superset

*Author* names are what you type; *script* names are what the script answers with (listed under *What the script
writes*). The look table needs no availability column: a class the stylesheet alone draws works under every renderer that links the stylesheet the
moment it is in it, so its only state is in the files or designed.

### Look — drawn by the stylesheet alone, so every renderer has them

| declaration | on | what it looks like | state |
|---|---|---|---|
| `estate-table-box` | the wrapper | slate border, rounded corners | in the files |
| `estate-table-title` | the band | slate band, white, small bold capitals, centred | in the files |
| `estate-table-actions` | inside the band | the author's buttons at the right edge, vertically centred | in the files |
| `estate-table-toolbar` | between the band and the table | a strip for the author's own controls (a search box of their own, a legend), in the bar's colours | in the files |
| `estate-table-scroll` | around the table | a wide table scrolls inside the box | in the files |
| `estate-table-footer` | under the table | the band's colours, centred | in the files |
| `estate-table-note` | under a table outside any box | a plain line in body text — the plain variant's footer; made by the script when `estate-page` asks for a pager and the author gave none | in the files |
| `estate-table` | `table` | full width, collapsed borders; header row light blue, bold dark text, left-aligned; body white, every even row tinted, a hairline between rows | in the files; the header row at the page's size (`--estate-table-size`) |
| `estate-num` | `td` and its `th` | right-aligned, tabular figures; the heading sits over its numbers | in the files |
| `estate-text` · `estate-sm` · `estate-mono` · `estate-center` · `estate-nowrap` | cells | body size · small · monospace · centred · never breaks mid-token (a date, an id) | in the files; the four names that carry a size — these three and `estate-label` — are matched on cells only (`td.estate-sm, th.estate-sm`, the same for `-text`, `-mono` and `-label`), so a size name on an element inside a small cell neither shrinks it twice nor lifts it to body size — a nested element inherits its cell's size |
| `estate-action` · `estate-link` · `estate-label` | cells | narrow centred icon column · hand cursor, tinted on hover · the names column of a label/value table: narrow, small, semibold, slate | in the files |
| `estate-link` holding one `<a>` — the link fills the cell, so the whole cell is the click and the address still works with JavaScript off | `td` | the link's `::after` stretched over the cell | in the files. Where a cell's only content is a link, the recommended spelling is `data-href` (behaviour, below): the text stays content and the whole cell is the click, wherever the script can be relied on; this spelling is for a page that must work with JavaScript off. There is no general rule beyond that; an author uses one or the other |
| `estate-total` | `tr` in `tbody` or `tfoot` | indigo tint, semibold, a heavier rule above, numbers in indigo | in the files |
| `estate-row-section` | `tr` | a group band: indigo, white small capitals — this is how rows are grouped under a heading: the author writes the band, and the sort and the filter keep the rows under it | in the files |
| `estate-fit` | the `table` and its box | the table as wide as its content, the frame shrinking with it | in the files |
| `estate-narrow` · `estate-medium` | the box | the box at most `--estate-table-narrow-w` (32rem) · `--estate-table-medium-w` (42rem) wide, for a short table that should not stretch across the page; the page's own margins around a table are the page's, not the table's | in the files |
| `estate-numbered` | `table` | a generated first column, `#` over it: body rows numbered in the order shown, hidden rows skipped (so a sort, a filter or a page renumbers), bands and totals not counted; a row's tint reaches its number; the number is CSS and travels in no copy or export | in the files |
| `estate-striped` | `table` | every even body row a clear tint; a tint, a meaning, a band or a totals row still wins | in the files |
| `estate-top` | `table` | body cells start at their row's first line, for rows whose cells run to different heights | in the files |
| `estate-sticky` | the box | the box grows to at most `--estate-table-sticky-h` (70% of the window), the table scrolls inside it and the header row stays at its top; tints and the sortable hover still paint a stuck heading | in the files |
| `estate-pin` | every cell of a column — its `th` and its `td`s | the column stays in view while a wide table scrolls sideways inside its box; a pinned column keeps its row's tint over the cells sliding under it. The stylesheet gives every pinned cell offset 0 and leaves its width natural; it cannot tell a second pinned column from the first, so with the stylesheet alone ONE column is pinned — a second would sit over the first. More than one pinned column is a behaviour (below) | in the files |
| `estate-tint-primary` · `-secondary` · `-success` · `-info` · `-warning` · `-danger` · `-light` · `-dark` | `table`, `tr`, `td`, `th` | eight hand-picked tints; the narrower element wins | in the files |
| `estate-cell-good` · `-flag` · `-join` · `-teacher` · `-student` | `td` | a meaning: all well (green) · wrong or overdue (red) · joined or matched (amber) · a teacher's cell (pale amber) · a student's cell (pale sky) | in the files |
| `estate-row-flag` · `estate-row-balancesheet` · `-incomeexpense` · `-equity` | `tr` | a meaning: a row needing attention (red) · a ledger's three kinds of row — balance sheet (sky), income and expense (amber), equity (violet) | in the files |

A meaning a program puts on a row or cell because of what the data says is a class here; a colour an author picks by
hand is one of the eight tints. An application adds no rule of its own to any of these names (rule 1).

### Behaviour — asked for by the author, answered by the script

| declaration | on | what happens | plain | plain under React | React | needs / notes |
|---|---|---|---|---|---|---|
| `estate-sort` | `table` | click a header, or Enter or Space on it: ascending, descending, back to the opening order; `aria-sort`, a tooltip and the estate sort mark on the header. A shift-click (or Shift+Enter) adds the column after the ones in force, turns it, then removes it; on the column the opening order names first, a plain click gives the other direction and the next click the opening order | ✓ | ✓ | ✓ | |
| `data-sort-by="3 desc, 1"` | `table` | the order the table opens in: columns by position counted from 1, each with `asc` (the default) or `desc`, the first named sorting first; the third click of the cycle returns to this order, or to the author's order when it is not given. The headers it names are marked as sorted; `data-estate-sort` stays empty, which means the opening order; an item that names no column of the table is ignored | ✓ | ✓ | ✓ | with `estate-sort` |
| `estate-no-sort` | `th` | this column is not clickable; an unlabelled column never is | ✓ | ✓ | ✓ | |
| `estate-pin` on more than one column | the cells of each pinned column | the script writes each later pinned column's offset (`left`, script state) from the measured widths of the pinned columns before it, re-measured whenever a width can change — the columns change, the rows change, a pinned column is resized, the window is resized; the first keeps the stylesheet's 0. A pinned column is as wide as its content; a narrower one would be a width on a column, which rule 1 does not allow, so a need for one is a name here first. The script's own filter-row cell under a pinned column is pinned with it | ✓ | ✓ | ✓ | Without the script, pin one column (look, above) |
| `estate-sort-abs` | `th` or `table` | numbers sort by size, sign ignored | ✓ | ✓ | ✓ | |
| `data-sort="…"` | `td` | sort this cell by this value, not its text | ✓ | ✓ | ✓ | |
| `estate-filter` | `table` | one box in the table's bar; every word typed must appear in the row; "N of M shown" while a filter is live | ✓ | ✓ | ✓ | |
| `estate-filter-columns` | `table` | a row of boxes under the headers, one per labelled column, all applied together with the bar's box: text matches any part of the value and the column's values are offered as you type; a number column takes `>1000`, `<=50`, `=50`, `1000..5000`; a filtering column's header is marked; a button in the bar, or `f` while focus is in the table or its box and not in a text box (never page-wide: a single-key shortcut that works everywhere breaks WCAG 2.1.4), shows or hides the row, and the reader's choice is remembered | ✓ | ✓ | ✓ | |
| `data-filter-row="hidden"` | `table`, with `estate-filter-columns` | the state the column boxes open in when the reader has made no choice — `shown` (the default) or `hidden`, for a wide screen that opens quiet; the reader's choice, once made, outranks it and is remembered under `data-store` when the table names one (that table then never reads the browser-wide key, and its toggle changes it alone), else under the one browser-wide key (and the toggle changes every such table) | ✓ | ✓ | ✓ | |
| `estate-text-filter` | `th` | this column's box is always text, even when every value is a number (an id, a code) | ✓ | ✓ | ✓ | |
| `estate-as-text` | `th` | this column is text for every rule — sort, filter, format, copy — whatever its values look like | ✓ | ✓ | ✓ | |
| `estate-id` | `th` | this column holds identities: sorted by size when every non-blank value is digits (compared by length, then digit by digit, so no digit is lost), never formatted, the copy and the export keep every digit (a leading zero included), and its filter box is text | ✓ | ✓ | ✓ | |
| `estate-format` | `th`, or `table` for every number column | the script formats each number in the column's body and `tfoot` cells — grouped thousands, the decimals `data-decimals` gives, else the most decimals any value in the column shows — and keeps the text it found in `data-raw` where the author gave none, so the plain copy and the export carry the value as it arrived; a column marked `estate-as-text` or `estate-id` is never formatted. A cell is formatted when the whole of its text is a number the sort reads — a currency sign before it and a `%` after it are kept, an accounting negative becomes a minus — in the one notation the sort reads back (`1,234.50`); a cell holding a form control is left alone | ✓ | ✓ | ✓ | a cell a component draws is read and never rewritten: its value goes to `data-raw` alone, so it reads as the component drew it while the copy carries the same value (`#drawnfmt`) |
| `data-decimals="2"` | `th` or `table` | the decimals `estate-format` writes | ✓ | ✓ | ✓ | with `estate-format` |
| `estate-sum` | `td` in a `tr.estate-total` | the script writes into this cell the sum of its column over every row the filters leave, across every page, formatted as the column is (its `estate-format` decimals, else the most decimals any summed value shows; thousands grouped); it is re-summed after every filter pass and every change of rows, and a totals row holding such a cell stays shown while a filter narrows, because it is true again; the sum reads each cell's shown text (never `data-sort`, which is a key), skips what is not a number, and writes the plain sum into the cell's `data-raw` | ✓ | ✓ | ✓ | a sum cell a component draws gets `data-raw` alone, as for `estate-format` |
| `data-href="…"` | `td.estate-link` | the cell goes to this address: a click opens it in place, a Ctrl- or Cmd-click or a middle click opens a new tab, Enter with focus on the cell opens it (the script gives the cell `tabindex`); the cell's text is content, not a link; a click on a control inside the cell (a link, a button, a field) is that control's | ✓ | ✓ | ✓ | With JavaScript off the cell goes nowhere — an author who needs the address then writes the link filling the cell (look, above) |
| `data-peek="…"` | any element in the table — a `td`, a `th`, or a `span`/`div` in a cell | hovering or focusing the element shows a floating card beside it holding what the address answers — as markup when the answer is `text/html`, else as text; a door that refuses shows "the door answered <status>", one that does not answer "the door did not answer"; the table never moves; fetched once per address and kept for the page; closed when the pointer leaves, the page scrolls, or Escape; the element gets `tabindex` so a keyboard reaches it (the plain script gives it one unless it is a link, a button or a field; under the React renderer an element that is not a cell carries its own `tabIndex`, as React owns its props) | ✓ | — | ✓ | measured on `example-needs-react.html`; needs an address (the needs page's server); the plain-under-React mark waits on a framework mount of the needs page, which no page has |
| `data-total="631"` | `table` | the table holds part of a larger set that lives on the server; the bar's count and the pager say so — "20 loaded of 631", and while a filter narrows the bar reads "N of 20 shown · 20 loaded of 631"; `estate-page` pages the loaded rows, never the rest, and its count reads "a–b of 20 loaded of 631 · page p of q"; the whole set reaches an export only through `data-source` or `data-excel-href`. The script makes the table's bar when there is none, so the count is always said | ✓ | ✓ | ✓ | |
| `estate-drop-empty` | `table` | every column whose data cells are all empty is hidden; totals and bands are not evidence, an icon is content, a spanned total or band narrows; re-judged on every filter; a table whose data rows span columns is left alone, a table with no data rows is left alone, and a table whose every column is empty is left alone (so no table loses all its columns) | ✓ | ✓ | ✓ | |
| `estate-keep` | `th` | this column stays under `estate-drop-empty` even when no row fills it, because its emptiness means something | ✓ | ✓ | ✓ | |
| `estate-page` | `table` | the footer gains a pager: a page-size choice, "a–b of N" ("0 rows" when there are none), previous and next, "page p of q"; paging comes after the sort and both filters, so "N of M shown", the empty-column judgment and the copy see every filtered row and the page shows a slice. A group band is shown on a page where any of its rows is; a totals row in the body, while no filter narrows, on a page where its group has a row (a table with no bands is one group, so its total shows on every page); the page returns to the first when a filter changes or it would run past the end, and holds when the rows are replaced. The pager sits in the author's footer (`estate-table-footer`, or `estate-table-note` under a plain table), or in one the script makes | ✓ | ✓ | ✓ | |
| `data-page-size="20"` · `data-page-sizes="5 10 20 50 100"` | `table` | the opening page size and the sizes offered (`5 10 20 50 100` are the sizes when none are given; the size, when not given, is the first offered); a reader's choice, once made, outranks the opening size and is remembered under `data-store`; an opening size or a remembered size not among those offered is added to the choice | ✓ | ✓ | ✓ | with `estate-page` |
| `data-store="<key>"` | `table` | the `localStorage` key, used as written, under which this table remembers the reader's choices as one record — `{"size":20,"cols":"hidden","widths":{"2":140}}`, columns counted from 0: its page size, whether its column boxes are shown, and the widths `estate-resize` gave its columns | ✓ | ✓ | ✓ | a bare number is read as no record; with `estate-page`, `data-filter-row` and `estate-resize`; the key is the author's, so two tables may share one, and it does not begin `estate-table.` (reserved, below) |
| `estate-copy` | `table` | a copy button in the title band's actions, else the `caption`, else the table's own bar: `text/html` with inline styles and no widths (a spreadsheet or a mail composer keeps it and sizes it to its content) and `text/plain` tab-separated | ✓ | ✓ | ✓ | |
| `estate-copy-box` | `.estate-table-box` | one copy button and one HTML copy button on the box's band copy every table in the box that declares `estate-copy` (or `estate-copy-markup`), in order — each table as its own copy would carry it, the HTML flavours one after another, the plain flavours a blank line apart, the HTML copies a blank line apart; no table in the box draws its own copy or HTML copy button | ✓ | — | — | the plain script; the React renderer draws each table's own |
| `estate-keep-foot` | `table` | while a filter narrows the rows, every `tfoot` row stays shown — the author says the footer holds what a filter does not change (a "Displaying N of M" line, a total of the whole set); without it a footer row hides then, unless it holds an `estate-sum` | ✓ | ✓ | ✓ | |
| `estate-copy-body` | `table` | the copy leaves the `tfoot` out | ✓ | ✓ | ✓ | |
| `estate-copy-markup` | `table` | an HTML copy button after the copy button (or alone): the table the copy carries — the same rows and columns — written as bare markup, `text/plain` only, for pasting into a page's source: `table`, `thead`/`tbody`/`tfoot`, `tr`, `th`/`td` and each cell's text, escaped, a spanning cell keeping its `colspan`/`rowspan`; nothing else — no class, no link, no attribute | ✓ | ✓ | ✓ | |
| `data-raw="…"` | `td` | the plain-text copy and the export read this value in place of the cell's text (a number in it is still unformatted, as a cell's text would be) | ✓ | ✓ | ✓ | |
| `estate-excel` | `table` | an Excel button beside the copy button: one workbook, its sheet named for the table, the file named from the title band's text, the header row then the rows the copy would carry, numbers as numbers with a number format (`#,##0.00` in a column that shows decimals, else `#,##0`; a header is text, an identity column's values are strings), columns sized to their content between 10 and 60 characters. The name is the band's own text, else the caption's, else "Table"; the writer is looked for at every build, so one that arrives later is seen at the next refresh | ✓ | — | ✓ | measured on `example-needs-react.html`, the writer arriving after the tables with `estate:writer`; needs a workbook writer on the page — a global `ExcelJS` whose `Workbook` writes `xlsx.writeBuffer()`, the one shape admitted (the plain renderer's description, §Renderers) — no button without one; the plain-under-React mark waits on a framework mount of the needs page, which no page has |
| `data-excel-href="…"` · `data-excel-title="…"` | `table` | the Excel button is a link to this address instead — the page's own fuller workbook (every page of a list, columns the screen does not show) — and the title is its tooltip | ✓ | — | ✓ | measured on `example-needs-react.html`; needs nothing installed; the plain-under-React mark waits on a framework mount of the needs page, which no page has |
| `data-source="#id"` | `table` | the copy and the export read that other table (usually a hidden one the page also rendered, with more columns or rows) instead of this one | ✓ | ✓ | ✓ | the copy measured; the export reads the same clone |
| `estate-resize` | `table` | the reader drags a header's right edge — a handle the script puts on each labelled header — to make the column wider or narrower, as far as the browser's own layout and the content allow and never below 2em; the width is the reader's, written on the header, remembered under `data-store` when the table names one (by column counted from 0), restored at decoration, and reaches no copy or export; a click on the handle does not sort | ✓ | ✓ | ✓ | |
| `data-rows="N"` · `data-height="<css length>"` | the box, with `estate-sticky` | the box's greatest height is N rows under the header row — `(N + 1) × --estate-table-row-h`, one row being a line at the page's size plus a cell's padding and the rule, an approximation — or the length given (`calc(100vh - 12rem)`), instead of the stylesheet's value; the script sets the box's `--estate-table-sticky-h` from it | ✓ | ✓ | ✓ | |

**Rules every behaviour obeys, under the plain renderer** (another renderer says beside its marks where it differs).
The React renderer's marks hold under its two conditions (§Renderers): every row and every cell is an element in the
tree it is given — a table whose rows a component draws is rendered as given, undecorated, with one console warning
naming it — and a cell's text is read when its row renders, so a component inside a cell that changes its own text
without its row re-rendering is read again only at the row's next change. Where its marks stand, it obeys every rule
below as the plain renderer does; a sort's ties keep the order the rows are shown in, as under the plain script.

- **Every rule reads text.** Sort reads `data-sort`, else the cell's text; both filters read the text; the copy reads
  the rendered table; `data-raw` is read where a plain value is wanted. A cell may hold a link, an icon or a form control: a form control says what it shows — a select its chosen option, a checkbox or radio ✓ or nothing, a field its value — and the HTML flavour of the copy carries that text in the control's place.
- **A column has one type, or it is text:** date (ISO, a timestamp with a zone compared in UTC, `11 May 2011`,
  `May 11, 2011` — never `05/11/2011`, which means two days), phone (a leading `+`, parentheses, digit-dash-digit,
  `305.555.1212`, a space-grouped leading zero; compared as a digit string), number (`$`, `-1,234.50`, `(1,234.50)`,
  `12%`), else text — case- and accent-insensitive with embedded numbers read as numbers (`Item 9` before
  `Item 10`). One unreadable cell makes the column text. Blanks sink in both directions. An author may name the column's type outright — `estate-as-text`, `estate-id` — and the script then reads none of its values to decide.
- **A labelled column** is one whose header has text, or — when it shows only an icon — an `aria-label`. Only a labelled column sorts or gets a filter box; the label names the box and heads the plain copy and the export.
- **Groups and totals stay put.** A group band (`tr.estate-row-section`, or one cell spanning the row) keeps its rows
  under it and the sort works inside each group; a `tr.estate-total` stays after the rows it sums. The filter hides a
  band with nothing left under it and hides the totals while it is narrowing (they no longer sum what is shown) —
  except a totals row the script sums itself (`estate-sum`), which stays and is summed again.
- **A copy, and an export, is what is shown:** the rows in the current order, without the rows a filter hid or the
  columns `estate-drop-empty` hid, without the filter row, the sort marks or the generated row numbers; **every
  filtered row across every page** when the table pages — a sheet of one page is not what anyone means by export.
  Numbers unformatted in the plain flavour (`$1,234.50` → `1234.50`); `12.5%`, `USD 672.60` and labels such as
  `A 1100 0000` go as written. A spanned cell travels: the HTML flavour keeps `colspan` and `rowspan`, so a merged cell
  pasted into a spreadsheet is still merged; the plain flavour follows a `colspan` with empty columns so the cells after it stay in their columns, and reserves a `rowspan`'s column in the rows beneath with an empty field.
- **No filter control is built, and no header made sortable, until there are rows.** A table drawn empty and filled
  later gets its boxes and its sortable headers when the rows come; none is built twice. The pager's count is drawn at once, so an empty paged table says "0 rows".
- **The reader's sort is one column: a click replaces the last.** A shift-click adds the column after the ones in force, and the state holds the list; the first column decides and the next breaks a tie. An author may open the table on several columns (`data-sort-by`).
- **Two rulings may disagree and both stand, each by a class:** one application copies the whole table (its footer
  is content) and another leaves its totals out; one sorts numbers by sign and another by size. The standard is the
  first of each and the second is a class.

### Named by an application, not yet specified here

These exist as some application's own code today and have no declaration yet. Each becomes a row above when its
owner states its meaning; until then it is that application's and the standard says nothing about it: editing a cell
in place (it writes through the application's own door, and the standard writes nothing), local times (a cell showing
a timestamp in the reader's zone), and a first column kept quiet. Three left this list on 2026-10-13 when their owner
stated them: number formatting (`estate-format`), the copy that unformats a number (the plain flavour already does it)
and the peek (`data-peek`).

## What the script writes — the other half of the contract

The tables above are what an author asks for. This is what the script puts on the page in answer. An author never
types any of it. It is listed because a name nobody wrote down is still a name: another stylesheet or script can
collide with it or come to lean on it, and then it cannot change.

**Parts — elements the script makes.** Their look is in the stylesheet and nowhere else.

| class | the element | made by | state |
|---|---|---|---|
| `estate-sort-mark` | a `span` at the end of each sortable `th` — the sort icon, hidden from a screen reader | `estate-sort` | in the files |
| `estate-table-filter` | a `div`: the table's own bar, between the title band (or toolbar) and the table | `estate-filter`, `estate-filter-columns`, `data-total`; `estate-copy` and `estate-excel` where there is no band and no `caption` | in the files |
| `estate-table-filter-box` | the `input` in that bar — the one box for the whole table | `estate-filter` | in the files |
| `estate-table-filter-count` | a `span` in that bar: "N of M shown" | with the bar | in the files |
| `estate-table-cols-toggle` | a `button` in that bar: show or hide the boxes under the columns | `estate-filter-columns` | in the files |
| `estate-table-filter-row` | a `tr` added last in the `thead`, one cell per column | `estate-filter-columns` | in the files. The script wrote `estate-filter-row` before, a name a sibling stylesheet of the estate owns for a form's row (on a page linking both, the table's row was laid out as a flex box); the stylesheet draws both names until no served script writes the old (rule 3) |
| `estate-filter-col-box` | the `input` in each of that row's cells (with a `datalist` of the column's values on a text column) | `estate-filter-columns` | in the files |
| `estate-table-copy` | the copy `button` | `estate-copy` | in the files |
| `estate-table-markup` | the HTML copy `button`, the estate icon `code` | `estate-copy-markup` | in the files |
| `estate-table-excel` | the Excel `button`, or the `a` when `data-excel-href` names an address — after the copy button, wherever that sits | `estate-excel` | in the files |
| `estate-table-actions` | the `div` of icon buttons in the title band, made only where the author gave none | `estate-copy`, `estate-excel` | in the files |
| `estate-table-pager` | a `span` in the footer holding the pager; `estate-table-footer` (or `estate-table-note` under a plain table) is made when the author gave none | `estate-page` | in the files |
| `estate-table-peek` | the floating card, one per page, holding what a `data-peek` address answered | `data-peek` | in the files |
| `estate-table-resize-handle` | a `span` at the right edge of each labelled header, the drag's handle, hidden from a screen reader | `estate-resize` | in the files |
| `estate-table-page-size` · `estate-table-page-prev` · `estate-table-page-next` · `estate-table-page-count` | the `select`, the two `button`s (masks of the previous and next icons) and the "a–b of N · page p of q" `span` inside the pager | `estate-page` | in the files |

**State — what the script sets on elements that are already there.** Read it in the inspector or from a test; an
application's stylesheet does not paint from it.

| name | on | says | state |
|---|---|---|---|
| `estate-sortable` (class) | `th` | this header sorts on a click; the stylesheet gives it the hand cursor and the darkening on hover | in the files |
| `estate-filtered` (class) | `th` | this column's box holds something | in the files |
| `estate-copied` · `estate-copy-failed` (classes) | the copy button, the HTML copy button and the Excel button | the last press worked, or the browser refused — for 1.2 seconds, then gone | in the files |
| `estate-busy` (class) | the Excel button | the workbook is being written | in the files |
| `aria-sort` | `th` | `none`, `ascending` or `descending` — the web's own attribute for it | in the files |
| `data-estate-dir` | `th` | `none`, `asc` or `desc`; the stylesheet draws the sort mark from it | in the files |
| `data-estate-sort` | `table` | `<column>:<asc or desc>` with the column counted from 0, a comma-separated list when more than one column is in force, or empty when the rows are in the opening order | in the files |
| `data-estate-page` | `table` | `<page>/<pages>` while paging | in the files |
| `data-estate-on` | `table` | a renderer has decorated this table; it is never decorated twice. The plain script writes it empty; the React renderer writes `react`, and the plain script neither decorates nor refreshes a table marked so — two renderers share a page without touching each other's tables | in the files |
| `data-estate-row` | body `tr` | the row's place in the author's order, so the cycle can restore it | in the files |
| `data-estate-span` | a cell | its `colspan` as written, kept while `estate-drop-empty` narrows it | in the files |
| `data-estate-title` | `th` | the author's own tooltip, kept beside the sort's | in the files |
| `hidden` | `tr`, `th`, `td` | a filter hid the row, a page left it out, or `estate-drop-empty` hid the column | in the files |
| `data-raw` | a `td` the script formatted or summed | the text as it arrived, kept so the copy and the export carry it — written only where the author gave none (`estate-format`); the plain sum, on an `estate-sum` cell | in the files |
| `tabindex` | a `td` with `data-href` or `data-peek` | the cell is in the focus order so Enter can open it, or the card can be reached | in the files |
| `left` (inline) | every cell of a second or later `estate-pin` column | its offset: the measured widths of the pinned columns before it, re-measured whenever a width can change (the behaviour row) | in the files |
| `--estate-table-sticky-h` (a variable on the box) | the box | set from `data-rows` or `data-height` | in the files |
| `width` (inline) | a `th` the reader resized | the column's width, the reader's; the html copy overwrites every cell's style, so it travels nowhere | in the files |

The script also sets, on the parts it makes and the headers it decorates, the web's own attributes: `tabindex`,
`title`, `aria-label`, `aria-hidden`, `list`, `placeholder`, `size`, `type` (`search`, on the bar's box), `disabled` (a pager button with nowhere to go), `selected` (the page size offered), `hidden` (the peek card between showings) and, on the link a workbook download is made of, `href` and `download`; and it
gives each `datalist` an id beginning `estate-filter-`.

**Tooltips.** The script's own tooltips (the sort's, the boxes', the buttons', the pager's) are set through
`window.EstateTable.tooltip(node, text)`, which sets the browser's `title`; a page replaces the function once to draw
them its own way — an application whose rule is that every icon explains itself on hover and on touch — and every
tooltip set after that follows (one set before stays a `title`). The React renderer's hook is `Estate.tooltip(node, text)` on
its component — the same signature, called on the same parts, replaced once the same way; it is called whenever a
part's tooltip text changes (a header re-tipped on every sort).

**Events and methods.** The script dispatches `estate:filtered` on the table after every filter pass, bubbling, with
`detail: { shown, total }`, and `estate:paged` with `detail: { page, pages, size }` after every pass of a paged table. It listens on `window` for `estate:writer` (a workbook writer was put on `window.ExcelJS` after the tables were drawn — every table is refreshed so it gains its Excel button; the React renderer answers the same event). It listens on
`document` for `estate:tables-added` (decorate what is new under the event's target) and `estate:rows-changed`
(re-apply to this table); a page dispatches either on `document`, or on an element with `bubbles: true`.
`window.EstateTable` holds `init(root)`, `refresh(root)`, `classify(raw)`, `columnType(values)` and `tooltip(node, text)`. What it keeps in the browser: whether the column boxes are shown (`localStorage` key `estate-table.filter-columns`) and, per table that declares `data-store`, one record under that key holding the reader's page size, that table's own column-box choice and its column widths.

**Reserved.** Every class beginning `estate-`, every attribute beginning `data-estate-`, every id beginning
`estate-filter-`, every event beginning `estate:`, every variable beginning `--estate-table-` or `--estate-tint-`, every CSS counter
beginning `estate-`, every browser-storage key beginning `estate-table.` and every property beginning `__estate` on a table is this standard's **on a table and its box** — and an event beginning `estate:` also on `document` and `window`, where a page or a renderer announces something to every table (`estate:tables-added`, `estate:rows-changed`, `estate:writer`). The author's own controls in the band, the toolbar, the
footer and the `caption` are the one exception: they wear the estate's button and icon names, a sibling's, inside the box. Sibling standards of the same estate
(a title bar, a form, the buttons and icons) use the same prefix outside the table, and a name used by two of them is a defect of the
younger — which is why `estate-filter-row` is being renamed. Two more names are in both this stylesheet and the
form's: `estate-label`, which the form draws unscoped as an inline flex box so a `td.estate-label` on a page linking
both would stop being a table cell (latent — no page writes one; the form's file is the younger and owes the scope),
and `estate-num`, which the form scopes to its own field and so does no harm. A new name is a row in this file first.
State classes keep their plain names and are not re-spelled `is-…`.

## The ownership rule — the plain script under a producer that rewrites its markup

On a plain page the markup's producer is gone once the markup arrives, and the script is the table's only owner. On a
page a framework keeps re-rendering the producer stays and rewrites the table whenever its data changes. Two owners of one table is the
one place where "the script may change the markup" needs a rule. A framework renderer needs none of this — it
is the producer's own side. When the plain script is the one running there, the rule is this:

1. **The producer owns the rows' content; the script owns their order and their visibility.** The producer renders
   the rows it has, in the author's order, and never sets `hidden`, a `data-estate-*` attribute or an `estate-` state
   class. The script watches the body: when rows are added, removed, replaced or their text rewritten, it re-applies
   the reader's sort, both filters, the page and the empty-column judgment to what is there now. A row the producer
   re-renders where it stood is left where the reader's sort put it. The two places the script does write content —
   a number it was asked to format (`estate-format`) and a total it was asked to compute (`estate-sum`) — it writes
   again after the producer's rewrite, so the producer renders the value as it has it and never the formatted text.
2. **The producer initialises the script after it has taken the page, never before.** A framework that hydrates
   server-rendered markup must not find the script's parts already in it. The page dispatches `estate:tables-added`
   from the point where the framework says the markup is its own (a mount effect), not from a `defer`red load.
   `data-manual` on the `<script>` element stops the script decorating anything on load, so an announcement, `EstateTable.init` or `EstateTable.refresh` is the only start (measured on the needs page, §The check page); without it the script decorates every table it finds as soon as the page has loaded.
3. **A header is replaced, not edited.** The script's parts in the `thead` (the filter row) and its state on each
   `th` are not the producer's to keep. A producer that must change its headers (a column added, a label changed)
   replaces the whole `<table>` element together with the box or caption that holds the script's parts (rule 4 puts the
   bar and the copy button there; a table replaced alone keeps the old bar and gains a second) and announces the new one
   with `estate:tables-added`; the script decorates it. A producer that must replace a plain table whose script's parts sit beside it — the bar before it, a note after it — wraps the table in an element of its own and replaces that. The script also watches each header's `class` attribute and restores its own state class when the producer rewrites it.
4. **The band and the footer are the producer's elements; the buttons and the pager in them are the script's.** The
   producer leaves nodes it did not create alone. When the producer unmounts the table, the script's parts go with
   the elements they sit in.
5. **The producer chooses which rows exist; the script decides which are shown.** A producer may render fewer rows
   because its own query or its own switch changed — that is a change of data, and the watcher meets it. What the
   producer never does is sort, page or hide rows that the declarations would: those are the reader's, through the
   script. A producer whose full set is on a server (one page of a longer list) declares `data-source` or
   `data-excel-href` for the rows the export should carry.

Measured 2026-10-13: the check page mounted by React 19.3.0 (`example-react.html`), its rows re-rendered on a timer,
ran clean under the plain script on every behaviour in the files — the *plain under React* marks above say so. A behaviour
added later earns its mark the same way: the measurement, not the rule.

## The check page — the measurement

`example.html` links only the stylesheet and the script and shows every behaviour on invented data: one table per
behaviour, a table that arrives empty and is filled later, and a table whose rows are replaced by a press. It is the
page a maintainer runs before a release and, with its companions below, how a renderer is measured. Each table carries its expected answers beside it, so a run is a comparison and not a judgment — a table per declaration in the files, a table whose cells are rewritten in place, the look classes side by side, and the same tables mounted by a framework (`example-react.html`) with a timer that re-renders the rows, with the same expected answers and its own for what the timer and its buttons do. A second page, `example-needs.html`, whose script element carries `data-manual` and which announces its tables itself, also loads a workbook writer and is served by a small script beside it (`example-needs-server.js`: `node example-needs-server.js [port] [root]`, the root being the folder holding `table/` and `icons/`), run by the maintainer, answering the addresses its `data-peek` cells name with fixed bodies the expected answers quote — so a declaration that needs something installed or an address is measured with the need met there, and `estate-excel` is measured inert on `example.html` (a `data-peek` cell with no server is a door that refuses, shown as such, not inert). The companions are not served at `<base>`. The React renderer's marks are earned on `example-react.html?impl=react` — the same page, its rows and cells written as elements, mounting every table through the React renderer and loading no plain script; it also holds one table whose rows a component draws, the renderer's markup condition. `example-needs-react.html` is the needs page's tables mounted by React, served by the same server with the same fixed bodies; it loads its workbook writer after the tables are drawn and announces it with `estate:writer`, and holds one table of cell components with effects, paged, on which the press pass is measured. *Designed:* a table per designed declaration as it is built. A declaration added to this document is a table added to the check page in the same change.

## Every name — the index

Every class, variable and attribute this standard owns, by its full name. *Look* is drawn by the browser from the
stylesheet; *behaviour* is the script's; *both* is a class the stylesheet draws and the script also reads or writes.
*Who* is who puts it on the page: the AUTHOR or the SCRIPT. The first list is taken from the two files at the
commit that last changed them — the release step checks its classes table and its variables line against the files and refuses a mismatch; a name in either
file and not here is a defect of this file. A second list, of names designed and not yet in the files, follows when there are any; a name moves to the first list in the commit that builds it.

**In the files — classes, 88.**

| class | kind | who | |
|---|---|---|---|
| `estate-action` | look | author | drawn by the stylesheet alone |
| `estate-as-text` | behaviour | author | read by the script alone; no look of its own |
| `estate-busy` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-cell-flag` | look | author | drawn by the stylesheet alone |
| `estate-cell-good` | look | author | drawn by the stylesheet alone |
| `estate-cell-join` | look | author | drawn by the stylesheet alone |
| `estate-cell-student` | look | author | drawn by the stylesheet alone |
| `estate-cell-teacher` | look | author | drawn by the stylesheet alone |
| `estate-center` | look | author | drawn by the stylesheet alone |
| `estate-copied` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-copy` | behaviour | author | read by the script alone; no look of its own |
| `estate-copy-body` | behaviour | author | read by the script alone; no look of its own |
| `estate-keep-foot` | behaviour | author | read by the script alone; no look of its own |
| `estate-copy-box` | behaviour | author | read by the script alone; no look of its own |
| `estate-copy-markup` | behaviour | author | read by the script alone; no look of its own |
| `estate-copy-failed` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-drop-empty` | behaviour | author | read by the script alone; no look of its own |
| `estate-excel` | behaviour | author | read by the script alone; no look of its own |
| `estate-filter` | behaviour | author | read by the script alone; no look of its own |
| `estate-filter-col-box` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-filter-columns` | behaviour | author | read by the script alone; no look of its own |
| `estate-filter-row` | both | script | the OLD name of the filter row: drawn by the stylesheet, written by no served script since the rename; leaves at the next major version |
| `estate-table-filter-row` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-filtered` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-format` | behaviour | author | read by the script alone; no look of its own |
| `estate-fit` | look | author | drawn by the stylesheet alone |
| `estate-id` | behaviour | author | read by the script alone; no look of its own |
| `estate-keep` | behaviour | author | read by the script alone; no look of its own |
| `estate-label` | look | author | drawn by the stylesheet alone |
| `estate-link` | look | author | drawn by the stylesheet alone |
| `estate-medium` | look | author | drawn by the stylesheet alone |
| `estate-mono` | look | author | drawn by the stylesheet alone |
| `estate-narrow` | look | author | drawn by the stylesheet alone |
| `estate-new` | look | author | another stylesheet's (the estate's form file draws the add icon); the script reads it — its copy button goes after a leading one in the band's actions |
| `estate-no-sort` | behaviour | author | read by the script alone; no look of its own |
| `estate-nowrap` | look | author | drawn by the stylesheet alone |
| `estate-num` | look | author | drawn by the stylesheet alone |
| `estate-numbered` | look | author | drawn by the stylesheet alone |
| `estate-page` | behaviour | author | read by the script alone; no look of its own |
| `estate-pin` | both | author | the stylesheet pins one column; the script places the rest, and pins its own filter-row cell |
| `estate-resize` | both | author | read by the script; the stylesheet makes each header a containing block for the handle |
| `estate-row-balancesheet` | look | author | drawn by the stylesheet alone |
| `estate-row-equity` | look | author | drawn by the stylesheet alone |
| `estate-row-flag` | look | author | drawn by the stylesheet alone |
| `estate-row-incomeexpense` | look | author | drawn by the stylesheet alone |
| `estate-row-section` | both | author | the stylesheet draws it; the script finds the table, its box, band or group rows by it |
| `estate-sm` | look | author | drawn by the stylesheet alone |
| `estate-sort` | behaviour | author | read by the script alone; no look of its own |
| `estate-sort-abs` | behaviour | author | read by the script alone; no look of its own |
| `estate-sort-mark` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-sortable` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-sticky` | look | author | drawn by the stylesheet alone |
| `estate-striped` | look | author | drawn by the stylesheet alone |
| `estate-sum` | behaviour | author | read and written by the script; no look of its own |
| `estate-table` | both | author | the stylesheet draws it; the script finds the table, its box, band or group rows by it |
| `estate-table-actions` | both | author; script if absent | an author marks it; the stylesheet draws it and the script reads it |
| `estate-table-box` | both | author | the stylesheet draws it; the script finds the table, its box, band or group rows by it |
| `estate-table-cols-toggle` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-copy` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-markup` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-excel` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-filter` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-filter-box` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-filter-count` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-footer` | both | author; script if absent | the stylesheet draws it; the script puts the pager in it, and makes it under a boxed table when the author gave none |
| `estate-table-note` | both | author; script if absent | the stylesheet draws it; the script puts the pager in it, and makes it under a plain table when the author gave none |
| `estate-table-page-count` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-page-next` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-page-prev` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-page-size` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-pager` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-peek` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-resize-handle` | both | script | made or set by the script; drawn by the stylesheet |
| `estate-table-scroll` | both | author | the stylesheet draws it; the script finds the table, its box, band or group rows by it |
| `estate-table-title` | both | author | the stylesheet draws it; the script finds the table, its box, band or group rows by it |
| `estate-table-toolbar` | look | author | drawn by the stylesheet alone |
| `estate-text` | look | author | drawn by the stylesheet alone |
| `estate-text-filter` | behaviour | author | read by the script alone; no look of its own |
| `estate-tint-danger` | look | author | drawn by the stylesheet alone |
| `estate-tint-dark` | look | author | drawn by the stylesheet alone |
| `estate-tint-info` | look | author | drawn by the stylesheet alone |
| `estate-tint-light` | look | author | drawn by the stylesheet alone |
| `estate-tint-primary` | look | author | drawn by the stylesheet alone |
| `estate-tint-secondary` | look | author | drawn by the stylesheet alone |
| `estate-tint-success` | look | author | drawn by the stylesheet alone |
| `estate-tint-warning` | look | author | drawn by the stylesheet alone |
| `estate-top` | look | author | drawn by the stylesheet alone |
| `estate-total` | both | author | the stylesheet draws it; the script finds the table, its box, band or group rows by it |

**In the files — variables, 84, on `:root` in the stylesheet, with their values there** (rule 2: every look is one of these).

- *colours:* `--estate-table-fg: #111827` · `--estate-table-head-fg: #1f2937` · `--estate-table-band: #334155` · `--estate-table-band-fg: #ffffff` · `--estate-table-head-bg: #cfe2ff` · `--estate-table-sort-hover: #475569` · `--estate-table-row: #ffffff` · `--estate-table-row-alt: #f8fafc` · `--estate-table-row-stripe: #e2e8f0` · `--estate-table-rule: #f1f5f9` · `--estate-table-link-hover: #eef2ff` · `--estate-table-total-bg: #eef2ff` · `--estate-table-total-rule: #c7d2fe` · `--estate-table-total-num: #3730a3` · `--estate-table-label-fg: #334155` · `--estate-table-filter-bg: #f1f5f9` · `--estate-table-filter-border: #cbd5e1` · `--estate-table-copy-bg: #1d6f42` · `--estate-table-copy-hover: #155a34` · `--estate-table-excel-bg: #1d6f42` · `--estate-table-excel-hover: #155a34` · `--estate-table-control-bg: #ffffff` · `--estate-table-failed: #b91c1c` · `--estate-table-disabled: 0.5` (the opacity of a pager button with nowhere to go — an icon, not text)
- *meanings:* `--estate-table-section: #3730a3` · `--estate-table-good: #dcfce7` · `--estate-table-flag: #fee2e2` · `--estate-table-join: #fef3c7` · `--estate-table-teacher: #fffbeb` · `--estate-table-student: #f0f9ff` · `--estate-table-balancesheet: #7dd3fc` · `--estate-table-incomeexpense: #fcd34d` · `--estate-table-equity: #c4b5fd`
- *tints:* `--estate-tint-primary: #cfe2ff` · `--estate-tint-secondary: #e2e3e5` · `--estate-tint-success: #d1e7dd` · `--estate-tint-info: #cff4fc` · `--estate-tint-warning: #fff3cd` · `--estate-tint-danger: #f8d7da` · `--estate-tint-light: #f8f9fa` · `--estate-tint-dark: #212529` · `--estate-tint-dark-fg: #ffffff`
- *type:* `--estate-table-font: inherit` · `--estate-table-size: 1em` · `--estate-table-line: 1.5` · `--estate-table-size-sm: 0.875em` · `--estate-table-line-sm: 1.5` (the table carries no size of its own: body cells, the header row and the script's parts — the bar, its boxes, the count, the toggle, the pager — take `--estate-table-size`; the band, the footer, the group band, the numbered column's numbers, the label column and the `estate-sm` and `estate-mono` cells take the small one, which is the one small size the page already has; a table moves with the page's base wherever it is set) · `--estate-table-placeholder-style: italic` · `--estate-table-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` · `--estate-table-tracking: 0.025em` · `--estate-table-weight-band: 700` · `--estate-table-weight-head: 700` · `--estate-table-weight-label: 600` · `--estate-table-weight-total: 600`
- *spacing and widths:* `--estate-table-radius: 0.5rem` · `--estate-table-band-pad: 0.5rem 1rem` · `--estate-table-head-pad: 0.375rem 0.625rem` · `--estate-table-cell-pad: 0.25rem 0.625rem` · `--estate-table-gap: 0.5rem` · `--estate-table-actions-inset: 0.5rem` · `--estate-table-label-w: 8rem` · `--estate-table-narrow-w: 32rem` · `--estate-table-medium-w: 42rem` · `--estate-table-sticky-h: 70vh` · `--estate-table-row-h: calc(1.5em + 0.5rem + 1px)` (one row, approximately, for `data-rows`) · `--estate-table-mark: 0.875em` · `--estate-table-mark-gap: 0.25rem` · `--estate-table-mark-shift: -0.15em` · `--estate-table-action-w: 1px` · `--estate-table-frame-w: 1px` · `--estate-table-rule-w: 1px` · `--estate-table-total-rule-w: 2px` · `--estate-table-filtered-w: 3px` · `--estate-table-control-border-w: 1px` · `--estate-table-control-radius: 0.25rem` · `--estate-table-control-pad: 0.125rem 0.375rem` · `--estate-table-target: 1.5rem` · `--estate-table-col-box-pad: 0.0625rem 0.25rem` · `--estate-table-col-cell-pad: 0.125rem 0.25rem` · `--estate-table-bar-pad: 0.25rem 0.5rem` · `--estate-table-filter-box-w: 12rem` · `--estate-table-peek-w: 24rem` · `--estate-table-peek-shadow: 0 0.25rem 0.75rem rgba(15, 23, 42, 0.25)` · `--estate-table-resize-w: 0.5rem`

**In the files — attributes, events, script names.** An author sets `data-sort`, `data-raw`, `data-href` and `data-peek` on a `td`; `data-decimals` on a `th` or the table; `data-sort-by`, `data-page-size`, `data-page-sizes`, `data-store`, `data-filter-row`, `data-total`, `data-source`, `data-excel-href` and `data-excel-title` on the table; `data-rows` and `data-height` on the box; `data-manual` on the script element. The script sets `aria-sort`, `data-estate-on`, `data-estate-row`, `data-estate-sort`, `data-estate-dir`, `data-estate-span`, `data-estate-title`, `data-estate-page`, `hidden`, `data-raw` where it formatted or summed, `tabindex` on a `data-href` or `data-peek` cell, `left` on a later pinned column's cells, `width` on a resized header, `--estate-table-sticky-h` on the box, and the web's own attributes named above. Events: `estate:tables-added` and `estate:rows-changed` (the page sends), `estate:filtered` and `estate:paged` (the script sends). The stylesheet's one CSS counter, `estate-row` (the row number `estate-numbered` draws). Script names: `window.EstateTable`, the table properties `__estateBuilt`, `__estateFilter`, `__estateWatch`, `__estatePinWatch`, the `localStorage` key `estate-table.filter-columns` and the one each `data-store` names.

**In the files — the React renderer:** `estate-table-react.js`, its component `Estate` (its only prop is `children`, the markup) and `Estate.tooltip`; the state value `data-estate-on="react"`; every name of the behaviour table, its column marked ✓; the event `estate:writer` on `window`, which both renderers answer; the core's copy and export builders, which take the rows they carry as an argument.

**Designed, not yet in the files:** nothing, as of the commit that built `estate-resize` and the release's two checks.

## The rules

1. **No local overrides.** An application puts these names on its tables and adds no rule that restyles them — no
   width, colour, font or padding on a call site, and no stylesheet of its own whose selector names `.estate-table*`
   or any other name of this standard. A need the names cannot express is a new name here, never a rule in the
   application. The one rule an application may write is rule 2's: a value for a variable, on a selector of its own.
2. **Every look is a variable in its stylesheet.** Colours, fonts, sizes and spacing are `--estate-table-*` (and the eight tints `--estate-tint-*`) on `:root`.
   Changing the look is editing a value; an application that wants another look sets the variables — on `:root`, or on
   an element of its own above its tables — and never writes a rule against the standard's names. An application whose
   tables are all unstriped sets `--estate-table-row-alt` to the row colour on `:root`; that is rule 2 obeyed and
   rule 1 kept.
3. **Names are the contract: add, never rename or remove** while any page wears the name. One address and no version
   means a rename breaks every adopter in the same minute. A name leaves only after every adopter has moved off it. A
   part the script makes, which no author types, moves to a new name with the stylesheet drawing both until the old
   one is worn by no served script. In a published, versioned copy of the files a name's removal is a major version,
   and both names are kept until one.
4. **Never grey text.** Body text is near-black, headers dark, band text pure white; nothing a reader must read is
   drawn at reduced contrast.
5. **A meaning lives here too.** A tint that says something about a row or cell is a class in this standard, because a
   meaning drawn locally is an override and loses to the zebra rule.
6. **The markup is the whole API.** A renderer — the plain one, a framework's — reads these
   names and nothing else: no prop, option or configuration object adds a meaning the markup does not carry, and no
   renderer gets a vocabulary of its own. A template macro or a helper that writes this markup for an author is that
   application's convenience and is not part of the standard; it may wire — announce a table, replace one — and if it
   writes a name that is not in this document, the defect is the helper's.
7. **A renderer is a column, not a branch.** A declaration is one name with one wish behind it; a renderer differs in
   whether it delivers it yet and how it draws it, and the reason or the difference is written beside the mark, or once
   for a whole column when it is one reason.
8. **A renderer names what the page installs; the standard ships only what it makes.** A renderer's description names
   each component another party makes that it needs (a framework, a workbook writer), with the version it was tested
   on; a version carries none of them. A declaration whose component is not on the page draws nothing and does nothing.
9. **A change reaches the applications when the file is published.** Each renderer's source lives in one place;
   the served file is a byte copy of it.
10. **A name is admitted for a meaning or a behaviour any table could carry**, stated in this document's words and no
    application's. A look one application wants for itself is a variable it sets (rule 2), not a name here. A name
    once published is a promise (rule 3), so it is weighed before it is written.

## Design decisions, and what was rejected

- **The contract first, renderers second.** A framework component with its own props (columns, cell functions,
  flags) was designed and rejected: it moves the declarations out of the markup into a second vocabulary that must be
  kept in step with the first by hand. What is allowed instead is a framework renderer that reads the same
  markup and adds no vocabulary — and the question of two owners of one table is answered either by that, or by the
  ownership rule when the plain script runs under the framework. "One script everywhere" was for a day the rule;
  function decides it now: shared code where it serves, independent code where it serves.
- **Markup, not configuration.** A table described as data (column definitions in code) was the previous shape of
  the first adopter's table. It ties the author to one producer; the same wish cannot be delivered to a page that
  renders differently.
- **A superset, not an intersection.** "What every renderer can do today" was never written down as the standard,
  deliberately: it would have dropped paging and the export on the day it was written.
- **Each application keeping its own table style and matching by eye** — what the estate had, and how its parts
  drifted apart.
- **A versioned or dated file name** — every change would become an edit in every application. A version belongs to
  a published package of the files, which an adopter outside the estate may pin; the estate's own address carries none.
- **A framework as the contract's base** — a contract that needs a framework loaded is one contract per framework; a framework is a renderer's, named in its description.
- **Utility-class rules compiled by one application's build as the standard** — a linked file must be plain CSS that
  needs no build step in the application that links it.
- **A build that fetches the source at head** — another adopter's edit would turn a build red with no change of its
  own, and no build would be reproducible. Adopters link the published file or pin a released version.
- **A second framework's renderer, for now** — no adopter uses one; it is made when one does, and anyone may make one.
- **Row numbers in the DOM** — a generated CSS counter instead, so no application adds a cell and no copy carries a
  number that was only ever a position on the screen.
- **A class for "no stripes"** — not added: an application that wants every table unstriped sets one variable on
  `:root` (rule 2), and a single table is already served by the zebra rule losing to a tint.
- **The producer sorting, paging or hiding rows itself** so that a server-paged list could page on the server — the
  reader's sort and filter would then see one slice and lie about the rest; `data-total` says the slice is a slice,
  and the fuller set reaches the reader through an export.
- **Keeping a meaning's colour in the application that first needed it** — rejected the day it was written: a meaning
  drawn locally is an override, and the standard's own rules then forbade it.
