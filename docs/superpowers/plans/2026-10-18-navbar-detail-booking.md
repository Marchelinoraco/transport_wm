# Navbar Notch, Halaman Detail Kendaraan, dan Booking Dua Langkah — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti navbar dengan notch hitam ala Supaste (sudut atas cekung, garis tepi berkilau, berubah menjadi kaca buram saat digulir), dan menyusun ulang halaman detail kendaraan menjadi susunan A (informasi di kiri, kotak booking dua langkah yang menempel di kanan).

**Architecture:**
- Semua aturan yang bisa diuji tanpa browser dijadikan fungsi murni ber-test di `lib/`:
  - jalur SVG notch dan posisi kilau;
  - tabel biaya area per paket;
  - pemilihan mobil serupa;
  - penyesuaian area saat ganti paket.
- Komponen tinggal menampilkan hasilnya.
- Tabel biaya area dibangun dari `hitungBooking`, jadi tabel dan total tidak mungkin berbeda.
- Navbar dipecah: notch (`Navbar.tsx`), garis kilau, menu "⋯", dan panel HP.
- Halaman detail dipecah per bagian. State `paket` diangkat ke `CarDetailBody`.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind 3, vitest (sudah ada). Pemeriksaan browser memakai `playwright-core` + Chrome dari scratchpad sesi, bukan dependensi repo.

**Spec:** `docs/superpowers/specs/2026-10-18-navbar-detail-booking-design.md` beserta lampiran di `docs/superpowers/specs/2026-10-18-navbar-detail-booking/`.

## Global Constraints

- **Tanpa dependensi runtime baru.**
- **Semua teks baru dalam id/en/zh/ko** di `lib/i18n/dictionaries.ts`. Test kamus yang ada (placeholder sama, tanpa teks kosong) tetap lolos.
- **`lib/paket.ts`, `lib/hitungBooking.ts`, `lib/booking.ts`, `lib/tarif-sewa.ts`, dan `lib/ringkasan-paket.ts` tidak diubah perilakunya.** Satu-satunya tambahan: ekspor baru `areaUntukPaket` di `lib/hitungBooking.ts`.
- **Kirim booking dan pesan WhatsApp tidak berubah** (`buatPayloadBooking`, `buatPesanWa`, POST lalu buka WhatsApp, tetap buka WhatsApp bila POST gagal).
- **Semua animasi mati di `prefers-reduced-motion`.** Animasi masuk notch memakai fill-mode `backwards`, bukan `both`.
- **Tidak boleh ada:**
  - geser ke samping di lebar 375 px;
  - "Rp 0";
  - janji diskon;
  - nama "Pesona" (`teks-situs.test.ts` tetap lolos).
- **Warna:**
  - notch: `#0a0a0a`;
  - kaca buram terang: putih ±75% + `backdrop-filter: blur`, tepi tipis abu-abu muda;
  - kaca buram gelap: ±`slate-900/75`;
  - Paket Tour dalam keadaan kaca: merah `red-600` dengan teks putih.
- **Ukuran notch:** sudut cekung `--r` 22 px, sudut bawah 26 px, tombol Paket Tour radius 12 px.
- **Garis kilau:**
  - satu putaran 4.200 ms, linear;
  - lapisan `[bagianPanjang, tebal, warna, opasitas, cahayaPx]`: `[.26,1.1,#ef4444,.16,0]`, `[.17,1.4,#ef4444,.32,0]`, `[.10,1.8,#f87171,.6,3]`, `[.05,2.2,#fecaca,.9,5]`, `[.022,2.6,#fff,1,7]`;
  - garis dasar `rgba(255,255,255,.08)` setebal 1,1.
- **Batas gulir:** keadaan kaca aktif bila `scrollY > 24`. Notch hitam hanya ketika `scrollY <= 24`.
- **Tinggi kotak booking:** pada viewport **1280×720**, langkah 1 dan langkah 2 masing-masing terlihat utuh tanpa menggulir kotak.
- **Branch:** `feat/navbar-detail-booking` (sudah ada, berisi spec). Push, PR, merge, dan deploy hanya dengan persetujuan pengguna.

## Review Focus

