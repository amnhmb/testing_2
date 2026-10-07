PRODUCT REQUIREMENTS DOCUMENT

Platform Web Kad Kahwin Digital — Mobile-First

Servis membina laman web kad jemputan majlis perkahwinan (dan majlis lain) yang dioptimumkan sepenuhnya untuk pengalaman pengguna telefon bimbit.

Versi 1.0  |  Ogos 2026

1. Ringkasan Eksekutif

Produk ini ialah platform servis untuk membina laman web kad jemputan majlis perkahwinan digital (extend kepada majlis lain seperti aqiqah, hari jadi, dan tribute) yang direka khusus dengan keutamaan pengalaman pengguna telefon bimbit (mobile-first), memandangkan hampir semua tetamu akan membuka pautan jemputan melalui WhatsApp terus dari telefon.

Berbeza dengan kebanyakan platform tempatan yang menumpukan kepada design template semata-mata, produk ini bertujuan menggabungkan amalan terbaik dari platform bertaraf antarabangsa (Zola, WithJoy, The Knot, Minted) — terutamanya dari segi pengurusan tetamu (guest management), RSVP pintar, dan pengalaman hari-H — sambil kekal berpatutan mengikut jangkaan harga pasaran Malaysia.

Matlamat utama: Bina laman kad kahwin yang selesa dan pantas digunakan sepenuhnya dari telefon — dari sudut tetamu (buka pautan, RSVP, bagi ucapan) dan dari sudut pengantin (isi maklumat, semak senarai tetamu).

Model kos: Kos operasi rendah (hosting percuma via Cloudflare Pages, domain custom ~RM150/tahun) membolehkan harga jualan kompetitif berbanding pasaran.

2. Masalah & Peluang Pasaran

2.1 Masalah Semasa

Kad kahwin fizikal memerlukan kos cetak, kos pos, dan tempoh masa lama untuk diedarkan.

Ramai platform kad kahwin digital tempatan menumpukan design cantik tetapi kurang fungsi pengurusan tetamu yang sistematik (masih guna borang Google Form berasingan atau tiada RSVP langsung).

Kebanyakan platform sedia ada tidak direka dengan mobile-first sepenuhnya — sesetengah still memerlukan zoom, butang kecil, atau load perlahan di talian mudah alih (4G/5G).

Struktur majlis dua sesi/dua hari (lazim dalam majlis Melayu) jarang disokong secara sistematik dalam borang RSVP platform sedia ada — biasanya cuma dipaparkan sebagai teks huraian, bukan pilihan interaktif.

2.2 Peluang

Pasaran Malaysia nampak kompetitif dari segi harga headline (RM10–RM80), tetapi kajian mendapati harga rendah selalunya untuk kad STATIK sahaja — RSVP, muzik, dan gallery kerap dikenakan caj add-on berasingan (contoh: harga asas RM30, tambah RM15 setiap satu untuk RSVP/muzik/gallery, menjadikan jumlah sebenar ~RM75 untuk fungsi setanding). Ini membuka ruang differentiate dengan model "semua fungsi penting termasuk dari harga asas", bukan harga rendah yang mengelirukan.

90% pasangan kini membuat laman web kahwin sebagai sebahagian daripada perancangan majlis mereka — trend global menunjukkan permintaan berterusan meningkat.

Kos operasi rendah (hosting percuma, domain murah) membolehkan margin keuntungan tinggi walaupun harga jualan kompetitif.

3. Pengguna Sasaran (Target Users)

3.1 Pengguna Utama — Pengantin ("Admin")

Pasangan bakal berkahwin, umur anggaran 24–35 tahun, biasa menggunakan telefon pintar sebagai peranti utama.

Perlukan cara pantas dan mudah untuk isi maklumat majlis, semak senarai RSVP, dan kongsi pautan jemputan.

3.2 Pengguna Sekunder — Tetamu Jemputan

Rangkaian umur luas (18–70 tahun) — kumpulan lebih tua mungkin kurang mahir teknologi, jadi antara muka perlu sangat ringkas dan intuitif.

99% akan mengakses pautan melalui WhatsApp/Telegram terus dari telefon — bukan desktop.

Tindakan utama: buka pautan, tengok lokasi/tarikh, RSVP, bagi ucapan, mungkin transfer salam kaut digital.

