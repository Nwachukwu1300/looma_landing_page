/**
 * LOOMA LANDING PAGE - JavaScript
 * Handles: Carousel, Video player, Waitlist forms, Smooth scroll
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initCarousel();
    initVideoPlayer();
    initWaitlistForms();
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
 * VIDEO PLAYER FUNCTIONALITY
 * Click to play video with YouTube embed
 */
function initVideoPlayer() {
    const playButton = document.getElementById('play-button');
    const videoPlaceholder = document.getElementById('video-placeholder');
    const videoEmbed = document.getElementById('video-embed');
    const iframe = videoEmbed ? videoEmbed.querySelector('iframe') : null;

    if (playButton && videoPlaceholder && videoEmbed && iframe) {
        playButton.addEventListener('click', function() {
            // Get the video URL from data-src
            const videoSrc = iframe.getAttribute('data-src');

            if (videoSrc) {
                // Set the iframe src to start loading/playing the video
                iframe.setAttribute('src', videoSrc);

                // Hide placeholder, show video
                videoPlaceholder.style.display = 'none';
                videoEmbed.style.display = 'block';
            }
        });
    }
}

/**
 * WAITLIST FORM FUNCTIONALITY
 * Submit to Google Sheets via Apps Script
 */
function initWaitlistForms() {
    const heroForm = document.getElementById('hero-form');
    const ctaForm = document.getElementById('cta-form');

    // Google Apps Script Web App URL - Replace with your actual URL
    const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

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