- **Label paket panjang di bahasa lain** ("Self-drive", "单程接送", "편도 픽업/샌딩", "자차 운전") di pemilih paket kotak booking dan kartu paket, di lebar 1280 dan 375. Tidak boleh terpotong; boleh dua baris. → Task 6 Step 5 dan Task 7 Step 6 (cek 4 bahasa).
- **Halaman dibuka dalam keadaan sudah tergulir** (muat ulang di tengah halaman, atau tautan berjangkar `/syarat-ketentuan#pembatalan`). Navbar harus langsung dalam keadaan kaca, bukan hitam. → Task 3 Step 6.
- **Lebar jendela atau bahasa berubah setelah halaman dimuat.** Garis kilau harus tetap pas di tepi notch. → Task 4 Step 5.
- **Ganti paket di tengah langkah 2**, misalnya dari Lepas kunci dengan "pool" ke Full day. Area harus berubah ke pilihan yang sah, dan ringkasan, total, serta tabel tetap sama. → Task 1 (`areaUntukPaket`) dan Task 7 Step 6.
- **Mobil tanpa harga** (White Marlin), dan mobil dengan hanya satu atau dua paket. Tidak boleh crash, kartu tidak boleh kosong, dan "mobil serupa" tetap masuk akal. → Task 1 (`mobilSerupa` untuk mobil tanpa harga) dan Task 6 Step 5.

---

### Task 1: Logika murni — jalur notch, kilau, biaya area, mobil serupa, area saat ganti paket

**Files:**
- Create: `lib/navbar-tepi.ts`, `lib/navbar-tepi.test.ts`
- Create: `lib/biayaArea.ts`, `lib/biayaArea.test.ts`
- Create: `lib/mobilSerupa.ts`, `lib/mobilSerupa.test.ts`
- Modify: `lib/hitungBooking.ts` (tambah ekspor `areaUntukPaket`), `lib/hitungBooking.test.ts`

**Interfaces:**
- Produces, `lib/navbar-tepi.ts`:
  - `type UkuranNotch = { lebar: number; tinggi: number; r: number; rb: number }`
  - `jalurNotch(u: UkuranNotch): string`: atribut `d` SVG dalam koordinat yang titik nolnya di ujung kiri lengkung cekung kiri (x = 0, y = 0), lebar total `lebar + 2r`. Urutan: lengkung cekung kiri → sisi kiri → sudut kiri-bawah → bawah → sudut kanan-bawah → sisi kanan → lengkung cekung kanan.
  - `LAPIS_KILAU: readonly [number, number, string, number, number][]`: nilai dari Global Constraints.
  - `DURASI_KILAU = 4200`
  - `pusatKilau(waktuMs: number, panjang: number, setengahTerpanjang: number, durasi?: number): number`: posisi pusat kilau dari `-M` ke `L + M` secara linear, lalu berulang.
  - `offsetLapis(pusat: number, panjangLapis: number): number`: hasilnya `-(pusat - panjangLapis / 2)`.
- Produces, `lib/biayaArea.ts`:
  - `type StatusArea = "gratis" | "termasuk" | "harga" | "dikonfirmasi"`
  - `type BarisArea = { area: PilihanArea; status: StatusArea; nominal: number | null; perHari: boolean }`
  - `tabelBiayaArea(car: Car, paket: Paket): BarisArea[] | null`: `null` bila paket tidak tersedia.
- Produces, `lib/mobilSerupa.ts`: `mobilSerupa(car: Car, semua: Car[], maks?: number): Car[]` (default `maks` = 4).
- Produces, `lib/hitungBooking.ts`: `areaUntukPaket(area: PilihanArea, paket: Paket): PilihanArea`. Aturannya:
  - `"pool"` hanya sah untuk `self_drive`; untuk paket lain menjadi `1`;
  - pindah ke `self_drive` dari area mana pun menjadi `"pool"` (perilaku sekarang di `pilihPaket`);
  - selain itu area tidak berubah.

- [ ] **Step 1: Tulis test yang gagal**

`lib/navbar-tepi.test.ts`:
- `jalurNotch({ lebar: 800, tinggi: 60, r: 22, rb: 26 })` diawali `"M 0 0 A 22 22 0 0 1 22 22"`, memuat `"L 22 34"`, `"A 26 26 0 0 0 48 60"`, `"L 796 60"`, `"A 26 26 0 0 0 822 34"`, dan diakhiri `"A 22 22 0 0 1 844 0"`.
- `pusatKilau(0, 1000, 130)` = `-130`; `pusatKilau(2100, 1000, 130)` = `500`; `pusatKilau(4200, 1000, 130)` = `-130` (berulang).
- `offsetLapis(500, 100)` = `-450`.
- `LAPIS_KILAU` panjangnya 5, dan lapisan terakhir berwarna `"#fff"`.

