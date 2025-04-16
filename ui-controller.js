class UIController {
    constructor() {
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
    }

    initUI() {
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
        
        // Populate navigation
        const navList = document.getElementById('nav-list');
        Object.entries(categories).forEach(([id, title]) => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#' + id;
            link.textContent = title;
            link.dataset.section = id;
            if (id === this.activeSectionId) {
                link.classList.add('active');
            }
            li.appendChild(link);
            navList.appendChild(li);
            
            // Create section if it doesn't exist (except for intro which is already in the HTML)
            if (id !== 'intro') {
                this.createSection(id, title);
            }
        });
    }

    createSection(id, title) {
        const main = document.getElementById('content');
        const section = document.createElement('section');
        section.id = id;
        section.className = 'data-section';
        
        section.innerHTML = `
            <h2>${title}</h2>
            <p class="section-description">Loading data...</p>
            <div class="data-container"></div>
        `;
        
        main.appendChild(section);
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('nav-list').addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const sectionId = e.target.dataset.section;
                this.showSection(sectionId);
            }
        });
        
        // Collect all data button
        document.getElementById('collect-all-data').addEventListener('click', () => {
            this.collectAllData();
        });
        
        // Export data button
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });
        
        // Permission modal buttons
        document.getElementById('grant-permission').addEventListener('click', () => {
            const type = document.getElementById('permission-modal').dataset.permissionType;
            if (this.dataCollector.permissionCallbacks[type]) {
                this.dataCollector.permissionCallbacks[type].onGrant();
            }
            document.getElementById('permission-modal').classList.add('hidden');
        });
        
        document.getElementById('deny-permission').addEventListener('click', () => {
            const type = document.getElementById('permission-modal').dataset.permissionType;
            if (this.dataCollector.permissionCallbacks[type]) {
                this.dataCollector.permissionCallbacks[type].onDeny();
            }
            document.getElementById('permission-modal').classList.add('hidden');
        });
        
        // Listen for permission requests
        window.addEventListener('permission-request', (e) => {
            const modal = document.getElementById('permission-modal');
            modal.dataset.permissionType = e.detail.type;
            document.getElementById('permission-message').textContent = e.detail.message;
            modal.classList.remove('hidden');
        });
    }

    async collectAllData() {
        // Show loading indicator
        document.getElementById('loading-indicator').classList.remove('hidden');
        document.getElementById('collect-all-data').disabled = true;
        
        try {
            // Collect all types of data
            this.collectedData = await this.dataCollector.collectAllData();
            this.enhancedData = await this.enhancedDataCollector.collectEnhancedData();
            this.comprehensiveData = await this.comprehensiveCollector.collectAll();
            
            // Collect insights based on the collected data
            this.insights = await this.insightsCollector.collectAllInsights({
                ...this.collectedData,
                ...this.enhancedData
            });
            
            // Update UI with collected data
            this.updateDataDisplay();
            
            // Enable export button
            document.getElementById('export-data').disabled = false;
        } catch (error) {
            console.error('Error collecting data:', error);
            alert('Error collecting data: ' + error.message);
        } finally {
            // Hide loading indicator
            document.getElementById('loading-indicator').classList.add('hidden');
            document.getElementById('collect-all-data').disabled = false;
        }
    }

    updateDataDisplay() {
        if (!this.collectedData) return;
        
        // Update each section with its data
        // First, update basic data sections
        Object.entries(this.collectedData).forEach(([category, data]) => {
            const section = document.getElementById(category);
            if (!section) return;
            
            const container = section.querySelector('.data-container');
            const description = section.querySelector('.section-description');
            
            if (description) {
                description.textContent = this.getCategoryDescription(category);
            }
            
            if (container) {
                container.innerHTML = '';
                this.renderCategoryData(container, data, category);
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
                'Experimental and cutting-edge web platform features');
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
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const descriptionEl = section.querySelector('.section-description');
        const container = section.querySelector('.data-container');
        
        if (descriptionEl) {
            descriptionEl.textContent = description;
        }
        
        if (container) {
            container.innerHTML = '';
            this.renderEnhancedData(container, data, sectionId);
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
        
        // JavaScript features
        html += '<div class="data-card"><h4>JavaScript Features</h4>';
        Object.entries(data.js).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Web Components
        html += '<div class="data-card"><h4>Web Components</h4>';
        Object.entries(data.webComponents).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // WebAssembly
        html += '<div class="data-card"><h4>WebAssembly</h4>';
        Object.entries(data.webAssembly).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Workers
        html += '<div class="data-card"><h4>Workers & Threading</h4>';
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
        html += '</div>';
        
        // DOM Features
        html += '<div class="data-card"><h4>DOM Features</h4>';
        Object.entries(data.dom).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        html += '</div>'; // Close grid
        
        return html;
    }

    renderComprehensiveHardware(data) {
        let html = '<div class="data-grid">';
        
        // Device Info
        html += '<div class="data-card"><h4>Device Information</h4>';
        Object.entries(data.deviceInfo).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), value);
        });
        html += '</div>';
        
        // Sensors
        html += '<div class="data-card"><h4>Sensors</h4>';
        Object.entries(data.sensors).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Hardware Interfaces
        html += '<div class="data-card"><h4>Hardware Interfaces</h4>';
        Object.entries(data.hardware).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Display
        html += '<div class="data-card"><h4>Display Properties</h4>';
        Object.entries(data.display).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), value);
        });
        html += '</div>';
        
        html += '</div>'; // Close grid
        
        return html;
    }

    renderComprehensiveGraphics(data) {
        let html = '<div class="data-grid">';
        
        // Graphics APIs
        html += '<div class="data-card"><h4>Graphics APIs</h4>';
        Object.entries(data.graphics).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Image Formats
        html += '<div class="data-card"><h4>Image Format Support</h4>';
        Object.entries(data.images).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
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
        Object.entries(data.input).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Interaction
        html += '<div class="data-card"><h4>Interaction Capabilities</h4>';
        Object.entries(data.interaction).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Permissions
        html += '<div class="data-card"><h4>Permission APIs</h4>';
        Object.entries(data.permissions).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        html += '</div>'; // Close grid
        
        return html;
    }

    renderComprehensiveStorage(data) {
        let html = '<div class="data-grid">';
        
        // Storage APIs
        html += '<div class="data-card"><h4>Storage APIs</h4>';
        Object.entries(data.storage).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Quotas
        html += '<div class="data-card"><h4>Storage Quotas</h4>';
        Object.entries(data.quotas).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        
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
        Object.entries(data.files).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        html += '</div>'; // Close grid
        
        return html;
    }

    renderComprehensiveNetwork(data) {
        let html = '<div class="data-grid">';
        
        // Network Connectivity
        html += '<div class="data-card"><h4>Network Connectivity</h4>';
        Object.entries(data.connectivity).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Advanced Networking
        html += '<div class="data-card"><h4>Advanced Networking</h4>';
        Object.entries(data.advanced).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Background Tasks
        html += '<div class="data-card"><h4>Background Processing</h4>';
        Object.entries(data.background).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Streams
        html += '<div class="data-card"><h4>Streams API</h4>';
        Object.entries(data.streams).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        html += '</div>'; // Close grid
        
        return html;
    }

    renderComprehensiveSecurity(data) {
        let html = '<div class="data-grid">';
        
        // Security Features
        html += '<div class="data-card"><h4>Security Features</h4>';
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
        html += '</div>';
        
        // Authentication
        html += '<div class="data-card"><h4>Authentication APIs</h4>';
        Object.entries(data.auth).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Privacy Features
        html += '<div class="data-card"><h4>Privacy Features</h4>';
        Object.entries(data.privacy).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Origin Information
        html += '<div class="data-card"><h4>Origin Information</h4>';
        Object.entries(data.origin).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), 
                Array.isArray(value) ? value.join(', ') : value);
        });
        html += '</div>';
        
        html += '</div>'; // Close grid
        
        return html;
    }

    renderComprehensiveExperimental(data) {
        let html = '<div class="data-grid">';
        
        // Emerging APIs
        html += '<div class="data-card"><h4>Emerging APIs</h4>';
        Object.entries(data.emerging).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Proposed specs
        html += '<div class="data-card"><h4>Proposed Standards</h4>';
        Object.entries(data.proposals).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // PWA
        html += '<div class="data-card"><h4>Progressive Web App Features</h4>';
        Object.entries(data.pwa).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
        html += '</div>';
        
        // Foldable
        html += '<div class="data-card"><h4>Foldable Device APIs</h4>';
        Object.entries(data.foldable).forEach(([name, value]) => {
            html += this.createDataItem(this.formatPropertyName(name), this.formatBooleanOrValue(value));
        });
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
                margin-bottom: 10px;">${data.score}%</div>
            <div class="uniqueness-label" style="
                text-align: center; 
                font-size: 18px;">${data.score < 33 ? 'Low' : data.score < 66 ? 'Medium' : 'High'} Uniqueness</div>
        </div>`;
        
        html += `<p style="margin-bottom: 15px;">${data.interpretation}</p>`;
        
        html += this.createDataItem('Fingerprinting Elements Analyzed', data.fingerprintingElements);
        
        html += '</div>';
        container.innerHTML = html;
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
        html += `<pre>${data.cookies}</pre>`;
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
        
        if (data.error) {
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
            html += `<div class="data-item"><span>Preview:</span></div>`;
            html += `<div><img src="${data.canvas.preview}" alt="Canvas Fingerprint" width="150"></div>`;
        } else {
            html += `<p class="unavailable">${data.canvas.error || 'Canvas fingerprinting unavailable'}</p>`;
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
        
        // Gamepad
        if (data.gamepad) {
            html += '<div class="data-card"><h4>Gamepad API</h4>';
            html += this.createDataItem('Gamepad API', data.gamepad.available ? 'Available' : 'Not Available');
            if (data.gamepad.gamepads && data.gamepad.gamepads.length) {
                html += this.createDataItem('Connected Gamepads', data.gamepad.gamepads.join(', '));
            } else {
                html += this.createDataItem('Connected Gamepads', 'None');
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
        let html = '<div class="data-card">';
        html += '<h4>Media Devices</h4>';
        
        if (data.error) {
            html += `<p class="warning">${data.error}</p>`;
            if (data.errorMessage) {
                html += `<p class="permission-required">Reason: ${data.errorMessage}</p>`;
            }
        } else {
            // Video inputs (cameras)
            html += '<h5>Video Input Devices</h5>';
            if (data.videoinput && data.videoinput.length) {
                data.videoinput.forEach(device => {
                    html += this.createDataItem(device.label || 'Camera', device.deviceId);
                });
            } else {
                html += '<p class="unavailable">No video input devices detected</p>';
            }
            
            // Audio inputs (microphones)
            html += '<h5>Audio Input Devices</h5>';
            if (data.audioinput && data.audioinput.length) {
                data.audioinput.forEach(device => {
                    html += this.createDataItem(device.label || 'Microphone', device.deviceId);
                });
            } else {
                html += '<p class="unavailable">No audio input devices detected</p>';
            }
            
            // Audio outputs (speakers, headphones)
            html += '<h5>Audio Output Devices</h5>';
            if (data.audiooutput && data.audiooutput.length) {
                data.audiooutput.forEach(device => {
                    html += this.createDataItem(device.label || 'Speaker', device.deviceId);
                });
            } else {
                html += '<p class="unavailable">No audio output devices detected</p>';
            }
            
            // WebRTC support
            html += this.createDataItem('WebRTC Support', data.webrtcSupported ? 'Supported' : 'Not Supported');
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    renderPermissionsData(container, data) {
        let html = '<div class="data-grid">';
        
        // Permissions status
        html += '<div class="data-card"><h4>Permission Statuses</h4>';
        if (data.error) {
            html += `<p class="warning">${data.error}</p>`;
        } else {
            // Filter out the features object to show only permissions
            Object.entries(data).forEach(([permission, status]) => {
                if (permission !== 'features' && permission !== 'error') {
                    html += this.createDataItem(this.formatPropertyName(permission), this.formatPermissionStatus(status));
                }
            });
        }
        html += '</div>';
        
        // Feature detection
        if (data.features) {
            html += '<div class="data-card"><h4>Browser Feature Support</h4>';
            Object.entries(data.features).forEach(([feature, supported]) => {
                html += this.createDataItem(
                    this.formatPropertyName(feature), 
                    supported ? '<span class="success">Supported</span>' : '<span class="unavailable">Not Supported</span>'
                );
            });
            html += '</div>';
        }
        
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

    showSection(sectionId) {
        // Update active class in nav
        document.querySelectorAll('#nav-list a').forEach(el => {
            el.classList.toggle('active', el.dataset.section === sectionId);
        });
        
        // Update active section
        document.querySelectorAll('.data-section').forEach(el => {
            el.classList.toggle('active', el.id === sectionId);
        });
        
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
}

// Initialize UI controller when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uiController = new UIController();
});
