// ==========================================
// MASTER CONFIGURATION FILE
// Sila edit fail ini untuk menukar data klien
// ==========================================

const clientConfig = {
  // 1. TEMA WARNA & FONTS
  theme: {
    warnaBackground: "#0F172A",    // --bg (Warna utama gelap)
    warnaSurface: "#1E293B",       // --surface (Warna kad/kotak)
    warnaSampul: "#f7eedf",        // --envelope (Warna kertas sampul surat)
    warnaWax: "#8a131b",           // --wax (Warna cop lilin / wax seal)
    warnaAccent: "#E2E8F0",        // --accent (Warna highlight teks seperti nama)
    warnaAset: "#E2E8F0",          // --asset (Warna untuk corak, divider, mask)
    warnaAmpersand: "#94A3B8",     // --ampersand (Warna khas untuk simbol '&')
    warnaBayang: "rgba(0, 0, 0, 0.4)",        // --shadow (Warna bayang-bayang / drop-shadow teks)
    warnaText: "#F1F5F9",          // --text (Teks biasa)
    warnaTextMuted: "#94A3B8",     // --text-muted (Teks kelabu/pudar)
    warnaBorder: "rgba(226, 232, 240, 0.15)", // --border
    fontUtama: "'Inter', sans-serif",
    fontTajuk: "'Lora', serif"
  },

  // 2. MAKLUMAT PENGANTIN & TEKS
  pengantin: {
    pageTitle: "Walimatul Urus | Aisyah & Hakim",
    tajukKad: "Walimatul Urus",
    salamPembuka: "Assalamualaikum W.B.T & Salam Sejahtera",
    teksJemputan: "Dengan penuh kesyukuran ke hadrat Ilahi, kami berbesar hati menjemput Dato'/Datin/Tuan/Puan ke majlis perkahwinan kami",
    namaPenuhLelaki: "Hakim Bin Zakaria",
    namaPenuhPerempuan: "Aisyah Binti Othman",
    namaGabungan: "Aisyah & Hakim",
    inisial: "A & H", // Untuk logo di atas (Navbar)
    hashtag: "#AisyahHakim2026"
  },

  // 3. MAKLUMAT IBU BAPA
  keluarga: {
    teksHubungan: "Anak kepada",
    bapaPengantin: "En. Roslan bin Hasan",
    ibuPengantin: "Pn. Aminah binti Yusuf"
  },

  // 4. MAKLUMAT MAJLIS
  majlis: {
    tajukMajlis: "Majlis Perkahwinan",
    tarikh: "Sabtu, 24 Oktober 2026",
    masa: "11:00 AM - 4:00 PM",
    namaLokasi: "Dewan Seri Angsana, Kuala Lumpur",
    alamatLokasi: "Jalan Ampang, 50450 Kuala Lumpur"
  },

  // 5. PAUTAN (Links & Butang Tindakan)
  pautan: {
    googleMaps: "https://maps.app.goo.gl/xxxx",
    waze: "https://waze.com/ul/xxxx",
    googleCalendar: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Walimatul+Urus+Aisyah+&+Hakim&dates=20261024T030000Z/20261024T080000Z&details=Majlis+Perkahwinan+Aisyah+dan+Hakim&location=Dewan+Seri+Angsana",
    appleCalendar: "./assets/client/invite.ics",
    rsvpApiUrl: "https://script.google.com/macros/s/xxxx/exec", // URL untuk hantar data form RSVP
    igLelaki: "https://instagram.com/hakim.k",
    igPerempuan: "https://instagram.com/aisyah_"
  },

  // 6. SENARAI TEMA WARNA (Untuk dipaparkan kepada tetamu)
  senaraiTemaWarna: [
    { kodWarna: "#0F172A", namaWarna: "Biru\nGelap" },
    { kodWarna: "#E2E8F0", namaWarna: "Perak\nKlasik" },
    { kodWarna: "#F8FAFC", namaWarna: "Putih\nSuci" }
  ],

  // 7. HUBUNGI KAMI (Array)
  hubungi: [
    { 
      nama: "Othman Bin Ali", 
      hubungan: "Bapa Pengantin", 
      panggilanBiasa: "tel:+60123456789", 
      whatsapp: "https://wa.me/60123456789" 
    },
    { 
      nama: "Siti Sarah", 
      hubungan: "Ibu Pengantin", 
      panggilanBiasa: "tel:+60198765432", 
      whatsapp: "https://wa.me/60198765432" 
    }
  ],

  // 8. ATUR CARA (Array)
  aturCara: [
    { masa: "11:00 AM", acara: "Ketibaan Tetamu Jemputan" },
    { masa: "12:30 PM", acara: "Ketibaan Pengantin & Selawat" },
    { masa: "01:00 PM", acara: "Sesi Makan Beradab & Sesi Bergambar" },
    { masa: "04:00 PM", acara: "Majlis Dijangka Tamat" }
  ],

  // 9. PENGINAPAN BERDEKATAN (Array)
  penginapan: [
    { 
      nama: "Hotel Seri Malaysia KL", 
      jarak: "Kira-kira 5km dari dewan majlis." 
    },
    { 
      nama: "Homestay Bonda", 
      jarak: "Sesuai untuk keluarga besar (3 bilik)." 
    }
  ],

  // 10. KISAH KAMI (Array)
  kisahKami: [
    { 
      gambar: "./assets/momenkita/cerita_jumpa.jpg", 
      tajuk: "Pertemuan Pertama", 
      teks: "Kami mula berkenalan sewaktu sama-sama menuntut di universiti. Dari seorang rakan sekelas, kini menjadi teman hidup." 
    },
    { 
      gambar: "./assets/momenkita/cerita_tunang.jpg", 
      tajuk: "Ikatan Janji", 
      teks: "Pada tanggal 1 Januari 2026, kami mengikat tali pertunangan dengan restu keluarga kedua-dua belah pihak." 
    },
    { 
      gambar: "./assets/momenkita/hero.webp", 
      tajuk: "Menuju Halal", 
      teks: "Kini, kami menanti hari bermakna untuk disatukan sebagai suami isteri. Doakan kelancaran majlis kami." 
    }
  ],

  // 11. INFO & FAQ (Array)
  infoFaq: [
    { soalan: "Di manakah tempat letak kereta?", jawapan: "Dewan mempunyai ruang tempat letak kereta percuma yang luas di perkarangan hadapan dan belakang." },
    { soalan: "Adakah tetamu boleh membawa kanak-kanak?", jawapan: "Ya, kanak-kanak dialu-alukan. Sila maklumkan bilangan kanak-kanak di dalam borang RSVP untuk rujukan makanan." }
  ],

  // 12. SALAM KAUT (Array)
  salamKaut: [
    { 
      namaBank: "Maybank", 
      namaAkaun: "Hakim bin Roslan", 
      noAkaun: "123456789012", 
      qrCode: "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
    }
  ],

  // 13. MEDIA & GAMBAR KESELURUHAN
  media: {
    kaligrafiKhat: "./assets/bunga_tanjung_design/bismillah_bunga_tanjung.webp",
    kaligrafiSampul: "./assets/momenkita/assalamualaikum.webp",
    ikonSeal: "./assets/momenkita/MK-dafault-transparent.webp",
    gambarHero: "./assets/momenkita/hero.webp",
    laguLatar: "./assets/audio/Ed_Sheeran-Perfect.mp3"
  }
};
