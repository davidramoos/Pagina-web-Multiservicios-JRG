/**
 * MULTISERVICIOS JRG - Puente entre la página web y la hoja "INVENTARIO 2026 JRG"
 *
 *  - La hoja se queda PRIVADA. Solo este script la lee.
 *  - buscar    -> devuelve ÚNICAMENTE los datos de la placa consultada: todos sus cambios (CONTROL 2026 + REGISTRO WEB)
 *                 y los datos de contacto registrados con esa placa PARCIALMENTE OCULTOS (310***8877, l***@gmail.com).
 *  - registrar -> cada formulario agrega una fila en "REGISTRO WEB" (es un cambio del historial). Si el cliente deja su
 *                 correo y acepta, queda en la pestaña "CORREOS".
 *  - correo    -> un cliente ya registrado agrega su correo desde la tarjeta (se verifica con su celular).
 *  - enviarRecordatorios() -> corre sola cada día: manda un correo cada ~25 días a quien aceptó (máx. 6 seguidos sin
 *                 que haga un cambio nuevo). Cada correo trae un enlace para darse de baja.
 *  - Próximo cambio (columna K de CONTROL 2026): si J trae km → km + 5.000 (mineral/granel), 7.000 (semisintético) o 10.000 (sintético); si J trae una FECHA →
 *                 fecha + 3-4 meses (mineral), 7-9 (semisintético) o 12 (sintético). Se escribe solo (nunca pisa lo que escribas a mano) y también en REGISTRO WEB.
 *                 Menú JRG > Calcular próximo cambio (km o fecha).
 *  Cómo publicarlo: ver LEEME.txt.
 */
const SHEET_ID = 'PON_AQUI_EL_ID_DE_LA_HOJA';  // copia de la Versión 6 instalada; el ID real está solo en Apps Script (no subir a un repositorio público)
const HOJA_CONTROL = 'CONTROL 2026';      // pestaña donde llevan los cambios de aceite
const HOJA_REGISTRO = 'REGISTRO WEB';     // pestaña nueva: cambios registrados desde la página
const HOJA_AVISOS = 'RECORDATORIOS';      // lista diaria (con enlace de WhatsApp) de quién está por vencer
const MAX_CONSULTAS_POR_MINUTO = 60;      // freno básico contra consultas masivas
const COLUMNAS = 11;                      // A..K de CONTROL 2026

/* ---- Recordatorios por correo: ajusta a tu gusto ---- */
const DIAS_ENTRE_CORREOS = 25;            // un correo cada ~25 días (entre 20 y 30)
const MAX_CORREOS_SEGUIDOS = 6;           // si no hace un cambio nuevo, deja de escribirle después de 6 correos
const MESES_ENTRE_CAMBIOS = 3;            // si no se sabe el tipo de aceite: próximo cambio = último cambio + 3 meses. Si se sabe, se usa MESES_CAMBIO (mineral 3, semi 7, sintético 12)
const MAX_CORREOS_POR_DIA = 80;           // el límite gratis de Gmail es ~100 al día
const LISTA_VENCIDOS_MAX_DIAS = 60;       // la lista de WhatsApp incluye vencidos hasta 60 días atrás
const TEL_NEGOCIO = '3125529044';
const NOMBRE_NEGOCIO = 'Multiservicios JRG';
const HOJA_CORREOS = 'CORREOS';           // placa, celular, correo, estado (solo quien aceptó)

/* Columnas de REGISTRO WEB */
const ENC = ['FECHA REGISTRO', 'PLACA', 'TIPO', 'MARCA', 'MODELO', 'AÑO', 'PROPIETARIO', 'CELULAR', 'KM', 'ACEITE', 'CANTIDAD (cuartos)', 'FECHA DE CAMBIO', 'ACEPTA DATOS', 'ACEPTA CORREO', 'ESTADO', 'PRÓX. CAMBIO (KM)'];
const EC = ['PLACA', 'CELULAR', 'CORREO', 'FECHA ACEPTA', 'ULTIMO ENVIO', 'ENVIOS SEGUIDOS', 'ESTADO', 'TOKEN'];
const CE = { placa: 1, cel: 2, correo: 3, acepta: 4, envio: 5, envios: 6, estado: 7, token: 8 };
const C = { reg: 1, placa: 2, tipo: 3, marca: 4, modelo: 5, anio: 6, nombre: 7, cel: 8, km: 9, aceite: 10, cant: 11, fecha: 12, datos: 13, correo: 14, estado: 15, prox: 16 };

/* ---------- Entradas web ---------- */
function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.action === 'buscar') return json_(buscar_(p.placa, p.celular));
    if (p.action === 'baja') return pagina_(baja_(p.t));
    if (p.action === 'kmpend') return json_(kmPendiente_(p.placa));
    if (p.action === 'citas') return json_(citas_(p.desde, p.hasta));
    if (p.action === 'ping') return json_(ping_());
    return json_({ ok: true, servicio: 'JRG' });
  } catch (err) { console.error(err); return json_({ ok: false, error: 'error' }); }
}
function ping_() {                                       // abre  TU_URL?action=ping  en el navegador para ver si todo está conectado (no muestra datos de clientes)
  const out = { ok: true, servicio: 'JRG', version: '2026-11-26' };
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID), c = ss.getSheetByName(HOJA_CONTROL), r = ss.getSheetByName(HOJA_REGISTRO), m = ss.getSheetByName(HOJA_CORREOS);
    out.hoja_control = c ? 'ok (' + c.getLastRow() + ' filas)' : 'NO ENCONTRADA: revisa HOJA_CONTROL = "' + HOJA_CONTROL + '"';
    out.hoja_registro_web = r ? 'ok (' + Math.max(0, r.getLastRow() - 1) + ' registros)' : 'se crea con el primer registro';
    const ci = ss.getSheetByName(HOJA_CITAS); out.hoja_citas = ci ? 'ok (' + Math.max(0, ci.getLastRow() - 1) + ' citas)' : 'se crea con la primera cita';
    out.hoja_correos = m ? 'ok (' + Math.max(0, m.getLastRow() - 1) + ' correos)' : 'se crea con el primer correo';
    out.recordatorios_programados = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'enviarRecordatorios') ? 'si' : 'NO: ejecuta activarRecordatorios';
  } catch (err) { out.ok = false; out.error = 'No se pudo abrir la hoja: ' + err.message; }
  return out;
}
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.action === 'registrar') return json_(registrar_(d));
    if (d.action === 'correo') return json_(correo_(d));
    if (d.action === 'km') return json_(registrarKm_(d));
    if (d.action === 'agendar') return json_(agendar_(d));
    return json_({ ok: false, error: 'accion' });
  } catch (err) { console.error(err); return json_({ ok: false, error: 'error' }); }
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Utilidades ---------- */
function normPlaca_(x) { return String(x || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
const RX_PLACA = /^[A-Z]{3}\d{2}[A-Z0-9]$/;              // carro ABC123 / moto ABC12D
function limite_() {
  const c = CacheService.getScriptCache(), k = 'rl_' + Math.floor(Date.now() / 60000);
  const n = (+c.get(k) || 0) + 1; c.put(k, String(n), 90);
  return n > MAX_CONSULTAS_POR_MINUTO;
}
function extraerPlaca_(t) {                              // la placa viene escrita al final del nombre del vehículo
  const s = String(t).toUpperCase(), re = /(?:^|[^A-Z0-9])([A-Z]{3})[\s-]?(\d{2}[A-Z0-9])(?![A-Z0-9])/g;
  let m, ult = ''; while ((m = re.exec(s))) ult = m[1] + m[2]; return ult;
}
function parseFecha_(t) {                                // dd/mm/aaaa, dd-mm-aa, aaaa-mm-dd o Date -> Date | null
  if (t instanceof Date) return isNaN(t) ? null : t;
  const s = String(t || ''); let m = /(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = /(?<!\d)(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})(?!\d)/.exec(s);
  if (m) { let y = +m[3]; if (y < 100) y += 2000; return new Date(y, +m[2] - 1, +m[1]); }
  return null;
}
function fechaNum_(s) { const d = parseFecha_(s); return d ? d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() : 0; }
function numAFecha_(n) { return new Date(Math.floor(n / 10000), Math.floor(n / 100) % 100 - 1, n % 100); }
function aISO_(v) { const d = parseFecha_(v); return d ? Utilities.formatDate(d, 'America/Bogota', 'yyyy-MM-dd') : ''; }
function mesesAviso_(tipo) { return (MESES_CAMBIO[tipo] || [MESES_ENTRE_CAMBIOS])[0]; }
function diasHasta_(d) { const h = new Date(); return Math.round((d - new Date(h.getFullYear(), h.getMonth(), h.getDate())) / 864e5); }
function sinTildes_(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, ''); }

/* Lee la columna A de CONTROL una sola vez por consulta (antes se leía 2 o 3 veces y tardaba más de 40 s) */
let _COLA = null;
function colA_() {
  if (_COLA) return _COLA;
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(HOJA_CONTROL);
  const last = sh ? sh.getLastRow() : 0;
  _COLA = { sh: sh, A: last < 2 ? [] : sh.getRange(2, 1, last - 1, 1).getDisplayValues().map(r => String(r[0]).trim()) };
  return _COLA;
}

/* ---------- Hoja REGISTRO WEB ---------- */
function hojaReg_(crear) {
  const ss = SpreadsheetApp.openById(SHEET_ID); let sh = ss.getSheetByName(HOJA_REGISTRO);
  if (!sh && crear) { sh = ss.insertSheet(HOJA_REGISTRO); sh.setFrozenRows(1); }
  if (sh && String(sh.getRange(1, ENC.length).getValue()) !== ENC[ENC.length - 1]) sh.getRange(1, 1, 1, ENC.length).setValues([ENC]);   // deja los encabezados al día
  return sh;
}
function filasReg_(sh) {                                 // todas las filas de la hoja de registro
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, ENC.length).getValues();
}

