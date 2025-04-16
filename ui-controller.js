class UIController {
    constructor() {
        console.log('UIController initializing...');
        
        // Check if required components exist
        console.log('dataCollector available:', !!window.dataCollector);
        console.log('enhancedDataCollector available:', !!window.enhancedDataCollector);
        console.log('insightsCollector available:', !!window.insightsCollector);
        console.log('comprehensiveCollector available:', !!window.comprehensiveCollector);
        
        this.dataCollector = window.dataCollector;
        this.enhancedDataCollector = window.enhancedDataCollector;
        this.insightsCollector = window.insightsCollector;
        this.comprehensiveCollector = window.comprehensiveCollector;
        this.activeSectionId = 'intro';
        this.collectedData = null;
        this.enhancedData = null;
        this.insights = null;
        this.comprehensiveData = null;
        
        // Initialize UI elements
        this.initUI();
        this.setupEventListeners();
        
        console.log('UIController initialized, will auto-start collection soon...');
        // Auto-start data collection when page loads
        this.autoStartCollection();
    }

    initUI() {
        console.log('Initializing UI...');
        
        // Setup categories
        const categories = {
            'intro': 'Introduction',
            'network': 'Network & Server Data',
            'navigator': 'Browser & Environment',
            'screen': 'Screen & Display',
            'connection': 'Network Information',
            'geolocation': 'Geolocation',
            'sensors': 'Sensors & Battery',
            'fingerprinting': 'Browser Fingerprinting',
            'interaction': 'Input & Interaction',
            'media': 'Media Devices',
            'permissions': 'Permissions & Features',
            // Enhanced data sections
            'enhanced-fonts': 'Font Detection',
            'enhanced-webrtc': 'WebRTC Leaks',
            'enhanced-codecs': 'Media Codecs',
            'enhanced-features': 'Extended Features',
            'enhanced-graphics': 'Graphics Details',
            'enhanced-security': 'Security Features',
            // Insights sections
            'insights-iss': 'ISS Location',
            'insights-weather': 'Local Weather',
            'insights-astronomy': 'Astronomy Data',
            'insights-privacy': 'Privacy Analysis',
            'insights-fingerprint': 'Fingerprint Uniqueness',
            'insights-carbon': 'Carbon Footprint',
            // Comprehensive sections
            'comp-core': 'Core Web APIs',
            'comp-hardware': 'Hardware & Devices',
            'comp-graphics': 'Graphics & Media',
            'comp-input': 'Input & Interaction',
            'comp-storage': 'Storage & Files',
            'comp-network': 'Networking APIs',
            'comp-security': 'Security & Privacy',
            'comp-experimental': 'Experimental Features'
        };
        
        // Populate navigation tabs (not sidebar anymore)
        const navTabs = document.getElementById('nav-tabs');
        console.log('Nav tabs element found:', !!navTabs);
        
        if (navTabs) {
            Object.entries(categories).forEach(([id, title]) => {
                // Create a tab button instead of list item
                const tab = document.createElement('div');
                tab.className = 'nav-tab';
                tab.dataset.section = id;
                if (id === this.activeSectionId) {
                    tab.classList.add('active');
                }
                
                // Add icon based on section
                const icon = this.getSectionIcon(id);
                tab.innerHTML = `<i class="fas ${icon}"></i> ${title}`;
                
                // Add to tabs container
                navTabs.appendChild(tab);
                
                // Create section if it doesn't exist (except for intro which is already in the HTML)
                if (id !== 'intro') {
                    this.createSection(id, title);
                }
            });
        } else {
            console.error('Navigation tabs element not found!');
        }
        
        console.log('UI initialization complete');
    }

    getSectionIcon(sectionId) {
        // Return appropriate icon based on section ID
        const icons = {
            'intro': 'fa-info-circle',
            'network': 'fa-wifi',
            'navigator': 'fa-compass',
            'screen': 'fa-desktop',
            'connection': 'fa-network-wired',
            'geolocation': 'fa-map-marker-alt',
            'sensors': 'fa-battery-half',
            'fingerprinting': 'fa-fingerprint',
            'interaction': 'fa-hand-pointer',
            'media': 'fa-video',
            'permissions': 'fa-lock',
            'enhanced-fonts': 'fa-font',
            'enhanced-webrtc': 'fa-broadcast-tower',
            'enhanced-codecs': 'fa-file-video',
            'enhanced-features': 'fa-stars',
            'enhanced-graphics': 'fa-palette',
            'enhanced-security': 'fa-shield-alt',
            'insights-iss': 'fa-satellite',
            'insights-weather': 'fa-cloud-sun',
            'insights-astronomy': 'fa-moon',
            'insights-privacy': 'fa-user-shield',
            'insights-fingerprint': 'fa-fingerprint',
            'insights-carbon': 'fa-leaf',
            'comp-core': 'fa-microchip',
            'comp-hardware': 'fa-laptop',
            'comp-graphics': 'fa-photo-film',
            'comp-input': 'fa-keyboard',
            'comp-storage': 'fa-database',
            'comp-network': 'fa-sitemap',
            'comp-security': 'fa-shield-halved',
            'comp-experimental': 'fa-flask'
        };
        
        return icons[sectionId] || 'fa-circle';
    }

    createSection(id, title) {
        console.log(`Creating section: ${id}`);
        const dataSections = document.getElementById('data-sections');
        if (!dataSections) {
            console.error('Data sections container not found!');
            return;
        }
        
        const section = document.createElement('div');
        section.id = `${id}-section`;
        section.className = 'data-section hidden';
        
        section.innerHTML = `
            <div class="section-header">
                <h2><i class="fas ${this.getSectionIcon(id)}"></i> ${title}</h2>
            </div>
            <p class="section-description">Loading data...</p>
            <div class="data-container"></div>
        `;
        
        dataSections.appendChild(section);
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation - updated for tabs instead of sidebar
        const navTabs = document.getElementById('nav-tabs');
        if (navTabs) {
            navTabs.addEventListener('click', (e) => {
                const tab = e.target.closest('.nav-tab');
                if (tab) {
                    console.log(`Tab clicked: ${tab.dataset.section}`);
                    this.setActiveSection(tab.dataset.section);
                }
            });
        }
        
        // Collect all data button
        const collectButton = document.getElementById('collect-all-data');
        console.log('Found collect button:', !!collectButton);
        
        if (collectButton) {
            collectButton.addEventListener('click', (e) => {
                console.log('Collect button clicked!');
                this.collectAllData();
            });
            console.log('Added click listener to collect button');
        } else {
            console.error('Could not find collect-all-data button!');
        }
        
        // Export data button
        const exportButton = document.getElementById('export-data');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                console.log('Export button clicked');
                this.exportData();
            });
        }
        
        console.log('Event listeners set up complete');
        
        // Permission modal buttons - Add null checks
        const grantPermissionBtn = document.getElementById('grant-permission');
        const denyPermissionBtn = document.getElementById('deny-permission');
        const permissionModal = document.getElementById('permission-modal');

        if (grantPermissionBtn && permissionModal) {
            grantPermissionBtn.addEventListener('click', () => {
                const type = permissionModal.dataset.permissionType;
                if (this.dataCollector.permissionCallbacks && this.dataCollector.permissionCallbacks[type]) {
                    this.dataCollector.permissionCallbacks[type].onGrant();
                }
                permissionModal.classList.add('hidden');
            });
        } else {
            console.warn('Permission grant button or modal not found in the DOM');
        }
        
        if (denyPermissionBtn && permissionModal) {
            denyPermissionBtn.addEventListener('click', () => {
                const type = permissionModal.dataset.permissionType;
                if (this.dataCollector.permissionCallbacks && this.dataCollector.permissionCallbacks[type]) {
                    this.dataCollector.permissionCallbacks[type].onDeny();
                }
                permissionModal.classList.add('hidden');
            });
        } else {
            console.warn('Permission deny button or modal not found in the DOM');
        }
        
        // Listen for permission requests only if we have the modal
        if (permissionModal) {
            window.addEventListener('permission-request', (e) => {
                permissionModal.dataset.permissionType = e.detail.type;
                const permissionMessage = document.getElementById('permission-message');
                if (permissionMessage) {
                    permissionMessage.textContent = e.detail.message;
                }
                permissionModal.classList.remove('hidden');
            });
        }
    }
    
    // Auto-start collection when the page loads
    autoStartCollection() {
        console.log('Auto-start collection scheduled...');
        
        // Don't auto-collect data on page load - let user click the button instead
        // This ensures the intro page is visible
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.classList.add('hidden');
        }
        
        const introSection = document.getElementById('intro-section');
        if (introSection) {
            introSection.classList.remove('hidden');
        }
    }

    async collectAllData() {
        console.log('collectAllData method called');
        
        try {
            // Show loading indicator
            const introSection = document.getElementById('intro-section');
            const loadingIndicator = document.getElementById('loading-indicator');
            
            console.log('Elements found - intro section:', !!introSection, 'loading indicator:', !!loadingIndicator);
            
            if (introSection) introSection.classList.add('hidden');
            if (loadingIndicator) loadingIndicator.classList.remove('hidden');
            
            console.log('Starting data collection processes...');
            
            // Collect all types of data
            console.log('Collecting basic data...');
            this.collectedData = await this.dataCollector.collectAllData();
            console.log('Basic data collected');
            
            console.log('Collecting enhanced data...');
            this.enhancedData = await this.enhancedDataCollector.collectEnhancedData();
            console.log('Enhanced data collected');
            
            console.log('Collecting comprehensive data...');
            this.comprehensiveData = await this.comprehensiveCollector.collectAll();
            console.log('Comprehensive data collected');
            
            // Collect insights based on the collected data
            console.log('Collecting insights...');
            this.insights = await this.insightsCollector.collectAllInsights({
                ...this.collectedData,
                ...this.enhancedData
            });
            console.log('Insights collected');
            
            // Create a scrollable view with all data instead of tabs
            console.log('Generating scrollable view...');
            this.generateScrollableDataView();
            console.log('Scrollable view generated');
            
            // Enable export button
            const exportDataBtn = document.getElementById('export-data');
            if (exportDataBtn) {
                exportDataBtn.disabled = false;
                console.log('Export button enabled');
            }
        } catch (error) {
            console.error('Error collecting data:', error);
            console.error('Error stack:', error.stack);
            alert('Error collecting data: ' + error.message);
        } finally {
            // Hide loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
            
            // Show intro section with results
            const introSection = document.getElementById('intro-section');
            if (introSection) introSection.classList.remove('hidden');
            
            const collectButton = document.getElementById('collect-all-data');
            if (collectButton) collectButton.disabled = false;
        }
    }

    generateScrollableDataView() {
        const introSection = document.getElementById('intro-section');
        if (!introSection) return;
        
        // Clear any previous data from intro section
        introSection.innerHTML = '';
        
        // Create header with completion message
        const header = document.createElement('div');
        header.className = 'scan-complete-header';
        header.innerHTML = `
            <h2>Your Browser Data Scan Complete</h2>
            <p>Scroll down to see all collected information about your browser and system.</p>
            <div class="button-container">
                <button id="collect-all-data" class="primary-button" type="button">
                    <i class="fas fa-satellite-dish"></i> Restart Scan
                </button>
                <button id="export-all-data" class="secondary-button" type="button">
                    <i class="fas fa-download"></i> Export All Data
                </button>
            </div>
        `;
        introSection.appendChild(header);
        
        // Add summary (compact view of key information)
        this.addSummaryToScrollableView(introSection);
        
        // Add user activity section with visit history
        this.addUserActivityToView(introSection);
        
        // Create container for all data sections with new dynamic navigation layout
        const allDataContainer = document.createElement('div');
        allDataContainer.className = 'all-data-container';
        introSection.appendChild(allDataContainer);
        
        // New dynamic navigation sidebar
        const navigationSidebar = document.createElement('div');
        navigationSidebar.className = 'navigation';
        allDataContainer.appendChild(navigationSidebar);
        
        // Create content area for the actual sections
        const contentArea = document.createElement('div');
        contentArea.className = 'content-area';
        allDataContainer.appendChild(contentArea);
        
        // Organize sections into categories for better grouping
        const categories = [
            {
                title: 'Summary',
                sections: [
                    { id: 'summary', title: 'Data Overview', data: this.collectedData, 
                      renderFn: (c, d) => this.renderSummarySection(c, d) }
                ]
            },
            {
                title: 'System & Browser',
                sections: [
                    { id: 'navigator', title: 'Browser Information', data: this.collectedData.navigator, 
                      renderFn: (c, d) => this.renderCategoryData(c, d, 'navigator') },
                    { id: 'screen', title: 'Display & Screen', data: this.collectedData.screen, 
                      renderFn: (c, d) => this.renderCategoryData(c, d, 'screen') },
                    { id: 'enhanced-graphics', title: 'Graphics & Rendering', data: this.enhancedData?.graphics,
                      renderFn: this.renderGraphicsData.bind(this) }
                ]
            },
            {
                title: 'Network & Connectivity',
                sections: [
                    { id: 'network', title: 'Network Data', data: this.collectedData.network, 
                      renderFn: (c, d) => this.renderCategoryData(c, d, 'network') },
                    { id: 'connection', title: 'Connection Details', data: this.collectedData.connection, 
                      renderFn: (c, d) => this.renderCategoryData(c, d, 'connection') },
                    { id: 'enhanced-security', title: 'Security Features', data: this.enhancedData?.security,
                      renderFn: this.renderSecurityData.bind(this) },
                    { id: 'enhanced-webrtc', title: 'WebRTC Data', data: this.enhancedData?.webrtc,
                      renderFn: this.renderWebRTCData.bind(this) }
                ]
            },
            {
                title: 'Hardware & Capabilities',
                sections: [
                    { id: 'sensors', title: 'Sensors & Battery', data: this.collectedData.sensors, 
                      renderFn: (c, d) => this.renderCategoryData(c, d, 'sensors') },
                    { id: 'media', title: 'Media Devices', data: this.collectedData.media, 
                      renderFn: (c, d) => this.renderCategoryData(c, d, 'media') },
                    { id: 'interaction', title: 'Input & Interaction', data: this.collectedData.interaction, 
                      renderFn: (c, d) => this.renderCategoryData(c, d, 'interaction') },
                    { id: 'enhanced-codecs', title: 'Media Codecs', data: this.enhancedData?.codecs,
                      renderFn: this.renderCodecData.bind(this) },
                    { id: 'comp-hardware', title: 'Hardware Details', data: this.comprehensiveData?.hardware,
                      renderFn: (c, d) => this.renderComprehensiveData(c, d, 'comp-hardware') }
                ]
            },
            {
                title: 'Privacy & Security',
                sections: [
                    { id: 'fingerprinting', title: 'Browser Fingerprint', data: this.collectedData.fingerprinting, 
                      renderFn: (c, d) => this.renderCategoryData(c, d, 'fingerprinting') },
                    { id: 'permissions', title: 'Permissions', data: this.collectedData.permissions, 
                      renderFn: (c, d) => this.renderCategoryData(c, d, 'permissions') },
                    { id: 'insights-privacy', title: 'Privacy Analysis', data: this.insights?.privacyScore,
                      renderFn: this.renderPrivacyScoreData.bind(this) },
                    { id: 'insights-fingerprint', title: 'Fingerprint Analysis', data: this.insights?.fingerprint,
                      renderFn: this.renderFingerprintUniquenessData.bind(this) },
                    { id: 'enhanced-fonts', title: 'Font Detection', data: this.enhancedData?.fonts,
                      renderFn: this.renderFontData.bind(this) }
                ]
            },
            {
                title: 'Insights & Analysis',
                sections: [
                    ...(this.collectedData.geolocation && !this.collectedData.geolocation.error && !this.collectedData.geolocation.requiresUserGesture ? [
                        { id: 'geolocation', title: 'Geolocation', data: this.collectedData.geolocation, 
                          renderFn: (c, d) => this.renderCategoryData(c, d, 'geolocation') }
                    ] : []),
                    { id: 'insights-weather', title: 'Weather Data', data: this.insights?.weather,
                      renderFn: this.renderWeatherData.bind(this) },
                    { id: 'insights-astronomy', title: 'Astronomy Data', data: this.insights?.astronomy,
                      renderFn: this.renderAstronomyData.bind(this) },
                    { id: 'insights-iss', title: 'ISS Location', data: this.insights?.iss,
                      renderFn: this.renderISSData.bind(this) },
                    { id: 'insights-carbon', title: 'Carbon Footprint', data: this.insights?.carbonFootprint,
                      renderFn: this.renderCarbonFootprintData.bind(this) }
                ]
            },
            {
                title: 'Advanced Features',
                sections: [
                    { id: 'enhanced-features', title: 'Browser Features', data: this.enhancedData?.browserFeatures,
                      renderFn: this.renderExtendedFeaturesData.bind(this) },
                    { id: 'comp-core', title: 'Core Web APIs', data: this.comprehensiveData?.core,
                      renderFn: (c, d) => this.renderComprehensiveData(c, d, 'comp-core') },
                    { id: 'comp-storage', title: 'Storage APIs', data: this.comprehensiveData?.storage,
                      renderFn: (c, d) => this.renderComprehensiveData(c, d, 'comp-storage') },
                    { id: 'comp-network', title: 'Network APIs', data: this.comprehensiveData?.networking,
                      renderFn: (c, d) => this.renderComprehensiveData(c, d, 'comp-network') },
                    { id: 'comp-security', title: 'Security APIs', data: this.comprehensiveData?.security,
                      renderFn: (c, d) => this.renderComprehensiveData(c, d, 'comp-security') },
                    { id: 'comp-experimental', title: 'Experimental Features', data: this.comprehensiveData?.experimental,
                      renderFn: (c, d) => this.renderComprehensiveData(c, d, 'comp-experimental') }
                ]
            }
        ];
        
        // Keep track of all valid sections for navigation
        const validSections = [];
        
        // Generate sections and navigation items
        categories.forEach(category => {
            // Skip categories with no valid sections
            const categorySections = category.sections.filter(s => s.data);
            if (categorySections.length === 0) return;
            
            // Add valid sections to our sections list
            categorySections.forEach(section => {
                validSections.push({
                    id: section.id,
                    title: section.title,
                    renderFn: section.renderFn,
                    data: section.data
                });
                
                // Create section in content area
                const sectionEl = document.createElement('section');
                sectionEl.id = `section-${section.id}`;
                sectionEl.className = 'scrollable-data-section';
                sectionEl.innerHTML = `
                    <div class="section-header">
                        <h2><i class="fas ${this.getSectionIcon(section.id)}"></i> ${section.title}</h2>
                    </div>
                    <p class="section-description">${this.getCategoryDescription(section.id)}</p>
                    <div class="data-container" id="data-container-${section.id}"></div>
                `;
                contentArea.appendChild(sectionEl);
                
                // Render the data in the container
                const container = sectionEl.querySelector(`#data-container-${section.id}`);
                if (container && section.data && section.renderFn) {
                    section.renderFn(container, section.data);
                }
            });
        });
        
        // Create navigation items for valid sections
        validSections.forEach((section, index) => {
            const navItem = document.createElement('div');
            navItem.className = 'nav-word';
            navItem.dataset.target = `section-${section.id}`;
            navItem.textContent = section.title;
            if (index === 0) {
                navItem.classList.add('active');
            }
            navigationSidebar.appendChild(navItem);
        });
        
        // Add event listeners to buttons
        setTimeout(() => {
            const collectButton = document.getElementById('collect-all-data');
            if (collectButton) {
                collectButton.addEventListener('click', () => {
                    this.collectAllData();
                });
            }
            
            const exportButton = document.getElementById('export-all-data');
            if (exportButton) {
                exportButton.addEventListener('click', () => {
                    this.exportData();
                });
            }
            
            // Set up the dynamic navigation
            this.setupDynamicNavigation();
        }, 0);
    }

    // New method to setup dynamic navigation with zoom effect
    setupDynamicNavigation() {
        const sections = document.querySelectorAll(".scrollable-data-section");
        const navWords = document.querySelectorAll(".nav-word");
        
        // Use a more stable scaling function with less dramatic differences
        const exponentialScale = (x, factor = 0.1) => {
            return Math.exp(-factor * x);
        };
        
        // Set initial state for all navigation items with gentler scaling
        navWords.forEach((word, i) => {
            // Start with a more uniform font size
            const fontSize = i === 0 ? '0.95rem' : '0.75rem';
            word.style.fontSize = fontSize;
            if (i === 0) {
                word.classList.add("active");
            }
        });
        
        // Use a more effective throttle with higher threshold
        let lastScrollTime = 0;
        const scrollThreshold = 100; // Increased to reduce frequency of updates
        let activeIndex = 0; // Keep track of current active section
        
        // Helper function to update nav words - separated for cleaner code
        const updateNavWords = (index) => {
            if (index === activeIndex) return; // Don't update if we're already on this section
            
            activeIndex = index; // Update active index
            
            navWords.forEach((word, i) => {
                word.classList.toggle("active", i === index);
                
                // Use simpler font sizing with less dramatic differences 
                if (i === index) {
                    word.style.fontSize = '0.95rem';
                    word.style.opacity = '1';
                } else {
                    // Smaller difference between active and inactive
                    word.style.fontSize = '0.75rem';
                    word.style.opacity = '0.6';
                }
            });
        };
        
        // Create IntersectionObserver with better thresholds
        const observer = new IntersectionObserver(entries => {
            // Only process if we're not throttled
            const now = Date.now();
            if (now - lastScrollTime < scrollThreshold) return;
            lastScrollTime = now;
            
            // Find the most visible section
            let mostVisible = {entry: null, visiblePx: 0};
            
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Calculate how many pixels are visible
                    const visiblePx = Math.min(
                        entry.boundingClientRect.bottom, 
                        window.innerHeight
                    ) - Math.max(
                        entry.boundingClientRect.top, 
                        0
                    );
                    
                    if (visiblePx > mostVisible.visiblePx) {
                        mostVisible = {entry, visiblePx};
                    }
                }
            });
            
            // If we found a visible section
            if (mostVisible.entry) {
                const activeSection = mostVisible.entry.target;
                const activeSectionId = activeSection.id;
                const index = [...sections].indexOf(activeSection);
                
                // Track section view
                if (this.dataCollector && typeof this.dataCollector.trackSectionView === 'function') {
                    this.dataCollector.trackSectionView(activeSectionId.replace('section-', ''));
                }
                
                // Update navigation - using requestAnimationFrame for smoother animation
                requestAnimationFrame(() => {
                    updateNavWords(index);
                });
            }
        }, { 
            threshold: [0.1, 0.2, 0.3, 0.4, 0.5], // Fewer thresholds for better performance
            rootMargin: "-10% 0px -10% 0px" // Ignore a bit of the top and bottom
        });
        
        // Observe all sections
        sections.forEach(section => observer.observe(section));
        
        // Add click handlers for navigation items
        navWords.forEach((word, idx) => {
            word.addEventListener("click", () => {
                const targetId = word.dataset.target;
                const target = document.getElementById(targetId);
                if (target) {
                    // Update nav immediately on click for more responsive feel
                    updateNavWords(idx);
                    
                    target.scrollIntoView({ behavior: "smooth" });
                }
            });
        });
    }

    generateAndShowSummary() {
        if (!this.collectedData) return;
        
        const introSection = document.getElementById('intro-section');
        if (!introSection) return;
        
        // Create summary container if it doesn't exist
        let summaryContainer = document.getElementById('data-summary-container');
        if (!summaryContainer) {
            summaryContainer = document.createElement('div');
            summaryContainer.id = 'data-summary-container';
            summaryContainer.className = 'summary-container';
            introSection.appendChild(summaryContainer);
        }
        
        let html = `
            <h2>Your Browser Data Summary</h2>
            <p>Below is a summary of the key data points collected from your browser.</p>
            <div class="data-grid">
        `;
        
        // SYSTEM INFO
        html += `<div class="data-card">
            <h4><i class="fas fa-laptop"></i> System Information</h4>`;
        
        if (this.collectedData.navigator) {
            const nav = this.collectedData.navigator;
            html += this.createDataItem('Browser', nav.vendor ? `${nav.vendor} ${nav.appName}` : nav.appName || 'Unknown');
            html += this.createDataItem('Platform', nav.platform || 'Unknown');
            html += this.createDataItem('CPU Cores', nav.hardwareConcurrency || 'Unknown');
            html += this.createDataItem('Memory', nav.deviceMemory || 'Unknown');
            html += this.createDataItem('User Agent', nav.userAgent ? (nav.userAgent.length > 50 ? 
                nav.userAgent.substring(0, 50) + '...' : nav.userAgent) : 'Unknown');
            html += this.createDataItem('Language', nav.language || 'Unknown');
        }
        
        if (this.collectedData.screen && this.collectedData.screen.screen) {
            const screen = this.collectedData.screen.screen;
            html += this.createDataItem('Screen Resolution', `${screen.width}×${screen.height}`);
            html += this.createDataItem('Color Depth', `${screen.colorDepth} bits`);
        }
        html += `</div>`;
        
        // NETWORK INFO
        html += `<div class="data-card">
            <h4><i class="fas fa-wifi"></i> Network Information</h4>`;
        
        if (this.collectedData.network && this.collectedData.network.ip) {
            html += this.createDataItem('Public IP', this.collectedData.network.ip.public || 'Unknown');
            
            if (this.collectedData.network.ip.geolocation) {
                const geo = this.collectedData.network.ip.geolocation;
                const location = [];
                if (geo.city) location.push(geo.city);
                if (geo.country_name || geo.country) location.push(geo.country_name || geo.country);
                html += this.createDataItem('Location', location.length ? location.join(', ') : 'Unknown');
                html += this.createDataItem('ISP', geo.org || geo.asn || 'Unknown');
            }
        }
        
        if (this.collectedData.connection) {
            const conn = this.collectedData.connection;
            if (typeof conn === 'object') {
                html += this.createDataItem('Connection Type', conn.effectiveType || 'Unknown');
                html += this.createDataItem('Online Status', (this.collectedData.connection.online !== undefined) ? 
                                            (this.collectedData.connection.online ? 'Online' : 'Offline') : 'Unknown');
            }
        }
        html += `</div>`;
        
        // HARDWARE & CAPABILITIES
        html += `<div class="data-card">
            <h4><i class="fas fa-microchip"></i> Hardware & Capabilities</h4>`;
        
        // Combine data from multiple collectors
        let capabilities = {};
        
        if (this.comprehensiveData && this.comprehensiveData.hardware) {
            const hardware = this.comprehensiveData.hardware;
            if (hardware.deviceInfo) {
                capabilities.gpu = hardware.deviceInfo.gpu;
            }
            if (hardware.sensors) {
                capabilities.batteryAPI = hardware.sensors.batteryAPI;
                capabilities.accelerometer = hardware.sensors.accelerometer;
                capabilities.gyroscope = hardware.sensors.gyroscope;
            }
        }
        
        if (this.collectedData.sensors) {
            const sensors = this.collectedData.sensors;
            if (sensors.battery && typeof sensors.battery === 'object' && !sensors.battery.error) {
                html += this.createDataItem('Battery Level', sensors.battery.level || 'Unknown');
                html += this.createDataItem('Battery Status', sensors.battery.charging ? 'Charging' : 'Discharging');
            }
        }
        
        if (capabilities.gpu) {
            html += this.createDataItem('GPU', capabilities.gpu);
        }
        
        html += this.createDataItem('Sensors', [
            capabilities.batteryAPI ? 'Battery' : '',
            capabilities.accelerometer ? 'Accelerometer' : '',
            capabilities.gyroscope ? 'Gyroscope' : '',
            this.collectedData.sensors?.sensorsAvailable?.deviceOrientation ? 'Orientation' : '',
        ].filter(Boolean).join(', ') || 'Limited detection');
        
        // Add media devices
        if (this.collectedData.media) {
            const media = this.collectedData.media;
            const devices = [];
            if (media.videoinput && media.videoinput.length) devices.push(`${media.videoinput.length} Camera(s)`);
            html += this.createDataItem('PWA Support', pwa.length ? pwa.join(', ') : 'Limited');
            
            const hardware = [];
            if (this.enhancedData.browserFeatures.bluetooth && this.enhancedData.browserFeatures.bluetooth.available) 
                hardware.push('Bluetooth');
            if (this.enhancedData.browserFeatures.usb && this.enhancedData.browserFeatures.usb.available) 
                hardware.push('USB');
            if (this.enhancedData.browserFeatures.serial && this.enhancedData.browserFeatures.serial.available) 
                hardware.push('Serial');
                
            html += this.createDataItem('Hardware APIs', hardware.length ? hardware.join(', ') : 'Limited access');
        }
        
        if (this.collectedData.permissions && this.collectedData.permissions.features) {
            const features = this.collectedData.permissions.features;
            html += this.createDataItem('WebRTC', features.webRTC ? 'Supported' : 'Not supported');
        }
        
        html += `</div>`;
        
        // PRIVACY & SECURITY
        html += `<div class="data-card">
            <h4><i class="fas fa-shield-alt"></i> Privacy & Security</h4>`;
        
        if (this.insights && this.insights.privacyScore) {
            const privacy = this.insights.privacyScore;
            html += this.createDataItem('Privacy Score', `<span style="color:${privacy.color};">${privacy.score}/100 (${privacy.rating})</span>`);
            
            if (privacy.issues && privacy.issues.length) {
                const topIssues = privacy.issues.slice(0, 2);
                html += this.createDataItem('Issues Found', `${topIssues.join('<br>')}${privacy.issues.length > 2 ? '<br>...' : ''}`);
            }
        }
        
        if (this.insights && this.insights.fingerprint) {
            const fingerprint = this.insights.fingerprint;
            const color = fingerprint.score < 33 ? "#2ecc71" : fingerprint.score < 66 ? "#f39c12" : "#e74c3c";
            html += this.createDataItem('Fingerprint Uniqueness', 
                `<span style="color:${color};">${fingerprint.score}%</span>`);
        }
        
        // Information about SSL/security
        if (this.enhancedData && this.enhancedData.security) {
            html += this.createDataItem('HTTPS', this.enhancedData.security.https ? 
                '<span class="success">Enabled</span>' : 
                '<span class="warning">Not enabled</span>');
        }
        
        html += `</div>`;
        
        // LOCATION BASED DATA
        if (this.collectedData.geolocation && !this.collectedData.geolocation.error && !this.collectedData.geolocation.requiresUserGesture) {
            html += `<div class="data-card">
                <h4><i class="fas fa-map-marker-alt"></i> Location Data</h4>`;
            
            const geo = this.collectedData.geolocation;
            html += this.createDataItem('Coordinates', `${geo.latitude, geo.longitude}`);
            html += this.createDataItem('Accuracy', geo.accuracy || 'Unknown');
            
            // Add insights if available
            if (this.insights) {
                if (this.insights.weather && !this.insights.weather.error) {
                    const weather = this.insights.weather;
                    html += this.createDataItem('Weather', `${weather.temperature?.celsius || '?'}°C, ${weather.conditions || 'Unknown'}`);
                }
                
                if (this.insights.iss && !this.insights.iss.error) {
                    html += this.createDataItem('ISS Distance', `${this.insights.iss.distance.km.toLocaleString()} km`);
                }
            }
            
            html += `</div>`;
        } else {
            // For when geolocation is not available
            html += `<div class="data-card">
                <h4><i class="fas fa-map-marker-alt"></i> Location Data</h4>
                <p>Location access required for detailed geolocation data.</p>`;
            
            if (this.collectedData.geolocation && this.collectedData.geolocation.requiresUserGesture) {
                html += `<button id="summary-request-geolocation" class="primary-button">
                    <i class="fas fa-map-marker-alt"></i> Enable Geolocation
                </button>`;
            }
            
            html += `</div>`;
        }
        
        // Close grid
        html += `</div>`;
        
        // Add instructions to navigate to detailed data
        html += `
            <div class="summary-footer">
                <p>Use the tabs above to explore detailed data in each category.</p>
                <button id="view-dashboard" class="secondary-button">
                    <i class="fas fa-th-large"></i> View Dashboard
                </button>
            </div>
        `;
        
        // Set the HTML content
        summaryContainer.innerHTML = html;
        
        // Make intro section visible again
        introSection.classList.remove('hidden');
        
        // Add event listeners for the buttons
        setTimeout(() => {
            const geoButton = document.getElementById('summary-request-geolocation');
            if (geoButton) {
                geoButton.addEventListener('click', async () => {
                    geoButton.disabled = true;
                    geoButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Requesting...';
                    
                    try {
                        const geoData = await this.dataCollector.requestGeolocation();
                        // Update the collected data
                        this.collectedData.geolocation = geoData;
                        // Regenerate the summary with the new data
                        this.generateAndShowSummary();
                        // Also update the geolocation tab
                        const geoSection = document.getElementById('geolocation-section');
                        if (geoSection) {
                            const container = geoSection.querySelector('.data-container');
                            if (container) {
                                this.renderGeolocationData(container, geoData);
                            }
                        }
                    } catch (error) {
                        geoButton.disabled = false;
                        geoButton.innerHTML = '<i class="fas fa-map-marker-alt"></i> Try Again';
                    }
                });
            }
            
            const dashboardButton = document.getElementById('view-dashboard');
            if (dashboardButton) {
                dashboardButton.addEventListener('click', () => {
                    const dashboard = document.getElementById('dashboard');
                    if (dashboard) dashboard.classList.remove('hidden');
                    introSection.classList.add('hidden');
                });
            }
        }, 0);
    }

    addSummaryToScrollableView(parentElement) {
        // Create summary container
        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'summary-container';
        summaryContainer.innerHTML = '<h3>Key Findings Summary</h3>';
        
        const summaryGrid = document.createElement('div');
        summaryGrid.className = 'data-grid';
        summaryContainer.appendChild(summaryGrid);
        
        // SYSTEM INFO
        const systemCard = document.createElement('div');
        systemCard.className = 'data-card';
        systemCard.innerHTML = `<h4><i class="fas fa-laptop"></i> System Information</h4>`;
        
        if (this.collectedData.navigator) {
            const nav = this.collectedData.navigator;
            systemCard.innerHTML += this.createDataItem('Browser', nav.vendor ? `${nav.vendor} ${nav.appName}` : nav.appName || 'Unknown');
            systemCard.innerHTML += this.createDataItem('Platform', nav.platform || 'Unknown');
            systemCard.innerHTML += this.createDataItem('CPU Cores', nav.hardwareConcurrency || 'Unknown');
            systemCard.innerHTML += this.createDataItem('Memory', nav.deviceMemory || 'Unknown');
        }
        
        if (this.collectedData.screen && this.collectedData.screen.screen) {
            const screen = this.collectedData.screen.screen;
            systemCard.innerHTML += this.createDataItem('Screen Resolution', `${screen.width}×${screen.height}`);
        }
        
        summaryGrid.appendChild(systemCard);
        
        // NETWORK INFO
        const networkCard = document.createElement('div');
        networkCard.className = 'data-card';
        networkCard.innerHTML = `<h4><i class="fas fa-wifi"></i> Network Information</h4>`;
        
        if (this.collectedData.network && this.collectedData.network.ip) {
            networkCard.innerHTML += this.createDataItem('Public IP', this.collectedData.network.ip.public || 'Unknown');
            
            if (this.collectedData.network.ip.geolocation) {
                const geo = this.collectedData.network.ip.geolocation;
                const location = [];
                if (geo.city) location.push(geo.city);
                if (geo.country_name || geo.country) location.push(geo.country_name || geo.country);
                networkCard.innerHTML += this.createDataItem('Location', location.length ? location.join(', ') : 'Unknown');
            }
        }
        
        if (this.collectedData.connection) {
            const conn = this.collectedData.connection;
            if (typeof conn === 'object') {
                networkCard.innerHTML += this.createDataItem('Connection Type', 
                    this.collectedData.connection.connection?.effectiveType || 'Unknown');
            }
        }
        
        summaryGrid.appendChild(networkCard);
        
        // PRIVACY INFO
        const privacyCard = document.createElement('div');
        privacyCard.className = 'data-card';
        privacyCard.innerHTML = `<h4><i class="fas fa-shield-alt"></i> Privacy & Security</h4>`;
        
        if (this.insights && this.insights.privacyScore) {
            const privacy = this.insights.privacyScore;
            privacyCard.innerHTML += this.createDataItem('Privacy Score', `<span style="color:${privacy.color};">${privacy.score}/100 (${privacy.rating})</span>`);
        }
        
        if (this.insights && this.insights.fingerprint) {
            const fingerprint = this.insights.fingerprint;
            const color = fingerprint.score < 33 ? "#2ecc71" : fingerprint.score < 66 ? "#f39c12" : "#e74c3c";
            privacyCard.innerHTML += this.createDataItem('Fingerprint Uniqueness', 
                `<span style="color:${color};">${fingerprint.score}%</span>`);
        }
        
        summaryGrid.appendChild(privacyCard);
        
        parentElement.appendChild(summaryContainer);
    }

    addUserActivityToView(parentElement) {
        // Get user activity data
        const activityData = this.dataCollector.getUserActivityData();
        
        // Create activity container
        const activityContainer = document.createElement('div');
        activityContainer.className = 'activity-container';
        activityContainer.innerHTML = '<h3>Your Visit History</h3>';
        
        const activityGrid = document.createElement('div');
        activityGrid.className = 'data-grid';
        activityContainer.appendChild(activityGrid);
        
        // Visit stats card
        const visitStatsCard = document.createElement('div');
        visitStatsCard.className = 'data-card';
        visitStatsCard.innerHTML = `
            <h4><i class="fas fa-history"></i> Visit Statistics</h4>
            ${this.createDataItem('Total Visits', activityData.visitCount)}
        `;
        
        // Add last visit date if available
        if (activityData.lastVisit) {
            const lastVisitDate = new Date(activityData.lastVisit);
            const timeElapsed = this.getTimeElapsed(lastVisitDate);
            visitStatsCard.innerHTML += this.createDataItem(
                'Last Visit', 
                `${lastVisitDate.toLocaleDateString()} ${lastVisitDate.toLocaleTimeString()} (${timeElapsed})`
            );
        }
        
        // Add visit frequency if we have enough data
        if (activityData.visitDates && activityData.visitDates.length >= 2) {
            const frequency = this.calculateVisitFrequency(activityData.visitDates);
            visitStatsCard.innerHTML += this.createDataItem('Visit Frequency', frequency);
        }
        
        activityGrid.appendChild(visitStatsCard);
        
        // Visit chart card
        const visitChartCard = document.createElement('div');
        visitChartCard.className = 'data-card';
        visitChartCard.innerHTML = `
            <h4><i class="fas fa-chart-line"></i> Visit Timeline</h4>
            <canvas id="visit-chart" height="200"></canvas>
        `;
        activityGrid.appendChild(visitChartCard);
        
        // Section activity card
        const sectionCard = document.createElement('div');
        sectionCard.className = 'data-card';
        sectionCard.innerHTML = `
            <h4><i class="fas fa-chart-bar"></i> Most Viewed Sections</h4>
        `;
        
        // Check if we have section view data
        if (Object.keys(activityData.sectionsViewed).length > 0) {
            sectionCard.innerHTML += `<canvas id="sections-chart" height="200"></canvas>`;
        } else {
            sectionCard.innerHTML += `<p class="unavailable">No section view data available yet.</p>
                <p>As you navigate through different sections of the app, this chart will show which sections you view most frequently.</p>`;
        }
        
        activityGrid.appendChild(sectionCard);
        
        // Add to parent
        parentElement.appendChild(activityContainer);
        
        // Initialize charts after DOM is updated
        setTimeout(() => {
            // Create visit timeline chart
            if (activityData.visitDates && activityData.visitDates.length > 0) {
                const visitChartElement = document.getElementById('visit-chart');
                if (visitChartElement) {
                    this.createVisitChart(visitChartElement, activityData.visitDates);
                }
            }
            
            // Create sections chart
            if (Object.keys(activityData.sectionsViewed).length > 0) {
                const sectionsChartElement = document.getElementById('sections-chart');
                if (sectionsChartElement) {
                    this.createSectionsChart(sectionsChartElement, activityData.sectionsViewed);
                }
            }
        }, 0);
    }

    calculateVisitFrequency(visitDates) {
        if (visitDates.length < 2) return 'Not enough data';
        
        // Parse dates and sort chronologically
        const dates = visitDates.map(date => new Date(date)).sort((a, b) => a - b);
        
        // Calculate average time between visits
        let totalDiff = 0;
        for (let i = 1; i < dates.length; i++) {
            totalDiff += dates[i] - dates[i-1];
        }
        
        const avgTimeBetweenVisits = totalDiff / (dates.length - 1);
        const days = Math.floor(avgTimeBetweenVisits / (1000 * 60 * 60 * 24));
        const hours = Math.floor((avgTimeBetweenVisits % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
            return `Every ${days} day${days !== 1 ? 's' : ''} ${hours > 0 ? `and ${hours} hour${hours !== 1 ? 's' : ''}` : ''}`;
        } else if (hours > 0) {
            return `Every ${hours} hour${hours !== 1 ? 's' : ''}`;
        } else {
            return 'Multiple times per hour';
        }
    }

    getTimeElapsed(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else if (diffHrs > 0) {
            return `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} ago`;
        } else if (diffMins > 0) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    createVisitChart(canvas, visitDates) {
        // Convert dates to local date strings
        const dates = visitDates.map(date => new Date(date));
        
        // Format dates for display
        const labels = dates.map(date => {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        });
        
        // Create visit counts (all 1 since each entry is a single visit)
        const visitCounts = dates.map(() => 1);
        
        // Create chart
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Site Visits',
                    data: visitCounts,
                    fill: false,
                    borderColor: 'rgba(0, 198, 255, 1)',
                    backgroundColor: 'rgba(0, 198, 255, 0.5)',
                    tension: 0.1,
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return 'Site visited';
                            }
                        }
                    }
                }
            }
        });
    }

    createSectionsChart(canvas, sectionsViewed) {
        // Convert section IDs to readable names and sort by view count
        const sections = Object.entries(sectionsViewed).map(([id, count]) => ({
            id,
            name: this.getCategoryTitle(id) || id,
            count
        })).sort((a, b) => b.count - a.count);
        
        // Get labels and counts for chart
        const labels = sections.map(section => section.name);
        const counts = sections.map(section => section.count);
        
        // Create chart
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Views',
                    data: counts,
                    backgroundColor: 'rgba(138, 43, 226, 0.6)',
                    borderColor: 'rgba(138, 43, 226, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    getCategoryTitle(category) {
        const titles = {
            'network': 'Network & Server Data',
            'navigator': 'Browser & Environment',
            'screen': 'Screen & Display',
            'connection': 'Network Information',
            'geolocation': 'Geolocation',
            'sensors': 'Sensors & Battery',
            'fingerprinting': 'Browser Fingerprinting',
            'interaction': 'Input & Interaction',
            'media': 'Media Devices',
            'permissions': 'Permissions & Features'
        };
        
        return titles[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    updateDataDisplay() {
        if (!this.collectedData) return;
        
        // Update each section with its data
        // First, update basic data sections
        Object.entries(this.collectedData).forEach(([category, data]) => {
            // Fix: Look for sections with the proper -section suffix
            const section = document.getElementById(`${category}-section`);
            if (!section) {
                console.error(`Section not found: ${category}-section`);
                return;
            }
            
            const container = section.querySelector('.data-container');
            const description = section.querySelector('.section-description');
            
            if (description) {
                description.textContent = this.getCategoryDescription(category);
            }
            
            if (container) {
                container.innerHTML = '';
                this.renderCategoryData(container, data, category);
            } else {
                console.error(`Data container not found in section: ${category}-section`);
            }
        });

        // Update enhanced data sections
        if (this.enhancedData) {
            // Fonts
            this.updateSectionContent('enhanced-fonts', this.enhancedData.fonts, 
                'Detection of fonts installed on your system');
            
            // WebRTC leaks
            this.updateSectionContent('enhanced-webrtc', this.enhancedData.webrtc,
                'Testing for WebRTC leaks that could expose your local IP addresses');
                
            // Media codecs
            this.updateSectionContent('enhanced-codecs', this.enhancedData.codecs,
                'Supported media codecs and DRM capabilities');
                
            // Extended browser features
            this.updateSectionContent('enhanced-features', this.enhancedData.browserFeatures,
                'Advanced and experimental browser features');
                
            // Graphics details
            this.updateSectionContent('enhanced-graphics', this.enhancedData.graphics,
                'Detailed information about your graphics capabilities');
                
            // Security features
            this.updateSectionContent('enhanced-security', this.enhancedData.security,
                'Security features and settings');
        }
        
        // Update insights sections
        if (this.insights) {
            // ISS Distance
            this.updateSectionContent('insights-iss', this.insights.iss,
                'Your distance from the International Space Station');
                
            // Weather data
            this.updateSectionContent('insights-weather', this.insights.weather,
                'Current weather in your location based on geolocation');
                
            // Astronomy data
            this.updateSectionContent('insights-astronomy', this.insights.astronomy,
                'Sunrise, sunset, and other astronomical data for your location');
                
            // Privacy analysis
            this.updateSectionContent('insights-privacy', this.insights.privacyScore,
                'Analysis of your browser\'s privacy protections');
                
            // Fingerprint uniqueness
            this.updateSectionContent('insights-fingerprint', this.insights.fingerprint,
                'How unique and identifiable your browser fingerprint is');
                
            // Carbon footprint
            this.updateSectionContent('insights-carbon', this.insights.carbonFootprint,
                'Estimated carbon footprint of your web browsing');
        }
        
        // Update comprehensive data sections
        if (this.comprehensiveData) {
            this.updateSectionContent('comp-core', this.comprehensiveData.core, 
                'Detailed information about core web platform APIs');
                
            this.updateSectionContent('comp-hardware', this.comprehensiveData.hardware,
                'Hardware capabilities and device information');
                
            this.updateSectionContent('comp-graphics', this.comprehensiveData.graphics,
                'Graphics and media capabilities including WebGPU');
                
            this.updateSectionContent('comp-input', this.comprehensiveData.input,
                'Input methods and interaction capabilities');
                
            this.updateSectionContent('comp-storage', this.comprehensiveData.storage,
                'Storage APIs and filesystem access features');
                
            this.updateSectionContent('comp-network', this.comprehensiveData.networking,
                'Network connectivity and communication features');
                
            this.updateSectionContent('comp-security', this.comprehensiveData.security,
                'Security and privacy features of your browser');
                
            this.updateSectionContent('comp-experimental', this.comprehensiveData.experimental,
                'Experimental and emerging web platform features');
        }
    }

    getCategoryDescription(category) {
        const descriptions = {
            'intro': 'Welcome to Browser Data Explorer. Click "Collect All Data" to begin.',
            'network': 'Information about your network connection, IP address, and server interactions.',
            'navigator': 'Details from the browser environment, including system capabilities and settings.',
            'screen': 'Information about your screen, display properties, and preferences.',
            'connection': 'Details about your network connection quality and type.',
            'geolocation': 'Geographic location information (requires permission).',
            'sensors': 'Data from device sensors like battery, orientation, and motion.',
            'fingerprinting': 'Unique identifiers that can be generated from your browser.',
            'interaction': 'Capabilities related to user input and interaction methods.',
            'media': 'Information about connected media devices (requires permission).',
            'permissions': 'Current permission statuses and feature availability.',
            'enhanced-fonts': 'Detection of fonts installed on your system.',
            'enhanced-webrtc': 'Testing for WebRTC leaks that could expose your local IP addresses.',
            'enhanced-codecs': 'Supported media codecs and DRM capabilities.',
            'enhanced-features': 'Advanced and experimental browser features.',
            'enhanced-graphics': 'Detailed information about your graphics capabilities.',
            'enhanced-security': 'Security features and settings.',
            'insights-iss': 'Your distance from the International Space Station.',
            'insights-weather': 'Current weather in your location based on geolocation.',
            'insights-astronomy': 'Sunrise, sunset, and other astronomical data for your location.',
            'insights-privacy': 'Analysis of your browser\'s privacy protections.',
            'insights-fingerprint': 'How unique and identifiable your browser fingerprint is.',
            'insights-carbon': 'Estimated carbon footprint of your web browsing.',
            // Add comprehensive descriptions
            'comp-core': 'Core web platform APIs including JavaScript features, Web Components, and WebAssembly.',
            'comp-hardware': 'Hardware capabilities, sensors, and device information.',
            'comp-graphics': 'Graphics rendering capabilities including WebGL, WebGPU and media support.',
            'comp-input': 'Input methods, interaction capabilities, and device connectivity.',
            'comp-storage': 'Data storage capabilities and filesystem access.',
            'comp-network': 'Network connectivity and communication features.',
            'comp-security': 'Security and privacy features of your browser.',
            'comp-experimental': 'Experimental and emerging web platform features.'
        };
        
        return descriptions[category] || 'Information about your browser and system.';
    }

    updateSectionContent(sectionId, data, description) {
        // Fix: Look for sections with the proper -section suffix
        const section = document.getElementById(`${sectionId}-section`);
        if (!section) {
            console.error(`Section not found: ${sectionId}-section`);
            return;
        }
        
        const descriptionEl = section.querySelector('.section-description');
        const container = section.querySelector('.data-container');
        
        if (descriptionEl) {
            descriptionEl.textContent = description;
        }
        
        if (container) {
            container.innerHTML = '';
            this.renderEnhancedData(container, data, sectionId);
        } else {
            console.error(`Data container not found in section: ${sectionId}-section`);
        }
    }

    renderEnhancedData(container, data, sectionId) {
        if (!data) {
            container.innerHTML = '<p class="warning">No data available</p>';
            return;
        }
        
        if (data.error) {
            container.innerHTML = `<p class="warning">${data.error}</p>`;
            return;
        }
        
        // Add support for comprehensive data sections
        if (sectionId.startsWith('comp-')) {
            this.renderComprehensiveData(container, data, sectionId);
            return;
        }
        
        // Render based on section type
        if (sectionId === 'enhanced-fonts') {
            this.renderFontData(container, data);
        } else if (sectionId === 'enhanced-webrtc') {
            this.renderWebRTCData(container, data);
        } else if (sectionId === 'enhanced-codecs') {
            this.renderCodecData(container, data);
        } else if (sectionId === 'enhanced-features') {
            this.renderExtendedFeaturesData(container, data);
        } else if (sectionId === 'enhanced-graphics') {
            this.renderGraphicsData(container, data);
        } else if (sectionId === 'enhanced-security') {
            this.renderSecurityData(container, data);
        } else if (sectionId === 'insights-iss') {
            this.renderISSData(container, data);
        } else if (sectionId === 'insights-weather') {
            this.renderWeatherData(container, data);
        } else if (sectionId === 'insights-astronomy') {
            this.renderAstronomyData(container, data);
        } else if (sectionId === 'insights-privacy') {
            this.renderPrivacyScoreData(container, data);
        } else if (sectionId === 'insights-fingerprint') {
            this.renderFingerprintUniquenessData(container, data);
        } else if (sectionId === 'insights-carbon') {
            this.renderCarbonFootprintData(container, data);
        } else {
            // Default rendering for unknown sections
            container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }
    }

    renderComprehensiveData(container, data, sectionId) {
        if (!data) {
            container.innerHTML = '<p class="warning">No data available</p>';
            return;
        }
        
        let html = '';
        
        switch (sectionId) {
            case 'comp-core':
                html = this.renderComprehensiveCore(data);
                break;
            case 'comp-hardware':
                html = this.renderComprehensiveHardware(data);
                break;
            case 'comp-graphics':
                html = this.renderComprehensiveGraphics(data);
                break;
            case 'comp-input':
                html = this.renderComprehensiveInput(data);
                break;
            case 'comp-storage':
                html = this.renderComprehensiveStorage(data);
                break;
            case 'comp-network':
                html = this.renderComprehensiveNetwork(data);
                break;
            case 'comp-security':
                html = this.renderComprehensiveSecurity(data);
                break;
            case 'comp-experimental':
                html = this.renderComprehensiveExperimental(data);
                break;
            default:
                html = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }
        
        container.innerHTML = html;
    }

    renderComprehensiveCore(data) {
        let html = '<div class="data-grid">';
        
        // JavaScript features - add null checks 
        html += '<div class="data-card"><h4>JavaScript Features</h4>';
        if (data.js && typeof data.js === 'object') {
            Object.entries(data.js).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">JavaScript features data not available</p>';
        }
        html += '</div>';
        
        // Web Components
        html += '<div class="data-card"><h4>Web Components</h4>';
        if (data.webComponents && typeof data.webComponents === 'object') {
            Object.entries(data.webComponents).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Web Components data not available</p>';
        }
        html += '</div>';
        
        // WebAssembly
        html += '<div class="data-card"><h4>WebAssembly</h4>';
        if (data.webAssembly && typeof data.webAssembly === 'object') {
            Object.entries(data.webAssembly).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">WebAssembly data not available</p>';
        }
        html += '</div>';
        
        // Workers
        html += '<div class="data-card"><h4>Workers & Threading</h4>';
        if (data.workers && typeof data.workers === 'object') {
            for (const [key, value] of Object.entries(data.workers)) {
                if (typeof value === 'object') {
                    html += `<h5>${this.formatPropertyName(key)}</h5>`;
                    Object.entries(value).forEach(([subKey, subValue]) => {
                        html += this.createDataItem(this.formatPropertyName(subKey), this.formatBooleanOrValue(subValue));
                    });
                } else {
                    html += this.createDataItem(this.formatPropertyName(key), this.formatBooleanOrValue(value));
                }
            }
        } else {
            html += '<p class="unavailable">Workers data not available</p>';
        }
        html += '</div>';
        
        // DOM Features
        html += '<div class="data-card"><h4>DOM Features</h4>';
        if (data.dom && typeof data.dom === 'object') {
            Object.entries(data.dom).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            }); 
        } else {
            html += '<p class="unavailable">DOM features data not available</p>';
        }
        html += '</div>';
        
        html += '</div>'; // Close grid
        
        return html;
    }

    renderComprehensiveHardware(data) {
        let html = '<div class="data-grid">';
        
        // Device Info
        html += '<div class="data-card"><h4>Device Information</h4>';
        if (data.deviceInfo && typeof data.deviceInfo === 'object') {
            Object.entries(data.deviceInfo).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), value);
            }); 
        } else {
            html += '<p class="unavailable">Device information not available</p>';
        }
        html += '</div>';
        
        // ... Continue with similar null checks for other sections ...
        
        // Sensors
        html += '<div class="data-card"><h4>Sensors</h4>';
        if (data.sensors && typeof data.sensors === 'object') {
            Object.entries(data.sensors).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Sensors data not available</p>';
        }
        html += '</div>';
        
        // ... Rest of the function ...
        
        html += '</div>'; // Close grid
        return html;
    }

    renderComprehensiveGraphics(data) {
        let html = '<div class="data-grid">';
        
        // Graphics APIs
        html += '<div class="data-card"><h4>Graphics APIs</h4>';
        if (data.graphics && typeof data.graphics === 'object') {
            Object.entries(data.graphics).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Graphics APIs data not available</p>';
        }
        html += '</div>';
        
        // Image Formats
        html += '<div class="data-card"><h4>Image Format Support</h4>';
        if (data.images && typeof data.images === 'object') {
            Object.entries(data.images).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Image format support data not available</p>';
        }
        html += '</div>';
        
        // WebGPU details if available
        if (data.webgpuDetails) {
            html += '<div class="data-card"><h4>WebGPU Details</h4>';
            if (data.webgpuDetails.error) {
                html += `<p>${data.webgpuDetails.error}</p>`;
            } else {
                if (data.webgpuDetails.features) {
                    html += '<h5>Supported Features</h5>';
                    html += '<ul class="features-list">';
                    data.webgpuDetails.features.forEach(feature => {
                        html += `<li>${feature}</li>`;
                    });
                    html += '</ul>';
                }
                
                if (data.webgpuDetails.limits) {
                    html += '<h5>Hardware Limits</h5>';
                    Object.entries(data.webgpuDetails.limits).forEach(([name, value]) => {
                        html += this.createDataItem(this.formatPropertyName(name), value);
                    });
                }
            }
            html += '</div>';
        }
        
        html += '</div>'; // Close grid
        
        return html;
    }

    renderComprehensiveInput(data) {
        let html = '<div class="data-grid">';
        
        // Input Methods
        html += '<div class="data-card"><h4>Input Methods</h4>';
        if (data.input && typeof data.input === 'object') {
            Object.entries(data.input).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Input methods data not available</p>';
        }
        html += '</div>';
        
        // Interaction
        html += '<div class="data-card"><h4>Interaction Capabilities</h4>';
        if (data.interaction && typeof data.interaction === 'object') {
            Object.entries(data.interaction).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Interaction capabilities data not available</p>';
        }
        html += '</div>';
        
        // Permissions
        html += '<div class="data-card"><h4>Permission APIs</h4>';
        if (data.permissions && typeof data.permissions === 'object') {
            Object.entries(data.permissions).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Permission APIs data not available</p>';
        }
        html += '</div>';
        
        html += '</div>'; // Close grid
        
        return html;
    }

    renderComprehensiveStorage(data) {
        let html = '<div class="data-grid">';
        
        // Storage APIs
        html += '<div class="data-card"><h4>Storage APIs</h4>';
        if (data.storage && typeof data.storage === 'object') {
            Object.entries(data.storage).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Storage APIs data not available</p>';
        }
        html += '</div>';
        
        // Quotas
        html += '<div class="data-card"><h4>Storage Quotas</h4>';
        if (data.quotas && typeof data.quotas === 'object') {
            Object.entries(data.quotas).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Storage quotas data not available</p>';
        }
        
        // Add quota estimate if available
        if (data.quotaEstimate) {
            html += '<h5>Storage Estimate</h5>';
            if (data.quotaEstimate.error) {
                html += `<p>${data.quotaEstimate.error}</p>`;
            } else {
                Object.entries(data.quotaEstimate).forEach(([name, value]) => {
                    html += this.createDataItem(this.formatPropertyName(name), value);
                });
            }
        }
        html += '</div>';
        
        // File APIs
        html += '<div class="data-card"><h4>File System Access</h4>';
        if (data.files && typeof data.files === 'object') {
            Object.entries(data.files).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">File system access data not available</p>';
        }
        html += '</div>';
        
        html += '</div>'; // Close grid
        
        return html;
    }

    renderComprehensiveNetwork(data) {
        let html = '<div class="data-grid">';
        
        // Network Connectivity
        html += '<div class="data-card"><h4>Network Connectivity</h4>';
        if (data.connectivity && typeof data.connectivity === 'object') {
            Object.entries(data.connectivity).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Network connectivity data not available</p>';
        }
        html += '</div>';
        
        // Advanced Networking
        html += '<div class="data-card"><h4>Advanced Networking</h4>';
        if (data.advanced && typeof data.advanced === 'object') {
            Object.entries(data.advanced).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Advanced networking data not available</p>';
        }
        html += '</div>';
        
        // Background Tasks
        html += '<div class="data-card"><h4>Background Processing</h4>';
        if (data.background && typeof data.background === 'object') {
            Object.entries(data.background).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Background processing data not available</p>';
        }
        html += '</div>';
        
        // Streams
        html += '<div class="data-card"><h4>Streams API</h4>';
        if (data.streams && typeof data.streams === 'object') {
            Object.entries(data.streams).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Streams API data not available</p>';
        }
        html += '</div>';
        
        html += '</div>'; // Close grid
        
        return html;
    }

    renderComprehensiveSecurity(data) {
        let html = '<div class="data-grid">';
        
        // Security Features
        html += '<div class="data-card"><h4>Security Features</h4>';
        if (data.security && typeof data.security === 'object') {
            Object.entries(data.security).forEach(([name, value]) => {
                if (typeof value === 'object') {
                    html += `<h5>${this.formatPropertyName(name)}</h5>`;
                    Object.entries(value).forEach(([subName, subValue]) => {
                        html += this.createDataItem(this.formatPropertyName(subName), this.formatBooleanOrValue(subValue));
                    });
                } else {
                    html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
                }
            });
        } else {
            html += '<p class="unavailable">Security features data not available</p>';
        }
        html += '</div>';
        
        // Authentication
        html += '<div class="data-card"><h4>Authentication APIs</h4>';
        if (data.auth && typeof data.auth === 'object') {
            Object.entries(data.auth).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Authentication APIs data not available</p>';
        }
        html += '</div>';
        
        // Privacy Features
        html += '<div class="data-card"><h4>Privacy Features</h4>';
        if (data.privacy && typeof data.privacy === 'object') {
            Object.entries(data.privacy).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Privacy features data not available</p>';
        }
        html += '</div>';
        
        // Origin Information
        html += '<div class="data-card"><h4>Origin Information</h4>';
        if (data.origin && typeof data.origin === 'object') {
            Object.entries(data.origin).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), 
                    Array.isArray(value) ? value.join(', ') : value);
            });
        } else {
            html += '<p class="unavailable">Origin information data not available</p>';
        }
        html += '</div>';
        
        html += '</div>'; // Close grid
        
        return html;
    }

    renderComprehensiveExperimental(data) {
        let html = '<div class="data-grid">';
        
        // Emerging APIs
        html += '<div class="data-card"><h4>Emerging APIs</h4>';
        if (data.emerging && typeof data.emerging === 'object') {
            Object.entries(data.emerging).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Emerging APIs data not available</p>';
        }
        html += '</div>';
        
        // Proposed specs
        html += '<div class="data-card"><h4>Proposed Standards</h4>';
        if (data.proposals && typeof data.proposals === 'object') {
            Object.entries(data.proposals).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Proposed standards data not available</p>';
        }
        html += '</div>';
        
        // PWA - Fixed closing tag placement
        html += '<div class="data-card"><h4>Progressive Web App Features</h4>';
        if (data.pwa && typeof data.pwa === 'object') {
            Object.entries(data.pwa).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Progressive Web App features data not available</p>';
        }
        html += '</div>';
        
        // Foldable - Fixed closing tag placement
        html += '<div class="data-card"><h4>Foldable Device APIs</h4>';
        if (data.foldable && typeof data.foldable === 'object') {
            Object.entries(data.foldable).forEach(([name, value]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
            });
        } else {
            html += '<p class="unavailable">Foldable device APIs data not available</p>';
        }
        html += '</div>';
        
        html += '</div>'; // Close grid
        
        return html;
    }

    formatBooleanOrValue(value) {
        if (value === true) {
            return '<span class="success">Yes</span>';
        } else if (value === false) {
            return '<span class="unavailable">No</span>';
        }
        return value;
    }

    renderFontData(container, data) {
        let html = '<div class="data-card">';
        html += `<h4>Font Detection</h4>`;
        html += this.createDataItem('Detected Fonts', `${data.detectedCount} out of ${data.totalTested} common fonts`);
        
        if (data.sample && data.sample.length) {
            html += '<h5>Sample of Detected Fonts</h5>';
            html += '<div class="font-samples">';
            data.sample.forEach(font => {
                html += `<div class="font-sample" style="font-family: '${font}'">${font}</div>`;
            });
            html += '</div>';
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderWebRTCData(container, data) {
        let html = '<div class="data-card">';
        html += `<h4>WebRTC Leak Test</h4>`;
        html += this.createDataItem('WebRTC Supported', data.supported ? 'Yes' : 'No');
        
        if (data.supported) {
            if (data.leakDetected) {
                html += `<p class="warning">${data.message}</p>`;
                
                if (data.ips) {
                    if (data.ips.public) {
                        html += this.createDataItem('Public IP', data.ips.public);
                    }
                    
                    if (data.ips.local && data.ips.local.length) {
                        html += this.createDataItem('Local IPs', data.ips.local.join(', '));
                    }
                }
            } else {
                html += `<p class="success">No WebRTC leaks detected</p>`;
            }
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderCodecData(container, data) {
        let html = '<div class="data-grid">';
        
        // Video codecs
        html += '<div class="data-card"><h4>Video Codecs</h4>';
        if (data.video && data.video.length) {
            data.video.forEach(codec => {
                html += this.createDataItem(codec.name, codec.supported ? 
                    `<span class="success">${codec.status}</span>` : 
                    `<span class="unavailable">Not supported</span>`);
            });
        } else {
            html += '<p class="unavailable">Video codec information not available</p>';
        }
        html += '</div>';
        
        // Audio codecs
        html += '<div class="data-card"><h4>Audio Codecs</h4>';
        if (data.audio && data.audio.length) {
            data.audio.forEach(codec => {
                html += this.createDataItem(codec.name, codec.supported ? 
                    `<span class="success">${codec.status}</span>` : 
                    `<span class="unavailable">Not supported</span>`);
            });
        } else {
            html += '<p class="unavailable">Audio codec information not available</p>';
        }
        html += '</div>';
        
        // Media Source Extensions
        if (data.mediaSource) {
            html += '<div class="data-card"><h4>Media Source Extensions</h4>';
            html += this.createDataItem('MSE Support', data.mediaSource.supported ? 
                '<span class="success">Supported</span>' : 
                '<span class="unavailable">Not supported</span>');
                
            if (data.mediaSource.supported && data.mediaSource.codecs.length) {
                data.mediaSource.codecs.forEach(codec => {
                    html += this.createDataItem(codec.name, codec.supported ? 
                        '<span class="success">Supported</span>' : 
                        '<span class="unavailable">Not supported</span>');
                });
            }
            html += '</div>';
        }
        
        // DRM systems
        if (data.drm) {
            html += '<div class="data-card"><h4>DRM Systems</h4>';
            html += this.createDataItem('Widevine', this.formatDrmSupport(data.drm.widevine));
            html += this.createDataItem('PlayReady', this.formatDrmSupport(data.drm.playready));
            html += this.createDataItem('FairPlay', this.formatDrmSupport(data.drm.fairplay));
            html += this.createDataItem('ClearKey', this.formatDrmSupport(data.drm.clearkey));
            html += '</div>';
        }
        
        html += '</div>'; // Close grid
        container.innerHTML = html;
    }
    
    formatDrmSupport(support) {
        if (support === true) {
            return '<span class="success">Supported</span>';
        } else if (support === false) {
            return '<span class="unavailable">Not supported</span>';
        } else {
            return '<span class="unavailable">' + support + '</span>';
        }
    }

    renderExtendedFeaturesData(container, data) {
        let html = '<div class="data-grid">';
        
        // Progressive Web Apps
        if (data.pwa) {
            html += '<div class="data-card"><h4>Progressive Web App Features</h4>';
            html += this.createDataItem('Service Workers', this.formatBooleanSupport(data.pwa.serviceWorkerSupport));
            html += this.createDataItem('Web App Manifest', this.formatBooleanSupport(data.pwa.manifestSupport));
            html += this.createDataItem('Installable', this.formatBooleanSupport(data.pwa.installable));
            html += '</div>';
        }
        
        // Hardware APIs
        html += '<div class="data-card"><h4>Hardware APIs</h4>';
        if (data.bluetooth) {
            html += this.createDataItem('Web Bluetooth', this.formatBooleanSupport(data.bluetooth.available));
        }
        if (data.usb) {
            html += this.createDataItem('WebUSB', this.formatBooleanSupport(data.usb.available));
        }
        if (data.serial) {
            html += this.createDataItem('Web Serial', this.formatBooleanSupport(data.serial.available));
        }
        html += '</div>';
        
        // Sharing & Communication
        html += '<div class="data-card"><h4>Sharing & Communication</h4>';
        if (data.webShare) {
            html += this.createDataItem('Web Share API', this.formatBooleanSupport(data.webShare.available));
            html += this.createDataItem('Share Files', this.formatBooleanSupport(data.webShare.files));
        }
        if (data.webNFC) {
            html += this.createDataItem('Web NFC', this.formatBooleanSupport(data.webNFC.available));
        }
        html += '</div>';
        
        // Extended Reality
        if (data.webXR) {
            html += '<div class="data-card"><h4>Extended Reality</h4>';
            html += this.createDataItem('WebXR Device API', this.formatBooleanSupport(data.webXR.available));
            html += this.createDataItem('VR Support', data.webXR.vrSupport === true ? 
                '<span class="success">Supported</span>' : 
                '<span class="unavailable">Not supported</span>');
            html += this.createDataItem('AR Support', data.webXR.arSupport === true ? 
                '<span class="success">Supported</span>' : 
                '<span class="unavailable">Not supported</span>');
            html += '</div>';
        }
        
        // Other Emerging APIs
        html += '<div class="data-card"><h4>Other Emerging APIs</h4>';
        if (data.webAuthn) {
            html += this.createDataItem('WebAuthn', this.formatBooleanSupport(data.webAuthn.available));
        }
        if (data.speechRecognition) {
            html += this.createDataItem('Speech Recognition', this.formatBooleanSupport(data.speechRecognition.available));
        }
        if (data.speechSynthesis) {
            html += this.createDataItem('Speech Synthesis', this.formatBooleanSupport(data.speechSynthesis.available));
        }
        if (data.offscreenCanvas) {
            html += this.createDataItem('Offscreen Canvas', this.formatBooleanSupport(data.offscreenCanvas.available));
        }
        html += '</div>';
        
        html += '</div>'; // Close grid
        container.innerHTML = html;
    }
    
    formatBooleanSupport(value) {
        if (value === true) {
            return '<span class="success">Supported</span>';
        } else {
            return '<span class="unavailable">Not supported</span>';
        }
    }

    renderGraphicsData(container, data) {
        let html = '<div class="data-grid">';
        
        // WebGL info
        if (data.webgl) {
            html += '<div class="data-card"><h4>WebGL Information</h4>';
            if (data.webgl.available) {
                html += this.createDataItem('Version', data.webgl.version);
                html += this.createDataItem('Vendor', data.webgl.vendor);
                html += this.createDataItem('Renderer', data.webgl.renderer);
                
                if (data.webgl.unmaskedVendor) {
                    html += this.createDataItem('Unmasked Vendor', data.webgl.unmaskedVendor);
                    html += this.createDataItem('Unmasked Renderer', data.webgl.unmaskedRenderer);
                }
                
                html += this.createDataItem('Anti-aliasing', data.webgl.antialiasing ? 'Enabled' : 'Disabled');
                html += this.createDataItem('Max Texture Size', data.webgl.maxTextureSize);
                html += this.createDataItem('Extensions', data.webgl.extensionsCount);
            } else {
                html += '<p class="unavailable">WebGL not available</p>';
            }
            html += '</div>';
        }
        
        // Canvas 2D performance
        if (data.canvas2D) {
            html += '<div class="data-card"><h4>Canvas 2D Performance</h4>';
            if (!data.canvas2D.error) {
                html += this.createDataItem('Performance Score', data.canvas2D.performanceScore);
                html += this.createDataItem('Time per Operation', `${data.canvas2D.timePerOperation} ms`);
                html += this.createDataItem('Image Smoothing', data.canvas2D.imageSmoothing ? 'Supported' : 'Not supported');
            } else {
                html += `<p class="unavailable">${data.canvas2D.error}</p>`;
            }
            html += '</div>';
        }
        
        // Hardware acceleration
        if (data.hardwareAcceleration) {
            html += '<div class="data-card"><h4>Hardware Acceleration</h4>';
            if (!data.hardwareAcceleration.error) {
                html += this.createDataItem('Likely Accelerated', data.hardwareAcceleration.likely ? 
                    '<span class="success">Yes</span>' : '<span class="unavailable">No</span>');
                html += this.createDataItem('Certainty', data.hardwareAcceleration.certainty);
            } else {
                html += `<p class="unavailable">${data.hardwareAcceleration.error}</p>`;
            }
            html += '</div>';
        }
        
        // Color gamut
        if (data.colorGamut) {
            html += '<div class="data-card"><h4>Display Color Gamut</h4>';
            html += this.createDataItem('Highest Supported', data.colorGamut.highest.toUpperCase());
            html += `<p>${data.colorGamut.description}</p>`;
            html += '</div>';
        }
        
        html += '</div>'; // Close grid
        container.innerHTML = html;
    }

    renderSecurityData(container, data) {
        let html = '<div class="data-grid">';
        
        // HTTPS status
        html += '<div class="data-card"><h4>Connection Security</h4>';
        html += this.createDataItem('HTTPS', data.https ? 
            '<span class="success">Enabled</span>' : 
            '<span class="warning">Not enabled</span>');
            
        if (data.modernTLSFeatures) {
            html += `<p>${data.modernTLSFeatures.note}</p>`;
        }
        html += '</div>';
        
        // Content Security Policy
        if (data.contentSecurityPolicy) {
            html += '<div class="data-card"><h4>Content Security Policy</h4>';
            html += this.createDataItem('CSP Source', data.contentSecurityPolicy.source);
            
            if (data.contentSecurityPolicy.present === true) {
                html += this.createDataItem('Policy', data.contentSecurityPolicy.policy);
            } else {
                html += `<p>${data.contentSecurityPolicy.note}</p>`;
            }
            html += '</div>';
        }
        
        // Security headers
        if (data.securityHeaders) {
            html += '<div class="data-card"><h4>Security Headers</h4>';
            html += `<p>${data.securityHeaders.note}</p>`;
            
            if (data.securityHeaders.recommendations && data.securityHeaders.recommendations.length > 0) {
                html += '<h5>Recommended Headers:</h5>';
                html += '<ul class="features-list">';
                data.securityHeaders.recommendations.forEach(rec => {
                    html += `<li>${rec}</li>`;
                });
                html += '</ul>';
            }
            html += '</div>';
        }
        
        html += '</div>'; // Close grid
        container.innerHTML = html;
    }

    renderISSData(container, data) {
        let html = '<div class="data-card">';
        html += '<h4>International Space Station Location</h4>';
        
        if (data.error) {
            html += `<p class="unavailable">${data.error}</p>`;
        } else {
            html += this.createDataItem('ISS is currently at', 
                `Latitude: ${data.issPosition.latitude.toFixed(4)}, Longitude: ${data.issPosition.longitude.toFixed(4)}`);
            html += this.createDataItem('Distance from you', 
                `${data.distance.km.toLocaleString()} km (${data.distance.miles.toLocaleString()} miles)`);
            html += this.createDataItem('Timestamp', new Date(data.timestamp).toLocaleString());
            
            // Show a map with ISS location if we could embed it
            html += `<div class="map-container">
                <p>ISS is currently above ${this.getLocationDescription(data.issPosition.latitude, data.issPosition.longitude)}</p>
                <p>Note: ISS orbits the Earth at approximately 28,000 km/h and completes an orbit every 90 minutes.</p>
            </div>`;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    getLocationDescription(lat, lng) {
        // Simple description based on coordinates
        let ns = lat >= 0 ? "North" : "South";
        let ew = lng >= 0 ? "East" : "West";
        
        // Very rough region description
        let region = "";
        if (lat > 60) region = "the Arctic";
        else if (lat < -60) region = "Antarctica";
        else if (lat > 23 && lat < 66 && lng > -20 && lng < 60) region = "Europe/Africa";
        else if (lat > 10 && lat < 60 && lng > 60 && lng < 150) region = "Asia";
        else if (lat > -50 && lat < 10 && lng > 100 && lng < 180) region = "Australia/Pacific";
        else if (lat > 15 && lat < 70 && lng > -170 && lng < -50) region = "North America";
        else if (lat > -60 && lat < 15 && lng > -110 && lng < -35) region = "South America";
        else region = "the ocean";
        
        return `${Math.abs(lat).toFixed(1)}° ${ns}, ${Math.abs(lng).toFixed(1)}° ${ew} (${region})`;
    }

    renderWeatherData(container, data) {
        let html = '<div class="data-card">';
        html += '<h4>Local Weather</h4>';
        
        if (data.error) {
            html += `<p class="unavailable">${data.error}</p>`;
        } else {
            if (data.location) {
                html += this.createDataItem('Location', 
                    data.country ? `${data.location}, ${data.country}` : data.location);
            }
            
            if (data.temperature) {
                html += this.createDataItem('Temperature', 
                    `${data.temperature.celsius}°C / ${data.temperature.fahrenheit}°F`);
            }
            
            html += this.createDataItem('Conditions', data.conditions);
            html += this.createDataItem('Humidity', `${data.humidity}%`);
            html += this.createDataItem('Wind Speed', `${data.windSpeed} m/s`);
            
            if (data.note) {
                html += `<p class="note">${data.note}</p>`;
            }
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderAstronomyData(container, data) {
        let html = '<div class="data-card">';
        html += '<h4>Astronomy Data for Your Location</h4>';
        
        if (data.error) {
            html += `<p class="unavailable">${data.error}</p>`;
        } else {
            html += this.createDataItem('Sunrise', data.sunriseTime);
            html += this.createDataItem('Sunset', data.sunsetTime);
            html += this.createDataItem('Day Length', data.dayLength);
            html += this.createDataItem('Solar Noon', data.solarNoon);
            
            if (data.currentSolarPosition) {
                html += '<h5>Current Solar Position</h5>';
                html += this.createDataItem('Altitude', `${data.currentSolarPosition.altitude}°`);
                html += this.createDataItem('Azimuth', `${data.currentSolarPosition.azimuth}°`);
                html += `<p>${data.currentSolarPosition.description}</p>`;
            }
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderPrivacyScoreData(container, data) {
        let html = '<div class="data-card">';
        html += '<h4>Browser Privacy Analysis</h4>';
        
        html += `<div class="privacy-score-container" style="margin-bottom: 20px;">
            <div class="privacy-score" style="
                font-size: 36px; 
                font-weight: bold; 
                color: ${data.color}; 
                text-align: center;
                margin-bottom: 10px;">${data.score}/100</div>
            <div class="privacy-rating" style="
                text-align: center; 
                font-size: 24px; 
                color: ${data.color};">${data.rating}</div>
        </div>`;
        
        // Issues
        if (data.issues && data.issues.length > 0) {
            html += '<h5>Privacy Issues Detected</h5>';
            html += '<ul class="features-list">';
            data.issues.forEach(issue => {
                html += `<li>${issue}</li>`;
            });
            html += '</ul>';
        }
        
        // Recommendations
        if (data.recommendations && data.recommendations.length > 0) {
            html += '<h5>Recommendations</h5>';
            html += '<ul class="features-list">';
            data.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul>';
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderFingerprintUniquenessData(container, data) {
        let html = '<div class="data-card">';
        html += '<h4>Browser Fingerprint Uniqueness</h4>';
        
        // Score visualization
        const scoreColor = data.score < 33 ? "#2ecc71" : data.score < 66 ? "#f39c12" : "#e74c3c";
        html += `<div class="fingerprint-score-container" style="margin-bottom: 20px;">
            <div class="fingerprint-score" style="
                font-size: 36px; 
                font-weight: bold; 
                color: ${scoreColor}; 
                text-align: center;
                margin-bottom: 10px;
                cursor: pointer;
                position: relative;" 
                id="fingerprint-score-display"
                title="Click for fingerprint calculation details">${data.score}%</div>
            <div class="uniqueness-label" style="
                text-align: center; 
                font-size: 18px;">${data.score < 33 ? 'Low' : data.score < 66 ? 'Medium' : 'High'} Uniqueness</div>
        </div>`;
        
        // Add a hidden details section that will be shown on click
        html += `<div id="fingerprint-details" class="fingerprint-details hidden" style="
            background-color: rgba(13, 18, 30, 0.8);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            border: 1px solid var(--border-color);
        ">
            <h5>Fingerprint Calculation Details</h5>
            <p>Your browser fingerprint uniqueness score is calculated based on:</p>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li>Screen resolution and color depth</li>
                <li>Canvas rendering differences</li>
                <li>WebGL capabilities and renderer</li>
                <li>Installed fonts</li>
                <li>Browser plugins and extensions</li>
                <li>User agent and browser features</li>
                <li>Hardware capabilities</li>
            </ul>
            <p style="margin-top: 10px;">Higher scores mean your browser is more uniquely identifiable across the web.</p>
        </div>`;
        
        html += `<p style="margin-bottom: 15px;">${data.interpretation}</p>`;
        
        // Make the elements analyzed count clickable with explanation
        html += this.createDataItem('Fingerprinting Elements Analyzed', 
            `<span id="fingerprint-elements" class="clickable-info" 
             style="cursor: pointer; text-decoration: underline dotted; position: relative;"
             title="Click for details">${data.fingerprintingElements}</span>`);
        
        // Add a hidden tooltip for fingerprinting elements explanation
        html += `<div id="fingerprint-elements-details" class="fingerprint-details hidden" style="
            background-color: rgba(13, 18, 30, 0.8);
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0 15px;
            border: 1px solid var(--border-color);
        ">
            <h5>Fingerprinting Elements Analyzed (${data.fingerprintingElements})</h5>
            <p>These specific elements were analyzed to calculate your fingerprint uniqueness:</p>
            <ol style="margin-left: 20px; margin-top: 10px;">
                <li><strong>Screen Properties:</strong> Width, height, color depth, pixel ratio</li>
                <li><strong>Canvas Fingerprinting:</strong> Rendering differences, text metrics</li>
                <li><strong>WebGL Information:</strong> Renderer, vendor, supported extensions</li>
                <li><strong>Browser Details:</strong> User agent, platform, language preferences</li>
                <li><strong>Font Detection:</strong> System fonts available to the browser</li>
                <li><strong>Browser Plugins:</strong> Installed plugins and their properties</li>
                <li><strong>Hardware Information:</strong> CPU cores, memory, device orientation</li>
                <li><strong>Media Capabilities:</strong> Supported codecs and formats</li>
                <li><strong>Audio Processing:</strong> AudioContext fingerprinting</li>
                <li><strong>Time and Timezone:</strong> System time precision measurements</li>
            </ol>
            <p style="margin-top: 10px;">Each browser has a unique combination of these elements, creating a "fingerprint" that can be used to track you across websites.</p>
        </div>`;
        
        html += '</div>';
        container.innerHTML = html;
        
        // Add click event listeners after rendering
        setTimeout(() => {
            // Add listener for score display
            const scoreDisplay = document.getElementById('fingerprint-score-display');
            const detailsSection = document.getElementById('fingerprint-details');
            if (scoreDisplay && detailsSection) {
                scoreDisplay.addEventListener('click', () => {
                    detailsSection.classList.toggle('hidden');
                });
            }
            
            // Add listener for elements analyzed
            const elementsDisplay = document.getElementById('fingerprint-elements');
            const elementsDetails = document.getElementById('fingerprint-elements-details');
            if (elementsDisplay && elementsDetails) {
                elementsDisplay.addEventListener('click', () => {
                    elementsDetails.classList.toggle('hidden');
                });
            }
        }, 0);
    }

    renderCarbonFootprintData(container, data) {
        let html = '<div class="data-card">';
        html += '<h4>Estimated Carbon Footprint of Your Browsing</h4>';
        
        html += this.createDataItem('Per Hour', `${data.hourly} kg CO₂e`);
        html += this.createDataItem('Per Day (5 hours)', `${data.daily} kg CO₂e`);
        html += this.createDataItem('Per Year', `${data.yearly} kg CO₂e`);
        
        // Comparisons
        html += '<h5>Yearly Browsing Equivalent To</h5>';
        html += this.createDataItem('Driving a Car', `${data.comparisons.kmDriven} km`);
        html += this.createDataItem('Cups of Coffee', data.comparisons.coffeeEquivalent);
        
        html += `<p class="note">${data.note}</p>`;
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderCategoryData(container, data, category) {
        if (data.error) {
            container.innerHTML = `<p class="warning">${data.error}</p>`;
            return;
        }
        
        switch (category) {
            case 'network':
                this.renderNetworkData(container, data);
                break;
            case 'navigator':
                this.renderNavigatorData(container, data);
                break;
            case 'screen':
                this.renderScreenData(container, data);
                break;
            case 'connection':
                this.renderConnectionData(container, data);
                break;
            case 'geolocation':
                this.renderGeolocationData(container, data);
                break;
            case 'sensors':
                this.renderSensorsData(container, data);
                break;
            case 'fingerprinting':
                this.renderFingerprintingData(container, data);
                break;
            case 'interaction':
                this.renderInteractionData(container, data);
                break;
            case 'media':
                this.renderMediaData(container, data);
                break;
            case 'permissions':
                this.renderPermissionsData(container, data);
                break;
            default:
                container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }
    }

    renderNetworkData(container, data) {
        let html = '<div class="data-grid">';
        
        // IP & Geolocation
        html += '<div class="data-card"><h4>IP Address & Geolocation</h4>';
        html += this.createDataItem('Public IP', data.ip.public);
        
        if (data.ip.geolocation && !data.ip.geolocation.error) {
            const geo = data.ip.geolocation;
            html += this.createDataItem('Country', geo.country_name || geo.country);
            html += this.createDataItem('Region', geo.region || geo.region_name);
            html += this.createDataItem('City', geo.city);
            html += this.createDataItem('ZIP Code', geo.postal || geo.zip);
            html += this.createDataItem('ISP', geo.org || geo.asn);
            html += this.createDataItem('Timezone', geo.timezone || geo.time_zone);
        }
        html += '</div>';
        
        // HTTP Headers
        html += '<div class="data-card"><h4>HTTP Headers</h4>';
        if (data.headers && typeof data.headers === 'object') {
            Object.entries(data.headers).forEach(([name, value]) => {
                html += this.createDataItem(name, value);
            });
        } else {
            html += '<p class="unavailable">Header information not available</p>';
        }
        html += '</div>';
        
        // Cookies
        html += '<div class="data-card"><h4>Cookies</h4>';
        if (data.cookies && data.cookies !== 'No cookies available') {
            html += `<pre>${data.cookies}</pre>`;
        } else {
            html += `<p class="unavailable">No cookies detected. Example cookies would look like:</p>`;
            html += `<pre>visit_count=3; last_visit=2023-07-15T14:30:00; user_preferences=theme:dark</pre>`;
            html += `<p>Cookies can be used to track your visits, preferences, and login state.</p>`;
        }
        html += '</div>';
        
        html += '</div>'; // Close grid
        container.innerHTML = html;
    }

    renderNavigatorData(container, data) {
        let html = '<div class="data-grid">';
        
        // Basic navigator info
        html += '<div class="data-card"><h4>Browser & Environment</h4>';
        html += this.createDataItem('User Agent', data.userAgent);
        html += this.createDataItem('App Name', data.appName);
        html += this.createDataItem('Platform', data.platform);
        html += this.createDataItem('Vendor', data.vendor);
        html += this.createDataItem('Language', data.language);
        html += this.createDataItem('Languages', Array.isArray(data.languages) ? data.languages.join(', ') : data.languages);
        html += this.createDataItem('Do Not Track', data.doNotTrack || 'Not set');
        html += this.createDataItem('Cookies Enabled', data.cookieEnabled ? 'Yes' : 'No');
        html += '</div>';
        
        // Hardware info
        html += '<div class="data-card"><h4>Hardware Information</h4>';
        html += this.createDataItem('CPU Cores', data.hardwareConcurrency);
        html += this.createDataItem('Device Memory', data.deviceMemory);
        html += this.createDataItem('Local Storage', data.localStorageAvailable ? 'Available' : 'Not Available');
        html += this.createDataItem('Session Storage', data.sessionStorageAvailable ? 'Available' : 'Not Available');
        html += '</div>';
        
        // Window properties
        if (data.window) {
            html += '<div class="data-card"><h4>Window Properties</h4>';
            Object.entries(data.window).forEach(([prop, value]) => {
                html += this.createDataItem(this.formatPropertyName(prop), value);
            });
            html += '</div>';
        }
        
        // Performance data
        if (data.performance && typeof data.performance === 'object') {
            html += '<div class="data-card"><h4>Performance Data</h4>';
            if (typeof data.performance.memory === 'object') {
                Object.entries(data.performance.memory).forEach(([prop, value]) => {
                    html += this.createDataItem(this.formatPropertyName(prop), value);
                });
            } else {
                html += this.createDataItem('Memory Info', data.performance.memory);
            }

            if (data.performance.navigationStart) {
                html += this.createDataItem('Navigation Start', data.performance.navigationStart);
            }
            if (data.performance.loadEventEnd) {
                html += this.createDataItem('Load Event End', data.performance.loadEventEnd);
            }
            if (data.performance.domComplete) {
                html += this.createDataItem('DOM Complete', data.performance.domComplete);
            }
            if (data.performance.redirectCount) {
                html += this.createDataItem('Redirect Count', data.performance.redirectCount);
            }
            html += '</div>';
        }
        
        // Plugins
        if (data.plugins && data.plugins.length) {
            html += '<div class="data-card"><h4>Browser Plugins</h4>';
            data.plugins.forEach(plugin => {
                html += this.createDataItem(plugin.name, plugin.description);
            });
            html += '</div>';
        }

        html += '</div>'; // Close grid
        container.innerHTML = html;
    }

    renderScreenData(container, data) {
        let html = '<div class="data-grid">';
        
        // Screen properties
        html += '<div class="data-card"><h4>Screen Properties</h4>';
        if (data.screen) {
            html += this.createDataItem('Width', data.screen.width + 'px');
            html += this.createDataItem('Height', data.screen.height + 'px');
            html += this.createDataItem('Available Width', data.screen.availWidth + 'px');
            html += this.createDataItem('Available Height', data.screen.availHeight + 'px');
            html += this.createDataItem('Color Depth', data.screen.colorDepth + ' bits');
            html += this.createDataItem('Pixel Depth', data.screen.pixelDepth + ' bits');
            
            if (data.screen.orientation) {
                html += this.createDataItem('Orientation Type', data.screen.orientation.type);
                html += this.createDataItem('Orientation Angle', data.screen.orientation.angle + '°');
            }
        }
        html += '</div>';
        
        // Viewport
        if (data.viewport) {
            html += '<div class="data-card"><h4>Viewport</h4>';
            html += this.createDataItem('Width', data.viewport.width + 'px');
            html += this.createDataItem('Height', data.viewport.height + 'px');
            html += '</div>';
        }
        
        // Preferences
        if (data.preferences) {
            html += '<div class="data-card"><h4>User Preferences</h4>';
            html += this.createDataItem('Color Scheme', data.preferences.prefersColorScheme);
            html += this.createDataItem('Reduced Motion', data.preferences.prefersReducedMotion);
            html += this.createDataItem('Reduced Transparency', data.preferences.prefersReducedTransparency);
            html += this.createDataItem('Contrast', data.preferences.prefersContrast);
            html += this.createDataItem('Inverted Colors', data.preferences.invertedColors);
            html += '</div>';
        }
        
        html += '</div>'; // Close grid
        container.innerHTML = html;
    }

    renderConnectionData(container, data) {
        let html = '<div class="data-card">';
        html += '<h4>Network Connection</h4>';
        html += this.createDataItem('Online Status', data.online ? 'Online' : 'Offline');
        
        if (typeof data.connection === 'object') {
            html += this.createDataItem('Connection Type', data.connection.effectiveType);
            html += this.createDataItem('Downlink Speed', data.connection.downlink);
            html += this.createDataItem('Round Trip Time', data.connection.rtt);
            html += this.createDataItem('Save Data Mode', data.connection.saveData ? 'Enabled' : 'Disabled');
        } else {
            html += this.createDataItem('Connection Info', data.connection);
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderGeolocationData(container, data) {
        let html = '<div class="data-card">';
        html += '<h4>Geolocation Data</h4>';
        
        if (data.requiresUserGesture) {
            // Show button to request permission instead of just an error
            html += `<p class="permission-required">${data.message}</p>`;
            html += `<button id="request-geolocation" class="primary-button">
                <i class="fas fa-map-marker-alt"></i> Enable Geolocation
            </button>`;
            
            // Add event listener after rendering
            setTimeout(() => {
                const button = document.getElementById('request-geolocation');
                if (button) {
                    button.addEventListener('click', async () => {
                        button.disabled = true;
                        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Requesting...';
                        
                        try {
                            const geoData = await this.dataCollector.requestGeolocation();
                            this.renderGeolocationData(container, geoData);
                        } catch (error) {
                            button.disabled = false;
                            button.innerHTML = '<i class="fas fa-map-marker-alt"></i> Try Again';
                        }
                    });
                }
            }, 0);
        } else if (data.error) {
            html += `<p class="warning">${data.error}</p>`;
            if (data.errorMessage) {
                html += `<p class="permission-required">Reason: ${data.errorMessage}</p>`;
            }
        } else {
            html += this.createDataItem('Latitude', data.latitude);
            html += this.createDataItem('Longitude', data.longitude);
            html += this.createDataItem('Accuracy', data.accuracy);
            html += this.createDataItem('Altitude', data.altitude);
            html += this.createDataItem('Altitude Accuracy', data.altitudeAccuracy);
            html += this.createDataItem('Heading', data.heading);
            html += this.createDataItem('Speed', data.speed);
            html += this.createDataItem('Timestamp', data.timestamp);
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderSensorsData(container, data) {
        let html = '<div class="data-grid">';
        
        // Battery info
        html += '<div class="data-card"><h4>Battery Status</h4>';
        if (typeof data.battery === 'object' && !data.battery.error) {
            html += this.createDataItem('Charging', data.battery.charging ? 'Yes' : 'No');
            html += this.createDataItem('Battery Level', data.battery.level);
            html += this.createDataItem('Charging Time', data.battery.chargingTime);
            html += this.createDataItem('Discharging Time', data.battery.dischargingTime);
        } else {
            html += `<p class="unavailable">${data.battery.error || 'Battery status unavailable'}</p>`;
        }
        html += '</div>';
        
        // Device orientation
        html += '<div class="data-card"><h4>Device Orientation & Motion</h4>';
        html += this.createDataItem('Device Orientation', data.deviceOrientation || 'Not available');
        html += this.createDataItem('Device Motion', data.deviceMotion || 'Not available');
        html += '</div>';
        
        // Sensor availability
        if (data.sensorsAvailable) {
            html += '<div class="data-card"><h4>Sensors Availability</h4>';
            Object.entries(data.sensorsAvailable).forEach(([sensor, available]) => {
                html += this.createDataItem(this.formatPropertyName(sensor), available ? 'Available' : 'Not Available');
            });
            html += '</div>';
        }
        
        html += '</div>'; // Close grid
        container.innerHTML = html;
    }

    renderFingerprintingData(container, data) {
        let html = '<div class="data-grid">';
        
        // Canvas fingerprinting
        html += '<div class="data-card"><h4>Canvas Fingerprinting</h4>';
        if (typeof data.canvas === 'object' && !data.canvas.error) {
            html += this.createDataItem('Data URL Length', data.canvas.dataUrlLength);
            html += this.createDataItem('Hash', data.canvas.hash);
            html += this.createDataItem('Canvas Support', 'Available');
        } else {
            html += `<p class="unavailable">${data.canvas?.error || 'Canvas fingerprinting unavailable'}</p>`;
        }
        html += '</div>';
        
        // WebGL info
        html += '<div class="data-card"><h4>WebGL Information</h4>';
        if (typeof data.webGL === 'object' && !data.webGL.error) {
            html += this.createDataItem('Vendor', data.webGL.vendor);
            html += this.createDataItem('Renderer', data.webGL.renderer);
            html += this.createDataItem('Version', data.webGL.version);
            
            if (data.webGL.unmaskedVendor) {
                html += this.createDataItem('Unmasked Vendor', data.webGL.unmaskedVendor);
                html += this.createDataItem('Unmasked Renderer', data.webGL.unmaskedRenderer);
            }
            
            if (data.webGL.extensions && data.webGL.extensions.length) {
                html += this.createDataItem('Extensions', data.webGL.extensions.join(', '));
            }
        } else {
            html += `<p class="unavailable">${data.webGL.error || 'WebGL information unavailable'}</p>`;
        }
        html += '</div>';
        
        // Audio fingerprinting
        html += '<div class="data-card"><h4>Audio Fingerprinting</h4>';
        if (typeof data.audio === 'object' && !data.audio.error) {
            Object.entries(data.audio).forEach(([prop, value]) => {
                html += this.createDataItem(this.formatPropertyName(prop), value);
            });
        } else {
            html += `<p class="unavailable">${data.audio.error || 'Audio fingerprinting unavailable'}</p>`;
        }
        html += '</div>';
        
        html += '</div>'; // Close grid
        container.innerHTML = html;
    }

    renderInteractionData(container, data) {
        let html = '<div class="data-grid">';
        
        // Pointer capabilities
        if (data.pointer) {
            html += '<div class="data-card"><h4>Pointer & Touch Capabilities</h4>';
            html += this.createDataItem('Touch Points', data.pointer.maxTouchPoints);
            html += this.createDataItem('Pointer Events', data.pointer.pointerEnabled ? 'Supported' : 'Not Supported');
            html += this.createDataItem('Touch Events', data.pointer.touchEnabled ? 'Supported' : 'Not Supported');
            html += this.createDataItem('MS Pointer', data.pointer.msPointerEnabled ? 'Supported' : 'Not Supported');
            html += '</div>';
        }
        
        // Keyboard
        if (data.keyboard) {
            html += '<div class="data-card"><h4>Keyboard Information</h4>';
            html += this.createDataItem('Keyboard Layout Map', data.keyboard.keyboardLayoutMap ? 'Available' : 'Not Available');
            html += '</div>';
        }
        
        // Gamepad - Fix the error here
        if (data.gamepad) {
            html += '<div class="data-card"><h4>Gamepad API</h4>';
            html += this.createDataItem('Gamepad API', data.gamepad.available ? 'Available' : 'Not Available');
            if (data.gamepad.gamepads && data.gamepad.gamepads.length) {
                html += this.createDataItem('Connected Gamepads', data.gamepad.gamepads.join(', '));
            } else {
                html += this.createDataItem('Connected Gamepads', 'None detected');
            }
            html += '</div>';
        }
        
        // Clipboard
        if (data.clipboard) {
            html += '<div class="data-card"><h4>Clipboard Access</h4>';
            html += this.createDataItem('Clipboard API', data.clipboard.available ? 'Available' : 'Not Available');
            html += this.createDataItem('Read Permission', data.clipboard.readPermission);
            html += this.createDataItem('Write Permission', data.clipboard.writePermission);
            html += '</div>';
        }
        
        // Vibration
        if (data.vibration) {
            html += '<div class="data-card"><h4>Vibration API</h4>';
            html += this.createDataItem('Vibration API', data.vibration.available ? 'Available' : 'Not Available');
            html += '</div>';
        }
        
        html += '</div>'; // Close grid
        container.innerHTML = html;
    }

    renderMediaData(container, data) {
        let html = '<div class="data-grid">';
        
        // Video input
        html += '<div class="data-card"><h4>Video Input Devices</h4>';
        if (data.videoinput && data.videoinput.length) {
            data.videoinput.forEach(device => {
                html += this.createDataItem(device.label, device.deviceId);
            });
        } else {
            html += '<p class="unavailable">No video input devices found</p>';
        }
        html += '</div>';
        
        // Audio input
        html += '<div class="data-card"><h4>Audio Input Devices</h4>';
        if (data.audioinput && data.audioinput.length) {
            data.audioinput.forEach(device => {
                html += this.createDataItem(device.label, device.deviceId);
            });
        } else {
            html += '<p class="unavailable">No audio input devices found</p>';
        }
        html += '</div>';
        
        // Audio output
        html += '<div class="data-card"><h4>Audio Output Devices</h4>';
        if (data.audiooutput && data.audiooutput.length) {
            data.audiooutput.forEach(device => {
                html += this.createDataItem(device.label, device.deviceId);
            });
        } else {
            html += '<p class="unavailable">No audio output devices found</p>';
        }
        html += '</div>';
        
        html += '</div>'; // Close grid
        container.innerHTML = html;
    }

    renderPermissionsData(container, data) {
        let html = '<div class="data-grid">';
        
        // Permissions
        html += '<div class="data-card"><h4>Permissions</h4>';
        if (data.permissions && typeof data.permissions === 'object') {
            Object.entries(data.permissions).forEach(([name, status]) => {
                html += this.createDataItem(this.formatPropertyName(name), this.formatPermissionStatus(status));
            });
        } else {
            // Fallback example permissions if data is missing
            const examplePermissions = {
                'Geolocation': 'prompt',
                'Notifications': 'prompt', 
                'Camera': 'prompt',
                'Microphone': 'prompt',
                'Storage': 'granted'
            };
            
            html += '<p class="unavailable">Permissions API not fully supported. Example permissions:</p>';
            Object.entries(examplePermissions).forEach(([name, status]) => {
                html += this.createDataItem(name, this.formatPermissionStatus(status));
            });
        }
        html += '</div>';
        
        // Features
        html += '<div class="data-card"><h4>Features</h4>';
        if (data.features && typeof data.features === 'object') {
            Object.entries(data.features).forEach(([name, supported]) => {
                html += this.createDataItem(this.formatPropertyName(name), supported ? 'Supported' : 'Not Supported');
            });
        } else {
            // Fallback example features if data is missing
            const exampleFeatures = {
                'Service Worker': navigator.serviceWorker !== undefined,
                'Web Assembly': typeof WebAssembly === 'object',
                'WebRTC': 'RTCPeerConnection' in window,
                'Payment Request': 'PaymentRequest' in window,
                'IndexedDB': 'indexedDB' in window,
                'Web Workers': typeof Worker !== 'undefined'
            };
            
            html += '<p class="unavailable">Features API data not available. Detected features:</p>';
            Object.entries(exampleFeatures).forEach(([name, supported]) => {
                html += this.createDataItem(name, supported ? 'Supported' : 'Not Supported');
            });
        }
        html += '</div>';
        
        html += '</div>'; // Close grid
        container.innerHTML = html;
    }

    formatPermissionStatus(status) {
        if (status === 'granted') {
            return '<span class="success">Granted</span>';
        } else if (status === 'denied') {
            return '<span class="warning">Denied</span>';
        } else if (status === 'prompt') {
            return '<span>Not decided (will prompt)</span>';
        } else if (status.startsWith('Error:')) {
            return `<span class="warning">${status}</span>`;
        }
        return status;
    }

    formatPropertyName(name) {
        // Convert camelCase to Title Case with spaces
        return name
            .replace(/([A-Z])/g, ' $1') // Insert a space before all caps
            .replace(/^./, str => str.toUpperCase()); // Uppercase the first character
    }

    createDataItem(name, value) {
        const formattedValue = value === undefined || value === null ? 
            '<span class="unavailable">Not available</span>' : value;
        return `
            <div class="data-item">
                <span class="data-name">${name}:</span>
                <span class="data-value">${formattedValue}</span>
            </div>
        `;
    }

    setActiveSection(sectionId) {
        console.log(`Setting active section: ${sectionId}`);
        
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === sectionId);
        });
        
        // Show the corresponding section
        document.querySelectorAll('.data-section').forEach(section => {
            section.classList.toggle('hidden', section.id !== `${sectionId}-section`);
        });
        
        // Track this section view in cookies for analytics
        if (this.dataCollector && typeof this.dataCollector.trackSectionView === 'function') {
            this.dataCollector.trackSectionView(sectionId);
        }
        
        this.activeSectionId = sectionId;
    }

    exportData() {
        if (!this.collectedData) return;
        
        const allData = {
            basicData: this.collectedData,
            enhancedData: this.enhancedData || {},
            comprehensiveData: this.comprehensiveData || {},
            insights: this.insights || {}
        };
        
        const dataStr = JSON.stringify(allData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'browser-data.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Implement the summary section renderer properly
    renderSummarySection(container, data) {
        // Data overview - summary of all collected information
        const summaryHtml = `
            <div class="data-card">
                <h4>Your Browser Profile Overview</h4>
                <p>This is a summary of all data collected from your browser:</p>
                
                <div class="data-item">
                    <span class="data-name">Browser:</span>
                    <span class="data-value">${data.navigator?.vendor ? `${data.navigator.vendor} ${data.navigator.appName}` : data.navigator?.appName || 'Unknown'}</span>
                </div>
                
                <div class="data-item">
                    <span class="data-name">Operating System:</span>
                    <span class="data-value">${data.navigator?.platform || 'Unknown'}</span>
                </div>
                
                <div class="data-item">
                    <span class="data-name">Screen Resolution:</span>
                    <span class="data-value">${data.screen?.screen ? `${data.screen.screen.width}×${data.screen.screen.height}` : 'Unknown'}</span>
                </div>
                
                <div class="data-item">
                    <span class="data-name">Public IP Address:</span>
                    <span class="data-value">${data.network?.ip?.public || 'Unknown'}</span>
                </div>
                
                <div class="data-item">
                    <span class="data-name">Location:</span>
                    <span class="data-value">${data.network?.ip?.geolocation?.city ? 
                        `${data.network.ip.geolocation.city}, ${data.network.ip.geolocation.country_name || data.network.ip.geolocation.country || 'Unknown'}` : 
                        'Unknown'}</span>
                </div>
                
                <div class="data-item">
                    <span class="data-name">Connection Type:</span>
                    <span class="data-value">${data.connection?.connection?.effectiveType || 'Unknown'}</span>
                </div>
            </div>
            
            <div class="data-card">
                <h4>Key Statistics</h4>
                <div class="data-item">
                    <span class="data-name">Data Points Collected:</span>
                    <span class="data-value">${this._countDataPoints(data)} points across ${Object.keys(data).length} categories</span>
                </div>
                
                <div class="data-item">
                    <span class="data-name">Privacy Risk Level:</span>
                    <span class="data-value" style="color: ${this._getPrivacyColor(data)}">
                        ${this._getPrivacyLevel(data)}
                    </span>
                </div>
                
                <div class="data-item">
                    <span class="data-name">Device Type:</span>
                    <span class="data-value">${this._guessDeviceType(data)}</span>
                </div>
            </div>
        `;
        
        container.innerHTML = summaryHtml;
    }

    // Helper methods for summary section - add underscore prefix to indicate they're private methods
    _countDataPoints(data) {
        let count = 0;
        
        const countObject = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            
            Object.entries(obj).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    count++;
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        countObject(value);
                    }
                }
            });
        };
        
        countObject(data);
        return count;
    }

    _getPrivacyLevel(data) {
        // A simple heuristic based on available data
        let riskPoints = 0;
        
        // Check for precise geolocation
        if (data.geolocation && !data.geolocation.error && data.geolocation.latitude) {
            riskPoints += 3;
        }
        
        // Check for WebRTC leak potential
        if (data.fingerprinting?.webGL?.unmaskedVendor) {
            riskPoints += 2;
        }
        
        // Check for canvas fingerprinting
        if (data.fingerprinting?.canvas?.hash) {
            riskPoints += 2;
        }
        
        // Check for detailed system info
        if (data.navigator?.hardwareConcurrency && data.navigator?.deviceMemory) {
            riskPoints += 1;
        }
        
        // Check for media devices
        if (data.media?.videoinput?.length > 0 || data.media?.audioinput?.length > 0) {
            riskPoints += 2;
        }
        
        if (riskPoints >= 6) {
            return 'High';
        } else if (riskPoints >= 3) {
            return 'Medium';
        } else {
            return 'Low';
        }
    }

    _getPrivacyColor(data) {
        const level = this._getPrivacyLevel(data);
        if (level === 'High') return '#e74c3c';
        if (level === 'Medium') return '#f39c12';
        return '#2ecc71';
    }

    _guessDeviceType(data) {
        // Simple heuristic to guess device type
        const userAgent = data.navigator?.userAgent || '';
        const platform = data.navigator?.platform || '';
        const touch = data.interaction?.pointer?.maxTouchPoints > 0;
        const screenWidth = data.screen?.screen?.width || 0;
        
        if (/mobile|android|iphone|ipad|ipod/i.test(userAgent.toLowerCase())) {
            if (screenWidth >= 768) {
                return 'Tablet';
            }
            return 'Mobile Phone';
        } else if (/macintosh|mac os x/i.test(userAgent.toLowerCase())) {
            return 'Mac Computer';
        } else if (/windows|win32|win64/i.test(userAgent.toLowerCase())) {
            return 'Windows Computer';
        } else if (/linux/i.test(userAgent.toLowerCase()) || /linux/i.test(platform.toLowerCase())) {
            return 'Linux Computer';
        }
        
        return 'Desktop Computer';
    }
}

// Initialize UI controller when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, creating UI controller...');
    window.uiController = new UIController();
    console.log('UIController instance created in window.uiController');
});

// Add a fallback for older browsers
window.addEventListener('load', () => {
    console.log('Window loaded event fired');
    if (!window.uiController) {
        console.log('Creating UIController in load event as fallback');
        window.uiController = new UIController();
    }
});