`lib/biayaArea.test.ts` (pakai `mobil()` dari `lib/test/mobil.ts`):
- **Avanza** (1500 cc), `full_day`: `[{area:1,status:"gratis",nominal:0,perHari:true}, {area:2,status:"harga",nominal:150000,perHari:true}, {area:3,status:"harga",nominal:250000,perHari:true}, {area:4,status:"dikonfirmasi",nominal:null,perHari:true}]`.
- **Alphard** (2500 cc), `full_day`: Area 2 = 250.000 dan Area 3 = 350.000.
- `engine_cc: null`, `full_day`: Area 2 dan 3 berstatus `"dikonfirmasi"`.
- **Avanza**, `self_drive`: `[pool gratis 0, 1 harga 150000, 2 harga 300000, 3 harga 600000, 4 dikonfirmasi]`, semua `perHari:false`.
- **Avanza**, `transfer`: Area 1 `"termasuk"`, Area 2–4 `"dikonfirmasi"`.
- **Alphard**, `self_drive`: hasilnya `null`.
- **Konsistensi:** untuk setiap baris berstatus `"harga"`, `nominal` sama dengan `hitungBooking({car, paket, jumlah: 1, area}).biayaTambahan`.

`lib/mobilSerupa.test.ts`:
- Dari armada dengan harga Full day 700k (mobil itu sendiri), 850k, 1jt, 1,25jt, 2jt, 4jt, 0, hasilnya `[850k, 1jt, 1,25jt, 2jt]`. Mobil itu sendiri dan unit harga 0 tidak ikut.
- Selisih sama: id yang lebih kecil lebih dulu.
- `maks: 2` mengembalikan dua.
- **Mobil tanpa harga** (White Marlin) mengembalikan 4 unit termurah yang berharga.
- Armada yang hanya berisi mobil itu sendiri mengembalikan `[]`.

`lib/hitungBooking.test.ts`, kasus baru:
- `areaUntukPaket("pool", "full_day")` = `1`;
- `areaUntukPaket("pool", "transfer")` = `1`;
- `areaUntukPaket(2, "self_drive")` = `"pool"`;
- `areaUntukPaket(3, "full_day")` = `3`;
- `areaUntukPaket("pool", "self_drive")` = `"pool"`.

- [ ] **Step 2: Jalankan, pastikan gagal**
Run: `npm test`
Expected: FAIL. Modul `./navbar-tepi`, `./biayaArea`, `./mobilSerupa` belum ada, dan `areaUntukPaket` bukan ekspor.

- [ ] **Step 3: Implementasi**
- `tabelBiayaArea` **wajib** memanggil `hitungBooking` per area dengan `jumlah: 1`:
  - `"termasuk"` bila `paket === "transfer"` dan tidak dikonfirmasi;
  - `"gratis"` bila biaya 0 dan tidak dikonfirmasi;
  - `"harga"` bila biaya lebih dari 0;
  - `"dikonfirmasi"` bila `dikonfirmasi`.
- `perHari` bernilai true untuk `full_day`, false untuk paket lain.
- Daftar area: `["pool",1,2,3,4]` untuk `self_drive`, `[1,2,3,4]` untuk paket lain.
- `jalurNotch` meniru rumus di `prototipe-navbar.html` (fungsi `bentukJalur`).
- `BookingForm.pilihPaket` diganti memakai `areaUntukPaket` di Task 7, bukan di sini.

- [ ] **Step 4: Jalankan, pastikan lolos**
Run: `npm test && npx tsc --noEmit`
Expected: semua PASS, `tsc` tanpa error.

- [ ] **Step 5: Commit**
```bash
git add lib/navbar-tepi.ts lib/navbar-tepi.test.ts lib/biayaArea.ts lib/biayaArea.test.ts lib/mobilSerupa.ts lib/mobilSerupa.test.ts lib/hitungBooking.ts lib/hitungBooking.test.ts
git commit -m "feat(detail): logika jalur notch, tabel biaya area, mobil serupa, area saat ganti paket"
```

### Task 2: Kamus teks baru (4 bahasa)

**Files:**
- Modify: `lib/i18n/dictionaries.ts` (keempat objek)
- Modify: `lib/i18n/dictionaries.test.ts` (tambah assertion keberadaan)

