# Multiservicios JRG — página web

Tienda y cotizador de cambio de aceite para Multiservicios JRG (Bogotá). Es una página estática: HTML, CSS y JavaScript, sin instalar nada.

## Cómo verla
Abre `index.html` con doble clic. Para probar como si estuviera publicada: `python -m http.server 8000` dentro de esta carpeta y entra a http://localhost:8000.

## Qué hay en la carpeta
- `index.html`, `css/`, `js/`, `img/`: la página (`img/bolt.webp` es Bolt, la mascota del Inicio; sus consejos están en `js/inicio.js`).
- `admin.html`: panel para editar precios, disponibilidad y fotos (solo en tu computador, no se publica).
- `apps_script_km.gs`: copia (versión 8) del script de Google que conecta la página con el Excel de control. El ID real de la hoja no está aquí.
- `generador-qr.html`: crea el QR del registro escribiendo la dirección de tu página (solo para ti, no se publica).
- `js/precios-servicios.js`: precios de frenos, refrigerante, hidráulico y mano de obra de valvulina (se editan con el Bloc de notas).
- `CLAUDE.md`: reglas del proyecto (fotos, tarjeta virtual, kilometraje, textos legales).

## Publicarla
Sube el contenido de esta carpeta al hosting (sin `admin.html`, `generador-qr.html`, `apps_script_km.gs`, `CLAUDE.md`, `README.md`, `_respaldo/`, `.zip` ni `.git`). La dirección del script de Google está en `js/config.js`.

## Datos de clientes
La página no guarda datos por su cuenta: los registros y kilometrajes llegan al Excel «INVENTARIO 2026 JRG» (pestañas REGISTRO WEB y KM WEB) como PENDIENTE hasta que el dueño los confirme.

## Agenda y órdenes en PDF
En Cotizar (cliente nuevo) y en Registro el cliente puede elegir día y hora en un calendario; los horarios salen según el servicio y el horario del taller. Las citas llegan a la pestaña CITAS del Excel como PENDIENTE; tú las confirmas cambiando ESTADO. El comprobante se descarga en PDF. Requiere publicar la versión nueva del Apps Script (ver `apps_script_km.gs`).

## Código QR del local
Abre la página con `#qr` al final (por ejemplo `https://tu-sitio.com/#qr`), revisa la dirección, imprime o descarga el QR. Quien lo escanea llega a `#ingreso`: escribe placa y kilometraje y ve su tarjeta de cambios, o se registra si es su primera vez.
