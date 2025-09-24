# Claude Code Development Plan - lovemoney.help

## Project Overview

### Project Goal
Create an enhanced English website for lovemoney.help that embeds the LoveMoney game via iframe from https://lovemoneygame.io/lovemoney.embed, while providing superior user experience, guides, and community features compared to the original site.

### Technical Stack
- **Core**: Pure HTML5 + CSS3 + Vanilla JavaScript
- **Architecture**: Static site with iframe game embedding
- **Design**: Mobile-first responsive design
- **Features**: Game guides, compatibility testing, fullscreen support

## Development Phase Plan

### Phase 1: Project Setup and Basic Structure (Day 1)

#### Prompt 1: Project Initialization
```
Create lovemoney.help website - an enhanced English version of LoveMoney game site.

Project Requirements:
- Static HTML website with iframe game embedding
- Mobile-first responsive design
- English-only content
- Enhanced user experience over original site

Key Features:
1. Embed LoveMoney game via iframe: https://lovemoneygame.io/lovemoney.embed
2. Game compatibility testing system
3. Comprehensive gameplay guides
4. Community features and social sharing
5. Progressive Web App capabilities

Create project structure:
/
├── index.html              # Main page with embedded game
├── guide.html             # Complete gameplay guide
├── about.html             # About the game and website
├── privacy.html           # Privacy policy
├── terms.html             # Terms of service
├── manifest.json          # PWA configuration
├── sw.js                 # Service worker
├── css/
│   ├── main.css          # Main styles
│   ├── game-embed.css    # Game embedding specific styles
│   ├── guide.css         # Guide page styles
│   └── mobile.css        # Mobile optimizations
├── js/
│   ├── main.js           # Main application logic
│   ├── game-embed.js     # Game embedding handler
│   ├── compatibility.js  # Compatibility testing
│   └── analytics.js      # Usage analytics
├── assets/
│   ├── images/           # Site images and screenshots
│   ├── icons/            # PWA icons
│   └── sounds/           # UI sound effects
└── data/
    └── guides.js         # Guide content data

Start with index.html - create the main page with game embedding infrastructure.
```

#### Prompt 2: Game Embedding System
```
Create the core game embedding system based on the provided iframe reference code.

index.html structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LoveMoney - Interactive Moral Choice Game</title>
    <meta name="description" content="Play LoveMoney online - A unique clicker RPG exploring moral choices and relationships. Meet Harvey and decide how far you'll go for money.">
    <!-- PWA and social meta tags -->
</head>
<body>
    <div class="container">
        <header class="hero-section">
            <h1>💰 LoveMoney</h1>
            <p>Interactive Moral Choice Game - Click, Choose, Consequences</p>
        </header>

        <div id="statusBar" class="status-bar loading">
            🔄 Testing game compatibility...
        </div>

        <div class="game-container">
            <button class="fullscreen-btn" onclick="toggleFullscreen()">
                🔥 Fullscreen Mode
            </button>
            
            <div id="loadingOverlay" class="loading-overlay">
                <div class="love-icon">💰</div>
                <div class="loading-spinner"></div>
                <div>Loading Harvey's World...</div>
            </div>

            <iframe 
                id="gameFrame"
                class="game-iframe"
                src="https://lovemoneygame.io/lovemoney.embed"
                title="LoveMoney Game"
                allowfullscreen
                allow="autoplay; fullscreen; gamepad">
            </iframe>
        </div>

        <div class="controls">
            <!-- Game controls and information -->
        </div>
    </div>
</body>
</html>
```

Key requirements:
- Responsive iframe that scales properly on all devices
- Loading overlay with themed animations
- Fullscreen mode support
- Compatibility testing system
- Error handling for failed loads
- Mobile-optimized touch controls

Reference the provided iframe embedding best practices.
```

### Phase 2: Enhanced User Interface (Day 2)

#### Prompt 3: Modern CSS Design System
```
Create a modern, mobile-first CSS design system for lovemoney.help.

Design Philosophy:
- Warm, inviting colors that reflect the game's emotional depth
- Smooth animations and transitions
- Excellent mobile experience
- Gaming-focused UI elements