**Interfaces:**
- Produces, ditambahkan ke `dict.nav`:
  - `more` (id "Lainnya")
  - `menu` (id "Menu")
  - `darkMode` (id "Mode gelap")
  - `terms` (id "Syarat & Ketentuan")
- Produces, objek baru `dict.detail`:
  - `choosePackage`: "Pilih paket"
  - `areaTitleFullDay`: "Biaya area untuk mobil ini"
  - `areaTitleSelfDrive`: "Biaya antar-jemput"
  - `areaTitleTransfer`: "Area transfer"
  - `free`: "Gratis"
  - `included`: "Termasuk"
  - `confirm`: "Dikonfirmasi"
  - `perDayShort`: "/hari"
  - `oncePerBooking`: "sekali per pemesanan"
  - `goodToKnow`: "Perlu diketahui"
  - `infoOvertime`: "Over time {price}/jam setelah 12 jam"
  - `infoLate`: "Telat kembali (lepas kunci) {price}/jam"
  - `infoCancel`: "Batal lebih dari 24 jam sebelum penjemputan: uang kembali penuh"
  - `infoDeposit`: "Lepas kunci: KTP + KK asli dan deposit"
  - `seeTerms`: "Baca Syarat & Ketentuan"
  - `similar`: "Mobil serupa"
  - `next`: "Lanjut isi data"
  - `edit`: "Ubah"
  - `step`: "Langkah {n} dari 2"
  - `askFirst`: "Tanya dulu via WhatsApp"
  - `areaName`: "Area {n}"
  - `pool`: "Pool Welcome Manado"
- Teks di atas adalah versi id. Pelaksana menulis en/zh/ko dengan makna yang sama dan placeholder yang sama. Nama wilayah memakai `NAMA_AREA` yang sudah ada.

- [ ] **Step 1: Tambah assertion yang gagal** di `dictionaries.test.ts`: `dictionaries.id.detail.infoOvertime` memuat `"{price}"`, `dictionaries.id.detail.step` memuat `"{n}"`, dan `dictionaries.ko.nav.more` tidak kosong.
- [ ] **Step 2: Jalankan** `npx vitest run lib/i18n`. Expected: FAIL, karena `detail` belum ada.
- [ ] **Step 3: Tambah kunci di keempat bahasa.**
- [ ] **Step 4: Jalankan** `npm test && npx tsc --noEmit`. Expected: PASS. `Dictionary = typeof id` memaksa kunci en/zh/ko sama.
- [ ] **Step 5: Commit** `feat(i18n): teks navbar notch dan halaman detail dalam 4 bahasa`

### Task 3: Navbar notch desktop — bentuk, isi, penempatan, keadaan kaca

**Files:**
- Modify (tulis ulang): `components/Navbar.tsx`
- Create: `components/navbar/MenuLainnya.tsx`
- Modify: `components/LanguageSwitcher.tsx` (prop `varian`)
- Modify: `app/globals.css` (kelas notch dan kaca)
- Modify: `app/layout.tsx` (jarak atas `main`)
- Modify: `components/HomeContent.tsx` (hero naik ke bawah notch)

**Interfaces:**
- Consumes: `dict.nav.more|darkMode|terms` (Task 2), `MAIN_SITE_URL`, `useTheme().toggle/theme`, `Logo`.
- Produces:
  - `LanguageSwitcher({ varian?: "default" | "notch" | "kaca" })`. Perilakunya sama, hanya kelas tombolnya berbeda; default = tampilan sekarang.
  - `MenuLainnya({ varian: "notch" | "kaca" })`. Berisi sakelar mode gelap dan tautan `/syarat-ketentuan`; tertutup saat klik di luar, Esc, dan halaman digulir.
  - Variabel CSS `--tinggi-navbar` di `:root`: 64px desktop, 56px di bawah 1024px. Dipakai `main` (`padding-top`) dan hero beranda (margin atas negatif sebesar itu).
  - Atribut `data-keadaan="hitam" | "kaca"` di elemen notch. Task 4 dan 5 bergantung pada nama ini.

