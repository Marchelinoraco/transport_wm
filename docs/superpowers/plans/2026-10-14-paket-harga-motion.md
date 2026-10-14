# Paket Harga, Syarat & Ketentuan, dan Motion Transport — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Situs transport.welcomemanado.com menampilkan harga paket resmi (Full day / Transfer / Lepas kunci + Over time) untuk 11 armada dengan foto yang hidup, form booking yang menghitung Biaya Area, halaman Syarat & Ketentuan 4 bahasa, dan motion yang mengarahkan pengunjung ke booking.

**Architecture:**
- **api_wm (Laravel):** menambah kolom harga paket dan isi silinder (aditif). Kolom yang tidak dikirim tidak diubah.
- **admin_wm (Vue):** menulis kolom-kolom itu.
- **Data production:** diisi lewat skrip Python yang meniru form admin.
- **transport_wm (Next.js 14):**
  - memindahkan semua aturan harga ke fungsi murni yang teruji (`lib/paket.ts`, `lib/hitungBooking.ts`, `lib/booking.ts`);
  - komponen tinggal menampilkan hasilnya;
  - motion dibangun dengan CSS/Tailwind, tanpa library runtime baru.

**Tech Stack:** Laravel 11 + PHPUnit (SQLite in-memory), Vue 3 + Vite + vitest, Next.js 14 App Router + Tailwind 3 + TypeScript + vitest (devDependency baru), Python 3 + requests + Pillow.

**Spec:** `transport_wm/docs/superpowers/specs/2026-10-14-paket-harga-motion-design.md`

## Global Constraints

- **Migrasi hanya aditif.** Tidak ada kolom yang dihapus atau diubah tipenya.
- **Semantik kolom paket di API:** kolom tidak dikirim → tidak diubah; dikirim kosong → `null`. Form admin baru selalu mengirim keempat kolom.
- **Harga sesuai PDF resmi** (berlaku sejak 01 Oktober 2026). Angka per unit ada di tabel spec §3 dan di Task 5.
- **Paket:** `full_day` (kolom `price`, per hari, dengan sopir, maks. 12 jam), `transfer` (kolom `price_pickup`, per trip, dengan sopir), `self_drive` (kolom `price_self_drive`, per hari, tanpa sopir, maks. 12 jam).
- **Over time per unit** berlaku untuk paket dengan sopir. **Lepas kunci telat kembali: Rp 100.000 per jam, flat.**
- **Biaya Area (full_day, per hari):**
  - Area 1: Rp 0
  - Area 2: Rp 150.000 (≤ 2000 cc) / Rp 250.000 (> 2000 cc)
  - Area 3: Rp 250.000 / Rp 350.000
  - Area 4 atau `engine_cc` kosong: "dikonfirmasi"
- **Antar-jemput lepas kunci:** sekali per pemesanan.
  - Pool: gratis
  - Area 1: Rp 150.000
  - Area 2: Rp 300.000
  - Area 3: Rp 600.000
  - Area 4: dikonfirmasi
- **Transfer:** tidak ada biaya area otomatis. Area selain 1 → "dikonfirmasi".
- **Harga 0 atau kosong** tampil "Tanya harga", tidak pernah "Rp 0".
- **Operator di semua teks transport_wm adalah "Welcome Manado".** Kata "Pesona Manado" tidak boleh muncul.
- **Versi S&K dan harga: `2026-10-01`.**
- **Teks UI baru wajib ada dalam id, en, zh, ko** lewat `lib/i18n/dictionaries.ts`. Landing page dan artikel blog tetap berbahasa Indonesia.
- **transport_wm tidak boleh menambah dependensi runtime.** Hanya `vitest` sebagai devDependency.
- **Semua animasi baru mati di bawah `prefers-reduced-motion: reduce`.**
- **Komentar kode dan pesan commit berbahasa Indonesia**, mengikuti repo. Setiap commit diakhiri baris `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Branch:**
  - api_wm dan admin_wm: `feat/transport-paket-harga` dari `dev`
  - transport_wm: `feat/paket-harga-motion` (sudah ada)
- **Tidak ada merge ke `main`, push, atau deploy tanpa persetujuan pengguna.**

## Review Focus

- **Staf menyimpan armada dari tab admin versi lama setelah API baru terpasang.** Harga paket harus tetap utuh, bukan terhapus. Diuji di Task 1 (`test_kolom_tidak_dikirim_tidak_diubah`).
- **Unit tanpa satu pun paket berharga** (misalnya White Marlin, harga 0). Form booking tidak boleh crash dan harus menampilkan "Tanya harga" plus WhatsApp. Diuji di Task 6 (`paketTersedia` kosong, `hitungBooking` null) dan diperiksa visual di Task 10.
- **Pengunjung di zona waktu negatif** (turis Amerika) memilih tanggal mulai. Tanggal selesai harus tetap benar. Diuji di Task 6 (`tanggalSelesai` dengan `TZ=America/Los_Angeles`).
- **Isian jumlah hari dikosongkan, diisi 0, negatif, atau angka raksasa.** Total harus tetap masuk akal (minimal 1, maksimal 365). Diuji di Task 6 (`normalisasiJumlah`).
- **Semua foto armada mati, atau kurang dari 3 unit berfoto.** Beranda tidak boleh menampilkan marquee kosong atau chip "Mulai Rp 0". Diuji di Task 6 (`hargaMulai`) dan diperiksa visual di Task 13 (FleetMarquee mengembalikan `null` bila kurang dari 3 unit berfoto).

---

## Lingkungan uji lokal

Dipakai oleh Task 5 dan oleh pemeriksaan visual Task 8–14. Lingkungan ini menjalankan API lokal dengan SQLite terpisah, sehingga `.env` dan database MySQL lokal tidak tersentuh.

**Penyiapan (sekali, setelah Task 1–2 selesai di branch api_wm):**

```bash
UJI=<direktori scratchpad sesi>/wm-armada
mkdir -p "$UJI" && touch "$UJI/armada.sqlite"
cd /Users/marchelinoraco/Documents/2026/welcomeManado/api_wm
export DB_CONNECTION=sqlite DB_DATABASE="$UJI/armada.sqlite" APP_URL=http://127.0.0.1:8123
php artisan config:clear
php artisan migrate --force
php artisan storage:link 2>/dev/null || true
```

Buat `$UJI/fixture.php`. Isinya meniru 9 armada production (id, slug, harga 0, foto mati), lalu mencetak token admin:

```php
<?php
$armada = [
    5 => ['Toyota Avanza', 'toyota-avanza', 'Mini MVP'],
    6 => ['Toyota Innova Reborn', 'toyota-innova-reborn', 'Mini MVP'],
    7 => ['Toyota Innova Zenix', 'toyota-innova-zenix', 'Mini MVP'],
    8 => ['Hiace Commuter', 'hiace-commuter', 'Mini Bus'],
    9 => ['BUS 30/33 SEATER', 'bus-3033-seater', 'Bus'],
    10 => ['TOYOTA ALPHARD', 'toyota-alphard', 'MPV premium'],
    11 => ['Hiace Premio', 'hiace-premio', 'Mini Bus'],
    12 => ['Toyota Fortuner', 'toyota-fortuner', 'MINI MVP'],
    13 => ['White Marlin', 'white-marlin', 'Boat'],
];
foreach ($armada as $id => [$nama, $slug, $tipe]) {
    $foto = "http://127.0.0.1:8123/storage/transportations/hilang-{$id}.png";
    \App\Models\Transportation::forceCreate([
        'id' => $id, 'name' => $nama, 'slug' => $slug, 'type' => $tipe,
        'price' => 0, 'price_unit' => 'per_day', 'available' => true, 'dengan_sopir' => false,
        'description' => "Deskripsi {$nama}", 'description_en' => "Description {$nama}",
        'description_ko' => "설명 {$nama}", 'description_zh' => "描述 {$nama}",
        'image_url' => $foto, 'images' => [$foto],
    ]);
}
echo \App\Models\User::factory()->create()->createToken('lokal')->plainTextToken, PHP_EOL;
```

```bash
php artisan tinker "$UJI/fixture.php"   # catat token yang tercetak sebagai WM_TOKEN_LOKAL
```

**Menjalankan (setiap kali dibutuhkan):**

```bash
# Terminal 1 — API lokal
cd /Users/marchelinoraco/Documents/2026/welcomeManado/api_wm
DB_CONNECTION=sqlite DB_DATABASE="$UJI/armada.sqlite" APP_URL=http://127.0.0.1:8123 php artisan serve --port=8123

# Terminal 2 — situs transport memakai API lokal
cd /Users/marchelinoraco/Documents/2026/welcomeManado/transport_wm
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8123/api npm run dev
```

`next.config.js` sudah mengizinkan gambar dari `http://127.0.0.1` di port mana pun.

---

## Fase A — api_wm

### Task 1: Harga paket dan isi silinder armada

**Files:**
- Create: `api_wm/database/migrations/2026_10_14_000001_add_package_prices_to_transportations_table.php`
- Create: `api_wm/database/factories/TransportationFactory.php`
- Modify: `api_wm/app/Models/Transportation.php`
- Modify: `api_wm/app/Http/Controllers/Api/TransportationController.php` (validasi `store`/`update`, array `create`/`update`, helper baru)
- Test: `api_wm/tests/Feature/Transport/TransportationPaketHargaTest.php`

**Interfaces:**
- Produces: kolom `transportations.price_pickup`, `price_overtime`, `price_self_drive` (unsigned int, nullable) dan `engine_cc` (unsigned smallint, nullable). Keempatnya ikut di respons publik `GET /api/transportations` dan `GET /api/transportations/slug/{slug}`. Mereka diterima oleh `POST /api/transportations` dan `PUT /api/transportations/{id}` (admin, sanctum) dengan semantik "tidak dikirim = tidak diubah, kosong = null".
- Produces: `Database\Factories\TransportationFactory`.

- [ ] **Step 1: Siapkan branch**

```bash
cd /Users/marchelinoraco/Documents/2026/welcomeManado/api_wm
git checkout dev && git pull --ff-only && git checkout -b feat/transport-paket-harga
```

Expected: `Switched to a new branch 'feat/transport-paket-harga'`. Berkas untracked (`PR-RILIS.md`, `database/sql/`) ikut terbawa. Biarkan saja dan jangan di-commit.

- [ ] **Step 2: Tulis test yang gagal**

`tests/Feature/Transport/TransportationPaketHargaTest.php`:

```php
<?php

namespace Tests\Feature\Transport;

use App\Models\Transportation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Harga paket (transfer, over time, lepas kunci) dan isi silinder armada.
 *
 * Kolom yang TIDAK dikirim tidak boleh berubah: staf yang masih membuka form
 * admin versi lama (tanpa kolom ini) tidak boleh menghapus harga paket hanya
 * dengan menekan Simpan. Kolom yang dikirim KOSONG berarti paket ditiadakan.
 */
class TransportationPaketHargaTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $ubah = []): array
    {
        return array_merge([
            'name' => 'Toyota Avanza',
            'type' => 'Mini MVP',
            'price' => 700000,
            'price_unit' => 'per_day',
            'price_pickup' => 300000,
            'price_overtime' => 50000,
            'price_self_drive' => 400000,
            'engine_cc' => 1500,
            'available' => 1,
        ], $ubah);
    }

    public function test_admin_menyimpan_harga_paket_dan_cc(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $id = $this->postJson('/api/transportations', $this->payload())->assertCreated()->json('data.id');

        $this->assertDatabaseHas('transportations', [
            'id' => $id, 'price' => 700000, 'price_pickup' => 300000,
            'price_overtime' => 50000, 'price_self_drive' => 400000, 'engine_cc' => 1500,
        ]);
    }

    public function test_kolom_tidak_dikirim_tidak_diubah(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $t = Transportation::factory()->create([
            'price_pickup' => 300000, 'price_overtime' => 50000, 'price_self_drive' => 400000, 'engine_cc' => 1500,
        ]);

        // Persis yang dikirim form admin versi lama: tanpa keempat kolom baru.
        $lama = $this->payload();
        unset($lama['price_pickup'], $lama['price_overtime'], $lama['price_self_drive'], $lama['engine_cc']);
        $this->putJson("/api/transportations/{$t->id}", $lama)->assertOk();

        $t->refresh();
        $this->assertSame(300000, $t->price_pickup);
        $this->assertSame(50000, $t->price_overtime);
        $this->assertSame(400000, $t->price_self_drive);
        $this->assertSame(1500, $t->engine_cc);
    }

    public function test_kolom_dikirim_kosong_menjadi_null_bukan_nol(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $t = Transportation::factory()->create(['price_self_drive' => 400000, 'engine_cc' => 1500]);

        $this->putJson("/api/transportations/{$t->id}", $this->payload(['price_self_drive' => '']))->assertOk();

        $t->refresh();
        $this->assertNull($t->price_self_drive);
        $this->assertSame(1500, $t->engine_cc);
    }

    public function test_harga_negatif_dan_cc_tidak_masuk_akal_ditolak(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/transportations', $this->payload(['price_overtime' => -1, 'engine_cc' => 12]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['price_overtime', 'engine_cc']);
    }

    public function test_endpoint_publik_mengirim_kolom_baru(): void
    {
        Transportation::factory()->create([
            'slug' => 'toyota-avanza', 'price_pickup' => 300000, 'price_overtime' => 50000,
            'price_self_drive' => null, 'engine_cc' => 1500,
        ]);

        $this->getJson('/api/transportations/slug/toyota-avanza')->assertOk()
            ->assertJsonPath('data.price_pickup', 300000)
            ->assertJsonPath('data.price_overtime', 50000)
            ->assertJsonPath('data.price_self_drive', null)
            ->assertJsonPath('data.engine_cc', 1500);

        $pertama = $this->getJson('/api/transportations?per_page=100')->assertOk()->json('data.data.0');
        foreach (['price_pickup', 'price_overtime', 'price_self_drive', 'engine_cc'] as $kolom) {
            $this->assertArrayHasKey($kolom, $pertama);
        }
    }
}
```

- [ ] **Step 3: Jalankan test, pastikan gagal**

Run: `php artisan test --filter=TransportationPaketHargaTest`
Expected: FAIL. Penyebabnya `Call to undefined method App\Models\Transportation::factory()` atau kolom `price_pickup` tidak ada.

- [ ] **Step 4: Migrasi**

`database/migrations/2026_10_14_000001_add_package_prices_to_transportations_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Harga paket sesuai Daftar Harga Sewa Kendaraan (berlaku 1 Okt 2026).
 * `price` yang sudah ada menjadi harga Full day; kolom di sini nullable,
 * kosong berarti paketnya tidak tersedia untuk unit itu.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transportations', function (Blueprint $table) {
            $table->unsignedInteger('price_pickup')->nullable()->after('price_unit');
            $table->unsignedInteger('price_overtime')->nullable()->after('price_pickup');
            $table->unsignedInteger('price_self_drive')->nullable()->after('price_overtime');
            $table->unsignedSmallInteger('engine_cc')->nullable()->after('price_self_drive');
        });
    }

    public function down(): void
    {
        Schema::table('transportations', function (Blueprint $table) {
            $table->dropColumn(['price_pickup', 'price_overtime', 'price_self_drive', 'engine_cc']);
        });
    }
};
```

- [ ] **Step 5: Factory**

`database/factories/TransportationFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Models\Transportation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Transportation> */
class TransportationFactory extends Factory
{
    protected $model = Transportation::class;

    public function definition(): array
    {
        $nama = 'Toyota '.Str::title(fake()->unique()->word());

        return [
            'name' => $nama,
            'slug' => Str::slug($nama),
            'type' => 'Mini MVP',
            'price' => 700000,
            'price_unit' => 'per_day',
            'available' => true,
            'dengan_sopir' => false,
        ];
    }
}
```

- [ ] **Step 6: Model**

Di `app/Models/Transportation.php`, tambahkan ke `$fillable` setelah `'price_unit',`:

```php
        'price_pickup',
        'price_overtime',
        'price_self_drive',
        'engine_cc',
```

Lalu tambahkan ke `$casts` setelah `'price' => 'integer',`:

```php
        'price_pickup' => 'integer',
        'price_overtime' => 'integer',
        'price_self_drive' => 'integer',
        'engine_cc' => 'integer',
```

- [ ] **Step 7: Controller**

Di `app/Http/Controllers/Api/TransportationController.php`:

(a) Pada **kedua** blok `$request->validate([...])` (di `store` dan `update`), tambahkan setelah baris `'price_unit' => 'nullable|in:per_day,per_trip',`:

```php
            'price_pickup' => 'nullable|integer|min:0',
            'price_overtime' => 'nullable|integer|min:0',
            'price_self_drive' => 'nullable|integer|min:0',
            'engine_cc' => 'nullable|integer|min:500|max:20000',
```

(b) Di `store`, ubah `$item = Transportation::create([ ... ]);` menjadi `$item = Transportation::create([ ... ] + $this->kolomPaket($request));`. Isi array tetap sama, hanya ditambah `+ $this->kolomPaket($request)` sebelum `);`.

(c) Di `update`, ubah `$item->update([ ... ]);` menjadi `$item->update([ ... ] + $this->kolomPaket($request));` dengan cara yang sama.

(d) Tambahkan konstanta dan helper tepat sebelum `private function uniqueSlug(`:

```php
    /** Kolom harga paket: tidak dikirim = tidak diubah; dikirim kosong = null (paket ditiadakan). */
    private const KOLOM_PAKET = ['price_pickup', 'price_overtime', 'price_self_drive', 'engine_cc'];

    private function kolomPaket(Request $request): array
    {
        $hasil = [];
        foreach (self::KOLOM_PAKET as $kolom) {
            // exists(), bukan filled(): string kosong sudah diubah menjadi null oleh
            // ConvertEmptyStringsToNull, tetapi kuncinya tetap ada — itulah tanda "kosongkan".
            if ($request->exists($kolom)) {
                $nilai = $request->input($kolom);
                $hasil[$kolom] = $nilai === null ? null : (int) $nilai;
            }
        }

        return $hasil;
    }
```

- [ ] **Step 8: Jalankan test, pastikan lolos**

Run: `php artisan test --filter=TransportationPaketHargaTest`
Expected: PASS, 5 tests.

- [ ] **Step 9: Pastikan suite lain tetap hijau**

Run: `php artisan test`
Expected: semua PASS. Test yang sudah gagal di `dev` sebelum perubahan ini dicatat, bukan diperbaiki di sini.

- [ ] **Step 10: Commit**

```bash
git add database/migrations/2026_10_14_000001_add_package_prices_to_transportations_table.php \
  database/factories/TransportationFactory.php app/Models/Transportation.php \
  app/Http/Controllers/Api/TransportationController.php tests/Feature/Transport/TransportationPaketHargaTest.php
git commit -m "feat(transport): harga paket transfer, over time, lepas kunci, dan isi silinder

Kolom yang tidak dikirim tidak diubah agar form admin lama tidak menghapus harga.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 2: Paket dan area di booking

**Files:**
- Create: `api_wm/database/migrations/2026_10_14_000002_add_package_and_area_to_transportation_bookings_table.php`
- Modify: `api_wm/app/Models/TransportationBooking.php`
- Modify: `api_wm/app/Http/Controllers/Api/TransportationBookingController.php` (`store`)
- Test: `api_wm/tests/Feature/Transport/TransportationBookingPaketTest.php`

**Interfaces:**
- Consumes: `TransportationFactory` (Task 1).
- Produces: `POST /api/transportation-bookings` menerima `package` (`full_day` / `transfer` / `self_drive`, nullable) dan `area` (1–4, nullable). Keduanya tersimpan di `transportation_bookings.package` dan `.area`, lalu ikut di daftar booking admin.

- [ ] **Step 1: Tulis test yang gagal**

`tests/Feature/Transport/TransportationBookingPaketTest.php`:

```php
<?php

namespace Tests\Feature\Transport;

