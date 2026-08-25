const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const textBlock = document.getElementById('text-block'); 

const staticIntro = document.getElementById('static-intro');

const highlightBox = document.getElementById('highlight-box');
const description = document.getElementById('description-text');
const heroTextContainer = document.getElementById('hero-text-container');
const contentSection = document.getElementById('content-section');

// Dynamic text based on screen size
const isMobile = window.innerWidth <= 640;
const REVEAL_PHRASES = isMobile ? ["Hi,", "I'm", "Sohaila"] : ["Hi,", "I'm Sohaila"];

// Dynamic content data
const professions = [
    { 
        title: "Researcher", 
        text: "I'm a Global PhD Fellow in Computer Science at NYU, completing my degree across NYU's Graduate School of Arts and Science and NYU Abu Dhabi. I work on AI for software engineering at the SANAD Lab, with a focus on improving LLMs and agents for code generation. My other research interests include reinforcement learning and natural language processing. I've also ventured outside CS through interdisciplinary coursework in political science."
    },
    { 
        title: "Designer", 
        text: "When I'm building something technical like a website or a game, I end up spending just as much time on how it looks. My attention to design and visuals is what's gotten me into multiple social media marketing and graphic design roles as well."
    }
];
let currentProfessionIndex = 0;

// Configuration
const DOT_ANIMATION_DURATION_MS = 2500;
const REVEAL_ANIMATION_DURATION_MS = 1200; 

// Parallax configuration
let ANIMATION_SCROLL_HEIGHT = window.innerHeight;
const MAX_TRANSLATION_Y = 300; 
const SCROLL_THRESHOLD = 0.7; 

// Fade configuration
const FADE_OUT_START_PERCENT = 0.85; 

let allChars = []; // For Hero Text
let totalChars = 0;

/**
 * Wraps text content of an element in spans for Anime.js.
 * Wraps words first, then characters within words to prevent word breaking.
 * @param {HTMLElement} element 
 */
function wrapTextInSpans(element) {
    const text = element.textContent.trim();
    const words = text.split(' ');
    
    element.innerHTML = words.map(word => {
        // Wrap each character in the word
        const wrappedChars = word.split('').map(char => 
            `<span class='letter'>${char}</span>`
        ).join('');
        // Wrap the entire word in a container span
        return `<span class="word-container">${wrappedChars}</span>`;
    }).join(' '); // Join words with spaces
}

/**
 * 1. Splits the phrases into individual characters wrapped in spans (Hero Text).
 */
function setupTextReveal() {
    let characterIndex = 0;
    allChars = [];

    REVEAL_PHRASES.forEach(phrase => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'single-line-text';

        const characters = phrase.split('');
        const lineFragment = document.createDocumentFragment();

        characters.forEach((char) => {
            // Use a non-breaking space for actual spaces to maintain layout
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char; 
            span.className = 'char-span'; 
            
            lineFragment.appendChild(span);
            allChars.push(span); 
            characterIndex++; 
        });

        lineDiv.appendChild(lineFragment);
        textBlock.appendChild(lineDiv); 
    });
    
    totalChars = allChars.length;

    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    textBlock.appendChild(indicator); 
}

/**
 * Orchestrates the Anime.js fade in/out transition when the profession is clicked.
 * Fade out is fast and non-staggered. Fade in has fast left-to-right for title, slower stagger for text.
 */
function updateContent(index) {
    const data = professions[index];
    const newTitle = data.title;
    
    // Elements to target for the transition (excluding staticIntro)
    const targetElements = document.querySelectorAll('#highlight-box .letter, #description-text .letter');
    
    // 1. Anime.js Fade Out (NON-STAGGERED)
    anime.timeline({})
        .add({
            targets: targetElements,
            opacity: 0,
            easing: "linear", 
            duration: 250, 
            delay: 0, // Quick, non-staggered fade out
            complete: () => {
                // 2. Change Text Content & Re-wrap when invisible
                highlightBox.textContent = newTitle;
                description.textContent = data.text; 

                wrapTextInSpans(highlightBox);
                wrapTextInSpans(description);
                
                // Collect new letter spans
                const newTitleLetters = document.querySelectorAll('#highlight-box .letter');
                const newTextLetters = document.querySelectorAll('#description-text .letter');

                // 3. Anime.js Fade In - Fast left-to-right for title
                anime.timeline({})
                    .add({
                        targets: newTitleLetters,
                        translateX: [-50, 0],
                        opacity: [0, 1],
                        easing: "easeOutQuad",
                        duration: 600,
                        delay: (el, i) => 15 * i
                    });
                
                // 4. Anime.js Fade In - Slower stagger for paragraph (runs simultaneously)
                anime.timeline({})
                    .add({
                        targets: newTextLetters,
                        opacity: [0, 1],
                        easing: "easeInOutQuad",
                        duration: 2250,
                        delay: (el, i) => 25 * (i + 1)
                    });
            }
        });

    currentProfessionIndex = index;
}

