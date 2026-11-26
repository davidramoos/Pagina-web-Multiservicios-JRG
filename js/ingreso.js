/* ===== Ingreso por código QR: el cliente escribe placa + kilometraje actual =====
   - Placa conocida  → se envía el kilometraje (queda PENDIENTE hasta que el taller lo confirme en el Excel) y se muestra su tarjeta de cambio (solo lectura).
   - Placa nueva     → se le ofrece registrarse; el formulario de registro llega con la placa, el kilometraje y la fecha de hoy ya escritos
                       y, al enviarse, el registro queda PENDIENTE en la hoja «REGISTRO WEB».
   Se abre con  #ingreso  al final de la dirección (es lo que lleva el QR de la vista #qr). */
(function(){
const WA='573125529044';
const num=v=>{const n=parseInt(String(v==null?'':v).replace(/\D/g,''),10);return isNaN(n)?0:n};
const miles=n=>n?n.toLocaleString('es-CO'):'';
const hoy=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())};
const err=t=>{const e=$('#ierr');e.innerHTML=t||'';e.hidden=!t};
const res=$('#ires');
const wa=(pl,km)=>'https://wa.me/'+WA+'?text='+encodeURIComponent('Hola, mi placa es '+pl+' y mi kilometraje actual es '+miles(km)+' km.');
function registrar(pl,km){go('registro');if(window.modoRegistro)modoRegistro('nuevo');
 $('#rp').value=pl;$('#rk').value=km;if(!$('#rf').value)$('#rf').value=hoy();
 const n=$('#rn');if(n)setTimeout(()=>n.focus({preventScroll:true}),50)}
$('#iv').onsubmit=async e=>{e.preventDefault();err('');res.innerHTML='';
 const pl=$('#ip').value.toUpperCase().replace(/[^A-Z0-9]/g,''),km=num($('#ik').value);
 if(!/^[A-Z]{3}\d{2}[A-Z0-9]$/.test(pl))return err('Revisa la placa: debe verse como ABC123 (carro) o ABC12D (moto).');
 if(!km||km<100)return err('Escribe el kilometraje que marca tu tablero, solo números.');
 if(km>999999)return err('Ese kilometraje parece muy alto. Revísalo.');
 const b=$('#ib');b.disabled=true;b.textContent='Buscando…';
 res.innerHTML='<p class="hint">Consultando la placa '+pl+'… la primera vez puede tardar unos 15 segundos.</p>';
 const r=await JRG.consultar(pl);res.innerHTML='';
 if(!r||!r.ok){b.disabled=false;b.textContent='Continuar';
  return err('No pudimos consultar el registro en este momento. Intenta de nuevo o <a class="lk" target="_blank" rel="noopener" href="'+wa(pl,km)+'">envíanos la placa y el kilometraje por WhatsApp</a>.')}
 if(!r.encontrado&&!r.registrada){b.disabled=false;b.textContent='Continuar';
  res.innerHTML='<div class="panel" style="max-width:560px"><h3 style="color:var(--navy);font-size:1.4rem">No encontramos la placa '+esc(pl)+'</h3><p>Si es tu primera vez en Multiservicios JRG, regístrate: ya llevamos tu placa y tu kilometraje ('+miles(km)+' km) escritos, solo faltan tus datos.</p><div class="cta" style="margin:14px 0 0"><button class="btn red" type="button" id="iReg">Registrar mi vehículo</button><button class="chip" type="button" id="iRev">Revisar la placa</button></div></div>';
  $('#iReg').onclick=()=>registrar(pl,km);$('#iRev').onclick=()=>{$('#ip').focus();$('#ip').select()};res.scrollIntoView({block:'nearest',behavior:'smooth'});return}
 const cam=(r.cambios||[]),ult=window.JRGKm?JRGKm.kmNum(cam[0]&&cam[0].km):num(cam[0]&&cam[0].km);
 if(ult&&km<ult){b.disabled=false;b.textContent='Continuar';return err('El kilometraje no puede ser menor al último confirmado ('+miles(ult)+' km). Revísalo.')}
 const q=await JRG.km({placa:pl,km});b.disabled=false;b.textContent='Continuar';
 let msg;
 if(q&&q.ok)msg='<div class="panel" style="max-width:560px"><h3 style="color:var(--navy)">¡Gracias! Recibimos '+miles(km)+' km</h3><p>Quedó <b>pendiente de confirmación</b> con la placa <b>'+esc(pl)+'</b>. Multiservicios JRG lo revisa y lo pasa a tu tarjeta.</p></div>';
 else if(q&&q.error==='ocupado')msg='<div class="miss">Ya enviaste varios kilometrajes con esta placa. Intenta de nuevo en una hora o díselo al técnico.</div>';
 else msg='<div class="panel" style="max-width:560px"><h3 style="color:var(--navy)">Casi listo</h3><p>Por ahora no pudimos guardar el kilometraje directamente. Envíanoslo por WhatsApp (ya va escrito) y lo anotamos en tu tarjeta.</p><div class="cta" style="margin:14px 0 0"><a class="btn wa" target="_blank" rel="noopener" href="'+wa(pl,km)+'">Enviar por WhatsApp</a></div></div>';
 let tj='';
 if(cam.length&&window.JRGTarjeta){const kp=q&&q.ok?{ok:true,km,f:hoy()}:null;try{tj=JRGTarjeta.html(r,pl,{status:false,kmp:kp})}catch(x){console.warn(x)}}
 else if(!cam.length)tj='<p class="hint" style="margin-top:14px">Tu vehículo está registrado, pero todavía no tiene cambios guardados. Cuando hagas tu primer cambio, aparecerá tu tarjeta.</p>';
 res.innerHTML=msg+tj+'<div class="cta" style="margin:16px 0 0">'+(cam.length?'<button class="btn blue" type="button" id="iHist">Ver mi historial completo</button>':'')+'<button class="btn red" type="button" data-go="cotizar">Cotizar mi cambio</button></div>';
 const h=$('#iHist');if(h)h.onclick=()=>verTarjeta(pl,'');
 res.scrollIntoView({block:'start',behavior:'smooth'})};
$('#ip').addEventListener('input',()=>{$('#ip').value=$('#ip').value.toUpperCase()});
window.ingresoIniciar=()=>{err('');res.innerHTML='';$('#ib').disabled=false;$('#ib').textContent='Continuar';setTimeout(()=>$('#ip').focus({preventScroll:true}),50)};
})();
