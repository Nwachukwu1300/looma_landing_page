/**
 * LOOMA LANDING PAGE - JavaScript
 * Handles: Carousel, Video player, Waitlist forms, Smooth scroll
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initCarousel();
    initVideoPlayer();
    initWaitlistForms();
    initContactForm();
    initDemoForm();
    initFAQ();
    initSmoothScroll();
});

/**
 * CAROUSEL FUNCTIONALITY
 * CSS-only carousel with dot navigation and arrow buttons
 */
function initCarousel() {
    const track = document.getElementById('carousel-track');
    const cards = track.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.carousel-arrow.prev');
    const nextBtn = document.querySelector('.carousel-arrow.next');

    let currentIndex = 0;
    const totalCards = cards.length;
    let autoplayInterval;

    // Show specific slide
    function showSlide(index) {
        // Handle wrap-around
        if (index < 0) {
            index = totalCards - 1;
        } else if (index >= totalCards) {
            index = 0;
        }

        currentIndex = index;

        // Update cards
        cards.forEach((card, i) => {
            card.classList.remove('active');
            if (i === currentIndex) {
                card.classList.add('active');
            }
        });

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === currentIndex) {
                dot.classList.add('active');
            }
        });
    }

    // Next slide
    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    // Previous slide
    function prevSlide() {
        showSlide(currentIndex - 1);
    }

    // Start autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 5000);
    }

    // Stop autoplay
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            stopAutoplay();
            nextSlide();
            startAutoplay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            stopAutoplay();
            prevSlide();
            startAutoplay();
        });
    }

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            stopAutoplay();
            showSlide(index);
            startAutoplay();
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        const carouselInView = isElementInViewport(track);
        if (carouselInView) {
            if (e.key === 'ArrowLeft') {
                stopAutoplay();
                prevSlide();
                startAutoplay();
            } else if (e.key === 'ArrowRight') {
                stopAutoplay();
                nextSlide();
                startAutoplay();
            }
        }
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide(); // Swipe left
            } else {
                prevSlide(); // Swipe right
            }
        }
    }

    // Start autoplay
    startAutoplay();
}

/**
 * VIDEO GRID & MODAL FUNCTIONALITY
 * Click on video card to open in modal
 */
function initVideoPlayer() {
    const videoCards = document.querySelectorAll('.video-card');
    const modal = document.getElementById('video-modal');
    const modalPlayer = document.getElementById('video-modal-player');
    const modalCaption = document.getElementById('video-modal-caption');
    const modalClose = document.getElementById('video-modal-close');

    if (!modal || !modalPlayer || !videoCards.length) return;

    // Handle video loading - show skeleton until loaded
    videoCards.forEach(function(card) {
        const thumbnail = card.querySelector('.video-thumbnail');

        if (thumbnail) {
            // Mark as loaded when video data is available
            thumbnail.addEventListener('loadeddata', function() {
                thumbnail.classList.add('loaded');
            });

            // Also check if already loaded (cached)
            if (thumbnail.readyState >= 2) {
                thumbnail.classList.add('loaded');
            }

            // Hover to preview (play thumbnail video)
            card.addEventListener('mouseenter', function() {
                thumbnail.play().catch(function() {});
            });

            card.addEventListener('mouseleave', function() {
                thumbnail.pause();
                thumbnail.currentTime = 0;
            });
        }

        // Click to open modal
        card.addEventListener('click', function() {
            const videoSrc = card.getAttribute('data-video');
            const caption = card.querySelector('.video-caption');

            if (videoSrc) {
                // Determine video type
                const isQuicktime = videoSrc.endsWith('.mov');
                const sourceEl = modalPlayer.querySelector('source');

                sourceEl.src = videoSrc;
                sourceEl.type = isQuicktime ? 'video/quicktime' : 'video/mp4';

                modalPlayer.load();
                modalPlayer.play().catch(function() {});

                if (caption) {
                    modalCaption.textContent = caption.textContent;
                }

                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        modalPlayer.pause();
        modalPlayer.currentTime = 0;
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);

    // Close on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/**
 * WAITLIST FORM FUNCTIONALITY
 * Submit to Google Sheets via Apps Script
 */
function initWaitlistForms() {
    const heroForm = document.getElementById('hero-form');
    const ctaForm = document.getElementById('cta-form');

    // Google Apps Script Web App URL - Replace with your actual URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTd4SByNOOqdkA4EnIwP1ikHMt10Dgv3OjQESMNxUpDQ_jUzAF4RjW2pfNXGHiiIwR/exec';

    function handleFormSubmit(form) {
        const emailInput = form.querySelector('.email-input');
        const submitBtn = form.querySelector('button[type="submit"]');
        const messageEl = form.querySelector('.form-message');
        const email = emailInput.value.trim();

        // Validate email
        if (!isValidEmail(email)) {
            showMessage(messageEl, 'Please enter a valid email address.', 'error');
            return;
        }

        // Disable button and show loading state
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Joining...';

        // Submit to Google Sheets
        submitToGoogleSheets(email, GOOGLE_SCRIPT_URL)
            .then(function(success) {
                if (success) {
                    showMessage(messageEl, "You're on the list! We'll be in touch soon.", 'success');
                    emailInput.value = '';
                } else {
                    showMessage(messageEl, 'Something went wrong. Please try again.', 'error');
                }
            })
            .catch(function() {
                showMessage(messageEl, 'Something went wrong. Please try again.', 'error');
            })
            .finally(function() {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            });
    }

    // Attach handlers
    if (heroForm) {
        heroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(heroForm);
        });
    }

    if (ctaForm) {
        ctaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(ctaForm);
        });
    }
}

/**
 * Submit email to Google Sheets via Apps Script
 */
function submitToGoogleSheets(email, scriptUrl) {
    return new Promise(function(resolve) {
        // If no script URL is configured, simulate success for demo
        if (scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
            // Demo mode - simulate successful submission
            setTimeout(function() {
                console.log('Demo mode: Email would be submitted:', email);
                resolve(true);
            }, 1000);
            return;
        }

        // Real submission to Google Apps Script
        fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                timestamp: new Date().toISOString(),
                source: window.location.href
            })
        })
        .then(function() {
            // With no-cors mode, we can't read the response
            // Assume success if no error
            resolve(true);
        })
        .catch(function(error) {
            console.error('Form submission error:', error);
            resolve(false);
        });
    });
}