/**
 * Handles the click event on the highlighted box.
 */
function handleBoxClick() {
    const nextIndex = (currentProfessionIndex + 1) % professions.length;
    updateContent(nextIndex);
}

/**
 * Animates skill category banners sliding in from left to right
 */
function setupSkillsAnimation() {
    const skillCategories = document.querySelectorAll('.skills-category');
    const isMobileDevice = window.innerWidth <= 640;
    let hasAnimated = false;
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                if (isMobileDevice) {
                    // Mobile: Slide banners in, fade text in separately
                    const marquees = document.querySelectorAll('.skills-marquee');
                    
                    // Hide marquees initially for fade-in effect
                    marquees.forEach(marquee => {
                        marquee.style.opacity = '0';
                    });
                    
                    // Animate banners sliding in
                    anime.timeline({})
                        .add({
                            targets: skillCategories,
                            translateX: ['-100%', 0],
                            easing: "easeOutCubic",
                            duration: 800,
                            delay: (el, i) => 150 * i
                        });
                    
                    // Fade in text in parallel (starts shortly after banners begin)
                    anime.timeline({})
                        .add({
                            targets: marquees,
                            opacity: [0, 1],
                            easing: "easeInOutQuad",
                            duration: 400,
                            delay: (el, i) => 300 + (80 * i) // Start at 300ms, stagger by 80ms
                        });
                } else {
                    // Desktop: Slide everything in together
                    anime.timeline({})
                        .add({
                            targets: skillCategories,
                            translateX: ['-100%', 0],
                            easing: "easeOutCubic",
                            duration: 800,
                            delay: (el, i) => 150 * i,
                            complete: () => {
                                // Enable hover effects after animation completes
                                skillCategories.forEach(category => {
                                    category.style.pointerEvents = 'auto';
                                });
                            }
                        });
                }
                
                hasAnimated = true;
                obs.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.2
    });
    
    const skillsSection = document.querySelector('.skills-section');
    if (skillsSection) {
        observer.observe(skillsSection);
    }
}

/**
 * Animates project panels sliding in from top to bottom
 */
function setupProjectsAnimation() {
    const projectPanels = document.querySelectorAll('.panel-wide');
    let hasAnimated = false;
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                // Animate each panel sliding down from top to bottom
                anime.timeline({})
                    .add({
                        targets: projectPanels,
                        translateY: ['-100%', 0],
                        opacity: [0, 1],
                        easing: "easeOutCubic",
                        duration: 900,
                        delay: (el, i) => 120 * i // Stagger each panel
                    });
                
                hasAnimated = true;
                obs.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });
    
    const projectsSection = document.querySelector('.projects-section');
    if (projectsSection) {
        observer.observe(projectsSection);
    }
}

/**
 * Wraps title text in character spans for animation
 * Wraps words first to prevent breaking
 */
function wrapTitleInSpans(element) {
    const text = element.textContent.trim();
    const words = text.split(' ');
    element.innerHTML = '';
    
    words.forEach((word, wordIndex) => {
        // Create a word container
        const wordContainer = document.createElement('span');
        wordContainer.className = 'word-container';
        
        // Add character spans within the word
        word.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'char-span';
            span.style.opacity = '0';
            wordContainer.appendChild(span);
        });
        
        element.appendChild(wordContainer);
        
        // Add space between words (except after last word)
        if (wordIndex < words.length - 1) {
            const space = document.createTextNode(' ');
            element.appendChild(space);
        }
    });
}

/**
 * Sets up fast left-to-right animations for section titles
 */