- [ ] **Step 1: Header.** Header `fixed` di atas, berisi notch di tengah. Area di luar notch `pointer-events: none`, sedangkan notch sendiri `auto`. Isi notch mengikuti spec Bagian 1 (urutan, warna, titik merah halaman aktif, Paket Tour membuka `MAIN_SITE_URL` di tab baru dengan label `dict.nav.mainSite`). Sudut cekung dibuat dengan `::before`/`::after` dan `radial-gradient`, seperti di prototipe.
- [ ] **Step 2: Keadaan.** `data-keadaan` bernilai `"kaca"` bila `window.scrollY > 24`. Dihitung saat mount dan saat event `scroll` (passive).
  - Keadaan kaca:
    - tanpa sudut cekung;
    - latar putih ±75% + blur, tepi tipis, bayangan lembut;
    - teks gelap; Paket Tour merah dengan teks putih;
    - di `.dark`: latar slate-900/75, teks terang.
  - Transisi ±0,4 detik.
- [ ] **Step 3: Penempatan.**
  - `main` diberi `padding-top: var(--tinggi-navbar)`.
  - Hero beranda (`section` pertama `HomeContent`) diberi margin atas negatif sebesar `--tinggi-navbar`, supaya hero ada di bawah notch tanpa pita putih.
- [ ] **Step 4: Cek tipe dan test.** `npx tsc --noEmit && npm test`. Expected: lolos.
- [ ] **Step 5: Cek visual desktop** (dev server dengan API production, Chrome lewat playwright-core di scratchpad):
  - **1440 px, beranda di paling atas:** notch hitam di atas hero; area kiri-kanan notch memperlihatkan hero (warna piksel di (20, 20) bukan putih).
  - **Gulir 400 px:** `data-keadaan="kaca"`, dan menu terbaca di atas hero gelap (ambil screenshot, lalu lihat).
  - **Kembali ke 0:** `"hitam"`.
  - **`/mobil/toyota-avanza` di paling atas:** breadcrumb tidak tertutup notch (`top` breadcrumb ≥ tinggi notch).
  - **Mode gelap pada keadaan kaca:** teks terang.
  - **"⋯":** membuka menu; Esc menutupnya.
- [ ] **Step 6: Review Focus — halaman dibuka sudah tergulir.** Buka `/syarat-ketentuan#pembatalan`. Expected: begitu dimuat, `data-keadaan="kaca"` tanpa perlu menggulir.
- [ ] **Step 7: Commit** `feat(navbar): notch hitam ala Supaste dengan keadaan kaca buram saat digulir`

### Task 4: Animasi navbar — masuk, sorotan, kilau tombol, garis tepi berkilau

**Files:**
- Create: `components/navbar/GarisKilau.tsx`
- Modify: `components/Navbar.tsx`, `app/globals.css`

**Interfaces:**
- Consumes:
  - `jalurNotch`, `LAPIS_KILAU`, `DURASI_KILAU`, `pusatKilau`, `offsetLapis` (Task 1);
  - elemen notch dan `data-keadaan` (Task 3).
- Produces: `GarisKilau({ target: React.RefObject<HTMLElement> })`. Merender `<svg aria-hidden>` di dalam notch; membangun ulang jalur lewat `ResizeObserver` pada `target`. Satu loop `requestAnimationFrame` memperbarui `strokeDashoffset` semua lapisan. Loop berhenti di `prefers-reduced-motion` (hanya garis dasar diam) dan saat `document.hidden`.

- [ ] **Step 1: Animasi masuk.** Notch turun dari `translateY(-115%)` selama 0,8 detik (`cubic-bezier(.34,1.45,.64,1)`, fill-mode **`backwards`**). Isi notch muncul berurutan, jeda 45 ms per butir. Hanya sekali per pemuatan halaman, bukan per navigasi client-side.
- [ ] **Step 2: Sorotan menu, logo, dan Paket Tour.**
  - Sorotan meluncur mengikuti menu yang di-hover; hilang saat kursor keluar dari deretan menu.
  - Logo berputar −8° dan membesar 5% saat di-hover.
  - Panah Paket Tour bergeser (2px, −2px) saat di-hover.
  - Kilau berkala di Paket Tour memakai kelas `kilau kilau-loop` yang sudah ada.
- [ ] **Step 3: Garis tepi.** `GarisKilau` dipasang di notch dan disembunyikan (pudar) saat `data-keadaan="kaca"`.
- [ ] **Step 4: Cek tipe dan test.** `npx tsc --noEmit && npm test`. Expected: lolos.
- [ ] **Step 5: Cek visual, termasuk Review Focus lebar/bahasa berubah:**
  - Bekukan waktu di 3%, 50%, dan 97% putaran. Kilau harus berada di lengkung cekung kiri, di bawah tengah, dan di lengkung cekung kanan.
  - Ubah viewport 1440 → 1100 dan ganti bahasa ke `ko`. Panjang jalur `getTotalLength()` berubah, dan ujung jalur (`getPointAtLength(L)`) tetap di `lebar notch + 2r`, toleransi 1 px.
  - Dengan `reducedMotion: "reduce"`: tidak ada animasi berjalan (`document.getAnimations()` kosong untuk notch, `strokeDashoffset` tidak berubah dalam 500 ms), dan notch langsung tampil.
