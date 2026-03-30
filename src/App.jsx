import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, FileText, Database, Plus, Trash2, Edit3, Check, X, Download, Volume2, ChevronRight, ChevronUp, ChevronDown, Home, ArrowLeft, Search, Save, RefreshCw, Eye, Printer, Users, UserPlus, Phone, Camera, Image, Send, Mail, MessageCircle, GripVertical, Settings, Upload, Building2, LogOut, User } from "lucide-react";
import { supabase } from "./supabaseClient";

// ========== DATABASE PREZZI DEFAULT ==========
const DEFAULT_PRICES = [
  // Demolizioni
  { id: 1, categoria: "Demolizioni", voce: "Demolizione pavimento", unita: "mq", prezzo: 18, note: "Incluso smaltimento", iva: 22 },
  { id: 2, categoria: "Demolizioni", voce: "Demolizione rivestimento bagno", unita: "mq", prezzo: 15, note: "Pareti e pavimento", iva: 22 },
  { id: 3, categoria: "Demolizioni", voce: "Demolizione tramezza", unita: "mq", prezzo: 22, note: "Spessore fino a 12cm", iva: 22 },
  { id: 4, categoria: "Demolizioni", voce: "Rimozione vasca da bagno", unita: "cad", prezzo: 150, note: "Incluso trasporto", iva: 22 },
  { id: 5, categoria: "Demolizioni", voce: "Rimozione sanitari", unita: "cad", prezzo: 45, note: "Per singolo pezzo", iva: 22 },
  // Muratura
  { id: 6, categoria: "Muratura", voce: "Costruzione tramezza in cartongesso", unita: "mq", prezzo: 45, note: "Singola lastra", iva: 22 },
  { id: 7, categoria: "Muratura", voce: "Costruzione tramezza in laterizio", unita: "mq", prezzo: 55, note: "Forato 8cm", iva: 22 },
  { id: 8, categoria: "Muratura", voce: "Intonaco civile", unita: "mq", prezzo: 18, note: "Spessore medio 1.5cm", iva: 22 },
  { id: 9, categoria: "Muratura", voce: "Rasatura pareti", unita: "mq", prezzo: 12, note: "Preparazione per pittura", iva: 22 },
  { id: 10, categoria: "Muratura", voce: "Controsoffitto in cartongesso", unita: "mq", prezzo: 38, note: "Struttura e lastra", iva: 22 },
  // Pavimenti e Rivestimenti
  { id: 11, categoria: "Pavimenti", voce: "Posa pavimento gres", unita: "mq", prezzo: 32, note: "Formato fino a 60x60", iva: 22 },
  { id: 12, categoria: "Pavimenti", voce: "Posa pavimento gres grande formato", unita: "mq", prezzo: 42, note: "Formato oltre 60x60", iva: 22 },
  { id: 13, categoria: "Pavimenti", voce: "Posa rivestimento bagno", unita: "mq", prezzo: 35, note: "Pareti", iva: 22 },
  { id: 14, categoria: "Pavimenti", voce: "Massetto tradizionale", unita: "mq", prezzo: 22, note: "Spessore 5cm", iva: 22 },
  { id: 15, categoria: "Pavimenti", voce: "Battiscopa in gres", unita: "ml", prezzo: 8, note: "Posa e fornitura", iva: 22 },
  // Impianto Idraulico
  { id: 16, categoria: "Idraulica", voce: "Punto acqua", unita: "cad", prezzo: 120, note: "Caldo e freddo", iva: 22 },
  { id: 17, categoria: "Idraulica", voce: "Punto scarico", unita: "cad", prezzo: 95, note: "Incluso collegamento", iva: 22 },
  { id: 18, categoria: "Idraulica", voce: "Installazione piatto doccia", unita: "cad", prezzo: 280, note: "Escluso piatto", iva: 22 },
  { id: 19, categoria: "Idraulica", voce: "Installazione WC", unita: "cad", prezzo: 180, note: "Escluso sanitario", iva: 22 },
  { id: 20, categoria: "Idraulica", voce: "Installazione lavabo", unita: "cad", prezzo: 150, note: "Escluso lavabo", iva: 22 },
  { id: 21, categoria: "Idraulica", voce: "Installazione caldaia", unita: "cad", prezzo: 450, note: "A condensazione", iva: 22 },
  // Impianto Elettrico
  { id: 22, categoria: "Elettricità", voce: "Punto luce", unita: "cad", prezzo: 65, note: "Incluso cablaggio", iva: 22 },
  { id: 23, categoria: "Elettricità", voce: "Punto presa", unita: "cad", prezzo: 55, note: "Schuko o bipasso", iva: 22 },
  { id: 24, categoria: "Elettricità", voce: "Quadro elettrico", unita: "cad", prezzo: 380, note: "Fino a 12 moduli", iva: 22 },
  { id: 25, categoria: "Elettricità", voce: "Impianto elettrico completo", unita: "mq", prezzo: 45, note: "A norma CEI", iva: 22 },
  // Pittura
  { id: 26, categoria: "Pittura", voce: "Tinteggiatura pareti", unita: "mq", prezzo: 8, note: "Due mani", iva: 22 },
  { id: 27, categoria: "Pittura", voce: "Tinteggiatura soffitto", unita: "mq", prezzo: 10, note: "Due mani", iva: 22 },
  { id: 28, categoria: "Pittura", voce: "Stucco veneziano", unita: "mq", prezzo: 45, note: "Finitura decorativa", iva: 22 },
  // Infissi
  { id: 29, categoria: "Infissi", voce: "Porta interna tamburata", unita: "cad", prezzo: 350, note: "Incluso controtelaio", iva: 22 },
  { id: 30, categoria: "Infissi", voce: "Finestra PVC doppio vetro", unita: "mq", prezzo: 280, note: "Classe A", iva: 22 },
  { id: 31, categoria: "Infissi", voce: "Portoncino blindato", unita: "cad", prezzo: 1200, note: "Classe 3", iva: 22 },
  // Varie
  { id: 32, categoria: "Varie", voce: "Trasporto e smaltimento macerie", unita: "cad", prezzo: 250, note: "A corpo - prezzo modificabile", iva: 22 },
  { id: 33, categoria: "Varie", voce: "Ponteggio esterno", unita: "mq", prezzo: 18, note: "A mese, incluso montaggio", iva: 22 },
  { id: 34, categoria: "Varie", voce: "Pulizia fine cantiere", unita: "cad", prezzo: 300, note: "A corpo - prezzo modificabile", iva: 22 },
];