function setupTitleAnimations() {
    const skillsTitle = document.querySelector('.skills-title');
    const projectsTitle = document.querySelector('.page-title');
    
    // Wrap titles in character spans
    wrapTitleInSpans(skillsTitle);
    wrapTitleInSpans(projectsTitle);
    
    // Create observers for each title
    [skillsTitle, projectsTitle].forEach(title => {
        let hasAnimated = false;
        
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    const chars = title.querySelectorAll('.char-span');
                    
                    anime.timeline({})
                        .add({
                            targets: chars,
                            translateX: [-50, 0],
                            opacity: [0, 1],
                            easing: "easeOutQuad",
                            duration: 600,
                            delay: (el, i) => 15 * i
                        });
                    
                    hasAnimated = true;
                    obs.unobserve(title);
                }
            });
        }, {
            rootMargin: '0px',
            threshold: 0.1
        });
        
        observer.observe(title);
    });
}

/**
 * Wraps contact title in character spans for animation
 * Wraps words first to prevent breaking
 */
function wrapContactTitleInSpans(element) {
    const text = element.textContent.trim();
    const words = text.split(' ');
    element.innerHTML = '';
    
    words.forEach((word, wordIndex) => {
        // Create a word container
        const wordContainer = document.createElement('span');
        wordContainer.className = 'word-container';
        
        // Add character spans within the word
        word.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'contact-char';
            wordContainer.appendChild(span);
        });
        
        element.appendChild(wordContainer);
        
        // Add space between words (except after last word)
        if (wordIndex < words.length - 1) {
            const space = document.createTextNode(' ');
            element.appendChild(space);
        }
    });
}

/**
 * Sets up the contact section animation
 */
function setupContactAnimation() {
    const contactTitle = document.querySelector('.contact-title');
    const contactLinks = document.querySelectorAll('.contact-link');
    
    // Wrap title in character spans
    wrapContactTitleInSpans(contactTitle);
    
    let hasAnimated = false;
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                const chars = contactTitle.querySelectorAll('.contact-char');
                
                // Animate title characters from top to bottom (like hero)
                anime.timeline({})
                    .add({
                        targets: chars,
                        translateY: [-100, 0],
                        opacity: [0, 1],
                        easing: "easeOutExpo",
                        duration: 1400,
                        delay: (el, i) => 30 * i
                    });
                
                // Animate contact links with stagger
                anime.timeline({})
                    .add({
                        targets: contactLinks,
                        translateY: [50, 0],
                        opacity: [0, 1],
                        easing: "easeOutExpo",
                        duration: 1200,
                        delay: (el, i) => 200 * (i + 1) + 800 // Start after title animation begins
                    });
                
                hasAnimated = true;
                obs.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.3
    });
    
    const contactSection = document.querySelector('.contact-section');
    if (contactSection) {
        observer.observe(contactSection);
    }
}

/**
 * Initializes the content text wrapping and sets up the IntersectionObserver
 * to trigger the Anime.js entrance animation only once on scroll.
 */
function setupContentEntrance() {
    // 1. Wrap initial text content immediately.
    // All three elements need to be wrapped so they can be targeted by the entrance animation.
    wrapTextInSpans(staticIntro); 
    wrapTextInSpans(highlightBox);
    wrapTextInSpans(description);

    let hasAnimated = false;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            // Check if the content section is intersecting and the animation hasn't run yet
            if (entry.isIntersecting && !hasAnimated) {
                
                // Attach the click handler for the dynamic box
                highlightBox.addEventListener('click', handleBoxClick);
                
                // Fast left-to-right animation for the title
                anime.timeline({})
                    .add({
                        targets: '#static-intro .letter, #highlight-box .letter',
                        translateX: [-50, 0],
                        opacity: [0, 1],
                        easing: "easeOutQuad",
                        duration: 600,
                        delay: (el, i) => 15 * i
                    });
                
                // Slower staggered reveal for paragraph (runs simultaneously)
                anime.timeline({})
                    .add({
                        targets: '#description-text .letter',
                        opacity: [0, 1],
                        easing: "easeInOutQuad",
                        duration: 2250,
                        delay: (el, i) => 25 * (i + 1),
                        complete: () => {
                            // Ensure opacity is permanently set to 1 after animation
                            document.querySelectorAll('#content-section .letter').forEach(el => el.style.opacity = '1');
                        }
                    });

                hasAnimated = true;
                obs.unobserve(contentSection); // Stop observing after animation runs
            }
        });
    }, {
        rootMargin: '0px',
        // Trigger the animation as soon as the section starts entering the viewport
        threshold: 0.05 
    });

    observer.observe(contentSection);
}


