const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || process.cwd());
const port = Number(process.argv[3] || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2'};
http.createServer((req, res) => {
  let requestUrl;
  try {
    requestUrl = new URL(req.url, 'http://localhost');
  } catch {
    res.writeHead(400, {'Content-Type':'text/plain'}).end('400 bad request');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    res.writeHead(400, {'Content-Type':'text/plain'}).end('400 bad request');
    return;
  }

  const relativePath = pathname.replace(/^[/\\]+/, '');
  const fileRoot = path.resolve(root);
  const fileRootPrefix = fileRoot.endsWith(path.sep) ? fileRoot : fileRoot + path.sep;
  let file = path.resolve(fileRoot, relativePath);

  if (file !== fileRoot && !file.startsWith(fileRootPrefix)) {
    res.writeHead(403, {'Content-Type':'text/plain'}).end('403 forbidden');
    return;
  }

  fs.stat(file, (statError, stats) => {
    if (statError) {
      res.writeHead(404, {'Content-Type':'text/plain'}).end('404 ' + pathname);
      return;
    }

    if (stats.isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, {Location: pathname + '/' + requestUrl.search});
        res.end();
        return;
      }
      file = path.join(file, 'index.html');
    }

    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404, {'Content-Type':'text/plain'}).end('404 ' + pathname); return; }
      res.writeHead(200, {'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-store'});
      res.end(data);
    });
  });
}).listen(port, () => console.log('serving ' + root + ' on http://localhost:' + port));
