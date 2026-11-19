/* ===== Ilustraciones de producto (una distinta por tipo, marca y referencia) =====
   No son fotos: son dibujos vectoriales generados con los datos de cada producto (tipo, marca, referencia, tamaño).
   Si existe una foto real en la carpeta de imágenes, la página la usa en su lugar (ver LEEME de imágenes). */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const H=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
const PAL=['#1565C0','#E2231A','#0B8A3A','#F2B705','#6A1B9A','#E65100','#00838F'];
const BC=Object.assign({Baldwin:'#C8102E',Fleetguard:'#E87722',Racor:'#0054A6',Sakura:'#D50000',Champion:'#E31937',Hella:'#E2001A',Capsa:'#1565C0',Pysta:'#0B8A3A',Fremax:'#0054A6',Frasle:'#E2231A',Titan:'#2B2F38','Pro-Ledusa':'#00A3E0','WD-40':'#0054A6','3M':'#E2001A',Glade:'#2E9E4F',Qool:'#00838F',Xtender:'#0A2A66',Ecobrex:'#0A2A66',JRG:'#1565C0'},typeof BCOL!=='undefined'?BCOL:{});
const lum=c=>{const n=parseInt(c.slice(1),16);return(.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255};
const fg=c=>lum(c)>.62?'#0B1B3A':'#fff';
const shade=(c,f)=>{const n=parseInt(c.slice(1),16);const m=v=>Math.max(0,Math.min(255,Math.round(v*f)));return'#'+[m(n>>16),m((n>>8)&255),m(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('')};
const REF=n=>{const m=String(n).toUpperCase().match(/(?:^|[\s(])([A-Z]{0,4}-?\d[A-Z0-9\-\.\/]*)/);return m?m[1].replace(/[\-.\/]+$/g,'').slice(0,13):''};
const NB=p=>String(p.n).toUpperCase().replace(String(p.b||'').toUpperCase(),'').replace(/[^A-ZÁÉÍÓÚÑ0-9\-\/\. ]/g,' ').replace(/\s+/g,' ').trim();
const WORDS=p=>NB(p).split(' ').filter(w=>w.length>2&&!/^(PARA|DE|DEL|LOS|LAS|CON|UNIDAD|X)$/.test(w));
const T=(x,y,s,size,fill,w)=>s?`<text x="${x}" y="${y}" text-anchor="middle" font-family="Figtree,Arial,sans-serif" font-weight="${w||800}" font-size="${size}" fill="${fill}">${E(s)}</text>`:'';
const fit=(s,box,max)=>Math.max(5.5,Math.min(max||11,box/(Math.max(1,String(s).length)*.62)));
const SH=(cx,cy,rx)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="4.5" fill="#0B1B3A" opacity=".13"/>`;
const svg=(b,h)=>`<svg viewBox="0 0 120 ${h||120}" role="img" aria-hidden="true">${b}</svg>`;
const brandTxt=(b,fallback)=>(b&&b!=='Otras marcas'?b:fallback).toUpperCase().slice(0,11);

/* ---------- aceites (cuarto / galón) ---------- */
function oil(p,col){const t=brandTxt(p.b,'ACEITE'),x=p.x||'',gal=/gal/i.test(p.pr||'')||/^[3-9](\.\d)? L$/.test(p.pr||'')||/^\d{2} L/.test(p.pr||''),tc=fg(col);
 const lbl=(w0,x0)=>`<rect x="${x0}" y="64" width="${w0}" height="46" fill="#fff"/><rect x="${x0}" y="64" width="${w0}" height="16" fill="${shade(col,.85)}"/>${T(x0+w0/2,76,t,t.length>8?8:10,tc)}${T(x0+w0/2,98,x||'OIL',(x||'').length>5?14:17,'#0B1B3A')}${T(x0+w0/2,107,(p.pr||'').toUpperCase().slice(0,8),6,'#6B7C99',700)}`;
 if(gal)return svg(SH(56,146,34)+`<rect x="34" y="18" width="24" height="14" rx="4" fill="#0B1B3A"/><path d="M26 44q0-10 10-10h30q10 0 10 10v88a8 8 0 0 1-8 8H34a8 8 0 0 1-8-8z" fill="${col}"/><path d="M76 40h12a8 8 0 0 1 8 8v36a8 8 0 0 1-8 8H78" fill="none" stroke="${col}" stroke-width="8"/><path d="M76 40h12a8 8 0 0 1 8 8v36a8 8 0 0 1-8 8H78" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>${lbl(52,26)}<rect x="31" y="46" width="5" height="82" rx="2.5" fill="#fff" opacity=".22"/>`,150);
 return svg(SH(60,146,32)+`<rect x="44" y="6" width="32" height="16" rx="4" fill="#0B1B3A"/><path d="M40 22h40l12 14v96a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8V36z" fill="${col}"/><path d="M80 22l12 14" stroke="#fff" stroke-opacity=".45"/>${lbl(64,28)}<rect x="33" y="40" width="5" height="90" rx="2.5" fill="#fff" opacity=".22"/>`,150)}

/* ---------- filtros ---------- */
function spin(p,col,o){o=o||{};const r=REF(p.n),b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,9):(o.word||'FILTRO'),w=o.w||56,x0=60-w/2,top=o.top||30,tc=fg(col);
 return svg(SH(60,110,w/2+4)+`<rect x="${x0-3}" y="98" width="${w+6}" height="8" rx="3" fill="#2B3140"/><path d="M${x0} 98V${top+12}q0-12 12-12h${w-24}q12 0 12 12v${86-top-12+12}z" fill="${col}"/><path d="M${x0+3} ${top+14}q0-9 9-9h${w-18}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><rect x="${x0}" y="${top+26}" width="${w}" height="${o.lh||34}" fill="#fff"/><rect x="${x0}" y="${top+26}" width="${w}" height="10" fill="${shade(col,.82)}"/>${T(60,top+34,b,7,tc)}${T(60,top+(o.lh||34)+14,r||o.word2||'',fit(r||o.word2||'',w-8,12),'#0B1B3A')}<rect x="${x0+5}" y="${top+14}" width="5" height="${84-top-14}" rx="2.5" fill="#fff" opacity=".22"/><path d="M${x0} 90h${w}" stroke="#000" stroke-opacity=".14"/>${o.extra||''}`)}
function cartridge(p,col){const r=REF(p.n),b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,9):'FILTRO';
 let pl='';for(let i=0;i<9;i++)pl+=`<path d="M${36+i*6} 30V96" stroke="#b79f6b" stroke-width="1.4"/>`;
 return svg(SH(60,110,36)+`<rect x="32" y="24" width="56" height="8" rx="3" fill="${shade(col,.7)}"/><rect x="34" y="30" width="52" height="68" fill="#e9dcb8"/>${pl}<rect x="32" y="96" width="56" height="8" rx="3" fill="${shade(col,.7)}"/><rect x="34" y="52" width="52" height="30" fill="#fff" opacity=".95"/><rect x="34" y="52" width="52" height="9" fill="${col}"/>${T(60,59.5,b,6.5,fg(col))}${T(60,76,r,fit(r,48,11),'#0B1B3A')}`)}
function airPanel(p,col){const r=REF(p.n),b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,9):'FILTRO DE AIRE';let pl='';for(let i=0;i<=10;i++){const t=i/10;pl+=`<path d="M${19+t*58} 75L${43+t*58} 38" stroke="#bfa56a" stroke-width="1.5"/>`}
 return svg(SH(58,104,44)+`<path d="M12 78L40 34H108L80 78Z" fill="#20252F"/><path d="M19 75L43 38H101L77 75Z" fill="#efe3c2"/>${pl}<path d="M12 78H80V92H12Z" fill="#2E3440"/><path d="M80 78L108 34V48L80 92Z" fill="#161A23"/><rect x="18" y="81" width="56" height="8" rx="2" fill="${col}"/>${T(46,87.4,r||b,fit(r||b,52,7),fg(col))}${T(60,28,b,8,'#6B7C99',800)}`)}
function airRound(p,col){const r=REF(p.n),b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,9):'FILTRO AIRE';let g='';for(let i=0;i<7;i++)g+=`<path d="M${33+i*9} 28V98" stroke="#bfa56a" stroke-width="1.4"/>`;
 return svg(SH(60,110,34)+`<ellipse cx="60" cy="98" rx="30" ry="8" fill="#20252F"/><rect x="30" y="26" width="60" height="72" fill="#e7d9b3"/>${g}<ellipse cx="60" cy="26" rx="30" ry="8" fill="${shade(col,.75)}"/><ellipse cx="60" cy="26" rx="14" ry="3.5" fill="#20252F"/><path d="M30 98V84h60v14" fill="#20252F" opacity=".85"/><rect x="30" y="52" width="60" height="24" fill="#fff" opacity=".96"/><rect x="30" y="52" width="60" height="8" fill="${col}"/>${T(60,58.5,b,6,fg(col))}${T(60,71,r,fit(r,54,10),'#0B1B3A')}`)}
function cabin(p,col){const r=REF(p.n),b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,9):'CABINA';let pl='';for(let i=0;i<10;i++)pl+=`<path d="M${22+i*7} 86L${34+i*7} 40" stroke="#4b525e" stroke-width="2.2"/>`;
 return svg(SH(60,104,46)+`<path d="M14 86L30 34H108L92 86Z" fill="${col}"/><path d="M20 82L34 39H102L88 82Z" fill="#2B2F38"/>${pl}<rect x="30" y="56" width="58" height="16" rx="3" fill="#fff"/>${T(59,63,'AIRE ACONDICIONADO',4.7,'#6B7C99',700)}${T(59,70.5,r||b,fit(r||b,52,9),'#0B1B3A')}`)}
