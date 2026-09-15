import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, FileText, Database, Plus, Trash2, Edit3, Check, X, Download, Volume2, ChevronRight, ChevronUp, ChevronDown, Home, ArrowLeft, Search, Save, RefreshCw, Eye, Printer, Users, UserPlus, Phone, Camera, Image, Send, Mail, MessageCircle, GripVertical, Settings, Upload, Building2, LogOut, User, TrendingUp, Copy, Gift, Share2, CreditCard, AlertTriangle, Crown, Link2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "./supabaseClient";

// ========== DATABASE PREZZI DEFAULT ==========
const DEFAULT_PRICES = [
  // Demolizioni
  { id: 1, categoria: "Demolizioni", voce: "Demolizione pavimento", unita: "mq", costoInterno: 11, prezzo: 18, note: "Incluso smaltimento", iva: 22 },
  { id: 2, categoria: "Demolizioni", voce: "Demolizione rivestimento bagno", unita: "mq", costoInterno: 9, prezzo: 15, note: "Pareti e pavimento", iva: 22 },
  { id: 3, categoria: "Demolizioni", voce: "Demolizione tramezza",unita: "mq", costoInterno: 13, prezzo: 22, note: "Spessore fino a 12cm", iva: 22 },
  { id: 4, categoria: "Demolizioni", voce: "Rimozione vasca da bagno", unita: "cad", costoInterno: 90, prezzo: 150, note: "Incluso trasporto", iva: 22 },
  { id: 5, categoria: "Demolizioni", voce: "Rimozione sanitari", unita: "cad", costoInterno: 27, prezzo: 45, note: "Per singolo pezzo", iva: 22 },
  // Muratura
  { id: 6, categoria: "Muratura", voce: "Costruzione tramezza in cartongesso", unita: "mq", costoInterno: 27, prezzo: 45, note: "Singola lastra", iva: 22 },
  { id: 7, categoria: "Muratura", voce: "Costruzione tramezza in laterizio", unita: "mq", costoInterno: 33, prezzo: 55, note: "Forato 8cm", iva: 22 },
  { id: 8, categoria: "Muratura", voce: "Intonaco civile", unita: "mq", costoInterno: 11, prezzo: 18, note: "Spessore medio 1.5cm", iva: 22 },
  { id: 9, categoria: "Muratura", voce: "Rasatura pareti", unita: "mq", costoInterno: 7, prezzo: 12, note: "Preparazione per pittura", iva: 22 },
  { id: 10, categoria: "Muratura", voce: "Controsoffitto in cartongesso", unita: "mq", costoInterno: 23, prezzo: 38, note: "Struttura e lastra", iva: 22 },
  // Pavimenti e Rivestimenti
  { id: 11, categoria: "Pavimenti", voce: "Posa pavimento gres", unita: "mq", costoInterno: 19, prezzo: 32, note: "Formato fino a 60x60", iva: 22 },
  { id: 12, categoria: "Pavimenti", voce: "Posa pavimento gres grande formato", unita: "mq", costoInterno: 25, prezzo: 42, note: "Formato oltre 60x60", iva: 22 },
  { id: 13, categoria: "Pavimenti", voce: "Posa rivestimento bagno", unita: "mq", costoInterno: 21, prezzo: 35, note: "Pareti", iva: 22 },
  { id: 14, categoria: "Pavimenti", voce: "Massetto tradizionale", unita: "mq", costoInterno: 13, prezzo: 22, note: "Spessore 5cm", iva: 22 },
  { id: 15, categoria: "Pavimenti", voce: "Battiscopa in gres", unita: "ml", costoInterno: 5, prezzo: 8, note: "Posa e fornitura", iva: 22 },
  // Impianto Idraulico
  { id: 16, categoria: "Idraulica", voce: "Punto acqua", unita: "cad", costoInterno: 72, prezzo: 120, note: "Caldo e freddo", iva: 22 },
  { id: 17, categoria: "Idraulica", voce: "Punto scarico", unita: "cad", costoInterno: 57, prezzo: 95, note: "Incluso collegamento", iva: 22 },
  { id: 18, categoria: "Idraulica", voce: "Installazione piatto doccia", unita: "cad", costoInterno: 168, prezzo: 280, note: "Escluso piatto", iva: 22 },
  { id: 19, categoria: "Idraulica", voce: "Installazione WC", unita: "cad", costoInterno: 108, prezzo: 180, note: "Escluso sanitario", iva: 22 },
  { id: 20, categoria: "Idraulica", voce: "Installazione lavabo", unita: "cad", costoInterno: 90, prezzo: 150, note: "Escluso lavabo", iva: 22 },
  { id: 21, categoria: "Idraulica", voce: "Installazione caldaia", unita: "cad", costoInterno: 270, prezzo: 450, note: "A condensazione", iva: 22 },
  // Impianto Elettrico
  { id: 22, categoria: "Elettricità", voce: "Punto luce", unita: "cad", costoInterno: 39, prezzo: 65, note: "Incluso cablaggio", iva: 22 },
  { id: 23, categoria: "Elettricità", voce: "Punto presa", unita: "cad", costoInterno: 33, prezzo: 55, note: "Schuko o bipasso", iva: 22 },
  { id: 24, categoria: "Elettricità", voce: "Quadro elettrico", unita: "cad", costoInterno: 228, prezzo: 380, note: "Fino a 12 moduli", iva: 22 },
  { id: 25, categoria: "Elettricità", voce: "Impianto elettrico completo", unita: "mq", costoInterno: 27, prezzo: 45, note: "A norma CEI", iva: 22 },
  // Pittura
  { id: 26, categoria: "Pittura", voce: "Tinteggiatura pareti", unita: "mq", costoInterno: 5, prezzo: 8, note: "Due mani", iva: 22 },
  { id: 27, categoria: "Pittura", voce: "Tinteggiatura soffitto", unita: "mq", costoInterno: 6, prezzo: 10, note: "Due mani", iva: 22 },
  { id: 28, categoria: "Pittura", voce: "Stucco veneziano", unita: "mq", costoInterno: 27, prezzo: 45, note: "Finitura decorativa", iva: 22 },
  // Infissi
  { id: 29, categoria: "Infissi", voce: "Porta interna tamburata", unita: "cad", costoInterno: 210, prezzo: 350, note: "Incluso controtelaio", iva: 22 },
  { id: 30, categoria: "Infissi", voce: "Finestra PVC doppio vetro", unita: "mq", costoInterno: 168, prezzo: 280, note: "Classe A", iva: 22 },
  { id: 31, categoria: "Infissi", voce: "Portoncino blindato", unita: "cad", costoInterno: 720, prezzo: 1200, note: "Classe 3", iva: 22 },
  // Varie
  { id: 32, categoria: "Varie", voce: "Trasporto e smaltimento macerie", unita: "cad", costoInterno: 150, prezzo: 250, note: "A corpo - prezzo modificabile", iva: 22 },
  { id: 33, categoria: "Varie", voce: "Ponteggio esterno", unita: "mq", costoInterno: 11, prezzo: 18, note: "A mese, incluso montaggio", iva: 22 },
  { id: 34, categoria: "Varie", voce: "Pulizia fine cantiere", unita: "cad", costoInterno: 180, prezzo: 300, note: "A corpo - prezzo modificabile", iva: 22 },
];

// ========== COSTI FISSI DEFAULT ==========
const DEFAULT_COSTI_FISSI = [
  // Sede
  { id: 1, categoria: "Sede", voce: "Affitto ufficio/magazzino", importo: 1200, frequenza: "mensile", note: "" },
  { id: 2, categoria: "Sede", voce: "Utenze (luce, gas, acqua)", importo: 350, frequenza: "mensile", note: "" },
  { id: 3, categoria: "Sede", voce: "Internet e telefono", importo: 80, frequenza: "mensile", note: "" },
  // Consulenti
  { id: 4, categoria: "Consulenti", voce: "Commercialista", importo: 3600, frequenza: "annuale", note: "" },
  { id: 5, categoria: "Consulenti", voce: "Consulente del lavoro", importo: 1800, frequenza: "annuale", note: "" },
  { id: 6, categoria: "Consulenti", voce: "Avvocato", importo: 1200, frequenza: "annuale", note: "" },
  // Mezzi e attrezzature
  { id: 7, categoria: "Mezzi", voce: "Leasing furgone", importo: 450, frequenza: "mensile", note: "" },
  { id: 8, categoria: "Mezzi", voce: "Assicurazione mezzi", importo: 2400, frequenza: "annuale", note: "" },
  { id: 9, categoria: "Mezzi", voce: "Carburante", importo: 600, frequenza: "mensile", note: "" },
  { id: 10, categoria: "Mezzi", voce: "Manutenzione mezzi", importo: 1200, frequenza: "annuale", note: "" },
  // Marketing
  { id: 11, categoria: "Marketing", voce: "Pubblicita online (ADS)", importo: 500, frequenza: "mensile", note: "" },
  { id: 12, categoria: "Marketing", voce: "Sito web e hosting", importo: 600, frequenza: "annuale", note: "" },
  // Assicurazioni
  { id: 13, categoria: "Assicurazioni", voce: "RC professionale", importo: 1800, frequenza: "annuale", note: "" },
  { id: 14, categoria: "Assicurazioni", voce: "Assicurazione cantiere", importo: 2400, frequenza: "annuale", note: "" },
  // Personale
  { id: 15, categoria: "Personale", voce: "Stipendio operaio 1", importo: 1800, frequenza: "mensile", note: "" },
  { id: 16, categoria: "Personale", voce: "Stipendio operaio 2", importo: 1800, frequenza: "mensile", note: "" },
  { id: 17, categoria: "Personale", voce: "Contributi e TFR", importo: 1200, frequenza: "mensile", note: "" },
];

// ========== AI SIMULATION ==========
async function parseVoiceToQuote(transcript, priceDB, pastQuotes) {
  if (!transcript || !transcript.trim() || !priceDB || !priceDB.length) return null;
  
  try {
    const response = await fetch('/api/parseQuote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: transcript.trim(), priceDB, pastQuotes: pastQuotes || [] })
    });
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items;
    }
    return null;
  } catch (error) {
    console.error('Errore selezione materiali AI:', error);
    return null;
  }
}

// ========== COMPUTO METRICO ==========
const COMPUTO_MAX_PAGES = 30;
const COMPUTO_MAX_SIDE = 2000;
const COMPUTO_BATCH_PAGES = 3;
const COMPUTO_BATCH_CHARS = 3200000;
const COMPUTO_PARALLEL = 3;

function drawToJpeg(width, height, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return Promise.resolve(draw(ctx, canvas)).then(() => canvas.toDataURL("image/jpeg", 0.8));
}

async function imageFileToDataUrl(file, maxSide = COMPUTO_MAX_SIDE) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Immagine non leggibile: " + file.name));
      el.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    return await drawToJpeg(w, h, (ctx, canvas) => ctx.drawImage(img, 0, 0, canvas.width, canvas.height));
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function pdfFileToDataUrls(file, maxPages) {
  const pdfjs = await import("pdfjs-dist");
  const { default: workerUrl } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  let pdf;
  try {
    pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  } catch (err) {
    if (err?.name === "PasswordException") throw new Error("Il PDF è protetto da password: rimuovi la protezione e ricaricalo.");
    throw new Error("PDF non leggibile o danneggiato: " + file.name);
  }

  try {
    if (pdf.numPages > maxPages) throw new Error(`Il computo supera il limite di ${COMPUTO_MAX_PAGES} pagine.`);
    const pages = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: COMPUTO_MAX_SIDE / Math.max(base.width, base.height) });
      pages.push(await drawToJpeg(viewport.width, viewport.height, (ctx) => page.render({ canvasContext: ctx, viewport }).promise));
      page.cleanup();
    }
    return pages;
  } finally {
    pdf.destroy();
  }
}

async function postComputoApi(url, body, headers) {
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 413) throw new Error("Pagine troppo pesanti da inviare: prova con foto meno grandi.");
    throw new Error(data.error || "Errore del server (" + res.status + ")");
  }
  return data;
}

async function extractComputoBatch(pages, headers) {
  try {
    return await postComputoApi("/api/extractComputo", { images: pages }, headers);
  } catch (err) {
    if (pages.length === 1) throw err;
    const parts = [];
    for (const page of pages) parts.push(await postComputoApi("/api/extractComputo", { images: [page] }, headers));
    return { oggetto: parts.find(p => p.oggetto)?.oggetto || "", voci: parts.flatMap(p => p.voci || []) };
  }
}