CSS Architecture:
main.css - Core design system:
```css
:root {
  /* Brand Colors */
  --primary: #FF6B6B;        /* Love/Heart red */
  --secondary: #4ECDC4;      /* Mint green balance */
  --accent: #FFE66D;         /* Money gold */
  --warning: #FF8E53;        /* Moral warning orange */
  
  /* Game State Colors */
  --moral-high: #27AE60;     /* High morality - green */
  --moral-medium: #F39C12;   /* Medium morality - orange */
  --moral-low: #E74C3C;      /* Low morality - red */
  
  /* Neutral Palette */
  --bg-primary: #F8F9FA;
  --bg-secondary: #FFFFFF;
  --bg-dark: #2C3E50;
  --text-primary: #2C3E50;
  --text-secondary: #7F8C8D;
  --border-light: #E9ECEF;
  
  /* Spacing System */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Consolas', monospace;
  
  /* Animations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --easing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

game-embed.css - Game-specific styles:
```css
.game-container {
  position: relative;
  width: 100%;
  height: 70vh;
  min-height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.game-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .game-container {
    height: 60vh;
    min-height: 400px;
    border-radius: 8px;
  }
}
```

Include:
- Loading animations themed around love/money/moral choices
- Hover effects and micro-interactions
- Mobile-optimized touch targets (44px minimum)
- Dark mode support preparation
- Accessibility-focused color contrasts
```

#### Prompt 4: Interactive Game Controls
```
Create interactive game controls and information panels.

Features to implement:
1. **Game Status Panel**:
   - Real-time loading status
   - Compatibility test results
   - Performance indicators
   - Error recovery options

2. **Game Information Cards**:
   - Quick start guide
   - Controls explanation
   - Moral choice tips
   - Achievement hints

3. **Interactive Controls**:
   - Reload game button
   - Open in new tab option
   - Fullscreen toggle
   - Sound control (if applicable)
   - Settings panel

4. **Mobile Enhancements**:
   - Haptic feedback support
   - Touch-optimized buttons
   - Swipe gestures for navigation
   - Orientation change handling

HTML structure:
```html
<div class="controls-panel">
  <div class="game-info">
    <div class="info-card">
      <h3>🎯 Quick Start</h3>
      <p>Click Harvey to earn money. Buy upgrades to increase earnings. Reach $25,000 to complete the game.</p>
    </div>
    
    <div class="info-card moral-guide">
      <h3>⚖️ Moral Choices</h3>
      <p>Every upgrade affects your relationship with Harvey. Your choices determine the ending.</p>
    </div>
  </div>
  
  <div class="control-buttons">
    <button class="btn btn-primary" onclick="reloadGame()">
      🔄 Restart Game
    </button>
    <button class="btn btn-secondary" onclick="openInNewTab()">
      🔗 Open in New Tab
    </button>
    <button class="btn btn-accent" onclick="showGuide()">
      📖 Full Guide
    </button>
  </div>
</div>
```

JavaScript functionality:
- Smooth loading transitions
- Error handling with user-friendly messages
- Performance monitoring
- Accessibility keyboard navigation
- Mobile gesture support
```

### Phase 3: Content and Guides System (Day 3)

#### Prompt 5: Comprehensive Guide System
```
Create guide.html with a comprehensive gameplay guide system.

Content structure based on research findings:

1. **Getting Started Section**:
   - Game objective ($25,000 medical bill)
   - Basic controls (clicking Harvey)
   - UI explanation

2. **Upgrade System Guide**:
   - All 7 upgrade levels with exact costs and effects:
     * Basic Touch - Free, $1/click
     * Pet - $100, $2/click, -5 moral
     * Kiss - $500, $5/click, -10 moral
     * Touch - $1,500, $15/click, -20 moral
     * Embrace - $3,000, $30/click, -25 moral
     * Caress - $6,000, $60/click, -30 moral
     * Special - $10,000+, $100/click, -40 moral

3. **Strategy Guides**:
   - Optimal upgrade paths
   - Time management tips
   - Moral score management
   - Achievement hunting

4. **Endings Guide**:
   - High Morality Ending (60+ moral score)
   - Medium Morality Ending (30-59 moral score)
   - Low Morality Ending (<30 moral score)
   - Hidden ending paths

5. **Character Guide**:
   - Harvey's personality and reactions
   - Dialogue interpretation
   - Relationship progression

HTML structure:
```html
<div class="guide-container">
  <nav class="guide-navigation">
    <ul>
      <li><a href="#basics">🎮 Basics</a></li>
      <li><a href="#upgrades">📈 Upgrades</a></li>
      <li><a href="#strategy">🧠 Strategy</a></li>
      <li><a href="#endings">🎭 Endings</a></li>
      <li><a href="#character">💝 Harvey Guide</a></li>
    </ul>
  </nav>
  
  <main class="guide-content">
    <section id="basics" class="guide-section">
      <h2>🎮 Getting Started</h2>
      <!-- Comprehensive basic guide content -->
    </section>
    <!-- More sections... -->
  </main>
