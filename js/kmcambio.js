/* ===== PRÓXIMO cambio: por KILÓMETROS o por FECHA (según cómo se controle cada vehículo) =====
   Por km (el KM ACTUAL de la hoja es un número):
     Mineral y granel (SAE 50, 20W-50, 25W-50 y demás) → +5.000 km · Semisintético (10W-30, 10W-40, 15W-40 …) → +6.000 km · Full sintético → +10.000 km
   Por fecha (el KM ACTUAL de la hoja es una fecha, porque ese carro se controla por tiempo):
     Mineral y granel → 3 a 4 meses · Semisintético → 7 a 9 meses · Full sintético → 12 meses
   Son dos formas distintas: cada vehículo se controla por una u otra, no por «lo que ocurra primero».
   «SELLADO» y «GRANEL» solo diferencian la presentación del mismo aceite; el tipo sale de la marca y la viscosidad.
   Para cambiar las reglas, edita SOLO las constantes KM y MESES de abajo (y las mismas de apps_script_km.gs).
   Orden de decisión: 1) palabras «semisintético»  2) «sintético / synthetic»  3) «mineral»  4) viscosidad
   (0W y 5W = sintético · 10W y 15W = semisintético · 20W, 25W y SAE 30/40/50/60 = mineral). Si no se puede saber, no se inventa nada. */
(function(){
const KM={mineral:5000,semi:6000,sintetico:10000};
const MESES={mineral:[3,4],semi:[7,9],sintetico:[12,12]};   // [mínimo, máximo]
const ETQ={mineral:'mineral o a granel',semi:'semisintético',sintetico:'sintético'};
const NU=s=>String(s==null?'':s).normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
function base(txt){const t=NU(txt).replace(/(W\s*\d)O\b/g,'$10').replace(/\b(MX|DELO|RIMULA)\s*145W/g,'$1 15W');if(!t.trim())return'';
 if(/VALVULINA|HIDRAUL|HYDRAUL|\bATF\b|REFRIGERANTE|LIQUIDO|ENGRASE|GRASA|TRANSMISION|DIFERENCIAL/.test(t)&&!/ACEITE (DE )?MOTOR/.test(t))return'';
 if(/SEMI[\s-]*(SINT|SYNT)|TECHNOSYNTH|SYNTH(ETIC)?[\s-]*BLEND|\bSEMI\b/.test(t))return'semi';
 if(/SINTETIC|SYNTHETIC|\bSYN\b|FULL[\s-]*(SINT|SYNT)|100\s*%\s*SINT/.test(t))return'sintetico';
 if(/MINERAL/.test(t))return'mineral';
 const v=/(?:^|[^0-9])(0|5|10|15|20|25)\s*W\s*[-\/ ]?\s*(\d{2,3})(?!\d)/.exec(t)||/(?:^|[^0-9])(0|5|10|15|20|25)\s*W(?![A-Z0-9])/.exec(t);
 if(v){const w=+v[1];return w<=5?'sintetico':w<=15?'semi':'mineral'}
 if(/\bSAE[\s-]*(30|40|50|60)\b|\b(30|40|50|60)\s*(SAE|MONOGRADO)\b|\b1350\b|\bHD[\s-]?(30|40|50|60)\b/.test(t))return'mineral';
 if(!/\b2T\b|\d\s*W\s*\d/.test(t)&&/(?:^|\s)(40|50|60)(?:\s|$)/.test(t))return'mineral';   // monogrado escrito solo con el número (p. ej. «OILTEC 50»)
 return''}
function tipo(txt){const s=String(txt==null?'':txt),t=base(s.replace(/\bA\s+GRANEL\b|\bGRANEL\b|\bSELLADOS?\b/gi,' '));
 if(t)return t;
 return /GRANEL/i.test(s)&&!/VALVULINA|HIDRAUL|HYDRAUL|\bATF\b|REFRIGERANTE|LIQUIDO|ENGRASE|GRASA|TRANSMISION|DIFERENCIAL/i.test(s)?'mineral':''}
const inc=txt=>KM[tipo(txt)]||0;
/* ---- fechas y kilómetros escritos en la hoja: 25/10/2026 · 25-10-26 · 2026-10-25 ---- */
function fechas(t){const s=String(t==null?'':t),re=/(?<!\d)(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})(?!\d)|(\d{4})-(\d{2})-(\d{2})/g,out=[];let m;
 while((m=re.exec(s)))out.push(m[4]?new Date(+m[4],+m[5]-1,+m[6]):new Date(+m[3]<100?+m[3]+2000:+m[3],+m[2]-1,+m[1]));return out}
const esFecha=t=>fechas(t).length>0;
const nOf=v=>{const n=parseInt(String(v==null?'':v).replace(/\D/g,''),10);return isNaN(n)?0:n};
const esKm=t=>{t=String(t==null?'':t).trim();return /^\d[\d.,\s]*(km|kms|kilometros)?$/i.test(t)&&!esFecha(t)&&nOf(t)>=1000};
const kmNum=t=>esKm(t)?nOf(t):0;                              // 0 si no es un kilometraje (por ejemplo si trae una fecha)
const prox=(km,txt)=>{km=kmNum(km);const i=inc(txt);return km&&i?km+i:0};
const etiqueta=txt=>ETQ[tipo(txt)]||'';
const meses=txt=>MESES[tipo(txt)]||null;
const addMes=(d,n)=>{const x=new Date(d.getFullYear(),d.getMonth()+n,1),u=new Date(x.getFullYear(),x.getMonth()+1,0).getDate();x.setDate(Math.min(d.getDate(),u));return x};
/* Próximo cambio de UN cambio de la hoja c={f,aceite,km,prox,pk}:
   {modo:'fecha',desde,hasta} · {modo:'km',km} · {modo:'est',desde,hasta} (no hay dato: se estima con la fecha del último cambio) · null */
function proximo(c){c=c||{};const pr=String(c.prox==null?'':c.prox).trim(),ds=fechas(pr),m=MESES[tipo(c.aceite)];
 if(ds.length)return{modo:'fecha',desde:ds[0],hasta:ds[ds.length-1]};                                   // lo escribió el taller (o el sistema) en PRÓX. CAMBIO
 if(esKm(pr))return{modo:'km',km:nOf(pr)};
 if(nOf(c.pk)>=1000)return{modo:'km',km:nOf(c.pk)};
 const k=prox(c.km,c.aceite);if(k)return{modo:'km',km:k};
 const j=fechas(c.km)[0];if(j&&m)return{modo:'fecha',desde:addMes(j,m[0]),hasta:addMes(j,m[1])};      // KM ACTUAL es una fecha: se controla por tiempo
 const f=fechas(c.f)[0];if(f){const mm=m||[3,3];return{modo:'est',desde:addMes(f,mm[0]),hasta:addMes(f,mm[1])}}
 return null}
function leyenda(modo,aceite){const t=tipo(aceite),e=ETQ[t];
 if(!t)return modo==='km'?'Por kilometraje':'Por fecha';
 const E=e.charAt(0).toUpperCase()+e.slice(1);
 if(modo==='km')return E+' · cada '+KM[t].toLocaleString('es-CO')+' km';
 const m=MESES[t];return E+' · cada '+(m[0]===m[1]?m[0]+' meses':m[0]+' a '+m[1]+' meses')}
window.JRGKm={KM,MESES,tipo,inc,prox,etiqueta,meses,fechas,esFecha,esKm,kmNum,proximo,leyenda,addMes};
})();