function inline(p,col){const r=REF(p.n),b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,9):'GASOLINA';
 return svg(SH(60,92,44)+`<rect x="6" y="52" width="16" height="9" rx="3" fill="#6B7C99"/><rect x="98" y="52" width="16" height="9" rx="3" fill="#6B7C99"/><rect x="18" y="38" width="84" height="38" rx="13" fill="${col}"/><rect x="24" y="43" width="72" height="5" rx="2.5" fill="#fff" opacity=".3"/><rect x="34" y="50" width="52" height="22" rx="3" fill="#fff"/>${T(60,59,b,6.5,'#6B7C99',800)}${T(60,68.5,r,fit(r,48,9),'#0B1B3A')}<path d="M22 57h-4M102 57h4" stroke="#0B1B3A" stroke-width="3"/>`)}
function waterF(p,col){return spin(p,'#1E88E5',{word:'AGUA',extra:`<path d="M60 22c6 8 9 12 9 16a9 9 0 0 1-18 0c0-4 3-8 9-16z" fill="#fff" opacity=".9"/>`,top:36})}

/* ---------- frenos ---------- */
function pads(p,col){const r=REF(p.n),b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,9):'PASTILLAS';
 return svg(SH(60,108,48)+`<path d="M26 22h68q8 0 8 8v6H18v-6q0-8 8-8z" fill="#8E97A6"/><path d="M22 36h76l-3 6H25z" fill="#2B2F38"/><path d="M14 94L21 56q2-11 13-11h52q11 0 13 11l7 38q1 10-9 10H23q-10 0-9-10z" fill="#B7BEC9"/><path d="M22 92l6-33q2-8 9-8h46q7 0 9 8l6 33q1 6-6 6H28q-7 0-6-6z" fill="#3A3F4A"/><path d="M44 53v44M60 53v44M76 53v44" stroke="#B7BEC9" stroke-width="2" opacity=".4"/><circle cx="25" cy="52" r="2.8" fill="#6B7C99"/><circle cx="95" cy="52" r="2.8" fill="#6B7C99"/><rect x="33" y="68" width="54" height="17" rx="3" fill="${col}"/>${T(60,80,r||b,fit(r||b,50,9),fg(col))}`)}
