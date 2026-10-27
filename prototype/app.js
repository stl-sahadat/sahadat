/**
 * MD SAHADAT HOSSAIN — UNIFIED ARCHITECTURE PORTFOLIO JAVASCRIPT
 * High-Performance Vanilla ES6+ Engine
 * Features:
 * - Cosmos 3D Orbiting Satellites with Mouse Parallax
 * - Arooth Magnetic Cursor & Morphing Kinetic Capsule
 * - Vision Split-Screen Synchronized Editorial Slider
 * - Cosmos 8-Color Category Blueprint Filtering & Modal Drawer
 * - Realtime Telemetry UTC+6 Clock
 * - Dual Theme Switcher (OLED Dark & Warm Paper) with LocalStorage
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. DUAL THEME ENGINE (Cosmos OLED Dark & Warm Paper)
    // -------------------------------------------------------------------------
    const themeToggleBtn = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    function initTheme() {
        const savedTheme = localStorage.getItem('sh_portfolio_theme') || 'dark';
        setTheme(savedTheme);
    }

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('sh_portfolio_theme', theme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    initTheme();

    // -------------------------------------------------------------------------
    // 2. MAGNETIC CUSTOM CURSOR & TARGET PULL
    // -------------------------------------------------------------------------
    const cursorDot = document.getElementById('cursorDot');
    const cursorFollower = document.getElementById('cursorFollower');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (cursorDot) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }
    });

    function animateCursor() {
        const lerpFactor = 0.16;
        followerX += (mouseX - followerX) * lerpFactor;
        followerY += (mouseY - followerY) * lerpFactor;

        if (cursorFollower) {
            cursorFollower.style.left = `${followerX}px`;
            cursorFollower.style.top = `${followerY}px`;
        }

        requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    // Hover state on interactive elements
    const interactiveSelectors = 'a, button, .magnetic-target, .satellite-node, .blueprint-card, .morph-capsule, .slider-btn';
    
    function attachCursorHover() {
        const elements = document.querySelectorAll(interactiveSelectors);
        elements.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                if (cursorFollower) cursorFollower.classList.add('hovered');
            });
            el.addEventListener('mouseleave', () => {
                if (cursorFollower) cursorFollower.classList.remove('hovered');
            });
        });
    }
    attachCursorHover();

    // -------------------------------------------------------------------------
    // 3. SYSTEM CLOCK (Dhaka, Bangladesh UTC+6)
    // -------------------------------------------------------------------------
    const hudClock = document.getElementById('hudClock');

    function updateDhakaClock() {
        if (!hudClock) return;
        const now = new Date();
        // Calculate UTC+6
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const bdTime = new Date(utc + (3600000 * 6));
        
        const hours = String(bdTime.getHours()).padStart(2, '0');
        const minutes = String(bdTime.getMinutes()).padStart(2, '0');
        const seconds = String(bdTime.getSeconds()).padStart(2, '0');
        
        hudClock.textContent = `${hours}:${minutes}:${seconds} UTC+6`;
    }
    setInterval(updateDhakaClock, 1000);
    updateDhakaClock();

    // -------------------------------------------------------------------------
    // 4. AROOTH HERO MORPHING CAPSULE INTERACTION
    // -------------------------------------------------------------------------
    const morphCapsule = document.getElementById('morphCapsule');
    if (morphCapsule) {
        morphCapsule.addEventListener('click', () => {
            // Scroll smoothly to orbit section
            const orbitSection = document.getElementById('orbit');
            if (orbitSection) {
                orbitSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // -------------------------------------------------------------------------
    // 5. COSMOS 3D SPATIAL ORBIT & MOUSE PARALLAX
    // -------------------------------------------------------------------------
    const orbitStageWrapper = document.getElementById('orbitStageWrapper');
    const orbitStage = document.getElementById('orbitStage');
    const satelliteNodes = document.querySelectorAll('.satellite-node');
    const inspectorBadge = document.getElementById('inspectorBadge');
    const inspectorTech = document.getElementById('inspectorTech');
    const inspectorDesc = document.getElementById('inspectorDesc');

    let orbitAngle = 0;
    let isOrbitPaused = false;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    // Track mouse over orbit stage for 3D perspective tilt
    if (orbitStageWrapper) {
        orbitStageWrapper.addEventListener('mousemove', (e) => {
            const rect = orbitStageWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            targetTiltX = -(y / rect.height) * 22; // rotateX tilt
            targetTiltY = (x / rect.width) * 26;   // rotateY tilt
        });

        orbitStageWrapper.addEventListener('mouseleave', () => {
            targetTiltX = 0;
            targetTiltY = 0;
        });

        // Pause automatic rotation on hover for easy inspection
        orbitStageWrapper.addEventListener('mouseenter', () => {
            isOrbitPaused = true;
        });
        orbitStageWrapper.addEventListener('mouseleave', () => {
            isOrbitPaused = false;
        });
    }

    // Position and smoothly rotate satellite nodes in 3D ellipse
    function updateOrbitPositions() {
        if (!isOrbitPaused) {
            orbitAngle += 0.0035; // gentle celestial rotation speed
        }

        // Smooth tilt damping
        currentTiltX += (targetTiltX - currentTiltX) * 0.08;
        currentTiltY += (targetTiltY - currentTiltY) * 0.08;

        if (orbitStage) {
            orbitStage.style.transform = `rotateX(${currentTiltX + 10}deg) rotateY(${currentTiltY}deg)`;
        }

        const totalNodes = satelliteNodes.length;
        const radiusX = Math.min(window.innerWidth * 0.38, 420);
        const radiusY = Math.min(window.innerHeight * 0.22, 190);

        satelliteNodes.forEach((node, i) => {
            const baseAngle = (i / totalNodes) * (Math.PI * 2);
            const totalAngle = baseAngle + orbitAngle;

            const x = Math.cos(totalAngle) * radiusX;
            const y = Math.sin(totalAngle) * radiusY;
            const z = Math.sin(totalAngle) * 90; // Depth factor

            // Counter-rotate the card so it stays legible and facing the screen
            node.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-currentTiltY}deg) rotateX(${-(currentTiltX + 10)}deg)`;
            
            // Adjust z-index based on depth
            node.style.zIndex = Math.round(z + 100);
            
            // Adjust opacity for far vs near side
            const depthRatio = (z + 90) / 180;
            node.style.opacity = Math.max(0.65, depthRatio);
        });

        requestAnimationFrame(updateOrbitPositions);
    }
    requestAnimationFrame(updateOrbitPositions);

    // Satellite Click & Hover Inspector Updater
    satelliteNodes.forEach((node) => {
        const updateInspector = () => {
            satelliteNodes.forEach(n => n.classList.remove('active-node'));
            node.classList.add('active-node');

            const tech = node.getAttribute('data-tech');
            const desc = node.getAttribute('data-desc');
            const color = node.getAttribute('data-color');
            const category = node.querySelector('.node-category')?.textContent || 'ARCHITECTURE';

            if (inspectorTech) inspectorTech.textContent = tech;
            if (inspectorDesc) inspectorDesc.textContent = desc;
            if (inspectorBadge) {
                inspectorBadge.textContent = category.toUpperCase();
                inspectorBadge.style.color = color;
                inspectorBadge.style.borderColor = color;
            }
        };

        node.addEventListener('mouseenter', updateInspector);
        node.addEventListener('click', updateInspector);
    });

    // -------------------------------------------------------------------------
    // 6. VISION EDITORIAL SPLIT-SCREEN SLIDER
    // -------------------------------------------------------------------------
    const slides = document.querySelectorAll('.split-slide');
    const prevBtn = document.getElementById('sliderPrevBtn');
    const nextBtn = document.getElementById('sliderNextBtn');
    const currentSlideNum = document.getElementById('currentSlideNum');
    const progressBar = document.getElementById('sliderProgressBar');

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoSlideTimer = null;

    function goToSlide(index) {
        if (index < 0) {
            index = totalSlides - 1;
        } else if (index >= totalSlides) {
            index = 0;
        }

        currentSlide = index;

        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentSlide);
        });

        if (currentSlideNum) {
            currentSlideNum.textContent = String(currentSlide + 1).padStart(2, '0');
        }

        if (progressBar) {
            const percentage = ((currentSlide + 1) / totalSlides) * 100;
            progressBar.style.width = `${percentage}%`;
        }
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function resetAutoSlide() {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(nextSlide, 8000);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoSlide();
        });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoSlide();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoSlide();
        }
    });

    resetAutoSlide();

    // -------------------------------------------------------------------------
    // 7. COSMOS 8-COLOR BLUEPRINTS FILTER & MODAL
    // -------------------------------------------------------------------------
    const filterPills = document.querySelectorAll('.filter-pill');
    const blueprintCards = document.querySelectorAll('.blueprint-card');

    filterPills.forEach((pill) => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filterVal = pill.getAttribute('data-filter');

            blueprintCards.forEach((card) => {
                const cardCat = card.getAttribute('data-category');
                if (filterVal === 'all' || cardCat === filterVal) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 20);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 200);
                }
            });
        });
    });

    // Blueprint Inspection Modal
    const blueprintModal = document.getElementById('blueprintModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalTitle = document.getElementById('modalTitle');
    const modalSummary = document.getElementById('modalSummary');
    const modalDomain = document.getElementById('modalDomain');
    const modalTags = document.getElementById('modalTags');

    function openModal(card) {
        if (!blueprintModal) return;

        const title = card.querySelector('.card-title')?.textContent || 'System Blueprint';
        const summary = card.querySelector('.card-summary')?.textContent || '';
        const domain = card.querySelector('.card-domain-badge')?.textContent || 'ARCHITECTURE';
        const tags = Array.from(card.querySelectorAll('.c-tag')).map(t => t.textContent);

        if (modalTitle) modalTitle.textContent = title;
        if (modalSummary) modalSummary.textContent = `${summary} This blueprint specifies production-grade architecture patterns, fault isolation boundaries, failover mechanisms, and latency budgets tested at enterprise scale.`;
        if (modalDomain) modalDomain.textContent = `SYSTEM BLUEPRINT &bull; ${domain}`;

        if (modalTags) {
            modalTags.innerHTML = '';
            tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag-pill';
                span.textContent = tag;
                modalTags.appendChild(span);
            });
        }

        blueprintModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!blueprintModal) return;
        blueprintModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    blueprintCards.forEach((card) => {
        card.addEventListener('click', () => openModal(card));
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // -------------------------------------------------------------------------
    // 8. CONSULTATION TERMINAL FORM TRANSMISSION
    // -------------------------------------------------------------------------
    const consultationForm = document.getElementById('consultationForm');
    const formStatusMsg = document.getElementById('formStatusMsg');
    const submitFormBtn = document.getElementById('submitFormBtn');

    if (consultationForm) {
        consultationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('clientName')?.value;
            const email = document.getElementById('clientEmail')?.value;
            const scope = document.getElementById('projectScope')?.value;

            if (submitFormBtn) {
                submitFormBtn.disabled = true;
                submitFormBtn.innerHTML = `<span>TRANSMITTING ENCRYPTED PACKET...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
            }

            if (formStatusMsg) {
                formStatusMsg.className = 'form-status';
                formStatusMsg.textContent = 'CONNECTING TO ARCHITECT RELAY...';
            }

            // Simulate encrypted terminal transmission
            setTimeout(() => {
                if (formStatusMsg) {
                    formStatusMsg.className = 'form-status success';
                    formStatusMsg.textContent = `✓ SPECIFICATION TRANSMITTED. THANK YOU, ${name.toUpperCase()}! SAHADAT WILL RESPOND PROMPTLY.`;
                }

                if (submitFormBtn) {
                    submitFormBtn.disabled = false;
                    submitFormBtn.innerHTML = `<span>TRANSMIT SPECIFICATION</span> <i class="fa-solid fa-check"></i>`;
                }

                consultationForm.reset();
            }, 1200);
        });
    }

    // -------------------------------------------------------------------------
    // 9. MOBILE MENU DRAWER
    // -------------------------------------------------------------------------
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileDrawer) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileDrawer.classList.toggle('active');
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('active');
            });
        });
    }

    // -------------------------------------------------------------------------
    // 10. ACTIVE NAVBAR SCROLL SPY
    // -------------------------------------------------------------------------
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 200;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            const href = link.getAttribute('href').replace('#', '');
            link.classList.toggle('active', href === currentSectionId);
        });
    });

    console.log('%c[SYSTEM] Md Sahadat Hossain Unified Architecture Prototype Initialized.', 'color: #F59E0B; font-weight: bold;');
})();