function hojaCorreos_(crear) {
  const ss = SpreadsheetApp.openById(SHEET_ID); let sh = ss.getSheetByName(HOJA_CORREOS);
  if (!sh && crear) { sh = ss.insertSheet(HOJA_CORREOS); sh.getRange(1, 1, 1, EC.length).setValues([EC]); sh.setFrozenRows(1); }
  return sh;
}
function filasCorreos_() { const sh = hojaCorreos_(false); return !sh || sh.getLastRow() < 2 ? [] : sh.getRange(2, 1, sh.getLastRow() - 1, EC.length).getValues(); }
function mascaraCel_(c) { c = String(c || '').replace(/\D/g, ''); return c.length === 10 ? c.slice(0, 3) + '***' + c.slice(6) : ''; }
function mascaraCorreo_(e) { e = String(e || ''); const i = e.indexOf('@'); return i < 1 ? '' : e[0] + '***' + e.slice(i); }
function mascaraNombre_(n) { const p = String(n || '').trim().split(/\s+/).filter(Boolean); return p.length ? p[0] + (p[1] ? ' ' + p[1][0] + '.' : '') : ''; }
/* ---------- Verificación por celular (para ver los datos completos y los demás vehículos del cliente) ---------- */
function celsDe_(placa) {                                // todos los celulares conocidos de esa placa (REGISTRO WEB y CONTROL)
  const out = [];
  filasReg_(hojaReg_(false)).forEach(v => { if (normPlaca_(v[C.placa - 1]) === placa) { const c = String(v[C.cel - 1]).replace(/\D/g, ''); if (/^3\d{9}$/.test(c) && out.indexOf(c) < 0) out.push(c); } });
  const k = celDeControl_(placa); if (k && out.indexOf(k) < 0) out.push(k);
  return out;
}
function verificarCel_(placa, cel) {                     // 'ok' | 'no' | 'sin' (placa sin celular) | 'bloq' (demasiados intentos)
  const cache = CacheService.getScriptCache(), k = 'f_' + placa, n = +cache.get(k) || 0;
  if (n >= 5) return 'bloq';                             // 5 intentos fallidos por placa cada hora: evita adivinar celulares
  if (!/^3\d{9}$/.test(cel)) return 'no';
  const cels = celsDe_(placa); if (!cels.length) return 'sin';
  if (cels.indexOf(cel) >= 0) return 'ok';
  cache.put(k, String(n + 1), 3600); return 'no';
}
function contactoCompleto_(placa) {                      // solo se entrega a quien confirmó el celular de esa placa
  const web = filasReg_(hojaReg_(false)).filter(v => normPlaca_(v[C.placa - 1]) === placa), w0 = web.length ? web[web.length - 1] : null;
  const ce = filasCorreos_().filter(v => normPlaca_(v[CE.placa - 1]) === placa && v[CE.estado - 1] === 'ACTIVO')[0];
  return { nombre: w0 ? String(w0[C.nombre - 1]) : '', celular: celsDe_(placa)[0] || '', correo: ce ? String(ce[CE.correo - 1]) : '', tieneCorreo: !!ce };
}
function placasPorCel_(cel, excepto) {                   // otros vehículos registrados con ese mismo celular
  const out = [], vistos = {}; vistos[excepto] = 1;
  const add = (p, v) => { if (p && !vistos[p] && out.length < 30) { vistos[p] = 1; out.push({ placa: p, vehiculo: v }); } };
  filasReg_(hojaReg_(false)).forEach(v => { if (String(v[C.cel - 1]).replace(/\D/g, '') === cel) add(normPlaca_(v[C.placa - 1]), [v[C.marca - 1], v[C.modelo - 1], v[C.anio - 1]].join(' ').replace(/\s+/g, ' ').trim()); });
  { const A = colA_().A; let t = '';
    A.forEach(a => { if (a && !esCel_(a)) t = a; else { const m = RX_CELNUM.exec(a); if (m && m[1] === cel && t) add(extraerPlaca_(t), t.replace(/[\s-]*[A-Za-z]{3}[\s-]?\d{2}[A-Za-z0-9]\s*$/, '').trim()); } });
  }
  return out;
}
function pagina_(msg) {
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:Arial,sans-serif;text-align:center;padding:48px 20px;color:#0A2A66"><h2>' + NOMBRE_NEGOCIO + '</h2><p style="font-size:1.1rem">' + msg + '</p></body>').setTitle(NOMBRE_NEGOCIO);
}
function celDeControl_(placa) {                          // celular de la fila "CEL ..." del bloque de esa placa (solo para verificar, nunca se devuelve completo)
  const A = colA_().A; let dentro = false;
  for (let i = 0; i < A.length; i++) {
    const a = A[i];
    if (a && !esCel_(a)) dentro = extraerPlaca_(a) === placa;
    else if (dentro) { const m = RX_CELNUM.exec(a); if (m) return m[1]; }
  }
  return '';
}

/* ---------- Lectura de CONTROL 2026 (estructura por bloques de vehículo) ----------
   Fila del vehículo:  A=VEHICULO(+placa)  B=ACEITE  C=FILTRO AIRE  D=FILTRO ACEITE  E=FILTRO COMBUSTIBLE
                       F=CANTIDAD  G=FECHA  H=VALOR  I=TOTAL CAMBIOS  J=KM  K=PROX. CAMBIO
   Filas siguientes del mismo vehículo: A vacío (o "CEL ..." con el teléfono, que NO se expone).     */
function parseBloque_(titulo, vals) {                    // función pura: se puede probar sin la hoja
  const cambios = []; let aceite = '';
  vals.forEach(r => {
    const c = r.map(x => String(x == null ? '' : x).trim());
    if (c[1]) aceite = c[1];
    if (!c[6]) return;                                   // solo filas con fecha de cambio
    cambios.push({ f: c[6], aceite: c[1] || aceite, cant: c[5], fa: c[2], fi: c[3], fc: c[4], valor: c[7], total: c[8], km: c[9], prox: c[10], pk: pkFila_(c[9], c[1] || aceite, c[10]) });
  });
  return { titulo: titulo, placa: extraerPlaca_(titulo), cambios: cambios };
}
function bloquesDe_(placa) {
  const c = colA_(), sh = c.sh, A = c.A;
  if (!sh || !A.length) return [];
  const inicios = [];
  for (let i = 0; i < A.length; i++) { const a = A[i]; if (a && !esCel_(a)) inicios.push({ i: i, t: a }); }
  const out = [];
  inicios.forEach((s, n) => {
    if (extraerPlaca_(s.t) !== placa) return;
    const fin = n + 1 < inicios.length ? inicios[n + 1].i : A.length;
    out.push(parseBloque_(s.t, sh.getRange(2 + s.i, 1, fin - s.i, COLUMNAS).getDisplayValues())); // solo ese bloque
  });
  return out;
}

/* ---------- buscar ---------- */
function buscar_(placaRaw, celRaw) {
  const placa = normPlaca_(placaRaw);
  if (!RX_PLACA.test(placa)) return { ok: false, error: 'placa' };
  if (limite_()) return { ok: false, error: 'ocupado' };
  const cache = CacheService.getScriptCache(), hit = cache.get('p_' + placa);
  if (hit) return conCelular_(JSON.parse(hit), placa, celRaw);
  const bl = bloquesDe_(placa);
  const web = filasReg_(hojaReg_(false)).filter(v => normPlaca_(v[C.placa - 1]) === placa);
  let res;
  if (!bl.length && !web.length) res = { ok: true, encontrado: false, registrada: false };
  else {
    let cambios = [].concat.apply([], bl.map(b => b.cambios));
    web.forEach(v => {
      if (String(v[C.estado - 1] || '').toUpperCase() === 'PENDIENTE') return;   // lo que envía el cliente no entra a la tarjeta hasta que el dueño lo confirme
      const f = aISO_(v[C.fecha - 1]); if (!f) return;
      cambios.push({ f: f, aceite: String(v[C.aceite - 1] || ''), cant: String(v[C.cant - 1] || ''), fa: '', fi: '', fc: '', valor: '', total: '', km: String(v[C.km - 1] || ''), prox: '', pk: pkFila_(v[C.km - 1], v[C.aceite - 1], v[C.prox - 1]) });
    });
    cambios.sort((a, b) => fechaNum_(b.f) - fechaNum_(a.f));
    let vehiculo;
    if (bl.length) vehiculo = bl[0].titulo.replace(/[\s-]*[A-Za-z]{3}[\s-]?\d{2}[A-Za-z0-9]\s*$/, '').trim() || bl[0].titulo;
    else { const v = web[web.length - 1]; vehiculo = [v[C.marca - 1], v[C.modelo - 1], v[C.anio - 1]].join(' ').replace(/\s+/g, ' ').trim(); }
    const w0 = web.length ? web[web.length - 1] : null, ce = filasCorreos_().filter(v => normPlaca_(v[CE.placa - 1]) === placa && v[CE.estado - 1] === 'ACTIVO')[0];
    const cel = w0 ? String(w0[C.cel - 1]) : celDeControl_(placa);
    const contacto = { nombre: w0 ? mascaraNombre_(w0[C.nombre - 1]) : '', celular: mascaraCel_(cel), correo: ce ? mascaraCorreo_(ce[CE.correo - 1]) : '', tieneCorreo: !!ce };
    res = cambios.length ? { ok: true, encontrado: true, placa: placa, vehiculo: vehiculo, cambios: cambios, contacto: contacto }
                         : { ok: true, encontrado: false, registrada: true, vehiculo: vehiculo };
  }
  cache.put('p_' + placa, JSON.stringify(res), 120);
  return conCelular_(res, placa, celRaw);
}
function conCelular_(res, placa, celRaw) {            // la respuesta pública (con datos ocultos) se completa solo si confirman el celular
  const cel = String(celRaw || '').replace(/\D/g, '');
  if (!cel || !res.ok || !(res.encontrado || res.registrada)) return res;
  const v = verificarCel_(placa, cel);
  if (v !== 'ok') return Object.assign({}, res, { verificado: false, verif: v });
  return Object.assign({}, res, { verificado: true, contacto: contactoCompleto_(placa), otros: placasPorCel_(cel, placa) });
}

