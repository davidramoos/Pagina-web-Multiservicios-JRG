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
$('#brands').innerHTML=Object.keys(bn).sort((a,b)=>bn[b]-bn[a]).map(b=>`<a role="button" tabindex="0" data-go="productos?marca=${encodeURIComponent(b)}" style="background:${BCOL[b]||'#2F6FD6'};${['Shell','Repsol','Petrobras'].includes(b)?'color:#111':''}${b==='Castrol'?'background:#087A33':''}">${b}</a>`).join('');
$('#minis').innerHTML=[['Cambio de filtro de aceite'],['Cambio de filtro de aire'],['Cambio de filtro de combustible'],['Revisión de niveles'],['Cambio de líquidos'],['Aceite y filtro para motos'],['Carga de baterías','$12.000'],['Nitrógeno para llantas','$6.000']].map(([s,pr])=>`<a class="mini" role="button" tabindex="0" data-go="${s==='Cambio de líquidos'?'liquidos':'contacto?servicio='+encodeURIComponent(s)+'&to=cita'}">${s}${pr?`<b>${pr}</b>`:'<span>+</span>'}</a>`).join('');

})();
(function(){
function setServicio(sv){const sel=$('#cs');if(!sv)return;if(![...sel.options].some(o=>o.text===sv))sel.add(new Option(sv,sv));sel.value=sv}window.setServicio=setServicio;
$('#cita').onsubmit=e=>{e.preventDefault();const L=['Servicio: '+$('#cs').value];if($('#cd').value)L.push('Fecha preferida: '+$('#cd').value);if($('#cm').value.trim())L.push('Notas: '+$('#cm').value.trim());ticket({t:'Solicitud de cita',lines:L,ask:null,who:{nombre:$('#cn').value.trim(),placa:$('#cv').value.trim().toUpperCase()}})}
})();
(function(){let h='';try{h=(location.hash||'').slice(1)}catch(e){}go(['cotizar','liquidos','productos','contacto','registro','ingreso','qr','nosotros','datos'].includes(h)?h:'inicio',{},'replace')})();

$$('[data-i]').forEach(e=>e.src=IMGS[e.dataset.i]);

