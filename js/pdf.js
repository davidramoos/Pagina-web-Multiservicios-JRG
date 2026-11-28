/* ===== Documento PDF de la orden (pedido, cotización, reserva o cita) =====
   Se genera en el navegador del cliente con jsPDF (js/jspdf.umd.min.js, se carga solo al pedir el PDF).
   Uso:  JRGPdf.generar({codigo, fecha, titulo, cliente:{nombre,placa,celular}, cita:{fecha,hora,fin,dur,servicio}, lineas:[], total, notas:[]})  →  descarga "Orden-JRG-....pdf"  */
(function(){
const AZUL=[10,42,102],ROJO=[226,35,26],TINTA=[11,27,58],ACERO=[79,95,124],LINEA=[213,225,245],CIELO=[231,241,255];
const NEGOCIO={nombre:'MULTISERVICIOS JRG',lema:'Lubricación y mantenimiento automotriz · Bogotá',dir:'Carrera 5L 49D-08 Sur, Bogotá',tel:'312 552 9044 · 320 806 5049',
 horario:'Lunes a sábado 8:00 AM a 6:00 PM · Domingos y festivos 9:00 AM a 12:30 PM'};
let cargando=null;
function lib(){if(window.jspdf&&window.jspdf.jsPDF)return Promise.resolve(window.jspdf.jsPDF);if(cargando)return cargando;
 cargando=new Promise((ok,mal)=>{const s=document.createElement('script');s.src='js/jspdf.umd.min.js';s.onload=()=>window.jspdf?ok(window.jspdf.jsPDF):(cargando=null,mal(new Error('jsPDF')));s.onerror=()=>{cargando=null;mal(new Error('No se pudo cargar jsPDF'))};document.head.append(s)});return cargando}
function logo(){return new Promise(res=>{try{const src=window.IMGS&&IMGS['logomultijrg.png'];if(!src)return res(null);const im=new Image();
 im.onload=()=>{try{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);res({url:c.toDataURL('image/png'),w:im.naturalWidth,h:im.naturalHeight})}catch(e){res(null)}};
 im.onerror=()=>res(null);im.src=src}catch(e){res(null)}})}
/* Las fuentes estándar del PDF solo traen letras latinas (á é ñ ¿ ¡ sí): se cambian los símbolos que no existen */
const limpia=t=>String(t==null?'':t).replace(/[‐-―−]/g,'-').replace(/[‘’]/g,"'").replace(/[“”«»]/g,'"').replace(/→/g,'->').replace(/≈/g,'~').replace(/[•·]/g,'-').replace(/…/g,'...').replace(/[  ]/g,' ').replace(/[^ -ÿ]/g,'');
const mayus1=t=>t.charAt(0).toUpperCase()+t.slice(1);
async function construir(d){
 const JsPDF=await lib(),lg=await logo(),doc=new JsPDF({unit:'mm',format:'a4'}),W=210,H=297,M=16,AN=W-2*M;
 const set=(c,t)=>doc[t==='fill'?'setFillColor':t==='draw'?'setDrawColor':'setTextColor'](c[0],c[1],c[2]);
 const txt=(t,x,y,o)=>doc.text(limpia(t),x,y,o);
 function cabecera(){
  set(AZUL,'fill');doc.rect(0,0,W,36,'F');set(ROJO,'fill');doc.rect(0,36,W,1.6,'F');
  let x=M;
  if(lg){const h=22,w=Math.min(34,h*lg.w/lg.h);set([255,255,255],'fill');doc.roundedRect(M,7,w+4,h+0,2.5,2.5,'F');try{doc.addImage(lg.url,'PNG',M+2,7+(h-(w*lg.h/lg.w))/2,w,w*lg.h/lg.w)}catch(e){}x=M+w+9}
  set([255,255,255],'text');doc.setFont('helvetica','bold');doc.setFontSize(18);txt(NEGOCIO.nombre,x,17);
  doc.setFont('helvetica','normal');doc.setFontSize(9);txt(NEGOCIO.lema,x,23);txt(NEGOCIO.dir+'  |  '+NEGOCIO.tel,x,28.5);
  doc.setFont('helvetica','bold');doc.setFontSize(8.5);txt('ORDEN',W-M,13,{align:'right'});doc.setFontSize(13);txt(d.codigo||'',W-M,20,{align:'right'});
  doc.setFont('helvetica','normal');doc.setFontSize(8.5);txt(d.fecha||'',W-M,26,{align:'right'})}
 function pie(n,N){
  set(LINEA,'draw');doc.setLineWidth(.3);doc.line(M,H-19,W-M,H-19);set(ACERO,'text');doc.setFont('helvetica','normal');doc.setFontSize(7.8);
  txt(NEGOCIO.nombre+'  |  '+NEGOCIO.dir+'  |  '+NEGOCIO.tel,M,H-14);txt('Horario: '+NEGOCIO.horario,M,H-10);
  txt('Documento generado desde la página web de Multiservicios JRG. Valores estimados: el valor final se confirma al revisar tu vehículo.',M,H-6);
  txt('Página '+n+' de '+N,W-M,H-14,{align:'right'})}
 cabecera();let y=48;
 const salto=h=>{if(y+h>H-24){doc.addPage();cabecera();y=48}};
 set(AZUL,'text');doc.setFont('helvetica','bold');doc.setFontSize(16);
 const tt=doc.splitTextToSize(limpia(d.titulo||'Orden'),AN);doc.text(tt,M,y);y+=tt.length*7+1;
 /* Datos del cliente */
 const cl=d.cliente||{},filas=[['Cliente',cl.nombre],['Celular',cl.celular],['Placa / vehículo',cl.placa],['Correo',cl.correo]].filter(f=>f[1]);
 if(filas.length){salto(10+filas.length*7);set(LINEA,'draw');doc.setLineWidth(.4);doc.line(M,y,W-M,y);y+=6;
  set(ROJO,'text');doc.setFont('helvetica','bold');doc.setFontSize(9);txt('DATOS DEL CLIENTE',M,y);y+=6;
  filas.forEach(f=>{set(ACERO,'text');doc.setFont('helvetica','bold');doc.setFontSize(10);txt(f[0]+':',M,y);set(TINTA,'text');doc.setFont('helvetica','normal');
   const v=doc.splitTextToSize(limpia(f[1]),AN-42);doc.text(v,M+42,y);y+=Math.max(6.2,v.length*5.2+1)});y+=2}
 /* Cita agendada */
 if(d.cita){const c=d.cita,l1=c.dia||'',l2=c.hora||'',l3=[c.servicio,c.dur?'duración estimada: '+c.dur+' min':''].filter(Boolean).join('  |  '),alt=l3?36:30;
  salto(alt+6);set(CIELO,'fill');set(AZUL,'draw');doc.setLineWidth(.6);doc.roundedRect(M,y,AN,alt,3,3,'FD');
  set(ROJO,'text');doc.setFont('helvetica','bold');doc.setFontSize(9);txt('CITA AGENDADA',M+6,y+8);
  set(AZUL,'text');doc.setFontSize(15);txt(mayus1(l1),M+6,y+17);doc.setFontSize(13);txt(l2,M+6,y+25);
  if(l3){set(TINTA,'text');doc.setFont('helvetica','normal');doc.setFontSize(9);txt(l3,M+6,y+31.5)}
  doc.setFont('helvetica','bold');doc.setFontSize(8.5);set(ACERO,'text');txt('Estado: pendiente de confirmación por el taller',W-M-6,y+8,{align:'right'});
  y+=alt+8}
 /* Detalle */
 const ls=(d.lineas||[]).filter(Boolean);
 if(ls.length){salto(16);set(LINEA,'draw');doc.setLineWidth(.4);doc.line(M,y,W-M,y);y+=6;set(ROJO,'text');doc.setFont('helvetica','bold');doc.setFontSize(9);txt('DETALLE DE LA ORDEN',M,y);y+=6.5;
  doc.setFont('helvetica','normal');doc.setFontSize(10.5);
  ls.forEach((l,i)=>{const p=doc.splitTextToSize(limpia(l),AN-8),h=p.length*5.3+2.2;salto(h);
   if(i%2===0){set([247,250,255],'fill');doc.rect(M,y-4.4,AN,h,'F')}
   set(ROJO,'fill');doc.circle(M+2.2,y-1.3,.7,'F');set(TINTA,'text');doc.text(p,M+6,y);y+=h});y+=2}
 if(d.total!=null){salto(22);set(AZUL,'fill');doc.roundedRect(W-M-78,y,78,16,3,3,'F');set([255,255,255],'text');doc.setFont('helvetica','normal');doc.setFontSize(9);txt('TOTAL ESTIMADO',W-M-73,y+6.2);
  doc.setFont('helvetica','bold');doc.setFontSize(15);txt(d.totalTxt||String(d.total),W-M-5,y+12.6,{align:'right'});y+=24}
 /* Notas */
 const nt=(d.notas||[]).filter(Boolean);
 if(nt.length){salto(10+nt.length*6);set(ACERO,'text');doc.setFont('helvetica','normal');doc.setFontSize(9);
  nt.forEach(n=>{const p=doc.splitTextToSize('- '+limpia(n),AN);salto(p.length*4.6+1);doc.text(p,M,y);y+=p.length*4.6+1.4})}
 const N=doc.getNumberOfPages();for(let i=1;i<=N;i++){doc.setPage(i);pie(i,N)}
 return doc}
async function generar(d,guardar){const doc=await construir(d);const nombre=(d.archivo||('Orden-'+(d.codigo||'JRG')))+'.pdf';
 if(guardar===false)return doc.output('blob');doc.save(nombre);return nombre}
window.JRGPdf={generar,NEGOCIO};
})();