4. Prinsip Reka Bentuk Mobile-First

Bahagian ini merumuskan amalan terbaik antarabangsa (Nielsen Norman Group, Baymard Institute) yang wajib dipatuhi dalam pembangunan produk ini, memandangkan majoriti tetamu akan mengakses laman ini melalui telefon.

4.1 Prestasi & Kelajuan

Laman mesti load pantas walaupun pada sambungan data perlahan — mampatkan (compress) semua gambar dan aset sebelum dimuat naik.

Guna lazy loading untuk kandungan luar skrin (contoh: gallery gambar) supaya laman utama load segera.

Elak animasi/JavaScript berat yang boleh melambatkan masa muat pada peranti pertengahan-bawah.

4.2 Sentuhan & Navigasi (Touch & Navigation)

Semua butang/target sentuhan (RSVP, buka Waze, dsb) minimum saiz 44×44 piksel supaya senang ditekan dengan ibu jari.

Navigasi mesti "thumb-friendly" — letak elemen penting (butang RSVP, navigasi) pada zon mudah capaian ibu jari (bahagian bawah/tengah skrin), bukan di penjuru atas yang sukar dicapai bertangan satu.

Guna reka bentuk responsive dengan viewport meta tag yang betul supaya laman auto-sesuaikan mengikut saiz skrin peranti.

4.3 Kebolehbacaan (Legibility)

Saiz font teks badan minimum 16 piksel — elak keperluan zoom untuk membaca maklumat asas seperti tarikh dan lokasi.

Kontras warna teks dan latar belakang mesti tinggi untuk kebolehbacaan, terutama bagi tetamu lebih berusia.

4.4 Borang RSVP Mesra Mobile

Setiap medan tambahan dalam borang meningkatkan risiko tetamu berhenti separuh jalan — hadkan borang RSVP kepada medan penting sahaja (nama, kehadiran, bilangan tetamu).

Tandakan dengan jelas medan wajib berbanding medan pilihan (optional) — amalan ini masih jarang dilaksanakan dengan baik walaupun oleh platform besar.

Elak keyboard popup yang salah jenis (contoh: guna keyboard nombor untuk medan bilangan tetamu, bukan keyboard teks penuh).

4.5 Kebolehcapaian (Accessibility)

Guna struktur HTML semantik (heading, label) supaya mesra kepada teknologi bantuan (assistive technology) bagi tetamu kurang upaya penglihatan.

Pastikan kontras warna memenuhi piawaian kebolehcapaian asas.

5. Fungsi Mengikut Pakej (Guest-Facing Features)

Bahagian ini menyenaraikan fungsi yang dilihat/digunakan oleh tetamu, disusun mengikut tiga peringkat pakej. Setiap pakej merangkumi semua fungsi pakej sebelumnya, ditambah fungsi baharu.

5.1 Pakej BASIC (RM40)

Maklumat Pengantin & Majlis

Nama penuh & nama panggilan pengantin (contoh "Sarah & Ahmad")

"Anak kepada..." — nama ibu bapa kedua-dua belah

Gambar pengantin (1 gambar hero)

Tarikh, hari, masa, lokasi majlis

Dress code / tema warna majlis (paparan swatch warna)

Navigasi & Kontak

Butang navigasi terus ke Waze/Google Maps

Butang Hubungi — WhatsApp/panggilan terus kepada contact person majlis

Reka Bentuk & Multimedia

1 tema design siap (pilih daripada koleksi template)

Countdown timer ke tarikh majlis (statik)

Muzik latar tema tetap — satu lagu instrumental royalty-free ditetapkan platform (bukan pilihan tetamu/pengantin) untuk elak risiko iklan YouTube dan isu hak cipta

Animasi scroll reveal ringan (kandungan muncul lembut semasa skrol)

RSVP & Hadiah

Borang RSVP asas: nama, status kehadiran, bilangan tetamu

Salam kaut digital — kod QR DuitNow / nombor akaun bank

5.2 Pakej STANDARD (RM70 – RM75)

Merangkumi semua fungsi Pakej Basic, ditambah:

Maklumat Tambahan

"Kisah Kami" (Our Story) — teks & gambar perjalanan pasangan

Atur cara majlis (susunan penuh: ketibaan, jamuan, sesi bergambar, dll)