async function mapWithLimit(list, limit, fn) {
  const out = new Array(list.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, list.length) }, async () => {
    while (next < list.length) {
      const i = next++;
      out[i] = await fn(list[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

async function computoToQuote(files, priceDB) {
  const listino = (priceDB || []).filter(p => p && p.voce);
  if (!listino.length) throw new Error("Il tuo database prezzi è vuoto: aggiungi le voci in Prezzi prima di caricare un computo.");

  const pages = [];
  for (const file of files) {
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (isPdf) pages.push(...await pdfFileToDataUrls(file, COMPUTO_MAX_PAGES - pages.length));
    else pages.push(await imageFileToDataUrl(file));
    if (pages.length > COMPUTO_MAX_PAGES) throw new Error(`Il computo supera il limite di ${COMPUTO_MAX_PAGES} pagine.`);
  }

  const batches = [];
  let current = [];
  let chars = 0;
  for (const page of pages) {
    if (current.length && (current.length >= COMPUTO_BATCH_PAGES || chars + page.length > COMPUTO_BATCH_CHARS)) {
      batches.push(current);
      current = [];
      chars = 0;
    }
    current.push(page);
    chars += page.length;
  }
  if (current.length) batches.push(current);

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("Sessione scaduta: esci e rientra nell'app.");
  const headers = { "Content-Type": "application/json", Authorization: "Bearer " + token };

  const extracted = await mapWithLimit(batches, COMPUTO_PARALLEL, (batch) => extractComputoBatch(batch, headers));
  const voci = extracted.flatMap(e => e.voci || []);
  if (!voci.length) throw new Error("Non ho trovato voci di lavorazione nel computo: controlla che il file sia leggibile.");

  const { items } = await postComputoApi("/api/matchComputo", {
    voci,
    priceDB: listino.map(p => ({ voce: p.voce, unita: p.unita, categoria: p.categoria, note: p.note, prezzo: p.prezzo, costoInterno: p.costoInterno, iva: p.iva }))
  }, headers);

  return { items: items || [], oggetto: extracted.find(e => e.oggetto)?.oggetto || "" };
}

// ========== FOTO SOPRALLUOGO (Supabase Storage) ==========
const FOTO_BUCKET = "foto-sopralluogo";
const FOTO_MAX_SIDE = 1600;

async function uploadQuotePhotos(photos, userId) {
  return Promise.all((photos || []).map(async (p) => {
    if (p.path || !p.data) return p;
    const blob = await (await fetch(p.data)).blob();
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage.from(FOTO_BUCKET).upload(path, blob, { contentType: blob.type || "image/jpeg" });
    if (error) throw error;
    return { ...p, path };
  }));
}

// Se il download fallisce la foto resta con il solo path: toglierla farebbe cancellare il file al salvataggio.
async function hydratePhotos(photos) {
  return Promise.all((photos || []).map(async (p) => {
    if (p.data || !p.path) return p;
    const { data, error } = await supabase.storage.from(FOTO_BUCKET).download(p.path);
    if (error) {
      console.error("Foto sopralluogo non scaricata:", p.path, error);
      return p;
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(data);
    });
    return { ...p, data: dataUrl };
  }));
}

const photosForDb = (photos) => (photos || []).filter(p => p.path).map(p => ({ id: p.id, name: p.name || "", path: p.path }));

async function removeStoragePhotos(paths) {
  if (!paths.length) return;
  const { error } = await supabase.storage.from(FOTO_BUCKET).remove(paths);
  if (error) console.error("Errore eliminazione foto sopralluogo:", error);
}

// Deve restare identica a normalizeDescrizione in api/matchComputo.js: e' la chiave della memoria abbinamenti.
function normalizeDescrizione(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, 500);
}

// ========== SALVATAGGIO LISTINO E COSTI FISSI ==========
const priceFromDb = (row) => ({
  id: row.id, _dbId: row.id, voce: row.nome || "", categoria: row.categoria || "", unita: row.unita || "cad",
  prezzo: Number(row.prezzo) || 0, costoInterno: Number(row.costo_interno) || 0, iva: Number(row.iva ?? 22), note: row.note || "",
});
const priceToDb = (p, userId) => ({
  user_id: userId, nome: p.voce || "", categoria: p.categoria || "", unita: p.unita || "cad",
  prezzo: Number(p.prezzo) || 0, costo_interno: Number(p.costoInterno) || 0, iva: Number(p.iva ?? 22), note: p.note || "",
});
const costoFromDb = (row) => ({
  id: row.id, _dbId: row.id, categoria: row.categoria || "", voce: row.voce || "",
  importo: Number(row.importo) || 0, frequenza: row.frequenza || "mensile", note: row.note || "",
});
const costoToDb = (c, userId) => ({
  user_id: userId, categoria: c.categoria || "", voce: c.voce || "",
  importo: Number(c.importo) || 0, frequenza: c.frequenza === "annuale" ? "annuale" : "mensile", note: c.note || "",
});
const clientFromDb = (row) => ({
  id: row.id, _dbId: row.id, nome: row.nome || "", codiceFiscale: row.codice_fiscale || "", indirizzo: row.indirizzo || "",
  telefono: row.telefono || "", whatsapp: row.telefono || "", email: row.email || "", note: row.note || "",
});
const clientToDb = (c, userId) => ({
  user_id: userId, nome: c.nome || "", codice_fiscale: c.codiceFiscale || "", indirizzo: c.indirizzo || "",
  telefono: c.whatsapp || c.telefono || "", email: c.email || "", note: c.note || "",
});

// Le voci inserite insieme hanno lo stesso created_at: a parità di data ordina per categoria e nome.
const sortDbRows = (rows) => [...rows].sort((a, b) =>
  String(a.created_at).localeCompare(String(b.created_at)) ||
  String(a.categoria || "").localeCompare(String(b.categoria || "")) ||
  String(a.nome ?? a.voce ?? "").localeCompare(String(b.nome ?? b.voce ?? ""))
);

async function loadOrSeedRows(table, userId, defaults, toDb, fromDb) {
  const { data, error } = await supabase.from(table).select("*").eq("user_id", userId);
  if (error) throw error;
  if (data.length) return sortDbRows(data).map(fromDb);
  const { data: inserted, error: insertError } = await supabase.from(table)
    .insert(defaults.filter(d => d.voce).map(d => toDb(d, userId))).select("*");
  if (insertError) throw insertError;
  return sortDbRows(inserted).map(fromDb);
}

const pendingInserts = new Map();

async function insertRows(table, rows, toDb, userId, setState) {
  if (!rows.length) return;
  const request = supabase.from(table).insert(rows.map(r => toDb(r, userId))).select("id")
    .then(({ data, error }) => { if (error) throw error; return data.map(d => d.id); });
  rows.forEach((r, i) => pendingInserts.set(table + ":" + r.id, request.then(ids => ids[i]).catch(() => null)));
  try {
    const ids = await request;
    const idMap = new Map(rows.map((r, i) => [r.id, ids[i]]));
    setState(list => list.map(r => idMap.has(r.id) ? { ...r, _dbId: idMap.get(r.id) } : r));
  } finally {
    rows.forEach(r => pendingInserts.delete(table + ":" + r.id));
  }
}

async function syncRows(table, prev, next, toDb, userId, setState) {
  const prevById = new Map(prev.map(r => [r.id, r]));
  const nextIds = new Set(next.map(r => r.id));
  const resolveDbId = async (row) => {
    if (row._dbId != null) return row._dbId;
    const pending = pendingInserts.get(table + ":" + row.id);
    return pending ? await pending : null;
  };

  await insertRows(table, next.filter(r => !prevById.has(r.id)), toDb, userId, setState);

  const changed = next.filter(r => prevById.has(r.id) && prevById.get(r.id) !== r);
  const withIds = await Promise.all(changed.map(async r => ({ row: r, dbId: await resolveDbId(r) })));
  await insertRows(table, withIds.filter(x => x.dbId == null).map(x => x.row), toDb, userId, setState);
  await Promise.all(withIds.filter(x => x.dbId != null).map(async ({ row, dbId }) => {
    const { error } = await supabase.from(table).update(toDb(row, userId)).eq("id", dbId);
    if (error) throw error;
  }));

  await Promise.all(prev.filter(r => !nextIds.has(r.id)).map(async r => {
    const dbId = await resolveDbId(r);
    if (dbId == null) return;
    const { error } = await supabase.from(table).delete().eq("id", dbId);
    if (error) throw error;
  }));
}

// ========== COMPONENTS ==========

const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAKsklEQVR42sWYe7BddXXHP+u39z73nnvuufcmMeQJSYwIZKYYO4MF2+nE6ShglGEAp4gP8C1aaodAO9W2gZEynaFaxmkuoFUjjE90amwEiyAX0RGZihiFIJkkECAPQvO6957H3r/fWv1j77PPvg+i/qH9zf3d89vn/Pb+rf1da33XQzjJMDMHOH6/wwAVEfvt7zATM4v4A46XO0/mQ01EFKDdPro6SYY2iLgznXMNVcSRY6qqs+51gPKy32l+6Zyz4toHC/tV/SNJbehhATOzSETCb1IpZscWhNAdD8FP2R9ghOD/J8sm3zgfkjIbObPWqhCSe6MoPgtAVb2ZlZttHh0IYJUfRKQ0LjAwQcTya6vcZ4KBiyLnALKs81e1Wn1LFUnp2VyxroXgfxJF8foQQgokgshcQ6i83m9p2iYgpYRSPkAAtRBAJIoi533ngiSp/3dPyJ6HRiKiWda+phAuE5GayEmEYx7hDMzml7jvo1L+FzMww0kUFTsMoi1mewcBNTNxBXrB7OkBkfjq4ofIipvzc43yuidA9doM1YBhRFGE937GPlPFgseCB82nqWKARa6HaeS91zhO1na7p1xQ0E7kcpMRS9PlZ0ZRtCaEICK5s1LYUg8pq4DWW6sZPgTiOCGKIo4fP0atVkNz+833xzGS1JCkBnENi2toHKPmCZMvYiGlYqEWRdEbe3jHExMTDlDn4pW5XEFFJKq49gzDL2yWwoGI45g4jnniiV9x/fXX8+QTT3LTTTfxzne9C4BuluGO7YOXnkYnX0SOPgtH98GJ/cjxFwgS4d9/LwMjizGfSX6UO63EwcziwoMuMzNLs9Rn3lvmvfkQzHtvPnjLKjP1mXXSrpmZTU9P24033mDDw8NWAdbe/OYL7bHHfmZmZkee+qFNbhoy/RiWXVczf11i/m+HTDc5a91yjk1Ot8xrsDRLvZmZ9937epRThrEe8WrP5jCCKYqhlk8zw9Rw4hhIamzf/l+cd955bN58A1NTU8RxXCJ9zz338vrX/yn/8Im/p7v4bF665Mu0F70aVx/DGoux+hjIANpYihuoYxpKs1WdSfUzvU0NiilGf/a+w2i3W1x55bt561svYseOHSxfvpxNm66lXq9jZrztskvZuHEjnU6Hf775X3jLm/6C4bPfRFhwGqQtTBXJAvgMbS5DIiDovN7vTs4gVujMQHKHiOOEQ4cOcueddyEiXHrpJXz/ge/z4as/TAgegPXr17PtO9u4+eZPsmbt6Vx9zTUs2vYBGs/9GB0YI2mfQHyGBcNGT8OVJ51EwF6MVMlJ1aTwUqxQe3+KCM1mEzPj45/4OOvOXEe73S5VlGYZkYv4m2uv49vb/pOrkh9gj91NGFhEPHWYIwvX00kW4LKAja3ss4JVYZklYBn8rSdS/mmWr9UqopoRQh7TgwZUFVfYnojgJLfX4BzrfnkL9tjX8KOnEh/Zz5GFf8z/XvFVDl74KaajEaSxsM+1eY5SnFPQzGwEwXIYixgrRTwTyU1TZr+hOJxzGIaIYGZ0s5A7y1eugie/jTZWEB/ex9Glf8Kxy7ey6tTltJat4ID/Aq9YtAaxgEn/qdXMMO4vQ8Fxkj88j/GFzA7BKP5mZWk95BxZ2sXFCa8951zs3msZ+NW30MZK5NA+jixcx+TlW1m+ei34LkPiWHreRblw3gPRjMg1R8AQIuI4twOTIgL0JcyBNc2VbDNytPz+LMMk4jPjt3OZux8/cQc6ugbb+2v8yteSvvcbnLJiFeK7qESYKjEeRPJoSTWd7GPo+vSSlXGt9x6CIWge1NHyuvqG+TsYLo6544tf4uolO8ge+SJ+eBV+727iV76Oh/5oE4/88tfUBbxayQp9xzOktPHc+uehmVR6qsptz1X4JiBoqVnpJ37letWr1/HO4Ufxj24lG1yB3/ss6ehqHv/zT/Khv7uRRx+ewEUJZpTP758lIK4fTi28PA+aaZm5mBlmHqvVsdoQhFBSQW6nViQEgmy/Dn76OXxtGbr3GaYGF9P9yLe46d+38sKeXbzilCUwi1vLLAkrGKNETufYoLmG5iwjiDgUctiHmujOiVzlZ7wB8xlGhPcZINTHlqL3/RO1n36WMLyabPdu2skox6+8k1e+6mw6Rw7lzysihargNNdvwQ+FugXTwrg0knm8uBJDxBAN2GAD3f0IydYrEYPuh74Ja88h60wR1PjXLZ/ljKduw348ThhaRWfXbqyxkM4Hvs7is84lQZGklnNpaR5amMvMdLzIreeUIm42zShF8hkP4A88xcBtFxOnLZwoyda3E579GTK8mM/c/nk+tnof0Y+2kA0sobPnGVx9jF0X3sKu6YSm83ilRKXUnRmhSD5CkYHnYd7m1IR3VwUsAgOqoCZYCLSTRRxecz5ROokBcXsS+fzlrLBDvG/l83D/LaSDy+nseQ61AY6/50v89ae2sv3rd5HU6qgPc8oDVQF1mAqoYCqYgmklizGZ6yRRiW1BAeppNJt0LruVF06/hPjQ86glRNpl8HMXIT+4FT+0gvSZ51CNeOmKcT766bt49KH7GVu0GFUlaN+p+s6V05yIgijVlKlsLsg8NBOqxKZ5RCEEljTrtC79NPvPuoT48AtkLcMRodIge/YgYTpl+j3/wYnTzuF7d38Z5xxJEuOcoz44SBRFpWo1Vw+mhmpRzujMmTtJAeHd8yBYLY4MQYNn2cJR2lfcxoEzLsLte57OiRQ99BK0Oxz8y1sZ3XA5Tesw2BjGzDiw/wA7d+7k8V/sYGpqEhGhMdTAOYdapcCZnSb1SgmYL9QFK72pWn/gIASWLhxh/zu2oJ0OS564jyyOePHt/8bY+R+koRlpgE67jZkxPj7O+Pj4DIP/7ne3c8EF57N8xamoKvPXszKz6HlbXjQVPOjaavPXuyYOgmfZKYs5+P4vcOiOq+ie/mc0LvwoTT9NsDrOCSOjo6RpWmY15bFOeOCBB9i4cSM/fPhhRkcW4L2fUYhVR+RcWsiH9Foe3e7Ua4LGj6epNxGR+ZoGuQM5Dh87ztBQneZAQlDFOUen02H3nj344HGzYqJZnopFzrF27asYGBhEdW5epGZ+dKQRTU9P3z48PPwRM4ulKNwBkhMnJncO1odWt9ttpBeMZ0iahzfnXBEGrWzOiEjuEDY7G5N+y0ME730FXZuhWlUNY6PNqNWavLjRGNn24IMPxk5EbGJiIhKRFGfjtSRymHmrVHHl2hQTI1goMhIpOxZmSpalZFlGlqYz1mmWkmYZaZr2hTOrNCaMEEJoNIaiyampp4eGmt8zM9mwYUOY3TyKJycnH2o2m+cePT5ZNo9mm0ru35XWVqWLVQmyzOhOvEw/x8BMNSRxEie1mCztvqHZbE7MaB6JiN3ADYhIKtK6eLrV+smC0WYtSRJRC6qqPpj6oPk0Na9qXk29qnoN6kOw4ve83lc1H9S8hmJPb19vnT8vYCajYyNxXIs6rempd1SFm+M9mzdvdgBP33PPQKvV+sd2p7Ovm3nT36EZ+bvs9WY2Od3qtLvt7xw9enT9SRuY1f50r6Fthw83/djw69JUTw8hjKDqtCiwVFV6n3nRVQaCvPGr4FyFdKvtYyCKok4tru036/x8cHB0V0+4k7aA/7+a6Gbmeu3n39hEny1oAYj8HuXTXtN+vvF/VnOcr6eJnkUAAAAASUVORK5CYII=";

function Sidebar({ currentView, onNavigate, onGoToNuovo, userProfile, onLogout }) {
  const nomeAzienda = userProfile?.nomeAzienda || "Protocollo Edile";
  const navItems = [
    { key: "home", label: "Home", icon: Home },
    { key: "nuovo", label: "Nuovo Preventivo", icon: Mic, action: onGoToNuovo },
    { key: "database", label: "Prezzi", icon: Database },
    { key: "clienti", label: "Clienti", icon: Users },
    { key: "storico", label: "Storico", icon: FileText },
    { key: "costifissi", label: "Costi Fissi", icon: Building2 },
  ];
  const bottomItems = [
    { key: "profilo", label: "Profilo Azienda", icon: User },
    { key: "gestione-abbonamento", label: "Abbonamento", icon: CreditCard },
    { key: "invita-amico", label: "Invita un Amico", icon: Gift },
  ];
  const isActive = (key) => currentView === key || (key === "nuovo" && currentView === "modifica") || (key === "storico" && currentView === "dettaglio");
  const itemClass = (key) => "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left " + (isActive(key) ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-50");
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 bg-white border-r border-gray-200 min-h-screen sticky top-0 self-start">
      <div className="p-5 flex items-center gap-3 border-b border-gray-100">
        <img src={LOGO_BASE64} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-orange-50 p-1" />
        <div className="min-w-0">
          <p className="font-bold text-gray-800 text-sm leading-tight">Preventivo Intelligente</p>
          <p className="text-xs text-gray-400 truncate">{nomeAzienda}</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <button key={item.key} onClick={() => item.action ? item.action() : onNavigate(item.key)} className={itemClass(item.key)}>
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100 space-y-1">
        {bottomItems.map(item => (
          <button key={item.key} onClick={() => onNavigate(item.key)} className={itemClass(item.key)}>
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition text-left">
          <LogOut size={18} /> Esci
        </button>
      </div>
    </aside>
  );
}
function Header({ currentView, onNavigate, userProfile, onLogout }) {
  const logoSrc = LOGO_BASE64;
  const nomeAzienda = userProfile?.nomeAzienda || "Protocollo Edile";
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-4 safe-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-white" />
          <div>
            <h1 className="text-lg font-bold">Preventivo Intelligente</h1>
            <p className="text-xs opacity-80">Crea preventivi professionali con l'AI</p>
          </div>
        </div>
        <div className="relative md:hidden">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/20 rounded-lg transition" title="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg py-1 min-w-[180px] z-50">
              <button onClick={() => { onNavigate("profilo"); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profilo Azienda
              </button>
              <button onClick={() => { onNavigate("gestione-abbonamento"); setShowMenu(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors">
                <CreditCard className="w-4 h-4 text-orange-500" />
                Gestione Abbonamento
              </button>
              <button onClick={() => { onNavigate("invita-amico"); setShowMenu(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors">
                <Gift className="w-4 h-4 text-orange-500" />
                Invita un Amico
              </button>
              <div className="border-t border-gray-100"></div>
              <button onClick={() => { onLogout(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Esci
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function HomeView({ onNavigate, onGoToNuovo, stats, userProfile, trialEnd, subscriptionStatus, onShowPricing }) {
  const nomeUtente = userProfile?.nome ? userProfile.nome : "";
  return (
    <div className="p-5 md:p-8 space-y-5 md:max-w-5xl md:mx-auto">
      <div className="text-center md:text-left py-4 md:py-0">
        <h2 className="text-2xl font-bold text-gray-800">{nomeUtente ? `Ciao ${nomeUtente}! 👋` : "Ciao! 👋"}</h2>
        <p className="text-gray-500 mt-1">Cosa vuoi fare oggi?</p>
      </div>

      <button onClick={onGoToNuovo} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 md:p-6 rounded-2xl flex items-center gap-4 shadow-lg hover:shadow-xl transition transform hover:scale-[1.01] active:scale-[0.98]">
        <div className="bg-white/20 p-3 rounded-xl">
          <Mic size={28} />
        </div>
        <div className="text-left">
          <p className="font-bold text-lg">Nuovo Preventivo</p>
          <p className="text-orange-100 text-sm">Parla e l'AI crea il preventivo</p>
        </div>
        <ChevronRight size={20} className="ml-auto" />
      </button>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => onNavigate("database")} className="bg-white border-2 border-gray-100 p-4 rounded-2xl text-left hover:border-orange-200 hover:shadow-md transition">
          <Database size={22} className="text-orange-500 mb-2" />
          <p className="font-semibold text-gray-800 text-xs">Prezzi</p>
          <p className="text-gray-400 text-xs mt-0.5">{stats.totalPrices} voci</p>
        </button>
        <button onClick={() => onNavigate("clienti")} className="bg-white border-2 border-gray-100 p-4 rounded-2xl text-left hover:border-orange-200 hover:shadow-md transition">
          <Users size={22} className="text-orange-500 mb-2" />
          <p className="font-semibold text-gray-800 text-xs">Clienti</p>
          <p className="text-gray-400 text-xs mt-0.5">{stats.totalClients} clienti</p>
        </button>
        <button onClick={() => onNavigate("storico")} className="bg-white border-2 border-gray-100 p-4 rounded-2xl text-left hover:border-orange-200 hover:shadow-md transition">
          <FileText size={22} className="text-orange-500 mb-2" />
          <p className="font-semibold text-gray-800 text-xs">Storico</p>
          <p className="text-gray-400 text-xs mt-0.5">{stats.totalQuotes} prev.</p>
        </button>
        <button onClick={() => onNavigate("costifissi")} className="bg-white border-2 border-gray-100 p-4 rounded-2xl text-left hover:border-orange-200 hover:shadow-md transition">
          <Building2 size={22} className="text-orange-500 mb-2" />
          <p className="font-semibold text-gray-800 text-xs">Costi Fissi</p>
          <p className="text-gray-400 text-xs mt-0.5">€ {stats.costoMensile?.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0"}/mese</p>
        </button>
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-4 md:space-y-0 space-y-5">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-orange-800 font-semibold text-sm">💡 Come funziona</p>
          <ol className="text-orange-700 text-xs mt-2 space-y-1">
            <li>1. Premi il microfono e descrivi il lavoro</li>
            <li>2. L'AI analizza e genera il preventivo</li>
            <li>3. Modifica se serve, poi scarica il PDF</li>
          </ol>
        </div>

        {subscriptionStatus === "trialing" && trialEnd && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center space-y-2 flex flex-col justify-center">
            <p className="text-sm text-gray-600">Il tuo abbonamento gratuito scadrà il <span className="font-bold text-orange-600">{new Date(trialEnd).toLocaleDateString("it-IT")}</span></p>
            <button onClick={onShowPricing} className="text-orange-500 font-semibold text-sm hover:underline">Abbonati ora a 47€/mese →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== PROFILO AZIENDA ==========
function ProfiloAzienda({ userProfile, setUserProfile, onNavigate }) {
  const [form, setForm] = useState({
    nome: userProfile?.nome || "",
    cognome: userProfile?.cognome || "",
    nomeAzienda: userProfile?.nomeAzienda || "",
    email: userProfile?.email || "",
    telefono: userProfile?.telefono || "",
    indirizzo: userProfile?.indirizzo || "",
    piva: userProfile?.piva || "",
    codiceFiscale: userProfile?.codiceFiscale || "",
    logo: userProfile?.logo || ""
  });
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Il logo non deve superare 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.nomeAzienda.trim()) {
      alert("Inserisci il nome dell'azienda");
      return;
    }
    setUserProfile({ ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    setUserProfile(null);
    onNavigate("home");
  };

  return (
    <div className="p-5 md:p-8 space-y-4 md:max-w-2xl md:mx-auto">
      <button onClick={() => onNavigate("home")} className="flex items-center gap-1 text-orange-500 hover:text-orange-600 mb-2">
        <ArrowLeft size={20} />
        <span className="text-sm">Indietro</span>
      </button>
      <div className="text-center py-2">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Building2 size={32} className="text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Profilo Azienda</h2>
        <p className="text-gray-500 text-sm mt-1">I tuoi dati appariranno nei preventivi PDF</p>
      </div>

      {/* Logo upload */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs text-gray-400 font-medium mb-3">LOGO AZIENDA</p>
        <div className="flex items-center gap-4">
          {form.logo ? (
            <img src={form.logo} alt="Logo" className="w-16 h-16 rounded-xl object-cover border-2 border-orange-200" />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <Image size={24} className="text-gray-400" />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-orange-50 text-orange-600 border border-orange-200 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-orange-100 transition"
            >
              <Upload size={16} />
              {form.logo ? "Cambia logo" : "Carica logo"}
            </button>
            {form.logo && (
              <button
                onClick={() => setForm(f => ({ ...f, logo: "" }))}
                className="w-full text-red-500 text-xs hover:text-red-700 transition"
              >
                Rimuovi logo
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </div>
        <p className="text-xs text-gray-400 mt-2">Formati: JPG, PNG. Max 2MB. Apparirà nell'intestazione del PDF.</p>
      </div>

      {/* Dati personali */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-xs text-gray-400 font-medium">DATI PERSONALI</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            placeholder="Nome"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
          <input
            value={form.cognome}
            onChange={e => setForm(f => ({ ...f, cognome: e.target.value }))}
            placeholder="Cognome"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>
      </div>

      {/* Dati azienda */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-xs text-gray-400 font-medium">DATI AZIENDA</p>
        <input
          value={form.nomeAzienda}
          onChange={e => setForm(f => ({ ...f, nomeAzienda: e.target.value }))}
          placeholder="Nome Azienda *"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <input
          value={form.piva}
          onChange={e => setForm(f => ({ ...f, piva: e.target.value }))}
          placeholder="Partita IVA"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <input
          value={form.codiceFiscale}
          onChange={e => setForm(f => ({ ...f, codiceFiscale: e.target.value.toUpperCase() }))}
          placeholder="Codice Fiscale"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <input
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="Email aziendale"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <input
          value={form.telefono}
          onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
          placeholder="Telefono"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
        <input
          value={form.indirizzo}
          onChange={e => setForm(f => ({ ...f, indirizzo: e.target.value }))}
          placeholder="Indirizzo sede"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
      </div>

      {/* Preview */}
      {form.nomeAzienda && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs text-orange-400 font-medium mb-2">ANTEPRIMA INTESTAZIONE PDF</p>
          <div className="flex items-center gap-3">
            {form.logo ? (
              <img src={form.logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                <Building2 size={20} className="text-orange-600" />
              </div>
            )}
            <div>
              <p className="font-bold text-orange-800 text-sm">{form.nomeAzienda.toUpperCase()}</p>
              {form.piva && <p className="text-orange-600 text-xs">P.IVA: {form.piva}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Salva */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition ${saved ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600"}`}
      >
        {saved ? <><Check size={18} /> Salvato!</> : <><Save size={18} /> Salva profilo</>}
      </button>

      {/* Reset */}
      {userProfile?.nomeAzienda && (
        <button
          onClick={handleLogout}
          className="w-full py-2 text-red-500 text-sm flex items-center justify-center gap-2 hover:text-red-700 transition"
        >
          <LogOut size={14} /> Resetta profilo
        </button>
      )}
    </div>
  );
}

const CAMPI_CLIENTE = ["nome", "indirizzo", "telefono", "email", "codiceFiscale"];

const clientDaAnagrafica = (c) => ({
  nome: c.nome || "", indirizzo: c.indirizzo || "", telefono: c.telefono || c.whatsapp || "",
  email: c.email || "", codiceFiscale: c.codiceFiscale || "", tipo: c.tipo || "Privato",
});

function NumberInput({ value, onChange, onFocus, onBlur, allowEmpty = false, ...props }) {
  const toText = (v) => (v === "" || v === null || v === undefined || Number.isNaN(Number(v)) ? "" : String(v));
  const [text, setText] = useState(toText(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(toText(value));
  }, [value, focused]);

  const toNumber = (t) => {
    const n = parseFloat(t);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={text}
      onFocus={(e) => {
        setFocused(true);
        e.target.select();
        onFocus?.(e);
      }}
      onChange={(e) => {
        let t = e.target.value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
        const dot = t.indexOf(".");
        if (dot !== -1) t = t.slice(0, dot + 1) + t.slice(dot + 1).replace(/\./g, "");
        t = t.replace(/^0+(?=\d)/, "");
        setText(t);
        onChange(allowEmpty && t === "" ? "" : toNumber(t));
      }}
      onBlur={(e) => {
        if (allowEmpty && text === "") {
          setFocused(false);
          onChange("");
          onBlur?.(e);
          return;
        }
        const n = toNumber(text);
        setText(String(n));
        setFocused(false);
        onChange(n);
        onBlur?.(e);
      }}
    />
  );
}

function VoiceRecorder({ onTranscriptComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualInput, setManualInput] = useState("");
  const speechAvailable = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const [useManual, setUseManual] = useState(!speechAvailable);
  const recognitionRef = useRef(null);

  const startRecording = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setUseManual(true);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "it-IT";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setUseManual(true);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const handleSubmit = () => {
    const text = useManual ? manualInput : transcript;
    if (text.trim()) {
      onTranscriptComplete(text.trim());
    }
  };

  return (
    <div className="space-y-4">
      {!useManual ? (
        <>
          <div className="text-center py-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-6 rounded-full transition-all transform active:scale-95 ${
                isRecording
                  ? "bg-red-500 shadow-lg shadow-red-200 animate-pulse"
                  : "bg-orange-500 shadow-lg shadow-orange-200 hover:bg-orange-600"
              } text-white`}
            >
              {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
            </button>
            <p className="mt-3 text-sm text-gray-500">
              {isRecording ? "🔴 Sto ascoltando... Parla!" : "Premi per registrare"}
            </p>
          </div>

          {transcript && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1 font-medium">TRASCRIZIONE</p>
              <p className="text-gray-700 text-sm leading-relaxed">{transcript}</p>
            </div>
          )}

          <button onClick={() => setUseManual(true)} className="text-xs text-gray-400 underline w-full text-center">
            Preferisco scrivere a mano
          </button>
        </>
      ) : (
        <>
          <textarea
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Descrivi il lavoro... Es: Ristrutturazione completa del bagno, sostituzione vasca con doccia, nuove piastrelle 25mq, rifacimento impianto idraulico"
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl text-sm focus:border-orange-400 focus:ring-0 focus:outline-none resize-none text-gray-700"
          />
          <button onClick={() => { setUseManual(false); setManualInput(""); }} className="text-xs text-gray-400 underline w-full text-center">
            Usa il microfono
          </button>
        </>
      )}

      {(transcript || manualInput) && (
        <button
          onClick={handleSubmit}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          Genera Preventivo con AI
        </button>
      )}
    </div>
  );
}

function QuoteEditor({ items, setItems, clientInfo, setClientInfo, onGeneratePDF, onBack, transcript, discount, setDiscount, margin, setMargin, clients, scadenza, setScadenza, pagamento, setPagamento, photos, setPhotos, prices, descrizione, setDescrizione, firmaImpresa, setFirmaImpresa, luogoFirma, setLuogoFirma, isEditing, onSaveOnly, onNavigate, isAIProcessing, isModifyRecording, modifyTranscript, startModifyRecording, stopModifyRecording, onAddPrice, onRememberMatch, onUpdateClient }) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showDBPicker, setShowDBPicker] = useState(false);
  const [dbSearch, setDbSearch] = useState("");
  const [isReformulating, setIsReformulating] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [validationError, setValidationError] = useState("");

  const clienteSelezionato = clientInfo?.clientId != null
    ? (clients || []).find(c => String(c.id) === String(clientInfo.clientId)) || null
    : null;
  const clienteModificato = !!clienteSelezionato && CAMPI_CLIENTE.some(k =>
    String(clientInfo[k] || "").trim() !== String(clientDaAnagrafica(clienteSelezionato)[k] || "").trim()
  );
  const salvaModificheCliente = () => {
    if (clienteSelezionato && onUpdateClient) onUpdateClient(clienteSelezionato.id, clientInfo);
  };

  const validateAndSubmit = () => {
    const errors = [];
    if (!clientInfo.nome?.trim()) errors.push("Nome cliente");
    if (!clienteSelezionato) {
      if (!clientInfo.indirizzo?.trim()) errors.push("Indirizzo");
      if (!clientInfo.telefono?.trim() && !clientInfo.email?.trim()) errors.push("Telefono o Email");
    }
    if (!descrizione?.trim()) errors.push("Descrizione lavoro");
    if (!items || items.length === 0) errors.push("Almeno una voce di preventivo");
    const vociDaPrezzare = items.filter(it => it.daPrezzare && !(it.prezzo > 0)).length;
    if (vociDaPrezzare > 0) errors.push(`Prezzo delle voci da prezzare (${vociDaPrezzare})`);
    if (!scadenza) errors.push("Data di scadenza");
    const totPerc = pagamento.reduce((s, f) => s + f.percentuale, 0);
    if (totPerc !== 100) errors.push("Modalità di pagamento (totale deve essere 100%)");

    if (errors.length > 0) {
      setValidationError("Campi obbligatori mancanti: " + errors.join(", "));
      return;
    }
    setValidationError("");
    if (clienteModificato && window.confirm(`Hai modificato i dati di ${clienteSelezionato.nome}. Vuoi salvare le modifiche anche nell'anagrafica clienti?`)) {
      salvaModificheCliente();
    }
    onGeneratePDF();
  };
  const dictRecRef = useRef(null);

  const speechAvailableDesc = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const startDictation = () => {
    if (!speechAvailableDesc) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "it-IT";
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalText = descrizione || "";
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += (finalText ? " " : "") + event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setDescrizione(finalText + (interim ? " " + interim : ""));
    };
    recognition.onerror = () => { setIsDictating(false); };
    recognition.onend = () => { setIsDictating(false); };
    dictRecRef.current = recognition;
    recognition.start();
    setIsDictating(true);
  };

  const stopDictation = () => {
    if (dictRecRef.current) {
      dictRecRef.current.stop();
      dictRecRef.current = null;
    }
    setIsDictating(false);
  };

  const reformulateDescription = async () => {
    if (!descrizione || !descrizione.trim()) return;
    setIsReformulating(true);
    try {
      const response = await fetch('/api/reformulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descrizione: descrizione.trim() })
      });
      const data = await response.json();
      if (data.result) {
        setDescrizione(data.result);
      } else {
        alert('Errore nella riformulazione. Riprova.');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore di connessione. Riprova.');
    } finally {
      setIsReformulating(false);
    }
  };
  const subtotale = items.reduce((sum, item) => sum + item.quantita * item.prezzo, 0);

  // Calcolo margine (ricarico % o fisso sul subtotale — visibile solo all'impresario)
  const importoMargine = margin.enabled
    ? (margin.tipo === "percentuale"
      ? subtotale * (margin.valore / 100)
      : margin.valore)
    : 0;
  const subtotaleConMargine = subtotale + importoMargine;

  // Calcolo sconto (applicato dopo il margine)
  const importoSconto = discount.enabled
    ? (discount.tipo === "percentuale"
      ? subtotaleConMargine * (discount.valore / 100)
      : discount.valore)
    : 0;
  const subtotaleScontato = Math.max(0, subtotaleConMargine - importoSconto);

  // Calcolo IVA mista per aliquota
  const ivaPerAliquota = {};
  items.forEach(item => {
    const aliquota = item.iva ?? 22;
    const importoVoce = item.quantita * item.prezzo;
    if (!ivaPerAliquota[aliquota]) ivaPerAliquota[aliquota] = 0;
    ivaPerAliquota[aliquota] += importoVoce;
  });
  // Applica proporzione margine/sconto su ogni fascia IVA
  const proporzione = subtotale > 0 ? subtotaleScontato / subtotale : 1;
  let ivaTotal = 0;
  const ivaDettaglio = Object.entries(ivaPerAliquota).map(([aliq, base]) => {
    const baseRiproporzionata = base * proporzione;
    const importoIva = baseRiproporzionata * (parseFloat(aliq) / 100);
    ivaTotal += importoIva;
    return { aliquota: parseFloat(aliq), base: baseRiproporzionata, importo: importoIva };
  }).sort((a, b) => a.aliquota - b.aliquota);

  const totale = subtotaleScontato + ivaTotal;

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addManualItem = () => {
    setItems([...items, { voce: "Nuova voce", categoria: "Personalizzata", unita: "cad", quantita: 1, prezzo: 0, iva: 22 }]);
  };

  const [pickerTarget, setPickerTarget] = useState(null);
  const pickerRef = useRef(null);

  const openPickerFor = (index) => {
    setPickerTarget(index);
    setDbSearch("");
    setShowDBPicker(true);
    setTimeout(() => pickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const applyListinoToItem = (index, p) => {
    const current = items[index];
    const updated = [...items];
    updated[index] = {
      voce: p.voce, categoria: p.categoria, unita: p.unita, quantita: current.quantita,
      prezzo: p.prezzo, costoInterno: p.costoInterno || 0, iva: p.iva ?? 22,
      descrizioneComputo: current.descrizioneComputo,
    };
    setItems(updated);
    if (current.descrizioneComputo && onRememberMatch) onRememberMatch(current.descrizioneComputo, p.voce, p.unita);
  };

  const addItemToListino = (index) => {
    const current = items[index];
    const nome = (current.voce || "").trim();
    if (!onAddPrice || !nome || !(current.prezzo > 0)) return;
    if ((prices || []).some(p => (p.voce || "").trim().toLowerCase() === nome.toLowerCase())) {
      alert("Nel listino esiste già una voce con questo nome: usa \"Scegli dal listino\" per abbinarla.");
      return;
    }
    const categoria = current.categoria && current.categoria !== "Personalizzata" ? current.categoria : "Da computo";
    const nuova = { voce: nome, categoria, unita: current.unita, prezzo: current.prezzo, costoInterno: current.costoInterno || 0, iva: current.iva ?? 22, note: "" };
    onAddPrice(nuova);
    const updated = [...items];
    updated[index] = {
      voce: nuova.voce, categoria: nuova.categoria, unita: nuova.unita, quantita: current.quantita,
      prezzo: nuova.prezzo, costoInterno: nuova.costoInterno, iva: nuova.iva,
      descrizioneComputo: current.descrizioneComputo,
    };
    setItems(updated);
    if (current.descrizioneComputo && onRememberMatch) onRememberMatch(current.descrizioneComputo, nuova.voce, nuova.unita);
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
        <Check size={18} className="text-green-600" />
        <p className="text-green-700 text-sm font-medium">Preventivo generato dall'AI!</p>
      </div>

      {/* DESCRIZIONE LAVORO */}
      <div className={`bg-white border rounded-xl p-4 space-y-2 ${isDictating ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">DESCRIZIONE LAVORO</p>
          <div className="flex items-center gap-1">
            <button
              onClick={reformulateDescription}
              disabled={isReformulating || !descrizione?.trim()}
              className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-lg transition ${
                isReformulating || !descrizione?.trim()
                  ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                  : "text-purple-600 bg-purple-50 hover:bg-purple-100"
              }`}
            >
              {isReformulating ? (
                <><RefreshCw size={12} className="animate-spin" /> Riformulando...</>
              ) : (
                <><RefreshCw size={12} /> Riformula AI</>
              )}
            </button>
            {speechAvailableDesc && (
              <button
                onClick={isDictating ? stopDictation : startDictation}
                className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-lg transition ${
                  isDictating
                    ? "text-red-600 bg-red-100 hover:bg-red-200 animate-pulse"
                    : "text-orange-600 bg-orange-50 hover:bg-orange-100"
                }`}
              >
                {isDictating ? <><MicOff size={12} /> Stop</> : <><Mic size={12} /> Dettatura</>}
              </button>
            )}
          </div>
        </div>
        {isDictating && (
          <div className="flex items-center gap-2 bg-red-100 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <p className="text-red-700 text-xs font-medium">Registrazione in corso... parla ora</p>
          </div>
        )}
        <textarea
          value={descrizione || ""}
          onChange={(e) => setDescrizione(e.target.value)}
          placeholder="Descrivi i lavori da eseguire... Puoi scrivere o usare il pulsante 🎤 Dettatura per dettare a voce"
          className={`w-full p-3 border rounded-lg text-sm focus:border-orange-400 focus:outline-none resize-none ${isDictating ? "border-red-300 bg-white" : "border-gray-200"}`}
          rows={4}
        />
        <p className="text-[10px] text-gray-300">Scrivi o detta a voce la descrizione, poi clicca "Riformula AI" per renderla professionale</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-xs text-gray-400 font-medium">DATI CLIENTE</p>
        {clients && clients.length > 0 && (
          <select
            value={clienteSelezionato ? String(clienteSelezionato.id) : ""}
            onChange={(e) => {
              if (!e.target.value) {
                setClientInfo({ nome: "", indirizzo: "", telefono: "", email: "", codiceFiscale: "" });
                return;
              }
              const c = clients.find(cl => String(cl.id) === e.target.value);
              if (c) setClientInfo({ ...clientDaAnagrafica(c), clientId: c.id });
            }}
            className="w-full p-2 border border-orange-300 rounded-lg text-sm focus:outline-none bg-orange-50 text-orange-700"
          >
            <option value="">+ Nuovo cliente (compila i campi sotto)</option>
            {clients.map(c => <option key={c.id} value={String(c.id)}>{c.nome}{c.tipo ? ` (${c.tipo})` : ""}</option>)}
          </select>
        )}
        {clienteSelezionato && clienteModificato && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
            <p className="text-xs text-amber-800">
              Hai modificato i dati di <span className="font-semibold">{clienteSelezionato.nome}</span>. Vuoi salvare le modifiche nell'anagrafica clienti?
            </p>
            <div className="flex gap-2">
              <button onClick={salvaModificheCliente} className="text-xs font-semibold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition">
                Salva modifiche
              </button>
              <button onClick={() => setClientInfo({ ...clientDaAnagrafica(clienteSelezionato), clientId: clienteSelezionato.id })} className="text-xs font-medium text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition">
                Annulla modifiche
              </button>
            </div>
          </div>
        )}
        {clienteSelezionato && !clienteModificato && (
          <p className="text-[11px] text-gray-400">Dati compilati dall'anagrafica clienti. Se li modifichi ti chiedo se salvarli.</p>
        )}
        <input value={clientInfo.nome} onChange={(e) => setClientInfo({ ...clientInfo, nome: e.target.value })} placeholder="Nome cliente *" className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" />
        <input value={clientInfo.indirizzo} onChange={(e) => setClientInfo({ ...clientInfo, indirizzo: e.target.value })} placeholder="Indirizzo *" className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" />
        <div className="grid grid-cols-2 gap-2">
          <input value={clientInfo.telefono} onChange={(e) => setClientInfo({ ...clientInfo, telefono: e.target.value })} placeholder="Telefono/WhatsApp *" className="p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" />
          <input value={clientInfo.email || ""} onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })} placeholder="Email *" className="p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" />
        </div>
        <input value={clientInfo.codiceFiscale || ""} onChange={(e) => setClientInfo({ ...clientInfo, codiceFiscale: e.target.value })} placeholder="Codice Fiscale / P.IVA *" className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" />
      </div>

      {/* SCADENZA PREVENTIVO */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
        <p className="text-xs text-gray-400 font-medium">VALIDITÀ PREVENTIVO</p>
        <div className="flex items-center gap-2">
          <input type="date" value={scadenza} onChange={(e) => setScadenza(e.target.value)} className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" />
          <span className="text-xs text-gray-400">Scade il</span>
        </div>
      </div>

      {/* MODALITÀ DI PAGAMENTO */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">MODALITÀ DI PAGAMENTO</p>
          <button
            onClick={() => setPagamento([...pagamento, { fase: "Nuova fase", percentuale: 0 }])}
            className="text-orange-500 text-xs font-medium flex items-center gap-1 hover:text-orange-600"
          >
            <Plus size={12} /> Aggiungi fase
          </button>
        </div>
        {pagamento.map((fase, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => { e.dataTransfer.setData("text/plain", i.toString()); e.currentTarget.style.opacity = "0.5"; }}
            onDragEnd={(e) => { e.currentTarget.style.opacity = "1"; }}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderTop = "2px solid #f97316"; }}
            onDragLeave={(e) => { e.currentTarget.style.borderTop = ""; }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderTop = "";
              const from = parseInt(e.dataTransfer.getData("text/plain"));
              if (from === i) return;
              const updated = [...pagamento];
              const [moved] = updated.splice(from, 1);
              updated.splice(i, 0, moved);
              setPagamento(updated);
            }}
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
          >
            <div className="flex flex-col items-center -mr-1">
              <GripVertical size={16} className="text-gray-300" />
            </div>
            <NumberInput
              value={fase.percentuale}
              onChange={(n) => { const u = [...pagamento]; u[i] = { ...u[i], percentuale: n }; setPagamento(u); }}
              className="w-16 p-2 border border-gray-200 rounded-lg text-sm text-center focus:border-orange-400 focus:outline-none"
            />
            <span className="text-gray-400 text-sm">%</span>
            <input
              value={fase.fase}
              onChange={(e) => { const u = [...pagamento]; u[i] = { ...u[i], fase: e.target.value }; setPagamento(u); }}
              className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none"
            />
            <div className="flex flex-col">
              <button
                onClick={() => { if (i === 0) return; const u = [...pagamento]; [u[i-1], u[i]] = [u[i], u[i-1]]; setPagamento(u); }}
                className={`p-0.5 ${i === 0 ? "text-gray-200" : "text-gray-400 hover:text-orange-500"}`}
                disabled={i === 0}
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => { if (i === pagamento.length - 1) return; const u = [...pagamento]; [u[i], u[i+1]] = [u[i+1], u[i]]; setPagamento(u); }}
                className={`p-0.5 ${i === pagamento.length - 1 ? "text-gray-200" : "text-gray-400 hover:text-orange-500"}`}
                disabled={i === pagamento.length - 1}
              >
                <ChevronDown size={14} />
              </button>
            </div>
            {pagamento.length > 1 && (
              <button onClick={() => setPagamento(pagamento.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 p-1">
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        {(() => {
          const totPerc = pagamento.reduce((s, f) => s + f.percentuale, 0);
          return totPerc !== 100 ? (
            <p className={`text-xs font-medium ${totPerc > 100 ? "text-red-500" : "text-amber-500"}`}>
              Totale: {totPerc}% — {totPerc > 100 ? "supera il 100%!" : `manca il ${100 - totPerc}%`}
            </p>
          ) : (
            <p className="text-xs text-green-600 font-medium">Totale: 100% ✓</p>
          );
        })()}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-gray-400 font-medium">VOCI PREVENTIVO ({items.length})</p>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="text-orange-500 text-xs font-medium flex items-center gap-1 hover:text-orange-600"
            >
              <Plus size={12} /> Aggiungi voce
            </button>
            {showAddMenu && (
              <div className="absolute right-0 top-6 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-56">
                <button
                  onClick={() => { setPickerTarget(null); setShowDBPicker(true); setShowAddMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition text-left"
                >
                  <div className="bg-orange-100 p-1.5 rounded-lg"><Database size={14} className="text-orange-600" /></div>
                  <div>
                    <p className="font-medium text-gray-800 text-xs">Dal database prezzi</p>
                    <p className="text-gray-400 text-[10px]">Scegli una voce esistente</p>
                  </div>
                </button>
                <button
                  onClick={() => { addManualItem(); setShowAddMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition text-left border-t border-gray-100"
                >
                  <div className="bg-blue-100 p-1.5 rounded-lg"><Edit3 size={14} className="text-blue-600" /></div>
                  <div>
                    <p className="font-medium text-gray-800 text-xs">Voce manuale</p>
                    <p className="text-gray-400 text-[10px]">Inserisci una voce personalizzata</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        {items.length > 0 && (
          <button
            onClick={isModifyRecording ? stopModifyRecording : startModifyRecording}
            disabled={isAIProcessing}
            className={`text-xs font-medium flex items-center gap-1 ${
              isModifyRecording 
                ? "text-red-500 animate-pulse" 
                : "text-blue-500 hover:text-blue-600"
            } ${isAIProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isModifyRecording ? <MicOff size={12} /> : <Mic size={12} />}
            {isModifyRecording ? "Stop modifica" : "Modifica con audio"}
          </button>
        )}
        </div>


        {/* AI Processing indicator */}
        {isAIProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <p className="text-xs text-blue-600 font-medium">L'AI sta elaborando...</p>
          </div>
        )}

        {/* Modify transcript display */}
        {(isModifyRecording || modifyTranscript) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-400 mb-1 font-medium">
              {isModifyRecording ? "Sto ascoltando la modifica..." : "MODIFICA RICHIESTA"}
            </p>
            <p className="text-gray-700 text-sm">{modifyTranscript || "Parla per modificare il preventivo..."}</p>
          </div>
        )}

        {/* Picker dal database prezzi */}
        {showDBPicker && (
          <div ref={pickerRef} className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-orange-700">{pickerTarget !== null ? "Scegli la voce corretta dal listino" : "Seleziona dal database"}</p>
              <button onClick={() => { setShowDBPicker(false); setDbSearch(""); setPickerTarget(null); }} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
            {pickerTarget !== null && items[pickerTarget]?.descrizioneComputo && (
              <p className="text-[11px] text-gray-500 line-clamp-2">
                Per: {items[pickerTarget].descrizioneComputo}. La scelta verr{"à"} ricordata per i prossimi computi.
              </p>
            )}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                placeholder="Cerca voce..."
                className="w-full pl-8 pr-3 py-2 border border-orange-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {(prices || [])
                .filter(p => !dbSearch || p.voce.toLowerCase().includes(dbSearch.toLowerCase()) || p.categoria.toLowerCase().includes(dbSearch.toLowerCase()))
                .map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (pickerTarget !== null && items[pickerTarget]) {
                        applyListinoToItem(pickerTarget, p);
                      } else {
                        setItems([...items, { voce: p.voce, categoria: p.categoria, unita: p.unita, quantita: 1, prezzo: p.prezzo, costoInterno: p.costoInterno || 0, iva: p.iva ?? 22 }]);
                      }
                      setShowDBPicker(false);
                      setDbSearch("");
                      setPickerTarget(null);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-100 transition flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.voce}</p>
                      <p className="text-[10px] text-gray-400">{p.categoria} · {p.unita} · IVA {p.iva ?? 22}%</p>
                    </div>
                    <span className="text-xs font-semibold text-orange-600">€ {p.prezzo}</span>
                  </button>
                ))
              }
            </div>
          </div>
        )}

        {items.some(it => it.daPrezzare && !(it.prezzo > 0)) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700">
              {items.filter(it => it.daPrezzare && !(it.prezzo > 0)).length} voci del computo non hanno un prezzo nel tuo listino: sono evidenziate in rosso, inserisci il prezzo prima di generare il preventivo.
            </p>
          </div>
        )}

        {items.map((item, i) => (
          <div key={i} className={`bg-white border rounded-xl p-3 ${item.daPrezzare && !(item.prezzo > 0) ? "border-red-400 bg-red-50" : item.categoria === "Personalizzata" ? "border-orange-300 bg-orange-50" : "border-gray-200"}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {item.categoria === "Personalizzata" ? (
                  <>
                    <input
                      value={item.voce}
                      onChange={(e) => updateItem(i, "voce", e.target.value)}
                      className="font-medium text-gray-800 text-sm w-full bg-transparent border-b border-orange-300 focus:border-orange-500 focus:outline-none pb-0.5 mb-0.5"
                      placeholder="Nome voce..."
                    />
                    <div className="flex items-center gap-2">
                      <input
                        value={item.categoria}
                        onChange={(e) => updateItem(i, "categoria", e.target.value)}
                        className="text-gray-400 text-xs bg-transparent border-b border-dashed border-gray-300 focus:border-orange-400 focus:outline-none w-24"
                        placeholder="Categoria"
                      />
                      <select
                        value={item.unita}
                        onChange={(e) => updateItem(i, "unita", e.target.value)}
                        className="text-gray-400 text-xs bg-transparent border-b border-dashed border-gray-300 focus:outline-none"
                      >
                        <option value="cad">cad</option>
                        <option value="mq">mq</option>
                        <option value="ml">ml</option>
                        <option value="mc">mc</option>
                        <option value="kg">kg</option>
                        <option value="h">h</option>
                        <option value="corpo">corpo</option>
                      </select>
                      <select
                        value={item.iva ?? 22}
                        onChange={(e) => updateItem(i, "iva", parseInt(e.target.value))}
                        className="text-gray-400 text-xs bg-transparent border-b border-dashed border-gray-300 focus:outline-none"
                      >
                        <option value={4}>IVA 4%</option>
                        <option value={10}>IVA 10%</option>
                        <option value={22}>IVA 22%</option>
                      </select>
                    </div>
                    {item.daPrezzare && !(item.prezzo > 0) && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1">Da prezzare: voce non presente nel listino</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-800 text-sm">{item.voce}</p>
                    <p className="text-gray-400 text-xs">{item.categoria}</p>
                    {item.descrizioneComputo && (
                      <p className="text-gray-400 text-[11px] mt-0.5 line-clamp-2">Dal computo: {item.descrizioneComputo}</p>
                    )}
                  </>
                )}
              </div>
              <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-1">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <NumberInput
                  value={item.quantita}
                  onChange={(n) => updateItem(i, "quantita", n)}
                  className="w-16 p-1 border border-gray-200 rounded text-center text-sm focus:border-orange-400 focus:outline-none"
                />
                <span className="text-gray-400 text-xs">{item.unita}</span>
              </div>
              <span className="text-gray-300">×</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-xs">€</span>
                <NumberInput
                  value={item.prezzo}
                  onChange={(n) => updateItem(i, "prezzo", n)}
                  className={`w-20 p-1 border rounded text-center text-sm focus:border-orange-400 focus:outline-none ${item.daPrezzare && !(item.prezzo > 0) ? "border-red-400 bg-white" : "border-gray-200"}`}
                />
              </div>
              <span className="text-gray-300">=</span>
              <span className="font-semibold text-gray-800 text-sm ml-auto">
                € {(item.quantita * item.prezzo).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {item.descrizioneComputo && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 pt-2 border-t border-dashed border-gray-200">
                {item.categoria === "Personalizzata" ? (
                  <>
                    <button onClick={() => openPickerFor(i)} className="text-[11px] font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
                      <Search size={11} /> Scegli dal listino
                    </button>
                    <button
                      onClick={() => addItemToListino(i)}
                      disabled={!(item.prezzo > 0)}
                      title={item.prezzo > 0 ? "" : "Inserisci prima il prezzo"}
                      className="text-[11px] font-medium text-green-600 hover:text-green-700 flex items-center gap-1 disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      <Plus size={11} /> Aggiungi al listino
                    </button>
                  </>
                ) : (
                  <button onClick={() => openPickerFor(i)} className="text-[11px] font-medium text-gray-500 hover:text-orange-600 flex items-center gap-1">
                    <Edit3 size={11} /> Abbinamento sbagliato? Cambia voce
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MARGINE DI GUADAGNO */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-800">📊 Ricarico ulteriore da inserire</p>
            <p className="text-xs text-blue-500">Ricarico % o a corpo sul costo base (non visibile al cliente)</p>
          </div>
          <button
            onClick={() => setMargin({ ...margin, enabled: !margin.enabled })}
            className={`relative w-11 h-6 rounded-full transition ${margin.enabled ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${margin.enabled ? "translate-x-5" : ""}`} />
          </button>
        </div>
        {margin.enabled && (
          <div className="flex items-center gap-2">
            <select
              value={margin.tipo}
              onChange={(e) => setMargin({ ...margin, tipo: e.target.value })}
              className="p-2 border border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none bg-white"
            >
              <option value="percentuale">%</option>
              <option value="fisso">€ fisso</option>
            </select>
            <NumberInput
              value={margin.valore}
              onChange={(n) => setMargin(prev => ({ ...prev, valore: n }))}
              className="flex-1 p-2 border border-blue-200 rounded-lg text-sm text-center focus:border-blue-400 focus:outline-none"
            />
            <span className="text-blue-400 text-xs ml-auto whitespace-nowrap">
              + € {importoMargine.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* SCONTO */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-green-800">🏷️ Sconto</p>
            <p className="text-xs text-green-500">Sconto % o a corpo sul totale</p>
          </div>
          <button
            onClick={() => setDiscount({ ...discount, enabled: !discount.enabled })}
            className={`relative w-11 h-6 rounded-full transition ${discount.enabled ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${discount.enabled ? "translate-x-5" : ""}`} />
          </button>
        </div>
        {discount.enabled && (
          <div className="flex items-center gap-2">
            <select
              value={discount.tipo}
              onChange={(e) => setDiscount({ ...discount, tipo: e.target.value })}
              className="p-2 border border-green-200 rounded-lg text-sm focus:outline-none bg-white"
            >
              <option value="percentuale">%</option>
              <option value="fisso">€ fisso</option>
            </select>
            <NumberInput
              value={discount.valore}
              onChange={(n) => setDiscount(prev => ({ ...prev, valore: n }))}
              placeholder={discount.tipo === "percentuale" ? "Es: 10" : "Es: 500"}
              className="flex-1 p-2 border border-green-200 rounded-lg text-sm focus:border-green-400 focus:outline-none"
            />
            {discount.valore > 0 && (
              <span className="text-green-600 text-xs font-medium whitespace-nowrap">
                - € {importoSconto.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* RIEPILOGO TOTALI */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotale voci</span>
          <span>€ {subtotale.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        {margin.enabled && importoMargine > 0 && (
          <div className="flex justify-between text-sm text-blue-600">
            <span>Margine {margin.tipo === "percentuale" ? `(${margin.valore}%)` : "fisso"}</span>
            <span>+ € {importoMargine.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
        {discount.enabled && importoSconto > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Sconto {discount.tipo === "percentuale" ? `(${discount.valore}%)` : "fisso"}</span>
            <span>- € {importoSconto.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
        {(margin.enabled || (discount.enabled && importoSconto > 0)) && (
          <div className="flex justify-between text-sm text-gray-600 border-t border-gray-200 pt-1">
            <span>Imponibile</span>
            <span>€ {subtotaleScontato.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
        {ivaDettaglio.map((d, i) => (
          <div key={i} className="flex justify-between text-sm text-gray-600">
            <span>IVA {d.aliquota}%</span>
            <span>€ {d.importo.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
          <span>TOTALE</span>
          <span className="text-orange-600 text-lg">€ {totale.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* IL TUO MARGINE - Anteprima */}
      {(() => {
        const costoTotaleInterno = items.reduce((sum, item) => sum + ((parseFloat(item.costoInterno) || 0) * (parseFloat(item.quantita) || 0)), 0);
        const margineReale = subtotaleScontato - costoTotaleInterno;
        const marginePerc = subtotaleScontato > 0 ? (margineReale / subtotaleScontato * 100).toFixed(1) : 0;
        const isPositive = margineReale >= 0;
        return (
          <div className={`border-2 ${isPositive ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"} rounded-xl p-4 space-y-2`}>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className={isPositive ? "text-green-600" : "text-red-600"} />
              <p className={`text-sm font-semibold ${isPositive ? "text-green-800" : "text-red-800"}`}>IL TUO MARGINE</p>
            </div>
            <p className="text-xs text-gray-600">(Visibile solo a te - non compare nel PDF)</p>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Costo totale interno</span>
                <span className="font-semibold">€ {costoTotaleInterno.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className={`flex justify-between text-sm font-bold border-t pt-1 ${isPositive ? "text-green-700" : "text-red-700"}`}>
                <span>Margine reale</span>
                <span>€ {margineReale.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                Margine %: {marginePerc}%
              </div>
            </div>
          </div>
        );
      })()}

      {/* FOTO SOPRALLUOGO */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">FOTO SOPRALLUOGO</p>
            <p className="text-xs text-gray-300">{photos.length}/10 foto</p>
          </div>
          {photos.length < 10 && (
            <label className="bg-orange-500 text-white p-2 rounded-xl hover:bg-orange-600 transition cursor-pointer">
              <Camera size={18} />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  e.target.value = "";
                  for (const file of files.slice(0, 10 - photos.length)) {
                    try {
                      const data = await imageFileToDataUrl(file, FOTO_MAX_SIDE);
                      setPhotos(prev => [...prev, { id: Date.now() + Math.random(), name: file.name, data }].slice(0, 10));
                    } catch (err) {
                      alert(err.message);
                    }
                  }
                }}
              />
            </label>
          )}
        </div>
        {photos.length === 0 ? (
          <div className="text-center py-4">
            <Image size={32} className="text-gray-200 mx-auto mb-1" />
            <p className="text-gray-400 text-xs">Aggiungi le foto del sopralluogo</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                {photo.data ? (
                  <img src={photo.data} alt={photo.name} className="w-full h-16 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <div className="w-full h-16 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center" title="Foto non scaricata: riprova più tardi">
                    <Image size={16} className="text-gray-300" />
                  </div>
                )}
                <button
                  onClick={() => setPhotos(photos.filter(p => p.id !== photo.id))}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FIRMA IMPRESA */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-xs text-gray-400 font-medium">FIRMA PREVENTIVO (nel PDF)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-gray-400">Luogo</label>
            <input
              value={luogoFirma}
              onChange={(e) => setLuogoFirma(e.target.value)}
              placeholder="Es: Roma"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Data</label>
            <input
              type="date"
              value={scadenza ? new Date().toISOString().split("T")[0] : ""}
              disabled
              className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
            <p className="text-[10px] text-gray-300 mt-0.5">Data odierna automatica</p>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-gray-400">Nome impresa / Firma</label>
          <input
            value={firmaImpresa}
            onChange={(e) => setFirmaImpresa(e.target.value)}
            placeholder="Es: Edilizia Rossi S.r.l."
            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none"
          />
        </div>
        {firmaImpresa && (
          <div className="text-center pt-2 border-t border-dashed border-gray-200">
            <p className="text-[10px] text-gray-400 mb-1">Anteprima firma nel PDF:</p>
            <p style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontSize: "24px", color: "#1F2937" }}>{firmaImpresa}</p>
          </div>
        )}
      </div>

      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <X size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-600 text-xs">{validationError}</p>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={validateAndSubmit}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
        >
          <Download size={18} />
          {isEditing ? "Salva e scarica PDF" : "Salva e scarica PDF"}
        </button>
        {isEditing && (
          <button
            onClick={() => {
              // Validazione prima di salvare
              const errors = [];
              if (!clientInfo.nome?.trim()) errors.push("Nome cliente");
              if (!clientInfo.indirizzo?.trim()) errors.push("Indirizzo");
              if (!clientInfo.telefono?.trim() && !clientInfo.email?.trim()) errors.push("Telefono o Email");
              if (!descrizione?.trim()) errors.push("Descrizione lavoro");
              if (!items || items.length === 0) errors.push("Almeno una voce");
              if (errors.length > 0) { setValidationError("Campi obbligatori mancanti: " + errors.join(", ")); return; }
              setValidationError("");
              onGeneratePDF();
              if (onNavigate) onNavigate("storico");
            }}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Salva modifiche
          </button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        Preventivo valido {scadenza ? `fino al ${new Date(scadenza).toLocaleDateString("it-IT")}` : "30 giorni dalla data di emissione"}
      </p>
    </div>
  );
}

function PriceDatabase({ prices, setPrices }) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ categoria: "", voce: "", unita: "mq", costoInterno: "", prezzo: "", note: "", iva: 22 });
  const ivaOptions = [0, 4, 10, 22];

  const categories = [...new Set(prices.map(p => p.categoria))];
  const [selectedCat, setSelectedCat] = useState("Tutte");

  const filtered = prices.filter(p => {
    const matchSearch = (p.voce || "").toLowerCase().includes(search.toLowerCase()) || (p.categoria || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === "Tutte" || p.categoria === selectedCat;
    return matchSearch && matchCat;
  });

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValues({ costoInterno: item.costoInterno, prezzo: item.prezzo, note: item.note, iva: item.iva ?? 22 });
  };

  const saveEdit = (id) => {
    setPrices(prices.map(p => p.id === id ? { ...p, ...editValues } : p));
    setEditingId(null);
  };

  const addItem = () => {
    if (newItem.voce && newItem.categoria) {
      setPrices([...prices, { ...newItem, id: Date.now(), costoInterno: parseFloat(newItem.costoInterno) || 0, prezzo: parseFloat(newItem.prezzo) || 0 }]);
      setNewItem({ categoria: "", voce: "", unita: "mq", costoInterno: "", prezzo: "", note: "", iva: 22 });
      setShowAdd(false);
    }
  };

  const deleteItem = (id) => {
    setPrices(prices.filter(p => p.id !== id));
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:max-w-4xl md:mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">Database Prezzi</h2>
          <p className="text-gray-400 text-xs">{prices.length} voci totali</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-orange-500 text-white p-2 rounded-xl hover:bg-orange-600 transition"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-amber-800 text-xs leading-relaxed">
          <span className="font-semibold">Inserisci qui sotto i costi di acquisto dei diversi materiali</span> e successivamente il costo di vendita con il tuo ricarico/guadagno.<br/><br/>Nel preventivo compariranno solo i prezzi di vendita.
        </p>
      </div>

      {showAdd && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-orange-800">Nuova voce</p>
          <select value={newItem.categoria} onChange={(e) => setNewItem({...newItem, categoria: e.target.value})} className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none">
            <option value="">Categoria...</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="__new">+ Nuova categoria</option>
          </select>
          {newItem.categoria === "__new" && (
            <input placeholder="Nome nuova categoria" onChange={(e) => setNewItem({...newItem, categoria: e.target.value})} className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
          )}
          <input value={newItem.voce} onChange={(e) => setNewItem({...newItem, voce: e.target.value})} placeholder="Nome voce" className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
          <div className="flex gap-2">
            <select value={newItem.unita} onChange={(e) => setNewItem({...newItem, unita: e.target.value})} className="p-2 border border-orange-200 rounded-lg text-sm focus:outline-none">
              <option value="mq">mq</option>
              <option value="ml">ml</option>
              <option value="mc">mc</option>
              <option value="cad">cad</option>
              <option value="kg">kg</option>
              <option value="ora">ora</option>
            </select>
            <NumberInput allowEmpty value={newItem.costoInterno} onChange={(n) => setNewItem(prev => ({...prev, costoInterno: n}))} placeholder="Costo di acquisto (€)" className="flex-1 p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
            <NumberInput allowEmpty value={newItem.prezzo} onChange={(n) => setNewItem(prev => ({...prev, prezzo: n}))} placeholder="Prezzo di vendita (€)" className="flex-1 p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
          </div>
          <input value={newItem.note} onChange={(e) => setNewItem({...newItem, note: e.target.value})} placeholder="Note (opzionale)" className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-orange-600 font-medium">IVA:</span>
            {ivaOptions.map(v => (
              <button key={v} onClick={() => setNewItem({...newItem, iva: v})} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${newItem.iva === v ? "bg-orange-500 text-white" : "bg-white border border-orange-200 text-orange-600"}`}>{v}%</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600">Aggiungi</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500">Annulla</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca voce o categoria..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-orange-400 focus:outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setSelectedCat("Tutte")} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${selectedCat === "Tutte" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}>
          Tutte
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCat(cat)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${selectedCat === cat ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filtered.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3">
            {editingId === item.id ? (
              <div className="space-y-2">
                  <p className="font-medium text-sm text-gray-800">{item.voce}</p>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400">Costo €</span>
                  <NumberInput value={editValues.costoInterno} onChange={(n) => setEditValues(prev => ({...prev, costoInterno: n}))} className="w-20 p-1 border border-orange-300 rounded text-sm text-center focus:outline-none" />
                  <span className="text-xs text-gray-400">→ Prezzo €</span>
                  <NumberInput value={editValues.prezzo} onChange={(n) => setEditValues(prev => ({...prev, prezzo: n}))} className="w-20 p-1 border border-orange-300 rounded text-sm text-center focus:outline-none" />
                  <span className="text-xs text-gray-400">/{item.unita}</span>
                  <div className="ml-auto flex gap-1">
                    <button onClick={() => saveEdit(item.id)} className="p-1 bg-green-500 text-white rounded"><Check size={14} /></button>
                    <button onClick={() => setEditingId(null)} className="p-1 bg-gray-300 text-white rounded"><X size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">IVA:</span>
                  {ivaOptions.map(v => (
                    <button key={v} onClick={() => setEditValues({...editValues, iva: v})} className={`px-2 py-0.5 rounded text-xs font-medium transition ${editValues.iva === v ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"}`}>{v}%</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-800">{item.voce}</p>
                  <p className="text-xs text-gray-400">{item.categoria} · {item.note} · <span className="text-orange-500">IVA {item.iva ?? 22}%</span></p>
                  <p className="text-xs text-gray-500 mt-1">Costo: €{item.costoInterno} → Vendita: €{item.prezzo} · Margine: {item.prezzo > 0 ? ((item.prezzo-item.costoInterno)/item.prezzo*100).toFixed(0) : 0}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(item)} className="p-1 text-gray-400 hover:text-orange-500"><Edit3 size={14} /></button>
                  <button onClick={() => deleteItem(item.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ClientForm spostato FUORI dal componente per evitare re-render e perdita focus
function ClientForm({ values, onChange, onSave, onCancel, saveLabel }) {
  return (
    <div className="space-y-2">
      <select value={values.tipo} onChange={(e) => onChange({ ...values, tipo: e.target.value })} className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none bg-white">
        <option value="Privato">Privato</option>
        <option value="Azienda">Azienda</option>
      </select>
      <input value={values.nome} onChange={(e) => onChange({ ...values, nome: e.target.value })} placeholder={values.tipo === "Azienda" ? "Ragione Sociale *" : "Nome Completo *"} className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
      <input value={values.codiceFiscale} onChange={(e) => onChange({ ...values, codiceFiscale: e.target.value })} placeholder={values.tipo === "Azienda" ? "P.IVA *" : "Codice Fiscale *"} className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
      <input type="email" value={values.email} onChange={(e) => onChange({ ...values, email: e.target.value })} placeholder="Email *" className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
      <input value={values.whatsapp} onChange={(e) => onChange({ ...values, whatsapp: e.target.value })} placeholder="Numero WhatsApp *" className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
      <input value={values.indirizzo} onChange={(e) => onChange({ ...values, indirizzo: e.target.value })} placeholder="Indirizzo *" className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
      <textarea value={values.note} onChange={(e) => onChange({ ...values, note: e.target.value })} placeholder="Aggiungi note..." className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none resize-none h-20" />
      <div className="flex gap-2">
        <button onClick={onSave} className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600">{saveLabel}</button>
        <button onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500">Annulla</button>
      </div>
    </div>
  );
}

function ClientDatabase({ clients, setClients }) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const emptyClient = { tipo: "Privato", nome: "", codiceFiscale: "", email: "", whatsapp: "", indirizzo: "", note: "" };
  const [newClient, setNewClient] = useState({ ...emptyClient });

  const filtered = clients.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.whatsapp.includes(search)
  );

  const addClient = () => {
    if (!newClient.nome.trim() || !newClient.codiceFiscale.trim() || !newClient.email.trim() || !newClient.whatsapp.trim() || !newClient.indirizzo.trim()) {
      alert("Compila tutti i campi obbligatori (Nome, Codice Fiscale/P.IVA, Email, WhatsApp, Indirizzo)");
      return;
    }
    setClients([...clients, { ...newClient, id: Date.now() }]);
    setNewClient({ ...emptyClient });
    setShowAdd(false);
  };

  const startEdit = (client) => {
    setEditingId(client.id);
    setEditValues({ ...client });
  };

  const saveEdit = () => {
    if (!editValues.nome.trim() || !editValues.codiceFiscale.trim() || !editValues.email.trim() || !editValues.whatsapp.trim() || !editValues.indirizzo.trim()) {
      alert("Compila tutti i campi obbligatori");
      return;
    }
    setClients(clients.map(c => c.id === editingId ? { ...editValues } : c));
    setEditingId(null);
  };

  const deleteClient = (id) => {
    setClients(clients.filter(c => c.id !== id));
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:max-w-4xl md:mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">Database Clienti</h2>
          <p className="text-gray-400 text-xs">{clients.length} clienti</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-orange-500 text-white p-2 rounded-xl hover:bg-orange-600 transition">
          <UserPlus size={18} />
        </button>
      </div>

      {showAdd && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-orange-800">Nuovo cliente</p>
          <ClientForm values={newClient} onChange={setNewClient} onSave={addClient} onCancel={() => setShowAdd(false)} saveLabel="Aggiungi" />
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca per nome, email o telefono..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-orange-400 focus:outline-none" />
      </div>

      {filtered.length === 0 && !showAdd && (
        <div className="text-center py-8">
          <Users size={40} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-medium">{clients.length === 0 ? "Nessun cliente" : "Nessun risultato"}</p>
          <p className="text-gray-400 text-xs mt-1">{clients.length === 0 ? "Aggiungi il primo cliente con il +" : "Prova con un'altra ricerca"}</p>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filtered.map(client => (
          <div key={client.id} className="bg-white border border-gray-200 rounded-xl p-3">
            {editingId === client.id ? (
              <ClientForm values={editValues} onChange={setEditValues} onSave={saveEdit} onCancel={() => setEditingId(null)} saveLabel="Salva" />
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${client.tipo === "Azienda" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {client.tipo}
                    </div>
                    <p className="font-medium text-gray-800 text-sm">{client.nome}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(client)} className="p-1 text-gray-400 hover:text-orange-500"><Edit3 size={14} /></button>
                    <button onClick={() => deleteClient(client.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="mt-1.5 space-y-0.5">
                  {client.codiceFiscale && <p className="text-xs text-gray-400">{client.tipo === "Azienda" ? "P.IVA" : "CF"}: {client.codiceFiscale}</p>}
                  {client.email && <p className="text-xs text-gray-400">{client.email}</p>}
                  {client.whatsapp && <p className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10} /> {client.whatsapp}</p>}
                  {client.indirizzo && <p className="text-xs text-gray-400">{client.indirizzo}</p>}
                  {client.note && <p className="text-xs text-gray-500 bg-gray-50 rounded p-1.5 mt-1">{client.note}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== SHARE / INOLTRA PREVENTIVO ==========
function PricingPage({ onSubscribe, onLogout, onBack, userEmail }) {
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("pro");

  const handleSubmit = async () => {
    if (selectedPlan === "custom") {
      window.open("https://calendar.app.google/ymhcaEWt46ew6yDV9", "_blank");
      return;
    }
    setPromoError("");
    setLoading(true);
    const result = await onSubscribe(promoCode.toUpperCase(), selectedPlan);
    if (result?.error) {
      setPromoError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Preventivo Intelligente</h1>
        <p className="text-center text-gray-500 mb-6">Scegli il piano adatto a te</p>

        {/* Pro Mensile - ARANCIONE */}
        <div
          onClick={() => setSelectedPlan("pro")}
          className={"bg-white rounded-2xl shadow-lg p-6 mb-4 cursor-pointer border-2 transition " + (selectedPlan === "pro" ? "border-orange-500 ring-2 ring-orange-200" : "border-gray-200 hover:border-orange-300")}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Pro Mensile</h2>
              <p className="text-sm text-gray-500">Per imprenditori edili</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">€47</p>
              <p className="text-xs text-gray-400">/mese</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 mb-3">
            <li>✓ Preventivi illimitati con AI</li>
            <li>✓ Database prezzi personalizzato</li>
            <li>✓ Gestione clienti</li>
            <li>✓ Esportazione PDF professionale</li>
            <li>✓ Costi fissi e margini automatici</li>
            <li>✓ Supporto 7 giorni su 7</li>
            <li>✓ Invio rapido via WhatsApp ed Email</li>
          </ul>
          <div className="mt-3 mb-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
            <span className="text-green-700 font-bold text-sm">🎉 I primi 14 giorni sono GRATIS!</span>
            <p className="text-green-600 text-xs mt-1">Nessun addebito durante il periodo di prova</p>
          </div>
        </div>

        {/* Pro Annuale - VERDE */}
        <div
          onClick={() => setSelectedPlan("annual")}
          className={"bg-white rounded-2xl shadow-lg p-6 mb-4 cursor-pointer border-2 transition relative " + (selectedPlan === "annual" ? "border-green-500 ring-2 ring-green-200" : "border-gray-200")}
        >
          <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">RISPARMIA 47%</div>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Pro Annuale</h3>
              <p className="text-gray-500 text-sm">Per imprenditori edili</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">€297</p>
              <p className="text-gray-500 text-sm">/anno</p>
              <p className="text-gray-400 text-xs line-through">€564/anno</p>
            </div>
          </div>
          <p className="text-green-600 text-sm font-semibold mb-3">Solo €24,75/mese invece di €47/mese</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✔ Tutto quello del Pro Mensile</li>
            <li>✔ Risparmio di €267 all'anno</li>
            <li>✔ Supporto prioritario</li>
          </ul>
        </div>

        {/* Piano Custom - BLU */}
        <div
          onClick={() => setSelectedPlan("custom")}
          className={"bg-white rounded-2xl shadow-lg p-6 mb-4 cursor-pointer border-2 transition " + (selectedPlan === "custom" ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-300")}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Abbonamento Custom</h2>
              <p className="text-sm text-gray-500">Per aziende che vogliono un software su misura</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">Su misura</p>
              <p className="text-xs text-gray-400">prezzo personalizzato</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 mb-3">
            <li>✓ Tutte le funzionalità del Pro Mensile</li>
            <li>✓ Software completamente personalizzato</li>
            <li>✓ Flussi di lavoro su misura per la tua azienda</li>
            <li>✓ Supporto dedicato e prioritario</li>
            <li>✓ Integrazioni personalizzate</li>
          </ul>
          {selectedPlan === "custom" && (
            <div className="border-t pt-4 mt-2">
              <div className="bg-blue-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-blue-700">📞 Prenota una chiamata gratuita con il nostro team per discutere le tue esigenze e ricevere un preventivo personalizzato.</p>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Prenota una Chiamata Gratuita
              </button>
            </div>
          )}
        </div>


          {(selectedPlan === "pro" || selectedPlan === "annual") && (
            <div className="border-t pt-4 mt-2">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Codice Promo (opzionale)</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Es: PROVA14"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
              >
                {loading ? "Reindirizzamento a Stripe..." : promoCode ? "Inizia la Prova Gratuita" : (selectedPlan === "annual" ? "Inizia 14 Giorni Gratis - €297/anno" : "Inizia 14 Giorni Gratis - €47/mese")}
              </button>
              <p className="text-xs text-center text-gray-400 mt-2">
                {promoCode ? "Il codice verrà verificato all'attivazione" : "Pagamento sicuro tramite Stripe"}
              </p>
            </div>
          )}        <div className="flex justify-between mt-4">
          <button onClick={onLogout} className="text-sm text-gray-400 hover:text-gray-600">Logout</button>
          {onBack && <button onClick={onBack} className="text-sm text-blue-500 hover:text-blue-700">Indietro</button>}
        </div>
      </div>
    </div>
  );
}

function ShareButton({ quote, onDownloadPDF, onGeneratePDFBlob }) {
  const [showOptions, setShowOptions] = useState(false);

  const buildMessage = () => {
    const nomeCliente = quote.clientInfo?.nome || quote.cliente || "Cliente";
    return `Salve ${nomeCliente}! Come anticipato durante il nostro sopralluogo, le invio in allegato il preventivo dettagliato per gli interventi di cui abbiamo discusso.`;
  };

  const handleWhatsApp = async () => {
    const msg = buildMessage();
    const numero = quote.clientInfo?.telefono || quote.clientInfo?.whatsapp || "";
    const cleanNum = numero.replace(/\D/g, "");

    // Try Web Share API with PDF file (mobile + some desktop)
    if (navigator.share && onGeneratePDFBlob) {
      try {
        const blob = await onGeneratePDFBlob(quote);
        const nomeFile = "Preventivo_" + (quote.cliente || "Cliente").replace(/\s+/g, "_") + ".pdf";
        const file = new File([blob], nomeFile, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ text: msg, files: [file] });
          return;
        }
      } catch(e) { console.log("Web Share fallback", e); }
    }

    // Fallback: download PDF + WhatsApp text
    if (onDownloadPDF) onDownloadPDF(quote);
    setTimeout(() => {
      const encodedMsg = encodeURIComponent(msg);
      const url = cleanNum ? `https://wa.me/${cleanNum}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
      window.open(url, "_blank");
    }, 1500);
  };  const handleEmail = () => {
    if (onDownloadPDF) onDownloadPDF(quote);
    setTimeout(() => {
      const nomeCliente = quote.clientInfo?.nome || quote.cliente || "Cliente";
      const subject = encodeURIComponent(`Preventivo - ${nomeCliente}`);
      const body = encodeURIComponent(buildMessage());
      const email = quote.clientInfo?.email || "";
      window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
    }, 1000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
      >
        <Send size={18} />
        Inoltra preventivo
      </button>
      {showOptions && (
        <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition text-left"
          >
            <div className="bg-green-100 p-2 rounded-lg">
              <MessageCircle size={18} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">WhatsApp</p>
              <p className="text-gray-400 text-xs">Invia tramite WhatsApp</p>
            </div>
          </button>
          <button
            onClick={handleEmail}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition text-left border-t border-gray-100"
          >
            <div className="bg-blue-100 p-2 rounded-lg">
              <Mail size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">Email</p>
              <p className="text-gray-400 text-xs">Invia tramite Email</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

function QuoteDetailView({ quote, onBack, onDownloadPDF, onEdit, onDuplicate }) {
  const subtotale = quote.subtotale || quote.items?.reduce((sum, item) => sum + item.quantita * item.prezzo, 0) || 0;
  const importoMargine = quote.importoMargine || 0;
  const importoSconto = quote.importoSconto || 0;
  const marginEnabled = quote.margin?.enabled || false;
  const marginPerc = quote.margin?.valore || quote.margin?.percentuale || 0;
  const marginTipo = quote.margin?.tipo || "percentuale";
  const discountValore = quote.discount?.valore || 0;
  const discountTipo = quote.discount?.tipo || "percentuale";
  const subtotaleConMargine = subtotale + importoMargine;
  const subtotaleScontato = Math.max(0, subtotaleConMargine - importoSconto);

  // IVA mista
  const ivaPerAliquota = {};
  (quote.items || []).forEach(item => {
    const aliquota = item.iva ?? 22;
    const importoVoce = item.quantita * item.prezzo;
    if (!ivaPerAliquota[aliquota]) ivaPerAliquota[aliquota] = 0;
    ivaPerAliquota[aliquota] += importoVoce;
  });
  const proporzione = subtotale > 0 ? subtotaleScontato / subtotale : 1;
  let ivaTotal = 0;
  const ivaDettaglio = Object.entries(ivaPerAliquota).map(([aliq, base]) => {
    const baseRiproporzionata = base * proporzione;
    const importoIva = baseRiproporzionata * (parseFloat(aliq) / 100);
    ivaTotal += importoIva;
    return { aliquota: parseFloat(aliq), base: baseRiproporzionata, importo: importoIva };
  }).sort((a, b) => a.aliquota - b.aliquota);

  const totale = quote.totale || subtotaleScontato + ivaTotal;

  return (
    <div className="p-4 md:p-8 space-y-4 md:max-w-2xl md:mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div>
          <h2 className="font-bold text-gray-800 text-lg">Dettaglio Preventivo</h2>
          <p className="text-gray-400 text-xs">{quote.data}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-1">
        <p className="text-xs text-gray-400 font-medium">CLIENTE</p>
        <p className="font-semibold text-gray-800">{quote.cliente || "Cliente senza nome"}</p>
        {quote.clientInfo?.indirizzo && <p className="text-gray-500 text-sm">{quote.clientInfo.indirizzo}</p>}
        {quote.clientInfo?.telefono && <p className="text-gray-500 text-sm">{quote.clientInfo.telefono}</p>}
      </div>

      {quote.descrizione && (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">DESCRIZIONE LAVORO</p>
          <p className="text-gray-600 text-sm">{quote.descrizione}</p>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-gray-400 font-medium px-1">VOCI PREVENTIVO ({quote.items?.length || 0})</p>
        {quote.items?.map((item, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.voce}</p>
                <p className="text-gray-400 text-xs">{item.categoria}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <span>{item.quantita} {item.unita}</span>
              <span className="text-gray-300">×</span>
              <span>€ {item.prezzo.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-gray-300">=</span>
              <span className="font-semibold text-gray-800 ml-auto">
                € {(item.quantita * item.prezzo).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotale voci</span>
          <span>€ {subtotale.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        {marginEnabled && importoMargine > 0 && (
          <div className="flex justify-between text-sm text-blue-600">
            <span>Margine {marginTipo === "percentuale" ? `(${marginPerc}%)` : "fisso"}</span>
            <span>+ € {importoMargine.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
        {discountValore > 0 && importoSconto > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Sconto {discountTipo === "percentuale" ? `(${discountValore}%)` : "fisso"}</span>
            <span>- € {importoSconto.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
        {(marginEnabled || (discountValore > 0 && importoSconto > 0)) && (
          <div className="flex justify-between text-sm text-gray-600 border-t border-gray-200 pt-1">
            <span>Imponibile</span>
            <span>€ {subtotaleScontato.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
        {ivaDettaglio.map((d, i) => (
          <div key={i} className="flex justify-between text-sm text-gray-600">
            <span>IVA {d.aliquota}%</span>
            <span>€ {d.importo.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
          <span>TOTALE</span>
          <span className="text-orange-600 text-lg">€ {totale.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {quote.costoTotaleInterno !== undefined && (
        <div className={`rounded-xl p-4 space-y-2 border-2 ${(subtotaleScontato - quote.costoTotaleInterno) >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-2">
            <Eye size={18} className={(subtotaleScontato - quote.costoTotaleInterno) >= 0 ? "text-green-600" : "text-red-600"} />
            <p className={`text-sm font-semibold ${(subtotaleScontato - quote.costoTotaleInterno) >= 0 ? "text-green-800" : "text-red-800"}`}>IL TUO MARGINE</p>
          </div>
          <p className="text-xs text-gray-600">(Visibile solo a te - non compare nel PDF)</p>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Costo totale interno</span>
              <span className="font-semibold">€ {quote.costoTotaleInterno.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className={`flex justify-between text-sm font-bold border-t pt-1 ${(subtotaleScontato - quote.costoTotaleInterno) >= 0 ? "text-green-700" : "text-red-700"}`}>
              <span>Margine reale</span>
              <span>€ {(subtotaleScontato - quote.costoTotaleInterno).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className={`text-xs font-medium ${(subtotaleScontato - quote.costoTotaleInterno) >= 0 ? "text-green-600" : "text-red-600"}`}>
              Margine %: {subtotaleScontato > 0 ? ((subtotaleScontato - quote.costoTotaleInterno) / subtotaleScontato * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => onDownloadPDF(quote)}
        className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
      >
        <Download size={18} />
        Scarica PDF
      </button>

      {onEdit && (
        <button
          onClick={() => onEdit(quote)}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
        >
          <Edit3 size={18} />
          Modifica preventivo
        </button>
      )}

      {onDuplicate && (
        <button
          onClick={() => onDuplicate(quote)}
          className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition flex items-center justify-center gap-2"
        >
          <Copy size={18} />
          Duplica preventivo
        </button>
      )}

      <ShareButton quote={quote} onDownloadPDF={onDownloadPDF} />

      <p className="text-center text-xs text-gray-400">
        Preventivo valido 30 giorni dalla data di emissione
      </p>
    </div>
  );
}


// ========== COSTI FISSI ==========
function CostiFissiView({ costiFissi, setCostiFissi }) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ categoria: "", voce: "", importo: "", frequenza: "mensile", note: "" });
  const frequenzaOptions = ["mensile", "annuale"];

  const categories = [...new Set(costiFissi.map(c => c.categoria))];
  const [selectedCat, setSelectedCat] = useState("Tutte");

  const filtered = costiFissi.filter(c => {
    const matchSearch = c.voce.toLowerCase().includes(search.toLowerCase()) || c.categoria.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === "Tutte" || c.categoria === selectedCat;
    return matchSearch && matchCat;
  });

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValues({ importo: item.importo, frequenza: item.frequenza, note: item.note });
  };

  const saveEdit = (id) => {
    setCostiFissi(costiFissi.map(c => c.id === id ? { ...c, ...editValues } : c));
    setEditingId(null);
  };

  const addItem = () => {
    if (newItem.voce && newItem.categoria) {
      setCostiFissi([...costiFissi, { ...newItem, id: Date.now(), importo: parseFloat(newItem.importo) || 0 }]);
      setNewItem({ categoria: "", voce: "", importo: "", frequenza: "mensile", note: "" });
      setShowAdd(false);
    }
  };

  const deleteItem = (id) => {
    setCostiFissi(costiFissi.filter(c => c.id !== id));
  };

  const costoMensile = filtered.reduce((sum, item) => {
    const importoMensile = item.frequenza === "annuale" ? item.importo / 12 : item.importo;
    return sum + importoMensile;
  }, 0);
  const costoAnnuale = costoMensile * 12;
  const costoGiornaliero = costoMensile / 22;

  return (
    <div className="p-4 md:p-8 space-y-4 md:max-w-2xl md:mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">Costi Fissi</h2>
          <p className="text-gray-400 text-xs">{costiFissi.length} voci totali</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-orange-500 text-white p-2 rounded-xl hover:bg-orange-600 transition">
          <Plus size={18} />
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
        <p className="text-green-800 font-semibold text-sm">Riepilogo Costi</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-green-700 text-xs">Mensile</p>
            <p className="text-green-900 font-bold">€ {costoMensile.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-green-700 text-xs">Annuale</p>
            <p className="text-green-900 font-bold">€ {costoAnnuale.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="col-span-2">
            <p className="text-green-700 text-xs">Costo giornaliero (lavorativo)</p>
            <p className="text-green-900 font-bold">€ {costoGiornaliero.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-orange-800">Nuovo costo fisso</p>
          <select value={newItem.categoria} onChange={(e) => setNewItem({...newItem, categoria: e.target.value})} className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none">
            <option value="">Categoria...</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="__new">+ Nuova categoria</option>
          </select>
          {newItem.categoria === "__new" && (
            <input placeholder="Nome nuova categoria" onChange={(e) => setNewItem({...newItem, categoria: e.target.value})} className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
          )}
          <input value={newItem.voce} onChange={(e) => setNewItem({...newItem, voce: e.target.value})} placeholder="Nome voce" className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
          <div className="flex gap-2">
            <NumberInput allowEmpty value={newItem.importo} onChange={(n) => setNewItem(prev => ({...prev, importo: n}))} placeholder="Importo (€)" className="flex-1 p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
            <select value={newItem.frequenza} onChange={(e) => setNewItem({...newItem, frequenza: e.target.value})} className="p-2 border border-orange-200 rounded-lg text-sm focus:outline-none">
              <option value="mensile">Mensile</option>
              <option value="annuale">Annuale</option>
            </select>
          </div>
          <input value={newItem.note} onChange={(e) => setNewItem({...newItem, note: e.target.value})} placeholder="Note (opzionale)" className="w-full p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
          <div className="flex gap-2">
            <button onClick={addItem} className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600">Aggiungi</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500">Annulla</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca voce o categoria..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-orange-400 focus:outline-none" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setSelectedCat("Tutte")} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${selectedCat === "Tutte" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}>
          Tutte
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCat(cat)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${selectedCat === cat ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filtered.map(item => {
          const importoMensile = item.frequenza === "annuale" ? item.importo / 12 : item.importo;
            const importoAnnuale = item.frequenza === "annuale" ? item.importo : item.importo * 12;
          return (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3">
              {editingId === item.id ? (
                <div className="space-y-2">
                  <p className="font-medium text-sm text-gray-800">{item.voce}</p>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400">€</span>
                    <NumberInput value={editValues.importo} onChange={(n) => setEditValues(prev => ({...prev, importo: n}))} className="w-24 p-1 border border-orange-300 rounded text-sm text-center focus:outline-none" />
                    <select value={editValues.frequenza} onChange={(e) => setEditValues({...editValues, frequenza: e.target.value})} className="p-1 border border-orange-300 rounded text-sm focus:outline-none">
                      <option value="mensile">Mensile</option>
                      <option value="annuale">Annuale</option>
                    </select>
                    <div className="ml-auto flex gap-1">
                      <button onClick={() => saveEdit(item.id)} className="p-1 bg-green-500 text-white rounded"><Check size={14} /></button>
                      <button onClick={() => setEditingId(null)} className="p-1 bg-gray-300 text-white rounded"><X size={14} /></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{item.voce}</p>
                    <p className="text-xs text-gray-400">{item.categoria} · {item.note}</p>
                <p className="text-xs text-gray-500 mt-1">€ {importoMensile.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mese (€ {(item.frequenza === "annuale" ? item.importo : item.importo * 12).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/anno)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(item)} className="p-1 text-gray-400 hover:text-orange-500"><Edit3 size={14} /></button>
                    <button onClick={() => deleteItem(item.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function StoricoView({ quotes, onViewQuote, onDeleteQuote }) {
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);

  const toggleSelect = (i) => {
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };
  const toggleAll = () => {
    setSelected(selected.length === quotes.length ? [] : quotes.map((_, i) => i));
  };
  const deleteSelected = () => {
    if (selected.length === 0) return;
    if (!window.confirm("Eliminare " + selected.length + " preventiv" + (selected.length === 1 ? "o" : "i") + " selezionat" + (selected.length === 1 ? "o" : "i") + "?")) return;
    const sorted = [...selected].sort((a, b) => b - a);
    sorted.forEach(i => onDeleteQuote(quotes[i], i));
    setSelected([]);
    setSelectMode(false);
  };
  const exitSelectMode = () => { setSelectMode(false); setSelected([]); };

  if (quotes.length === 0) {
    return (
      <div className="p-4 text-center py-12">
        <FileText size={48} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Nessun preventivo creato</p>
        <p className="text-gray-400 text-sm mt-1">I preventivi generati appariranno qui</p>
      </div>
    );
  }
  return (
    <div className="p-4 md:p-8 space-y-3 md:max-w-3xl md:mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800 text-lg">Storico Preventivi</h2>
        <button onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)} className={"text-xs font-medium px-3 py-1 rounded-lg transition " + (selectMode ? "bg-gray-200 text-gray-700" : "bg-orange-100 text-orange-600")}>
          {selectMode ? "Annulla" : "Seleziona"}
        </button>
      </div>
      {selectMode && (
        <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
          <button onClick={toggleAll} className="text-xs font-medium text-orange-700">
            {selected.length === quotes.length ? "Deseleziona tutto" : "Seleziona tutto"}
          </button>
          <button onClick={deleteSelected} disabled={selected.length === 0} className={"text-xs font-medium px-3 py-1 rounded-lg transition " + (selected.length > 0 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-400")}>
            Elimina ({selected.length})
          </button>
        </div>
      )}
      {quotes.map((q, i) => (
        <div key={i} onClick={() => selectMode ? toggleSelect(i) : onViewQuote(q, i)} className={"w-full text-left bg-white border rounded-xl p-4 hover:shadow-md transition cursor-pointer " + (selectMode && selected.includes(i) ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300")}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {selectMode && (
                <div className={"w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 " + (selected.includes(i) ? "bg-orange-500 border-orange-500" : "border-gray-300")}>
                  {selected.includes(i) && <Check size={12} className="text-white" />}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-800">{q.cliente || "Cliente senza nome"}</p>
                <p className="text-gray-400 text-xs mt-1">{q.data}</p>
              </div>
            </div>
            <span className="font-bold text-orange-600">€ {q.totale.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-500 text-xs">{q.voci} voci · {q.descrizione?.substring(0, 50)}...</p>
            {!selectMode && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-orange-500 text-xs font-medium">
                  <Eye size={12} />
                  <span>Apri</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Eliminare questo preventivo?")) onDeleteQuote(q, i); }} className="text-red-400 hover:text-red-600 transition p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function NuovoPreventivo({ prices, clients, quotes, onSaveQuote, onNavigate, onDownloadPDF, initialData, userProfile, onAddPrice, onRememberMatch, onUpdateClient }) {
  const isEditing = !!initialData;

  // Scadenza: default 30 giorni da oggi
  const defaultScadenza = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  };

  const [step, setStep] = useState(isEditing ? "edit" : "voice");
  const [items, setItems] = useState(isEditing ? (initialData.items || []) : []);
  const [transcript, setTranscript] = useState(isEditing ? (initialData.descrizione || "") : "");
  const [clientInfo, setClientInfo] = useState(isEditing ? (initialData.clientInfo || { nome: "", indirizzo: "", telefono: "" }) : { nome: "", indirizzo: "", telefono: "" });
  const [error, setError] = useState("");
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMode, setLoadingMode] = useState("voce");
  const loadingIntervalRef = useRef(null);
  const [isModifyRecording, setIsModifyRecording] = useState(false);
  const [modifyTranscript, setModifyTranscript] = useState("");
  const modifyRecognitionRef = useRef(null);
  const [discount, setDiscount] = useState(isEditing ? (initialData.discount || { enabled: false, tipo: "percentuale", valore: 0 }) : { enabled: false, tipo: "percentuale", valore: 0 });
  const [margin, setMargin] = useState(isEditing ? (initialData.margin || { enabled: false, tipo: "percentuale", valore: 20 }) : { enabled: false, tipo: "percentuale", valore: 20 });
  const [lastSavedQuote, setLastSavedQuote] = useState(null);
  const [scadenza, setScadenza] = useState(isEditing ? (initialData.scadenza || defaultScadenza()) : defaultScadenza());
  const [pagamento, setPagamento] = useState(isEditing ? (initialData.pagamento || [
    { fase: "Anticipo alla conferma", percentuale: 35 },
    { fase: "Metà lavori", percentuale: 35 },
    { fase: "Fine lavori", percentuale: 30 },
  ]) : [
    { fase: "Anticipo alla conferma", percentuale: 35 },
    { fase: "Metà lavori", percentuale: 35 },
    { fase: "Fine lavori", percentuale: 30 },
  ]);
  const [photos, setPhotos] = useState(isEditing ? (initialData.photos || []) : []);
  const [descrizione, setDescrizione] = useState(isEditing ? (initialData.descrizione || "") : "");
  const [firmaImpresa, setFirmaImpresa] = useState(isEditing ? (initialData.firmaImpresa || "") : (userProfile?.nomeAzienda || ""));
  const [luogoFirma, setLuogoFirma] = useState(isEditing ? (initialData.luogoFirma || "") : (""));

const startModifyRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Il tuo browser non supporta il riconoscimento vocale.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "it-IT";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setModifyTranscript(finalTranscript);
    };

    recognition.onerror = () => {
      setIsModifyRecording(false);
    };

    modifyRecognitionRef.current = recognition;
    recognition.start();
    setIsModifyRecording(true);
    setModifyTranscript("");
  };

  const stopModifyRecording = async () => {
    if (modifyRecognitionRef.current) {
      modifyRecognitionRef.current.stop();
    }
    setIsModifyRecording(false);
    
    if (!modifyTranscript.trim()) return;
    
    setIsAIProcessing(true);
    setError("");
    try {
      const response = await fetch('/api/modifyQuote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: modifyTranscript.trim(),
          currentItems: items,
          priceDB: prices
        })
      });
      const data = await response.json();
      if (data.items) {
        setItems(data.items);
        setModifyTranscript("");
      } else {
        setError("Errore nella modifica. Riprova.");
      }
    } catch (err) {
      console.error('Errore modifica vocale:', err);
      setError("Errore di connessione. Riprova.");
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleTranscript = async (text) => {
    setTranscript(text);
    setDescrizione(text);
    setError("");
    setIsAIProcessing(true);
    setLoadingProgress(0);
    setStep("loading");

    // Start progress animation (reaches ~90% in 10 seconds)
    let progress = 0;
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    loadingIntervalRef.current = setInterval(() => {
      progress += 1;
      if (progress <= 90) {
        setLoadingProgress(progress);
      }
    }, 110);

    try {
      const result = await parseVoiceToQuote(text, prices, quotes);
      // Complete the progress bar
      clearInterval(loadingIntervalRef.current);
      setLoadingProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (result) {
        setItems(result);
        setStep("edit");
        setError("");
      } else {
        setStep("voice");
        setError("L'AI non ha trovato materiali corrispondenti. Prova ad essere piu' specifico (es: 'ristrutturazione bagno 15mq', 'impianto elettrico appartamento 80mq').");
      }
    } catch (err) {
      console.error('Errore:', err);
      clearInterval(loadingIntervalRef.current);
      setStep("voice");
      setError("Errore nella selezione dei materiali. Riprova.");
    } finally {
      setIsAIProcessing(false);
      setLoadingProgress(0);
    }
  };

  const handleComputo = async (files) => {
    if (!files.length) return;
    const supportati = files.filter(f => ["application/pdf", "image/jpeg", "image/png"].includes(f.type) || /\.(pdf|jpe?g|png)$/i.test(f.name));
    if (supportati.length !== files.length) {
      setError("Formato non supportato: carica solo file PDF, JPG, JPEG o PNG.");
      return;
    }
    setError("");
    setIsAIProcessing(true);
    setLoadingMode("computo");
    setLoadingProgress(0);
    setStep("loading");

    let progress = 0;
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    loadingIntervalRef.current = setInterval(() => {
      progress += 1;
      if (progress <= 90) {
        setLoadingProgress(progress);
      }
    }, 500);

    try {
      const { items: vociComputo, oggetto } = await computoToQuote(supportati, prices);
      clearInterval(loadingIntervalRef.current);
      setLoadingProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      const testo = oggetto || "Lavori come da computo metrico allegato.";
      setTranscript(testo);
      setDescrizione(testo);
      setItems(vociComputo);
      setStep("edit");
    } catch (err) {
      console.error("Errore computo metrico:", err);
      clearInterval(loadingIntervalRef.current);
      setStep("voice");
      setError(err.message || "Errore nella lettura del computo. Riprova.");
    } finally {
      setIsAIProcessing(false);
      setLoadingProgress(0);
      setLoadingMode("voce");
    }
  };

  const handleGeneratePDF = () => {
    const subtotale = items.reduce((sum, item) => sum + item.quantita * item.prezzo, 0);
    const importoMargine = margin.enabled
      ? (margin.tipo === "percentuale" ? subtotale * (margin.valore / 100) : margin.valore)
      : 0;
    const subtotaleConMargine = subtotale + importoMargine;
    const importoSconto = discount.enabled
      ? (discount.tipo === "percentuale"
        ? subtotaleConMargine * (discount.valore / 100)
        : discount.valore)
      : 0;
    const subtotaleScontato = Math.max(0, subtotaleConMargine - importoSconto);

    // IVA mista
    const proporzione = subtotale > 0 ? subtotaleScontato / subtotale : 1;
    let ivaTotal = 0;
    items.forEach(item => {
      const aliquota = item.iva ?? 22;
      const importoVoce = item.quantita * item.prezzo;
      ivaTotal += (importoVoce * proporzione) * (aliquota / 100);
    });
    const totale = subtotaleScontato + ivaTotal;
    const costoTotaleInterno = items.reduce((sum, item) => sum + (item.costoInterno || 0) * item.quantita, 0);

    const savedQuote = {
      cliente: clientInfo.nome,
      data: new Date().toLocaleDateString("it-IT"),
      totale: totale,
      voci: items.length,
      descrizione: descrizione,
      items: items,
      clientInfo: clientInfo,
      discount: discount,
      margin: margin,
      subtotale: subtotale,
      importoMargine: importoMargine,
      importoSconto: importoSconto,
      scadenza: scadenza,
      pagamento: pagamento,
      photos: photos,
      firmaImpresa: firmaImpresa,
      luogoFirma: luogoFirma,
        costoTotaleInterno: costoTotaleInterno
    };

    onSaveQuote(savedQuote);
    setLastSavedQuote(savedQuote);
    setStep("done");
  };

  return (
    <div className="p-4 md:p-8 md:max-w-3xl md:mx-auto">
      {step === "voice" && (
        <div className="space-y-4">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Nuovo Preventivo</h2>
            <p className="text-gray-400 text-sm">Descrivi il lavoro a voce o per scritto, oppure carica un computo metrico</p>
          </div>
          <VoiceRecorder onTranscriptComplete={handleTranscript} />
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex-1 border-t border-gray-200"></div>
            oppure
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
          <label className="w-full bg-white border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition rounded-2xl p-4 flex items-center gap-4 cursor-pointer">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Upload size={24} className="text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Carica computo metrico</p>
              <p className="text-gray-400 text-xs">PDF, JPG, JPEG o PNG: l'AI abbina ogni voce ai tuoi prezzi</p>
            </div>
            <ChevronRight size={18} className="ml-auto text-gray-400" />
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                e.target.value = "";
                handleComputo(files);
              }}
            />
          </label>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
      )}


          {step === "loading" && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "400px",
              gap: "24px",
              padding: "40px 20px"
            }}>
              <div style={{
                width: "80px",
                height: "80px",
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #f59e0b",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <h3 style={{ color: "#1f2937", fontSize: "20px", fontWeight: "600", margin: 0 }}>
                L'AI sta generando il preventivo...
              </h3>
              <div style={{ width: "100%", maxWidth: "400px" }}>
                <div style={{
                  width: "100%",
                  height: "12px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "6px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: loadingProgress + "%",
                    height: "100%",
                    backgroundColor: "#f59e0b",
                    borderRadius: "6px",
                    transition: "width 0.3s ease"
                  }} />
                </div>
                <p style={{
                  textAlign: "center",
                  marginTop: "12px",
                  color: "#6b7280",
                  fontSize: "14px"
                }}>
                  {loadingProgress < 100
                    ? "Analisi in corso... " + Math.round(loadingProgress) + "%"
                    : "Completato! Preparazione preventivo..."}
                </p>
              </div>
              <p style={{ color: "#9ca3af", fontSize: "13px", maxWidth: "350px", textAlign: "center" }}>
                {loadingMode === "computo"
                  ? "Stiamo leggendo il computo metrico e abbinando ogni voce ai prezzi del tuo listino. Può richiedere fino a un minuto."
                  : "Stiamo analizzando la tua descrizione e selezionando i materiali piu' adatti dal nostro listino."}
              </p>
            </div>
          )}
      {step === "edit" && (
        <QuoteEditor
          items={items}
          setItems={setItems}
          clientInfo={clientInfo}
          setClientInfo={setClientInfo}
          onGeneratePDF={handleGeneratePDF}
          onBack={() => setStep("voice")}
          transcript={transcript}
          discount={discount}
          setDiscount={setDiscount}
          margin={margin}
          setMargin={setMargin}
          clients={clients}
          scadenza={scadenza}
          setScadenza={setScadenza}
          pagamento={pagamento}
          setPagamento={setPagamento}
          photos={photos}
          setPhotos={setPhotos}
          prices={prices}
          descrizione={descrizione}
          setDescrizione={setDescrizione}
          firmaImpresa={firmaImpresa}
          setFirmaImpresa={setFirmaImpresa}
          luogoFirma={luogoFirma}
          setLuogoFirma={setLuogoFirma}
          isEditing={isEditing}
          onSaveOnly={isEditing ? () => { handleGeneratePDF(); } : null}
          onNavigate={onNavigate}
            isAIProcessing={isAIProcessing}
            isModifyRecording={isModifyRecording}
            modifyTranscript={modifyTranscript}
            startModifyRecording={startModifyRecording}
            stopModifyRecording={stopModifyRecording}
            onAddPrice={onAddPrice}
            onRememberMatch={onRememberMatch}
            onUpdateClient={onUpdateClient}
        />
      )}

      {step === "done" && (
        <div className="text-center py-12 space-y-4">
          <div className="bg-green-100 p-4 rounded-full inline-block">
            <Check size={36} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Preventivo Salvato!</h3>
          <p className="text-gray-500 text-sm">Il preventivo è stato salvato nello storico. Puoi scaricarlo come PDF, inoltrarlo al cliente o crearne un altro.</p>
          <div className="space-y-2 pt-4">
            {lastSavedQuote && (
              <button onClick={() => onDownloadPDF(lastSavedQuote)} className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                <Download size={18} />
                Scarica PDF
              </button>
            )}
            {lastSavedQuote && (
              <ShareButton quote={lastSavedQuote} onDownloadPDF={onDownloadPDF} />
            )}
            <button onClick={() => { setStep("voice"); setItems([]); setTranscript(""); setClientInfo({ nome: "", indirizzo: "", telefono: "" }); setDiscount({ enabled: false, tipo: "percentuale", valore: 0 }); setMargin({ enabled: false, tipo: "percentuale", valore: 20 }); setScadenza(defaultScadenza()); setPagamento([{fase:"Anticipo alla conferma",percentuale:35},{fase:"Metà lavori",percentuale:35},{fase:"Fine lavori",percentuale:30}]); setPhotos([]); setDescrizione(""); setFirmaImpresa(""); setLuogoFirma(""); setLastSavedQuote(null); }} className="w-full bg-white border-2 border-orange-500 text-orange-500 py-3 rounded-xl font-semibold">
              Crea un altro preventivo
            </button>
            <button onClick={() => onNavigate("home")} className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-medium">
              Torna alla home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== PDF GENERATION ==========
function generatePDF(quote, userProfile, returnBlob = false) {
  const subtotale = quote.subtotale || quote.items?.reduce((sum, item) => sum + item.quantita * item.prezzo, 0) || 0;
  const importoMargine = quote.importoMargine || 0;
  const importoSconto = quote.importoSconto || 0;
  const marginEnabled = quote.margin?.enabled || false;
  const marginPerc = quote.margin?.valore || quote.margin?.percentuale || 0;
  const marginTipo = quote.margin?.tipo || "percentuale";
  const discountValore = quote.discount?.valore || 0;
  const discountTipo = quote.discount?.tipo || "percentuale";
  const subtotaleConMargine = subtotale + importoMargine;
  const subtotaleScontato = Math.max(0, subtotaleConMargine - importoSconto);

  // IVA mista per il PDF
  const ivaPerAliquotaPDF = {};
  (quote.items || []).forEach(item => {
    const aliquota = item.iva ?? 22;
    const importoVoce = item.quantita * item.prezzo;
    if (!ivaPerAliquotaPDF[aliquota]) ivaPerAliquotaPDF[aliquota] = 0;
    ivaPerAliquotaPDF[aliquota] += importoVoce;
  });
  const proporzionePDF = subtotale > 0 ? subtotaleScontato / subtotale : 1;
  let ivaTotalPDF = 0;
  const ivaDettaglioPDF = Object.entries(ivaPerAliquotaPDF).map(([aliq, base]) => {
    const baseR = base * proporzionePDF;
    const imp = baseR * (parseFloat(aliq) / 100);
    ivaTotalPDF += imp;
    return { aliquota: parseFloat(aliq), importo: imp };
  }).sort((a, b) => a.aliquota - b.aliquota);

  const totale = quote.totale || subtotaleScontato + ivaTotalPDF;
  const fmt = (n) => n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const grouped = {};
  (quote.items || []).forEach(item => {
    if (!grouped[item.categoria]) grouped[item.categoria] = [];
    grouped[item.categoria].push(item);
  });

  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const fmtQ = (n) => Number(n || 0).toLocaleString("it-IT", { maximumFractionDigits: 2 });
  // html2canvas non adatta il testo al contenitore: stima ~0,58em per carattere del corsivo per stare in 270px su una riga.
  const dimensioneFirma = (testo) => Math.max(12, Math.min(28, Math.floor(270 / Math.max(1, String(testo).trim().length * 0.58))));

  // html2pdf taglia un'unica immagine in pagine: le righe sono div con classe pdf-avoid perché le spinga intere alla pagina dopo (con <tr> non funziona).
  const colonne = [
    { stile: "flex:1;min-width:0;padding:8px 12px;text-align:left;" },
    { stile: "width:58px;padding:8px 6px;text-align:center;" },
    { stile: "width:54px;padding:8px 6px;text-align:center;" },
    { stile: "width:92px;padding:8px 6px;text-align:right;white-space:nowrap;" },
    { stile: "width:46px;padding:8px 6px;text-align:center;" },
    { stile: "width:104px;padding:8px 12px 8px 6px;text-align:right;white-space:nowrap;" },
  ];
  const rigaVoce = (item) => `<div style="display:flex;align-items:center;border-bottom:1px solid #F3F4F6;font-size:12px;">
        <div style="${colonne[0].stile}color:#374151;overflow-wrap:anywhere;">${esc(item.voce)}</div>
        <div style="${colonne[1].stile}color:#6B7280;">${fmtQ(item.quantita)}</div>
        <div style="${colonne[2].stile}color:#6B7280;">${esc(item.unita)}</div>
        <div style="${colonne[3].stile}color:#6B7280;">€ ${fmt(item.prezzo)}</div>
        <div style="${colonne[4].stile}color:#6B7280;">${item.iva ?? 22}%</div>
        <div style="${colonne[5].stile}color:#1F2937;font-weight:600;">€ ${fmt(item.quantita * item.prezzo)}</div>
      </div>`;

  let tableRows = "";
  Object.entries(grouped).forEach(([cat, items]) => {
    const intestazione = `<div style="background:#FFF7ED;padding:8px 12px;font-weight:700;color:#EA580C;font-size:13px;border-bottom:1px solid #FED7AA;">${esc(cat)}</div>`;
    tableRows += `<div class="pdf-avoid">${intestazione}${items[0] ? rigaVoce(items[0]) : ""}</div>`;
    items.slice(1).forEach(item => {
      tableRows += `<div class="pdf-avoid">${rigaVoce(item)}</div>`;
    });
  });

  // Righe a blocchi (non griglia): lo spazio che html2pdf inserisce prima di una riga pdf-avoid in una griglia diventerebbe una cella vuota.
  const fotoPdf = (quote.photos || []).filter(p => p.data);
  const cellaFoto = (p) => `<div style="flex:1;min-width:0;text-align:center;">${p ? `<img src="${p.data}" style="display:inline-block;max-width:100%;max-height:420px;width:auto;height:auto;border-radius:8px;border:1px solid #E5E7EB;" />` : ""}</div>`;
  const righeFoto = [];
  for (let i = 0; i < fotoPdf.length; i += 2) {
    righeFoto.push(`<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">${cellaFoto(fotoPdf[i])}${cellaFoto(fotoPdf[i + 1])}</div>`);
  }

  let totaliRows =`<tr><td style="padding:6px 12px;font-size:12px;color:#6B7280;">Subtotale voci</td><td style="padding:6px 12px;font-size:12px;color:#6B7280;text-align:right;">€ ${fmt(subtotale)}</td></tr>`;
  if (marginEnabled && importoMargine > 0) {
    totaliRows += `<tr><td style="padding:6px 12px;font-size:12px;color:#2563EB;">Margine ${marginTipo === "percentuale" ? `(${marginPerc}%)` : "fisso"}</td><td style="padding:6px 12px;font-size:12px;color:#2563EB;text-align:right;">+ € ${fmt(importoMargine)}</td></tr>`;
  }
  if (discountValore > 0 && importoSconto > 0) {
    totaliRows += `<tr><td style="padding:6px 12px;font-size:12px;color:#16A34A;">Sconto ${discountTipo === "percentuale" ? `(${discountValore}%)` : "fisso"}</td><td style="padding:6px 12px;font-size:12px;color:#16A34A;text-align:right;">- € ${fmt(importoSconto)}</td></tr>`;
  }
  if (marginEnabled || (discountValore > 0 && importoSconto > 0)) {
    totaliRows += `<tr><td style="padding:6px 12px;font-size:12px;color:#6B7280;border-top:1px solid #E5E7EB;">Imponibile</td><td style="padding:6px 12px;font-size:12px;color:#6B7280;text-align:right;border-top:1px solid #E5E7EB;">€ ${fmt(subtotaleScontato)}</td></tr>`;
  }
  ivaDettaglioPDF.forEach(d => {
    totaliRows += `<tr><td style="padding:6px 12px;font-size:12px;color:#6B7280;">IVA ${d.aliquota}%</td><td style="padding:6px 12px;font-size:12px;color:#6B7280;text-align:right;">€ ${fmt(d.importo)}</td></tr>`;
  });
  totaliRows += `<tr><td style="padding:10px 12px;font-size:16px;font-weight:700;color:#1F2937;border-top:2px solid #EA580C;">TOTALE</td><td style="padding:10px 12px;font-size:16px;font-weight:700;color:#EA580C;text-align:right;border-top:2px solid #EA580C;">€ ${fmt(totale)}</td></tr>`;

  const aziendaNome = userProfile?.nomeAzienda || "La Tua Azienda";
  const aziendaLogo = userProfile?.logo || "";
  const aziendaPiva = userProfile?.piva || "";
  const aziendaTel = userProfile?.telefono || "";
  const aziendaEmail = userProfile?.email || "";
  const aziendaIndirizzo = userProfile?.indirizzo || "";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Preventivo - ${quote.cliente || "Cliente"}</title>
<style> body { font-family: "Segoe UI", Arial, sans-serif; color: #1F2937; max-width: 800px; margin: 0 auto; padding: 20px; } </style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;border-bottom:3px solid #EA580C;margin-bottom:24px;">
    <div style="display:flex;align-items:center;gap:14px;">
      ${aziendaLogo ? `<img src="${aziendaLogo}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;" />` : ""}
      <div>
        <h1 style="margin:0;font-size:26px;color:#EA580C;font-weight:800;">${aziendaNome.toUpperCase()}</h1>
        ${aziendaPiva ? `<p style="margin:4px 0 0;color:#9CA3AF;font-size:11px;">P.IVA: ${aziendaPiva}</p>` : ""}
      </div>
    </div>
    <div style="text-align:right;">
      <p style="margin:0;font-size:13px;color:#6B7280;">PREVENTIVO</p>
      <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">Data: ${quote.data}</p>
    </div>
  </div>

  <div class="pdf-avoid" style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:24px;">
    <p style="margin:0 0 4px;font-size:11px;color:#9CA3AF;font-weight:600;text-transform:uppercase;">Dati Cliente</p>
    <p style="margin:0;font-size:15px;font-weight:600;color:#1F2937;">${quote.cliente || "—"}</p>
    ${quote.clientInfo?.indirizzo ? `<p style="margin:2px 0 0;font-size:13px;color:#6B7280;">${quote.clientInfo.indirizzo}</p>` : ""}
    ${quote.clientInfo?.telefono ? `<p style="margin:2px 0 0;font-size:13px;color:#6B7280;">Tel: ${quote.clientInfo.telefono}</p>` : ""}
  </div>

  ${quote.descrizione ? `<div class="pdf-avoid" style="background:#FFF7ED;border-radius:8px;padding:12px 16px;margin-bottom:24px;overflow:hidden;box-sizing:border-box;">
    <p style="margin:0 0 4px;font-size:11px;color:#9CA3AF;font-weight:600;text-transform:uppercase;">Descrizione Lavoro</p>
    <p style="margin:0;font-size:13px;color:#6B7280;word-wrap:break-word;overflow-wrap:break-word;white-space:pre-wrap;">${quote.descrizione}</p>
  </div>` : ""}

  <div style="margin-bottom:24px;">
    <div class="pdf-avoid" style="display:flex;background:#1F2937;font-size:11px;color:#fff;font-weight:600;text-transform:uppercase;">
      <div style="${colonne[0].stile}padding-top:10px;padding-bottom:10px;">Voce</div>
      <div style="${colonne[1].stile}padding-top:10px;padding-bottom:10px;">Q.tà</div>
      <div style="${colonne[2].stile}padding-top:10px;padding-bottom:10px;">U.M.</div>
      <div style="${colonne[3].stile}padding-top:10px;padding-bottom:10px;">Prezzo</div>
      <div style="${colonne[4].stile}padding-top:10px;padding-bottom:10px;">IVA</div>
      <div style="${colonne[5].stile}padding-top:10px;padding-bottom:10px;">Totale</div>
    </div>
    ${tableRows}
  </div>

  <div class="pdf-avoid" style="margin-left:auto;width:300px;">
    <table style="width:100%;border-collapse:collapse;">${totaliRows}</table>
  </div>

  ${(quote.pagamento && quote.pagamento.length > 0) ? `
  <div class="pdf-avoid" style="margin-top:24px;background:#F9FAFB;border-radius:8px;padding:16px;">
    <p style="margin:0 0 8px;font-size:11px;color:#9CA3AF;font-weight:600;text-transform:uppercase;">Modalità di Pagamento</p>
    ${quote.pagamento.map(f => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#6B7280;">
      <span>${f.fase}</span><span style="font-weight:600;color:#1F2937;">${f.percentuale}% — € ${fmt(totale * f.percentuale / 100)}</span>
    </div>`).join("")}
  </div>` : ""}

  ${righeFoto.length ? `
  <div style="margin-top:24px;">
    <div class="pdf-avoid">
      <p style="margin:0 0 12px;font-size:11px;color:#9CA3AF;font-weight:600;text-transform:uppercase;">Foto Sopralluogo</p>
      ${righeFoto[0]}
    </div>
    ${righeFoto.slice(1).map(riga => `<div class="pdf-avoid">${riga}</div>`).join("")}
  </div>` : ""}

  <div class="pdf-avoid" style="margin-top:40px;padding-top:20px;border-top:1px solid #E5E7EB;">
    <p style="margin:0 0 28px;font-size:12px;color:#6B7280;">${quote.luogoFirma ? esc(quote.luogoFirma) + ", " : "Luogo e data: "}${quote.data || new Date().toLocaleDateString("it-IT")}</p>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:40px;">
      <div style="flex:1;min-width:0;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;color:#9CA3AF;text-transform:uppercase;">L'Impresa</p>
        <div style="height:48px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;">
          ${quote.firmaImpresa ? `<span style="display:block;white-space:nowrap;line-height:1.15;margin-bottom:2px;font-family:'Brush Script MT','Segoe Script','Dancing Script',cursive;font-size:${dimensioneFirma(quote.firmaImpresa)}px;color:#1F2937;">${esc(quote.firmaImpresa)}</span>` : ""}
        </div>
        <div style="border-top:1px solid #9CA3AF;width:280px;max-width:100%;margin:0 auto;"></div>
      </div>
      <div style="flex:1;min-width:0;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;color:#9CA3AF;text-transform:uppercase;">Il Cliente per accettazione</p>
        <div style="height:48px;"></div>
        <div style="border-top:1px solid #9CA3AF;width:280px;max-width:100%;margin:0 auto;"></div>
      </div>
    </div>
  </div>

  <div style="margin-top:20px;padding-top:16px;border-top:1px solid #E5E7EB;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9CA3AF;">Preventivo valido ${quote.scadenza ? `fino al ${new Date(quote.scadenza).toLocaleDateString("it-IT")}` : "30 giorni dalla data di emissione"}</p>
    <p style="margin:4px 0 0;font-size:11px;color:#9CA3AF;">${aziendaNome}${aziendaTel ? ` — Tel: ${aziendaTel}` : ""}${aziendaEmail ? ` — ${aziendaEmail}` : ""}</p>
  </div>
</body></html>`;

  // Genera PDF reale con html2pdf.js
  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const nomeFile = "Preventivo_" + (quote.cliente || "Cliente").replace(/\s+/g, "_") + "_" + (quote.data ? quote.data.replace(/\//g, "-") : "oggi") + ".pdf";

  const pdfPromise = loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js").then(() => {
    const opt = {
      margin: [10, 10, 10, 10],
      filename: nomeFile,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: [".pdf-avoid"] }
    };
    const worker = window.html2pdf().set(opt).from(html, 'string');
    if (returnBlob) {
      return worker.toPdf().output('blob');
    }
    return worker.save();
  }).catch((err) => {
    console.error("PDF generation error:", err);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeFile.replace(".pdf", ".html");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  return pdfPromise;
}


// ========== MAIN APP ==========

// ========== INVITA UN AMICO ==========

function InvitaAmico({ onNavigate, session, referralCode, referrals }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referralList, setReferralList] = useState(referrals || []);

  const referralLink = window.location.origin + "?ref=" + (referralCode || "");

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    const text = "Ciao! Ti consiglio Preventivo Intelligente per creare preventivi edili in modo veloce e professionale. Usa il mio link per avere 30 giorni gratuiti: " + referralLink;
    if (navigator.share) {
      navigator.share({ title: "Preventivo Intelligente", text: text, url: referralLink });
    } else {
      const waUrl = "https://wa.me/?text=" + encodeURIComponent(text);
      window.open(waUrl, "_blank");
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    const loadReferrals = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("referrals")
          .select("referred_email, status, rewarded, created_at")
          .eq("referrer_id", session.user.id)
          .order("created_at", { ascending: false });
        if (data && !error) setReferralList(data);
      } catch (e) { console.log("Referrals table may not exist yet:", e); }
      setLoading(false);
    };
    loadReferrals();
  }, [session?.user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate("home")} className="p-2 rounded-full hover:bg-orange-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Invita un Amico</h1>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 mb-4 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Gift className="w-8 h-8" />
            <div>
              <h2 className="font-bold text-lg">Regala 30 giorni gratis!</h2>
              <p className="text-sm text-orange-100">E ricevi 30 giorni gratis anche tu</p>
            </div>
          </div>
          <p className="text-sm text-orange-100 mt-2">Invita un amico imprenditore edile. Quando si iscrive e paga il primo mese, entrambi ricevete 30 giorni gratuiti!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Il tuo link di invito</h3>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 truncate border border-gray-200">
              {referralLink}
            </div>
            <button onClick={handleCopy} className={"p-3 rounded-xl transition-colors " + (copied ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600 hover:bg-orange-200")}>
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <button onClick={handleShare} className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            Condividi su WhatsApp
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h3 className="font-semibold text-gray-800 mb-1">Come funziona</h3>
          <div className="space-y-3 mt-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-orange-600">1</span>
              </div>
              <p className="text-sm text-gray-600">Condividi il tuo link con un collega imprenditore edile</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-orange-600">2</span>
              </div>
              <p className="text-sm text-gray-600">Il tuo amico si registra e riceve 30 giorni di prova gratuita</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-orange-600">3</span>
              </div>
              <p className="text-sm text-gray-600">Quando paga il primo mese, tu ricevi 30 giorni gratuiti in regalo!</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Persone invitate</h3>
            <span className="text-xs text-gray-400">{referralList.length} inviti</span>
          </div>
          {loading ? (
            <div className="text-center py-4 text-sm text-gray-400">Caricamento...</div>
          ) : referralList.length === 0 ? (
            <div className="text-center py-6">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Non hai ancora invitato nessuno</p>
              <p className="text-xs text-gray-300 mt-1">Condividi il tuo link per iniziare!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referralList.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={"w-8 h-8 rounded-full flex items-center justify-center " + (r.status === "paid" ? "bg-green-100" : r.status === "registered" ? "bg-blue-100" : "bg-gray-100")}>
                      <User className={"w-4 h-4 " + (r.status === "paid" ? "text-green-600" : r.status === "registered" ? "text-blue-600" : "text-gray-400")} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{r.referred_email || "Utente"}</p>
                      <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString("it-IT")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {r.status === "paid" ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Pagato
                      </span>
                    ) : r.status === "registered" ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <User className="w-3 h-3" /> Registrato
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" /> In attesa
                      </span>
                    )}
                    {r.rewarded && <span className="text-xs text-orange-500 font-medium ml-1">+30gg</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== GESTIONE ABBONAMENTO ==========

function GestioneAbbonamento({ onNavigate, subscriptionStatus, trialEnd, onShowPricing, onCancelSubscription, session }) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelFinal, setShowCancelFinal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const getStatusLabel = () => {
    switch(subscriptionStatus) {
      case "active": return { text: "Attivo", color: "text-green-600 bg-green-50" };
      case "trialing": return { text: "Prova Gratuita", color: "text-blue-600 bg-blue-50" };
      case "expired": return { text: "Scaduto", color: "text-red-600 bg-red-50" };
      default: return { text: "Nessun Abbonamento", color: "text-gray-600 bg-gray-50" };
    }
  };

  const status = getStatusLabel();

  const getExpiryText = () => {
    if (subscriptionStatus === "trialing" && trialEnd) {
      const end = new Date(trialEnd);
      const days = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
      return days > 0 ? days + " giorni rimanenti" : "Scaduta";
    }
    if (subscriptionStatus === "active") return "Rinnovo automatico mensile";
    return "";
  };

  const handleCancelStep1 = () => setShowCancelConfirm(true);
  
  const handleCancelStep2 = () => {
    if (!cancelReason.trim()) return;
    setShowCancelFinal(true);
  };

  const handleCancelFinal = async () => {
    setCancelling(true);
    try {
      // Cancel on Stripe first
      const stripeRes = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });
      const stripeData = await stripeRes.json();
      
      // Update local profile
      const { error } = await supabase.from("profiles").update({ subscription_status: "expired" }).eq("id", session?.user?.id);
      onCancelSubscription();
      alert(stripeData.success ? "Abbonamento annullato. Rimarr\u00e0 attivo fino alla fine del periodo corrente." : "Abbonamento annullato localmente.");
    } catch (err) {
      console.error(err);
      alert("Errore durante l'annullamento. Riprova.");
    }
    setCancelling(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate("home")} className="p-2 rounded-full hover:bg-orange-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Gestione Abbonamento</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Crown className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Preventivo Intelligente</h2>
                <p className="text-sm text-gray-500">Piano Mensile</p>
              </div>
            </div>
            <span className={"px-3 py-1 rounded-full text-xs font-medium " + status.color}>{status.text}</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Prezzo</span>
              <span className="font-medium text-gray-800">47,00 EUR/mese</span>
            </div>
            {getExpiryText() && (
              <div className="flex justify-between">
                <span className="text-gray-500">Stato</span>
                <span className="font-medium text-gray-800">{getExpiryText()}</span>
              </div>
            )}
          </div>
        </div>

        {(subscriptionStatus === "none" || subscriptionStatus === "expired") && (
          <button onClick={() => onShowPricing()} className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors mb-4">
            Attiva Abbonamento
          </button>
        )}

        {(subscriptionStatus === "active" || subscriptionStatus === "trialing") && !showCancelConfirm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Azioni</h3>
            <button onClick={handleCancelStep1} className="w-full py-3 border border-red-200 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors text-sm">
              Annulla Abbonamento
            </button>
          </div>
        )}

        {showCancelConfirm && !showCancelFinal && (
          <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="font-bold text-red-700">Sei sicuro di voler annullare?</h3>
            </div>
            <p className="text-sm text-red-600 mb-4">Perderai l'accesso a tutte le funzionalita premium, inclusa la generazione automatica dei preventivi con l'intelligenza artificiale.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-red-700 mb-2">Perche vuoi annullare? (obbligatorio)</label>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Dicci perche vuoi andare via..." className="w-full p-3 border border-red-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" rows={3} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowCancelConfirm(false); setCancelReason(""); }} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors text-sm">
                No, voglio restare!
              </button>
              <button onClick={handleCancelStep2} disabled={!cancelReason.trim()} className="flex-1 py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors text-sm disabled:opacity-40">
                Continua annullamento
              </button>
            </div>
          </div>
        )}

        {showCancelFinal && (
          <div className="bg-red-50 rounded-2xl border-2 border-red-300 p-6 mb-4">
            <div className="text-center mb-4">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
              <h3 className="font-bold text-red-800 text-lg">Ultima possibilita!</h3>
              <p className="text-sm text-red-600 mt-2">Questa azione e irreversibile. Perderai immediatamente l'accesso a tutte le funzionalita premium.</p>
              <p className="text-sm text-red-700 font-semibold mt-3">Sei davvero, davvero sicuro?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowCancelFinal(false); setShowCancelConfirm(false); setCancelReason(""); }} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors">
                Ci ho ripensato, resto!
              </button>
              <button onClick={handleCancelFinal} disabled={cancelling} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors text-sm disabled:opacity-50">
                {cancelling ? "Annullamento..." : "Annulla definitivamente"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App({ session }) {
  const [currentView, setCurrentView] = useState("home");
  const [prices, setPrices] = useState(DEFAULT_PRICES);
  const [quotes, setQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [costiFissi, setCostiFissi] = useState(DEFAULT_COSTI_FISSI);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [trialEnd, setTrialEnd] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState([]);
  const pricesRef = useRef(prices);
  const costiFissiRef = useRef(costiFissi);
  const clientsRef = useRef(clients);
  const syncReadyRef = useRef({ prices: false, costiFissi: false, clients: false });
  pricesRef.current = prices;
  costiFissiRef.current = costiFissi;
  clientsRef.current = clients;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Track referral code from URL
    const refCode = params.get("ref");
    if (refCode && session?.user?.id) {
      // Save referred_by in profile if not already set
      supabase.from("profiles").select("referred_by").eq("id", session.user.id).single().then(({ data: pData }) => {
        if (pData && !pData.referred_by) {
          supabase.from("profiles").update({ referred_by: refCode }).eq("id", session.user.id);
        }
      });
    }
    if (params.get("subscription") === "success" && session?.user?.id) {
      supabase.from("profiles").update({ subscription_status: "active" }).eq("id", session.user.id).then(async () => {
        // Check if this user was referred and reward the referrer (only first time)
        try {
          const { data: myProfile } = await supabase.from("profiles").select("referred_by").eq("id", session.user.id).single();
          if (myProfile?.referred_by) {
            // Find the referrer by their referral_code
            const { data: referrer } = await supabase.from("profiles").select("id").eq("referral_code", myProfile.referred_by).single();
            if (referrer) {
              // Check if referral already exists and was already rewarded
              const { data: existingRef } = await supabase.from("referrals").select("id, rewarded").eq("referrer_id", referrer.id).eq("referred_id", session.user.id).single();
              if (!existingRef) {
                // Create referral record and mark as paid
                await supabase.from("referrals").insert({
                  referrer_id: referrer.id,
                  referred_id: session.user.id,
                  referred_email: session.user.email,
                  status: "paid",
                  rewarded: true,
                  referral_code: myProfile.referred_by
                });
                // Grant 30 free days to referrer by extending their subscription
                const { data: referrerProfile } = await supabase.from("profiles").select("subscription_status, trial_end").eq("id", referrer.id).single();
                const now = new Date();
                let newEnd = new Date();
                if (referrerProfile?.subscription_status === "trialing" && referrerProfile?.trial_end) {
                  const currentEnd = new Date(referrerProfile.trial_end);
                  newEnd = currentEnd > now ? new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                } else if (referrerProfile?.subscription_status === "active") {
                  newEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                } else {
                  newEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                }
                await supabase.from("profiles").update({ subscription_status: "trialing", trial_end: newEnd.toISOString() }).eq("id", referrer.id);
              } else if (existingRef && !existingRef.rewarded) {
                // Update existing referral to paid and reward
                await supabase.from("referrals").update({ status: "paid", rewarded: true }).eq("id", existingRef.id);
                // Grant 30 days (same logic)
                const { data: referrerProfile } = await supabase.from("profiles").select("subscription_status, trial_end").eq("id", referrer.id).single();
                const now2 = new Date();
                let newEnd2 = new Date(now2.getTime() + 30 * 24 * 60 * 60 * 1000);
                if (referrerProfile?.trial_end) {
                  const currentEnd = new Date(referrerProfile.trial_end);
                  if (currentEnd > now2) newEnd2 = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
                }
                await supabase.from("profiles").update({ subscription_status: "trialing", trial_end: newEnd2.toISOString() }).eq("id", referrer.id);
              }
            }
          }
        } catch (e) { console.log("Referral reward error:", e); }
        setSubscriptionStatus("active");
        window.history.replaceState({}, "", window.location.pathname);
      });
    }
  }, [session]);

  // ---- Caricamento dati da Supabase all'avvio ----
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    const loadData = async () => {
      try {
        let { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (!profileData) {
          const meta = session.user.user_metadata || {};
          const { data: createdProfile, error: createError } = await supabase.from("profiles").upsert({
            id: userId,
            nome: meta.nome || "",
            cognome: meta.cognome || "",
            nome_azienda: meta.nome_azienda || "",
            email: session.user.email || "",
            subscription_status: "none"
          }).select().single();
          if (createError) console.error("Profile create error:", createError);
          profileData = createdProfile;
        }
        if (profileData) {
          setUserProfile({
            nome: profileData.nome || "",
            cognome: profileData.cognome || "",
            nomeAzienda: profileData.nome_azienda || "",
            email: profileData.email || "",
            telefono: profileData.telefono || "",
            indirizzo: profileData.indirizzo || "",
            piva: profileData.piva || "",
            codiceFiscale: profileData.codice_fiscale || "",
            logo: profileData.logo || "",
          });
        // Carica stato abbonamento
        const subStatus = profileData.subscription_status || "none";
        // Load or generate referral code
        if (!profileData.referral_code) {
          const code = session.user.id.substring(0, 8).toUpperCase();
          await supabase.from("profiles").update({ referral_code: code }).eq("id", userId);
          setReferralCode(code);
        } else {
          setReferralCode(profileData.referral_code);
        }
        if (subStatus === "trialing" && profileData.trial_end) {
          const trialEndDate = new Date(profileData.trial_end);
          if (trialEndDate < new Date()) {
            await supabase.from("profiles").update({ subscription_status: "expired" }).eq("id", userId);
            setSubscriptionStatus("expired");
          } else {
            setSubscriptionStatus("trialing");
            setTrialEnd(profileData.trial_end);
          }
        } else {
          setSubscriptionStatus(subStatus);
        }

        }

        const { data: clientsData, error: clientsError } = await supabase.from("clients").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        if (clientsError) {
          console.error("Errore caricamento clienti:", clientsError);
        } else {
          const anagrafica = (clientsData || []).map(clientFromDb);
          clientsRef.current = anagrafica;
          setClients(anagrafica);
          syncReadyRef.current.clients = true;
        }

        const { data: quotesData } = await supabase.from("quotes").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        if (quotesData) {
          setQuotes(quotesData.map(q => {
            const meta = (q.items || []).find(i => i._meta);
            const realItems = (q.items || []).filter(i => !i._meta);
            return {
              _supabaseId: q.id, numero: q.numero_preventivo, descrizione: q.descrizione,
              items: realItems, pagamento: q.pagamento || [], scadenza: q.scadenza,
              note: q.note || "", totale: q.totale, stato: q.stato,
              cliente: meta?.cliente || "", clientInfo: meta?.clientInfo || {},
              discount: meta?.discount, margin: meta?.margin,
              firmaImpresa: meta?.firmaImpresa || "", luogoFirma: meta?.luogoFirma || "",
              costoTotaleInterno: meta?.costoTotaleInterno || 0, voci: realItems.length, photos: meta?.photos || [],
              created_at: q.created_at, data: new Date(q.created_at).toLocaleDateString("it-IT"),
            };
          }));
        }

        try {
          const listino = await loadOrSeedRows("prices", userId, DEFAULT_PRICES, priceToDb, priceFromDb);
          pricesRef.current = listino;
          setPrices(listino);
          syncReadyRef.current.prices = true;
        } catch (err) {
          console.error("Errore caricamento prezzi:", err);
          alert("Non sono riuscito a caricare il tuo listino prezzi: le modifiche di questa sessione non verranno salvate. Ricarica la pagina.");
        }

        try {
          const costi = await loadOrSeedRows("costi_fissi", userId, DEFAULT_COSTI_FISSI, costoToDb, costoFromDb);
          costiFissiRef.current = costi;
          setCostiFissi(costi);
          syncReadyRef.current.costiFissi = true;
        } catch (err) {
          console.error("Errore caricamento costi fissi:", err);
          alert("Non sono riuscito a caricare i tuoi costi fissi: le modifiche di questa sessione non verranno salvate. Ricarica la pagina.");
        }

        setDataLoaded(true);
      } catch (err) {
        console.error("Errore caricamento dati:", err);
        setDataLoaded(true);
      }
    };
    loadData();
  }, [session]);

  const saveProfileToSupabase = async (profile) => {
    if (!session?.user?.id) return;
    setUserProfile(profile);
    await supabase.from("profiles").upsert({
      id: session.user.id, nome: profile.nome, cognome: profile.cognome, nome_azienda: profile.nomeAzienda, email: profile.email,
      telefono: profile.telefono, indirizzo: profile.indirizzo, piva: profile.piva, codice_fiscale: profile.codiceFiscale,
      logo: profile.logo, updated_at: new Date().toISOString(),
    });
  };

  const saveClients = (next) => {
    const prev = clientsRef.current;
    clientsRef.current = next;
    setClients(next);
    if (!session?.user?.id || !syncReadyRef.current.clients) return;
    syncRows("clients", prev, next, clientToDb, session.user.id, setClients).catch(err => {
      console.error("Errore salvataggio clienti:", err);
      alert("Non sono riuscito a salvare le modifiche ai clienti. Controlla la connessione e riprova.");
    });
  };

  const updateClient = (clientId, dati) => {
    saveClients(clientsRef.current.map(c => String(c.id) === String(clientId) ? {
      ...c,
      nome: (dati.nome || "").trim(), indirizzo: dati.indirizzo || "", telefono: dati.telefono || "", whatsapp: dati.telefono || "",
      email: dati.email || "", codiceFiscale: dati.codiceFiscale || "",
    } : c));
  };

  const savePrices = (next) => {
    const prev = pricesRef.current;
    pricesRef.current = next;
    setPrices(next);
    if (!session?.user?.id || !syncReadyRef.current.prices) return;
    syncRows("prices", prev, next, priceToDb, session.user.id, setPrices).catch(err => {
      console.error("Errore salvataggio prezzi:", err);
      alert("Non sono riuscito a salvare le modifiche ai prezzi. Controlla la connessione e riprova.");
    });
  };

  const saveCostiFissi = (next) => {
    const prev = costiFissiRef.current;
    costiFissiRef.current = next;
    setCostiFissi(next);
    if (!session?.user?.id || !syncReadyRef.current.costiFissi) return;
    syncRows("costi_fissi", prev, next, costoToDb, session.user.id, setCostiFissi).catch(err => {
      console.error("Errore salvataggio costi fissi:", err);
      alert("Non sono riuscito a salvare le modifiche ai costi fissi. Controlla la connessione e riprova.");
    });
  };

  const addPriceToListino = (voce) => {
    savePrices([...pricesRef.current, { ...voce, id: Date.now() + "-" + Math.random().toString(36).slice(2) }]);
  };

  const rememberComputoMatch = async (descrizione, voce, unita) => {
    const descrizioneNorm = normalizeDescrizione(descrizione);
    if (!session?.user?.id || !descrizioneNorm) return;
    const { error } = await supabase.from("computo_memoria").upsert({
      user_id: session.user.id,
      descrizione_norm: descrizioneNorm,
      descrizione,
      voce,
      unita: unita || "",
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,descrizione_norm" });
    if (error) console.error("Errore salvataggio memoria abbinamenti:", error);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const saveQuote = async (quote) => {
    let fotoSalvate = quote.photos || [];
    try {
      fotoSalvate = await uploadQuotePhotos(fotoSalvate, session.user.id);
    } catch (err) {
      console.error("Errore caricamento foto sopralluogo:", err);
      alert("Non sono riuscito a salvare le foto del sopralluogo: il preventivo viene salvato senza le foto nuove.");
      fotoSalvate = fotoSalvate.filter(p => p.path);
    }
    quote = { ...quote, photos: fotoSalvate };
    const metaFoto = photosForDb(fotoSalvate);

    if (editingQuote !== null && editingQuote.index !== undefined) {
      const fotoPrecedenti = (editingQuote.photos || []).map(p => p.path).filter(Boolean);
      const updated = [...quotes];
      updated[editingQuote.index] = quote;
      setQuotes(updated);
      setEditingQuote(null);
      if (quote._supabaseId) {
          await supabase.from("quotes").update({
            descrizione: quote.descrizione, items: [...quote.items.filter(i => !i._meta), { _meta: true, cliente: quote.clientInfo?.nome || quote.cliente, clientInfo: quote.clientInfo, discount: quote.discount, margin: quote.margin, firmaImpresa: quote.firmaImpresa, luogoFirma: quote.luogoFirma, costoTotaleInterno: quote.costoTotaleInterno, photos: metaFoto }], pagamento: quote.pagamento,
            scadenza: quote.scadenza, note: quote.note, totale: quote.totale,
            updated_at: new Date().toISOString(),
          }).eq("id", quote._supabaseId);
      }
      const fotoInUso = new Set(updated.flatMap(q => (q.photos || []).map(p => p.path)).filter(Boolean));
      await removeStoragePhotos(fotoPrecedenti.filter(path => !fotoInUso.has(path)));
    } else {
          const { data } = await supabase.from("quotes").insert({
            user_id: session.user.id, numero_preventivo: quote.numero || `P-${Date.now()}`,
            descrizione: quote.descrizione, items: [...quote.items, { _meta: true, cliente: quote.clientInfo?.nome || quote.cliente, clientInfo: quote.clientInfo, discount: quote.discount, margin: quote.margin, firmaImpresa: quote.firmaImpresa, luogoFirma: quote.luogoFirma, costoTotaleInterno: quote.costoTotaleInterno, photos: metaFoto }], pagamento: quote.pagamento,
            scadenza: quote.scadenza, note: quote.note, totale: quote.totale, stato: "bozza",
          }).select().single();
      const newQuote = data ? { ...quote, _supabaseId: data.id } : quote;
      setQuotes([newQuote, ...quotes]);
      // Auto-insert client if not in database
      const clienteNome = quote.clientInfo?.nome?.trim();
      const clienteCF = quote.clientInfo?.codiceFiscale?.trim();
      if (clienteNome && quote.clientInfo?.clientId == null) {
        const exists = clienteCF ? clients.some(c => c.codiceFiscale && c.codiceFiscale.toLowerCase() === clienteCF.toLowerCase()) : clients.some(c => c.nome.toLowerCase() === clienteNome.toLowerCase());
        if (!exists) {
          saveClients([{
            id: Date.now() + "-" + Math.random().toString(36).slice(2), tipo: "Privato", nome: clienteNome,
            codiceFiscale: quote.clientInfo?.codiceFiscale || "", email: quote.clientInfo?.email || "",
            telefono: quote.clientInfo?.telefono || "", whatsapp: quote.clientInfo?.telefono || "",
            indirizzo: quote.clientInfo?.indirizzo || "", note: "Auto-inserito da preventivo",
          }, ...clientsRef.current]);
        }
      }
    }
  };

  const handleViewQuote = (quote, index) => {
    setSelectedQuote({ ...quote, _index: index });
    setCurrentView("dettaglio");
  };

  const handleEditQuote = async (quote) => {
    const photos = await hydratePhotos(quote.photos);
    setEditingQuote({ ...quote, photos, index: quote._index });
    setCurrentView("modifica");
  };

  const handleDuplicateQuote = async (quote) => {
    const photos = await hydratePhotos(quote.photos);
    const duplicated = {
      ...quote,
      photos,
      _supabaseId: undefined,
      _index: undefined,
      index: undefined,
      cliente: { nome: "", indirizzo: "", telefono: "", email: "", codiceFiscale: "" },
      clientInfo: { nome: "", indirizzo: "", telefono: "", email: "", codiceFiscale: "" },
      data: new Date().toISOString().split('T')[0]
    };
    setEditingQuote(duplicated);
    setCurrentView("modifica");
  };

  const handleDeleteQuote = async (quote, index) => {
    setQuotes(prev => prev.filter((_, i) => i !== index));
    if (quote._supabaseId) {
      await supabase.from("quotes").delete().eq("id", quote._supabaseId);
    }
    const fotoInUso = new Set(quotes.filter(q => q !== quote).flatMap(q => (q.photos || []).map(p => p.path)).filter(Boolean));
    await removeStoragePhotos((quote.photos || []).map(p => p.path).filter(path => path && !fotoInUso.has(path)));
  };

  const costoMensile = costiFissi.reduce((sum, item) => {
    return sum + (item.frequenza === "annuale" ? item.importo / 12 : item.importo);
  }, 0);

  const stats = {
    totalPrices: prices.length,
    totalQuotes: quotes.length,
    totalClients: clients.length,
    costoMensile
  };

  const isSubscribed = subscriptionStatus === "active" || subscriptionStatus === "trialing";

  const handleSubscribe = async (promoCode, planType) => {
    try {
      const res = await fetch("/api/activate-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.access_token
        },
        body: JSON.stringify({ promoCode: promoCode || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Errore attivazione prova" };
      }
      if (promoCode) {
        alert("Codice " + promoCode + " attivato! Hai " + data.trialDays + " giorni gratuiti.");
      } else {
        alert("Prova gratuita attivata! Hai " + data.trialDays + " giorni per provare tutte le funzionalit\u00E0.");
      }
      window.location.reload();
    } catch (err) {
      return { error: err.message };
    }
  };

  const goToNuovoPreventivo = () => {
    const p = userProfile || {};
    if (!p.nome || !p.cognome || !p.nomeAzienda || !p.piva || !p.email || !p.telefono || !p.indirizzo) {
      alert("Completa il tuo profilo prima di creare un preventivo. Vai su Profilo Azienda e compila tutti i campi obbligatori (Nome, Cognome, Nome Azienda, P.IVA, Email, Telefono, Indirizzo).");
      setCurrentView("profilo");
      return;
    }
    setCurrentView("nuovo");
  };

  if (dataLoaded && (!isSubscribed || showPricing)) {
    return <PricingPage onSubscribe={handleSubscribe} onLogout={handleLogout} onBack={showPricing ? () => setShowPricing(false) : null} userEmail={session?.user?.email} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen md:flex">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} onGoToNuovo={goToNuovoPreventivo} userProfile={userProfile} onLogout={handleLogout} />
      <div className="flex-1 flex items-start justify-center p-4 md:p-0">
      <div className="w-full max-w-md md:max-w-none bg-white rounded-2xl md:rounded-none shadow-xl md:shadow-none overflow-y-auto md:min-h-screen">
        <Header currentView={currentView} onNavigate={setCurrentView} userProfile={userProfile} onLogout={handleLogout} />

        {currentView === "home" && <HomeView onNavigate={setCurrentView} onGoToNuovo={goToNuovoPreventivo} stats={stats} userProfile={userProfile} trialEnd={trialEnd} subscriptionStatus={subscriptionStatus} onShowPricing={() => setShowPricing(true)} />}
        {currentView === "profilo" && <ProfiloAzienda userProfile={userProfile} setUserProfile={saveProfileToSupabase} onNavigate={setCurrentView} />}
      {currentView === "gestione-abbonamento" && <GestioneAbbonamento onNavigate={(v) => setCurrentView(v)} subscriptionStatus={subscriptionStatus} trialEnd={trialEnd} onShowPricing={() => setShowPricing(true)} onCancelSubscription={() => setSubscriptionStatus("expired")} session={session} />}
      {currentView === "invita-amico" && <InvitaAmico onNavigate={(v) => setCurrentView(v)} session={session} referralCode={referralCode} referrals={referrals} />}
        {currentView === "nuovo" && <NuovoPreventivo prices={prices} clients={clients} quotes={quotes} onSaveQuote={saveQuote} onNavigate={setCurrentView} onDownloadPDF={async (q) => generatePDF({ ...q, photos: await hydratePhotos(q.photos) }, userProfile)} onGeneratePDFBlob={async (q) => generatePDF({ ...q, photos: await hydratePhotos(q.photos) }, userProfile, true)} userProfile={userProfile} onAddPrice={addPriceToListino} onRememberMatch={rememberComputoMatch} onUpdateClient={updateClient} />}
        {currentView === "modifica" && editingQuote && (
          <NuovoPreventivo
            prices={prices}
            clients={clients}
            quotes={quotes}
            onSaveQuote={saveQuote}
            onNavigate={setCurrentView}
            onDownloadPDF={async (q) => generatePDF({ ...q, photos: await hydratePhotos(q.photos) }, userProfile)} onGeneratePDFBlob={async (q) => generatePDF({ ...q, photos: await hydratePhotos(q.photos) }, userProfile, true)}
            initialData={editingQuote}
            userProfile={userProfile}
            onAddPrice={addPriceToListino}
            onRememberMatch={rememberComputoMatch}
            onUpdateClient={updateClient}
          />
        )}
        {currentView === "database" && <div><button onClick={() => setCurrentView("home")} className="flex items-center gap-1 text-orange-500 hover:text-orange-600 mb-2 px-5 pt-4"><ArrowLeft size={20} /><span className="text-sm">Indietro</span></button><PriceDatabase prices={prices} setPrices={savePrices} /></div>}
          {currentView === "clienti" && <div><button onClick={() => setCurrentView("home")} className="flex items-center gap-1 text-orange-500 hover:text-orange-600 mb-2 px-5 pt-4"><ArrowLeft size={20} /><span className="text-sm">Indietro</span></button><ClientDatabase clients={clients} setClients={saveClients} /></div>}
          {currentView === "costifissi" && <div><button onClick={() => setCurrentView("home")} className="flex items-center gap-1 text-orange-500 hover:text-orange-600 mb-2 px-5 pt-4"><ArrowLeft size={20} /><span className="text-sm">Indietro</span></button><CostiFissiView costiFissi={costiFissi} setCostiFissi={saveCostiFissi} /></div>}
        {currentView === "storico" && <div><button onClick={() => setCurrentView("home")} className="flex items-center gap-1 text-orange-500 hover:text-orange-600 mb-2 px-5 pt-4"><ArrowLeft size={20} /><span className="text-sm">Indietro</span></button><StoricoView quotes={quotes} onViewQuote={handleViewQuote} onDeleteQuote={handleDeleteQuote} /></div>}
        {currentView === "dettaglio" && selectedQuote && (
          <QuoteDetailView
            quote={selectedQuote}
            onBack={() => setCurrentView("storico")}
            onDownloadPDF={async (q) => generatePDF({ ...q, photos: await hydratePhotos(q.photos) }, userProfile)} onGeneratePDFBlob={async (q) => generatePDF({ ...q, photos: await hydratePhotos(q.photos) }, userProfile, true)}
            onEdit={handleEditQuote}
                onDuplicate={handleDuplicateQuote}
          />
        )}

        {currentView !== "home" && (
          <div className="p-4 border-t border-gray-100">
            <button onClick={() => setCurrentView("home")} className="w-full flex items-center justify-center gap-2 text-gray-400 text-sm hover:text-orange-500 transition">
              <Home size={16} /> Torna alla Home
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
