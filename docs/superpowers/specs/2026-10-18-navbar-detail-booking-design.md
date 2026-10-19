# Navbar "notch", Halaman Detail Kendaraan, dan Booking Dua Langkah — Desain

**Tanggal:** 2026-10-18
**Repo:** transport_wm (transport.welcomemanado.com). API, admin, dan data tidak diubah.
**Lampiran rujukan** (buka di browser; folder `2026-10-18-navbar-detail-booking/`):
- `prototipe-navbar.html`: navbar akhir yang sudah disetujui pengguna, dengan semua perilaku dan animasinya. Gulir di dalam kotak untuk melihat perilaku saat digulir.
- `prototipe-garis-kilau.html`: garis tepi gaya **A · Kilau** (yang dipilih). Gaya B (bintang) **tidak** dipakai.
- `mockup-detail.html`: susunan halaman detail. Pengguna memilih **A**.

## Latar belakang dan tujuan

Rilis paket harga (spec 2026-10-14) sudah live. Saat melihatnya di laptop, pengguna menilai dua hal masih kurang:

1. **Halaman detail kendaraan** tidak seimbang:
   - kolom kiri (foto, judul, deskripsi singkat) habis di sekitar sepertiga halaman dan menyisakan ruang kosong besar;
   - kolom kanan (kartu harga, tombol Tanya, form booking panjang) lebih dari dua kali tinggi kolom kiri;
   - tombol paket "Lepas kunci" terpotong;
   - tombol chat melayang menutupi form.

   Pengguna ingin halaman ini **lebih menarik dan informatif**.
2. **Navbar kurang menarik.** Rujukan pengguna adalah navbar Supaste: bar hitam ramping di tengah yang menggantung dari tepi atas layar, dengan sudut atas melengkung cekung menyatu ke tepi layar dan satu tombol putih yang kontras.

Tujuan bisnisnya tetap sama seperti rilis sebelumnya: menarik lebih banyak booking. Halaman detail adalah tempat keputusan booking diambil, jadi informasinya harus lengkap dan jalan menuju booking harus jelas.

## Keputusan pengguna

- **Navbar gaya "notch"** ala Supaste, dengan:
  - kedua **sudut atas cekung**, sehingga hitamnya melengkung ke luar dan menyatu dengan tepi atas layar;
  - sudut bawah membulat;
  - tampilan **lebih rapi** dari versi pertama, **dengan animasi**.
- **Tombol utama navbar adalah "Paket Tour ↗"**, membuka **welcomemanado.com** di tab baru. Tombol "Hubungi/Booking via WhatsApp" di navbar **dihapus**, baik di desktop maupun di HP.
- **Garis tepi notch beranimasi** dengan gaya **A · Kilau**:
  - inti putih terang di tengah, memudar menjadi merah muda lalu merah, lalu hilang di **kedua sisi** (simetris, bukan komet berekor);
  - bergerak **dari kiri ke kanan**;
  - **mengikuti seluruh bentuk notch**: lengkung cekung kiri-atas → sisi kiri → sudut kiri-bawah → bawah → sudut kanan-bawah → sisi kanan → lengkung cekung kanan-atas;
  - di belakangnya ada garis dasar tipis samar yang selalu menandai bentuk notch.
- **Halaman detail susunan A:**
  - informasi lengkap di kolom kiri;
  - **kotak booking ringkas di kanan yang menempel saat digulir**;
  - booking **dua langkah**: perhitungan dulu, baru data diri.
- Pengguna menyetujui rangkuman navbar dan rangkuman halaman detail di bawah, termasuk butir yang awalnya keputusan saya.

## Bagian 1 — Navbar

### Desktop (≥ 1024 px)

**Bentuk:**
- Bar hitam (`#0a0a0a`) di tengah atas, lebarnya mengikuti isi (bukan selebar layar).
- Menempel ke tepi atas layar.
- **Sudut atas cekung** dengan radius sekitar 22 px di kiri dan kanan.
- **Sudut bawah membulat** sekitar 26 px.
- Bayangan lembut di bawah.
- Sudut cekung dan garis tepi ikut bergerak bersama notch dalam semua animasi.