/* ---------- registrar ---------- */
function safe_(v, n) { v = String(v == null ? '' : v).trim().slice(0, n || 80); return /^[=+\-@]/.test(v) ? "'" + v : v; }
function registrar_(d) {
  if (d.web) return { ok: true };                        // campo trampa: los bots lo llenan; se ignora en silencio
  if (limite_()) return { ok: false, error: 'ocupado' };
  const placa = normPlaca_(d.placa), cel = String(d.celular || '').replace(/\D/g, '');
  if (!RX_PLACA.test(placa)) return { ok: false, error: 'placa' };
  if (!/^3\d{9}$/.test(cel)) return { ok: false, error: 'celular' };
  if (String(d.nombre || '').trim().length < 3) return { ok: false, error: 'nombre' };
  if (!d.acepta) return { ok: false, error: 'acepta' };
  const f = parseFecha_(d.fecha), hoy = new Date();
  if (!f || f > new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1) || f < new Date(hoy.getFullYear() - 5, 0, 1)) return { ok: false, error: 'fecha' };
  const cant = String(d.cantidad == null ? '' : d.cantidad).replace(',', '.').trim();
  if (cant && !/^\d{1,2}(\.\d{1,2})?$/.test(cant)) return { ok: false, error: 'cantidad' };
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const sh = hojaReg_(true), filas = filasReg_(sh), prev = filas.filter(v => normPlaca_(v[C.placa - 1]) === placa);
    if (prev.length && String(prev[0][C.cel - 1]).replace(/\D/g, '') !== cel) return { ok: false, error: 'celular_distinto' };   // solo el dueño del celular registrado agrega cambios a esa placa
    const iso = Utilities.formatDate(f, 'America/Bogota', 'yyyy-MM-dd');
    if (prev.some(v => aISO_(v[C.fecha - 1]) === iso)) return { ok: true, duplicado: true };
    const mail = String(d.correo || '').trim().toLowerCase(), quiere = !!d.recordar && validarCorreo_(mail);
    sh.appendRow([new Date(), placa, safe_(d.tipo, 20), safe_(d.marca, 40), safe_(d.modelo, 40), safe_(d.anio, 4), safe_(d.nombre, 80), cel, safe_(d.km, 10), safe_(d.aceite, 60), cant, f, 'SI', quiere ? 'SI' : 'NO', 'PENDIENTE', pkFila_(d.km, d.aceite, '') || '']);   // PENDIENTE: no sale en la tarjeta hasta que el dueño cambie ESTADO a CONFIRMADO
    if (quiere) guardarCorreo_(placa, cel, mail);
    CacheService.getScriptCache().remove('p_' + placa);   // el cliente ya puede ver este cambio al buscar su placa
    return { ok: true, nuevo: !prev.length };
  } finally { lock.releaseLock(); }
}

function validarCorreo_(c) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c) && c.length <= 80; }
function guardarCorreo_(placa, cel, correo) {            // una fila por placa (se reemplaza si ya existe)
  const sh = hojaCorreos_(true), F = filasCorreos_(); let fila = 0;
  F.forEach((v, i) => { if (normPlaca_(v[CE.placa - 1]) === placa) fila = i + 2; });
  const token = fila ? String(sh.getRange(fila, CE.token).getValue()) || Utilities.getUuid() : Utilities.getUuid();
  const datos = [placa, cel, correo, new Date(), '', 0, 'ACTIVO', token];
  if (fila) { const v = sh.getRange(fila, 1, 1, EC.length).getValues()[0]; datos[CE.envio - 1] = v[CE.envio - 1]; sh.getRange(fila, 1, 1, EC.length).setValues([datos]); }
  else sh.appendRow(datos);
  CacheService.getScriptCache().remove('p_' + placa);
}
function correo_(d) {                                    // un cliente agrega su correo desde la tarjeta
  if (limite_()) return { ok: false, error: 'ocupado' };
  const placa = normPlaca_(d.placa), cel = String(d.celular || '').replace(/\D/g, ''), mail = String(d.correo || '').trim().toLowerCase();
  if (!RX_PLACA.test(placa) || !/^3\d{9}$/.test(cel) || !validarCorreo_(mail) || !d.acepta) return { ok: false, error: 'datos' };
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const v = verificarCel_(placa, cel);
    if (v === 'sin') return { ok: false, error: 'sin_celular' };
    if (v === 'bloq') return { ok: false, error: 'ocupado' };
    if (v !== 'ok') return { ok: false, error: 'celular_distinto' };   // solo quien conoce el celular registrado puede poner el correo
    guardarCorreo_(placa, cel, mail);
    return { ok: true };
  } finally { lock.releaseLock(); }
}
function baja_(token) {
  token = String(token || '').trim(); if (!/^[0-9a-f-]{36}$/i.test(token)) return 'Enlace no válido.';
  const sh = hojaCorreos_(false); if (!sh || sh.getLastRow() < 2) return 'Enlace no válido.';
  const T = sh.getRange(2, CE.token, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < T.length; i++) if (T[i][0] === token) { sh.getRange(i + 2, CE.estado).setValue('BAJA'); CacheService.getScriptCache().remove('p_' + normPlaca_(sh.getRange(i + 2, CE.placa).getValue())); return 'Listo, no te enviaremos más recordatorios.'; }
  return 'Enlace no válido.';
}

/* ---------- Recordatorios (se ejecutan solos cada día) ---------- */
function ultimasFechas_() {                              // placa -> {n: última fecha numérica, cel: celular de CONTROL}
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(HOJA_CONTROL), out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  const V = sh.getRange(2, 1, sh.getLastRow() - 1, COLUMNAS).getDisplayValues(); let placa = '', titulo = '', aceite = '';
  V.forEach(r => {
    const a = String(r[0]).trim();
    if (a && !esCel_(a)) { placa = extraerPlaca_(a); titulo = a; aceite = ''; if (placa && !out[placa]) out[placa] = { n: 0, cel: '', veh: titulo, t: '' }; }
    if (String(r[1]).trim()) aceite = String(r[1]).trim();
    const m = RX_CELNUM.exec(a); if (m && placa && out[placa]) out[placa].cel = m[1];
    const n = fechaNum_(r[6]); if (placa && out[placa] && n > out[placa].n) { out[placa].n = n; out[placa].t = tipoAceite_(aceite); }
  });
  return out;
}
function contactos_() {                                  // para la lista de WhatsApp: web + clientes de CONTROL con celular
  const ctl = ultimasFechas_(), mapa = {};
  filasReg_(hojaReg_(false)).forEach(v => {
    const p = normPlaca_(v[C.placa - 1]), f = parseFecha_(v[C.fecha - 1]);
    const x = mapa[p] || (mapa[p] = { placa: p, nombre: v[C.nombre - 1], cel: String(v[C.cel - 1]).replace(/\D/g, ''), veh: [v[C.marca - 1], v[C.modelo - 1]].join(' ').trim(), ult: null, t: '' });
    if (f && (!x.ult || f > x.ult)) { x.ult = f; x.t = tipoAceite_(v[C.aceite - 1]); }
  });
  Object.keys(ctl).forEach(p => {
    const c = ctl[p], f = c.n ? numAFecha_(c.n) : null;
    if (mapa[p]) { if (f && (!mapa[p].ult || f > mapa[p].ult)) { mapa[p].ult = f; mapa[p].t = c.t; } }
    else if (c.cel) mapa[p] = { placa: p, nombre: '', cel: c.cel, veh: c.veh, ult: f, t: c.t };
  });
  return Object.keys(mapa).map(k => mapa[k]).filter(x => x.ult && /^3\d{9}$/.test(x.cel));
}
function ultimaFecha_(placa, ctl, web) {                 // última fecha de cambio de una placa (CONTROL + REGISTRO WEB)
  let u = ctl[placa] && ctl[placa].n ? numAFecha_(ctl[placa].n) : null; if (u) u.tipo = ctl[placa].t;
  web.forEach(v => { if (normPlaca_(v[C.placa - 1]) === placa) { const f = parseFecha_(v[C.fecha - 1]); if (f && (!u || f > u)) { u = f; u.tipo = tipoAceite_(v[C.aceite - 1]); } } });
  return u;
}
function enviarRecordatorios() {
  const sh = hojaCorreos_(false), hoy = new Date();
  if (sh && sh.getLastRow() > 1) {
    const ctl = ultimasFechas_(), web = filasReg_(hojaReg_(false)), F = filasCorreos_(); let n = 0;
    F.forEach((v, i) => {
      if (v[CE.estado - 1] !== 'ACTIVO' || !validarCorreo_(String(v[CE.correo - 1]))) return;
      const placa = normPlaca_(v[CE.placa - 1]), ult = ultimaFecha_(placa, ctl, web); if (!ult) return;
      let env = v[CE.envio - 1] instanceof Date ? v[CE.envio - 1] : null, seguidos = +v[CE.envios - 1] || 0;
      if (env && ult > env) { seguidos = 0; env = null; sh.getRange(i + 2, CE.envios).setValue(0); }   // hizo un cambio nuevo: se reinicia
      const desdeCambio = Math.round((hoy - ult) / 864e5), desdeEnvio = env ? Math.round((hoy - env) / 864e5) : 999;
      if (desdeCambio < DIAS_ENTRE_CORREOS || desdeEnvio < DIAS_ENTRE_CORREOS || seguidos >= MAX_CORREOS_SEGUIDOS) return;
      if (n >= Math.min(MAX_CORREOS_POR_DIA, MailApp.getRemainingDailyQuota())) return;
      const w = web.filter(r => normPlaca_(r[C.placa - 1]) === placa).pop(), veh = (w ? [w[C.marca - 1], w[C.modelo - 1]].join(' ').trim() : (ctl[placa] || {}).veh) || 'tu vehículo';
      let tok = String(v[CE.token - 1] || ''); if (!tok) { tok = Utilities.getUuid(); sh.getRange(i + 2, CE.token).setValue(tok); }   // sirve también para correos que escribas a mano en la pestaña CORREOS
      enviarCorreo_(String(v[CE.correo - 1]), veh, placa, ult, tok);
      sh.getRange(i + 2, CE.envio, 1, 2).setValues([[hoy, seguidos + 1]]); n++;
    });
    console.log('Correos enviados: ' + n);
  }
  listaWhatsApp_();
}
function enviarCorreo_(to, veh, placa, ult, token) {
  const sig = sumarMeses_(ult, mesesAviso_(ult.tipo)), dias = diasHasta_(sig), f = d => Utilities.formatDate(d, 'America/Bogota', 'dd/MM/yyyy');
  const fr = dias < 0 ? 'Tu cambio de aceite ya pasó hace ' + (-dias) + ' días. ¡No lo dejes pasar!' : dias === 0 ? 'Tu cambio de aceite es hoy.' : 'Faltan ' + dias + ' días para tu próximo cambio de aceite.';
  const baja = ScriptApp.getService().getUrl() + '?action=baja&t=' + token;
  MailApp.sendEmail({
    to: to, name: NOMBRE_NEGOCIO, subject: 'Acuérdate de tu cambio de aceite · ' + placa,
    htmlBody: '<div style="font-family:Arial,sans-serif;color:#0A2A66;max-width:480px"><h2 style="margin-bottom:6px">' + NOMBRE_NEGOCIO + '</h2><p>Te hablamos desde ' + NOMBRE_NEGOCIO + ': acuérdate de tu cambio de aceite, no lo dejes pasar.</p><div style="background:#0A2A66;color:#fff;border-radius:14px;padding:18px"><div style="opacity:.8;font-size:12px">TARJETA DE CAMBIO</div><div style="font-size:20px;font-weight:bold">' + escH_(veh) + ' · ' + escH_(placa) + '</div><p>Último cambio: <b>' + f(ult) + '</b><br>Próximo cambio: <b>' + f(sig) + '</b></p><p style="font-size:16px;margin:0"><b>' + fr + '</b></p></div><p>Escríbenos por WhatsApp al <b>' + TEL_NEGOCIO + '</b> y te cotizamos. Con el cambio completo la mano de obra es gratis.</p><p style="color:#778;font-size:12px">Si ya no quieres recibir estos mensajes, <a href="' + baja + '">date de baja aquí</a>.</p></div>'
  });
}
function escH_(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function listaWhatsApp_() {                              // pestaña RECORDATORIOS: quién está por vencer, con enlace de WhatsApp ya escrito (gratis, lo envías tú)
  const filas = [];
  contactos_().forEach(x => {
    const sig = sumarMeses_(x.ult, mesesAviso_(x.t)), dias = diasHasta_(sig); if (dias > 15 || dias < -LISTA_VENCIDOS_MAX_DIAS) return;
    const txt = 'Hola' + (x.nombre ? ' ' + String(x.nombre).split(' ')[0] : '') + ', te hablamos desde ' + NOMBRE_NEGOCIO + ': acuérdate de tu cambio de aceite (' + x.placa + '), no lo dejes pasar. ' + (dias < 0 ? 'Ya está vencido.' : 'Faltan ' + dias + ' días.') + ' ¿Te lo cotizamos?';
    filas.push([x.placa, x.nombre, x.cel, Utilities.formatDate(sig, 'America/Bogota', 'dd/MM/yyyy'), dias, '=HYPERLINK("https://wa.me/57' + x.cel + '?text=' + encodeURIComponent(txt) + '";"Enviar WhatsApp")']);
  });
  filas.sort((a, b) => a[4] - b[4]);
  const ss = SpreadsheetApp.openById(SHEET_ID), h = ss.getSheetByName(HOJA_AVISOS) || ss.insertSheet(HOJA_AVISOS);
  h.clear(); h.getRange(1, 1, 1, 6).setValues([['PLACA', 'PROPIETARIO', 'CELULAR', 'PRÓXIMO CAMBIO', 'DÍAS (negativo = vencido)', 'WHATSAPP']]); h.setFrozenRows(1);
  if (filas.length) h.getRange(2, 1, filas.length, 6).setValues(filas);
}
function activarRecordatorios() {                        // ejecútala UNA vez a mano: crea el disparador diario (9 a. m.)
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'enviarRecordatorios').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('enviarRecordatorios').timeBased().everyDays(1).atHour(9).inTimezone('America/Bogota').create();
  console.log('Listo: se revisa todos los días a las 9 a. m.');
}