use App\Models\Transportation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransportationBookingPaketTest extends TestCase
{
    use RefreshDatabase;

    private function booking(array $ubah = []): array
    {
        return array_merge([
            'transportation_id' => Transportation::factory()->create()->id,
            'customer_name' => 'Budi',
            'customer_phone' => '081234567890',
            'booking_date' => '2026-11-02',
            'duration_days' => 2,
            'dengan_sopir' => false,
            'package' => 'self_drive',
            'area' => 2,
            'total_price' => 1300000,
        ], $ubah);
    }

    public function test_booking_menyimpan_paket_dan_area(): void
    {
        $this->postJson('/api/transportation-bookings', $this->booking())->assertCreated();

        $this->assertDatabaseHas('transportation_bookings', [
            'customer_name' => 'Budi', 'package' => 'self_drive', 'area' => 2,
            'dengan_sopir' => false, 'total_price' => 1300000,
        ]);
    }

    public function test_paket_dan_area_tidak_dikenal_ditolak(): void
    {
        $this->postJson('/api/transportation-bookings', $this->booking(['package' => 'mingguan', 'area' => 5]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['package', 'area']);
    }

    public function test_klien_lama_tanpa_paket_tetap_bisa_booking(): void
    {
        $data = $this->booking();
        unset($data['package'], $data['area']);

        $this->postJson('/api/transportation-bookings', $data)->assertCreated();
        $this->assertDatabaseHas('transportation_bookings', ['customer_name' => 'Budi', 'package' => null, 'area' => null]);
    }
}
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `php artisan test --filter=TransportationBookingPaketTest`
Expected: FAIL. Kolom `package` tidak ada.

- [ ] **Step 3: Migrasi**

`database/migrations/2026_10_14_000002_add_package_and_area_to_transportation_bookings_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Paket (full_day/transfer/self_drive) dan area tujuan yang dipilih di form booking transport. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transportation_bookings', function (Blueprint $table) {
            $table->string('package', 20)->nullable()->after('dengan_sopir');
            $table->unsignedTinyInteger('area')->nullable()->after('package');
        });
    }

    public function down(): void
    {
        Schema::table('transportation_bookings', function (Blueprint $table) {
            $table->dropColumn(['package', 'area']);
        });
    }
};
```

- [ ] **Step 4: Model**

Di `app/Models/TransportationBooking.php`, tambahkan `'package',` dan `'area',` ke `$fillable` setelah `'dengan_sopir',`. Tambahkan juga `'area' => 'integer',` ke `$casts`.

- [ ] **Step 5: Controller**

Di `TransportationBookingController::store`, tambahkan aturan validasi setelah `'dengan_sopir' => 'nullable|boolean',`:

```php
            'package' => 'nullable|in:full_day,transfer,self_drive',
            'area' => 'nullable|integer|between:1,4',
```

Lalu tambahkan isian di `TransportationBooking::create([...])` setelah baris `'dengan_sopir' => ...,`:

```php
            'package' => $request->package,
            'area' => $request->area,
```

- [ ] **Step 6: Jalankan test, pastikan lolos**

Run: `php artisan test --filter=Transport`
Expected: PASS, 8 tests (5 dari Task 1, 3 dari Task 2).

- [ ] **Step 7: Commit**

```bash
git add database/migrations/2026_10_14_000002_add_package_and_area_to_transportation_bookings_table.php \
  app/Models/TransportationBooking.php app/Http/Controllers/Api/TransportationBookingController.php \
  tests/Feature/Transport/TransportationBookingPaketTest.php
git commit -m "feat(transport): booking menyimpan paket dan area tujuan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Fase B — admin_wm

### Task 3: Form harga paket

**Files:**
- Create: `admin_wm/src/lib/transport/hargaPaket.js`
- Test: `admin_wm/src/lib/transport/hargaPaket.test.js`
- Modify: `admin_wm/src/components/TransportationForm.vue`

**Interfaces:**
- Consumes: semantik API dari Task 1 (kunci dikirim kosong = `null`).
- Produces:
  - `KOLOM_HARGA_PAKET: string[]`
  - `hargaPaketDariApi(v: object|null) → { price_pickup, price_overtime, price_self_drive, engine_cc }` (angka atau `""`)
  - `tambahHargaPaket(fd: FormData, form: object) → void` (selalu menambah keempat kunci)
  - `labelPaket(kode: string|null) → string|null`
  - `labelArea(area: number|null) → string|null`

- [ ] **Step 1: Siapkan branch**

```bash
cd /Users/marchelinoraco/Documents/2026/welcomeManado/admin_wm
git checkout dev && git pull --ff-only && git checkout -b feat/transport-paket-harga
```

- [ ] **Step 2: Tulis test yang gagal**

`src/lib/transport/hargaPaket.test.js`:

```js
import { describe, it, expect } from "vitest";
import { hargaPaketDariApi, tambahHargaPaket, labelPaket, labelArea } from "./hargaPaket";

describe("tambahHargaPaket", () => {
  it("selalu mengirim keempat kolom; yang kosong sebagai string kosong agar API mengosongkannya", () => {
    const fd = new FormData();
    tambahHargaPaket(fd, { price_pickup: 300000, price_overtime: "", price_self_drive: null, engine_cc: 1500 });
    expect(fd.get("price_pickup")).toBe("300000");
    expect(fd.get("price_overtime")).toBe("");
    expect(fd.get("price_self_drive")).toBe("");
    expect(fd.get("engine_cc")).toBe("1500");
  });
});

describe("hargaPaketDariApi", () => {
  it("null dari API menjadi string kosong, angka tetap angka", () => {
    expect(hargaPaketDariApi({ price_pickup: 300000, price_overtime: null, engine_cc: 1987 })).toEqual({
      price_pickup: 300000,
      price_overtime: "",
      price_self_drive: "",
      engine_cc: 1987,
    });
  });

  it("tanpa data (form tambah) semuanya kosong", () => {
    expect(hargaPaketDariApi(null)).toEqual({
      price_pickup: "",
      price_overtime: "",
      price_self_drive: "",
      engine_cc: "",
    });
  });
});

describe("label booking", () => {
  it("menerjemahkan kode paket dan area; booking lama tanpa paket menghasilkan null", () => {
    expect(labelPaket("full_day")).toBe("Full day");
    expect(labelPaket("transfer")).toBe("Transfer");
    expect(labelPaket("self_drive")).toBe("Lepas kunci");
    expect(labelPaket(null)).toBeNull();
    expect(labelArea(2)).toBe("Area 2");
    expect(labelArea(4)).toBe("Area 4 (dikonfirmasi)");
    expect(labelArea(null)).toBeNull();
  });
});
```

- [ ] **Step 3: Jalankan test, pastikan gagal**

Run: `npx vitest run src/lib/transport`
Expected: FAIL, `Failed to resolve import "./hargaPaket"`.

- [ ] **Step 4: Implementasi helper**

`src/lib/transport/hargaPaket.js`:

```js
/**
 * Harga paket armada transport (Daftar Harga Sewa Kendaraan, berlaku 1 Okt 2026).
 *
 * `price` (Full day) tetap diisi lewat kolom lamanya. Empat kolom di sini
 * SELALU dikirim — kosong pun — karena API memperlakukan kunci yang tidak
 * dikirim sebagai "jangan diubah" dan kunci kosong sebagai "tiadakan paket".
 */
export const KOLOM_HARGA_PAKET = ["price_pickup", "price_overtime", "price_self_drive", "engine_cc"];

export function hargaPaketDariApi(v) {
  const hasil = {};
  for (const k of KOLOM_HARGA_PAKET) hasil[k] = v?.[k] ?? "";
  return hasil;
}

export function tambahHargaPaket(fd, form) {
  for (const k of KOLOM_HARGA_PAKET) {
    const n = form[k];
    fd.append(k, n === "" || n === null || n === undefined ? "" : String(Number(n)));
  }
}

const LABEL_PAKET = { full_day: "Full day", transfer: "Transfer", self_drive: "Lepas kunci" };

export function labelPaket(kode) {
  return LABEL_PAKET[kode] ?? null;
}

export function labelArea(area) {
  if (!area) return null;
  return area === 4 ? "Area 4 (dikonfirmasi)" : `Area ${area}`;
}
```

- [ ] **Step 5: Jalankan test, pastikan lolos**

Run: `npx vitest run src/lib/transport`
Expected: PASS, 4 tests.

- [ ] **Step 6: Pakai helper di form**

Di `src/components/TransportationForm.vue`:

(a) **Template:** ganti seluruh blok `<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">` yang berisi "Tipe Sewa", "Harga", dan "Ketersediaan" (blok pertama dengan kelas itu, tepat sebelum `<div class="grid grid-cols-2 lg:grid-cols-4 gap-6">`) dengan:

```html
          <div class="space-y-3">
            <p class="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              Harga paket (IDR) — kosongkan paket yang tidak tersedia
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div v-for="f in FIELD_HARGA" :key="f.key">
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
                  >{{ f.label }}</label
                >
                <input
                  v-model.number="form[f.key]"
                  type="number"
                  min="0"
                  :placeholder="f.placeholder"
                  class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white outline-none font-bold text-slate-700"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label
                class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1"
                >Isi Silinder (cc)</label
              >
              <input
                v-model.number="form.engine_cc"
                type="number"
                min="500"
                placeholder="mis. 1500 — menentukan Biaya Area"
                class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white outline-none font-bold text-slate-700"
              />
            </div>
            <div class="flex items-end">
              <label
                class="w-full flex items-center justify-between px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <span
                  class="text-xs font-black text-slate-500 uppercase tracking-widest"
                  >Ketersediaan</span
                >
                <input
                  v-model="form.available"
                  type="checkbox"
                  class="h-5 w-5 accent-emerald-600"
                />
              </label>
            </div>
          </div>
```

Pilihan "Tipe Sewa" (`price_unit`) sengaja tidak tampil lagi. Nilainya tetap ada di `form` dan tetap dikirim apa adanya.

(b) **Script:** tambahkan import setelah `import { Loader2 } from "lucide-vue-next";`:

```js
import { hargaPaketDariApi, tambahHargaPaket } from "../lib/transport/hargaPaket";

const FIELD_HARGA = [
  { key: "price", label: "Full day (maks. 12 jam, dengan sopir)", placeholder: "wajib" },
  { key: "price_pickup", label: "Transfer sekali jalan", placeholder: "kosong = tidak tersedia" },
  { key: "price_overtime", label: "Over time / jam", placeholder: "kosong = tidak ada" },
  { key: "price_self_drive", label: "Lepas kunci (tanpa sopir)", placeholder: "kosong = tidak tersedia" },
];
```

(c) Di `const form = ref({ ... })`, tambahkan `...hargaPaketDariApi(null),` setelah `price_unit: "per_day",`.

(d) Di `watch(...)`, pada objek `form.value = { ... }`, tambahkan `...hargaPaketDariApi(v),` setelah baris `price_unit: v.price_unit || "per_day",`.

(e) Di `handleSubmit`, tambahkan `tambahHargaPaket(fd, form.value);` tepat setelah `fd.append("price_unit", form.value.price_unit || "per_day");`.

- [ ] **Step 7: Build untuk memastikan template valid**

Run: `npm run build`
Expected: `✓ built in …` tanpa error.

- [ ] **Step 8: Commit**

```bash
git add src/lib/transport/hargaPaket.js src/lib/transport/hargaPaket.test.js src/components/TransportationForm.vue
git commit -m "feat(transport): form armada mengisi harga paket dan isi silinder

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 4: Daftar armada dan daftar booking

**Files:**
- Modify: `admin_wm/src/views/transport/Transportations.vue` (sel harga tabel ~baris 133–138 dan kartu seluler ~baris 202–208)
- Modify: `admin_wm/src/views/transport/TransportationBookings.vue` (badge "Dengan Sopir" ~baris 136–141 dan ~baris 217–222)

**Interfaces:**
- Consumes: `labelPaket`, `labelArea` dari `src/lib/transport/hargaPaket.js` (Task 3).

- [ ] **Step 1: Daftar armada**

Di `Transportations.vue`, tambahkan import di `<script setup>`:

```js
import { labelPaket } from "../../lib/transport/hargaPaket";
```

Pada **kedua** tempat yang menampilkan `{{ formatIdr(v.price) }}` diikuti `<span ...>/hari</span>`, ganti teks `/hari` menjadi `/hari (full day)`. Lalu tambahkan tepat setelah span itu:

```html
                  <span
                    v-if="v.price_self_drive"
                    class="ml-2 inline-flex px-2 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest"
                  >
                    {{ labelPaket("self_drive") }}
                  </span>
```

- [ ] **Step 2: Daftar booking**

Di `TransportationBookings.vue`, tambahkan import:

```js
import { labelPaket, labelArea } from "../../lib/transport/hargaPaket";
```

Pada **kedua** blok `<div v-if="b.dengan_sopir" ...>Dengan Sopir</div>` dan `<span v-if="b.dengan_sopir" ...>Dengan Sopir</span>`, ubah kondisinya menjadi `v-if="b.dengan_sopir && !b.package"`, supaya booking lama tetap terbaca. Lalu sisipkan tepat sebelumnya, dengan tag yang sama (`div` di tabel, `span` di kartu):

```html
                  <span
                    v-if="b.package"
                    class="inline-flex mt-2 mr-1 px-2 py-1 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest"
                  >
                    {{ labelPaket(b.package) }}<template v-if="b.area"> · {{ labelArea(b.area) }}</template>
                  </span>
```

- [ ] **Step 3: Test dan build**

Run: `npx vitest run && npm run build`
Expected: semua test PASS dan build sukses.

- [ ] **Step 4: Cek visual singkat**

Jalankan API lokal (lihat *Lingkungan uji lokal*), lalu:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8123/api npm run dev
```

Masuk ke admin. Kalau tidak ada akun lokal, buat dengan `php artisan tinker` lalu `User::factory()->create(['email'=>'uji@lokal','password'=>bcrypt('rahasia')])`. Buka Transportasi → edit Avanza, isi semua harga paket dan cc, lalu simpan. Buka lagi dan pastikan angkanya bertahan. Kosongkan "Lepas kunci", simpan, dan pastikan badge "Lepas kunci" hilang dari daftar.

- [ ] **Step 5: Commit**

```bash
git add src/views/transport/Transportations.vue src/views/transport/TransportationBookings.vue
git commit -m "feat(transport): daftar armada & booking menampilkan paket dan area

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Fase C — Alat pengisian data

### Task 5: Skrip `isi_armada.py` dan uji di API lokal

**Files:**
- Create: `_dump-database/foto-baru/_alat/isi_armada.py`. Folder ini di luar git. README-nya mengatur bahwa token tidak pernah disimpan.
- Modify: `_dump-database/foto-baru/_alat/README.md` (tambah satu bagian)

**Interfaces:**
- Consumes: API dari Task 1. Env `WM_API` (default `https://api.welcomemanado.my.id/api`), `WM_TOKEN`, `WM_PDF_IMG`.
- Produces: `hasil-isi-armada.json` di folder `_alat` (id, slug, snapshot sebelum/sesudah per nomor PDF). Dipakai Task 17.

- [ ] **Step 1: Ekstrak foto dari PDF**

```bash
mkdir -p "$UJI/pdf"
pdfimages -png "/Users/marchelinoraco/Downloads/PRICE LIST CAR LANDSCAPE (1).pdf" "$UJI/pdf/pdf"
ls "$UJI/pdf" | head -20
```

Expected: `pdf-000.png` … `pdf-017.png`. Yang dipakai:
- `pdf-002.png` + `pdf-003.png` (Alphard putih + mask)
- `pdf-016.png` + `pdf-017.png` (Bus + mask)

- [ ] **Step 2: Tulis skrip**

`_dump-database/foto-baru/_alat/isi_armada.py`:

```python
"""Isi 11 armada transport sesuai Daftar Harga Sewa Kendaraan (berlaku 1 Okt 2026) lewat API admin.

Meniru TransportationForm.vue (admin_wm) mode tambah/ubah. update() menimpa seats/year/badge/
transmission/fuel/deskripsi dengan apa pun yang dikirim, jadi semuanya dikirim ulang dari data lama.
Keempat kolom paket selalu dikirim (kosong = tiadakan paket).

Foto: foto lama yang masih hidup dipertahankan; bila TIDAK ada satu pun yang hidup, satu foto baru
diunggah (PNG/WebP dari transport_wm/public/images/cars, atau gambar PDF + mask-nya). Karena itu
skrip aman diulang: putaran kedua tidak menambah foto lagi.

Setelah kirim: isi sebelum/sesudah dibandingkan; perubahan di luar kolom yang memang diubah = MASALAH,
dan setiap foto harus HTTP 200 bertipe gambar.

Default = pratinjau. --kirim untuk mengirim. --hanya 11 atau --hanya 1,2 (nomor baris PDF).
Env: WM_TOKEN (wajib untuk --kirim), WM_API (default produksi), WM_PDF_IMG (folder hasil pdfimages).
"""
import argparse, io, json, os, sys, time
import requests
from PIL import Image

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/537.36 Chrome/128 Safari/537.36"
API = os.environ.get("WM_API", "https://api.welcomemanado.my.id/api").rstrip("/")
DIR_MOBIL = "/Users/marchelinoraco/Documents/2026/welcomeManado/transport_wm/public/images/cars"
DIR_PDF = os.environ.get("WM_PDF_IMG", "")
LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hasil-isi-armada.json")

DESKRIPSI = ["description", "description_en", "description_ko", "description_zh"]
KOLOM_PAKET = ["price_pickup", "price_overtime", "price_self_drive", "engine_cc"]
DIUBAH = {"name", "type", "price", "price_unit", "seats"} | set(KOLOM_PAKET)
ABAIKAN = {"updated_at", "created_at", "images", "image_url"}

XPANDER = {
    "description": "Mitsubishi Xpander adalah MPV yang lega dan irit, dengan kabin tinggi yang nyaman untuk keluarga maupun rombongan kecil. Cocok untuk keliling Kota Manado, perjalanan ke Tomohon, hingga liburan ke Likupang. Tersedia dengan sopir maupun lepas kunci.",
    "description_en": "The Mitsubishi Xpander is a roomy, fuel-efficient MPV with a tall, comfortable cabin for families and small groups. Ideal for getting around Manado, trips up to Tomohon, or a holiday in Likupang. Available with a driver or as a self-drive rental.",
    "description_zh": "三菱 Xpander 是一款宽敞省油的 MPV，车厢高大舒适，适合家庭与小型团体。无论是万鸦老市内出行、前往多摩红，还是去利库邦度假都很合适。可选含司机或自驾。",
    "description_ko": "미쓰비시 엑스팬더는 넓고 연비가 좋은 MPV로, 높고 편안한 실내가 가족과 소규모 그룹에 잘 맞습니다. 마나도 시내 이동, 토모혼 여행, 리쿠팡 휴가까지 두루 어울립니다. 기사 포함 또는 자차 운전으로 이용하실 수 있습니다.",
}

# Urutan = nomor baris PDF. slug=None → armada baru; saudara = slug yang deskripsinya disalin.
# type=None → pertahankan tipe lama.
ARMADA = [
    dict(slug="toyota-alphard", name="Toyota Alphard (2019–2022)", type=None, price=3_500_000, price_pickup=1_500_000, price_overtime=250_000, price_self_drive=None, engine_cc=2500, seats=None, foto="alphard.png"),
    dict(slug=None, saudara="toyota-alphard", name="Toyota Alphard (2022–2026)", type="MPV premium", price=4_000_000, price_pickup=2_500_000, price_overtime=300_000, price_self_drive=None, engine_cc=2500, seats=None, foto="pdf:002+003"),
    dict(slug="toyota-fortuner", name="Toyota Fortuner (2020–2023)", type="SUV", price=2_500_000, price_pickup=1_000_000, price_overtime=150_000, price_self_drive=None, engine_cc=2400, seats=None, foto="toyota-fortuner.png"),
    dict(slug="toyota-innova-reborn", name="Toyota Innova Reborn (2019–2022)", type=None, price=1_000_000, price_pickup=400_000, price_overtime=50_000, price_self_drive=600_000, engine_cc=1998, seats=None, foto="toyota-innova-reborn.png"),
    dict(slug=None, saudara="toyota-innova-zenix", name="Toyota Innova Zenix Q Captain Seat (2023)", type="Mini MVP", price=1_750_000, price_pickup=700_000, price_overtime=75_000, price_self_drive=None, engine_cc=1987, seats=None, foto="innova-zenix-q.png"),
    dict(slug="toyota-innova-zenix", name="Toyota Innova Zenix G (2023)", type=None, price=1_250_000, price_pickup=500_000, price_overtime=50_000, price_self_drive=None, engine_cc=1987, seats=None, foto="innova-zenix-g.png"),
    dict(slug="hiace-commuter", name="Toyota Hiace Commuter 14 pax", type=None, price=1_500_000, price_pickup=700_000, price_overtime=100_000, price_self_drive=None, engine_cc=2500, seats=14, foto="hiace-commuter.png"),
    dict(slug="hiace-premio", name="Toyota Hiace Premio 14 pax (2023)", type=None, price=2_000_000, price_pickup=800_000, price_overtime=100_000, price_self_drive=None, engine_cc=2800, seats=14, foto="hiace-premio.png"),
    dict(slug="bus-3033-seater", name="Bus 30 Seat", type=None, price=2_300_000, price_pickup=1_200_000, price_overtime=100_000, price_self_drive=None, engine_cc=2001, seats=30, foto="pdf:016+017"),
    dict(slug=None, saudara=None, name="Mitsubishi Xpander", type="Mini MVP", price=850_000, price_pickup=350_000, price_overtime=50_000, price_self_drive=500_000, engine_cc=1499, seats=None, foto="xpander-ultimate.webp"),
    dict(slug="toyota-avanza", name="Toyota Avanza", type=None, price=700_000, price_pickup=300_000, price_overtime=50_000, price_self_drive=400_000, engine_cc=1500, seats=None, foto="toyota-avanza.png"),
]


def sesi(token):
    s = requests.Session()
    s.headers.update({"User-Agent": UA, "Accept": "application/json"})
    if token:
        s.headers["Authorization"] = f"Bearer {token}"
    return s


def api_get(s, path):
    # GET aman diulang; 5xx dari Cloudflare (mis. 522) biasanya gangguan sesaat
    r = None
    for tunggu in (0, 10, 30, 60):
        time.sleep(tunggu)
        try:
            r = s.get(f"{API}{path}", timeout=60)
            if r.status_code < 500:
                r.raise_for_status()
                return r.json()
            print(f"  GET {r.status_code}, coba lagi...", flush=True)
        except (requests.ConnectionError, requests.Timeout) as e:
            print(f"  GET {type(e).__name__}, coba lagi...", flush=True)
    sys.exit(f"MASALAH: GET {path} gagal ({r.status_code if r is not None else 'tanpa respons'})")


def cari(daftar, unit):
    if unit["slug"]:
        cocok = [t for t in daftar if t["slug"] == unit["slug"]]
    else:
        cocok = [t for t in daftar if t["name"] == unit["name"]]
    if len(cocok) > 1:
        sys.exit(f"MASALAH: lebih dari satu armada cocok untuk {unit['name']}")
    return cocok[0] if cocok else None


def foto_jpg(foto):
    if foto.startswith("pdf:"):
        if not DIR_PDF:
            sys.exit("MASALAH: set WM_PDF_IMG ke folder hasil pdfimages")
        no_img, no_mask = foto[4:].split("+")
        img = Image.open(os.path.join(DIR_PDF, f"pdf-{no_img}.png")).convert("RGB")
        mask = Image.open(os.path.join(DIR_PDF, f"pdf-{no_mask}.png")).convert("L")
        latar = Image.new("RGB", img.size, "white")
        latar.paste(img, (0, 0), mask)
    else:
        src = Image.open(os.path.join(DIR_MOBIL, foto)).convert("RGBA")
        latar = Image.new("RGBA", src.size, "white")
        latar.alpha_composite(src)
        latar = latar.convert("RGB")
    buf = io.BytesIO()
    latar.save(buf, "JPEG", quality=85)
    return buf.getvalue()


def url_hidup(s, url):
    try:
        r = s.get(url, timeout=30, stream=True)
        return r.status_code == 200 and r.headers.get("content-type", "").startswith("image/")
    except requests.RequestException:
        return False


def bangun_form(unit, lama, deskripsi):
    lama = lama or {}
    d = {
        "name": unit["name"],
        "type": unit["type"] if unit["type"] is not None else (lama.get("type") or ""),
        "price": str(unit["price"]),
        "price_unit": "per_day",
        "dengan_sopir": "1" if lama.get("dengan_sopir") else "0",
        "available": "0" if lama.get("available") is False else "1",
    }
    for k in KOLOM_PAKET:
        d[k] = "" if unit[k] is None else str(unit[k])
    kursi = unit["seats"] or lama.get("seats")
    if kursi:
        d["seats"] = str(kursi)
    for k in ("transmission", "fuel", "year", "badge"):
        if lama.get(k):
            d[k] = str(lama[k])
    for k in DESKRIPSI:
        d[k] = deskripsi.get(k) or ""
    return d


def bandingkan(sebelum, sesudah, unit):
    masalah = []
    if sebelum:
        for k in set(sebelum) | set(sesudah):
            if k in ABAIKAN or k in DIUBAH:
                continue
            if sebelum.get(k) != sesudah.get(k):
                masalah.append(f"{k}: {sebelum.get(k)!r} → {sesudah.get(k)!r}")
    harap = {"name": unit["name"], "price": unit["price"], **{k: unit[k] for k in KOLOM_PAKET}}
    if unit["type"] is not None:
        harap["type"] = unit["type"]
    if unit["seats"]:
        harap["seats"] = unit["seats"]
    for k, v in harap.items():
        if sesudah.get(k) != v:
            masalah.append(f"{k} seharusnya {v!r}, tercatat {sesudah.get(k)!r}")
    return masalah


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kirim", action="store_true")
    ap.add_argument("--hanya", default="", help="nomor baris PDF, mis. 11 atau 1,2")
    a = ap.parse_args()
    nomor = {int(x) for x in a.hanya.split(",") if x.strip()} or set(range(1, len(ARMADA) + 1))
    token = os.environ.get("WM_TOKEN", "")
    if a.kirim and not token:
        sys.exit("WM_TOKEN wajib untuk --kirim")

    s = sesi(token)
    daftar = api_get(s, "/transportations?per_page=100")["data"]["data"]
    log = json.load(open(LOG)) if os.path.exists(LOG) else {}
    print(f"API: {API} | {len(daftar)} armada terbaca | mode: {'KIRIM' if a.kirim else 'pratinjau'}")

    for no, unit in enumerate(ARMADA, start=1):
        if no not in nomor:
            continue
        lama = cari(daftar, unit)
        if unit["slug"] and lama is None:
            sys.exit(f"MASALAH: armada {unit['slug']} tidak ditemukan")
        if lama:
            lama = api_get(s, f"/transportations/{lama['id']}")["data"]
            desk = lama
        elif unit.get("saudara"):
            desk = next(t for t in daftar if t["slug"] == unit["saudara"])
        else:
            desk = XPANDER

        form = bangun_form(unit, lama, desk)
        foto_lama = (lama or {}).get("images") or ([lama["image_url"]] if lama and lama.get("image_url") else [])
        hidup = [u for u in foto_lama if url_hidup(s, u)]
        print(f"#{no} {unit['name']} ({'ubah id ' + str(lama['id']) if lama else 'BARU'})")
        print(f"   full day {form['price']} | transfer {form['price_pickup'] or '—'} | OT {form['price_overtime'] or '—'}"
              f" | lepas kunci {form['price_self_drive'] or '—'} | cc {form['engine_cc']} | kursi {form.get('seats', '—')}")
        print(f"   foto hidup {len(hidup)}/{len(foto_lama)} → {'pertahankan' if hidup else 'unggah ' + unit['foto']}")
        if not a.kirim:
            continue

        data = list(form.items()) + [("retain_image_urls[]", u) for u in hidup]
        nama_berkas = f"{(lama or {}).get('slug') or 'armada-baru'}.jpg"
        files = [] if hidup else [("images[]", (nama_berkas, foto_jpg(unit["foto"]), "image/jpeg"))]
        if lama:
            data.append(("_method", "PUT"))
            r = s.post(f"{API}/transportations/{lama['id']}", data=data, files=files or None, timeout=120)
        else:
            r = s.post(f"{API}/transportations", data=data, files=files or None, timeout=120)
        if r.status_code not in (200, 201):
            sys.exit(f"MASALAH: HTTP {r.status_code} {r.text[:500]}")

        id_baru = r.json()["data"]["id"]
        sesudah = api_get(s, f"/transportations/{id_baru}")["data"]
        masalah = bandingkan(lama or {}, sesudah, unit)
        for u in sesudah.get("images") or []:
            if not url_hidup(s, u):
                masalah.append(f"foto mati: {u}")
        log[str(no)] = {"id": id_baru, "slug": sesudah["slug"], "sebelum": lama, "sesudah": sesudah,
                        "waktu": time.strftime("%Y-%m-%d %H:%M:%S"), "api": API}
        with open(LOG, "w") as f:
            json.dump(log, f, ensure_ascii=False, indent=1)
        if masalah:
            print("   MASALAH:\n    - " + "\n    - ".join(masalah))
            sys.exit(1)
        print(f"   OK → id {id_baru}, slug {sesudah['slug']}, foto {len(sesudah.get('images') or [])}")
        time.sleep(3)


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Pratinjau terhadap API lokal**

Jalankan API lokal (*Lingkungan uji lokal*, Terminal 1), lalu:

```bash
cd /Users/marchelinoraco/Documents/2026/welcomeManado/_dump-database/foto-baru/_alat
python3 -m venv venv 2>/dev/null; venv/bin/pip -q install requests pillow
WM_API=http://127.0.0.1:8123/api WM_PDF_IMG="$UJI/pdf" venv/bin/python -I isi_armada.py
```

Expected: 11 baris `#1 … #11`. Delapan baris "ubah id …" dan tiga baris "BARU" (#2, #5, #10). Semua "foto hidup 0/1 → unggah …".

- [ ] **Step 4: Kirim ke API lokal, lalu ulangi untuk membuktikan idempoten**

```bash
WM_API=http://127.0.0.1:8123/api WM_TOKEN=$WM_TOKEN_LOKAL WM_PDF_IMG="$UJI/pdf" venv/bin/python -I isi_armada.py --kirim --hanya 11
WM_API=http://127.0.0.1:8123/api WM_TOKEN=$WM_TOKEN_LOKAL WM_PDF_IMG="$UJI/pdf" venv/bin/python -I isi_armada.py --kirim
WM_API=http://127.0.0.1:8123/api WM_TOKEN=$WM_TOKEN_LOKAL WM_PDF_IMG="$UJI/pdf" venv/bin/python -I isi_armada.py --kirim
```

Expected:
- Perintah pertama: `#11 … OK → id 5, slug toyota-avanza, foto 1`.
- Perintah kedua: 11 × `OK`.
- Perintah ketiga: 11 × `OK`, dengan "foto hidup 1/1 → pertahankan" dan tetap `foto 1`. Ini bukti tidak ada foto ganda.
- `hasil-isi-armada.json` yang dihasilkan putaran lokal **dihapus** setelah ini, supaya tidak tercampur dengan log production: `rm hasil-isi-armada.json`.

- [ ] **Step 5: Lihat fotonya**

Buka satu per satu `http://127.0.0.1:8123/storage/transportations/…` dari `curl -s http://127.0.0.1:8123/api/transportations?per_page=100 | python3 -I -m json.tool | grep images -A1`. Latar foto harus putih, bukan hitam. Alphard 2022 harus putih dan Bus harus bus.

- [ ] **Step 6: Catat di README alat**

Tambahkan ke `_dump-database/foto-baru/_alat/README.md`:

```markdown
## isi_armada.py (transport, Okt 2026)

Mengisi 11 armada sesuai Daftar Harga Sewa Kendaraan (berlaku 1 Okt 2026): harga Full day/Transfer/Over time/
Lepas kunci, isi silinder, nama, dan satu foto bila semua foto lama mati. Nomor `--hanya` = nomor baris PDF
(11 = Avanza). Butuh `WM_PDF_IMG` = folder hasil `pdfimages -png "PRICE LIST CAR LANDSCAPE (1).pdf" <folder>/pdf`.
Aman diulang. Uji dulu di API lokal SQLite (lihat rencana transport_wm 2026-10-14).
```

Folder ini tidak di-commit karena berada di luar repo.

---

## Fase D — transport_wm

Semua task di fase ini dikerjakan di branch `feat/paket-harga-motion`:

```bash
cd /Users/marchelinoraco/Documents/2026/welcomeManado/transport_wm && git checkout feat/paket-harga-motion
```

### Task 6: Logika harga dan booking yang teruji

**Files:**
- Modify: `transport_wm/package.json` (devDependency `vitest`, script `test`)
- Create: `transport_wm/vitest.config.ts`
- Modify: `transport_wm/lib/types.ts`, `transport_wm/lib/api.ts`
- Create: `transport_wm/lib/tarif-sewa.ts`, `transport_wm/lib/paket.ts`, `transport_wm/lib/hitungBooking.ts`, `transport_wm/lib/booking.ts`, `transport_wm/lib/i18n/format.ts`, `transport_wm/lib/test/mobil.ts`
- Test: `transport_wm/lib/paket.test.ts`, `transport_wm/lib/hitungBooking.test.ts`, `transport_wm/lib/booking.test.ts`, `transport_wm/lib/i18n/format.test.ts`

**Interfaces:**
- Produces (dipakai Task 8–14):
  - `Car` mendapat `price_transfer: number | null`, `price_overtime: number | null`, `price_self_drive: number | null`, `engine_cc: number | null`. `price_rent` tetap dan berarti harga Full day.
  - `lib/tarif-sewa.ts`:
    - `AREA_SEWA`
    - `AREA_DIKONFIRMASI = 4`
    - `AMBANG_MESIN_CC = 2000`
    - `TARIF_PELAYANAN`
    - `TARIF_LEPAS_KUNCI`
    - `HARGA_BERLAKU_SEJAK = "2026-10-01"`
    - `NAMA_AREA: Record<Locale, Record<1|2|3, string>>`
    - `rp(nilai, gaya?)`
  - `lib/paket.ts`:
    - `type Paket = "full_day" | "transfer" | "self_drive"`
    - `PAKET: readonly Paket[]`
    - `adaHarga(n): n is number`
    - `hargaPaket(car, paket): number | null`
    - `paketTersedia(car): Paket[]`
    - `golonganMesin(cc): "kecil" | "besar" | null`
    - `hargaMulai(cars): number | null`
  - `lib/hitungBooking.ts`:
    - `type Area = 1|2|3|4`
    - `type PilihanArea = Area | "pool"`
    - `type InputBooking = { car; paket; jumlah; area }`
    - `type HasilBooking = { tarif; jumlah; sewa; jenisTambahan: "area"|"antar"|null; tarifTambahan; biayaTambahan; dikonfirmasi; total }`
    - `normalisasiJumlah(n)`
    - `hitungBooking(input): HasilBooking | null`
  - `lib/booking.ts`:
    - `type DataPemesan = { nama; telepon; tanggalMulai; catatan }`
    - `tanggalSelesai(mulai, hari)`
    - `buatPayloadBooking(input, hasil, pemesan)`
    - `buatPesanWa(input, hasil, pemesan)`
  - `lib/i18n/format.ts`:
    - `fill(template, vars)`
    - `formatTanggal(isoDate, locale)`

- [ ] **Step 1: Pasang vitest**

```bash
npm install --save-dev vitest@4.1.11
```

Lalu tambahkan ke `"scripts"` di `package.json`:

```json
    "test": "vitest run",
```

Buat `vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: { include: ["lib/**/*.test.ts"] },
});
```

- [ ] **Step 2: Tipe dan pemetaan API**

Di `lib/types.ts`, ganti baris `price_rent: number;` dengan:

```ts
  /** Harga Full day (maks. 12 jam, dengan sopir). 0 = belum ada harga. */
  price_rent: number;
  /** Transfer sekali jalan dengan sopir (kolom API `price_pickup`). */
  price_transfer: number | null;
  /** Over time per jam setelah 12 jam, paket dengan sopir. */
  price_overtime: number | null;
  /** Lepas kunci per hari; null = unit tidak disewakan lepas kunci. */
  price_self_drive: number | null;
  /** Isi silinder; menentukan golongan Biaya Area (≤ 2000 cc / > 2000 cc). */
  engine_cc: number | null;
```

Di `lib/api.ts`, tambahkan ke `type ApiTransportation` setelah `price_unit: string | null;`:

```ts
  price_pickup?: number | null;
  price_overtime?: number | null;
  price_self_drive?: number | null;
  engine_cc?: number | null;
```

Lalu tambahkan di `toCar` setelah baris `price_unit: ...,`:

```ts
    price_transfer: t.price_pickup ?? null,
    price_overtime: t.price_overtime ?? null,
    price_self_drive: t.price_self_drive ?? null,
    engine_cc: t.engine_cc ?? null,
```

- [ ] **Step 3: Fixture test**

`lib/test/mobil.ts`:

```ts
import type { Car } from "@/lib/types";

/** Mobil contoh untuk test: Avanza sesuai daftar harga 1 Okt 2026, bisa ditimpa per kolom. */
export function mobil(ubah: Partial<Car> = {}): Car {
  return {
    id: 5,
    name: "Toyota Avanza",
    slug: "toyota-avanza",
    type: "Mini MVP",
    status: "tersedia",
    price_rent: 700_000,
    price_unit: "per_day",
    price_transfer: 300_000,
    price_overtime: 50_000,
    price_self_drive: 400_000,
    engine_cc: 1500,
    year: null,
    seats: null,
    transmission: null,
    fuel: null,
    badge: null,
    dengan_sopir: false,
    description: null,
    description_en: null,
    description_ko: null,
    description_zh: null,
    images: ["/images/cars/toyota-avanza.png"],
    ...ubah,
  };
}
```

- [ ] **Step 4: Tulis test yang gagal**

`lib/i18n/format.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { fill, formatTanggal } from "./format";

describe("fill", () => {
  it("mengganti placeholder dan membiarkan yang tidak dikenal", () => {
    expect(fill("Mulai {price}/hari", { price: "Rp 700.000" })).toBe("Mulai Rp 700.000/hari");
    expect(fill("Area {n} {x}", { n: 2 })).toBe("Area 2 {x}");
  });
});

describe("formatTanggal", () => {
  it("menulis tanggal panjang per bahasa tanpa bergeser hari", () => {
    expect(formatTanggal("2026-10-01", "id")).toBe("1 Oktober 2026");
    expect(formatTanggal("2026-10-01", "en")).toBe("October 1, 2026");
    expect(formatTanggal("2026-10-01", "zh")).toBe("2026年10月1日");
    expect(formatTanggal("2026-10-01", "ko")).toBe("2026년 10월 1일");
  });
});
```

`lib/paket.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { adaHarga, golonganMesin, hargaMulai, hargaPaket, paketTersedia } from "./paket";
import { mobil } from "./test/mobil";

describe("paketTersedia", () => {
  it("hanya paket yang harganya > 0, urut full_day, transfer, self_drive", () => {
    expect(paketTersedia(mobil())).toEqual(["full_day", "transfer", "self_drive"]);
    expect(paketTersedia(mobil({ price_self_drive: null }))).toEqual(["full_day", "transfer"]);
  });

  it("unit tanpa harga sama sekali (mis. White Marlin) tidak punya paket", () => {
    expect(paketTersedia(mobil({ price_rent: 0, price_transfer: null, price_self_drive: null }))).toEqual([]);
  });
});

describe("hargaPaket & adaHarga", () => {
  it("0 dan null dianggap tidak ada harga", () => {
    expect(hargaPaket(mobil({ price_rent: 0 }), "full_day")).toBeNull();
    expect(hargaPaket(mobil(), "transfer")).toBe(300_000);
    expect(adaHarga(0)).toBe(false);
    expect(adaHarga(null)).toBe(false);
    expect(adaHarga(1)).toBe(true);
  });
});

describe("golonganMesin", () => {
  it("≤ 2000 cc kecil, > 2000 cc besar, kosong tidak diketahui", () => {
    expect(golonganMesin(1998)).toBe("kecil");
    expect(golonganMesin(2000)).toBe("kecil");
    expect(golonganMesin(2001)).toBe("besar");
    expect(golonganMesin(null)).toBeNull();
  });
});

describe("hargaMulai", () => {
  it("Full day termurah di antara unit tersedia yang berharga", () => {
    const daftar = [
      mobil({ price_rent: 3_500_000 }),
      mobil({ price_rent: 700_000 }),
      mobil({ price_rent: 0 }),
      mobil({ price_rent: 500_000, status: "disewa" }),
    ];
    expect(hargaMulai(daftar)).toBe(700_000);
  });

  it("tanpa unit berharga hasilnya null, bukan 0", () => {
    expect(hargaMulai([])).toBeNull();
    expect(hargaMulai([mobil({ price_rent: 0 })])).toBeNull();
  });
});
```

`lib/hitungBooking.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { hitungBooking, normalisasiJumlah } from "./hitungBooking";
import { mobil } from "./test/mobil";

const avanza = mobil();
const alphard2019 = mobil({ name: "Toyota Alphard (2019–2022)", price_rent: 3_500_000, price_transfer: 1_500_000, price_overtime: 250_000, price_self_drive: null, engine_cc: 2500 });
const xpander = mobil({ name: "Mitsubishi Xpander", price_rent: 850_000, price_transfer: 350_000, price_self_drive: 500_000, engine_cc: 1499 });
const reborn = mobil({ name: "Toyota Innova Reborn (2019–2022)", price_rent: 1_000_000, price_transfer: 400_000, price_self_drive: 600_000, engine_cc: 1998 });
const premio = mobil({ name: "Toyota Hiace Premio 14 pax (2023)", price_rent: 2_000_000, price_transfer: 800_000, price_self_drive: null, engine_cc: 2800 });
const fortuner = mobil({ name: "Toyota Fortuner (2020–2023)", price_rent: 2_500_000, price_transfer: 1_000_000, price_self_drive: null, engine_cc: 2400 });

describe("hitungBooking — contoh di spec", () => {
  it("Avanza Full day 3 hari Area 2 = 2.550.000", () => {
    expect(hitungBooking({ car: avanza, paket: "full_day", jumlah: 3, area: 2 })?.total).toBe(2_550_000);
  });
  it("Alphard 2019 Full day 2 hari Area 3 = 7.700.000", () => {
    expect(hitungBooking({ car: alphard2019, paket: "full_day", jumlah: 2, area: 3 })?.total).toBe(7_700_000);
  });
  it("Xpander Lepas kunci 2 hari antar Area 2 = 1.300.000 (antar-jemput sekali)", () => {
    const h = hitungBooking({ car: xpander, paket: "self_drive", jumlah: 2, area: 2 });
    expect(h?.biayaTambahan).toBe(300_000);
    expect(h?.total).toBe(1_300_000);
  });
  it("Innova Reborn Lepas kunci 1 hari ambil di pool = 600.000", () => {
    expect(hitungBooking({ car: reborn, paket: "self_drive", jumlah: 1, area: "pool" })?.total).toBe(600_000);
  });
  it("Hiace Premio Transfer 2 trip = 1.600.000", () => {
    expect(hitungBooking({ car: premio, paket: "transfer", jumlah: 2, area: 1 })?.total).toBe(1_600_000);
  });
  it("Fortuner Full day Area 4 = 2.500.000 + biaya area dikonfirmasi", () => {
    const h = hitungBooking({ car: fortuner, paket: "full_day", jumlah: 1, area: 4 });
    expect(h?.total).toBe(2_500_000);
    expect(h?.dikonfirmasi).toBe(true);
    expect(h?.jenisTambahan).toBe("area");
  });
});

describe("hitungBooking — batas", () => {
  it("Area 1 Full day tanpa biaya tambahan", () => {
    const h = hitungBooking({ car: avanza, paket: "full_day", jumlah: 2, area: 1 });
    expect(h).toMatchObject({ sewa: 1_400_000, biayaTambahan: 0, jenisTambahan: null, dikonfirmasi: false, total: 1_400_000 });
  });
  it("cc kosong di luar Area 1 → biaya area dikonfirmasi, tidak ditebak", () => {
    const h = hitungBooking({ car: mobil({ engine_cc: null }), paket: "full_day", jumlah: 1, area: 2 });
    expect(h).toMatchObject({ biayaTambahan: 0, dikonfirmasi: true, total: 700_000 });
  });
  it("Transfer ke luar Area 1 → dikonfirmasi, tanpa biaya otomatis", () => {
    const h = hitungBooking({ car: avanza, paket: "transfer", jumlah: 1, area: 3 });
    expect(h).toMatchObject({ biayaTambahan: 0, dikonfirmasi: true, total: 300_000 });
  });
  it("Lepas kunci antar Area 4 → dikonfirmasi", () => {
    const h = hitungBooking({ car: avanza, paket: "self_drive", jumlah: 1, area: 4 });
    expect(h).toMatchObject({ jenisTambahan: "antar", biayaTambahan: 0, dikonfirmasi: true, total: 400_000 });
  });
  it("paket yang tidak tersedia menghasilkan null", () => {
    expect(hitungBooking({ car: alphard2019, paket: "self_drive", jumlah: 1, area: "pool" })).toBeNull();
  });
});

describe("normalisasiJumlah", () => {
  it("kosong, 0, negatif, pecahan, dan angka raksasa dijepit ke 1..365", () => {
    expect(normalisasiJumlah(Number(""))).toBe(1);
    expect(normalisasiJumlah(NaN)).toBe(1);
    expect(normalisasiJumlah(0)).toBe(1);
    expect(normalisasiJumlah(-3)).toBe(1);
    expect(normalisasiJumlah(2.7)).toBe(2);
    expect(normalisasiJumlah(99999)).toBe(365);
  });
  it("hitungBooking memakai jumlah yang sudah dinormalisasi", () => {
    expect(hitungBooking({ car: avanza, paket: "full_day", jumlah: 0, area: 1 })?.total).toBe(700_000);
  });
});
```

`lib/booking.test.ts`:

```ts
import { afterEach, describe, it, expect } from "vitest";
import { buatPayloadBooking, buatPesanWa, tanggalSelesai } from "./booking";
import { hitungBooking, type InputBooking } from "./hitungBooking";
import { mobil } from "./test/mobil";

const pemesan = { nama: " Budi ", telepon: " 0812 ", tanggalMulai: "2026-10-30", catatan: "" };
const xpander = mobil({ id: 14, name: "Mitsubishi Xpander", price_rent: 850_000, price_transfer: 350_000, price_self_drive: 500_000, engine_cc: 1499 });

function siapkan(input: InputBooking) {
  const hasil = hitungBooking(input);
  if (!hasil) throw new Error("paket tidak tersedia");
  return hasil;
}

describe("tanggalSelesai", () => {
  const tzAsli = process.env.TZ;
  afterEach(() => {
    process.env.TZ = tzAsli;
  });

  it("menghitung hari terakhir, melewati akhir bulan dan tahun", () => {
    expect(tanggalSelesai("2026-10-30", 3)).toBe("2026-11-01");
    expect(tanggalSelesai("2026-12-31", 1)).toBe("2026-12-31");
    expect(tanggalSelesai("2026-12-31", 2)).toBe("2027-01-01");
  });

  it("tidak bergeser di zona waktu negatif (turis Amerika)", () => {
    process.env.TZ = "America/Los_Angeles";
    expect(tanggalSelesai("2026-11-01", 2)).toBe("2026-11-02");
  });
});

describe("buatPayloadBooking", () => {
  it("lepas kunci: tanpa sopir, area, durasi, tanggal selesai, total", () => {
    const input: InputBooking = { car: xpander, paket: "self_drive", jumlah: 2, area: 2 };
    expect(buatPayloadBooking(input, siapkan(input), pemesan)).toEqual({
      transportation_id: 14,
      customer_name: "Budi",
      customer_phone: "0812",
      booking_date: "2026-10-30",
      end_date: "2026-10-31",
      duration_days: 2,
      dengan_sopir: false,
      package: "self_drive",
      area: 2,
      total_price: 1_300_000,
      notes: null,
    });
  });

  it("transfer: dengan sopir, tanpa durasi hari, jumlah trip di catatan", () => {
    const input: InputBooking = { car: xpander, paket: "transfer", jumlah: 2, area: 1 };
    const p = buatPayloadBooking(input, siapkan(input), { ...pemesan, catatan: "Bandara 08.00" });
    expect(p).toMatchObject({ dengan_sopir: true, package: "transfer", duration_days: null, end_date: null, area: 1, total_price: 700_000 });
    expect(p.notes).toBe("Transfer 2 trip — Bandara 08.00");
  });

  it("ambil di pool: area null, dicatat di notes", () => {
    const input: InputBooking = { car: xpander, paket: "self_drive", jumlah: 1, area: "pool" };
    const p = buatPayloadBooking(input, siapkan(input), pemesan);
    expect(p.area).toBeNull();
    expect(p.notes).toBe("Ambil & kembalikan di pool");
  });
});

describe("buatPesanWa", () => {
  it("memuat paket, area, rincian, total, dan versi S&K", () => {
    const input: InputBooking = { car: xpander, paket: "self_drive", jumlah: 2, area: 2 };
    const pesan = buatPesanWa(input, siapkan(input), pemesan);
    expect(pesan).toContain("📦 Paket      : Lepas kunci (maks. 12 jam, tanpa sopir)");
    expect(pesan).toContain("Serah terima : Area 2 — Tondano (Minahasa), Kota Tomohon, Likupang, Bitung");
    expect(pesan).toContain("• Sewa Rp 500.000 × 2 hari = Rp 1.000.000");
    expect(pesan).toContain("• Antar-jemput Area 2 = Rp 300.000");
    expect(pesan).toContain("💰 Est. Total : Rp 1.300.000");
    expect(pesan).toContain("📅 Tanggal    : 2026-10-30 s/d 2026-10-31");
    expect(pesan).toContain("✅ Menyetujui Syarat & Ketentuan versi 1 Oktober 2026");
    expect(pesan).not.toContain("Pesona");
  });

  it("menandai biaya yang dikonfirmasi", () => {
    const input: InputBooking = { car: xpander, paket: "full_day", jumlah: 1, area: 4 };
    const pesan = buatPesanWa(input, siapkan(input), pemesan);
    expect(pesan).toContain("• Biaya area: dikonfirmasi");
    expect(pesan).toContain("Rp 850.000 + biaya yang dikonfirmasi");
  });
});
```

- [ ] **Step 5: Jalankan test, pastikan gagal**

Run: `npm test`
Expected: FAIL, `Failed to resolve import "./paket"` dan seterusnya.

- [ ] **Step 6: Implementasi `lib/i18n/format.ts`**

```ts
import type { Locale } from "./dictionaries";

/** Isi placeholder `{nama}` di teks kamus. Placeholder yang tidak dikenal dibiarkan apa adanya. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (asli, kunci: string) => (kunci in vars ? String(vars[kunci]) : asli));
}

const INTL: Record<Locale, string> = { id: "id-ID", en: "en-US", zh: "zh-CN", ko: "ko-KR" };

/** "2026-10-01" → "1 Oktober 2026" (per bahasa). Dihitung di UTC supaya tanggal tidak bergeser. */
export function formatTanggal(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
```

- [ ] **Step 7: Implementasi `lib/tarif-sewa.ts`**

```ts
import type { Locale } from "./i18n/dictionaries";

/**
 * Angka operasional sewa, menurut paketnya — SATU-SATUNYA tempat angka ini ditulis.
 *
 * Sumber: Daftar Harga Sewa Kendaraan (berlaku 1 Oktober 2026) dan
 * pesonamanado-web src/data/tarif-sewa.ts. Halaman Syarat & Ketentuan,
 * ringkasan paket, dan perhitungan form booking menyusun kalimat/angkanya
 * dari sini, sehingga ketiganya tidak dapat menyebut tarif berbeda.
 *
 * Harga per unit (Full day, Transfer, Lepas kunci, Over time) TIDAK di sini:
 * itu dikelola di admin.
 */

/** Wilayah per area, sama untuk semua paket. Teks Indonesia; terjemahan di NAMA_AREA. */
export const AREA_SEWA = [
  { nomor: 1, wilayah: "Dalam Kota Manado" },
  { nomor: 2, wilayah: "Tondano (Minahasa), Kota Tomohon, Likupang, Bitung" },
  { nomor: 3, wilayah: "Minahasa Selatan, Minahasa Tenggara" },
] as const;

/** Area pertama di luar daftar; wilayah maupun biayanya dikonfirmasi lebih dulu. */
export const AREA_DIKONFIRMASI = 4;

/** Ambang golongan mesin untuk Biaya Area paket dengan sopir. */
export const AMBANG_MESIN_CC = 2000;

/** Paket dengan sopir (Full day / Transfer). */
export const TARIF_PELAYANAN = {
  batasKmPerHari: 120,
  /** Parkir ditanggung sampai nominal ini per hari sewa; tol tanggungan penyewa. */
  batasParkirPerHari: 50_000,
  /** Biaya Area per hari sewa (paket Full day), menurut golongan mesin. */
  area: {
    1: { kecil: 0, besar: 0 },
    2: { kecil: 150_000, besar: 250_000 },
    3: { kecil: 250_000, besar: 350_000 },
  },
} as const;

export const TARIF_LEPAS_KUNCI = {
  batasKmPerHari: 120,
  /** Antar-jemput sekali per pemesanan; nihil bila diambil & dikembalikan di pool. */
  antarJemput: { 1: 150_000, 2: 300_000, 3: 600_000 },
  /** Keterlambatan pengembalian, per jam, flat untuk semua unit. */
  keterlambatanPerJam: 100_000,
} as const;

/** Versi daftar harga sekaligus versi Syarat & Ketentuan. */
export const HARGA_BERLAKU_SEJAK = "2026-10-01";

export const NAMA_AREA: Record<Locale, Record<1 | 2 | 3, string>> = {
  id: { 1: AREA_SEWA[0].wilayah, 2: AREA_SEWA[1].wilayah, 3: AREA_SEWA[2].wilayah },
  en: { 1: "Manado city", 2: "Tondano (Minahasa), Tomohon, Likupang, Bitung", 3: "South Minahasa, Southeast Minahasa" },
  zh: { 1: "万鸦老市区", 2: "通达诺（米纳哈萨）、多摩红、利库邦、比通", 3: "南米纳哈萨、东南米纳哈萨" },
  ko: { 1: "마나도 시내", 2: "톤다노(미나하사), 토모혼, 리쿠팡, 비퉁", 3: "남미나하사, 남동미나하사" },
};

/**
 * Rupiah dalam gaya penulisan angka bahasa masing-masing: Inggris memisah
 * ribuan dengan koma, Indonesia/Mandarin/Korea dengan titik.
 */
export function rp(nilai: number, gaya: "titik" | "koma" = "titik"): string {
  const angka = nilai.toString().replace(/\B(?=(\d{3})+(?!\d))/g, gaya === "koma" ? "," : ".");
  return `Rp ${angka}`;
}
```

- [ ] **Step 8: Implementasi `lib/paket.ts`**

```ts
import type { Car } from "./types";
import { AMBANG_MESIN_CC } from "./tarif-sewa";

export type Paket = "full_day" | "transfer" | "self_drive";
export const PAKET: readonly Paket[] = ["full_day", "transfer", "self_drive"];

/** Harga 0 atau kosong berarti "belum ada harga" — tampil "Tanya harga", tidak pernah "Rp 0". */
export function adaHarga(n: number | null | undefined): n is number {
  return typeof n === "number" && n > 0;
}

export function hargaPaket(car: Car, paket: Paket): number | null {
  const n =
    paket === "full_day" ? car.price_rent : paket === "transfer" ? car.price_transfer : car.price_self_drive;
  return adaHarga(n) ? n : null;
}

export function paketTersedia(car: Car): Paket[] {
  return PAKET.filter((p) => hargaPaket(car, p) !== null);
}

export type Golongan = "kecil" | "besar";

export function golonganMesin(cc: number | null): Golongan | null {
  if (!adaHarga(cc)) return null;
  return cc <= AMBANG_MESIN_CC ? "kecil" : "besar";
}

/** Full day termurah di antara unit yang tersedia dan berharga; null bila tidak ada. */
export function hargaMulai(cars: Car[]): number | null {
  const harga = cars.filter((c) => c.status === "tersedia" && adaHarga(c.price_rent)).map((c) => c.price_rent);
  return harga.length ? Math.min(...harga) : null;
}
```

- [ ] **Step 9: Implementasi `lib/hitungBooking.ts`**

```ts
import type { Car } from "./types";
import { type Paket, golonganMesin, hargaPaket } from "./paket";
import { TARIF_LEPAS_KUNCI, TARIF_PELAYANAN } from "./tarif-sewa";

export type Area = 1 | 2 | 3 | 4;
/** "pool" hanya bermakna untuk lepas kunci: kendaraan diambil & dikembalikan di pool. */
export type PilihanArea = Area | "pool";

export type InputBooking = { car: Car; paket: Paket; jumlah: number; area: PilihanArea };

export type HasilBooking = {
  /** Harga paket per hari (full_day/self_drive) atau per trip (transfer). */
  tarif: number;
  /** Jumlah hari/trip setelah dinormalisasi. */
  jumlah: number;
  sewa: number;
  /** Biaya Area (per hari, full_day) atau antar-jemput (sekali, self_drive). */
  jenisTambahan: "area" | "antar" | null;
  tarifTambahan: number;
  biayaTambahan: number;
  /** Ada biaya yang belum bisa dihitung: Area 4, cc kosong, atau transfer ke luar Area 1. */
  dikonfirmasi: boolean;
  total: number;
};

export function normalisasiJumlah(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(365, Math.max(1, Math.floor(n)));
}

export function hitungBooking({ car, paket, jumlah, area }: InputBooking): HasilBooking | null {
  const tarif = hargaPaket(car, paket);
  if (tarif === null) return null;

  const n = normalisasiJumlah(jumlah);
  const sewa = tarif * n;
  const tanpaTambahan = (dikonfirmasi: boolean, jenis: HasilBooking["jenisTambahan"] = null): HasilBooking => ({
    tarif, jumlah: n, sewa, jenisTambahan: jenis, tarifTambahan: 0, biayaTambahan: 0, dikonfirmasi, total: sewa,
  });

  if (paket === "transfer") return tanpaTambahan(area !== 1 && area !== "pool");

  if (paket === "self_drive") {
    if (area === "pool") return tanpaTambahan(false);
    if (area === 4) return tanpaTambahan(true, "antar");
    const antar = TARIF_LEPAS_KUNCI.antarJemput[area];
    return { tarif, jumlah: n, sewa, jenisTambahan: "antar", tarifTambahan: antar, biayaTambahan: antar, dikonfirmasi: false, total: sewa + antar };
  }

  const a = area === "pool" ? 1 : area;
  if (a === 1) return tanpaTambahan(false);
  if (a === 4) return tanpaTambahan(true, "area");
  const golongan = golonganMesin(car.engine_cc);
  if (golongan === null) return tanpaTambahan(true, "area");
  const perHari = TARIF_PELAYANAN.area[a][golongan];
  return { tarif, jumlah: n, sewa, jenisTambahan: "area", tarifTambahan: perHari, biayaTambahan: perHari * n, dikonfirmasi: false, total: sewa + perHari * n };
}
```

- [ ] **Step 10: Implementasi `lib/booking.ts`**

```ts
import type { Paket } from "./paket";
import type { HasilBooking, InputBooking, PilihanArea } from "./hitungBooking";
import { formatRupiah } from "./whatsapp";
import { HARGA_BERLAKU_SEJAK, NAMA_AREA } from "./tarif-sewa";
import { formatTanggal } from "./i18n/format";

export type DataPemesan = { nama: string; telepon: string; tanggalMulai: string; catatan: string };

/** Hari terakhir sewa. Dihitung di UTC supaya tidak bergeser di zona waktu pengunjung. */
export function tanggalSelesai(mulai: string, hari: number): string {
  const d = new Date(`${mulai}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + hari - 1);
  return d.toISOString().slice(0, 10);
}