**Isi, dari kiri ke kanan:**
1. **Logo.** Pakai komponen `Logo` yang ada (tile hitam), lalu wordmark "Welcome**Manado**" (Manado merah) dengan "TRANSPORT" kecil berspasi lebar di bawahnya. Logo tertaut ke `/`.
2. **Lima menu:** Beranda, Katalog, Promo, Artikel, Tentang. Teks putih redup; teks putih penuh saat di-hover atau aktif. Halaman aktif ditandai **titik merah kecil bercahaya** di bawah teksnya.
3. **Tombol bahasa** (kapsul gelap, ikon globe + kode bahasa). Memakai perilaku `LanguageSwitcher` yang ada, dengan tampilan disesuaikan ke notch.
4. **Tombol "⋯"** yang membuka menu kecil berisi:
   - **Mode gelap** (sakelar, memakai perilaku `ThemeToggle`);
   - **Syarat & Ketentuan** (tautan ke `/syarat-ketentuan`).

   Menu tertutup saat klik di luar, saat menekan Esc, dan saat halaman digulir.
5. **Tombol utama "Paket Tour ↗":**
   - putih, sudut membulat sekitar 12 px (kotak, bukan kapsul), teks hitam tebal, panah merah;
   - membuka `MAIN_SITE_URL` di tab baru (`noopener`);
   - label memakai `dict.nav.mainSite`.

**Perilaku saat digulir** (keputusan saya, disetujui):
- **Di paling atas halaman:** notch hitam tampil penuh.
- **Begitu halaman digulir** (lebih dari ±24 px), **latar hitam, sudut cekung, dan garis tepi memudar** (±0,4 detik) dan digantikan **kaca buram tipis** (pilihan pengguna untuk menjaga keterbacaan):
  - latar putih tembus pandang (sekitar 75%) dengan efek buram (`backdrop-filter: blur`) di belakang isi notch, garis tepi tipis abu-abu muda, dan bayangan lembut;
  - bentuknya seperti notch tanpa sudut cekung, yaitu menempel di atas dengan sudut bawah membulat (keputusan saya);
  - wordmark dan menu menjadi gelap; kapsul bahasa dan "⋯" menjadi abu-abu muda;
  - tombol Paket Tour menjadi **merah dengan teks putih**;
  - teks harus **selalu terbaca** di atas bagian mana pun, termasuk hero gelap beranda, foto galeri, dan kartu.
- **Notch hitam baru tampil kembali ketika halaman kembali ke paling atas.** Bukan setiap kali menggulir naik.
- **Mode gelap** (keputusan saya): kacanya gelap tembus pandang (sekitar slate-900/75) dengan teks dan ikon terang. Tombol Paket Tour tetap merah.
- **Prototipe** `prototipe-navbar.html` masih menampilkan keadaan memudar **tanpa** kaca. Untuk keadaan ini, dokumen inilah yang berlaku.

**Animasi:**
- **Masuk:** saat halaman pertama dimuat, notch turun dari atas dengan sedikit pantulan (±0,8 detik), lalu isinya muncul berurutan dengan jeda kecil.
  - Pakai fill-mode `backwards`, **bukan** `both`. Animasi dengan `both` menahan transform terakhirnya, sehingga mengalahkan transform lain dan menjadikan notch containing block bagi elemen `fixed` (pelajaran dari rilis sebelumnya).
- **Sorotan menu:** kapsul putih transparan yang **meluncur** mengikuti menu di bawah kursor, lalu hilang saat kursor keluar dari deretan menu.
- **Logo:** sedikit berputar dan membesar saat di-hover.
- **Paket Tour:** panah bergeser serong ke kanan-atas saat di-hover. Ada **kilau berkala** yang menyapu tombol (pakai kelas `kilau` yang sudah ada atau yang setara).
- **Garis tepi kilau:** lihat keputusan pengguna di atas.
  - Satu putaran sekitar 4,2 detik, linear, berulang.
  - Jalurnya harus dibangun ulang saat ukuran notch berubah (lebar layar berubah, bahasa berganti, atau transisi saat digulir), supaya tetap pas dengan bentuknya.
  - Prototipe memakai jalur SVG dari ukuran notch, lima lapisan garis berpusat di satu titik, dan `requestAnimationFrame`. Cara lain boleh asal hasilnya sama.
- **Semua animasi di atas mati di `prefers-reduced-motion`.** Garis tepi tampil sebagai garis diam, notch langsung tampil tanpa turun, dan tidak ada kilau.

### HP dan tablet (< 1024 px)

