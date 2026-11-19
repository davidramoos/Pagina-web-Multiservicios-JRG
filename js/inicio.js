(function(){

const sl=$$('.slide');let si=0,tm;const dots=$('#dots');
sl.forEach((_,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','Ir a la diapositiva '+(i+1));b.onclick=()=>{go(i);auto()};dots.append(b)});
function go(i){si=(i+sl.length)%sl.length;sl.forEach((s,k)=>s.classList.toggle('on',k===si));$$('#dots button').forEach((b,k)=>b.classList.toggle('on',k===si))}
function auto(){clearInterval(tm);if(!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))tm=setInterval(()=>go(si+1),6500)}
$('#pv').onclick=()=>{go(si-1);auto()};$('#nx').onclick=()=>{go(si+1);auto()};$('#slides').onmouseenter=()=>clearInterval(tm);$('#slides').onmouseleave=auto;go(0);auto();
const pick=(a,n)=>{const by={};a.forEach(p=>(by[p.b]=by[p.b]||[]).push(p));const ks=Object.keys(by),out=[];for(let r=0;out.length<n&&r<4;r++)ks.forEach(k=>{if(by[k][r]&&out.length<n)out.push(by[k][r])});return out};
const fill=(id,l)=>$(id).innerHTML=pick(l.filter(p=>p.st),10).map(cardHTML).join('');
const render=()=>{fill('#c1',P.filter(p=>p.c==='ac'&&p.pr==='Cuarto'));fill('#c2',P.filter(p=>p.c==='am'&&p.pr==='Cuarto'));fill('#c3',P.filter(p=>['amb','sil','bel'].includes(p.c)))};render();(window.descHooks=window.descHooks||[]).push(render);
const cnt=k=>P.filter(p=>p.c===k).length;
$('#tiles').innerHTML=[['ac','Aceites para carro','oil','#E2231A','10W-40'],['am','Aceites para moto','oil','#1D4EA8','20W-50'],['fa','Filtros de aire','airf','#0A2A66'],['fi','Filtros de aceite','filter','#E2231A'],['fc','Filtros de combustible','filter','#6B7C99'],['gr','Grasas','grease','#E2231A'],['amb','Ambientadores','tree','#2E9E45'],['sil','Siliconas y brillo','spray','#1565C0'],['fre','Frenos','pad','#E2231A'],['bat','Baterías','bat','#1565C0'],['bom','Bombillos y eléctricos','bulb'],['ref','Refrigerantes','bottle','#0A88C9']].map(t=>`<a class="tile" role="button" tabindex="0" data-go="productos?cat=${t[0]}">${art(t[2],t[3],t[4])}${t[1]}<br><small style="color:var(--steel);font-weight:600">${cnt(t[0]).toLocaleString('es-CO')} productos</small></a>`).join('')+'<a class="tile" role="button" tabindex="0" data-go="productos" style="display:grid;place-content:center;background:var(--red);color:#fff;border-color:var(--red)">Ver todo el catálogo<br><small>'+P.length.toLocaleString('es-CO')+' productos</small></a>';
const bn={};P.filter(p=>['ac','am'].includes(p.c)&&p.b!=='Otras marcas').forEach(p=>bn[p.b]=(bn[p.b]||0)+1);
$('#brands').innerHTML=Object.keys(bn).sort((a,b)=>bn[b]-bn[a]).map(b=>`<a role="button" tabindex="0" data-go="productos?marca=${encodeURIComponent(b)}" style="background:${BCOL[b]||'#0A2A66'};${b==='Shell'?'color:#111':''}">${b}</a>`).join('');
$('#minis').innerHTML=[['Cambio de filtro de aceite'],['Cambio de filtro de aire'],['Cambio de filtro de combustible'],['Revisión de niveles'],['Cambio de líquido de frenos'],['Aceite y filtro para motos'],['Carga de baterías','$12.000'],['Nitrógeno para llantas','$6.000']].map(([s,pr])=>`<a class="mini" role="button" tabindex="0" data-go="contacto?servicio=${encodeURIComponent(s)}&to=cita">${s}${pr?`<b>${pr}</b>`:'<span>+</span>'}</a>`).join('');

})();
(function(){
function setServicio(sv){const sel=$('#cs');if(!sv)return;if(![...sel.options].some(o=>o.text===sv))sel.add(new Option(sv,sv));sel.value=sv}window.setServicio=setServicio;
$('#cita').onsubmit=e=>{e.preventDefault();const L=['Servicio: '+$('#cs').value];if($('#cd').value)L.push('Fecha preferida: '+$('#cd').value);if($('#cm').value.trim())L.push('Notas: '+$('#cm').value.trim());ticket({t:'Solicitud de cita',lines:L,ask:null,who:{nombre:$('#cn').value.trim(),placa:$('#cv').value.trim().toUpperCase()}})}
})();
(function(){let h='';try{h=(location.hash||'').slice(1)}catch(e){}go(['cotizar','productos','contacto','registro','qr','nosotros'].includes(h)?h:'inicio')})();

$$('[data-i]').forEach(e=>e.src=IMGS[e.dataset.i]);