function fluid(p,col){return svg(SH(60,110,24)+`<rect x="48" y="14" width="24" height="12" rx="3" fill="#E2231A"/><path d="M42 26h36l6 12v64a8 8 0 0 1-8 8H44a8 8 0 0 1-8-8V38z" fill="#2B2F38"/><rect x="38" y="52" width="44" height="40" fill="#fff"/><rect x="38" y="52" width="44" height="12" fill="#E2231A"/>${T(60,61,'FRENOS',8,'#fff')}${T(60,82,/DOT ?(\d\.?\d?)/i.test(p.n)?'DOT '+/DOT ?(\d\.?\d?)/i.exec(p.n)[1]:'DOT 4',13,'#0B1B3A')}`)}

/* ---------- eléctricos ---------- */
function bulb(p,col){const r=REF(p.n),h=/H\d|HB\d|T\d|LED|12V/i.exec(p.n);return svg(SH(60,108,22)+`<circle cx="60" cy="44" r="26" fill="#FFE55C"/><path d="M48 40q12-22 24 0" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/><path d="M52 68h16" stroke="#b58900" stroke-width="2"/><path d="M52 52q8-12 16 0" fill="none" stroke="#e08a00" stroke-width="2"/><rect x="44" y="70" width="32" height="28" rx="4" fill="#6B7C99"/><path d="M44 78h32M44 86h32" stroke="#0B1B3A" stroke-width="2.5"/>${T(60,95,(r||h&&h[0]||'12V').slice(0,8),6,'#fff')}`)}
function plug(p,col){const r=REF(p.n);return svg(SH(60,108,20)+`<rect x="54" y="6" width="12" height="8" rx="2" fill="#2B2F38"/><rect x="50" y="14" width="20" height="36" rx="5" fill="#F3F5F8"/><path d="M50 26h20M50 34h20" stroke="#cfd6e2" stroke-width="2"/><path d="M46 50h28l-4 8H50z" fill="#9AA3B2"/><path d="M48 58h24v22H48z" fill="${col}" /><path d="M50 62h20M50 68h20M50 74h20" stroke="#fff" stroke-opacity=".4"/><path d="M54 80h12v10H54z" fill="#6B7C99"/><path d="M60 90v10M60 100h8" stroke="#0B1B3A" stroke-width="3" fill="none" stroke-linecap="round"/>${T(60,45,(r||p.n.split(' ')[0]).slice(0,9),6.5,'#0B1B3A')}`)}
function fuse(p,col){const c=['#F4C20D','#E53935','#1E88E5','#43A047','#FB8C00'][H(p.n)%5];return svg(SH(60,104,26)+`<path d="M34 28h52v58a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6z" fill="${c}"/><path d="M34 28h52v14H34z" fill="#fff" opacity=".28"/><path d="M48 44v18M72 44v18" stroke="#2B2F38" stroke-width="3"/><rect x="48" y="50" width="24" height="6" fill="#2B2F38" opacity=".35"/><rect x="42" y="92" width="10" height="14" fill="#9AA3B2"/><rect x="68" y="92" width="10" height="14" fill="#9AA3B2"/>${T(60,78,(REF(p.n)||'FUSIBLE').slice(0,6),9,'#0B1B3A')}`)}
function relay(p,col){return svg(SH(60,104,30)+`<rect x="30" y="26" width="60" height="62" rx="6" fill="#2B2F38"/><rect x="36" y="32" width="48" height="26" rx="3" fill="#fff"/>${T(60,45,(REF(p.n)||WORDS(p)[0]||'12V').slice(0,8),9,'#0B1B3A')}${T(60,53,'ELÉCTRICO',5,'#6B7C99',700)}<rect x="40" y="88" width="8" height="14" fill="#C9A227"/><rect x="56" y="88" width="8" height="14" fill="#C9A227"/><rect x="72" y="88" width="8" height="14" fill="#C9A227"/>`)}
function battery(p,col){const r=NB(p).slice(0,13),b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,10):'BATERÍA';return svg(SH(60,106,50)+`<rect x="22" y="32" width="14" height="10" rx="2" fill="#9AA3B2"/><rect x="84" y="32" width="14" height="10" rx="2" fill="#9AA3B2"/><rect x="12" y="40" width="96" height="58" rx="7" fill="#20252F"/><rect x="12" y="40" width="96" height="14" rx="6" fill="#2B2F38"/><rect x="20" y="58" width="80" height="34" rx="4" fill="${col}"/><rect x="20" y="58" width="80" height="6" fill="#fff" opacity=".25"/>${T(60,76,b,9,fg(col))}${T(60,88,r,fit(r,70,11),fg(col))}<path d="M26 47h12M32 41v12M82 47h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`)}

