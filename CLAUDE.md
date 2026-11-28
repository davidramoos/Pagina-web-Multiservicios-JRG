# Multiservicios JRG — página web (tienda + cotizador)

Sitio estático en español para un cambiadero de aceite/lubricación en Bogotá. Sin framework ni build: abrir `index.html` en el navegador.

## Estructura
- `index.html` — solo marcado HTML (sin CSS ni JS inline). Carga `css/styles.css` y los scripts de `js/` en orden.
- `css/styles.css` — todos los estilos (footer `.jf*`, tarjeta de horario `.hours*`).
- `js/config.js` — `window.JRG_API`: URL del Apps Script (Google) que consulta el Excel/Sheets.
- `js/api.js` — llamadas al Apps Script (timeout 60 s: la primera consulta de placa tarda ~15 s).
- `js/cotizador.js` — cotizador de cambio de aceite y consulta por placa.
- `js/horario.js` — horario (L–S 8:00–18:00, dom/festivos 9:00–12:30), festivos de Colombia, estado abierto/cerrado.
- `js/inventario.js` — array `INV` (≈2975 productos). Fila: [grupo, , marca, NOMBRE, precio, stock, …].
- `js/vehiculos.js` — datos de vehículos y el objeto `FOTOS`.
- `js/imagenes.js`, `ilustraciones.js`, `motores.js`, `referencias-taller.js`, `tienda.js`, `inicio.js`, `registro*.js`, `utilidades.js`, `qrcode.js`, `tarjeta.js` (tarjeta de cambio virtual como la de papel + registro en dos modos: «Es mi primera vez» / «Ya soy cliente» con kilometraje).
- `img/<categoria>/…` — fotos de producto en WebP 800x800, fondo blanco.

## Fotos de producto (regla clave)
- Se enlazan SOLO en el objeto `FOTOS` de `js/vehiculos.js`: clave = nombre EXACTO del producto en `INV` (letra por letra), valor = ruta relativa (`img/aceites/x.webp`).
- Mantener `"ACDELCO 10W30 CUARTO":"img/184497-800-auto.webp"`.
- Reutilizar una imagen solo para la MISMA pieza física (mismo producto y tamaño de envase). Si no hay foto fiable, no poner clave.
- Producto sin foto: se muestra el LOGO DE SU MARCA (archivos `img/marcas/<marca>.webp`, 800x800 fondo blanco; mapa `LOGO_MK`/`LOGO_NOM` en `js/utilidades.js`). "FT" es referencia de Filtraire (logo `filtraire.webp`); "AIP/ACP/OLP/FLP/FCP" son de Premium Filters (`premium.webp`) y "HCX/HCA/HCC" de Franig (`franig.webp`); esas dos reglas están en `logoMarca` antes de la de Filtraire. Los logos salen de las páginas oficiales de cada marca. Marca sin logo disponible → logo del negocio. Para agregar una marca: guardar su logo en `img/marcas/` y añadirla a `LOGO_MK`. `window.FOTO_SIN='ilus'` devuelve las ilustraciones.
- Fotos de filtros FT: salen de publicaciones de Instagram @filtraire.bogota donde se ve la referencia impresa (capturadas desde la interfaz, fondo quitado salvo Logan/Sail/Captiva que van tal cual para conservar la etiqueta). Van en `img/filtros/ft-*.webp` y se enlazan en `FOTOS` con el nombre exacto del INV. Solo agregar foto de un FT si es exactamente ese producto (ej.: el post "Toyota Prado" muestra FT 1121, no FT 2889 → no se usa).
- Archivo de apoyo: lista de productos sin foto en `productos_sin_foto.csv` (si existe).

## Backend
Apps Script (Google) con acciones `buscar`, `kmpend`, `baja`, `ping` (GET) y `registrar`, `correo`, `km` (POST). El código instalado está copiado en `apps_script_km.gs` (con el ID de la hoja reemplazado por un marcador). La búsqueda por placa respeta las restricciones de enmascarado definidas por el dueño; no relajarlas.

## Convenciones
- No modificar código que no se pidió tocar.
- Textos de interfaz en español.

## Panel de administración (`admin.html`)
- Se abre con doble clic en Chrome/Edge (computador) y se le da la carpeta de la página con "Abrir carpeta de la página". Edita directamente `js/inventario.js` (precio, disponible, nombre, categoría, productos nuevos/eliminados) y `FOTOS` en `js/vehiculos.js`, y guarda las fotos como WebP 800x800 en `img/<categoría>/`.
- Antes de guardar copia los archivos originales en `_respaldo/AAAA-MM-DD_HH-MM/`. No requiere servidor ni contraseña (solo escribe en la carpeta que el usuario elige); no publicarlo en el hosting.
- Los registros de vehículos de clientes llegan al Excel "INVENTARIO 2026 JRG" en la pestaña REGISTRO WEB (la crea el Apps Script con el primer registro).
- El kilometraje de clientes se envía con la acción `km`; el código para el Apps Script está en `apps_script_km.gs` (hoja KM WEB). Sin él, la página ofrece enviar el kilometraje por WhatsApp.
- La tarjeta muestra filas opcionales (líquido de frenos `lf`, valvulina `vv`, hidráulico `hi`, engrase `en`, refrigerante `rf`) cuando la hoja las traiga; si no, salen con «—».

