# Panduan Sistem Design

Dokumen rujukan estetik am. Guna ini sebagai asas apabila membina sebarang UI — bukan spesifik kepada mana-mana projek.

> **Nota penting:** Dokumen ini hanya letak *prinsip struktur* (rules, jadual size, batas ukuran). Apa-apa keputusan yang bergantung kepada **tema/identiti sebenar produk** — font, palette warna sebenar, icon library yang dipilih, gaya visual keseluruhan, rujukan animation/produk — **ikut fail research yang akan diberikan**, disemak dengan carian internet semasa. Jangan hardcode pilihan tema di sini.

## Prinsip Teras

1. **Selesa dibaca** — audience merentasi umur 18–70 tahun. Font size tidak boleh kecil sangat, contrast mesti cukup tinggi.
2. **Bersih, bukan kosong** — minimal tak bermaksud hambar. Setiap elemen ada sebab untuk wujud.
3. **Ikut konteks, bukan template** — border-radius, spacing, warna — semua ditentukan oleh apa yang sesuai untuk komponen itu, bukan disapu rata guna satu nilai untuk semua benda.
4. **Tiada kekusutan visual** — tiada elemen bertindih yang buat mata rasa tak selesa. Ruang lapang (whitespace) adalah bahagian design, bukan ruang kosong yang "tak terpakai".

---

## Yang DIELAKKAN (hard rules)

- ❌ **Gradient** — semua warna solid/flat. Tiada `linear-gradient`, `radial-gradient` untuk background, button, card, teks.
- ❌ **Glassmorphism** — tiada `backdrop-blur`, tiada background separuh lut sinar (translucent) bertindan dengan blur untuk kesan "kaca".
- ❌ **Emoji** — tiada 😀🚀✨ dalam UI (heading, button, label, status). Ganti dengan icon set yang konsisten dan dipilih ikut tema (rujuk fail research untuk library yang sesuai) — bukan icon random campur-campur.
- ❌ **Border-radius seragam** — jangan set `border-radius: 12px` global untuk semua benda (button, card, input, modal). Setiap komponen tentukan radius sendiri ikut fungsi (rujuk seksyen Radius di bawah).
- ❌ **"AI slop" look** — elak kombinasi klise: cream background + serif besar + accent terracotta/oren; dark background + satu accent neon; atau grid hairline broadsheet generik. Kalau design ni nampak boleh jadi landing page mana-mana startup, ubah sesuatu.
- ❌ **Overlapping tak selesa** — elak teks bertindih imej tanpa contrast layer yang jelas, elak card/modal bertindih content lain tanpa z-index & shadow yang tegas, elak elemen terlalu rapat sampai bertembung di breakpoint kecil.

---

## Typography

Font size minimum mesti selesa dibaca oleh mata umur 50+ tanpa zoom, tapi tak nampak "besar-besar" untuk pengguna muda.

| Peranan | Size (desktop) | Size (mobile) | Line-height | Weight |
|---|---|---|---|---|
| Body / paragraf | 16–18px | 16px | 1.5–1.6 | 400 |
| Label / caption | 14px (min) | 14px | 1.4 | 500 |
| H3 / sub-heading | 20–22px | 18–20px | 1.3 | 600 |
| H2 | 26–30px | 22–24px | 1.25 | 600–700 |
| H1 / hero | 36–48px | 28–32px | 1.15–1.2 | 700 |
| Button text | 15–16px | 15–16px | 1 | 500–600 |

**Aturan keras:**
- Jangan turun bawah 14px untuk sebarang teks yang perlu dibaca (bukan hiasan).
- Contrast text-background minimum WCAG AA (4.5:1 untuk body text, 3:1 untuk heading besar).
- Pilih 2 typeface sahaja: satu untuk heading (ada karakter, tapi tetap mudah dibaca — bukan display font yang terlalu artistik), satu untuk body (sangat neutral & jelas). Jangan guna default system font sahaja kalau nak nampak "designed" — tapi jangan pilih font yang extreme/eksperimen.
- Letter-spacing body: normal (0). Letter-spacing untuk label huruf besar (uppercase): sedikit positif (0.02–0.05em) supaya tak sesak.

### Pemilihan Font Ikut Tema

Font tidak di-hardcode dalam dokumen ini. Pemilihan pasangan heading/body kena ditentukan ikut:
1. Fail research/rujukan projek yang akan diberikan (tema, industri, audience sebenar).
2. Carian internet semasa untuk cari font yang sesuai & sedang relevan/dipakai produk sebenar dalam kategori sama — bukan senarai statik yang boleh jadi lapuk.

Aturan am tetap terpakai walau apa jua font dipilih: heading berkarakter → body mesti neutral (jangan dua-dua "loud"); elak font display/condensed sebagai body untuk audience umur luas (18–70); weight heading elak terlalu tebal (800–900) melainkan untuk hero besar sahaja.

