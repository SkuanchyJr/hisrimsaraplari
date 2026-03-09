/**
 * Casa Hısrım — Main JavaScript
 * Navigation, scroll effects, reveal animations, mobile menu
 */

document.addEventListener('DOMContentLoaded', () => {

    // ═══════════ HEADER SCROLL EFFECT ═══════════
    const header = document.querySelector('.site-header');
    if (header) {
        const onScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 60);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ═══════════ MOBILE MENU ═══════════
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ═══════════ ACTIVE NAV LINK ═══════════
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        const linkPage = href.split('/').pop();
        if (linkPage === currentPage ||
            (currentPage === 'index.html' && (href === '../index.html' || href === '/' || href === 'index.html'))) {
            link.classList.add('active');
        }
    });

    // ═══════════ REVEAL ON SCROLL (Intersection Observer) ═══════════
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Don't unobserve — allow re-animation on scroll back
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // ═══════════ HERO PARALLAX (subtle) ═══════════
    const heroBgImage = document.querySelector('.hero-bg-image');
    if (heroBgImage) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const heroHeight = window.innerHeight;
                    if (scrollY < heroHeight) {
                        const translateY = scrollY * 0.3;
                        heroBgImage.style.transform = `translateY(${translateY}px) scale(1.1)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ═══════════ SMOOTH SCROLL FOR ANCHOR LINKS ═══════════
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ═══════════ ANIMATED STATS COUNTER ═══════════
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    if (statNumbers.length > 0) {
        const animateCounter = (el) => {
            const target = parseInt(el.dataset.count, 10);
            const duration = 2000;
            const startTime = performance.now();
            // Preserve any suffix span inside
            const suffix = el.querySelector('.stat-suffix');
            const suffixHTML = suffix ? suffix.outerHTML : '';

            const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

            const tick = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutQuart(progress);
                const current = Math.floor(eased * target);

                // Set text but keep suffix
                el.textContent = current;
                if (suffixHTML) {
                    el.insertAdjacentHTML('beforeend', suffixHTML);
                }

                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            };
            requestAnimationFrame(tick);
        };

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add visible class for CSS animations
                    entry.target.closest('.stat-item')?.classList.add('visible');
                    // Animate the number
                    animateCounter(entry.target);
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(el => statsObserver.observe(el));
    }

    // ═══════════ IMMERSIVE TIMELINE PROGRESS ═══════════
    const immersiveTimeline = document.getElementById('immersive-timeline');
    const timelineProgress = document.getElementById('timeline-progress');
    const timelineFill = document.getElementById('timeline-fill');
    const timelineDot = document.getElementById('timeline-dot');

    if (immersiveTimeline && timelineProgress) {
        const eras = immersiveTimeline.querySelectorAll('.timeline-era');

        // Reveal eras on scroll
        const eraObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
        eras.forEach(era => eraObserver.observe(era));

        // Progress bar tracking
        let timelineTicking = false;
        window.addEventListener('scroll', () => {
            if (!timelineTicking) {
                requestAnimationFrame(() => {
                    const rect = immersiveTimeline.getBoundingClientRect();
                    const windowH = window.innerHeight;
                    const timelineTop = rect.top + window.scrollY;
                    const timelineHeight = rect.height;
                    const scrollPos = window.scrollY + windowH;

                    // Show/hide progress bar
                    const isInTimeline = scrollPos > timelineTop && window.scrollY < timelineTop + timelineHeight;
                    timelineProgress.classList.toggle('active', isInTimeline);

                    if (isInTimeline && timelineFill && timelineDot) {
                        const progress = Math.max(0, Math.min(1,
                            (scrollPos - timelineTop) / timelineHeight
                        ));
                        const fillPercent = progress * 100;
                        timelineFill.style.height = fillPercent + '%';
                        timelineDot.style.top = fillPercent + '%';
                    }

                    timelineTicking = false;
                });
                timelineTicking = true;
            }
        }, { passive: true });
    }
});