// ========== AI SIMULATION ==========
function parseVoiceToQuote(transcript, priceDB) {
  const text = transcript.toLowerCase();
  const matchedItems = [];

  const keywords = {
    "bagno": [
      { voce: "Demolizione rivestimento bagno", qta: 25 },
      { voce: "Rimozione vasca da bagno", qta: 1 },
      { voce: "Rimozione sanitari", qta: 3 },
      { voce: "Punto acqua", qta: 3 },
      { voce: "Punto scarico", qta: 2 },
      { voce: "Posa rivestimento bagno", qta: 25 },
      { voce: "Posa pavimento gres", qta: 6 },
      { voce: "Installazione piatto doccia", qta: 1 },
      { voce: "Installazione WC", qta: 1 },
      { voce: "Installazione lavabo", qta: 1 },
    ],
    "doccia": [{ voce: "Rimozione vasca da bagno", qta: 1 }, { voce: "Installazione piatto doccia", qta: 1 }],
    "vasca": [{ voce: "Rimozione vasca da bagno", qta: 1 }],
    "paviment": [{ voce: "Demolizione pavimento", qta: 40 }, { voce: "Massetto tradizionale", qta: 40 }, { voce: "Posa pavimento gres", qta: 40 }, { voce: "Battiscopa in gres", qta: 24 }],
    "piastrell": [{ voce: "Posa pavimento gres", qta: 20 }, { voce: "Posa rivestimento bagno", qta: 15 }],
    "elettric": [{ voce: "Impianto elettrico completo", qta: 60 }, { voce: "Quadro elettrico", qta: 1 }],
    "punto luce": [{ voce: "Punto luce", qta: 10 }],
    "presa": [{ voce: "Punto presa", qta: 8 }],
    "caldaia": [{ voce: "Installazione caldaia", qta: 1 }],
    "pittura": [{ voce: "Tinteggiatura pareti", qta: 80 }, { voce: "Tinteggiatura soffitto", qta: 40 }],
    "tintegg": [{ voce: "Tinteggiatura pareti", qta: 80 }, { voce: "Tinteggiatura soffitto", qta: 40 }],
    "imbianc": [{ voce: "Tinteggiatura pareti", qta: 80 }, { voce: "Tinteggiatura soffitto", qta: 40 }],
    "cartongesso": [{ voce: "Costruzione tramezza in cartongesso", qta: 12 }],
    "tramezzo": [{ voce: "Costruzione tramezza in laterizio", qta: 10 }],
    "tramezza": [{ voce: "Costruzione tramezza in laterizio", qta: 10 }],
    "demoliz": [{ voce: "Demolizione pavimento", qta: 20 }, { voce: "Trasporto e smaltimento macerie", qta: 1 }],
    "infiss": [{ voce: "Finestra PVC doppio vetro", qta: 4 }],
    "finestra": [{ voce: "Finestra PVC doppio vetro", qta: 2 }],
    "finestre": [{ voce: "Finestra PVC doppio vetro", qta: 4 }],
    "porta": [{ voce: "Porta interna tamburata", qta: 1 }],
    "porte": [{ voce: "Porta interna tamburata", qta: 4 }],
    "portoncino": [{ voce: "Portoncino blindato", qta: 1 }],
    "blindat": [{ voce: "Portoncino blindato", qta: 1 }],
    "intonac": [{ voce: "Intonaco civile", qta: 30 }],
    "rasat": [{ voce: "Rasatura pareti", qta: 50 }],
    "controsoffitto": [{ voce: "Controsoffitto in cartongesso", qta: 15 }],
    "massetto": [{ voce: "Massetto tradizionale", qta: 30 }],
    "pulizia": [{ voce: "Pulizia fine cantiere", qta: 1 }],
    "smaltimento": [{ voce: "Trasporto e smaltimento macerie", qta: 1 }],
    "ponteggio": [{ voce: "Ponteggio esterno", qta: 50 }],
    "stucco veneziano": [{ voce: "Stucco veneziano", qta: 20 }],
    "ristruttur": [
      { voce: "Demolizione pavimento", qta: 50 },
      { voce: "Trasporto e smaltimento macerie", qta: 1 },
      { voce: "Massetto tradizionale", qta: 50 },
      { voce: "Posa pavimento gres", qta: 50 },
      { voce: "Battiscopa in gres", qta: 30 },
      { voce: "Rasatura pareti", qta: 120 },
      { voce: "Tinteggiatura pareti", qta: 120 },
      { voce: "Tinteggiatura soffitto", qta: 50 },
      { voce: "Pulizia fine cantiere", qta: 1 },
    ],
  };

  // Detect numbers for area
  const areaMatch = text.match(/(\d+)\s*(mq|metri quadr)/);
  const area = areaMatch ? parseInt(areaMatch[1]) : null;

  const addedVoci = new Set();

  for (const [keyword, items] of Object.entries(keywords)) {
    if (text.includes(keyword)) {
      for (const item of items) {
        if (!addedVoci.has(item.voce)) {
          const dbItem = priceDB.find(p => p.voce === item.voce);
          if (dbItem) {
            let qta = item.qta;
            if (area && (dbItem.unita === "mq" || dbItem.unita === "ml")) {
              qta = dbItem.unita === "ml" ? Math.round(Math.sqrt(area) * 4) : area;
            }
            matchedItems.push({
              ...dbItem,
              quantita: qta,
              totale: qta * dbItem.prezzo
            });
            addedVoci.add(item.voce);
          }
        }
      }
    }
  }

  if (matchedItems.length === 0) {
    return null;
  }

  return matchedItems;
}

// ========== COMPONENTS ==========

