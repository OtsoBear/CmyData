class DataCollector {
    constructor() {
        this.collectedData = {};
        this.collectors = {
            'network': this.collectNetworkData.bind(this),
            'navigator': this.collectNavigatorData.bind(this),
            'screen': this.collectScreenData.bind(this),
            'connection': this.collectConnectionData.bind(this),
            'geolocation': this.collectGeolocationData.bind(this),
            'sensors': this.collectSensorsData.bind(this),
            'fingerprinting': this.collectFingerprintingData.bind(this),
            'interaction': this.collectInteractionData.bind(this),
            'media': this.collectMediaDevicesData.bind(this),
            'permissions': this.collectPermissionsData.bind(this)
        };
        
        // Set up user tracking cookies
        this.setupUserTrackingCookies();
        
        // Track this visit
        this.trackPageVisit();
    }

    async collectAllData() {
        let allData = {};
        
        for (const [category, collector] of Object.entries(this.collectors)) {
            allData[category] = await collector();
        }
        
        this.collectedData = allData;
        return allData;
    }

    async collectNetworkData() {
        const data = {
            ip: {
                public: 'Fetching...',
                geolocation: {}
            },
            headers: {},
            cookies: document.cookie || 'No cookies available'
        };

        // Fetch public IP and geolocation
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            data.ip.public = ipData.ip;

            // Get geolocation data
            const geoResponse = await fetch(`https://ipapi.co/${data.ip.public}/json/`);
            data.ip.geolocation = await geoResponse.json();
        } catch (error) {
            console.error('Error fetching IP data:', error);
            data.ip.public = 'Failed to fetch';
            data.ip.geolocation = { error: 'Failed to fetch geolocation data' };
        }

        // Get HTTP headers (we can only see what the server echoes back to us)
        try {
            const headersResponse = await fetch('https://httpbin.org/headers');
            const headersData = await headersResponse.json();
            data.headers = headersData.headers;
        } catch (error) {
            console.error('Error fetching headers:', error);
            data.headers = { error: 'Failed to fetch header data' };
        }

        return data;
    }

    collectNavigatorData() {
        const nav = window.navigator;
        
        // Get basic navigator properties
        const data = {
            userAgent: nav.userAgent,
            appName: nav.appName,
            appVersion: nav.appVersion,
            platform: nav.platform,
            vendor: nav.vendor,
            language: nav.language,
            languages: Array.from(nav.languages || []),
            onLine: nav.onLine,
            doNotTrack: nav.doNotTrack,
            cookieEnabled: nav.cookieEnabled,
            
            // Hardware info
            hardwareConcurrency: nav.hardwareConcurrency || 'Not available',
            deviceMemory: nav.deviceMemory ? `${nav.deviceMemory} GB` : 'Not available',
            
            // Storage
            localStorageAvailable: !!window.localStorage,
            sessionStorageAvailable: !!window.sessionStorage,
            
            // Plugins
            plugins: Array.from(nav.plugins || []).map(p => ({
                name: p.name,
                description: p.description,
                filename: p.filename
            }))
        };
        
        // Window properties
        data.window = {
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth,
            outerHeight: window.outerHeight,
            outerWidth: window.outerWidth,
            devicePixelRatio: window.devicePixelRatio,
            screenX: window.screenX,
            screenY: window.screenY,
            hasChrome: !!window.chrome,
            hasOpera: !!window.opera,
            documentMode: document.documentMode || 'Not IE'
        };
        
        // Performance data
        if (window.performance) {
            const perf = window.performance;
            data.performance = {
                navigationStart: perf.timing?.navigationStart || 'Not available',
                loadEventEnd: perf.timing?.loadEventEnd || 'Not available',
                domComplete: perf.timing?.domComplete || 'Not available',
                redirectCount: perf.navigation?.redirectCount || 'Not available'
            };
            
            if (perf.memory) {
                data.performance.memory = {
                    jsHeapSizeLimit: this._formatBytes(perf.memory.jsHeapSizeLimit),
                    totalJSHeapSize: this._formatBytes(perf.memory.totalJSHeapSize),
                    usedJSHeapSize: this._formatBytes(perf.memory.usedJSHeapSize)
                };
            } else {
                data.performance.memory = 'Not available';
            }
            
            // Get a selection of resources
            if (perf.getEntriesByType) {
                const resources = perf.getEntriesByType('resource');
                data.performance.resources = resources.slice(0, 5).map(r => ({
                    name: r.name.split('/').pop(),
                    duration: `${r.duration.toFixed(2)}ms`,
                    size: r.transferSize ? this._formatBytes(r.transferSize) : 'Unknown'
                }));
            }
        } else {
            data.performance = 'Performance API not available';
        }
        
        // Storage estimates
        if (nav.storage && nav.storage.estimate) {
            nav.storage.estimate().then(estimate => {
                data.storage = {
                    quota: this._formatBytes(estimate.quota),
                    usage: this._formatBytes(estimate.usage),
                    percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2) + '%'
                };
            }).catch(() => {
                data.storage = 'Storage estimation failed';
            });
        } else {
            data.storage = 'Storage API not available';
        }
        
        return data;
    }

    collectScreenData() {
        const data = {
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                orientation: {
                    type: screen.orientation ? screen.orientation.type : 'Not available',
                    angle: screen.orientation ? screen.orientation.angle : 'Not available'
                }
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        // Media queries for preferences
        data.preferences = {
            prefersColorScheme: this._testMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light',
            prefersReducedMotion: this._testMediaQuery('(prefers-reduced-motion: reduce)') ? 'reduced' : 'no-preference',
            prefersReducedTransparency: this._testMediaQuery('(prefers-reduced-transparency: reduce)') ? 'reduced' : 'no-preference',
            prefersContrast: this._testMediaQuery('(prefers-contrast: more)') ? 'more' : 
                             this._testMediaQuery('(prefers-contrast: less)') ? 'less' : 'no-preference',
            invertedColors: this._testMediaQuery('(inverted-colors: inverted)') ? 'inverted' : 'none'
        };
        
        return data;
    }

    collectConnectionData() {
        const data = {
            online: navigator.onLine,
            connection: 'Network Information API not available'
        };
        
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection) {
                data.connection = {
                    effectiveType: connection.effectiveType || 'Unknown',
                    downlink: connection.downlink ? `${connection.downlink} Mbps` : 'Unknown',
                    rtt: connection.rtt ? `${connection.rtt} ms` : 'Unknown',
                    saveData: connection.saveData || false
                };
            }
        }
        
        return data;
    }

    async collectGeolocationData() {
        if (!('geolocation' in navigator)) {
            return { error: 'Geolocation API not available' };
        }
        
        // Return a placeholder instead of automatically requesting position
        // This prevents the permission prompt from appearing without user interaction
        return {
            requiresUserGesture: true,
            error: 'Permission required',
            message: 'Geolocation requires user permission. Click to enable location access.',
            permissionStatus: 'not-requested'
        };
    }

    async requestGeolocation() {
        // This should be called in response to a user gesture
        if (!('geolocation' in navigator)) {
            return { error: 'Geolocation API not available' };
        }
        
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });
            
            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: `${position.coords.accuracy} meters`,
                altitude: position.coords.altitude ? `${position.coords.altitude} meters` : 'Not available',
                altitudeAccuracy: position.coords.altitudeAccuracy ? 
                    `${position.coords.altitudeAccuracy} meters` : 'Not available',
                heading: position.coords.heading || 'Not available',
                speed: position.coords.speed ? `${position.coords.speed} m/s` : 'Not available',
                timestamp: new Date(position.timestamp).toISOString()
            };
        } catch (error) {
            return {
                error: 'Geolocation permission denied or error',
                errorMessage: error.message,
                errorCode: error.code
            };
        }
    }

    async collectSensorsData() {
        const data = {};
        
        // Battery status
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                data.battery = {
                    charging: battery.charging,
                    level: `${(battery.level * 100).toFixed(2)}%`,
                    chargingTime: battery.chargingTime === Infinity ? 
                        'Not charging' : `${(battery.chargingTime / 60).toFixed(2)} minutes`,
                    dischargingTime: battery.dischargingTime === Infinity ? 
                        'Unknown' : `${(battery.dischargingTime / 60).toFixed(2)} minutes`
                };
            } catch (error) {
                data.battery = { error: 'Battery API error or not available' };
            }
        } else {
            data.battery = { error: 'Battery API not available' };
        }
        
        // Device orientation and motion
        data.deviceOrientation = 'Requires user interaction';
        data.deviceMotion = 'Requires user interaction';
        
        // We can't automatically access sensors in modern browsers
        // But we can indicate their availability
        data.sensorsAvailable = {
            deviceOrientation: 'ondeviceorientation' in window,
            deviceMotion: 'ondevicemotion' in window,
            accelerometer: typeof Accelerometer !== 'undefined',
            gyroscope: typeof Gyroscope !== 'undefined',
            linearAccelerationSensor: typeof LinearAccelerationSensor !== 'undefined',
            absoluteOrientationSensor: typeof AbsoluteOrientationSensor !== 'undefined',
            relativeOrientationSensor: typeof RelativeOrientationSensor !== 'undefined',
            ambientLightSensor: typeof AmbientLightSensor !== 'undefined'
        };
        
        return data;
    }

    collectFingerprintingData() {
        const data = {
            canvas: this._getCanvasFingerprint(),
            webGL: this._getWebGLInfo(),
            audio: this._getAudioFingerprint(),
            fonts: 'Font detection requires rendering tests'
        };
        
        return data;
    }

    collectInteractionData() {
        // Most interaction data requires actual user interaction
        // Here we just report capabilities
        return {
            pointer: {
                maxTouchPoints: navigator.maxTouchPoints,
                pointerEnabled: 'PointerEvent' in window,
                touchEnabled: 'ontouchstart' in window,
                msPointerEnabled: !!window.navigator.msPointerEnabled
            },
            keyboard: {
                keyboardLayoutMap: 'keyboard' in navigator && 'getLayoutMap' in navigator.keyboard
            },
            gamepad: {
                available: 'getGamepads' in navigator,
                gamepads: navigator.getGamepads ? 
                    Array.from(navigator.getGamepads()).filter(Boolean).map(g => g.id) : []
            },
            clipboard: {
                available: navigator.clipboard !== undefined,
                readPermission: 'clipboard-read',
                writePermission: 'clipboard-write'
            },
            vibration: {
                available: 'vibrate' in navigator
            }
        };
    }

    async collectMediaDevicesData() {
        if (!navigator.mediaDevices) {
            return { error: 'Media Devices API not available' };
        }
        
        try {
            // Let browser handle permissions natively
            const deviceInfo = {
                videoinput: [],
                audioinput: [],
                audiooutput: []
            };
            
            try {
                // Only enumerate devices that are already accessible or don't require permission
                const devices = await navigator.mediaDevices.enumerateDevices();
                devices.forEach(device => {
                    if (deviceInfo[device.kind]) {
                        deviceInfo[device.kind].push({
                            deviceId: device.deviceId.substring(0, 8) + '...',
                            label: device.label || 'Permission required for label'
                        });
                    }
                });
            } catch (e) {
                console.log("Could not enumerate devices", e);
            }
            
            // WebRTC capability
            deviceInfo.webrtcSupported = 'RTCPeerConnection' in window;
            
            return deviceInfo;
        } catch (error) {
            return {
                error: 'Media devices enumeration failed',
                errorMessage: error.message
            };
        }
    }

    async collectPermissionsData() {
        if (!navigator.permissions) {
            return { error: 'Permissions API not available' };
        }
        
        const permissions = [
            'geolocation',
            'notifications',
            'push',
            'microphone',
            'camera',
            'speaker',
            'device-info',
            'background-sync',
            'clipboard-read',
            'clipboard-write',
            'midi',
            'storage-access'
        ];
        
        const results = {};
        
        for (const permission of permissions) {
            try {
                const status = await navigator.permissions.query({ name: permission });
                results[permission] = status.state;
            } catch (error) {
                results[permission] = `Error: ${error.message}`;
            }
        }
        
        // Feature detection for various APIs
        results.features = {
            serviceWorker: 'serviceWorker' in navigator,
            webAssembly: typeof WebAssembly === 'object',
            webUSB: 'usb' in navigator,
            webBluetooth: 'bluetooth' in navigator,
            webShare: 'share' in navigator,
            credentials: 'credentials' in navigator,
            payment: 'payment' in window || 'PaymentRequest' in window,
            pushManager: 'PushManager' in window,
            indexedDB: 'indexedDB' in window,
            webWorkers: typeof Worker !== 'undefined',
            offlineAppCache: 'applicationCache' in window,
            webRTC: 'RTCPeerConnection' in window,
            webVR: 'getVRDisplays' in navigator || 'xr' in navigator,
            requestIdleCallback: 'requestIdleCallback' in window,
            backgroundFetch: 'BackgroundFetchManager' in window
        };
        
        return results;
    }

    // Helper methods
    _testMediaQuery(query) {
        return window.matchMedia(query).matches;
    }

    _formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        if (!bytes || isNaN(bytes)) return 'Unknown';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    _getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas'); // Create a new canvas instead of using the one from the DOM
            canvas.width = 220;
            canvas.height = 30;
            const ctx = canvas.getContext('2d');
            
            // Draw background
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw text
            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.font = '18px Arial';
            ctx.textBaseline = 'top';
            ctx.fillText('Canvas Fingerprint', 10, 5);
            
            // Add a colored shape
            ctx.fillStyle = 'rgb(255, 0, 255)';
            ctx.beginPath();
            ctx.arc(170, 15, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Get the data URL and hash it but don't store the full URL
            try {
                const dataURL = canvas.toDataURL();
                return {
                    dataUrlLength: dataURL.length,
                    hash: this._simpleHash(dataURL),
                    // Don't include the full dataURL at all to avoid issues
                    preview: null
                };
            } catch (urlError) {
                return {
                    dataUrlLength: 'Error getting data URL',
                    hash: 'Error',
                    preview: null
                };
            }
        } catch (error) {
            console.error('Canvas fingerprinting error:', error);
            return { error: 'Canvas fingerprinting failed: ' + error.message };
        }
    }

    _simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(16);
    }

    _getWebGLInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return { error: 'WebGL not supported' };
            }
            
            const info = {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                extensions: gl.getSupportedExtensions().slice(0, 5), // Just show first 5 to save space
                parameters: {}
            };
            
            // Try to get debug info extension
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                info.unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                info.unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
            
            // Get some standard parameters
            const parameters = [
                'MAX_TEXTURE_SIZE',
                'MAX_VIEWPORT_DIMS',
                'MAX_VERTEX_ATTRIBS',
                'MAX_VERTEX_UNIFORM_VECTORS',
                'MAX_FRAGMENT_UNIFORM_VECTORS'
            ];
            
            parameters.forEach(param => {
                info.parameters[param] = gl.getParameter(gl[param]);
            });
            
            return info;
        } catch (error) {
            return { error: 'WebGL fingerprinting failed' };
        }
    }

    _getAudioFingerprint() {
        try {
            if (!window.AudioContext && !window.webkitAudioContext) {
                return { error: 'AudioContext not supported' };
            }
            
            const context = new (window.AudioContext || window.webkitAudioContext)();
            
            return {
                sampleRate: context.sampleRate,
                state: context.state,
                baseLatency: context.baseLatency || 'Not available',
                outputLatency: context.outputLatency || 'Not available'
            };
        } catch (error) {
            return { error: 'Audio fingerprinting failed' };
        }
    }

    // Helper method to read cookies
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    setupUserTrackingCookies() {
        // Initialize cookies if they don't exist
        if (!this.getCookie('visit_count')) {
            document.cookie = `visit_count=0; max-age=31536000; path=/; SameSite=Strict`;
        }
        
        if (!this.getCookie('sections_viewed')) {
            document.cookie = `sections_viewed={}; max-age=31536000; path=/; SameSite=Strict`;
        }
        
        if (!this.getCookie('visit_dates')) {
            document.cookie = `visit_dates=[]; max-age=31536000; path=/; SameSite=Strict`;
        }
    }
    
    trackPageVisit() {
        // Increment visit count
        let visitCount = parseInt(this.getCookie('visit_count') || '0') + 1;
        const currentVisit = new Date().toISOString();
        
        // Get previous visits array
        let visitDates = [];
        try {
            visitDates = JSON.parse(this.getCookie('visit_dates') || '[]');
            // Limit to last 10 visits to keep cookie size reasonable
            if (visitDates.length > 9) {
                visitDates = visitDates.slice(-9);
            }
        } catch (e) {
            console.error('Error parsing visit_dates cookie:', e);
        }
        
        // Add current visit to the array
        visitDates.push(currentVisit);
        
        // Update cookies with 1-year expiration
        document.cookie = `visit_count=${visitCount}; max-age=31536000; path=/; SameSite=Strict`;
        document.cookie = `last_visit=${currentVisit}; max-age=31536000; path=/; SameSite=Strict`;
        document.cookie = `visit_dates=${JSON.stringify(visitDates)}; max-age=31536000; path=/; SameSite=Strict`;
    }
    
    trackSectionView(sectionId) {
        // Get sections viewed object
        let sectionsViewed = {};
        try {
            sectionsViewed = JSON.parse(this.getCookie('sections_viewed') || '{}');
        } catch (e) {
            console.error('Error parsing sections_viewed cookie:', e);
        }
        
        // Increment section view count
        sectionsViewed[sectionId] = (sectionsViewed[sectionId] || 0) + 1;
        
        // Update cookie
        document.cookie = `sections_viewed=${JSON.stringify(sectionsViewed)}; max-age=31536000; path=/; SameSite=Strict`;
        
        return sectionsViewed;
    }
    
    getUserActivityData() {
        const visitCount = parseInt(this.getCookie('visit_count') || '0');
        const lastVisit = this.getCookie('last_visit') || null;
        let visitDates = [];
        let sectionsViewed = {};
        
        try {
            visitDates = JSON.parse(this.getCookie('visit_dates') || '[]');
            sectionsViewed = JSON.parse(this.getCookie('sections_viewed') || '{}');
        } catch (e) {
            console.error('Error parsing activity cookies:', e);
        }
        
        return {
            visitCount,
            lastVisit,
            visitDates,
            sectionsViewed
        };
    }
}

// Create global instance
window.dataCollector = new DataCollector();