/* ---------- Ayudas para el dueño (ejecutar a mano desde el editor) ---------- */
function probar() {                                      // cuenta vehículos y avisa cuántos no tienen placa legible
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(HOJA_CONTROL);
  const A = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues();
  let total = 0, sin = 0;
  A.forEach(r => { const a = String(r[0]).trim(); if (a && !esCel_(a)) { total++; if (!extraerPlaca_(a)) sin++; } });
  console.log('Vehículos en CONTROL: ' + total + ' | sin placa legible: ' + sin);
}
function probarCorreo() {                                // te envía a TI un correo de ejemplo para comprobar que Gmail funciona
  const yo = Session.getEffectiveUser().getEmail();
  enviarCorreo_(yo, 'Chevrolet Aveo (ejemplo)', 'ABC123', sumarMeses_(new Date(), -2), 'prueba');
  console.log('Correo de ejemplo enviado a ' + yo + '. Cupo diario restante: ' + MailApp.getRemainingDailyQuota());
}

/* ---------- PRÓXIMO cambio: por KILÓMETROS o por FECHA, siempre en la misma columna K ----------
   J = KM ACTUAL · K = PROX. CAMBIO. Se calcula solo, según el tipo de aceite, y NUNCA pisa lo que escribas a mano.
   - Si en J hay un número (km):  K = km + 5.000 (mineral / granel) · 7.000 (semisintético) · 10.000 (full sintético).
   - Si en J hay una FECHA (carros que se controlan por tiempo, no por km): K = esa fecha + meses:
     mineral 3 a 4 · semisintético 7 a 9 · full sintético 12  →  ej. J 21/05/26 mineral = K 21/08/26 a 21/09/26 · sintético = K 21/05/27.
   "SELLADO" y "GRANEL" solo diferencian la presentación del mismo aceite: el tipo (mineral, semi, sintético) sale de la marca y la viscosidad.
   Para cambiar las reglas edita SOLO KM_PROX y MESES_CAMBIO (y las mismas constantes en js/kmcambio.js de la página). */
const KM_PROX = { mineral: 5000, semi: 7000, sintetico: 10000 };   // semisintético: 7.000 desde 27-nov-2026 (antes 6.000)
const MESES_CAMBIO = { mineral: [3, 4], semi: [7, 9], sintetico: [12, 12] };   // [mínimo, máximo]
const ENC_PROX_FECHA = 'PRÓX. CAMBIO (FECHA)';           // encabezado de la columna M que se usó antes (quitarColumnaM la limpia)
const RX_FECHA_TXT = /\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|\d{4}-\d{2}-\d{2}/;
/* Fila de celular dentro del bloque de un vehículo: "CEL 3101234567", "CELU 3101234567", "CELULAR ...", "CELUL", "CELUI", "CELI", "CELDU" (así se ha escrito en la hoja).
   OJO: antes solo se reconocía "CEL", y toda fila que empezara con "CELU" se tomaba como un vehículo NUEVO: se perdía el aceite y no se calculaba el próximo cambio (K). */
