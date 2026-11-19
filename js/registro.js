/* ===== REGISTRO DE CAMBIOS POR PLACA (edítalo aquí) =====
   Cada placa lleva: marca, modelo, año y la lista de cambios (más reciente primero).
   Formato de cada cambio: {f:'AAAA-MM-DD', km:número, aceite:'texto', filtro:true/false, total:número} */
const REGISTRO={
 ABC123:{marca:'Chevrolet',modelo:'Onix',anio:2020,cambios:[{f:'2026-08-14',km:48200,aceite:'CASTROL GTX 20W-50',filtro:true,total:98000},{f:'2026-03-02',km:43100,aceite:'CASTROL GTX 20W-50',filtro:true,total:96000},{f:'2025-09-20',km:38000,aceite:'CASTROL GTX 20W-50',filtro:false,total:78000}]},
 XYZ789:{marca:'Mazda',modelo:'Mazda 3',anio:2018,cambios:[{f:'2026-10-01',km:71500,aceite:'SHELL HELIX ULTRA 5W-30',filtro:true,total:258000}]},
 KLM45D:{marca:'Yamaha (moto)',modelo:'FZ 2.0',anio:2022,cambios:[{f:'2026-09-10',km:12800,aceite:'MOTUL 3000 20W-50 4T',filtro:true,total:72000}]}
};