Info penginapan untuk tetamu jauh (cadangan hotel/homestay)

Pautan media sosial pengantin (Instagram/TikTok, hashtag majlis)

Soalan Lazim (FAQ) — parking, boleh bawa anak, dll

Versi cetak ringkas (print-friendly) — untuk tetamu warga emas kurang selesa digital

Multimedia

Galeri gambar (multiple, bukan satu gambar sahaja)

RSVP & Pengurusan Tetamu — Fungsi Utama Differentiator

Pemilih Sesi (Session Selector) — lihat 5.2.1 di bawah

Nombor telefon tetamu (untuk follow-up)

Bilangan dewasa & kanak-kanak diasingkan

Nota alahan & pantang makanan (ruang teks bebas, optional) — sesuai konteks buffet/prasmanan Malaysia

Guestbook — ruang ucapan & doa restu daripada tetamu

Interaksi

Butang "Simpan ke Kalendar" (Google Calendar/iCalendar)

Animasi amplop terbuka semasa laman dibuka

Animasi confetti bila RSVP berjaya dihantar

5.2.1 Pemilih Sesi (Session Selector) — Differentiator Utama

Majoriti majlis perkahwinan Melayu di Malaysia dijalankan dalam dua sesi atau dua hari berasingan (contoh: sesi pagi untuk keluarga pengantin perempuan, sesi petang untuk keluarga pengantin lelaki; atau akad nikah dan resepsi pada hari berlainan). Kajian pasaran mendapati platform kad kahwin digital tempatan sedia ada tidak menyediakan fungsi RSVP yang membenarkan tetamu memilih sesi kehadiran secara berasingan — struktur sesi biasanya hanya dipaparkan sebagai teks huraian, bukan sebagai pilihan interaktif dalam borang RSVP. Ini menjadikan Pemilih Sesi satu peluang differentiator yang kukuh untuk produk ini, bukan sekadar tambahan kosmetik.

Cara berfungsi: Tetamu memilih sesi berkenaan (Sesi Pagi / Sesi Petang / Kedua-dua sesi, atau Hari Sabtu / Hari Ahad) semasa mengisi borang RSVP

Manfaat: Pengantin dapat kiraan pax tepat mengikut setiap sesi berasingan — penting untuk perancangan katering dan susunan tempat duduk setiap sesi, bukan sekadar jumlah keseluruhan

Paparan dashboard: Senarai tetamu dipecahkan mengikut sesi dalam dashboard pengantin, bukan senarai tunggal bercampur

5.3 Pakej PREMIUM (RM150 – RM250)

Merangkumi semua fungsi Pakej Standard, ditambah:

Reka Bentuk & Personalisasi

Design fully custom — warna, font, dan layout ikut tema pasangan

Toggle Tema Paparan — 2-3 skema warna web yang tetamu boleh pilih sendiri (bukan dress code; ini fungsi visual laman)

Splash screen dengan nama tetamu (contoh "Buat Ahmad & Keluarga") sebelum laman utama dipaparkan

Toggle multi-bahasa (Bahasa Malaysia / English)

Lagu tema custom mengikut pilihan pengantin (menggantikan lagu tema tetap Basic/Standard) — tertakluk kepada semakan hak cipta/lesen sebelum digunakan

Multimedia Lanjutan

Video love story pendek

Galeri gaya polaroid/masonry (bukan grid kaku)

Tap-to-reveal caption pada gambar galeri

Animasi pemain muzik (vinyl/cassette berputar)

Timeline interaktif "Kisah Kami" — setiap milestone muncul semasa skrol

RSVP & Guestbook Kreatif

Borang RSVP gaya kreatif (Chat Bubble atau Typeform-style — satu soalan satu skrin)

Wall of wishes — ucapan tetamu dipaparkan sebagai collage, bukan senarai lurus

Pilihan hantar ucapan secara suara (voice message) dalam guestbook

Countdown timer bergaya flip-clock animation

Hadiah & Privasi

Senarai Hadiah/Registry — pautan wishlist produk dari kedai luar

Kata laluan (password protection) — hadkan akses laman kepada tetamu jemputan sahaja

Automasi

Peringatan RSVP automatik melalui WhatsApp (H-7, H-1)