const RX_CEL = /^CEL(?:ULAR|UL|UI|DU|U|I)?(?![A-Z])/i;
const RX_CELNUM = /^CEL[A-Z]{0,5}\s*[:.\-]?\s*(3\d{9})/i;
function esCel_(a) { return RX_CEL.test(String(a == null ? '' : a).trim()); }
function tipoBase_(txt) {
  let t = String(txt == null ? '' : txt).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/(W\s*\d)O\b/g, '$10').replace(/\b(MX|DELO|RIMULA)\s*145W/g, '$1 15W');
  if (!t.trim()) return '';
  if (/VALVULINA|HIDRAUL|HYDRAUL|\bATF\b|REFRIGERANTE|LIQUIDO|ENGRASE|GRASA|TRANSMISION|DIFERENCIAL/.test(t) && !/ACEITE (DE )?MOTOR/.test(t)) return '';
  if (/SEMI[\s-]*(SINT|SYNT)|TECHNOSYNTH|SYNTH(ETIC)?[\s-]*BLEND|\bSEMI\b/.test(t)) return 'semi';
  if (/SINTETIC|SYNTHETIC|\bSYN\b|FULL[\s-]*(SINT|SYNT)|100\s*%\s*SINT/.test(t)) return 'sintetico';
  if (/MINERAL/.test(t)) return 'mineral';
  const v = /(?:^|[^0-9])(0|5|10|15|20|25)\s*W\s*[-\/ ]?\s*(\d{2,3})(?!\d)/.exec(t) || /(?:^|[^0-9])(0|5|10|15|20|25)\s*W(?![A-Z0-9])/.exec(t);
  if (v) { const w = +v[1]; return w <= 5 ? 'sintetico' : w <= 15 ? 'semi' : 'mineral'; }
  if (/\bSAE[\s-]*(30|40|50|60)\b|\b(30|40|50|60)\s*(SAE|MONOGRADO)\b|\b1350\b|\bHD[\s-]?(30|40|50|60)\b/.test(t)) return 'mineral';
  if (!/\b2T\b|\d\s*W\s*\d/.test(t) && /(?:^|\s)(40|50|60)(?:\s|$)/.test(t)) return 'mineral';
  return '';
}
function tipoAceite_(txt) {                               // 'mineral' | 'semi' | 'sintetico' | ''  (SELLADO y GRANEL no cambian el tipo)
  const s = String(txt == null ? '' : txt), t = tipoBase_(s.replace(/\bA\s+GRANEL\b|\bGRANEL\b|\bSELLADOS?\b/gi, ' '));
  if (t) return t;
  return /GRANEL/i.test(s) && !/VALVULINA|HIDRAUL|HYDRAUL|\bATF\b|REFRIGERANTE|LIQUIDO|ENGRASE|GRASA|TRANSMISION|DIFERENCIAL/i.test(s) ? 'mineral' : '';
}
function incKm_(txt) { return KM_PROX[tipoAceite_(txt)] || 0; }
function esKm_(s) { s = String(s == null ? '' : s).trim(); return /^\d[\d.,\s]*(km|kms|kilometros)?[\s.,\/-]*$/i.test(s) && !RX_FECHA_TXT.test(s) && parseInt(s.replace(/\D/g, ''), 10) >= 1000; }
function esFecha_(s) { s = String(s == null ? '' : s).trim(); return s !== '' && RX_FECHA_TXT.test(s) && !!parseFecha_(s); }
function pkFila_(kmVal, aceite, proxVal) {              // km del próximo cambio (número) o 0 si no se puede saber
  const pr = String(proxVal == null ? '' : proxVal).trim();
  if (/^\d[\d.,\s]*$/.test(pr) && !RX_FECHA_TXT.test(pr)) { const n = parseInt(pr.replace(/\D/g, ''), 10); if (n >= 1000) return n; }   // si el taller escribió los km a mano, se respeta
  const i = incKm_(aceite);
  return esKm_(kmVal) && i ? parseInt(String(kmVal).replace(/\D/g, ''), 10) + i : 0;
}
function fmtF_(d, sep) { return Utilities.formatDate(d, 'America/Bogota', sep === '-' ? 'dd-MM-yy' : 'dd/MM/yy'); }
function pfFila_(fecha, aceite) {                       // texto del próximo cambio por tiempo: "21/08/26 a 21/09/26" (o una sola fecha), '' si no se puede saber
  const f = parseFecha_(fecha), m = MESES_CAMBIO[tipoAceite_(aceite)];
  if (!f || !m) return '';
  const sep = /^\s*\d{1,2}-\d{1,2}-\d{2,4}\s*$/.test(String(fecha)) ? '-' : '/';   // escribe igual que tú: 25-10-26 o 25/10/26
  const a = sumarMeses_(f, m[0]), b = sumarMeses_(f, m[1]);
  return m[0] === m[1] ? fmtF_(a, sep) : fmtF_(a, sep) + ' a ' + fmtF_(b, sep);
}
function autoK_(j, aceite) {                             // lo que el sistema escribiría en K para ese J y ese aceite ('' si nada)
  if (esKm_(j)) { const p = pkFila_(j, aceite, ''); return p ? String(p) : ''; }
  if (esFecha_(j)) return pfFila_(j, aceite);
  return '';
}
function mismoK_(a, b) {                                 // compara dos textos de K ignorando el formato de fecha (21/11/26 = 21/11/2026)
  const n = t => { t = String(t == null ? '' : t).trim(); const m = t.match(/\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/g); return m ? m.map(fechaNum_).join('|') : t; };
  return n(a) === n(b);
}
function sumarMeses_(d, n) {                             // suma meses sin saltarse de mes (31 ene + 1 mes = 28/29 feb)
  const dia = d.getDate(), x = new Date(d.getFullYear(), d.getMonth() + n, 1), ult = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
  x.setDate(Math.min(dia, ult)); return x;
}
function actualizarProximoKm() { return pkEnHojas_(SpreadsheetApp.openById(SHEET_ID), false); }   // rellena los PRÓX. CAMBIO (K) vacíos de CONTROL 2026 (km o fecha) y la columna de REGISTRO WEB
function simularProximoKm() { return pkEnHojas_(SpreadsheetApp.openById(SHEET_ID), true); }       // solo cuenta y muestra ejemplos en el registro; no escribe nada
function aceiteBloque_(V, i) {                              // aceite del bloque del vehículo al que pertenece la fila i (hasta 60 filas arriba)
  for (let k = i; k >= 0 && k > i - 60; k--) {
    if (String(V[k][1]).trim()) return String(V[k][1]).trim();
    const a = String(V[k][0]).trim(); if (a && !esCel_(a)) return '';
  }
  return '';
}
function aceiteDeFila_(sh, fila) {                        // se conserva por compatibilidad
  const ini = Math.max(2, fila - 60), V = sh.getRange(ini, 1, fila - ini + 1, 2).getDisplayValues();
  return aceiteBloque_(V, V.length - 1);
}
function colMezcla_(sh, col, n, cambios) {               // columna completa conservando fórmulas y valores; solo cambia las celdas de 'cambios' {fila: valor}
  const rg = sh.getRange(2, col, n, 1), v = rg.getValues(), f = rg.getFormulas();
  for (let i = 0; i < n; i++) v[i][0] = cambios[i] !== undefined ? cambios[i] : (f[i][0] || v[i][0]);
  rg.setValues(v);
}
function pkEnHojas_(ss, simular) {
  const out = { control: 0, fechas: 0, totales: 0, registro: 0, jKm: 0, jFecha: 0, jOtro: 0, kConDato: 0, ejemplos: [], otros: [], ejTotales: [] };
  const sh = ss.getSheetByName(HOJA_CONTROL);
  if (sh && sh.getLastRow() >= 2) {
    const n = sh.getLastRow() - 1, V = sh.getRange(2, 1, n, COLUMNAS).getDisplayValues(); let aceite = ''; const K = {};
    for (let i = 0; i < n; i++) {
      const r = V[i], a = String(r[0]).trim(); if (a && !esCel_(a)) aceite = '';
      if (String(r[1]).trim()) aceite = String(r[1]).trim();
      const j = String(r[9]).trim(), k = String(r[10]).trim();
      if (j === '') continue;
      if (esKm_(j)) out.jKm++; else if (esFecha_(j)) out.jFecha++; else { out.jOtro++; if (out.otros.length < 8) out.otros.push((i + 2) + ': ' + j); }
      if (k !== '') { out.kConDato++; continue; }
      const nuevo = autoK_(j, aceite);
      if (nuevo) {
        K[i] = esKm_(j) ? Number(nuevo) : nuevo; if (esKm_(j)) out.control++; else out.fechas++;
        if (out.ejemplos.length < 10 && (out.control + out.fechas) % 150 === 1) out.ejemplos.push((i + 2) + ': ' + j + ' + ' + aceite + ' = ' + nuevo);
      }
    }
    if (!simular && (out.control + out.fechas)) colMezcla_(sh, 11, n, K);
    const t = totalesControl_(sh, simular); out.totales = t.cnt; out.ejTotales = t.ej;
  }
  const rg = ss.getSheetByName(HOJA_REGISTRO);
  if (rg && rg.getLastRow() >= 2) {
    const F = rg.getRange(2, 1, rg.getLastRow() - 1, ENC.length).getValues(), vals = F.map(v => {
      const cur = String(v[C.prox - 1] == null ? '' : v[C.prox - 1]).trim();
      return [cur !== '' ? v[C.prox - 1] : (pkFila_(v[C.km - 1], v[C.aceite - 1], '') || '')];   // no pisa lo que ya esté escrito
    });
    out.registro = vals.filter(v => v[0] !== '').length;
    if (!simular) rg.getRange(2, C.prox, vals.length, 1).setValues(vals);
  }
  console.log(JSON.stringify(out));
  return out;
}
/* Al escribir en CONTROL 2026 (columnas B..J) se rellenan SOLOS, al instante:
   - K  PRÓX. CAMBIO (km o fecha) cuando cambias el aceite (B) o el km/fecha (J).
   - I  TOTAL CAMBIOS: el número de cambio del vehículo (1, 2, 3...) cuando la fila tiene FECHA (G) o VALOR (H) y la I está vacía.
   Una sola lectura y pocas escrituras. Funciona también al pegar o arrastrar hasta 500 filas.
   NUNCA pisa lo que escribas a mano: K solo se corrige si lo puso el sistema o si es el valor "de la fila anterior" (km viejo + 5.000/6.000/7.000/10.000, o fecha vieja + 3 a 12 meses). */
