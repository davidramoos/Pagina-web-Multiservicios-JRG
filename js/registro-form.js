(function(){
/* ---------- Formulario: registrar mi vehículo ---------- */
const MSG={placa:'Revisa la placa: debe verse como ABC123 (carro) o ABC12D (moto).',celular:'Escribe un celular colombiano de 10 dígitos que empiece por 3.',nombre:'Escribe tu nombre completo.',acepta:'Debes aceptar el tratamiento de datos para registrarte.',fecha:'Escribe la fecha de tu cambio de aceite (no puede ser futura).',cantidad:'Escribe la cantidad en cuartos, por ejemplo 4 o 5.25.',celular_distinto:'Esa placa ya está registrada con otro celular. Escribe el mismo celular con el que te registraste, o contáctanos por WhatsApp.',ocupado:'Hay muchas solicitudes en este momento. Intenta de nuevo en un minuto.',sin_api:'El registro en línea todavía no está activado. Escríbenos con el botón de WhatsApp y te registramos.',red:'No pudimos enviar tu registro. Revisa tu conexión e intenta de nuevo.',error:'No pudimos guardar tu registro. Intenta de nuevo o escríbenos con el botón de WhatsApp.'};
const err=t=>{const e=$('#rerr');e.textContent=t||'';e.hidden=!t};
$('#rv').onsubmit=async e=>{e.preventDefault();err('');
 const placa=$('#rp').value.toUpperCase().replace(/[^A-Z0-9]/g,''),cel=$('#rc').value.replace(/\D/g,'');
 if(!/^[A-Z]{3}\d{2}[A-Z0-9]$/.test(placa))return err(MSG.placa);
 if($('#rn').value.trim().length<3)return err(MSG.nombre);
 if(!/^3\d{9}$/.test(cel))return err(MSG.celular);
 if(!$('#rch').checked)return err(MSG.acepta);
 if(!$('#rf').value)return err(MSG.fecha);
 if($('#rrec').checked&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($('#re').value.trim()))return err('Para el recordatorio escribe un correo válido.');
 const b=$('#rbtn');b.disabled=true;b.textContent='Guardando…';
 const r=await JRG.registrar({placa,tipo:$('#rt').value,marca:$('#rm').value,modelo:$('#rmo').value,anio:$('#ra').value,nombre:$('#rn').value,celular:cel,km:$('#rk').value,aceite:$('#ro').value,cantidad:$('#rq').value,fecha:$('#rf').value,correo:$('#re').value.trim(),recordar:$('#rrec').checked,acepta:true,web:$('#rw').value});
 b.disabled=false;b.textContent='Registrar mi vehículo';
 if(!r||!r.ok)return err(MSG[r&&r.error]||MSG.error);
 $('#rv').hidden=true;$('#rok').hidden=false;$('#rokp').textContent=placa;window._rp=placa;window._rc=cel;$('#rokd').textContent=r.duplicado?'Ese cambio ya estaba registrado para esta placa.':r.nuevo===false?'Listo, agregamos este cambio al historial de tu vehículo.':'Tu vehículo quedó registrado. Ya puedes buscar tu historial con tu placa cuando quieras.'};
$('#rtar').onclick=()=>verTarjeta(window._rp,window._rc);
const dl=(id,l)=>{let d=$('#'+id);if(!d){d=document.createElement('datalist');d.id=id;document.body.append(d)}d.innerHTML=l.map(x=>'<option value="'+esc(x)+'">').join('')};
dl('dlm',Object.keys(VEH).map(b=>b.replace(/\s*\(moto\)/,'')));$('#rm').setAttribute('list','dlm');
const mods=()=>{const b=$('#rm').value.trim().toLowerCase(),k=Object.keys(VEH).find(x=>x.replace(/\s*\(moto\)/,'').toLowerCase()===b);dl('dlmo',k?Object.keys(VEH[k]):[])};
$('#rm').addEventListener('input',mods);$('#rmo').setAttribute('list','dlmo');
$('#rotro').onclick=()=>{$('#rv').reset();$('#rv').hidden=false;$('#rok').hidden=true;$('#rp').focus()};
/* ---------- Código QR para el local (se abre con  #qr  al final de la dirección) ---------- */
function dibujar(){const u=$('#qrurl').value.trim(),box=$('#qrbox');
 if(!/^https?:\/\//i.test(u)){box.innerHTML='<p class="hint">Escribe la dirección completa de tu página (empieza por https://).</p>';return}
 const q=qrcode(0,'M');q.addData(u);q.make();box.innerHTML=q.createSvgTag({cellSize:8,margin:2,scalable:true})}
function base(){let b='';try{b=location.href.split('#')[0]}catch(e){}return /^https?:/i.test(b)&&!/claudeusercontent|localhost|127\.0\.0\.1/.test(b)?b+'#registro':''}
window.qrIniciar=()=>{const b=base();$('#qrurl').value=b||'https://TU-PAGINA.com/#registro';$('#qrwarn').hidden=!!b;dibujar()};
$('#qrurl').oninput=dibujar;
$('#qrprint').onclick=()=>{document.body.classList.add('pq');print();setTimeout(()=>document.body.classList.remove('pq'),800)};
$('#qrdown').onclick=()=>{const s=$('#qrbox svg');if(!s)return;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s.outerHTML],{type:'image/svg+xml'}));a.download='QR-registro-JRG.svg';document.body.append(a);a.click();a.remove()};
})();
