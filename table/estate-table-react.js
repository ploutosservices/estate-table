/*! @ploutosservices/estate-table 1.4.0 | source 1e96ab0 | Apache-2.0 | icons: Heroicons (MIT) | see NOTICE */
"use client";
import * as React from "react";
import { flushSync } from "react-dom";
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
var h = React.createElement;
function isEl(x) {
  return React.isValidElement(x);
}
function isHost(x, tags) {
  return isEl(x) && typeof x.type === "string" && (!tags || tags.indexOf(x.type) !== -1);
}
function propsOf(x) {
  return isEl(x) && x.props || {};
}
function classesOf(x) {
  return String(propsOf(x).className || "").split(/\s+/).filter(Boolean);
}
function hasClass(x, c) {
  return classesOf(x).indexOf(c) !== -1;
}
function spanOf(cell) {
  return +propsOf(cell).colSpan || 1;
}
function refOf(x) {
  var p = propsOf(x);
  return Object.prototype.hasOwnProperty.call(p, "ref") ? p.ref : void 0;
}
function flat(children, prefix) {
  var out = [];
  React.Children.toArray(children).forEach(function(c) {
    if (isEl(c) && c.type === React.Fragment) {
      flat(c.props.children, (prefix || "") + c.key + "/").forEach(function(x) {
        out.push(x);
      });
      return;
    }
    out.push(prefix && isEl(c) ? React.cloneElement(c, { key: prefix + c.key }) : c);
  });
  return out;
}
function blank(x) {
  return x == null || typeof x === "boolean" || typeof x === "string" && x.trim() === "";
}
function compose(theirs, mine) {
  return function(node) {
    mine(node);
    if (typeof theirs === "function") theirs(node);
    else if (theirs && typeof theirs === "object") theirs.current = node;
  };
}
function both(theirs, mine) {
  return function(e) {
    if (typeof theirs === "function") theirs(e);
    mine(e);
  };
}
function parse(table) {
  var parts = flat(table.props.children), m = { parts, head: [], body: [], foot: [], thead: -1, tbody: -1, tfoot: -1, bad: null };
  parts.forEach(function(p, i) {
    if (isHost(p, ["thead"]) && m.thead < 0) m.thead = i;
    else if (isHost(p, ["tbody"]) && m.tbody < 0) m.tbody = i;
    else if (isHost(p, ["tfoot"]) && m.tfoot < 0) m.tfoot = i;
  });
  function rowsOf(idx, into) {
    if (idx < 0) return;
    flat(parts[idx].props.children).forEach(function(r) {
      if (blank(r)) return;
      if (!isHost(r, ["tr"])) {
        m.bad = m.bad || "a row drawn by a component";
        return;
      }
      var cells2 = [];
      flat(r.props.children).forEach(function(c) {
        if (blank(c)) return;
        if (!isHost(c, ["td", "th"])) {
          m.bad = m.bad || "a cell drawn by a component";
          return;
        }
        cells2.push(c);
      });
      into.push({ el: r, key: r.key, cells: cells2 });
    });
  }
  rowsOf(m.thead, m.head);
  rowsOf(m.tbody, m.body);
  rowsOf(m.tfoot, m.foot);
  return m;
}
function valSig(v, depth) {
  if (v === null || v === void 0 || typeof v !== "object") return typeof v === "function" ? "\u0192" : v;
  if (depth > 3) return "\u2026";
  if (isEl(v)) return ["e", v.type, v.key, propsSig(v.props || {}, depth + 1), childrenSig(v.props && v.props.children, depth + 1)];
  if (Array.isArray(v)) return ["a"].concat(v.map(function(x) {
    return valSig(x, depth + 1);
  }));
  if (Object.getPrototypeOf(v) === Object.prototype) return ["o"].concat(propsSig(v, depth + 1));
  return ["x", String(v)];
}
function propsSig(p, depth) {
  var out = [];
  Object.keys(p).sort().forEach(function(k) {
    if (k === "children" || k === "ref") return;
    out.push(k, valSig(p[k], depth || 0));
  });
  return out;
}
function childrenSig(children, depth) {
  var out = [];
  React.Children.toArray(children).forEach(function(c) {
    if (typeof c === "string" || typeof c === "number") out.push(["s", String(c)]);
    else if (isEl(c)) out.push(["e", c.type, c.key, propsSig(c.props || {}, depth + 1), depth < 1 ? childrenSig(c.props && c.props.children, depth + 1) : null]);
  });
  return out;
}
function rowSig(r) {
  return [r.key, r.el.type, propsSig(r.el.props, 0), r.cells.map(function(c) {
    return [c.key, c.type, propsSig(c.props, 0), childrenSig(c.props.children, 0)];
  })];
}
function same(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (!same(a[i], b[i])) return false;
    return true;
  }
  return Object.is(a, b);
}
function cellNodes(tr) {
  return kids(tr, ["TD", "TH"]);
}
function labelOf(th) {
  return tidy(th.textContent) || tidy(th.getAttribute("aria-label") || "");
}
function kindOfEl(th) {
  return hasClass(th, "estate-id") ? "id" : hasClass(th, "estate-as-text") ? "text" : null;
}
function groupRow(r) {
  return hasClass(r.el, "estate-row-section") || r.cells.length === 1 && spanOf(r.cells[0]) > 1;
}
function totalRow(r) {
  return hasClass(r.el, "estate-total");
}
function segments(rows) {
  var segs = [], cur = { head: null, rows: [], tail: [] };
  rows.forEach(function(r) {
    if (groupRow(r)) {
      if (cur.head || cur.rows.length || cur.tail.length) segs.push(cur);
      cur = { head: r, rows: [], tail: [] };
    } else if (totalRow(r)) cur.tail.push(r);
    else cur.rows.push(r);
  });
  if (cur.head || cur.rows.length || cur.tail.length) segs.push(cur);
  return segs;
}
var SORT_TIP = { none: "Sort \u2014 shift-click to add this column after the ones in force", asc: "Sorted ascending \u2014 click for descending", desc: "Sorted descending \u2014 click for the opening order" };
function headTip(own, d) {
  return (own ? own + " \u2014 " : "") + SORT_TIP[d];
}
function serialize(list) {
  return list.map(function(k) {
    return k.i + ":" + k.d;
  }).join(",");
}
function nextPlain(opening, list, idx) {
  var first = opening.length && opening[0].i === idx ? opening[0].d : null;
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
function nameOf(table, box, place) {
  var id = propsOf(table).id;
  if (id) return "#" + id;
  var cap = flat(table.props.children).filter(function(p) {
    return isHost(p, ["caption"]);
  })[0];
  var text = function(x) {
    return flat(propsOf(x).children).map(function(c) {
      return typeof c === "string" || typeof c === "number" ? String(c) : isHost(c) ? text(c) : "";
    }).join("");
  };
  if (cap && tidy(text(cap))) return '"' + tidy(text(cap)) + '"';
  if (box) {
    var band = flat(propsOf(box).children).filter(function(p) {
      return hasClass(p, "estate-table-title");
    })[0];
    if (band && tidy(text(band))) return 'the box "' + tidy(text(band)) + '"';
  }
  return "table " + (place + 1) + " of this Estate";
}
var OWNED = ["estate-sort", "estate-filter", "estate-filter-columns", "estate-drop-empty", "estate-copy", "estate-copy-markup", "estate-excel", "estate-page", "estate-format", "estate-resize"];
function owned(table) {
  return OWNED.some(function(c) {
    return hasClass(table, c);
  }) || propsOf(table)["data-total"] != null;
}
function peekDeep(n) {
  if (!React.isValidElement(n)) return Array.isArray(n) ? n.some(peekDeep) : false;
  return n.props["data-peek"] != null || React.Children.toArray(n.props.children).some(peekDeep);
}
function ownedByParts(m, box) {
  var any = function(rows, test) {
    return rows.some(function(r) {
      return r.cells.some(test);
    });
  };
  return any(m.head, function(c) {
    return hasClass(c, "estate-format") || hasClass(c, "estate-pin");
  }) || any(m.body.concat(m.foot), function(c) {
    return hasClass(c, "estate-sum") || propsOf(c)["data-href"] != null || hasClass(c, "estate-pin");
  }) || any(m.head.concat(m.body, m.foot), peekDeep) || !!box && hasClass(box, "estate-sticky") && (propsOf(box)["data-rows"] != null || propsOf(box)["data-height"] != null);
}
function readStore(key) {
  try {
    var v = localStorage.getItem(key), r = v ? JSON.parse(v) : null;
    return r && typeof r === "object" && !Array.isArray(r) ? r : {};
  } catch (e) {
    return {};
  }
}
function writeStore(key, rec) {
  try {
    localStorage.setItem(key, JSON.stringify(rec));
  } catch (e) {
  }
}
var COLS_PREF = "estate-table.filter-columns", colsMemory = null, colsListeners = /* @__PURE__ */ new Set();
function globalCols() {
  if (colsMemory !== null) return colsMemory;
  try {
    var v = localStorage.getItem(COLS_PREF);
    return v === null ? null : v !== "hidden";
  } catch (e) {
    return null;
  }
}
function setGlobalCols(show) {
  colsMemory = show;
  try {
    localStorage.setItem(COLS_PREF, show ? "shown" : "hidden");
  } catch (e) {
  }
  colsListeners.forEach(function(fn) {
    fn();
  });
}
var ownedTables = typeof WeakMap === "function" ? /* @__PURE__ */ new WeakMap() : null;
if (typeof document !== "undefined") {
  document.addEventListener("keydown", function(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || (e.key || "").toLowerCase() !== "f") return;
    var t = e.target;
    if (!t || !t.closest || t.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].indexOf(t.tagName) !== -1) return;
    var host = t.closest(".estate-table-box, table");
    var table = host && (host.tagName === "TABLE" ? host : host.querySelector("table"));
    var own = table && ownedTables && ownedTables.get(table);
    if (!own || !table.classList.contains("estate-filter-columns")) return;
    own.toggleColumns();
    e.preventDefault();
  });
}
var writerListeners = /* @__PURE__ */ new Set();
if (typeof window !== "undefined") window.addEventListener("estate:writer", function() {
  writerListeners.forEach(function(fn) {
    fn();
  });
});
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
  var r = td.getBoundingClientRect(), gap = 4, w = card.offsetWidth, ht = card.offsetHeight;
  var left = r.right + gap, top = r.top;
  if (left + w > window.innerWidth) {
    left = r.left - gap - w;
  }
  if (left < 0) {
    left = Math.max(0, r.left);
    top = r.bottom + gap;
  }
  if (top + ht > window.innerHeight) top = Math.max(0, window.innerHeight - ht);
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
if (typeof document !== "undefined") {
  document.addEventListener("scroll", hidePeek, true);
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") hidePeek();
  });
}
var COPY_TIP = "Copy the table \u2014 paste into a spreadsheet or an email";
var EXCEL_TIP = "Download the table as an Excel workbook";
var MARKUP_TIP = "Copy as HTML \u2014 paste into a page's source as tags";
function setTitle(node, text) {
  node.title = text;
}
function hasSum(r) {
  return r.cells.some(function(c) {
    return hasClass(c, "estate-sum");
  });
}
function swap(obj, key, val) {
  var out = Object.assign({}, obj);
  out[key] = val;
  return out;
}
export function Estate(props) {
  var choiceState = React.useState({}), choices = choiceState[0], setChoices = choiceState[1];
  var readState = React.useState({}), reads = readState[0], setReads = readState[1];
  var bump = React.useState(0)[1];
  var pressState = React.useState(null), pressing = pressState[0], setPressing = pressState[1];
  var fbState = React.useState({}), feedback = fbState[0], setFeedback = fbState[1];
  var pinState = React.useState({}), pinned = pinState[0], setPinned = pinState[1];
  var dragging = React.useRef(false);
  var nodes = React.useRef({});
  var tipNodes = React.useRef({});
  var shownOrder = React.useRef({});
  var tipped = React.useRef(typeof WeakMap === "function" ? /* @__PURE__ */ new WeakMap() : null);
  var warned = React.useRef({});
  var announced = React.useRef({});
  var idBase = "estate-filter-" + String(React.useId()).replace(/[^A-Za-z0-9]/g, "");
  React.useEffect(function() {
    var fn = function() {
      bump(function(n) {
        return n + 1;
      });
    };
    colsListeners.add(fn);
    writerListeners.add(fn);
    window.addEventListener("resize", fn);
    return function() {
      colsListeners.delete(fn);
      writerListeners.delete(fn);
      window.removeEventListener("resize", fn);
      Object.keys(nodes.current).forEach(function(k) {
        var w = nodes.current[k].pinWatch;
        if (w) w.disconnect();
      });
    };
  }, []);
  var pending = [], tips = [], bad = [], order = {}, tellFiltered = [], tableFns = [], pinWatch = [], peekTables = [];
  var place = 0;
  function nodesOf(ti) {
    return nodes.current[ti] || (nodes.current[ti] = { rows: /* @__PURE__ */ new Map(), foot: /* @__PURE__ */ new Map(), head: null, heads: [], table: null });
  }
  function tipRef(name, text) {
    tips.push([name, text]);
    return function(node) {
      if (node) tipNodes.current[name] = node;
    };
  }
  function choose(ti, fn) {
    setChoices(function(prev) {
      return swap(prev, ti, fn(prev[ti] || { list: [], words: "", cols: {} }));
    });
  }
  function own(table, ctx) {
    var ti = place++;
    var classed = owned(table);
    var m = parse(table);
    if (!classed && (m.bad || !ownedByParts(m, ctx.box))) return table;
    if (m.bad) {
      bad.push([ti, nameOf(table, ctx.box, ti), m.bad]);
      return table;
    }
    var sig = [m.head.map(rowSig), m.body.map(rowSig), m.foot.map(rowSig)];
    var read = reads[ti], fresh = !!read && same(read.sig, sig);
    if (!fresh) pending.push({ ti, sig, keys: m.body.map(function(r) {
      return r.key;
    }), footKeys: m.foot.map(function(r) {
      return r.key;
    }), table });
    var known = read || null;
    var nd = nodesOf(ti);
    var choice = choices[ti] || { list: [], words: "", cols: {} };
    var tp = propsOf(table);
    var boxOwn = ctx.box && ctx.ownTi === null;
    if (boxOwn) ctx.ownTi = ti;
    var headRow = m.head.length ? m.head[m.head.length - 1] : null, heads = headRow ? headRow.cells : [], ncols = heads.length;
    var dataRows = m.body.filter(function(r) {
      return !groupRow(r) && !totalRow(r);
    });
    var spanned = heads.some(function(th) {
      return spanOf(th) > 1;
    });
    var hadRows = !!(known && known.hadRows);
    var label = function(i) {
      return known && known.heads[i] ? known.heads[i].label : "";
    };
    var textAt = function(r, i) {
      var x = read && read.rows[r.key];
      return x ? tidy(x.t[i] || "") : "";
    };
    var sortOn = hasClass(table, "estate-sort") && ncols > 0 && hadRows;
    var opening = parseSortBy(tp["data-sort-by"], ncols);
    var list = choice.list, effective = list.length ? list : opening;
    var sortable = function(i) {
      return sortOn && !spanned && !hasClass(heads[i], "estate-no-sort") && !!label(i);
    };
    var ordered = m.body;
    if (fresh && sortOn && !spanned && effective.length) {
      var val = function(r, i) {
        var x = read.rows[r.key];
        return x ? x.v[i] : "";
      };
      var keys = effective.map(function(k) {
        var th = heads[k.i], kind = th ? kindOfEl(th) : null, all = [];
        dataRows.forEach(function(r) {
          all.push(classify(val(r, k.i), kind));
        });
        var abs = hasClass(table, "estate-sort-abs") || th && hasClass(th, "estate-sort-abs");
        return { i: k.i, kind, cmp: comparator(columnType(all), k.d, abs) };
      });
      var before = shownOrder.current[ti] || [], at = {}, authorAt = {};
      before.forEach(function(k, n) {
        at[k] = n;
      });
      m.body.forEach(function(r, n) {
        authorAt[r.key] = n;
      });
      var tie = function(r) {
        return at[r.key] !== void 0 ? at[r.key] : before.length + authorAt[r.key];
      };
      ordered = [];
      segments(m.body).forEach(function(s) {
        var pairs = s.rows.map(function(r) {
          return { r, v: keys.map(function(k) {
            return classify(val(r, k.i), k.kind);
          }) };
        });
        pairs.sort(function(x, y) {
          for (var k = 0; k < keys.length; k++) {
            var c2 = keys[k].cmp(x.v[k], y.v[k]);
            if (c2) return c2;
          }
          return tie(x.r) - tie(y.r);
        });
        if (s.head) ordered.push(s.head);
        pairs.forEach(function(p) {
          ordered.push(p.r);
        });
        s.tail.forEach(function(r) {
          ordered.push(r);
        });
      });
    }
    order[ti] = ordered.map(function(r) {
      return r.key;
    });
    var filterOn = hasClass(table, "estate-filter") && hadRows;
    var colsOn = hasClass(table, "estate-filter-columns") && ncols > 0 && hadRows && !spanned;
    var numeric = heads.map(function(th, c2) {
      if (kindOfEl(th) || hasClass(th, "estate-text-filter") || !fresh) return false;
      return columnType(dataRows.map(function(r) {
        return classify(textAt(r, c2));
      })) === "num";
    });
    var words = filterOn ? String(choice.words || "").toLowerCase().split(/\s+/).filter(Boolean) : [];
    var tests = heads.map(function(th, c2) {
      return colsOn && label(c2) ? columnTest(String(choice.cols[c2] || ""), numeric[c2]) : null;
    });
    var live = words.length > 0 || tests.some(Boolean);
    var pageOn = hasClass(table, "estate-page"), size = 0, at = 0, pages = 1, sizes = [];
    if (pageOn) {
      sizes = String(tp["data-page-sizes"] || "5 10 20 50 100").split(/\s+/).map(Number).filter(function(n) {
        return n > 0;
      });
      if (!sizes.length) sizes = [20];
      var stored = choice.loaded && choice.store && choice.store.size > 0 ? +choice.store.size : 0;
      size = choice.size || stored || +(tp["data-page-size"] || sizes[0]);
      if (!(size > 0)) size = sizes[0];
      if (sizes.indexOf(size) === -1) {
        sizes = sizes.concat([size]).sort(function(a, b) {
          return a - b;
        });
      }
    }
    var shown2 = {}, pass = [], total = 0, segs = [];
    if (fresh) {
      segs = segments(ordered);
      segs.forEach(function(s) {
        s.hits = [];
        s.rows.forEach(function(r) {
          var x = read.rows[r.key] || { t: [] };
          var text = x.t.join(" ").toLowerCase();
          var hit = words.every(function(w) {
            return text.indexOf(w) !== -1;
          }) && tests.every(function(t, i) {
            return !t || t(tidy(x.t[i] || ""));
          });
          total++;
          if (hit) {
            pass.push(r);
            s.hits.push(r);
          }
        });
      });
      if (pageOn) {
        pages = Math.max(1, Math.ceil(pass.length / size));
        at = choice.at || 0;
        if (at >= pages) at = 0;
      }
      var paging = pageOn && pressing !== ti;
      pass.forEach(function(r, i) {
        if (!paging || i >= at * size && i < (at + 1) * size) shown2[r.key] = true;
      });
      segs.forEach(function(s) {
        var any = s.hits.some(function(r) {
          return shown2[r.key];
        });
        if (s.head && any) shown2[s.head.key] = true;
        s.tail.forEach(function(r) {
          if ((!live || hasSum(r)) && (!paging || any)) shown2[r.key] = true;
        });
      });
    } else ordered.forEach(function(r) {
      shown2[r.key] = true;
    });
    var colsShown = function() {
      var dflt = tp["data-filter-row"] !== "hidden";
      if (!choice.loaded) return dflt;
      if (choice.store) return choice.store.cols ? choice.store.cols !== "hidden" : dflt;
      var g = globalCols();
      return g !== null ? g : dflt;
    }();
    function toggleColumns() {
      var show = !colsShown;
      if (tp["data-store"]) {
        choose(ti, function(c2) {
          var rec = Object.assign({}, c2.store, { cols: show ? "shown" : "hidden" });
          writeStore(tp["data-store"], rec);
          return Object.assign({}, c2, { store: rec });
        });
      } else setGlobalCols(show);
    }
    tableFns.push([ti, { toggleColumns }]);
    if (fresh) tellFiltered.push([
      ti,
      { shown: pass.length, total },
      JSON.stringify([pass.length, total, choice.words || "", choice.cols, list, read.n, at, size]),
      pageOn ? { page: at + 1, pages, size } : null
    ]);
    var drop = hasClass(table, "estate-drop-empty"), gone = [];
    if (drop && fresh && ncols && !spanned && dataRows.length && dataRows.every(function(r) {
      return r.cells.length === ncols && r.cells.every(function(c2) {
        return spanOf(c2) === 1;
      });
    })) {
      var judged = pass.length ? pass : dataRows;
      for (var c = 0; c < ncols; c++) {
        if (hasClass(heads[c], "estate-keep")) continue;
        if (!judged.some(function(r) {
          var x = read.rows[r.key];
          return x && x.f[c];
        })) gone.push(c);
      }
      if (gone.length >= ncols) gone = [];
    }
    var edits = {};
    if (fresh && ncols) {
      var startsOf = function(r) {
        var a0 = 0;
        return r.cells.map(function(c2) {
          var s0 = a0;
          a0 += spanOf(c2);
          return s0;
        });
      };
      var indexAt = function(r, col) {
        var st = startsOf(r);
        for (var i = 0; i < r.cells.length; i++) if (st[i] === col && spanOf(r.cells[i]) === 1) return i;
        return -1;
      };
      var readOf = function(r, kind) {
        return kind === "f" ? read.foot && read.foot[r.key] : read.rows[r.key];
      };
      var textIn = function(r, kind, i) {
        var x = readOf(r, kind);
        return i >= 0 && x ? x.t[i] || "" : "";
      };
      var isSumCell = function(r, i) {
        return totalRow(r) && hasClass(r.cells[i], "estate-sum");
      };
      var edit = function(kind, r, i, e) {
        var k = kind + ":" + r.key;
        (edits[k] = edits[k] || {})[i] = e;
      };
      var bodyAndFoot = m.body.map(function(r) {
        return ["b", r];
      }).concat(m.foot.map(function(r) {
        return ["f", r];
      }));
      var fmtAll = hasClass(table, "estate-format"), fmtCols = [];
      heads.forEach(function(th, c2) {
        if (kindOfEl(th)) return;
        if (hasClass(th, "estate-format")) {
          fmtCols.push(c2);
          return;
        }
        if (!fmtAll) return;
        var values = dataRows.map(function(r) {
          return classify(textIn(r, "b", indexAt(r, c2)));
        });
        if (columnType(values) === "num") fmtCols.push(c2);
      });
      var decimalsFor = function(c2) {
        var d = propsOf(heads[c2])["data-decimals"];
        if (d == null) d = tp["data-decimals"];
        if (d != null && /^\d+$/.test(String(d))) return +d;
        var most = 0;
        bodyAndFoot.forEach(function(x) {
          var i = indexAt(x[1], c2);
          if (i >= 0 && !isSumCell(x[1], i)) most = Math.max(most, decimalsOf(textIn(x[1], x[0], i)));
        });
        return most;
      };
      fmtCols.forEach(function(c2) {
        var decimals = decimalsFor(c2);
        bodyAndFoot.forEach(function(x) {
          var r = x[1], i = indexAt(r, c2);
          if (groupRow(r) || i < 0 || isSumCell(r, i)) return;
          var rd = readOf(r, x[0]);
          if (!rd || rd.ctl[i] || propsOf(r.cells[i])["data-raw"] != null) return;
          var raw = tidy(rd.t[i] || ""), formatted = formatNumber(raw, decimals);
          if (formatted !== null) edit(x[0], r, i, { raw, text: formatted });
        });
      });
      bodyAndFoot.forEach(function(x) {
        var r = x[1];
        if (!totalRow(r)) return;
        r.cells.forEach(function(cell, i) {
          if (!hasClass(cell, "estate-sum")) return;
          var col = startsOf(r)[i], values = [], most = 0;
          pass.forEach(function(row) {
            var j = indexAt(row, col);
            if (j < 0) return;
            var t = tidy(textIn(row, "b", j)), n = t === "" || asPhone(t) !== null || asDate(t) !== null || /^0\d/.test(t) ? null : asNumber(t);
            if (n === null) return;
            values.push(n);
            most = Math.max(most, decimalsOf(t));
          });
          var decimals = fmtCols.indexOf(col) !== -1 ? decimalsFor(col) : most, scale = Math.pow(10, decimals);
          var sum = values.reduce(function(acc, n) {
            return acc + Math.round(n * scale);
          }, 0) / scale;
          edit(x[0], r, i, { raw: (sum < 0 ? "-" : "") + fixedHalfUp(Math.abs(sum), decimals), text: (sum < 0 ? "-" : "") + groupNumber(Math.abs(sum), decimals) });
        });
      });
    }
    var textChildren = function(ch) {
      var k = React.Children.toArray(ch);
      return k.every(function(x) {
        return typeof x === "string" || typeof x === "number";
      });
    };
    function cellsOut(r, kind) {
      var ed = edits[(kind || "b") + ":" + r.key];
      var focusable = kind !== "h" && r.cells.some(function(c2) {
        var q = propsOf(c2);
        return (q["data-href"] != null || q["data-peek"] != null) && q.tabIndex == null;
      });
      var pinsHere = pins.length > 1 && r.cells.some(function(c2) {
        return hasClass(c2, "estate-pin");
      });
      if (!drop && !ed && !focusable && !pinsHere) return null;
      var starts0 = function() {
        var a0 = 0;
        return r.cells.map(function(c2) {
          var s0 = a0;
          a0 += spanOf(c2);
          return s0;
        });
      }();
      var straight = r.cells.length === ncols && r.cells.every(function(x) {
        return spanOf(x) === 1;
      });
      var width = r.cells.reduce(function(n, x) {
        return n + spanOf(x);
      }, 0), atCol = 0;
      return r.cells.map(function(cell, ci) {
        var span = spanOf(cell), add = {};
        if (drop) {
          add["data-estate-span"] = String(span);
          if (gone.length && straight) {
            if (gone.indexOf(atCol) !== -1) add.hidden = true;
          } else if (gone.length && width === ncols) {
            var lost = 0;
            for (var k = atCol; k < atCol + span; k++) if (gone.indexOf(k) !== -1) lost++;
            if (lost === span) add.hidden = true;
            else if (lost) add.colSpan = span - lost;
          }
        }
        atCol += span;
        var q = propsOf(cell);
        if (kind !== "h" && (q["data-href"] != null || q["data-peek"] != null) && q.tabIndex == null) add.tabIndex = 0;
        if (pinsHere && hasClass(cell, "estate-pin") && span === 1 && pinLeft(starts0[ci])) add.style = Object.assign({}, q.style, { left: pinLeft(starts0[ci]) });
        var e = ed && ed[ci];
        if (e) {
          add["data-raw"] = e.raw;
          if (textChildren(propsOf(cell).children)) return React.cloneElement(cell, add, e.text);
        }
        return React.cloneElement(cell, add);
      });
    }
    function rowOut(r, extra, kind) {
      var cs = cellsOut(r, kind);
      return cs ? React.cloneElement(r.el, extra || null, cs) : extra ? React.cloneElement(r.el, extra) : r.el;
    }
    var resizeOn = hasClass(table, "estate-resize") && ncols > 0;
    var widths = Object.assign({}, choice.loaded && choice.store && choice.store.widths, choice.widths);
    function startDrag(e, i) {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      dragging.current = true;
      var th = nd.heads[i], startX = e.clientX, startW = th.getBoundingClientRect().width, min = parseFloat(getComputedStyle(th).fontSize) * 2 || 16, last = startW;
      var move = function(ev) {
        last = Math.max(min, startW + ev.clientX - startX);
        choose(ti, function(x) {
          return Object.assign({}, x, { widths: swap(x.widths || {}, i, last) });
        });
      };
      var up = function() {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        var key = tp["data-store"];
        if (key) choose(ti, function(x) {
          var rec = Object.assign({}, x.store), w = Object.assign({}, rec.widths);
          w[i] = Math.round(last);
          rec.widths = w;
          writeStore(key, rec);
          return Object.assign({}, x, { store: rec });
        });
        setTimeout(function() {
          dragging.current = false;
        }, 0);
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    }
    var pins = [];
    heads.forEach(function(th, i) {
      if (hasClass(th, "estate-pin")) pins.push(i);
    });
    var placed = pinned[ti] || {};
    function pinLeft(col) {
      return pins.length > 1 && pins.indexOf(col) > 0 && placed[col] != null ? placed[col] + "px" : null;
    }
    if (pins.length > 1) pinWatch.push([ti, pins]);
    var headOut = m.head.map(function(r) {
      if (r !== headRow) return rowOut(r, null, "h");
      var cs = cellsOut(r, "h") || r.cells;
      var hcells = cs.map(function(cell, i) {
        var p = propsOf(cell), filtering = !!tests[i];
        var cls = function(extra) {
          var x = (p.className ? p.className + " " : "") + extra.filter(Boolean).join(" ");
          return x.trim();
        };
        var headRef = function(node) {
          if (node) nd.heads[i] = node;
        };
        var style = p.style, width = resizeOn && widths[i] > 0 ? widths[i] + "px" : null, left = pinLeft(i);
        if (width || left) style = Object.assign({}, p.style, width ? { width } : null, left ? { left } : null);
        var handle = resizeOn && label(i) ? h("span", {
          key: "estate-table-resize-handle",
          className: "estate-table-resize-handle",
          "aria-hidden": "true",
          onPointerDown: function(e) {
            startDrag(e, i);
          },
          onClick: function(e) {
            e.stopPropagation();
          },
          ref: tipRef("resize:" + ti + ":" + i, "Drag to make the column wider or narrower")
        }) : null;
        if (!sortable(i)) {
          if (!filtering && !style && !handle) return React.cloneElement(cell, { ref: compose(refOf(cell), headRef) });
          return React.cloneElement(cell, { className: filtering ? cls(["estate-filtered"]) : p.className, style, ref: compose(refOf(cell), headRef) }, p.children, handle);
        }
        var on = null;
        effective.forEach(function(k) {
          if (k.i === i) on = k.d;
        });
        var authorTitle = propsOf(heads[i]).title || "";
        var go = function(shift) {
          choose(ti, function(c2) {
            var cur = c2.list;
            return Object.assign({}, c2, { sorted: true, list: shift ? nextShift(cur.length ? cur : opening, i) : nextPlain(opening, cur, i) });
          });
        };
        return React.cloneElement(cell, {
          className: cls(["estate-sortable", filtering && "estate-filtered"]),
          tabIndex: 0,
          title: void 0,
          "aria-sort": on ? on === "asc" ? "ascending" : "descending" : "none",
          "data-estate-dir": on || "none",
          "data-estate-title": authorTitle,
          style,
          // A drag's release lands a click on the header (the pointer left the handle); a drag never sorts.
          onClick: both(p.onClick, function(e) {
            if (e.target.closest && e.target.closest(".estate-table-resize-handle") || dragging.current) return;
            go(e.shiftKey);
          }),
          onKeyDown: both(p.onKeyDown, function(e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              go(e.shiftKey);
            }
          }),
          ref: compose(compose(refOf(cell), headRef), tipRef("th:" + ti + ":" + i, headTip(authorTitle, on || "none")))
        }, p.children, h("span", { key: "estate-sort-mark", className: "estate-sort-mark", "aria-hidden": "true" }), handle);
      });
      return React.cloneElement(r.el, { ref: compose(refOf(r.el), function(node) {
        nd.head = node;
      }) }, hcells);
    });
    if (colsOn) {
      headOut.push(h("tr", { key: "estate-table-filter-row", className: "estate-table-filter-row", hidden: !colsShown }, heads.map(function(th, c2) {
        var name = label(c2), pinned2 = hasClass(th, "estate-pin");
        var pinStyle = pinned2 && pinLeft(c2) ? { left: pinLeft(c2) } : void 0;
        if (!name) return h("td", { key: c2, className: pinned2 ? "estate-pin" : void 0, style: pinStyle });
        var vals = [], listId = idBase + "-" + ti + "-" + c2;
        if (!numeric[c2] && fresh) {
          vals = dataRows.map(function(r) {
            return textAt(r, c2);
          }).filter(Boolean).filter(function(v, k, a) {
            return a.indexOf(v) === k;
          }).sort();
        }
        var offered = vals.length > 1 && vals.length <= 100;
        return h(
          "td",
          { key: c2, className: pinned2 ? "estate-pin" : void 0, style: pinStyle },
          numeric[c2] ? null : h("datalist", { id: listId }, offered ? vals.map(function(v) {
            return h("option", { key: v, value: v });
          }) : null),
          h("input", {
            type: "text",
            size: 1,
            className: "estate-filter-col-box",
            placeholder: name,
            "aria-label": "Filter by " + name,
            list: offered ? listId : void 0,
            value: String(choice.cols[c2] || ""),
            onChange: function(e) {
              var v = e.target.value;
              choose(ti, function(x) {
                return Object.assign({}, x, { cols: swap(x.cols, c2, v), at: 0 });
              });
            },
            ref: tipRef("col:" + ti + ":" + c2, numeric[c2] ? "Filter \u2014 text, or >100, <=50, =50, 100..500" : "Filter \u2014 any part of the value")
          })
        );
      })));
    }
    var authorIndex = {};
    m.body.forEach(function(r, n) {
      authorIndex[r.key] = n;
    });
    var keepAll = !!(known && known.controls);
    var bodyOut = ordered.filter(function(r) {
      return keepAll || shown2[r.key];
    }).map(function(r) {
      var extra = {
        "data-estate-row": String(authorIndex[r.key]),
        ref: compose(refOf(r.el), function(node) {
          if (node) nd.rows.set(r.key, node);
        })
      };
      if (keepAll) extra.hidden = !shown2[r.key];
      return rowOut(r, extra);
    });
    var footRef = function(r) {
      return compose(refOf(r.el), function(node) {
        if (node) nd.foot.set(r.key, node);
      });
    };
    var keepFoot = hasClass(table, "estate-keep-foot");
    var footOut = m.foot.map(function(r) {
      return rowOut(r, live && !keepFoot && !hasSum(r) ? { hidden: true, ref: footRef(r) } : { ref: footRef(r) }, "f");
    });
    var fb = feedback[ti] || {};
    var mark = function(what, state, tipText) {
      setFeedback(function(prev) {
        return swap(prev, ti, Object.assign({}, prev[ti], swap({}, what, state)));
      });
      if (state === "ok" || state === "fail") setTimeout(function() {
        setFeedback(function(prev) {
          return swap(prev, ti, Object.assign({}, prev[ti], swap({}, what, null)));
        });
      }, 1200);
    };
    function press(build) {
      flushSync(function() {
        setPressing(ti);
      });
      try {
        var node = nd.table, rows = tp["data-source"] ? null : kids(node.tBodies[0], ["TR"]).filter(function(tr) {
          return !tr.hidden && !isGroupRow(tr) && !isTotalRow(tr);
        });
        return build(node, rows);
      } finally {
        flushSync(function() {
          setPressing(null);
        });
      }
    }
    var buttons = [];
    if (hasClass(table, "estate-copy") && hadRows && fresh) {
      var copyTip = fb.copy === "ok" ? "Copied" : fb.copy === "fail" ? "Copy failed \u2014 the browser refused the clipboard" : COPY_TIP;
      buttons.push(h("button", {
        key: "estate-table-copy-" + ti,
        type: "button",
        "aria-label": COPY_TIP,
        className: "estate-table-copy" + (fb.copy === "ok" ? " estate-copied" : fb.copy === "fail" ? " estate-copy-failed" : ""),
        onClick: function() {
          var got;
          try {
            got = press(function(node, rows) {
              return { html: styledHtml(bare(node, rows)), text: tsv(bare(node, rows)) };
            });
          } catch (e) {
            mark("copy", "fail");
            return;
          }
          toClipboard(got.html, got.text).then(function() {
            mark("copy", "ok");
          }, function() {
            mark("copy", "fail");
          });
        },
        ref: tipRef("copy:" + ti, copyTip)
      }));
    }
    if (hasClass(table, "estate-copy-markup") && hadRows && fresh) {
      var markupTip = fb.markup === "ok" ? "Copied" : fb.markup === "fail" ? "Copy failed \u2014 the browser refused the clipboard" : MARKUP_TIP;
      buttons.push(h("button", {
        key: "estate-table-markup-" + ti,
        type: "button",
        "aria-label": MARKUP_TIP,
        className: "estate-table-markup" + (fb.markup === "ok" ? " estate-copied" : fb.markup === "fail" ? " estate-copy-failed" : ""),
        onClick: function() {
          var text;
          try {
            text = press(function(node, rows) {
              return markupOf(bare(node, rows));
            });
          } catch (e) {
            mark("markup", "fail");
            return;
          }
          textToClipboard(text).then(function() {
            mark("markup", "ok");
          }, function() {
            mark("markup", "fail");
          });
        },
        ref: tipRef("markup:" + ti, markupTip)
      }));
    }
    if (hasClass(table, "estate-excel") && hadRows && fresh) {
      var href = tp["data-excel-href"];
      if (href) {
        var title = tp["data-excel-title"] || "Download the workbook";
        buttons.push(h("a", { key: "estate-table-excel-" + ti, className: "estate-table-excel", href, "aria-label": title, ref: tipRef("excel:" + ti, title) }));
      } else if (writerOf()) {
        var exTip = fb.excel === "ok" ? "Written" : fb.excel === "fail" ? "The workbook could not be written" : EXCEL_TIP;
        buttons.push(h("button", {
          key: "estate-table-excel-" + ti,
          type: "button",
          "aria-label": EXCEL_TIP,
          className: "estate-table-excel" + (fb.busy ? " estate-busy" : "") + (fb.excel === "ok" ? " estate-copied" : fb.excel === "fail" ? " estate-copy-failed" : ""),
          onClick: function() {
            mark("busy", true);
            var done;
            try {
              done = press(function(node, rows) {
                return writeWorkbook(node, null, rows);
              });
            } catch (e) {
              done = Promise.reject(e);
            }
            done.then(function() {
              mark("excel", "ok");
            }, function() {
              mark("excel", "fail");
            }).then(function() {
              mark("busy", false);
            });
          },
          ref: tipRef("excel:" + ti, exTip)
        }));
      }
    }
    var capIndex = -1;
    m.parts.forEach(function(p, i) {
      if (capIndex < 0 && isHost(p, ["caption"])) capIndex = i;
    });
    var where = !buttons.length ? null : boxOwn && ctx.hasBand ? "band" : capIndex >= 0 ? "caption" : "bar";
    if (where === "band") ctx.buttons = buttons;
    var parts = m.parts.map(function(p, i) {
      if (i === capIndex && where === "caption") return React.cloneElement(p, null, propsOf(p).children, buttons);
      if (i === m.thead) return React.cloneElement(p, null, headOut);
      if (i === m.tbody) return React.cloneElement(p, null, bodyOut);
      if (i === m.tfoot) return React.cloneElement(p, null, footOut);
      return p;
    });
    var tableProps = { "data-estate-on": "react", ref: compose(refOf(table), function(node) {
      nd.table = node;
    }) };
    var anyCell = function(name) {
      return m.body.some(function(r) {
        return r.cells.some(function(c2) {
          return propsOf(c2)[name] != null;
        });
      });
    };
    if (anyCell("data-href")) {
      var hrefCell = function(e) {
        var td = e.target.closest && e.target.closest("td[data-href]");
        if (!td || td.closest("table") !== nd.table) return null;
        if (e.target.closest("a, button, input, select, textarea, label")) return null;
        return td;
      };
      var openHref = function(td, newTab) {
        var href2 = td.getAttribute("data-href");
        if (newTab) window.open(href2, "_blank");
        else window.location.assign(href2);
      };
      tableProps.onClick = both(tp.onClick, function(e) {
        var td = hrefCell(e);
        if (td) {
          e.preventDefault();
          openHref(td, e.ctrlKey || e.metaKey);
        }
      });
      tableProps.onAuxClick = both(tp.onAuxClick, function(e) {
        var td = hrefCell(e);
        if (td && e.button === 1) {
          e.preventDefault();
          openHref(td, true);
        }
      });
      tableProps.onKeyDown = both(tp.onKeyDown, function(e) {
        if (e.key !== "Enter") return;
        var td = e.target.closest && e.target.closest("td[data-href]");
        if (td && td === e.target && td.closest("table") === nd.table) {
          e.preventDefault();
          openHref(td, false);
        }
      });
    }
    if (peekDeep(table)) {
      var peekCell = function(e) {
        var el = e.target.closest && e.target.closest("[data-peek]");
        return el && el.closest("table") === nd.table ? el : null;
      };
      tableProps.onPointerOver = both(tp.onPointerOver, function(e) {
        var td = peekCell(e);
        if (td && td !== peekShown) showPeek(td);
      });
      tableProps.onPointerOut = both(tp.onPointerOut, function(e) {
        var td = peekCell(e);
        if (td && !(e.relatedTarget && td.contains(e.relatedTarget))) hidePeek();
      });
      tableProps.onFocus = both(tp.onFocus, function(e) {
        var td = peekCell(e);
        if (td) showPeek(td);
      });
      tableProps.onBlur = both(tp.onBlur, function(e) {
        if (peekCell(e)) hidePeek();
      });
    }
    if (boxOwn) ctx.ownOwned = true;
    if (sortOn && (opening.length || choice.sorted)) tableProps["data-estate-sort"] = serialize(list);
    if (pageOn && fresh) tableProps["data-estate-page"] = at + 1 + "/" + pages;
    var out = React.cloneElement(table, tableProps, parts);
    var loaded = tp["data-total"];
    if (pageOn) {
      var ofLoadedP = loaded != null ? total + " loaded of " + loaded : "";
      var a1 = pass.length ? at * size + 1 : 0, b1 = Math.min(pass.length, (at + 1) * size);
      var pcount = !fresh ? "" : pass.length ? a1 + "\u2013" + b1 + " of " + (loaded != null ? ofLoadedP : pass.length) + " \xB7 page " + (at + 1) + " of " + pages : "0 rows";
      var turn = function(n) {
        choose(ti, function(x) {
          return Object.assign({}, x, { at: n });
        });
      };
      var pager = h(
        "span",
        { key: "estate-table-pager-" + ti, className: "estate-table-pager" },
        h("select", {
          key: "size",
          className: "estate-table-page-size",
          "aria-label": "Rows per page",
          value: String(size),
          onChange: function(e) {
            var n = +e.target.value, key = tp["data-store"];
            choose(ti, function(x) {
              var next = Object.assign({}, x, { size: n, at: 0 });
              if (key) {
                next.store = Object.assign({}, x.store, { size: n });
                writeStore(key, next.store);
              }
              return next;
            });
          },
          ref: tipRef("size:" + ti, "Rows per page")
        }, sizes.map(function(n) {
          return h("option", { key: n, value: String(n) }, String(n));
        })),
        h("button", {
          key: "prev",
          type: "button",
          className: "estate-table-page-prev",
          "aria-label": "Previous page",
          disabled: at === 0,
          onClick: function() {
            if (at > 0) turn(at - 1);
          },
          ref: tipRef("prev:" + ti, "Previous page")
        }),
        h("span", { key: "count", className: "estate-table-page-count" }, pcount),
        h("button", {
          key: "next",
          type: "button",
          className: "estate-table-page-next",
          "aria-label": "Next page",
          disabled: at >= pages - 1,
          onClick: function() {
            turn(at + 1);
          },
          ref: tipRef("next:" + ti, "Next page")
        })
      );
      if (boxOwn) ctx.pager = pager;
      else ctx.notePager = pager;
    }
    var barOn = filterOn || colsOn || loaded != null || where === "bar";
    if (!barOn) return out;
    var ofLoaded = loaded != null ? total + " loaded of " + loaded : "";
    var count = fresh ? live ? pass.length + " of " + total + " shown" + (loaded != null ? " \xB7 " + ofLoaded : "") : ofLoaded : "";
    var bar = h(
      "div",
      { key: "estate-table-filter-" + ti, className: "estate-table-filter" },
      filterOn ? h("input", {
        key: "box",
        type: "search",
        className: "estate-table-filter-box",
        placeholder: "Filter\u2026",
        "aria-label": "Filter the rows of this table",
        value: String(choice.words || ""),
        onChange: function(e) {
          var v = e.target.value;
          choose(ti, function(x) {
            return Object.assign({}, x, { words: v, at: 0 });
          });
        },
        ref: tipRef("bar:" + ti, "Every word typed must appear somewhere in the row")
      }) : null,
      colsOn ? h("button", {
        key: "toggle",
        type: "button",
        className: "estate-table-cols-toggle",
        "aria-label": "Show or hide the filter box under each column (f while in the table)",
        onClick: toggleColumns,
        ref: tipRef("tog:" + ti, "Show or hide the filter box under each column (f while in the table)")
      }) : null,
      filterOn || colsOn || loaded != null ? h("span", { key: "count", className: "estate-table-filter-count" }, count) : null,
      where === "bar" ? buttons : null
    );
    if (boxOwn && ctx.inScroll) {
      ctx.bar = bar;
      return out;
    }
    return [bar, out];
  }
  function walkList(list, ctx, isBox) {
    var out = [], changed = false, kids2 = flat(list);
    for (var i = 0; i < kids2.length; i++) {
      var c = kids2[i];
      if (isBox) ctx.inScroll = hasClass(c, "estate-table-scroll");
      var w = walk(c, ctx);
      if (isBox && ctx.bar) {
        out.push(ctx.bar);
        ctx.bar = null;
        changed = true;
      }
      if (Array.isArray(w)) {
        w.forEach(function(x) {
          out.push(x);
        });
        changed = true;
      } else {
        if (w !== c) changed = true;
        out.push(w);
      }
      if (ctx.notePager) {
        var p = ctx.notePager, nx = kids2[i + 1];
        ctx.notePager = null;
        changed = true;
        if (nx && hasClass(nx, "estate-table-note")) {
          out.push(React.cloneElement(nx, null, propsOf(nx).children, p));
          i++;
        } else out.push(h("div", { key: "estate-table-note-" + p.key, className: "estate-table-note" }, p));
      }
    }
    if (isBox && ctx.buttons) {
      var bs = ctx.buttons, bi = -1;
      ctx.buttons = null;
      changed = true;
      out.forEach(function(x, k) {
        if (bi < 0 && hasClass(x, "estate-table-title")) bi = k;
      });
      var band = out[bi], bk = flat(propsOf(band).children), ai = -1;
      bk.forEach(function(x, k) {
        if (ai < 0 && hasClass(x, "estate-table-actions")) ai = k;
      });
      if (ai >= 0) {
        var ak = flat(propsOf(bk[ai]).children), lead = ak.length && hasClass(ak[0], "estate-new") ? 1 : 0;
        bk[ai] = React.cloneElement(bk[ai], null, ak.slice(0, lead).concat(bs, ak.slice(lead)));
      } else bk.push(h("div", { key: "estate-table-actions", className: "estate-table-actions" }, bs));
      out[bi] = React.cloneElement(band, null, bk);
    }
    if (isBox && ctx.pager) {
      var pg = ctx.pager, f = -1;
      ctx.pager = null;
      changed = true;
      out.forEach(function(x, k) {
        if (hasClass(x, "estate-table-footer")) f = k;
      });
      if (f >= 0) out[f] = React.cloneElement(out[f], null, propsOf(out[f]).children, pg);
      else out.push(h("div", { key: "estate-table-footer-" + pg.key, className: "estate-table-footer" }, pg));
    }
    return { out, changed };
  }
  function walk(node, ctx) {
    if (!isHost(node)) return node;
    if (node.type === "table") return own(node, ctx);
    var kidsIn = node.props.children;
    if (kidsIn == null || typeof kidsIn === "string" || typeof kidsIn === "number") return node;
    var isBox = hasClass(node, "estate-table-box") && !ctx.box;
    var hasBand = isBox && flat(kidsIn).some(function(c) {
      return hasClass(c, "estate-table-title");
    });
    var my = isBox ? { box: node, ownTi: null, inScroll: false, bar: null, pager: null, notePager: null, buttons: null, hasBand, ownOwned: false } : ctx;
    var r = walkList(kidsIn, my, isBox);
    var bp = propsOf(node), sticky = null;
    if (isBox && my.ownOwned && hasClass(node, "estate-sticky")) {
      if (bp["data-height"]) sticky = String(bp["data-height"]);
      else if (bp["data-rows"] != null && /^\d+$/.test(String(bp["data-rows"]))) sticky = "calc((" + bp["data-rows"] + " + 1) * var(--estate-table-row-h))";
    }
    if (sticky) return React.cloneElement(node, { style: Object.assign({}, bp.style, { "--estate-table-sticky-h": sticky }) }, r.out);
    return r.changed ? React.cloneElement(node, null, r.out) : node;
  }
  var tree = walkList(props.children, { box: null, ownTi: null, inScroll: false, bar: null, pager: null, notePager: null }, false).out;
  React.useLayoutEffect(function() {
    if (!pending.length) return;
    var next = {}, loads = {};
    pending.forEach(function(p) {
      var nd = nodesOf(p.ti), rows = {};
      p.keys.forEach(function(k) {
        var tr = nd.rows.get(k), cs = tr ? cellNodes(tr) : [];
        rows[k] = {
          v: cs.map(function(td) {
            var o = td.getAttribute("data-sort");
            return o !== null ? o : textOf(td);
          }),
          t: cs.map(textOf),
          f: cs.map(filled),
          ctl: cs.map(function(td) {
            return td.querySelector(CONTROLS_SEL) !== null;
          })
        };
      });
      var heads = nd.head ? cellNodes(nd.head).filter(function(th) {
        return !th.closest(".estate-table-filter-row");
      }).map(function(th) {
        return { label: labelOf(th) };
      }) : [];
      var prev = reads[p.ti];
      var controls = p.keys.some(function(k) {
        var tr = nd.rows.get(k);
        return !!tr && tr.querySelector(CONTROLS_SEL) !== null;
      });
      var foot = {};
      (p.footKeys || []).forEach(function(k) {
        var tr = nd.foot.get(k), cs = tr ? cellNodes(tr) : [];
        foot[k] = { t: cs.map(textOf), ctl: cs.map(function(td) {
          return td.querySelector(CONTROLS_SEL) !== null;
        }) };
      });
      next[p.ti] = { sig: p.sig, rows, foot, heads, hadRows: !!(prev && prev.hadRows) || p.keys.length > 0, n: (prev ? prev.n : 0) + 1, controls };
      var c = choices[p.ti];
      if (!c || !c.loaded) {
        var key = propsOf(p.table)["data-store"];
        loads[p.ti] = { store: key ? readStore(key) : null };
      }
    });
    setReads(function(prev) {
      return Object.assign({}, prev, next);
    });
    if (Object.keys(loads).length) {
      setChoices(function(prev) {
        var out = Object.assign({}, prev);
        Object.keys(loads).forEach(function(ti) {
          out[ti] = Object.assign({ list: [], words: "", cols: {} }, prev[ti], { loaded: true, store: loads[ti].store });
        });
        return out;
      });
    }
  });
  React.useLayoutEffect(function() {
    Object.keys(order).forEach(function(ti) {
      shownOrder.current[ti] = order[ti];
    });
    tips.forEach(function(t) {
      var node = tipNodes.current[t[0]];
      if (!node) return;
      if (tipped.current && tipped.current.get(node) === t[1]) return;
      (Estate.tooltip || setTitle)(node, t[1]);
      if (tipped.current) tipped.current.set(node, t[1]);
    });
    tableFns.forEach(function(f) {
      var node = nodesOf(f[0]).table;
      if (node && ownedTables) ownedTables.set(node, f[1]);
    });
    var moved = {}, anyMoved = false;
    pinWatch.forEach(function(w) {
      var nd = nodesOf(w[0]), left = 0, out = {};
      w[1].forEach(function(col, k) {
        if (k > 0) out[col] = Math.round(left * 10) / 10;
        var th = nd.heads[col];
        left += th ? th.getBoundingClientRect().width : 0;
      });
      var was = pinned[w[0]] || {};
      if (Object.keys(out).some(function(c) {
        return was[c] !== out[c];
      })) {
        moved[w[0]] = out;
        anyMoved = true;
      }
      if (nd.table && typeof ResizeObserver === "function" && !nd.pinWatch) {
        nd.pinWatch = new ResizeObserver(function() {
          bump(function(n) {
            return n + 1;
          });
        });
        nd.pinWatch.observe(nd.table);
      }
    });
    if (anyMoved) setPinned(function(prev) {
      return Object.assign({}, prev, moved);
    });
    tellFiltered.forEach(function(f) {
      var node = nodesOf(f[0]).table;
      if (!node || announced.current[f[0]] === f[2]) return;
      announced.current[f[0]] = f[2];
      node.dispatchEvent(new CustomEvent("estate:filtered", { bubbles: true, detail: f[1] }));
      if (f[3]) node.dispatchEvent(new CustomEvent("estate:paged", { bubbles: true, detail: f[3] }));
    });
    bad.forEach(function(b) {
      var key = b[0] + ":" + b[1];
      if (warned.current[key]) return;
      warned.current[key] = true;
      if (typeof console !== "undefined") console.warn("estate-table-react: " + b[1] + " is rendered as given, undecorated \u2014 " + b[2] + " (write its rows and cells as elements, or keep the plain script for it)");
    });
  });
  return h(React.Fragment, null, tree);
}
Estate.tooltip = setTitle;