(function(){
const T=[
['¿Cada cuánto cambio un aceite mineral o a granel?','Cada 5.000 km. Si tu vehículo se controla por tiempo, cada 3 a 4 meses.'],
['¿Y el semisintético?','Cada 7.000 km, o cada 7 a 9 meses si tu control es por fecha.'],
['¿Y el aceite sintético?','Cada 10.000 km, o una vez al año si tu control es por fecha.'],
['Cambia el filtro con el aceite','Un filtro viejo ensucia el aceite nuevo. Pídelo junto con tu cambio y queda todo al día.'],
['Tu historial está guardado con tu placa','Entra a Cotizar, elige «Ya he cambiado acá» y mira tus cambios anteriores y cuándo te toca el próximo.'],
['Revisa el nivel entre cambios','Con el motor frío y en piso plano: si está por debajo de la marca, avísanos y lo completamos.'],
['Luz roja del aceite encendida','Apaga el motor apenas puedas hacerlo con seguridad. Seguir manejando sin presión de aceite puede dañarlo en pocos minutos.'],
['No sobreexijas el motor frío','Los primeros minutos maneja suave y sin acelerar a fondo. El aceite todavía no llegó a su temperatura y protege menos.'],
['No hace falta calentarlo mucho','Con unos 30 segundos de ralentí basta. Es mejor arrancar y andar suave los primeros kilómetros que dejarlo encendido parado.'],
['Mide el aceite bien','Apaga el motor y espera unos 5 minutos antes de sacar la varilla, para que el aceite baje al cárter y la lectura sea real.'],
['Si el aceite se ve oscuro, no te asustes','El aceite oscuro limpia: arrastra la suciedad del motor. Lo que sí es mala señal es que se vea lechoso (puede tener agua o refrigerante).'],
['Si te falta aceite en la carretera','Completar con otro aceite es mejor que andar con el nivel bajo. Después haz el cambio completo y usa la viscosidad que pide tu manual.'],
['Trayectos cortos, cambio por tiempo','Si casi siempre haces recorridos cortos, el motor no alcanza a calentarse bien y el aceite se contamina antes. Cámbialo por fecha, no solo por km.'],
['Un carro parado también necesita aceite nuevo','Aunque ruede poco, el aceite envejece con el tiempo y la humedad. Por eso también hay cambio por fecha.'],
['Filtro de aire tapado','El motor respira peor, pierde fuerza y gasta más combustible. Revísalo en cada cambio de aceite, y más seguido si andas por vías destapadas.'],
['Filtro de combustible sucio','Si el carro se ahoga, tironea o pierde fuerza al acelerar, el filtro de combustible puede estar tapado.'],
['Nunca abras el radiador caliente','El refrigerante sale a presión y puede quemarte. Espera a que el motor se enfríe del todo antes de quitar la tapa.'],
['Si la aguja de temperatura sube','Apaga el motor en un lugar seguro y espera. Seguir manejando caliente puede torcer la culata, una reparación muy costosa.'],
['Cuidado al mezclar refrigerantes','Los de distinta química pueden formar gel y tapar el sistema. Pregúntanos cuál lleva tu carro antes de completar.'],
['Luz de «check engine»','Encendida fija: revisa pronto. Si parpadea, para el carro: puede haber fallos fuertes de encendido que dañan el catalizador.'],
['Si tu carro es turbo','Después de manejar exigido, déjalo unos segundos en ralentí antes de apagarlo para que el turbo se enfríe con aceite circulando.'],
['Bornes de la batería','El polvo blanco o verdoso en los bornes dificulta el arranque. Límpialos y ajústalos. Si tu batería está floja, en el taller hacemos carga de baterías.'],
['Presión de las llantas','Revísala en frío al menos una vez al mes. Con poca presión gastas más combustible y las llantas se desgastan de forma despareja.'],
['Motos: aceite de moto','Las motos con embrague en baño de aceite necesitan aceite para moto (norma JASO MA). El de carro puede hacer patinar el embrague.'],
['La correa de repartición no avisa','Si se rompe, el motor puede dañarse en segundos. Cámbiala según el kilometraje o el tiempo que indica el fabricante, aunque se vea bien.'],
['¿Sabías que el aceite hace más que lubricar?','También refrigera piezas internas, limpia residuos y protege contra la corrosión.'],
['¿Sabías qué significa la «W» en 10W-40?','Viene de «winter» (invierno). El primer número indica qué tan fluido es en frío y el segundo, qué tan espeso es en caliente.'],
['¿Sabías que tu filtro tiene una válvula de emergencia?','Si el filtro se tapa, una válvula deja pasar aceite sin filtrar para no dejar el motor sin lubricación. Por eso no conviene alargar el cambio.'],
['¿Sabías que es normal que el motor gaste algo de aceite?','Una parte se quema en el funcionamiento. Por eso es importante revisar el nivel entre cambios.'],
['¿Sabías cuánto trae un cuarto de aceite?','Un cuarto equivale a unos 0,95 litros, casi un litro. Muchos motores de carro usan entre 3 y 5 cuartos.'],
['¿Sabías que el aceite sintético aguanta más calor?','Resiste mejor las altas temperaturas y se degrada más despacio, por eso dura más kilómetros entre cambios.']];
const h=$('#boltH'),p=$('#boltP'),bn=$('#boltN'),bb=$('#boltB'),bc=$('#boltC');if(!h||!p||!bn||!bb)return;
/* Orden al azar (se mezcla una vez al abrir la página). «Anterior» y «Siguiente» recorren la lista en círculo. */
const o=T.map((_,k)=>k);for(let k=o.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[o[k],o[j]]=[o[j],o[k]]}
let i=0;
const show=()=>{const t=T[o[i]];h.textContent=t[0];p.textContent=t[1];if(bc)bc.textContent=(i+1)+' / '+o.length};
bn.onclick=()=>{i=(i+1)%o.length;show()};
bb.onclick=()=>{i=(i-1+o.length)%o.length;show()};
show();
})();