const LOGO_BASE64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QC8RXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABgAAAAAQAAAGAAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAMAAQAAAPQBAAADoAMAAQAAAPQBAAAAAAAA/+EONmh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI2LTAxLTIxPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjgyYWI4YTllLTBkMmUtNDBlMC1iN2Q2LWI4ZjU2MmIxNDUwMzwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5Mb2dvIFByb3RvY29sbG8gRWRpbGUgLSAzPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpwZGY9J2h0dHA6Ly9ucy5hZG9iZS5jb20vcGRmLzEuMy8nPgogIDxwZGY6QXV0aG9yPkFuZHJlYSBJYW5udXp6aTwvcGRmOkF1dGhvcj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6eG1wPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvJz4KICA8eG1wOkNyZWF0b3JUb29sPkNhbnZhIChSZW5kZXJlcikgZG9jPURBR19CeXdKb1BvIHVzZXI9VUFETWppQjhqNjggYnJhbmQ9U2hhcmVkPC94bXA6Q3JlYXRvclRvb2w+CiA8L3JkZjpEZXNjcmlwdGlvbj4KPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0ndyc/Pv/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/AABEIAfQB9AMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APlSiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACprO1nvbqK2tImlnlYKiKOSahr0T4J2In8SXN265FtAdp9GY4H6bqxxFX2NKVTsdODw/1mvGj3Zmj4beJiAfsUY9vPT/Gj/hW3ib/AJ84v+/6f419AUV8/wD2xX7L8f8AM+w/1bwneX3r/I+a9f8ACes6DbpPqVp5cDNtEiurgH0ODxWDX0z4ysBqXhbU7YruZoGZB/tKNy/qBXzNXr5fi3ioNy3R87nGXRwNVKm24tdQooorvPICiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooo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28sLeCFGYKGdluABk8CuT1T9n/4g6Zpl3f3ml2yW1rC88rC8iJCKpYnAPPANAHk9e2fsg/8AJZIP+vGf+QrxOvbP2Qf+SyQf9eM/8hQB5BrX/IZv/wDr4k/9CNe3/BOVtZ+BnxV0TUD5thY2i6hbq3Ijl2yNx6ZMKfr61n3/AOzv4/n1O6nmtdOtLaSV386e+jCqpJOTgk/pV3xZq/h/4ZfC7UPAvhrVoNa8Q6zIDq1/anMMKD/lkrd+hX8WJxkCgDwaveP2Tf8AkLeNf+wDN/6EteD17x+yb/yFvGv/AGAZv/QloA8Hr0v9m7/kt3hb/rtJ/wCiXrzSvS/2bv8Akt3hb/rtJ/6JegDnviv/AMlS8Y/9hm8/9HvXK17/AOP/AIB/EDWPHfiPU7DS7d7O91K5uYWN5EpZHlZlOC2RwRxXgk8TwTyRSDDxsVYe4ODQB7j+xt/yVuf/ALBc3/ocdZF38KfC8FrNLH8VPDUzxozLGoOXIGcD5uprX/Y2/wCStz/9gub/ANDjrL/4Zx+JH/QJtf8AwNi/+KoA8eoqa8t5LO7ntpwFmhdo3AOcMDg/yqGgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//Z";

