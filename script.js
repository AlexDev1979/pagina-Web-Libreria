// JavaScript adaptado para el header de la librería escolar
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos del DOM - Adaptado a las clases CSS
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-menu a');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const cartCount = document.querySelector('.cart-count');

    // Toggle menú móvil
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    // Cerrar menú móvil al hacer click en un enlace
    mobileNavLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (hamburger && mobileMenu) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        });
    });

    // Efecto de scroll en el header
    window.addEventListener('scroll', function() {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // Función para establecer el enlace activo
    function setActiveLink(clickedLink, links) {
        links.forEach(function(link) {
            link.classList.remove('active');
        });
        clickedLink.classList.add('active');
    }

    // Manejo de enlaces activos en el menú desktop
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            setActiveLink(e.target, navLinks);
            
            // Sincronizar con el menú móvil
            const href = e.target.getAttribute('href');
            const mobileLink = document.querySelector('.mobile-menu a[href="' + href + '"]');
            if (mobileLink) {
                setActiveLink(mobileLink, mobileNavLinks);
            }
        });
    });

    // Manejo de enlaces activos en el menú móvil
    mobileNavLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            setActiveLink(e.target, mobileNavLinks);
            
            // Sincronizar con el menú desktop
            const href = e.target.getAttribute('href');
            const desktopLink = document.querySelector('.nav-link[href="' + href + '"]');
            if (desktopLink) {
                setActiveLink(desktopLink, navLinks);
            }
        });
    });

    // Cerrar menú móvil al redimensionar la ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            if (hamburger && mobileMenu) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        }
    });

    // Cerrar menú móvil al hacer click fuera de él
    document.addEventListener('click', function(e) {
        if (hamburger && mobileMenu) {
            if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        }
    });

    // Animación suave para el scroll
    function smoothScroll(target) {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }

    // Aplicar smooth scroll a todos los enlaces del menú
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            if (target !== '#') {
                smoothScroll(target);
            }
        });
    });
});

// Función para actualizar el estado activo basado en el scroll
function updateActiveOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-menu a');
    
    let current = '';
    
    sections.forEach(function(section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(function(link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
    
    mobileNavLinks.forEach(function(link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// JavaScript específico para la sección Hero
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll para botones CTA
    const ctaButtons = document.querySelectorAll('.cta-primary, .cta-secondary');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Efecto de parallax sutil en el hero
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });

    // Animación adicional para los elementos flotantes
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
        const randomDelay = Math.random() * 2;
        const randomDuration = 4 + Math.random() * 4;
        
        element.style.animationDelay = `${randomDelay}s`;
        element.style.animationDuration = `${randomDuration}s`;
    });

    // Intersection Observer para animaciones al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observar la sección hero
    const heroContent = document.querySelector('.hero-container');
    if (heroContent) {
        observer.observe(heroContent);
    }
});

// JavaScript para la sección de categorías
document.addEventListener('DOMContentLoaded', function() {
    
    // Intersection Observer para animaciones al scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Animar las tarjetas de categorías secuencialmente
                const categoryCards = entry.target.querySelectorAll('.category-card');
                categoryCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        });
    }, observerOptions);

    // Observar la sección de categorías
    const categoriesSection = document.querySelector('.categories');
    if (categoriesSection) {
        observer.observe(categoriesSection);
    }

    // Efectos de hover mejorados
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('card-hover');
            
            const icon = this.querySelector('.category-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(2deg)';
            }
        });

        card.addEventListener('mouseleave', function() {
            this.classList.remove('card-hover');
            
            const icon = this.querySelector('.category-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });

    // Funcionalidad de los enlaces de categorías
    const categoryLinks = document.querySelectorAll('.category-link');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const category = this.getAttribute('href').substring(1);
            
            this.style.transform = 'translateY(-2px) scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = 'translateY(-2px) scale(1)';
            }, 150);
            
            console.log('Navegando a la categoría:', category);
            
            const targetSection = document.querySelector('#' + category);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Efecto de paralaje sutil en el fondo de categorías
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const categoriesSection = document.querySelector('.categories');
        
        if (categoriesSection) {
            const rect = categoriesSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                categoriesSection.style.backgroundPosition = `center ${scrolled * 0.05}px`;
            }
        }
    });
});

