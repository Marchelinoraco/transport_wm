# Paket Harga, Syarat & Ketentuan, dan Motion untuk transport.welcomemanado.com — Desain

**Tanggal:** 2026-10-14
**Repo terdampak:** api_wm, admin_wm, transport_wm. client_wm (welcomemanado.com) tidak diubah.
**Sumber:** `PRICE LIST CAR LANDSCAPE (1).pdf` dan `price-list-pesonamanado.pdf` (Daftar Harga Sewa Kendaraan,
berlaku sejak 01 Oktober 2026), serta `pesonamanado-web/src/lib/syarat-invoice.ts`,
`src/data/syarat-ketentuan.ts`, dan `src/data/tarif-sewa.ts`.

## Latar belakang

Tujuan awalnya adalah memperbagus transport.welcomemanado.com dengan motion untuk menarik lebih banyak booking. Saat
ditelusuri, ada tiga masalah di production yang lebih menghambat booking daripada kurangnya animasi:

1. **Semua harga 0.** Kesembilan armada di `api.welcomemanado.my.id` ber-`price` 0, sehingga halaman mobil
   menampilkan "Rp 0".
2. **Semua foto armada hilang.** Ke-14 berkas di `storage/transportations/` mengembalikan 404 (bagian dari
   kehilangan berkas 2026-09-25), padahal storage lain normal. Kartu mobil dan carousel hero tampil tanpa foto.
3. **Janji diskon yang tidak berlaku.** Situs menjanjikan diskon 10% mingguan / 20% bulanan di `/promo`, landing
   page, artikel blog, deskripsi situs, dan gambar OG. Artikel harga 2026 memuat tabel harga hasil estimasi.

Selain itu, sistem hanya menyimpan **satu harga** per armada, sedangkan daftar harga resmi punya empat jenis.

## Keputusan pengguna

- Motion diprioritaskan **seimbang** antara beranda dan jalur booking.
- Harga bertingkat disimpan sebagai **kolom baru yang bisa diubah dari admin**. Harga di situs diganti sesuai PDF.
- **Satu baris PDF = satu armada** (11 armada). Alphard dan Zenix dipecah per varian, Xpander ditambahkan.
- Form booking memakai **paket PDF tanpa diskon otomatis**. Diskon mingguan/bulanan dan tombol "Dengan sopir"
  dihapus.
- Syarat & Ketentuan diambil dari pesonamanado-web, dengan **Welcome Manado sebagai operator**. Semua sebutan
  "Pesona Manado" diganti, termasuk "pool Welcome Manado".
- **Full day dihitung maksimum 12 jam.** Kelebihannya, untuk paket dengan sopir, dikenakan **Over time per jam
  sesuai unit**. **Lepas kunci** dikenakan **keterlambatan pengembalian Rp 100.000 per jam**, flat untuk semua
  unit, sesuai PDF resmi.
- **Biaya Area dihitung otomatis** di form booking berdasarkan isi silinder unit.
- Tidak ada centang persetujuan wajib. Persetujuan S&K dicatat lewat kalimat di form dan di pesan WhatsApp.
- Bus diisi `engine_cc` 2001 sebagai penanda golongan di atas 2.000 cc, sampai angka aslinya diketahui.

## Pendekatan

**Kolom tetap per paket.** `price` yang ada dipertahankan dan maknanya menjadi harga **Full day**. Tiga harga lain
ditambahkan sebagai kolom nullable, di mana nilai kosong berarti paket tidak tersedia. client_wm yang hanya
membaca `price` tetap berjalan tanpa perubahan.

Pendekatan lain sudah dibandingkan dan ditolak:

- **Kolom JSON `price_tiers`:** butuh UI baris dinamis di admin dan label paket yang diterjemahkan. Fleksibilitas
  ini tidak dibutuhkan untuk empat jenis harga yang sudah tetap.
- **Tabel `transportation_prices` terpisah:** berlebihan untuk empat angka per unit.
- **Harga ditulis di kode transport_wm:** setiap perubahan harga butuh deploy dan bisa tidak sinkron dengan admin.

**S&K disimpan statis di transport_wm**, mengikuti pola pesonamanado-web. Dokumen ini mengikat, sehingga
perubahannya perlu versi dan tanggal berlaku yang jelas, bukan diubah diam-diam lewat admin. Harga per unit tidak
ditulis di S&K. S&K merujuk ke halaman kendaraan, karena harga dikelola di admin.

## Paket dan istilah

