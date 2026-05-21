const http = require('http');
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const safePath = path.normalize(urlPath === '/' ? '/index.html' : urlPath).replace(/^([\\/])+/, '');
  const file = path.join(root, safePath);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err,data)=>{
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream'});
    res.end(data);
  });
}).listen(8080, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:8080/');
});