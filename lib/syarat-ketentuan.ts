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
  {
    id: 'penyewa',
    judul: {
      id: 'Ketentuan penyewa',
      en: 'Who may rent',
      zh: '承租人资格',
      ko: '대여 자격',
    },
    isi: {
      id: [
        'Penyewa berusia minimal 21 tahun dan memiliki SIM A yang masih berlaku untuk sewa lepas kunci.',
        'Kartu identitas asli wajib ditunjukkan saat serah terima kendaraan.',
        'Kendaraan hanya boleh dikemudikan oleh orang yang namanya tercatat pada perjanjian sewa. Bila ada pengemudi pengganti, beri tahu kami lebih dulu.',
      ],
      en: [
        'Renters must be at least 21 years old and hold a valid Indonesian SIM A licence for self-drive rentals.',
        'An original identity document must be presented when the vehicle is handed over.',
        'Only the person named on the rental agreement may drive the vehicle. If someone else will drive, tell us beforehand.',
      ],
      zh: [
        '自驾租车的承租人须年满 21 周岁，并持有有效的印尼 SIM A 驾照。',
        '交车时须出示身份证件原件。',
        '仅限租赁合约上载明的本人驾驶。如需更换驾驶人，请事先告知我们。',
      ],
      ko: [
        '자차 운전 대여의 경우 만 21세 이상이며 유효한 인도네시아 SIM A 면허를 소지해야 합니다.',
        '차량 인수 시 신분증 원본을 제시해 주셔야 합니다.',
        '차량은 대여 계약서에 기재된 본인만 운전할 수 있습니다. 다른 분이 운전하실 경우 미리 알려 주세요.',
      ],
    },
  },

  {
    id: 'pemesanan',
    judul: {
      id: 'Pemesanan dan pembayaran',
      en: 'Booking and payment',
      zh: '预订与付款',
      ko: '예약과 결제',
    },
    isi: {
      id: [
        'Pemesanan dianggap sah setelah dikonfirmasi Welcome Manado lewat WhatsApp, bukan sejak formulir dikirim.',
        'Tarif yang berlaku adalah tarif yang kami konfirmasikan saat pemesanan.',
        'Pelunasan dilakukan paling lambat saat serah terima kendaraan, kecuali disepakati lain.',
      ],
      en: [
        'A booking is confirmed once Welcome Manado confirms it on WhatsApp, not at the moment the form is submitted.',
        'The rate that applies is the one we confirm at the time of booking.',
        'Full payment is due no later than vehicle handover, unless agreed otherwise.',
      ],
      zh: [
        '订单以 Welcome Manado 通过 WhatsApp 确认为准，而非提交表单当时即成立。',
        '适用价格为我们在确认订单时告知的价格。',
        '除另有约定外，全额款项最迟应于交车时结清。',
      ],
      ko: [
        '예약은 양식 제출 시점이 아니라 Welcome Manado가 WhatsApp으로 확인한 시점에 성립합니다.',
        '적용 요금은 예약 확정 시 저희가 안내한 요금입니다.',
        '별도 합의가 없는 한 잔금은 늦어도 차량 인수 시까지 결제해 주셔야 합니다.',
      ],
    },
  },

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

  {
    id: 'jaminan',
    judul: {
      id: 'Jaminan',
      en: 'Security',
      zh: '担保',
      ko: '보증',
    },
    isi: {
      id: [
        'Untuk sewa lepas kunci, Welcome Manado menahan KTP dan Kartu Keluarga asli selama masa sewa.',
        'Deposit uang juga dikenakan; besarnya kami sampaikan saat konfirmasi pemesanan dan dikembalikan penuh setelah kendaraan diperiksa dan tidak ada kerusakan atau tunggakan.',
        'Seluruh jaminan dikembalikan pada hari kendaraan kembali dalam keadaan sesuai perjanjian.',
        'Untuk perjalanan ke luar Sulawesi Utara, Welcome Manado dapat meminta jaminan tambahan.',
      ],
      en: [
        'For self-drive rentals, Welcome Manado holds the original ID card and family card for the duration of the rental.',
        'A cash deposit also applies. We tell you the amount when confirming your booking, and it is returned in full once the vehicle has been inspected and there is no damage or outstanding charge.',
        'All security is returned on the day the vehicle comes back in the agreed condition.',
        'For journeys outside North Sulawesi, Welcome Manado may ask for additional security.',
      ],
      zh: [
        '自驾租车期间，Welcome Manado 将保管身份证与户口簿原件。',
        '另收取现金押金，金额于确认订单时告知；车辆查验无损坏且无欠费后全额退还。',
        '车辆按约定状态归还当日，全部担保即予退还。',
        '前往北苏拉威西省以外地区，Welcome Manado 可要求追加担保。',
      ],
      ko: [
        '자차 운전 대여의 경우 대여 기간 동안 신분증과 가족관계증명서 원본을 보관합니다.',
        '현금 보증금도 적용됩니다. 금액은 예약 확정 시 안내드리며, 차량 점검 후 손상이나 미납금이 없으면 전액 반환됩니다.',
        '차량이 약정된 상태로 반납된 당일에 모든 담보를 돌려드립니다.',
        '북술라웨시주 외 지역으로 이동하실 경우 추가 담보를 요청할 수 있습니다.',
      ],
    },
  },

  {
    id: 'serah-terima',
    judul: {
      id: 'Serah terima kendaraan',
      en: 'Vehicle handover',
      zh: '车辆交接',
      ko: '차량 인수·반납',
    },
    isi: {
      id: [
        'Kondisi kendaraan diperiksa bersama saat diserahkan dan saat dikembalikan. Kami merekam kondisinya sebagai bukti bagi kedua pihak.',
        'Periksa dan sampaikan setiap goresan, penyok, atau kerusakan yang sudah ada sebelum kendaraan Anda bawa. Kerusakan yang tidak tercatat saat serah terima dianggap terjadi selama masa sewa.',
        'Kendaraan dikembalikan dalam keadaan bersih seperti saat diterima. Biaya pembersihan dikenakan bila kendaraan kembali dalam keadaan sangat kotor.',
      ],
      en: [
        'The vehicle is inspected together at handover and at return. We record its condition as evidence for both sides.',
        'Please point out any existing scratch, dent, or fault before you drive away. Damage not recorded at handover is treated as having occurred during the rental.',
        'The vehicle should come back as clean as it was received. A cleaning charge applies if it is returned heavily soiled.',
      ],
      zh: [
        '交车与还车时双方共同查验车况，我们会录像存证，以保障双方。',
        '请在开走前指出既有的刮痕、凹陷或故障。交接时未记录的损伤，视为租赁期间发生。',
        '车辆应以接车时的清洁程度归还。若严重污损，将收取清洁费用。',
      ],
      ko: [
        '차량 상태는 인수 시와 반납 시 함께 점검합니다. 양측을 위해 상태를 영상으로 기록합니다.',
        '출발 전에 기존의 흠집, 찌그러짐, 결함을 알려 주세요. 인수 시 기록되지 않은 손상은 대여 기간 중 발생한 것으로 봅니다.',
        '차량은 인수하셨을 때와 같은 청결 상태로 반납해 주세요. 심하게 오염된 경우 청소 비용이 부과됩니다.',
      ],
    },
  },

  {
    id: 'bbm',
    judul: {
      id: 'Bahan bakar, tol, dan parkir',
      en: 'Fuel, tolls, and parking',
      zh: '燃油、通行费与停车费',
      ko: '연료·통행료·주차료',
    },
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
  },

  {
    id: 'wilayah',
    judul: {
      id: 'Wilayah pemakaian',
      en: 'Where the vehicle may go',
      zh: '用车区域',
      ko: '운행 지역',
    },
    isi: {
      id: [
        'Kendaraan boleh dibawa ke mana saja, termasuk menyeberang pulau, dengan satu syarat: tujuannya diberitahukan dan disetujui Welcome Manado sebelum berangkat.',
        'Membawa kendaraan keluar wilayah tanpa persetujuan lebih dulu merupakan pelanggaran perjanjian sewa, dan seluruh risiko yang timbul menjadi tanggungan penyewa.',
        'Untuk perjalanan jauh atau menyeberang pulau, sampaikan rencana rute Anda saat memesan agar kami dapat menyiapkan kendaraan yang sesuai.',
      ],
      en: [
        'The vehicle may be taken anywhere, including across to other islands, on one condition: the destination is disclosed to and approved by Welcome Manado before departure.',
        'Taking the vehicle outside the agreed area without prior approval breaches the rental agreement, and every risk arising from it falls on the renter.',
        'For long journeys or island crossings, tell us your route when booking so we can prepare a suitable vehicle.',
      ],
      zh: [
        '车辆可前往任何地区，包括跨岛，惟须于出发前将目的地告知 Welcome Manado 并获得同意。',
        '未经事先同意将车辆驶离约定区域，即构成违约，由此产生的一切风险由承租人承担。',
        '长途或跨岛行程，请于预订时告知路线，以便我们安排合适的车辆。',
      ],
      ko: [
        '차량은 섬을 건너는 것을 포함해 어디든 이동할 수 있습니다. 다만 출발 전에 목적지를 Welcome Manado에 알리고 승인을 받으셔야 합니다.',
        '사전 승인 없이 약정 지역을 벗어나는 것은 대여 계약 위반이며, 이로 인해 발생하는 모든 위험은 대여자가 부담합니다.',
        '장거리 또는 섬 간 이동은 예약 시 경로를 알려 주시면 알맞은 차량을 준비해 드립니다.',
      ],
    },
  },

  {
    id: 'keterlambatan',
    judul: {
      id: 'Keterlambatan pengembalian',
      en: 'Late return',
      zh: '逾期还车',
      ko: '반납 지연',
    },
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
  },

  {
    id: 'larangan',
    judul: {
      id: 'Larangan selama masa sewa',
      en: 'What is not allowed',
      zh: '租赁期间禁止事项',
      ko: '대여 중 금지 사항',
    },
    isi: {
      id: [
        'Dilarang merokok di dalam kendaraan. Biaya pembersihan dikenakan bila tercium bau rokok saat pengembalian.',
        'Kendaraan tidak boleh disewakan kembali, dipinjamkan, atau dijaminkan kepada pihak lain.',
        'Kendaraan tidak boleh dipakai untuk balapan, menarik kendaraan lain, mengangkut muatan melebihi kapasitas, atau kegiatan yang melanggar hukum.',
        'Mengemudi dalam pengaruh alkohol atau obat-obatan terlarang membatalkan seluruh perlindungan dan menjadi tanggung jawab penuh penyewa.',
      ],
      en: [
        'Smoking inside the vehicle is not permitted. A cleaning charge applies if cigarette odour is detected at return.',
        'The vehicle may not be sub-rented, lent, or pledged as security to anyone else.',
        'The vehicle may not be used for racing, towing, carrying loads beyond its capacity, or any unlawful activity.',
        'Driving under the influence of alcohol or illegal drugs voids all protection and leaves the renter fully liable.',
      ],
      zh: [
        '车内禁止吸烟。还车时若察觉烟味，将收取清洁费用。',
        '不得将车辆转租、外借或质押予他人。',
        '不得用于赛车、拖曳其他车辆、超载运输或任何违法活动。',
        '酒后或受管制药物影响驾驶，将使一切保障失效，并由承租人承担全部责任。',
      ],
      ko: [
        '차량 내 흡연은 금지됩니다. 반납 시 담배 냄새가 확인되면 청소 비용이 부과됩니다.',
        '차량을 재대여, 대여, 또는 담보로 제공할 수 없습니다.',
        '경주, 견인, 정원·적재 한도 초과 운송, 위법 행위에 사용할 수 없습니다.',
        '음주 또는 불법 약물 상태의 운전은 모든 보상을 무효로 하며, 전적으로 대여자의 책임입니다.',
      ],
    },
  },

  {
    id: 'kerusakan',
    judul: {
      id: 'Kerusakan, kehilangan, dan kecelakaan',
      en: 'Damage, loss, and accidents',
      zh: '损坏、遗失与事故',
      ko: '손상·분실·사고',
    },
    isi: {
      id: [
        'Selama masa sewa, kerusakan dan kehilangan yang terjadi pada kendaraan menjadi tanggung jawab penuh penyewa, termasuk biaya perbaikan dan penggantian suku cadang.',
        'Selain biaya perbaikan, penyewa menanggung kehilangan pendapatan sewa selama kendaraan tidak dapat dioperasikan karena perbaikan tersebut.',
        'Segera hubungi Welcome Manado bila terjadi kecelakaan, kerusakan, atau kehilangan — sebelum mengambil tindakan perbaikan sendiri.',
        'Pada kecelakaan yang melibatkan pihak lain atau menimbulkan korban, laporkan juga kepada kepolisian dan simpan salinan laporannya.',
      ],
      en: [
        'During the rental, damage to or loss of the vehicle is the renter’s full responsibility, including repair costs and replacement parts.',
        'Beyond repair costs, the renter covers the rental income lost while the vehicle cannot be operated because of those repairs.',
        'Contact Welcome Manado immediately in the event of an accident, damage, or loss — before arranging any repair yourself.',
        'Where an accident involves another party or causes injury, report it to the police as well and keep a copy of the report.',
      ],
      zh: [
        '租赁期间车辆的损坏或遗失，由承租人承担全部责任，包括维修费用与零件更换费用。',
        '除维修费用外，承租人还须赔偿因维修而无法营运期间的租金损失。',
        '发生事故、损坏或遗失时，请立即联系 Welcome Manado，切勿自行安排维修。',
        '若事故涉及第三方或造成人员伤亡，另请向警方报案并保留报案回执。',
      ],
      ko: [
        '대여 기간 중 차량의 손상과 분실은 수리비와 부품 교체비를 포함해 전적으로 대여자의 책임입니다.',
        '수리비 외에도, 수리로 인해 차량을 운행할 수 없는 기간의 대여 수입 손실을 대여자가 부담합니다.',
        '사고, 손상, 분실이 발생하면 직접 수리를 진행하기 전에 즉시 Welcome Manado로 연락해 주세요.',
        '상대방이 있거나 인명 피해가 있는 사고는 경찰에도 신고하고 신고서 사본을 보관해 주세요.',
      ],
    },
  },

  {
    id: 'pembatalan',
    judul: {
      id: 'Pembatalan dan perubahan',
      en: 'Cancellation and changes',
      zh: '取消与变更',
      ko: '취소와 변경',
    },
    isi: {
      id: [
        'Pembatalan lebih dari 24 jam sebelum penjemputan: seluruh pembayaran dikembalikan.',
        'Pembatalan 6 sampai 24 jam sebelum penjemputan: 50% dari total yang dibayarkan dikembalikan.',
        'Pembatalan kurang dari 6 jam sebelum penjemputan: pembayaran tidak dapat dikembalikan.',
        'Hari sewa yang termasuk high season — H-7 sampai dengan H+7 dari Natal, Tahun Baru, dan Idulfitri — tidak dapat dibatalkan dengan pengembalian dana, dan tidak dapat diubah jadwalnya maupun diperpanjang.',
        'Pengembalian dana diproses paling lama 14 (empat belas) hari kerja setelah pembatalan disetujui.',
        'Perubahan jadwal dapat dilakukan bila diajukan lebih dari 6 jam sebelum penjemputan dan kendaraan masih tersedia pada tanggal baru. Kurang dari itu, perubahan jadwal tidak dapat dilakukan.',
        'Pesanan untuk hari yang sama (same day) tidak dapat dibatalkan maupun diubah jadwalnya.',
        'Bila Welcome Manado yang membatalkan karena kendaraan tidak dapat disediakan, kami menawarkan kendaraan pengganti atau mengembalikan seluruh pembayaran Anda.',
      ],
      en: [
        'Cancelling more than 24 hours before pickup: everything you paid is refunded.',
        'Cancelling between 6 and 24 hours before pickup: 50% of the amount paid is refunded.',
        'Cancelling less than 6 hours before pickup: the payment is not refundable.',
        'Rental days falling in high season — the week before and after Christmas, New Year, and Idul Fitri — cannot be cancelled for a refund, rescheduled, or extended.',
        'Refunds are processed within 14 (fourteen) working days of the cancellation being approved.',
        'Rescheduling is possible when requested more than 6 hours before pickup and the vehicle is available on the new date. Later than that, the schedule cannot be changed.',
        'Same-day bookings cannot be cancelled or rescheduled.',
        'If Welcome Manado cancels because the vehicle cannot be provided, we offer a replacement vehicle or refund everything you have paid.',
      ],
      zh: [
        '于接车前 24 小时以上取消：全额退还已付款项。',
        '于接车前 6 至 24 小时取消：退还已付总额的 50%。',
        '于接车前不足 6 小时取消：已付款项不予退还。',
        '属于旺季的租期——圣诞节、元旦及开斋节前后各七天——不可取消退款，也不可改期或延长。',
        '退款于取消申请获批后最长 14（十四）个工作日内处理。',
        '接车前 6 小时以上提出且新日期仍有车可用时，可办理改期；迟于此时限则无法变更。',
        '当日预订不可取消，亦不可改期。',
        '若因 Welcome Manado 无法提供车辆而取消，我们将提供替代车辆或全额退款。',
      ],
      ko: [
        '픽업 24시간 이전 취소: 결제하신 금액을 전액 환불해 드립니다.',
        '픽업 6~24시간 전 취소: 결제 금액의 50%를 환불해 드립니다.',
        '픽업 6시간 이내 취소: 환불이 불가합니다.',
        '성수기에 해당하는 대여일 — 크리스마스, 새해, 이둘 피트리 전후 각 7일 — 은 환불 취소, 일정 변경, 연장이 모두 불가합니다.',
        '환불은 취소가 승인된 후 최장 14(십사) 영업일 이내에 처리됩니다.',
        '픽업 6시간 이전에 요청하시고 변경하려는 날짜에 차량이 있다면 일정 변경이 가능합니다. 그 이후에는 변경할 수 없습니다.',
        '당일 예약은 취소도 일정 변경도 불가합니다.',
        'Welcome Manado의 사정으로 차량을 제공하지 못해 취소되는 경우, 대체 차량을 안내하거나 결제하신 금액을 전액 환불해 드립니다.',
      ],
    },
  },

  {
    id: 'pengemudi',
    judul: {
      id: 'Sewa dengan pengemudi',
      en: 'Rentals with a driver',
      zh: '含司机租车',
      ko: '기사 포함 대여',
    },
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
  },

  /** Tarif area dan batas jarak, disusun dari lib/tarif-sewa.ts. */
  {
    id: 'tarif-area',
    judul: {
      id: 'Wilayah dan biaya area',
      en: 'Areas and area charges',
      zh: '区域与区域费用',
      ko: '지역과 지역 요금',
    },
    isi: {
      id: [
        `Area 1 — ${AREA_SEWA[0].wilayah}. Area 2 — ${AREA_SEWA[1].wilayah}. Area 3 — ${AREA_SEWA[2].wilayah}. Area ${AREA_DIKONFIRMASI} dan tujuan di luar daftar ini: wilayah dan biayanya dikonfirmasi lebih dulu sebelum keberangkatan.`,
        `Pada paket dengan sopir, bahan bakar sudah termasuk untuk pemakaian sampai ${TARIF_PELAYANAN.batasKmPerHari} km per hari sewa, dan perjalanan yang melebihi batas itu dikonfirmasi lebih dulu. Biaya parkir kami tanggung sampai ${rp(TARIF_PELAYANAN.batasParkirPerHari)} per hari sewa; biaya tol tidak termasuk.`,
        `Biaya Area pada paket dengan sopir, per hari sewa: Area 1 ${rp(TARIF_PELAYANAN.area[1].kecil)}; Area 2 ${rp(TARIF_PELAYANAN.area[2].kecil)} untuk unit di bawah ${AMBANG_MESIN_CC} cc dan ${rp(TARIF_PELAYANAN.area[2].besar)} untuk unit di atasnya; Area 3 ${rp(TARIF_PELAYANAN.area[3].kecil)} dan ${rp(TARIF_PELAYANAN.area[3].besar)}.`,
        `Pada sewa lepas kunci, biaya antar-jemput nihil bila kendaraan diambil dan dikembalikan di pool Welcome Manado. Di luar itu: Area 1 ${rp(TARIF_LEPAS_KUNCI.antarJemput[1])}, Area 2 ${rp(TARIF_LEPAS_KUNCI.antarJemput[2])}, Area 3 ${rp(TARIF_LEPAS_KUNCI.antarJemput[3])}.`,
        `Pemakaian lepas kunci maksimum ${TARIF_LEPAS_KUNCI.batasKmPerHari} km per hari sewa; perjalanan yang melebihi batas itu dikonfirmasi dan disepakati lebih dulu.`,
      ],
      en: [
        `Area 1 — Manado city. Area 2 — Tondano (Minahasa), Tomohon, Likupang, Bitung. Area 3 — South Minahasa, Southeast Minahasa. Area ${AREA_DIKONFIRMASI} and destinations outside this list: the area and its charge are agreed before departure.`,
        `On packages with a driver, fuel is included for up to ${TARIF_PELAYANAN.batasKmPerHari} km per rental day; journeys beyond that are agreed beforehand. We cover parking up to ${rp(TARIF_PELAYANAN.batasParkirPerHari, 'koma')} per rental day; tolls are not included.`,
        `Area charges on packages with a driver, per rental day: Area 1 ${rp(TARIF_PELAYANAN.area[1].kecil, 'koma')}; Area 2 ${rp(TARIF_PELAYANAN.area[2].kecil, 'koma')} for vehicles under ${AMBANG_MESIN_CC} cc and ${rp(TARIF_PELAYANAN.area[2].besar, 'koma')} above that; Area 3 ${rp(TARIF_PELAYANAN.area[3].kecil, 'koma')} and ${rp(TARIF_PELAYANAN.area[3].besar, 'koma')}.`,
        `On self-drive rentals there is no delivery charge when the vehicle is collected and returned at the Welcome Manado pool. Otherwise: Area 1 ${rp(TARIF_LEPAS_KUNCI.antarJemput[1], 'koma')}, Area 2 ${rp(TARIF_LEPAS_KUNCI.antarJemput[2], 'koma')}, Area 3 ${rp(TARIF_LEPAS_KUNCI.antarJemput[3], 'koma')}.`,
        `Self-drive use is limited to ${TARIF_LEPAS_KUNCI.batasKmPerHari} km per rental day; journeys beyond that are agreed beforehand.`,
      ],
      zh: [
        `Area 1 — 万鸦老市区。Area 2 — 通达诺（米纳哈萨）、多摩红、利库邦、比通。Area 3 — 南米纳哈萨、东南米纳哈萨。Area ${AREA_DIKONFIRMASI} 及不在此列的目的地，其区域与费用于出发前另行商定。`,
        `含司机套餐的燃油已包含每租期日 ${TARIF_PELAYANAN.batasKmPerHari} 公里以内；超出部分须事先商定。停车费由我们承担每租期日最高 ${rp(TARIF_PELAYANAN.batasParkirPerHari)}；通行费不包含在内。`,
        `含司机套餐的区域费用（按租期日计）：Area 1 ${rp(TARIF_PELAYANAN.area[1].kecil)}；Area 2 为 ${AMBANG_MESIN_CC} cc 以下车辆 ${rp(TARIF_PELAYANAN.area[2].kecil)}、以上车辆 ${rp(TARIF_PELAYANAN.area[2].besar)}；Area 3 分别为 ${rp(TARIF_PELAYANAN.area[3].kecil)} 与 ${rp(TARIF_PELAYANAN.area[3].besar)}。`,
        `自驾租车于 Welcome Manado 车场取还车不收接送费；否则：Area 1 ${rp(TARIF_LEPAS_KUNCI.antarJemput[1])}、Area 2 ${rp(TARIF_LEPAS_KUNCI.antarJemput[2])}、Area 3 ${rp(TARIF_LEPAS_KUNCI.antarJemput[3])}。`,
        `自驾租车每租期日上限 ${TARIF_LEPAS_KUNCI.batasKmPerHari} 公里；超出部分须事先商定。`,
      ],
      ko: [
        `Area 1 — 마나도 시내. Area 2 — 톤다노(미나하사), 토모혼, 리쿠팡, 비퉁. Area 3 — 남미나하사, 남동미나하사. Area ${AREA_DIKONFIRMASI} 및 목록에 없는 목적지는 지역과 요금을 출발 전에 협의합니다.`,
        `기사 포함 패키지는 대여일당 ${TARIF_PELAYANAN.batasKmPerHari}km까지 연료가 포함되며, 이를 넘는 일정은 사전에 협의합니다. 주차료는 대여일당 ${rp(TARIF_PELAYANAN.batasParkirPerHari)}까지 저희가 부담하며, 통행료는 포함되지 않습니다.`,
        `기사 포함 패키지의 지역 요금(대여일 기준): Area 1 ${rp(TARIF_PELAYANAN.area[1].kecil)}, Area 2는 ${AMBANG_MESIN_CC}cc 미만 ${rp(TARIF_PELAYANAN.area[2].kecil)} · 초과 ${rp(TARIF_PELAYANAN.area[2].besar)}, Area 3는 ${rp(TARIF_PELAYANAN.area[3].kecil)}와 ${rp(TARIF_PELAYANAN.area[3].besar)}입니다.`,
        `자차 운전 대여는 Welcome Manado 차고지에서 인수·반납하시면 배차 요금이 없습니다. 그 외에는 Area 1 ${rp(TARIF_LEPAS_KUNCI.antarJemput[1])}, Area 2 ${rp(TARIF_LEPAS_KUNCI.antarJemput[2])}, Area 3 ${rp(TARIF_LEPAS_KUNCI.antarJemput[3])}입니다.`,
        `자차 운전 대여는 대여일당 ${TARIF_LEPAS_KUNCI.batasKmPerHari}km까지 이용하실 수 있으며, 이를 넘는 일정은 사전에 협의합니다.`,
      ],
    },
  },

  {
    id: 'data-pribadi',
    judul: {
      id: 'Data pribadi',
      en: 'Personal data',
      zh: '个人资料',
      ko: '개인정보',
    },
    isi: {
      id: [
        'Data yang Anda kirimkan lewat formulir di situs ini — nama, nomor WhatsApp, email, dan catatan — kami gunakan hanya untuk memproses pemesanan dan menghubungi Anda.',
        'Kami tidak menjual atau menyerahkan data Anda kepada pihak ketiga untuk keperluan pemasaran.',
        'Anda dapat meminta data Anda dihapus dari catatan kami kapan saja lewat WhatsApp, kecuali data yang wajib kami simpan untuk keperluan pembukuan.',
      ],
      en: [
        'The details you send through the forms on this site — name, WhatsApp number, email, and notes — are used only to process your booking and to contact you.',
        'We do not sell or pass your details to third parties for marketing.',
        'You may ask us to delete your details from our records at any time via WhatsApp, except for records we are required to keep for accounting purposes.',
      ],
      zh: [
        '您通过本站表单提交的资料——姓名、WhatsApp 号码、电子邮箱与备注——仅用于处理订单及与您联系。',
        '我们不会为营销目的出售或转交您的资料予第三方。',
        '除依法须保存的账务记录外，您可随时通过 WhatsApp 要求我们删除您的资料。',
      ],
      ko: [
        '본 사이트 양식으로 보내 주신 정보 — 성함, WhatsApp 번호, 이메일, 메모 — 는 예약 처리와 연락 목적으로만 사용합니다.',
        '마케팅 목적으로 제3자에게 정보를 판매하거나 제공하지 않습니다.',
        '회계상 보관 의무가 있는 기록을 제외하고, WhatsApp을 통해 언제든 정보 삭제를 요청하실 수 있습니다.',
      ],
    },
  },

  {
    id: 'hukum',
    judul: {
      id: 'Hukum yang berlaku',
      en: 'Governing law',
      zh: '适用法律',
      ko: '준거법',
    },
    isi: {
      id: [
        'Perjanjian sewa ini tunduk pada hukum Republik Indonesia.',
        'Perselisihan diupayakan diselesaikan secara musyawarah lebih dulu. Bila tidak tercapai, penyelesaiannya melalui pengadilan yang berwenang di Manado.',
        'Ketentuan ini dapat berubah sewaktu-waktu. Yang berlaku bagi pemesanan Anda adalah ketentuan yang tayang pada saat pemesanan dikonfirmasi.',
      ],
      en: [
        'This rental agreement is governed by the laws of the Republic of Indonesia.',
        'Disputes are to be settled by discussion first. Failing that, they are resolved through the competent court in Manado.',
        'These terms may change from time to time. The version that applies to your booking is the one published when your booking was confirmed.',
      ],
      zh: [
        '本租赁协议适用印度尼西亚共和国法律。',
        '争议应先经友好协商解决；协商不成的，提交万鸦老有管辖权的法院处理。',
        '本条款可能不时修订。适用于您订单的，是订单确认当时所公布的版本。',
      ],
      ko: [
        '본 대여 계약에는 인도네시아 공화국 법이 적용됩니다.',
        '분쟁은 먼저 협의로 해결하며, 협의가 이루어지지 않을 경우 마나도의 관할 법원을 통해 해결합니다.',
        '본 약관은 수시로 변경될 수 있습니다. 귀하의 예약에 적용되는 것은 예약이 확정된 시점에 게시되어 있던 버전입니다.',
      ],
    },
  },
];
