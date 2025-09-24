/**
 * Game Embedding Specific JavaScript
 * Handles iframe communication, loading states, and game-specific functionality
 */

class GameEmbedHandler {
    constructor() {
        this.iframe = null;
        this.loadingOverlay = null;
        this.gameLoaded = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.loadTimeout = null;
        this.loadTimeoutDuration = 30000; // 30 seconds

        this.init();
    }

    init() {
        this.iframe = document.getElementById('gameFrame');
        this.loadingOverlay = document.getElementById('loadingOverlay');

        if (this.iframe) {
            this.setupIframeListeners();
            this.startLoadTimeout();
        }
    }

    setupIframeListeners() {
        // Iframe load event
        this.iframe.addEventListener('load', () => {
            this.onIframeLoad();
        });

        // Iframe error event
        this.iframe.addEventListener('error', () => {
            this.onIframeError();
        });

        // Message listener for iframe communication
        window.addEventListener('message', (event) => {
            this.handleIframeMessage(event);
        });

        // Monitor iframe src changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                    this.onSrcChange();
                }
            });
        });

        observer.observe(this.iframe, {
            attributes: true,
            attributeFilter: ['src']
        });
    }

    startLoadTimeout() {
        this.clearLoadTimeout();
        this.loadTimeout = setTimeout(() => {
            if (!this.gameLoaded) {
                this.onLoadTimeout();
            }
        }, this.loadTimeoutDuration);
    }

    clearLoadTimeout() {
        if (this.loadTimeout) {
            clearTimeout(this.loadTimeout);
            this.loadTimeout = null;
        }
    }

    onIframeLoad() {
        this.clearLoadTimeout();

        // Wait a bit to ensure game actually loads
        setTimeout(() => {
            if (this.isIframeContentAccessible()) {
                this.onGameLoadSuccess();
            } else {
                // Content not accessible, but iframe loaded - assume success
                this.onGameLoadSuccess();
            }
        }, 1000);
    }

    onIframeError() {
        this.clearLoadTimeout();
        this.onGameLoadError('Iframe failed to load');
    }

    onLoadTimeout() {
        this.onGameLoadError('Game loading timed out');
    }

    onSrcChange() {
        this.gameLoaded = false;
        this.retryCount = 0;
        this.showLoadingState();
        this.startLoadTimeout();
    }

    onGameLoadSuccess() {
        if (this.gameLoaded) return; // Prevent multiple calls

        this.gameLoaded = true;
        this.retryCount = 0;
        this.hideLoadingOverlay();
        this.showGameLoaded();

        // Track successful load
        if (window.loveMoneyApp) {
            window.loveMoneyApp.trackEvent('Game', 'load_success');
            window.loveMoneyApp.updateStatus('✅ Game loaded successfully!', 'success');
        }

        // Auto-hide status after delay
        setTimeout(() => {
            const statusBar = document.getElementById('statusBar');
            if (statusBar) {
                statusBar.style.display = 'none';
            }
        }, 3000);
    }

    onGameLoadError(errorMessage) {
        console.error('Game load error:', errorMessage);

        if (this.retryCount < this.maxRetries) {
            this.retryLoad();
        } else {
            this.showGameError(errorMessage);
        }

        // Track error
        if (window.loveMoneyApp) {
            window.loveMoneyApp.trackEvent('Game', 'load_error', errorMessage);
        }
    }

    retryLoad() {
        this.retryCount++;
        console.log(`Retrying game load (${this.retryCount}/${this.maxRetries})`);

        this.showRetryState();

        setTimeout(() => {
            if (this.iframe) {
                const currentSrc = this.iframe.src;
                this.iframe.src = '';
                setTimeout(() => {
                    this.iframe.src = currentSrc;
                    this.startLoadTimeout();
                }, 100);
            }
        }, 2000);
    }

    showLoadingState() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('hidden');
            this.loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="love-icon">💰</div>
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading Harvey's World...</div>
                    <div class="loading-subtitle">Preparing your moral journey</div>
                </div>
            `;
        }

        if (this.iframe) {
            this.iframe.classList.add('loading');
            this.iframe.classList.remove('loaded');
        }

        if (window.loveMoneyApp) {
            window.loveMoneyApp.updateStatus('🔄 Loading game...', 'loading');
        }
    }

    showRetryState() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('hidden');
            this.loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="love-icon">🔄</div>
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Retrying...</div>
                    <div class="loading-subtitle">Attempt ${this.retryCount} of ${this.maxRetries}</div>
                </div>
            `;
        }

        if (window.loveMoneyApp) {
            window.loveMoneyApp.updateStatus(`🔄 Retrying... (${this.retryCount}/${this.maxRetries})`, 'loading');
        }
    }

    showGameError(errorMessage) {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('hidden');
            this.loadingOverlay.innerHTML = `
                <div class="game-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-title">Game Loading Failed</div>
                    <div class="error-message">
                        ${errorMessage || 'Unable to load the LoveMoney game. Please check your internet connection and try again.'}
                    </div>
                    <div class="error-actions">
                        <button onclick="window.gameEmbedHandler.forceReload()" class="error-btn">
                            🔄 Try Again
                        </button>
                        <a href="https://lovemoneygame.io/lovemoney.embed" target="_blank" class="error-btn">
                            🔗 Open Direct
                        </a>
                        <button onclick="window.gameEmbedHandler.showTroubleshooting()" class="error-btn">
                            🛠️ Troubleshoot
                        </button>
                    </div>
                </div>
            `;
        }

        if (window.loveMoneyApp) {
            window.loveMoneyApp.updateStatus('❌ Failed to load game', 'error');
        }
    }

    showGameLoaded() {
        if (this.iframe) {
            this.iframe.classList.remove('loading');
            this.iframe.classList.add('loaded');
        }
    }

    hideLoadingOverlay() {
        if (this.loadingOverlay) {
            setTimeout(() => {
                this.loadingOverlay.classList.add('hidden');
            }, 500);
        }
    }

    forceReload() {
        this.retryCount = 0;
        this.gameLoaded = false;
        this.showLoadingState();

        if (this.iframe) {
            const timestamp = Date.now();
            const originalSrc = 'https://lovemoneygame.io/lovemoney.embed';
            this.iframe.src = `${originalSrc}?t=${timestamp}`;
            this.startLoadTimeout();
        }

        if (window.loveMoneyApp) {
            window.loveMoneyApp.trackEvent('Game', 'force_reload');
        }
    }

    showTroubleshooting() {
        const troubleshootingModal = document.createElement('div');
        troubleshootingModal.className = 'troubleshooting-modal';
        troubleshootingModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🛠️ Troubleshooting</h3>
                    <button onclick="this.closest('.troubleshooting-modal').remove()" class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="troubleshoot-section">
                        <h4>Quick Fixes:</h4>
                        <ol>
                            <li>Check your internet connection</li>
                            <li>Disable ad blockers for this site</li>
                            <li>Try refreshing the page</li>
                            <li>Clear your browser cache</li>
                            <li>Try a different browser</li>
                        </ol>
                    </div>
                    <div class="troubleshoot-section">
                        <h4>Browser Compatibility:</h4>
                        <p>LoveMoney works best on:</p>
                        <ul>
                            <li>Chrome 90+</li>
                            <li>Firefox 88+</li>
                            <li>Safari 14+</li>
                            <li>Edge 90+</li>
                        </ul>
                    </div>
                    <div class="troubleshoot-actions">
                        <button onclick="window.gameEmbedHandler.runDiagnostics()" class="btn btn-primary">
                            🔍 Run Diagnostics
                        </button>
                        <a href="mailto:support@lovemoney.help?subject=Game Loading Issue" class="btn btn-secondary">
                            📧 Contact Support
                        </a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(troubleshootingModal);

        if (window.loveMoneyApp) {
            window.loveMoneyApp.trackEvent('Support', 'troubleshooting_opened');
        }
    }

    runDiagnostics() {
        const diagnosticsResults = {
            userAgent: navigator.userAgent,
            cookiesEnabled: navigator.cookieEnabled,
            onlineStatus: navigator.onLine,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            platform: navigator.platform,
            iframeSupport: this.testIframeSupport(),
            localStorageSupport: this.testLocalStorageSupport(),
            consoleErrors: this.getRecentErrors()
        };

        console.log('Diagnostics Results:', diagnosticsResults);

        const resultsModal = document.createElement('div');
        resultsModal.className = 'diagnostics-modal';
        resultsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔍 Diagnostic Results</h3>
                    <button onclick="this.closest('.diagnostics-modal').remove()" class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="diagnostics-results">
                        ${Object.entries(diagnosticsResults).map(([key, value]) => `
                            <div class="diagnostic-item">
                                <strong>${key}:</strong> ${value}
                            </div>
                        `).join('')}
                    </div>
                    <div class="diagnostics-actions">
                        <button onclick="navigator.clipboard.writeText('${JSON.stringify(diagnosticsResults, null, 2)}').then(() => alert('Diagnostics copied to clipboard!'))"
                                class="btn btn-accent">
                            📋 Copy Results
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(resultsModal);

        if (window.loveMoneyApp) {
            window.loveMoneyApp.trackEvent('Support', 'diagnostics_run', JSON.stringify(diagnosticsResults));
        }
    }

    testIframeSupport() {
        try {
            const testIframe = document.createElement('iframe');
            return testIframe.src !== undefined;
        } catch (e) {
            return false;
        }
    }

    testLocalStorageSupport() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    getRecentErrors() {
        // This would need to be implemented with a global error handler
        return 'Error tracking not implemented';
    }

    isIframeContentAccessible() {
        try {
            // This will throw an error if cross-origin
            const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            return iframeDoc !== null;
        } catch (e) {
            // Expected for cross-origin iframes
            return false;
        }
    }

    handleIframeMessage(event) {
        // Handle messages from the game iframe
        if (event.origin !== 'https://lovemoneygame.io') {
            return; // Only accept messages from the game domain
        }

        try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

            switch (data.type) {
                case 'gameLoaded':
                    this.onGameLoadSuccess();
                    break;
                case 'gameError':
                    this.onGameLoadError(data.message);
                    break;
                case 'gameProgress':
                    this.handleGameProgress(data);
                    break;
                case 'gameComplete':
                    this.handleGameComplete(data);
                    break;
                default:
                    console.log('Unknown message from game:', data);
            }
        } catch (e) {
            console.log('Error parsing message from game:', e);
        }
    }

    handleGameProgress(data) {
        // Handle game progress updates
        if (window.loveMoneyApp) {
            window.loveMoneyApp.trackEvent('Game', 'progress', data.stage);
        }
    }

    handleGameComplete(data) {
        // Handle game completion
        if (window.loveMoneyApp) {
            window.loveMoneyApp.trackEvent('Game', 'complete', data.ending);
        }

        // Show completion celebration
        this.showGameComplete(data);
    }

    showGameComplete(data) {
        const completionModal = document.createElement('div');
        completionModal.className = 'completion-modal';
        completionModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎉 Game Complete!</h3>
                </div>
                <div class="modal-body">
                    <p>You've completed LoveMoney!</p>
                    <p><strong>Ending:</strong> ${data.ending || 'Unknown'}</p>
                    <p><strong>Final Score:</strong> $${data.finalScore || 'N/A'}</p>
                    <div class="completion-actions">
                        <button onclick="window.gameEmbedHandler.forceReload()" class="btn btn-primary">
                            🔄 Play Again
                        </button>
                        <button onclick="window.shareGame()" class="btn btn-accent">
                            📱 Share Result
                        </button>
                        <a href="/guide.html" class="btn btn-secondary">
                            📖 View Guide
                        </a>
                    </div>
                </div>
                <button onclick="this.closest('.completion-modal').remove()" class="close-btn">×</button>
            </div>
        `;

        document.body.appendChild(completionModal);

        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (completionModal.parentElement) {
                completionModal.remove();
            }
        }, 30000);
    }
}

// Initialize game embed handler
window.gameEmbedHandler = new GameEmbedHandler();