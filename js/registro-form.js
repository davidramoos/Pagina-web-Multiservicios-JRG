(function(){
/* ---------- Formulario: registrar mi vehículo ---------- */
const MSG={placa:'Revisa la placa: debe verse como ABC123 (carro) o ABC12D (moto).',celular:'Escribe un celular colombiano de 10 dígitos que empiece por 3.',nombre:'Escribe tu nombre completo.',acepta:'Debes aceptar el tratamiento de datos para registrarte.',fecha:'Escribe la fecha de tu cambio de aceite (no puede ser futura).',cantidad:'Escribe la cantidad en cuartos, por ejemplo 4 o 5.25.',celular_distinto:'Esa placa ya está registrada con otro celular. Escribe el mismo celular con el que te registraste, o contáctanos por WhatsApp.',ocupado:'Hay muchas solicitudes en este momento. Intenta de nuevo en un minuto.',sin_api:'El registro en línea todavía no está activado. Escríbenos con el botón de WhatsApp y te registramos.',red:'No pudimos enviar tu registro. Revisa tu conexión e intenta de nuevo.',error:'No pudimos guardar tu registro. Intenta de nuevo o escríbenos con el botón de WhatsApp.'};
const err=t=>{const e=$('#rerr');e.textContent=t||'';e.hidden=!t};
/* Calendario para agendar la próxima visita (opcional): los horarios dependen del servicio escogido */
const SV=$('#rsv');SV.innerHTML=JRGAgenda.SERVICIOS.map(x=>`<option value="${x[0]}">${x[1]} (unos ${x[2]} min)</option>`).join('');SV.value='aceite_filtros';
const AGR=JRGAgenda.crear($('#agR'),{dur:()=>JRGAgenda.DUR[SV.value]||30});SV.onchange=()=>AGR.refrescar();
const svTxt=()=>(JRGAgenda.SERVICIOS.find(x=>x[0]===SV.value)||[])[1]||'';
$('#rv').onsubmit=async e=>{e.preventDefault();err('');
 const placa=$('#rp').value.toUpperCase().replace(/[^A-Z0-9]/g,''),cel=$('#rc').value.replace(/\D/g,'');
 if(!/^[A-Z]{3}\d{2}[A-Z0-9]$/.test(placa))return err(MSG.placa);
 if($('#rn').value.trim().length<3)return err(MSG.nombre);
 if(!/^3\d{9}$/.test(cel))return err(MSG.celular);
 if(!$('#rch').checked)return err(MSG.acepta);
 if(!$('#rf').value)return err(MSG.fecha);
 if($('#rrec').checked&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($('#re').value.trim()))return err('Para el recordatorio escribe un correo válido.');
 if(AGR.valor()){await AGR.recargar();if(!AGR.valor())return err('Ese horario ya no está disponible. Elige otro en el calendario.')}
 const b=$('#rbtn');b.disabled=true;b.textContent='Guardando…';
 const r=await JRG.registrar({placa,tipo:$('#rt').value,marca:$('#rm').value,modelo:$('#rmo').value,anio:$('#ra').value,nombre:$('#rn').value,celular:cel,km:$('#rk').value,aceite:$('#ro').value,cantidad:$('#rq').value,fecha:$('#rf').value,correo:$('#re').value.trim(),recordar:$('#rrec').checked,acepta:true,web:$('#rw').value});
 b.disabled=false;b.textContent='Registrar mi vehículo';
 if(!r||!r.ok)return err(MSG[r&&r.error]||MSG.error);
 const cv=AGR.valor();let citaRes='';
 if(cv){const ra=await JRG.agendar({fecha:cv.fecha,hora:cv.hora,dur:cv.dur,nombre:$('#rn').value.trim(),celular:cel,placa,servicio:svTxt(),detalle:'Cita pedida al registrar el vehículo',web:''});citaRes=ra&&ra.ok?'ok':(ra&&ra.error==='horario_ocupado'?'ocupado':'pendiente')}
 $('#rv').hidden=true;$('#rok').hidden=false;mostrarCita(placa,cel,cv,citaRes);$('#rokp').textContent=placa;window._rp=placa;window._rc=cel;try{const T=window.JRGTarjeta,nu=!r.duplicado&&r.nuevo!==false;$('#rtarj').innerHTML=T&&nu?T.html({vehiculo:[$('#rm').value,$('#rmo').value,$('#ra').value].filter(Boolean).join(' ').trim()||'Mi vehículo',contacto:{nombre:$('#rn').value.trim()},cambios:[{f:$('#rf').value,aceite:$('#ro').value,cant:$('#rq').value,km:$('#rk').value}]},placa,{status:false,reg:true}):''}catch(x){console.warn(x)};$('#rokd').textContent=r.duplicado?'Ese cambio ya estaba registrado para esta placa.':r.nuevo===false?'Listo, agregamos este cambio al historial de tu vehículo.':'Tu vehículo quedó registrado. Ya puedes buscar tu historial con tu placa cuando quieras.'};
$('#rtar').onclick=()=>verTarjeta(window._rp,window._rc);
let ultimo=null;
function mostrarCita(placa,cel,cv,res){
 const e=$('#rcita');e.hidden=!cv;try{$('#rok').scrollIntoView({block:'start'})}catch(x){}
 if(cv){e.className=res==='ok'?'tok':'twarn';e.textContent=res==='ok'?'Tu cita quedó registrada para el '+cv.texto+'. El taller te la confirma por WhatsApp o llamada.':res==='ocupado'?'Tu vehículo quedó registrado, pero ese horario se acaba de ocupar. Escríbenos por WhatsApp o elige otro horario al cotizar.':'Tu vehículo quedó registrado. No pudimos enviar tu cita automáticamente: escríbenos por WhatsApp para confirmarla ('+cv.texto+').'}
 const veh=[$('#rm').value,$('#rmo').value,$('#ra').value].filter(Boolean).join(' ').trim(),ac=$('#ro').value.trim(),cu=$('#rq').value.trim(),km=$('#rk').value.trim();
 ultimo={cv:res==='ocupado'?null:cv,titulo:cv&&res!=='ocupado'?'Registro de vehículo y cita':'Registro de vehículo',srv:svTxt(),
  cliente:{nombre:$('#rn').value.trim(),celular:cel,placa,correo:$('#re').value.trim()},
  lineas:['Vehículo: '+(veh||'sin datos')+' ('+$('#rt').value+')',...(km?['Kilometraje: '+km+' km']:[]),'Último cambio: '+$('#rf').value+(ac?' con '+ac:'')+(cu?' ('+cu+' cuartos)':''),...(cv&&res!=='ocupado'?['Servicio que pidió agendar: '+svTxt()]:[])]}}
$('#rpdf').onclick=async()=>{if(!ultimo)return;const b=$('#rpdf'),u=ultimo,cv=u.cv,code='JRG-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+String(Math.floor(Math.random()*9000)+1000);
 b.disabled=true;b.textContent='Generando PDF…';
 try{await JRGPdf.generar({codigo:code,fecha:new Date().toLocaleString('es-CO'),titulo:u.titulo,cliente:u.cliente,cita:cv?{dia:cv.dia,hora:cv.horaTxt,dur:cv.dur,servicio:u.srv}:null,lineas:u.lineas,total:null,
  notas:['Tu vehículo quedó registrado en el historial de Multiservicios JRG.',...(cv?['Tu cita queda pendiente hasta que el taller la confirme por WhatsApp o llamada. Si no puedes asistir, avísanos.']:[]),'Presenta este documento en el local, en el celular o impreso.'],archivo:'Registro-'+code});b.textContent='PDF descargado ✓'}
 catch(x){console.warn(x);b.textContent='No se pudo generar. Reintentar'}
 b.disabled=false;setTimeout(()=>{b.textContent='Descargar PDF'},2500)};
const dl=(id,l)=>{let d=$('#'+id);if(!d){d=document.createElement('datalist');d.id=id;document.body.append(d)}d.innerHTML=l.map(x=>'<option value="'+esc(x)+'">').join('')};
dl('dlm',Object.keys(VEH).map(b=>b.replace(/\s*\(moto\)/,'')));$('#rm').setAttribute('list','dlm');
const mods=()=>{const b=$('#rm').value.trim().toLowerCase(),k=Object.keys(VEH).find(x=>x.replace(/\s*\(moto\)/,'').toLowerCase()===b);dl('dlmo',k?Object.keys(VEH[k]):[])};
$('#rm').addEventListener('input',mods);$('#rmo').setAttribute('list','dlmo');
$('#rotro').onclick=()=>{$('#rv').reset();SV.value='aceite_filtros';AGR.limpiar();ultimo=null;$('#rcita').hidden=true;$('#rtarj').innerHTML='';$('#rv').hidden=false;$('#rok').hidden=true;$('#rp').focus()};
/* ---------- Código QR para el local (se abre con  #qr  al final de la dirección); lleva a  #ingreso  (placa + kilometraje) ---------- */
function dibujar(){const u=$('#qrurl').value.trim(),box=$('#qrbox');
 if(!/^https?:\/\//i.test(u)){box.innerHTML='<p class="hint">Escribe la dirección completa de tu página (empieza por https://).</p>';return}
 const q=qrcode(0,'M');q.addData(u);q.make();box.innerHTML=q.createSvgTag({cellSize:8,margin:2,scalable:true})}
function base(){let b='';try{b=location.href.split('#')[0]}catch(e){}return /^https?:/i.test(b)&&!/claudeusercontent|localhost|127\.0\.0\.1/.test(b)?b+'#ingreso':''}
window.qrIniciar=()=>{const b=base();$('#qrurl').value=b||'https://TU-PAGINA.com/#ingreso';$('#qrwarn').hidden=!!b;dibujar()};
$('#qrurl').oninput=dibujar;
$('#qrprint').onclick=()=>{document.body.classList.add('pq');print();setTimeout(()=>document.body.classList.remove('pq'),800)};
$('#qrpng').onclick=()=>{const s=$('#qrbox svg');if(!s)return;const W=1200,x=new XMLSerializer().serializeToString(s),im=new Image();
 im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=W;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,W);g.drawImage(im,0,0,W,W);
  c.toBlob(bl=>{const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='QR-ingreso-JRG.png';document.body.append(a);a.click();a.remove()},'image/png')};
 im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(x)};
$('#qrcopy').onclick=()=>{const u=$('#qrurl').value.trim();(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>{$('#qrcopy').textContent='¡Copiada!'},()=>{$('#qrurl').select()});setTimeout(()=>$('#qrcopy').textContent='Copiar dirección',1500)};
$('#qrdown').onclick=()=>{const s=$('#qrbox svg');if(!s)return;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s.outerHTML],{type:'image/svg+xml'}));a.download='QR-ingreso-JRG.svg';document.body.append(a);a.click();a.remove()};
})();
