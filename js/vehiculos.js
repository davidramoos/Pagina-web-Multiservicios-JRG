/* ===== VEHÍCULOS: capacidad de aceite en CUARTOS (1 cuarto = 1/4 de galón ≈ 0,95 L) =====
   Formato: Marca:Modelo cuartos,Modelo cuartos…   Marca "k" = camioneta, "c" = camión (ej: Hilux 7k, NHR 8c).
   Las capacidades son aproximadas (valores típicos); corrígelas aquí cuando quieras. */
const VEHCLS={};
const parse=s=>Object.fromEntries(s.split('|').map(b=>{const i=b.indexOf(':'),n=b.slice(0,i);return[n,Object.fromEntries(b.slice(i+1).split(',').map(x=>{x=x.trim();const m=/^(.*) (\d+(?:\.\d)?)([kc]?)$/.exec(x);if(m[3])VEHCLS[n+'|'+m[1]]=m[3];return[m[1],+m[2]]}))]}));
const VEH=parse([
'Chevrolet:Spark 3.5,Spark GT 4,Spark Life 3.5,Beat 3.5,Joy 4,Sail 4,Onix 4,Onix Turbo 4,Aveo 4,Aveo Family 4,Aveo Emotion 4,Aveo GT 4,Optra 4.5,Optra Advance 4.5,Optra Desing 4.5,Corsa (carburador) 3.5,Corsa Evolution (inyección) 3.5,Sprint (carburador) 3,Sprint (inyección) 3,Swift 3,Chevette 3.5,Monza 4,Cavalier 4,Cruze 4.5,Sonic 4,Spin 4,Zafira 4.5,Tracker 4k,Trax 4k,Grand Vitara 5.5k,Captiva 5k,Captiva Sport 5k,Captiva Sport V6 6k,Equinox 5k,Blazer 6k,Trailblazer 6k,Luv TFR (gasolina) 5k,Luv TFR (diésel) 6.5k,Luv D-Max (gasolina) 5k,Luv D-Max (diésel) 7k,Colorado 7k,Silverado 6k,S10 5k,Rodeo 6k,N200 3.5k,N300 4k,N400 4k,NHR 8c,NKR 8c,NPR 12c,NQR 13c,FRR 18c,FVR 20c,Kodiak 28c',
'Renault:R4 3,R9 3.5,R12 3.5,R18 3.5,R19 3.5,R21 4,Clio (carburador) 3.5,Clio (inyección) 3.5,Twingo 3,Symbol 3.5,Logan 3.5,Sandero 3.5,Stepway 3.5,Kwid 3,Megane 4,Megane II 4.5,Fluence 5,Laguna 4.5,Scenic 4.5,Duster 4.5k,Captur 4.5k,Koleos 5.5k,Oroch 4.5k,Kangoo 4k,Master 7.5k',
'Mazda:323 3.5,626 4.5,Allegro 3.5,Demio 3.5,Mazda 2 3.5,Mazda 3 4,Mazda 3 (2.0) 4.5,Mazda 6 4.5,CX-3 4k,CX-30 4.5k,CX-5 5k,CX-50 5k,CX-9 6k,BT-50 7k,B2200 5k',
'Kia:Sephia 3.5,Picanto 3.5,Picanto Ion 3.5,Rio 4,Rio Spice 4,Cerato 4.5,Forte 4.5,Soul 4.5,Carens 4.5,Carnival 6,Sportage 4.5k,Sportage Revolution 4.5k,Sportage Active 4.5k,Sorento 5k,Sorento V6 6k,Seltos 4k,Pregio 6.5k,K2700 8c,K3000 8c',
'Hyundai:Atos 3.5,Excel 3.5,Getz 3.5,i10 3.5,Grand i10 3.5,Accent 3.5,Accent Vision 3.5,Verna 3.5,i20 3.5,Elantra 4.5,i30 4.5,Veloster 4.5,Creta 4k,Tucson 4.5k,Tucson ix35 4.5k,Santa Fe 5k,Galloper 7k,H-1 6.5k,Porter 7c',
'Toyota:Starlet 3.5,Tercel 3.5,Corona 4,Etios 3.5,Yaris 3.5,Corolla 4,Camry 4.5,Prius 4,Corolla Cross 4k,RAV4 4.5k,Hilux (gasolina) 5k,Hilux (diésel) 7k,Fortuner 5k,Fortuner (diésel) 7k,Land Cruiser Prado 7k,Land Cruiser Machito 10k',
'Nissan:Micra 3.5,March 3.5,Versa 3.5,Almera 3.5,Platina 4,Tiida 4,Sentra B13 3.5,Sentra 4,Primera 4.5,Altima 5,Kicks 4k,Juke 4.5k,Qashqai 4.5k,X-Trail 5k,Murano 5.5k,Pathfinder 6k,Frontier 7.5k,NP300 7.5k',
'Ford:Ka 3.5,Fiesta 3.5,Fiesta Power 3.5,Escort 3.5,Laser 3.5,Focus 4,Mondeo 4.5,Fusion 4.5,Mustang 6,EcoSport 4k,Escape 4.5k,Edge 5k,Explorer 6k,Bronco 6k,Ranger (gasolina) 5k,Ranger (diésel) 7k,F-150 6k',
'Suzuki:Alto 3,Maruti 3,Swift (carburador) 3,Swift (inyección) 3.5,Forsa 3,Celerio 3,Wagon R 3.5,S-Presso 3.5,Sidekick 4,SX4 4,Ertiga 4,Vitara 4k,Grand Vitara 4.5k,Jimny 3.5k,Samurai 3.5k',
'Volkswagen:Escarabajo 3,Gol 3.5,Fox 3.5,Polo 3.5,Virtus 3.5,Santana 4,Golf 4.5,Jetta 4.5,Passat 4.5,T-Cross 4k,Taos 4.5k,Tiguan 5k,Saveiro 3.5k,Amarok 7k',
'Mitsubishi:Colt 3.5,Mirage 3.5,Lancer 4,Lancer EX 4,ASX 4k,Eclipse Cross 4k,Outlander 4.5k,Montero 6k,Montero Sport 7k,L200 7k,Canter 8c',
'Honda:Fit 3.5,City 3.5,Civic 4,Accord 4.5,HR-V 4k,CR-V 4.5k,Pilot 5.5k',
'Fiat:Mobi 3,Uno 3.5,Palio 3.5,Siena 3.5,Tempra 3.5,Punto 3.5,Tipo 3.5,Argo 3.5,Strada 3.5k',
'Peugeot:206 3.5,207 3.5,208 3.5,301 3.5,306 3.5,307 4,308 4,405 4,2008 3.5k,3008 4k',
'Citroën:C3 3.5,C4 4,Berlingo 4k',
'Daewoo:Tico 3,Matiz 3,Racer 3.5,Cielo 3.5,Lanos 3.5,Espero 4,Nubira 4,Leganza 4.5',
'Daihatsu:Cuore 3,Charade 3,Move 3,Terios 3.5k,Feroza 3.5k',
'Subaru:Impreza 4,Legacy 4.5,Forester 4.5k,XV 4.5k,Outback 4.5k',
'Chery:QQ 3,Arrizo 3.5,Tiggo 4k,Tiggo 2 3.5k,Tiggo 7 4k',
'BYD:F0 3,F3 3.5',
'JAC:S2 3.5k,S3 4k,T6 7k,T8 7k',
'Foton:Tunland 7k,Aumark 8c',
'DFSK:Glory 580 4.5k',
'Jeep:Renegade 4k,Compass 4.5k,Cherokee 5.5k,Grand Cherokee 6k,Wrangler 6k',
'Dodge:Dart 4.5,Journey 5.5k,Durango 6k',
'Audi:A3 4.5,A4 5,Q5 6k',
'BMW:Serie 3 5.5,X1 5k',
'Mercedes-Benz:Clase A 5,Clase C 6',
'Camiones:Camión liviano 8c,Camión mediano 14c,Camión pesado 28c,Volqueta 28c,Buseta 14c',
'AKT (moto):NKD 125 1,Evo 125 1,CR4 125 1,Dynamic 125 1,Flex 125 1,TT 180 1.5,CR5 180 1.5,TT 200 1.5',
'Yamaha (moto):Crypton 1,YBR 125 1,SZ 150 1,Libero 1,XTZ 125 1,XTZ 150 1.5,XTZ 250 1.5,FZ 2.0 1.5,FZ-S 1.5,FZ 16 1.5,FZ 25 1.5,Fazer 1.5,NMAX 1,YZF-R15 1.5,MT-03 2.5,YZF-R3 2.5',
'Honda (moto):CG 125 1,Biz 125 1,Wave 110 1,Navi 1,Elite 125 1,PCX 1,CB 125F 1,CB 160F 1.5,CB 190R 1.5,CBF 150 1.5,XR 150L 1.5,XR 190L 1.5,Tornado 250 2',
'Bajaj (moto):CT 100 1,Boxer CT100 1,Boxer BM 150 1,Platina 1,Discover 125 1,Pulsar NS 125 1,Pulsar 180 1.5,Pulsar NS 160 1.5,Pulsar NS 200 1.5,Pulsar RS 200 1.5,Dominar 400 2',
'Suzuki (moto):AX100 1,AX4 1,GS 125 1,GN 125 1,Gixxer 150 1.5,Gixxer 250 2',
'TVS (moto):Sport 100 1,Victor 110 1,Raider 125 1,NTORQ 1,Apache RTR 160 1.5,Apache RTR 200 1.5',
'Hero (moto):Splendor 1,Eco Deluxe 1,Dash 1,Hunk 1.5,Thriller 1.5,Ignitor 1.5',
'KTM (moto):Duke 200 1.5,RC 200 1.5,Duke 390 2,Adventure 390 2.5',
'Kymco (moto):Agility 1,Like 1,Twist 1',
'Kawasaki (moto):Ninja 250 2.5,Ninja 400 2.5,Z400 2.5'
].join('|'));