</div>
```

Features:
- Interactive table of contents
- Progress tracking through sections
- Searchable content
- Mobile-optimized reading experience
- Copy-to-clipboard for strategies
```

#### Prompt 6: Community Features
```
Add community-focused features to enhance user engagement.

Features to implement:

1. **Results Sharing System**:
   - Screenshot capture of endings
   - Social media sharing buttons
   - Achievement badges
   - Playtime statistics

2. **Strategy Sharing**:
   - User-submitted tips
   - Community voting on strategies  
   - Success rate statistics
   - Popular upgrade paths

3. **Discussion Integration**:
   - Embedded comments system (consider Disqus alternative)
   - Moral choice polls
   - Ending statistics dashboard
   - Community challenges

4. **Analytics and Insights**:
   - Anonymous gameplay statistics
   - Popular choices tracking
   - Average completion time
   - Success rate by strategy

Implementation approach:
```javascript
// Community features handler
class CommunityFeatures {
  constructor() {
    this.initSocialSharing();
    this.initStatistics();
    this.initPolls();
  }
  
  shareEnding(endingType) {
    const shareData = {
      title: `I reached the ${endingType} ending in LoveMoney!`,
      text: 'Test your moral choices in this unique game.',
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      this.fallbackShare(shareData);
    }
  }
  
  trackChoice(choiceData) {
    // Anonymous analytics
    this.sendAnalytics(choiceData);
    this.updateCommunityStats(choiceData);
  }
}
```

Include:
- Privacy-conscious analytics
- GDPR-compliant data handling
- Mobile-friendly sharing options
- Accessibility considerations
```

### Phase 4: Technical Enhancements (Day 4)

#### Prompt 7: Performance and Compatibility
```
Implement advanced technical features for optimal performance and compatibility.

1. **Game Embedding Optimization**:
   - Preloading strategies
   - Error recovery mechanisms
   - Compatibility testing suite
   - Performance monitoring

2. **Service Worker Implementation**:
   - Offline capability for static content
   - Aggressive caching for game assets
   - Background sync for community features
   - Update notifications

3. **Progressive Web App Features**:
   - App installation prompts
   - Native-like navigation
   - Splash screen customization
   - App shortcuts

sw.js structure:
```javascript
const CACHE_NAME = 'lovemoney-help-v1';
const STATIC_ASSETS = [
  '/',
  '/guide.html',
  '/css/main.css',
  '/js/main.js',
  // ... other assets
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Implement cache-first strategy for static assets
  // Network-first for game iframe content
});
```

4. **Compatibility Testing Suite**:
   - Browser compatibility checks
   - Mobile device testing
   - Iframe embedding validation
   - Feature detection and fallbacks

compatibility.js features:
- WebGL support detection
- Mobile browser optimization
- Touch input validation
- Screen size adaptation
- Performance benchmarking
```

#### Prompt 8: Analytics and SEO
```
Implement analytics and SEO optimization for better discoverability.

1. **SEO Optimization**:
   - Semantic HTML structure
   - Open Graph meta tags
   - Twitter Card integration
   - Schema.org markup for games
   - Sitemap generation

2. **Privacy-Focused Analytics**:
   - Cookie-less visitor tracking
   - Performance metrics
   - User journey analysis
   - Error monitoring

3. **Content Optimization**:
   - Keyword optimization for game searches
   - Image alt-text optimization
   - Loading performance optimization
   - Mobile-first indexing readiness

HTML head optimization:
```html
<head>
  <!-- Basic SEO -->
  <title>LoveMoney - Interactive Moral Choice Game | Play Online</title>
  <meta name="description" content="Play LoveMoney, a unique clicker RPG exploring moral choices and relationships. Click to earn money, make difficult decisions, and discover multiple endings.">
  <meta name="keywords" content="love money game, moral choice game, clicker RPG, Harvey game, interactive story">
  
  <!-- Open Graph -->
  <meta property="og:title" content="LoveMoney - Interactive Moral Choice Game">
  <meta property="og:description" content="Test your moral boundaries in this unique clicking game. Meet Harvey and discover how far you'll go for money.">
  <meta property="og:image" content="/assets/images/og-image.jpg">
  <meta property="og:type" content="game">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="LoveMoney - Interactive Moral Choice Game">
  
  <!-- Schema.org -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": "LoveMoney",
    "description": "Interactive moral choice clicker game",
    "gamePlatform": "Web Browser",
    "genre": ["Role Playing Game", "Simulation"]
  }
  </script>