// Pesan WhatsApp dibaca tim Welcome Manado, jadi selalu berbahasa Indonesia.
const LABEL_PAKET: Record<Paket, string> = {
  full_day: "Full day (maks. 12 jam, dengan sopir)",
  transfer: "Transfer sekali jalan (dengan sopir)",
  self_drive: "Lepas kunci (maks. 12 jam, tanpa sopir)",
};

function labelArea(area: PilihanArea): string {
  if (area === "pool") return "Ambil & kembalikan di pool";
  if (area === 4) return "Area 4 — dikonfirmasi";
  return `Area ${area} — ${NAMA_AREA.id[area]}`;
}

export function buatPayloadBooking(input: InputBooking, hasil: HasilBooking, p: DataPemesan) {
  const hari = input.paket === "transfer" ? null : hasil.jumlah;
  const catatan = [
    input.paket === "transfer" ? `Transfer ${hasil.jumlah} trip` : null,
    input.area === "pool" ? "Ambil & kembalikan di pool" : null,
    p.catatan.trim() || null,
  ].filter(Boolean);

  return {
    transportation_id: input.car.id,
    customer_name: p.nama.trim(),
    customer_phone: p.telepon.trim(),
    booking_date: p.tanggalMulai,
    end_date: hari && hari > 1 ? tanggalSelesai(p.tanggalMulai, hari) : null,
    duration_days: hari,
    dengan_sopir: input.paket !== "self_drive",
    package: input.paket,
    area: input.area === "pool" ? null : input.area,
    total_price: hasil.total,
    notes: catatan.length ? catatan.join(" — ") : null,
  };
}