5.4 Add-On Berbayar (Berasingan, Semua Pakej)

Add-On

Penerangan

Harga Cadangan

Galeri Kenangan Pasca-Majlis

Tetamu muat naik gambar/video selepas majlis melalui QR, terkumpul jadi galeri kenangan bersama

RM20 – RM30

QR Check-In Kehadiran

QR unik setiap tetamu untuk rekod kehadiran sebenar di hari majlis; sesuai majlis besar/rasmi

RM30 – RM50

Bahasa Tambahan

Toggle bahasa Mandarin/Tamil untuk majlis pelbagai kaum

RM15 – RM20

5.5 Pakej Dwi-Majlis (Majlis Lelaki & Perempuan Berasingan)

Lazim dalam majlis perkahwinan Melayu, majlis pihak lelaki dan pihak perempuan diadakan berasingan — tarikh, lokasi, dan malah senarai tetamu yang berbeza sama sekali. Pakej ini membolehkan kedua-dua majlis berkongsi satu subdomain bernama gabungan pasangan, tanpa mengelirukan tetamu bahawa mereka dijemput ke kedua-dua majlis.

Struktur Hierarki

Domain (milik platform): jemput.my

Subdomain (khusus pasangan, nama gabungan kekal): sarah-ahmad.jemput.my

Laman Hub (root "/") — untuk KEGUNAAN PENGANTIN SAHAJA, bukan dihantar kepada tetamu; memaparkan pautan ke kedua-dua majlis untuk semakan/preview pengantin

Sub-path /majlis-lelaki — laman penuh berasingan, dihantar khusus kepada tetamu pihak lelaki

Sub-path /majlis-perempuan — laman penuh berasingan, dihantar khusus kepada tetamu pihak perempuan

Prinsip Reka Bentuk Hub

Hub TIDAK menggunakan tema warna mana-mana majlis (kerana kedua-dua majlis lazimnya bertema berbeza). Hub menggunakan reka bentuk neutral — gambar pengantin bersama, nama gabungan, dan dua kad pautan (dengan thumbnail pratonton tema setiap majlis) untuk navigasi pengantin sahaja.

SOP Wajib

PENTING: Pautan root/hub TIDAK BOLEH dihantar kepada tetamu. Hanya pautan sub-path spesifik (/majlis-lelaki atau /majlis-perempuan) yang dikongsi, mengikut kumpulan tetamu yang berkenaan — bagi mengelakkan tetamu tersalah anggap mereka dijemput ke kedua-dua majlis. Root/hub boleh dilindungi kata laluan sebagai langkah tambahan.

Cadangan Harga (Bundle)

Pakej

Harga 2 Laman Berasingan Penuh

Harga Bundle Dwi-Majlis

Jimat

Basic

RM80

RM70

RM10

Standard

RM140 – RM150

RM120

~RM25

Premium

RM300 – RM500

RM260

~RM100

Diskaun bundle diberikan kerana elemen dikongsi (gambar pengantin, "Kisah Kami", muzik tema) tidak perlu diulang sepenuhnya untuk kedua-dua laman, menjimatkan masa kerja.

5.6 Caj Perkhidmatan Express

Memandangkan produk ini bersifat done-for-you (design & setup dilakukan oleh platform, bukan editor self-serve), tempoh siap normal adalah 1–5 hari bekerja mengikut pakej. Caj tambahan dikenakan untuk permintaan tempoh lebih singkat:

Pakej

Tempoh Normal

Express (24 Jam)

Caj Tambahan

Basic

1–2 hari

+RM15 – RM20

~40%

Standard

2–3 hari

+RM30 – RM35

~45%

Premium

3–5 hari

+RM60 – RM75

~45–50%

Dasar caj express perlu dinyatakan dengan jelas dari awal (dalam senarai harga/FAQ), bukan dimaklumkan pada saat akhir. Platform berhak menolak permintaan express jika beban kerja semasa tidak mengizinkan.

6. Fungsi Pengurusan Pengantin (Admin / Dashboard)

Berbeza daripada fungsi guest-facing di Bahagian 5, fungsi berikut adalah untuk kegunaan pengantin sendiri bagi menguruskan laman dan data tetamu. Fungsi ini disediakan secara standard merentasi SEMUA pakej (Basic, Standard, Premium) — bukan mengikut tier — kerana ia asas kepada nilai produk itu sendiri, selaras dengan amalan platform tempatan dan antarabangsa yang menjadikan kebolehkemaskinian sebagai titik jualan utama.