</head>
```

4. **Performance Monitoring**:
   - Core Web Vitals tracking
   - Game loading time measurement
   - Error rate monitoring
   - User satisfaction metrics
```

### Phase 5: Final Polish and Launch (Day 5)

#### Prompt 9: Testing and Quality Assurance
```
Implement comprehensive testing and quality assurance measures.

1. **Cross-Browser Testing Suite**:
   - Automated compatibility testing
   - Visual regression testing
   - Performance benchmarking across browsers
   - Mobile device testing matrix

2. **Accessibility Compliance**:
   - WCAG 2.1 AA compliance testing
   - Screen reader optimization
   - Keyboard navigation testing
   - Color contrast validation
   - Focus management

3. **Performance Optimization**:
   - Image optimization and compression
   - CSS and JavaScript minification
   - Critical rendering path optimization
   - Lazy loading implementation

Testing checklist:
```javascript
const qualityChecks = {
  performance: {
    firstContentfulPaint: '< 2s',
    largestContentfulPaint: '< 2.5s',
    cumulativeLayoutShift: '< 0.1',
    firstInputDelay: '< 100ms'
  },
  compatibility: {
    browsers: ['Chrome 90+', 'Firefox 88+', 'Safari 14+', 'Edge 90+'],
    mobile: ['iOS Safari', 'Chrome Mobile', 'Samsung Browser'],
    devices: ['iPhone', 'Android', 'iPad', 'Desktop']
  },
  accessibility: {
    keyboardNavigation: true,
    screenReader: true,
    colorContrast: 'AA',
    focusManagement: true
  }
};
```

4. **User Acceptance Testing**:
   - Beta user feedback collection
   - Usability testing sessions
   - Performance feedback analysis
   - Bug reporting system
```

#### Prompt 10: Launch Preparation and Documentation
```
Prepare for launch with comprehensive documentation and deployment setup.

1. **Documentation Creation**:
   - README.md with setup instructions
   - API documentation for any endpoints
   - Deployment guide
   - Maintenance procedures

2. **Launch Checklist**:
   - Domain configuration (lovemoney.help)
   - SSL certificate setup
   - CDN configuration
   - Monitoring setup
   - Backup procedures

3. **Post-Launch Monitoring**:
   - Real user monitoring (RUM)
   - Error tracking and alerting
   - Performance monitoring
   - User feedback collection

README.md structure:
```markdown
# LoveMoney.help - Enhanced LoveMoney Game Experience

## Overview
Enhanced web experience for the LoveMoney game with improved UI, comprehensive guides, and community features.

## Features
- 🎮 Embedded LoveMoney game with enhanced interface
- 📚 Comprehensive gameplay guides and strategies
- 🏆 Community features and social sharing
- 📱 Mobile-optimized responsive design
- ⚡ Progressive Web App capabilities

## Technical Stack
- Pure HTML5/CSS3/JavaScript
- Service Worker for offline capabilities
- Responsive design with mobile-first approach
- Privacy-focused analytics

## Deployment
1. Clone repository
2. Configure domain settings
3. Deploy static files
4. Monitor performance metrics
```

4. **Success Metrics Definition**:
   - User engagement metrics
   - Game completion rates
   - Community participation
   - Performance benchmarks
   - SEO ranking targets

Launch preparation:
- Final security audit
- Content review and proofreading
- Legal compliance check (GDPR, accessibility)
- Backup and recovery testing
- Monitoring dashboard setup
```

## Quality Assurance Standards

### Performance Targets
- **Loading Speed**: First Contentful Paint < 2 seconds
- **Interactivity**: First Input Delay < 100ms
- **Visual Stability**: Cumulative Layout Shift < 0.1
- **Mobile Performance**: Lighthouse score > 90

### Accessibility Requirements
- **WCAG 2.1 AA Compliance**: Full compliance
- **Keyboard Navigation**: Complete site navigable via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for normal text

### Browser Compatibility
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+, Samsung Browser 14+
- **Features**: Graceful degradation for unsupported features

### SEO Optimization
- **Core Web Vitals**: Pass all Google Core Web Vitals
- **Mobile-First**: Optimized for mobile indexing
- **Semantic HTML**: Proper heading structure and metadata
- **Schema Markup**: Rich snippets for game content

## Project Deliverables

1. **Static Website**: Complete lovemoney.help website
2. **PWA Features**: Offline capability and app installation
3. **Comprehensive Guides**: Detailed gameplay and strategy guides
4. **Community Features**: Social sharing and user engagement
5. **Performance Optimization**: Fast loading and smooth experience
6. **Documentation**: Complete setup and maintenance documentation