/**
 * Orchestrates the reveal and starts the scroll listener.
 */
function hideLoadingScreen() {
    setupTextReveal();
    
    setTimeout(() => {
        // START SIMULTANEOUS TRANSITIONS
        loadingScreen.classList.add('slide-down-exit');
        mainContent.classList.add('content-visible');

        // Set height to viewport height (hero is 100vh)
        ANIMATION_SCROLL_HEIGHT = window.innerHeight;

        // Make container visible
        heroTextContainer.style.opacity = 1;

        // Use anime.js for the initial reveal animation (translating from up to down)
        anime.timeline({loop: false})
            .add({
                targets: '.char-span',
                translateY: [-100, 0],
                translateZ: 0,
                opacity: [0, 1],
                easing: "easeOutExpo",
                duration: 1400,
                delay: (el, i) => 30 * i
            });

        // Remove the loading screen and enable scrolling after it slides away
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            // Enable scrolling after loading screen exits
            document.body.classList.add('scroll-enabled');
        }, REVEAL_ANIMATION_DURATION_MS);

    }, DOT_ANIMATION_DURATION_MS);
}

/**
 * Handles the scroll event to apply the staggered parallax effect (Hero Text ONLY).
 */
function handleScroll() {
    const scrollY = window.scrollY;
    
    // Limit scroll ratio to 1 based on the main content height
    const scrollRatio = Math.min(1, scrollY / ANIMATION_SCROLL_HEIGHT);
    
    if (ANIMATION_SCROLL_HEIGHT > 0) {
        
        // --- A. Parallax (Vertical Movement of Hero Text) ---
        // Using direct DOM for performance on continuous scroll updates
        allChars.forEach((span, index) => {
            const delayFactor = index / totalChars; 
            // Calculate effective progress for a smooth, staggered lift-off
            const effectiveProgress = Math.min(1, Math.max(0, (scrollRatio - (delayFactor * SCROLL_THRESHOLD)) / (1 - (delayFactor * SCROLL_THRESHOLD))));
            const translateY = effectiveProgress * MAX_TRANSLATION_Y;
            
            // Direct DOM manipulation for smooth real-time scroll updates
            span.style.transform = `translateY(-${translateY}px) translateZ(0)`;
        });

        // --- B. Fade Out Opacity on the Sticky Hero Container ---
        let opacity = 1;

        if (scrollRatio > FADE_OUT_START_PERCENT) {
            const fadeOutProgress = (scrollRatio - FADE_OUT_START_PERCENT) / (1 - FADE_OUT_START_PERCENT);
            opacity = 1 - fadeOutProgress; 
        } else {
            opacity = 1;
        }
        
        heroTextContainer.style.opacity = Math.max(0, Math.min(1, opacity));


        // --- C. Scroll Indicator Fade ---
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            const indicatorOpacity = Math.max(0, 1 - scrollY / 100); 
            scrollIndicator.style.opacity = indicatorOpacity;
        }
    }
}

/**
 * Waits for all assets to load before initializing the app
 */
async function initializeApp() {
    // 0. Always start at the top of the page
    window.scrollTo(0, 0);
    
    try {
        // Wait for all images to load
        const images = document.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            if (img.complete) {
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                img.addEventListener('load', resolve);
                img.addEventListener('error', resolve); // Resolve even on error to not block loading
            });
        });
        
        // Wait for fonts to load
        const fontPromise = document.fonts.ready;
        
        // Wait for all assets
        await Promise.all([...imagePromises, fontPromise]);
        
        // Add a small delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 300));
        
    } catch (error) {
        console.error('Error loading assets:', error);
    }
    
    // 1. Set up the hero text and hide the loading screen
    hideLoadingScreen();
    
    // 2. Setup the scroll-triggered animation for the Content Section
    setupContentEntrance();
    
    // 3. Setup title animations for section headers
    setupTitleAnimations();
    
    // 4. Setup skills banners slide-in animation
    setupSkillsAnimation();
    
    // 5. Setup projects panels slide-in animation
    setupProjectsAnimation();
    
    // 6. Setup contact section animation
    setupContactAnimation();
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Attach the scroll listener 
window.addEventListener('scroll', handleScroll);