| Kode | Label (id) | Kolom harga | Satuan | Sopir |
|---|---|---|---|---|
| `full_day` | Full day (maks. 12 jam, dengan sopir) | `price` | per hari | ya |
| `transfer` | Transfer sekali jalan (antar atau jemput, dengan sopir) | `price_pickup` | per trip | ya |
| `self_drive` | Lepas kunci (maks. 12 jam, tanpa sopir) | `price_self_drive` | per hari | tidak |

"Pick up / drop off" di PDF diberi label **Transfer sekali jalan**, supaya tidak tertukar dengan **biaya
antar-jemput** mobil lepas kunci ke lokasi penyewa (Rp 150/300/600 ribu per area).

## Komponen

### 1. API (api_wm)

**Migrasi aditif (tidak menghapus apa pun):**

- `transportations`:
  - `price_pickup`, `price_overtime`, `price_self_drive`: unsigned integer, nullable
  - `engine_cc`: unsigned small integer, nullable
- `transportation_bookings`:
  - `package`: string(20), nullable, berisi `full_day` / `transfer` / `self_drive`
  - `area`: unsigned tiny integer, nullable, berisi 1–4

**Model:** keempat kolom armada masuk ke `$fillable` dan `$casts` (integer). `package` dan `area` masuk ke
`$fillable` booking, dengan `area` di-cast integer.

**Validasi `TransportationController@store/update`:**

- `price_pickup`, `price_overtime`, `price_self_drive`: `nullable|integer|min:0`
- `engine_cc`: `nullable|integer|min:500|max:20000`
- Nilai kosong dari admin disimpan sebagai `null`, bukan 0.

**Validasi `TransportationBookingController@store`:**

- `package`: `nullable|in:full_day,transfer,self_drive`
- `area`: `nullable|integer|between:1,4`
- `dengan_sopir` tetap diterima. transport_wm mengirim `false` untuk `self_drive` dan `true` untuk paket lain.

**Endpoint publik** (`/transportations`, `/transportations/slug/{slug}`) otomatis mengirim kolom baru, tanpa
perubahan kontrak bagi pemakai lama.

**Test:** feature test baru untuk simpan dan ubah armada dengan harga paket (termasuk pengosongan menjadi `null`),
validasi `package` dan `area` di booking, dan memastikan respons publik memuat kolom baru.

### 2. Admin (admin_wm)

- **`TransportationForm.vue`:** grup **"Harga paket"** berisi:
  - Full day (maks. 12 jam, dengan sopir), yang memakai kolom `price`
  - Transfer sekali jalan
  - Over time per jam
  - Lepas kunci (kosongkan bila tidak tersedia)

  Ditambah input **Isi silinder (cc)**. Input "Tipe Sewa" (`price_unit`) disembunyikan dari form. Nilainya tetap
  dikirim apa adanya agar data lama tidak berubah.
- **`Transportations.vue`:** kolom harga menampilkan Full day, plus penanda "Lepas kunci" bila ada.
- **`TransportationBookings.vue`:** menampilkan paket dan area pada setiap booking.

### 3. Data production (11 armada)

Slug yang sudah ada dipertahankan, karena controller memang membekukan slug setelah terisi.

| # | Nama | Armada | cc | Full day | Transfer | Over time | Lepas kunci | Foto |
|---|---|---|---|---|---|---|---|---|
| 1 | Toyota Alphard (2019–2022) | ubah #10 | 2500 | 3.500.000 | 1.500.000 | 250.000 | — | `alphard.png` |
| 2 | Toyota Alphard (2022–2026) | baru | 2500 | 4.000.000 | 2.500.000 | 300.000 | — | dari PDF (putih) |
| 3 | Toyota Fortuner (2020–2023) | ubah #12 | 2400 | 2.500.000 | 1.000.000 | 150.000 | — | `toyota-fortuner.png` |
| 4 | Toyota Innova Reborn (2019–2022) | ubah #6 | 1998 | 1.000.000 | 400.000 | 50.000 | 600.000 | `toyota-innova-reborn.png` |
| 5 | Toyota Innova Zenix Q Captain Seat (2023) | baru | 1987 | 1.750.000 | 700.000 | 75.000 | — | `innova-zenix-q.png` |
| 6 | Toyota Innova Zenix G (2023) | ubah #7 | 1987 | 1.250.000 | 500.000 | 50.000 | — | `innova-zenix-g.png` |
| 7 | Toyota Hiace Commuter 14 pax | ubah #8 | 2500 | 1.500.000 | 700.000 | 100.000 | — | `hiace-commuter.png` |
| 8 | Toyota Hiace Premio 14 pax (2023) | ubah #11 | 2800 | 2.000.000 | 800.000 | 100.000 | — | `hiace-premio.png` |
| 9 | Bus 30 Seat | ubah #9 | 2001 | 2.300.000 | 1.200.000 | 100.000 | — | dari PDF |
| 10 | Mitsubishi Xpander | baru | 1499 | 850.000 | 350.000 | 50.000 | 500.000 | `xpander-ultimate.webp` |
| 11 | Toyota Avanza | ubah #5 | 1500 | 700.000 | 300.000 | 50.000 | 400.000 | `toyota-avanza.png` |