---

## Warna

- Semua flat/solid. Palette 4–6 warna bernama (contoh: `--bg`, `--surface`, `--text`, `--text-muted`, `--accent`, `--border`).
- Satu accent color utama sahaja. Guna untuk action penting (button primary, link, status aktif) — bukan tabur merata.
- Dark mode / light mode: pastikan contrast dikekalkan pada kedua-dua, jangan hanya invert.
- Warna status (success/warning/error) — guna warna standard yang boleh dikenali terus (hijau/kuning/merah), jangan kreatif sangat sampai orang tak faham maksud.

---

## Border-Radius (ikut konteks)

Jangan satu nilai untuk semua. Contoh panduan:

| Komponen | Radius |
|---|---|
| Button kecil / tag / badge | 4–6px (tajam sikit, rasa "klik") |
| Card besar / panel | 8–12px |
| Modal / dialog | 12–16px |
| Input field | 6–8px |
| Avatar / icon bulat | 50% (full round) sahaja bila memang perlu bentuk bulat |
| Table / list row | 0px biasanya — biar garis lurus, jangan buat setiap row jadi "card" |

Kalau tema design itu sendiri tajam & structured (contoh: dashboard data, fintech serius) — radius keseluruhan lagi kecil/tajam (0–4px). Kalau tema lebih santai/consumer — radius lagi besar. Tapi dalam satu sistem, kekalkan hierarki: elemen kecil radius kecil, elemen besar radius lebih besar — bukan terbalik.

---

## Icon (ganti emoji)

- Library icon spesifik ditentukan ikut fail research/tema projek — bukan hardcode di sini. Yang penting: satu library konsisten sahaja sepanjang produk (jangan campur pelbagai sumber icon + emoji dalam page yang sama).
- Icon mesti selaras stroke-width dan size dengan teks di sebelahnya (biasanya 16–20px untuk inline, 20–24px untuk button/nav).
- Icon warna: ikut `--text` atau `--text-muted` untuk state neutral, `--accent` untuk state aktif/hover — bukan warna pelangi random.
- Icon dipilih ikut makna sebenar (contoh: loceng untuk notification, bukan bunyi bell emoji), bukan sekadar "nampak cantik".

---

## Layout & Spacing

- Guna spacing scale konsisten (contoh: 4, 8, 12, 16, 24, 32, 48, 64px) — jangan nilai random macam 13px, 27px.
- Setiap section/card ada breathing room minimum — jangan padatkan content sampai margin nyaris 0.
- Elak z-index perang: kalau ada elemen overlap (dropdown, tooltip, modal), pastikan shadow/backdrop cukup jelas supaya mata terus faham mana "di atas" dan mana "di bawah" — bukan sekadar bertindih rata tanpa depth yang jelas.
- Responsive: pada mobile, elemen yang side-by-side di desktop kena stack menegak — jangan biar ia mengecil sampai bertindih atau terpotong.

---

## Wireframe ASCII (untuk ideation layout)

Sebelum bina UI sebenar, lakar struktur guna ASCII wireframe — teknik lama (box-drawing character) yang masih dipakai sebab pantas, boleh disimpan sebagai text dalam dokumen/PR, dan tak mengganggu fikiran dengan warna/font dulu (fokus struktur sahaja).

**Konvensyen standard:**

| Elemen | Simbol |
|---|---|
| Kotak/bingkai | `┌ ┐ └ ┘ │ ─` (atau versi ringkas `+ - \|`) |
| Header/pembahagi seksyen | `====` atau `----` |
| Button | `[ Label Button ]` |
| Input field | `[______________]` |
| Navigation | `> Home \| Cari \| Profil` |
| Ruang konten/column | `\|` untuk lajur, `-` untuk baris |

**Twist untuk sistem ini (fokus phone):** konvensyen ASCII wireframe biasa direka untuk desktop — tak ambil kira bagaimana ibu jari sebenarnya menjangkau skrin. Untuk sistem fokus mobile ini, **tambah lapisan anotasi thumb-zone & gesture terus dalam ASCII wireframe**, supaya keputusan letak elemen bukan sekadar "nampak kemas" tapi juga "senang capai dengan ibu jari".

Tanda zon (letak di tepi kanan wireframe):
- `(M)` = Mudah capai — zon selesa ibu jari (1/3 bawah skrin biasanya)
- `(R)` = Regang — boleh capai tapi perlu regang sikit (tengah skrin)
- `(J)` = Jauh — payah capai sebelah tangan, letak elemen kurang kritikal di sini (atas skrin)

Tanda gesture (letak dekat elemen berkenaan):
- `→` swipe kanan, `←` swipe kiri, `↑` swipe naik, `↓` swipe turun / pull-to-refresh
- `⟳` tap-and-hold / long-press
- `••` dot indicator (carousel/pagination)

