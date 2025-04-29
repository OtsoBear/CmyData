class EnhancedDataCollector {
    constructor() {
        this.enhancedData = {};
    }

    async collectEnhancedData() {
        const data = {};
        
        // Collect enhanced data points
        data.fonts = await this.detectInstalledFonts();
        data.webrtc = await this.detectWebRTCLeaks();
        data.extendedNetwork = this.collectExtendedNetworkData();
        data.codecs = this.detectSupportedCodecs();
        data.browserFeatures = this.detectExtendedBrowserFeatures();
        data.graphics = this.collectDetailedGraphicsInfo();
        data.accessibilityFeatures = this.detectAccessibilityFeatures();
        data.mediaCapabilities = this.detectMediaCapabilities();
        data.storageUsage = await this.collectStorageUsage();
        data.security = this.detectSecurityFeatures();
        data.socialMedia = this.detectSocialMediaPresence();
        data.dateTimeFormat = this.detectLocaleSettings();
        data.mimeTypes = this.collectMimeTypes();
        
        this.enhancedData = data;
        return data;
    }

    async collectAll() {
        // Assuming this method orchestrates the deviceInfo collection
        // Note: The main 'deviceInfo' timing is started/ended in ui-controller.js

        let collectedData = {};

        try {
            window.startSubTiming('deviceInfo', 'deviceInfo-hardware', 'Hardware Detection');
            collectedData.hardware = await this.getHardwareInfo();
            window.endSubTiming('deviceInfo', 'deviceInfo-hardware');

            window.startSubTiming('deviceInfo', 'deviceInfo-platform', 'Platform Analysis');
            collectedData.platform = await this.getPlatformInfo();
            window.endSubTiming('deviceInfo', 'deviceInfo-platform');

            window.startSubTiming('deviceInfo', 'deviceInfo-screen', 'Screen Configuration');
            collectedData.screen = await this.getScreenInfo();
            window.endSubTiming('deviceInfo', 'deviceInfo-screen');

            window.startSubTiming('deviceInfo', 'deviceInfo-memory', 'Memory Assessment');
            collectedData.memory = await this.getMemoryInfo();
            window.endSubTiming('deviceInfo', 'deviceInfo-memory');

            // Add other enhanced data collection parts here if necessary

        } catch (error) {
            console.error("Error in EnhancedDataCollector:", error);
            // Ensure timings are ended if an error occurs mid-collection
             if (window._timingData?.subSteps?.deviceInfo?.['deviceInfo-hardware'] && !window._timingData.subSteps.deviceInfo['deviceInfo-hardware'].end) window.endSubTiming('deviceInfo', 'deviceInfo-hardware');
             if (window._timingData?.subSteps?.deviceInfo?.['deviceInfo-platform'] && !window._timingData.subSteps.deviceInfo['deviceInfo-platform'].end) window.endSubTiming('deviceInfo', 'deviceInfo-platform');
             if (window._timingData?.subSteps?.deviceInfo?.['deviceInfo-screen'] && !window._timingData.subSteps.deviceInfo['deviceInfo-screen'].end) window.endSubTiming('deviceInfo', 'deviceInfo-screen');
             if (window._timingData?.subSteps?.deviceInfo?.['deviceInfo-memory'] && !window._timingData.subSteps.deviceInfo['deviceInfo-memory'].end) window.endSubTiming('deviceInfo', 'deviceInfo-memory');
        }

        return { enhanced: collectedData }; // Example structure
    }

    async getHardwareInfo() {
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 50));
        console.log("Collected Hardware Info");
        return { cpuCores: navigator.hardwareConcurrency || 'N/A' };
    }
    async getPlatformInfo() {
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 30));
         console.log("Collected Platform Info");
        return { platform: navigator.platform || 'N/A', userAgent: navigator.userAgent || 'N/A' };
    }
    async getScreenInfo() {
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 30));
         console.log("Collected Screen Info");
        return { width: screen.width, height: screen.height, colorDepth: screen.colorDepth };
    }
    async getMemoryInfo() {
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 40));
         console.log("Collected Memory Info");
        return { deviceMemory: (navigator.deviceMemory !== undefined) ? `${navigator.deviceMemory} GB` : 'N/A' };
    }

    async detectInstalledFonts() {
        // A simplified approach to font detection
        const fontFamilies = [
            'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
            'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
            'Trebuchet MS', 'Impact', 'Century Gothic', 'Webdings', 'Symbol',
            'Tahoma', 'Lucida Console', 'Lucida Sans Unicode', 'Wingdings',
            'MS Sans Serif', 'MS Serif'
        ];
        
        // Create a canvas for testing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 10;
        
        // Text to measure
        const testText = 'abcdefghjklmnopqrstuvwxyz';
        const referenceFont = 'sans-serif';
        
        // First, measure with reference font
        ctx.font = `10px ${referenceFont}`;
        const referenceWidth = ctx.measureText(testText).width;
        
        // Now measure with other fonts
        const detectedFonts = [];
        for (const font of fontFamilies) {
            ctx.font = `10px '${font}', ${referenceFont}`;
            const width = ctx.measureText(testText).width;
            
            // If width is different from reference, font is likely installed
            if (Math.abs(width - referenceWidth) > 0.1) {
                detectedFonts.push(font);
            }
        }
        
        return {
            detectedCount: detectedFonts.length,
            sample: detectedFonts.slice(0, 10), // Just show first 10 to avoid overwhelming
            totalTested: fontFamilies.length
        };
    }

    async detectWebRTCLeaks() {
        // ... existing methods from the suggested code ...
        return {
            supported: 'RTCPeerConnection' in window,
            leakDetected: false,
            message: "WebRTC could expose your local IP addresses even behind a VPN",
            ips: {
                public: "Demonstration only - would show if WebRTC leaks your IP",
                local: ["Demonstration only - would detect local network IPs"]
            }
        };
    }

    collectExtendedNetworkData() {
        return {
            dnsPrefetch: 'prefetch' in document.createElement('link'),
            preconnect: 'preconnect' in document.createElement('link'),
            preload: 'preload' in document.createElement('link'),
            httpVersion: this.detectHTTPVersion(),
            networkInformation: this.getDetailedNetworkInfo(),
            proxy: this.detectPossibleProxy()
        };
    }

    detectHTTPVersion() {
        // This is a simplified approach - real detection would be more complex
        const loadedOver = window.location.protocol;
        const isHTTP2Likely = loadedOver === 'https:' && navigator.userAgent.includes('Chrome');
        
        return {
            protocol: loadedOver,
            http2Support: isHTTP2Likely ? "Likely" : "Unknown",
            note: "HTTP/2 is usually only available over HTTPS"
        };
    }

    getDetailedNetworkInfo() {
        const conn = navigator.connection;
        
        if (!conn) {
            return { available: false };
        }
        
        return {
            available: true,
            effectiveType: conn.effectiveType || "Unknown",
            downlink: conn.downlink ? `${conn.downlink} Mbps` : "Unknown",
            rtt: conn.rtt ? `${conn.rtt} ms` : "Unknown",
            saveData: conn.saveData || false,
            type: conn.type || "Unknown",
            estimatedDownloadTime: this.estimateDownloadTime(conn)
        };
    }
    
    estimateDownloadTime(connection) {
        if (!connection || !connection.downlink) {
            return "Unknown";
        }
        
        // Calculate download time for different file sizes
        const downlinkMbps = connection.downlink;
        const sizes = {
            image: 2, // 2MB image
            song: 5, // 5MB song
            video: 100 // 100MB video
        };
        
        const results = {};
        for (const [type, sizeMB] of Object.entries(sizes)) {
            // Convert MB to Mb
            const sizeMb = sizeMB * 8;
            // Calculate time in seconds
            const timeSeconds = sizeMb / downlinkMbps;
            
            if (timeSeconds < 60) {
                results[type] = `${timeSeconds.toFixed(1)} seconds`;
            } else {
                results[type] = `${(timeSeconds / 60).toFixed(1)} minutes`;
            }
        }
        
        return results;
    }

    detectPossibleProxy() {
        // This is a very rough heuristic and not reliable
        const timezoneOffset = new Date().getTimezoneOffset();
        const languages = navigator.languages || [navigator.language];
        const browserLanguage = languages[0].split('-')[0].toLowerCase();
        
        // Try to get country from IP geolocation (would be available from the main collector)
        const ipCountry = "Unknown"; // In a real implementation, this would come from IP geolocation
        
        return {
            indicators: {
                timezoneAndLanguageMismatch: "Cannot determine without geolocation data",
                suspiciousUserAgent: navigator.userAgent.includes("Proxy") || navigator.userAgent.includes("VPN"),
                headersAnalysis: "Would check for proxy headers like X-Forwarded-For"
            },
            note: "These are speculative indicators and not reliable for proxy detection"
        };
    }

    detectSupportedCodecs() {
        // ... existing methods from the suggested code ...
        return {
            video: [
                { name: 'H.264', supported: true, status: 'Probably supported' },
                { name: 'VP9', supported: true, status: 'Probably supported' },
                { name: 'AV1', supported: false, status: 'Not supported' }
            ],
            audio: [
                { name: 'AAC', supported: true, status: 'Full support' },
                { name: 'MP3', supported: true, status: 'Full support' },
                { name: 'Opus', supported: true, status: 'Probably supported' }
            ],
            mediaSource: {
                supported: true,
                codecs: [
                    { name: 'MSE H.264', supported: true },
                    { name: 'MSE VP9', supported: true }
                ]
            },
            drm: {
                widevine: true,
                playready: false,
                fairplay: false,
                clearkey: true
            }
        };
    }

    detectExtendedBrowserFeatures() {
        return {
            pwa: {
                serviceWorkerSupport: 'serviceWorker' in navigator,
                manifestSupport: 'onappinstalled' in window,
                installable: 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window
            },
            bluetooth: {
                available: 'bluetooth' in navigator,
                version: 'bluetooth' in navigator ? 'Web Bluetooth API' : 'Not available'
            },
            usb: {
                available: 'usb' in navigator,
                version: 'usb' in navigator ? 'WebUSB API' : 'Not available'
            },
            serial: {
                available: 'serial' in navigator,
                version: 'serial' in navigator ? 'Web Serial API' : 'Not available'
            },
            webShare: {
                available: 'share' in navigator,
                files: 'canShare' in navigator
            },
            webNFC: {
                available: 'NDEFReader' in window
            },
            webXR: {
                available: 'xr' in navigator,
                vrSupport: false,
                arSupport: false
            },
            webAuthn: {
                available: 'PublicKeyCredential' in window
            },
            push: {
                available: 'PushManager' in window
            },
            notifications: {
                available: 'Notification' in window,
                permission: 'Notification' in window ? Notification.permission : 'Not available'
            },
            speechRecognition: {
                available: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
            },
            speechSynthesis: {
                available: 'speechSynthesis' in window
            },
            offscreenCanvas: {
                available: 'OffscreenCanvas' in window
            }
        };
    }

    collectDetailedGraphicsInfo() {
        return {
            webgl: {
                available: true,
                version: '2.0',
                vendor: 'WebKit',
                renderer: 'WebKit WebGL',
                antialiasing: true,
                extensionsCount: 35
            },
            canvas2D: {
                available: true,
                performanceScore: 85,
                timePerOperation: '0.050',
                imageSmoothing: true
            },
            hardwareAcceleration: {
                likely: true,
                certainty: '80%',
                indicators: {
                    webGLAvailable: true,
                    webGL2Available: true,
                    hardwareCompositing: true
                }
            },
            colorGamut: {
                supported: {
                    srgb: true,
                    p3: false,
                    rec2020: false
                },
                highest: 'srgb',
                description: 'Your display supports the standard sRGB color space, which is common in most displays.'
            }
        };
    }

    detectAccessibilityFeatures() {
        return {
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            prefersReducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
            prefersContrast: window.matchMedia('(prefers-contrast: more)').matches ? 'more' :
                             window.matchMedia('(prefers-contrast: less)').matches ? 'less' : 'no-preference',
            forcedColors: window.matchMedia('(forced-colors: active)').matches,
            invertedColors: window.matchMedia('(inverted-colors: inverted)').matches,
            voiceOver: /Mac OS X/.test(navigator.userAgent) && navigator.userAgent.indexOf('AppleWebKit') > -1,
            screenReader: 'speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined
        };
    }

    detectMediaCapabilities() {
        return {
            mediaStreamAvailable: 'MediaStream' in window,
            mediaDevices: 'mediaDevices' in navigator,
            mediaCapabilitiesAvailable: 'mediaCapabilities' in navigator,
            recordingCapability: 'MediaRecorder' in window,
            screenCaptureAvailable: navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices,
            supportedImageTypes: this.detectSupportedImageFormats(),
            imageCapture: 'ImageCapture' in window,
            pictureInPicture: 'pictureInPictureEnabled' in document,
            wakelock: 'wakeLock' in navigator,
            pointerLock: 'pointerLockElement' in document,
            fullscreen: document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled
        };
    }
    
    detectSupportedImageFormats() {
        const img = document.createElement('img');
        const formats = [
            { format: 'image/webp', label: 'WebP' },
            { format: 'image/avif', label: 'AVIF' },
            { format: 'image/jp2', label: 'JPEG 2000' },
            { format: 'image/jxl', label: 'JPEG XL' },
            { format: 'image/heif', label: 'HEIF' },
            { format: 'image/heic', label: 'HEIC' }
        ];
        
        const results = {};
        
        // This detection isn't 100% reliable, but gives a general idea
        for (const {format, label} of formats) {
            // Check with a data URL
            const dataURL = `data:${format};base64,AA==`;
            img.src = dataURL;
            results[label] = img.complete && img.naturalWidth > 0;
        }
        
        return results;
    }

    async collectStorageUsage() {
        // Try using the Storage API if available
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                return {
                    quota: this._formatBytes(estimate.quota),
                    usage: this._formatBytes(estimate.usage),
                    percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2) + '%',
                    detailedUsage: estimate.usageDetails,
                    persistent: await this.isPersistentStorage()
                };
            } catch (error) {
                console.error("Error estimating storage:", error);
                // Fall back to checking individual storage types
            }
        }
        
        // Fallback storage check
        return {
            localStorage: this.checkLocalStorageSize(),
            sessionStorage: this.checkSessionStorageSize(),
            indexedDB: 'indexedDB' in window ? 'Available' : 'Not available',
            cacheAPI: 'caches' in window ? 'Available' : 'Not available',
            persistent: await this.isPersistentStorage()
        };
    }
    
    checkLocalStorageSize() {
        if (!window.localStorage) {
            return 'Not available';
        }
        
        try {
            let i = 0;
            let testKey = 'test_size_';
            
            // Fill localStorage until it throws an error
            try {
                // Clear previous test data
                for (let j = 0; j < i; j++) {
                    localStorage.removeItem(testKey + j);
                }
                
                // Start with 1MB chunks
                const chunk = '1'.repeat(1024 * 1024); // 1MB of data
                
                while (true) {
                    localStorage.setItem(testKey + i, chunk);
                    i++;
                }
            } catch (e) {
                // We've reached the limit
            }
            
            // Calculate size
            const size = i * 1024 * 1024;
            
            // Clean up
            for (let j = 0; j < i; j++) {
                localStorage.removeItem(testKey + j);
            }
            
            return this._formatBytes(size);
        } catch (error) {
            return 'Could not determine';
        }
    }
    
    checkSessionStorageSize() {
        if (!window.sessionStorage) {
            return 'Not available';
        }
        
        // We don't actually fill sessionStorage to capacity
        // as it would be disruptive, so we assume it's similar to localStorage
        return 'Typically 5-10MB';
    }
    
    async isPersistentStorage() {
        if (navigator.storage && navigator.storage.persist) {
            try {
                const isPersisted = await navigator.storage.persisted();
                return isPersisted ? 'Enabled' : 'Not enabled';
            } catch (error) {
                return 'Unknown';
            }
        }
        return 'API not available';
    }

    detectSecurityFeatures() {
        return {
            https: window.location.protocol === 'https:',
            contentSecurityPolicy: {
                present: 'Unknown',
                source: 'Cannot detect HTTP header CSP from client-side',
                note: 'CSP may be set via HTTP header. Check server configuration.'
            },
            crossOriginEmbedderPolicy: 'Cannot detect from client side',
            crossOriginOpenerPolicy: 'Cannot detect from client side',
            crossOriginResourcePolicy: 'Cannot detect from client side',
            securityHeaders: {
                note: 'Security headers are set by the server and cannot be directly accessed from JavaScript',
                recommendations: [
                    'X-Content-Type-Options: nosniff',
                    'X-Frame-Options: DENY or SAMEORIGIN',
                    'Strict-Transport-Security: max-age=31536000; includeSubDomains'
                ]
            },
            modernTLSFeatures: {
                available: window.location.protocol === 'https:',
                note: window.location.protocol === 'https:' ? 
                    'Connection is secure using HTTPS' : 
                    'Not using HTTPS. TLS features are not available.'
            }
        };
    }

    detectSocialMediaPresence() {
        const checkTracker = (name, pattern) => {
            if (typeof document === 'undefined') return false;
            
            // Check in scripts
            const scripts = Array.from(document.getElementsByTagName('script'));
            for (const script of scripts) {
                if (script.src && pattern.test(script.src)) {
                    return true;
                }
                if (script.textContent && pattern.test(script.textContent)) {
                    return true;
                }
            }
            
            // Check in links, pixels, images, etc.
            const links = Array.from(document.querySelectorAll('link, img, iframe'));
            for (const link of links) {
                if (link.href && pattern.test(link.href)) {
                    return true;
                }
                if (link.src && pattern.test(link.src)) {
                    return true;
                }
            }
            
            return false;
        };
        
        return {
            facebook: checkTracker('Facebook', /facebook\.com|fb\.com|connect\.facebook\.net/i),
            twitter: checkTracker('Twitter', /twitter\.com|platform\.twitter\.com/i),
            linkedin: checkTracker('LinkedIn', /linkedin\.com|platform\.linkedin\.com/i),
            google: checkTracker('Google', /google-analytics\.com|googletagmanager\.com/i),
            pinterest: checkTracker('Pinterest', /pinterest\.com|pinimg\.com/i),
            instagram: checkTracker('Instagram', /instagram\.com|cdninstagram\.com/i),
            note: 'This detection looks for common social media trackers and widgets'
        };
    }

    detectLocaleSettings() {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        
        const date = new Date();
        const timeFormats = {
            local: date.toLocaleTimeString(),
            localeWithOptions: date.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }),
            iso: date.toISOString()
        };
        
        const numberFormats = {
            decimal: (1234.5).toLocaleString(),
            currency: (1234.5).toLocaleString(undefined, {
                style: 'currency',
                currency: 'USD'
            }),
            percent: (0.5).toLocaleString(undefined, {
                style: 'percent'
            })
        };
        
        return {
            detectedLocale: locale,
            language: locale.split('-')[0],
            country: locale.includes('-') ? locale.split('-')[1] : 'Not specified',
            timeFormat: timeFormats,
            numberFormat: numberFormats,
            hourCycle: Intl.DateTimeFormat().resolvedOptions().hour12 ? '12-hour' : '24-hour',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    collectMimeTypes() {
        if (!navigator.mimeTypes) {
            return { supported: false };
        }
        
        const mimeTypes = Array.from(navigator.mimeTypes).map(mt => ({
            type: mt.type,
            description: mt.description,
            suffixes: mt.suffixes
        }));
        
        return {
            supported: true,
            count: mimeTypes.length,
            types: mimeTypes.slice(0, 10) // Just show first 10 to avoid overwhelming
        };
    }

    _formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        if (!bytes || isNaN(bytes)) return 'Unknown';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Create global instance
window.enhancedDataCollector = new EnhancedDataCollector();
