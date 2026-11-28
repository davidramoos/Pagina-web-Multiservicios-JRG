/* ===== Utilidades compartidas: WhatsApp, pedido, descuento, ilustraciones ===== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const money=n=>'$'+Math.round(n).toLocaleString('es-CO');
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let desc=1,cart=store.get('jrg_cart',{});
const pr=p=>Math.round(p*desc/100)*100;
const imgsrc=n=>(window.IMGS&&IMGS[n])||(n.includes('/')?n:'imagenes/'+n);
const nz=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function art(k,col,x,b){col=col||'#1565C0';
 if(k==='oil'){const t=(b&&b!=='Otras marcas'?b:'ACEITE').toUpperCase().slice(0,11),dk=/^#(F2B705|E8B400|FFD400)$/i.test(col),tc=dk?'#0B1B3A':'#fff';
  return`<svg viewBox="0 0 120 150"><rect x="44" y="6" width="32" height="16" rx="4" fill="#0B1B3A"/><path d="M40 22h40l12 14v96a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8V36z" fill="${col}"/><path d="M80 22l12 14" stroke="#fff" stroke-opacity=".45"/><rect x="28" y="54" width="64" height="52" fill="#fff"/><rect x="28" y="54" width="64" height="17" fill="${col}"/><text x="60" y="66.5" text-anchor="middle" font-family="Figtree,Arial,sans-serif" font-weight="800" font-size="${t.length>8?8:10}" fill="${tc}">${esc(t)}</text><text x="60" y="94" text-anchor="middle" font-family="Figtree,Arial,sans-serif" font-weight="800" font-size="${(x||'').length>5?14:17}" fill="#0B1B3A">${esc(x||'OIL')}</text><circle cx="38" cy="122" r="5" fill="#fff" opacity=".35"/></svg>`}
 if(k==='filter'||k==='airf')return`<svg viewBox="0 0 120 120"><rect x="32" y="28" width="56" height="72" rx="8" fill="${col}"/><rect x="28" y="20" width="64" height="12" rx="4" fill="#0B1B3A"/><path d="M44 46v42M54 46v42M64 46v42M74 46v42" stroke="#fff" stroke-width="3" opacity=".7"/><rect x="44" y="100" width="32" height="8" rx="3" fill="#6B7C99"/></svg>`;
 if(k==='grease')return`<svg viewBox="0 0 120 120"><ellipse cx="60" cy="42" rx="38" ry="12" fill="#0B1B3A"/><path d="M22 42v44c0 7 17 12 38 12s38-5 38-12V42c0 7-17 12-38 12S22 49 22 42z" fill="${col}"/><rect x="34" y="62" width="52" height="22" rx="4" fill="#fff"/><path d="M42 73h36" stroke="#0A2A66" stroke-width="4"/></svg>`;
 if(k==='tree')return`<svg viewBox="0 0 120 120"><path d="M60 6v14" stroke="#0B1B3A" stroke-width="3"/><path d="M60 18l30 36-12-2 24 34H18l24-34-12 2z" fill="${col}"/><rect x="54" y="88" width="12" height="16" fill="#0B1B3A"/><circle cx="60" cy="58" r="6" fill="#fff" opacity=".8"/></svg>`;
 if(k==='spray')return`<svg viewBox="0 0 120 120"><rect x="38" y="36" width="44" height="74" rx="8" fill="${col}"/><rect x="48" y="14" width="24" height="22" rx="4" fill="#0B1B3A"/><rect x="42" y="58" width="36" height="28" rx="4" fill="#fff"/><path d="M60 62l6 10H54z" fill="#E2231A"/><path d="M26 22h14M24 30h12" stroke="#6B7C99" stroke-width="3" stroke-linecap="round"/></svg>`;
 if(k==='pad')return`<svg viewBox="0 0 120 120"><path d="M16 46c0-8 6-14 14-14h60c8 0 14 6 14 14v28c0 8-6 14-14 14H30c-8 0-14-6-14-14z" fill="#3a3f4a"/><path d="M26 44h68v32H26z" fill="${col}"/><path d="M40 52v16M60 52v16M80 52v16" stroke="#fff" stroke-width="3" opacity=".7"/></svg>`;
 if(k==='bat')return`<svg viewBox="0 0 120 120"><rect x="14" y="38" width="92" height="58" rx="8" fill="${col}"/><rect x="28" y="28" width="16" height="12" fill="#0B1B3A"/><rect x="76" y="28" width="16" height="12" fill="#0B1B3A"/><path d="M34 66h18M43 57v18M70 66h18" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`;
 if(k==='bulb')return`<svg viewBox="0 0 120 120"><circle cx="60" cy="48" r="28" fill="#FFD400"/><rect x="46" y="74" width="28" height="24" rx="4" fill="#6B7C99"/><path d="M50 84h20M50 92h20" stroke="#0B1B3A" stroke-width="3"/></svg>`;
 if(k==='wiper')return`<svg viewBox="0 0 120 120"><path d="M14 86Q60 28 106 86" stroke="#0B1B3A" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M24 80Q60 40 96 80" stroke="${col}" stroke-width="4" fill="none"/></svg>`;
 if(k==='belt')return`<svg viewBox="0 0 120 120"><ellipse cx="60" cy="60" rx="44" ry="30" fill="none" stroke="#0B1B3A" stroke-width="12"/><ellipse cx="60" cy="60" rx="44" ry="30" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="6 6"/></svg>`;
 if(k==='bolt')return`<svg viewBox="0 0 120 120"><path d="M60 20l30 17v34L60 88 30 71V37z" fill="#6B7C99"/><circle cx="60" cy="54" r="14" fill="#E7F1FF"/><circle cx="60" cy="54" r="8" fill="${col}"/></svg>`;
 return`<svg viewBox="0 0 120 120"><rect x="40" y="38" width="40" height="66" rx="10" fill="${col}"/><rect x="50" y="24" width="20" height="16" rx="3" fill="#0B1B3A"/><rect x="46" y="58" width="28" height="24" rx="4" fill="#fff"/><path d="M60 62l5 9h-10z" fill="#E2231A"/></svg>`}
/* Productos sin foto: se muestra el logo de la tienda (window.FOTO_SIN='ilus' devuelve las ilustraciones) */
try{if(window.IMGS&&IMGS['logomultijrg.png'])document.documentElement.style.setProperty('--logo','url('+IMGS['logomultijrg.png']+')')}catch(e){}
/* Logo de la marca como foto de reemplazo (archivos en img/marcas/). Sin logo propio → logo del negocio. */
const LOGO_MK={'Motul':'motul','Castrol':'castrol','Shell':'shell','Mobil':'mobil','Mobilube':'mobil','Terpel':'terpel','Ultrek':'terpel','Chevron':'chevron','Havoline':'havoline','Petrobras':'petrobras','Repsol':'repsol','Valvoline':'valvoline','Liqui Moly':'liqui-moly','Kixx':'kixx','ACDelco':'acdelco','Hella':'hella','WD-40':'wd-40','3M':'3m','Honda':'honda','Nissan':'nissan','Mazda':'mazda','Bajaj':'bajaj','Elf':'elf','Eni':'eni','Glade':'glade','Simoniz':'simoniz'};
const LOGO_NOM=[[/\bMOTUL\b/i,'motul'],[/\bCASTROL\b/i,'castrol'],[/\bSHELL\b/i,'shell'],[/\bMOBIL(UBE)?\b/i,'mobil'],[/\bTERPEL\b/i,'terpel'],[/\bCHEVRON\b/i,'chevron'],[/\bHAVOLINE\b/i,'havoline'],[/\bPETROBRAS\b/i,'petrobras'],[/\bREPSOL\b/i,'repsol'],[/\bVALVOLINE\b/i,'valvoline'],[/\bLIQUI MOLY\b/i,'liqui-moly'],[/\bKIXX\b/i,'kixx'],[/\bACDELCO\b/i,'acdelco'],[/\bHELLA\b/i,'hella'],[/\bWD-?40\b/i,'wd-40']];
function logoMarca(p){const n=String(p.n||'');if(LOGO_MK[p.b])return LOGO_MK[p.b];for(const[r,k]of LOGO_NOM)if(r.test(n))return k;
 /* Premium Filters: referencias AIP/ACP/OLP/FLP/FCP. Franig: HCX/HCA/HCC. Van antes que Filtraire porque algunos nombres traen también «FT» */
 if(/(^|[^A-Z0-9])(AIP|ACP|OLP|FLP|FCP)\b[\s-]*\d/i.test(n))return'premium';
 if(/(^|[^A-Z0-9])HC[XAC][\s-]?[A-Z0-9]/i.test(n))return'franig';
 /* Filtraire (solo filtros de AIRE): sus referencias se escriben «FT 560», «10424 FT SKODA…» (AIP/ACP/OLP son de Premium, no de Filtraire) (las demás marcas de filtros se excluyen) */
 if(p.c==='fa'&&(/(^|[^A-Z0-9])FT[\s-]?\d{2,}(?!W)|(^|[^A-Z0-9])FT(?![A-Z0-9])/i.test(n))&&!/BALDWIN|SAKURA|FRAM|WIX|DONALDSON|FLEETGUARD|RACOR|MANN|HENGST|BOSCH|GONHER|PREMIUM|CHAMPION|TECNIFIL|ELEMFIL|PARTMO/i.test(n))return'filtraire';return''}
