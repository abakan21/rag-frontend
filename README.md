# A.S.S. Lover — Frontend

> React + TypeScript frontend pro systém A.S.S. Lover

## Přehled

Frontend poskytuje uživatelské rozhraní pro interakci se systémem A.S.S. Lover — inteligentní platformou pro sběr webového obsahu a RAG vyhledávání.

## Stránky a funkcionalita

### RAG Search (`/search`)
- Zadávání dotazů v přirozeném jazyce
- Přepínání mezi RAG a no-RAG režimem
- Zobrazení odpovědi s citacemi zdrojů
- Náhled extrahovaných dokumentů
- Export výsledků

### Ingestion (`/ingestion`)
- Přidávání nových webových zdrojů
- Konfigurace deep crawl (hloubka, strategie)
- Nastavení právního základu (public, consent, contract)
- Plánování automatického sběru
- Správa a monitoring jobů
- Správa incidentů (CAPTCHA, chyby)

### Analytics (`/analytics`)
- Přehled statistik systému
- Počty jobů (completed, failed, running, CAPTCHA)
- Breakdown strategií ingestu
- Evidence artefakty (screenshoty, markdown soubory)
- Historie posledních jobů

### User Management (`/admin`)
- Správa uživatelů a jejich rolí (pouze admin)
- Synchronizace s Keycloak

## Technologie

| Komponenta | Technologie |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Animace | Framer Motion |
| Auth | Keycloak JS (`keycloak-js`) |
| HTTP klient | Axios |
| Markdown | `react-markdown` |
| Ikony | Lucide React |

## Autentizace

Frontend používá Keycloak OIDC flow:

1. Uživatel klikne přihlásit → redirect na Keycloak
2. Po přihlášení Keycloak vrátí JWT access token
3. Token se ukládá do paměti a posílá s každým API požadavkem
4. Axios interceptor automaticky obnovuje token před expirací

### Role
| Role | Přístup |
|---|---|
| `admin` | Všechny stránky + správa uživatelů + ingestion |
| `user` | RAG Search |

## Konfigurace

### Proměnné prostředí

```bash
# .env.production
VITE_KEYCLOAK_URL=https://váš-server-ip/auth
```

### Keycloak nastavení (`src/keycloak.ts`)

```typescript
const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: "rag",
  clientId: "rag-app",
});
```

## Lokální vývoj

```bash
npm install
npm run dev
```

Vývojový server běží na `http://localhost:5173`.

Pro lokální vývoj je potřeba běžící backend na `http://localhost:8000` a Keycloak na `http://localhost:8080`.

## Build a nasazení

```bash
npm run build
```

Výstup je v adresáři `dist/` — statické soubory servírované přes nginx.

Produkční nasazení přes Docker (viz [rag-infra](https://github.com/abakan21/rag-infra)).

## API komunikace

Frontend komunikuje s backendem přes nginx reverse proxy:

```
https://server/api/  →  backend:8000/api/
https://server/auth/ →  keycloak:8080/auth/
```

Konfigurace v `src/api.ts` — Axios instance s automatickým přidáváním JWT tokenu.