Keputusan saya, disetujui sebagai garis besar:
- **Notch dipakai juga**, tetapi diringkas menjadi logo (tanpa "TRANSPORT" bila sempit), tombol **Paket Tour**, dan tombol **☰**.
- **☰ membuka panel menu** yang muncul dari bawah notch, dengan gaya gelap senada. Isinya: lima menu, bahasa, mode gelap, dan Syarat & Ketentuan.
- **Tidak ada tombol WhatsApp di navbar HP.** WhatsApp tetap ada di tombol chat melayang dan di halaman mobil.
- Perilaku saat digulir sama dengan desktop. Saat panel menu terbuka, notch tetap hitam.
- **Batas lebar:** di 375 px, navbar tidak boleh membuat halaman bisa digulir ke samping. Navbar lama melewati layar 32 px di 375 px; masalah ini harus hilang.

### Penempatan di halaman

- **Beranda:** notch melayang **di atas hero gelap**. Bagian kiri dan kanan notch memperlihatkan hero, bukan pita putih.
- **Halaman lain:** konten pertama (breadcrumb, judul) **tidak boleh tertutup** notch.
- Caranya diserahkan ke builder: header `fixed`, sticky setinggi 0 seperti di prototipe, ditambah jarak atas pada `main`, atau cara lain.
- Bar booking yang menempel di HP dan `CompareBar` harus tetap berfungsi.

## Bagian 2 — Halaman detail kendaraan (susunan A)

### Laptop / desktop (≥ 1024 px)

Dua kolom, kiri sekitar dua pertiga lebar dan kanan sepertiga.

**Kolom kiri, berurutan dari atas:**
1. **Galeri foto besar.**
   - Deretan thumbnail **hanya tampil bila foto lebih dari satu**. Saat ini setiap unit baru punya satu foto.
   - Lightbox yang ada (`PhotoGallery`) dipertahankan.
2. **Nama mobil** (besar), lalu deretan label:
   - tipe;
   - status **"● Tersedia"** (hijau) atau "Disewa";
   - **"🔑 Lepas kunci"** bila unit itu menyediakan lepas kunci;
   - spesifikasi yang ada nilainya (kursi, transmisi, BBM, tahun). Yang kosong tidak ditampilkan.
   - **Isi silinder tidak ditampilkan**, sesuai spec sebelumnya.
3. **Kartu paket** (Full day / Transfer / Lepas kunci), berdampingan. **Hanya paket yang tersedia** untuk unit itu yang ditampilkan. Setiap kartu berisi:
   - nama paket;
   - harga besar merah dengan satuan /hari atau /trip;
   - keterangan singkat (maks. 12 jam · dengan sopir, dan seterusnya).

   Kartu terpilih bertepi merah dan menyala halus. **Memilih kartu langsung mengganti paket di kotak booking**, begitu juga sebaliknya.
4. **Termasuk / Tidak termasuk**, dua kotak berdampingan. Isinya dari `RINGKASAN_PAKET` dan **berganti mengikuti paket terpilih**, dengan transisi halus.
5. **"Biaya area untuk mobil ini"**, tabel Area 1–4:
   - **Paket dengan sopir:** dihitung dari `engine_cc` mobil itu (Area 1 gratis, Area 2/3 sesuai golongan, Area 4 "dikonfirmasi"). Unit tanpa `engine_cc` menampilkan "dikonfirmasi" untuk Area 2–3.
   - **Paket lepas kunci:** tabel menampilkan biaya antar-jemput (pool gratis, Area 1/2/3, Area 4 dikonfirmasi).
   - **Paket transfer** (keputusan saya, mengikuti `hitungBooking`): Area 1 "termasuk", Area 2–4 "dikonfirmasi via WhatsApp". Tabel dan total selalu memakai fungsi yang sama, jadi keduanya tidak pernah berbeda.
   - Judul tabel menyesuaikan paket.
6. **"Perlu diketahui"**, butir singkat dari `lib/tarif-sewa.ts` dan S&K:
   - over time per jam unit itu (paket dengan sopir);
   - telat kembali Rp 100.000/jam (lepas kunci);
   - pembatalan lebih dari 24 jam: uang kembali penuh;
   - lepas kunci: KTP + KK asli dan deposit;
   - "Harga berlaku sejak 1 Oktober 2026";
   - tautan ke `/syarat-ketentuan`.
