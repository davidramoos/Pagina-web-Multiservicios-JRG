(function(){
const $v=id=>$('#'+id).value.trim(),low=s=>s.toLowerCase();
const vehKey=()=>Object.keys(VEH).find(k=>low(k)===low($v('marca')));
const modKey=k=>k&&Object.keys(VEH[k]).find(m=>low(m)===low($v('modelo')));
const NU=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
const RX=w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
/* ---------- vehículo: marca y modelo con sugerencias ---------- */
function combo(inp,opts){const box=document.createElement('div');box.className='cb';inp.parentNode.style.position='relative';inp.parentNode.append(box);
 const draw=()=>{const q=low(inp.value.trim()),l=opts().filter(o=>low(o).includes(q));box.innerHTML=l.map(o=>`<button type="button">${esc(o)}</button>`).join('')||'<em>Sin resultados. Revisa cómo está escrito.</em>';box.classList.add('on')};
 inp.addEventListener('focus',draw);inp.addEventListener('input',()=>{draw();onVeh()});
 box.onmousedown=e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();inp.value=b.textContent;box.classList.remove('on');if(inp.id==='marca')$('#modelo').value='';onVeh()};
 inp.addEventListener('blur',()=>setTimeout(()=>box.classList.remove('on'),120))}
combo($('#marca'),()=>Object.keys(VEH).sort((x,y)=>isMoto(x)-isMoto(y)||x.localeCompare(y,'es')));
combo($('#modelo'),()=>{const k=vehKey();return k?Object.keys(VEH[k]):[]});
/* ---------- familias de aceite: misma referencia en cuarto y en galón ---------- */
const famKey=p=>NU(p.b+' '+p.n).replace(/(\d)O\b/g,'$10').replace(/(^| )(CUARTO|CUARTOS|CTO|GALON|GALONES|GLN|GL|1\/4|LITRO|LTS|LT|3\.78|PINTA|PINTAS|VALVULINA|TRANSMISION|DIFERENCIAL|PRESENTACION|NUEVA)(?= |$)/g,' ').replace(/\b\d+(?:[.,]\d+)? ?(LITROS?|LTS?|L)\b/g,' ').replace(/(\d)\/4\b/g,'$1').replace(/[^A-Z0-9]+/g,' ').replace(/(^| )(SAE|API|SN|SP|SL|SM|SJ|CK|CK4|DEXOS|RENAULT|CHEVROLET|GM|MINERAL|SINTETICO|SEMISINTETICO)(?= |$)/g,' ').replace(/(\d{1,2}W) (\d{2,3})/g,'$1$2').replace(/(^| )MX(?= ?\d)/g,' ').replace(/\bMX(\d)/g,'$1').replace(/(^| )A(?= \d)/g,' ').replace(/(\d)\b 1$/,'$1').trim().split(/ +/).sort().join(' ')
const FAM={};QOILS.concat(VOILS).forEach(p=>{const k=famKey(p),t=p.Lq<2?'c':'g';(FAM[k]=FAM[k]||{})[t]=FAM[k][t]||p});
function costoAceite(sel,cu,mode){const f=FAM[famKey(sel)]||{},C=f.c,G=f.g;let txt,costo,gal=0,rem=cu;
 if(C&&G&&mode!=='cuartos'){gal=Math.floor(cu/4+1e-9);rem=cu-gal*4;costo=gal*G.p+rem*C.p;txt=[gal&&gal+(gal===1?' galón':' galones'),rem&&rem+(rem===1?' cuarto':' cuartos')].filter(Boolean).join(' + ')}
 else if(C){costo=cu*C.p;txt=cu+(cu===1?' cuarto':' cuartos')}
 else{costo=cu*G.p/4;txt=cu+(cu===1?' cuarto':' cuartos')+' (de galón: '+money(G.p/4)+' cada cuarto)'}
 return{costo,txt}}
/* ---------- aceites: marca, viscosidad y buscador; lista completa ---------- */
let selOil=null,lastType=null,svc='aceite',PRES='mix',fuel='g',motor=null;
const moto=()=>isMoto(vehKey());
const oilPool=()=>{const k=vehKey();
 if(svc==='valv')return VOILS.filter(o=>!/HIDRAUL|HYDRAUL/i.test(o.n)&&(!k||/SCOOTER|MOTO/i.test(o.n)===isMoto(k)));
 return QOILS.filter(o=>!k||(o.c==='am')===isMoto(k))};
const NOUN=()=>svc==='valv'?'valvulina':'aceite';
function oilControls(){const pool=oilPool(),ob=$('#obrand'),ov=$('#ovis'),cb=ob.value,cv=ov.value;
 const bs=[...new Set(pool.map(o=>o.b))].sort((a,b)=>a.localeCompare(b,'es'));
 ob.innerHTML='<option value="">Todas las marcas de '+NOUN()+' ('+pool.length+')</option>'+bs.map(b=>`<option value="${esc(b)}">${esc(b)} (${pool.filter(o=>o.b===b).length})</option>`).join('');
 const vs=[...new Set(pool.map(o=>o.x).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es',{numeric:true}));
 ov.innerHTML='<option value="">Toda viscosidad</option>'+vs.map(v=>`<option>${esc(v)}</option>`).join('');
 if(bs.includes(cb))ob.value=cb;if(vs.includes(cv))ov.value=cv}
function drawOils(){const b=$('#obrand').value,v=$('#ovis').value,q=NU($('#oq').value.trim()),ws=q?q.split(/\s+/):[];
 const l=oilPool().filter(o=>(!b||o.b===b)&&(!v||o.x===v)&&ws.every(w=>NU(o.n+' '+o.b).includes(w)));
 $('#ocount').textContent=l.length+(svc==='valv'?(l.length===1?' valvulina':' valvulinas'):(l.length===1?' aceite':' aceites'))+(b?' de '+b:'')+(isMoto(vehKey())?' para moto':(vehKey()?(svc==='valv'?' para caja o diferencial':' para carro'):''));
 $('#oils').innerHTML=l.length?l.map(o=>`<button type="button" class="oil${selOil&&selOil.id===o.id?' sel':''}" data-id="${o.id}"><span>${esc(o.n)}<small>${o.inf?'Presentación estimada: '+(o.Lq<2?'cuarto':'galón')+' · ':(o.pr?o.pr+' · ':'')}${(()=>{const f=FAM[famKey(o)]||{};return f.c&&f.g?'Cuarto y galón · ':''})()}${o.st?'Disponible':'Consultar disponibilidad'}${/GRANEL/i.test(o.n)?' · <em class="gnote">el valor del cambio puede presentar variaciones</em>':''}</small></span><b>${money(o.p)}</b></button>`).join(''):'<p class="empty" style="padding:14px">No hay aceites con ese filtro. Prueba con otra marca o busca otro nombre.</p>'}
$('#oils').onclick=e=>{const b=e.target.closest('.oil');if(!b)return;selOil=P[b.dataset.id];PRES='mix';drawOils();drawPres();calc()};
function drawPres(){const box=$('#pres');if(!selOil){box.innerHTML='';return}const f=FAM[famKey(selOil)]||{};
 if(!(f.c&&f.g)){box.innerHTML=f.g&&!f.c?'<p class="hint">Este '+NOUN()+' solo está en galón: el cuarto se calcula como 1/4 del galón.</p>':'';return}
 const ch=(v,t)=>`<button type="button" class="chip${PRES===v?' on':''}" data-pres="${v}">${t}</button>`;
 box.innerHTML=`<label style="margin-top:14px">¿Cómo lo quieres? <small style="font-weight:400">(cuarto ${money(f.c.p)} · galón ${money(f.g.p)})</small></label><div class="chips" style="margin:6px 0 0">${ch('mix','Galón + cuartos (más económico)')}${ch('cuartos','Solo en cuartos')}</div>`}
$('#pres').onclick=e=>{const b=e.target.closest('[data-pres]');if(!b)return;PRES=b.dataset.pres;drawPres();calc()};
/* ---------- servicio: aceite de motor o valvulina ---------- */
function drawSvc(){const ch=(v,t)=>`<button type="button" class="chip${svc===v?' on':''}" data-svc="${v}">${t}</button>`;
 $('#vsvc').innerHTML=`<label style="margin-top:14px">¿Qué quieres cambiar?</label><div class="chips" style="margin:6px 0 0">${ch('aceite','Aceite de motor')}<button type="button" class="chip" data-go="liquidos?to=l-valv">Valvulina (caja / diferencial) →</button></div>`;
 const v=svc==='valv';$('#lcant').textContent=v?'Cantidad de valvulina (en cuartos)':'Cantidad de aceite (en cuartos)';
 $('#h2').textContent=v?'2. Tu valvulina':'2. Tu aceite';$('#h3f').hidden=v;if($('#h4a'))$('#h4a').firstChild.textContent=v?'3. Agenda tu cambio ':'4. Agenda tu cambio ';$('#fbox').hidden=v;$('#oq').placeholder=v?'Buscar valvulina: 80W90, Terpel…':'Buscar aceite: 20W50, Castrol…';
 $('#cnote').textContent=v?'Cantidad aproximada para caja o diferencial; ajústala según tu vehículo. Confirmamos al revisarlo.':'Ejemplo: 5 cuartos = 1 galón + 1 cuarto. Puedes cambiarla si tu vehículo lleva otra cantidad.'}
$('#vsvc').onclick=e=>{const b=e.target.closest('[data-svc]');if(!b||b.dataset.svc===svc)return;svc=b.dataset.svc;selOil=null;PRES='mix';lastType=null;drawSvc();setCant(true);onVeh();drawPres()};
function drawMot(){const k=vehKey(),m=modKey(k),box=$('#vmot'),v=k&&m&&svc!=='valv'&&MOT[k+'|'+m];
 if(!v){box.innerHTML='';return}
 box.innerHTML=`<label style="margin-top:14px">Motor / cilindrada <small style="font-weight:400">(cambia la cantidad de aceite)</small></label><div class="chips" style="margin:6px 0 0">${v.map((x,i)=>`<button type="button" class="chip${motor===x?' on':''}" data-mot="${i}">${esc(x.n)} · ${x.q} cuartos</button>`).join('')}<button type="button" class="chip${motor===null?' on':''}" data-mot="-1">No sé / otro</button></div>`+(motor?'':'<p class="hint">Elige tu motor para una cantidad más exacta. Si no sabes cuál es, usamos un valor típico y lo confirmamos al revisar tu vehículo.</p>')}
$('#vmot').onclick=e=>{const b=e.target.closest('[data-mot]');if(!b)return;const k=vehKey(),m=modKey(k),i=+b.dataset.mot;motor=i<0?null:MOT[k+'|'+m][i];
 if(motor)$('#cant').value=motor.q;else setCant();drawMot();calc()};
function setCant(force){const k=vehKey(),m=modKey(k);if(!(k&&m))return;const R=REFV[k+'|'+m];
 if(svc!=='valv')$('#cnote').textContent=R&&R.cu?'En el taller este modelo lleva normalmente '+R.cu+' cuartos ('+R.v+' vehículos registrados). Puedes cambiarla.':'Ejemplo: 5 cuartos = 1 galón + 1 cuarto. Puedes cambiarla si tu vehículo lleva otra cantidad.';
 if(svc==='valv'){const c=claseDe(k,m);$('#cant').value=c==='moto'?0.5:c==='carro'?2:c==='camioneta'?4:6}else $('#cant').value=(R&&R.cu)||VEH[k][m]}
$('#obrand').onchange=drawOils;$('#ovis').onchange=drawOils;$('#oq').oninput=drawOils;
/* ---------- filtros compatibles con el vehículo ---------- */
const rx2=w=>RX(w).replace(/-/g,'[\\s\\-]*');
function vehRx(k,m){m=m.replace(/\s*\([^)]*\)/g,'');const w=NU(m).split(/\s+/).filter(Boolean),R=[w.map(rx2).join('[\\s\\-\\.]*')];
 if(w.length>1&&/^(GT|PRO|RS|HD)$/.test(w[w.length-1]))R.push(rx2(w[0]));
 if(w.length>1&&/^I\d+$/.test(w[w.length-1]))R.push(RX(w[w.length-1]));
 if(/D-?MAX/.test(NU(m)))R.push('D[\\s\\-]*MAX','DIMAX','DMAX');
 const last=w[w.length-1];if(w.length>1&&/^\d{1,2}$/.test(last))R.push(RX(w[0])+'[\\s\\-]*(?:\\d[\\s\\-,Y/]*)*'+last+'(?![0-9])');
 return new RegExp('(^|[^A-Z])(?:'+R.join('|')+')($|[^A-Z0-9])')}
/* Combustible: los diésel (camionetas y camiones) llevan DOS filtros: el del motor y el de la trampa de agua */
const isTrap=p=>/TRAMPA|SEPARADOR|VASO|BOWL/i.test(p.n);
const sq=s=>NU(s).replace(/[^A-Z0-9]/g,'');
const CUR=[[/D-?MAX/i,{fc:['DFJ208','A4053'],ft:['A7533C']}]];/* referencias dadas por el taller; agrega aquí más vehículos */
const curFor=(k,m)=>{const r=CUR.find(c=>c[0].test(k+' '+m));return r?r[1]:null};
const diesel=()=>fuel==='d'&&(cls==='camioneta'||cls==='camion');
const FT=[['fi','Filtro de aceite','cambio completo',p=>p.c==='fi'&&(/moto/i.test(p.s)===moto())],
 ['fa','Filtro de aire del motor','cambio completo',p=>p.c==='fa'&&(moto()?/moto/i.test(p.s):p.s==='Aire motor')],
 ['cab','Filtro de aire acondicionado (cabina)','',p=>p.c==='fa'&&p.s==='Aire acondicionado'],
 ['fc','Filtro de combustible','',p=>p.c==='fc'&&!(diesel()&&isTrap(p))],
 ['ft','Filtro de trampa de agua (diésel)','',p=>p.c==='fc'&&isTrap(p)]];
const FTLABEL=id=>id==='fc'&&diesel()?'Filtro de combustible del motor (diésel)':FT.find(d=>d[0]===id)[1];
let FSEL={},vkey='';
const FBP=(id,mt)=>id==='fi'?(mt?FILTRO.moto:FILTRO.carro):id==='fa'?(mt?FILTRO.aireMoto:FILTRO.aireCarro):id==='fc'?(diesel()?FILTRO.fcDiesel:FILTRO.fcGas):id==='ft'?FILTRO.fcTrampa:0;
const ptok=p=>p._t||(p._t=NU(p.n).split(/[^A-Z0-9]+/).filter(Boolean));
const tokHit=(p,toks)=>toks.length&&ptok(p).some(t=>toks.some(x=>t===x||(t.length>x.length&&t.endsWith(x)&&/^[A-Z]{1,4}$/.test(t.slice(0,t.length-x.length)))||(x.length>t.length&&x.endsWith(t)&&/^[A-Z]{1,4}$/.test(x.slice(0,x.length-t.length)))));
const recToks=(id,k,m)=>{const r=REFV[k+'|'+m];return r&&(id==='fi'||id==='fa'||id==='fc'||id==='ft')?(r[id==='ft'?'fc':id]||[]):[]};
function compat(def,k,m){const rx=vehRx(k,m),brx=new RegExp('(^|[^A-Z])(?:'+NU(k).split(/\s+/).filter(Boolean).map(rx2).join('[\\s\\-]*')+')($|[^A-Z0-9])'),id=def[0],cur=diesel()?curFor(k,m):null,tk=cur&&cur[id],rt=recToks(id,k,m);
 const hit=p=>tk&&tk.some(t=>sq(p.n).includes(t)),trapHit=p=>cur&&cur.ft&&cur.ft.some(t=>sq(p.n).includes(t)),gas=p=>p.s==='Gasolina'||/GASOLINA/i.test(p.n);
 /* los códigos del taller de 1 a 4 dígitos (p. ej. «2006») también son años: solo valen si el nombre menciona el modelo o la marca */
 const rtL=rt.filter(t=>!/^\d{1,4}$/.test(t)),rtS=rt.filter(t=>/^\d{1,4}$/.test(t)),mm=p=>rx.test(NU(p.n)),bm=p=>brx.test(NU(p.n));
 const rec=p=>def[3](p)&&(tokHit(p,rtL)||(tokHit(p,rtS)&&(mm(p)||bm(p))));
 let l=P.filter(p=>p.c==='fc'&&(id==='fc'||id==='ft')&&diesel()?(!gas(p)&&(id==='ft'||!trapHit(p))&&(hit(p)||rec(p)||(def[3](p)&&(mm(p)||(id==='ft'&&bm(p)))))):(def[3](p)&&(mm(p)||rec(p))));
 /* camiones y camionetas diésel sin referencia propia del modelo: se ofrecen las de la marca */
 if(!l.length&&diesel()&&id!=='cab')l=P.filter(p=>def[3](p)&&bm(p)&&!(id==='fc'&&gas(p)));
 l.forEach(p=>{p._rec=!!(hit(p)||rec(p));p._mm=mm(p)?1:0});
 return l.sort((a,b)=>(b._rec-a._rec)||b.st-a.st||(b._mm-a._mm)||a.p-b.p)}
function drawFilters(){const k=vehKey(),m=modKey(k),box=$('#fbox');
 if(!k||!m){box.innerHTML='<p class="hint">Elige primero la marca y el modelo de tu vehículo para ver solo los filtros que le sirven.</p>';return}
 const mt=isMoto(k);let h='';
 FT.forEach(def=>{const [id,tag0,tag]=def,label=FTLABEL(id);if(mt&&(id==='cab'||id==='fc'||id==='ft')||id==='ft'&&!diesel())return;
  const ops=compat(def,k,m),on=FSEL[id]?FSEL[id].on:(id==='fi'||id==='fa'),n=FSEL[id]?FSEL[id].n:1,vv=FSEL[id]?FSEL[id].v:[];FSEL[id]={on,ops,n,v:vv};const multi=id!=='cab';
  const by={};ops.forEach(p=>(by[p.b]=by[p.b]||[]).push(p));
  const opts=cur=>Object.keys(by).sort((a,b)=>(a==='Otras marcas')-(b==='Otras marcas')||a.localeCompare(b,'es')).map(b=>`<optgroup label="${b==='Otras marcas'?'Otras referencias':esc(b)}">${by[b].map(p=>`<option value="${p.id}"${String(p.id)===String(cur)?' selected':''}>${p._rec?'★ ':''}${esc(p.n)} · ${money(p.p)}${p.st?'':' · consultar'}</option>`).join('')}</optgroup>`).join('');
  const sels=Array.from({length:on&&multi?n:1},(_,i)=>`${n>1&&on?`<span class="fqn">${label} ${i+1} de ${n}</span>`:''}<select data-fs="${id}" data-i="${i}" aria-label="${label}${n>1&&on?' '+(i+1)+' de '+n:''}">${opts(vv[i]!=null?vv[i]:vv[0])}</select>`).join('');
  const sel=ops.length?sels+`<small>${ops.length} ${ops.length===1?'opción compatible':'opciones compatibles'}${ops.some(p=>p._rec)?' · ★ = referencia que el taller ya usó en '+((REFV[k+'|'+m]||{}).v||'varios')+' vehículos de este modelo':''}</small>`:`<p class="hint">${FBP(id,mt)?`No encontramos un ${label.toLowerCase()} registrado para tu ${esc(k)} ${esc(m)}. Usamos un valor promedio (${money(FBP(id,mt))}) y confirmamos la referencia exacta en el local.`:'No hay filtros de este tipo registrados para tu vehículo.'}</p>`;
  const qty=on&&multi&&(ops.length||FBP(id,mt))?`<label class="fq">Cantidad <select data-fq="${id}" aria-label="¿Cuántos ${label.toLowerCase()} lleva?">${[1,2,3].map(x=>`<option${x===n?' selected':''}>${x}</option>`).join('')}</select></label>`:'';
  h+=`<div class="fb"><div class="fh"><label class="check" style="margin-top:0"><input type="checkbox" data-ft="${id}"${on?' checked':''}${!ops.length&&!FBP(id,mt)?' disabled':''}> ${label}${tag?` <em>(incluido en el ${tag})</em>`:''}</label>${qty}</div>${sel}</div>`});
 if(diesel())h='<p class="hint" style="margin:0 0 8px">Las camionetas y camiones diésel llevan normalmente <b>dos filtros de combustible</b>: el del motor y el de la trampa de agua. Si el tuyo lleva más de uno del mismo tipo (o dos filtros de aire o de aceite), marca el filtro y cambia <b>Cantidad</b>.</p>'+h;
 box.innerHTML=h}
$('#cant').oninput=()=>calc();
$('#fbox').onchange=e=>{const t=e.target.dataset.ft,q=e.target.dataset.fq,f=e.target.dataset.fs;
 if(t){FSEL[t].on=e.target.checked;drawFilters()}
 else if(q){FSEL[q].n=+e.target.value;drawFilters()}
 else if(f){const v=FSEL[f].v;document.querySelectorAll('[data-fs="'+f+'"]').forEach((el,i)=>v[i]=el.value)}
 calc()};
/* ---------- tipo de vehículo y beneficio de fidelidad (solo en la cotización) ---------- */
let cls='',clsFor='';
const BENEF={carro:'En carros y taxis, por cada 5 cambios el sexto paga la mitad.',camioneta:'En camionetas, por cada 6 cambios el séptimo paga la mitad.',camion:'En camiones, por cada 6 cambios el séptimo paga la mitad. Se obsequia el engrase.'};
const BEN=()=>cls?BENEF[cls]:'';
function drawCls(){const k=vehKey(),m=modKey(k),box=$('#vcls');
 if(!k||!m||isMoto(k)){box.innerHTML='';cls='';clsFor='';return}
 if(clsFor!==k+'|'+m){clsFor=k+'|'+m;cls=claseDe(k,m);fuel=esDiesel(k,m)?'d':'g'}
 const ch=(v,t)=>`<button type="button" class="chip${cls===v?' on':''}" data-cls="${v}">${t}</button>`;
 box.innerHTML=`<label style="margin-top:14px">Tipo de vehículo</label><div class="chips" style="margin:6px 0 0">${ch('carro','Carro o taxi')}${ch('camioneta','Camioneta')}${ch('camion','Camión')}</div>`+(cls==='camioneta'||cls==='camion'?`<label style="margin-top:14px">Combustible del motor</label><div class="chips" style="margin:6px 0 0"><button type="button" class="chip${fuel==='d'?' on':''}" data-fuel="d">Diésel</button><button type="button" class="chip${fuel==='g'?' on':''}" data-fuel="g">Gasolina</button></div>`:'')}
$('#vcls').onclick=e=>{const f=e.target.closest('[data-fuel]'),b=e.target.closest('[data-cls]');
 if(f){fuel=f.dataset.fuel}else if(b){cls=b.dataset.cls;if(cls==='carro')fuel='g';else if(cls==='camion')fuel='d'}else return;
 FSEL={};drawCls();drawFilters();calc()};
function drawBenef(){const b=$('#benef');if(!cls||svc==='valv'){b.hidden=true;return}b.hidden=false;
 b.innerHTML=cls==='camion'?'<b>Camiones:</b> por cada 6 cambios el séptimo paga la mitad.<br><b>¡Se obsequia el engrase!</b>':cls==='camioneta'?'<b>Camionetas:</b> por cada 6 cambios el séptimo paga la mitad.':'<b>Carros y taxis:</b> por cada 5 cambios el sexto paga la mitad.'}
/* ---------- cálculo ---------- */
let Q=null;
function onVeh(){const k=vehKey(),m=modKey(k);drawCls();if(k&&m&&vkey!==k+'|'+m)setCant();const key=(k||'')+'|'+(m||''),type=k?(isMoto(k)?'m':'c'):'';
 if(type!==lastType){lastType=type;oilControls();if(selOil&&!oilPool().includes(selOil))selOil=null;drawOils();drawPres()}
 if(key!==vkey){vkey=key;FSEL={};motor=null;drawFilters()}drawMot();if(!selOil)drawPres();calc()}
function calc(){const k=vehKey(),m=modKey(k),dl=$('#sumdl'),msg=[];drawBenef();
 if($v('marca')&&!k)msg.push('No encontramos esa marca. Elígela de la lista.');
 else if(k&&$v('modelo')&&!m)msg.push('No encontramos ese modelo en '+k+'. Elígelo de la lista.');
 $('#err').innerHTML=msg.map(x=>`<p>${x}</p>`).join('');Q=null;
 if(!(k&&m&&selOil&&!msg.length)){dl.innerHTML=`<dt>Vehículo</dt><dd>${k&&m?k+' '+m:'Elige marca y modelo'}</dd><dt>Aceite</dt><dd>${selOil?esc(selOil.n):'Elige un aceite'}</dd>`;$('#tot').textContent='$0';$('#sendQ').disabled=true;agSync();return}
 const cu=Math.max(0.5,parseFloat($('#cant').value)||(svc==='valv'?2:VEH[k][m])),mt=isMoto(k),oil=selOil,co=costoAceite(oil,cu,PRES),ac=co.costo,lines=[],valv=svc==='valv';let fsum=0,fi=false,fav=false;
 if(!valv)FT.forEach(([id])=>{const label=FTLABEL(id),s=FSEL[id];if(!s||!s.on)return;
  const n0=lines.length,els=[...document.querySelectorAll('[data-fs="'+id+'"]')],cnt=s.ops.length?els.length:(s.n||1);
  for(let i=0;i<cnt;i++){let name,price;const lab=cnt>1?label+' '+(i+1)+' de '+cnt:label;
   if(s.ops.length&&els[i]){const p=P[els[i].value];name=p.n;price=p.p}else if(FBP(id,mt)){name=label+' (valor promedio, se confirma la referencia)';price=FBP(id,mt)}else continue;
   fsum+=price;lines.push([lab,name,price])}
  if(lines.length>n0){if(id==='fi')fi=true;if(id==='fa')fav=true}});
 const total=ac+fsum;
 const completo=!valv&&fi&&fav;Q={k,m,oil,cu,txt:co.txt,ac,lines,fi,fav,completo,total,valv};
 const kmN=(()=>{if(valv||!window.JRGKm)return'';const t=oil.n+' '+(oil.x||''),i=JRGKm.inc(t);return i?'cada '+i.toLocaleString('es-CO')+' km ('+JRGKm.etiqueta(t)+')':''})(),gran=!valv&&/GRANEL/i.test(oil.n);
 dl.innerHTML=`<dt>Vehículo</dt><dd>${k} ${m}${motor&&!valv?' · '+esc(motor.n):''}</dd><dt>${valv?'Valvulina':'Aceite'}</dt><dd>${esc(oil.n)}</dd><dt>Necesitas</dt><dd>${cu} ${cu===1?'cuarto':'cuartos'}</dd><dt>Se arma con</dt><dd>${esc(co.txt)}${oil.inf?' (presentación estimada)':''}</dd><dt>${valv?'Valvulina':'Aceite'}</dt><dd>${money(ac)}</dd>${lines.map(l=>`<dt>${l[0]}</dt><dd>${money(l[2])}</dd>`).join('')}${kmN?`<dt>Próximo cambio</dt><dd>${kmN}</dd>`:''}<dt>Mano de obra</dt><dd>${completo?'<span class="free">¡GRATIS!</span>':'A confirmar'}</dd>`;
 $('#tot').textContent=money(total);
 $('#mono').textContent=valv?'La mano de obra del cambio de valvulina se confirma en el local y no está incluida en el total.':completo?'Cambio completo (aceite + filtro de aceite + filtro de aire): la mano de obra no tiene costo.':'La mano de obra es gratis con el cambio completo: aceite, filtro de aceite y filtro de aire. Si falta alguno, se confirma en el local y no está incluida en el total.';
 if(gran)$('#mono').textContent+=' Aceite a granel: el valor del cambio puede presentar variaciones.';
 $('#sendQ').disabled=false;agSync()}
/* Calendario de citas: la duración (y por eso los horarios) depende de lo que cotizó el cliente */
function durQ(){return !Q?JRGAgenda.DUR.aceite:Q.valv?JRGAgenda.DUR.valvulina:(Q.fi||Q.fav)?JRGAgenda.DUR.aceite_filtros:JRGAgenda.DUR.aceite}
function srvQ(){return !Q?'':Q.valv?'Cambio de valvulina':(Q.fi||Q.fav)?'Cambio de aceite con filtros':'Cambio de aceite (solo aceite)'}
var AG=null,lastDur=0;
function agSync(){if(!AG)return;const d=durQ();if(d!==lastDur){lastDur=d;AG.refrescar()}}
AG=JRGAgenda.crear($('#agQ'),{dur:durQ});lastDur=durQ();
$('#sendQ').onclick=()=>Q&&ticket({t:Q.valv?'Cotización de cambio de valvulina':'Cotización de cambio de aceite',lines:['Vehículo: '+Q.k+' '+Q.m+(motor&&!Q.valv?' ('+motor.n+')':''),(Q.valv?'Valvulina: ':'Aceite: ')+Q.oil.n+' ('+Q.cu+' cuartos = '+Q.txt+(Q.oil.inf?', presentación estimada':'')+')',...Q.lines.map(l=>l[0]+': '+l[1]+' ('+money(l[2])+')'),'Mano de obra: '+(Q.completo?'GRATIS (cambio completo)':'a confirmar en el local'),...(!Q.valv&&/GRANEL/i.test(Q.oil.n)?['Aceite a granel: el valor del cambio puede presentar variaciones']:[]),...(!Q.valv&&window.JRGKm&&JRGKm.inc(Q.oil.n+' '+(Q.oil.x||''))?['Próximo cambio: cada '+JRGKm.inc(Q.oil.n+' '+(Q.oil.x||'')).toLocaleString('es-CO')+' km ('+JRGKm.etiqueta(Q.oil.n+' '+(Q.oil.x||''))+')']:[]),...(BEN()&&!Q.valv?['Beneficio: '+BEN()]:[]),...(Q.oil.st?[]:['Aceite sin stock registrado: consultar disponibilidad'])],total:Q.total,ask:'full',cita:AG.valor(),servicio:srvQ(),agenda:AG});
/* ---------- opciones ---------- */
function modo(m){$$('.opt').forEach(o=>o.classList.toggle('sel',o.dataset.mode===m));$('#paneNuevo').hidden=m!=='nuevo';$('#paneCliente').hidden=m!=='cliente';(m==='nuevo'?$('#marca'):$('#placa')).focus();calc()}
$$('.opt').forEach(b=>b.onclick=()=>modo(b.dataset.mode));
/* ---------- búsqueda por placa (hoja de Google: solo se ve la placa consultada) ---------- */
const ERR={ocupado:'Hay muchas consultas en este momento. Intenta de nuevo en un minuto.',placa:'Revisa la placa: debe verse como ABC123 (carro) o ABC12D (moto).'};
const cuartosTxt=c=>{if(!c)return'—';const q=/^(\d+(?:[.,]\d+)?)\s*1\/4$/.exec(c);return esc(q?q[1]+' 1/4 cuartos':c+(/^[\d.,]+$/.test(c)?' cuartos':''))};
const tabla=r=>`<div class="tw"><table class="hist"><tr><th>Fecha</th><th>Aceite</th><th>Cantidad</th><th>Filtro de aire</th><th>Filtro de aceite</th><th>Filtro de combustible</th><th>Valor</th><th>Km</th><th>Próximo cambio</th></tr>${r.cambios.map(c=>`<tr><td>${esc(c.f)}</td><td>${esc(c.aceite||'—')}</td><td>${cuartosTxt(c.cant)}</td><td>${esc(c.fa||'—')}</td><td>${esc(c.fi||'—')}</td><td>${esc(c.fc||'—')}</td><td>${typeof c.valor==='number'?money(c.valor):esc(c.valor||'—')}</td><td>${esc(c.km||'—')}</td><td>${esc(c.prox||'—')}</td></tr>`).join('')}</table></div>`;
let CEL='';                                           // celular confirmado en esta consulta (solo vive en memoria, no se guarda)
const VERIF_MSG={no:'Ese celular no coincide con el registrado para esta placa.',bloq:'Demasiados intentos con esta placa. Intenta de nuevo en una hora o escríbenos por WhatsApp.',sin:'Esta placa no tiene un celular registrado; regístrala con el formulario para poder confirmarla.'};
const contactoHTML=r=>{const c=r.contacto;if(!c)return'';const l=[c.nombre&&['Propietario',c.nombre],c.celular&&['Celular',c.celular],['Correo',c.correo||'sin correo registrado']].filter(Boolean);
 const lista=`<span>${l.map(x=>x[0]+': <i>'+esc(x[1])+'</i>').join(' · ')}</span>`;
 if(r.verificado)return`<div class="datosreg"><b>Datos registrados con esta placa</b>${lista}<small>✔ Confirmaste tu celular, por eso ves tus datos completos.</small></div>${otrosHTML(r)}`;
 return`<div class="datosreg"><b>Datos registrados con esta placa</b>${lista}<small>Por seguridad el celular, el correo y el apellido salen parcialmente ocultos. ¿Eres el dueño? Escribe tu celular para ver tus datos completos y todos tus vehículos.</small>
 <form id="vF" class="vf"><input id="vC" inputmode="tel" autocomplete="tel" placeholder="Celular con el que registraste (3001234567)" aria-label="Celular registrado"><button class="btn blue" type="submit" id="vB">Ver mis datos</button></form><p class="hint err" id="vX" ${r.verif&&r.verif!=='ok'?'':'hidden'}>${esc(VERIF_MSG[r.verif]||'')}</p></div>`};
const otrosHTML=r=>{const o=r.otros||[];return`<div class="otros"><b>${o.length?'Tus otros vehículos':'Este es el único vehículo registrado con tu celular'}</b>${o.length?'<div class="chips">'+o.map(x=>`<button type="button" class="chip" data-pl="${esc(x.placa)}">${esc(x.placa)}${x.vehiculo?' · '+esc(x.vehiculo):''}</button>`).join('')+'</div>':''}</div>`};
function contactoOn(p){const f=$('#vF');if(f)f.onsubmit=e=>{e.preventDefault();const c=$('#vC').value.replace(/\D/g,'');if(!/^3\d{9}$/.test(c)){const x=$('#vX');x.textContent='Escribe el celular de 10 dígitos (empieza por 3).';x.hidden=false;return}$('#vB').disabled=true;buscar(p,c)};
 $$('#phist .otros .chip').forEach(b=>b.onclick=()=>buscar(b.dataset.pl,CEL))}
function ciclo(r){const u=r.cambios[0],t=String(u.total||'').toUpperCase(),m=/(\d+)\s*DE\s*(\d+)/.exec(t);let n=m?+m[1]:parseInt(t,10),per=m?+m[2]:(/CAMION|CAMIONETA|VOLQUETA|FOTON|NHR|NKR|LUV|DMAX|D-MAX|HILUX|FRONTIER|RANGER|L200|BT-?50|TFR|KODIAC|FORD 600/i.test(r.vehiculo)?7:6);
 if(/PULSAR|AKT|YAMAHA|HONDA CB|MOTO|BOXER|APACHE|FZ|NMAX|GIXXER|DOMINAR/i.test(r.vehiculo))return'';
 if(!n)n=r.cambios.length;if(n>=per)return'<p class="hint" style="margin-top:10px"><b>Beneficio:</b> completaste tu ciclo de '+per+' cambios; el siguiente empieza uno nuevo.</p>';
 const falta=per-n;return`<p class="hint" style="margin-top:10px"><b>Beneficio:</b> ${falta===1?'¡tu próximo cambio paga la mitad!':'te faltan '+falta+' cambios para que uno pague la mitad.'}</p>`}
function prefill(v){const V=NU(v);const k=Object.keys(VEH).find(b=>V.includes(NU(b.replace(/\s*\(moto\)/,''))));if(!k)return null;const m=Object.keys(VEH[k]).filter(x=>V.includes(NU(x.replace(/\s*\([^)]*\)/,'')))).sort((p,q)=>q.length-p.length)[0];return m?[k,m]:[k,'']}
/* ---------- tarjeta de cambio virtual ---------- */
const MESES_ES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
function parseF(t){const a=window.JRGKm?JRGKm.fechas(t):[];return a.length?a[0]:null}   // acepta 25/10/2026, 25-10-26 y 2026-10-25
const fmtF=d=>d.getDate()+' '+MESES_ES[d.getMonth()]+' '+d.getFullYear();
const addMes=(d,n)=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setMonth(x.getMonth()+n);return x};
const pad2=n=>String(n).padStart(2,'0'),ymd=d=>d.getFullYear()+pad2(d.getMonth()+1)+pad2(d.getDate());
function icsDe(placa,veh,d){const e=addMes(d,0);e.setDate(e.getDate()+1);
 const al=t=>'BEGIN:VALARM\r\nTRIGGER:'+t+'\r\nACTION:DISPLAY\r\nDESCRIPTION:Cambio de aceite '+placa+'\r\nEND:VALARM\r\n';
 return 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Multiservicios JRG//ES\r\nBEGIN:VEVENT\r\nUID:'+placa+'-'+ymd(d)+'@jrg\r\nDTSTAMP:'+ymd(new Date())+'T120000Z\r\nDTSTART;VALUE=DATE:'+ymd(d)+'\r\nDTEND;VALUE=DATE:'+ymd(e)+'\r\nSUMMARY:Cambio de aceite '+placa+' - Multiservicios JRG\r\nDESCRIPTION:Toca cambiar el aceite de tu '+veh.replace(/[,;\n]/g,' ')+'. Cotiza en la página de Multiservicios JRG.\r\n'+al('-P7D')+al('-P1D')+'END:VEVENT\r\nEND:VCALENDAR\r\n'}
function tarjeta(r,p){const u=r.cambios[0],f=parseF(u.f);if(!f)return'';
 const px=window.JRGKm?JRGKm.proximo(u):null,km=px&&px.modo==='km',hoy=new Date(),h0=new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate()),
  a=px&&px.desde||addMes(f,3),b=px&&px.hasta||a,dias=Math.round((a-h0)/864e5),dp=Math.round((h0-b)/864e5),tot=Math.max(1,Math.round((a-f)/864e5)),usado=Math.min(100,Math.max(0,Math.round((tot-dias)/tot*100)));
 const est=km?null:h0>b?['Vencido','#E2231A','Tu cambio ya pasó hace '+dp+(dp===1?' día':' días')+'. ¡Cotízalo hoy!']:(h0>=a)?['Muy pronto','#C77700','Ya llegó la fecha de tu próximo cambio.']:dias<=15?['Muy pronto','#C77700','Faltan '+dias+(dias===1?' día':' días')+' para tu próximo cambio.']:['Al día','#0B8A3A','Faltan '+dias+' días para tu próximo cambio.'];
 const kmU=window.JRGKm?JRGKm.kmNum(u.km):0,ley=window.JRGKm&&px?JRGKm.leyenda(px.modo==='est'?'fecha':px.modo,u.aceite)+(px.modo==='est'?' (fecha estimada)':''):'',
  rg=km?px.km.toLocaleString('es-CO')+' km':(a.getTime()===b.getTime()?fmtF(a):(a.getFullYear()===b.getFullYear()?a.getDate()+' '+MESES_ES[a.getMonth()]:fmtF(a))+' – '+fmtF(b));
 return `<div class="tcard" id="tcard"><div class="th"><div><small>Tarjeta de cambio</small><b>${esc(r.vehiculo||'Mi vehículo')}</b><span>Placa ${esc(p)}</span></div>${est?`<em style="background:${est[1]}">${est[0]}</em>`:''}</div>
 <div class="tb"><div><small>Último cambio</small><b>${fmtF(f)}</b>${kmU?'<span>'+kmU.toLocaleString('es-CO')+' km</span>':''}</div><div><small>Próximo cambio</small><b>${rg}</b><span>${esc(ley)}</span></div></div>
 ${est?`<div class="bar"><i style="width:${usado}%;background:${est[1]}"></i></div><p class="tmsg">${est[2]}</p>`:'<p class="tmsg">Cuando vengas, dinos el kilometraje que marca tu tablero para saber cuánto te falta.</p>'}
 <div class="cta" style="margin:12px 0 0">${est?'<button class="btn red" type="button" id="tkIcs">Agregar a mi calendario</button>':''}${r.contacto&&r.contacto.tieneCorreo?'':'<button class="btn blue" type="button" id="tkRec">Recibir recordatorio por correo</button>'}</div>${r.contacto&&r.contacto.tieneCorreo?'<p class="hint" style="margin-top:10px">✔ Recibirás un correo de recordatorio cada 25 días más o menos. Para dejar de recibirlo usa el enlace al final del correo.</p>':''}<form id="tkF" hidden style="margin-top:14px"><label style="margin-top:0" for="tkC">Celular con el que se registró este vehículo</label><input id="tkC" inputmode="tel" autocomplete="tel" placeholder="3001234567"><label for="tkE">Tu correo</label><input id="tkE" type="email" autocomplete="email" placeholder="tucorreo@gmail.com"><label class="check" style="align-items:flex-start"><input type="checkbox" id="tkA"> <span>Autorizo a Multiservicios JRG a escribirme a este correo para recordarme mi cambio de aceite cada 25 días más o menos.</span></label><p class="miss" id="tkX" hidden style="margin-top:10px"></p><button class="btn wa" type="submit" id="tkB" style="margin-top:12px">Activar recordatorio</button></form></div>`}
