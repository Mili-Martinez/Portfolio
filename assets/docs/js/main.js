/**
 * Portfolio Main Interactivity Library
 * Milagros Martinez - Portfolio
 */

// --- 1. Animaciones de Hero (Staggered Title & Subtitle) ---
const initHeroTitleAnimation = () => {
    const heroTitle = document.querySelector('header h1');
    if (!heroTitle) return;

    // Dividimos por saltos de línea (regex para soportar <br>, <br/>, <br >)
    const lines = heroTitle.innerHTML.split(/<br\s*\/?>/i);
    heroTitle.innerHTML = lines.map((line, index) => {
        return `<span class="inline-block overflow-hidden align-bottom pb-2"><span class="block transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" style="transform: translateY(120%); opacity: 0; transition-delay: ${150 + (index * 200)}ms" id="hero-line-${index}">${line}</span></span>`;
    }).join('<br>');

    // Forzar reflow para registrar el estado inicial en línea
    void heroTitle.offsetWidth;

    // Activar animación cambiando estilos en el siguiente frame
    setTimeout(() => {
        lines.forEach((_, index) => {
            const el = document.getElementById(`hero-line-${index}`);
            if (el) {
                el.style.transform = 'translateY(0)';
                el.style.opacity = '1';
            }
        });
    }, 50);
};

const initHeroElementsAnimation = () => {
    // Para index.html (el div con typing text después del header)
    const secondaryHero = document.querySelector("header + div");
    if (secondaryHero) {
        secondaryHero.classList.add("reveal-init");
        setTimeout(() => {
            secondaryHero.classList.add("reveal-active");
            const typingText = document.getElementById("hero-typing-text");
            if (typingText) {
                typeWriter(typingText, 25);
            }
        }, 800);
    }

    // Para las páginas de casos de estudio (elementos dentro del header excepto el h1)
    const headerChildren = document.querySelectorAll("header > *:not(h1)");
    headerChildren.forEach((el) => {
        el.classList.add("reveal-init");
        setTimeout(() => el.classList.add("reveal-active"), 800);
    });
};

// --- 2. Typewriter Effect (Efecto de Escritura Corregido) ---
const typeWriter = (element, speed = 25) => {
    const textNodes = [];
    const getTextNodes = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            // Guardamos nodos de texto con contenido
            if (node.nodeValue.trim().length > 0 || node.nodeValue === ' ') {
                textNodes.push(node);
            }
        } else {
            // Omitimos los tooltips absolutos del efecto máquina de escribir
            if (node.classList && node.classList.contains('absolute')) {
                return;
            }
            for (let child of node.childNodes) {
                getTextNodes(child);
            }
        }
    };

    getTextNodes(element);

    // Guardar textos originales colapsando espacios múltiples y saltos de línea (evita tartamudeos)
    const originalTexts = textNodes.map((node, index) => {
        let val = node.nodeValue.replace(/\s+/g, ' ');
        if (index === 0) val = val.trimStart();
        if (index === textNodes.length - 1) val = val.trimEnd();
        node.nodeValue = "";
        return val;
    });

    let nodeIndex = 0;
    let charIndex = 0;

    const type = () => {
        if (nodeIndex < textNodes.length) {
            const currentNode = textNodes[nodeIndex];
            const fullText = originalTexts[nodeIndex];

            if (charIndex < fullText.length) {
                currentNode.nodeValue += fullText[charIndex];
                charIndex++;
                setTimeout(type, speed);
            } else {
                nodeIndex++;
                charIndex = 0;
                setTimeout(type, speed);
            }
        }
    };

    type();
};