- [ ] **Step 6: Commit** `feat(navbar): animasi masuk, sorotan menu, dan garis tepi berkilau mengikuti bentuk notch`

### Task 5: Navbar HP dan tablet

**Files:**
- Create: `components/navbar/PanelHp.tsx`
- Modify: `components/Navbar.tsx`

**Interfaces:**
- Consumes: `LanguageSwitcher({varian})`, sakelar mode gelap dari `MenuLainnya`, dan `data-keadaan` (Task 3).
- Produces: `PanelHp({ buka: boolean; onTutup: () => void })`. Berisi lima menu, bahasa, mode gelap, dan Syarat & Ketentuan. Tertutup saat pindah halaman (`pathname`) dan saat Esc.

- [ ] **Step 1: Notch ringkas (< 1024 px).**
  - Isinya logo, Paket Tour, dan ☰.
  - "TRANSPORT" disembunyikan di bawah 400 px.
  - **Tidak ada tombol WhatsApp.**
  - Saat panel terbuka, notch tetap hitam meski digulir.
- [ ] **Step 2: Cek tipe.** `npx tsc --noEmit && npm test`. Expected: lolos.
- [ ] **Step 3: Cek visual di 375 dan 820 px:**
  - `document.documentElement.scrollWidth <= innerWidth` di beranda, katalog, detail, dan S&K;
  - ☰ membuka panel berisi 5 menu;
  - panel tertutup setelah klik "Katalog";
  - bar "Booking Sekarang" di halaman detail dan `CompareBar` tetap muncul dan bisa diklik.
- [ ] **Step 4: Commit** `feat(navbar): notch ringkas dan panel menu di HP`

### Task 6: Halaman detail — kolom kiri susunan A

**Files:**
- Create: `components/detail/KartuPaket.tsx`, `components/detail/TabelBiayaArea.tsx`, `components/detail/PerluDiketahui.tsx`, `components/detail/MobilSerupa.tsx`
- Modify (tulis ulang tata letak): `components/CarDetailBody.tsx`
- Modify: `app/mobil/[slug]/page.tsx` (ambil `getCars()`, hitung `mobilSerupa`, oper ke `CarDetailBody`)
- Modify: `components/TanyaButton.tsx` (gaya tombol garis kecil, label `dict.detail.askFirst`)
- Modify: `app/globals.css` (geser tombol chat di halaman detail)

**Interfaces:**
- Consumes:
  - `paketTersedia`, `hargaPaket`, `adaHarga`, `Paket` (lib/paket);
  - `tabelBiayaArea`, `mobilSerupa` (Task 1);
  - `RINGKASAN_PAKET`, `TARIF_LEPAS_KUNCI`, `HARGA_BERLAKU_SEJAK`, `NAMA_AREA`;
  - `dict.detail.*` (Task 2).
- Produces:
  - `CarDetailBody({ car: Car; serupa: Car[] })`. Memegang state `paket: Paket` (awal `paketTersedia(car)[0]`) dan mengoper `paket` dan `onPaket` ke `KartuPaket` dan ke `BookingForm` (Task 7).
  - `KartuPaket({ car; paket; onPilih: (p: Paket) => void })`. Elemen pembungkusnya ber-`id="kartu-harga"`, supaya `StickyBookingBar` tetap bekerja tanpa diubah.
  - `TabelBiayaArea({ car; paket })` merender `tabelBiayaArea(car, paket)`. Judul tabel per paket memakai `areaTitleFullDay`, `areaTitleSelfDrive`, atau `areaTitleTransfer`.
  - `PerluDiketahui({ car; paket })`. Butirnya:
    - `infoOvertime` (hanya paket dengan sopir dan `adaHarga(car.price_overtime)`);
    - `infoLate` (hanya `self_drive`);
    - `infoCancel` (selalu);
    - `infoDeposit` (hanya `self_drive`);
    - `paket.validSince` (selalu);
    - tautan `seeTerms`.
  - `MobilSerupa({ cars: Car[] })` merender `null` bila `cars` kosong.
  - Atribut `data-halaman="detail"` di `<html>` selama `CarDetailBody` terpasang. Di ≥ 1024 px, CSS memindahkan `.floating-chat` ke kiri bawah.