Foto bersumber dari `transport_wm/public/images/cars/`, kecuali dua foto yang diambil dari PDF (sekitar 300–415 px).
Keduanya pengganti sementara sampai ada foto yang lebih baik di `_dump-database/foto-baru/07 Transportasi`.

**Kolom lain:**

- Kolom `year` dibiarkan kosong, karena rentang tahunnya sudah ada di nama.
- `seats` hanya diisi untuk Hiace (14) dan Bus (30). Kolom lain tidak dikarang dan bisa dilengkapi di admin.
- `type` Fortuner diperbaiki dari "MINI MVP" menjadi "SUV".
- Deskripsi 4 bahasa yang ada dipertahankan. Armada baru menyalin deskripsi saudaranya. Deskripsi Xpander ditulis
  baru dalam 4 bahasa.
- **White Marlin (#13, kapal) tidak disentuh.** Unit ini akan tampil "Tanya harga".

**Cara pengisian:** lewat API admin dengan token yang disalin pengguna dari konsol admin. Sebelum dan sesudah setiap
armada, snapshot diambil lalu dibandingkan. Avanza dikerjakan dulu sebagai percobaan, lalu 10 sisanya setelah
pengguna memeriksa. `update` menghapus foto yang tidak dikirim di `retain_image_urls`. Yang terhapus di sini hanya
tautan foto yang sudah 404.

### 4. transport_wm

**Lapisan data:**

- `lib/types.ts` dan `lib/api.ts` memetakan `price_pickup`, `price_overtime`, `price_self_drive`, dan `engine_cc`.
- Helper `paketTersedia(car)` mengembalikan daftar paket yang harganya lebih dari 0.
- Harga 0 atau kosong tampil sebagai **"Tanya harga"**, tidak pernah "Rp 0".

**`lib/tarif-sewa.ts`** berisi angka operasional, disalin dari pesonamanado-web dan dicocokkan dengan PDF:

- `AREA_SEWA` (Area 1–3 dan wilayahnya), dengan `AREA_DIKONFIRMASI = 4`, `AMBANG_MESIN_CC = 2000`
- Paket dengan sopir: batas 120 km per hari, parkir ditanggung sampai Rp 50.000 per hari, Biaya Area per hari
  - Area 1: Rp 0
  - Area 2: Rp 150.000 / Rp 250.000
  - Area 3: Rp 250.000 / Rp 350.000
- Lepas kunci: batas 120 km per hari, keterlambatan Rp 100.000 per jam, antar-jemput
  - Area 1: Rp 150.000
  - Area 2: Rp 300.000
  - Area 3: Rp 600.000
  - Ambil di pool: gratis
- `HARGA_BERLAKU_SEJAK = '2026-10-01'`

**Golongan mesin:**

| `engine_cc` | Golongan | Biaya Area |
|---|---|---|
| ≤ 2000 | kecil | tarif bawah |
| > 2000 | besar | tarif atas |
| kosong | — | "dikonfirmasi via WhatsApp" |

**Kartu mobil (`CarCard`):**

- Harga Full day dengan keterangan "/hari · 12 jam · dengan sopir".
- Badge **"Lepas kunci"** bila `price_self_drive` terisi, menggantikan badge "Dengan sopir".

**Halaman detail (`CarDetailBody`):**

- Kartu harga mencantumkan semua paket yang tersedia, Over time per jam, dan "Harga berlaku sejak
  1 Oktober 2026 · dapat berubah".
- Isi silinder tidak ditampilkan ke publik. Angka ini hanya menentukan golongan Biaya Area, sehingga penanda 2001
  pada bus tidak tampil sebagai spesifikasi palsu.

**Form booking (`BookingForm`), ditulis ulang:**

- **Paket:** tombol pilihan dari `paketTersedia(car)`.
- **Jumlah:** hari untuk `full_day` dan `self_drive`, trip untuk `transfer`. Tanggal mulai tetap wajib, tanggal
  selesai dihitung dari jumlah hari.
- **Area:**
  - `full_day`: Area 1–4. Biaya Area dihitung × hari sesuai golongan.
  - `self_drive`: "Ambil di pool (gratis)" atau antar-jemput Area 1–4, dihitung sekali per pemesanan.
  - `transfer`: Area 1–4 dipilih sebagai informasi. Tidak ada biaya tambahan otomatis. Bila area bukan 1, tampil
    catatan "biaya transfer ke luar Kota Manado dikonfirmasi via WhatsApp".
  - **Area 4** atau golongan kosong: biaya area tidak dijumlahkan dan tampil "dikonfirmasi via WhatsApp".
- **Rincian:** harga paket × jumlah, biaya area atau antar-jemput, dan total. Over time (dengan sopir) atau
  keterlambatan Rp 100.000 per jam (lepas kunci) tampil sebagai info, tidak dijumlahkan.
- **Ringkasan "Termasuk / Tidak termasuk"** per paket, diambil dari S&K. Termasuk di dalamnya "belum termasuk tiket
  masuk tempat wisata" dan "tol tanggungan penyewa".
- Kalimat "Dengan menekan Booking, Anda menyetujui Syarat & Ketentuan" bertaut ke `/syarat-ketentuan`.
- **POST `/transportation-bookings`** mengirim:
  - `package`, `area`, `dengan_sopir`
  - `duration_days`: hari, atau `null` untuk transfer
  - `total_price`: total yang tampil (tanpa bagian yang "dikonfirmasi")
  - `notes`: berisi jumlah trip dan catatan pelanggan
- **Pesan WhatsApp:** menyebut paket, area, rincian biaya, total, dan "Menyetujui S&K versi 1 Oktober 2026". Bila
  POST gagal, WhatsApp tetap dibuka seperti sekarang.

**Halaman `/syarat-ketentuan` (baru):**

- Isinya dari `lib/syarat-ketentuan.ts` dalam 4 bahasa (id/en/zh/ko), berdasarkan `syarat-ketentuan.ts`
  pesonamanado-web, dengan bagian per paket mengikuti `syarat-invoice.ts`.
- **Penyesuaian dari sumber:**
  - Nama operator diganti Welcome Manado.
  - Full day dan lepas kunci maksimum 12 jam.
  - Over time per unit berlaku untuk paket dengan sopir, dan merujuk ke halaman kendaraan.
  - Lepas kunci: keterlambatan Rp 100.000 per jam.
  - Pasal "Paket wisata" dibuang.
  - Nomor kontak diambil dari konfigurasi situs.
- **Tata letak** mengikuti sumber: daftar isi yang ikut menggulir, anchor per pasal, tanggal berlaku.
- Ditautkan dari footer, form booking, dan sitemap.
- Kalimat en/zh/ko yang berubah diterjemahkan ulang dan perlu dibaca penutur asli sebelum rilis.

**Penyelarasan teks** (4 bahasa bila berlaku) untuk menghapus janji diskon dan harga lama:

- `/promo`: kartu diskon diganti "Sewa mingguan/bulanan: tanya harga khusus via WhatsApp"
- `/rental-mobil-manado`, `/sewa-mobil-lepas-kunci-manado`, `lib/site.ts` (deskripsi), `app/opengraph-image.tsx`
- `lib/posts/harga-sewa-mobil-manado-2026.ts`: tabel diganti harga PDF, contoh hitungan diskon dihapus
- `lib/posts/sewa-mobil-bandara-sam-ratulangi.ts`
- `lib/i18n/dictionaries.ts`: FAQ, label form, dan rentang harga di pesan WA menjadi Rp 300.000 – Rp 4.000.000

### 5. Motion

Tanpa library baru. Semuanya dibangun dengan keyframe Tailwind, `globals.css`, dan `IntersectionObserver`. Blok
`prefers-reduced-motion` yang sudah ada menonaktifkan semua animasi baru. Konten tetap ter-render di server, jadi
tidak bergantung pada JS untuk tampil.

| Tempat | Motion | Tujuan |
|---|---|---|
| Hero | Judul muncul per baris (mask slide-up). Indikator progres carousel yang bisa diklik. | Kesan pertama, menandai bahwa foto berganti |
| Hero | Chip berkilau "Mulai Rp 700rb/hari" dari Full day termurah yang tersedia | Patokan harga sejak awal |
| Bawah hero | `FleetMarquee`: foto dan nama armada bergulir pelan, berhenti saat hover/sentuh, bisa diklik | Menunjukkan pilihan armada |
| Seluruh section | `ScrollReveal` dengan prop `variant`: `up` / `scale` / `left` / `right` | Ritme yang tidak seragam |
| Kartu mobil | Titik "Tersedia" berdenyut, kilau pada foto saat hover, pill harga sedikit membesar | Sinyal unit siap |
| Detail + form | Angka harga dan total beranimasi saat paket, jumlah, atau area berubah. Ringkasan Termasuk/Tidak termasuk berganti dengan transisi. | Umpan balik langsung |
| Form | Kilau berkala pada tombol WhatsApp. Centang sukses dianimasikan. | Mengarahkan ke CTA |
| Detail (HP) | `StickyBookingBar`: harga dan "Booking Sekarang". Muncul setelah kartu harga terlewati, hilang saat form terlihat. | Form di HP ada di bagian bawah halaman |
| CTA penutup | Gradasi merah yang bergeser pelan | Penutup yang hidup |
| Antar halaman | Fade/slide singkat lewat `app/template.tsx` | Navigasi terasa mulus |

`FloatingChat` dan `CompareBar` digeser saat `StickyBookingBar` tampil supaya tidak bertumpuk.

### 6. i18n

Semua teks baru masuk ke `lib/i18n/dictionaries.ts` untuk id, en, zh, dan ko, termasuk label paket, area,
rincian, ringkasan Termasuk/Tidak termasuk, chip harga, bar booking, dan "Tanya harga". JSON-LD FAQ tetap bahasa
Indonesia, sesuai aturan yang sudah ada.

## Urutan rilis

Setiap repo dikerjakan di branch fitur dari `dev`. Merge ke `main` dan deploy hanya dengan persetujuan pengguna.

1. **api_wm:** migrasi, validasi, dan test. Deploy dengan menyalin berkas + backup, `php artisan migrate`, lalu
   flush PublicCache. Aman dirilis lebih dulu, karena transport_wm dan client_wm lama mengabaikan kolom baru.
2. **admin_wm:** form harga paket dan cc, daftar armada, daftar booking. Build dari `main` lalu rsync.
3. **Data:** percobaan pada Avanza, lalu 10 armada lain beserta fotonya.
4. **transport_wm:** semua perubahan tampilan, S&K, teks, dan motion. Preview Vercel dulu, baru production.

## Pengujian

- **api_wm:** `php artisan test`, termasuk feature test baru di §1.
- **transport_wm:** `npm run lint` dan `npm run build` lolos.
- **Perhitungan form:** satu fungsi murni `hitungBooking()` diekstrak ke `lib/`. Hasilnya dicek terhadap
  hitungan manual untuk minimal:
  - Avanza Full day 3 hari Area 2 = 3 × 700.000 + 3 × 150.000 = **2.550.000**
  - Alphard 2019 Full day 2 hari Area 3 = 2 × 3.500.000 + 2 × 350.000 = **7.700.000**
  - Xpander Lepas kunci 2 hari antar Area 2 = 2 × 500.000 + 300.000 = **1.300.000**
  - Innova Reborn Lepas kunci 1 hari ambil di pool = **600.000**
  - Hiace Premio Transfer 2 trip = **1.600.000**
  - Fortuner Full day Area 4 = 2.500.000, ditambah biaya area "dikonfirmasi"
- **Visual** (dev server):
  - beranda, katalog, detail mobil, `/syarat-ketentuan`, dan `/promo`
  - lebar 375 px dan 1280 px
  - mode terang dan gelap
  - `prefers-reduced-motion` aktif
  - 4 bahasa
- **Pasca-deploy:**
  - tidak ada lagi "Rp 0" di situs
  - semua foto armada mengembalikan 200
  - booking uji tersimpan dengan `package` dan `area` yang benar, lalu dihapus dari admin

## Di luar cakupan

- Perubahan client_wm. Halaman Travel Info → Transport otomatis menampilkan harga Full day.
- Pembayaran online dan cek ketersediaan per tanggal.
- Perhitungan otomatis Over time dan keterlambatan, yang dihitung saat serah terima.
- Foto White Marlin dan harga kapal.

## Hal yang masih terbuka

- **Isi silinder bus yang sebenarnya.** Sampai diketahui, dipakai penanda 2001.
- **Foto yang lebih baik** untuk Alphard (2022–2026) dan Bus 30 Seat.
- **Biaya transfer ke luar Kota Manado.** PDF hanya mengatur Biaya Area untuk paket per hari sewa, jadi untuk
  transfer biayanya dikonfirmasi via WhatsApp.
- **Tinjauan penutur asli** untuk terjemahan S&K en/zh/ko.