function tarjetaOn(r,p){const u=r.cambios[0],f=parseF(u.f);if(!f||!$('#tkIcs'))return;const px=window.JRGKm?JRGKm.proximo(u):null,sig=px&&px.desde||addMes(f,3);
 $('#tkIcs').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([icsDe(p,r.vehiculo||'vehículo',sig)],{type:'text/calendar'}));a.download='Cambio-de-aceite-'+p+'.ics';document.body.append(a);a.click();a.remove()};
}
function correoOn(r,p){const rb=$('#tkRec');if(!rb)return;rb.onclick=()=>{$('#tkF').hidden=!$('#tkF').hidden;$('#tkC').focus()};
 $('#tkF').onsubmit=async e=>{e.preventDefault();const x=$('#tkX'),bad=t=>{x.textContent=t;x.hidden=false},cel=$('#tkC').value.replace(/\D/g,''),c=$('#tkE').value.trim();x.hidden=true;
  if(!/^3\d{9}$/.test(cel))return bad('Escribe el celular (10 dígitos) con el que se registró el vehículo.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c))return bad('Escribe un correo válido.');
  if(!$('#tkA').checked)return bad('Debes autorizar el envío para activar el recordatorio.');
  const b=$('#tkB');b.disabled=true;b.textContent='Guardando…';const q=await JRG.correo({placa:p,celular:cel,correo:c,acepta:true});b.disabled=false;b.textContent='Activar recordatorio';
  if(!q||!q.ok)return bad({sin_api:'El recordatorio por correo todavía no está activado.',celular_distinto:'Ese celular no coincide con el registrado para esta placa.',sin_celular:'Esta placa no tiene un celular registrado. Regístrala primero con el formulario.',ocupado:'Hay muchas solicitudes. Intenta en un minuto.'}[q&&q.error]||'No pudimos guardar tu correo. Intenta de nuevo.');
  $('#tkF').hidden=true;rb.remove();$('#tcard .tmsg').insertAdjacentHTML('afterend','<p class="hint">✔ Listo. Te enviaremos un correo de recordatorio cada 25 días más o menos.</p>')}}
window.verTarjeta=(pl,cel)=>{go('cotizar');modo('cliente');$('#placa').value=pl;buscar(pl,cel)};
async function buscar(pl,cel){const p=(typeof pl==='string'&&pl?pl:$v('placa')).toUpperCase().replace(/[^A-Z0-9]/g,''),o=$('#phist'),btn=$('#findP');cel=typeof cel==='string'?cel:'';if(typeof pl==='string'&&pl)$('#placa').value=p;
 if(!/^[A-Z]{3}\d{2}[A-Z0-9]$/.test(p)){o.innerHTML='<div class="miss">'+ERR.placa+'</div>';return}
 btn.disabled=true;btn.textContent='Buscando…';o.innerHTML='<p class="hint" style="margin-top:16px">Consultando el registro de la placa '+p+'… la primera búsqueda puede tardar unos 15 segundos.</p>';
 const r=await JRG.consultar(p,cel);btn.disabled=false;btn.textContent='Buscar';CEL=r&&r.verificado?cel:'';
 if(!r||!r.ok){o.innerHTML='<div class="miss">'+(ERR[r&&r.error]||'No pudimos consultar el registro en este momento. Intenta de nuevo o escríbenos con el botón de WhatsApp.<small style="display:block;margin-top:6px;opacity:.7">Código: '+((r&&r.error)||'sin_respuesta')+'</small>')+'</div>';return}
 if(!r.encontrado){o.innerHTML=`<div class="miss"><b>${r.registrada?'Tu vehículo ya está registrado, pero todavía no tiene cambios guardados.':'No encontramos la placa '+p+'.'}</b><p>${r.registrada?'Cotiza tu primer cambio y quedará en tu historial.':'Si es tu primera vez con nosotros, registra tu vehículo o arma tu cotización.'}</p><div class="cta" style="margin:12px 0 0"><button class="btn blue" id="goNew">Cotizar mi primer cambio</button>${r.registrada?'':'<button class="btn red" data-go="registro">Registrar mi vehículo</button>'}</div></div>`;$('#goNew').onclick=()=>modo('nuevo');return}
 const u=r.cambios[0];if(!u){o.innerHTML='<div class="miss">Encontramos tu vehículo, pero todavía no tiene cambios guardados.</div>';return}
 const ex=[u.km&&(window.JRGKm&&JRGKm.esFecha(u.km)?'Fecha de control: ':'Km: ')+u.km,u.prox&&'Próximo cambio: '+u.prox].filter(Boolean).join(' · ');
 o.innerHTML=`<div style="margin-top:22px"><h3 style="color:var(--navy);font-size:1.5rem">${esc(r.vehiculo)}</h3><small style="color:var(--steel)">Placa ${p} · ${r.cambios.length} ${r.cambios.length===1?'cambio registrado':'cambios registrados'}</small></div>${contactoHTML(r)}${tabla(r)}${ex?`<p style="color:var(--steel)">Último cambio: ${esc(ex)}</p>`:''}${ciclo(r)}
 <div class="cta" style="margin-top:16px"><button class="btn wa" id="rep">Repetir mi último cambio</button><button class="btn blue" id="otro">Cotizar con otro aceite</button></div>`;
 if(window.JRGTarjeta){const kp=await JRG.kmPend(p);$('#phist').insertAdjacentHTML('afterbegin',JRGTarjeta.html(r,p,{status:false,kmp:kp&&kp.ok&&kp.km?kp:null})+JRGTarjeta.kmHTML(r,p));JRGTarjeta.kmOn(r,p)}
 $('#phist').insertAdjacentHTML('afterbegin',tarjeta(r,p));tarjetaOn(r,p);correoOn(r,p);contactoOn(p);if(CEL&&$('#tkC'))$('#tkC').value=CEL;
 $('#rep').onclick=()=>ticket({t:'Repetir mi cambio de aceite',lines:['Vehículo: '+r.vehiculo,'Placa: '+p,'Último cambio: '+u.f+' con '+(u.aceite||'el aceite anterior')+[u.fa&&'filtro de aire '+u.fa,u.fi&&'filtro de aceite '+u.fi].filter(Boolean).map(x=>', '+x).join(''),'Mano de obra: GRATIS si el cambio es completo (aceite + filtro de aceite + filtro de aire)'],total:null,ask:'name'});
 $('#otro').onclick=()=>{modo('nuevo');const pf=prefill(r.vehiculo);if(pf){$('#marca').value=pf[0];$('#modelo').value=pf[1]}selOil=null;onVeh();$('#oq').focus()}}
$('#findP').onclick=()=>buscar();$('#placa').onkeydown=e=>{if(e.key==='Enter')buscar()};
window.JRGOil={VOILS,FAM,famKey,costoAceite};
drawSvc();oilControls();drawOils();drawFilters();calc();
})();