/* ---------- otros ---------- */
function wiper(p,col){const r=REF(p.n),m=/(\d{2})\s*(?:"|''|IN|PULG)?/.exec(p.n);return svg(SH(60,102,48)+`<path d="M14 82L98 34" stroke="#20252F" stroke-width="5" stroke-linecap="round"/><path d="M10 92Q60 62 110 92" stroke="#20252F" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M14 94Q60 66 106 94" stroke="${col}" stroke-width="3" fill="none"/><rect x="48" y="64" width="24" height="12" rx="3" fill="#6B7C99" transform="rotate(-8 60 70)"/>${T(60,108,(r||m&&m[1]+'"'||'').slice(0,10),9,'#0B1B3A')}`)}
function belt(p,col){const r=REF(p.n);return svg(SH(60,104,46)+`<ellipse cx="60" cy="58" rx="46" ry="32" fill="none" stroke="#20252F" stroke-width="13"/><ellipse cx="60" cy="58" rx="46" ry="32" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="5 5"/><circle cx="60" cy="58" r="14" fill="#9AA3B2"/><circle cx="60" cy="58" r="5" fill="#2B2F38"/>${T(60,102,r,9,'#0B1B3A')}`)}
function bolt(p,col){const n=p.n.toUpperCase();
 if(/EXTINTOR/.test(n)&&!/RECARGA/.test(n))return svg(SH(60,108,22)+`<rect x="48" y="10" width="24" height="12" rx="3" fill="#20252F"/><path d="M72 16h14v10" fill="none" stroke="#20252F" stroke-width="4" stroke-linecap="round"/><rect x="38" y="24" width="44" height="78" rx="12" fill="#D32F2F"/><rect x="44" y="52" width="32" height="22" fill="#fff"/>${T(60,66,/10/.test(n)?'10 LBS':'5 LBS',9,'#0B1B3A')}<rect x="44" y="30" width="6" height="64" rx="3" fill="#fff" opacity=".25"/>`);
 if(/RECARGA/.test(n))return svg(SH(60,108,26)+`<rect x="38" y="24" width="44" height="78" rx="12" fill="#D32F2F"/><circle cx="60" cy="60" r="16" fill="#fff"/><path d="M52 60a8 8 0 0 1 14-5M68 60a8 8 0 0 1-14 5" fill="none" stroke="#D32F2F" stroke-width="3"/>${T(60,92,'RECARGA',7,'#fff')}`);
 if(/CONO/.test(n))return svg(SH(60,108,34)+`<rect x="22" y="92" width="76" height="9" rx="2" fill="#20252F"/><path d="M42 92L52 22h16l10 70z" fill="#F57C00"/><path d="M47 62h26l-2 12H49z" fill="#fff"/>`);
 if(/BOTIQ/.test(n))return svg(SH(60,106,40)+`<rect x="20" y="36" width="80" height="58" rx="8" fill="#fff" stroke="#D32F2F" stroke-width="4"/><path d="M44 36v-8h32v8" fill="none" stroke="#D32F2F" stroke-width="4"/><path d="M60 50v30M45 65h30" stroke="#D32F2F" stroke-width="9"/>`);
 if(/CHALECO/.test(n))return svg(SH(60,106,38)+`<path d="M34 24l14 10 12-4 12 4 14-10 8 18-10 8v44H36V50l-10-8z" fill="#CDEB16"/><path d="M48 34v68M72 34v68M36 78h48" stroke="#fff" stroke-width="6" opacity=".9"/>`);
 if(/KIT/.test(n))return svg(SH(60,106,38)+`<rect x="22" y="36" width="76" height="56" rx="8" fill="#D32F2F"/><path d="M42 36v-8h36v8" fill="none" stroke="#20252F" stroke-width="4"/><path d="M60 46v36M42 64h36" stroke="#fff" stroke-width="8"/>`);
 if(/PORTA ?PLACA|TORNILLO/.test(n))return svg(SH(60,104,30)+`<ellipse cx="60" cy="40" rx="22" ry="8" fill="#B7BEC9"/><path d="M38 40v6a22 8 0 0 0 44 0v-6z" fill="#9AA3B2"/><rect x="55" y="48" width="10" height="46" fill="#9AA3B2"/><path d="M55 56h10M55 64h10M55 72h10M55 80h10" stroke="#6B7C99"/><ellipse cx="60" cy="40" rx="8" ry="3" fill="#6B7C99"/>`);
 return svg(SH(60,106,34)+`<path d="M60 16l26 15v30L60 76 34 61V31z" fill="#B7BEC9"/><path d="M60 16l26 15-26 15-26-15z" fill="#DCE2EC"/><circle cx="60" cy="46" r="11" fill="#6B7C99"/><circle cx="60" cy="46" r="6" fill="#2B2F38"/><rect x="52" y="76" width="16" height="24" fill="#9AA3B2"/><path d="M52 82h16M52 88h16M52 94h16" stroke="#6B7C99"/>`)}
function jug(p,col){const n=p.n.toUpperCase(),c=/ROSAD|ROSA/.test(n)?'#EC407A':/VERDE/.test(n)?'#2E9E4F':/AZUL/.test(n)?'#1E88E5':/AMARIL/.test(n)?'#F2B705':/NARANJ/.test(n)?'#F57C00':/ROJO/.test(n)?'#E53935':shade(col,1),b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,10):'REFRIGERANTE';
 return svg(SH(60,114,32)+`<rect x="40" y="10" width="22" height="12" rx="3" fill="#20252F"/><path d="M32 34q0-12 12-12h24q12 0 12 12v70a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8z" fill="${c}" opacity=".92"/><path d="M76 28h10a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6h-8" fill="none" stroke="${c}" stroke-width="7"/><rect x="32" y="52" width="56" height="44" fill="#fff"/><rect x="32" y="52" width="56" height="12" fill="#0B1B3A"/>${T(60,61.5,b,7,'#fff')}${T(60,81,/50\/?50|50-50/.test(n)?'50/50':/CONCENTR/.test(n)?'CONC.':'COOLANT',11,'#0B1B3A')}${T(60,91,/GAL/.test(n)?'GALÓN':/CUART/.test(n)?'CUARTO':'',6,'#6B7C99',700)}`,120)}
function bottle(p,col){const b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,10):'JRG',k=(WORDS(p).slice(0,2).join(' ')||(p.s||'')).toUpperCase(),c=col||PAL[H(p.n)%PAL.length];
 return svg(SH(60,114,26)+`<rect x="48" y="8" width="24" height="14" rx="3" fill="#20252F"/><path d="M44 22h32l6 14v66a8 8 0 0 1-8 8H46a8 8 0 0 1-8-8V36z" fill="${c}"/><rect x="38" y="52" width="44" height="44" fill="#fff"/><rect x="38" y="52" width="44" height="13" fill="${shade(c,.8)}"/>${T(60,62,b,7.5,fg(c))}${T(60,82,k.split(' ')[0].slice(0,12),fit(k.split(' ')[0].slice(0,12),40,10),'#0B1B3A')}${T(60,91,(k.split(' ')[1]||'').slice(0,12),6.5,'#6B7C99',700)}<rect x="43" y="38" width="4" height="62" rx="2" fill="#fff" opacity=".25"/>`)}