// Listen for resize to recalculate the animation height
window.addEventListener('resize', () => {
    ANIMATION_SCROLL_HEIGHT = window.innerHeight;
    
    // Reload page if switching between mobile and desktop layout
    const nowMobile = window.innerWidth <= 640;
    if (nowMobile !== isMobile && window.scrollY === 0) {
        location.reload();
    }
    
    // Note: Each carousel handles its own resize events internally
});

// ---------------------------------- 
// Parallax Carousel JavaScript
// ---------------------------------- 
const DRAG_THRESHOLD = 5; // pixels - movement less than this is considered a click
const DEFAULT_SCROLL_SPEED = -0.8;
const panelWidth = 376; // 360px width + 16px gap

/**
 * Initializes a carousel with all its functionality
 * @param {HTMLElement} carouselContainer - The carousel container element
 * @param {number} index - The index of the carousel (0-based) to determine scroll direction
 */
function initializeCarousel(carouselContainer, index) {
    const trackFlex = carouselContainer.querySelector('.track-flex');
    const panels = Array.from(carouselContainer.querySelectorAll('.panel-wide'));

    // --- 1. Clone panels for infinite loop ---
    const clonePanels = () => {
        // Append clones at the end (Set 3)
        panels.forEach(panel => {
            const clone = panel.cloneNode(true);
            trackFlex.appendChild(clone);
        });
        // Prepend clones at the start (Set 1), reversed so order stays correct
        panels.slice().reverse().forEach(panel => {
            const clone = panel.cloneNode(true);
            trackFlex.insertBefore(clone, trackFlex.firstChild);
        });
    };
    
    clonePanels();
    
    const allPanels = Array.from(carouselContainer.querySelectorAll('.panel-wide'));
    const allImgs = carouselContainer.querySelectorAll('.image');
    
    // base centering: equivalent to translateX(-50%)
    gsap.set(allImgs, { xPercent: -50 });
    
    const totalPanels = panels.length; // Number of ORIGINAL panels
    
    // --- 2. Initial position: center on ORIGINAL set (Set 2) ---
    const singleSetWidth = totalPanels * panelWidth;
    const middleSetStart = -singleSetWidth;   // start of original set
    let currentX = middleSetStart - 300;      // slight offset like your original logic
    
    let isDragging = false;
    let startX = 0;
    let velocity = 0;
    let animationId = null;
    
    // Click detection variables
    let dragStartX = 0;
    let dragStartY = 0;
    let hasMoved = false;
    let clickedPanel = null;
    
    gsap.set(trackFlex, { x: currentX });

    // --- Infinite loop correction: keep x between [-2W, 0] ---
    function checkLoop() {
        const minX = -2 * singleSetWidth; // start of Set 3
        const maxX = 0;                   // start of Set 1
    
        if (currentX < minX) {
            // too far left → jump right by one set
            currentX += singleSetWidth;
            // Adjust startX during drag to prevent wild spinning bug
            if (isDragging) startX -= singleSetWidth;
        } else if (currentX > maxX) {
            // too far right → jump left by one set
            currentX -= singleSetWidth;
            // Adjust startX during drag to prevent wild spinning bug
            if (isDragging) startX += singleSetWidth;
        }
    }
    
    // --- Parallax ---
    function updateParallax() {
        const maxParallax = 25; // tweak strength
    
        allImgs.forEach((img) => {
            const panel = img.closest('.panel-wide');
            const panelRect = panel.getBoundingClientRect();
            const panelCenter = panelRect.left + panelRect.width / 2;
            const viewportCenter = window.innerWidth / 2;
            const distance = panelCenter - viewportCenter;
    
            // normalized distance [-1, 1]
            const t = distance / viewportCenter;
    
            // 👇 flip the sign: panel left (-t) => positive offset => image moves right, exposing left side
            const shift = -50 - t * maxParallax;
    
            gsap.set(img, { xPercent: shift, ease: "power1.out" });
        });
    }



    // --- Drag handlers ---
    const startDrag = (pageX, pageY, target) => {
        isDragging = true;
        startX = pageX - currentX;
        velocity = 0;
        
        // Track starting position for click detection
        dragStartX = pageX;
        dragStartY = pageY;
        hasMoved = false;
        clickedPanel = target.closest('.panel-wide');
        
        if (animationId) cancelAnimationFrame(animationId);
        // Stop auto-scroll when dragging starts on mobile
        if (autoScrollAnimation) {
            cancelAnimationFrame(autoScrollAnimation);
            autoScrollAnimation = null;
        }
        carouselContainer.style.cursor = 'grabbing';
    };
    
    const onDrag = (pageX, pageY) => {
        if (!isDragging) return;
        
        // Check if movement exceeds threshold
        const distanceX = Math.abs(pageX - dragStartX);
        const distanceY = Math.abs(pageY - dragStartY);
        if (distanceX > DRAG_THRESHOLD || distanceY > DRAG_THRESHOLD) {
            hasMoved = true;
        }
        
        const x = pageX - startX;
        const delta = x - currentX;
        velocity = delta;
        currentX = x;
    
        // ✅ FIX: correct the loop BEFORE we render the new x
        checkLoop();
        gsap.set(trackFlex, { x: currentX });
        updateParallax();
    };
    
    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        carouselContainer.style.cursor = 'grab';
        
        // Check if this was a click (no significant movement)
        if (!hasMoved && clickedPanel) {
            const url = clickedPanel.getAttribute('data-url');
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        }
        
        const isMobileDevice = window.innerWidth <= 640;
        
        if (isMobileDevice) {
            // On mobile: continue scrolling in the direction of the last drag
            // Normalize the velocity to a consistent speed
            if (Math.abs(velocity) > 0.1) {
                // Continue in the same direction as the drag
                autoScrollVelocity = velocity > 0 ? Math.abs(DEFAULT_SCROLL_SPEED) : -Math.abs(DEFAULT_SCROLL_SPEED);
            } else {
                // If barely moving, use default direction based on carousel index
                autoScrollVelocity = (index % 2 === 0) ? DEFAULT_SCROLL_SPEED : -DEFAULT_SCROLL_SPEED;
            }
            // Restart continuous auto-scroll
            continuousAutoScroll();
        } else {
            // On desktop: apply decay momentum as before
            applyMomentum();
        }
    };

    // --- Momentum ---
    function applyMomentum() {
        if (Math.abs(velocity) <= 0.1) {
            if (animationId) cancelAnimationFrame(animationId);
            return;
        }
    
        velocity *= 0.95;
        currentX += velocity;
    
        // ✅ FIX: correct before render
        checkLoop();
        gsap.set(trackFlex, { x: currentX });
        updateParallax();
    
        animationId = requestAnimationFrame(applyMomentum);
    }
    
    // --- Continuous auto-scroll for mobile ---
    let autoScrollAnimation = null;
    // Alternate direction: even indices (0, 2, 4...) scroll left (negative), odd indices (1, 3, 5...) scroll right (positive)
    let autoScrollVelocity = (index % 2 === 0) ? DEFAULT_SCROLL_SPEED : -DEFAULT_SCROLL_SPEED;
    
    function continuousAutoScroll() {
        const isMobileDevice = window.innerWidth <= 640;
        
        if (isMobileDevice && !isDragging) {
            currentX += autoScrollVelocity;
            
            checkLoop(); // Handle infinite loop wrapping
            gsap.set(trackFlex, { x: currentX });
            updateParallax();
            
            autoScrollAnimation = requestAnimationFrame(continuousAutoScroll);
        } else if (!isMobileDevice) {
            // Stop auto-scroll on desktop
            if (autoScrollAnimation) {
                cancelAnimationFrame(autoScrollAnimation);
                autoScrollAnimation = null;
            }
        }
    }
    
    // Mouse events
    carouselContainer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startDrag(e.pageX, e.pageY, e.target);
    });
    
    // Touch events
    carouselContainer.addEventListener('touchstart', (e) => {
        startDrag(e.touches[0].pageX, e.touches[0].pageY, e.target);
    });
    
    // Global mouse/touch handlers for this carousel
    const handleMouseMove = (e) => {
        if (isDragging && carouselContainer.style.cursor === 'grabbing') {
            e.preventDefault();
            onDrag(e.pageX, e.pageY);
        }
    };
    
    const handleMouseUp = () => {
        if (isDragging && carouselContainer.style.cursor === 'grabbing') {
            endDrag();
        }
    };
    
    const handleTouchMove = (e) => {
        if (isDragging) {
            onDrag(e.touches[0].pageX, e.touches[0].pageY);
        }
    };
    
    const handleTouchEnd = () => {
        if (isDragging) {
            endDrag();
        }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    // Set initial styles
    carouselContainer.style.cursor = 'grab';
    carouselContainer.style.userSelect = 'none';
    
    // Prevent image dragging
    allImgs.forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });
    
    // Initial parallax
    updateParallax();
    
    // Start auto-scroll on mobile
    if (window.innerWidth <= 640) {
        continuousAutoScroll();
    }
    
    // Handle resize for this carousel
    const handleResize = () => {
        const isNowMobile = window.innerWidth <= 640;
        if (isNowMobile && !isDragging && !autoScrollAnimation) {
            // Restore default direction based on carousel index
            autoScrollVelocity = (index % 2 === 0) ? DEFAULT_SCROLL_SPEED : -DEFAULT_SCROLL_SPEED;
            continuousAutoScroll();
        } else if (!isNowMobile && autoScrollAnimation) {
            cancelAnimationFrame(autoScrollAnimation);
            autoScrollAnimation = null;
        }
    };
    
    // Store resize handler for cleanup if needed
    window.addEventListener('resize', handleResize);
}