/* ===== CAMIONES, BUSES Y VOLQUETAS por marca (cuartos con filtro; aproximados, ajústalos con tu experiencia) ===== */
const VEH_EXTRA=parse([
'Hino:Dutro 300 10c,Dutro Pro 10c,Hino 160 9c,Hino 500 FC (J08E) 18c,Hino 500 FD 18c,Hino 500 FG 19c,Hino 500 GD 19c,Hino 500 GH 19c,Hino 500 FL 24c,Hino 700 36c',
'Hyundai:H100 7k,HD45 8c,HD55 8c,HD65 9c,HD72 9c,HD78 9c,County 9c,HD120 14c,HD170 22c,HD270 28c,Mighty 9c',
'Kia:Kia 3600 9c,Besta 7c,Frontier 8c',
'Asia Motors:Combi 7c,Topic 7c,Towner 3.5c',
'Chevrolet:Esteem 3.5,Chevy 3.5,Luv 1600 4k,Luv 2200 4.5k,Luv 2300 5k,NLR 7c,NMR 7c,NPS 9c,FSR 10c,FTR 14c,FVZ 16c,LV150 10c,CHR 12c,Kodiak C-70 28c,NHR 4x4 8c',
'Isuzu:D-Max (diésel) 7k,NHR 8c,NKR 8c,NPR 10c,NQR 11c,FRR 11c,FSR 11c,FTR 14c,FVR 16c,FVZ 16c',
'Ford:F-350 (diésel) 16c,F-600 14c,F-4000 14c,F-7000 18c,F-9000 26c,Cargo 815 15c,Cargo 816 15c,Cargo 1016 15c,Cargo 1721 26c,Cargo 1932 28c,Cargo 2428 30c',
'Foton:Aumark C 12c,Aumark S 8c,BJ 1039 8c,Ollin 12c,Auman 26c,Forland 7c',
'JAC:1035 8c,1040 9c,1061 12c,1083 12c,HFC 1383 18c',
'FAW:1041 8c,1061 12c,Tigre 8c,J5 26c',
'JMC:Carrying 8c,N800 8c,N900 8c,Vigus 7k',
'Mitsubishi:Canter FE 649 10c,Canter FE 85 10c,Fuso FV 24c,Fuso FN 15c',
'Nissan:Cabstar 7c,Condor 8c',
'Volkswagen:Delivery 9.150 8c,Delivery 11.180 12c,Worker 17.230 18c,Constellation 17.280 22c,Constellation 24.280 22c',
'Mercedes-Benz:Sprinter (diésel) 8c,Accelo 815 12c,Atego 1726 18c,Atego 2428 20c,Actros 38c',
'Iveco:Daily 8c,Tector 170 16c,Tector 240 20c,Stralis 42c',
'Dodge:D-300 7c,Ram 3500 (diésel) 12c,Ram 6500 13c',
'International:4300 (motor DT 466) 28c,4700 (motor DT 466) 28c,7400 (motor DT 466) 28c,9200 (Cummins N14) 40c,Prostar 40c',
'Kenworth:T370 27c,T800 40c,T660 40c,C500 40c,W900 40c,K 130 40c',
'Freightliner:FL60 16c,FL80 16c,M2 106 27c,Columbia 40c,Cascadia 40c,FLD 120 40c',
'Mack:CH 613 37c,Granite 40c,Pinnacle 40c',
'Volvo:VM 270 29c,FM 12 37c,FM 440 40c,FH 16 51c,NL 10 36c',
'Scania:P 310 37c,G 410 40c,R 440 40c,T 113 37c,T 124 40c',
'Agrale:7500 9c,8700 10c,10000 12c',
'Sinotruk:Howo 336 32c,Howo 371 32c',
'Camiones:Volqueta (motor DT 466) 28c,Volqueta (Cummins ISC 8.3) 26c,Volqueta (Cummins ISL 9) 28c,Volqueta doble troque 30c,Tractocamión (motor Cummins) 40c,Furgón liviano 9c,Bus (motor DT) 28c,Microbús 9c'
].join('|'));
for(const b in VEH_EXTRA)VEH[b]=Object.assign(VEH[b]||{},VEH_EXTRA[b]);
const isMoto=m=>/\(moto\)/.test(m||'');

