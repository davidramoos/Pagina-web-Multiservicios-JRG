/* ===== TARJETA DE CAMBIO VIRTUAL + REGISTRO POR MODOS =====
   - JRGTarjeta.html(r, placa, {status})  dibuja la tarjeta (igual a la de papel) a partir de la respuesta de JRG.consultar
   - Registro: «Primera vez» (formulario) o «Ya soy cliente» (solo la placa → tarjeta de SOLO LECTURA + kilometraje actual, que queda PENDIENTE hasta que el taller lo confirme).
   El cliente nunca modifica la tarjeta: los cambios los escribe únicamente el dueño en el Excel.
   Campos opcionales por cambio (la hoja puede traerlos o no): lf líquido de frenos, vv valvulina, hi hidráulico, en engrase, rf refrigerante. */
(function(){
const MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const WA='573125529044';
const num=v=>{const n=parseInt(String(v==null?'':v).replace(/\D/g,''),10);return isNaN(n)?0:n};
const miles=n=>n?n.toLocaleString('es-CO'):'';
function pf(t){const a=window.JRGKm?JRGKm.fechas(t):[];return a.length?a[0]:null}   // acepta 25/10/2026, 25-10-26 y 2026-10-25
const dmy=t=>{const d=pf(t);return d?d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear():String(t||'')};
const largo=d=>d.getDate()+' '+MES[d.getMonth()]+' '+d.getFullYear();
const addMes=(d,n)=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setMonth(x.getMonth()+n);return x};
/* ciclo de fidelidad: carros/taxis 6.º cambio a mitad de precio; camiones/camperos/camionetas 7.º; motos sin beneficio */
function ciclo(r,arr){const N=arr.length,u=r.cambios[0]||{},t=String(u.total||'').toUpperCase(),m=/(\d+)\s*DE\s*(\d+)/.exec(t),veh=String(r.vehiculo||'');
 const moto=/PULSAR|AKT|YAMAHA|HONDA CB|MOTO|BOXER|APACHE|\bFZ\b|NMAX|GIXXER|DOMINAR/i.test(veh);
 let per=m?+m[2]:/CAMION|CAMIONETA|VOLQUETA|FOTON|NHR|NKR|LUV|DMAX|D-MAX|HILUX|FRONTIER|RANGER|L200|BT-?50|TFR|KODIAC|FORD 600|CAMPERO|SPORTAGE|TUCSON|DUSTER|PICKUP/i.test(veh)?7:6;
 if(per<2||per>12)per=6;
 const cols=moto?7:per,start=m?Math.max(0,N-(+m[1])):Math.max(0,Math.floor((N-1)/cols)*cols);
 return{moto,per:cols,start,hechos:Math.min(cols,N-start)}}
const mark=v=>{v=String(v==null?'':v).trim();if(!v||v==='—'||v==='-'||/^(no|0)$/i.test(v))return'<span class="nd">—</span>';
 return /^(si|sí|incluido|x|ok|1)$/i.test(v)?'<b class="ck">✔</b>':'<b class="ck">✔</b><small>'+esc(v)+'</small>'};
/* Próximo cambio (ver js/kmcambio.js): por KILÓMETROS (si el KM ACTUAL de la hoja es un número) o por FECHA (si es una fecha). Se usa lo que escribió el taller en PRÓX. CAMBIO; si está vacío, se calcula según el aceite. */
const soloNum=t=>/^\d[\d.,\s]*$/.test(String(t||'').trim());
const pxDe=c=>c&&window.JRGKm?JRGKm.proximo(c):null;
const pkDe=c=>{const p=pxDe(c);return p&&p.modo==='km'?p.km:0};
const fd=d=>d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
const rangoC=p=>p.desde.getTime()===p.hasta.getTime()?fd(p.desde):fd(p.desde)+' – '+fd(p.hasta);
const rangoL=p=>{const a=p.desde,b=p.hasta;return a.getTime()===b.getTime()?largo(a):(a.getFullYear()===b.getFullYear()?a.getDate()+' '+MES[a.getMonth()]:largo(a))+' – '+largo(b)};
const FILAS=[['f','FECHA (D/M/A)'],['km','KM ACTUAL'],['aceite','LUBRICANTE'],['prox','PRÓX. CAMBIO'],['fa','FILTRO AIRE'],['fi','FILTRO ACEITE'],['fc','FILTRO COMBUSTIBLE'],['lf','LÍQUIDO DE FRENOS'],['vv','VALVULINA'],['hi','HIDRÁULICO'],['en','ENGRASE'],['rf','REFRIGERANTE'],['pl','PLACA']];
function celda(k,c,placa){if(!c)return'<span class="nd"></span>';
 if(k==='f')return'<b>'+esc(dmy(c.f))+'</b>';
 if(k==='km'){const n=window.JRGKm?JRGKm.kmNum(c.km):num(c.km);if(n)return'<b>'+miles(n)+'</b>';if(window.JRGKm&&JRGKm.esFecha(c.km))return'<b>'+esc(dmy(c.km))+'</b>';return'<span class="nd">—</span>'}
 if(k==='aceite')return c.aceite?'<span class="lu">'+esc(c.aceite)+'</span>'+(c.cant?'<small>'+esc(c.cant)+(/^[\d.,]+$/.test(c.cant)?' cuartos':'')+'</small>':''):'<span class="nd">—</span>';
 if(k==='prox'){const raw=String(c.prox||'').trim();if(raw&&window.JRGKm&&!JRGKm.esFecha(raw)&&!JRGKm.esKm(raw))return'<b>'+esc(raw)+'</b>';const px=pxDe(c);if(!px||px.modo==='est')return'<span class="nd">—</span>';return'<b>'+esc(px.modo==='km'?miles(px.km)+' km':rangoC(px))+'</b>'}
 if(k==='pl')return'<span class="pl">'+esc(placa)+'</span>';
 return mark(c[k])}
const gota='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5C9 7 5.5 10.4 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10.4 15 7 12 2.5z"/></svg>';
function estado(r,kmp){const u=r.cambios[0],f=u&&pf(u.f);if(!f)return null;const p=pxDe(u);if(!p)return null;
 const h=new Date(),h0=new Date(h.getFullYear(),h.getMonth(),h.getDate());
 if(p.modo==='km'){const kr=kmp&&num(kmp.km);let txt=null;if(kr){const rest=p.km-kr;txt=rest<=0?['Vencido','v']:rest<=1000?['Muy pronto','p']:['Al día','ok']}return{f,p,txt}}
 const dias=Math.round((p.desde-h0)/864e5);
 return{f,p,dias,txt:h0>p.hasta?['Vencido','v']:(h0>=p.desde||dias<=15)?['Muy pronto','p']:['Al día','ok']}}
function html(r,placa,o){o=o||{};if(!r||!r.cambios||!r.cambios.length)return'';
 const arr=r.cambios.slice().reverse(),cy=ciclo(r,arr),cols=cy.per,start=cy.start,falta=cols-cy.hechos,pl=String(placa||r.placa||'').toUpperCase();
 const c=r.contacto||{},dueño=c.nombre?String(c.nombre):'';
 let cab='<tr><th scope="col" class="lb">CAMBIO</th>';for(let i=1;i<=cols;i++)cab+='<th scope="col" class="n'+(!cy.moto&&i===cols?' mitad':'')+'">'+i+(!cy.moto&&i===cols?'<em>½</em>':'')+'</th>';cab+='</tr>';
 const cuerpo=FILAS.map(([k,l])=>'<tr><th scope="row" class="lb">'+l+'</th>'+Array.from({length:cols},(_,i)=>'<td'+(!cy.moto&&i===cols-1?' class="mitad"':'')+'>'+celda(k,arr[start+i],pl)+'</td>').join('')+'</tr>').join('');
 const sellos=Array.from({length:cols},(_,i)=>'<span class="sl'+(i<cy.hechos?' on':'')+(!cy.moto&&i===cols-1?' m':'')+'" title="Cambio '+(i+1)+'">'+(i<cy.hechos?gota:'<b>'+(i+1)+'</b>')+(!cy.moto&&i===cols-1?'<em>50%</em>':'')+'</span>').join('');
 const promo=cy.moto?'':'<div class="pp"><b>Cambio '+cols+' a mitad de precio</b><span>Con '+(cols-1)+' cambios completos '+(cols===7?'(camiones, camperos y camionetas)':'(taxis y carros)')+', el cambio n.º '+cols+' paga el 50 %. Válido para cambio completo y fidelidad. <i>Recuerda reclamar tus obsequios.</i></span>'+(falta===0?'<strong class="done">¡Completaste tu tarjeta! El siguiente cambio empieza una nueva.</strong>':'<strong>'+(falta===1?'¡Tu próximo cambio paga la mitad!':'Te faltan '+falta+' cambios para que uno pague la mitad.')+'</strong>')+'</div>';
 const e=o.status===false?null:estado(r,o.kmp),pkU=pkDe(r.cambios[0]),tipoU=window.JRGKm?JRGKm.etiqueta((r.cambios[0].aceite||'')):'';
 const kp=o.kmp&&num(o.kmp.km)?'<div class="ppend"><b>Kilometraje reportado: '+miles(num(o.kmp.km))+' km</b><span>'+(o.kmp.f?esc(dmy(o.kmp.f))+' · ':'')+'pendiente de confirmar por Multiservicios JRG'+(()=>{const kr=num(o.kmp.km);if(!pkU)return'';const rest=pkU-kr;return rest>0?'</span><span><b>Te faltan '+miles(rest)+' km para tu próximo cambio ('+miles(pkU)+' km)</b>':'</span><span><b>Ya pasaste el kilometraje de tu próximo cambio ('+miles(pkU)+' km)</b>'})()+'</span></div>':'',rg=o.reg?'<div class="ppend"><b>Registro recibido</b><span>Multiservicios JRG lo verificará y activará tu tarjeta en tu próxima visita.</span></div>':'';
 const st=e?'<div class="pst"><div><small>Último cambio</small><b>'+largo(e.f)+'</b></div><div><small>Próximo cambio</small><b>'+(e.p.modo==='km'?miles(e.p.km)+' km':rangoL(e.p))+'</b><span>'+(window.JRGKm?JRGKm.leyenda(e.p.modo==='est'?'fecha':e.p.modo,r.cambios[0].aceite):'')+(e.p.modo==='est'?' (fecha estimada)':'')+'</span></div>'+(e.txt?'<em class="s-'+e.txt[1]+'">'+e.txt[0]+'</em>':'')+'</div>':'';
 return '<section class="pcard" aria-label="Tarjeta de cambio de aceite"><div class="pch"><span class="plogo" role="img" aria-label="Multiservicios JRG"></span><div><small>Tarjeta de cambio de aceite</small><b>'+esc(r.vehiculo||'Mi vehículo')+'</b><span>Placa '+esc(pl)+(dueño?' · '+esc(dueño):'')+'</span></div></div>'+st+kp+rg
 +'<p class="phint">Desliza la tabla a la derecha para ver todos los cambios →</p><div class="ptw" tabindex="0" role="region" aria-label="Historial de cambios (desliza para ver todas las columnas)"><table class="pt" style="min-width:'+(140+cols*88)+'px"><thead>'+cab+'</thead><tbody>'+cuerpo+'</tbody></table></div>'
 +'<div class="sellos" aria-label="Sellos: '+cy.hechos+' de '+cols+'">'+sellos+'</div>'+promo+'<p class="pnote">Esta tarjeta solo la actualiza Multiservicios JRG. Los kilómetros que reportes quedan pendientes hasta que el taller los confirme.'+(e?' El próximo cambio se calcula según tu aceite y cómo se controla tu vehículo: por kilometraje (mineral o a granel cada 5.000 km, semisintético 6.000 km, sintético 10.000 km) o por fecha (mineral cada 3 a 4 meses, semisintético 7 a 9 meses, sintético 12 meses).':'')+'</p>'
 +'<div class="pcf"><b>Multiservicios JRG</b><span>Cra. 5 L No. 49D - 08 Sur · MJ 7 - B/ Hacienda Los Molinos · Bogotá D.C.</span><span>312 552 9044 · 318 121 2695 · multiserviciosjrg18@gmail.com</span></div></section>'}
window.JRGTarjeta={html,ciclo,pf,dmy};
if(window.IMGS&&IMGS['logomultijrg.png'])document.documentElement.style.setProperty('--logo','url('+IMGS['logomultijrg.png']+')');

/* ---------- Kilometraje actual (clientes): queda PENDIENTE; solo el taller lo confirma en el Excel ---------- */
const kmHTML=(r,pl)=>{const ult=window.JRGKm?JRGKm.kmNum(r.cambios[0]&&r.cambios[0].km):num(r.cambios[0]&&r.cambios[0].km);return'<form id="kmF" class="panel kmf" novalidate><h3>¿Vienes a cambiar el aceite? Registra tu kilometraje</h3><p class="hint">'+(ult?'Tu último kilometraje confirmado fue <b>'+miles(ult)+' km</b>.':'Aún no tenemos un kilometraje confirmado para tu vehículo.')+' Escribe el que marca tu tablero hoy; el taller lo revisa y lo pasa a tu tarjeta.</p><label for="kmI">Kilometraje actual</label><input id="kmI" inputmode="numeric" autocomplete="off" placeholder="Ej: '+miles(ult?ult+3000:48000)+'" required><p id="kmE" class="miss" hidden style="margin-top:12px"></p><button class="btn red" id="kmB" type="submit" style="margin-top:16px">Enviar kilometraje</button></form><div id="kmOk" class="panel" hidden></div>'};
function kmOn(r,pl){const f=$('#kmF');if(!f)return;const ult=window.JRGKm?JRGKm.kmNum(r.cambios[0]&&r.cambios[0].km):num(r.cambios[0]&&r.cambios[0].km),er=t=>{const e=$('#kmE');e.textContent=t||'';e.hidden=!t};
 const wa=km=>'https://wa.me/'+WA+'?text='+encodeURIComponent('Hola, mi placa es '+pl+' y mi kilometraje actual es '+miles(km)+' km.');
 f.onsubmit=async e=>{e.preventDefault();er('');const km=num($('#kmI').value);
  if(!km||km<100)return er('Escribe el kilometraje que marca tu tablero, solo números.');
  if(km>999999)return er('Ese kilometraje parece muy alto. Revísalo.');
  if(ult&&km<ult)return er('El kilometraje no puede ser menor al último confirmado ('+miles(ult)+' km).');
  const b=$('#kmB');b.disabled=true;b.textContent='Enviando…';
  const q=await JRG.km({placa:pl,km});b.disabled=false;b.textContent='Enviar kilometraje';
  const ok=$('#kmOk');
  if(q&&q.ok){f.hidden=true;ok.hidden=false;ok.innerHTML='<h3 style="color:var(--navy)">¡Gracias! Recibimos '+miles(km)+' km</h3><p>Quedó <b>pendiente de confirmación</b> con la placa <b>'+esc(pl)+'</b>. Multiservicios JRG lo revisa y lo pasa a tu tarjeta.</p>';ok.scrollIntoView({block:'nearest'});return}
  if(q&&q.error==='ocupado')return er('Ya enviaste varios kilometrajes con esta placa. Intenta de nuevo en una hora o díselo al técnico.');
  f.hidden=true;ok.hidden=false;ok.innerHTML='<h3 style="color:var(--navy)">Casi listo</h3><p>Por ahora no pudimos guardarlo directamente. Envíanos el dato por WhatsApp (ya va escrito) y lo anotamos en tu tarjeta.</p><div class="cta" style="margin:14px 0 0"><a class="btn wa" target="_blank" rel="noopener" href="'+wa(km)+'">Enviar por WhatsApp</a></div>'}}
window.JRGTarjeta.kmHTML=kmHTML;window.JRGTarjeta.kmOn=kmOn;

/* ---------- Modos del registro ---------- */
function modoReg(m){$$('.ropt').forEach(o=>{const s=o.dataset.m===m;o.classList.toggle('sel',s);o.setAttribute('aria-pressed',s)});$('#rpane1').hidden=m!=='nuevo';$('#rpane2').hidden=m!=='cliente';const t=m==='nuevo'?$('#rp'):$('#cvp');if(t)t.focus({preventScroll:true})}
$$('.ropt').forEach(b=>b.onclick=()=>modoReg(b.dataset.m));
window.modoRegistro=modoReg;
const cerr=t=>{const e=$('#cverr');e.innerHTML=t||'';e.hidden=!t};
const cv=$('#rcl');
if(cv)cv.onsubmit=async e=>{e.preventDefault();cerr('');$('#cres').innerHTML='';
 const pl=$('#cvp').value.toUpperCase().replace(/[^A-Z0-9]/g,'');
 if(!/^[A-Z]{3}\d{2}[A-Z0-9]$/.test(pl))return cerr('Revisa la placa: debe verse como ABC123 (carro) o ABC12D (moto).');
 const b=$('#cvb');b.disabled=true;b.textContent='Buscando…';$('#cres').innerHTML='<p class="hint">Consultando tu registro… la primera vez puede tardar unos 15 segundos.</p>';
 const r=await JRG.consultar(pl);b.disabled=false;b.textContent='Ver mi tarjeta';$('#cres').innerHTML='';
 if(!r||!r.ok)return cerr(r&&r.error==='placa'?'Revisa la placa.':'No pudimos consultar tu registro en este momento. Intenta de nuevo o escríbenos por WhatsApp.');
 if(!r.encontrado&&!r.registrada)return cerr('No encontramos la placa <b>'+esc(pl)+'</b>. Si es tu primera vez en el taller, usa la opción <button type="button" class="lk" id="cvN">Es mi primera vez</button>.');
 if(!r.cambios||!r.cambios.length)return cerr('Tu vehículo está registrado, pero todavía no tiene cambios guardados. Cotiza tu primer cambio y quedará en tu tarjeta.');
 const kp=await JRG.kmPend(pl);
 $('#cres').innerHTML=html(r,pl,{kmp:kp&&kp.ok&&kp.km?kp:null})+kmHTML(r,pl);kmOn(r,pl);$('#cres').scrollIntoView({block:'start',behavior:'smooth'})};
document.addEventListener('click',e=>{if(e.target&&e.target.id==='cvN')modoReg('nuevo')});
})();
