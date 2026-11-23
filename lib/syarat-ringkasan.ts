import type { Localized } from "./syarat-ketentuan";
import { TARIF_LEPAS_KUNCI, rp } from "./tarif-sewa";

/** Nama ikon lucide per pasal; dipetakan ke komponennya di SyaratKetentuanContent. */
export type NamaIkon =
  | "user" | "calendar" | "tag" | "shield" | "key" | "fuel" | "map" | "clock"
  | "ban" | "wrench" | "undo" | "steering" | "pin" | "lock" | "scale";

/** Ikon tiap pasal S&K (kunci = BagianSyarat.id). Tes memastikan semua pasal punya ikon. */
export const IKON_PASAL: Record<string, NamaIkon> = {
  penyewa: "user",
  pemesanan: "calendar",
  paket: "tag",
  jaminan: "shield",
  "serah-terima": "key",
  bbm: "fuel",
  wilayah: "map",
  keterlambatan: "clock",
  larangan: "ban",
  kerusakan: "wrench",
  pembatalan: "undo",
  pengemudi: "steering",
  "tarif-area": "pin",
  "data-pribadi": "lock",
  hukum: "scale",
};

export type Ringkasan = {
  pasal: string;
  ikon: NamaIkon;
  judul: Localized<string>;
  nilai: Localized<string>;
};

const TELAT = TARIF_LEPAS_KUNCI.keterlambatanPerJam;
const KM = TARIF_LEPAS_KUNCI.batasKmPerHari;

/**
 * "Ringkasan cepat" di atas halaman S&K: lima hal yang paling sering ditanyakan penyewa.
 * Ini RINGKASAN — pasal lengkapnya yang mengikat. Angka diambil dari tarif-sewa.ts.
 * Aturan 21 tahun dan batas pembatalan 24 jam mengikuti teks pasal 'penyewa' dan 'pembatalan'.
 */
export const RINGKASAN_SYARAT: Ringkasan[] = [
  {
    pasal: "penyewa", ikon: "user",
    judul: { id: "Usia & SIM", en: "Age & licence", zh: "年龄与驾照", ko: "연령 및 면허" },
    nilai: { id: "Min. 21 tahun, SIM A berlaku (lepas kunci)", en: "21+ with a valid licence (self-drive)", zh: "满21岁，持有效驾照（自驾）", ko: "만 21세 이상, 유효한 면허(셀프 드라이브)" },
  },
  {
    pasal: "jaminan", ikon: "shield",
    judul: { id: "Jaminan", en: "Security", zh: "押金", ko: "보증" },
    nilai: { id: "KTP & KK asli + deposit, dikembalikan saat unit kembali", en: "Original ID + deposit, returned with the vehicle", zh: "身份证原件加押金，还车后退还", ko: "신분증 원본 + 보증금, 반납 시 환불" },
  },
  {
    pasal: "paket", ikon: "tag",
    judul: { id: "Batas pemakaian", en: "Usage limit", zh: "使用限制", ko: "이용 한도" },
    nilai: { id: `Maks. 12 jam & ${KM} km per hari sewa`, en: `Up to 12 hours & ${KM} km per rental day`, zh: `每租期日最长12小时、${KM}公里`, ko: `대여일당 최대 12시간, ${KM}km` },
  },
  {
    pasal: "keterlambatan", ikon: "clock",
    judul: { id: "Telat kembali", en: "Late return", zh: "逾期还车", ko: "반납 지연" },
    nilai: { id: `${rp(TELAT)} per jam`, en: `${rp(TELAT, "koma")} per hour`, zh: `每小时 ${rp(TELAT)}`, ko: `시간당 ${rp(TELAT)}` },
  },
  {
    pasal: "pembatalan", ikon: "undo",
    judul: { id: "Pembatalan", en: "Cancellation", zh: "取消", ko: "취소" },
    nilai: { id: "Lebih dari 24 jam sebelum jemput: dana kembali penuh", en: "More than 24 h before pick-up: full refund", zh: "接车前24小时以上：全额退款", ko: "픽업 24시간 전까지: 전액 환불" },
  },
];