**Contoh wireframe mobile dengan anotasi thumb-zone:**

```
┌───────────────────────┐
│ ← Tajuk Page      ⋮   │ (J) — header, elemen sekunder je letak sini
├───────────────────────┤
│                       │
│   [ Gambar/Kandungan ]│ (J)
│                       │
├───────────────────────┤
│  Tajuk item           │
│  Penerangan ringkas   │ (R) — boleh scroll ↕, tapi bukan CTA utama
├───────────────────────┤
│                       │
│   [   CTA Utama   ]   │ (M) — letak action penting di sini,
│   [   CTA Kedua   ]   │ (M)   senang ibu jari capai tanpa regang
│                       │
│  ⟳ tap-hold untuk opsi │
├───────────────────────┤
│  [Nav1] [Nav2] [Nav3]  │ (M) — bottom nav, zon paling mudah capai
└───────────────────────┘
```

**Kenapa twist ini berbaloi:** ia paksa keputusan hierarki dibuat lebih awal — sebelum reka bentuk visual — supaya action paling penting (checkout, hantar, simpan) memang diletak di zon `(M)`, bukan atas skrin yang "kelihatan logik" tapi sebenarnya susah dicapai satu tangan. Ini terus sejajar dengan keutamaan sistem ini: mobile-first, senang guna untuk audience umur luas (18–70) yang genggaman & jangkauan ibu jari berbeza-beza.

**Bila guna:** setiap kali reka screen/flow baru, lakar ASCII + anotasi thumb-zone dulu sebelum sentuh warna/font/component sebenar. Kalau ada banyak CTA bersaing nak duduk di zon `(M)`, itu tanda perlu semak semula hierarki — bukan paksa semua masuk zon sama.

---

## Mobile / Touch (fokus utama sistem ini)

Sistem ini fokus kepada pengguna phone. Default browser mobile selalu bagi highlight biru (tap highlight) bila user tekan elemen — ini **kena dibuang** dan diganti dengan feedback visual sendiri yang sepadan dengan tema.

**Wajib ada dalam base CSS:**