/* Mano de obra: GRATIS cuando se hace el cambio completo (aceite + filtro de aceite) */
const BCOL={Castrol:'#0B8A3A',Shell:'#F2B705',Mobil:'#E2231A',Motul:'#222222',Havoline:'#D71920',Chevron:'#0054A6',Kixx:'#E2231A',Elf:'#0A5BA8',ACDelco:'#D71920',Terpel:'#E30613','Liqui Moly':'#E2001A',Valvoline:'#C8102E',Repsol:'#F58220',Yamalube:'#1D4EA8',Honda:'#CC0000',Simoniz:'#1565C0',Petrobras:'#00A859',Ursa:'#0054A6',Motorcraft:'#0054A6',Lubristone:'#E2231A',Batermax:'#E2231A',Narbatt:'#1565C0',Xtender:'#0A2A66',Ecobrex:'#0A2A66'};
const KIND={ac:'oil',am:'oil',vh:'oil',fa:'airf',fw:'filter',fi:'filter',fc:'filter',gr:'grease',amb:'tree',sil:'spray',bel:'bottle',adi:'bottle',ref:'bottle',fre:'pad',bat:'bat',plu:'wiper',bom:'bulb',ban:'belt',tor:'bolt'};
const _sl=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const _slug=s=>_sl(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const _DIR={ac:'imagenes aceites/aceites para carro',am:'imagenes aceites/aceites para moto',vh:'imagenes aceites/valvulinas e hidraulicos'};
const _ruta=(c,b,n)=>(_DIR[c]||'imagenes productos/'+_sl((GRUPOS.find(g=>g[0]===c)||[,c])[1]))+'/'+(b==='Otras marcas'?'sin-marca':_slug(b))+'/'+_slug(n);
const _rutas=(c,b,n,s)=>{const dir=_DIR[c]||'imagenes productos/'+_sl((GRUPOS.find(g=>g[0]===c)||[,c])[1]),o=[_ruta(c,b,n)];if(b!=='Otras marcas')o.push(dir+'/'+_slug(b)+'/_marca');o.push(dir+'/'+(s?'_generica-'+_slug(s):'_generica'));return o};
/* Valvulinas, ATF e hidráulicos NO son aceite de motor: se separan (solo salen en "Cambio de valvulina") */
const GEAR=/VALVULINA|\bATF\b|DEXRON|MERCON|HIDRAUL|HYDRAUL|SPIRAX|TRANSMISI|DIFERENCIAL|\bGEAR\b|\b(?:75W-?90|80W-?90|85W-?140)/i;
INV.forEach(r=>{if((r[0]==='ac'||r[0]==='am')&&/PRO-LEDUSA|H7 12V/i.test(r[3]))r[0]='bom';
 if((r[0]==='ac'||r[0]==='am')&&GEAR.test(r[3]))r[0]='vh';
 if(r[6]==='80W-901')r[6]='80W-90';
 if(/DELVAC 1350/i.test(r[3]))r[6]=r[6]||'SAE 50';
 if(!r[6]){const n=r[3].toUpperCase();let m=/(\d{1,2})W[\s\-]*(140|90|85|[0-9O]{2})(?![0-9])/.exec(n);
  if(m)r[6]=m[1]+'W-'+m[2].replace(/O/g,'0');
  else if((m=/\bSAE[\s\-]*(\d{2,3})\b/.exec(n))||(m=/(?:TERGAS|OILTEC|ULTREK|MONOGRADO|LUBEOIL GALON|LUBEMOTOR|CAM)[A-Z\s\-]*?\b(30|40|50|90|140)\b/.exec(n)))r[6]='SAE '+m[1]}});
/* ===== FOTOS DE PRODUCTO: nombre exacto del inventario => ruta de la imagen ===== */
const FOTOS={
 "ACDELCO 10W30 CUARTO":"img/184497-800-auto.webp"
};
const P=INV.map((r,i)=>{const[c,s,b,n,p,st,x,pr,L,v,Lq]=r;
 const img=FOTOS[n]||((c==='amb'&&b==='Simoniz')?'ambientador.jpg':(c==='sil'&&/SILICONA/i.test(n)&&/silicon/i.test(n))?'silicona.jpg':(c==='bel'&&/(^| )CERA( |$)/.test(n)&&b==='Simoniz')?'cera.jpg':(c==='adi'&&b==='Liqui Moly')?'aditivo.jpg':undefined);
 return{id:i,c,s,b,n,p,st,x,pr,L,Lq,inf:!L&&Lq>0,v,img,ruta:_ruta(c,b,n),rutas:_rutas(c,b,n,s),k:KIND[c],col:BCOL[b]||'#0A2A66',d:[pr,s,v].filter(Boolean).join(' · ')}});
const CATS=[['','Todos'],...GRUPOS];
const QOILS=P.filter(p=>(p.c==='ac'||p.c==='am')&&p.Lq>0).sort((a,b)=>b.st-a.st||a.b.localeCompare(b.b)||a.n.localeCompare(b.n));
const VOILS=P.filter(p=>p.c==='vh'&&p.Lq>0).sort((a,b)=>b.st-a.st||a.b.localeCompare(b.b)||a.n.localeCompare(b.n));
const med=a=>{a=a.sort((x,y)=>x-y);return a[a.length>>1]};
/* clase para el beneficio: 'carro' (carros y taxis), 'camioneta', 'camion' o 'moto' */
const claseDe=(k,m)=>isMoto(k)?'moto':(k==='Camiones'||VEHCLS[k+'|'+m]==='c')?'camion':VEHCLS[k+'|'+m]==='k'?'camioneta':'carro';
const FILTRO={carro:med(P.filter(p=>p.c==='fi'&&p.s==='Aceite'&&p.p<80000).map(p=>p.p))||25000,moto:med(P.filter(p=>p.c==='fi'&&/moto/i.test(p.s)).map(p=>p.p))||15000,aireCarro:med(P.filter(p=>p.c==='fa'&&p.s==='Aire motor'&&p.p<80000).map(p=>p.p))||30000,aireMoto:med(P.filter(p=>p.c==='fa'&&/moto/i.test(p.s)).map(p=>p.p))||15000};

/* ¿Diésel por defecto? (camiones siempre; camionetas según el listado). En la cotización se puede cambiar. */
const DIESEL_RX=/H100|Vigus|Sprinter|Daily|Cabstar|diésel|NHR|NKR|NPR|NQR|FRR|FVR|Kodiak|BT-50|Pregio|K2700|K3000|Porter|Galloper|H-1|Frontier|NP300|Amarok|Montero Sport|L200|Canter|T6|T8|Tunland|Aumark|Machito|Colorado|Master|Camión|Volqueta|Buseta/i;
const esDiesel=(k,m)=>{const c=claseDe(k,m);return c==='camion'||(c==='camioneta'&&DIESEL_RX.test(m))};
FILTRO.fcDiesel=med(P.filter(p=>p.c==='fc'&&/^Combustible/.test(p.s)&&!/TRAMPA|SEPARADOR|VASO|BOWL/i.test(p.n)&&p.p<60000).map(p=>p.p))||30000;
FILTRO.fcTrampa=med(P.filter(p=>p.c==='fc'&&/TRAMPA|SEPARADOR/i.test(p.n)).map(p=>p.p))||30000;
FILTRO.fcGas=med(P.filter(p=>p.c==='fc'&&p.s==='Gasolina').map(p=>p.p))||28000;
