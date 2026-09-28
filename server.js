const http=require('http'),fs=require('fs'),path=require('path');
const port=process.env.PORT||3000;
const publicDir=path.join(__dirname,'public');
const securityHeaders={
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy':'same-origin',
  'Content-Security-Policy':"default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: https:; font-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https:; upgrade-insecure-requests",
  'Strict-Transport-Security':'max-age=31536000; includeSubDomains'
};
http.createServer((req,res)=>{
  Object.entries(securityHeaders).forEach(([k,v])=>res.setHeader(k,v));
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end('Method Not Allowed');}
  let raw;
  try{raw=decodeURIComponent(req.url.split('?')[0]);}catch{return res.writeHead(400).end('Bad Request');}
  if(raw.includes('\0'))return res.writeHead(400).end('Bad Request');
  let p=raw;
  const spaRoutes=['/','/o-nas','/oferta','/kontakt','/zapytanie','/dziekujemy'];
  if(spaRoutes.includes(p)||p.startsWith('/kategoria/')||p.startsWith('/wycieczki/'))p='/index.html';
  const f=path.resolve(publicDir,'.'+p);
  if(f!==publicDir&&!f.startsWith(publicDir+path.sep))return res.writeHead(403).end('Forbidden');
  fs.readFile(f,(e,d)=>{
    if(e){res.writeHead(404);return res.end('404');}
    const ext=path.extname(f);
    const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'};
    res.setHeader('Content-Type',types[ext]||'application/octet-stream');
    res.setHeader('Cache-Control',ext==='.html'?'no-cache':'public, max-age=3600');
    res.writeHead(200);
    if(req.method==='HEAD')return res.end();
    res.end(d);
  });
}).listen(port,'0.0.0.0',()=>console.log('HejWyprawa on '+port));