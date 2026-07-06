# Welcome Manado Transport

Website booking transportasi untuk subdomain **transport.welcomemanado.com** — Next.js 14 (App Router) + Tailwind CSS.

Data armada & booking dikelola dari **admin_wm** melalui **api_wm** (Laravel):
- `GET /transportations` — daftar armada
- `GET /transportations/slug/{slug}` — detail per slug
- `POST /transportation-bookings` — simpan booking (lalu lanjut WhatsApp)
- `GET /gallery-items` — galeri aktivitas

## Menjalankan lokal

```bash
# API (di folder api_wm)
php artisan serve            # http://localhost:8000

# Website
npm install
npm run dev                  # http://localhost:3000
```

## Environment (.env.local)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api   # prod: https://api.welcomemanado.my.id/api
NEXT_PUBLIC_WHATSAPP_NUMBER=628xxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://transport.welcomemanado.com
```

## Deploy

Vercel (framework Next.js), custom domain `transport.welcomemanado.com`
(DNS: CNAME `transport` → `cname.vercel-dns.com`). Set ketiga env var di atas.