export function buatPesanWa(input: InputBooking, hasil: HasilBooking, p: DataPemesan): string {
  const harian = input.paket !== "transfer";
  const satuan = harian ? "hari" : "trip";
  const selesai = harian && hasil.jumlah > 1 && p.tanggalMulai ? tanggalSelesai(p.tanggalMulai, hasil.jumlah) : "";

  const rincian = [`   • Sewa ${formatRupiah(hasil.tarif)} × ${hasil.jumlah} ${satuan} = ${formatRupiah(hasil.sewa)}`];
  if (hasil.jenisTambahan === "area") {
    rincian.push(
      hasil.dikonfirmasi
        ? "   • Biaya area: dikonfirmasi"
        : `   • Biaya Area ${input.area} ${formatRupiah(hasil.tarifTambahan)} × ${hasil.jumlah} hari = ${formatRupiah(hasil.biayaTambahan)}`,
    );
  }
  if (hasil.jenisTambahan === "antar") {
    rincian.push(
      hasil.dikonfirmasi
        ? "   • Antar-jemput: dikonfirmasi"
        : `   • Antar-jemput Area ${input.area} = ${formatRupiah(hasil.biayaTambahan)}`,
    );
  }
  if (input.paket === "transfer" && hasil.dikonfirmasi) {
    rincian.push("   • Biaya transfer ke luar Kota Manado: dikonfirmasi");
  }

  return `🚗 *BOOKING — WELCOME MANADO TRANSPORT*

👤 Nama       : ${p.nama.trim() || "-"}
📱 No. WA     : ${p.telepon.trim() || "-"}
🚙 Mobil      : ${input.car.name}
📦 Paket      : ${LABEL_PAKET[input.paket]}
📅 Tanggal    : ${p.tanggalMulai || "-"}${selesai ? ` s/d ${selesai}` : ""}
⏱️ Jumlah     : ${hasil.jumlah} ${satuan}
📍 ${input.paket === "self_drive" ? "Serah terima" : "Area tujuan "} : ${labelArea(input.area)}
💵 Rincian    :
${rincian.join("\n")}
💰 Est. Total : ${formatRupiah(hasil.total)}${hasil.dikonfirmasi ? " + biaya yang dikonfirmasi" : ""}
📝 Catatan    : ${p.catatan.trim() || "-"}
✅ Menyetujui Syarat & Ketentuan versi ${formatTanggal(HARGA_BERLAKU_SEJAK, "id")}

Mohon konfirmasi ketersediaan & harga final. Terima kasih! 🙏`;
}
```

- [ ] **Step 11: Jalankan test, pastikan lolos**

Run: `npm test`
Expected: PASS untuk semua berkas (`format`, `paket`, `hitungBooking`, `booking`).

- [ ] **Step 12: Cek tipe di seluruh repo**

Run: `npx tsc --noEmit`
Expected: error **hanya** di komponen yang membuat objek `Car` tanpa empat kolom baru. Kalau ada error di luar itu, perbaiki dulu. Karena `toCar` sudah diisi, mestinya tidak ada error sama sekali.

- [ ] **Step 13: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/types.ts lib/api.ts lib/tarif-sewa.ts lib/paket.ts \
  lib/hitungBooking.ts lib/booking.ts lib/i18n/format.ts lib/test/mobil.ts \
  lib/paket.test.ts lib/hitungBooking.test.ts lib/booking.test.ts lib/i18n/format.test.ts
git commit -m "feat(harga): logika paket, Biaya Area, dan pesan booking yang teruji

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 7: Kamus i18n untuk paket, area, S&K, dan motion

**Files:**
- Modify: `transport_wm/lib/i18n/dictionaries.ts` (keempat objek `id`, `en`, `zh`, `ko`)
- Test: `transport_wm/lib/i18n/dictionaries.test.ts`

**Interfaces:**
- Produces (dipakai Task 8–14):
  - `dict.paket.{title, full_day, transfer, self_drive, full_dayNote, transferNote, self_driveNote, perDay, perTrip, overtime, overtimeNote, lateReturn, lateReturnNote, askPrice, validSince, priceChip}`
  - `dict.area.{label, deliveryLabel, pool, area, area4, confirm, areaFee, delivery, transferNote}`
  - Tambahan `dict.booking.{package, rental, plusConfirmed, included, excluded, agreePrefix, termsLink, stickyCta, unavailable}`
  - `dict.terms.{title, subtitle, effectiveSince, toc, askTitle, askWa, waMessage}`
  - `dict.footer.terms`
  - `dict.home.{marqueeLabel, heroSlide}`
  - Placeholder: `{date}`, `{price}`, `{n}`.

- [ ] **Step 1: Tulis test yang gagal**

`lib/i18n/dictionaries.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { dictionaries, locales } from "./dictionaries";

type Pohon = string | Pohon[] | { [k: string]: Pohon };

function daun(nilai: Pohon, jalur = ""): [string, string][] {
  if (typeof nilai === "string") return [[jalur, nilai]];
  if (Array.isArray(nilai)) return nilai.flatMap((v, i) => daun(v, `${jalur}[${i}]`));
  return Object.entries(nilai).flatMap(([k, v]) => daun(v, jalur ? `${jalur}.${k}` : k));
}

const placeholder = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