function can(p,col){const b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,10):'JRG',c=col||PAL[H(p.n)%PAL.length],w=(p.n.toUpperCase().match(/SILICONA|LIMPIA\w*|BRILL\w*|LUBRIC\w*|ANTICORR\w*|DESENGR\w*|CERA|PROTECT\w*|AMBIENT\w*|DESODOR\w*/)||[(p.s||'SPRAY')])[0].slice(0,11);
 return svg(SH(60,114,24)+`<rect x="52" y="6" width="16" height="12" rx="3" fill="#20252F"/><path d="M42 24q0-6 6-6h24q6 0 6 6v82a8 8 0 0 1-8 8H50a8 8 0 0 1-8-8z" fill="${c}"/><path d="M42 24q0-6 6-6h24q6 0 6 6v10H42z" fill="#20252F" opacity=".35"/><rect x="42" y="52" width="36" height="44" fill="#fff" opacity=".96"/>${T(60,62,b,7.5,'#0B1B3A')}${T(60,78,w,fit(w,32,9),shade(c,.8))}<path d="M52 86h16" stroke="${c}" stroke-width="3"/><rect x="45" y="30" width="4" height="74" rx="2" fill="#fff" opacity=".3"/>`)}
function tree(p,col){const c=col||PAL[H(p.n)%PAL.length],b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,10):'AROMA',w=(p.n.toUpperCase().replace(p.b.toUpperCase(),'').trim().split(' ')[0]||'').slice(0,10);
 return svg(SH(60,110,28)+`<path d="M60 4v12" stroke="#20252F" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="5" r="3" fill="none" stroke="#20252F" stroke-width="2"/><path d="M60 16l30 40-12-2 22 40H20l22-40-12 2z" fill="${c}"/><path d="M60 16l30 40-12-2 22 40" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>${T(60,72,b,7.5,fg(c))}${T(60,84,w,fit(w,36,8),fg(c),700)}<rect x="54" y="96" width="12" height="8" fill="#20252F"/>`)}