```css
/* Buang default tap highlight biru (WebKit/Android) */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Buang outline biru default bila elemen focus/active melalui touch */
button, a, input, [role="button"] {
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

/* Tapi kekalkan focus state untuk keyboard/accessibility — jangan buang terus */
button:focus-visible, a:focus-visible, input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

**Aturan:**
- `-webkit-tap-highlight-color: transparent` wajib pada root/global — ini punca utama "kotak biru" muncul bila tekan button/link di phone (Android Chrome & iOS Safari lama).
- Buang highlight bukan bermakna buang feedback. Setiap elemen boleh-klik **mesti** ada active/pressed state sendiri (contoh: opacity turun sikit, background jadi `--surface` lebih gelap sikit, atau scale 0.97–0.98 dengan transition pantas ~100ms) supaya user tetap dapat maklum balas tekanan.
- Jangan buang `:focus-visible` — itu untuk accessibility (keyboard/switch control), bukan sama dengan tap highlight biru mobile. `:focus-visible` automatik tak muncul bila tap guna jari, hanya muncul untuk navigasi keyboard.
- Touch target minimum 44×44px (iOS HIG) / 48×48px (Material) untuk semua elemen boleh-klik — penting untuk audience umur luas (18–70) yang mungkin kurang tepat menekan skrin kecil.
- Elak `:hover` state sebagai satu-satunya sumber feedback — hover tak wujud secara natural pada touch device (kadang "melekat" selepas tap). Utamakan `:active` untuk touch, `:hover` hanya tambahan untuk desktop/pointer device (`@media (hover: hover)`).

---

Contoh produk/rujukan animation tidak di-hardcode dalam dokumen ini — kena ditentukan ikut fail research/rujukan projek yang akan diberikan, dan disemak dengan carian internet semasa untuk dapatkan rujukan produk yang benar-benar sepadan dengan tema & masih relevan (bukan senarai statik yang boleh lapuk).

**Falsafah teras:**
> Interaction perlu selesai *di frame yang mata user sedang tumpu* — bukan di tempat lain yang user tak nampak. Setiap curve dan timing ada sebab, bukan hiasan.

**Prinsip am yang tetap terpakai (tak kira produk rujukan mana pun dipilih kemudian):**

1. **Setiap animation kena ada fungsi** — beri feedback (klik berjaya, error, loading), tunjuk hubungan spatial (dari mana ke mana elemen bergerak), atau kekalkan konteks (transition antara state). Kalau tak buat salah satu daripada ini, buang.
2. **Duration pendek & tegas** — micro-interaction (hover, toggle, button press): 120–200ms. Transition/panel/modal: 200–300ms. Page/route transition: 250–400ms. Jangan lebih 400ms untuk apa-apa yang user tunggu sebelum boleh teruskan kerja.
3. **Easing organik, bukan linear** — guna cubic-bezier yang meniru fizik sebenar (accelerate masuk, decelerate keluar). Contoh: `ease-out` (cubic-bezier(0.16, 1, 0.3, 1)) untuk elemen masuk, `ease-in` untuk elemen keluar. Elak `linear` — nampak robotik.
4. **Elak "fade-in bertingkat" pada page load** — animation setiap elemen muncul satu-satu bila page load adalah salah satu tanda paling jelas design AI-generated / template. Produk seperti Linear dan Stripe elak ini — content terus wujud, animation hanya untuk *response* kepada aksi user, bukan untuk *entrance* semua benda.
5. **Density & restraint** — Linear dashboard guna row 36px, hampir tiada "chrome" (border/shadow berlebihan), navigasi keyboard-first tanpa animation berat. Kepadatan info dijaga tanpa perlu motion untuk "isi" ruang kosong.
6. **Crafted microstates** — hover, focus, disabled, active — setiap state kena direka khusus (bukan sekadar opacity turun). Contoh: Spotify — ikon hati "like" ada animasi kecil bila ditekan untuk sahkan aksi berjaya; form input — checkmark muncul bila field sah, shake halus + warna merah bila error.
7. **Hormati `prefers-reduced-motion`** — wajib disable/kurangkan animation untuk user yang set preference ini di sistem mereka. Ini standard di semua produk matang pada 2026, bukan pilihan tambahan.
8. **Skeleton loading, bukan spinner kosong** — untuk data yang ambil masa >300ms nak load, guna skeleton/shimmer yang mencerminkan bentuk content sebenar — beri kesan produk "sudah tahu" apa akan muncul, bukan sekadar loading generik.

**Yang perlu dielak keras:**
- Animation "masuk bertingkat" untuk semua elemen bila page load (klise AI-generated).
- Bounce/spring effect berlebihan pada setiap interaction kecil — guna dengan sangat jarang, hanya untuk momen istimewa (contoh: confirmation penting).
- Parallax scroll berlebihan yang buat mata penat, terutamanya untuk audience umur lebih tua.
- Animation yang melambatkan task — kalau user perlu tunggu animation habis sebelum boleh klik seterusnya, itu sudah jadi halangan bukan feature.

---

## Struktur Fail & Folder

Susun fail & folder projek dengan rapi — jangan biar semua fail bertaburan dalam satu direktori sahaja.

- Kumpulkan fail ikut jenis/fungsi (contoh: `components/`, `assets/`, `styles/`, `docs/`) — bukan campur semua di root.
- **Boleh buat folder baru** bila perlu — kalau satu kategori dah ada beberapa fail berkaitan yang boleh dikumpul, asingkan ke folder sendiri. Jangan tunggu sampai berselerak dulu baru susun.
- Nama fail & folder guna format konsisten (contoh: `kebab-case` atau `camelCase` — pilih satu, guna sepanjang projek, jangan campur).
- Elak nama generik yang tak bermaksud (`file1.md`, `untitled/`, `new-folder/`) — nama kena terus jelaskan kandungan.
- Fail yang berkaitan letak berdekatan (contoh: komponen + style + test untuk satu feature dalam satu folder feature, bukan diasingkan ikut jenis fail semata-mata kalau itu buat susah nak cari).
- Semak semula struktur folder dari semasa ke semasa — kalau satu folder dah terlalu banyak fail tak berkaitan terkumpul sekali, pecahkan kepada sub-folder yang lebih spesifik.

---

## Senarai Semak Sebelum "Siap"

- [ ] Tiada gradient di mana-mana
- [ ] Tiada blur/glass effect
- [ ] Tiada emoji — semua icon dari satu library, ikut tema
- [ ] Border-radius berbeza ikut komponen, bukan satu nilai global
- [ ] Font size body ≥ 16px, tiada teks kritikal bawah 14px
- [ ] Contrast text lulus WCAG AA
- [ ] Tiada elemen bertindih tanpa depth/shadow yang jelas
- [ ] Design tak nampak macam template AI generik (semak balik palette & layout)
- [ ] ASCII wireframe + anotasi thumb-zone dilakar dulu sebelum reka visual, CTA utama duduk di zon (M)
- [ ] Tiada tap highlight biru default pada phone — semua elemen ada active/pressed state sendiri
- [ ] Touch target minimum 44–48px untuk semua elemen boleh-klik
- [ ] Responsive diuji — tiada elemen bertembung di mobile
- [ ] Fail & folder disusun rapi ikut fungsi, nama jelas, tiada fail bertaburan di root
