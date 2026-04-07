/* ============================================================
   MANGALAM HDPE PIPES — JAVASCRIPT
   Sections:
   01. Sticky Header
   02. Mobile Navigation
   03. Image Carousel (desktop)
   04. Image Carousel (mobile)
   05. Zoom on Hover
   06. FAQ Accordion
   07. Process Tabs
   08. Applications Carousel Scroll
   09. Scroll Animations (Intersection Observer)
   10. Smooth anchor scroll
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------
       01. STICKY HEADER
       Appears after scrolling past the hero section.
       Disappears when scrolled back to top.
    ---------------------------------------------------------- */
    const stickyHeader = document.getElementById('stickyHeader');
    const navbar = document.getElementById('navbar');

    let lastScrollY = 0;
    const SCROLL_THRESHOLD = 400; // px before sticky header appears

    function handleScroll() {
        const currentScrollY = window.scrollY;

        // Show/hide sticky header
        if (currentScrollY > SCROLL_THRESHOLD) {
            stickyHeader.classList.add('visible');
            // Push navbar down to avoid overlap
            navbar.style.top = stickyHeader.offsetHeight + 'px';
        } else {
            stickyHeader.classList.remove('visible');
            navbar.style.top = '0';
        }

        lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    /* ----------------------------------------------------------
       02. MOBILE NAVIGATION (Hamburger)
    ---------------------------------------------------------- */
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
            // Accessibility
            const isOpen = navLinks.classList.contains('open');
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target)) {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
            }
        });
    }

    /* ----------------------------------------------------------
       03. DESKTOP IMAGE CAROUSEL
    ---------------------------------------------------------- */
    const carouselTrack = document.getElementById('carouselTrack');
    const prevBtn       = document.getElementById('prevBtn');
    const nextBtn       = document.getElementById('nextBtn');
    const thumbsContainer = document.getElementById('thumbnails');

    if (carouselTrack && prevBtn && nextBtn) {
        const slides = carouselTrack.querySelectorAll('.carousel-slide');
        const thumbs = thumbsContainer ? thumbsContainer.querySelectorAll('.thumb') : [];
        let currentIndex = 0;

        /**
         * Navigate to a specific slide
         * @param {number} index
         */
        function goToSlide(index) {
            // Clamp index
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            // Deactivate all
            slides.forEach(s => s.classList.remove('active'));
            thumbs.forEach(t => t.classList.remove('active'));

            // Activate target
            slides[index].classList.add('active');
            if (thumbs[index]) thumbs[index].classList.add('active');

            currentIndex = index;

            // Update zoom image source
            const activeImg = slides[index].querySelector('.carousel-img');
            if (activeImg) {
                updateZoomSource(activeImg.src);
            }
        }

        prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

        // Thumbnail click
        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const idx = parseInt(thumb.getAttribute('data-index'), 10);
                goToSlide(idx);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft')  goToSlide(currentIndex - 1);
            if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
        });

        // Auto-slide every 5s
        let autoSlide = setInterval(() => goToSlide(currentIndex + 1), 5000);

        // Pause auto-slide on user interaction
        [prevBtn, nextBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                clearInterval(autoSlide);
                autoSlide = setInterval(() => goToSlide(currentIndex + 1), 5000);
            });
        });

        // Touch / Swipe support
        let touchStartX = 0;
        let touchEndX   = 0;

        carouselTrack.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carouselTrack.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 40) {
                if (diff > 0) goToSlide(currentIndex + 1);
                else          goToSlide(currentIndex - 1);
            }
        }, { passive: true });
    }

    /* ----------------------------------------------------------
       04. MOBILE IMAGE CAROUSEL
    ---------------------------------------------------------- */
    const mobileTrack   = document.getElementById('mobileCarouselTrack');
    const mobilePrevBtn = document.getElementById('mobilePrevBtn');
    const mobileNextBtn = document.getElementById('mobileNextBtn');

    if (mobileTrack && mobilePrevBtn && mobileNextBtn) {
        const mobileSlides = mobileTrack.querySelectorAll('.carousel-slide');
        const mobileThumbs = document.querySelectorAll('[data-mobile-index]');
        let mobileIndex    = 0;

        function goToMobileSlide(index) {
            if (index < 0) index = mobileSlides.length - 1;
            if (index >= mobileSlides.length) index = 0;

            mobileSlides.forEach(s => s.classList.remove('active'));
            mobileThumbs.forEach(t => t.classList.remove('active'));

            mobileSlides[index].classList.add('active');
            if (mobileThumbs[index]) mobileThumbs[index].classList.add('active');

            mobileIndex = index;
        }

        mobilePrevBtn.addEventListener('click', () => goToMobileSlide(mobileIndex - 1));
        mobileNextBtn.addEventListener('click', () => goToMobileSlide(mobileIndex + 1));

        mobileThumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const idx = parseInt(thumb.getAttribute('data-mobile-index'), 10);
                goToMobileSlide(idx);
            });
        });

        // Swipe support for mobile carousel
        let mTouchStartX = 0;
        mobileTrack.addEventListener('touchstart', e => {
            mTouchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        mobileTrack.addEventListener('touchend', e => {
            const diff = mTouchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 40) {
                if (diff > 0) goToMobileSlide(mobileIndex + 1);
                else          goToMobileSlide(mobileIndex - 1);
            }
        }, { passive: true });
    }

    /* ----------------------------------------------------------
       05. ZOOM ON HOVER (Desktop only)
       Creates a magnification effect when hovering over carousel.
    ---------------------------------------------------------- */
    const zoomLens      = document.getElementById('zoomLens');
    const zoomResult    = document.getElementById('zoomResult');
    const carouselWrap  = document.querySelector('.carousel-wrapper.desktop-only .carousel-track-wrapper') ||
                          document.querySelector('.desktop-only .carousel-track-wrapper');

    let zoomActive = false;

    /**
     * Update the background image source for the zoom result div
     * @param {string} src
     */
    function updateZoomSource(src) {
        if (zoomResult) {
            zoomResult.style.backgroundImage = `url('${src}')`;
        }
    }

    if (zoomLens && zoomResult && carouselWrap) {

        const ZOOM_FACTOR = 3; // magnification level

        // Init zoom result background
        const firstImg = carouselWrap.querySelector('.carousel-img');
        if (firstImg) {
            updateZoomSource(firstImg.src);
        }

        /**
         * Calculate and apply zoom lens + result positions
         * @param {MouseEvent} e
         */
        function moveZoom(e) {
            const rect = carouselWrap.getBoundingClientRect();
            const imgEl = carouselWrap.querySelector('.carousel-slide.active .carousel-img');
            if (!imgEl) return;

            // Mouse position relative to image
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            // Lens half-sizes
            const lensW = zoomLens.offsetWidth  / 2;
            const lensH = zoomLens.offsetHeight / 2;

            // Clamp lens within image bounds
            x = Math.max(lensW, Math.min(x, rect.width  - lensW));
            y = Math.max(lensH, Math.min(y, rect.height - lensH));

            // Position the lens
            zoomLens.style.left = (x - lensW) + 'px';
            zoomLens.style.top  = (y - lensH) + 'px';

            // Update zoom result background position
            const bgX = (x * ZOOM_FACTOR) - (zoomResult.offsetWidth  / 2);
            const bgY = (y * ZOOM_FACTOR) - (zoomResult.offsetHeight / 2);

            zoomResult.style.backgroundSize     = `${rect.width * ZOOM_FACTOR}px ${rect.height * ZOOM_FACTOR}px`;
            zoomResult.style.backgroundPosition = `-${bgX}px -${bgY}px`;

            // Update source to current active slide
            const activeImg = carouselWrap.querySelector('.carousel-slide.active .carousel-img');
            if (activeImg) {
                zoomResult.style.backgroundImage = `url('${activeImg.src}')`;
            }
        }

        // Show zoom elements on mouse enter
        carouselWrap.addEventListener('mouseenter', () => {
            zoomLens.style.display   = 'block';
            zoomResult.style.display = 'block';
            zoomActive = true;
        });

        // Move zoom on mouse move
        carouselWrap.addEventListener('mousemove', moveZoom);

        // Hide zoom elements on mouse leave
        carouselWrap.addEventListener('mouseleave', () => {
            zoomLens.style.display   = 'none';
            zoomResult.style.display = 'none';
            zoomActive = false;
        });
    }

    /* ----------------------------------------------------------
       06. FAQ ACCORDION
    ---------------------------------------------------------- */
    /**
     * Toggle an FAQ item open/closed
     * @param {HTMLElement} btn - the .faq-question button
     */
    window.toggleFaq = function(btn) {
        const item    = btn.closest('.faq-item');
        const isOpen  = item.classList.contains('open');
        const allItems = document.querySelectorAll('.faq-item');
        const iconPath = btn.querySelector('.faq-icon path');

        // Close all first
        allItems.forEach(i => {
            i.classList.remove('open');
            const b = i.querySelector('.faq-question');
            if (b) b.setAttribute('aria-expanded', 'false');
            const p = i.querySelector('.faq-icon path');
            if (p) {
                p.setAttribute('d', 'M6 9L12 15L18 9');
                p.setAttribute('stroke', '#555');
            }
        });

        // Open clicked if it was closed
        if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
            if (iconPath) {
                iconPath.setAttribute('d', 'M18 15L12 9L6 15');
                iconPath.setAttribute('stroke', '#2b3891');
            }
        }
    };

    /* ----------------------------------------------------------
       07. PROCESS TABS
    ---------------------------------------------------------- */
    const processTabs       = document.querySelectorAll('.process-tab');
    const processSteps      = document.querySelectorAll('.process-step');
    const processTabsContainer = document.getElementById('processTabs');

    /**
     * Update the progress line width based on active tab position
     */
    function updateProgressLine() {
        if (!processTabsContainer) return;

        const activeTab = processTabsContainer.querySelector('.process-tab.active');
        if (!activeTab) return;

        const tabsRect = processTabsContainer.getBoundingClientRect();
        const activeTabRect = activeTab.getBoundingClientRect();

        // Calculate the position of the active tab relative to the container
        const progressLine = processTabsContainer.querySelector('::after');
        const offset = activeTabRect.left - tabsRect.left + processTabsContainer.scrollLeft;
        const width = offset + activeTabRect.width / 2;

        // Update the progress line width via CSS custom property
        processTabsContainer.style.setProperty('--progress-width', width + 'px');
    }

    processTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const idx = tab.getAttribute('data-index');

            // Update tabs
            processTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Update step panels
            processSteps.forEach(s => s.classList.remove('active'));
            const target = document.querySelector(`.process-step[data-index="${idx}"]`);
            if (target) target.classList.add('active');

            // Update progress line
            updateProgressLine();

            // Scroll active tab into view
            tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });

    // Initialize progress line on page load
    window.addEventListener('load', updateProgressLine);
    window.addEventListener('resize', updateProgressLine);

    // Update on scroll if tabs container is scrollable
    if (processTabsContainer) {
        processTabsContainer.addEventListener('scroll', updateProgressLine);
    }

    /* ----------------------------------------------------------
       08. APPLICATIONS CAROUSEL SCROLL
    ---------------------------------------------------------- */
    const appCards = document.getElementById('appCards');
    const appPrev  = document.getElementById('appPrev');
    const appNext  = document.getElementById('appNext');

    if (appCards && appPrev && appNext) {
        const SCROLL_AMOUNT = 296; // card width + gap

        appNext.addEventListener('click', () => {
            appCards.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
        });

        appPrev.addEventListener('click', () => {
            appCards.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
        });

        // Disable/enable arrows based on scroll position
        function updateArrows() {
            appPrev.style.opacity = appCards.scrollLeft <= 0 ? '0.4' : '1';
            appNext.style.opacity =
                appCards.scrollLeft >= appCards.scrollWidth - appCards.clientWidth - 1
                    ? '0.4' : '1';
        }

        appCards.addEventListener('scroll', updateArrows, { passive: true });
        updateArrows();
    }

    /* ----------------------------------------------------------
       09. SCROLL ANIMATIONS (Intersection Observer)
       Fade-in elements as they enter the viewport.
    ---------------------------------------------------------- */
    const animTargets = document.querySelectorAll(
        '.feature-card, .portfolio-card, .testimonial-card, ' +
        '.faq-item, .resource-item, .specs-table tbody tr'
    );

    // Set initial state
    animTargets.forEach(el => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger delay for grid children
                const delay = (i % 6) * 60;
                setTimeout(() => {
                    entry.target.style.opacity   = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    animTargets.forEach(el => observer.observe(el));

    /* ----------------------------------------------------------
       10. SMOOTH ANCHOR SCROLL (for #contact etc.)
    ---------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = stickyHeader.offsetHeight + navbar.offsetHeight + 16;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

}); // end DOMContentLoaded