function phHTML(p){if(p.img||window.FOTO_SIN==='ilus')return`<span class="ph"${p.img?' hidden':''}>${window.artProducto?artProducto(p):art(p.k,p.col,p.x,p.b)}</span>`;
 const k=logoMarca(p);return k?`<span class="ph lg mk" style="background-image:url(img/marcas/${k}.webp)" role="img" aria-label="Logo ${esc(p.b&&p.b!=='Otras marcas'?p.b:k)} (foto no disponible)"></span>`:`<span class="ph lg" role="img" aria-label="Foto no disponible"></span>`}
function cardHTML(p){return`<article class="prod"><div class="im">${phHTML(p)}${p.img?`<img data-f src="${imgsrc(p.img)}" alt="${esc(p.n)}" loading="lazy" decoding="async" width="150" height="150">`:''}</div><div class="b"><small>${esc(p.b)}</small><h4>${esc(p.n)}</h4><small>${esc(p.d||'')}</small>${p.st?'':'<span class="tag">Consultar disponibilidad</span>'}<div class="price">${desc<1?`<s>${money(p.p)}</s>`:''}${money(pr(p.p))}</div><button class="btn blue" data-add="${p.id}">Agregar al pedido</button></div></article>`}
/* Fotos reales: se buscan en  imagenes aceites/…  o  imagenes productos/…  (jpg, png, webp, svg). Si no hay, se queda la ilustración. */
const EXT_IMG=['jpg','png','webp','svg'];
/* Orden de búsqueda de la foto real: 1) la del producto (jpg, png, webp, svg)  2) la de la marca (_marca)  3) la genérica de su tipo (_generica). Si no hay ninguna, queda la ilustración. */
function fotoCand(b){const o=[];b.split('|').forEach((r,k)=>(k===0?EXT_IMG:['jpg','png','webp']).forEach(e=>o.push(encodeURI(r)+'.'+e)));return o}
document.addEventListener('error',e=>{const i=e.target;if(!i||i.tagName!=='IMG'||!i.dataset.b)return;const c=fotoCand(i.dataset.b),n=+i.dataset.n+1;if(n<c.length){i.dataset.n=n;i.src=c[n]}else i.remove()},true);
document.addEventListener('load',e=>{const i=e.target;if(!i||i.tagName!=='IMG'||!i.dataset.b)return;i.style.display='block';const ph=i.parentNode.querySelector('.ph');if(ph)ph.style.display='none'},true);
/* Si una foto de producto no carga, se muestra la ilustración en vez de un cuadro vacío */
document.addEventListener('error',e=>{const i=e.target;if(!i||i.tagName!=='IMG'||!('f' in i.dataset))return;const ph=i.parentNode.querySelector('.ph');i.remove();if(ph)ph.hidden=false},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(!b)return;const p=P[b.dataset.add];addToCart(p.id,p.n,p.p);b.textContent='Agregado';setTimeout(()=>b.textContent='Agregar al pedido',900)});
/* Pedido */
function addToCart(id,n,p){cart[id]=cart[id]||{n,p,q:0};cart[id].q++;store.set('jrg_cart',cart);drawCart()}
function drawCart(){const k=Object.keys(cart);let t=0,n=0;
 $('#ci').innerHTML=k.length?k.map(i=>{const c=cart[i];t+=pr(c.p)*c.q;n+=c.q;return`<div class="ci"><b>${esc(c.n)}</b><span>${money(pr(c.p)*c.q)}</span><span class="q"><button data-m="${i}" aria-label="Quitar uno">−</button> ${c.q} <button data-p="${i}" aria-label="Agregar uno">+</button></span></div>`}).join(''):'<p style="color:var(--steel)">Tu pedido está vacío. Agrega productos desde la tienda.</p>';
 $('#ct').textContent=money(t);$('#cc').textContent=n}