function tub(p,col){const b=p.b&&p.b!=='Otras marcas'?p.b.toUpperCase().slice(0,10):'GRASA',c=col||'#0A2A66',w=(p.n.toUpperCase().match(/LITIO|MULTIUSOS|BLANCA|ROJA|AZUL|CHASIS|VALVUL\w*|CERA|MOLY\w*/)||[''])[0].slice(0,9);
 return svg(SH(60,106,44)+`<ellipse cx="60" cy="42" rx="40" ry="12" fill="#20252F"/><path d="M20 42v46c0 7 18 12 40 12s40-5 40-12V42c0 7-18 12-40 12S20 49 20 42z" fill="${c}"/><ellipse cx="60" cy="42" rx="34" ry="9" fill="#E9E1C8"/><rect x="30" y="62" width="60" height="26" rx="4" fill="#fff"/>${T(60,73,b,8,'#0B1B3A')}${T(60,83,w,fit(w,52,7),shade(c,.9),700)}`)}
function cloth(p,col){const c=col||'#F2B705';return svg(SH(60,104,40)+`<path d="M20 44l26-12 30 8 24-10v50l-26 12-30-8-24 10z" fill="${c}"/><path d="M46 32v50M76 40v50" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><path d="M26 56l24 6 28-8 20 6" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>${T(60,102,(p.b!=='Otras marcas'?p.b:'PAÑO').toUpperCase().slice(0,10),8,'#0B1B3A')}`)}
function cap(p,col){return svg(SH(60,104,34)+`<ellipse cx="60" cy="40" rx="30" ry="10" fill="#B7BEC9"/><path d="M30 40v22c0 6 13 10 30 10s30-4 30-10V40" fill="#9AA3B2"/><ellipse cx="60" cy="40" rx="22" ry="6" fill="#DCE2EC"/><rect x="50" y="22" width="20" height="12" rx="3" fill="#2B2F38"/><path d="M36 58v8M48 62v8M60 63v8M72 62v8M84 58v8" stroke="#6B7C99"/>`)}

