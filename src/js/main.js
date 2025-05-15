// Script mejorado para el funcionamiento correcto
document.addEventListener('DOMContentLoaded', async function() {
    // Variables para traducciones
    let translations = {};
    let currentLanguage = 'en';
    
    // Cargar traducciones
    try {
        // Intentar cargar desde archivos externos
        await loadTranslations();
    } catch (error) {
        console.warn('Error cargando traducciones desde archivos:', error);
        // Fallback a objetos básicos si algo falla
        setupFallbackTranslations();
    }
    
    // Inicializar funcionalidades
    setupLanguageSwitcher();
    setupPricingToggle();
    setupMobileMenu();
    
    // Función para cargar traducciones desde archivos
    async function loadTranslations() {
        try {
            // Cargar el idioma inglés
            const enResponse = await fetch('src/js/translations/en.js');
            if (!enResponse.ok) throw new Error('Error cargando traducciones en inglés');
            const enText = await enResponse.text();
            
            // Extraer objeto de traducción
            const enMatch = enText.match(/const\s+translationsEN\s*=\s*(\{[\s\S]*\});/);
            if (enMatch && enMatch[1]) {
                translations.en = JSON.parse(enMatch[1].replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'));
            } else {
                throw new Error('Formato incorrecto en traducciones inglesas');
            }
            
            // Cargar el idioma español
            const esResponse = await fetch('src/js/translations/es.js');
            if (!esResponse.ok) throw new Error('Error cargando traducciones en español');
            const esText = await esResponse.text();
            
            // Extraer objeto de traducción
            const esMatch = esText.match(/const\s+translationsES\s*=\s*(\{[\s\S]*\});/);
            if (esMatch && esMatch[1]) {
                translations.es = JSON.parse(esMatch[1].replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'));
            } else {
                throw new Error('Formato incorrecto en traducciones españolas');
            }
            
            console.log('Traducciones cargadas correctamente');
        } catch (error) {
            console.error('Error al cargar traducciones:', error);
            setupFallbackTranslations();
        }
    }
    
    // Configurar traducciones de respaldo
    function setupFallbackTranslations() {
        console.log('Usando traducciones de respaldo');
        
        // Traducciones inglesas básicas
        translations.en = {
            nav: { home: "Home", about: "About", pricing: "Pricing", features: "Features", contact: "Contact" },
            auth: { login: "Log In", signup: "Sign Up" },
            hero: { 
                title: "Comprehensive Fleet Management Solution",
                subtitle: "Streamline your operations and reduce costs with our powerful fleet management system",
                cta: "START YOUR FREE TRIAL"
            },
            team: { title: "Our Development Team", role: "Developer" },
            // Agregar otras secciones básicas aquí
        };
        
        // Traducciones españolas básicas
        translations.es = {
            nav: { home: "Inicio", about: "Acerca de", pricing: "Precios", features: "Características", contact: "Contacto" },
            auth: { login: "Iniciar Sesión", signup: "Registrarse" },
            hero: { 
                title: "Solución Integral de Gestión de Flotas",
                subtitle: "Optimice sus operaciones y reduzca costos con nuestro potente sistema de gestión de flotas",
                cta: "COMIENCE SU PRUEBA GRATUITA"
            },
            team: { title: "Nuestro Equipo de Desarrollo", role: "Desarrollador" },
            // Agregar otras secciones básicas aquí
        };
    }
    
    // Configurar cambio de idioma
    function setupLanguageSwitcher() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(button => {
            button.addEventListener('click', function() {
                const language = this.getAttribute('data-lang');
                changeLanguage(language);
            });
        });
        
        // Restaurar idioma preferido
        const storedLanguage = localStorage.getItem('preferred-language');
        if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'es')) {
            changeLanguage(storedLanguage);
        } else {
            // Usar el idioma por defecto
            changeLanguage('en');
        }
    }
    
    // Cambiar el idioma
    function changeLanguage(lang) {
        if (translations[lang]) {
            currentLanguage = lang;
            updatePageLanguage();
            
            // Actualizar clases activas en botones
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            });
            
            // Guardar preferencia
            localStorage.setItem('preferred-language', lang);
        } else {
            console.error(`Idioma no disponible: ${lang}`);
        }
    }
    
    // Actualizar idioma en la página
    function updatePageLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translatedText = getTranslation(key);
            
            if (translatedText) {
                // Aplicar la traducción según el tipo de elemento
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.getAttribute('placeholder')) {
                        element.setAttribute('placeholder', translatedText);
                    } else {
                        element.value = translatedText;
                    }
                } else {
                    element.textContent = translatedText;
                }
            }
        });
    }
    
    // Obtener traducción de una clave
    function getTranslation(key) {
        const path = key.split('.');
        let value = translations[currentLanguage];
        
        for (const segment of path) {
            if (value && value[segment] !== undefined) {
                value = value[segment];
            } else {
                console.warn(`Clave de traducción no encontrada: ${key} en idioma ${currentLanguage}`);
                return key; // Usar la clave como respaldo
            }
        }
        
        return value;
    }
    
    // Configurar toggle de precios
    function setupPricingToggle() {
        const pricingToggleBtns = document.querySelectorAll('.pricing .toggle-btn');
        
        if (pricingToggleBtns.length) {
            pricingToggleBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Solo alternar botones del mismo tipo
                    const isPlanTypeBtn = this.classList.contains('plan-type');
                    const buttons = document.querySelectorAll(
                        `.pricing .toggle-btn${isPlanTypeBtn ? '.plan-type' : ''}`
                    );
                    
                    buttons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        }
    }
    
    // Configurar menú móvil
    function setupMobileMenu() {
        // Añadir botón de hamburguesa para móviles si no existe
        const nav = document.querySelector('nav');
        const menu = document.querySelector('.menu');
        
        if (nav && menu && !document.querySelector('.mobile-menu-toggle')) {
            // Crear botón hamburguesa
            const mobileMenuToggle = document.createElement('button');
            mobileMenuToggle.className = 'mobile-menu-toggle';
            mobileMenuToggle.setAttribute('aria-label', 'Toggle menu');
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            
            // Insertar antes del menú
            menu.parentNode.insertBefore(mobileMenuToggle, menu);
            
            // Añadir clase para ocultar menú en móvil
            menu.classList.add('menu-mobile');
            
            // Añadir función de toggle
            mobileMenuToggle.addEventListener('click', function() {
                menu.classList.toggle('menu-open');
                this.innerHTML = menu.classList.contains('menu-open') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
            
            // Cerrar menú al hacer clic en un enlace
            menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', function() {
                    menu.classList.remove('menu-open');
                    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });
        }
    }
});