/**
 * Main JavaScript functionality for LoveMoney.help
 * Handles core site functionality, PWA features, and user interactions
 */

class LoveMoneyApp {
    constructor() {
        this.isFullscreen = false;
        this.gameLoaded = false;
        this.startTime = performance.now();

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        this.initServiceWorker();
        this.initPWAFeatures();
        this.initAnalytics();
        this.setupEventListeners();
        this.initPerformanceMonitoring();

        console.log('LoveMoney.help initialized successfully');
    }

    // Service Worker Registration
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                        this.handleServiceWorkerUpdate(registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    handleServiceWorkerUpdate(registration) {
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.showUpdateNotification();
                }
            });
        });
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span>🚀 New version available!</span>
                <button onclick="window.location.reload()" class="update-btn">Update</button>
                <button onclick="this.parentElement.parentElement.remove()" class="dismiss-btn">×</button>
            </div>
        `;
        document.body.appendChild(notification);
    }

    // PWA Features
    initPWAFeatures() {
        // Install prompt
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton(deferredPrompt);
        });

        // App installed event
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.trackEvent('PWA', 'install');
            this.hideInstallButton();
        });
    }

    showInstallButton(deferredPrompt) {
        const installBtn = document.createElement('button');
        installBtn.className = 'install-btn btn btn-accent';
        installBtn.innerHTML = '<span class="btn-icon">📱</span><span class="btn-text">Install App</span>';
        installBtn.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
                installBtn.remove();
            });
        });

        const controlButtons = document.querySelector('.control-buttons');
        if (controlButtons) {
            controlButtons.appendChild(installBtn);
        }
    }

    hideInstallButton() {
        const installBtn = document.querySelector('.install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Mobile navigation
        this.setupMobileNavigation();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.toggleFullscreen();
            } else if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.reloadGame();
            } else if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }
        });

        // Visibility change detection
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('Engagement', 'tab_hidden');
            } else {
                this.trackEvent('Engagement', 'tab_visible');
            }
        });

        // Window resize handling
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Online/offline detection
        window.addEventListener('online', () => {
            this.updateConnectionStatus(true);
        });

        window.addEventListener('offline', () => {
            this.updateConnectionStatus(false);
        });
    }

    setupMobileNavigation() {
        // Mobile menu toggle functionality
        window.toggleMobileMenu = () => {
            const burger = document.querySelector('.navbar-burger');
            const menu = document.querySelector('.navbar-menu');

            if (burger && menu) {
                burger.classList.toggle('is-active');
                menu.classList.toggle('is-active');

                // Prevent body scrolling when menu is open
                document.body.style.overflow = menu.classList.contains('is-active') ? 'hidden' : '';
            }
        };

        // Close mobile menu when clicking on links
        const navItems = document.querySelectorAll('.navbar-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const menu = document.querySelector('.navbar-menu');
                const burger = document.querySelector('.navbar-burger');

                if (menu && burger && menu.classList.contains('is-active')) {
                    burger.classList.remove('is-active');
                    menu.classList.remove('is-active');
                    document.body.style.overflow = '';
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (event) => {
            const navbar = document.querySelector('.navbar');
            const menu = document.querySelector('.navbar-menu');
            const burger = document.querySelector('.navbar-burger');

            if (menu && burger && menu.classList.contains('is-active')) {
                if (!navbar.contains(event.target)) {
                    burger.classList.remove('is-active');
                    menu.classList.remove('is-active');
                    document.body.style.overflow = '';
                }
            }
        });

        // Handle window resize to close mobile menu
        window.addEventListener('resize', () => {
            const menu = document.querySelector('.navbar-menu');
            const burger = document.querySelector('.navbar-burger');

            if (window.innerWidth > 768 && menu && burger) {
                burger.classList.remove('is-active');
                menu.classList.remove('is-active');
                document.body.style.overflow = '';
            }
        });
    }

    // Game Functions
    reloadGame() {
        const iframe = document.getElementById('gameFrame');
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (iframe && loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
            iframe.classList.add('loading');
            iframe.src = iframe.src; // Reload iframe

            this.trackEvent('Game', 'reload');
            this.updateStatus('🔄 Reloading game...', 'loading');
        }
    }

    toggleFullscreen() {
        const gameContainer = document.querySelector('.game-container');

        if (!this.isFullscreen) {
            this.enterFullscreen(gameContainer);
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }

        element.classList.add('fullscreen');
        this.isFullscreen = true;
        this.trackEvent('Game', 'fullscreen_enter');
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.classList.remove('fullscreen');
        }
        this.isFullscreen = false;
        this.trackEvent('Game', 'fullscreen_exit');
    }

    openInNewTab() {
        window.open('https://lovemoneygame.io/lovemoney.embed', '_blank', 'noopener,noreferrer');
        this.trackEvent('Game', 'open_new_tab');
    }

    // Sharing Functions
    shareGame() {
        const shareData = {
            title: 'LoveMoney - Interactive Moral Choice Game',
            text: 'Test your moral boundaries in this unique clicking game. Meet Harvey and discover how far you\'ll go for money.',
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData).then(() => {
                this.trackEvent('Social', 'native_share');
            }).catch((err) => {
                console.log('Error sharing:', err);
                this.fallbackShare(shareData);
            });
        } else {
            this.fallbackShare(shareData);
        }
    }

    fallbackShare(shareData) {
        // Create simple share modal
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-modal-content">
                <h3>Share LoveMoney</h3>
                <div class="share-options">
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}"
                       target="_blank" class="share-btn twitter-btn">
                        🐦 Twitter
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}"
                       target="_blank" class="share-btn facebook-btn">
                        📘 Facebook
                    </a>
                    <button onclick="navigator.clipboard.writeText('${shareData.url}').then(() => alert('Link copied!'))"
                            class="share-btn copy-btn">
                        📋 Copy Link
                    </button>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="close-btn">×</button>
            </div>
        `;

        document.body.appendChild(modal);
        this.trackEvent('Social', 'fallback_share');

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 10000);
    }

    // Status Management
    updateStatus(message, type = 'info') {
        const statusBar = document.getElementById('statusBar');
        const statusText = statusBar?.querySelector('.status-text');
        const statusIcon = statusBar?.querySelector('.status-icon');

        if (statusBar && statusText) {
            statusText.textContent = message;
            statusBar.className = `status-bar ${type}`;

            // Update icon based on type
            if (statusIcon) {
                const icons = {
                    loading: '🔄',
                    success: '✅',
                    error: '❌',
                    warning: '⚠️',
                    info: 'ℹ️'
                };
                statusIcon.textContent = icons[type] || icons.info;
            }
        }
    }

    // Performance Monitoring
    initPerformanceMonitoring() {
        // Monitor Core Web Vitals
        this.observePerformance();

        // Monitor iframe loading
        const iframe = document.getElementById('gameFrame');
        if (iframe) {
            iframe.addEventListener('load', () => {
                this.onGameLoaded();
            });

            iframe.addEventListener('error', () => {
                this.onGameError();
            });
        }
    }

    observePerformance() {
        // Observe paint timings
        if ('PerformanceObserver' in window) {
            try {
                const paintObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.name === 'first-contentful-paint') {
                            this.trackTiming('Performance', 'FCP', Math.round(entry.startTime));
                        }
                    }
                });
                paintObserver.observe({ entryTypes: ['paint'] });

                // Observe layout shifts
                const clsObserver = new PerformanceObserver((list) => {
                    let clsValue = 0;
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    if (clsValue > 0) {
                        this.trackTiming('Performance', 'CLS', Math.round(clsValue * 1000));
                    }
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.log('Performance observer not supported:', e);
            }
        }
    }

    onGameLoaded() {
        const loadTime = performance.now() - this.startTime;
        const loadingOverlay = document.getElementById('loadingOverlay');
        const iframe = document.getElementById('gameFrame');

        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 500);
        }

        if (iframe) {
            iframe.classList.remove('loading');
            iframe.classList.add('loaded');
        }

        this.gameLoaded = true;
        this.updateStatus('✅ Game loaded successfully!', 'success');
        this.trackTiming('Game', 'load_time', Math.round(loadTime));

        // Hide status bar after 3 seconds
        setTimeout(() => {
            const statusBar = document.getElementById('statusBar');
            if (statusBar) {
                statusBar.style.display = 'none';
            }
        }, 3000);
    }

    onGameError() {
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (loadingOverlay) {
            loadingOverlay.innerHTML = `
                <div class="game-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-title">Game Loading Failed</div>
                    <div class="error-message">
                        Unable to load the LoveMoney game. Please check your internet connection and try again.
                    </div>
                    <div class="error-actions">
                        <button onclick="window.loveMoneyApp.reloadGame()" class="error-btn">
                            🔄 Try Again
                        </button>
                        <a href="https://lovemoneygame.io/lovemoney.embed" target="_blank" class="error-btn">
                            🔗 Open Direct
                        </a>
                    </div>
                </div>
            `;
        }

        this.updateStatus('❌ Failed to load game', 'error');
        this.trackEvent('Game', 'load_error');
    }

    // Utility Functions
    handleResize() {
        // Handle responsive adjustments if needed
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer && this.isFullscreen) {
            // Adjust fullscreen layout if necessary
        }
    }

    updateConnectionStatus(isOnline) {
        const statusMessage = isOnline ?
            '🌐 Connection restored' :
            '📱 You\'re offline - some features may be limited';

        this.updateStatus(statusMessage, isOnline ? 'success' : 'warning');
        this.trackEvent('Connection', isOnline ? 'online' : 'offline');

        if (!isOnline) {
            setTimeout(() => {
                const statusBar = document.getElementById('statusBar');
                if (statusBar) {
                    statusBar.style.display = 'none';
                }
            }, 5000);
        }
    }

    debounce(func, wait) {
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

    // Analytics placeholder functions (to be implemented with actual analytics)
    initAnalytics() {
        // Initialize privacy-focused analytics
        this.trackEvent('App', 'initialize');
    }

    trackEvent(category, action, label = null) {
        // Placeholder for privacy-focused event tracking
        console.log(`Event: ${category}.${action}${label ? ` (${label})` : ''}`);

        // Example: Send to privacy-focused analytics service
        // this.sendAnalyticsEvent({ category, action, label, timestamp: Date.now() });
    }

    trackTiming(category, variable, time) {
        // Placeholder for performance timing tracking
        console.log(`Timing: ${category}.${variable} = ${time}ms`);

        // Example: Send timing data to analytics
        // this.sendAnalyticsTiming({ category, variable, time, timestamp: Date.now() });
    }
}

// Global Functions (for HTML onclick handlers)
window.toggleFullscreen = () => window.loveMoneyApp?.toggleFullscreen();
window.reloadGame = () => window.loveMoneyApp?.reloadGame();
window.openInNewTab = () => window.loveMoneyApp?.openInNewTab();
window.shareGame = () => window.loveMoneyApp?.shareGame();
window.showGuide = () => window.location.href = '/guide.html';

// Initialize app
window.loveMoneyApp = new LoveMoneyApp();