- [ ] **Step 1: Kolom kiri** (urutan dan isi sesuai spec Bagian 2):
  - galeri (thumbnail hanya bila foto lebih dari satu, sudah begitu di `PhotoGallery`);
  - nama dan label (tipe, Tersedia/Disewa, Lepas kunci, spesifikasi yang terisi; **tanpa cc**);
  - `KartuPaket`;
  - Termasuk/Tidak termasuk dari `RINGKASAN_PAKET[paket]`;
  - `TabelBiayaArea`;
  - `PerluDiketahui`;
  - deskripsi;
  - `MobilSerupa`.

  Kartu terpilih bertepi merah, terangkat sedikit, dengan transisi. Isi Termasuk dan tabel berganti dengan pudar saat paket diganti. Bagian-bagian memakai `ScrollReveal`.
- [ ] **Step 2: Tata letak.**
  - Di ≥ 1024 px: grid dua kolom kira-kira 2:1, dengan kotak kanan `lg:sticky lg:top-24`.
  - Di < 1024 px, urutannya galeri → nama → kartu paket → **kotak booking** → informasi → mobil serupa. Pakai `order-*` atau susunan DOM yang sesuai.
  - **Unit tanpa paket:** `KartuPaket`, `TabelBiayaArea`, dan `PerluDiketahui` tidak dirender.
- [ ] **Step 3: Data.** `page.tsx` memanggil `getCars()` bersama `getCarBySlug()` (keduanya revalidate 60), lalu `mobilSerupa(car, cars)`. Kalau `getCars` gagal, `serupa = []`.
- [ ] **Step 4: Cek tipe dan test.** `npx tsc --noEmit && npm test`. Expected: lolos.
- [ ] **Step 5: Cek visual, termasuk Review Focus mobil tanpa harga dan unit dengan paket sedikit:**
  - **Avanza di 1440 px:** 3 kartu paket. Tabel Full day: Gratis / Rp 150.000 / Rp 250.000 / Dikonfirmasi. Ganti ke Lepas kunci: tabel menjadi pool / 150k / 300k / 600k / dikonfirmasi, dan Termasuk ikut berganti.
  - **Alphard 2022–2026:** 2 kartu, tanpa Lepas kunci, dan tidak ada sel kosong.
  - **White Marlin:** tanpa kartu, tabel, atau info. Ada "Tanya harga" dan mobil serupa (4 termurah).
  - **4 bahasa di 1280 dan 375 px:** teks kartu paket tidak terpotong (`scrollWidth <= clientWidth` pada setiap kartu).
  - **1280–1920 px:** `.floating-chat` tidak beririsan dengan kotak kanan (bandingkan bounding box).
- [ ] **Step 6: Commit** `feat(detail): susunan A — kartu paket, biaya area per mobil, perlu diketahui, mobil serupa`

### Task 7: Kotak booking dua langkah

**Files:**
- Modify (tulis ulang): `components/BookingForm.tsx`

**Interfaces:**
- Consumes:
  - `hitungBooking`, `normalisasiJumlah`, `areaUntukPaket`, `PilihanArea` (lib/hitungBooking);
  - `buatPayloadBooking`, `buatPesanWa` (lib/booking, tidak diubah);
  - `AnimatedNumber`;
  - `TanyaButton` (Task 6);
  - `dict.detail.next|edit|step`.
- Produces: `BookingForm({ car: Car; paket: Paket; onPaket: (p: Paket) => void })`. `id="form-booking"` tetap dipakai supaya `StickyBookingBar` bekerja.

- [ ] **Step 1: Pemilih paket di dalam kotak.** Segmen ringkas di atas kotak, berisi paket dari `paketTersedia(car)`, dan memanggil `onPaket`. Label boleh dua baris tetapi tidak boleh terpotong (`text-wrap: balance`, tanpa `truncate` atau `whitespace-nowrap`).
- [ ] **Step 2: Langkah 1.**
  - Isinya: jumlah dan tanggal berdampingan, area, rincian, total (`AnimatedNumber`), catatan dikonfirmasi, dan tombol merah `next`.
  - **Tanggal wajib** sebelum lanjut (pesan `dict.booking.errDate`).
  - Saat paket berubah lewat prop, area disesuaikan dengan `areaUntukPaket`. **Hapus `pilihPaket` lama.**