// --- 3. Cursor Personalizado (Hiding System Cursor) ---
const initCustomCursor = () => {
    if (window.matchMedia("(pointer: fine)").matches) {
        // Clase para ocultar el cursor nativo de Windows vía CSS
        document.documentElement.classList.add('custom-cursor-active');

        const cursor = document.createElement('div');
        cursor.className = 'fixed top-0 left-0 w-3 h-3 bg-burnt-orangeish/80 rounded-full pointer-events-none z-[100] transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block';
        cursor.style.opacity = '1';
        document.body.appendChild(cursor);

        let scale = 1;
        document.addEventListener('mousemove', (e) => {
            cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) scale(${scale})`;
        });

        // Ocultar y mostrar cursor al salir y entrar en la ventana del navegador
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
        });

        // Efecto hoverable (agrandar el cursor)
        const updateHoverables = () => {
            const hoverables = document.querySelectorAll('a, button, .group, .persona-tab, .border-2, .cursor-help');
            hoverables.forEach(el => {
                el.addEventListener('mouseenter', () => { scale = 3; });
                el.addEventListener('mouseleave', () => { scale = 1; });
            });
        };
        updateHoverables();
    }
};

// --- 4. Enlaces Magnéticos (Magnetic Elements) ---
const initMagneticLinks = () => {
    // Seleccionamos elementos interactivos individuales pequeños
    const magnetics = document.querySelectorAll('nav a, nav button, footer a, header div a, .persona-tab, .magnetic-el');
    
    magnetics.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
            el.style.transform = `translate(${x}px, ${y}px)`;
            el.style.transition = 'transform 0.1s ease-out';
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0px, 0px)';
            el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
};

// --- 5. Navbar Inteligente (Smart Navbar + Scroll shadow) ---
const initSmartNavbar = (navId = 'main-nav') => {
    const nav = document.getElementById(navId);
    if (!nav) return;

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
        // Añadir sombra sutil cuando no esté al tope de la página
        if (window.scrollY > 0) {
            nav.classList.add('shadow-[0_1px_10px_rgba(0,65,106,0.08)]');
        } else {
            nav.classList.remove('shadow-[0_1px_10px_rgba(0,65,106,0.08)]');
        }

        // Ocultar al bajar scroll, mostrar al subir scroll
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        lastScrollY = window.scrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
};

// --- 6. Menú Móvil ---
const initMobileMenu = () => {
    const mobileMenu = document.getElementById('mobile-menu');
    const openMenuBtn = document.getElementById('open-menu');
    const closeMenuBtn = document.getElementById('close-menu');
    
    if (!mobileMenu || !openMenuBtn || !closeMenuBtn) return;

    const mobileLinks = mobileMenu.querySelectorAll('a');

    openMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        mobileMenu.classList.remove('translate-x-full');
        openMenuBtn.setAttribute('aria-expanded', 'true');
    });

    const closeMenu = () => {
        mobileMenu.classList.add('translate-x-full');
        openMenuBtn.setAttribute('aria-expanded', 'false');
    };

    closeMenuBtn.addEventListener('click', closeMenu);
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
};

// --- 7. Tabs de User Personas (con soporte de Accesibilidad ARIA) ---
const initPersonasTabs = () => {
    const tabs = document.querySelectorAll('.persona-tab');
    const contents = document.querySelectorAll('.persona-content');
    if (tabs.length === 0) return;

    // Asignar el rol tablist al contenedor
    const tabListContainer = tabs[0].parentElement;
    if (tabListContainer) {
        tabListContainer.setAttribute('role', 'tablist');
    }

    tabs.forEach((tab) => {
        const targetId = tab.getAttribute('data-tab');
        const contentPanel = document.getElementById(targetId);

        // Añadir atributos ARIA requeridos
        tab.setAttribute('role', 'tab');
        tab.setAttribute('id', `tab-${targetId}`);
        tab.setAttribute('aria-controls', targetId);
        
        const isActive = tab.classList.contains('active');
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        
        if (contentPanel) {
            contentPanel.setAttribute('role', 'tabpanel');
            contentPanel.setAttribute('aria-labelledby', `tab-${targetId}`);
        }

        tab.addEventListener('click', () => {
            // Actualizar pestañas activas e inactivas
            tabs.forEach(t => {
                t.classList.remove('active', 'border-deep-moss', 'text-deep-moss');
                t.classList.add('border-transparent', 'text-indigo-dye/60');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active', 'border-deep-moss', 'text-deep-moss');
            tab.classList.remove('border-transparent', 'text-indigo-dye/60');
            tab.setAttribute('aria-selected', 'true');

            // Mostrar/Ocultar paneles
            contents.forEach(content => {
                if (content.id === targetId) {
                    content.classList.remove('hidden');
                    content.classList.add('block');
                } else {
                    content.classList.remove('block');
                    content.classList.add('hidden');
                }
            });
            console.log(`Switched to persona tab: ${targetId}`);
        });
    });
};

// --- inicializador General (Auto-Run) ---
const initAll = () => {
    // 1. Reveal Animations (Intersection Observer para todas las páginas)
    const scrollSelector = "section h2, .group, #about-me .flex-1, footer h2, footer > div, #overview .col-span-2, #overview .col-span-1 > div, #overview .col-span-1 > a, #problem .space-y-12 > p, #research .grid > div, #personas .flex, #persona-content-container, #problem-statements > p, #problem-statements .space-y-8 > div, #journey .grid > div, #journey .max-w-2xl, #journey .w-full, #solution .grid, section .grid > div, #sitemap .grid > div, #sitemap .mt-16, #wireframes .grid, #prototype .grid, #visuals > p, #visuals .grid > div, footer > p, footer > a";
    
    try {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("reveal-active");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

        const scrollElements = document.querySelectorAll(scrollSelector);
        scrollElements.forEach((el, index) => {
            el.classList.add("reveal-init");
            if (el.classList.contains('flex-1')) {
                el.style.transitionDelay = `${(index % 2) * 200}ms`;
            } else {
                el.style.transitionDelay = `${(index % 3) * 100}ms`;
            }
            observer.observe(el);
        });
    } catch (e) {
        console.error("Error en animaciones de scroll:", e);
    }

    // 2. Lanzar animaciones del Hero
    try {
        initHeroTitleAnimation();
        initHeroElementsAnimation();
    } catch (e) {
        console.error("Error en animaciones de Hero:", e);
    }

    // 3. Cursor Personalizado
    try {
        initCustomCursor();
    } catch (e) {
        console.error("Error en cursor personalizado:", e);
    }

    // 4. Enlaces Magnéticos
    try {
        initMagneticLinks();
    } catch (e) {
        console.error("Error en enlaces magnéticos:", e);
    }

    // 5. Navbar Inteligente
    try {
        initSmartNavbar('main-nav');
    } catch (e) {
        console.error("Error en navbar inteligente:", e);
    }

    // 6. Menú Móvil
    try {
        initMobileMenu();
    } catch (e) {
        console.error("Error en menú móvil:", e);
    }

    // 7. Tabs de User Personas
    try {
        initPersonasTabs();
    } catch (e) {
        console.error("Error en pestañas de Personas:", e);
    }
};

// Carga segura del script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}