$('#ci').onclick=e=>{const m=e.target.dataset.m,p=e.target.dataset.p;if(m!=null&&--cart[m].q<1)delete cart[m];if(p!=null)cart[p].q++;store.set('jrg_cart',cart);drawCart()};
$('#cartBtn').onclick=()=>$('#drawer').classList.add('on');$('#closeC').onclick=()=>$('#drawer').classList.remove('on');
$('#sendC').onclick=()=>{const k=Object.keys(cart);if(!k.length)return alert('Tu pedido está vacío. Agrega productos primero.');let t=0;const l=k.map(i=>{const c=cart[i];t+=pr(c.p)*c.q;return c.q+' x '+c.n+' ('+money(pr(c.p))+')'});$('#drawer').classList.remove('on');ticket({t:'Pedido de tienda',lines:l,total:t,ask:'full',done:()=>{cart={};store.set('jrg_cart',cart);drawCart()}})};
drawCart();

/* ---------- Comprobante dentro de la página (sin enlaces externos) ---------- */
function ticket(o){const m=document.createElement('div');m.className='modal';document.body.append(m);const close=()=>m.remove();
 const WA='573125529044',cita=o.cita||null,srv=o.servicio||'';
 const show=(who,est)=>{const code='JRG-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+String(Math.floor(Math.random()*9000)+1000),when=new Date().toLocaleString('es-CO');
  const lineasCita=cita?['Cita: '+cita.texto,...(srv?['Servicio: '+srv]:[])]:[];
  const txt=['MULTISERVICIOS JRG','Comprobante '+code,when,o.t,who.nombre?'Cliente: '+who.nombre:'',who.celular?'Celular: '+who.celular:'',who.placa?'Placa / vehículo: '+who.placa:'',...lineasCita,...o.lines,o.total!=null?'Total estimado: '+money(o.total):''].filter(Boolean).join('\n');
  const all=store.get('jrg_tickets',[]);all.unshift({code,when,txt});store.set('jrg_tickets',all.slice(0,30));
  const notas=['Presenta este documento en el local, en el celular o impreso.','Los valores son estimados: el valor final se confirma al revisar tu vehículo.',...(cita?['Tu cita queda pendiente hasta que el taller la confirme por WhatsApp o llamada. Si no puedes asistir, avísanos.']:[])];
  const pdf={codigo:code,fecha:when,titulo:o.t,cliente:{nombre:who.nombre,celular:who.celular,placa:who.placa},cita:cita?{dia:cita.dia,hora:cita.horaTxt,dur:cita.dur,servicio:srv}:null,lineas:o.lines,total:o.total!=null?o.total:null,totalTxt:o.total!=null?money(o.total):null,notas,archivo:'Orden-'+code};
  const aviso=cita?(est==='ok'?'<p class="tok">Tu cita quedó registrada. El taller te la confirma por WhatsApp o llamada.</p>':'<p class="twarn">No pudimos enviar tu cita automáticamente. Escríbenos por WhatsApp para confirmarla.</p>'):'';
  m.innerHTML=`<div class="tk" id="tk" role="dialog" aria-modal="true" aria-label="Comprobante"><h3>Comprobante listo</h3><div class="code">${code}</div><small>${when}</small><p style="margin:10px 0"><b>${esc(o.t)}</b>${who.nombre?'<br>Cliente: '+esc(who.nombre):''}${who.celular?'<br>Celular: '+esc(who.celular):''}${who.placa?'<br>Placa / vehículo: '+esc(who.placa):''}</p>${cita?`<div class="tcita"><span>Cita agendada</span><b>${esc(cita.dia)}</b><b>${esc(cita.horaTxt)}</b>${srv?'<small>'+esc(srv)+'</small>':''}</div>`:''}<ul>${o.lines.map(l=>'<li>'+esc(l)+'</li>').join('')}</ul>${o.total!=null?`<div class="ttot">Total estimado: ${money(o.total)}</div>`:''}${aviso}<p class="tnote">Descarga tu orden en PDF y muéstrala en el local. Para una respuesta inmediata escríbenos por WhatsApp.</p><div class="cta" style="margin:0"><button class="btn red" id="tp" type="button">Descargar PDF</button><a class="btn wa" id="tw" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent(txt)}">WhatsApp</a><button class="btn ghost" style="color:var(--navy);box-shadow:inset 0 0 0 2px var(--navy)" id="tc" type="button">Copiar</button><button class="chip" id="tx" type="button">Cerrar</button></div><p id="tpe" class="tpe" hidden></p></div>`;
  $('#tp').onclick=async()=>{const b=$('#tp'),e=$('#tpe');b.disabled=true;b.textContent='Generando PDF…';e.hidden=true;
   try{await JRGPdf.generar(pdf);b.textContent='PDF descargado ✓'}catch(x){console.warn(x);b.textContent='Descargar PDF';e.textContent='No pudimos generar el PDF. Revisa tu conexión e inténtalo de nuevo.';e.hidden=false}
   b.disabled=false;setTimeout(()=>{if($('#tp'))$('#tp').textContent='Descargar PDF'},2500)};
  $('#tx').onclick=close;$('#tc').onclick=()=>{try{navigator.clipboard.writeText(txt)}catch(e){};$('#tc').textContent='Copiado'};if(o.done)o.done()};
 if(!o.ask)return show(o.who||{},'ok');
 const pideCel=!!cita;
 m.innerHTML=`<form class="tk" role="dialog" aria-modal="true" aria-label="Tus datos"><h3>${esc(o.t)}</h3>${cita?`<div class="tcita" style="margin:8px 0"><span>Tu cita</span><b>${esc(cita.dia)}</b><b>${esc(cita.horaTxt)}</b></div>`:''}<label for="tn" style="margin-top:6px">Tu nombre</label><input id="tn" required autocomplete="name">${pideCel?'<label for="tcel">Celular (para confirmarte la cita)</label><input id="tcel" inputmode="tel" autocomplete="tel" placeholder="3001234567" required>':''}${o.ask==='full'?'<label for="tpl">Placa o vehículo (opcional)</label><input id="tpl" placeholder="Ej: ABC123">':''}<p id="terr" class="miss" hidden style="margin-top:12px"></p><div class="cta" style="margin:18px 0 0"><button class="btn red" type="submit" id="tgo">${cita?'Agendar y generar comprobante':'Generar comprobante'}</button><button class="chip" type="button" id="tx">Cancelar</button></div></form>`;
 $('#tx').onclick=close;m.onclick=e=>{if(e.target===m)close()};$('#tn').focus();
 const err=t=>{const e=$('#terr');e.textContent=t;e.hidden=!t};
 m.querySelector('form').onsubmit=async e=>{e.preventDefault();err('');
  const who={nombre:$('#tn').value.trim(),placa:$('#tpl')?$('#tpl').value.trim().toUpperCase():'',celular:$('#tcel')?$('#tcel').value.replace(/\D/g,''):''};
  if(!cita)return show(who,'ok');
  if(who.nombre.length<3)return err('Escribe tu nombre completo.');
  if(!/^3\d{9}$/.test(who.celular))return err('Escribe un celular colombiano de 10 dígitos que empiece por 3.');
  const b=$('#tgo');b.disabled=true;b.textContent='Agendando…';
  const r=await JRG.agendar({fecha:cita.fecha,hora:cita.hora,dur:cita.dur,nombre:who.nombre,celular:who.celular,placa:who.placa,servicio:srv||o.t,detalle:o.lines.join(' | ').slice(0,400),web:''});
  if(r&&r.ok)return show(who,'ok');
  if(r&&r.error==='horario_ocupado'){b.disabled=false;b.textContent='Elegir otro horario';err('Ese horario se acaba de ocupar. Elige otro en el calendario.');b.type='button';b.onclick=()=>{close();if(o.agenda)o.agenda.recargar()};return}
  if(r&&r.error==='ocupado'){b.disabled=false;b.textContent='Agendar y generar comprobante';return err('Hay muchas solicitudes en este momento. Intenta de nuevo en un minuto.')}
  show(who,'pendiente')}}

