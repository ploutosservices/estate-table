/*! @ploutosservices/estate-table 1.4.0 | source 1e96ab0 | Apache-2.0 | icons: Heroicons (MIT) | see NOTICE */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const port = +(process.argv[2] || 8080);
const root = path.resolve(process.argv[3] || path.join(__dirname, ".."));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
};
const peek = {
  "/peek/alpha": ["text/html; charset=utf-8", "<b>Alpha</b> \u2014 the first row's record"],
  "/peek/beta": ["text/plain; charset=utf-8", "Beta: a plain answer"]
};
http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/peek/")) {
    const answer = peek[url.pathname];
    if (!answer) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("not here");
    }
    res.writeHead(200, { "Content-Type": answer[0] });
    return res.end(answer[1]);
  }
  const file = path.join(root, path.normalize(decodeURIComponent(url.pathname)));
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("not here");
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
}).listen(port, "127.0.0.1", () => {
  console.log("serving " + root + " at http://localhost:" + port + "/");
});
