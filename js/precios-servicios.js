/* ===== PRECIOS DE LOS SERVICIOS DE LÍQUIDOS (edítalos aquí con el Bloc de notas) =====
   Escribe solo el número, sin puntos ni signo $ (ejemplo: 130000). Guarda el archivo y súbelo de nuevo.
   Los precios de los aceites, filtros y de las valvulinas que eliges en la página salen del inventario (js/inventario.js, con el panel admin.html). */
window.PRECIOS_SERV={
 ocultar_sin_existencias:false,   // false = la página muestra TODOS los productos (los agotados salen con «Consultar disponibilidad»). true = esconde los que no tienen existencias
 mano_obra_valvulina:30000,   // mano de obra del cambio de valvulina (se suma al precio de la valvulina)
 // Líquido de frenos (por el cambio, con litro incluido)
 'fr-ate':130000,             // ATE SL DOT 4 (alemán, azul)
 'fr-cofre':120000,           // Cofre DOT 4
 // Refrigerante (cada marca incluye aditivo limpiador Liqui Moly y máquina de succión)
 'rf-fl':140000,              // Full Line
 'rf-mo':140000,              // Mobil o Terpel (valen lo mismo)
 'rf-si':150000,              // Simoniz
 'rf-lu':150000,              // Lubristone
 'rf-ac':160000,              // ACDelco
 'rf-lm':210000,              // Liqui Moly
 // Hidráulico (dirección)
 'hi-bas':80000,              // Hidráulico económico
 'hi-ac':160000               // ACDelco ATF 3
};