describe("kamus", () => {
  const acuan = new Map(daun(dictionaries.id as unknown as Pohon));

  it.each(locales)("%s: tidak ada teks kosong", (l) => {
    for (const [jalur, teks] of daun(dictionaries[l] as unknown as Pohon)) {
      expect(teks.trim(), `${l}.${jalur}`).not.toBe("");
    }
  });

  it.each(locales)("%s: placeholder sama dengan bahasa Indonesia", (l) => {
    for (const [jalur, teks] of daun(dictionaries[l] as unknown as Pohon)) {
      expect(placeholder(teks), `${l}.${jalur}`).toBe(placeholder(acuan.get(jalur) ?? ""));
    }
  });

  it("memuat bagian baru untuk paket, area, dan S&K", () => {
    expect(dictionaries.id.paket.priceChip).toContain("{price}");
    expect(dictionaries.id.paket.validSince).toContain("{date}");
    expect(dictionaries.id.area.areaFee).toContain("{n}");
    expect(dictionaries.id.terms.effectiveSince).toContain("{date}");
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run lib/i18n/dictionaries.test.ts`
Expected: FAIL. Penyebabnya `Cannot read properties of undefined (reading 'priceChip')`.

- [ ] **Step 3: Tambahkan teks Indonesia**

Di objek `id`, tambahkan tiga bagian baru **sebelum** `faq: {`:

```ts
  paket: {
    title: "Paket harga",
    full_day: "Full day",
    transfer: "Transfer",
    self_drive: "Lepas kunci",
    full_dayNote: "maks. 12 jam · dengan sopir",
    transferNote: "sekali jalan · antar atau jemput · dengan sopir",
    self_driveNote: "maks. 12 jam · tanpa sopir",
    perDay: "/hari",
    perTrip: "/trip",
    overtime: "Over time",
    overtimeNote: "/jam setelah 12 jam",
    lateReturn: "Telat kembali (lepas kunci)",
    lateReturnNote: "/jam",
    askPrice: "Tanya harga",
    validSince: "Harga berlaku sejak {date} · dapat berubah sewaktu-waktu",
    priceChip: "Mulai {price}/hari",
  },
  area: {
    label: "Area tujuan",
    deliveryLabel: "Serah terima mobil",
    pool: "Ambil & kembalikan di pool (gratis)",
    area: "Area {n}",
    area4: "Area 4 — di luar daftar",
    confirm: "dikonfirmasi via WhatsApp",
    areaFee: "Biaya Area {n}",
    delivery: "Antar-jemput Area {n}",
    transferNote: "Transfer ke luar Kota Manado: biayanya dikonfirmasi via WhatsApp.",
  },
  terms: {
    title: "Syarat & Ketentuan",
    subtitle: "Ketentuan sewa kendaraan Welcome Manado Transport.",
    effectiveSince: "Berlaku sejak {date}",
    toc: "Daftar isi",
    askTitle: "Ada pertanyaan soal ketentuan ini?",
    askWa: "Tanya via WhatsApp",
    waMessage: "Halo Welcome Manado Transport, saya ingin bertanya tentang Syarat & Ketentuan sewa.",
  },
```

Di `id.booking`, tambahkan setelah `errDate: ...,`:

```ts
    package: "Pilih paket",
    rental: "Sewa",
    plusConfirmed: "+ biaya yang dikonfirmasi via WhatsApp",
    included: "Termasuk",
    excluded: "Tidak termasuk",
    agreePrefix: "Dengan menekan Booking, Anda menyetujui",
    termsLink: "Syarat & Ketentuan",
    stickyCta: "Booking Sekarang",
    unavailable: "Harga unit ini belum tercantum. Tanyakan langsung via WhatsApp.",
```

Di `id.footer`, tambahkan `terms: "Syarat & Ketentuan",`. Di `id.home`, tambahkan `marqueeLabel: "Armada kami",` dan `heroSlide: "Foto {n}",`.

- [ ] **Step 4: Tambahkan teks Inggris (objek `en`)**

Di posisi yang sama:

```ts
  paket: {
    title: "Rates",
    full_day: "Full day",
    transfer: "Transfer",
    self_drive: "Self-drive",
    full_dayNote: "up to 12 hours · with driver",
    transferNote: "one way · drop-off or pick-up · with driver",
    self_driveNote: "up to 12 hours · without driver",
    perDay: "/day",
    perTrip: "/trip",
    overtime: "Overtime",
    overtimeNote: "/hour after 12 hours",
    lateReturn: "Late return (self-drive)",
    lateReturnNote: "/hour",
    askPrice: "Ask for price",
    validSince: "Rates valid from {date} · subject to change",
    priceChip: "From {price}/day",
  },
  area: {
    label: "Destination area",
    deliveryLabel: "Vehicle handover",
    pool: "Collect & return at our pool (free)",
    area: "Area {n}",
    area4: "Area 4 — outside the list",
    confirm: "confirmed via WhatsApp",
    areaFee: "Area {n} charge",
    delivery: "Delivery, Area {n}",
    transferNote: "Transfers outside Manado city: the charge is confirmed via WhatsApp.",
  },
  terms: {
    title: "Terms & Conditions",
    subtitle: "Vehicle rental terms of Welcome Manado Transport.",
    effectiveSince: "Effective from {date}",
    toc: "Contents",
    askTitle: "Questions about these terms?",
    askWa: "Ask on WhatsApp",
    waMessage: "Hello Welcome Manado Transport, I have a question about your rental terms.",
  },
```

`en.booking`:

```ts
    package: "Choose a package",
    rental: "Rental",
    plusConfirmed: "+ charges confirmed via WhatsApp",
    included: "Included",
    excluded: "Not included",
    agreePrefix: "By pressing Book, you agree to the",
    termsLink: "Terms & Conditions",
    stickyCta: "Book Now",
    unavailable: "This vehicle's rate isn't listed yet. Ask us directly on WhatsApp.",
```

`en.footer.terms: "Terms & Conditions"`, `en.home.marqueeLabel: "Our fleet"`, `en.home.heroSlide: "Photo {n}"`.

- [ ] **Step 5: Tambahkan teks Mandarin (objek `zh`)**

```ts
  paket: {
    title: "价格套餐",
    full_day: "全天",
    transfer: "单程接送",
    self_drive: "自驾",
    full_dayNote: "最长 12 小时 · 含司机",
    transferNote: "单程 · 送或接 · 含司机",
    self_driveNote: "最长 12 小时 · 不含司机",
    perDay: "/天",
    perTrip: "/趟",
    overtime: "超时费",
    overtimeNote: "/小时（超过 12 小时）",
    lateReturn: "逾期还车（自驾）",
    lateReturnNote: "/小时",
    askPrice: "询价",
    validSince: "价格自 {date} 起生效 · 如有变动以确认为准",
    priceChip: "{price}/天起",
  },
  area: {
    label: "目的地区域",
    deliveryLabel: "交车方式",
    pool: "在车场取还车（免费）",
    area: "Area {n}",
    area4: "Area 4 — 不在列表内",
    confirm: "通过 WhatsApp 确认",
    areaFee: "Area {n} 区域费",
    delivery: "Area {n} 送取车费",
    transferNote: "万鸦老市区以外的接送：费用通过 WhatsApp 确认。",
  },
  terms: {
    title: "条款与条件",
    subtitle: "Welcome Manado Transport 车辆租赁条款。",
    effectiveSince: "自 {date} 起生效",
    toc: "目录",
    askTitle: "对条款有疑问？",
    askWa: "通过 WhatsApp 咨询",
    waMessage: "您好 Welcome Manado Transport，我想咨询租车条款。",
  },
```

`zh.booking`:

```ts
    package: "选择套餐",
    rental: "租金",
    plusConfirmed: "+ 通过 WhatsApp 确认的费用",
    included: "包含",
    excluded: "不包含",
    agreePrefix: "点击预订即表示您同意",
    termsLink: "条款与条件",
    stickyCta: "立即预订",
    unavailable: "该车型暂未标价，请直接通过 WhatsApp 询价。",
```

`zh.footer.terms: "条款与条件"`, `zh.home.marqueeLabel: "我们的车队"`, `zh.home.heroSlide: "图片 {n}"`.

- [ ] **Step 6: Tambahkan teks Korea (objek `ko`)**

```ts
  paket: {
    title: "요금 패키지",
    full_day: "종일",
    transfer: "편도 픽업/샌딩",
    self_drive: "자차 운전",
    full_dayNote: "최대 12시간 · 기사 포함",
    transferNote: "편도 · 샌딩 또는 픽업 · 기사 포함",
    self_driveNote: "최대 12시간 · 기사 미포함",
    perDay: "/일",
    perTrip: "/회",
    overtime: "초과 요금",
    overtimeNote: "/시간 (12시간 초과 시)",
    lateReturn: "반납 지연 (자차 운전)",
    lateReturnNote: "/시간",
    askPrice: "가격 문의",
    validSince: "{date}부터 적용되는 요금 · 변동될 수 있음",
    priceChip: "{price}/일부터",
  },
  area: {
    label: "목적지 지역",
    deliveryLabel: "차량 인수 방법",
    pool: "차고지에서 인수·반납 (무료)",
    area: "Area {n}",
    area4: "Area 4 — 목록 외 지역",
    confirm: "WhatsApp으로 확인",
    areaFee: "Area {n} 지역 요금",
    delivery: "Area {n} 배차 요금",
    transferNote: "마나도 시외 픽업/샌딩 요금은 WhatsApp으로 확인해 드립니다.",
  },
  terms: {
    title: "이용약관",
    subtitle: "Welcome Manado Transport 차량 대여 약관입니다.",
    effectiveSince: "{date}부터 시행",
    toc: "목차",
    askTitle: "약관에 대해 궁금하신 점이 있나요?",
    askWa: "WhatsApp으로 문의",
    waMessage: "안녕하세요 Welcome Manado Transport, 대여 약관에 대해 문의드립니다.",
  },
```

`ko.booking`:

```ts
    package: "패키지 선택",
    rental: "대여료",
    plusConfirmed: "+ WhatsApp으로 확인되는 요금",
    included: "포함",
    excluded: "불포함",
    agreePrefix: "예약 버튼을 누르시면 다음에 동의하는 것으로 간주됩니다:",
    termsLink: "이용약관",
    stickyCta: "지금 예약",
    unavailable: "이 차량의 요금은 아직 게시되지 않았습니다. WhatsApp으로 문의해 주세요.",
```

`ko.footer.terms: "이용약관"`, `ko.home.marqueeLabel: "보유 차량"`, `ko.home.heroSlide: "사진 {n}"`.

- [ ] **Step 7: Jalankan test dan cek tipe**

Run: `npx vitest run lib/i18n && npx tsc --noEmit`
Expected: PASS. `tsc` tanpa error. `Dictionary = typeof id` memaksa en/zh/ko punya kunci yang sama persis.

- [ ] **Step 8: Commit**

```bash
git add lib/i18n/dictionaries.ts lib/i18n/dictionaries.test.ts
git commit -m "feat(i18n): teks paket harga, area, S&K, dan motion dalam 4 bahasa

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 8: Tampilan harga di kartu, detail, banding, dan landing

**Files:**
- Modify: `transport_wm/components/CarCard.tsx`
- Modify: `transport_wm/components/CarDetailBody.tsx`
- Modify: `transport_wm/components/TanyaButton.tsx`
- Modify: `transport_wm/app/banding/page.tsx`
- Modify: `transport_wm/app/mobil/[slug]/page.tsx` (JSON-LD `offers`)
- Modify: `transport_wm/app/katalog/KatalogClient.tsx` (urutan harga)
- Modify: `transport_wm/app/sewa-mobil-lepas-kunci-manado/page.tsx`, `transport_wm/app/rental-mobil-dengan-sopir-manado/page.tsx`

**Interfaces:**
- Consumes:
  - `adaHarga`, `hargaPaket`, `paketTersedia`, `Paket` (Task 6)
  - `TARIF_LEPAS_KUNCI`, `HARGA_BERLAKU_SEJAK` (Task 6)
  - `fill`, `formatTanggal` (Task 6)
  - `dict.paket.*` (Task 7)
- Produces:
  - elemen `id="kartu-harga"` di halaman detail (dipakai `StickyBookingBar`, Task 14)

- [ ] **Step 1: CarCard**

Tambahkan import:

```tsx
import { KeyRound } from "lucide-react";
import { adaHarga, hargaPaket } from "@/lib/paket";
```

Lalu hapus `UserCheck` dari import lucide yang lama bila tidak dipakai lagi.

Ganti blok badge `{car.dengan_sopir && ( ... {dict.car.driverBadge} </span> )}` dengan:

```tsx
            {hargaPaket(car, "self_drive") !== null && (
              <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/80 dark:text-slate-200">
                <KeyRound className="h-3 w-3 text-red-600" /> {dict.paket.self_drive}
              </span>
            )}
```

Ganti pill harga (`<span className="rounded-xl bg-red-600 ..."> {formatRupiah(car.price_rent)} ... </span>`) dengan:

```tsx
            {adaHarga(car.price_rent) ? (
              <span className="rounded-xl bg-red-600 px-3.5 py-2 text-sm font-black text-white shadow-lg shadow-red-600/20">
                {formatRupiah(car.price_rent)}
                <span className="ml-0.5 text-[10px] font-bold opacity-80">{dict.paket.perDay}</span>
              </span>
            ) : (
              <span className="rounded-xl bg-slate-100 px-3.5 py-2 text-sm font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {dict.paket.askPrice}
              </span>
            )}
```

Tambahkan tepat setelah `</div>` penutup baris harga, masih di dalam `<div className="p-6">`:

```tsx
          {adaHarga(car.price_rent) && (
            <p className="mt-2 text-[11px] font-medium text-slate-400">{dict.paket.full_dayNote}</p>
          )}
```

- [ ] **Step 2: CarDetailBody**

Tambahkan import:

```tsx
import { KeyRound } from "lucide-react";
import { type Paket, adaHarga, hargaPaket, paketTersedia } from "@/lib/paket";
import { HARGA_BERLAKU_SEJAK, TARIF_LEPAS_KUNCI } from "@/lib/tarif-sewa";
import { fill, formatTanggal } from "@/lib/i18n/format";
```

Hapus konstanta `priceLabel`, lalu ganti dengan:

```tsx
  const pilihan = paketTersedia(car);
  const catatanPaket: Record<Paket, string> = {
    full_day: dict.paket.full_dayNote,
    transfer: dict.paket.transferNote,
    self_drive: dict.paket.self_driveNote,
  };
```

Ganti badge `{car.dengan_sopir && ( ... {dict.car.withDriver} </span> )}` dengan:

```tsx
              {pilihan.includes("self_drive") && (
                <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <KeyRound className="h-3 w-3" /> {dict.paket.self_drive}
                </span>
              )}
```

Di kolom kanan, ganti pembuka kartu harga `<div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">` sampai `<p ...>{formatRupiah(car.price_rent)} <span ...> {priceLabel}</span></p>` dengan:

```tsx
          <div id="kartu-harga" className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {pilihan.length > 0 ? (
              <>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.paket.title}</p>
                <ul className="mt-3 space-y-3">
                  {pilihan.map((p) => (
                    <li key={p} className="flex items-baseline justify-between gap-3">
                      <span>
                        <span className="block font-black text-slate-900 dark:text-white">{dict.paket[p]}</span>
                        <span className="block text-xs text-slate-400">{catatanPaket[p]}</span>
                      </span>
                      <span className="shrink-0 text-right text-xl font-black tracking-tight text-red-600">
                        {formatRupiah(hargaPaket(car, p))}
                        <span className="text-xs font-bold text-slate-400">
                          {p === "transfer" ? dict.paket.perTrip : dict.paket.perDay}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  {adaHarga(car.price_overtime) && (
                    <p>
                      {dict.paket.overtime}: <b className="text-slate-700 dark:text-slate-200">{formatRupiah(car.price_overtime)}</b>
                      {dict.paket.overtimeNote}
                    </p>
                  )}
                  {pilihan.includes("self_drive") && (
                    <p>
                      {dict.paket.lateReturn}:{" "}
                      <b className="text-slate-700 dark:text-slate-200">{formatRupiah(TARIF_LEPAS_KUNCI.keterlambatanPerJam)}</b>
                      {dict.paket.lateReturnNote}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-2xl font-black tracking-tight text-slate-700 dark:text-slate-200">{dict.paket.askPrice}</p>
            )}
```

Tambahkan juga baris berikut sebagai anak terakhir kartu itu, tepat sebelum `</div>` penutup kartu (setelah blok `fastResponse`/`transparent`):

```tsx
            <p className="mt-4 text-[11px] text-slate-400">
              {fill(dict.paket.validSince, { date: formatTanggal(HARGA_BERLAKU_SEJAK, locale) })}
            </p>
```

- [ ] **Step 3: TanyaButton**

Tambahkan `import { adaHarga } from "@/lib/paket";`. Ganti baris `💵 Harga sewa: ...` dengan:

```tsx
💵 Harga sewa: ${adaHarga(car.price_rent) ? `${formatRupiah(car.price_rent)}/hari (full day)` : "mohon info harga"}
```

- [ ] **Step 4: Halaman banding**

Tambahkan `import { adaHarga, hargaPaket } from "@/lib/paket";`. Ganti `render` baris `rentPrice` dengan:

```tsx
      render: (c) =>
        adaHarga(c.price_rent) ? (
          <span className="font-black text-red-600">
            {formatRupiah(c.price_rent)}
            <span className="font-normal text-slate-400">{dict.paket.perDay}</span>
          </span>
        ) : (
          <span className="text-slate-400">{dict.paket.askPrice}</span>
        ),
```

Ganti baris `withDriver` dengan:

```tsx
    {
      label: dict.paket.self_drive,
      render: (c) => {
        const harga = hargaPaket(c, "self_drive");
        return harga !== null
          ? <span className="font-bold">{formatRupiah(harga)}{dict.paket.perDay}</span>
          : <Minus className="mx-auto h-4 w-4 text-slate-300 dark:text-slate-600" />;
      },
    },
```

Hapus `Check` dari import lucide bila tidak dipakai lagi.

- [ ] **Step 5: JSON-LD halaman mobil**

Di `app/mobil/[slug]/page.tsx`, tambahkan `import { adaHarga } from "@/lib/paket";`. Bungkus properti `offers: { ... },` menjadi:

```tsx
    ...(adaHarga(car.price_rent)
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "IDR",
            price: car.price_rent,
            url: `${SITE_URL}/mobil/${car.slug}`,
            availability:
              car.status === "tersedia"
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: { "@type": "AutoRental", name: SITE.name, "@id": `${SITE_URL}/#business` },
          },
        }
      : {}),
```

Harga 0 tidak boleh diiklankan ke Google sebagai penawaran Rp 0.

- [ ] **Step 6: Urutan harga di katalog**

Di `app/katalog/KatalogClient.tsx`, tambahkan `import { adaHarga } from "@/lib/paket";`. Ganti dua baris sort harga dengan:

```tsx
        case "harga-asc": return (adaHarga(a.price_rent) ? a.price_rent : Infinity) - (adaHarga(b.price_rent) ? b.price_rent : Infinity);
        case "harga-desc": return (adaHarga(b.price_rent) ? b.price_rent : -1) - (adaHarga(a.price_rent) ? a.price_rent : -1);
```

Unit "Tanya harga" selalu di akhir.

- [ ] **Step 7: Landing lepas kunci dan dengan sopir**

Di `app/sewa-mobil-lepas-kunci-manado/page.tsx`, tambahkan `import { hargaPaket } from "@/lib/paket";` dan ganti `const rental = cars;` dengan:

```tsx
  // Hanya unit yang memang disewakan lepas kunci (punya harga lepas kunci).
  const rental = cars.filter((c) => hargaPaket(c, "self_drive") !== null);
```

Di `app/rental-mobil-dengan-sopir-manado/page.tsx`, tambahkan import yang sama. Ganti dua baris `const withDriver = cars.filter((c) => c.dengan_sopir);` dan komentar fallback-nya dengan:

```tsx
  // Semua unit berharga Full day disewakan dengan sopir.
  const withDriver = cars.filter((c) => hargaPaket(c, "full_day") !== null);
```

Baris `const list = withDriver.length ? withDriver : cars;` dibiarkan.

- [ ] **Step 8: Cek tipe dan build**

Run: `npx tsc --noEmit && npm test`
Expected: tanpa error, semua test PASS.

- [ ] **Step 9: Cek visual**

Gunakan API lokal yang sudah diisi Task 5 (*Lingkungan uji lokal*). Lalu periksa:
- `/katalog`: Avanza menampilkan "Rp 700.000/hari" + "maks. 12 jam · dengan sopir" dan badge "Lepas kunci". Alphard tanpa badge itu. White Marlin menampilkan "Tanya harga" dan berada paling akhir saat diurutkan "harga termurah".
- `/mobil/toyota-avanza`: tiga paket, Over time Rp 50.000/jam, telat kembali Rp 100.000/jam, "Harga berlaku sejak 1 Oktober 2026". Ganti bahasa ke EN, ZH, dan KO, lalu pastikan teksnya ikut berganti.
- `/mobil/white-marlin`: "Tanya harga", tanpa "Rp 0".
- `/sewa-mobil-lepas-kunci-manado`: hanya Innova Reborn, Xpander, dan Avanza.

- [ ] **Step 10: Commit**

```bash
git add components/CarCard.tsx components/CarDetailBody.tsx components/TanyaButton.tsx app/banding/page.tsx \
  "app/mobil/[slug]/page.tsx" app/katalog/KatalogClient.tsx app/sewa-mobil-lepas-kunci-manado/page.tsx \
  app/rental-mobil-dengan-sopir-manado/page.tsx
git commit -m "feat(harga): tampilkan paket Full day, Transfer, Lepas kunci; tanpa Rp 0

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 9: Syarat & Ketentuan dan ringkasan paket

**Files:**
- Create: `transport_wm/lib/syarat-ketentuan.ts` (disalin dari pesonamanado-web lalu disunting)
- Create: `transport_wm/lib/ringkasan-paket.ts`
- Create: `transport_wm/components/SyaratKetentuanContent.tsx`
- Create: `transport_wm/app/syarat-ketentuan/page.tsx`
- Modify: `transport_wm/components/Footer.tsx` (menu), `transport_wm/app/sitemap.ts`
- Test: `transport_wm/lib/syarat-ketentuan.test.ts`

**Interfaces:**
- Consumes:
  - `AREA_SEWA`, `AREA_DIKONFIRMASI`, `AMBANG_MESIN_CC`, `TARIF_PELAYANAN`, `TARIF_LEPAS_KUNCI`, `HARGA_BERLAKU_SEJAK`, `rp` (Task 6)
  - `dict.terms.*`, `dict.footer.terms` (Task 7)
- Produces:
  - `SYARAT_KETENTUAN: BagianSyarat[]`
  - `SYARAT_BERLAKU_SEJAK`
  - `type Localized<T> = Record<Locale, T>`
  - `RINGKASAN_PAKET: Record<Paket, { termasuk: Localized<string[]>; tidakTermasuk: Localized<string[]> }>` (dipakai Task 10)
  - rute `/syarat-ketentuan`

- [ ] **Step 1: Tulis test yang gagal**

`lib/syarat-ketentuan.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SYARAT_KETENTUAN, SYARAT_BERLAKU_SEJAK } from "./syarat-ketentuan";
import { RINGKASAN_PAKET } from "./ringkasan-paket";
import { locales } from "./i18n/dictionaries";
import { PAKET } from "./paket";

describe("SYARAT_KETENTUAN", () => {
  it("berlaku sejak 1 Oktober 2026", () => {
    expect(SYARAT_BERLAKU_SEJAK).toBe("2026-10-01");
  });

  it("setiap pasal lengkap 4 bahasa dengan jumlah butir yang sama", () => {
    for (const b of SYARAT_KETENTUAN) {
      for (const l of locales) {
        expect(b.judul[l].trim(), `${b.id}.judul.${l}`).not.toBe("");
        expect(b.isi[l].length, `${b.id}.isi.${l}`).toBe(b.isi.id.length);
        for (const butir of b.isi[l]) expect(butir.trim()).not.toBe("");
      }
    }
  });

  it("anchor unik, tanpa pasal paket wisata, ada pasal paket", () => {
    const ids = SYARAT_KETENTUAN.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("tur");
    expect(ids).toContain("paket");
  });

  it("operator Welcome Manado, istilah 'Pelayanan' tidak dipakai", () => {
    const teks = JSON.stringify(SYARAT_KETENTUAN);
    expect(teks).not.toContain("Pesona");
    expect(teks).not.toContain("Pelayanan");
    expect(teks).toContain("Welcome Manado");
  });

  it("keterlambatan lepas kunci Rp 100.000 per jam, bukan satu hari penuh", () => {
    const telat = SYARAT_KETENTUAN.find((b) => b.id === "keterlambatan")!;
    expect(telat.isi.id[0]).toContain("Rp 100.000 per jam");
    expect(JSON.stringify(telat)).not.toContain("satu hari penuh");
  });

  it("pasal pengemudi menyebut batas 12 jam dan over time per unit", () => {
    const sopir = SYARAT_KETENTUAN.find((b) => b.id === "pengemudi")!;
    expect(sopir.isi.id.join(" ")).toContain("12 jam");
    expect(sopir.isi.id.join(" ")).toContain("over time");
  });
});

describe("RINGKASAN_PAKET", () => {
  it.each(PAKET)("%s lengkap 4 bahasa dengan jumlah butir sama", (p) => {
    for (const l of locales) {
      expect(RINGKASAN_PAKET[p].termasuk[l].length).toBe(RINGKASAN_PAKET[p].termasuk.id.length);
      expect(RINGKASAN_PAKET[p].tidakTermasuk[l].length).toBe(RINGKASAN_PAKET[p].tidakTermasuk.id.length);
    }
  });

  it("isi sesuai paket", () => {
    expect(RINGKASAN_PAKET.full_day.termasuk.id.join(" ")).toContain("sopir");
    expect(RINGKASAN_PAKET.full_day.tidakTermasuk.id.join(" ")).toContain("Tiket masuk tempat wisata");
    expect(RINGKASAN_PAKET.self_drive.tidakTermasuk.id).toContain("Bahan bakar");
    expect(RINGKASAN_PAKET.self_drive.tidakTermasuk.id.join(" ")).toContain("Rp 100.000 per jam");
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run lib/syarat-ketentuan.test.ts`
Expected: FAIL, `Failed to resolve import "./syarat-ketentuan"`.

- [ ] **Step 3: Salin sumber dan ganti nama operator**

```bash
cp /Users/marchelinoraco/Documents/2026/pesonamanado-web/src/data/syarat-ketentuan.ts lib/syarat-ketentuan.ts
sed -i '' \
  -e 's/Pesona Manado/Welcome Manado/g' \
  -e 's/paket Pelayanan/paket dengan sopir/g' \
  -e 's/On Pelayanan (with driver) packages/On packages with a driver/g' \
  -e 's/on Pelayanan packages/on packages with a driver/g' \
  lib/syarat-ketentuan.ts
grep -n "Pesona\|Pelayanan" lib/syarat-ketentuan.ts
```

Expected: `grep` tidak mencetak apa pun. Kalau masih ada, sunting manual ke "Welcome Manado" atau "dengan sopir".

- [ ] **Step 4: Ganti kepala berkas**

Ganti semua baris dari awal berkas sampai dan termasuk `export const SYARAT_KETENTUAN: BagianSyarat[] = [` dengan:

```ts
import type { Locale } from "./i18n/dictionaries";
import {
  AREA_SEWA,
  AREA_DIKONFIRMASI,
  AMBANG_MESIN_CC,
  HARGA_BERLAKU_SEJAK,
  TARIF_PELAYANAN,
  TARIF_LEPAS_KUNCI,
  rp,
} from "./tarif-sewa";

export type Localized<T> = Record<Locale, T>;

export type BagianSyarat = {
  /** Dipakai sebagai anchor `#id` supaya satu pasal dapat ditautkan langsung. */
  id: string;
  judul: Localized<string>;
  isi: Localized<string[]>;
};

/**
 * Tanggal berlaku = versi daftar harga. Wajib diperbarui setiap kali isinya
 * berubah: pesan booking WhatsApp mencatat versi ini sebagai yang disetujui.
 */
export const SYARAT_BERLAKU_SEJAK = HARGA_BERLAKU_SEJAK;

/**
 * Syarat dan ketentuan sewa Welcome Manado Transport.
 *
 * Diadaptasi dari syarat sewa pesonamanado-web (pemilik yang sama), dengan
 * Welcome Manado sebagai operator. Dokumen ini MENGIKAT: apa pun yang tertulis
 * di sini adalah janji Welcome Manado kepada penyewa. Angka operasional
 * diambil dari lib/tarif-sewa.ts; harga per unit TIDAK ditulis di sini karena
 * dikelola di admin dan tampil di halaman kendaraan.
 */
export const SYARAT_KETENTUAN: BagianSyarat[] = [
```

- [ ] **Step 5: Sisipkan pasal "Paket dan tarif" setelah pasal `pemesanan`**

Tepat setelah `},` penutup objek `id: 'pemesanan'` (sebelum `{` objek `id: 'jaminan'`), sisipkan:

```ts
  {
    id: 'paket',
    judul: {
      id: 'Paket dan tarif',
      en: 'Packages and rates',
      zh: '套餐与价格',
      ko: '패키지와 요금',
    },
    isi: {
      id: [
        'Tersedia tiga paket: Full day dengan sopir, Transfer sekali jalan (antar atau jemput) dengan sopir, dan Lepas kunci tanpa sopir pada unit yang menyediakannya. Tarif setiap paket tercantum di halaman masing-masing kendaraan.',
        'Paket Full day dan Lepas kunci dihitung maksimum 12 jam per hari sewa.',
        'Pada paket dengan sopir, pemakaian di atas 12 jam dikenakan tarif over time per jam sesuai unit, sebagaimana tercantum di halaman kendaraan.',
        'Harga belum termasuk tiket masuk tempat wisata.',
        'Harga dapat berubah sewaktu-waktu. Yang berlaku adalah harga yang kami konfirmasikan saat pemesanan.',
      ],
      en: [
        'Three packages are available: Full day with a driver, a one-way Transfer (drop-off or pick-up) with a driver, and Self-drive without a driver on vehicles that offer it. The rate for each package is shown on each vehicle’s page.',
        'Full day and Self-drive packages cover up to 12 hours per rental day.',
        'On packages with a driver, use beyond 12 hours is charged at the vehicle’s hourly overtime rate shown on its page.',
        'Prices do not include entrance tickets to tourist attractions.',
        'Prices may change at any time. The price that applies is the one we confirm at the time of booking.',
      ],
      zh: [
        '提供三种套餐：含司机全天、含司机单程接送（送或接），以及不含司机的自驾（限提供该服务的车型）。各套餐价格见各车辆页面。',
        '全天与自驾套餐每租期日最长 12 小时。',
        '含司机套餐超过 12 小时的部分，按车辆页面所列的每小时超时费计费。',
        '价格不含景点门票。',
        '价格可能随时调整，以预订确认时告知的价格为准。',
      ],
      ko: [
        '패키지는 세 가지입니다: 기사 포함 종일, 기사 포함 편도 픽업/샌딩, 그리고 해당 차량에 한해 기사 없는 자차 운전. 각 패키지 요금은 차량별 페이지에 안내되어 있습니다.',
        '종일 및 자차 운전 패키지는 대여일당 최대 12시간입니다.',
        '기사 포함 패키지에서 12시간을 넘는 이용은 차량 페이지에 안내된 시간당 초과 요금이 부과됩니다.',
        '요금에는 관광지 입장료가 포함되어 있지 않습니다.',
        '요금은 수시로 변경될 수 있으며, 예약 확정 시 안내드린 요금이 적용됩니다.',
      ],
    },
  },

```

- [ ] **Step 6: Ganti isi pasal `bbm`**

Ganti seluruh `isi: { ... }` di objek `id: 'bbm'` dengan:

```ts
    isi: {
      id: [
        'Pada sewa lepas kunci, bahan bakar menjadi tanggungan penyewa. Kendaraan dikembalikan dengan takaran bahan bakar yang setara saat diterima.',
        'Biaya tol dan denda tilang selama masa sewa menjadi tanggungan penyewa. Pada sewa lepas kunci, biaya parkir juga menjadi tanggungan penyewa.',
        `Pada paket dengan sopir, bahan bakar sudah termasuk untuk pemakaian sampai ${TARIF_PELAYANAN.batasKmPerHari} km per hari sewa, dan biaya parkir kami tanggung sampai ${rp(TARIF_PELAYANAN.batasParkirPerHari)} per hari sewa. Perjalanan yang melebihi batas jarak itu dikonfirmasi dan disepakati lebih dulu.`,
      ],
      en: [
        'On self-drive rentals, fuel is the renter’s responsibility. Return the vehicle with the same fuel level it was received with.',
        'Tolls and traffic fines incurred during the rental are the renter’s responsibility. On self-drive rentals, parking is the renter’s responsibility too.',
        `On packages with a driver, fuel is included for up to ${TARIF_PELAYANAN.batasKmPerHari} km per rental day, and we cover parking up to ${rp(TARIF_PELAYANAN.batasParkirPerHari, 'koma')} per rental day. Journeys beyond that distance are agreed beforehand.`,
      ],
      zh: [
        '自驾租车的燃油由承租人承担，还车时油量应与接车时相当。',
        '租赁期间发生的通行费与交通罚款由承租人承担；自驾租车的停车费亦由承租人承担。',
        `含司机套餐已包含每租期日 ${TARIF_PELAYANAN.batasKmPerHari} 公里以内的燃油，停车费由我们承担每租期日最高 ${rp(TARIF_PELAYANAN.batasParkirPerHari)}；超出该里程的行程须事先商定。`,
      ],
      ko: [
        '자차 운전 대여의 연료비는 대여자 부담이며, 인수 시와 같은 연료량으로 반납해 주셔야 합니다.',
        '대여 기간 중 발생한 통행료와 교통 범칙금은 대여자 부담입니다. 자차 운전 대여의 경우 주차료도 대여자 부담입니다.',
        `기사 포함 패키지는 대여일당 ${TARIF_PELAYANAN.batasKmPerHari}km까지 연료가 포함되며, 주차료는 대여일당 ${rp(TARIF_PELAYANAN.batasParkirPerHari)}까지 저희가 부담합니다. 이 거리를 넘는 일정은 사전에 협의합니다.`,
      ],
    },
```

- [ ] **Step 7: Ganti isi pasal `keterlambatan`**

Ganti seluruh `isi: { ... }` di objek `id: 'keterlambatan'` dengan:

```ts
    isi: {
      id: [
        `Keterlambatan pengembalian kendaraan lepas kunci dikenakan ${rp(TARIF_LEPAS_KUNCI.keterlambatanPerJam)} per jam, dihitung sejak masa sewa berakhir.`,
        'Bila Anda memperkirakan akan terlambat, hubungi kami sesegera mungkin. Kendaraan sering sudah dipesan penyewa berikutnya, dan pemberitahuan lebih awal memungkinkan kami mengatur ulang.',
        'Perpanjangan masa sewa dapat dilakukan bila kendaraan belum dipesan orang lain, dan dihitung dengan tarif yang berlaku.',
      ],
      en: [
        `A late return of a self-drive vehicle is charged ${rp(TARIF_LEPAS_KUNCI.keterlambatanPerJam, 'koma')} per hour, counted from the end of the rental period.`,
        'If you expect to be late, contact us as early as you can. The vehicle is often already booked by the next renter, and early warning lets us rearrange.',
        'Extensions are possible when the vehicle has not been booked by someone else, and are charged at the applicable rate.',
      ],
      zh: [
        `自驾车辆逾期归还，自租期结束起按每小时 ${rp(TARIF_LEPAS_KUNCI.keterlambatanPerJam)} 计费。`,
        '若预计会迟到，请尽早联系我们。车辆往往已被下一位客人预订，提前告知可让我们重新安排。',
        '若车辆尚未被他人预订，可办理续租，按适用价格计费。',
      ],
      ko: [
        `자차 운전 차량의 반납이 지연되면 대여 기간 종료 시점부터 시간당 ${rp(TARIF_LEPAS_KUNCI.keterlambatanPerJam)}가 부과됩니다.`,
        '늦어질 것 같으면 가능한 한 빨리 연락해 주세요. 차량은 이미 다음 손님이 예약한 경우가 많아, 미리 알려 주시면 일정을 조정할 수 있습니다.',
        '다른 예약이 없는 경우 연장이 가능하며, 해당 요금이 적용됩니다.',
      ],
    },
```

- [ ] **Step 8: Ganti isi pasal `pengemudi`**

Ganti seluruh `isi: { ... }` di objek `id: 'pengemudi'` dengan:

```ts
    isi: {
      id: [
        'Pada paket dengan sopir, kendaraan, pengemudi beserta uang makannya, dan bahan bakar sudah termasuk dalam tarif paket.',
        'Paket Full day mencakup pemakaian sampai 12 jam per hari sewa. Kelebihannya dikenakan tarif over time per jam sesuai unit, sebagaimana tercantum di halaman kendaraan.',
        'Untuk perjalanan menginap di luar kota, akomodasi dan makan pengemudi menjadi tanggungan penyewa, kecuali disepakati lain.',
        'Pengemudi berhak menolak permintaan yang melanggar hukum atau membahayakan keselamatan.',
      ],
      en: [
        'On packages with a driver, the vehicle, the driver and their meals, and fuel are included in the package rate.',
        'The Full day package covers up to 12 hours per rental day. Time beyond that is charged at the vehicle’s hourly overtime rate shown on its page.',
        'For overnight trips out of town, the driver’s accommodation and meals are the renter’s responsibility unless agreed otherwise.',
        'The driver may decline any request that is unlawful or unsafe.',
      ],
      zh: [
        '含司机套餐的价格已包含车辆、司机及其餐费与燃油。',
        '全天套餐每租期日最长 12 小时，超出部分按车辆页面所列的每小时超时费计费。',
        '外地过夜行程，除另有约定外，司机的住宿与餐费由承租人承担。',
        '司机有权拒绝任何违法或危及安全的要求。',
      ],
      ko: [
        '기사 포함 패키지 요금에는 차량, 기사 및 기사 식비, 연료가 포함됩니다.',
        '종일 패키지는 대여일당 최대 12시간이며, 초과 시간은 차량 페이지에 안내된 시간당 초과 요금이 부과됩니다.',
        '외지 숙박 일정의 경우, 별도 합의가 없는 한 기사의 숙박비와 식비는 대여자 부담입니다.',
        '기사는 위법하거나 안전을 위협하는 요청을 거절할 수 있습니다.',
      ],
    },
```

- [ ] **Step 9: Hapus pasal `tur`**

Hapus seluruh objek `{ id: 'tur', ... },`, termasuk komentar blok di atas `tarif-area` bila menyebut perantara perjalanan. Komentar itu juga diganti menjadi `/** Tarif area dan batas jarak, disusun dari lib/tarif-sewa.ts. */`.

- [ ] **Step 10: Ringkasan paket**

`lib/ringkasan-paket.ts`:

```ts
import type { Paket } from "./paket";
import type { Localized } from "./syarat-ketentuan";
import { TARIF_LEPAS_KUNCI, TARIF_PELAYANAN, rp } from "./tarif-sewa";

/**
 * Ringkasan "Termasuk / Tidak termasuk" di form booking — turunan pendek dari
 * Syarat & Ketentuan (lib/syarat-ketentuan.ts). Bila S&K berubah, ini ikut diubah.
 */
const KM = TARIF_PELAYANAN.batasKmPerHari;
const PARKIR = TARIF_PELAYANAN.batasParkirPerHari;
const TELAT = TARIF_LEPAS_KUNCI.keterlambatanPerJam;
const KM_LK = TARIF_LEPAS_KUNCI.batasKmPerHari;

export const RINGKASAN_PAKET: Record<Paket, { termasuk: Localized<string[]>; tidakTermasuk: Localized<string[]> }> = {
  full_day: {
    termasuk: {
      id: ["Kendaraan, sopir, dan uang makan sopir", `Bahan bakar sampai ${KM} km per hari sewa`, `Parkir sampai ${rp(PARKIR)} per hari sewa`, "Pemakaian sampai 12 jam per hari"],
      en: ["Vehicle, driver, and the driver's meals", `Fuel for up to ${KM} km per rental day`, `Parking up to ${rp(PARKIR, "koma")} per rental day`, "Use for up to 12 hours per day"],
      zh: ["车辆、司机及司机餐费", `每租期日 ${KM} 公里以内的燃油`, `每租期日最高 ${rp(PARKIR)} 的停车费`, "每天最长使用 12 小时"],
      ko: ["차량, 기사 및 기사 식비", `대여일당 ${KM}km까지의 연료`, `대여일당 ${rp(PARKIR)}까지의 주차료`, "하루 최대 12시간 이용"],
    },
    tidakTermasuk: {
      id: ["Biaya tol dan denda tilang", "Tiket masuk tempat wisata", "Over time di atas 12 jam (tarif per jam unit)", "Biaya Area di luar Kota Manado", "Akomodasi dan makan sopir saat menginap di luar kota"],
      en: ["Tolls and traffic fines", "Entrance tickets to tourist attractions", "Overtime beyond 12 hours (the vehicle's hourly rate)", "Area charges outside Manado city", "Driver's accommodation and meals on overnight trips out of town"],
      zh: ["通行费与交通罚款", "景点门票", "超过 12 小时的超时费（按车型每小时计）", "万鸦老市区以外的区域费", "外地过夜时司机的住宿与餐费"],
      ko: ["통행료 및 교통 범칙금", "관광지 입장료", "12시간 초과 시 초과 요금(차량별 시간당 요금)", "마나도 시외 지역 요금", "외지 숙박 시 기사 숙박비와 식비"],
    },
  },
  transfer: {
    termasuk: {
      id: ["Kendaraan dan sopir untuk satu kali perjalanan (antar atau jemput)", "Bahan bakar untuk perjalanan tersebut"],
      en: ["Vehicle and driver for one trip (drop-off or pick-up)", "Fuel for that trip"],
      zh: ["一趟行程（送或接）的车辆与司机", "该趟行程的燃油"],
      ko: ["1회 이동(샌딩 또는 픽업)의 차량과 기사", "해당 이동의 연료"],
    },
    tidakTermasuk: {
      id: ["Biaya tol dan denda tilang", "Tiket masuk tempat wisata", "Transfer ke luar Kota Manado — biayanya dikonfirmasi lebih dulu"],
      en: ["Tolls and traffic fines", "Entrance tickets to tourist attractions", "Transfers outside Manado city — the charge is confirmed first"],
      zh: ["通行费与交通罚款", "景点门票", "万鸦老市区以外的接送——费用需事先确认"],
      ko: ["통행료 및 교통 범칙금", "관광지 입장료", "마나도 시외 픽업/샌딩 — 요금은 사전에 확인"],
    },
  },
  self_drive: {
    termasuk: {
      id: ["1 (satu) unit kendaraan", `Pemakaian sampai 12 jam per hari, maksimum ${KM_LK} km`],
      en: ["1 (one) vehicle", `Use for up to 12 hours per day, maximum ${KM_LK} km`],
      zh: ["1 辆车", `每天最长使用 12 小时，最多 ${KM_LK} 公里`],
      ko: ["차량 1대", `하루 최대 12시간, 최대 ${KM_LK}km 이용`],
    },
    tidakTermasuk: {
      id: ["Bahan bakar", "Biaya tol, parkir, dan denda tilang", "Deposit — besarnya disampaikan saat konfirmasi pemesanan", "Antar-jemput di luar pool Welcome Manado (sesuai area)", `Keterlambatan pengembalian ${rp(TELAT)} per jam`, "Perbaikan atau penggantian atas kerusakan dan kehilangan selama masa sewa"],
      en: ["Fuel", "Tolls, parking, and traffic fines", "Deposit — the amount is given when your booking is confirmed", "Delivery outside the Welcome Manado pool (by area)", `Late return ${rp(TELAT, "koma")} per hour`, "Repair or replacement for damage and loss during the rental"],
      zh: ["燃油", "通行费、停车费与交通罚款", "押金——金额于确认订单时告知", "Welcome Manado 车场以外的送取车费（按区域）", `逾期还车每小时 ${rp(TELAT)}`, "租赁期间损坏或遗失的维修或赔偿"],
      ko: ["연료", "통행료, 주차료, 교통 범칙금", "보증금 — 금액은 예약 확정 시 안내", "Welcome Manado 차고지 외 배차 요금(지역별)", `반납 지연 시간당 ${rp(TELAT)}`, "대여 기간 중 손상·분실에 대한 수리 또는 배상"],
    },
  },
};
```

- [ ] **Step 11: Jalankan test, pastikan lolos**

Run: `npx vitest run lib/syarat-ketentuan.test.ts && npx tsc --noEmit`
Expected: PASS dan `tsc` tanpa error. Kalau `tsc` mengeluh soal kutip tunggal atau tipe `as const`, sesuaikan sumber yang disalin tanpa mengubah isinya.

- [ ] **Step 12: Halaman**

`components/SyaratKetentuanContent.tsx`:

```tsx
"use client";

import { MessageCircle } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { fill, formatTanggal } from "@/lib/i18n/format";
import { SYARAT_KETENTUAN, SYARAT_BERLAKU_SEJAK } from "@/lib/syarat-ketentuan";
import { waLink } from "@/lib/whatsapp";

/**
 * Dua kolom: isi di kiri, daftar isi yang ikut menggulir di kanan (di layar
 * besar ditampilkan di kiri lewat lg:order-first). Daftar isi ditaruh SESUDAH
 * isi di markup supaya pembaca layar sampai ke naskahnya lebih dulu.
 */
export default function SyaratKetentuanContent() {
  const { dict, locale } = useLang();
  const berlaku = formatTanggal(SYARAT_BERLAKU_SEJAK, locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="max-w-3xl space-y-2 border-b border-slate-200 pb-8 dark:border-slate-800">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">{dict.terms.title}</h1>
        <p className="text-slate-500 dark:text-slate-400">{dict.terms.subtitle}</p>
        <p className="text-sm text-slate-400">{fill(dict.terms.effectiveSince, { date: berlaku })}</p>
      </header>

      <div className="flex flex-col gap-10 pt-10 lg:flex-row lg:items-start lg:gap-14">
        <div className="min-w-0 flex-1 space-y-10">
          {SYARAT_KETENTUAN.map((bagian, i) => (
            <section key={bagian.id} id={bagian.id} className="scroll-mt-24">
              <h2 className="mb-4 flex gap-3 text-xl font-bold text-slate-900 dark:text-white">
                <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-50 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {i + 1}
                </span>
                <span className="pt-0.5">{bagian.judul[locale]}</span>
              </h2>
              <ul className="space-y-3 border-l border-slate-200 pl-6 dark:border-slate-800 sm:ml-4">
                {bagian.isi[locale].map((butir, j) => (
                  <li key={j} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{butir}</li>
                ))}
              </ul>
            </section>
          ))}

          <div className="rounded-[2rem] bg-slate-50 p-6 dark:bg-slate-800/60">
            <p className="font-bold text-slate-900 dark:text-white">{dict.terms.askTitle}</p>
            <a
              href={waLink(dict.terms.waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-red-700"
            >
              <MessageCircle className="h-4 w-4" /> {dict.terms.askWa}
            </a>
          </div>
        </div>

        <nav aria-label={dict.terms.toc} className="lg:sticky lg:top-24 lg:order-first lg:w-64 lg:shrink-0">
          <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.terms.toc}</p>
          <ol className="space-y-2 text-sm">
            {SYARAT_KETENTUAN.map((bagian, i) => (
              <li key={bagian.id}>
                <a href={`#${bagian.id}`} className="text-slate-600 transition hover:text-red-600 dark:text-slate-400">
                  {i + 1}. {bagian.judul[locale]}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
```

`app/syarat-ketentuan/page.tsx`:

```tsx
import type { Metadata } from "next";
import SyaratKetentuanContent from "@/components/SyaratKetentuanContent";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan Sewa",
  description:
    "Syarat dan ketentuan sewa kendaraan Welcome Manado Transport: paket Full day, Transfer, Lepas kunci, biaya area, pembatalan, dan tanggung jawab penyewa.",
  alternates: { canonical: "/syarat-ketentuan" },
};

export default function Page() {
  return <SyaratKetentuanContent />;
}
```

- [ ] **Step 13: Footer dan sitemap**

Di `components/Footer.tsx`, tambahkan ke array `menu` setelah entri `/tentang`:

```tsx
    { href: "/syarat-ketentuan", label: dict.footer.terms },
```

Di `app/sitemap.ts`, tambahkan `"/syarat-ketentuan"` ke array `staticPages` setelah `"/tentang"`.

- [ ] **Step 14: Cek visual**

`npm run dev`, lalu buka `/syarat-ketentuan`:
- 15 pasal bernomor (sumber 15, dikurangi "Paket wisata", ditambah "Paket dan tarif"), dengan pasal ke-3 "Paket dan tarif".
- Daftar isi menempel di kiri pada layar lebar.
- Klik daftar isi melompat ke pasalnya.
- Ganti ke EN, ZH, dan KO, lalu pastikan semua teks berganti.
- Tidak ada kata "Pesona".
- Footer memuat tautan "Syarat & Ketentuan".

- [ ] **Step 15: Commit**

```bash
git add lib/syarat-ketentuan.ts lib/ringkasan-paket.ts lib/syarat-ketentuan.test.ts \
  components/SyaratKetentuanContent.tsx app/syarat-ketentuan/page.tsx components/Footer.tsx app/sitemap.ts
git commit -m "feat(s&k): halaman Syarat & Ketentuan 4 bahasa dan ringkasan per paket

Diadaptasi dari pesonamanado-web dengan Welcome Manado sebagai operator.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 10: Form booking baru

**Files:**
- Modify (tulis ulang): `transport_wm/components/BookingForm.tsx`
- Modify: `transport_wm/lib/i18n/dictionaries.ts` (hapus kunci `booking` yang tidak dipakai lagi, di keempat bahasa)

**Interfaces:**
- Consumes:
  - `paketTersedia`, `Paket` (Task 6)
  - `hitungBooking`, `normalisasiJumlah`, `PilihanArea` (Task 6)
  - `buatPayloadBooking`, `buatPesanWa` (Task 6)
  - `NAMA_AREA`, `TARIF_LEPAS_KUNCI` (Task 6)
  - `fill` (Task 6)
  - `RINGKASAN_PAKET` (Task 9)
  - `dict.paket.*`, `dict.area.*`, `dict.booking.*` (Task 7)
- Produces:
  - elemen `id="form-booking"` (dipakai `StickyBookingBar`, Task 14)

- [ ] **Step 1: Tulis ulang komponen**

`components/BookingForm.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, CheckCircle2, Loader2, MessageCircle, X } from "lucide-react";
import { Car } from "@/lib/types";
import { formatRupiah, openWhatsApp, waLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { fill } from "@/lib/i18n/format";
import { type Paket, paketTersedia, adaHarga } from "@/lib/paket";
import { type PilihanArea, hitungBooking, normalisasiJumlah } from "@/lib/hitungBooking";
import { buatPayloadBooking, buatPesanWa } from "@/lib/booking";
import { NAMA_AREA, TARIF_LEPAS_KUNCI } from "@/lib/tarif-sewa";
import { RINGKASAN_PAKET } from "@/lib/ringkasan-paket";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
const AREA_DENGAN_SOPIR: PilihanArea[] = [1, 2, 3, 4];
const AREA_LEPAS_KUNCI: PilihanArea[] = ["pool", 1, 2, 3, 4];

export default function BookingForm({ car }: { car: Car }) {
  const { dict, locale } = useLang();
  const pilihan = paketTersedia(car);

  const [paket, setPaket] = useState<Paket>(pilihan[0] ?? "full_day");
  const [jumlah, setJumlah] = useState(1);
  const [area, setArea] = useState<PilihanArea>(pilihan[0] === "self_drive" ? "pool" : 1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const input = useMemo(() => ({ car, paket, jumlah, area }), [car, paket, jumlah, area]);
  const hasil = useMemo(() => hitungBooking(input), [input]);

  const namaPaket: Record<Paket, string> = {
    full_day: dict.paket.full_day,
    transfer: dict.paket.transfer,
    self_drive: dict.paket.self_drive,
  };
  const catatanPaket: Record<Paket, string> = {
    full_day: dict.paket.full_dayNote,
    transfer: dict.paket.transferNote,
    self_drive: dict.paket.self_driveNote,
  };

  function labelArea(a: PilihanArea): string {
    if (a === "pool") return dict.area.pool;
    if (a === 4) return dict.area.area4;
    return `${fill(dict.area.area, { n: a })} — ${NAMA_AREA[locale][a]}`;
  }

  function pilihPaket(p: Paket) {
    setPaket(p);
    if (p === "self_drive") setArea("pool");
    else if (area === "pool") setArea(1);
  }

  const inputClass =
    "mt-1.5 w-full rounded-2xl border-none bg-slate-50 px-4 py-3.5 font-bold text-slate-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-red-600/20 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-800";
  const labelClass =
    "block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";

  if (!hasil) {
    return (
      <div id="form-booking" className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
          <CalendarDays className="h-5 w-5 text-red-600" /> {dict.booking.title}
        </h3>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{dict.booking.unavailable}</p>
        <a
          href={waLink(`Halo Welcome Manado Transport, saya ingin menanyakan harga ${car.name}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-4 text-xs font-black uppercase tracking-widest text-white"
        >
          <MessageCircle className="h-5 w-5" /> {dict.paket.askPrice}
        </a>
      </div>
    );
  }

  const harian = paket !== "transfer";
  const satuan = harian ? dict.booking.days : dict.booking.trip;
  const pilihanArea = paket === "self_drive" ? AREA_LEPAS_KUNCI : AREA_DENGAN_SOPIR;
  const ringkasan = RINGKASAN_PAKET[paket];

  async function handleSubmit() {
    if (!hasil) return;
    setError("");
    if (!name.trim()) { setError(dict.booking.errName); return; }
    if (!phone.trim()) { setError(dict.booking.errPhone); return; }
    if (!startDate) { setError(dict.booking.errDate); return; }

    const pemesan = { nama: name, telepon: phone, tanggalMulai: startDate, catatan: note };
    const pesan = buatPesanWa(input, hasil, pemesan);

    setSending(true);
    let ok = false;
    try {
      const res = await fetch(`${API_BASE}/transportation-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(buatPayloadBooking(input, hasil, pemesan)),
      });
      ok = res.ok;
    } catch {
      // Booking gagal tersimpan bukan alasan kehilangan lead — tetap lanjut ke WhatsApp
    }
    setSending(false);

    if (ok) {
      setSaved(true);
      setTimeout(() => {
        openWhatsApp(pesan);
        setSaved(false);
      }, 1200);
    } else {
      openWhatsApp(pesan);
    }
  }

  return (
    <div id="form-booking" className="scroll-mt-24 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
        <CalendarDays className="h-5 w-5 text-red-600" /> {dict.booking.title}
      </h3>

      {/* Paket */}
      <p className={`${labelClass} mt-5`}>{dict.booking.package}</p>
      <div className={`mt-2 grid gap-2 ${pilihan.length === 3 ? "grid-cols-3" : pilihan.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {pilihan.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => pilihPaket(p)}
            aria-pressed={paket === p}
            className={`rounded-xl border px-2 py-2.5 text-[10px] font-black uppercase tracking-widest transition ${
              paket === p
                ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/20"
                : "border-slate-200 text-slate-600 hover:border-red-300 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            {namaPaket[p]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-400">{catatanPaket[paket]}</p>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>{harian ? dict.booking.qtyDay : dict.booking.qtyTrip}</span>
            <input
              type="number"
              min={1}
              max={365}
              value={jumlah}
              onChange={(e) => setJumlah(normalisasiJumlah(Number(e.target.value)))}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>{dict.booking.startDate}</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>{paket === "self_drive" ? dict.area.deliveryLabel : dict.area.label}</span>
          <select
            value={String(area)}
            onChange={(e) => setArea(e.target.value === "pool" ? "pool" : (Number(e.target.value) as PilihanArea))}
            className={inputClass}
          >
            {pilihanArea.map((a) => (
              <option key={String(a)} value={String(a)}>{labelArea(a)}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>{dict.booking.name}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={dict.booking.namePlaceholder} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>{dict.booking.phone}</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={dict.booking.phonePlaceholder} inputMode="tel" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>{dict.booking.note}</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={dict.booking.notePlaceholder} rows={2} className={inputClass} />
        </label>
      </div>

      {/* Rincian */}
      <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-5 text-sm dark:bg-slate-800/60">
        <div className="flex justify-between gap-3 font-medium text-slate-500 dark:text-slate-400">
          <span>{dict.booking.rental} {formatRupiah(hasil.tarif)} × {hasil.jumlah} {satuan}</span>
          <span className="shrink-0">{formatRupiah(hasil.sewa)}</span>
        </div>
        {hasil.jenisTambahan !== null && !hasil.dikonfirmasi && area !== "pool" && (
          <div className="flex justify-between gap-3 font-medium text-slate-500 dark:text-slate-400">
            <span>
              {hasil.jenisTambahan === "area"
                ? `${fill(dict.area.areaFee, { n: area })} ${formatRupiah(hasil.tarifTambahan)} × ${hasil.jumlah}`
                : fill(dict.area.delivery, { n: area })}
            </span>
            <span className="shrink-0">{formatRupiah(hasil.biayaTambahan)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-black text-slate-900 dark:border-slate-700 dark:text-white">
          <span>{dict.booking.estTotal}</span>
          <span className="text-red-600">{formatRupiah(hasil.total)}</span>
        </div>
        {hasil.dikonfirmasi && (
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
            {paket === "transfer" ? dict.area.transferNote : dict.booking.plusConfirmed}
          </p>
        )}
        {paket === "full_day" && adaHarga(car.price_overtime) && (
          <p className="text-[11px] text-slate-400">
            {dict.paket.overtime}: {formatRupiah(car.price_overtime)}{dict.paket.overtimeNote}
          </p>
        )}
        {paket === "self_drive" && (
          <p className="text-[11px] text-slate-400">
            {dict.paket.lateReturn}: {formatRupiah(TARIF_LEPAS_KUNCI.keterlambatanPerJam)}{dict.paket.lateReturnNote}
          </p>
        )}
        <p className="pt-1 text-[11px] text-slate-400">{dict.booking.finalPrice}</p>
      </div>

      {/* Termasuk / tidak termasuk */}
      <div key={paket} className="mt-5 grid animate-fade-in-up gap-4 text-xs sm:grid-cols-2 lg:grid-cols-1">
        <div>
          <p className={labelClass}>{dict.booking.included}</p>
          <ul className="mt-2 space-y-1.5">
            {ringkasan.termasuk[locale].map((t) => (
              <li key={t} className="flex gap-2 text-slate-600 dark:text-slate-300">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className={labelClass}>{dict.booking.excluded}</p>
          <ul className="mt-2 space-y-1.5">
            {ringkasan.tidakTermasuk[locale].map((t) => (
              <li key={t} className="flex gap-2 text-slate-500 dark:text-slate-400">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
      )}
      {saved && (
        <p className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {dict.booking.success}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={sending}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-green-600/20 transition hover:-translate-y-0.5 hover:opacity-90 active:scale-95 disabled:opacity-60"
      >
        {sending ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> {dict.booking.processing}</>
        ) : (
          <><MessageCircle className="h-5 w-5" /> {dict.booking.submit}</>
        )}
      </button>
      <p className="mt-3 text-center text-[11px] text-slate-400">
        {dict.booking.agreePrefix}{" "}
        <Link href="/syarat-ketentuan" className="font-bold text-slate-600 underline underline-offset-2 hover:text-red-600 dark:text-slate-300">
          {dict.booking.termsLink}
        </Link>
        .
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Hapus kunci kamus yang tidak terpakai**

Di **keempat** objek bahasa (`id`, `en`, `zh`, `ko`), hapus kunci berikut dari `booking`: `weeks`, `months`, `modeDay`, `modeWeek`, `modeMonth`, `qtyWeek`, `qtyMonth`, `driverSelected`, `addDriver`, `discount`.

Lalu pastikan tidak ada lagi pemakainya:

```bash
grep -rn "modeWeek\|modeMonth\|qtyWeek\|qtyMonth\|driverSelected\|addDriver\|booking.discount\|booking.weeks\|booking.months\|booking.modeDay" app components lib
```

Expected: tidak ada keluaran.

- [ ] **Step 3: Cek tipe dan test**

Run: `npx tsc --noEmit && npm test`
Expected: tanpa error, semua PASS.

- [ ] **Step 4: Cek visual dan booking uji ke API lokal**

Gunakan API lokal dan dev server (*Lingkungan uji lokal*).
- `/mobil/toyota-avanza`, Full day, 3 hari, Area 2: rincian Sewa Rp 2.100.000, Biaya Area 2 Rp 150.000 × 3 = Rp 450.000, total **Rp 2.550.000**.
- Ganti ke Lepas kunci: pilihan area berubah menjadi "Ambil & kembalikan di pool (gratis)", total Rp 1.200.000 (3 × 400.000). Ringkasan Termasuk/Tidak termasuk berganti. "Telat kembali (lepas kunci): Rp 100.000/jam" tampil.
- Transfer, Area 3: total Rp 300.000 dan catatan kuning "Transfer ke luar Kota Manado …".
- Isi nama, nomor, dan tanggal, lalu tekan Booking. Tab WhatsApp terbuka dengan pesan berisi paket, area, rincian, dan "Menyetujui Syarat & Ketentuan versi 1 Oktober 2026".
- Cek booking tersimpan: `curl -s -H "Authorization: Bearer $WM_TOKEN_LOKAL" http://127.0.0.1:8123/api/transportation-bookings | python3 -I -m json.tool | grep -E '"package"|"area"|"total_price"' | head`. Expected: `"package": "transfer"`, `"area": 3`, `"total_price": 300000`.
- `/mobil/white-marlin`: kotak booking hanya berisi teks "belum tercantum" dan tombol "Tanya harga". Tidak crash.
- Lebar 375 px: tombol paket tidak terpotong.

- [ ] **Step 5: Commit**

```bash
git add components/BookingForm.tsx lib/i18n/dictionaries.ts
git commit -m "feat(booking): form paket Full day/Transfer/Lepas kunci dengan Biaya Area dan ringkasan S&K

Diskon mingguan/bulanan dan pilihan sopir terpisah dihapus.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 11: Penyelarasan teks dan uji regresi janji diskon

**Files:**
- Modify: `transport_wm/app/promo/page.tsx`
- Modify: `transport_wm/app/rental-mobil-manado/page.tsx`
- Modify: `transport_wm/app/sewa-mobil-lepas-kunci-manado/page.tsx`
- Modify: `transport_wm/app/tentang/page.tsx`
- Modify: `transport_wm/app/opengraph-image.tsx`
- Modify: `transport_wm/lib/site.ts`
- Modify: `transport_wm/lib/posts/harga-sewa-mobil-manado-2026.ts`
- Modify: `transport_wm/lib/posts/sewa-mobil-bandara-sam-ratulangi.ts`
- Modify: `transport_wm/lib/i18n/dictionaries.ts` (`faq.items` indeks 2–4 di keempat bahasa)
- Test: `transport_wm/lib/teks-situs.test.ts`

**Interfaces:**
- Consumes: tidak ada antarmuka kode baru. Angka harga diambil dari tabel spec §3.

- [ ] **Step 1: Tulis test yang gagal**

`lib/teks-situs.test.ts`:

```ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const AKAR = fileURLToPath(new URL("..", import.meta.url));

function berkas(dir: string): string[] {
  return readdirSync(dir).flatMap((nama) => {
    const p = join(dir, nama);
    if (statSync(p).isDirectory()) return berkas(p);
    return /\.(ts|tsx)$/.test(nama) && !/\.test\.ts$/.test(nama) ? [p] : [];
  });
}

const SEMUA = ["app", "components", "lib"].flatMap((d) => berkas(join(AKAR, d)));

/**
 * Situs pernah menjanjikan diskon 10% mingguan / 20% bulanan dan memuat
 * tabel harga hasil estimasi. Janji itu tidak berlaku sejak daftar harga
 * 1 Okt 2026 — teks yang mengulanginya adalah janji palsu kepada pelanggan.
 */
describe("teks situs", () => {
  it.each([
    ["janji diskon 10%/20%", /\b(10|20)\s*%/],
    ["diskon otomatis", /diskon otomatis|otomatis diskon|automatic discount/i],
    ["nama operator lain", /Pesona Manado/],
  ])("tidak ada %s", (_, pola) => {
    const temuan = SEMUA.filter((p) => pola.test(readFileSync(p, "utf8"))).map((p) => p.replace(AKAR, ""));
    expect(temuan).toEqual([]);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run lib/teks-situs.test.ts`
Expected: FAIL. Daftar berkas yang tertangkap mencakup `app/promo/page.tsx`, `app/rental-mobil-manado/page.tsx`, `lib/posts/…`, dan `lib/i18n/dictionaries.ts`.

- [ ] **Step 3: Halaman promo**

Di `app/promo/page.tsx`, ganti `metadata` dan `promos` dengan:

```tsx
export const metadata: Metadata = {
  title: "Promo & Penawaran Rental Mobil Manado",
  description:
    "Penawaran rental mobil Manado: harga khusus sewa mingguan & bulanan, transfer Bandara Sam Ratulangi, dan paket wisata dari Welcome Manado Transport.",
};

const promos = [
  {
    title: "Sewa Mingguan & Bulanan",
    desc: "Butuh mobil untuk seminggu atau sebulan? Tanyakan harga khusus via WhatsApp sesuai unit, durasi, dan tujuan Anda.",
    tag: "JANGKA PANJANG",
  },
  {
    title: "Transfer Bandara Sam Ratulangi",
    desc: "Antar atau jemput bandara dengan sopir, dihitung per trip. Harga tiap unit tercantum di halaman mobilnya.",
    tag: "TRANSFER",
  },
  {
    title: "Paket Wisata Tomohon & Bunaken",
    desc: "Mobil + sopir berpengalaman untuk liburan keluarga dengan paket Full day sampai 12 jam.",
    tag: "WISATA",
  },
];
```

Ubah judul `<h1>` menjadi `Promo &amp; Penawaran`, lalu teks tombol `Klaim Promo` menjadi `Tanya Penawaran`.

- [ ] **Step 4: Landing rental mobil**

Di `app/rental-mobil-manado/page.tsx`:
- `metadata.description`: `"Rental mobil Manado murah & terpercaya. Full day dengan sopir, transfer bandara, atau lepas kunci — Avanza, Xpander, Innova, Fortuner, Alphard, Hiace, Bus. Pesan cepat via WhatsApp."`
- `openGraph.description`: `"Sewa mobil di Manado: Full day dengan sopir, transfer, atau lepas kunci. Pesan cepat via WhatsApp."`
- Di `intro`, ganti kalimat `Sewa harian, mingguan, atau bulanan — bisa lepas kunci maupun dengan sopir berpengalaman.` dengan `Pilih paket Full day dengan sopir (maks. 12 jam), Transfer sekali jalan, atau Lepas kunci untuk unit tertentu.`
- Di `highlights`, ganti `"Diskon sewa mingguan & bulanan"` dengan `"Full day, Transfer, atau Lepas kunci"`.
- Ganti section ketiga menjadi:

```tsx
        {
          heading: "Pilihan paket: Full day, Transfer, Lepas kunci",
          body: "Full day adalah sewa dengan sopir sampai 12 jam per hari, sudah termasuk BBM sampai 120 km dan uang makan sopir. Transfer adalah sekali jalan dengan sopir, cocok untuk antar-jemput Bandara Sam Ratulangi. Lepas kunci tersedia untuk Avanza, Xpander, dan Innova Reborn. Untuk sewa mingguan atau bulanan, hubungi kami via WhatsApp untuk penawaran khusus.",
        },
```

- [ ] **Step 5: Landing lepas kunci, Tentang, OG, dan deskripsi situs**

- `app/sewa-mobil-lepas-kunci-manado/page.tsx`:
  - Di `highlights`, ganti `"Harga harian/mingguan/bulanan"` dengan `"Maks. 12 jam & 120 km per hari"`.
  - Ganti section kedua (`"Syarat sewa lepas kunci"`) bagian `body` dengan: `"Penyewa minimal 21 tahun dengan SIM A yang masih berlaku. Selama masa sewa kami menahan KTP dan Kartu Keluarga asli serta mengenakan deposit yang besarnya disampaikan saat konfirmasi. Bahan bakar, tol, dan parkir tanggungan penyewa; keterlambatan pengembalian dikenakan Rp 100.000 per jam. Selengkapnya di halaman Syarat & Ketentuan."`
- `app/tentang/page.tsx`: ganti `harian, mingguan, bulanan, maupun per trip` dengan `Full day dengan sopir, transfer, maupun lepas kunci`.
- `app/opengraph-image.tsx`: ganti `Sewa harian · mingguan · bulanan · per trip · dengan sopir` dengan `Full day dengan sopir · Transfer · Lepas kunci`.
- `lib/site.ts`: di `description`, ganti `Sewa mobil harian, mingguan, bulanan, atau per trip, lepas kunci maupun dengan sopir.` dengan `Paket Full day dengan sopir, transfer bandara, atau lepas kunci.`

- [ ] **Step 6: Artikel harga 2026**

Di `lib/posts/harga-sewa-mobil-manado-2026.ts`:
- Tambahkan `updated: "2026-10-14",` setelah `date: "2026-05-28",`. Kalau tipe `BlogPost` belum punya `updated`, cek `lib/blog.ts`: sitemap sudah membaca `post.updated`, jadi kuncinya ada.
- Ganti `title` menjadi `"Harga Sewa Mobil di Manado 2026 (Daftar Resmi per Unit)"` dan `metaTitle` menjadi `"Harga Sewa Mobil Manado 2026 — Daftar Tarif per Unit"`.
- Ganti callout pertama menjadi: `"Harga di bawah adalah **daftar harga resmi Welcome Manado Transport yang berlaku sejak 1 Oktober 2026**. Full day dihitung maksimal 12 jam dengan sopir; kelebihannya dikenakan over time per jam. Harga dapat berubah — konfirmasi final selalu via WhatsApp."`
- Ganti blok `type: "table"` menjadi:

```ts
    {
      type: "table",
      caption: "Daftar harga resmi, berlaku sejak 1 Oktober 2026 (Rupiah). — berarti unit tidak disewakan lepas kunci.",
      headers: ["Unit", "Full day (12 jam, dengan sopir)", "Transfer sekali jalan", "Lepas kunci / hari", "Over time / jam"],
      rows: [
        ["Toyota Avanza", "Rp 700.000", "Rp 300.000", "Rp 400.000", "Rp 50.000"],
        ["Mitsubishi Xpander", "Rp 850.000", "Rp 350.000", "Rp 500.000", "Rp 50.000"],
        ["Toyota Innova Reborn (2019–2022)", "Rp 1.000.000", "Rp 400.000", "Rp 600.000", "Rp 50.000"],
        ["Toyota Innova Zenix G (2023)", "Rp 1.250.000", "Rp 500.000", "—", "Rp 50.000"],
        ["Toyota Innova Zenix Q Captain Seat (2023)", "Rp 1.750.000", "Rp 700.000", "—", "Rp 75.000"],
        ["Toyota Hiace Commuter 14 pax", "Rp 1.500.000", "Rp 700.000", "—", "Rp 100.000"],
        ["Toyota Hiace Premio 14 pax (2023)", "Rp 2.000.000", "Rp 800.000", "—", "Rp 100.000"],
        ["Bus 30 Seat", "Rp 2.300.000", "Rp 1.200.000", "—", "Rp 100.000"],
        ["Toyota Fortuner (2020–2023)", "Rp 2.500.000", "Rp 1.000.000", "—", "Rp 150.000"],
        ["Toyota Alphard (2019–2022)", "Rp 3.500.000", "Rp 1.500.000", "—", "Rp 250.000"],
        ["Toyota Alphard (2022–2026)", "Rp 4.000.000", "Rp 2.500.000", "—", "Rp 300.000"],
      ],
    },
```

- Di daftar "Faktor yang memengaruhi harga", ganti butir `**Durasi sewa** — …` dengan `"**Paket** — Full day dengan sopir, transfer sekali jalan, atau lepas kunci (unit tertentu)."` Ganti juga butir `**Jarak & tujuan** — …` dengan `"**Area tujuan** — di luar Kota Manado ada Biaya Area per hari: Rp 150.000–350.000 tergantung area dan isi silinder mobil."`
- Ganti daftar "Yang biasanya termasuk" (`type: "ul"`) dengan:

```ts
      items: [
        "**Full day termasuk:** kendaraan, sopir dan uang makannya, BBM sampai 120 km per hari, parkir sampai Rp 50.000 per hari.",
        "**Belum termasuk:** tol, tiket masuk tempat wisata, over time di atas 12 jam, dan Biaya Area di luar Kota Manado.",
        "**Lepas kunci:** BBM, tol, dan parkir tanggungan penyewa; ada deposit; keterlambatan Rp 100.000 per jam.",
      ],
```

- Ganti daftar simulasi (`type: "ol"`) dengan:

```ts
      items: [
        "**Liburan keluarga akhir pekan** — Toyota Avanza lepas kunci, 2 hari, ambil di pool: 2 × Rp 400.000 = **Rp 800.000**.",
        "**Wisata ke Tomohon** — Toyota Avanza Full day dengan sopir, 3 hari, Area 2: 3 × Rp 700.000 + 3 × Rp 150.000 = **Rp 2.550.000**.",
        "**Rombongan VIP** — Toyota Alphard (2019–2022) Full day, 2 hari, Area 3: 2 × Rp 3.500.000 + 2 × Rp 350.000 = **Rp 7.700.000**.",
      ],
```

- Ganti callout kalkulator menjadi: `"💡 Butuh hitungan pasti? Form booking di halaman tiap mobil menghitung otomatis harga paket, jumlah hari, dan Biaya Area sesuai tujuan Anda."`
- Di daftar tips, ganti butir pertama `**Sewa lebih lama** — …` dengan `"**Sewa mingguan atau bulanan?** Tanyakan harga khusus via WhatsApp."`

- [ ] **Step 7: Artikel bandara**

Di `lib/posts/sewa-mobil-bandara-sam-ratulangi.ts`:
- Ganti `caption` tabel dengan `"Harga Full day dengan sopir (maks. 12 jam), berlaku sejak 1 Oktober 2026. Transfer sekali jalan bandara dihitung per trip."`
- Ganti `headers` dengan `["Tipe mobil", "Contoh unit", "Full day mulai dari"]`.
- Ganti `rows` dengan:

```ts
      rows: [
        ["MPV keluarga", "Avanza, Xpander", "Rp 700.000"],
        ["MPV premium", "Innova Reborn, Innova Zenix", "Rp 1.000.000"],
        ["SUV", "Fortuner", "Rp 2.500.000"],
        ["Minibus rombongan", "Hiace Commuter / Premio", "Rp 1.500.000"],
        ["Bus", "Bus 30 Seat", "Rp 2.300.000"],
        ["Mewah / VIP", "Alphard", "Rp 3.500.000"],
      ],
```

- Ganti callout `💡 **Tip hemat:** …` dengan `"💡 **Tip:** baru mendarat dan langsung ke hotel? Pilih paket **Transfer sekali jalan** — mulai Rp 300.000 (Avanza). Untuk sewa mingguan atau bulanan, tanyakan harga khusus via WhatsApp."`

- [ ] **Step 8: FAQ 4 bahasa**

Di `lib/i18n/dictionaries.ts`, ganti tiga item FAQ (q/a) yang diawali pertanyaan berikut, di keempat bahasa.

**id:** item `"Apakah bisa sewa mobil dengan sopir?"`, `"Apa bedanya sewa per hari dan per trip?"`, `"Apakah ada diskon untuk sewa jangka panjang?"` →

```ts
      {
        q: "Apakah bisa sewa mobil dengan sopir?",
        a: "Bisa. Semua unit tersedia dengan sopir lewat paket Full day (maks. 12 jam, termasuk BBM sampai 120 km dan uang makan sopir) atau Transfer sekali jalan. Harganya tercantum di halaman setiap mobil.",
      },
      {
        q: "Apa bedanya Full day, Transfer, dan Lepas kunci?",
        a: "Full day adalah sewa dengan sopir maksimal 12 jam per hari; lewat dari itu dikenakan over time per jam. Transfer adalah sekali jalan dengan sopir, misalnya antar ke atau jemput dari Bandara Sam Ratulangi. Lepas kunci berarti Anda menyetir sendiri, tersedia untuk unit tertentu, maksimal 12 jam per hari.",
      },
      {
        q: "Apakah ada harga khusus untuk sewa mingguan atau bulanan?",
        a: "Untuk sewa mingguan atau bulanan, hubungi kami via WhatsApp. Kami akan menyampaikan penawaran sesuai unit, durasi, dan tujuan Anda.",
      },
```

**en:** item `"Can I rent a car with a driver?"`, `"What is the difference between daily and per-trip rental?"`, `"Are there discounts for long-term rentals?"` →

```ts
      {
        q: "Can I rent a car with a driver?",
        a: "Yes. Every vehicle is available with a driver through the Full day package (up to 12 hours, including fuel for up to 120 km and the driver's meals) or a one-way Transfer. Rates are shown on each car's page.",
      },
      {
        q: "What is the difference between Full day, Transfer, and Self-drive?",
        a: "Full day is a rental with a driver for up to 12 hours per day; beyond that, hourly overtime applies. Transfer is a one-way trip with a driver, such as a drop-off at or pick-up from Sam Ratulangi Airport. Self-drive means you drive yourself; it is available on selected vehicles, up to 12 hours per day.",
      },
      {
        q: "Do you offer special rates for weekly or monthly rentals?",
        a: "For weekly or monthly rentals, contact us on WhatsApp. We will send an offer based on the vehicle, duration, and destination.",
      },
```

**zh:** item `"可以租带司机的车吗？"`, `"按天租和按趟租有什么区别？"`, `"长期租赁有折扣吗？"` →

```ts
      {
        q: "可以租带司机的车吗？",
        a: "可以。所有车辆均可通过全天套餐（最长 12 小时，含 120 公里以内燃油及司机餐费）或单程接送配司机。价格见各车辆页面。",
      },
      {
        q: "全天、单程接送和自驾有什么区别？",
        a: "全天为含司机租车，每天最长 12 小时，超出部分按小时收取超时费。单程接送为含司机的单程行程，例如送往或接自萨姆·拉图兰吉机场。自驾即由您自行驾驶，仅限部分车型，每天最长 12 小时。",
      },
      {
        q: "周租或月租有特别价格吗？",
        a: "周租或月租请通过 WhatsApp 联系我们，我们会根据车型、租期和目的地为您报价。",
      },
```

**ko:** item `"기사 포함 렌트도 가능한가요?"`, `"일일 렌트와 회당 렌트의 차이는 무엇인가요?"`, `"장기 렌트 할인이 있나요?"` →

```ts
      {
        q: "기사 포함 렌트도 가능한가요?",
        a: "가능합니다. 모든 차량을 종일 패키지(최대 12시간, 120km까지 연료 및 기사 식비 포함) 또는 편도 픽업/샌딩으로 기사와 함께 이용하실 수 있습니다. 요금은 차량별 페이지에 안내되어 있습니다.",
      },
      {
        q: "종일, 편도 픽업/샌딩, 자차 운전은 어떻게 다른가요?",
        a: "종일은 하루 최대 12시간 기사 포함 대여이며, 초과 시 시간당 초과 요금이 부과됩니다. 편도 픽업/샌딩은 삼 라툴랑이 공항 샌딩·픽업처럼 기사가 운전하는 편도 이동입니다. 자차 운전은 직접 운전하시는 방식으로 일부 차량에 한해 하루 최대 12시간 이용하실 수 있습니다.",
      },
      {
        q: "주간·월간 렌트 특별 요금이 있나요?",
        a: "주간 또는 월간 렌트는 WhatsApp으로 문의해 주세요. 차량, 기간, 목적지에 맞춰 견적을 보내 드립니다.",
      },
```

- [ ] **Step 9: Jalankan semua test**

Run: `npm test && npx tsc --noEmit`
Expected: PASS. Kalau `teks-situs` masih menemukan berkas, buka berkas itu, sunting kalimatnya sesuai keputusan "tanpa diskon otomatis", lalu ulangi.

- [ ] **Step 10: Commit**

```bash
git add app/promo/page.tsx app/rental-mobil-manado/page.tsx app/sewa-mobil-lepas-kunci-manado/page.tsx \
  app/tentang/page.tsx app/opengraph-image.tsx lib/site.ts lib/posts/harga-sewa-mobil-manado-2026.ts \
  lib/posts/sewa-mobil-bandara-sam-ratulangi.ts lib/i18n/dictionaries.ts lib/teks-situs.test.ts
git commit -m "fix(teks): hapus janji diskon mingguan/bulanan, perbarui tabel harga resmi

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 12: Primitif motion

**Files:**
- Modify: `transport_wm/tailwind.config.ts` (keyframes dan animation)
- Modify: `transport_wm/app/globals.css`
- Modify: `transport_wm/components/ScrollReveal.tsx` (prop `variant`)
- Create: `transport_wm/components/AnimatedNumber.tsx`
- Create: `transport_wm/app/template.tsx`

**Interfaces:**
- Produces (dipakai Task 13–14):
  - kelas Tailwind `animate-mask-up`, `animate-marquee`, `animate-progress`, `animate-gradient-shift`, `animate-page-in`, `animate-pop`
  - kelas CSS `kilau` + `kilau-loop` / `kilau-hover`. Elemennya wajib `relative overflow-hidden` atau `absolute … overflow-hidden`.
  - `marquee-viewport` / `marquee-track`
  - `floating-chat`, yang digeser saat `html[data-sticky-booking]`
  - `<ScrollReveal variant="up"|"scale"|"left"|"right">`
  - `<AnimatedNumber value format durationMs? className? />`

- [ ] **Step 1: Keyframes Tailwind**

Di `tailwind.config.ts`, tambahkan ke `keyframes`:

```ts
        maskUp: {
          "0%": { transform: "translateY(105%)" },
          "100%": { transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        progress: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        // Berakhir di transform: none — wrapper halaman yang masih ber-transform
        // akan menjadi containing block bagi elemen `fixed` di dalamnya (bar booking).
        pageIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
```

Tambahkan juga ke `animation`:

```ts
        "mask-up": "maskUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
        marquee: "marquee 45s linear infinite",
        progress: "progress 6s linear forwards",
        "gradient-shift": "gradientShift 12s ease-in-out infinite",
        "page-in": "pageIn 0.35s ease-out both",
        pop: "pop 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
```

- [ ] **Step 2: CSS**

Tambahkan di akhir `app/globals.css`:

```css
/* ── Kilau: lapisan terang yang menyapu tombol/foto ──
   Elemen ber-kelas `kilau` wajib sudah positioned + overflow-hidden lewat
   Tailwind (relative/absolute overflow-hidden); kelas ini sengaja tidak
   mengatur `position` agar tidak bentrok dengan utilitas Tailwind. */
@keyframes kilau {
  0%,
  70% {
    transform: translateX(-120%) skewX(-20deg);
  }
  100% {
    transform: translateX(260%) skewX(-20deg);
  }
}
.kilau::after {
  content: "";
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 40%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  transform: translateX(-120%) skewX(-20deg);
}
.kilau-loop::after {
  animation: kilau 4s ease-in-out infinite;
}
.group:hover .kilau-hover::after {
  transition: transform 0.9s ease;
  transform: translateX(260%) skewX(-20deg);
}

/* ── Variasi ScrollReveal ── */
.reveal-scale {
  transform: scale(0.96);
}
.reveal-left {
  transform: translateX(-24px);
}
.reveal-right {
  transform: translateX(24px);
}

/* ── Bar booking menempel (HP/tablet): geser tombol chat agar tidak bertumpuk ── */
html[data-sticky-booking] .floating-chat {
  bottom: 6.5rem;
}
@media (min-width: 1024px) {
  html[data-sticky-booking] .floating-chat {
    bottom: 1.5rem;
  }
}

/* Gerak minimal: marquee berhenti dan bisa digulir manual; kilau tidak berjalan. */
@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none !important;
  }
  .marquee-viewport {
    overflow-x: auto;
  }
  .kilau::after {
    display: none;
  }
}
```

- [ ] **Step 3: ScrollReveal dengan varian**

Di `components/ScrollReveal.tsx`, tambahkan ke `Props`:

```tsx
  /** Arah kemunculan; default naik dari bawah. */
  variant?: "up" | "scale" | "left" | "right";
```

Tambahkan `variant = "up",` ke destrukturisasi parameter. Lalu ganti `className={`reveal ${shown ? "is-visible" : ""} ${className}`}` dengan:

```tsx
      className={`reveal ${variant !== "up" ? `reveal-${variant}` : ""} ${shown ? "is-visible" : ""} ${className}`}
```

- [ ] **Step 4: AnimatedNumber**

`components/AnimatedNumber.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Angka yang bergulir halus ke nilai barunya (mis. total booking saat paket
 * atau jumlah hari diganti). Render pertama = nilai asli, jadi SSR dan
 * pengguna reduce-motion selalu melihat angka yang benar tanpa animasi.
 */
export default function AnimatedNumber({
  value,
  format,
  durationMs = 450,
  className,
}: {
  value: number;
  format: (n: number) => string;
  durationMs?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const sekarang = useRef(value);

  useEffect(() => {
    const awal = sekarang.current;
    if (awal === value) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      sekarang.current = value;
      setShown(value);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / durationMs, 1);
      const v = Math.round(awal + (value - awal) * (1 - Math.pow(1 - p, 3)));
      sekarang.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span className={className}>{format(shown)}</span>;
}
```

- [ ] **Step 5: Transisi halaman**

`app/template.tsx`:

```tsx
/** Fade/slide singkat setiap pindah halaman (template dirender ulang per navigasi). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
```

- [ ] **Step 6: Cek tipe, test, build**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: semuanya sukses. `npm run build` butuh API. Jalankan dengan `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8123/api npm run build` saat API lokal hidup.

- [ ] **Step 7: Cek visual**

`npm run dev`:
- Pindah antar halaman (Beranda → Katalog → Detail) memperlihatkan fade singkat.
- Di DevTools → Rendering, aktifkan "prefers-reduced-motion: reduce", lalu pindah halaman lagi. Halaman langsung tampil.

- [ ] **Step 8: Commit**

```bash
git add tailwind.config.ts app/globals.css components/ScrollReveal.tsx components/AnimatedNumber.tsx app/template.tsx
git commit -m "feat(motion): primitif animasi — kilau, marquee, progres, transisi halaman, angka bergulir

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 13: Motion beranda dan kartu mobil

**Files:**
- Create: `transport_wm/components/FleetMarquee.tsx`
- Modify: `transport_wm/components/HomeContent.tsx`
- Modify: `transport_wm/components/CarCard.tsx`

**Interfaces:**
- Consumes:
  - `hargaMulai`, `adaHarga` (Task 6)
  - `fill` (Task 6)
  - `dict.paket.priceChip`, `dict.home.marqueeLabel`, `dict.home.heroSlide` (Task 7)
  - kelas motion (Task 12)

- [ ] **Step 1: FleetMarquee**

`components/FleetMarquee.tsx`:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Car } from "@/lib/types";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { adaHarga } from "@/lib/paket";
import { formatRupiah } from "@/lib/whatsapp";

/**
 * Strip armada yang bergulir pelan di bawah hero. Daftar digandakan agar
 * putarannya mulus (translateX -50%); salinan kedua disembunyikan dari pembaca
 * layar dan dari Tab. Berhenti saat disentuh/di-hover/difokus.
 */
export default function FleetMarquee({ cars }: { cars: Car[] }) {
  const { dict } = useLang();
  const list = cars.filter((c) => c.images.length > 0);
  if (list.length < 3) return null;
  const putaran = [...list, ...list];

  return (
    <section aria-label={dict.home.marqueeLabel} className="border-b border-slate-100 bg-white py-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="marquee-viewport group overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="marquee-track flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
          {putaran.map((c, i) => {
            const salinan = i >= list.length;
            return (
              <li key={`${c.id}-${i}`} aria-hidden={salinan || undefined}>
                <Link
                  href={`/mobil/${c.slug}`}
                  tabIndex={salinan ? -1 : undefined}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 py-2 pl-2 pr-5 transition hover:border-red-200 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <span className="relative h-12 w-20 overflow-hidden rounded-xl bg-white">
                    <Image src={c.images[0]} alt="" fill sizes="80px" className="object-contain" />
                  </span>
                  <span>
                    <span className="block whitespace-nowrap text-sm font-black text-slate-900 dark:text-white">{c.name}</span>
                    <span className="block text-xs font-bold text-red-600">
                      {adaHarga(c.price_rent) ? `${formatRupiah(c.price_rent)}${dict.paket.perDay}` : dict.paket.askPrice}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: HomeContent — impor dan carousel**

Ubah import di `components/HomeContent.tsx`:
- tambahkan `Tag` ke import `lucide-react`;
- tambahkan:

```tsx
import FleetMarquee from "./FleetMarquee";
import { fill } from "@/lib/i18n/format";
import { hargaMulai } from "@/lib/paket";
import { formatRupiah } from "@/lib/whatsapp";
```

`waLink` sudah diimpor dari `@/lib/whatsapp`, jadi gabungkan menjadi `import { formatRupiah, waLink } from "@/lib/whatsapp";`.

Ganti `useEffect` carousel (yang memakai `setInterval`) dengan:

```tsx
  // setTimeout per slide (bukan setInterval) agar klik indikator memulai
  // hitungan ulang. Pengguna reduce-motion: tidak berganti sendiri.
  useEffect(() => {
    if (heroImages.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setHeroIdx((i) => (i + 1) % heroImages.length), HERO_INTERVAL);
    return () => clearTimeout(t);
  }, [heroIdx, heroImages.length]);

  const mulai = hargaMulai(cars);
```

- [ ] **Step 3: HomeContent — judul, chip harga, indikator**

Ganti seluruh elemen `<h1 ...>{dict.hero.title1}<br /><span ...>{dict.hero.title2}</span></h1>` dengan:

```tsx
          <h1 className="mx-auto mt-8 max-w-5xl text-5xl font-black leading-[0.95] tracking-tighter text-white sm:text-7xl lg:text-8xl">
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="block animate-mask-up" style={{ animationDelay: "120ms" }}>
                {dict.hero.title1}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span
                className="block animate-mask-up bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent"
                style={{ animationDelay: "260ms" }}
              >
                {dict.hero.title2}
              </span>
            </span>
          </h1>
```

Tepat setelah `<p>` subtitle hero, sisipkan:

```tsx
          {mulai !== null && (
            <div className="mt-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <Link
                href="/katalog"
                className="kilau kilau-loop relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-5 py-2 text-sm font-black text-red-600 shadow-lg shadow-red-900/20 transition hover:-translate-y-0.5"
              >
                <Tag className="h-4 w-4" /> {fill(dict.paket.priceChip, { price: formatRupiah(mulai) })}
              </Link>
            </div>
          )}
```

Sebagai anak terakhir `<section>` hero (setelah `<div className="relative mx-auto w-full max-w-7xl …">…</div>`), sisipkan:

```tsx
        {heroImages.length > 1 && (
          <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center gap-2">
            {heroImages.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setHeroIdx(i)}
                aria-label={fill(dict.home.heroSlide, { n: i + 1 })}
                aria-current={i === heroIdx}
                className="h-1.5 w-10 overflow-hidden rounded-full bg-white/25 transition hover:bg-white/40"
              >
                {i === heroIdx && (
                  <span
                    key={heroIdx}
                    className="block h-full origin-left animate-progress bg-white"
                    style={{ animationDuration: `${HERO_INTERVAL}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
```

- [ ] **Step 4: HomeContent — marquee, varian reveal, CTA**

- Tepat setelah `</section>` hero (sebelum komentar `TRUST STRIP`), sisipkan `<FleetMarquee cars={cars} />`.
- Pada `<ScrollReveal key={svc.href} delay={i * 60}>` di Layanan, tambahkan `variant="scale"`.
- Pada `<ScrollReveal className="flex flex-wrap items-end justify-between gap-6">` di Armada Unggulan, tambahkan `variant="left"`.
- Pada div CTA `className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-red-600 via-red-700 to-red-900 …"`, tambahkan `bg-[length:200%_200%] animate-gradient-shift` ke daftar kelasnya.

- [ ] **Step 5: CarCard — titik tersedia, kilau foto, pill**

Di `components/CarCard.tsx`:

(a) Di dalam kontainer gambar (`<div className="relative aspect-[16/10] overflow-hidden …">`), tepat setelah `<div className="absolute inset-0 bg-gradient-to-t … group-hover:opacity-100" />`, sisipkan:

```tsx
              <span aria-hidden className="kilau kilau-hover absolute inset-0 overflow-hidden" />
```

(b) Ganti `<span className={`shrink-0 rounded-full px-2.5 py-1 …`}>{statusLabel}</span>` dengan versi yang punya titik berdenyut:

```tsx
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                car.status === "tersedia"
                  ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
              }`}
            >
              {car.status === "tersedia" && (
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
              )}
              {statusLabel}
            </span>
```

(c) Pada pill harga merah (cabang `adaHarga` dari Task 8), tambahkan `transition-transform duration-300 group-hover:scale-105` ke kelasnya.

- [ ] **Step 6: Cek tipe dan test**

Run: `npx tsc --noEmit && npm test`
Expected: tanpa error, semua PASS.

- [ ] **Step 7: Cek visual**

Gunakan API lokal dan dev server. Periksa beranda:
- **Judul hero** muncul per baris dari bawah.
- **Chip** "Mulai Rp 700.000/hari" berkilau tiap ±4 detik dan mengarah ke `/katalog`.
- **Indikator carousel** terisi selama 6 detik. Klik indikator lain langsung berpindah dan hitungannya mulai ulang.
- **Marquee** bergulir, berhenti saat di-hover, dan item bisa diklik ke detail.
- **Kartu armada:** titik hijau berdenyut di "Tersedia", kilau menyapu foto saat hover, dan pill harga sedikit membesar.
- **CTA penutup:** gradasi bergeser pelan.
- **Reduce-motion** (DevTools → Rendering): carousel tidak berganti sendiri, marquee diam dan bisa digulir manual, tidak ada kilau.
- **Tanpa foto:** cadangkan lalu kosongkan foto di API lokal:

  ```bash
  cp "$UJI/armada.sqlite" "$UJI/armada.bak"
  sqlite3 "$UJI/armada.sqlite" "UPDATE transportations SET images = NULL, image_url = NULL;"
  ```

  Muat ulang beranda (tunggu ISR 60 detik atau restart `npm run dev`). Marquee dan carousel tidak tampil, chip harga tetap tampil, dan halaman tidak rusak. Pulihkan dengan `cp "$UJI/armada.bak" "$UJI/armada.sqlite"`.
- **Lebar 375 px:** judul tidak terpotong, chip dan indikator tidak menimpa tombol CTA.

- [ ] **Step 8: Commit**

```bash
git add components/FleetMarquee.tsx components/HomeContent.tsx components/CarCard.tsx
git commit -m "feat(motion): hero per baris, chip harga mulai, indikator carousel, marquee armada

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 14: Motion halaman detail dan bar booking menempel

**Files:**
- Create: `transport_wm/components/StickyBookingBar.tsx`
- Modify: `transport_wm/components/CarDetailBody.tsx` (pasang bar)
- Modify: `transport_wm/components/FloatingChat.tsx` (kelas `floating-chat`)
- Modify: `transport_wm/components/BookingForm.tsx` (angka bergulir, kilau tombol WA, pop centang)

**Interfaces:**
- Consumes:
  - elemen `#kartu-harga` (Task 8) dan `#form-booking` (Task 10)
  - `useCompare().items` (sudah ada)
  - `AnimatedNumber` (Task 12)
  - `paketTersedia`, `hargaPaket` (Task 6)
  - `dict.booking.stickyCta` (Task 7)

- [ ] **Step 1: StickyBookingBar**

`components/StickyBookingBar.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Car } from "@/lib/types";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { useCompare } from "./CompareProvider";
import { formatRupiah } from "@/lib/whatsapp";
import { hargaPaket, paketTersedia } from "@/lib/paket";

/**
 * Di HP/tablet form booking berada jauh di bawah galeri & deskripsi. Bar ini
 * muncul setelah kartu harga terlewati dan hilang saat form sudah terlihat.
 * Tidak tampil bila CompareBar sedang terbuka (keduanya menempel di bawah).
 */
export default function StickyBookingBar({ car }: { car: Car }) {
  const { dict } = useLang();
  const { items } = useCompare();
  const [lewatKartu, setLewatKartu] = useState(false);
  const [formTerlihat, setFormTerlihat] = useState(false);

  useEffect(() => {
    const kartu = document.getElementById("kartu-harga");
    const form = document.getElementById("form-booking");
    if (!kartu || !form) return;
    const obsKartu = new IntersectionObserver(([e]) =>
      setLewatKartu(!e.isIntersecting && e.boundingClientRect.top < 0),
    );
    const obsForm = new IntersectionObserver(([e]) => setFormTerlihat(e.isIntersecting), { threshold: 0.1 });
    obsKartu.observe(kartu);
    obsForm.observe(form);
    return () => {
      obsKartu.disconnect();
      obsForm.disconnect();
    };
  }, []);

  const pilihan = paketTersedia(car);
  const tampil = lewatKartu && !formTerlihat && items.length === 0 && pilihan.length > 0;

  useEffect(() => {
    const root = document.documentElement;
    if (tampil) root.dataset.stickyBooking = "1";
    else delete root.dataset.stickyBooking;
    return () => {
      delete root.dataset.stickyBooking;
    };
  }, [tampil]);

  const paketUtama = pilihan[0] ?? "full_day";
  const harga = hargaPaket(car, paketUtama);

  function keForm() {
    const gerakMinimal = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("form-booking")?.scrollIntoView({ behavior: gerakMinimal ? "auto" : "smooth", block: "start" });
  }

  return (
    <div
      aria-hidden={!tampil}
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-3 transition-transform duration-500 ease-out lg:hidden ${
        tampil ? "translate-y-0" : "pointer-events-none translate-y-[120%]"
      }`}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-[1.75rem] border border-slate-100 bg-white/95 p-3 pl-5 shadow-2xl shadow-slate-900/10 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-500 dark:text-slate-400">{car.name}</p>
          <p className="text-lg font-black text-red-600">
            {harga !== null ? formatRupiah(harga) : dict.paket.askPrice}
            {harga !== null && (
              <span className="text-xs font-bold text-slate-400">
                {paketUtama === "transfer" ? dict.paket.perTrip : dict.paket.perDay}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          tabIndex={tampil ? 0 : -1}
          onClick={keForm}
          className="kilau kilau-loop relative shrink-0 overflow-hidden rounded-2xl bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/30 transition active:scale-95"
        >
          {dict.booking.stickyCta}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Pasang bar dan kelas chat**

- Di `components/CarDetailBody.tsx`, tambahkan `import StickyBookingBar from "./StickyBookingBar";`. Sisipkan `<StickyBookingBar car={car} />` tepat sebelum `</section>` penutup komponen.
- Di `components/FloatingChat.tsx`, tambahkan `floating-chat` ke kelas div terluar: `className="floating-chat fixed bottom-24 right-5 z-50 …"`.

- [ ] **Step 3: BookingForm — angka bergulir, kilau, pop**

Di `components/BookingForm.tsx`:
- Tambahkan `import AnimatedNumber from "./AnimatedNumber";`.
- Di rincian, ganti `<span className="shrink-0">{formatRupiah(hasil.sewa)}</span>` dengan `<AnimatedNumber value={hasil.sewa} format={formatRupiah} className="shrink-0" />`.
- Ganti `<span className="shrink-0">{formatRupiah(hasil.biayaTambahan)}</span>` dengan `<AnimatedNumber value={hasil.biayaTambahan} format={formatRupiah} className="shrink-0" />`.
- Ganti `<span className="text-red-600">{formatRupiah(hasil.total)}</span>` dengan `<AnimatedNumber value={hasil.total} format={formatRupiah} className="text-red-600" />`.
- Pada tombol submit WhatsApp, tambahkan `kilau kilau-loop relative overflow-hidden` ke kelasnya.
- Pada `<CheckCircle2 className="h-4 w-4 shrink-0" />` di pesan sukses, tambahkan `animate-pop`.

- [ ] **Step 4: Cek tipe, test, build**

Run: `npx tsc --noEmit && npm test && NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8123/api npm run build`
Expected: semuanya sukses.

- [ ] **Step 5: Cek visual (HP 375 px dan tablet 820 px)**

Buka `/mobil/toyota-avanza` di lebar 375 px:
- Gulir melewati kartu harga: bar meluncur naik dari bawah, menampilkan "Rp 700.000/hari" dan "Booking Sekarang". Tombol chat melayang naik dan tidak menimpa bar.
- Tekan "Booking Sekarang": halaman bergulir mulus ke form, lalu bar turun dan menghilang. Tombol chat kembali ke posisi semula.
- Tambahkan mobil ke Bandingkan: bar booking tidak tampil selama CompareBar terbuka.
- Ganti jumlah hari 1 → 3: total bergulir dari Rp 700.000 ke Rp 2.100.000.
- Tombol WhatsApp berkilau berkala.
- Kirim booking: ikon centang "Booking tercatat" muncul dengan efek pop.
- Di lebar ≥ 1024 px, bar tidak pernah muncul karena kolom kanan sudah sticky.
- Dengan reduce-motion: total langsung berganti tanpa bergulir dan tidak ada kilau.

- [ ] **Step 6: Commit**

```bash
git add components/StickyBookingBar.tsx components/CarDetailBody.tsx components/FloatingChat.tsx components/BookingForm.tsx
git commit -m "feat(motion): bar booking menempel di HP, total bergulir, kilau tombol WhatsApp

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Fase E — Rilis

**Setiap task di fase ini dimulai dengan meminta persetujuan pengguna**, karena menyentuh production atau branch `main`. Urutan wajib: Task 15 → 16 → 17 → 18. API harus lebih dulu, karena admin baru dan data baru bergantung padanya. Situs lama aman, karena mengabaikan kolom baru.

### Task 15: Rilis api_wm

**Files:** tidak ada perubahan kode. Server: `wm2026:/www/wwwroot/api.welcomemanado.my.id`.

- [ ] **Step 1: PR dan persetujuan**

Push branch dan buka PR ke `dev`. Promosi `dev` → `main` mengikuti alur repo, dan merge ke `main` dilakukan pengguna:

```bash
cd /Users/marchelinoraco/Documents/2026/welcomeManado/api_wm
git push -u origin feat/transport-paket-harga
gh pr create --base dev --title "feat(transport): harga paket, isi silinder, paket & area booking" \
  --body "Kolom aditif untuk Daftar Harga Sewa Kendaraan (berlaku 1 Okt 2026). Kolom paket yang tidak dikirim tidak diubah (melindungi dari form admin lama). Test: tests/Feature/Transport.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

Tanyakan kepada pengguna apakah boleh deploy ke production setelah PR masuk `main`.

- [ ] **Step 2: Daftar berkas yang dikirim**

```bash
git diff --name-status dev...feat/transport-paket-harga -- . ':!tests' ':!database/factories'
```

Expected tepat:

```
M	app/Http/Controllers/Api/TransportationBookingController.php
M	app/Http/Controllers/Api/TransportationController.php
M	app/Models/Transportation.php
M	app/Models/TransportationBooking.php
A	database/migrations/2026_10_14_000001_add_package_prices_to_transportations_table.php
A	database/migrations/2026_10_14_000002_add_package_and_area_to_transportation_bookings_table.php
```

- [ ] **Step 3: Pastikan server tidak menyimpang**

Untuk setiap berkas `M`, hash di server harus sama dengan versi `dev` sebelum perubahan:

```bash
for f in app/Http/Controllers/Api/TransportationBookingController.php app/Http/Controllers/Api/TransportationController.php app/Models/Transportation.php app/Models/TransportationBooking.php; do
  lokal=$(git show dev:$f | shasum | cut -d' ' -f1)
  server=$(ssh wm2026 "sha1sum /www/wwwroot/api.welcomemanado.my.id/$f" | cut -d' ' -f1)
  echo "$f lokal=$lokal server=$server $([ "$lokal" = "$server" ] && echo OK || echo BEDA)"
done
ssh wm2026 "ls /www/wwwroot/api.welcomemanado.my.id/database/migrations/ | grep 2026_10_14 || echo 'migrasi belum ada (benar)'"
ssh wm2026 "cd /www/wwwroot/api.welcomemanado.my.id && sudo -u www env HOME=/tmp /www/server/php/84/bin/php artisan migrate:status --pending 2>/dev/null | tail -5"
```

Expected: keempatnya `OK`, migrasi belum ada, dan tidak ada migrasi lain yang pending. Kalau ada yang `BEDA` atau ada migrasi pending lain, **berhenti dan laporkan**.

- [ ] **Step 4: Cadangan database dan kode**

Ikuti memori `deploy-api-welcomemanado`. Buat `--defaults-extra-file` sementara (umask 077) dari `DB_USERNAME`/`DB_PASSWORD` di `.env` server, lalu:

```bash
STAMP=$(date +%Y%m%d-%H%M)
ssh wm2026 "umask 077; cd /www/wwwroot/api.welcomemanado.my.id && U=\$(grep ^DB_USERNAME= .env | cut -d= -f2-) P=\$(grep ^DB_PASSWORD= .env | cut -d= -f2-) && printf '[client]\nuser=%s\npassword=%s\n' \"\$U\" \"\$P\" > /tmp/wm.cnf && mariadb-dump --defaults-extra-file=/tmp/wm.cnf -h 127.0.0.1 dbwm | gzip > ~/backup-api/dbwm-$STAMP.sql.gz; rm -f /tmp/wm.cnf; ls -la ~/backup-api/dbwm-$STAMP.sql.gz"
ssh wm2026 "cd /www/wwwroot/api.welcomemanado.my.id && sudo tar -czf ~/backup-api/kode-lama-$STAMP.tar.gz app/Http/Controllers/Api/TransportationBookingController.php app/Http/Controllers/Api/TransportationController.php app/Models/Transportation.php app/Models/TransportationBooking.php && ls -la ~/backup-api/kode-lama-$STAMP.tar.gz"
```

Expected: kedua berkas cadangan ada dan ukurannya > 0.

- [ ] **Step 5: Salin berkas, lalu migrasi**

```bash
git checkout main && git pull --ff-only
git diff --name-only dev...feat/transport-paket-harga -- . ':!tests' ':!database/factories' > "$UJI/wm-api-files.txt"
rsync -tz --rsync-path="sudo rsync" --files-from="$UJI/wm-api-files.txt" ./ wm2026:/www/wwwroot/api.welcomemanado.my.id/
ssh wm2026 'cd /www/wwwroot/api.welcomemanado.my.id && while read -r f; do sudo chown www:www "$f" && sudo chmod 664 "$f" && /www/server/php/84/bin/php -l "$f"; done' < "$UJI/wm-api-files.txt"
ssh wm2026 "cd /www/wwwroot/api.welcomemanado.my.id && sudo -u www env HOME=/tmp /www/server/php/84/bin/php artisan migrate --force"
```

Expected: `No syntax errors detected` untuk keenam berkas, lalu dua baris `DONE` untuk migrasi `2026_10_14_*`. Tidak perlu `route:cache` atau `config:cache` (rute dan konfigurasi tidak berubah). Tidak perlu flush PublicCache, karena endpoint transportations tidak memakai cache itu.

- [ ] **Step 6: Verifikasi**

```bash
curl -s "https://api.welcomemanado.my.id/api/transportations/slug/toyota-avanza" | python3 -I -c 'import json,sys; d=json.load(sys.stdin)["data"]; print({k: d.get(k, "TIDAK ADA") for k in ["price","price_pickup","price_overtime","price_self_drive","engine_cc"]})'
```

Expected: kelima kunci ada, dengan `price` 0 dan sisanya `None`. Buka juga https://transport.welcomemanado.com dan https://welcomemanado.com (Travel Info → Transport). Keduanya harus tampil seperti sebelumnya.

- [ ] **Step 7: Perbarui memori deploy**

Perbarui `memory/deploy-api-welcomemanado.md` di bagian "Last deploy": tanggal, commit `main`, 4 berkas + 2 migrasi, dan nama cadangan.

### Task 16: Rilis admin_wm

- [ ] **Step 1: PR dan persetujuan**

```bash
cd /Users/marchelinoraco/Documents/2026/welcomeManado/admin_wm
git push -u origin feat/transport-paket-harga
gh pr create --base dev --title "feat(transport): form harga paket & isi silinder; paket di daftar booking" \
  --body "Pasangan api_wm feat/transport-paket-harga. Form selalu mengirim keempat kolom paket.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

Tunggu PR masuk `main` dan persetujuan deploy dari pengguna.

- [ ] **Step 2: Periksa isi rilis, lalu build**

```bash
git checkout main && git pull --ff-only
git log --oneline --since="2026-10-04" origin/main
```

Bila ada commit selain PR ini yang belum pernah dirilis, **tanyakan dulu kepada pengguna**. Setelah itu:

```bash
rm -rf dist && VITE_API_BASE_URL=https://api.welcomemanado.my.id/api npm run build
grep -l "api.welcomemanado.my.id" dist/assets/*.js && ! grep -l "127.0.0.1:8000" dist/assets/*.js && echo "URL produksi OK"
```

- [ ] **Step 3: Cadangan dan rsync**

```bash
STAMP=$(date +%Y%m%d-%H%M)
ssh wm2026 "sudo tar -czf ~/backup-admin-$STAMP.tar.gz -C /www/wwwroot admin.welcomemanado.com && ls -la ~/backup-admin-$STAMP.tar.gz"
rsync -rlptzn --delete --rsync-path="sudo rsync" --exclude=.user.ini --exclude=.well-known dist/ wm2026:/www/wwwroot/admin.welcomemanado.com/
rsync -rlptz --delete --rsync-path="sudo rsync" --exclude=.user.ini --exclude=.well-known dist/ wm2026:/www/wwwroot/admin.welcomemanado.com/
ssh wm2026 "sudo chown -R www:www /www/wwwroot/admin.welcomemanado.com"
```

Dry-run (`-n`) dibaca dulu sebelum perintah kedua dijalankan. Daftar yang dihapus hanya boleh berisi aset lama.

- [ ] **Step 4: Verifikasi**

```bash
diff <(curl -s https://admin.welcomemanado.com/ | grep -o 'assets/index-[^"]*\.js') <(grep -o 'assets/index-[^"]*\.js' dist/index.html) && echo "index cocok"
```

Minta pengguna memuat ulang admin (Ctrl+Shift+R). Form armada harus menampilkan grup "Harga paket" dan "Isi Silinder (cc)". Perbarui `memory/deploy-admin-welcomemanado.md`.

### Task 17: Isi data production

- [ ] **Step 1: Token dan pratinjau**

Minta pengguna menjalankan `copy(localStorage.getItem("admin_token"))` di konsol admin.welcomemanado.com dan menempelkannya. Jangan memanggil `/admin/login`, karena itu menghapus sesi browser pengguna.

```bash
cd /Users/marchelinoraco/Documents/2026/welcomeManado/_dump-database/foto-baru/_alat
WM_PDF_IMG="$UJI/pdf" venv/bin/python -I isi_armada.py
```

Expected:
- 11 baris, delapan "ubah id" dan tiga "BARU".
- Semua "foto hidup 0/…".
- Slug lama cocok dengan pemetaan spec §3 (#10 alphard, #12 fortuner, #6 reborn, #7 zenix, #8 commuter, #11 premio, #9 bus, #5 avanza).

Tunjukkan keluaran ini kepada pengguna sebelum lanjut.

- [ ] **Step 2: Percobaan pada Avanza**

```bash
WM_TOKEN=<token> WM_PDF_IMG="$UJI/pdf" venv/bin/python -I isi_armada.py --kirim --hanya 11
```

Expected: `#11 Toyota Avanza … OK → id 5, slug toyota-avanza, foto 1`. Dalam 60 detik (ISR), https://transport.welcomemanado.com/mobil/toyota-avanza menampilkan Rp 700.000 dan foto Avanza. Minta pengguna memeriksa halaman itu sebelum lanjut.

- [ ] **Step 3: Sepuluh armada sisanya**

```bash
WM_TOKEN=<token> WM_PDF_IMG="$UJI/pdf" venv/bin/python -I isi_armada.py --kirim --hanya 1,2,3,4,5,6,7,8,9,10
```

Expected: 10 × `OK`. Bila muncul `MASALAH`, skrip berhenti. Laporkan kepada pengguna dan jangan mengulang otomatis.

- [ ] **Step 4: Verifikasi production**

```bash
curl -s "https://api.welcomemanado.my.id/api/transportations?per_page=100" | python3 -I -c '
import json,sys
for t in json.load(sys.stdin)["data"]["data"]:
    print(f"{t[\"id\"]:>3} {t[\"slug\"]:<45} {t[\"price\"]:>9} {str(t.get(\"price_pickup\")):>9} {str(t.get(\"price_overtime\")):>7} {str(t.get(\"price_self_drive\")):>7} {str(t.get(\"engine_cc\")):>5} foto={len(t.get(\"images\") or [])}")'
```

Bandingkan setiap baris dengan tabel spec §3. White Marlin tetap 0 dan fotonya mati. Unit lainnya punya `foto=1`. Cek semua foto 200:

```bash
curl -s "https://api.welcomemanado.my.id/api/transportations?per_page=100" | python3 -I -c 'import json,sys; [print(u) for t in json.load(sys.stdin)["data"]["data"] for u in (t.get("images") or [])]' | while read u; do echo "$(curl -s -o /dev/null -w '%{http_code}' "$u") $u"; done
```

Expected: semua `200` kecuali satu foto White Marlin.

- [ ] **Step 5: Perbarui memori**

Buat atau perbarui memori proyek tentang armada transport: 12 unit (11 + White Marlin), harga sesuai PDF 1 Okt 2026, foto Alphard 2022 dan Bus masih dari PDF (kecil), dan cc bus memakai penanda 2001. Simpan `hasil-isi-armada.json` sebagai jejak.

### Task 18: Rilis transport_wm

- [ ] **Step 1: Verifikasi lengkap sebelum PR**

Jalankan dengan `NEXT_PUBLIC_API_BASE_URL=https://api.welcomemanado.my.id/api`, karena data production sudah terisi di Task 17:

```bash
cd /Users/marchelinoraco/Documents/2026/welcomeManado/transport_wm
npm test && npx tsc --noEmit && NEXT_PUBLIC_API_BASE_URL=https://api.welcomemanado.my.id/api npm run build
```

Expected: semua lulus. Lalu jalankan `NEXT_PUBLIC_API_BASE_URL=https://api.welcomemanado.my.id/api npm run start`. Ulangi pemeriksaan visual Task 8, 9, 10, 13, dan 14 terhadap data production, di lebar 375 px dan 1280 px, mode terang dan gelap, reduce-motion, dan 4 bahasa.

- [ ] **Step 2: Push dan preview Vercel**

```bash
git push -u origin feat/paket-harga-motion
gh pr create --base dev --title "feat: paket harga resmi, Syarat & Ketentuan, dan motion untuk booking" \
  --body "Spec: docs/superpowers/specs/2026-10-14-paket-harga-motion-design.md
Rencana: docs/superpowers/plans/2026-10-14-paket-harga-motion.md

- Harga Full day / Transfer / Lepas kunci + Over time dari admin; tanpa 'Rp 0'
- Form booking dengan Biaya Area per isi silinder, ringkasan Termasuk/Tidak termasuk
- Halaman /syarat-ketentuan 4 bahasa (Welcome Manado sebagai operator)
- Janji diskon 10%/20% dihapus dari seluruh situs
- Motion: hero per baris, chip harga, marquee armada, bar booking menempel di HP

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
gh pr checks --watch
```

Ambil URL preview Vercel dari komentar bot di PR (`gh pr view --comments`). Minta pengguna memeriksa preview, terutama di HP. Ingatkan juga bahwa terjemahan S&K en/zh/ko sebaiknya dibaca penutur asli.

- [ ] **Step 3: Production (hanya dengan persetujuan)**

Setelah pengguna menyetujui, merge mengikuti alur repo (`dev` → `main`, dilakukan pengguna atau atas izinnya). Vercel men-deploy `main`. Lalu verifikasi:

```bash
for p in / /katalog /mobil/toyota-avanza /mobil/white-marlin /syarat-ketentuan /promo /blog/harga-sewa-mobil-manado-2026; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' https://transport.welcomemanado.com$p) $p"
done
curl -s https://transport.welcomemanado.com/mobil/toyota-avanza | grep -c "Rp 0<" ; echo "(harus 0)"
curl -s https://transport.welcomemanado.com/promo | grep -cE "Diskon (10|20)%" ; echo "(harus 0)"
```

- [ ] **Step 4: Booking uji di production**

Bersama pengguna, kirim satu booking uji bernama "UJI — hapus". Cek di admin: paket dan area tampil benar dan total sesuai. Lalu hapus booking itu dari admin.

---

## Self-Review

**Cakupan spec:**

| Bagian spec | Task |
|---|---|
| §1 API | 1, 2 |
| §2 Admin | 3, 4 |
| §3 Data | 5, 17 |
| §4 lapisan data, tarif, golongan | 6 |
| §4 kartu, detail | 8 |
| §4 form | 10 |
| §4 S&K | 9 |
| §4 penyelarasan teks | 11 |
| §5 motion | 12–14 |
| §6 i18n | 7, 11 |
| Urutan rilis | 15–18 |
| Pengujian | test di Task 1, 2, 3, 6, 7, 9, 11; contoh hitungan spec di `hitungBooking.test.ts` |
| Pasca-deploy | 17 Step 4, 18 Step 3–4 |

**Konsistensi nama:**
- `price_pickup` (API) dipetakan ke `price_transfer` (`Car`) hanya di `toCar`.
- `PilihanArea`, `HasilBooking`, `InputBooking` dipakai sama di `hitungBooking.ts`, `booking.ts`, `BookingForm.tsx`.
- `#kartu-harga` dibuat di Task 8, `#form-booking` di Task 10, keduanya dipakai di Task 14.
- `dict.booking.qtyDay`, `qtyTrip`, `days`, `trip`, `estTotal` dipertahankan di Task 10. Kunci yang dihapus didaftar eksplisit.
