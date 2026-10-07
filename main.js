// main.js - Master Engine for Bunga Tanjung Pakej Standard

function initConfig() {
  if (typeof clientConfig === 'undefined') {
    console.error("clientConfig is not defined! Make sure config.js is loaded.");
    return;
  }

  // 1. Set CSS Variables
  const root = document.documentElement;
  root.style.setProperty('--bg', clientConfig.theme.warnaBackground);
  root.style.setProperty('--surface', clientConfig.theme.warnaSurface);
  root.style.setProperty('--envelope', clientConfig.theme.warnaSampul || "#f7eedf");
  root.style.setProperty('--wax', clientConfig.theme.warnaWax || "#8a131b");
  root.style.setProperty('--accent', clientConfig.theme.warnaAccent);
  root.style.setProperty('--asset', clientConfig.theme.warnaAset);
  root.style.setProperty('--ampersand', clientConfig.theme.warnaAmpersand);
  root.style.setProperty('--shadow', clientConfig.theme.warnaBayang);
  root.style.setProperty('--text', clientConfig.theme.warnaText);
  root.style.setProperty('--text-muted', clientConfig.theme.warnaTextMuted);
  root.style.setProperty('--border', clientConfig.theme.warnaBorder);

  // Set Fonts dynamically
  const fontStyle = document.createElement('style');
  fontStyle.innerHTML = `
    body { font-family: ${clientConfig.theme.fontUtama}; }
    .font-serif, h1, h2, h3, .hero-names, .navbar-logo { font-family: ${clientConfig.theme.fontTajuk}; }
  `;
  document.head.appendChild(fontStyle);

  // 2. Inject simple Text & Images (data-content & data-image)
  const allData = { ...clientConfig.pengantin, ...clientConfig.keluarga, ...clientConfig.majlis };
  
  document.querySelectorAll('[data-content]').forEach(el => {
    const key = el.getAttribute('data-content');
    if (allData[key]) {
      let text = allData[key];
      if (typeof text === 'string') {
        if (key === 'namaGabungan' || key === 'inisial') {
          text = text.replace(/&/g, '<span class="ampersand">&</span>');
        }
        el.innerHTML = text.replace(/\n/g, '<br>');
      }
    }
  });

  // Update Document Title
  if (clientConfig.pengantin && clientConfig.pengantin.pageTitle) {
    document.title = clientConfig.pengantin.pageTitle;
  }

  document.querySelectorAll('[data-image]').forEach(el => {
    const key = el.getAttribute('data-image');
    if (clientConfig.media && clientConfig.media[key]) {
      el.src = clientConfig.media[key];
      // Set alt text if it is the hero image
      if (key === 'gambarHero' && clientConfig.pengantin && clientConfig.pengantin.namaGabungan) {
        el.alt = clientConfig.pengantin.namaGabungan;
      }
    }
  });

  // 3. Inject Links (data-link)
  document.querySelectorAll('[data-link]').forEach(el => {
    const key = el.getAttribute('data-link');
    if (clientConfig.pautan && clientConfig.pautan[key]) {
      el.href = clientConfig.pautan[key];
    }
  });

  // 4. Render Arrays
  // 4a. Tema Warna
  const bekasTemaWarna = document.getElementById('bekas-tema-warna');
  if (bekasTemaWarna && clientConfig.senaraiTemaWarna) {
    bekasTemaWarna.innerHTML = '';
    clientConfig.senaraiTemaWarna.forEach(tema => {
      bekasTemaWarna.innerHTML += `
        <div class="swatch-col">
          <div class="color-swatch kain-texture" style="background-color: ${tema.kodWarna};"></div>
          <span class="swatch-label">${tema.namaWarna.replace(/\n/g, '<br>')}</span>
        </div>
      `;
    });
  }

  // 4b. Atur Cara
  const bekasAturCara = document.getElementById('bekas-atur-cara');
  if (bekasAturCara && clientConfig.aturCara) {
    bekasAturCara.innerHTML = '';
    clientConfig.aturCara.forEach(atur => {
      bekasAturCara.innerHTML += `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <p class="timeline-time font-semibold text-[var(--accent)]">${atur.masa}</p>
          <p class="timeline-desc text-sm">${atur.acara}</p>
        </div>
      `;
    });
  }

  // 4c. Kisah Kami (Original Story Card Structure)
  const bekasKisahKami = document.getElementById('story-carousel');
  const bekasIndikator = document.getElementById('story-indicators');
  if (bekasKisahKami && clientConfig.kisahKami) {
    bekasKisahKami.innerHTML = '';
    if (bekasIndikator) bekasIndikator.innerHTML = '';
    clientConfig.kisahKami.forEach((kisah, index) => {
      bekasKisahKami.innerHTML += `
        <div class="story-slide">
          <div class="story-card">
            <img src="${kisah.gambar}" alt="${kisah.tajuk}" class="story-img">
            <div class="story-content">
              <h3 class="font-serif mb-2">${kisah.tajuk}</h3>
              <p class="story-text">${kisah.teks}</p>
            </div>
          </div>
        </div>
      `;
      if (bekasIndikator) {
        bekasIndikator.innerHTML += `
          <span class="story-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
        `;
      }
    });
  }

  // 4d. Penginapan
  const bekasPenginapan = document.getElementById('bekas-penginapan');
  if (bekasPenginapan && clientConfig.penginapan) {
    bekasPenginapan.innerHTML = '';
    clientConfig.penginapan.forEach((hotel, idx) => {
      const iconSvg = idx === 0 
        ? `<svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>`
        : `<svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
      bekasPenginapan.innerHTML += `
        <li class="info-item">
          ${iconSvg}
          <div>
            <p class="info-title">${hotel.nama}</p>
            <p class="info-desc">${hotel.jarak}</p>
          </div>
        </li>
      `;
    });
  }

  // 4e. FAQ
  const bekasFaq = document.getElementById('bekas-faq');
  if (bekasFaq && clientConfig.infoFaq) {
    bekasFaq.innerHTML = '<h3 class="font-serif mb-3 border-b-gold pb-2">Soalan Lazim (FAQ)</h3>';
    clientConfig.infoFaq.forEach(faq => {
      bekasFaq.innerHTML += `
        <div class="faq-item">
          <div class="faq-question">
            <span class="faq-title">${faq.soalan}</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer">
            <p class="faq-desc mt-2">${faq.jawapan}</p>
          </div>
        </div>
      `;
    });
  }

  // 4f. Hubungi
  const bekasHubungi = document.getElementById('bekas-hubungi');
  if (bekasHubungi && clientConfig.hubungi) {
    bekasHubungi.innerHTML = '';
    clientConfig.hubungi.forEach(hub => {
      bekasHubungi.innerHTML += `
        <div class="mb-4 border-b border-[var(--border-soft)] pb-4">
          <p class="font-bold text-[var(--text)] mb-2">${hub.nama} (${hub.hubungan})</p>
          <div class="flex gap-2">
            <a href="${hub.panggilanBiasa}" class="btn-contact btn-call">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Telefon
            </a>
            <a href="${hub.whatsapp}" class="btn-contact btn-whatsapp" target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      `;
    });
  }

  // 4g. Salam Kaut
  const bekasSalamKaut = document.getElementById('bekas-salam-kaut');
  if (bekasSalamKaut && clientConfig.salamKaut) {
    bekasSalamKaut.innerHTML = '';
    clientConfig.salamKaut.forEach((salam, index) => {
      bekasSalamKaut.innerHTML += `
        <div class="card-songket max-w-xs mx-auto mb-4">
          <img src="${salam.qrCode}" alt="QR DuitNow" class="qr-code-img">
          <div class="bank-details-box">
            <p class="bank-name">${salam.namaBank}</p>
            <div class="bank-acc-row">
              <p id="bank-acc-${index}" class="bank-acc-number">${salam.noAkaun}</p>
              <button onclick="salinAkaun('bank-acc-${index}', this)" class="btn-secondary btn-copy">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Salin
              </button>
            </div>
            <p class="bank-owner">${salam.namaAkaun}</p>
          </div>
        </div>
      `;
    });
  }
}

// Global Salin Akaun function
window.salinAkaun = function(targetId, btnElement) {
  const bankAcc = document.getElementById(targetId);
  if (bankAcc) {
    const textToCopy = bankAcc.innerText.replace(/\s+/g, '');
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = btnElement.innerHTML;
      btnElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><polyline points="20 6 9 17 4 12"></polyline></svg> Disalin!';
      btnElement.style.backgroundColor = 'var(--accent)';
      btnElement.style.color = 'var(--bg)';
      setTimeout(() => {
        btnElement.innerHTML = originalText;
        btnElement.style.backgroundColor = '';
        btnElement.style.color = '';
      }, 2000);
    });
  }
};

// Global RSVP Submit function
window.submitRSVP = function(event) {
  event.preventDefault();
  
  const checkedRadio = document.querySelector('input[name="attendance"]:checked');
  const isHadir = checkedRadio && checkedRadio.value === 'ya';

  if (isHadir) {
    // Canvas Confetti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  const toast = document.getElementById('toast-notification');
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  const form = document.getElementById('rsvp-form');
  if (form) form.reset();
  
  const detailsContainer = document.getElementById('rsvp-details-container');
  if (detailsContainer) {
    detailsContainer.style.maxHeight = "0";
  }

  // Scroll to landing page
  const utamaSection = document.getElementById('utama');
  if (utamaSection) {
    utamaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

function startApp() {
  initConfig();

  // Scroll Reveal Animation
  const revealElements = document.querySelectorAll('.section-reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });
  revealElements.forEach(el => revealObserver.observe(el));

  // Navbar scrolled effect
  const navbar = document.querySelector('.navbar-songket');
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  // Countdown Logic
  let targetDate = (typeof clientConfig !== 'undefined' && clientConfig.majlis && clientConfig.majlis.tarikhISO) 
    ? new Date(clientConfig.majlis.tarikhISO).getTime()
    : new Date("Oct 24, 2026 11:00:00").getTime();

  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const cdDays = document.getElementById("cd-days");
    const cdHours = document.getElementById("cd-hours");
    const cdMins = document.getElementById("cd-mins");
    const cdSecs = document.getElementById("cd-secs");

    if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

    if (distance < 0) {
      cdDays.innerText = "00";
      cdHours.innerText = "00";
      cdMins.innerText = "00";
      cdSecs.innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    cdDays.innerText = days.toString().padStart(2, '0');
    cdHours.innerText = hours.toString().padStart(2, '0');
    cdMins.innerText = minutes.toString().padStart(2, '0');
    cdSecs.innerText = seconds.toString().padStart(2, '0');
  };

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // Audio Logic
  const audioBtn = document.getElementById('audio-toggle');
  const audioText = document.getElementById('audio-text');
  const bgMusic = document.getElementById('bg-music');
  const audioIcon = document.getElementById('audio-icon');
  const audioWave = document.getElementById('audio-wave');
  if (bgMusic) bgMusic.volume = 0.7;
  let isPlaying = false;

  if (audioBtn && bgMusic) {
    audioBtn.addEventListener('click', () => {
      if (isPlaying) {
        bgMusic.pause();
        if (audioText) audioText.innerText = 'Play Muzik';
        if (audioIcon) audioIcon.style.display = 'block';
        if (audioWave) audioWave.style.display = 'none';
        isPlaying = false;
      } else {
        bgMusic.play().catch(e => console.log('Audio play failed:', e));
        if (audioText) audioText.innerText = 'Pause Muzik';
        if (audioIcon) audioIcon.style.display = 'none';
        if (audioWave) audioWave.style.display = 'flex';
        isPlaying = true;
      }
    });
  }

  // Side Menu
  const menuBtn = document.getElementById('menu-btn');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  const sideMenu = document.getElementById('side-menu');
  const menuLinks = document.querySelectorAll('.menu-link');

  if(menuBtn && sideMenu) {
    menuBtn.addEventListener('click', () => {
      sideMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if(closeMenuBtn && sideMenu) {
    closeMenuBtn.addEventListener('click', () => {
      sideMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      if(sideMenu) sideMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Modals
  const modals = document.querySelectorAll('.modal-overlay');
  const closeBtns = document.querySelectorAll('.close-modal');

  closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal-overlay').classList.remove('active');
    });
  });

  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // RSVP Form Expand/Collapse Logic based on Kehadiran
  const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
  const detailsContainer = document.getElementById('rsvp-details-container');
  
  if (attendanceRadios.length > 0 && detailsContainer) {
    // Set initial state
    const checkedRadio = document.querySelector('input[name="attendance"]:checked');
    if (checkedRadio && checkedRadio.value === 'ya') {
      detailsContainer.style.maxHeight = detailsContainer.scrollHeight + "px";
    } else {
      detailsContainer.style.maxHeight = "0";
    }

    attendanceRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'ya') {
          detailsContainer.style.maxHeight = detailsContainer.scrollHeight + "px";
        } else {
          detailsContainer.style.maxHeight = "0";
        }
      });
    });
  }

  // FAQ Accordion Logic
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // Carousel Controls Logic (Prev, Next, Dots)
  const track = document.getElementById('story-carousel');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (track) {
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -track.offsetWidth, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: track.offsetWidth, behavior: 'smooth' });
      });
    }

    track.addEventListener('scroll', () => {
      const slideWidth = track.offsetWidth;
      if (slideWidth > 0) {
        const activeIndex = Math.round(track.scrollLeft / slideWidth);
        const dots = document.querySelectorAll('#story-indicators .story-dot');
        dots.forEach((dot, index) => {
          if (index === activeIndex) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    });

    const dots = document.querySelectorAll('#story-indicators .story-dot');
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        track.scrollTo({ left: track.offsetWidth * index, behavior: 'smooth' });
      });
    });
  }

  // ENVELOPE OPENING LOGIC
  const btnBuka = document.getElementById('btn-buka-jemputan');
  const envelopeCover = document.getElementById('envelope-cover');
  const whiteFade = document.getElementById('white-fade');

  if (btnBuka && envelopeCover) {
    // Lock scroll while envelope cover is active
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    btnBuka.addEventListener('click', () => {
      // 1. Ensure scroll position is at the very top (#utama)
      window.scrollTo(0, 0);

      // 2. Start envelope open animation
      envelopeCover.classList.add('open');
      
      // Autoplay disabled: Music only plays when user clicks 'Play Muzik'

      if (whiteFade) {
        setTimeout(() => {
          whiteFade.classList.add('active');
        }, 1200);

        setTimeout(() => {
          whiteFade.classList.remove('active');
        }, 2800);
      }

      setTimeout(() => {
        envelopeCover.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Direct landing at #utama
        const utamaSection = document.getElementById('utama');
        if (utamaSection) {
          utamaSection.scrollIntoView({ behavior: 'instant', block: 'start' });
        }

        // Trigger reveal animations on viewable sections
        document.querySelectorAll('.section-reveal').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight) {
            el.classList.add('visible');
            el.classList.add('active');
          }
        });
      }, 2500);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