// Initialize all carousels
const carouselContainers = document.querySelectorAll('.carousel-container');
carouselContainers.forEach((container, index) => {
    initializeCarousel(container, index);
});

// ---------------------------------- 
// Skills Section Marquee JavaScript
// ---------------------------------- 
const skillsCategories = document.querySelectorAll('.skills-category');
const isMobileDevice = window.innerWidth <= 640;

skillsCategories.forEach((category, index) => {
    const skills = category.dataset.skills.split(',').map(s => s.trim());
    
    // Create marquee container
    const marquee = document.createElement('div');
    marquee.className = 'skills-marquee';
    
    // Create multiple sets of skills for seamless infinite loop
    const skillsSet = skills.map(skill => `<span class="skill-item">${skill}</span>`).join('');
    // Use 4 sets for extra smooth looping
    marquee.innerHTML = skillsSet + skillsSet + skillsSet + skillsSet;
    category.appendChild(marquee);
    
    let marqueeAnimation = null;
    
    if (isMobileDevice) {
        // Mobile: Auto-scroll with alternating directions
        // Calculate the width of a single set
        const singleSetWidth = marquee.scrollWidth / 4;
        const isEven = index % 2 === 0;
        
        if (isEven) {
            // Even rows: scroll left to right (positive direction)
            // Start at -2 sets and animate to -1 set for seamless loop
            gsap.set(marquee, { x: -singleSetWidth * 2 });
            marqueeAnimation = gsap.to(marquee, {
                x: -singleSetWidth,
                duration: 30,
                ease: 'none',
                repeat: -1,
                modifiers: {
                    x: function(x) {
                        // Seamless infinite loop
                        return gsap.utils.wrap(-singleSetWidth * 2, -singleSetWidth, parseFloat(x)) + 'px';
                    }
                }
            });
        } else {
            // Odd rows: scroll right to left (negative direction)
            // Start at -1 set and animate to -2 sets for seamless loop
            gsap.set(marquee, { x: -singleSetWidth });
            marqueeAnimation = gsap.to(marquee, {
                x: -singleSetWidth * 2,
                duration: 30,
                ease: 'none',
                repeat: -1,
                modifiers: {
                    x: function(x) {
                        // Seamless infinite loop
                        return gsap.utils.wrap(-singleSetWidth * 2, -singleSetWidth, parseFloat(x)) + 'px';
                    }
                }
            });
        }
    } else {
        // Desktop: Animate marquee on hover (original behavior)
        category.addEventListener('mouseenter', () => {
            const singleSetWidth = marquee.scrollWidth / 4;
            
            // Start from the left (negative) and animate to the right (positive)
            gsap.set(marquee, { x: -singleSetWidth * 2 });
            
            marqueeAnimation = gsap.to(marquee, {
                x: -singleSetWidth,
                duration: 25,
                ease: 'none',
                repeat: -1,
                modifiers: {
                    x: function(x) {
                        return gsap.utils.wrap(-singleSetWidth * 2, -singleSetWidth, parseFloat(x)) + 'px';
                    }
                }
            });
        });
        
        category.addEventListener('mouseleave', () => {
            if (marqueeAnimation) {
                marqueeAnimation.kill();
                gsap.set(marquee, { x: 0 });
            }
        });
    }
});

