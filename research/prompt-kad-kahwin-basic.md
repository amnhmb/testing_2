# Prompt: Bina Web "Kad Kahwin Digital" — PAKEJ BASIC SAHAJA (1 Purchase)

Salin & paste prompt di bawah ke dalam AI coding tool anda (Claude Code, Cursor, Windsurf, atau setara).

---

## PROMPT

Saya nak awak bina **satu laman web kad jemputan perkahwinan digital** untuk **SATU pasangan sahaja** (single deployment, bukan platform SaaS multi-tenant). Ini adalah deliverable untuk **1 purchase — Pakej Basic (RM40)**, bukan Standard atau Premium.

Sebelum tulis sebarang kod, **baca dan fahami dahulu SEMUA fail berikut**:

1. `Research/design-system.md` — rules struktur wajib (typography, warna, radius, spacing, mobile/touch). **Patuh 100% — terutama senarai "Yang DIELAKKAN" (tiada gradient, tiada emoji, tiada border-radius seragam).**
2. `Research/PRD-Kad-Kahwin-Digital.md` — rujuk **HANYA Bahagian 5.1 (Pakej Basic)** untuk skop fungsi. Bahagian 5.2/5.3 (Standard/Premium) BUKAN skop kerja ini — jangan bina fungsi dari situ.
3. `Research/ascii_basic.md` — wireframe struktur asas layout.
4. `Research/Songket_Kelantan_Motif_Teras.md` — rujukan tema/motif visual (Awan Larat khususnya).
5. `assets/songket/` — set asset visual siap-guna (lihat senarai di bawah). **GUNA fail-fail ni terus, JANGAN jana/lukis motif baru.**

### Skop Fungsi (WAJIB ikut PRD Bahagian 5.1 — Pakej Basic sahaja)

**Maklumat Pengantin & Majlis:**
- Nama penuh & nama panggilan pengantin
- "Anak kepada..." — nama ibu bapa kedua-dua belah
- 1 gambar hero sahaja (bukan gallery/multiple)
- Tarikh, hari, masa, lokasi majlis
- Swatch tema warna majlis (paparan bulatan warna dress code — ini data majlis, BUKAN warna tema laman web)

**Navigasi & Kontak:**
- Butang buka Waze/Google Maps
- Butang Hubungi (WhatsApp/panggilan)

**Reka Bentuk & Multimedia:**
- 1 tema design (guna asset Awan Larat yang disediakan)
- Countdown timer statik ke tarikh majlis
- Muzik latar tetap (satu track sahaja, bukan pilihan)
- Animasi scroll reveal ringan sahaja (elak animasi berat)

**RSVP & Hadiah:**
- Borang RSVP asas: nama, status kehadiran (hadir/tidak), bilangan tetamu — TIGA medan sahaja, jangan tambah medan lain
- Salam kaut digital: kod QR DuitNow + nombor akaun bank

**JANGAN bina** (ini skop Standard/Premium — di luar Pakej Basic): Kisah Kami, gallery multiple gambar, atur cara majlis penuh, info penginapan, FAQ, guestbook, pemilih sesi (session selector), simpan ke kalendar, animasi amplop/confetti, toggle tema warna laman, splash screen nama tetamu.

**Dashboard/admin (Bahagian 6 PRD)** — TIDAK termasuk dalam scope Phase 1 ini. Fokus 100% pada laman guest-facing sahaja. Data RSVP boleh guna dummy/local state buat masa ni (belum connect backend).

### Asset Visual (dalam `assets/songket/`) — Awan Larat

| Fail | Kegunaan |
|---|---|
| `border_upper_left.png` | Bucu atas-kiri (overlay atas bingkai gambar hero) |
| `border_lower_right.png` | Bucu bawah-kanan (overlay atas bingkai gambar hero) |
| `background_pattern.png` | Corak latar seamless — guna opacity RENDAH (10–15%) sebagai tekstur background sahaja, JANGAN letak penuh opacity di belakang teks (isu kebolehbacaan) |
| `strip.png` | Jalur border tebal — untuk pembahagi seksyen besar sahaja (bukan setiap seksyen) |
| `crown.png` | Finial/crest — letak di atas nama pengantin (overlay pada garis, bukan gantikan garis) |
| `divider.png` | Divider nipis — pembahagi antara seksyen pendek (contoh: antara info majlis dan RSVP) |
| `set_icon.png` | Ikon kecil gantian emoji — letak sebelah setiap tajuk seksyen (Majlis, RSVP, Lokasi, Hubungi) |

Gunakan fail `styles/songket-awan-larat.css` yang turut disediakan sebagai stylesheet asas — ia dah ada class untuk setiap kegunaan asset di atas (button, card, input, frame gambar, divider). Boleh extend/ubah suai, tapi kekalkan prinsip struktur dia (radius ikut komponen, bukan seragam).

### Warna

**PENTING:** warna dalam `songket-awan-larat.css` (merah manggis/emas) adalah **contoh sahaja** berdasarkan penyelidikan awal — bukan warna wajib. Awak **boleh cadangkan palette lain** asalkan:
- Semua warna flat/solid (tiada gradient — hard rule design-system.md)
- Satu accent color utama sahaja untuk action penting (button, link)
- Kontras WCAG AA dipatuhi (4.5:1 body text, 3:1 heading besar)
- Palette dinamakan sebagai CSS variables (`--bg`, `--surface`, `--text`, `--text-muted`, `--accent`, `--border`) supaya senang tukar

Kalau nak tukar palette, tukar terus di `:root` dalam CSS — jangan hardcode warna baru bertaburan dalam komponen.

### Prinsip Mobile-First (WAJIB — rujuk design-system.md Bahagian 4 & Mobile/Touch)

- Semua touch target minimum 44×44px
- CTA utama (Hantar RSVP) letak di zon ibu jari (bawah/tengah skrin), bukan atas
- Font body minimum 16px, label minimum 14px
- Buang tap-highlight biru default (`-webkit-tap-highlight-color: transparent`), ganti dengan active/pressed state sendiri
- Elak `:hover` sebagai satu-satunya feedback — utamakan `:active` untuk touch

### Tech Stack

Cadangkan stack ringan untuk static site (contoh: Next.js + Tailwind, atau HTML/CSS/JS vanilla + Vite) — kecuali AGENTS.md/design-system.md dah tetapkan lain. Pastikan boleh `npm run dev` terus di localhost.

### Langkah Kerja

1. Baca semua fail rujukan, bagi saya **ringkasan pendek** (skop Basic yang awak faham, cadangan stack, cadangan palette warna jika berbeza dari CSS contoh). **Jangan tulis kod dulu sebelum saya confirm.**
2. Highlight kalau ada percanggahan/kekeliruan antara PRD Bahagian 5.1 dan design-system.md.
3. Lepas confirm, bina struktur project + semua seksyen dalam skop Basic sahaja, guna asset & CSS yang disediakan.
4. Guna dummy/placeholder data (nama, tarikh, gambar placeholder) — belum connect backend RSVP sebenar.

### Output Yang Saya Nak Lepas Siap

- Struktur folder project
- Ringkasan apa yang dibina berbanding skop Pakej Basic (PRD 5.1)
- Arahan run localhost
- Senarai assumption yang awak buat (terutama kalau ada gap dalam skop/design-system)
- Pengesahan: tiada fungsi Standard/Premium yang termasuk secara tidak sengaja
