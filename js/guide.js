/**
 * Guide Page Interactive Features
 * Handles navigation, search, progress tracking, and interactive elements
 */

class GuideController {
    constructor() {
        this.currentSection = null;
        this.sections = [];
        this.scrollTimeout = null;
        this.searchIndex = [];
        this.readingProgress = {};

        this.init();
    }

    init() {
        this.setupSections();
        this.setupNavigation();
        this.setupScrollSpy();
        this.setupSearch();
        this.setupProgressTracking();
        this.setupInteractiveElements();
        this.loadReadingProgress();

        console.log('Guide controller initialized');
    }

    setupSections() {
        this.sections = Array.from(document.querySelectorAll('.guide-section')).map(section => ({
            id: section.id,
            element: section,
            title: section.querySelector('.section-title')?.textContent?.trim() || section.id,
            navLink: document.querySelector(`[href="#${section.id}"]`)
        }));

        // Build search index
        this.buildSearchIndex();
    }

    buildSearchIndex() {
        this.searchIndex = [];

        this.sections.forEach(section => {
            const content = section.element.textContent.toLowerCase();
            const title = section.title.toLowerCase();

            this.searchIndex.push({
                id: section.id,
                title: section.title,
                content: content,
                keywords: this.extractKeywords(content)
            });
        });
    }

    extractKeywords(text) {
        // Extract important keywords from text
        const keywords = [];
        const words = text.match(/\b\w{3,}\b/g) || [];

        // Game-specific terms
        const gameTerms = [
            'harvey', 'moral', 'upgrade', 'click', 'money', 'ending', 'strategy',
            'touch', 'pet', 'kiss', 'embrace', 'caress', 'special', 'score',
            'relationship', 'boundary', 'consent', 'ethics', 'choice'
        ];

        words.forEach(word => {
            if (gameTerms.includes(word.toLowerCase()) || word.length > 5) {
                keywords.push(word.toLowerCase());
            }
        });

        return [...new Set(keywords)]; // Remove duplicates
    }

