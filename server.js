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
const buckets=new Map();
function clientIp(req){return String(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0].trim();}
function allowed(ip){const now=Date.now(),b=buckets.get(ip)||[];const fresh=b.filter(t=>now-t<10*60*1000);if(fresh.length>=5){buckets.set(ip,fresh);return false;}fresh.push(now);buckets.set(ip,fresh);return true;}
function clean(v,max=500){return String(v||'').trim().replace(/[<>]/g,'').slice(0,max);}
function handleInquiry(req,res){
  const ip=clientIp(req); if(!allowed(ip)){res.writeHead(429,{'Content-Type':'application/json','Retry-After':'600'});return res.end(JSON.stringify({ok:false,error:'Za dużo prób. Spróbuj później.'}));}
  let body=''; req.on('data',x=>{body+=x;if(body.length>20000)req.destroy();});
  req.on('end',()=>{try{const d=JSON.parse(body||'{}');if(d.website)return res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({ok:true}));
    const name=clean(d.name,120),email=clean(d.email,160),phone=clean(d.phone,40),school=clean(d.school,180),notes=clean(d.notes,2000);
    if(name.length<2||school.length<2||!/^\\S+@\\S+\\.\\S+$/.test(email)||phone.length<6){res.writeHead(400,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:false,error:'Uzupełnij poprawnie wymagane pola.'}));}
    // Safe validation endpoint. Persistence/email transport will be connected separately.
    res.writeHead(202,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({ok:true,validated:true}));
  }catch{res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:'Nieprawidłowe dane.'}));}});
}
setInterval(()=>{const n=Date.now();for(const [ip,a] of buckets)if(!a.some(t=>n-t<10*60*1000))buckets.delete(ip)},15*60*1000).unref();
http.createServer((req,res)=>{
  Object.entries(securityHeaders).forEach(([k,v])=>res.setHeader(k,v));
  if(req.method==='POST' && req.url.split('?')[0]==='/api/inquiry'){return handleInquiry(req,res);}\n  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD, POST'});return res.end('Method Not Allowed');}
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