## Tarjeta virtual y kilometraje (regla de negocio)
- La tarjeta es de SOLO LECTURA: sale del Excel y solo el dueño la modifica. El cliente nunca cambia fechas, cambios ni sellos de la promoción.
- Consulta solo con la placa (sin celular). El celular, el correo y el apellido salen parcialmente ocultos (lo decide el Apps Script).
- El cliente puede enviar su kilometraje actual (`JRG.km({placa,km})`): queda en la hoja "KM WEB" con ESTADO=PENDIENTE y la tarjeta lo muestra aparte como "pendiente de confirmar" (`JRG.kmPend(placa)`, acción GET `kmpend`). Solo el dueño lo confirma. Ver `apps_script_km.gs`.

## Fotos oficiales Premium y Franig
- Las fotos de `premium-*.webp` y `franig-*.webp` salen de premiumfilters.store y franigfilters.com/catalogo-online (paginas oficiales). Las imagenes oficiales traen la marca de agua de cada marca; no se puede quitar limpio.
- Solo se usan para el mismo codigo de producto (no se reutilizan en filtros OEM ni de otra marca). Si el codigo no esta en el catalogo oficial, se deja el logo de la marca.
- Franig sin foto oficial: HCAE220, HCA2176, HCA6696, HCX9009, HCX2921, HCX25011011, HCX6643L.

## Navegación y textos legales
- Cada pestaña es una vista (`#v-...`); `go(vista, params, modo)` en `js/utilidades.js` guarda la vista en la URL (`#nosotros`, `#datos`…) y en el historial, así el botón «atrás» del celular vuelve a la vista anterior. Enlaces directos: `#cotizar`, `#productos`, `#contacto`, `#registro`, `#qr`, `#nosotros`, `#datos`.
- La vista `#datos` es la política de tratamiento de datos personales (Ley 1581 de 2012). Si cambia lo que se guarda o cómo funciona la tarjeta, actualizar ese texto y el de la casilla de autorización del formulario de registro.

## Organización de categorías (nov 2026)
- El inventario de origen (POS) tenía filtros de aire archivados como «FILTROS AGUA». Se movieron 97 a `fa` / «Aire motor». En `fw` («Filtros de agua») quedan solo 4: `AW-2010SP`, `AW-2127SP`, `AW-475SP` y `FMW 2010`.
- `FLP-443` y `FLP-340` (combustible) pasaron a `fc`; `AD-142SP` y `OEM: LF17356` a `fi`; `SPIRAX ATF` y `SPIRAX S2 80W90` a `vh`; grasas de litio a `gr`; agua de batería a `bat`; urea a `adi`; aceite Repsol 4T a `am`.
- Subcategorías con nombre de marca o repetido se unificaron («Shell» → vacío, «ACDelco» → «Plumillas», «Embellecimiento» en `amb`/`sil` → «Ambientadores»/«Siliconas»).
- Al cargar, `js/vehiculos.js` aún reubica en memoria bombillos y valvulinas que lleguen mal clasificados (`GEAR`).
- Para revisar a mano con el dueño: `CA2E4 - FT 8131 FOTON`, `0425-CA FILTRO ALTO RENDIMIENTO`, `V6-3000 MITSUBISHI`, y en `fc` los que dicen «ACEITE» (`FF1241`, `HCX-6643G`, `HCX-7153`, `HCP-8221`, `A-1CSP`).

## Ingreso por QR (`#ingreso`)
- El QR del local (vista `#qr`) lleva a `#ingreso`: el cliente escribe **placa + kilometraje actual** (`js/ingreso.js`).
- Placa conocida: consulta `buscar`, valida que el km no sea menor al último confirmado, envía `km` (queda PENDIENTE en «KM WEB») y muestra su tarjeta de solo lectura con el km reportado.
- Placa registrada sin cambios: envía el km y avisa que aún no tiene tarjeta.
- Placa nueva: ofrece «Registrar mi vehículo»; abre `#registro` con placa, km y fecha de hoy ya escritos; al enviar, `registrar` lo deja PENDIENTE en «REGISTRO WEB».
- Si el script no responde, ofrece enviar placa y km por WhatsApp. La dirección del QR se escribe en la vista `#qr` cuando la página esté publicada.