Kemaskini maklumat majlis bila-bila masa (tarikh, lokasi, atur cara) — perubahan terpapar serta-merta kepada semua yang memegang pautan

Dashboard ringkasan RSVP — jumlah hadir/tidak hadir, pecahan mengikut sesi, jumlah pax dikemas kini secara live

Eksport senarai tetamu (Excel/PDF) — untuk diserahkan terus kepada caterer atau ahli keluarga

Notifikasi RSVP baharu — makluman ke e-mel/WhatsApp pengantin setiap kali ada tetamu baharu merespons

Tempoh sah laman (validity period) — laman kekal aktif sehingga tempoh ditetapkan (contoh 3-6 bulan selepas tarikh majlis), selaras dengan model harga sekali bayar

7. Seni Bina Teknikal (Technical Architecture)

Komponen

Pilihan Cadangan

Sebab

Hosting

Cloudflare Pages

Bandwidth tanpa had (free tier), laju, sesuai untuk static site

Domain

Custom domain (.my / .com)

Kredibiliti & kepercayaan pelanggan; subdomain per pelanggan

Storan gambar/video

Cloudflare R2

Tiada caj bandwidth egress — kritikal untuk fungsi galeri kenangan

Data RSVP

Google Sheets (Apps Script) atau Supabase

Ringan untuk data teks; senang disemak pelanggan

Frontend

HTML/CSS/JS statik, responsive

Prestasi pantas, kos hosting rendah, mudah mobile-first

8. Ringkasan Struktur Harga (Pricing) — Rujukan Pasaran

Kajian pasaran awal menunjukkan julat harga headline RM10–RM80, tetapi analisis lanjut mendapati harga rendah tersebut kerap tidak termasuk fungsi RSVP/muzik/gallery (dikenakan sebagai add-on berasingan). Setanding fungsi penuh, purata harga pasaran sebenar adalah ~RM55–RM75 (rujukan: Lakarra Ultimate RM55, Tuan Majlis RM59.90, SeriJemput RM59.90, CODIGITAL Deluxe RM57, Nurfa dengan add-on penuh ~RM75). Ringkasan pakej produk ini (butiran penuh fungsi setiap pakej — lihat Bahagian 5):

Pakej

Ringkasan Fungsi

Harga Cadangan

Basic

Maklumat majlis, 1 tema, countdown, muzik, RSVP asas, salam kaut — SEMUA TERMASUK

RM40

Standard

+ Pemilih Sesi, Kisah Kami, gallery, guestbook, FAQ, animasi amplop & confetti

RM70 – RM75

Premium

+ Design custom, RSVP kreatif, wall of wishes, registry, password protection

RM150 – RM250

Nota: Fungsi Pengurusan Pengantin (Bahagian 6) disediakan secara standard untuk semua pakej di atas. Berbeza daripada model pesaing (contoh Nurfa) yang mengenakan caj add-on berasingan untuk RSVP/muzik/gallery, kesemua fungsi asas produk ini disediakan dalam harga pakej — menjadi titik jualan ("tiada caj tersembunyi") berbanding pasaran.

9. Metrik Kejayaan (Success Metrics)

Masa muat laman (load time) di bawah 3 saat pada sambungan 4G purata

Kadar penyempurnaan borang RSVP (RSVP completion rate) — sasaran >90% tetamu yang buka borang berjaya submit

Bilangan pelanggan baharu setiap bulan

Kadar ulangan (repeat/referral) — pelanggan mengesyorkan kepada rakan/saudara

10. Rujukan Amalan Terbaik

Dokumen ini dirujuk daripada kajian pasaran tempatan (Lakarra, MajlisKenduri, Kad Undangan MY, eJemputan, Kahwin Studio, Tuan Majlis, OnlineKad, KahwinNow, CODIGITAL, Nurfa Grafik) serta platform bertaraf antarabangsa (Zola, WithJoy, The Knot, Minted, Squarespace, InviteCount) dan penyelidikan UX mudah alih daripada Nielsen Norman Group dan Baymard Institute.