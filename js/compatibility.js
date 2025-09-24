/**
 * Compatibility Testing and Browser Detection
 * Tests browser capabilities and provides compatibility feedback
 */

class CompatibilityTester {
    constructor() {
        this.results = {};
        this.isRunning = false;
        this.init();
    }

    init() {
        // Run compatibility tests on page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.runCompatibilityTests());
        } else {
            this.runCompatibilityTests();
        }
    }

    async runCompatibilityTests() {
        if (this.isRunning) return;
        this.isRunning = true;

        this.updateStatus('🔄 Testing compatibility...', 'loading');

        try {
            // Basic browser detection
            this.results.browser = this.detectBrowser();
            this.results.isMobile = this.detectMobile();
            this.results.isTablet = this.detectTablet();

            // Feature tests
            this.results.iframe = this.testIframeSupport();
            this.results.localStorage = this.testLocalStorage();
            this.results.sessionStorage = this.testSessionStorage();
            this.results.webgl = this.testWebGL();
            this.results.canvas = this.testCanvas();
            this.results.webAudio = this.testWebAudio();
            this.results.fullscreen = this.testFullscreenAPI();
            this.results.touch = this.testTouchSupport();
            this.results.serviceWorker = this.testServiceWorker();
            this.results.webShare = this.testWebShare();
            this.results.clipboard = this.testClipboard();

            // Performance tests
            this.results.performance = await this.testPerformance();

            // Network tests
            this.results.network = await this.testNetworkCapabilities();

            // Generate compatibility score
            this.results.score = this.calculateCompatibilityScore();
            this.results.recommendations = this.generateRecommendations();

            this.displayResults();
            this.trackCompatibility();

        } catch (error) {
            console.error('Compatibility testing failed:', error);
            this.updateStatus('⚠️ Compatibility test failed', 'warning');
        }

        this.isRunning = false;
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        const browsers = {
            chrome: /Chrome\/(\d+)/.test(userAgent) && !/Edg\//.test(userAgent),
            firefox: /Firefox\/(\d+)/.test(userAgent),
            safari: /Safari\//.test(userAgent) && !/Chrome\//.test(userAgent),
            edge: /Edg\/(\d+)/.test(userAgent),
            opera: /OPR\/(\d+)/.test(userAgent)
        };

        for (const [name, detected] of Object.entries(browsers)) {
            if (detected) {
                const version = this.extractVersion(userAgent, name);
                return { name, version, supported: this.isBrowserSupported(name, version) };
            }
        }

        return { name: 'unknown', version: 'unknown', supported: false };
    }

    extractVersion(userAgent, browser) {
        const patterns = {
            chrome: /Chrome\/(\d+)/,
            firefox: /Firefox\/(\d+)/,
            safari: /Version\/(\d+)/,
            edge: /Edg\/(\d+)/,
            opera: /OPR\/(\d+)/
        };

        const match = userAgent.match(patterns[browser]);
        return match ? parseInt(match[1]) : 0;
    }

    isBrowserSupported(name, version) {
        const minimumVersions = {
            chrome: 90,
            firefox: 88,
            safari: 14,
            edge: 90,
            opera: 76
        };

        return version >= (minimumVersions[name] || 999);
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    detectTablet() {
        return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    }

    testIframeSupport() {
        try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            const supported = iframe.contentWindow !== null;
            document.body.removeChild(iframe);
            return { supported, details: 'Iframe embedding capability' };
        } catch (e) {
            return { supported: false, details: 'Iframe not supported', error: e.message };
        }
    }

    testLocalStorage() {
        try {
            const testKey = 'compatibilityTest';
            localStorage.setItem(testKey, 'test');
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            return { supported: retrieved === 'test', details: 'Local storage for offline features' };
        } catch (e) {
            return { supported: false, details: 'Local storage not available', error: e.message };
        }
    }

    testSessionStorage() {
        try {
            const testKey = 'compatibilityTest';
            sessionStorage.setItem(testKey, 'test');
            const retrieved = sessionStorage.getItem(testKey);
            sessionStorage.removeItem(testKey);
            return { supported: retrieved === 'test', details: 'Session storage for temporary data' };
        } catch (e) {
            return { supported: false, details: 'Session storage not available', error: e.message };
        }
    }

    testWebGL() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return {
                supported: !!gl,
                details: 'WebGL for game graphics',
                version: gl ? gl.getParameter(gl.VERSION) : null
            };
        } catch (e) {
            return { supported: false, details: 'WebGL not supported', error: e.message };
        }
    }

    testCanvas() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            return { supported: !!ctx, details: '2D Canvas for graphics' };
        } catch (e) {
            return { supported: false, details: 'Canvas not supported', error: e.message };
        }
    }

    testWebAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const supported = !!AudioContext;
            return { supported, details: 'Web Audio for game sounds' };
        } catch (e) {
            return { supported: false, details: 'Web Audio not supported', error: e.message };
        }
    }

    testFullscreenAPI() {
        const element = document.documentElement;
        const supported = !!(
            element.requestFullscreen ||
            element.webkitRequestFullscreen ||
            element.msRequestFullscreen
        );
        return { supported, details: 'Fullscreen mode capability' };
    }

    testTouchSupport() {
        const supported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        return {
            supported,
            details: 'Touch input for mobile',
            maxTouchPoints: navigator.maxTouchPoints || 0
        };
    }

    testServiceWorker() {
        const supported = 'serviceWorker' in navigator;
        return { supported, details: 'Service worker for offline functionality' };
    }

    testWebShare() {
        const supported = 'share' in navigator;
        return { supported, details: 'Native sharing capability' };
    }

    testClipboard() {
        const supported = 'clipboard' in navigator;
        return { supported, details: 'Clipboard API for copying links' };
    }

    async testPerformance() {
        const start = performance.now();

        // Simple performance test
        const iterations = 100000;
        for (let i = 0; i < iterations; i++) {
            Math.random();
        }

        const duration = performance.now() - start;
        const score = duration < 10 ? 'excellent' : duration < 50 ? 'good' : 'poor';

        return {
            duration: Math.round(duration),
            score,
            details: `JavaScript performance test (${iterations} iterations)`
        };
    }

    async testNetworkCapabilities() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        let networkInfo = {
            supported: !!connection,
            details: 'Network information API'
        };

        if (connection) {
            networkInfo = {
                ...networkInfo,
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }

        // Test connection speed
        try {
            const testStart = performance.now();
            await fetch('data:text/plain,', { cache: 'no-cache' });
            const testDuration = performance.now() - testStart;

            networkInfo.connectionTest = {
                duration: Math.round(testDuration),
                status: testDuration < 100 ? 'fast' : testDuration < 500 ? 'moderate' : 'slow'
            };
        } catch (e) {
            networkInfo.connectionTest = { status: 'failed', error: e.message };
        }

        return networkInfo;
    }

    calculateCompatibilityScore() {
        const weights = {
            browser: 30,
            iframe: 25,
            webgl: 15,
            localStorage: 10,
            canvas: 10,
            fullscreen: 5,
            serviceWorker: 5
        };

        let score = 0;
        let maxScore = 0;

        Object.entries(weights).forEach(([feature, weight]) => {
            maxScore += weight;
            if (this.results[feature]?.supported) {
                score += weight;
            }
        });

        // Browser compatibility bonus
        if (this.results.browser?.supported) {
            score += weights.browser;
        }

        return Math.round((score / maxScore) * 100);
    }

    generateRecommendations() {
        const recommendations = [];

        if (!this.results.browser?.supported) {
            recommendations.push({
                type: 'critical',
                message: `Update your browser. ${this.results.browser.name} ${this.results.browser.version} is not fully supported.`,
                action: 'Update browser'
            });
        }

        if (!this.results.iframe?.supported) {
            recommendations.push({
                type: 'critical',
                message: 'Iframe support is required for the game to work.',
                action: 'Enable iframes or use a different browser'
            });
        }

        if (!this.results.webgl?.supported) {
            recommendations.push({
                type: 'warning',
                message: 'WebGL not supported. Game graphics may be limited.',
                action: 'Enable hardware acceleration'
            });
        }

        if (!this.results.localStorage?.supported) {
            recommendations.push({
                type: 'warning',
                message: 'Local storage not available. Settings won\'t be saved.',
                action: 'Enable cookies and local storage'
            });
        }

        if (this.results.performance?.score === 'poor') {
            recommendations.push({
                type: 'info',
                message: 'Performance may be limited on this device.',
                action: 'Close other tabs or applications'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'success',
                message: 'Your browser is fully compatible with LoveMoney!',
                action: null
            });
        }

        return recommendations;
    }

    displayResults() {
        const score = this.results.score;
        let status, message;

        if (score >= 90) {
            status = 'success';
            message = `✅ Excellent compatibility (${score}%)`;
        } else if (score >= 70) {
            status = 'success';
            message = `✅ Good compatibility (${score}%)`;
        } else if (score >= 50) {
            status = 'warning';
            message = `⚠️ Limited compatibility (${score}%)`;
        } else {
            status = 'error';
            message = `❌ Poor compatibility (${score}%)`;
        }

        this.updateStatus(message, status);

        // Show critical issues immediately
        const criticalIssues = this.results.recommendations?.filter(r => r.type === 'critical');
        if (criticalIssues && criticalIssues.length > 0) {
            this.showCriticalIssues(criticalIssues);
        }

        // Add compatibility indicator
        this.addCompatibilityIndicator(score, status);
    }

    showCriticalIssues(issues) {
        const issuesModal = document.createElement('div');
        issuesModal.className = 'compatibility-issues-modal';
        issuesModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚠️ Compatibility Issues</h3>
                </div>
                <div class="modal-body">
                    <p>Your browser has some compatibility issues that may prevent the game from working properly:</p>
                    <ul class="issues-list">
                        ${issues.map(issue => `
                            <li class="issue-item ${issue.type}">
                                <strong>${issue.message}</strong>
                                ${issue.action ? `<br><em>Recommended action: ${issue.action}</em>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                    <div class="issues-actions">
                        <button onclick="window.open('https://browsehappy.com/', '_blank')" class="btn btn-primary">
                            🌐 Update Browser
                        </button>
                        <button onclick="this.closest('.compatibility-issues-modal').remove()" class="btn btn-secondary">
                            Continue Anyway
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(issuesModal);
    }

    addCompatibilityIndicator(score, status) {
        const indicator = document.createElement('div');
        indicator.className = `compatibility-indicator ${status}`;
        indicator.innerHTML = `
            <span class="indicator-icon">${status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌'}</span>
            <span class="indicator-text">Compatibility: ${score}%</span>
            <button onclick="window.compatibilityTester.showDetailedResults()" class="indicator-details">Details</button>
        `;

        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.appendChild(indicator);

            // Auto-hide after 10 seconds for good compatibility
            if (status === 'success') {
                setTimeout(() => {
                    indicator.classList.add('hidden');
                }, 10000);
            }
        }
    }

    showDetailedResults() {
        const modal = document.createElement('div');
        modal.className = 'compatibility-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔍 Compatibility Details</h3>
                    <button onclick="this.closest('.compatibility-details-modal').remove()" class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="compatibility-score">
                        <h4>Overall Score: ${this.results.score}%</h4>
                    </div>

                    <div class="feature-tests">
                        <h4>Feature Support:</h4>
                        ${Object.entries(this.results).map(([feature, result]) => {
                            if (typeof result === 'object' && result.supported !== undefined) {
                                return `
                                    <div class="feature-result ${result.supported ? 'supported' : 'unsupported'}">
                                        <span class="feature-name">${feature}</span>
                                        <span class="feature-status">${result.supported ? '✅' : '❌'}</span>
                                        <span class="feature-details">${result.details}</span>
                                    </div>
                                `;
                            }
                            return '';
                        }).join('')}
                    </div>

                    <div class="recommendations">
                        <h4>Recommendations:</h4>
                        ${this.results.recommendations?.map(rec => `
                            <div class="recommendation ${rec.type}">
                                ${rec.message}
                                ${rec.action ? `<br><em>${rec.action}</em>` : ''}
                            </div>
                        `).join('') || 'No recommendations'}
                    </div>

                    <div class="modal-actions">
                        <button onclick="navigator.clipboard.writeText('${JSON.stringify(this.results, null, 2)}').then(() => alert('Results copied!'))"
                                class="btn btn-accent">
                            📋 Copy Results
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    updateStatus(message, type) {
        if (window.loveMoneyApp) {
            window.loveMoneyApp.updateStatus(message, type);
        }
    }

    trackCompatibility() {
        if (window.loveMoneyApp) {
            window.loveMoneyApp.trackEvent('Compatibility', 'test_complete', `score_${this.results.score}`);

            // Track specific feature support
            Object.entries(this.results).forEach(([feature, result]) => {
                if (typeof result === 'object' && result.supported !== undefined) {
                    window.loveMoneyApp.trackEvent('Compatibility', `${feature}_support`, result.supported ? 'yes' : 'no');
                }
            });
        }
    }
}

// Initialize compatibility tester
window.compatibilityTester = new CompatibilityTester();