- [ ] **Step 3: Langkah 2.**
  - Langkah 1 menyusut menjadi ringkasan baca-saja (paket · jumlah · tanggal · area) dengan total tetap terlihat dan tautan `edit`.
  - Kolom nama, WhatsApp, dan catatan meluncur masuk (geser + pudar ±0,3 detik; kebalikannya saat kembali).
  - Tombol hijau Booking via WhatsApp, lalu kalimat persetujuan S&K, lalu `TanyaButton` kecil di bawah kotak.
  - **Paket diganti saat langkah 2:** tetap di langkah 2, ringkasan dan total diperbarui dengan sorotan singkat.
  - Kirim booking tidak berubah: `buatPayloadBooking` dan `buatPesanWa`, POST lalu WhatsApp.
- [ ] **Step 4: Unit tanpa paket.** Tampilan "Tanya harga" + WhatsApp tetap seperti sekarang.
- [ ] **Step 5: Cek tipe dan test.** `npx tsc --noEmit && npm test`. Expected: lolos.
- [ ] **Step 6: Cek visual, termasuk Review Focus ganti paket di langkah 2 dan label panjang** (POST booking diblokir di skrip; tidak ada booking yang dikirim ke production):
  - **Viewport 1280×720:** langkah 1 utuh di dalam layar (`bottom` kotak ≤ 720 setelah menggulir halaman sehingga kotaknya menempel), begitu juga langkah 2.
  - **Avanza Full day, 3 hari, Area 2:** total Rp 2.550.000. "Lanjut" tanpa tanggal memunculkan pesan error. Dengan tanggal, masuk langkah 2 dan ringkasannya memuat "Rp 2.550.000".
  - **Di langkah 2, pilih kartu "Lepas kunci" di kiri:** tetap di langkah 2, area menjadi "pool", total Rp 1.200.000, sama dengan `hitungBooking`.
  - **Kembali ke Full day:** area menjadi Area 1, total Rp 2.100.000.
  - **"Ubah":** kembali ke langkah 1 dengan nilai yang tetap sama.
  - **4 bahasa di 1280 dan 375 px:** tombol segmen tidak terpotong.
  - **Pesan WhatsApp** (tangkap `window.open`) sama formatnya dengan sebelumnya, untuk satu kasus Lepas kunci Area 2.
- [ ] **Step 7: Commit** `feat(booking): kotak booking dua langkah dengan pemilih paket dan ringkasan`

### Task 8: Pemeriksaan menyeluruh dan rilis

**Files:** tidak ada perubahan kode, kecuali perbaikan dari temuan pemeriksaan ini (masing-masing dengan test atau cek yang gagal lebih dulu).

- [ ] **Step 1: Uji otomatis.** Run: `npm test && npx tsc --noEmit && NEXT_PUBLIC_API_BASE_URL=https://api.welcomemanado.my.id/api npm run build`. Expected: semua lolos.
- [ ] **Step 2: Matriks pemeriksaan browser** (production build lokal, API production, hanya baca):
  - **Halaman:** beranda, katalog, Avanza, Alphard 2022–2026, White Marlin, S&K, promo.
  - **Lebar:** 375, 820, 1280, 1440, 1920 px.
  - **Variasi:** mode terang dan gelap, `reducedMotion: "reduce"`, 4 bahasa.
  - **Yang dicek di setiap kombinasi:**
    - tidak ada `pageerror`;
    - tidak ada "Rp 0" pada harga;
    - tidak bisa digulir ke samping;
    - notch hitam di posisi 0 dan kaca setelah digulir;
    - teks navbar keadaan kaca terbaca (screenshot dilihat di beranda, detail, dan S&K, terang dan gelap).
- [ ] **Step 3: Review akhir seluruh branch** oleh reviewer baru (alur executing-plans).
- [ ] **Step 4: Rilis, hanya dengan persetujuan pengguna di setiap langkah.**
  1. Push `feat/navbar-detail-booking`.
  2. PR ke `dev`.
  3. Setelah pengguna merge, PR `dev` → `main`. Merge oleh pengguna = rilis Vercel.
  4. Cek production: halaman 200, notch tampil, dan kotak booking menghitung Avanza Area 2 3 hari = Rp 2.550.000. Booking uji hanya dengan persetujuan pengguna.