/* ---------- Navegación interna: cada pestaña es una vista de esta misma página ---------- */
function go(v,p,h){p=p||{};if(!$('#v-'+v))v='inicio';document.title=({cotizar:'Cotizar cambio de aceite',liquidos:'Cambio de líquidos: frenos, valvulina, refrigerante e hidráulico',productos:'Productos',nosotros:'Quiénes somos',contacto:'Contacto',registro:'Registrar mi vehículo',ingreso:'Ingreso al taller',datos:'Tratamiento de datos'}[v]||'Cambio de aceite y lubricación en Bogotá')+' | Multiservicios JRG';
 $$('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));
 $$('.mainnav .wrap>a,.mainnav .dd>a').forEach(x=>x.classList.toggle('on',(x.dataset.go||'').split('?')[0]===v));
 if(v==='productos'&&window.shopSet)shopSet(p);
 if(v==='qr'&&window.qrIniciar)qrIniciar();
 if(v==='ingreso'&&window.ingresoIniciar)ingresoIniciar();
 if(v==='contacto'&&p.servicio&&window.setServicio)setServicio(p.servicio);
 $('#drawer').classList.remove('on');
 try{if(h!=='pop'){const st={v:v,p:p};if(h==='replace'||(history.state&&history.state.v===v&&location.hash==='#'+v))history.replaceState(st,'','#'+v);else history.pushState(st,'','#'+v)}}catch(e){}
 const t=p.to&&document.getElementById(p.to);if(t&&t.scrollIntoView)t.scrollIntoView();else scrollTo(0,0)}
/* Botón «atrás» del celular y del navegador: vuelve a la vista anterior en vez de salir de la página */
window.addEventListener('popstate',e=>{const s=e.state;let h='';try{h=(location.hash||'').slice(1)}catch(x){}go(s&&s.v?s.v:(h||'inicio'),s&&s.p?s.p:{},'pop')});
function goEl(t){const[v,q]=t.dataset.go.split('?');go(v,Object.fromEntries(new URLSearchParams(q||'')))}
document.addEventListener('click',e=>{const t=e.target.closest('[data-go]');if(!t)return;e.preventDefault();goEl(t)});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('a[data-go]')){e.preventDefault();goEl(e.target)}});
$('.search').onsubmit=e=>{e.preventDefault();go('productos',{q:$('.search input').value.trim()})};

