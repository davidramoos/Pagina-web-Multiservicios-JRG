/* ===== Conexión con la hoja de Google (vía Apps Script) =====
   Si JRG_API está vacío, la página usa los datos de ejemplo de registro.js. */
(function(){
const api=()=>(window.JRG_API||'').trim();
const demo=p=>{const r=(typeof REGISTRO!=='undefined')&&REGISTRO[p];
 if(!r)return{ok:true,encontrado:false,registrada:false};
 return{ok:true,encontrado:true,placa:p,vehiculo:r.marca+' '+r.modelo+' '+r.anio,
  cambios:r.cambios.map(c=>({f:c.f,aceite:c.aceite,cant:'',fa:'',fi:c.filtro?'incluido':'',fc:'',valor:c.total,total:'',km:String(c.km),prox:''}))}};
async function pedir(url,opt){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),60000);
 let r;try{r=await fetch(url,Object.assign({signal:ac.signal},opt||{}))}catch(e){console.warn('JRG: no se pudo contactar el script',e);return{ok:false,error:'red'}}finally{clearTimeout(t)}
 try{return await r.json()}catch(e){console.warn('JRG: el script no devolvió JSON (revisa que esté implementado como "Cualquier persona")',r&&r.status);return{ok:false,error:'formato'}}}
window.JRG={
 conectado:()=>!!api(),
 async consultar(placa,cel){if(!api())return demo(placa);
  return pedir(api()+'?action=buscar&placa='+encodeURIComponent(placa)+(cel?'&celular='+encodeURIComponent(cel):''))},
 async correo(d){if(!api())return{ok:false,error:'sin_api'};
  return pedir(api(),{method:'POST',body:JSON.stringify(Object.assign({action:'correo'},d))})},
 async kmPend(placa){if(!api())return{ok:false};try{return await pedir(api()+'?action=kmpend&placa='+encodeURIComponent(placa))}catch(e){return{ok:false}}},
 async km(d){if(!api())return{ok:false,error:'sin_api'};
  return pedir(api(),{method:'POST',body:JSON.stringify(Object.assign({action:'km'},d))})},
 async registrar(d){if(!api())return{ok:false,error:'sin_api'};
  return pedir(api(),{method:'POST',body:JSON.stringify(Object.assign({action:'registrar'},d))})}
};
})();