function kindOf(p){const n=String(p.n).toUpperCase(),s=String(p.s||'');
 switch(p.c){
  case'ac':case'am':case'vh':return'oil';
  case'fi':return/carcasa/i.test(s)?'cart':'spin';
  case'fa':return/acondicionado/i.test(s)?'cabin':/CAMI|TURBO|NPR|NKR|NHR|FRR|FVR|HINO|KENWORTH|SCANIA|VOLVO|INTERNATIONAL|MACK|FREIGHT|CARGO|DONALDSON|\bAF\d|\bP\d{6}|RS\d{4}|REDOND|CILIND|PERKINS|CUMMINS|FOTON|JAC\b/i.test(n)?'round':/moto/i.test(s)?'airmoto':'panel';
  case'fc':return/Gasolina/i.test(s)?'inline':/carcasa/i.test(s)?'cart':'spinfuel';
  case'fw':return'water';
  case'fre':return/L[ií]quido/i.test(s)||/LIQUIDO|DOT ?\d/.test(n)?'fluid':'pads';
  case'bom':return/Buj/i.test(s)?'plug':/Fusib/i.test(s)||/FUSIBLE/.test(n)?'fuse':/El[eé]ctric/i.test(s)||/REL[EÉ]|SWITCH|SENSOR|INTERRUPT/.test(n)?'relay':'bulb';
  case'bat':return'bat';case'plu':return'wiper';case'ban':return'belt';case'tor':return/TAPON|TAPA/.test(n)&&/RADIADOR/.test(n)?'cap':'bolt';
  case'gr':return'tub';
  case'amb':return/SPRAY|AEROSOL|LATA/.test(n)?'can':/EMBELLEC/i.test(p.s||'')?'bottle':'tree';
  case'sil':return/SPRAY|AEROSOL|SILICONA|BRILLA|LUBRIC/.test(n)?'can':'bottle';
  case'bel':return/CERA|PASTA|CREMA/.test(n)?'tub':/PA[ÑN]O|MICROFIBRA|ESPONJA|TOALLA|GAMUZA|FRANELA/.test(n)?'cloth':/SPRAY|AEROSOL/.test(n)?'can':'bottle';
  case'adi':return/SPRAY|AEROSOL/.test(n)?'can':'bottle';
  case'ref':return'jug'}
 return'bottle'}