function derivadoDe_(k, j) {                              // ¿K es el "próximo cambio" calculado a partir del J ANTERIOR? (así se corrige al cambiar J)
  k = String(k == null ? '' : k).trim(); j = String(j == null ? '' : j).trim();
  if (esKm_(k) && esKm_(j)) { const d = parseInt(k.replace(/\D/g, ''), 10) - parseInt(j.replace(/\D/g, ''), 10); return d === 5000 || d === 6000 || d === 7000 || d === 10000; }   // 6000 = regla anterior del semisintético: así se corrige solo al tocar J o B
  if (esFecha_(j) && RX_FECHA_TXT.test(k)) { const kd = parseFecha_(k.match(RX_FECHA_TXT)[0]), jd = parseFecha_(j); if (!kd || !jd) return false; const m = (kd - jd) / (30.44 * 864e5); return m >= 2.5 && m <= 12.5; }
  return false;
}
const RX_TOTAL = /^\d{1,3}$/;
function esFilaCambio_(r) { return String(r[6]).trim() !== '' || String(r[7]).trim() !== ''; }   // tiene FECHA (G) o VALOR (H)
function escribirCol_(sh, col, ini, len, cambios) {       // cambios {índice: valor}; pocas celdas -> una a una, muchas -> la columna entera (conserva fórmulas)
  const ks = Object.keys(cambios); if (!ks.length) return;
  if (ks.length <= 12) { ks.forEach(k => sh.getRange(ini + (+k), col).setValue(cambios[k])); return; }
  const rg = sh.getRange(ini, col, len, 1), v = rg.getValues(), f = rg.getFormulas();
  for (let i = 0; i < len; i++) v[i][0] = cambios[i] !== undefined ? cambios[i] : (f[i][0] || v[i][0]);
  rg.setValues(v);
}
function onEdit(e) {
  try {
    const rg = e && e.range, sh = rg && rg.getSheet(); if (!sh || sh.getName() !== HOJA_CONTROL) return;
    const c0 = rg.getColumn(), c1 = rg.getLastColumn(), r0 = rg.getRow(), nr = rg.getNumRows();
    if (r0 < 2 || nr > 500 || c1 < 2 || c0 > 10) return;                                           // solo columnas B..J
    const tocaB = c0 <= 2 && c1 >= 2, tocaJ = c0 <= 10 && c1 >= 10, calcK = (tocaB || tocaJ) && c1 < 11;
    const ini = Math.max(2, r0 - 80), fin = Math.min(sh.getLastRow(), r0 + nr - 1 + (tocaB ? 40 : 0));
    const V = sh.getRange(ini, 1, fin - ini + 1, COLUMNAS).getDisplayValues();                    // UNA sola lectura (A..K)
    const uno = nr === 1 && c0 === c1, old = uno && e.oldValue !== undefined ? String(e.oldValue) : null, f0 = r0 - ini;
    let aceite = '', ultI = 0; const KW = {}, IW = {};
    for (let i = 0; i < V.length; i++) {
      const r = V[i], a = String(r[0]).trim(), propio = String(r[1]).trim(), editada = i >= f0 && i < f0 + nr;
      if (a && !esCel_(a)) { aceite = ''; ultI = 0; if (i >= f0 + nr) break; }            // empezó otro vehículo: terminó el bloque
      if (propio) aceite = propio;
      const iv = String(r[8]).trim(); if (RX_TOTAL.test(iv)) ultI = +iv;
      if (editada && iv === '' && esFilaCambio_(r)) { ultI += 1; IW[i] = ultI; }                  // TOTAL CAMBIOS = el anterior + 1
      if (!calcK || i < f0 || (!editada && propio)) continue;                                       // K: filas siguientes solo si no tienen su propio aceite
      const aceiteAnt = editada && tocaB && old !== null ? (old.trim() || aceite) : aceite;
      const jAnt = editada && tocaJ && old !== null ? old : r[9], kAct = String(r[10]).trim(), sabeAnt = editada && old !== null;
      const nuevo = autoK_(r[9], aceite), auto = kAct === '' || (sabeAnt && (mismoK_(kAct, autoK_(jAnt, aceiteAnt)) || derivadoDe_(kAct, jAnt)));
      if (nuevo && auto && !mismoK_(nuevo, kAct)) KW[i] = esKm_(r[9]) ? Number(nuevo) : nuevo;
    }
    escribirCol_(sh, 9, ini, V.length, IW);
    escribirCol_(sh, 11, ini, V.length, KW);
  } catch (err) { console.error(err); }
}
function totalesControl_(sh, simular) {                  // rellena la I (TOTAL CAMBIOS) vacía de las filas con fecha o valor: 1, 2, 3... por vehículo. No toca las que ya tienen algo.
  const n = sh.getLastRow() - 1, V = sh.getRange(2, 1, n, COLUMNAS).getDisplayValues(), IW = {}, ej = []; let ultI = 0;
  for (let i = 0; i < n; i++) {
    const r = V[i], a = String(r[0]).trim(); if (a && !esCel_(a)) ultI = 0;
    const iv = String(r[8]).trim(); if (RX_TOTAL.test(iv)) ultI = +iv;
    if (iv === '' && esFilaCambio_(r)) { ultI += 1; IW[i] = ultI; if (ej.length < 8) ej.push((i + 2) + ' = ' + ultI); }
  }
  const cnt = Object.keys(IW).length;
  if (!simular && cnt) { const rg = sh.getRange(2, 9, n, 1), v = rg.getValues(), f = rg.getFormulas(); for (let i = 0; i < n; i++) v[i][0] = IW[i] !== undefined ? IW[i] : (f[i][0] || v[i][0]); rg.setValues(v); }
  return { cnt: cnt, ej: ej };
}
function onOpen() {
  try { SpreadsheetApp.getUi().createMenu('JRG').addItem('Calcular próximo cambio y total de cambios', 'actualizarProximoKm').addToUi(); } catch (err) { console.error(err); }
}

/* ---------- Limpieza de la columna M (se había usado para las fechas; ahora van en K) ---------- */
function mioM_(t) { return /^(entre )?\d{2}\/\d{2}\/\d{4}( y \d{2}\/\d{2}\/\d{4})?$/.test(String(t).trim()); }
function simularQuitarM() { return quitarM_(true); }
function quitarColumnaM() { return quitarM_(false); }
function quitarM_(simular) {
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(HOJA_CONTROL), n = sh.getLastRow() - 1;
  const V = sh.getRange(2, 13, n, 1).getDisplayValues(), cambios = {}, otros = []; let c = 0;
  for (let i = 0; i < n; i++) { const t = String(V[i][0]).trim(); if (!t) continue; if (mioM_(t)) { cambios[i] = ''; c++; } else otros.push((i + 2) + ': ' + t.slice(0, 40)); }
  const enc = String(sh.getRange(1, 13).getValue()).trim() === ENC_PROX_FECHA;
  if (!simular) { if (c) colMezcla_(sh, 13, n, cambios); if (enc) sh.getRange(1, 13).clearContent(); }
  const out = { quitar: c, encabezado: enc, otros: otros.slice(0, 10), m24633: n >= 24632 ? String(V[24631][0]) : '' };
  console.log(JSON.stringify(out)); return out;
}

/* ---------- Kilometraje del cliente ----------
   El cliente solo envia placa + km. Queda en la pestana "KM WEB" con ESTADO = PENDIENTE y NO cambia la tarjeta.
   El dueño lo revisa, lo pasa a CONTROL 2026 y cambia ESTADO a CONFIRMADO o RECHAZADO. */
const HOJA_KM = 'KM WEB';
function registrarKm_(d) {
  if (d.web) return { ok: true };                        // campo trampa de bots
  const placa = normPlaca_(d.placa), km = parseInt(String(d.km || '').replace(/\D/g, ''), 10);
  if (!RX_PLACA.test(placa)) return { ok: false, error: 'placa' };
  if (!km || km < 100 || km > 999999) return { ok: false, error: 'km' };
  if (limite_()) return { ok: false, error: 'ocupado' };
  const cache = CacheService.getScriptCache(), key = 'km_' + placa, n = +(cache.get(key) || 0);
  if (n >= 5) return { ok: false, error: 'ocupado' };    // maximo 5 envios por placa y por hora
  cache.put(key, String(n + 1), 3600);
  if (!bloquesDe_(placa).length && !filasReg_(hojaReg_(false)).some(v => normPlaca_(v[C.placa - 1]) === placa)) return { ok: false, error: 'no_registrada' };
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID); let sh = ss.getSheetByName(HOJA_KM);
    if (!sh) {
      sh = ss.insertSheet(HOJA_KM); sh.getRange(1, 1, 1, 4).setValues([['FECHA', 'PLACA', 'KM ACTUAL', 'ESTADO']]); sh.setFrozenRows(1);
      sh.getRange('D2:D2000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['PENDIENTE', 'CONFIRMADO', 'RECHAZADO'], true).build());
    }
    sh.appendRow([new Date(), placa, km, 'PENDIENTE']);
    return { ok: true };
  } finally { lock.releaseLock(); }
}
function kmPendiente_(placaRaw) {                        // ultimo km PENDIENTE de la placa (sin datos personales)
  const placa = normPlaca_(placaRaw);
  if (!RX_PLACA.test(placa)) return { ok: false, error: 'placa' };
  if (limite_()) return { ok: false, error: 'ocupado' };
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(HOJA_KM);
  if (!sh || sh.getLastRow() < 2) return { ok: true, km: null };
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues();
  for (let i = rows.length - 1; i >= 0; i--) {
    if (normPlaca_(rows[i][1]) === placa && String(rows[i][3]).toUpperCase() === 'PENDIENTE') {
      const f = rows[i][0] instanceof Date ? Utilities.formatDate(rows[i][0], 'America/Bogota', 'yyyy-MM-dd') : String(rows[i][0]);
      return { ok: true, km: Number(rows[i][2]) || null, f: f };
    }
  }
  return { ok: true, km: null };
}

/* ---------- Archivar los vehículos que no han vuelto ----------
   Un vehículo se ARCHIVA (pasa a la pestaña "ARCHIVO 2021-2023" y sale de CONTROL 2026) cuando su ÚLTIMO cambio es anterior al 1/ene/2024
   y su placa no aparece en REGISTRO WEB ni en KM WEB. Nada se pierde: queda copiado en la pestaña de archivo.
   Primero corre simularArchivo() (solo cuenta); luego archivarInactivos(). Requiere el servicio "Google Sheets API" (Servicios +). */
