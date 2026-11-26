/* ===== Cambio de líquidos: frenos, valvulina, refrigerante e hidráulico =====
   PRECIOS: edita las listas FRENOS, REFRIG e HIDRAULICO de abajo (campo «precio», en pesos). La mano de obra de la valvulina es MO_VALV.
   FOTOS: cada tarjeta usa «img»; si el archivo no existe se muestra el logo de la marca (o el de la tienda).
   Valvulina: cantidades por vehículo en js/valvulina.js. Productos y precios de la valvulina: salen del inventario (solo los que están en existencia). */
(function(){
const MO_VALV=(window.PRECIOS_SERV&&PRECIOS_SERV.mano_obra_valvulina)||30000;                                      // mano de obra del cambio de valvulina
const COMUN_FRENOS=['Cambio con sistema de succión','1 año de garantía por el cambio','Se purga todo el sistema de frenos'];
const FRENOS=[
 {id:'fr-ate',marca:'ATE',nombre:'ATE SL DOT 4 — alemán (el azul)',pres:'1 litro',precio:130000,img:'img/liquidos/ate-sl-dot4-1l.webp',
  desc:'Líquido de frenos alemán ATE, DOT 4, de baja viscosidad pensado para los sistemas de frenos modernos con ABS. Es la opción de máxima calidad: resiste muy bien el calor y mantiene el pedal firme.',
  tag:'Calidad premium'},
 {id:'fr-cofre',marca:'Cofre',nombre:'Cofre DOT 4 — americano',pres:'1 litro',precio:120000,img:'img/liquidos/cofre-dot4.webp',
  desc:'Líquido de frenos americano DOT 4, confiable para el uso diario de carros, camionetas y taxis. Una opción de muy buena calidad a un valor más económico.',
  tag:'Buena calidad, más económico'}];
const COMUN_REF=['Aditivo limpiador de radiador Liqui Moly incluido','Cambio con máquina de succión especial: servicio más eficaz','Elegimos el color correcto para tu vehículo'];
const REFRIG=[
 {id:'rf-fl',marca:'Full Line',nombre:'Refrigerante Full Line',pres:'',precio:140000,img:'img/liquidos/full-line-refrigerante.webp',desc:'Refrigerante de marca nacional para uso diario. Protege el motor contra el recalentamiento y la corrosión.'},
 {id:'rf-mo',marca:'Mobil o Terpel',nombre:'Refrigerante Mobil o Terpel',pres:'',precio:140000,img:'img/liquidos/mobil-refrigerante.webp',img2:'img/liquidos/terpel-refrigerante.webp',desc:'Elige entre el refrigerante anticorrosivo Mobil o el refrigerante Terpel para radiadores (estándar, listo para usar). Los dos valen lo mismo y protegen el motor contra el recalentamiento, la corrosión y la oxidación.'},
 {id:'rf-si',marca:'Simoniz',nombre:'Refrigerante Simoniz',pres:'',precio:150000,img:'img/liquidos/simoniz-refrigerante.webp',desc:'Refrigerante Simoniz en los colores que usan los motores actuales. Buena protección contra el calor y la corrosión.'},
 {id:'rf-lu',marca:'Lubristone',nombre:'Refrigerante Lubristone',pres:'',precio:150000,img:'img/refrigerantes/refrigerante-lubristone-verde-galon.webp',desc:'Refrigerante Lubristone, disponible en varios colores. Protege el sistema de enfriamiento y ayuda a evitar el recalentamiento.'},
 {id:'rf-ac',marca:'ACDelco',nombre:'Refrigerante ACDelco',pres:'',precio:160000,img:'img/refrigerantes/refrigerante-acdelco-verde-galon.webp',desc:'Refrigerante ACDelco, la marca de repuestos originales de General Motors. Excelente protección para el motor.'},
 {id:'rf-lm',marca:'Liqui Moly',nombre:'Refrigerante Liqui Moly',pres:'',precio:210000,img:'img/liquidos/liqui-moly-raf.webp',desc:'Refrigerante alemán Liqui Moly (RAF 12+ rojo-naranja o RAF 11 verde-azul, al 50 %). La máxima calidad para tu sistema de enfriamiento.',tag:'Calidad premium'}];
const COMUN_HID=['Proceso de lavado repetitivo del sistema','Sale el líquido viejo y la suciedad antes de dejar el nuevo','Revisamos fugas y nivel al terminar'];
const HIDRAULICO=[
 {id:'hi-bas',marca:'Hidráulico básico',nombre:'Hidráulico económico',pres:'',precio:80000,img:'img/liquidos/hidraulico-economico.webp',desc:'Líquido hidráulico económico para la dirección. Cumple para el uso diario y es la opción más accesible.'},
 {id:'hi-ac',marca:'ACDelco',nombre:'ACDelco ATF Type III (ATF 3)',pres:'',precio:160000,img:'img/valvulinas-hidraulicos/tf-37844.webp',desc:'Líquido ACDelco ATF Type III (ATF 3): mejor protección de la bomba y de la cremallera de la dirección, más duradero.',tag:'Mejor calidad'}];
const TODOS={};[].concat(FRENOS,REFRIG,HIDRAULICO).forEach(x=>TODOS[x.id]=x);
{const PS=window.PRECIOS_SERV||{};Object.keys(TODOS).forEach(k=>{if(+PS[k]>0)TODOS[k].precio=+PS[k]})}   // los precios se editan en js/precios-servicios.js
const GRUPO={};FRENOS.forEach(x=>GRUPO[x.id]={t:'cambio de líquido de frenos',c:COMUN_FRENOS});REFRIG.forEach(x=>GRUPO[x.id]={t:'cambio de refrigerante',c:COMUN_REF});HIDRAULICO.forEach(x=>GRUPO[x.id]={t:'cambio de hidráulico',c:COMUN_HID});

/* ---------- tarjetas de producto ---------- */
function foto(x){const ph=phHTML({b:x.marca,n:x.nombre,c:'x'}).replace('<span class="ph','<span hidden class="ph');
 const im=(s,n)=>`<img data-f src="${esc(s)}" alt="${esc(n)}" loading="lazy" decoding="async" width="180" height="180">`;
 return x.img2?`<div class="lqim dos">${ph}${im(x.img,'Refrigerante Mobil')}${im(x.img2,'Refrigerante Terpel')}</div>`:`<div class="lqim">${ph}${im(x.img,x.nombre)}</div>`}
function tarjeta(x,comun){return`<article class="lq">${foto(x)}<div class="lqb"><small>${esc(x.marca)}${x.pres?' · '+esc(x.pres):''}</small><h3>${esc(x.nombre)}</h3>${x.tag?`<span class="tag">${esc(x.tag)}</span>`:''}<p>${esc(x.desc)}</p>
 <ul class="lqul">${(comun||[]).map(c=>'<li>'+esc(c)+'</li>').join('')}</ul><div class="lqp"><span>Valor del cambio</span><b>${money(x.precio)}</b></div><button type="button" class="btn red" data-lq="${x.id}">Solicitar este cambio</button></div></article>`}
$('#lq-frenos').innerHTML=FRENOS.map(x=>tarjeta(x,COMUN_FRENOS)).join('');
$('#lq-refrig').innerHTML=REFRIG.map(x=>tarjeta(x,null)).join('');
$('#lq-hid').innerHTML=HIDRAULICO.map(x=>tarjeta(x,null)).join('');
$('#v-liquidos').addEventListener('click',e=>{const b=e.target.closest('[data-lq]');if(!b)return;const x=TODOS[b.dataset.lq],g=GRUPO[x.id];
 ticket({t:'Solicitud de '+g.t,lines:['Producto: '+x.nombre+(x.pres?' ('+x.pres+')':''),'Valor del cambio: '+money(x.precio),...g.c],total:x.precio,ask:'full'})});

/* ---------- valvulina: busca el vehículo → cuartos → marca ---------- */
const low=s=>String(s).toLowerCase(),NUM=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
const isM=b=>/\(moto\)/i.test(b);
const modelosDe=k=>Object.keys(VEH[k]).filter(m=>!isM(k)||VAL_SCOOTER.test(m));
const marcas=()=>Object.keys(VEH).filter(k=>!isM(k)||modelosDe(k).length).sort((a,b)=>isM(a)-isM(b)||a.localeCompare(b,'es'));
const vk=()=>Object.keys(VEH).find(k=>low(k)===low($('#vm').value.trim())),mk=k=>k&&modelosDe(k).find(m=>low(m)===low($('#vo').value.trim()));
function combo(inp,opts,pick){const box=document.createElement('div');box.className='cb';inp.parentNode.style.position='relative';inp.parentNode.append(box);
 const draw=()=>{const q=low(inp.value.trim()),l=opts().filter(o=>low(o).includes(q));box.innerHTML=l.map(o=>`<button type="button">${esc(o)}</button>`).join('')||'<em>Sin resultados. Revisa cómo está escrito.</em>';box.classList.add('on')};
 inp.addEventListener('focus',draw);inp.addEventListener('input',()=>{draw();pick()});
 box.onmousedown=e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();inp.value=b.textContent;box.classList.remove('on');pick(true)};
 inp.addEventListener('blur',()=>setTimeout(()=>box.classList.remove('on'),120))}
const PESADO=/\b(17\d\d|24\d\d|1932|constellation|stralis|tector|actros|atego|cargo 1[79]|cargo 2|f-9000|hd1[27]0|hd270|fvr|fvz|ftr|fsr|fuso f[vn]|fuso fv|hino 500 (fd|fg|gd|gh|fl)|hino 700|worker|delivery 11|volqueta|tractocami|bus|kenworth|freightliner|mack|volvo|scania|international|sinotruk|howo|agrale 10000|prostar)\b/i;
const pesado=(k,m)=>claseDe(k,m)==='camion'&&PESADO.test(k+' '+m);
/* Litros de la caja: dato investigado (VAL_I) o, si el modelo no está, una cantidad estimada por tipo de vehículo */
function caja(k,m){const v=VAL_I[k+'|'+m];if(v)return{L:v,src:'i'};
 if(isM(k))return{L:0.12,src:'e'};
 const c=claseDe(k,m);if(c==='camion')return pesado(k,m)?{L:0,src:'n'}:{L:5,src:'e'};
 if(c==='camioneta')return{L:3,src:'e'};return{L:2,src:'e'}}
const EXTRAS=(k,m)=>{const c=claseDe(k,m);if(isM(k)||c==='carro')return[];
 if(c==='camion')return pesado(k,m)?[]:[['dt','Diferencial trasero',4]];
 return[['dt','Diferencial trasero',2],['dd','Diferencial delantero (4x4)',1.5],['tr','Caja de transferencia (4x4)',1.5]]};
const cuartos=L=>Math.max(0.5,Math.round(L/0.946*2)/2);
const fmt=n=>String(n).replace('.',',');
let marcaSel='',prodSel=null,V=null;
const scooter=()=>V&&isM(V.k);
const pool=()=>JRGOil.VOILS.filter(o=>o.st&&((o.s==='Valvulinas')||(/VALVULINA/i.test(o.n)&&!/HIDRAUL/i.test(o.n)))&&(scooter()?/SCOOTER/i.test(o.n):!/SCOOTER/i.test(o.n)));
function familias(){const seen={},out=[];pool().forEach(o=>{const k=JRGOil.famKey(o);if(seen[k])return;seen[k]=1;const f=JRGOil.FAM[k]||{};out.push(f.c&&f.c.st?f.c:(f.g&&f.g.st?f.g:o))});return out}
const porCuarto=o=>{const f=JRGOil.FAM[JRGOil.famKey(o)]||{};return f.c?f.c.p:(f.g?f.g.p/4:o.p)};
const precioTxt=o=>{if(/SCOOTER/i.test(o.n))return money(o.p);const f=JRGOil.FAM[JRGOil.famKey(o)]||{};
 if(f.c)return money(f.c.p)+'<i> /cuarto</i>'+(f.g&&f.g.st?'<small class="pg">galón '+money(f.g.p)+'</small>':'');
 if(f.g)return money(f.g.p)+'<i> /galón</i><small class="pg">cuarto ≈ '+money(porCuarto(o))+'</small>';
 return money(o.p)+'<i> /cuarto</i>'};
function drawVeh(){const k=vk(),m=mk(k),box=$('#vinfo');V=null;
 if(!k||!m){box.innerHTML=$('#vm').value||$('#vo').value?'':'<p class="hint">Elige la marca y el modelo para ver cuánta valvulina lleva.</p>';drawProds();calc();return}
 if(isM(k)&&!VAL_SCOOTER.test(m)){box.innerHTML='<div class="miss">Las motos de caja manual no llevan valvulina aparte: la caja va con el aceite del motor. Cotiza el <a class="lk" role="button" tabindex="0" data-go="cotizar">cambio de aceite</a>.</div>';drawProds();calc();return}
 const c=caja(k,m),ex=EXTRAS(k,m);V={k,m,c,ex,sel:{},cq:c.L?(isM(k)?0.5:cuartos(c.L)):0};
 const fuente=c.src==='i'?'Dato investigado para la caja manual; puede variar según el año o la versión.':c.src==='e'?'Cantidad aproximada para este tipo de vehículo; la confirmamos al revisarlo.':'En camiones pesados la cantidad depende de la caja (Eaton, ZF, etc.). Escribe cuántos cuartos lleva o escríbenos y te lo confirmamos.';
 box.innerHTML=`<div class="vinf"><b>${c.L?(isM(k)?'Tu scooter lleva aprox. 0,5 cuarto (150 ml) de valvulina en la transmisión':'Tu '+esc(k)+' '+esc(m)+' lleva aprox. '+fmt(cuartos(c.L))+' cuartos de valvulina en la caja manual'):'Escribe cuántos cuartos lleva tu caja'}</b>${c.L&&!isM(k)?`<span>≈ ${fmt(c.L)} litros</span>`:''}<small>${fuente}</small></div>
 ${isM(k)?'':`<label for="vq" style="margin-top:14px">Cuartos de valvulina para la caja</label><input id="vq" type="number" min="0.5" max="60" step="0.5" inputmode="decimal" value="${V.cq||''}" placeholder="Ej: 3">`}
 ${ex.map(([id,t,q])=>`<label class="check"><input type="checkbox" data-vx="${id}"> ${t} <small style="font-weight:400">(≈ ${fmt(q)} cuartos más, estimado)</small></label>`).join('')}
 ${isM(k)?'':'<p class="hint" style="margin-top:12px">Esto aplica a cajas <b>manuales</b>. Si tu vehículo es automático lleva líquido ATF: mira el <a class="lk" role="button" tabindex="0" data-go="liquidos?to=l-hid">cambio de hidráulico</a> o escríbenos.</p>'}`;
 if($('#vq'))$('#vq').oninput=()=>{V.cq=parseFloat($('#vq').value)||0;calc()};
 box.querySelectorAll('[data-vx]').forEach(i=>i.onchange=()=>{V.sel[i.dataset.vx]=i.checked;calc()});
 drawProds();calc()}
function drawProds(){const f=familias(),bs=[...new Set(f.map(o=>o.b))].sort((a,b)=>a.localeCompare(b,'es'));
 if(!bs.includes(marcaSel))marcaSel='';
 $('#vbrands').innerHTML=bs.length?`<button type="button" class="chip${!marcaSel?' on':''}" data-vb="">Todas</button>`+bs.map(b=>`<button type="button" class="chip${marcaSel===b?' on':''}" data-vb="${esc(b)}">${b==='Otras marcas'?'Económica':esc(b)}</button>`).join(''):'';
 const l=f.filter(o=>!marcaSel||o.b===marcaSel);
 if(prodSel&&!f.some(o=>JRGOil.famKey(o)===JRGOil.famKey(prodSel)))prodSel=null;
 $('#vprods').innerHTML=l.length?l.map(o=>`<button type="button" class="oil${prodSel&&JRGOil.famKey(prodSel)===JRGOil.famKey(o)?' sel':''}" data-vp="${o.id}"><span>${esc(o.n)}<small>${o.b==='Otras marcas'?'Económica':esc(o.b)}${o.x?' · '+esc(o.x):''} · Disponible</small></span><b>${precioTxt(o)}</b></button>`).join(''):'<p class="empty" style="padding:14px">No hay valvulinas en existencia para esta selección. Escríbenos y te las conseguimos.</p>'}
$('#vbrands').onclick=e=>{const b=e.target.closest('[data-vb]');if(!b)return;marcaSel=b.dataset.vb;drawProds()};
$('#vprods').onclick=e=>{const b=e.target.closest('[data-vp]');if(!b)return;prodSel=P[b.dataset.vp];drawProds();calc()};
let Q=null;
function calc(){const dl=$('#vdl');Q=null;const btn=$('#vsend');btn.disabled=true;
 const fila=(a,b)=>`<dt>${a}</dt><dd>${b}</dd>`;
 if(!V){dl.innerHTML=fila('Vehículo','Elige marca y modelo')+fila('Valvulina',prodSel?esc(prodSel.n):'Elige una marca');$('#vtot').textContent='$0';$('#vnote').textContent='';return}
 const extra=V.ex.reduce((s,[id,,q])=>s+(V.sel[id]?q:0),0),cu=(V.cq||0)+extra;
 if(!prodSel||!(cu>0)){dl.innerHTML=fila('Vehículo',esc(V.k+' '+V.m))+fila('Necesitas',cu>0?fmt(cu)+(cu===1?' cuarto':' cuartos'):'Escribe la cantidad')+fila('Valvulina',prodSel?esc(prodSel.n):'Elige una marca');$('#vtot').textContent='$0';$('#vnote').textContent='';return}
 const sc=/SCOOTER/i.test(prodSel.n),co=sc?{costo:prodSel.p,txt:'1 envase de 150 ml'}:JRGOil.costoAceite(prodSel,cu,'mix'),mo=MO_VALV,total=co.costo+mo;
 Q={V,cu,prod:prodSel,co,mo,total,sc};
 dl.innerHTML=fila('Vehículo',esc(V.k+' '+V.m))+fila('Necesitas',sc?'0,5 cuarto':fmt(cu)+(cu===1?' cuarto':' cuartos'))+fila('Se arma con',esc(co.txt))+fila('Valvulina',esc(prodSel.n))+fila('Valor valvulina',money(co.costo))+fila('Mano de obra',money(mo));
 $('#vtot').textContent=money(total);
 $('#vnote').textContent='Valor estimado: la cantidad exacta se confirma al revisar tu vehículo. La mano de obra del cambio de valvulina vale '+money(MO_VALV)+'.';btn.disabled=false}
$('#vsend').onclick=()=>Q&&ticket({t:'Solicitud de cambio de valvulina',lines:['Vehículo: '+Q.V.k+' '+Q.V.m,'Valvulina: '+Q.prod.n+' ('+(Q.sc?'1 envase de 150 ml':fmt(Q.cu)+' cuartos = '+Q.co.txt)+')','Valor valvulina: '+money(Q.co.costo),'Mano de obra del cambio: '+money(Q.mo),...Q.V.ex.filter(([id])=>Q.V.sel[id]).map(([,t])=>'Incluye: '+t+' (cantidad estimada)'),'Cantidad estimada: se confirma al revisar el vehículo'],total:Q.total,ask:'full'});
combo($('#vm'),marcas,t=>{if(t)$('#vo').value='';drawVeh()});
combo($('#vo'),()=>{const k=vk();return k?modelosDe(k):[]},()=>drawVeh());
drawVeh();
})();