function Header({ currentView, onNavigate, userProfile, onLogout }) {
  const logoSrc = userProfile?.logo || LOGO_BASE64;
  const nomeAzienda = userProfile?.nomeAzienda || "Protocollo Edile";
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-4 safe-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-white" />
          <div>
            <h1 className="text-lg font-bold">{nomeAzienda}</h1>
            <p className="text-xs opacity-80">Preventivo Intelligente</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/20 rounded-lg transition" title="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg py-1 min-w-[180px] z-50">
              <button onClick={() => { onNavigate("profilo"); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profilo Azienda
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
function HomeView({ onNavigate, stats, userProfile, trialEnd, subscriptionStatus, onShowPricing }) {
  const nomeUtente = userProfile?.nome ? userProfile.nome : "";
  return (
    <div className="p-5 space-y-5">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-gray-800">{nomeUtente ? `Ciao ${nomeUtente}! 👋` : "Ciao! 👋"}</h2>
        <p className="text-gray-500 mt-1">Cosa vuoi fare oggi?</p>
      </div>

      <button onClick={() => {
        const p = userProfile || {};
        if (!p.nome || !p.cognome || !p.nomeAzienda || !p.piva || !p.email || !p.telefono || !p.indirizzo) {
          alert("Completa il tuo profilo prima di creare un preventivo. Vai su Profilo Azienda e compila tutti i campi obbligatori (Nome, Cognome, Nome Azienda, P.IVA, Email, Telefono, Indirizzo).");
          onNavigate("profilo");
          return;
        }
        onNavigate("nuovo");
      }} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 rounded-2xl flex items-center gap-4 shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] active:scale-[0.98]">
        <div className="bg-white/20 p-3 rounded-xl">
          <Mic size={28} />
        </div>
        <div className="text-left">
          <p className="font-bold text-lg">Nuovo Preventivo</p>
          <p className="text-orange-100 text-sm">Parla e l'AI crea il preventivo</p>
        </div>
        <ChevronRight size={20} className="ml-auto" />
      </button>

      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => onNavigate("database")} className="bg-white border-2 border-gray-100 p-4 rounded-2xl text-left hover:border-orange-200 transition">
          <Database size={22} className="text-orange-500 mb-2" />
          <p className="font-semibold text-gray-800 text-xs">Prezzi</p>
          <p className="text-gray-400 text-xs mt-0.5">{stats.totalPrices} voci</p>
        </button>
        <button onClick={() => onNavigate("clienti")} className="bg-white border-2 border-gray-100 p-4 rounded-2xl text-left hover:border-orange-200 transition">
          <Users size={22} className="text-orange-500 mb-2" />
          <p className="font-semibold text-gray-800 text-xs">Clienti</p>
          <p className="text-gray-400 text-xs mt-0.5">{stats.totalClients} clienti</p>
        </button>
        <button onClick={() => onNavigate("storico")} className="bg-white border-2 border-gray-100 p-4 rounded-2xl text-left hover:border-orange-200 transition">
          <FileText size={22} className="text-orange-500 mb-2" />
          <p className="font-semibold text-gray-800 text-xs">Storico</p>
          <p className="text-gray-400 text-xs mt-0.5">{stats.totalQuotes} prev.</p>
        </button>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
        <p className="text-orange-800 font-semibold text-sm">💡 Come funziona</p>
        <ol className="text-orange-700 text-xs mt-2 space-y-1">
          <li>1. Premi il microfono e descrivi il lavoro</li>
          <li>2. L'AI analizza e genera il preventivo</li>
          <li>3. Modifica se serve, poi scarica il PDF</li>
        </ol>
      </div>
    
      {subscriptionStatus === "trialing" && trialEnd && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center space-y-2">
          <p className="text-sm text-gray-600">Il tuo abbonamento gratuito scadrà il <span className="font-bold text-orange-600">{new Date(trialEnd).toLocaleDateString("it-IT")}</span></p>
          <button onClick={onShowPricing} className="text-orange-500 font-semibold text-sm hover:underline">Abbonati ora a €47/mese →</button>
        </div>
      )}
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
          setSubscriptionStatus(profileData.subscription_status || "none");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    setUserProfile(null);
    onNavigate("home");
  };

  return (
    <div className="p-5 space-y-4">
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

function QuoteEditor({ items, setItems, clientInfo, setClientInfo, onGeneratePDF, onBack, transcript, discount, setDiscount, margin, setMargin, clients, scadenza, setScadenza, pagamento, setPagamento, photos, setPhotos, prices, descrizione, setDescrizione, firmaImpresa, setFirmaImpresa, luogoFirma, setLuogoFirma, isEditing, onSaveOnly, onNavigate }) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showDBPicker, setShowDBPicker] = useState(false);
  const [dbSearch, setDbSearch] = useState("");
  const [isReformulating, setIsReformulating] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validateAndSubmit = () => {
    const errors = [];
    if (!clientInfo.nome?.trim()) errors.push("Nome cliente");
    if (!clientInfo.indirizzo?.trim()) errors.push("Indirizzo");
    if (!clientInfo.telefono?.trim() && !clientInfo.email?.trim()) errors.push("Telefono o Email");
    if (!descrizione?.trim()) errors.push("Descrizione lavoro");
    if (!items || items.length === 0) errors.push("Almeno una voce di preventivo");
    if (!scadenza) errors.push("Data di scadenza");
    const totPerc = pagamento.reduce((s, f) => s + f.percentuale, 0);
    if (totPerc !== 100) errors.push("Modalità di pagamento (totale deve essere 100%)");

    if (errors.length > 0) {
      setValidationError("Campi obbligatori mancanti: " + errors.join(", "));
      return;
    }
    setValidationError("");
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

  const reformulateDescription = () => {
    if (!descrizione || !descrizione.trim()) return;
    setIsReformulating(true);
    // Simulazione AI: riformulazione intelligente
    setTimeout(() => {
      const text = descrizione.trim();
      // Capitalizza prima lettera, correggi punteggiatura
      let improved = text.charAt(0).toUpperCase() + text.slice(1);
      // Aggiungi punto finale se manca
      if (!/[.!]$/.test(improved)) improved += ".";
      // Migliora struttura: sostituisci virgole consecutive con punto e a capo
      improved = improved.replace(/\s*,\s*,\s*/g, ". ");
      // Espandi abbreviazioni comuni edilizia
      improved = improved.replace(/\brist\.\s*/gi, "ristrutturazione ");
      improved = improved.replace(/\bdemol\.\s*/gi, "demolizione ");
      improved = improved.replace(/\bpav\.\s*/gi, "pavimentazione ");
      improved = improved.replace(/\brivestim\.\s*/gi, "rivestimento ");
      improved = improved.replace(/\bimp\.\s*/gi, "impianto ");
      improved = improved.replace(/\belettric\.\s*/gi, "elettrico ");
      improved = improved.replace(/\bidraul\.\s*/gi, "idraulico ");
      // Aggiungi contesto professionale
      const hasIntro = /^(i lavori|il progetto|l'intervento|la ristrutturazione|si prevede)/i.test(improved);
      if (!hasIntro) {
        improved = "I lavori prevedono: " + improved.charAt(0).toLowerCase() + improved.slice(1);
      }
      // Migliora congiunzioni
      improved = improved.replace(/\s+e\s+e\s+/g, " e ");
      improved = improved.replace(/\.\s*\./g, ".");
      // Aggiungi chiusura professionale se manca
      if (improved.length > 50 && !/inclus[oiae]|compres[oiae]|sarà|saranno|previsti/i.test(improved)) {
        improved += " Tutti i lavori saranno eseguiti a regola d'arte e nel rispetto delle normative vigenti.";
      }
      setDescrizione(improved);
      setIsReformulating(false);
    }, 1200);
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
    const aliquota = item.iva || 22;
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
            onChange={(e) => {
              const c = clients.find(cl => cl.id === parseInt(e.target.value));
              if (c) setClientInfo({ nome: c.nome, indirizzo: c.indirizzo || "", telefono: c.whatsapp || "", email: c.email || "", codiceFiscale: c.codiceFiscale || "", tipo: c.tipo || "Privato" });
            }}
            className="w-full p-2 border border-orange-300 rounded-lg text-sm focus:outline-none bg-orange-50 text-orange-700"
          >
            <option value="">Seleziona dal database clienti...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.tipo})</option>)}
          </select>
        )}
        <input value={clientInfo.nome} onChange={(e) => setClientInfo({ ...clientInfo, nome: e.target.value })} placeholder="Nome cliente *" className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" />
        <input value={clientInfo.indirizzo} onChange={(e) => setClientInfo({ ...clientInfo, indirizzo: e.target.value })} placeholder="Indirizzo" className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" />
        <div className="grid grid-cols-2 gap-2">
          <input value={clientInfo.telefono} onChange={(e) => setClientInfo({ ...clientInfo, telefono: e.target.value })} placeholder="Telefono/WhatsApp" className="p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" />
          <input value={clientInfo.email || ""} onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })} placeholder="Email" className="p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" />
        </div>
        <input value={clientInfo.codiceFiscale || ""} onChange={(e) => setClientInfo({ ...clientInfo, codiceFiscale: e.target.value })} placeholder="Codice Fiscale / P.IVA" className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-orange-400 focus:outline-none" />
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
            <input
              type="number"
              value={fase.percentuale}
              onChange={(e) => { const u = [...pagamento]; u[i] = { ...u[i], percentuale: parseFloat(e.target.value) || 0 }; setPagamento(u); }}
              className="w-16 p-2 border border-gray-200 rounded-lg text-sm text-center focus:border-orange-400 focus:outline-none"
              min="0" max="100"
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
                  onClick={() => { setShowDBPicker(true); setShowAddMenu(false); }}
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
        </div>

        {/* Picker dal database prezzi */}
        {showDBPicker && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-orange-700">Seleziona dal database</p>
              <button onClick={() => { setShowDBPicker(false); setDbSearch(""); }} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
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
                      setItems([...items, { voce: p.voce, categoria: p.categoria, unita: p.unita, quantita: 1, prezzo: p.prezzo, iva: p.iva || 22 }]);
                      setShowDBPicker(false);
                      setDbSearch("");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-100 transition flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.voce}</p>
                      <p className="text-[10px] text-gray-400">{p.categoria} · {p.unita} · IVA {p.iva || 22}%</p>
                    </div>
                    <span className="text-xs font-semibold text-orange-600">€ {p.prezzo}</span>
                  </button>
                ))
              }
            </div>
          </div>
        )}

        {items.map((item, i) => (
          <div key={i} className={`bg-white border rounded-xl p-3 ${item.categoria === "Personalizzata" ? "border-orange-300 bg-orange-50" : "border-gray-200"}`}>
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
                        value={item.iva || 22}
                        onChange={(e) => updateItem(i, "iva", parseInt(e.target.value))}
                        className="text-gray-400 text-xs bg-transparent border-b border-dashed border-gray-300 focus:outline-none"
                      >
                        <option value={4}>IVA 4%</option>
                        <option value={10}>IVA 10%</option>
                        <option value={22}>IVA 22%</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-800 text-sm">{item.voce}</p>
                    <p className="text-gray-400 text-xs">{item.categoria}</p>
                  </>
                )}
              </div>
              <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-1">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={item.quantita}
                  onChange={(e) => updateItem(i, "quantita", parseFloat(e.target.value) || 0)}
                  className="w-16 p-1 border border-gray-200 rounded text-center text-sm focus:border-orange-400 focus:outline-none"
                />
                <span className="text-gray-400 text-xs">{item.unita}</span>
              </div>
              <span className="text-gray-300">×</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-xs">€</span>
                <input
                  type="number"
                  value={item.prezzo}
                  onChange={(e) => updateItem(i, "prezzo", parseFloat(e.target.value) || 0)}
                  className="w-20 p-1 border border-gray-200 rounded text-center text-sm focus:border-orange-400 focus:outline-none"
                />
              </div>
              <span className="text-gray-300">=</span>
              <span className="font-semibold text-gray-800 text-sm ml-auto">
                € {(item.quantita * item.prezzo).toLocaleString("it-IT", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MARGINE DI GUADAGNO */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-800">📊 Margine di guadagno</p>
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
            <input
              type="number"
              value={margin.valore}
              onChange={(e) => setMargin({ ...margin, valore: parseFloat(e.target.value) || 0 })}
              className="flex-1 p-2 border border-blue-200 rounded-lg text-sm text-center focus:border-blue-400 focus:outline-none"
              min="0"
            />
            <span className="text-blue-400 text-xs ml-auto whitespace-nowrap">
              + € {importoMargine.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
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
            <input
              type="number"
              value={discount.valore}
              onChange={(e) => setDiscount({ ...discount, valore: parseFloat(e.target.value) || 0 })}
              placeholder={discount.tipo === "percentuale" ? "Es: 10" : "Es: 500"}
              className="flex-1 p-2 border border-green-200 rounded-lg text-sm focus:border-green-400 focus:outline-none"
              min="0"
            />
            {discount.valore > 0 && (
              <span className="text-green-600 text-xs font-medium whitespace-nowrap">
                - € {importoSconto.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* RIEPILOGO TOTALI */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotale voci</span>
          <span>€ {subtotale.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
        </div>
        {margin.enabled && importoMargine > 0 && (
          <div className="flex justify-between text-sm text-blue-600">
            <span>Margine {margin.tipo === "percentuale" ? `(${margin.valore}%)` : "fisso"}</span>
            <span>+ € {importoMargine.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        {discount.enabled && importoSconto > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Sconto {discount.tipo === "percentuale" ? `(${discount.valore}%)` : "fisso"}</span>
            <span>- € {importoSconto.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        {(margin.enabled || (discount.enabled && importoSconto > 0)) && (
          <div className="flex justify-between text-sm text-gray-600 border-t border-gray-200 pt-1">
            <span>Imponibile</span>
            <span>€ {subtotaleScontato.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        {ivaDettaglio.map((d, i) => (
          <div key={i} className="flex justify-between text-sm text-gray-600">
            <span>IVA {d.aliquota}%</span>
            <span>€ {d.importo.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
          <span>TOTALE</span>
          <span className="text-orange-600 text-lg">€ {totale.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

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
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const remaining = 10 - photos.length;
                  const toAdd = files.slice(0, remaining);
                  toAdd.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setPhotos(prev => [...prev, { id: Date.now() + Math.random(), name: file.name, data: ev.target.result }].slice(0, 10));
                    };
                    reader.readAsDataURL(file);
                  });
                  e.target.value = "";
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
                <img src={photo.data} alt={photo.name} className="w-full h-16 object-cover rounded-lg border border-gray-200" />
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
  const [newItem, setNewItem] = useState({ categoria: "", voce: "", unita: "mq", prezzo: 0, note: "", iva: 22 });
  const ivaOptions = [4, 10, 22];

  const categories = [...new Set(prices.map(p => p.categoria))];
  const [selectedCat, setSelectedCat] = useState("Tutte");

  const filtered = prices.filter(p => {
    const matchSearch = p.voce.toLowerCase().includes(search.toLowerCase()) || p.categoria.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === "Tutte" || p.categoria === selectedCat;
    return matchSearch && matchCat;
  });

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValues({ prezzo: item.prezzo, note: item.note, iva: item.iva || 22 });
  };

  const saveEdit = (id) => {
    setPrices(prices.map(p => p.id === id ? { ...p, ...editValues } : p));
    setEditingId(null);
  };

  const addItem = () => {
    if (newItem.voce && newItem.categoria) {
      setPrices([...prices, { ...newItem, id: Date.now(), prezzo: parseFloat(newItem.prezzo) }]);
      setNewItem({ categoria: "", voce: "", unita: "mq", prezzo: 0, note: "", iva: 22 });
      setShowAdd(false);
    }
  };

  const deleteItem = (id) => {
    setPrices(prices.filter(p => p.id !== id));
  };

  return (
    <div className="p-4 space-y-4">
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
          <span className="font-semibold">Inserisci i prezzi per il cliente finale</span>, già comprensivi del tuo ricarico/guadagno. Questi sono i prezzi che compariranno direttamente nel preventivo.
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
            <input type="number" value={newItem.prezzo} onChange={(e) => setNewItem({...newItem, prezzo: e.target.value})} placeholder="Prezzo €" className="flex-1 p-2 border border-orange-200 rounded-lg text-sm focus:outline-none" />
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
                  <span className="text-xs text-gray-400">€</span>
                  <input type="number" value={editValues.prezzo} onChange={(e) => setEditValues({...editValues, prezzo: parseFloat(e.target.value)})} className="w-24 p-1 border border-orange-300 rounded text-sm text-center focus:outline-none" />
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
                  <p className="text-xs text-gray-400">{item.categoria} · {item.note} · <span className="text-orange-500">IVA {item.iva || 22}%</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-orange-600 text-sm">€{item.prezzo}/{item.unita}</span>
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
    <div className="p-4 space-y-4">
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
function PricingPage({ onSubscribe, onLogout, userEmail }) {
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePromo = () => {
    if (promoCode.trim().toUpperCase() === "PROVA14") {
      setLoading(true);
      onSubscribe("PROVA14");
    } else {
      setPromoError("Codice non valido");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏗️</div>
          <h1 className="text-3xl font-bold text-gray-800">Preventivo Intelligente</h1>
          <p className="text-gray-500 mt-2">Scegli il tuo piano per iniziare</p>
          {userEmail && <p className="text-xs text-gray-400 mt-1">{userEmail}</p>}
        </div>
        <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-400 overflow-hidden">
          <div className="bg-orange-500 text-white text-center py-3 font-bold text-lg">Piano Pro</div>
          <div className="p-6">
            <div className="text-center mb-6">
              <span className="text-5xl font-bold text-gray-800">€47</span>
              <span className="text-gray-500">/mese</span>
            </div>
            <ul className="space-y-3 mb-6">
              {["Preventivi illimitati", "Generazione PDF professionale", "Invio WhatsApp ed Email", "Prompt vocale AI", "Gestione clienti", "Prezzario personalizzabile", "Aggiornamenti continui", "Supporto prioritario", "Supporto WhatsApp 7/7"].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={() => { setLoading(true); onSubscribe(null); }} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
              {loading ? "Reindirizzamento..." : "Abbonati ora"}
            </button>
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-gray-500 text-center mb-2">Hai un codice promozionale?</p>
              <div className="flex gap-2">
                <input type="text" value={promoCode} onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); }} placeholder="Inserisci codice" className="flex-1 border rounded-lg px-3 py-2 text-sm"/>
                <button onClick={handlePromo} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition">Applica</button>
              </div>
              {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="w-full mt-4 text-gray-400 hover:text-gray-600 text-sm py-2 transition">Esci dall'account</button>
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

function QuoteDetailView({ quote, onBack, onDownloadPDF, onEdit }) {
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
    const aliquota = item.iva || 22;
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
    <div className="p-4 space-y-4">
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
              <span>€ {item.prezzo.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
              <span className="text-gray-300">=</span>
              <span className="font-semibold text-gray-800 ml-auto">
                € {(item.quantita * item.prezzo).toLocaleString("it-IT", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotale voci</span>
          <span>€ {subtotale.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
        </div>
        {marginEnabled && importoMargine > 0 && (
          <div className="flex justify-between text-sm text-blue-600">
            <span>Margine {marginTipo === "percentuale" ? `(${marginPerc}%)` : "fisso"}</span>
            <span>+ € {importoMargine.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        {discountValore > 0 && importoSconto > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Sconto {discountTipo === "percentuale" ? `(${discountValore}%)` : "fisso"}</span>
            <span>- € {importoSconto.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        {(marginEnabled || (discountValore > 0 && importoSconto > 0)) && (
          <div className="flex justify-between text-sm text-gray-600 border-t border-gray-200 pt-1">
            <span>Imponibile</span>
            <span>€ {subtotaleScontato.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        {ivaDettaglio.map((d, i) => (
          <div key={i} className="flex justify-between text-sm text-gray-600">
            <span>IVA {d.aliquota}%</span>
            <span>€ {d.importo.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
          <span>TOTALE</span>
          <span className="text-orange-600 text-lg">€ {totale.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

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

      <ShareButton quote={quote} onDownloadPDF={onDownloadPDF} />

      <p className="text-center text-xs text-gray-400">
        Preventivo valido 30 giorni dalla data di emissione
      </p>
    </div>
  );
}

function StoricoView({ quotes, onViewQuote }) {
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
    <div className="p-4 space-y-3">
      <h2 className="font-bold text-gray-800 text-lg">Storico Preventivi</h2>
      {quotes.map((q, i) => (
        <button
          key={i}
          onClick={() => onViewQuote(q, i)}
          className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-gray-800">{q.cliente || "Cliente senza nome"}</p>
              <p className="text-gray-400 text-xs mt-1">{q.data}</p>
            </div>
            <span className="font-bold text-orange-600">€ {q.totale.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-500 text-xs">{q.voci} voci · {q.descrizione?.substring(0, 50)}...</p>
            <div className="flex items-center gap-1 text-orange-500 text-xs font-medium">
              <Eye size={12} />
              <span>Apri</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function NuovoPreventivo({ prices, clients, onSaveQuote, onNavigate, onDownloadPDF, initialData, userProfile }) {
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
  const [luogoFirma, setLuogoFirma] = useState(isEditing ? (initialData.luogoFirma || "") : (userProfile?.indirizzo ? userProfile.indirizzo.split(",").pop().trim() : ""));

  const handleTranscript = (text) => {
    setTranscript(text);
    setDescrizione(text);
    const result = parseVoiceToQuote(text, prices);
    if (result) {
      setItems(result);
      setStep("edit");
      setError("");
    } else {
      setError("Non sono riuscito a identificare i lavori dalla descrizione. Prova ad essere più specifico (es: 'ristrutturazione bagno', 'impianto elettrico', 'posa pavimento 40mq').");
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
      const aliquota = item.iva || 22;
      const importoVoce = item.quantita * item.prezzo;
      ivaTotal += (importoVoce * proporzione) * (aliquota / 100);
    });
    const totale = subtotaleScontato + ivaTotal;

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
      luogoFirma: luogoFirma
    };

    onSaveQuote(savedQuote);
    setLastSavedQuote(savedQuote);
    setStep("done");
  };

  return (
    <div className="p-4">
      {step === "voice" && (
        <div className="space-y-4">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Nuovo Preventivo</h2>
            <p className="text-gray-400 text-sm">Descrivi il lavoro a voce o per scritto</p>
          </div>
          <VoiceRecorder onTranscriptComplete={handleTranscript} />
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
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
    const aliquota = item.iva || 22;
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

  let tableRows = "";
  Object.entries(grouped).forEach(([cat, items]) => {
    tableRows += `<tr><td colspan="6" style="background:#FFF7ED;padding:8px 12px;font-weight:700;color:#EA580C;font-size:13px;border-bottom:1px solid #FED7AA;">${cat}</td></tr>`;
    items.forEach(item => {
      tableRows += `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #F3F4F6;font-size:12px;color:#374151;">${item.voce}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #F3F4F6;font-size:12px;color:#6B7280;text-align:center;">${item.quantita}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #F3F4F6;font-size:12px;color:#6B7280;text-align:center;">${item.unita}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #F3F4F6;font-size:12px;color:#6B7280;text-align:right;">€ ${fmt(item.prezzo)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #F3F4F6;font-size:12px;color:#6B7280;text-align:center;">${item.iva || 22}%</td>
        <td style="padding:8px 12px;border-bottom:1px solid #F3F4F6;font-size:12px;color:#1F2937;text-align:right;font-weight:600;">€ ${fmt(item.quantita * item.prezzo)}</td>
      </tr>`;
    });
  });

  let totaliRows = `<tr><td style="padding:6px 12px;font-size:12px;color:#6B7280;">Subtotale voci</td><td style="padding:6px 12px;font-size:12px;color:#6B7280;text-align:right;">€ ${fmt(subtotale)}</td></tr>`;
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

  <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:24px;">
    <p style="margin:0 0 4px;font-size:11px;color:#9CA3AF;font-weight:600;text-transform:uppercase;">Dati Cliente</p>
    <p style="margin:0;font-size:15px;font-weight:600;color:#1F2937;">${quote.cliente || "—"}</p>
    ${quote.clientInfo?.indirizzo ? `<p style="margin:2px 0 0;font-size:13px;color:#6B7280;">${quote.clientInfo.indirizzo}</p>` : ""}
    ${quote.clientInfo?.telefono ? `<p style="margin:2px 0 0;font-size:13px;color:#6B7280;">Tel: ${quote.clientInfo.telefono}</p>` : ""}
  </div>

  ${quote.descrizione ? `<div style="background:#FFF7ED;border-radius:8px;padding:12px 16px;margin-bottom:24px;overflow:hidden;box-sizing:border-box;">
    <p style="margin:0 0 4px;font-size:11px;color:#9CA3AF;font-weight:600;text-transform:uppercase;">Descrizione Lavoro</p>
    <p style="margin:0;font-size:13px;color:#6B7280;word-wrap:break-word;overflow-wrap:break-word;white-space:pre-wrap;">${quote.descrizione}</p>
  </div>` : ""}

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:#1F2937;">
        <th style="padding:10px 12px;text-align:left;font-size:11px;color:#fff;font-weight:600;text-transform:uppercase;">Voce</th>
        <th style="padding:10px 12px;text-align:center;font-size:11px;color:#fff;font-weight:600;text-transform:uppercase;">Q.tà</th>
        <th style="padding:10px 12px;text-align:center;font-size:11px;color:#fff;font-weight:600;text-transform:uppercase;">U.M.</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;color:#fff;font-weight:600;text-transform:uppercase;">Prezzo</th>
        <th style="padding:10px 12px;text-align:center;font-size:11px;color:#fff;font-weight:600;text-transform:uppercase;">IVA</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;color:#fff;font-weight:600;text-transform:uppercase;">Totale</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div style="margin-left:auto;width:300px;">
    <table style="width:100%;border-collapse:collapse;">${totaliRows}</table>
  </div>

  ${(quote.pagamento && quote.pagamento.length > 0) ? `
  <div style="margin-top:24px;background:#F9FAFB;border-radius:8px;padding:16px;">
    <p style="margin:0 0 8px;font-size:11px;color:#9CA3AF;font-weight:600;text-transform:uppercase;">Modalità di Pagamento</p>
    ${quote.pagamento.map(f => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#6B7280;">
      <span>${f.fase}</span><span style="font-weight:600;color:#1F2937;">${f.percentuale}% — € ${fmt(totale * f.percentuale / 100)}</span>
    </div>`).join("")}
  </div>` : ""}

  ${(quote.photos && quote.photos.length > 0) ? `
  <div style="margin-top:24px;page-break-before:auto;">
    <p style="margin:0 0 12px;font-size:11px;color:#9CA3AF;font-weight:600;text-transform:uppercase;">Foto Sopralluogo</p>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
      ${quote.photos.map(p => `<img src="${p.data}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;border:1px solid #E5E7EB;" />`).join("")}
    </div>
  </div>` : ""}

  ${(quote.luogoFirma || quote.firmaImpresa) ? `
  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #E5E7EB;">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;">
      <div>
        <p style="margin:0;font-size:12px;color:#6B7280;">${quote.luogoFirma ? quote.luogoFirma + ", " : ""}${quote.data || new Date().toLocaleDateString("it-IT")}</p>
      </div>
      <div style="text-align:center;">
        <p style="margin:0;font-size:11px;color:#9CA3AF;text-transform:uppercase;">L'Impresa</p>
        ${quote.firmaImpresa ? `<p style="margin:8px 0 4px;font-family:'Brush Script MT','Segoe Script','Dancing Script',cursive;font-size:28px;color:#1F2937;">${quote.firmaImpresa}</p>` : ""}
        <div style="border-top:1px solid #9CA3AF;width:200px;margin:0 auto;"></div>
      </div>
    </div>
  </div>` : ""}

  <div style="margin-top:${(quote.luogoFirma || quote.firmaImpresa) ? "20" : "40"}px;padding-top:16px;border-top:1px solid #E5E7EB;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9CA3AF;">Preventivo valido ${quote.scadenza ? `fino al ${new Date(quote.scadenza).toLocaleDateString("it-IT")}` : "30 giorni dalla data di emissione"}</p>
    <p style="margin:4px 0 0;font-size:11px;color:#9CA3AF;">${aziendaNome}${aziendaTel ? ` — Tel: ${aziendaTel}` : ""}${aziendaEmail ? ` — ${aziendaEmail}` : ""}</p>
  </div>
</body></html>`;

  // Genera PDF reale con html2pdf.js
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "absolute";
  container.style.left = "0";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.zIndex = "-9999";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const nomeFile = "Preventivo_" + (quote.cliente || "Cliente").replace(/\s+/g, "_") + "_" + (quote.data ? quote.data.replace(/\//g, "-") : "oggi") + ".pdf";

  loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js").then(() => {
    const opt = {
      margin: [10, 10, 10, 10],
      filename: nomeFile,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0, windowWidth: 800 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    };
    const worker = window.html2pdf().set(opt).from(container);
    if (returnBlob) {
      return worker.toPdf().output('blob').then(blob => {
        document.body.removeChild(container);
        return blob;
      });
    }
    return worker.save();
  }).then(() => {
    document.body.removeChild(container);
  }).catch((err) => {
    console.error("PDF generation error:", err);
    try { document.body.removeChild(container); } catch(e) {}
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
}

// ========== MAIN APP ==========
export default function App({ session }) {
  const [currentView, setCurrentView] = useState("home");
  const [prices, setPrices] = useState(DEFAULT_PRICES);
  const [quotes, setQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [trialEnd, setTrialEnd] = useState(null);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscription") === "success" && session?.user?.id) {
      supabase.from("profiles").update({ subscription_status: "active" }).eq("id", session.user.id).then(() => {
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
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (profileData) {
          setUserProfile({
            nome: profileData.nome || "",
            cognome: profileData.cognome || "",
            nomeAzienda: profileData.nome_azienda || "",
            email: profileData.email || "",
            telefono: profileData.telefono || "",
            indirizzo: profileData.indirizzo || "",
            piva: profileData.piva || "",
            logo: profileData.logo || "",
          });
        // Carica stato abbonamento
        const subStatus = profileData.subscription_status || "none";
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

        const { data: clientsData } = await supabase.from("clients").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        if (clientsData) {
          setClients(clientsData.map(c => ({
            id: c.id, nome: c.nome, indirizzo: c.indirizzo || "", telefono: c.telefono || "", email: c.email || "", note: c.note || "",
          })));
        }

        const { data: quotesData } = await supabase.from("quotes").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        if (quotesData) {
          setQuotes(quotesData.map(q => ({
            _supabaseId: q.id, numero: q.numero_preventivo, descrizione: q.descrizione,
            items: q.items || [], pagamento: q.pagamento || [], scadenza: q.scadenza,
            note: q.note || "", totale: q.totale, stato: q.stato,
            clientInfo: q.items?.[0]?.clientInfo || {}, created_at: q.created_at,
          })));
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
      telefono: profile.telefono, indirizzo: profile.indirizzo, piva: profile.piva,
      logo: profile.logo, updated_at: new Date().toISOString(),
    });
  };

  const syncClientsToSupabase = async (newClients) => {
    setClients(newClients);
    if (!session?.user?.id || !dataLoaded) return;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const saveQuote = async (quote) => {
    if (editingQuote !== null) {
      const updated = [...quotes];
      updated[editingQuote.index] = quote;
      setQuotes(updated);
      setEditingQuote(null);
      if (quote._supabaseId) {
        await supabase.from("quotes").update({
          descrizione: quote.descrizione, items: quote.items, pagamento: quote.pagamento,
          scadenza: quote.scadenza, note: quote.note, totale: quote.totale,
          updated_at: new Date().toISOString(),
        }).eq("id", quote._supabaseId);
      }
    } else {
      const { data } = await supabase.from("quotes").insert({
        user_id: session.user.id, numero_preventivo: quote.numero || `P-${Date.now()}`,
        descrizione: quote.descrizione, items: quote.items, pagamento: quote.pagamento,
        scadenza: quote.scadenza, note: quote.note, totale: quote.totale, stato: "bozza",
      }).select().single();
      const newQuote = data ? { ...quote, _supabaseId: data.id } : quote;
      setQuotes([newQuote, ...quotes]);
    }
  };

  const handleViewQuote = (quote, index) => {
    setSelectedQuote({ ...quote, _index: index });
    setCurrentView("dettaglio");
  };

  const handleEditQuote = (quote) => {
    setEditingQuote({ ...quote, index: quote._index });
    setCurrentView("modifica");
  };

  const stats = {
    totalPrices: prices.length,
    totalQuotes: quotes.length,
    totalClients: clients.length
  };

  const isSubscribed = subscriptionStatus === "active" || subscriptionStatus === "trialing";

  const handleSubscribe = async (promoCode) => {
    if (promoCode === "PROVA14") {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      const { error } = await supabase.from("profiles").update({ subscription_status: "trialing", trial_end: trialEnd.toISOString() }).eq("id", session.user.id);
      if (!error) { setSubscriptionStatus("trialing"); }
      return;
    }
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, email: session.user.email })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) { alert("Errore durante il checkout. Riprova."); }
  };

  if (dataLoaded && (!isSubscribed || showPricing)) {
    return <PricingPage onSubscribe={handleSubscribe} onLogout={handleLogout} userEmail={session?.user?.email} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen flex items-start justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <Header currentView={currentView} onNavigate={setCurrentView} userProfile={userProfile} onLogout={handleLogout} />

        {currentView === "home" && <HomeView onNavigate={setCurrentView} stats={stats} userProfile={userProfile} trialEnd={trialEnd} subscriptionStatus={subscriptionStatus} onShowPricing={() => setShowPricing(true)} />}
        {currentView === "profilo" && <ProfiloAzienda userProfile={userProfile} setUserProfile={saveProfileToSupabase} onNavigate={setCurrentView} />}
        {currentView === "nuovo" && <NuovoPreventivo prices={prices} clients={clients} onSaveQuote={saveQuote} onNavigate={setCurrentView} onDownloadPDF={(q) => generatePDF(q, userProfile)} onGeneratePDFBlob={(q) => generatePDF(q, userProfile, true)} userProfile={userProfile} />}
        {currentView === "modifica" && editingQuote && (
          <NuovoPreventivo
            prices={prices}
            clients={clients}
            onSaveQuote={saveQuote}
            onNavigate={setCurrentView}
            onDownloadPDF={(q) => generatePDF(q, userProfile)} onGeneratePDFBlob={(q) => generatePDF(q, userProfile, true)}
            initialData={editingQuote}
            userProfile={userProfile}
          />
        )}
        {currentView === "database" && <div><button onClick={() => setCurrentView("home")} className="flex items-center gap-1 text-orange-500 hover:text-orange-600 mb-2 px-5 pt-4"><ArrowLeft size={20} /><span className="text-sm">Indietro</span></button><PriceDatabase prices={prices} setPrices={setPrices} /></div>}
        {currentView === "clienti" && <ClientDatabase clients={clients} setClients={setClients} />}
        {currentView === "storico" && <div><button onClick={() => setCurrentView("home")} className="flex items-center gap-1 text-orange-500 hover:text-orange-600 mb-2 px-5 pt-4"><ArrowLeft size={20} /><span className="text-sm">Indietro</span></button><StoricoView quotes={quotes} onViewQuote={handleViewQuote} /></div>}
        {currentView === "dettaglio" && selectedQuote && (
          <QuoteDetailView
            quote={selectedQuote}
            onBack={() => setCurrentView("storico")}
            onDownloadPDF={(q) => generatePDF(q, userProfile)} onGeneratePDFBlob={(q) => generatePDF(q, userProfile, true)}
            onEdit={handleEditQuote}
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
  );
}