const HOJA_ARCHIVO = 'ARCHIVO 2021-2023';
const CORTE_ARCHIVO = 20240101;                           // aaaammdd: se archivan los que su último cambio es ANTERIOR a esta fecha
const ANCHO_ARCHIVO = 12;                                 // columnas A..L
function bloquesControl_(sh) {
  const n = sh.getLastRow() - 1, V = sh.getRange(2, 1, n, 7).getDisplayValues(), bl = []; let cur = null;
  for (let i = 0; i < n; i++) {
    const a = String(V[i][0]).trim();
    if (a && !esCel_(a)) { cur = { ini: i + 2, fin: i + 2, titulo: a, placa: extraerPlaca_(a), ult: 0 }; bl.push(cur); }
    if (!cur) continue;
    cur.fin = i + 2;
    const f = fechaNum_(V[i][6]); if (f > cur.ult) cur.ult = f;
  }
  return bl;
}
function placasActivas_(ss) {                             // placas que ya usaron la página (REGISTRO WEB y KM WEB)
  const s = {};
  [HOJA_REGISTRO, HOJA_KM].forEach(h => {
    const sh = ss.getSheetByName(h);
    if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues().forEach(r => r.forEach(x => { const p = normPlaca_(x); if (RX_PLACA.test(p)) s[p] = 1; }));
  });
  return s;
}
function planArchivo_(ss) {
  const sh = ss.getSheetByName(HOJA_CONTROL), bl = bloquesControl_(sh), act = placasActivas_(ss), maxP = {};
  bl.forEach(b => { if (b.placa) maxP[b.placa] = Math.max(maxP[b.placa] || 0, b.ult); });
  const arch = bl.filter(b => { const u = b.placa ? maxP[b.placa] : b.ult; return b.ult && u >= 20190101 && u < CORTE_ARCHIVO && !(b.placa && act[b.placa]); });   // fechas anteriores a 2019 se tratan como error de digitación y no se archivan
  const runs = []; arch.forEach(b => { const u = runs[runs.length - 1]; if (u && u.fin + 1 === b.ini) u.fin = b.fin; else runs.push({ ini: b.ini, fin: b.fin }); });
  return { sh: sh, bl: bl, arch: arch, runs: runs };
}
function simularArchivo() {
  const ss = SpreadsheetApp.openById(SHEET_ID), p = planArchivo_(ss), porAnio = {}; let filas = 0;
  p.arch.forEach(b => { const y = Math.floor(b.ult / 10000); porAnio[y] = (porAnio[y] || 0) + 1; filas += b.fin - b.ini + 1; });
  const fuera = datosFuera_(p.sh), enArch = fuera.filter(c => p.runs.some(r => c.fila >= r.ini && c.fila <= r.fin));
  const out = { bloques: p.bl.length, archivar: p.arch.length, filas: filas, filasTotales: p.sh.getLastRow() - 1, porAnio: porAnio, tramos: p.runs.length,
    sinFechaOFechaRara: p.bl.filter(b => !b.ult || b.ult < 20190101).length, datosEnMasAllaDeL: fuera.length, enFilasAArchivar: enArch.length, ancho: anchoDatos_(fuera),
    cols: Object.keys(fuera.reduce((o, c) => { o[c.col] = 1; return o; }, {})).slice(0, 12), ejemplos: p.arch.filter((b, i) => i % Math.max(1, Math.floor(p.arch.length / 6)) === 0).slice(0, 6).map(b => b.ini + '-' + b.fin + ' ' + b.titulo.slice(0, 30) + ' ult ' + b.ult) };
  console.log(JSON.stringify(out)); return out;
}
function datosFuera_(sh) {                                // celdas con datos en la columna M o más allá: [{fila, col}]
  const lc = sh.getLastColumn(); if (lc < 13) return [];
  return sh.getRange(1, 13, sh.getLastRow(), lc - 12).createTextFinder('.').useRegularExpression(true).findAll().map(r => ({ fila: r.getRow(), col: r.getColumn() }));
}
function anchoDatos_(fuera) { return Math.max(ANCHO_ARCHIVO, fuera.reduce((m, c) => Math.max(m, c.col), 0)); }
function archivarInactivos() {
  const ss = SpreadsheetApp.openById(SHEET_ID), p = planArchivo_(ss);
  if (!p.arch.length) { console.log('Nada que archivar'); return; }
  if (typeof Sheets === 'undefined') { console.log('FALTA activar el servicio Google Sheets API en Servicios (+)'); return; }
  const W = anchoDatos_(datosFuera_(p.sh)), n = p.sh.getLastRow() - 1, V = p.sh.getRange(2, 1, n, W).getValues();
  const filas = []; p.arch.forEach(b => { for (let r = b.ini; r <= b.fin; r++) filas.push(V[r - 2]); });
  let ar = ss.getSheetByName(HOJA_ARCHIVO);
  if (!ar) { ar = ss.insertSheet(HOJA_ARCHIVO); ar.getRange(1, 1, 1, W).setValues(p.sh.getRange(1, 1, 1, W).getValues()).setFontWeight('bold'); ar.setFrozenRows(1); }
  const ini = Math.max(2, ar.getLastRow() + 1);
  for (let k = 0; k < filas.length; k += 4000) ar.getRange(ini + k, 1, Math.min(4000, filas.length - k), W).setValues(filas.slice(k, k + 4000));
  ar.getRange(ini, 7, filas.length, 1).setNumberFormat('dd/MM/yyyy'); ar.getRange(ini, 8, filas.length, 1).setNumberFormat('$#,##0');
  SpreadsheetApp.flush();
  if (ar.getLastRow() < ini + filas.length - 1) { console.log('El archivo no quedó completo; NO se borró nada'); return; }
  const id = p.sh.getSheetId(), reqs = p.runs.slice().reverse().map(r => ({ deleteDimension: { range: { sheetId: id, dimension: 'ROWS', startIndex: r.ini - 1, endIndex: r.fin } } }));
  for (let k = 0; k < reqs.length; k += 300) Sheets.Spreadsheets.batchUpdate({ requests: reqs.slice(k, k + 300) }, ss.getId());
  console.log(JSON.stringify({ vehiculos: p.arch.length, filasArchivadas: filas.length, controlAntes: n, controlAhora: p.sh.getLastRow() - 1, archivoFilas: ar.getLastRow() - 1 }));
}
function muestraFechas() {                                // solo para revisar: filas donde J (KM ACTUAL) es una fecha
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(HOJA_CONTROL), n = sh.getLastRow() - 1, V = sh.getRange(2, 1, n, COLUMNAS).getDisplayValues(), out = [];
  for (let i = 0; i < n && out.length < 30; i++) { const j = String(V[i][9]).trim(); if (j && !esKm_(j) && out.length < 30 && (esFecha_(j) || /^\d+[-\/]/.test(j))) out.push((i + 2) + ' | ' + V[i][1].slice(0, 22) + ' | J ' + j + ' | K ' + V[i][10] + ' | G ' + V[i][6]); }
  console.log(out.join('\n'));
}

/* ---------- Citas (calendario de la página) ----------
   Pestaña CITAS: una fila por cita. Los clientes quedan PENDIENTE hasta que el taller las confirme (cambia ESTADO a CONFIRMADA o CANCELADA).
   La página solo recibe fecha, hora y duración de las citas ocupadas (nunca nombres ni celulares).  */