7. **Deskripsi** (sesuai bahasa aktif, seperti sekarang).
8. **"Mobil serupa"**: hingga **empat** unit lain dengan **harga Full day terdekat** dengan mobil ini (keputusan saya).
   - Hanya unit yang punya harga; unit "Tanya harga" tidak dimasukkan.
   - Ditampilkan sebagai kartu kecil (foto, nama, harga), tertaut ke halaman detailnya.
   - Bagian ini disembunyikan bila tidak ada unit yang memenuhi.

**Kolom kanan, kotak booking yang menempel saat digulir:**
- **Pemilih paket di dalam kotak** (keputusan saya): pemilih ringkas berbentuk segmen di bagian atas kotak.
  - Isinya sinkron dengan kartu paket di kiri, karena pengguna menyetujui "begitu juga sebaliknya". Di HP, pemilih ini yang paling dekat ke form.
  - Label boleh turun ke dua baris, tetapi **tidak boleh terpotong** di bahasa apa pun.
- **Langkah 1:**
  - jumlah hari/trip dan tanggal mulai, berdampingan;
  - area (untuk lepas kunci: "Ambil di pool (gratis)" atau Area 1–4);
  - rincian (sewa, biaya area/antar-jemput);
  - **Total** (angka bergulir, seperti sekarang);
  - catatan "dikonfirmasi" bila ada;
  - tombol merah **"Lanjut isi data →"**.
- **Langkah 2** (keputusan saya untuk rinciannya):
  - **Langkah 1 menyusut menjadi ringkasan satu-dua baris** yang hanya bisa dibaca: paket · jumlah · tanggal · area. **Total tetap terlihat.** Ada tautan "Ubah" untuk kembali ke langkah 1.
  - Kolom data lalu meluncur masuk di bawah ringkasan itu: nama, nomor WhatsApp, catatan.
  - **Kalau paket diganti selama langkah 2** (lewat kartu di kiri atau pemilih di kotak), kotak **tetap di langkah 2**. Ringkasan dan total diperbarui dengan sorotan singkat.
  - tombol hijau **"Booking via WhatsApp"**;
  - kalimat persetujuan S&K.
- **Validasi tanggal:** sebelum lanjut ke langkah 2, tanggal mulai wajib terisi.
- Kirim booking dan pesan WhatsApp **tidak berubah** dari implementasi sekarang (`buatPayloadBooking`, `buatPesanWa`, POST lalu buka WhatsApp, tetap buka WhatsApp bila POST gagal).
- Di bawah kotak ada tombol garis kecil **"💬 Tanya dulu via WhatsApp"**, menggantikan tombol "Tanya Ketersediaan" yang besar. Pesannya sama dengan `TanyaButton` sekarang.
- **Kotak tidak boleh lebih tinggi dari layar** (keputusan saya untuk ukurannya). Pada **viewport browser 1280×720** (setara laptop 768 px setelah tab dan bilah alamat Chrome):
  - langkah 1 terlihat seluruhnya;
  - langkah 2 terlihat seluruhnya, termasuk ringkasan, kolom data, dan tombol Booking;
  - tidak perlu menggulir di dalam kotak.
- **Tombol paket tidak boleh terpotong** dalam bahasa apa pun (id/en/zh/ko).
- **Tombol chat melayang tidak boleh menutupi kotak booking** di lebar 1280–1920 px. Caranya diserahkan ke builder, misalnya memindah chat ke kiri di halaman detail, atau memberi jarak.

### HP (< 1024 px)

Semua bagian bertumpuk dengan urutan:
1. galeri;
2. nama + label;
3. kartu paket;
4. **kotak booking**;
5. Termasuk / Tidak termasuk;
6. biaya area;
7. perlu diketahui;
8. deskripsi;
9. mobil serupa.

Kartu paket boleh tersusun vertikal atau digulir ke samping, asal tidak terpotong. Bar "Booking Sekarang" yang menempel di bawah (`StickyBookingBar`) tetap dipakai, dengan aturan tampil yang sama: muncul saat digulir, hilang selama kartu paket atau kotak booking terlihat.

### Unit tanpa harga (mis. White Marlin)

Tidak ada kartu paket dan tidak ada langkah 1/2. Kotak kanan menampilkan "Tanya harga" dan tombol WhatsApp, seperti sekarang. Tabel biaya area dan "Perlu diketahui" disembunyikan, karena belum ada paket.

## Bagian 3 — Animasi halaman detail

