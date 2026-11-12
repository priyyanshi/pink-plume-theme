class PageTransitionHandler {
  constructor() {
    this.currentPage = this.detectCurrentPage();
    this.transitionConfig = new Map();
    this.isTransitioning = false;
    this.preloadedMedia = new Map();
    this.destinationPageCache = null;
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.init();
  }

  detectCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('/products/')) return 'product';
    if (path === '/' || path === '') return 'homepage';
    if (path === '/collections' || path === '/collections/') return 'collections';
    if (path.includes('/collections/')) return 'catalogue';
    if (path.includes('/pages/contact')) return 'contact';
    if (path.includes('/pages/about')) return 'about';
    if (path.includes('/pages/faq')) return 'faq';
    return 'other';
  }

  async fetchTransitionConfig() {
    try {
      const configScript = document.getElementById('page-transitions-config');
      if (!configScript) return;

      const config = JSON.parse(configScript.textContent);
      if (config.transitions) {
        config.transitions.forEach(transition => {
          if (transition.from && transition.to && transition.video) {
            const key = `${transition.from}-${transition.to}`;
            this.transitionConfig.set(key, {
              video: transition.video,
              speed: transition.speed || 1.0
            });
          }
        });
      }
    } catch (error) {}
  }

  getDestinationPage(url) {
    const path = new URL(url, window.location.origin).pathname;
    if (path.includes('/products/')) return 'product';
    if (path === '/' || path === '') return 'homepage';
    if (path === '/collections' || path === '/collections/') return 'collections';
    if (path.includes('/collections/')) return 'catalogue';
    if (path.includes('/pages/contact')) return 'contact';
    if (path.includes('/pages/about')) return 'about';
    if (path.includes('/pages/faq')) return 'faq';
    return 'other';
  }

  async preloadMedia() {
    if (this.isMobile) return;

    const possibleTransitions = Array.from(this.transitionConfig.keys())
      .filter(key => key.startsWith(this.currentPage + '-'));

    for (const transitionKey of possibleTransitions) {
      const config = this.transitionConfig.get(transitionKey);
      if (!config || !config.video) continue;

      try {
        const video = document.createElement('video');
        video.src = config.video;
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('x5-playsinline', 'true');

        await new Promise((resolve, reject) => {
          video.onloadeddata = resolve;
          video.onerror = reject;
          setTimeout(reject, 5000);
        });

        this.preloadedMedia.set(transitionKey, video);
      } catch (error) {}
    }
  }

  async preloadDestinationPage(destinationUrl) {
    try {
      const response = await fetch(destinationUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (response.ok) {
        this.destinationPageCache = {
          url: destinationUrl,
          html: await response.text()
        };
      }
    } catch (error) {}
  }

  createMediaOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100dvh;
      z-index: 500;
      background: #000;
      display: none;
      pointer-events: none;
      opacity: 0;
    `;

    const mediaContainer = document.createElement('div');
    mediaContainer.id = 'transition-media-container';
    mediaContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    `;

    overlay.appendChild(mediaContainer);
    document.body.appendChild(overlay);

    return { overlay, mediaContainer };
  }

  updateOverlayDimensions() {
    if (this.elements.overlay) {
      this.elements.overlay.style.top = '0';
      this.elements.overlay.style.height = '100dvh';
    }
  }

  shouldInterceptLink(href, element) {
    if (!href) return false;
    if (href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('sms:')) return false;
    if (element.hasAttribute('download')) return false;
    if (element.getAttribute('target') === '_blank') return false;

    try {
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return false;
    } catch {
      return false;
    }

    if (href.includes('/cart') ||
        href.includes('/account') ||
        href.includes('/checkout')) return false;

    return true;
  }

  async playTransition(destinationUrl) {
    if (this.isTransitioning) return;

    const destinationPage = this.getDestinationPage(destinationUrl);
    const transitionKey = `${this.currentPage}-${destinationPage}`;
    const transitionConfig = this.transitionConfig.get(transitionKey);

    if (!transitionConfig || this.currentPage === destinationPage) {
      window.location.href = destinationUrl;
      return;
    }

    if (!transitionConfig.video) {
      window.location.href = destinationUrl;
      return;
    }

    if (this.isMobile) {
      window.location.href = destinationUrl;
      return;
    }

    this.isTransitioning = true;

    document.querySelectorAll('header-drawer').forEach(drawer => {
      if (drawer.isOpen) drawer.close();
    });

    const { overlay, mediaContainer } = this.elements;

    document.body.style.overflow = 'hidden';
    this.updateOverlayDimensions();

    overlay.style.display = 'block';
    overlay.style.opacity = '1';
    overlay.offsetHeight;

    this.preloadDestinationPage(destinationUrl);

    try {
      await this.playVideoTransition(transitionKey, transitionConfig, mediaContainer);
      window.location.href = destinationUrl;
    } catch (error) {
      window.location.href = destinationUrl;
    }
  }

