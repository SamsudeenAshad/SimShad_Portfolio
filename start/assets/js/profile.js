// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: true,
        offset: 100
    });

    // Back to Top Button
    const backToTop = document.getElementById('backToTop');
    
    // Show/hide back to top button
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    // Back to top functionality
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // GitHub iframe handling
    const githubIframe = document.querySelector('.github-iframe-container iframe');
    const iframeOverlay = document.querySelector('.iframe-overlay');
    
    if (githubIframe && iframeOverlay) {
        // Hide overlay when iframe loads
        githubIframe.addEventListener('load', function() {
            setTimeout(() => {
                iframeOverlay.style.opacity = '0';
                setTimeout(() => {
                    iframeOverlay.style.display = 'none';
                }, 300);
            }, 1000);
        });
        
        // Handle iframe errors
        githubIframe.addEventListener('error', function() {
            const loadingMessage = iframeOverlay.querySelector('.loading-message');
            if (loadingMessage) {
                loadingMessage.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Unable to load GitHub profile</p>
                    <a href="https://github.com/SamsudeenAshad" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i>
                        View on GitHub
                    </a>
                `;
            }
        });
    }

    // Animate GitHub stats on scroll
    const statCards = document.querySelectorAll('.stat-card');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const counter = target.querySelector('h3');
                const targetValue = parseInt(counter.textContent);
                
                animateCounter(counter, targetValue);
                statsObserver.unobserve(target);
            }
        });
    });

    statCards.forEach(card => {
        statsObserver.observe(card);
    });

    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + (target >= 50 ? '+' : '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 30);
    }

    // Enhanced mobile navigation
    function initMobileNavigation() {
        const navContainer = document.querySelector('.nav-container');
        const navMenu = document.querySelector('.nav-menu');
        let navToggle = document.querySelector('.nav-toggle');
        
        // Create nav toggle if it doesn't exist
        if (!navToggle && window.innerWidth <= 768) {
            navToggle = document.createElement('button');
            navToggle.className = 'nav-toggle';
            navToggle.innerHTML = '<i class="fas fa-bars"></i>';
            navToggle.setAttribute('aria-label', 'Toggle navigation');
            navToggle.setAttribute('aria-expanded', 'false');
            
            if (navContainer) {
                navContainer.appendChild(navToggle);
            }
        }
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function(e) {
                e.preventDefault();
                const isActive = navMenu.classList.contains('active');
                
                if (isActive) {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.querySelector('i').className = 'fas fa-bars';
                    document.body.style.overflow = '';
                } else {
                    navMenu.classList.add('active');
                    navToggle.setAttribute('aria-expanded', 'true');
                    navToggle.querySelector('i').className = 'fas fa-times';
                    document.body.style.overflow = 'hidden';
                }
            });
            
            // Close menu when clicking on nav links
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.querySelector('i').className = 'fas fa-bars';
                    document.body.style.overflow = '';
                });
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!navContainer.contains(e.target) && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.querySelector('i').className = 'fas fa-bars';
                    document.body.style.overflow = '';
                }
            });
        }
    }
    
    // Handle window resize
    function handleResize() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (window.innerWidth > 768) {
            if (navToggle) {
                navToggle.style.display = 'none';
            }
            if (navMenu) {
                navMenu.classList.remove('active');
                navMenu.style.display = 'flex';
            }
            document.body.style.overflow = '';
        } else {
            if (navToggle) {
                navToggle.style.display = 'block';
            }
            if (navMenu) {
                navMenu.style.display = 'flex';
            }
        }
    }
    
    // Initialize mobile navigation
    initMobileNavigation();
    
    // Handle window resize events
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 250);
    });
    
    // Fix viewport height on mobile browsers
    function setVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', function() {
        setTimeout(setVH, 100);
    });
    
    // Prevent zoom on form inputs (mobile)
    if (window.innerWidth <= 768) {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                if (window.innerWidth <= 768) {
                    const viewport = document.querySelector('meta[name=viewport]');
                    if (viewport) {
                        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
                    }
                }
            });
            
            input.addEventListener('blur', function() {
                if (window.innerWidth <= 768) {
                    const viewport = document.querySelector('meta[name=viewport]');
                    if (viewport) {
                        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=yes');
                    }
                }
            });
        });
    }

    // Particle background effect
    function createParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particles';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        document.body.appendChild(particleContainer);

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(102, 126, 234, 0.3);
                border-radius: 50%;
                animation: float ${Math.random() * 20 + 10}s infinite linear;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 20}s;
            `;
            particleContainer.appendChild(particle);
        }
    }

    createParticles();

    // Skill bars animation
    const skillBars = document.querySelectorAll('.skill-progress');
    const animateSkillBars = () => {
        skillBars.forEach(bar => {
            const percentage = bar.getAttribute('data-percentage');
            bar.style.width = percentage + '%';
        });
    };

    // Intersection Observer for skill bars
    const skillSection = document.querySelector('.skills');
    if (skillSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkillBars();
                }
            });
        });
        observer.observe(skillSection);
    }

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const formFields = contactForm.querySelectorAll('input, textarea');
        
        formFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateField(field);
            });
            
            field.addEventListener('input', function() {
                if (field.classList.contains('error')) {
                    validateField(field);
                }
            });
        });
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            formFields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });
            
            if (isValid) {
                submitForm();
            }
        });
    }

    // Field validation function
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error styling
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Validation rules
        if (fieldName === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        } else if (fieldName === 'name') {
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters long';
            }
        } else if (fieldName === 'subject') {
            if (value.length < 5) {
                isValid = false;
                errorMessage = 'Subject must be at least 5 characters long';
            }
        } else if (fieldName === 'message') {
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters long';
            }
        }
        
        // Common required field validation
        if (!value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Add error styling and message if not valid
        if (!isValid) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMessage;
            field.parentNode.appendChild(errorDiv);
        }
        
        return isValid;
    }

    // Enhanced form submission
    function submitForm() {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.innerHTML = '<span class="loading-animation"></span> Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            // Show success message
            showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            
            // Reset form
            contactForm.reset();
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    // Enhanced notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide notification after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });

    // Performance optimization: Throttle scroll events
    let ticking = false;
    
    function updateScrollEffects() {
        // Navbar scroll effect
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Back to top visibility
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
        
        // Active navigation link highlighting
        updateActiveNavLink();
        
        ticking = false;
    }
    
    function updateActiveNavLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    });

    // Profile photo handling
    const profilePhotos = document.querySelectorAll('.profile-photo, .profile-avatar');
    
    profilePhotos.forEach(photo => {
        photo.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        photo.addEventListener('error', function() {
            // Create fallback element
            const fallback = document.createElement('div');
            fallback.className = 'profile-fallback';
            fallback.textContent = 'SA';
            fallback.style.cssText = `
                width: 100%;
                height: 100%;
                background: var(--gradient-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 2rem;
                font-weight: bold;
                border-radius: ${this.classList.contains('profile-avatar') ? '50%' : '20px'};
            `;
            
            this.parentNode.replaceChild(fallback, this);
        });
    });

    // Enhanced image loading animation
    const imageContainers = document.querySelectorAll('.image-container');
    const containerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('img');
                if (img) {
                    img.style.animation = 'fadeInImage 0.5s ease forwards';
                }
                containerObserver.unobserve(entry.target);
            }
        });
    });

    imageContainers.forEach(container => {
        containerObserver.observe(container);
    });

    // Initialize everything
    console.log('Profile page loaded successfully!');
});
