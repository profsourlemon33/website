// Global variables for Three.js
let scene, camera, renderer, satelliteGroup;
let targetRotationX = 0, targetRotationY = 0;
let isDragging = false;
let previousMouseX = 0, previousMouseY = 0;

// Initialize particles background
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Tab functionality with comprehensive navigation
function showTab(tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerTitleElement = document.getElementById('header-title');
    
    // Hide all tab contents
    tabContents.forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('active-tab', 'section-visible');
        content.classList.add('section-hidden');
    });

    // Remove active class from all nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show selected tab
    const activeContent = document.getElementById(tabId);
    if (activeContent) {
        activeContent.classList.remove('hidden', 'section-hidden');
        activeContent.classList.add('active-tab', 'section-visible');
        
        // Add fade-in animation
        activeContent.style.opacity = '0';
        setTimeout(() => {
            activeContent.style.opacity = '1';
            activeContent.style.transition = 'opacity 0.3s ease';
        }, 10);
    }

    // Add active class to corresponding nav link
    const activeLinks = document.querySelectorAll(`[data-tab="${tabId}"]`);
    activeLinks.forEach(link => {
        if (link.classList.contains('nav-link')) {
            link.classList.add('active');
        }
    });

    // Update header title dynamically
    if (headerTitleElement) {
        if (tabId === 'home') {
            headerTitleElement.innerHTML = '<i class="fas fa-rocket mr-2"></i> My Cosmic E-Portfolio';
        } else {
            headerTitleElement.innerHTML = '<i class="fas fa-rocket mr-2"></i> Portfolio';
        }
    }

    // Handle canvas for home tab
    if (tabId === 'home') {
        const homeCanvasContainer = document.getElementById('home-canvas-container');
        if (homeCanvasContainer) {
            homeCanvasContainer.style.display = 'block';
            if (!window.threeDInitialized) {
                setTimeout(initThreeD, 100);
            }
        }
    }

    // Close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
    }

    // Update URL and scroll to top
    history.pushState(null, '', `#${tabId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Three.js initialization
function initThreeD() {
    try {
        const canvas = document.getElementById('home-canvas');
        if (!canvas) {
            console.error('Canvas element not found for Three.js');
            return;
        }

        window.threeDInitialized = true;

        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0d1117);

        // Camera
        const container = canvas.parentElement;
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 3;

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Hide loading text
        const loadingText = document.getElementById('loading-text');
        if (loadingText) loadingText.style.display = 'none';

        // Satellite model
        satelliteGroup = new THREE.Group();
        scene.add(satelliteGroup);

        // Materials
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            specular: 0xffffff,
            shininess: 80
        });
        const solarPanelMaterial = new THREE.MeshPhongMaterial({
            color: 0x8e2de2,
            emissive: 0x000022,
            specular: 0x8888aa,
            shininess: 50,
            side: THREE.DoubleSide
        });
        const antennaMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            specular: 0xaaaaaa,
            shininess: 30
        });

        // Main satellite body (more realistic proportions)
        const bodyGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.8);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        satelliteGroup.add(body);

        // Add body details - equipment panels
        const panelDetailGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.05);
        const panelDetailMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            specular: 0x666666,
            shininess: 40
        });

        // Front equipment panel
        const frontPanel = new THREE.Mesh(panelDetailGeometry, panelDetailMaterial);
        frontPanel.position.set(0, 0.1, 0.425);
        satelliteGroup.add(frontPanel);

        // Side equipment panels
        const sidePanel1 = new THREE.Mesh(panelDetailGeometry, panelDetailMaterial);
        sidePanel1.position.set(0.425, 0.1, 0);
        sidePanel1.rotation.y = Math.PI / 2;
        satelliteGroup.add(sidePanel1);

        const sidePanel2 = new THREE.Mesh(panelDetailGeometry, panelDetailMaterial);
        sidePanel2.position.set(-0.425, 0.1, 0);
        sidePanel2.rotation.y = Math.PI / 2;
        satelliteGroup.add(sidePanel2);

        // Solar panels (more realistic design)
        const panelGeometry = new THREE.BoxGeometry(0.03, 2.2, 1.0);
        const panel1 = new THREE.Mesh(panelGeometry, solarPanelMaterial);
        panel1.position.set(0.8, 0, 0);
        satelliteGroup.add(panel1);

        const panel2 = new THREE.Mesh(panelGeometry, solarPanelMaterial);
        panel2.position.set(-0.8, 0, 0);
        satelliteGroup.add(panel2);

        // Solar panel grid lines
        const gridMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a2a,
            specular: 0x444444,
            shininess: 20
        });

        // Add grid lines to panels
        for (let i = 0; i < 5; i++) {
            const gridLineGeometry = new THREE.BoxGeometry(0.005, 2.2, 0.02);
            const gridLine1 = new THREE.Mesh(gridLineGeometry, gridMaterial);
            gridLine1.position.set(0.801, 0, -0.4 + (i * 0.2));
            satelliteGroup.add(gridLine1);

            const gridLine2 = new THREE.Mesh(gridLineGeometry, gridMaterial);
            gridLine2.position.set(-0.801, 0, -0.4 + (i * 0.2));
            satelliteGroup.add(gridLine2);
        }

        // Communication dish
        const dishGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16);
        const dishMaterial = new THREE.MeshPhongMaterial({
            color: 0xeeeeee,
            specular: 0xffffff,
            shininess: 100
        });
        const dish = new THREE.Mesh(dishGeometry, dishMaterial);
        dish.position.set(0, 0.5, 0);
        dish.rotation.x = Math.PI / 6;
        satelliteGroup.add(dish);

        // Dish support
        const supportGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
        const support = new THREE.Mesh(supportGeometry, antennaMaterial);
        support.position.set(0, 0.3, 0);
        satelliteGroup.add(support);

        // Multiple antennas
        const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.4, 6);
        
        // Main communication antenna
        const antenna1 = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna1.position.set(0.2, 0.6, 0.2);
        satelliteGroup.add(antenna1);

        // Secondary antenna
        const antenna2 = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna2.position.set(-0.2, 0.6, -0.2);
        antenna2.scale.set(1, 0.7, 1);
        satelliteGroup.add(antenna2);

        // Antenna tips
        const tipGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const tip1 = new THREE.Mesh(tipGeometry, antennaMaterial);
        tip1.position.set(0.2, 0.8, 0.2);
        satelliteGroup.add(tip1);

        const tip2 = new THREE.Mesh(tipGeometry, antennaMaterial);
        tip2.position.set(-0.2, 0.74, -0.2);
        satelliteGroup.add(tip2);

        // Thruster modules
        const thrusterGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.15, 8);
        const thrusterMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            specular: 0x888888,
            shininess: 60
        });

        const thruster1 = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
        thruster1.position.set(0.3, -0.3, -0.5);
        thruster1.rotation.x = Math.PI / 2;
        satelliteGroup.add(thruster1);

        const thruster2 = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
        thruster2.position.set(-0.3, -0.3, -0.5);
        thruster2.rotation.x = Math.PI / 2;
        satelliteGroup.add(thruster2);

        // Solar panel hinges
        const hingeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8);
        const hingeConnect1 = new THREE.Mesh(hingeGeometry, antennaMaterial);
        hingeConnect1.position.set(0.62, 0, 0);
        hingeConnect1.rotation.z = Math.PI / 2;
        satelliteGroup.add(hingeConnect1);

        const hingeConnect2 = new THREE.Mesh(hingeGeometry, antennaMaterial);
        hingeConnect2.position.set(-0.62, 0, 0);
        hingeConnect2.rotation.z = Math.PI / 2;
        satelliteGroup.add(hingeConnect2);

        // Lighting with cosmic theme
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0x8e2de2, 0.8);
        directionalLight1.position.set(5, 5, 5);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0x4a00e0, 0.6);
        directionalLight2.position.set(-5, -5, -5);
        scene.add(directionalLight2);

        // Mouse/Touch interaction handlers
        const handleStart = (event) => {
            isDragging = true;
            const clientX = event.clientX || (event.touches && event.touches[0].clientX);
            const clientY = event.clientY || (event.touches && event.touches[0].clientY);
            previousMouseX = clientX;
            previousMouseY = clientY;
        };

        const handleEnd = () => {
            isDragging = false;
        };

        const handleMove = (event) => {
            if (!isDragging) return;
            
            event.preventDefault();
            const clientX = event.clientX || (event.touches && event.touches[0].clientX);
            const clientY = event.clientY || (event.touches && event.touches[0].clientY);
            
            const deltaX = clientX - previousMouseX;
            const deltaY = clientY - previousMouseY;

            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;

            previousMouseX = clientX;
            previousMouseY = clientY;
        };

        // Add event listeners
        canvas.addEventListener('mousedown', handleStart);
        canvas.addEventListener('mouseup', handleEnd);
        canvas.addEventListener('mousemove', handleMove);
        canvas.addEventListener('touchstart', handleStart, { passive: false });
        canvas.addEventListener('touchend', handleEnd);
        canvas.addEventListener('touchmove', handleMove, { passive: false });

        // Resize handler
        const handleResize = () => {
            const container = canvas.parentElement;
            if (container && camera && renderer) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            if (satelliteGroup) {
                // Smooth rotation
                satelliteGroup.rotation.y += (targetRotationY - satelliteGroup.rotation.y) * 0.05;
                satelliteGroup.rotation.x += (targetRotationX - satelliteGroup.rotation.x) * 0.05;

                // Auto rotation when not dragging
                if (!isDragging) {
                    satelliteGroup.rotation.y += 0.005;
                    satelliteGroup.rotation.x += 0.002;
                }
            }

            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        };
        
        animate();
    } catch (error) {
        console.error('Error initializing Three.js:', error);
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.innerHTML = '<p class="text-red-400">Failed to load 3D model</p>';
        }
    }
}

// Enhanced form submission handler
function handleFormSubmission(form) {
    const button = form.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    
    // Validate form
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value;
    const message = form.message.value.trim();
    
    if (!firstName || !lastName || !email || !subject || !message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Update button state
    button.innerHTML = '<i class="fas fa-rocket fa-spin mr-2"></i> Launching Message...';
    button.disabled = true;
    
    // Simulate form submission with better feedback
    setTimeout(() => {
        const fullName = `${firstName} ${lastName}`;
        showNotification(`Thank you ${fullName}! Your message has been launched successfully. I'll get back to you within 24 hours.`, 'success');
        form.reset();
        button.innerHTML = originalText;
        button.disabled = false;
    }, 2000);
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
    
    if (type === 'success') {
        notification.classList.add('bg-green-600', 'border-green-500', 'text-white');
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-check-circle text-xl"></i>
                <div>
                    <p class="font-medium">Success!</p>
                    <p class="text-sm opacity-90">${message}</p>
                </div>
            </div>
        `;
    } else if (type === 'error') {
        notification.classList.add('bg-red-600', 'border-red-500', 'text-white');
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-exclamation-circle text-xl"></i>
                <div>
                    <p class="font-medium">Error</p>
                    <p class="text-sm opacity-90">${message}</p>
                </div>
            </div>
        `;
    } else {
        notification.classList.add('bg-blue-600', 'border-blue-500', 'text-white');
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-info-circle text-xl"></i>
                <div>
                    <p class="text-sm">${message}</p>
                </div>
            </div>
        `;
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Form field enhancements
function enhanceContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    // Add real-time validation
    const inputs = contactForm.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            clearFieldError(input);
        });
    });
    
    // Email field specific validation
    const emailField = contactForm.querySelector('#email');
    if (emailField) {
        emailField.addEventListener('blur', () => {
            if (emailField.value && !isValidEmail(emailField.value)) {
                showFieldError(emailField, 'Please enter a valid email address');
            }
        });
    }
}

function validateField(field) {
    if (!field.value.trim()) {
        showFieldError(field, 'This field is required');
        return false;
    }
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('border-red-500');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-red-400 text-sm mt-1';
    errorDiv.textContent = message;
    
    field.parentElement.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('border-red-500');
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Enhanced micro-interactions
function addMicroInteractions() {
    // Enhanced card hover effects
    const cards = document.querySelectorAll('.glass-card, .project-card, .skill-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function(e) {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function(e) {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Enhanced button interactions
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function(e) {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        button.addEventListener('mousedown', function(e) {
            this.style.transform = 'translateY(-1px) scale(1.02)';
        });
        
        button.addEventListener('mouseup', function(e) {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
    });
    
    // Enhanced social link interactions
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function(e) {
            this.style.transform = 'translateY(-5px) scale(1.1)';
        });
        
        link.addEventListener('mouseleave', function(e) {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Enhanced form field interactions
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
        input.addEventListener('focus', function(e) {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 0 0 3px rgba(142, 45, 226, 0.1), 0 4px 15px rgba(142, 45, 226, 0.2)';
        });
        
        input.addEventListener('blur', function(e) {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

// Enhanced scroll animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.filter = 'blur(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.glass-card, .project-card, .skill-item, .timeline-item');
    animatedElements.forEach(el => {
        // Reset animation state when element goes out of view
        const resetObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    entry.target.style.filter = 'blur(5px)';
                }
            });
        }, { threshold: 0 });
        
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.filter = 'blur(5px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
        resetObserver.observe(el);
    });
}

// Enhanced particle system with better performance
function createEnhancedParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles';
    document.body.appendChild(particleContainer);
    
    const particleCount = window.innerWidth < 768 ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Enhanced particle properties
        const size = Math.random() * 3 + 1;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const duration = Math.random() * 10 + 8;
        const delay = Math.random() * 5;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = delay + 's';
        
        // Add subtle random colors
        const hue = Math.random() * 60 + 240; // Blue to purple range
        particle.style.background = `hsl(${hue}, 70%, 60%)`;
        particle.style.boxShadow = `0 0 ${size * 2}px hsl(${hue}, 70%, 60%)`;
        
        particleContainer.appendChild(particle);
    }
}

// Enhanced navigation with smooth indicators
function enhanceNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active from all links
            navLinks.forEach(l => {
                l.classList.remove('active');
                l.style.transform = 'translateY(0)';
            });
            
            // Add active to clicked link
            this.classList.add('active');
            this.style.transform = 'translateY(-2px)';
            
            // Show corresponding tab
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
            
            // Add ripple effect
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(142, 45, 226, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.marginLeft = '-10px';
            ripple.style.marginTop = '-10px';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentElement) {
                    ripple.parentElement.removeChild(ripple);
                }
            }, 600);
        });
    });
}

// Add ripple animation keyframes
function addRippleAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Enhanced form experience
function enhanceFormExperience() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    // Add progress indicator for form completion
    const requiredFields = contactForm.querySelectorAll('[required]');
    const progressBar = document.createElement('div');
    progressBar.className = 'form-progress';
    progressBar.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        height: 3px;
        background: var(--gradient-purple);
        border-radius: 3px;
        transition: width 0.3s ease;
        width: 0%;
        box-shadow: 0 0 10px rgba(142, 45, 226, 0.5);
    `;
    
    contactForm.style.position = 'relative';
    contactForm.insertBefore(progressBar, contactForm.firstChild);
    
    function updateProgress() {
        const filledFields = Array.from(requiredFields).filter(field => field.value.trim());
        const progress = (filledFields.length / requiredFields.length) * 100;
        progressBar.style.width = progress + '%';
    }
    
    requiredFields.forEach(field => {
        field.addEventListener('input', updateProgress);
        field.addEventListener('blur', updateProgress);
    });
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    // Create enhanced particle background
    createEnhancedParticles();
    
    // Add ripple animation styles
    addRippleAnimation();
    
    // Add micro-interactions
    addMicroInteractions();
    
    // Add scroll animations
    addScrollAnimations();
    
    // Get DOM elements
    const navLinks = document.querySelectorAll('.nav-link:not(.mobile-nav-link)');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const contactForm = document.getElementById('contact-form');
    
    // All interactive elements for navigation
    const allNavElements = document.querySelectorAll('[data-tab]');

    // Mobile menu toggle
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
    }

    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.contains(e.target) && 
            mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
        }
    });

    // Event listeners for all navigation elements (including cards, buttons, etc.)
    allNavElements.forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = e.currentTarget.dataset.tab;
            if (tabId) {
                showTab(tabId);
            }
        });
    });

    // Initialize from URL hash
    const initialHash = window.location.hash.substring(1);
    const initialTab = initialHash && document.getElementById(initialHash) ? initialHash : 'home';
    showTab(initialTab);

    // Form submission and enhancements
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmission(contactForm);
        });
        
        // Enhance the contact form
        enhanceContactForm();
        
        // Enhance form experience
        enhanceFormExperience();
    }

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
        const tabId = window.location.hash.substring(1) || 'home';
        showTab(tabId);
    });

    // Add interactive hover effects to cards
    const interactiveCards = document.querySelectorAll('.interactive-element');
    interactiveCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});

// Make functions available globally for inline onclick handlers
window.showTab = showTab;
window.initThreeD = initThreeD; 