const FILT=['#1565C0','#E2231A','#0B8A3A','#E65100','#6A1B9A','#00838F'];
function drawProduct(p){const k=kindOf(p),known=BC[p.b],dflt=known||p.col&&p.b!=='Otras marcas'&&p.col||FILT[H(REF(p.n)||p.n)%FILT.length];
 switch(k){
  case'oil':return oil(p,BC[p.b]||p.col||'#0A2A66');
  case'spin':return spin(p,dflt,{word:/moto/i.test(p.s||'')?'MOTO':'ACEITE'});
  case'spinfuel':return spin(p,known||'#F9A825',{word:'COMBUSTIBLE',w:46,top:24});
  case'cart':return cartridge(p,dflt);
  case'panel':return airPanel(p,dflt);case'airmoto':return airPanel(p,dflt);case'round':return airRound(p,dflt);
  case'cabin':return cabin(p,dflt);case'inline':return inline(p,known||'#546E7A');case'water':return waterF(p,dflt);
  case'pads':return pads(p,known||'#E2231A');case'fluid':return fluid(p,dflt);
  case'bulb':return bulb(p,dflt);case'plug':return plug(p,known||'#E31937');case'fuse':return fuse(p,dflt);case'relay':return relay(p,dflt);
  case'bat':return battery(p,known||['#E2231A','#1565C0','#0B8A3A','#F2B705'][H(p.b+p.n)%4]);
  case'wiper':return wiper(p,dflt);case'belt':return belt(p,dflt);case'bolt':return bolt(p,dflt);case'cap':return cap(p,dflt);
  case'jug':return jug(p,known||'#0B8A3A');case'tub':return tub(p,known||dflt);case'cloth':return cloth(p,known);
  case'tree':return tree(p,known||PAL[H(p.n)%PAL.length]);case'can':return can(p,known||PAL[H(p.n)%PAL.length]);
  default:return bottle(p,known||PAL[H(p.n)%PAL.length])}}
window.artProducto=drawProduct;
})();

