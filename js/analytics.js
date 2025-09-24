/**
 * Privacy-Focused Analytics
 * Collects anonymous usage statistics while respecting user privacy
 */

class PrivacyAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.events = [];
        this.isEnabled = true;
        this.maxEvents = 100; // Limit events per session
        this.flushInterval = 30000; // 30 seconds

        this.init();
    }

    init() {
        // Check if analytics is disabled
        if (localStorage.getItem('analytics_disabled') === 'true') {
            this.isEnabled = false;
            return;
        }

        // Check Do Not Track header
        if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') {
            this.isEnabled = false;
            console.log('Analytics disabled due to Do Not Track preference');
            return;
        }

        this.setupEventListeners();
        this.startPeriodicFlush();
        this.trackPageView();

        console.log('Privacy-focused analytics initialized');
    }

    generateSessionId() {
        // Generate a random session ID (not persistent across sessions)
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    setupEventListeners() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.trackEvent('Engagement', document.hidden ? 'page_hidden' : 'page_visible');
        });

        // Track unload (session end)
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
            this.flush();
        });

        // Track errors
        window.addEventListener('error', (event) => {
            this.trackError('JavaScript Error', event.error?.message || 'Unknown error');
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError('Unhandled Promise Rejection', event.reason?.message || 'Unknown error');
        });
    }

    trackEvent(category, action, label = null, value = null) {
        if (!this.isEnabled || this.events.length >= this.maxEvents) {
            return;
        }

        const event = {
            timestamp: Date.now(),
            sessionId: this.sessionId,
            category,
            action,
            label,
            value,
            url: this.sanitizeUrl(window.location.href),
            userAgent: this.sanitizeUserAgent(navigator.userAgent),
            referrer: this.sanitizeReferrer(document.referrer),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height
            },
            language: navigator.language,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        this.events.push(event);
        console.log('Analytics Event:', { category, action, label, value });
    }

    trackPageView() {
        this.trackEvent('Navigation', 'page_view', window.location.pathname);
    }

    trackTiming(category, variable, time) {
        this.trackEvent('Performance', `${category}_${variable}`, null, time);
    }

    trackError(type, message) {
        // Only track error types, not specific messages to preserve privacy
        const errorType = this.categorizeError(message);
        this.trackEvent('Error', type, errorType);
    }

    trackSessionEnd() {
        const sessionDuration = Date.now() - this.startTime;
        this.trackEvent('Engagement', 'session_end', null, sessionDuration);
    }

    categorizeError(message) {
        if (!message) return 'unknown';

        const errorCategories = {
            'network': /network|fetch|load|connection/i,
            'script': /script|syntax|reference|type/i,
            'permission': /permission|security|cors/i,
            'iframe': /iframe|embed|frame/i
        };

        for (const [category, pattern] of Object.entries(errorCategories)) {
            if (pattern.test(message)) {
                return category;
            }
        }

        return 'other';
    }

    sanitizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // Remove query parameters and hash to preserve privacy
            return urlObj.origin + urlObj.pathname;
        } catch (e) {
            return 'invalid_url';
        }
    }

    sanitizeUserAgent(userAgent) {
        // Extract only browser and version information
        const browserInfo = this.extractBrowserInfo(userAgent);
        return `${browserInfo.name}/${browserInfo.version}`;
    }

    extractBrowserInfo(userAgent) {
        const browsers = [
            { name: 'Chrome', pattern: /Chrome\/(\d+)/ },
            { name: 'Firefox', pattern: /Firefox\/(\d+)/ },
            { name: 'Safari', pattern: /Safari\/\d+.*Version\/(\d+)/ },
            { name: 'Edge', pattern: /Edg\/(\d+)/ },
            { name: 'Opera', pattern: /OPR\/(\d+)/ }
        ];

        for (const browser of browsers) {
            const match = userAgent.match(browser.pattern);
            if (match) {
                return { name: browser.name, version: match[1] };
            }
        }

        return { name: 'Unknown', version: '0' };
    }

    sanitizeReferrer(referrer) {
        if (!referrer) return 'direct';

        try {
            const referrerObj = new URL(referrer);
            // Only track the domain, not full URL
            return referrerObj.hostname;
        } catch (e) {
            return 'invalid_referrer';
        }
    }

    startPeriodicFlush() {
        setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }

    flush() {
        if (!this.isEnabled || this.events.length === 0) {
            return;
        }

        // In a real implementation, you would send data to your analytics endpoint
        // For now, we'll just log and clear
        this.sendAnalyticsData(this.events);
        this.events = [];
    }

    sendAnalyticsData(events) {
        // Placeholder for sending data to analytics endpoint
        console.log('Sending analytics data:', events);

        // Example implementation:
        /*
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                events,
                sessionId: this.sessionId,
                timestamp: Date.now()
            })
        }).catch(error => {
            console.error('Failed to send analytics:', error);
        });
        */
    }

    // User control methods
    enable() {
        this.isEnabled = true;
        localStorage.removeItem('analytics_disabled');
        this.trackEvent('Privacy', 'analytics_enabled');
        console.log('Analytics enabled');
    }

    disable() {
        this.isEnabled = false;
        localStorage.setItem('analytics_disabled', 'true');
        this.events = []; // Clear any pending events
        console.log('Analytics disabled');
    }

    isAnalyticsEnabled() {
        return this.isEnabled;
    }

    getSessionSummary() {
        return {
            sessionId: this.sessionId,
            startTime: this.startTime,
            duration: Date.now() - this.startTime,
            eventCount: this.events.length,
            enabled: this.isEnabled
        };
    }

    // GDPR compliance methods
    exportUserData() {
        // Return all data collected for this session
        return {
            sessionId: this.sessionId,
            events: this.events,
            settings: {
                enabled: this.isEnabled,
                doNotTrack: navigator.doNotTrack
            }
        };
    }

    clearUserData() {
        // Clear all collected data
        this.events = [];
        localStorage.removeItem('analytics_disabled');
        console.log('User data cleared');
    }

    showPrivacyInfo() {
        const privacyModal = document.createElement('div');
        privacyModal.className = 'privacy-info-modal';
        privacyModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔒 Privacy Information</h3>
                    <button onclick="this.closest('.privacy-info-modal').remove()" class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="privacy-section">
                        <h4>What We Collect:</h4>
                        <ul>
                            <li>Page views and navigation patterns</li>
                            <li>Game interaction events (anonymous)</li>
                            <li>Performance metrics</li>
                            <li>Error reports (no personal data)</li>
                            <li>Browser compatibility information</li>
                        </ul>
                    </div>

                    <div class="privacy-section">
                        <h4>What We DON'T Collect:</h4>
                        <ul>
                            <li>Personal information</li>
                            <li>IP addresses</li>
                            <li>Persistent user tracking</li>
                            <li>Cross-site tracking</li>
                            <li>Advertising data</li>
                        </ul>
                    </div>

                    <div class="privacy-section">
                        <h4>Your Rights:</h4>
                        <p>You can disable analytics at any time. All data is anonymous and session-based only.</p>
                    </div>

                    <div class="privacy-controls">
                        <button onclick="window.analytics.disable(); alert('Analytics disabled')"
                                class="btn ${this.isEnabled ? 'btn-warning' : 'btn-secondary'}">
                            ${this.isEnabled ? 'Disable Analytics' : 'Analytics Disabled'}
                        </button>

                        ${!this.isEnabled ? `
                            <button onclick="window.analytics.enable(); alert('Analytics enabled')"
                                    class="btn btn-primary">
                                Enable Analytics
                            </button>
                        ` : ''}

                        <button onclick="navigator.clipboard.writeText(JSON.stringify(window.analytics.exportUserData(), null, 2)).then(() => alert('Data exported to clipboard'))"
                                class="btn btn-accent">
                            Export My Data
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(privacyModal);
    }
}

// Initialize analytics
window.analytics = new PrivacyAnalytics();

// Export for global access
window.trackEvent = (category, action, label, value) => {
    if (window.analytics) {
        window.analytics.trackEvent(category, action, label, value);
    }
};

window.trackTiming = (category, variable, time) => {
    if (window.analytics) {
        window.analytics.trackTiming(category, variable, time);
    }
};