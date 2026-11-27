/* ===== Calendario para agendar la visita =====
   - Muestra un mes con los días disponibles y, al elegir un día, los horarios libres.
   - Los horarios salen según lo que el cliente escogió: la duración del servicio (aceite solo, aceite + filtros, valvulina...),
     el horario de ese día (lunes a sábado 8:00 AM a 6:00 PM; domingos y festivos 9:00 AM a 12:30 PM) y las citas que ya hay.
   - Solo se ofrecen horarios en los que el servicio termina antes de la hora de cierre. Hoy: desde 1 hora después de la hora actual.
   Para cambiar las reglas edita las constantes de abajo.  */
(function(){
const CUPOS=2;            // vehículos que se pueden atender a la vez en el mismo horario
const PASO=30;            // minutos entre un horario y el siguiente
const ANTELACION=60;      // hoy solo se ofrecen horarios que empiecen al menos 60 min después de la hora actual
const DIAS_ADELANTE=45;   // hasta cuántos días adelante se puede agendar
/* Servicios que se pueden agendar y cuánto dura cada uno (minutos) */
const SERVICIOS=[['aceite','Cambio de aceite (solo aceite)',30],['aceite_filtros','Cambio de aceite con filtros',45],['valvulina','Cambio de valvulina',45],['liquidos','Cambio de líquidos (frenos, refrigerante, hidráulico)',60],['revision','Revisión de niveles',20]];
const DUR={};SERVICIOS.forEach(s=>DUR[s[0]]=s[2]);
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],SEM=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const pad=n=>String(n).padStart(2,'0'),iso=(y,m,d)=>y+'-'+pad(m)+'-'+pad(d);
const hh=min=>{const h=Math.floor(min/60),m=min%60;return(h%12||12)+':'+pad(m)+' '+(h>=12?'PM':'AM')};
const hm=min=>pad(Math.floor(min/60))+':'+pad(min%60);
const aMin=s=>{const m=/^(\d{1,2}):(\d{2})$/.exec(String(s));return m?+m[1]*60+ +m[2]:null};
const horasDia=(y,m,d)=>window.JRG_HORARIO&&JRG_HORARIO.horas?JRG_HORARIO.horas(y,m,d):[8*60,18*60];
const reducido=(y,m,d)=>window.JRG_HORARIO?JRG_HORARIO.esFestivo(y,m,d):new Date(Date.UTC(y,m-1,d)).getUTCDay()===0;
const hoyBogota=()=>window.JRG_HORARIO&&JRG_HORARIO.ahora?JRG_HORARIO.ahora():(()=>{const n=new Date();return{y:n.getFullYear(),m:n.getMonth()+1,d:n.getDate(),min:n.getHours()*60+n.getMinutes()}})();
const sumarDias=(y,m,d,n)=>{const t=new Date(Date.UTC(y,m-1,d+n));return{y:t.getUTCFullYear(),m:t.getUTCMonth()+1,d:t.getUTCDate()}};
const diaLargo=(y,m,d)=>new Date(Date.UTC(y,m-1,d)).toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* Citas que ya están tomadas (solo fecha, hora y duración; sin datos de clientes). Se consultan una vez y se guardan un minuto. */
let ocupadas={},cargadas=0,pidiendo=null,fallo=false;
function cargar(forzar){
 if(!window.JRG||!JRG.conectado||!JRG.conectado())return Promise.resolve();
 if(!forzar&&Date.now()-cargadas<60000)return Promise.resolve();
 if(pidiendo)return pidiendo;
 const h=hoyBogota(),a=sumarDias(h.y,h.m,h.d,DIAS_ADELANTE+1);
 pidiendo=JRG.citas(iso(h.y,h.m,h.d),iso(a.y,a.m,a.d)).then(r=>{
  if(r&&r.ok&&Array.isArray(r.citas)){ocupadas={};fallo=false;r.citas.forEach(c=>{const i=aMin(c.h);if(i==null)return;(ocupadas[c.f]=ocupadas[c.f]||[]).push([i,i+(+c.d||30)])});cargadas=Date.now()}else fallo=true;
 }).catch(()=>{fallo=true}).finally(()=>{pidiendo=null});
 return pidiendo}
/* Horarios de un día para un servicio de 'dur' minutos: [{t, libre}] */
function horarios(y,m,d,dur){
 const [ab,ci]=horasDia(y,m,d),h=hoyBogota(),esHoy=h.y===y&&h.m===m&&h.d===d,oc=ocupadas[iso(y,m,d)]||[],out=[];
 for(let t=ab;t+dur<=ci;t+=PASO){
  if(esHoy&&t<h.min+ANTELACION)continue;
  const n=oc.filter(([a,b])=>t<b&&t+dur>a).length;
  out.push({t,libre:n<CUPOS})}
 return out}
function diaPosible(y,m,d,dur){
 const h=hoyBogota(),f=Date.UTC(y,m-1,d),p=Date.UTC(h.y,h.m-1,h.d);
 if(f<p||f>p+DIAS_ADELANTE*864e5)return false;
 return horarios(y,m,d,dur).some(x=>x.libre)}

function crear(cont,opt){
 opt=opt||{};const hoy=hoyBogota();
 let mes={y:hoy.y,m:hoy.m},sel=null,hora=null,aviso='';
 const dur=()=>Math.max(10,+(opt.dur?opt.dur():30)||30);
 const id='ag'+Math.random().toString(36).slice(2,7);
 function valor(){
  if(!sel||hora==null)return null;
  const d=dur(),fin=hora+d;
  return{fecha:iso(sel.y,sel.m,sel.d),hora:hm(hora),fin:hm(fin),dur:d,dia:diaLargo(sel.y,sel.m,sel.d),horaTxt:hh(hora)+' a '+hh(fin),texto:diaLargo(sel.y,sel.m,sel.d)+', '+hh(hora)+' a '+hh(fin)}}
 function pintar(){
  const d=dur(),primero=new Date(Date.UTC(mes.y,mes.m-1,1)),offset=(primero.getUTCDay()+6)%7,dias=new Date(Date.UTC(mes.y,mes.m,0)).getUTCDate();
  const h0=hoyBogota(),ultimo=sumarDias(h0.y,h0.m,h0.d,DIAS_ADELANTE),puedeAtras=!(mes.y===h0.y&&mes.m===h0.m),puedeAdelante=Date.UTC(mes.y,mes.m,1)<=Date.UTC(ultimo.y,ultimo.m-1,ultimo.d);
  let celdas='';for(let i=0;i<offset;i++)celdas+='<span class="ag-v"></span>';
  for(let n=1;n<=dias;n++){
   const ok=diaPosible(mes.y,mes.m,n,d),on=sel&&sel.y===mes.y&&sel.m===mes.m&&sel.d===n,esH=h0.y===mes.y&&h0.m===mes.m&&h0.d===n,red=reducido(mes.y,mes.m,n);
   celdas+=`<button type="button" class="ag-d${on?' on':''}${esH?' hoy':''}${red?' fes':''}" data-d="${n}"${ok?'':' disabled'} aria-pressed="${on?'true':'false'}" aria-label="${esc(diaLargo(mes.y,mes.m,n))}${red?' (horario reducido)':''}${ok?'':' (sin horarios)'}">${n}</button>`}
  let horas='';
  if(sel){
   const hs=horarios(sel.y,sel.m,sel.d,d),libres=hs.filter(x=>x.libre).length,[ab,ci]=horasDia(sel.y,sel.m,sel.d);
   horas=`<p class="ag-t"><b>${esc(diaLargo(sel.y,sel.m,sel.d))}</b><br>Atendemos de ${hh(ab)} a ${hh(ci)}. Cada visita dura unos ${d} min.</p>`+
    (hs.length?`<div class="ag-hs" role="group" aria-label="Horarios disponibles">${hs.map(x=>`<button type="button" class="ag-h${hora===x.t?' on':''}" data-h="${x.t}"${x.libre?'':' disabled'}>${hh(x.t)}</button>`).join('')}</div>`:'<p class="hint">Ya no quedan horarios para hoy. Elige otro día.</p>')+
    (hs.length&&!libres?'<p class="hint">Este día ya está completo. Elige otro día.</p>':'')}
  else horas='<p class="hint">Elige un día para ver los horarios disponibles.</p>';
  const v=valor();
  cont.innerHTML=`<div class="ag" id="${id}"><div class="ag-head"><button type="button" class="ag-nav" data-n="-1" aria-label="Mes anterior"${puedeAtras?'':' disabled'}>‹</button><b class="ag-mes">${MESES[mes.m-1]} ${mes.y}</b><button type="button" class="ag-nav" data-n="1" aria-label="Mes siguiente"${puedeAdelante?'':' disabled'}>›</button></div>
  <div class="ag-sem" aria-hidden="true">${SEM.map(x=>'<span>'+x+'</span>').join('')}</div><div class="ag-grid">${celdas}</div>
  <p class="ag-leyenda"><i class="ag-pt"></i> Domingos y festivos: horario reducido (9:00 AM a 12:30 PM)</p>${horas}
  ${aviso?'<p class="ag-aviso">'+esc(aviso)+'</p>':''}
  ${v?`<div class="ag-sel" role="status"><span>Tu cita</span><b>${esc(v.dia)}</b><b>${esc(v.horaTxt)}</b><button type="button" class="chip" data-q="1">Quitar</button></div>`:''}</div>`}
 function cambio(){if(opt.onChange)opt.onChange(valor())}
 cont.addEventListener('click',e=>{
  const n=e.target.closest('[data-n]'),dd=e.target.closest('[data-d]'),hs=e.target.closest('[data-h]'),q=e.target.closest('[data-q]');
  if(n){let m=mes.m+ +n.dataset.n,y=mes.y;if(m<1){m=12;y--}if(m>12){m=1;y++}mes={y,m};pintar();return}
  if(dd&&!dd.disabled){sel={y:mes.y,m:mes.m,d:+dd.dataset.d};hora=null;aviso='';pintar();cambio();return}
  if(hs&&!hs.disabled){hora=+hs.dataset.h;aviso='';pintar();cambio();return}
  if(q){sel=null;hora=null;pintar();cambio()}});
 /* Si cambia lo que eligió el cliente (otro servicio), se recalculan los horarios y se conserva la cita solo si sigue siendo posible */
 function refrescar(){
  const d=dur();
  if(sel&&hora!=null){const ok=horarios(sel.y,sel.m,sel.d,d).some(x=>x.t===hora&&x.libre);if(!ok){aviso='Cambió la duración del servicio y ese horario ya no sirve. Elige otro.';hora=null;cambio()}}
  pintar()}
 function recargar(){cargadas=0;return cargar(true).then(refrescar)}
 pintar();
 cargar().then(()=>{if(fallo&&JRG.conectado&&JRG.conectado()){aviso='No pudimos ver los horarios ocupados. Te confirmamos tu cita por WhatsApp.'}refrescar()});
 return{valor,refrescar,recargar,limpiar(){sel=null;hora=null;aviso='';pintar();cambio()}}}
window.JRGAgenda={crear,SERVICIOS,DUR,horarios,CUPOS};
})();