const HOJA_CITAS = 'CITAS';
const ENC_CITAS = ['FECHA REGISTRO', 'FECHA', 'HORA', 'DURACIÓN (min)', 'FIN', 'NOMBRE', 'CELULAR', 'PLACA', 'SERVICIO', 'DETALLE', 'ESTADO'];
const CUPOS_CITA = 2;                                    // vehículos que se atienden a la vez (igual que CUPOS en js/agenda.js)
const DIAS_MAX_CITA = 60;                                // hasta cuántos días adelante se acepta una cita
const ANTELACION_MIN = 30;                               // minutos mínimos de anticipación (la página pide 60; aquí se deja holgura)
const MAX_CITAS_POR_CEL = 3;                             // citas pendientes a futuro por celular
const HORARIO_SEMANA = [8 * 60, 18 * 60], HORARIO_FESTIVO = [9 * 60, 12 * 60 + 30];
function hojaCitas_(crear) {
  const ss = SpreadsheetApp.openById(SHEET_ID); let sh = ss.getSheetByName(HOJA_CITAS);
  if (!sh && crear) {
    sh = ss.insertSheet(HOJA_CITAS); sh.getRange(1, 1, 1, ENC_CITAS.length).setValues([ENC_CITAS]).setFontWeight('bold'); sh.setFrozenRows(1);
    sh.getRange(2, 2, 2000, 3).setNumberFormat('@'); sh.getRange(2, 5, 2000, 1).setNumberFormat('@'); sh.getRange(2, 7, 2000, 1).setNumberFormat('@');   // fecha, hora, duración, fin y celular como texto
  }
  return sh;
}
function festivosCO_(y) {                                // mismos festivos que js/horario.js (ley Emiliani + Semana Santa)
  const P = pascuaUTC_(y), K = d => Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd'), U = (m, d) => new Date(Date.UTC(y, m - 1, d)), S = (d, n) => new Date(d.getTime() + n * 864e5);
  const lun = d => { const w = d.getUTCDay(); return w === 1 ? d : S(d, (8 - w) % 7); }, s = {};
  [[1, 1], [5, 1], [7, 20], [8, 7], [12, 8], [12, 25]].forEach(x => s[K(U(x[0], x[1]))] = 1);
  [[1, 6], [3, 19], [6, 29], [8, 15], [10, 12], [11, 1], [11, 11]].forEach(x => s[K(lun(U(x[0], x[1])))] = 1);
  s[K(S(P, -3))] = 1; s[K(S(P, -2))] = 1; [43, 64, 71].forEach(n => s[K(S(P, n))] = 1);
  return s;
}
function pascuaUTC_(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(y, mes - 1, dia));
}
function horarioDia_(iso) {                              // [apertura, cierre] en minutos del día de esa fecha
  const p = iso.split('-').map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  return d.getUTCDay() === 0 || festivosCO_(p[0])[iso] ? HORARIO_FESTIVO : HORARIO_SEMANA;
}
function minDe_(hhmm) { const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim()); return m && +m[1] < 24 && +m[2] < 60 ? +m[1] * 60 + +m[2] : null; }
function hmDe_(min) { return ('0' + Math.floor(min / 60)).slice(-2) + ':' + ('0' + min % 60).slice(-2); }
function citasOcupadas_(desde, hasta) {                  // [{f, h, d}] sin datos personales
  const sh = hojaCitas_(false); if (!sh || sh.getLastRow() < 2) return [];
  const V = sh.getRange(2, 1, sh.getLastRow() - 1, ENC_CITAS.length).getDisplayValues(), out = [];
  V.forEach(r => { const f = String(r[1]).trim(), est = String(r[10]).trim().toUpperCase(); if (est === 'CANCELADA' || f < desde || f > hasta || minDe_(r[2]) == null) return; out.push({ f: f, h: String(r[2]).trim(), d: +r[3] || 30 }); });
  return out;
}
function citas_(desde, hasta) {
  if (limite_()) return { ok: false, error: 'ocupado' };
  const rx = /^\d{4}-\d{2}-\d{2}$/; if (!rx.test(desde) || !rx.test(hasta) || hasta < desde) return { ok: false, error: 'fecha' };
  return { ok: true, citas: citasOcupadas_(desde, hasta) };
}
function agendar_(d) {
  if (d.web) return { ok: true };                        // campo trampa
  if (limite_()) return { ok: false, error: 'ocupado' };
  const fecha = String(d.fecha || '').trim(), ini = minDe_(d.hora), dur = Math.round(+d.dur || 0), cel = String(d.celular || '').replace(/\D/g, ''), nombre = String(d.nombre || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || ini == null) return { ok: false, error: 'fecha' };
  if (!(dur >= 10 && dur <= 120) || ini % 5) return { ok: false, error: 'duracion' };
  if (nombre.length < 3) return { ok: false, error: 'nombre' };
  if (!/^3\d{9}$/.test(cel)) return { ok: false, error: 'celular' };
  const ahora = new Date(), hoy = Utilities.formatDate(ahora, 'America/Bogota', 'yyyy-MM-dd'), minAhora = +Utilities.formatDate(ahora, 'America/Bogota', 'H') * 60 + +Utilities.formatDate(ahora, 'America/Bogota', 'm');
  const limite = Utilities.formatDate(new Date(ahora.getTime() + DIAS_MAX_CITA * 864e5), 'America/Bogota', 'yyyy-MM-dd');
  if (fecha < hoy || fecha > limite || (fecha === hoy && ini < minAhora + ANTELACION_MIN)) return { ok: false, error: 'fecha' };
  const hr = horarioDia_(fecha); if (ini < hr[0] || ini + dur > hr[1]) return { ok: false, error: 'fuera_horario' };
  const placa = normPlaca_(d.placa), lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (e) { return { ok: false, error: 'ocupado' }; }
  try {
    const sh = hojaCitas_(true), n = sh.getLastRow() - 1, V = n > 0 ? sh.getRange(2, 1, n, ENC_CITAS.length).getDisplayValues() : [];
    let solapan = 0, delCel = 0, repetida = false;
    V.forEach(r => {
      if (String(r[10]).trim().toUpperCase() === 'CANCELADA') return;
      const f = String(r[1]).trim(), a = minDe_(r[2]), du = +r[3] || 30, mismoCel = String(r[6]).replace(/\D/g, '') === cel;
      if (f >= hoy && mismoCel) delCel++;
      if (f !== fecha || a == null) return;
      if (ini < a + du && ini + dur > a) { solapan++; if (mismoCel && a === ini) repetida = true; }
    });
    if (repetida) return { ok: true, repetida: true };   // el mismo cliente tocó dos veces: no se duplica
    if (delCel >= MAX_CITAS_POR_CEL) return { ok: false, error: 'demasiadas' };
    if (solapan >= CUPOS_CITA) return { ok: false, error: 'horario_ocupado' };
    sh.appendRow([Utilities.formatDate(ahora, 'America/Bogota', 'yyyy-MM-dd HH:mm'), fecha, hmDe_(ini), String(dur), hmDe_(ini + dur), safe_(nombre, 60), cel, RX_PLACA.test(placa) ? placa : '', safe_(d.servicio, 80), safe_(d.detalle, 300), 'PENDIENTE']);
    const fila = sh.getLastRow(); sh.getRange(fila, 2, 1, 4).setNumberFormat('@'); sh.getRange(fila, 7).setNumberFormat('@');
  } finally { lock.releaseLock(); }
  try { MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Nueva cita en la página: ' + fecha + ' ' + hmDe_(ini), 'Cliente: ' + nombre + '\nCelular: ' + cel + (placa ? '\nPlaca: ' + placa : '') + '\nServicio: ' + String(d.servicio || '') + '\nDía y hora: ' + fecha + ' ' + hmDe_(ini) + ' a ' + hmDe_(ini + dur) + '\n\nConfírmala en la pestaña CITAS (columna ESTADO).'); } catch (e) { console.error(e); }
  return { ok: true };
}
function probarCitas() {                                 // ejecútala a mano: crea la pestaña CITAS y prueba una cita falsa (se borra sola)
  const sh = hojaCitas_(true), mañana = Utilities.formatDate(new Date(Date.now() + 2 * 864e5), 'America/Bogota', 'yyyy-MM-dd');
  console.log('horario ' + mañana + ': ' + JSON.stringify(horarioDia_(mañana)));
  const r = agendar_({ fecha: mañana, hora: '10:00', dur: 30, nombre: 'PRUEBA JRG', celular: '3000000000', servicio: 'prueba', detalle: 'prueba', web: '' });
  console.log('agendar: ' + JSON.stringify(r) + ' | ocupadas: ' + JSON.stringify(citasOcupadas_(mañana, mañana)));
  for (let i = sh.getLastRow(); i >= 2; i--) if (String(sh.getRange(i, 6).getValue()) === 'PRUEBA JRG') sh.deleteRow(i);
  console.log('prueba borrada; filas: ' + sh.getLastRow());
}

/* ---------- CORRECCIÓN de K ya escritos (una sola vez, o cuando cambies las reglas) ----------
   1) Semisintético con K = J + 6.000 (regla anterior)  ->  J + 7.000   (todas las filas de CONTROL 2026 y de REGISTRO WEB).
   2) Filas RECIENTES (FECHA desde 01/07/2026) con K claramente mal digitado (K menor o igual al km, a más de 15.000 km, o no en miles redondos ni en un K redondo)  ->  se pone el valor de la regla.
   Los K en miles redondos distintos de la regla (+5.000, +8.000...) y los K por fecha se RESPETAN: son decisión del taller.
   Antes de escribir guarda el valor anterior en la pestaña "RESPALDO K" (fila, J, aceite, K anterior, K nuevo, motivo).
   simularCorreccionK() solo cuenta y muestra ejemplos; corregirProximoK() escribe. */
const K_RECIENTE_DESDE = 20260701;
function numK_(s) { return parseInt(String(s == null ? '' : s).replace(/\D/g, ''), 10); }
function primeraFechaK_(t) { const m = String(t == null ? '' : t).match(/\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/); return m ? fechaNum_(m[0]) : 0; }
function simularCorreccionK() { return corregirK_(true); }
function corregirProximoK() { return corregirK_(false); }
function corregirK_(simular) {
  const ss = SpreadsheetApp.openById(SHEET_ID), sh = ss.getSheetByName(HOJA_CONTROL), n = sh.getLastRow() - 1;
  const V = sh.getRange(2, 1, n, COLUMNAS).getDisplayValues(); let aceite = ''; const K = {}, resp = [], out = { semi7000: 0, recientes: 0, registro: 0, dejados: 0, ejemplos: [] };
  for (let i = 0; i < n; i++) {
    const r = V[i], a = String(r[0]).trim(); if (a && !esCel_(a)) aceite = '';
    if (String(r[1]).trim()) aceite = String(r[1]).trim();
    const j = String(r[9]).trim(), k = String(r[10]).trim(); if (!j || !k) continue;
    const esp = autoK_(j, aceite); if (!esp || mismoK_(esp, k)) continue;
    let motivo = '';
    if (esKm_(j) && esKm_(k) && tipoAceite_(aceite) === 'semi' && numK_(k) - numK_(j) === 6000) { motivo = 'semi +6.000 -> +7.000'; out.semi7000++; }
    else if (fechaNum_(r[6]) >= K_RECIENTE_DESDE) {
      if (esKm_(j) && esKm_(k)) {                          // solo se corrigen los K que son claramente un error de digitación: menores o iguales al km, de más de 15.000 km, o que no son miles redondos ni caen en un K redondo (4.998, 9.105...)
        const d = numK_(k) - numK_(j);
        if (d <= 0 || d > 15000 || (d % 1000 !== 0 && numK_(k) % 1000 !== 0)) { motivo = 'K con error de digitación'; out.recientes++; } else out.dejados++;   // +5.000, +8.000, etc. redondos se respetan: es la costumbre del taller para ese vehículo
      } else out.dejados++;                                  // K por fecha distinta a la regla (3 a 12 meses): se respeta
    }
    if (!motivo) continue;
    K[i] = esKm_(j) ? Number(esp) : esp; resp.push([i + 2, j, aceite, k, esp, motivo]);
    if (out.ejemplos.length < 14 && resp.length % 12 === 1) out.ejemplos.push((i + 2) + ': J=' + j + ' | ' + aceite + ' | K ' + k + ' -> ' + esp + ' | ' + motivo);
  }
  const rg = ss.getSheetByName(HOJA_REGISTRO); let vr = null;
  if (rg && rg.getLastRow() >= 2) {
    const F = rg.getRange(2, 1, rg.getLastRow() - 1, ENC.length).getValues(); let cambios = 0;
    vr = F.map((v, x) => { const cur = v[C.prox - 1], km = v[C.km - 1];
      if (esKm_(km) && esKm_(cur) && tipoAceite_(v[C.aceite - 1]) === 'semi' && numK_(cur) - numK_(km) === 6000) { cambios++; resp.push(['REGISTRO ' + (x + 2), km, v[C.aceite - 1], cur, numK_(km) + 7000, 'semi +6.000 -> +7.000']); return [numK_(km) + 7000]; }
      return [cur]; });
    out.registro = cambios; if (!cambios) vr = null;
  }
  if (!simular && resp.length) {
    let hr = ss.getSheetByName('RESPALDO K'); if (!hr) hr = ss.insertSheet('RESPALDO K');
    const base = hr.getLastRow();
    if (!base) { hr.getRange(1, 1, 1, 7).setValues([['FECHA', 'FILA', 'KM ACTUAL (J)', 'ACEITE', 'K ANTERIOR', 'K NUEVO', 'MOTIVO']]); hr.setFrozenRows(1); }
    const hoy = Utilities.formatDate(new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm');
    hr.getRange((base || 1) + 1, 1, resp.length, 7).setValues(resp.map(x => [hoy, String(x[0]), String(x[1]), x[2], String(x[3]), String(x[4]), x[5]]));
    if (Object.keys(K).length) colMezcla_(sh, 11, n, K);
    if (vr) rg.getRange(2, C.prox, vr.length, 1).setValues(vr);
  }
  out.total = resp.length; console.log(JSON.stringify(out)); return out;
}
