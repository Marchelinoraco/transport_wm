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