    setupNavigation() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                this.trackNavigation(targetId);
            });
        });

        // Mobile navigation toggle
        this.setupMobileNavigation();

        // Keyboard navigation
        this.setupKeyboardNavigation();
    }

    setupMobileNavigation() {
        const navContainer = document.querySelector('.guide-navigation');
        const navTitle = document.querySelector('.nav-title-mobile');

        if (navTitle && window.innerWidth <= 768) {
            navTitle.addEventListener('click', () => {
                navContainer.classList.toggle('nav-expanded');
            });
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) return;

            switch (e.key) {
                case 'ArrowUp':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.navigateToPreviousSection();
                    }
                    break;
                case 'ArrowDown':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.navigateToNextSection();
                    }
                    break;
                case '/':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        this.openSearch();
                    }
                    break;
                case 'Escape':
                    this.closeSearch();
                    break;
            }
        });
    }

    setupScrollSpy() {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        this.sections.forEach(section => {
            observer.observe(section.element);
        });
    }

    setupSearch() {
        this.createSearchInterface();
    }

    createSearchInterface() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'guide-search-container';
        searchContainer.innerHTML = `
            <div class="search-overlay" id="searchOverlay">
                <div class="search-modal">
                    <div class="search-header">
                        <h3>🔍 Search Guide</h3>
                        <button onclick="window.guideController.closeSearch()" class="search-close">×</button>
                    </div>
                    <div class="search-input-container">
                        <input type="text" id="guideSearch" placeholder="Search for strategies, upgrades, endings..." autocomplete="off">
                        <div class="search-help">
                            <span>💡 Try: "moral ending", "upgrade strategy", "Harvey reactions"</span>
                        </div>
                    </div>
                    <div class="search-results" id="searchResults"></div>
                    <div class="search-shortcuts">
                        <span>Press <kbd>/</kbd> to search • <kbd>Esc</kbd> to close</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(searchContainer);

        // Setup search functionality
        const searchInput = document.getElementById('guideSearch');
        const searchResults = document.getElementById('searchResults');

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value, searchResults);
            }, 300);
        });

        // Search keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.focusFirstResult();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.selectFirstResult();
            }
        });
    }

    setupProgressTracking() {
        // Track which sections have been read
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    this.markSectionAsRead(entry.target.id);
                }
            });
        }, {
            threshold: 0.5
        });

        this.sections.forEach(section => {
            progressObserver.observe(section.element);
        });

        this.createProgressIndicator();
    }

    createProgressIndicator() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'reading-progress';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text">
                <span id="progressText">0% Complete</span>
            </div>
        `;

        const navigation = document.querySelector('.guide-navigation');
        if (navigation) {
            navigation.appendChild(progressContainer);
        }
    }

    setupInteractiveElements() {
        // Expandable sections
        this.setupExpandableSections();

        // Copy-to-clipboard functionality
        this.setupCopyFunctionality();

        // Table of contents generator
        this.generateTableOfContents();

        // Interactive upgrade calculator
        this.setupUpgradeCalculator();
    }

    setupExpandableSections() {
        document.querySelectorAll('[data-expandable]').forEach(element => {
            const trigger = element.querySelector('.expand-trigger');
            const content = element.querySelector('.expand-content');

            if (trigger && content) {
                trigger.addEventListener('click', () => {
                    element.classList.toggle('expanded');
                    this.trackInteraction('expand', element.dataset.expandable);
                });
            }
        });
    }

    setupCopyFunctionality() {
        // Add copy buttons to code blocks and strategies
        document.querySelectorAll('.strategy-content, .tip-item').forEach(element => {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '📋';
            copyBtn.title = 'Copy to clipboard';
            copyBtn.addEventListener('click', () => {
                this.copyToClipboard(element.textContent.trim());
            });

            element.style.position = 'relative';
            element.appendChild(copyBtn);
        });
    }

    setupUpgradeCalculator() {
        const calculatorContainer = document.createElement('div');
        calculatorContainer.className = 'upgrade-calculator';
        calculatorContainer.innerHTML = `
            <div class="calculator-header">
                <h4>💰 Upgrade Calculator</h4>
                <p>Calculate optimal upgrade paths for your strategy</p>
            </div>
            <div class="calculator-controls">
                <div class="control-group">
                    <label for="targetMoney">Target Money:</label>
                    <input type="number" id="targetMoney" value="25000" min="1" max="100000">
                </div>
                <div class="control-group">
                    <label for="currentMoney">Current Money:</label>
                    <input type="number" id="currentMoney" value="0" min="0">
                </div>
                <div class="control-group">
                    <label for="currentUpgrade">Current Upgrade Level:</label>
                    <select id="currentUpgrade">
                        <option value="0">Basic Touch ($1/click)</option>
                        <option value="1">Pet ($2/click)</option>
                        <option value="2">Kiss ($5/click)</option>
                        <option value="3">Touch ($15/click)</option>
                        <option value="4">Embrace ($30/click)</option>
                        <option value="5">Caress ($60/click)</option>
                        <option value="6">Special ($100/click)</option>
                    </select>
                </div>
                <button onclick="window.guideController.calculateUpgradePath()" class="calculate-btn">
                    Calculate Path
                </button>
            </div>
            <div class="calculator-results" id="calculatorResults"></div>
        `;

        const strategySection = document.getElementById('strategy');
        if (strategySection) {
            strategySection.appendChild(calculatorContainer);
        }
    }

    // Navigation Methods
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offset = 120; // Account for sticky navigation
            const elementPosition = section.offsetTop - offset;

            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    setActiveSection(sectionId) {
        if (this.currentSection === sectionId) return;

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current section's nav link
        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionId;
        this.trackSectionView(sectionId);
    }

    navigateToPreviousSection() {
        const currentIndex = this.sections.findIndex(s => s.id === this.currentSection);
        if (currentIndex > 0) {
            this.scrollToSection(this.sections[currentIndex - 1].id);
        }
    }

    navigateToNextSection() {
        const currentIndex = this.sections.findIndex(s => s.id === this.currentSection);
        if (currentIndex < this.sections.length - 1) {
            this.scrollToSection(this.sections[currentIndex + 1].id);
        }
    }

    // Search Methods
    openSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        const searchInput = document.getElementById('guideSearch');

        if (searchOverlay && searchInput) {
            searchOverlay.style.display = 'flex';
            setTimeout(() => {
                searchInput.focus();
            }, 100);

            this.trackInteraction('search', 'opened');
        }
    }

    closeSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        if (searchOverlay) {
            searchOverlay.style.display = 'none';
        }
    }

    performSearch(query, resultsContainer) {
        if (!query.trim()) {
            resultsContainer.innerHTML = '';
            return;
        }

        const results = this.searchContent(query.toLowerCase());
        this.displaySearchResults(results, resultsContainer, query);
        this.trackInteraction('search', 'query', query);
    }

    searchContent(query) {
        const results = [];
        const queryWords = query.split(' ').filter(word => word.length > 2);

        this.searchIndex.forEach(item => {
            let score = 0;

            // Title matches get higher score
            if (item.title.toLowerCase().includes(query)) {
                score += 10;
            }

            // Keyword matches
            queryWords.forEach(word => {
                if (item.keywords.includes(word)) {
                    score += 5;
                }
                if (item.title.toLowerCase().includes(word)) {
                    score += 3;
                }
                if (item.content.includes(word)) {
                    score += 1;
                }
            });

            if (score > 0) {
                results.push({ ...item, score });
            }
        });

        return results.sort((a, b) => b.score - a.score).slice(0, 8);
    }

    displaySearchResults(results, container, query) {
        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-no-results">
                    <p>No results found for "${query}"</p>
                    <p>Try searching for:</p>
                    <ul>
                        <li>"moral choices" or "endings"</li>
                        <li>"upgrade strategy" or "harvey"</li>
                        <li>"clicking tips" or "time management"</li>
                    </ul>
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(result => `
            <div class="search-result-item" onclick="window.guideController.goToSection('${result.id}')">
                <h4 class="result-title">${result.title}</h4>
                <p class="result-preview">${this.generatePreview(result.content, query)}</p>
                <span class="result-section">Section: ${result.id}</span>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="search-results-header">
                <span>Found ${results.length} result${results.length !== 1 ? 's' : ''}</span>
            </div>
            ${resultsHTML}
        `;
    }

    generatePreview(content, query) {
        const maxLength = 120;
        const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());

        if (queryIndex === -1) {
            return content.substring(0, maxLength) + '...';
        }

        const start = Math.max(0, queryIndex - 60);
        const end = Math.min(content.length, start + maxLength);

        let preview = content.substring(start, end);
        if (start > 0) preview = '...' + preview;
        if (end < content.length) preview = preview + '...';

        // Highlight query terms
        const regex = new RegExp(`(${query})`, 'gi');
        preview = preview.replace(regex, '<mark>$1</mark>');

        return preview;
    }

    goToSection(sectionId) {
        this.closeSearch();
        this.scrollToSection(sectionId);
    }

    // Progress Tracking
    markSectionAsRead(sectionId) {
        if (!this.readingProgress[sectionId]) {
            this.readingProgress[sectionId] = {
                read: true,
                timestamp: Date.now()
            };

            this.saveReadingProgress();
            this.updateProgressIndicator();
            this.trackProgress(sectionId);
        }
    }

    updateProgressIndicator() {
        const totalSections = this.sections.length;
        const readSections = Object.keys(this.readingProgress).length;
        const percentage = Math.round((readSections / totalSections) * 100);

        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (progressFill && progressText) {
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${percentage}% Complete (${readSections}/${totalSections} sections)`;
        }

        // Update navigation with read indicators
        this.updateNavigationProgress();
    }

    updateNavigationProgress() {
        this.sections.forEach(section => {
            const navLink = section.navLink;
            if (navLink && this.readingProgress[section.id]) {
                navLink.classList.add('section-read');
            }
        });
    }

    loadReadingProgress() {
        try {
            const saved = localStorage.getItem('lovemoney-guide-progress');
            if (saved) {
                this.readingProgress = JSON.parse(saved);
                this.updateProgressIndicator();
            }
        } catch (e) {
            console.log('Could not load reading progress:', e);
        }
    }

    saveReadingProgress() {
        try {
            localStorage.setItem('lovemoney-guide-progress', JSON.stringify(this.readingProgress));
        } catch (e) {
            console.log('Could not save reading progress:', e);
        }
    }

    // Interactive Features
    calculateUpgradePath() {
        const targetMoney = parseInt(document.getElementById('targetMoney').value);
        const currentMoney = parseInt(document.getElementById('currentMoney').value);
        const currentUpgrade = parseInt(document.getElementById('currentUpgrade').value);

        const upgrades = [
            { name: 'Basic Touch', cost: 0, earnings: 1, moral: 0 },
            { name: 'Pet', cost: 100, earnings: 2, moral: -5 },
            { name: 'Kiss', cost: 500, earnings: 5, moral: -10 },
            { name: 'Touch', cost: 1500, earnings: 15, moral: -20 },
            { name: 'Embrace', cost: 3000, earnings: 30, moral: -25 },
            { name: 'Caress', cost: 6000, earnings: 60, moral: -30 },
            { name: 'Special', cost: 10000, earnings: 100, moral: -40 }
        ];

        const result = this.calculateOptimalPath(
            targetMoney,
            currentMoney,
            currentUpgrade,
            upgrades
        );

        this.displayCalculationResults(result);
    }

    calculateOptimalPath(target, current, currentUpgrade, upgrades) {
        const paths = [];

        // Calculate different strategies
        for (let maxUpgrade = currentUpgrade; maxUpgrade < upgrades.length; maxUpgrade++) {
            const path = this.simulateUpgradePath(target, current, currentUpgrade, maxUpgrade, upgrades);
            if (path.success) {
                paths.push(path);
            }
        }

        return paths.sort((a, b) => {
            // Prioritize by final moral score, then by time
            if (Math.abs(a.finalMoral - b.finalMoral) > 5) {
                return b.finalMoral - a.finalMoral;
            }
            return a.totalClicks - b.totalClicks;
        });
    }

    simulateUpgradePath(target, startMoney, startUpgrade, maxUpgrade, upgrades) {
        let money = startMoney;
        let currentUpgrade = startUpgrade;
        let totalClicks = 0;
        let moralScore = 100; // Starting moral score
        const path = [];

        // Apply moral penalty for current upgrade
        for (let i = 1; i <= currentUpgrade; i++) {
            moralScore += upgrades[i].moral;
        }

        while (money < target && currentUpgrade <= maxUpgrade) {
            const currentEarnings = upgrades[currentUpgrade].earnings;

            // Check if we can afford next upgrade
            if (currentUpgrade < maxUpgrade && currentUpgrade < upgrades.length - 1) {
                const nextUpgrade = upgrades[currentUpgrade + 1];
                const moneyNeeded = nextUpgrade.cost - money;

                if (moneyNeeded > 0) {
                    const clicksNeeded = Math.ceil(moneyNeeded / currentEarnings);
                    money += clicksNeeded * currentEarnings;
                    totalClicks += clicksNeeded;
                }

                if (money >= nextUpgrade.cost) {
                    currentUpgrade++;
                    moralScore += nextUpgrade.moral;
                    path.push({
                        upgrade: nextUpgrade.name,
                        cost: nextUpgrade.cost,
                        moralImpact: nextUpgrade.moral,
                        newMoralScore: moralScore
                    });
                }
            } else {
                // Final clicks to reach target
                const remainingMoney = target - money;
                const finalClicks = Math.ceil(remainingMoney / currentEarnings);
                totalClicks += finalClicks;
                money = target;
                break;
            }
        }

        return {
            success: money >= target,
            totalClicks,
            finalMoral: moralScore,
            path,
            estimatedTime: Math.round(totalClicks / 10), // Assuming 10 clicks per second
            endingType: this.getEndingType(moralScore)
        };
    }

    getEndingType(moralScore) {
        if (moralScore >= 60) return 'High Morality';
        if (moralScore >= 30) return 'Medium Morality';
        return 'Low Morality';
    }

    displayCalculationResults(paths) {
        const resultsContainer = document.getElementById('calculatorResults');

        if (paths.length === 0) {
            resultsContainer.innerHTML = `
                <div class="calc-no-results">
                    <p>❌ No viable path found with current parameters</p>
                    <p>Try adjusting your target money or starting conditions.</p>
                </div>
            `;
            return;
        }

        const resultsHTML = paths.map((path, index) => `
            <div class="calc-result ${index === 0 ? 'recommended' : ''}">
                <div class="calc-header">
                    <h5>${index === 0 ? '⭐ Recommended' : 'Alternative'} Strategy</h5>
                    <span class="ending-badge ${path.endingType.toLowerCase().replace(' ', '-')}">${path.endingType} Ending</span>
                </div>
                <div class="calc-stats">
                    <div class="stat">
                        <span class="stat-label">Total Clicks:</span>
                        <span class="stat-value">${path.totalClicks.toLocaleString()}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Estimated Time:</span>
                        <span class="stat-value">${path.estimatedTime}s</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Final Moral Score:</span>
                        <span class="stat-value">${path.finalMoral}</span>
                    </div>
                </div>
                ${path.path.length > 0 ? `
                    <div class="calc-path">
                        <h6>Upgrade Path:</h6>
                        <ol>
                            ${path.path.map(step => `
                                <li>${step.upgrade} (-${Math.abs(step.moralImpact)} moral → ${step.newMoralScore})</li>
                            `).join('')}
                        </ol>
                    </div>
                ` : ''}
            </div>
        `).join('');

        resultsContainer.innerHTML = `
            <div class="calc-results-header">
                <h4>📊 Calculation Results</h4>
            </div>
            ${resultsHTML}
        `;

        this.trackInteraction('calculator', 'calculated');
    }

    // Utility Methods
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('📋 Copied to clipboard!');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            this.showNotification('📋 Copied to clipboard!');
        } catch (err) {
            this.showNotification('❌ Copy failed');
        }

        document.body.removeChild(textArea);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'guide-notification';
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    generateTableOfContents() {
        // This could generate a floating TOC for very long sections
        // Implementation would depend on specific needs
    }

    // Analytics and Tracking
    trackSectionView(sectionId) {
        if (window.analytics) {
            window.analytics.trackEvent('Guide', 'section_view', sectionId);
        }
    }

    trackNavigation(sectionId) {
        if (window.analytics) {
            window.analytics.trackEvent('Guide', 'navigation', sectionId);
        }
    }

    trackProgress(sectionId) {
        if (window.analytics) {
            window.analytics.trackEvent('Guide', 'section_completed', sectionId);
        }
    }

    trackInteraction(type, action, label = null) {
        if (window.analytics) {
            window.analytics.trackEvent('Guide', `${type}_${action}`, label);
        }
    }
}

// Global Functions for HTML onclick handlers
window.shareGuide = () => {
    const shareData = {
        title: 'LoveMoney Complete Game Guide',
        text: 'Check out this comprehensive guide to LoveMoney - covering all strategies, moral choices, and endings!',
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).then(() => {
            if (window.analytics) {
                window.analytics.trackEvent('Guide', 'native_share');
            }
        }).catch((err) => {
            console.log('Error sharing:', err);
            window.guideController.fallbackShare(shareData);
        });
    } else {
        window.guideController.fallbackShare(shareData);
    }
};

// Initialize guide controller
window.guideController = new GuideController();