- **Kartu paket:** saat dipilih, tepi merah muncul dengan transisi dan kartunya terangkat sedikit. Hover juga sedikit mengangkat kartu.
- **Total dan rincian** bergulir (`AnimatedNumber` yang ada).
- **Langkah 2** meluncur masuk (geser + pudar sekitar 0,3 detik); kembali ke langkah 1 dengan arah sebaliknya.
- **Isi Termasuk / Tidak termasuk dan tabel area** berganti dengan pudar saat paket diganti.
- **Bagian di kolom kiri** muncul bertahap saat digulir (`ScrollReveal` yang ada).
- **Semua mati di `prefers-reduced-motion`.**

## Batasan

- **Tanpa dependensi runtime baru.** Tetap Tailwind/CSS dan React biasa.
- **Semua teks baru dalam 4 bahasa** (id/en/zh/ko) di `lib/i18n/dictionaries.ts`. Test kamus yang ada (placeholder sama, tidak ada teks kosong) harus tetap lolos.
- **Logika harga tidak diubah:** `lib/paket.ts`, `lib/hitungBooking.ts`, `lib/booking.ts`, `lib/tarif-sewa.ts`, dan `lib/ringkasan-paket.ts` dipakai apa adanya. Tampilan baru membaca dari sana. Biaya area per mobil dihitung dengan fungsi yang sama dengan form, sehingga tabel dan total tidak pernah berbeda.
- **Test yang ada** (51) tetap lolos, termasuk `teks-situs.test.ts`: tanpa janji diskon dan tanpa nama "Pesona".
- **Rilis lewat branch** `feat/navbar-detail-booking` → PR ke `dev` → PR `dev` → `main` (dilakukan pengguna). Vercel men-deploy `main`.

## Bukan tujuan

- Mengubah halaman lain selain navbar (yang tampil di semua halaman) dan halaman detail. Beranda, katalog, dan halaman lainnya hanya ikut menyesuaikan jarak atas akibat navbar baru.
- Mengubah API, admin, data armada, harga, atau isi S&K.
- Menambah fitur booking baru, misalnya pembayaran atau cek ketersediaan per tanggal.

## Yang tidak boleh terjadi (anti-tujuan)

- Navbar dalam keadaan kaca buram membuat teks **tidak terbaca**, baik di mode terang maupun gelap, di atas bagian mana pun.
- Halaman bisa **digulir ke samping** di HP.
- **Total di kotak booking berbeda** dengan rincian, atau dengan tabel biaya area di kiri.
- **Animasi terasa berat atau patah-patah** di laptop biasa. Garis tepi berjalan terus di setiap halaman, jadi harus ringan.
- **"Rp 0" muncul lagi** di mana pun.

## Diserahkan kepada builder

- Cara teknis menempatkan header (fixed atau sticky) dan jarak atas halaman, asal memenuhi "Penempatan di halaman".
- Cara memindahkan atau memberi jarak tombol chat di halaman detail.
- Pemecahan komponen. Misalnya `CarDetailBody` dipecah menjadi kartu paket, tabel area, dan kotak booking dengan state paket diangkat ke induknya. Navbar dipecah menjadi notch desktop, panel HP, dan garis tepi.
- Detail jarak, ukuran huruf, dan warna di luar yang disebut di sini, mengikuti prototipe dan gaya situs yang ada (Tailwind, aksen merah `red-600`, netral `slate`).

## Pengecekan

- `npm test`, `npx tsc --noEmit`, dan `next build` lolos.
- **Test baru** untuk logika yang ditambahkan:
  - pemilihan "mobil serupa" (terdekat, tanpa unit tanpa harga, maksimal 4, tidak memasukkan mobil itu sendiri);
  - isi tabel biaya area per paket dan per golongan cc;
  - kunci kamus baru di 4 bahasa.
- **Pemeriksaan di Chrome** terhadap API production (hanya baca, tanpa mengirim booking):
  - beranda, katalog, detail Avanza, Alphard 2022–2026, White Marlin, dan S&K;
  - lebar 375, 820, 1280, 1440, dan 1920 px; mode terang dan gelap; `prefers-reduced-motion`; 4 bahasa;
  - kotak booking tidak lebih tinggi dari layar 1280×768;
  - tombol chat tidak menutupi kotak booking;
  - tidak ada geser ke samping di 375 px;
  - garis kilau mengikuti bentuk notch pada keadaan normal dan setelah lebar layar diubah;
  - notch kembali hitam hanya ketika halaman di paling atas.