/**
 * CONTACT FORM FUNCTIONALITY
 * Submit contact form to Google Sheets
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');

    // Use the same Google Apps Script URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTd4SByNOOqdkA4EnIwP1ikHMt10Dgv3OjQESMNxUpDQ_jUzAF4RjW2pfNXGHiiIwR/exec';

    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const subjectInput = document.getElementById('contact-subject');
        const messageInput = document.getElementById('contact-message');
        const submitBtn = contactForm.querySelector('.contact-submit');
        const messageEl = contactForm.querySelector('.form-message');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const subject = subjectInput.value;
        const message = messageInput.value.trim();

        // Validate
        if (!name || !email || !subject || !message) {
            showMessage(messageEl, 'Please fill in all fields.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage(messageEl, 'Please enter a valid email address.', 'error');
            return;
        }

        // Disable button and show loading
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';

        // Submit to Google Sheets
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'contact',
                name: name,
                email: email,
                subject: subject,
                message: message,
                timestamp: new Date().toISOString(),
                source: window.location.href
            })
        })
        .then(function() {
            showMessage(messageEl, "Thanks for reaching out! We'll get back to you soon.", 'success');
            contactForm.reset();
        })
        .catch(function(error) {
            console.error('Contact form error:', error);
            showMessage(messageEl, 'Something went wrong. Please try again.', 'error');
        })
        .finally(function() {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });
}

/**
 * DEMO REQUEST FORM
 */
function initDemoForm() {
    const demoForm = document.getElementById('demo-form');

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTd4SByNOOqdkA4EnIwP1ikHMt10Dgv3OjQESMNxUpDQ_jUzAF4RjW2pfNXGHiiIwR/exec';

    if (!demoForm) return;

    demoForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const nameInput = document.getElementById('demo-name');
        const emailInput = document.getElementById('demo-email');
        const roleInput = document.getElementById('demo-role');
        const reasonInput = document.getElementById('demo-reason');
        const submitBtn = demoForm.querySelector('.demo-submit');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const role = roleInput.value;
        const reason = reasonInput.value.trim();

        // Validate required fields
        if (!name || !email || !role) {
            alert('Please fill in all required fields.');
            return;
        }

        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Disable button and show loading
        submitBtn.disabled = true;
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Submitting...</span>';

        // Submit to Google Sheets
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'demo',
                name: name,
                email: email,
                role: role,
                reason: reason,
                timestamp: new Date().toISOString(),
                source: window.location.href
            })
        })
        .then(function() {
            // Show success state
            submitBtn.innerHTML = '<span>Request Sent!</span>';
            submitBtn.style.background = '#4CAF50';
            demoForm.reset();

            // Reset button after 3 seconds
            setTimeout(function() {
                submitBtn.innerHTML = originalHTML;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        })
        .catch(function(error) {
            console.error('Demo form error:', error);
            alert('Something went wrong. Please try again.');
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        });
    });
}

/**
 * FAQ ACCORDION FUNCTIONALITY
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function(item) {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(function(otherItem) {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

/**
 * SMOOTH SCROLL
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * UTILITY FUNCTIONS
 */

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show form message
function showMessage(element, message, type) {
    if (!element) return;

    element.textContent = message;
    element.className = 'form-message ' + type;

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(function() {
            element.textContent = '';
            element.className = 'form-message';
        }, 5000);
    }
}

// Check if element is in viewport
function isElementInViewport(el) {
    if (!el) return false;

    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = function() {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
