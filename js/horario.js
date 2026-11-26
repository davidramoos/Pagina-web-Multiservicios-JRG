/* ===== Horario de atención (hora de Bogotá) y aviso "Abierto ahora / Cerrado" =====
   Lunes a sábado: 8:00 AM a 6:00 PM, jornada continua.  Domingos y festivos: 9:00 AM a 12:30 PM.
   Los festivos de Colombia se calculan solos (ley Emiliani + Semana Santa), no hay que actualizar nada cada año. */
(function(){
const HORARIO={semana:[8*60,18*60],festivo:[9*60,12*60+30]};
const pad=n=>String(n).padStart(2,'0');
function pascua(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mes=Math.floor((h+l-7*m+114)/31),dia=((h+l-7*m+114)%31)+1;return new Date(Date.UTC(y,mes-1,dia))}
const sumar=(d,n)=>new Date(d.getTime()+n*864e5);
const lunes=d=>{const w=d.getUTCDay();return w===1?d:sumar(d,(8-w)%7)};          // si no es lunes, pasa al lunes siguiente
const clave=d=>d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());
const cache={};
function festivos(y){if(cache[y])return cache[y];const s=new Set(),f=(m,d)=>new Date(Date.UTC(y,m-1,d)),P=pascua(y);
 [[1,1],[5,1],[7,20],[8,7],[12,8],[12,25]].forEach(x=>s.add(clave(f(x[0],x[1]))));                       // fijos
 [[1,6],[3,19],[6,29],[8,15],[10,12],[11,1],[11,11]].forEach(x=>s.add(clave(lunes(f(x[0],x[1])))));      // se pasan al lunes
 s.add(clave(sumar(P,-3)));s.add(clave(sumar(P,-2)));                                                      // Jueves y Viernes Santo
 [43,64,71].forEach(n=>s.add(clave(sumar(P,n))));                                                          // Ascensión, Corpus Christi, Sagrado Corazón
 return cache[y]=s}
function ahoraBogota(){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()),g=t=>+p.find(x=>x.type===t).value;
 return{y:g('year'),m:g('month'),d:g('day'),min:g('hour')*60+g('minute')}}
const hora=min=>{const h=Math.floor(min/60),m=min%60,ap=h>=12?'PM':'AM',h12=h%12||12;return h12+(m?':'+pad(m):'')+' '+ap};
function esFestivo(y,m,d){const f=new Date(Date.UTC(y,m-1,d));return f.getUTCDay()===0||festivos(y).has(clave(f))}
function estado(){const n=ahoraBogota(),fest=esFestivo(n.y,n.m,n.d),[a,c]=fest?HORARIO.festivo:HORARIO.semana;
 if(n.min>=a&&n.min<c)return{abierto:true,txt:'Abierto ahora · hasta las '+hora(c)};
 if(n.min<a)return{abierto:false,txt:'Cerrado · abrimos hoy a las '+hora(a)};
 for(let i=1;i<=8;i++){const t=new Date(Date.UTC(n.y,n.m-1,n.d+i)),fe=esFestivo(t.getUTCFullYear(),t.getUTCMonth()+1,t.getUTCDate()),ab=(fe?HORARIO.festivo:HORARIO.semana)[0];
  return{abierto:false,txt:'Cerrado · abrimos '+(i===1?'mañana':'el '+['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][t.getUTCDay()])+' a las '+hora(ab)}}}
function pintar(){const e=estado();document.querySelectorAll('[data-hstatus]').forEach(el=>{el.textContent=e.txt;el.classList.toggle('open',e.abierto);el.classList.toggle('closed',!e.abierto)})}
window.JRG_HORARIO={estado,festivos,esFestivo};
pintar();setInterval(pintar,60000);
})();