async playVideoTransition(transitionKey, config, container) {
    container.innerHTML = '';

    let video;
    if (this.preloadedMedia.has(transitionKey)) {
      video = this.preloadedMedia.get(transitionKey).cloneNode(true);
    } else {
      video = document.createElement('video');
      video.src = config.video;
    }

    video.style.cssText = `
      width: 100vw;
      height: 100vh;
      object-fit: cover;
      transform: translate3d(0, 0, 0);
      -webkit-transform: translate3d(0, 0, 0);
    `;

    video.muted = true;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');
    video.setAttribute('playsinline', 'true');
    video.playbackRate = config.speed;
    video.defaultMuted = true;
    video.autoplay = false;
    video.removeAttribute('poster');

    container.appendChild(video);

    await video.play();

    await new Promise((resolve) => {
      video.onended = resolve;
      setTimeout(resolve, (video.duration / config.speed) * 1000 + 500);
    });
  }

  setupHoverPreloading() {
    if (this.isMobile) return;

    let hoverTimeout;

    document.addEventListener('mouseenter', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!this.shouldInterceptLink(href, link)) return;

      hoverTimeout = setTimeout(() => {
        const destinationPage = this.getDestinationPage(href);
        const transitionKey = `${this.currentPage}-${destinationPage}`;

        if (!this.preloadedMedia.has(transitionKey)) {
          const config = this.transitionConfig.get(transitionKey);
          if (config && config.video) {
            const video = document.createElement('video');
            video.src = config.video;
            video.preload = 'auto';
            video.muted = true;
            video.playsInline = true;
            this.preloadedMedia.set(transitionKey, video);
          }
        }

        this.preloadDestinationPage(href);
      }, 100);
    }, true);

    document.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
    }, true);
  }

  preventUnloadFlash() {
    window.addEventListener('beforeunload', () => {
      if (this.isTransitioning && this.elements.overlay) {
        this.elements.overlay.style.display = 'block';
        this.elements.overlay.style.opacity = '1';
      }
    });

    window.addEventListener('pagehide', () => {
      if (this.isTransitioning && this.elements.overlay) {
        this.elements.overlay.style.display = 'block';
        this.elements.overlay.style.opacity = '1';
      }
    });
  }

  async init() {
    this.elements = this.createMediaOverlay();

    await this.fetchTransitionConfig();
    this.preloadMedia();
    this.setupHoverPreloading();
    this.preventUnloadFlash();

    window.addEventListener('resize', () => this.updateOverlayDimensions());

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!this.shouldInterceptLink(href, link)) return;
      e.preventDefault();
      e.stopPropagation();
      this.playTransition(href);
    }, true);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      const [, , url] = args;
      if (url) this.playTransition(url);
      else originalPushState.apply(history, args);
    };

    history.replaceState = (...args) => {
      const [, , url] = args;
      if (url) this.playTransition(url);
      else originalReplaceState.apply(history, args);
    };
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PageTransitionHandler());
} else {
  new PageTransitionHandler();
}