// JavaScript para la sección de productos
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM - Adaptado a las clases CSS
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const showMoreBtn = document.querySelector('.show-more-btn');
    
    let currentFilter = 'recomendados';
    let showingMore = false;

    // Función para filtrar productos
    function filterProducts(category) {
        const showMoreContainer = document.querySelector('.show-more-container');
        let visibleCount = 0;
        let hiddenCount = 0;
        
        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            if (category === 'all' || cardCategory === category) {
                card.classList.remove('fade-out');
                card.classList.add('fade-in');
                
                if (!showingMore && visibleCount >= 4) {
                    card.classList.add('hidden');
                    hiddenCount++;
                } else {
                    card.classList.remove('hidden');
                    visibleCount++;
                }
            } else {
                card.classList.remove('fade-in');
                card.classList.add('fade-out');
                setTimeout(() => {
                    card.classList.add('hidden');
                }, 300);
            }
        });
        
        if (showMoreContainer) {
            if (hiddenCount > 0) {
                showMoreContainer.classList.remove('hidden');
            } else {
                showMoreContainer.classList.add('hidden');
            }
        }
    }

    // Función para mostrar más productos
    function showMoreProducts() {
        const showMoreContainer = document.querySelector('.show-more-container');
        const hiddenCards = document.querySelectorAll('.product-card.hidden');
        const currentFilterCards = Array.from(hiddenCards).filter(card => 
            card.getAttribute('data-category') === currentFilter
        );

        if (currentFilterCards.length > 0) {
            showingMore = true;
            
            currentFilterCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.remove('hidden');
                    card.classList.add('show');
                }, index * 100);
            });

            if (showMoreBtn) {
                showMoreBtn.innerHTML = `
                    <span>Mostrar Menos</span>
                    <span class="arrow">↑</span>
                `;
            }
        } else {
            showingMore = false;
            const allCards = document.querySelectorAll('.product-card');
            let visibleCount = 0;
            let hiddenCount = 0;
            
            allCards.forEach((card) => {
                if (card.getAttribute('data-category') === currentFilter) {
                    if (visibleCount >= 4) {
                        card.classList.add('hidden');
                        card.classList.remove('show');
                        hiddenCount++;
                    } else {
                        visibleCount++;
                    }
                }
            });

            if (showMoreBtn) {
                showMoreBtn.innerHTML = `
                    <span>Mostrar Más</span>
                    <span class="arrow">↓</span>
                `;
            }
            
            if (hiddenCount === 0 && showMoreContainer) {
                showMoreContainer.classList.add('hidden');
            }
        }
    }

    // Event listeners para los botones de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.getAttribute('data-filter');
            showingMore = false;
            
            if (showMoreBtn) {
                showMoreBtn.innerHTML = `
                    <span>Mostrar Más</span>
                    <span class="arrow">↓</span>
                `;
            }
            
            filterProducts(currentFilter);
        });
    });

    // Event listener para el botón "Mostrar Más"
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', showMoreProducts);
    }

    // Event listeners para los inputs de cantidad
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            if (this.value < 1) {
                this.value = 1;
            }
        });
    });

    // Event listeners para los botones "Añadir al Carrito"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            const quantity = productCard.querySelector('.quantity-input').value;
            
            this.textContent = 'AÑADIDO ✓';
            this.style.backgroundColor = '#27ae60';
            
            setTimeout(() => {
                this.textContent = 'AÑADIR AL CARRO';
                this.style.backgroundColor = '#3498db';
            }, 2000);
            
            console.log(`Producto añadido: ${productName}, Cantidad: ${quantity}`);
        });
    });

    // Event listeners para los botones de favoritos
    document.querySelectorAll('.favorite-btn').forEach(button => {
        button.addEventListener('click', function() {
            if (this.textContent === '♡') {
                this.textContent = '♥';
                this.style.color = '#e74c3c';
            } else {
                this.textContent = '♡';
                this.style.color = '#333';
            }
        });
    });

    // Event listeners para los botones de comparar
    document.querySelectorAll('.compare-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.style.backgroundColor = '#3498db';
            this.style.color = 'white';
            this.style.borderColor = '#3498db';
            
            setTimeout(() => {
                this.style.backgroundColor = '#ecf0f1';
                this.style.color = '#333';
                this.style.borderColor = '#bdc3c7';
            }, 1000);
            
            console.log('Producto añadido a comparación');
        });
    });

    // Inicializar con el filtro por defecto
    filterProducts(currentFilter);

    // Animación de carga suave
    setTimeout(() => {
        productCards.forEach((card, index) => {
            if (index < 4) {
                card.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s forwards`;
            }
        });
    }, 100);
});

// JavaScript para la sección de marcas (Swiper)
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si Swiper está disponible
    if (typeof Swiper !== 'undefined') {
        initializeBrandsSwiper();
    } else {
        setTimeout(initializeBrandsSwiper, 100);
    }
});

function initializeBrandsSwiper() {
    const brandsSwiper = new Swiper('.brands-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        centeredSlides: false,
        
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        
        effect: 'slide',
        speed: 800,
        
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 20,
            },
            480: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 25,
            },
            1024: {
                slidesPerView: 4,
                spaceBetween: 30,
            },
            1200: {
                slidesPerView: 5,
                spaceBetween: 30,
            },
        },
        
        grabCursor: true,
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: true,
        
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        
        mousewheel: {
            enabled: false,
        },
        
        on: {
            init: function() {
                console.log('Swiper de marcas inicializado');
            },
            slideChange: function() {
                const activeSlide = this.slides[this.activeIndex];
                if (activeSlide) {
                    activeSlide.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        activeSlide.style.transform = 'scale(1)';
                    }, 300);
                }
            },
            touchStart: function() {
                this.autoplay.stop();
            },
            touchEnd: function() {
                this.autoplay.start();
            },
        },
    });
    
    addBrandsInteractivity();
}

function addBrandsInteractivity() {
    const brandCards = document.querySelectorAll('.brand-card');
    
    brandCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        card.addEventListener('click', function() {
            const brandName = this.querySelector('.brand-name').textContent;
            
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            }, 150);
            
            console.log(`Marca seleccionada: ${brandName}`);
        });
    });
}

// JavaScript para el newsletter
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            if (email) {
                alert('¡Gracias por suscribirte al boletín!');
                this.reset();
            }
        });
    }
});

// Funciones auxiliares
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimización para performance
window.addEventListener('resize', debounce(function() {
    const brandsSwiper = document.querySelector('.brands-swiper');
    if (brandsSwiper && brandsSwiper.swiper) {
        brandsSwiper.swiper.update();
    }
}, 250));

// Pausar/reanudar autoplay cuando la página no está visible
document.addEventListener('visibilitychange', function() {
    const brandsSwiper = document.querySelector('.brands-swiper');
    
    if (brandsSwiper && brandsSwiper.swiper) {
        if (document.hidden) {
            brandsSwiper.swiper.autoplay.stop();
        } else {
            brandsSwiper.swiper.autoplay.start();
        }
    }
});

// Funciones para actualizar contenido dinámicamente
function changeHeroBackground(imageUrl) {
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.backgroundImage = `linear-gradient(135deg, #667eea 0%, #764ba2 100%), url('${imageUrl}')`;
    }
}

function updateHeroContent(title, subtitle) {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroTitle) heroTitle.textContent = title;
    if (heroSubtitle) heroSubtitle.textContent = subtitle;
}

function filterCategories(searchTerm) {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        const title = card.querySelector('.category-title').textContent.toLowerCase();
        const description = card.querySelector('.category-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase())) {
            card.style.display = 'block';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        } else {
            card.style.display = 'none';
        }
    });
}

function resetCategoriesView() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });
}

function updateCartCounter() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        let currentCount = parseInt(cartCount.textContent) || 0;
        cartCount.textContent = currentCount + 1;
    }
}

// Exponer funciones globalmente
window.filterCategories = filterCategories;
window.resetCategoriesView = resetCategoriesView;
window.updateCartCounter = updateCartCounter;
window.changeHeroBackground = changeHeroBackground;
window.updateHeroContent = updateHeroContent;