## Aceite a granel, kilometraje automático y líquidos (nov 2026)
- Aceite a granel: en el cotizador sale «el valor del cambio puede presentar variaciones» (se cobra un poco más por el cambio a granel). Está en la lista de aceites, en la nota `#mono` y en el comprobante.
- Próximo cambio (`js/kmcambio.js`, `window.JRGKm`; misma regla en `apps_script_km.gs`). Cada vehículo se controla por UNA de dos formas, nunca «lo que ocurra primero»: (1) POR KM, cuando KM ACTUAL (J) es un número: mineral y granel +5.000 km, semisintético +7.000 (desde 27-nov-2026; antes 6.000), sintético +10.000. (2) POR FECHA, cuando J es una fecha (hay carros a los que no les sirve el km): la fecha de J + meses según el aceite: mineral/granel 3–4 meses, semisintético 7–9, sintético 12 (`MESES`). Ejemplo: J 21/05/26 → K «21/08/26 a 21/09/26» (mineral). SELLADO y GRANEL son solo la presentación del mismo aceite (p. ej. «1350 sellado» y «1350 granel»): el tipo sale de la marca y la viscosidad (0W/5W sintético; 10W/15W semi; 20W/25W, SAE 30-60, 1350 y HD mineral). Orden: palabras semisintético → sintético → mineral → viscosidad. Valvulina, hidráulico, refrigerante y 2T no calculan. Lo que el dueño escribe en K se respeta. Las fechas de la hoja pueden venir como 25/10/2026, 25-10-26 (formato del dueño, con guiones) o 2026-10-25. Constantes `KM` y `MESES` en los dos archivos.
- Filas de celular en CONTROL 2026: en la columna A pueden empezar por CEL, CELU, CELULAR, CELUL, CELUI, CELI o CELDU (`esCel_()` en `apps_script_km.gs`). Son parte del bloque del vehículo de arriba y heredan su aceite; si solo se reconociera «CEL», se perdería el aceite y K quedaría vacío. `corregirProximoK()` (menú Apps Script, con respaldo en la pestaña RESPALDO K) corrige los K ya escritos: semisintético +6.000 → +7.000 y K mal digitados recientes; respeta los K en miles redondos (+5.000, +8.000) y los K por fecha.
- Excel (versión 8 del script, 25-nov-2026): NO hay columna nueva; todo va en PRÓX. CAMBIO (K). Al escribir J (km o fecha) o B (aceite) en CONTROL 2026, el disparador `onEdit` rellena K SOLO si está vacío o si lo había escrito el sistema (nunca pisa lo que el dueño escribió): número si J es km, rango «dd/mm/aa a dd/mm/aa» si J es fecha. `actualizarProximoKm()` lo hace con toda la hoja y `simularProximoKm()` solo cuenta (menú JRG). REGISTRO WEB tiene la columna P «PRÓX. CAMBIO (KM)». No se usa la columna L (el dueño marca «YA»). La tarjeta de la página calcula todo sola con los datos de la hoja. Para actualizar el script: pegar `apps_script_km.gs` con el ID real de la hoja y Implementar → Gestionar implementaciones → Versión nueva (la misma dirección sigue funcionando). `archivarInactivos()` usa el servicio avanzado «Google Sheets API» (Servicios +).
- Tarjeta virtual: muestra «X km» en PRÓX. CAMBIO y «Te faltan N km…» con el km reportado (`pkDe` en `js/tarjeta.js`).
- Vista `#liquidos` («Cambio de líquidos»): frenos (ATE $130.000, Cofre $120.000), valvulina (cotizador por vehículo: `js/valvulina.js` con litros investigados + estimado por clase; cuartos = litros/0,946 redondeado a ½; mano de obra $30.000), refrigerante (6 marcas, $140–210 mil, con aditivo limpiador Liqui Moly y máquina de succión), hidráulico (económico $80.000, ACDelco ATF 3 $160.000, lavado repetitivo). Lógica en `js/liquidos.js`.
- PRECIOS de estos servicios: se editan en `js/precios-servicios.js` (números sin puntos). Los precios de aceites/valvulinas salen de `js/inventario.js` (panel `admin.html`).
- Fotos de líquidos: `img/liquidos/*.webp` (WebP con fondo transparente, ~520 px de alto; las tarjetas las centran con `object-fit:contain`). Mobil y Terpel comparten tarjeta (`rf-mo`, mismo precio) con dos fotos (`img` + `img2`). La valvulina económica tiene cuarto ($12.000) y galón ($38.000).
- Productos sin existencias o con saldo negativo: SE MUESTRAN (el dueño confirmó que muchos sí se venden; hay un descuadre de inventario). Salen con «Consultar disponibilidad». Hay un interruptor `ocultar_sin_existencias` en `js/precios-servicios.js` (por defecto `false`) que usa `INVV` en `js/vehiculos.js`; `precios-servicios.js` debe cargarse ANTES de `vehiculos.js` en `index.html`.
- QR: la vista `#qr` ahora descarga PNG y SVG y copia la dirección; `generador-qr.html` (no se publica) hace lo mismo antes de tener dominio escribiendo la dirección real.