/* ---------- Buscador de la cabecera con sugerencias en vivo ---------- */
(function(){const f=$('.search'),inp=$('.search input'),box=document.createElement('div');box.className='sug';f.append(box);
 const hide=()=>box.classList.remove('on');
 function show(){const q=nz(inp.value.trim());if(q.length<2)return hide();const ws=q.split(/\s+/);
  const l=P.filter(p=>ws.every(w=>nz(p.n+' '+p.b+' '+p.s+' '+p.v).includes(w)));
  box.innerHTML=l.length?l.slice(0,8).map(p=>`<button type="button" data-sg="${p.id}"><span>${esc(p.n)}<small>${esc(p.b)}${p.d?' · '+esc(p.d):''}</small></span><b>${money(pr(p.p))}</b></button>`).join('')+`<button type="button" class="all" data-all>Ver los ${l.length.toLocaleString('es-CO')} resultados en la tienda</button>`:'<em>No encontramos nada con esa búsqueda.</em>';
  box.classList.add('on')}
 inp.addEventListener('input',show);inp.addEventListener('focus',show);
 box.addEventListener('mousedown',e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();hide();
  if(b.dataset.sg){const p=P[b.dataset.sg];inp.value=p.n;go('productos',{q:p.n})}else go('productos',{q:inp.value.trim()})});
 inp.addEventListener('blur',()=>setTimeout(hide,150));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()})})();
