/*! @ploutosservices/estate-table 1.4.0 | source 1e96ab0 | Apache-2.0 | icons: Heroicons (MIT) | see NOTICE */
(function() {
  "use strict";
  var ME = document.currentScript, MANUAL = !!(ME && ME.hasAttribute("data-manual"));
  var CURRENCY = /[$£€¥₹]/g;
  var ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:\s?(Z|[+-]\d{2}:?\d{2}))?)?$/i;
  var DMY_NAMED = /^(\d{1,2})[ -]([A-Za-z]{3,9})\.?,?[ -](\d{4})$/;
  var MDY_NAMED = /^([A-Za-z]{3,9})\.?[ -](\d{1,2}),?[ -]?(\d{4})$/;
  var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  var MONTH_NAMES = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december"
  ];
  var TEXT_OPTS = { numeric: true, sensitivity: "base" };
  function monthIndex(name) {
    var n = String(name).toLowerCase(), k = n.slice(0, 3);
    if (!Object.prototype.hasOwnProperty.call(MONTHS, k)) return null;
    return n === k || n === MONTH_NAMES[MONTHS[k]] || n === "sept" ? MONTHS[k] : null;
  }
  function utcDay(y, mo, d) {
    var t = Date.UTC(y, mo, d), dt = new Date(t);
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo && dt.getUTCDate() === d ? t : null;
  }
  function asDate(s) {
    var m = ISO_DATE.exec(s);
    if (m) {
      var day = utcDay(+m[1], +m[2] - 1, +m[3]);
      if (day === null) return null;
      var zone = 0, z = m[7];
      if (z && z.toUpperCase() !== "Z") {
        var hm = z.replace(":", "");
        zone = (hm.charAt(0) === "-" ? -1 : 1) * (+hm.slice(1, 3) * 60 + +hm.slice(3, 5));
      }
      return day + ((+m[4] || 0) * 3600 + (+m[5] || 0) * 60 + (+m[6] || 0) - zone * 60) * 1e3;
    }
    m = DMY_NAMED.exec(s);
    if (m) {
      var i = monthIndex(m[2]);
      if (i !== null) return utcDay(+m[3], i, +m[1]);
    }
    m = MDY_NAMED.exec(s);
    if (m) {
      var j = monthIndex(m[1]);
      if (j !== null) return utcDay(+m[3], j, +m[2]);
    }
    return null;
  }
  function asPhone(s) {
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return null;
    var digits = s.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) return null;
    if (/^\(\d{3}\)\s?\d{3}[-. ]\d{4}$/.test(s)) return digits;
    if (/^\d{3}\.\d{3}\.\d{4}$/.test(s)) return digits;
    if (!/^\+?\d[\d ().-]*$/.test(s)) return null;
    if (s.charAt(0) !== "+" && s.indexOf("(") === -1 && !/\d-\d/.test(s) && !(s.charAt(0) === "0" && /\d \d/.test(s))) return null;
    return digits;
  }
  function asNumber(s) {
    var t = s.replace(/[\s ]/g, "").replace(CURRENCY, ""), neg = false;
    if (t.length > 2 && t.charAt(0) === "(" && t.charAt(t.length - 1) === ")") {
      neg = true;
      t = t.slice(1, -1);
    }
    if (t.charAt(0) === "+") t = t.slice(1);
    else if (t.charAt(0) === "-") {
      neg = true;
      t = t.slice(1);
    }
    if (t.charAt(t.length - 1) === "%") t = t.slice(0, -1);
    if (!/^\d+(\.\d+)?$/.test(t) && !/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) return null;
    var n = parseFloat(t.replace(/,/g, ""));
    return isFinite(n) ? neg ? -n : n : null;
  }
  function classify(raw, kind) {
    var s = String(raw == null ? "" : raw).replace(/\s+/g, " ").trim();
    if (s === "") return { type: "blank", key: "", text: "" };
    var lower = s.toLowerCase(), v;
    if (kind === "text") return { type: "text", key: lower, text: lower };
    if (kind === "id") return /^\d+$/.test(s) ? { type: "id", key: s, text: lower } : { type: "text", key: lower, text: lower };
    if ((v = asDate(s)) !== null) return { type: "date", key: v, text: lower };
    if ((v = asPhone(s)) !== null) return { type: "phone", key: v, text: lower };
    if ((v = asNumber(s)) !== null) return { type: "num", key: v, text: lower };
    return { type: "text", key: lower, text: lower };
  }
  function columnType(values) {
    var found = null;
    for (var i = 0; i < values.length; i++) {
      var t = values[i].type;
      if (t === "blank") continue;
      if (found === null) found = t;
      else if (found !== t) return "text";
    }
    return found === null ? "text" : found;
  }
  function comparator(colType, dir, abs) {
    var sign = dir === "desc" ? -1 : 1;
    return function(a, b) {
      if (a.type === "blank" || b.type === "blank") return a.type === b.type ? 0 : a.type === "blank" ? 1 : -1;
      if (colType === "num") {
        var x = abs ? Math.abs(a.key) : a.key, y = abs ? Math.abs(b.key) : b.key;
        return sign * (x < y ? -1 : x > y ? 1 : 0);
      }
      if (colType === "id") {
        var p = a.key.replace(/^0+(?=\d)/, ""), q = b.key.replace(/^0+(?=\d)/, "");
        return sign * (p.length !== q.length ? p.length < q.length ? -1 : 1 : p < q ? -1 : p > q ? 1 : 0);
      }
      if (colType === "date" || colType === "phone") return sign * (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
      return sign * String(a.text).localeCompare(String(b.text), void 0, TEXT_OPTS);
    };
  }
  function parseSortBy(str, ncols) {
    var out = [];
    String(str || "").split(",").forEach(function(item) {
      var m = /^\s*(\d+)\s*(asc|desc)?\s*$/i.exec(item);
      if (!m) return;
      var i = +m[1] - 1;
      if (i < 0 || i >= ncols || out.some(function(k) {
        return k.i === i;
      })) return;
      out.push({ i, d: (m[2] || "asc").toLowerCase() });
    });
    return out;
  }
  function columnTest(query, numeric) {
    var q = query.trim();
    if (!q) return null;
    if (numeric) {
      var range = q.match(/^(\S+)\s*\.\.\s*(\S+)$/);
      if (range) {
        var lo = asNumber(range[1]), hi = asNumber(range[2]);
        if (lo !== null && hi !== null) return function(t) {
          var v = asNumber(t);
          return v !== null && v >= lo && v <= hi;
        };
      }
      var cmp = q.match(/^(>=|<=|>|<|=)\s*(\S+)$/);
      if (cmp) {
        var n = asNumber(cmp[2]), op = cmp[1];
        if (n !== null) return function(t) {
          var v = asNumber(t);
          if (v === null) return false;
          return op === ">" ? v > n : op === "<" ? v < n : op === ">=" ? v >= n : op === "<=" ? v <= n : v === n;
        };
      }
    }
    var needle = q.toLowerCase();
    return function(t) {
      return t.toLowerCase().indexOf(needle) !== -1;
    };
  }
  function unformat(text) {
    text = text.replace(/\s+/g, " ").trim();
    if (/%$/.test(text) || !/\d/.test(text)) return text;
    if (asPhone(text) !== null || asDate(text) !== null || /^0\d/.test(text) || asNumber(text) === null) return text;
    var t = text.replace(/[\s ]/g, "").replace(CURRENCY, ""), neg = false;
    if (t.charAt(0) === "(" && t.charAt(t.length - 1) === ")") {
      neg = true;
      t = t.slice(1, -1);
    }
    if (t.charAt(0) === "+") t = t.slice(1);
    else if (t.charAt(0) === "-") {
      neg = true;
      t = t.slice(1);
    }
    return (neg ? "-" : "") + t.replace(/,/g, "");
  }
  function decimalsOf(text) {
    var m = /\.(\d+)/.exec(unformat(text));
    return m ? m[1].length : 0;
  }
  function fixedHalfUp(abs, decimals) {
    if (/e/i.test(String(abs))) return abs.toFixed(decimals);
    return Number(Math.round(Number(abs + "e" + decimals)) + "e-" + decimals).toFixed(decimals);
  }
  function groupNumber(abs, decimals) {
    var fixed = fixedHalfUp(abs, decimals), parts = fixed.split(".");
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts.length > 1 ? "." + parts[1] : "");
  }
  function formatNumber(text, decimals) {
    var s = text.replace(/\s+/g, " ").trim();
    if (s === "" || asPhone(s) !== null || asDate(s) !== null || /^0\d/.test(s)) return null;
    var n = asNumber(s);
    if (n === null) return null;
    var m = /^([$£€¥₹]?)\s*[^%]*?(%?)$/.exec(s), prefix = m ? m[1] : "", suffix = m ? m[2] : "";
    return prefix + (n < 0 ? "-" : "") + groupNumber(Math.abs(n), decimals) + suffix;
  }
  var CONTROLS_SEL = "select, input, textarea";
  function shown(ctl) {
    if (ctl.tagName === "SELECT") {
      var o = ctl.options[ctl.selectedIndex];
      return o ? o.textContent : "";
    }
    if (ctl.type === "checkbox" || ctl.type === "radio") return ctl.checked ? "\u2713" : "";
    if (ctl.type === "hidden" || ctl.type === "button" || ctl.type === "submit" || ctl.type === "reset") return "";
    return ctl.value;
  }
  function textOf(cell) {
    if (!cell) return "";
    if (!cell.querySelector(CONTROLS_SEL)) return cell.textContent;
    var out = "";
    (function walk(node) {
      for (var n = node.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3) out += n.data;
        else if (n.nodeType === 1) {
          if (n.matches(CONTROLS_SEL)) out += " " + shown(n) + " ";
          else walk(n);
        }
      }
    })(cell);
    return out;
  }
  var CONTENT = "img,i,svg,button,a,input,select,textarea,video,audio,object";
  function filled(cell) {
    return !!cell && (cell.textContent.trim() !== "" || cell.querySelector(CONTENT) !== null);
  }
  function kids(parent, tags) {
    var out = [];
    if (!parent) return out;
    for (var i = 0; i < parent.children.length; i++) if (tags.indexOf(parent.children[i].tagName) !== -1) out.push(parent.children[i]);
    return out;
  }
  function headerCells(table) {
    var rows = kids(table.tHead, ["TR"]).filter(function(tr) {
      return !tr.classList.contains("estate-table-filter-row");
    });
    return rows.length ? kids(rows[rows.length - 1], ["TH", "TD"]) : [];
  }
  function cells(tr) {
    return kids(tr, ["TD", "TH"]);
  }
  function ownRows(table) {
    return Array.prototype.filter.call(table.rows, function(tr) {
      return tr.parentNode.parentNode === table;
    });
  }
  function isGroupRow(tr) {
    if (tr.classList.contains("estate-row-section")) return true;
    var c = cells(tr);
    return c.length === 1 && c[0].colSpan > 1;
  }
  function isTotalRow(tr) {
    return tr.classList.contains("estate-total");
  }
  function tidy(s) {
    return s.replace(/\s+/g, " ").trim();
  }
  function kindOf(th) {
    return th.classList.contains("estate-id") ? "id" : th.classList.contains("estate-as-text") ? "text" : null;
  }
  function boxOf(table) {
    var box = table.closest(".estate-table-box");
    return box && box.querySelector("table") === table ? box : null;
  }
  function sourceOf(table) {
    var sel = table.getAttribute("data-source"), src = null;
    if (sel) {
      try {
        src = document.querySelector(sel);
      } catch (e) {
        src = null;
      }
    }
    return src && src.tagName === "TABLE" ? src : table;
  }
  function bare(table, rows) {
    var src = sourceOf(table), copy = src.cloneNode(true);
    var own = function(t) {
      return function(c) {
        return c.closest("table") === t;
      };
    };
    var liveCells = Array.prototype.filter.call(src.querySelectorAll("th, td"), own(src));
    var copyCells = Array.prototype.filter.call(copy.querySelectorAll("th, td"), own(copy));
    liveCells.forEach(function(c, i) {
      if (c.querySelector(CONTROLS_SEL)) copyCells[i].textContent = tidy(textOf(c));
    });
    var keep = null;
    if (rows) {
      keep = {};
      rows.forEach(function(tr) {
        keep[tr.getAttribute("data-estate-row")] = true;
      });
    }
    var liveRows = ownRows(src), copyRows = ownRows(copy), kept = [];
    liveRows.forEach(function(tr, i) {
      var inBody = tr.parentNode === src.tBodies[0], data = inBody && !isGroupRow(tr) && !isTotalRow(tr);
      var drop = tr.classList.contains("estate-table-filter-row") || (data && keep ? !keep[tr.getAttribute("data-estate-row")] : tr.hidden) || table.classList.contains("estate-copy-body") && tr.parentNode === src.tFoot;
      if (drop) copyRows[i].remove();
      else kept.push(tr);
    });
    copy.querySelectorAll(".estate-sort-mark, .estate-table-copy, .estate-table-markup, .estate-table-excel, .estate-table-resize-handle").forEach(function(el) {
      el.remove();
    });
    var live = [];
    kept.forEach(function(tr) {
      cells(tr).forEach(function(c) {
        if (!c.hidden) live.push(c);
      });
    });
    copy.querySelectorAll("th[hidden], td[hidden]").forEach(function(el) {
      el.remove();
    });
    if (table.classList.contains("estate-copy-body") && copy.tFoot) copy.tFoot.remove();
    return { copy, live, kinds: headerCells(src).map(kindOf) };
  }
  function plainCell(cell, kind) {
    var raw = cell.getAttribute("data-raw");
    var text = tidy(raw !== null && raw.trim() !== "" ? raw : cell.textContent);
    if (text === "" && cell.tagName === "TH") text = tidy(cell.getAttribute("aria-label") || "");
    return (kind ? text : unformat(text)).replace(/\t/g, " ");
  }
  function gridOf(b) {
    var pending = [];
    return Array.prototype.map.call(b.copy.rows, function(row) {
      var out = [], col = 0;
      var place = function() {
        while (pending[col] > 0) {
          out.push({ v: "", head: false, kind: b.kinds[col] });
          pending[col]--;
          col++;
        }
      };
      Array.prototype.forEach.call(row.cells, function(c) {
        place();
        var span = c.colSpan || 1, rows = c.rowSpan || 1, head = c.tagName === "TH" || !!c.closest("tfoot"), th = c.tagName === "TH";
        out.push({ v: plainCell(c, b.kinds[col]), head, th, kind: b.kinds[col] });
        for (var i = 1; i < span; i++) out.push({ v: "", head, th, kind: b.kinds[col + i] });
        if (rows > 1) for (var k = 0; k < span; k++) pending[col + k] = (pending[col + k] || 0) + rows - 1;
        col += span;
      });
      place();
      return out;
    });
  }
  function tsv(b) {
    return gridOf(b).map(function(row) {
      return row.map(function(c) {
        return c.v;
      }).join("	");
    }).join("\n");
  }
  function styledHtml(b) {
    var copy = b.copy;
    [copy].concat(Array.prototype.slice.call(copy.querySelectorAll("*"))).forEach(function(el) {
      [
        "class",
        "id",
        "tabindex",
        "aria-sort",
        "data-estate-on",
        "data-estate-row",
        "data-estate-dir",
        "data-estate-sort",
        "data-estate-page",
        "data-estate-span",
        "data-estate-title",
        "data-sort",
        "data-raw",
        "data-href",
        "data-peek",
        "hidden",
        "list",
        "style"
      ].forEach(function(a) {
        el.removeAttribute(a);
      });
    });
    copy.setAttribute("style", "border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px");
    var dst = Array.prototype.filter.call(copy.querySelectorAll("th, td"), function(c) {
      return c.closest("table") === copy;
    });
    for (var i = 0; i < dst.length; i++) {
      var cs = window.getComputedStyle(b.live[i]);
      var align = cs.textAlign === "end" || cs.textAlign === "right" ? "right" : cs.textAlign === "center" ? "center" : "left";
      var head = dst[i].tagName === "TH" || dst[i].closest("tfoot");
      dst[i].removeAttribute("title");
      dst[i].setAttribute("style", "border:1px solid #c8ced6;padding:4px 8px;text-align:" + align + (head ? ";font-weight:bold;background:#f2f4f7" : ""));
    }
    return copy.outerHTML;
  }
  function toClipboard(html, text) {
    if (window.isSecureContext && navigator.clipboard && window.ClipboardItem) {
      return navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" })
      })]);
    }
    var holder = document.createElement("div");
    holder.innerHTML = html;
    holder.style.cssText = "position:fixed;left:-9999px;top:0;";
    document.body.appendChild(holder);
    var range = document.createRange(), sel = window.getSelection();
    range.selectNodeContents(holder);
    sel.removeAllRanges();
    sel.addRange(range);
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    sel.removeAllRanges();
    holder.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error("copy refused"));
  }
  function esc(t) {
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function markupOf(b) {
    var out = ["<table>"];
    [b.copy.tHead].concat(Array.prototype.slice.call(b.copy.tBodies), [b.copy.tFoot]).forEach(function(sec) {
      if (!sec || !sec.rows.length) return;
      var tag = sec.tagName.toLowerCase();
      out.push("  <" + tag + ">");
      Array.prototype.forEach.call(sec.rows, function(tr) {
        out.push("    <tr>" + Array.prototype.map.call(tr.cells, function(c) {
          var t = c.tagName.toLowerCase(), span = "";
          if (c.colSpan > 1) span += ' colspan="' + c.colSpan + '"';
          if (c.rowSpan > 1) span += ' rowspan="' + c.rowSpan + '"';
          return "<" + t + span + ">" + esc(tidy(textOf(c))) + "</" + t + ">";
        }).join("") + "</tr>");
      });
      out.push("  </" + tag + ">");
    });
    out.push("</table>");
    return out.join("\n");
  }
  function textToClipboard(text) {
    if (window.isSecureContext && navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:0;";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    ta.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error("copy refused"));
  }
  function writerOf() {
    var E = window.ExcelJS;
    return E && typeof E.Workbook === "function" && E.Workbook.prototype && typeof E.Workbook.prototype.addWorksheet === "function" ? E : null;
  }
  function tableName(table) {
    var box = boxOf(table), band = box && box.querySelector(":scope > .estate-table-title"), t = "";
    if (band) {
      for (var n = band.firstChild; n; n = n.nextSibling) if (n.nodeType === 3) t += n.data;
    } else if (table.caption) t = table.caption.textContent;
    return tidy(t) || "Table";
  }
  function sheetName(name) {
    return name.replace(/[\[\]:*?\/\\]/g, "").slice(0, 31) || "Table";
  }
  function fileName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "table";
  }
  function workbookNumber(c) {
    if (c.th || c.kind || c.v === "" || asPhone(c.v) !== null || asDate(c.v) !== null || /^0\d/.test(c.v)) return null;
    return asNumber(c.v);
  }
  function writeWorkbook(table, b, rows) {
    var E = writerOf();
    if (!E) return Promise.reject(new Error("no writer"));
    var name = tableName(table), wb = new E.Workbook(), ws = wb.addWorksheet(sheetName(name));
    var grid = gridOf(bare(table, rows)), cols = grid.reduce(function(m, r) {
      return Math.max(m, r.length);
    }, 0);
    var fmt = [], widths = [];
    for (var c = 0; c < cols; c++) {
      var dec = false, w = 0;
      grid.forEach(function(r) {
        var x = r[c];
        if (!x) return;
        w = Math.max(w, x.v.length);
        if (workbookNumber(x) !== null && decimalsOf(x.v) > 0) dec = true;
      });
      fmt[c] = dec ? "#,##0.00" : "#,##0";
      widths[c] = Math.min(Math.max(w + 2, 10), 60);
    }
    ws.columns = widths.map(function(w2) {
      return { width: w2 };
    });
    grid.forEach(function(r) {
      var row = ws.addRow(r.map(function(x) {
        var n = workbookNumber(x);
        return n !== null ? n : x.v === "" ? null : x.v;
      }));
      r.forEach(function(x, i) {
        var cell = row.getCell(i + 1);
        if (workbookNumber(x) !== null) {
          cell.numFmt = fmt[i];
          cell.alignment = { horizontal: "right" };
        }
        if (x.head) cell.font = { bold: true };
      });
    });
    return wb.xlsx.writeBuffer().then(function(buf) {
      var blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      var url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url;
      a.download = fileName(name) + ".xlsx";
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  function bodyRows(table) {
    return kids(table.tBodies[0], ["TR"]);
  }
  function dataRows(table) {
    return bodyRows(table).filter(function(tr) {
      return !isGroupRow(tr) && !isTotalRow(tr);
    });
  }
  function segments(rows) {
    var segs = [], cur = { head: null, rows: [], tail: [] };
    rows.forEach(function(tr) {
      if (isGroupRow(tr)) {
        if (cur.head || cur.rows.length || cur.tail.length) segs.push(cur);
        cur = { head: tr, rows: [], tail: [] };
      } else if (isTotalRow(tr)) cur.tail.push(tr);
      else cur.rows.push(tr);
    });
    if (cur.head || cur.rows.length || cur.tail.length) segs.push(cur);
    return segs;
  }
  function labelOf(th) {
    return tidy(th.textContent) || tidy(th.getAttribute("aria-label") || "");
  }
  function cellValue(tr, idx) {
    var td = cells(tr)[idx];
    if (!td) return "";
    var o = td.getAttribute("data-sort");
    return o !== null ? o : textOf(td);
  }
  function columnStarts(tr) {
    var at = 0;
    return cells(tr).map(function(c) {
      var s = at;
      at += c.colSpan || 1;
      return s;
    });
  }
  function cellAt(tr, col) {
    var cs = cells(tr), starts = columnStarts(tr);
    for (var i = 0; i < cs.length; i++) if (starts[i] === col && (cs[i].colSpan || 1) === 1) return cs[i];
    return null;
  }
  function tip(node, text) {
    (window.EstateTable && window.EstateTable.tooltip || setTitle)(node, text);
  }
  function setTitle(node, text) {
    node.title = text;
  }
  function state(table) {
    return table.__estateFilter || (table.__estateFilter = { words: [], cols: [], count: null, pass: null, page: null, opened: false });
  }
  function storeOf(table) {
    var st = state(table);
    if (st.store !== void 0) return st.store;
    var key = table.getAttribute("data-store");
    st.store = null;
    if (key) {
      st.store = {};
      try {
        var v = localStorage.getItem(key), r = v ? JSON.parse(v) : null;
        if (r && typeof r === "object" && !Array.isArray(r)) st.store = r;
      } catch (e) {
      }
    }
    return st.store;
  }
  function saveStore(table) {
    var key = table.getAttribute("data-store"), st = state(table);
    if (!key || !st.store) return;
    try {
      localStorage.setItem(key, JSON.stringify(st.store));
    } catch (e) {
    }
  }
  var SORT_TIP = { none: "Sort \u2014 shift-click to add this column after the ones in force", asc: "Sorted ascending \u2014 click for descending", desc: "Sorted descending \u2014 click for the opening order" };
  function headTip(th, d) {
    var own = th.getAttribute("data-estate-title");
    return (own ? own + " \u2014 " : "") + SORT_TIP[d];
  }
  function sortList(table) {
    var out = [];
    (table.getAttribute("data-estate-sort") || "").split(",").forEach(function(item) {
      var p = item.split(":");
      if (p.length === 2 && p[0] !== "" && (p[1] === "asc" || p[1] === "desc")) out.push({ i: +p[0], d: p[1] });
    });
    return out;
  }
  function serialize(list) {
    return list.map(function(k) {
      return k.i + ":" + k.d;
    }).join(",");
  }
  function openingList(table) {
    var st = state(table);
    if (!st.opening) st.opening = parseSortBy(table.getAttribute("data-sort-by"), headerCells(table).length);
    return st.opening;
  }
  function applySort(table, list) {
    var tbody = table.tBodies[0], rows = bodyRows(table), st = state(table);
    var next = rows.reduce(function(m, tr) {
      var v = tr.getAttribute("data-estate-row");
      return v === null ? m : Math.max(m, +v + 1);
    }, 0);
    rows.forEach(function(tr) {
      if (!tr.hasAttribute("data-estate-row")) tr.setAttribute("data-estate-row", next++);
    });
    var effective = list.length ? list : openingList(table), segs = segments(rows), heads = headerCells(table);
    if (!effective.length) {
      segs.forEach(function(s) {
        s.rows.sort(function(x, y) {
          return x.getAttribute("data-estate-row") - y.getAttribute("data-estate-row");
        });
      });
    } else {
      var keys = effective.map(function(k) {
        var th = heads[k.i], kind = th ? kindOf(th) : null, all = [];
        segs.forEach(function(s) {
          s.rows.forEach(function(tr) {
            all.push(classify(cellValue(tr, k.i), kind));
          });
        });
        var abs = table.classList.contains("estate-sort-abs") || th && th.classList.contains("estate-sort-abs");
        return { i: k.i, kind, cmp: comparator(columnType(all), k.d, abs) };
      });
      segs.forEach(function(s) {
        var pairs = s.rows.map(function(tr) {
          return { tr, v: keys.map(function(k) {
            return classify(cellValue(tr, k.i), k.kind);
          }) };
        });
        pairs.sort(function(x, y) {
          for (var k = 0; k < keys.length; k++) {
            var c = keys[k].cmp(x.v[k], y.v[k]);
            if (c) return c;
          }
          return 0;
        });
        s.rows = pairs.map(function(p) {
          return p.tr;
        });
      });
    }
    segs.forEach(function(s) {
      if (s.head) tbody.appendChild(s.head);
      s.rows.forEach(function(tr) {
        tbody.appendChild(tr);
      });
      s.tail.forEach(function(tr) {
        tbody.appendChild(tr);
      });
    });
    heads.forEach(function(h, i) {
      if (!h.classList.contains("estate-sortable")) return;
      var on = null;
      effective.forEach(function(k) {
        if (k.i === i) on = k.d;
      });
      h.setAttribute("aria-sort", on ? on === "asc" ? "ascending" : "descending" : "none");
      h.setAttribute("data-estate-dir", on || "none");
      tip(h, headTip(h, on || "none"));
    });
    table.setAttribute("data-estate-sort", serialize(list));
    st.opened = true;
    if (st.page) refilter(table);
  }
  function nextPlain(table, list, idx) {
    var opening = openingList(table), first = opening.length && opening[0].i === idx ? opening[0].d : null;
    if (first) return list.length === 1 && list[0].i === idx ? [] : [{ i: idx, d: first === "asc" ? "desc" : "asc" }];
    if (list.length === 1 && list[0].i === idx) return list[0].d === "asc" ? [{ i: idx, d: "desc" }] : [];
    return [{ i: idx, d: "asc" }];
  }
  function nextShift(list, idx) {
    var out = [], found = false;
    list.forEach(function(k) {
      if (k.i !== idx) {
        out.push(k);
        return;
      }
      found = true;
      if (k.d === "asc") out.push({ i: idx, d: "desc" });
    });
    if (!found) out.push({ i: idx, d: "asc" });
    return out;
  }
  function enableSort(table) {
    var ths = headerCells(table);
    if (!ths.length || !bodyRows(table).length) return false;
    for (var i = 0; i < ths.length; i++) if (ths[i].colSpan > 1) return true;
    ths.forEach(function(th, idx) {
      if (th.classList.contains("estate-no-sort") || !labelOf(th)) return;
      th.classList.add("estate-sortable");
      th.setAttribute("tabindex", "0");
      th.setAttribute("aria-sort", "none");
      th.setAttribute("data-estate-dir", "none");
      th.setAttribute("data-estate-title", th.title || "");
      tip(th, headTip(th, "none"));
      var mark = document.createElement("span");
      mark.className = "estate-sort-mark";
      mark.setAttribute("aria-hidden", "true");
      th.appendChild(mark);
      var go = function(shift) {
        quiet(table, function() {
          var list = sortList(table);
          applySort(table, shift ? nextShift(list.length ? list : openingList(table), idx) : nextPlain(table, list, idx));
        });
      };
      th.addEventListener("click", function(e) {
        if (e.target.closest(".estate-table-resize-handle") || state(table).dragging) return;
        go(e.shiftKey);
      });
      th.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go(e.shiftKey);
        }
      });
    });
    return true;
  }
  function setVisible(tr, on) {
    if (on) tr.removeAttribute("hidden");
    else tr.setAttribute("hidden", "");
  }
  function hasSum(tr) {
    return !!tr.querySelector(":scope > td.estate-sum, :scope > th.estate-sum");
  }
  function refilter(table) {
    var st = state(table), total = 0, pass = [];
    var live = st.words.length > 0 || st.cols.some(Boolean);
    var segs = segments(bodyRows(table));
    segs.forEach(function(s) {
      s.hits = [];
      s.rows.forEach(function(tr) {
        var c = cells(tr), text = c.map(textOf).join(" ").toLowerCase();
        var hit = st.words.every(function(t) {
          return text.indexOf(t) !== -1;
        }) && st.cols.every(function(test, i) {
          return !test || test(tidy(textOf(c[i])));
        });
        total++;
        if (hit) {
          pass.push(tr);
          s.hits.push(tr);
        } else setVisible(tr, false);
      });
    });
    st.pass = pass;
    sumTable(table, pass);
    var at = 0, pages = 1, size = 0;
    if (st.page) {
      size = st.page.size;
      pages = Math.max(1, Math.ceil(pass.length / size));
      if (st.page.at >= pages) st.page.at = 0;
      at = st.page.at;
    }
    var onPage = {};
    pass.forEach(function(tr, i) {
      var on = !st.page || i >= at * size && i < (at + 1) * size;
      setVisible(tr, on);
      if (on) onPage[tr.getAttribute("data-estate-row")] = true;
    });
    segs.forEach(function(s) {
      var any = s.hits.some(function(tr) {
        return onPage[tr.getAttribute("data-estate-row")];
      });
      if (s.head) setVisible(s.head, any);
      s.tail.forEach(function(tr) {
        setVisible(tr, (!live || hasSum(tr)) && (!st.page || any));
      });
    });
    var keepFoot = table.classList.contains("estate-keep-foot");
    kids(table.tFoot, ["TR"]).forEach(function(tr) {
      setVisible(tr, !live || keepFoot || hasSum(tr));
    });
    var loaded = table.getAttribute("data-total"), ofLoaded = loaded ? total + " loaded of " + loaded : "";
    if (st.count) st.count.textContent = live ? pass.length + " of " + total + " shown" + (loaded ? " \xB7 " + ofLoaded : "") : ofLoaded;
    if (st.page) {
      var a = pass.length ? at * size + 1 : 0, b = Math.min(pass.length, (at + 1) * size);
      st.page.count.textContent = pass.length ? a + "\u2013" + b + " of " + (loaded ? ofLoaded : pass.length) + " \xB7 page " + (at + 1) + " of " + pages : "0 rows";
      st.page.prev.disabled = at === 0;
      st.page.next.disabled = at >= pages - 1;
      table.setAttribute("data-estate-page", at + 1 + "/" + pages);
    }
    if (table.classList.contains("estate-drop-empty")) dropEmpty(table);
    placePins(table);
    table.dispatchEvent(new CustomEvent("estate:filtered", { bubbles: true, detail: { shown: pass.length, total } }));
    if (st.page) table.dispatchEvent(new CustomEvent("estate:paged", { bubbles: true, detail: { page: at + 1, pages, size } }));
  }
  function placeBar(table, bar) {
    var box = boxOf(table), scroll = box && box.querySelector(":scope > .estate-table-scroll");
    if (scroll) box.insertBefore(bar, scroll);
    else table.parentNode.insertBefore(bar, table);
  }
  function barOf(table) {
    var st = state(table);
    if (st.bar) return st.bar;
    st.bar = document.createElement("div");
    st.bar.className = "estate-table-filter";
    st.count = document.createElement("span");
    st.count.className = "estate-table-filter-count";
    st.bar.appendChild(st.count);
    placeBar(table, st.bar);
    return st.bar;
  }
  function enableFilter(table) {
    if (!bodyRows(table).length || !table.parentNode) return false;
    var bar = barOf(table);
    var input = document.createElement("input");
    input.type = "search";
    input.className = "estate-table-filter-box";
    input.placeholder = "Filter\u2026";
    input.setAttribute("aria-label", "Filter the rows of this table");
    tip(input, "Every word typed must appear somewhere in the row");
    bar.insertBefore(input, bar.firstChild);
    var run = function() {
      var st = state(table);
      st.words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
      if (st.page) st.page.at = 0;
      refilter(table);
    };
    input.addEventListener("input", run);
    input.addEventListener("search", run);
    return true;
  }
  var COLS_PREF = "estate-table.filter-columns", colsMemory = null;
  function globalCols() {
    if (colsMemory !== null) return colsMemory;
    try {
      var v = localStorage.getItem(COLS_PREF);
      return v === null ? null : v !== "hidden";
    } catch (e) {
      return null;
    }
  }
  function colsShown(table) {
    var store = storeOf(table);
    if (store) {
      if (store.cols) return store.cols !== "hidden";
    } else {
      var g = globalCols();
      if (g !== null) return g;
    }
    return table.getAttribute("data-filter-row") !== "hidden";
  }
  function enableFilterColumns(table) {
    var ths = headerCells(table), rows = bodyRows(table);
    if (!ths.length || !rows.length) return false;
    if (table.tHead.querySelector(".estate-table-filter-row")) return true;
    for (var i = 0; i < ths.length; i++) if (ths[i].colSpan > 1) return true;
    barOf(table);
    var st = state(table);
    var data = dataRows(table);
    var row = table.tHead.insertRow(-1);
    row.className = "estate-table-filter-row";
    ths.forEach(function(th, c) {
      var cell = document.createElement("td");
      if (th.classList.contains("estate-pin")) cell.classList.add("estate-pin");
      row.appendChild(cell);
      st.cols[c] = null;
      var label = labelOf(th);
      if (!label) return;
      var kind = kindOf(th);
      var values = data.map(function(tr) {
        return tidy(textOf(cells(tr)[c]));
      });
      var numeric = !kind && !th.classList.contains("estate-text-filter") && columnType(values.map(function(v) {
        return classify(v);
      })) === "num";
      var input = document.createElement("input");
      input.type = "text";
      input.size = 1;
      input.className = "estate-filter-col-box";
      input.placeholder = label;
      input.setAttribute("aria-label", "Filter by " + label);
      tip(input, numeric ? "Filter \u2014 text, or >100, <=50, =50, 100..500" : "Filter \u2014 any part of the value");
      if (!numeric) {
        var list = document.createElement("datalist");
        list.id = "estate-filter-" + Math.random().toString(36).slice(2) + "-" + c;
        cell.appendChild(list);
        var offer = function() {
          var vals = dataRows(table).map(function(tr) {
            return tidy(textOf(cells(tr)[c]));
          }).filter(Boolean).filter(function(v, k, a) {
            return a.indexOf(v) === k;
          }).sort();
          list.textContent = "";
          if (vals.length > 1 && vals.length <= 100) {
            vals.forEach(function(v) {
              var o = document.createElement("option");
              o.value = v;
              list.appendChild(o);
            });
            input.setAttribute("list", list.id);
          } else input.removeAttribute("list");
        };
        offer();
        input.addEventListener("focus", offer);
      }
      input.addEventListener("input", function() {
        st.cols[c] = columnTest(input.value, numeric);
        th.classList.toggle("estate-filtered", !!st.cols[c]);
        if (st.page) st.page.at = 0;
        refilter(table);
      });
      cell.appendChild(input);
    });
    setVisible(row, colsShown(table));
    var tog = document.createElement("button");
    tog.type = "button";
    tog.className = "estate-table-cols-toggle";
    tip(tog, "Show or hide the filter box under each column (f while in the table)");
    tog.setAttribute("aria-label", "Show or hide the filter box under each column (f while in the table)");
    tog.addEventListener("click", function() {
      toggleColumns(table);
    });
    var bar = barOf(table);
    bar.insertBefore(tog, st.count);
    return true;
  }
  function toggleColumns(table) {
    var show = !colsShown(table), store = storeOf(table);
    if (store) {
      store.cols = show ? "shown" : "hidden";
      saveStore(table);
      var own = table.tHead.querySelector("tr.estate-table-filter-row");
      if (own) setVisible(own, show);
      return;
    }
    colsMemory = show;
    try {
      localStorage.setItem(COLS_PREF, show ? "shown" : "hidden");
    } catch (err) {
    }
    document.querySelectorAll('table.estate-filter-columns[data-estate-on=""]:not([data-store]) tr.estate-table-filter-row').forEach(function(r) {
      setVisible(r, show);
    });
  }
  document.addEventListener("keydown", function(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || (e.key || "").toLowerCase() !== "f") return;
    var t = e.target;
    if (!t || !t.closest || t.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].indexOf(t.tagName) !== -1) return;
    var host = t.closest(".estate-table-box, table");
    var table = host && (host.tagName === "TABLE" ? host : host.querySelector("table"));
    if (!table || !table.classList.contains("estate-filter-columns") || table.getAttribute("data-estate-on") !== "") return;
    toggleColumns(table);
    e.preventDefault();
  });
  var wrote = typeof WeakMap === "function" ? /* @__PURE__ */ new WeakMap() : null;
  function textNodeOf(cell) {
    var n = cell;
    while (n && n.childNodes.length === 1 && n.firstChild.nodeType === 1 && !n.firstChild.matches(CONTROLS_SEL)) n = n.firstChild;
    return n && n.childNodes.length === 1 && n.firstChild.nodeType === 3 ? n.firstChild : n && n.childNodes.length === 0 && n === cell ? null : null;
  }
  function writeText(cell, text) {
    var node = textNodeOf(cell);
    if (node) node.nodeValue = text;
    else cell.textContent = text;
  }
  function formatColumns(table) {
    var heads = headerCells(table), out = [];
    if (!heads.length || !wrote) return out;
    var all = table.classList.contains("estate-format"), data = dataRows(table);
    heads.forEach(function(th, c) {
      if (kindOf(th)) return;
      if (th.classList.contains("estate-format")) {
        out.push(c);
        return;
      }
      if (!all) return;
      var values = data.map(function(tr) {
        var x = cellAt(tr, c);
        return classify(x ? textOf(x) : "");
      });
      if (columnType(values) === "num") out.push(c);
    });
    return out;
  }
  function decimalsFor(table, c) {
    var th = headerCells(table)[c], d = th.getAttribute("data-decimals");
    if (d === null) d = table.getAttribute("data-decimals");
    if (d !== null && /^\d+$/.test(d)) return +d;
    var most = 0;
    bodyRows(table).concat(kids(table.tFoot, ["TR"])).forEach(function(tr) {
      var x = cellAt(tr, c);
      if (x && !(wrote.get(x) || {}).sum) most = Math.max(most, decimalsOf(textOf(x)));
    });
    return most;
  }
  function formatTable(table) {
    var cols = formatColumns(table);
    if (!cols.length) return;
    var rows = bodyRows(table).concat(kids(table.tFoot, ["TR"]));
    cols.forEach(function(c) {
      var decimals = decimalsFor(table, c);
      rows.forEach(function(tr) {
        if (isGroupRow(tr)) return;
        var cell = cellAt(tr, c);
        if (!cell || cell.querySelector(CONTROLS_SEL)) return;
        var rec = wrote.get(cell), text = textOf(cell), raw;
        if (rec && rec.sum) return;
        if (rec) {
          if (tidy(text) === rec.text) return;
          raw = tidy(text);
        } else {
          if (cell.hasAttribute("data-raw")) return;
          raw = tidy(text);
        }
        var formatted = formatNumber(raw, decimals);
        if (formatted === null) return;
        cell.setAttribute("data-raw", raw);
        if (formatted !== raw) writeText(cell, formatted);
        wrote.set(cell, { raw, text: formatted });
      });
    });
  }
  function sumTable(table, pass) {
    var sums = Array.prototype.filter.call(table.querySelectorAll("tr.estate-total > td.estate-sum, tr.estate-total > th.estate-sum"), function(td) {
      return td.closest("table") === table;
    });
    if (!sums.length || !wrote) return;
    var formatted = formatColumns(table);
    sums.forEach(function(td) {
      var tr = td.parentNode, col = columnStarts(tr)[cells(tr).indexOf(td)];
      var values = [], most = 0;
      pass.forEach(function(row) {
        var x = cellAt(row, col);
        if (!x) return;
        var t = tidy(textOf(x)), n = t === "" || asPhone(t) !== null || asDate(t) !== null || /^0\d/.test(t) ? null : asNumber(t);
        if (n === null) return;
        values.push(n);
        most = Math.max(most, decimalsOf(t));
      });
      var decimals = formatted.indexOf(col) !== -1 ? decimalsFor(table, col) : most, scale = Math.pow(10, decimals);
      var sum = values.reduce(function(acc, n) {
        return acc + Math.round(n * scale);
      }, 0) / scale;
      var text = (sum < 0 ? "-" : "") + groupNumber(Math.abs(sum), decimals), raw = (sum < 0 ? "-" : "") + fixedHalfUp(Math.abs(sum), decimals);
      td.setAttribute("data-raw", raw);
      var rec = wrote.get(td);
      if (!rec || rec.text !== text || tidy(textOf(td)) !== text) writeText(td, text);
      wrote.set(td, { raw, text, sum: true });
    });
  }
  function footerOf(table) {
    var box = boxOf(table), f;
    if (box) {
      f = box.querySelector(":scope > .estate-table-footer");
      if (!f) {
        f = document.createElement("div");
        f.className = "estate-table-footer";
        box.appendChild(f);
      }
      return f;
    }
    f = table.nextElementSibling;
    if (f && f.classList.contains("estate-table-note")) return f;
    f = document.createElement("div");
    f.className = "estate-table-note";
    table.parentNode.insertBefore(f, table.nextSibling);
    return f;
  }
  function enablePage(table) {
    var st = state(table);
    if (st.page || !table.parentNode) return true;
    var sizes = (table.getAttribute("data-page-sizes") || "5 10 20 50 100").split(/\s+/).map(Number).filter(function(n) {
      return n > 0;
    });
    if (!sizes.length) sizes = [20];
    var store = storeOf(table), size = store && store.size > 0 ? +store.size : +(table.getAttribute("data-page-size") || sizes[0]);
    if (!(size > 0)) size = sizes[0];
    if (sizes.indexOf(size) === -1) sizes.push(size), sizes.sort(function(a, b) {
      return a - b;
    });
    var pager = document.createElement("span");
    pager.className = "estate-table-pager";
    var select = document.createElement("select");
    select.className = "estate-table-page-size";
    select.setAttribute("aria-label", "Rows per page");
    tip(select, "Rows per page");
    sizes.forEach(function(n) {
      var o = document.createElement("option");
      o.value = n;
      o.textContent = n;
      if (n === size) o.selected = true;
      select.appendChild(o);
    });
    var prev = document.createElement("button"), next = document.createElement("button"), count = document.createElement("span");
    prev.type = next.type = "button";
    prev.className = "estate-table-page-prev";
    next.className = "estate-table-page-next";
    count.className = "estate-table-page-count";
    prev.setAttribute("aria-label", "Previous page");
    next.setAttribute("aria-label", "Next page");
    tip(prev, "Previous page");
    tip(next, "Next page");
    pager.appendChild(select);
    pager.appendChild(prev);
    pager.appendChild(count);
    pager.appendChild(next);
    footerOf(table).appendChild(pager);
    st.page = { size, at: 0, pager, count, prev, next };
    select.addEventListener("change", function() {
      st.page.size = +select.value;
      st.page.at = 0;
      if (store) {
        store.size = st.page.size;
        saveStore(table);
      }
      quiet(table, function() {
        refilter(table);
      });
    });
    prev.addEventListener("click", function() {
      if (st.page.at > 0) {
        st.page.at--;
        quiet(table, function() {
          refilter(table);
        });
      }
    });
    next.addEventListener("click", function() {
      st.page.at++;
      quiet(table, function() {
        refilter(table);
      });
    });
    return true;
  }
  function width(tr) {
    return cells(tr).reduce(function(n, c) {
      return n + (c.colSpan || 1);
    }, 0);
  }
  function dropEmpty(table) {
    var heads = kids(table.tHead, ["TR"]), body = bodyRows(table), foot = kids(table.tFoot, ["TR"]);
    var all = heads.concat(body, foot);
    all.forEach(function(tr) {
      cells(tr).forEach(function(c2) {
        if (!c2.hasAttribute("data-estate-span")) c2.setAttribute("data-estate-span", String(c2.colSpan || 1));
        c2.hidden = false;
        c2.colSpan = parseInt(c2.getAttribute("data-estate-span"), 10) || 1;
      });
    });
    var head = headerCells(table), cols = head.length;
    if (!cols || head.some(function(c2) {
      return (c2.colSpan || 1) !== 1;
    })) return;
    var data = dataRows(table);
    if (!data.length) return;
    var straight = data.every(function(tr) {
      var c2 = cells(tr);
      return c2.length === cols && c2.every(function(x) {
        return (x.colSpan || 1) === 1;
      });
    });
    if (!straight) return;
    var st = table.__estateFilter, showing = st && st.pass ? st.pass : data.filter(function(tr) {
      return !tr.hidden;
    });
    var judged = showing.length ? showing : data;
    var gone = [];
    for (var c = 0; c < cols; c++) {
      if (head[c].classList.contains("estate-keep")) continue;
      if (!judged.some(function(tr) {
        return filled(cells(tr)[c]);
      })) gone.push(c);
    }
    if (!gone.length || gone.length >= cols) return;
    all.forEach(function(tr) {
      var cs = cells(tr);
      if (cs.length === cols && cs.every(function(x) {
        return (x.colSpan || 1) === 1;
      })) {
        gone.forEach(function(g) {
          cs[g].hidden = true;
        });
        return;
      }
      if (width(tr) !== cols) return;
      var at = 0;
      cs.forEach(function(cell) {
        var span = cell.colSpan || 1, lost = 0;
        for (var k = at; k < at + span; k++) if (gone.indexOf(k) !== -1) lost++;
        if (lost === span) cell.hidden = true;
        else if (lost) cell.colSpan = span - lost;
        at += span;
      });
    });
  }
  function carried(table) {
    var st = sourceOf(table).__estateFilter;
    return st && st.pass ? st.pass : null;
  }
  function placeButton(table, b, after) {
    var box = boxOf(table);
    var band = box && box.querySelector(":scope > .estate-table-title");
    if (band) {
      var actions = band.querySelector(":scope > .estate-table-actions");
      if (!actions) {
        actions = document.createElement("div");
        actions.className = "estate-table-actions";
        band.appendChild(actions);
      }
      var lead = actions.firstElementChild;
      if (after && after.parentNode === actions) actions.insertBefore(b, after.nextSibling);
      else actions.insertBefore(b, lead && lead.classList.contains("estate-new") ? lead.nextSibling : actions.firstChild);
    } else if (table.caption) {
      table.caption.appendChild(b);
    } else {
      var bar = box ? box.querySelector(":scope > .estate-table-filter") : table.previousElementSibling;
      if (!bar || !bar.classList.contains("estate-table-filter")) {
        bar = document.createElement("div");
        bar.className = "estate-table-filter";
        placeBar(table, bar);
      }
      bar.appendChild(b);
    }
  }
  function outcome(b, ok, text, restore) {
    b.classList.add(ok ? "estate-copied" : "estate-copy-failed");
    tip(b, text);
    setTimeout(function() {
      b.classList.remove("estate-copied", "estate-copy-failed");
      tip(b, restore);
    }, 1200);
  }
  var COPY_TIP = "Copy the table \u2014 paste into a spreadsheet or an email";
  var COPY_ALL_TIP = "Copy every table here \u2014 paste into a spreadsheet or an email";
  function copyBox(table) {
    var box = table.closest(".estate-table-box");
    return box && box.classList.contains("estate-copy-box") ? box : null;
  }
  function boxTables(box, cls) {
    return Array.prototype.filter.call(box.querySelectorAll("table." + cls), function(t) {
      return t.closest(".estate-table-box") === box && bodyRows(t).length;
    });
  }
  function boxButton(table, box, key, cls, tipText, press) {
    if (box[key]) return true;
    var b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    tip(b, tipText);
    b.setAttribute("aria-label", tipText);
    b.addEventListener("click", function() {
      press().then(function() {
        outcome(b, true, "Copied", tipText);
      }, function() {
        outcome(b, false, "Copy failed \u2014 the browser refused the clipboard", tipText);
      });
    });
    placeButton(box.querySelector("table"), b, key === "__estateMarkupAll" ? box.__estateCopyAll : null);
    box[key] = b;
    return true;
  }
  function enableCopy(table) {
    if (!bodyRows(table).length) return false;
    var box = copyBox(table);
    if (box) return boxButton(table, box, "__estateCopyAll", "estate-table-copy", COPY_ALL_TIP, function() {
      var all = boxTables(box, "estate-copy");
      return toClipboard(
        all.map(function(t) {
          return styledHtml(bare(t, carried(t)));
        }).join("\n"),
        all.map(function(t) {
          return tsv(bare(t, carried(t)));
        }).join("\n\n")
      );
    });
    var b = document.createElement("button");
    b.type = "button";
    b.className = "estate-table-copy";
    tip(b, COPY_TIP);
    b.setAttribute("aria-label", COPY_TIP);
    b.addEventListener("click", function() {
      var rows = carried(table), bb = bare(table, rows);
      toClipboard(styledHtml(bb), tsv(bare(table, rows))).then(function() {
        outcome(b, true, "Copied", COPY_TIP);
      }, function() {
        outcome(b, false, "Copy failed \u2014 the browser refused the clipboard", COPY_TIP);
      });
    });
    placeButton(table, b);
    state(table).copyButton = b;
    return true;
  }
  var MARKUP_TIP = "Copy as HTML \u2014 paste into a page's source as tags";
  var MARKUP_ALL_TIP = "Copy every table here as HTML \u2014 paste into a page's source as tags";
  function enableMarkup(table) {
    if (!bodyRows(table).length) return false;
    var box = copyBox(table);
    if (box) return boxButton(table, box, "__estateMarkupAll", "estate-table-markup", MARKUP_ALL_TIP, function() {
      return textToClipboard(boxTables(box, "estate-copy-markup").map(function(t) {
        return markupOf(bare(t, carried(t)));
      }).join("\n\n"));
    });
    var b = document.createElement("button");
    b.type = "button";
    b.className = "estate-table-markup";
    tip(b, MARKUP_TIP);
    b.setAttribute("aria-label", MARKUP_TIP);
    b.addEventListener("click", function() {
      textToClipboard(markupOf(bare(table, carried(table)))).then(function() {
        outcome(b, true, "Copied", MARKUP_TIP);
      }, function() {
        outcome(b, false, "Copy failed \u2014 the browser refused the clipboard", MARKUP_TIP);
      });
    });
    var st = state(table);
    placeButton(table, b, st.copyButton);
    st.markupButton = b;
    return true;
  }
  var EXCEL_TIP = "Download the table as an Excel workbook";
  function enableExcel(table) {
    var st = state(table);
    if (st.excel) return true;
    if (!bodyRows(table).length) return false;
    var href = table.getAttribute("data-excel-href"), el;
    if (href) {
      el = document.createElement("a");
      el.href = href;
      var title = table.getAttribute("data-excel-title") || "Download the workbook";
      tip(el, title);
      el.setAttribute("aria-label", title);
    } else {
      if (!writerOf()) return false;
      el = document.createElement("button");
      el.type = "button";
      tip(el, EXCEL_TIP);
      el.setAttribute("aria-label", EXCEL_TIP);
      el.addEventListener("click", function() {
        el.classList.add("estate-busy");
        writeWorkbook(table, el, carried(table)).then(function() {
          outcome(el, true, "Written", EXCEL_TIP);
        }, function() {
          outcome(el, false, "The workbook could not be written", EXCEL_TIP);
        }).then(function() {
          el.classList.remove("estate-busy");
        });
      });
    }
    el.className = "estate-table-excel";
    placeButton(table, el, st.markupButton || st.copyButton);
    st.excel = el;
    return true;
  }
  var peekCard = null, peekCache = {}, peekShown = null;
  function cardOf() {
    if (peekCard) return peekCard;
    peekCard = document.createElement("div");
    peekCard.className = "estate-table-peek";
    peekCard.hidden = true;
    document.body.appendChild(peekCard);
    return peekCard;
  }
  function fetchPeek(url) {
    if (!peekCache[url]) {
      peekCache[url] = fetch(url, { credentials: "same-origin" }).then(function(r) {
        return r.text().then(function(t) {
          return { status: r.status, ok: r.ok, html: /text\/html/i.test(r.headers.get("content-type") || ""), body: t };
        });
      }, function() {
        return { status: 0 };
      });
    }
    return peekCache[url];
  }
  function placeCard(card, td) {
    var r = td.getBoundingClientRect(), gap = 4, w = card.offsetWidth, h = card.offsetHeight;
    var left = r.right + gap, top = r.top;
    if (left + w > window.innerWidth) {
      left = r.left - gap - w;
    }
    if (left < 0) {
      left = Math.max(0, r.left);
      top = r.bottom + gap;
    }
    if (top + h > window.innerHeight) top = Math.max(0, window.innerHeight - h);
    card.style.left = left + "px";
    card.style.top = top + "px";
  }
  function showPeek(td) {
    var url = td.getAttribute("data-peek");
    peekShown = td;
    fetchPeek(url).then(function(r) {
      if (peekShown !== td) return;
      var card = cardOf();
      if (r.status === 0) card.textContent = "the door did not answer";
      else if (!r.ok) card.textContent = "the door answered " + r.status;
      else if (r.html) card.innerHTML = r.body;
      else card.textContent = r.body;
      card.hidden = false;
      placeCard(card, td);
    });
  }
  function hidePeek() {
    peekShown = null;
    if (peekCard) peekCard.hidden = true;
  }
  function enablePeek(table) {
    var st = state(table);
    if (st.peek) return;
    st.peek = true;
    var cellOf = function(e) {
      var el = e.target.closest && e.target.closest("[data-peek]");
      return el && el.closest("table") === table ? el : null;
    };
    table.addEventListener("pointerover", function(e) {
      var td = cellOf(e);
      if (td && td !== peekShown) showPeek(td);
    });
    table.addEventListener("pointerout", function(e) {
      var td = cellOf(e);
      if (td && !(e.relatedTarget && td.contains(e.relatedTarget))) hidePeek();
    });
    table.addEventListener("focusin", function(e) {
      var td = cellOf(e);
      if (td) showPeek(td);
    });
    table.addEventListener("focusout", function(e) {
      if (cellOf(e)) hidePeek();
    });
  }
  document.addEventListener("scroll", hidePeek, true);
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") hidePeek();
  });
  function prepPeek(table) {
    var any = false;
    Array.prototype.forEach.call(table.querySelectorAll("[data-peek]"), function(el) {
      if (el.closest("table") !== table) return;
      any = true;
      if (!el.hasAttribute("tabindex") && !el.matches("a[href], button, input, select, textarea")) el.setAttribute("tabindex", "0");
    });
    if (any) enablePeek(table);
  }
  function enableResize(table) {
    var ths = headerCells(table), st = state(table);
    if (!ths.length) return false;
    if (st.resize) return true;
    st.resize = true;
    var store = storeOf(table), widths = store && store.widths ? store.widths : {};
    ths.forEach(function(th, c) {
      if (!labelOf(th)) return;
      if (widths[c] > 0) th.style.width = widths[c] + "px";
      var handle = document.createElement("span");
      handle.className = "estate-table-resize-handle";
      handle.setAttribute("aria-hidden", "true");
      tip(handle, "Drag to make the column wider or narrower");
      th.appendChild(handle);
      handle.addEventListener("pointerdown", function(e) {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        st.dragging = true;
        var startX = e.clientX, startW = th.getBoundingClientRect().width, min = parseFloat(getComputedStyle(th).fontSize) * 2 || 16;
        var move = function(ev) {
          th.style.width = Math.max(min, startW + ev.clientX - startX) + "px";
        };
        var up = function() {
          document.removeEventListener("pointermove", move);
          document.removeEventListener("pointerup", up);
          if (store) {
            store.widths = store.widths || {};
            store.widths[c] = Math.round(parseFloat(th.style.width));
            saveStore(table);
          }
          quiet(table, function() {
            placePins(table);
          });
          setTimeout(function() {
            st.dragging = false;
          }, 0);
        };
        document.addEventListener("pointermove", move);
        document.addEventListener("pointerup", up);
      });
    });
    return true;
  }
  function enableHref(table) {
    var st = state(table);
    if (st.href) return;
    st.href = true;
    var cellOf = function(e) {
      var td = e.target.closest && e.target.closest("td[data-href]");
      if (!td || td.closest("table") !== table) return null;
      if (e.target.closest("a, button, input, select, textarea, label")) return null;
      return td;
    };
    var open = function(td, newTab) {
      var href = td.getAttribute("data-href");
      if (newTab) window.open(href, "_blank");
      else window.location.assign(href);
    };
    table.addEventListener("click", function(e) {
      var td = cellOf(e);
      if (td) {
        e.preventDefault();
        open(td, e.ctrlKey || e.metaKey);
      }
    });
    table.addEventListener("auxclick", function(e) {
      var td = cellOf(e);
      if (td && e.button === 1) {
        e.preventDefault();
        open(td, true);
      }
    });
    table.addEventListener("keydown", function(e) {
      if (e.key !== "Enter") return;
      var td = e.target.closest && e.target.closest("td[data-href]");
      if (td && td === e.target && td.closest("table") === table) {
        e.preventDefault();
        open(td, false);
      }
    });
  }
  function prepHref(table) {
    var any = false;
    Array.prototype.forEach.call(table.querySelectorAll("td[data-href]"), function(td) {
      if (td.closest("table") !== table) return;
      any = true;
      if (!td.hasAttribute("tabindex")) td.setAttribute("tabindex", "0");
    });
    if (any) enableHref(table);
  }
  function applySticky(table) {
    var box = boxOf(table);
    if (!box || !box.classList.contains("estate-sticky")) return;
    var h = box.getAttribute("data-height"), n = box.getAttribute("data-rows");
    if (h) box.style.setProperty("--estate-table-sticky-h", h);
    else if (n && /^\d+$/.test(n)) box.style.setProperty("--estate-table-sticky-h", "calc((" + n + " + 1) * var(--estate-table-row-h))");
  }
  function placePins(table) {
    var heads = headerCells(table), pinned = [];
    heads.forEach(function(th, i) {
      if (th.classList.contains("estate-pin")) pinned.push(i);
    });
    if (pinned.length < 2) return;
    var left = 0;
    pinned.forEach(function(col, k) {
      if (k > 0) {
        var px = left + "px";
        ownRows(table).forEach(function(tr) {
          var c = cellAt(tr, col);
          if (c && c.classList.contains("estate-pin") && c.style.left !== px) c.style.left = px;
        });
      }
      left += heads[col].getBoundingClientRect().width;
    });
  }
  var pinnedTables = [];
  function watchPins(table) {
    var heads = headerCells(table);
    if (heads.filter(function(th) {
      return th.classList.contains("estate-pin");
    }).length < 2) return;
    if (pinnedTables.indexOf(table) === -1) pinnedTables.push(table);
    if (window.ResizeObserver && !table.__estatePinWatch) {
      table.__estatePinWatch = new ResizeObserver(function() {
        quiet(table, function() {
          placePins(table);
        });
      });
      table.__estatePinWatch.observe(table);
    }
  }
  window.addEventListener("resize", function() {
    pinnedTables.forEach(function(t) {
      if (t.isConnected) quiet(t, function() {
        placePins(t);
      });
    });
  });
  var CONTROLS = [
    ["estate-sort", enableSort],
    ["estate-filter", enableFilter],
    ["estate-filter-columns", enableFilterColumns],
    ["estate-copy", enableCopy],
    ["estate-copy-markup", enableMarkup],
    ["estate-excel", enableExcel],
    ["estate-page", enablePage],
    ["estate-resize", enableResize]
  ];
  function build(table) {
    var built = table.__estateBuilt || (table.__estateBuilt = {});
    CONTROLS.forEach(function(c) {
      if (!built[c[0]] && table.classList.contains(c[0])) built[c[0]] = c[1](table) !== false;
    });
    if (table.hasAttribute("data-total")) barOf(table);
  }
  function quiet(table, fn) {
    try {
      fn();
    } finally {
      if (table.__estateWatch) table.__estateWatch.takeRecords();
    }
  }
  function settle(table) {
    formatTable(table);
    var list = sortList(table);
    if ((list.length || openingList(table).length) && table.__estateBuilt["estate-sort"]) applySort(table, list);
    prepHref(table);
    prepPeek(table);
    refilter(table);
  }
  function refresh(table) {
    if (table.getAttribute("data-estate-on") !== "") return;
    quiet(table, function() {
      if (!sortList(table).length && !openingList(table).length) bodyRows(table).forEach(function(tr, i) {
        tr.setAttribute("data-estate-row", i);
      });
      build(table);
      settle(table);
    });
  }
  function bodyChanged(table, rec) {
    if (rec.type === "attributes") return false;
    if (rec.target === table) {
      return Array.prototype.some.call(rec.addedNodes, isTbody) || Array.prototype.some.call(rec.removedNodes, isTbody);
    }
    var el = rec.target.nodeType === 1 ? rec.target : rec.target.parentNode;
    var tb = el && el.closest("tbody");
    return !!tb && tb.parentNode === table;
  }
  function isTbody(n) {
    return n.nodeName === "TBODY";
  }
  function restoreHeader(table, th) {
    if (!table.__estateBuilt || !table.__estateBuilt["estate-sort"] || headerCells(table).indexOf(th) === -1) return;
    var i = headerCells(table).indexOf(th), st = table.__estateFilter;
    if (!th.classList.contains("estate-no-sort") && labelOf(th) && th.querySelector(".estate-sort-mark") && !th.classList.contains("estate-sortable")) th.classList.add("estate-sortable");
    if (st && st.cols[i] && !th.classList.contains("estate-filtered")) th.classList.add("estate-filtered");
  }
  function watch(table) {
    if (!window.MutationObserver) return;
    var mo = new MutationObserver(function(recs) {
      try {
        recs.forEach(function(r) {
          if (r.type === "attributes" && r.target.tagName === "TH") restoreHeader(table, r.target);
        });
        if (recs.some(function(r) {
          return bodyChanged(table, r);
        })) refresh(table);
        else mo.takeRecords();
      } catch (e) {
        if (window.console) console.error("estate-table:", e);
      }
    });
    mo.observe(table, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"] });
    table.__estateWatch = mo;
  }
  function decorate(table) {
    if (table.hasAttribute("data-estate-on")) return;
    table.setAttribute("data-estate-on", "");
    bodyRows(table).forEach(function(tr, i) {
      tr.setAttribute("data-estate-row", i);
    });
    build(table);
    settle(table);
    applySticky(table);
    watchPins(table);
    watch(table);
  }
  var SEL = "table.estate-sort, table.estate-filter, table.estate-filter-columns, table.estate-drop-empty, table.estate-copy, table.estate-copy-markup, table.estate-excel, table.estate-page, table.estate-format, table.estate-resize, table[data-total]";
  var SEL_HAS = SEL + ", table.estate-table:has(th.estate-format, th.estate-pin, td.estate-sum, td[data-href], [data-peek]), .estate-table-box.estate-sticky:is([data-rows], [data-height]) table.estate-table";
  try {
    document.querySelector(SEL_HAS);
    SEL = SEL_HAS;
  } catch (e) {
  }
  function tablesIn(root) {
    var scope = root || document;
    var tables = Array.prototype.slice.call(scope.querySelectorAll(SEL));
    if (scope.matches && scope.matches(SEL)) tables.unshift(scope);
    return tables;
  }
  function each(tables, fn) {
    for (var i = 0; i < tables.length; i++) {
      try {
        fn(tables[i]);
      } catch (e) {
        if (window.console) console.error("estate-table:", e);
      }
    }
  }
  function init(root) {
    each(tablesIn(root), decorate);
  }
  function refreshAll(root) {
    each(tablesIn(root), function(t) {
      if (t.hasAttribute("data-estate-on")) refresh(t);
      else decorate(t);
    });
  }
  function scopeOf(e) {
    return e.target && e.target.querySelectorAll ? e.target : document;
  }
  window.EstateTable = { init, refresh: refreshAll, classify, columnType, tooltip: setTitle };
  if (!MANUAL) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function() {
      init();
    });
    else init();
  }
  document.addEventListener("estate:tables-added", function(e) {
    init(scopeOf(e));
  });
  document.addEventListener("estate:rows-changed", function(e) {
    refreshAll(scopeOf(e));
  });
  window.addEventListener("estate:writer", function() {
    refreshAll(document);
  });
})();