- Inventario (25-nov-2026): se quitaron todos los productos Motorfresh, Raloy, Qool y los de marca Beg salvo las grasas; se quitaron duplicados (misma categoría/nombre/presentación/litros) dejando el que tiene existencias y, a igual caso, el de mayor precio. Los productos sin existencias o con saldo negativo se dejan visibles (`ocultar_sin_existencias:false`). Respaldo previo: no versionado.


- Limpieza de clientes (25-nov-2026): se eliminaron de CONTROL 2026 los vehículos cuyo ÚLTIMO cambio fue entre 2019 y 2023 y que no volvieron (1.548 vehículos, 7.748 filas; CONTROL pasó de 27.326 a 19.578 filas, el resto quedó en el mismo orden). El dueño pidió borrarlos POR COMPLETO: la pestaña temporal «ARCHIVO 2021-2023» también se eliminó (solo queda el historial de versiones de Google Sheets). No se tocaron bloques sin fecha o con fecha rara, ni placas que están en REGISTRO WEB / KM WEB. El script conserva `simularArchivo()` y `archivarInactivos()` (esta última vuelve a crear la pestaña de archivo antes de borrar); `CORTE_ARCHIVO` está en el script.
- Pastillas de freno: se deja una sola fila por misma referencia y misma marca (la de mayor existencia/precio); las de distinta referencia o precio se mantienen (p. ej. PASTILLAS CHEVROLET $90.000 y $70.000, KIA PICANTO $60.000).
- Bolt (mascota): `img/bolt.webp` es la imagen de Bolt en el taller que envió el dueño (schnauzer crema con buzo azul con el logo de Multiservicios JRG, collar con su nombre y cordones verde limón, con el elevador, la caja de herramientas roja y el letrero del taller al fondo); está reducida a 800 px de ancho (WebP, 800×875). Sección «Bolt te aconseja» en el Inicio (`#bolt` en `index.html`, estilos `.bolt` al final de `css/styles.css`, consejos en `js/inicio.js`): 31 consejos y curiosidades (reglas reales de km y tiempo, cuidado del motor, «¿Sabías que…?») que rotan al azar sin repetirse con los botones «‹ Anterior» y «Siguiente ›» (muestran el contador, p. ej. 3 / 31). Para cambiar los consejos, editar el arreglo `T` en `js/inicio.js`. `img/bolt.svg` es una versión anterior dibujada por Claude y ya no se usa (se puede borrar).

## Órdenes en PDF y calendario de citas (26-nov-2026)
- **PDF en vez de imprimir**: al reservar/pedir (Cotizar) y al registrar un vehículo, el comprobante tiene «Descargar PDF» (no imprimir). Lo genera `js/pdf.js` con jsPDF (`js/jspdf.umd.min.js`, se carga solo al pedir el PDF). Los textos pasan por `limpia()` porque las fuentes estándar del PDF solo traen letras latinas. El botón «Imprimir» del QR no cambió.
- **Calendario `js/agenda.js`** (`JRGAgenda`): en Cotizar (cliente nuevo, paso «Agenda tu cambio») y en Registro («Agenda tu próxima visita»). Los horarios dependen del servicio (duración): aceite 30 min, aceite con filtros 45, valvulina 45, líquidos 60, revisión 20. Respeta el horario (L–S 8:00–18:00; domingos y festivos 9:00–12:30; festivos calculados en `js/horario.js`), el servicio debe terminar antes del cierre. Constantes editables arriba: `CUPOS=2` (vehículos a la vez), `PASO=30`, `ANTELACION=60`, `DIAS_ADELANTE=45`.
- **Backend** (`apps_script_km.gs`): pestaña `CITAS` (se crea sola), `doGet?action=citas&desde&hasta` (solo fecha/hora/duración ocupadas, sin datos personales) y `doPost action=agendar` (valida horario, cupos con LockService, máx. 3 citas a futuro por celular, estado PENDIENTE; avisa por correo al dueño). El dueño confirma o cancela cambiando ESTADO en la hoja. Función `probarCitas()` para probar. Hay que publicar una **versión nueva** del Apps Script (misma URL).
- Archivos nuevos que se suben al hosting: `js/pdf.js`, `js/agenda.js`, `js/jspdf.umd.min.js`.
