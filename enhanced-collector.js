/**
 * Enhanced Data Collector
 * Collects advanced browser and system information beyond the basic collector
 */
class EnhancedDataCollector {
    constructor() {
        console.log('EnhancedDataCollector initialized');
        
        // Safely wrap collection methods to prevent errors from breaking the UI
        if (window.DataValidator && window.DataValidator.safeDataCollection) {
            this.collectEnhancedData = window.DataValidator.safeDataCollection(this.collectEnhancedData.bind(this));
        }
    }

    /**
     * Collects all enhanced data categories
     * @returns {Promise<Object>} Enhanced data object
     */
    async collectEnhancedData() {
        console.log('Collecting enhanced data...');
        
        if (window.startTiming) window.startTiming('enhanced-data', 'Enhanced Data Collection');
        
        try {
            const data = {
                fonts: await this.collectFontData(),
                webrtc: await this.collectWebRTCData(),
                codecs: await this.collectCodecData(),
                browserFeatures: await this.collectExtendedFeaturesData(),
                graphics: await this.collectGraphicsData(),
                security: await this.collectSecurityData()
            };
            
            console.log('Enhanced data collection complete');
            
            if (window.endTiming) window.endTiming('enhanced-data');
            return data;
        } catch (error) {
            console.error('Error in enhanced data collection:', error);
            if (window.endTiming) window.endTiming('enhanced-data');
            return { error: 'Failed to collect enhanced data: ' + error.message };
        }
    }

    /**
     * Detects fonts installed on the user's system
     */
    async collectFontData() {
        if (window.startTiming) window.startTiming('enhanced-fonts');
        
        const commonFonts = [
            'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
            'Helvetica', 'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
            'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro'
        ];
        
        const detectedFonts = [];
        
        // Create a detection element
        const testElement = document.createElement('span');
        testElement.style.visibility = 'hidden';
        testElement.style.position = 'absolute';
        testElement.style.fontSize = '72px';
        testElement.innerHTML = 'mmmmmmmmmmlli';
        document.body.appendChild(testElement);
        
        // Reference width with default font
        testElement.style.fontFamily = 'monospace';
        const defaultWidth = testElement.offsetWidth;
        
        // Test each font
        for (const font of commonFonts) {
            testElement.style.fontFamily = `'${font}', monospace`;
            
            // If width changed, font is likely available
            if (testElement.offsetWidth !== defaultWidth) {
                detectedFonts.push(font);
            }
        }
        
        // Clean up
        document.body.removeChild(testElement);
        
        const result = {
            detectedCount: detectedFonts.length,
            totalTested: commonFonts.length,
            sample: detectedFonts.slice(0, 10) // Only show first 10 fonts
        };
        
        if (window.endTiming) window.endTiming('enhanced-fonts');
        return result;
    }

    /**
     * Tests for potential WebRTC leaks
     */
    async collectWebRTCData() {
        if (window.startTiming) window.startTiming('enhanced-webrtc');
        
        if (!window.RTCPeerConnection) {
            return {
                supported: false,
                leakDetected: false,
                message: 'WebRTC is not supported in this browser.'
            };
        }
        
        try {
            const ips = {
                public: null,
                local: []
            };
            
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            
            pc.createDataChannel('');
            
            // Create offer and set local description
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            // Give a chance for candidates to be gathered
            await new Promise(resolve => {
                setTimeout(resolve, 1000);
            });
            
            // Check for leaks in ICE candidates
            const candidateString = pc.localDescription?.sdp || '';
            
            // Extract IP addresses from candidate strings
            const ipRegex = /(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g;
            const matches = candidateString.match(ipRegex) || [];
            
            matches.forEach(ip => {
                if (ip.startsWith('192.168.') || 
                    ip.startsWith('10.') || 
                    ip.match(/^172\.(1[6-9]|2\d|3[01])\./) ||
                    ip === '127.0.0.1') {
                    if (!ips.local.includes(ip)) {
                        ips.local.push(ip);
                    }
                } else {
                    ips.public = ip;
                }
            });
            
            // Clean up
            pc.close();
            
            const result = {
                supported: true,
                leakDetected: ips.local.length > 0 || ips.public !== null,
                message: (ips.local.length > 0 || ips.public !== null) ? 
                    'WebRTC leak detected. Your local and/or public IP address may be exposed.' :
                    'No WebRTC leaks detected.',
                ips: ips
            };
            
            if (window.endTiming) window.endTiming('enhanced-webrtc');
            return result;
        } catch (error) {
            console.error('Error in WebRTC detection:', error);
            
            if (window.endTiming) window.endTiming('enhanced-webrtc');
            return {
                supported: true,
                leakDetected: false,
                error: 'Error testing for WebRTC leaks: ' + error.message
            };
        }
    }

    /**
     * Detects supported media codecs and DRM systems
     * Added robustness level checks and improved error handling
     */
    async collectCodecData() {
        if (window.startTiming) window.startTiming('enhanced-codecs');
        
        try {
            // Safer checks for MediaSource support
            const mseSupported = typeof MediaSource !== 'undefined' && 'isTypeSupported' in MediaSource;
            
            const videoCodecs = [
                { name: 'H.264 (AVC)', mimeType: 'video/mp4; codecs="avc1.42E01E"' },
                { name: 'H.265 (HEVC)', mimeType: 'video/mp4; codecs="hev1.1.6.L93.B0"' },
                { name: 'VP8', mimeType: 'video/webm; codecs="vp8"' },
                { name: 'VP9', mimeType: 'video/webm; codecs="vp9"' },
                { name: 'AV1', mimeType: 'video/mp4; codecs="av01.0.05M.08"' }
            ];
            
            const audioCodecs = [
                { name: 'AAC', mimeType: 'audio/mp4; codecs="mp4a.40.2"' },
                { name: 'Opus', mimeType: 'audio/ogg; codecs="opus"' },
                { name: 'Vorbis', mimeType: 'audio/ogg; codecs="vorbis"' },
                { name: 'MP3', mimeType: 'audio/mpeg' },
                { name: 'FLAC', mimeType: 'audio/flac' }
            ];
            
            // Test media source extensions - with robust error handling
            const mseCodecs = [];
            
            if (mseSupported) {
                const mseVideoCodecs = [
                    { name: 'H.264 (MSE)', mimeType: 'video/mp4; codecs="avc1.42E01E"' },
                    { name: 'VP9 (MSE)', mimeType: 'video/webm; codecs="vp9"' }
                ];
                
                for (const codec of mseVideoCodecs) {
                    try {
                        const supported = MediaSource.isTypeSupported(codec.mimeType);
                        mseCodecs.push({ name: codec.name, supported });
                    } catch (error) {
                        console.warn(`Error checking MSE support for ${codec.name}:`, error);
                        mseCodecs.push({ name: codec.name, supported: false, error: true });
                    }
                }
            }
            
            // Test video codecs with robust error handling
            for (let i = 0; i < videoCodecs.length; i++) {
                const codec = videoCodecs[i];
                try {
                    if (mseSupported) {
                        const supported = MediaSource.isTypeSupported(codec.mimeType);
                        codec.supported = supported;
                        codec.status = supported ? 'Supported' : 'Not supported';
                    } else {
                        codec.supported = false;
                        codec.status = 'MediaSource API not available';
                    }
                } catch (error) {
                    console.warn(`Error checking video codec ${codec.name}:`, error);
                    codec.supported = false;
                    codec.status = 'Detection failed';
                    codec.error = error.message;
                }
            }
            
            // Test audio codecs with robust error handling
            for (let i = 0; i < audioCodecs.length; i++) {
                const codec = audioCodecs[i];
                try {
                    if (mseSupported) {
                        const supported = MediaSource.isTypeSupported(codec.mimeType);
                        codec.supported = supported;
                        codec.status = supported ? 'Supported' : 'Not supported';
                    } else {
                        codec.supported = false;
                        codec.status = 'MediaSource API not available';
                    }
                } catch (error) {
                    console.warn(`Error checking audio codec ${codec.name}:`, error);
                    codec.supported = false;
                    codec.status = 'Detection failed';
                    codec.error = error.message;
                }
            }
            
            // Check DRM support with improved robustness
            const drmSupport = {
                widevine: 'Not supported',
                playready: 'Not supported',
                fairplay: 'Not supported',
                clearkey: 'Not supported'
            };
            
            // Verify EME API availability before trying to use it
            const emeSupported = 
                typeof navigator !== 'undefined' && 
                'requestMediaKeySystemAccess' in navigator &&
                typeof navigator.requestMediaKeySystemAccess === 'function';
            
            if (emeSupported) {
                const drmConfig = {
                    initDataTypes: ['cenc'],
                    audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"', robustness: 'SW_SECURE_CRYPTO' }],
                    videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"', robustness: 'SW_SECURE_DECODE' }]
                };
                
                // Create a flexible configuration list with multiple robustness levels
                const createDrmConfigs = () => {
                    // From least to most secure
                    const robustnessLevels = [
                        '',                  // No robustness specified (minimum security)
                        'SW_SECURE_CRYPTO',  // Software-based secure crypto
                        'SW_SECURE_DECODE',  // Software-based secure decode
                        'HW_SECURE_CRYPTO',  // Hardware-based secure crypto
                        'HW_SECURE_DECODE',  // Hardware-based secure decode
                        'HW_SECURE_ALL'      // Hardware-based secure all
                    ];
                    
                    const configs = [];
                    
                    // Generate configs with different robustness levels
                    for (const videoRobustness of robustnessLevels) {
                        for (const audioRobustness of robustnessLevels) {
                            configs.push({
                                initDataTypes: ['cenc'],
                                audioCapabilities: [
                                    {
                                        contentType: 'audio/mp4; codecs="mp4a.40.2"',
                                        robustness: audioRobustness
                                    }
                                ],
                                videoCapabilities: [
                                    {
                                        contentType: 'video/mp4; codecs="avc1.42E01E"',
                                        robustness: videoRobustness
                                    }
                                ]
                            });
                        }
                    }
                    
                    return configs;
                };
                
                // Helper function to test DRM system with various configs
                const testDrmSystem = async (keySystem) => {
                    const configs = createDrmConfigs();
                    
                    // Try each config in order of increasing robustness
                    for (const config of configs) {
                        try {
                            await navigator.requestMediaKeySystemAccess(keySystem, [config]);
                            return 'Supported';
                        } catch (e) {
                            // Continue trying with the next config
                            continue;
                        }
                    }
                    
                    // If we get here, no config worked
                    return 'Not supported';
                };
                
                try {
                    drmSupport.widevine = await testDrmSystem('com.widevine.alpha');
                } catch (e) {
                    console.warn('Error testing Widevine DRM:', e);
                    drmSupport.widevine = 'Error detecting';
                }
                
                try {
                    drmSupport.playready = await testDrmSystem('com.microsoft.playready');
                } catch (e) {
                    console.warn('Error testing PlayReady DRM:', e);
                    drmSupport.playready = 'Error detecting';
                }
                
                try {
                    drmSupport.fairplay = await testDrmSystem('com.apple.fps');
                } catch (e) {
                    console.warn('Error testing FairPlay DRM:', e);
                    drmSupport.fairplay = 'Error detecting';
                }
                
                try {
                    drmSupport.clearkey = await testDrmSystem('org.w3.clearkey');
                } catch (e) {
                    console.warn('Error testing ClearKey DRM:', e);
                    drmSupport.clearkey = 'Error detecting';
                }
            } else {
                console.log('Encrypted Media Extensions (EME) not supported in this browser');
                
                // Set all DRM systems as not available due to missing EME
                Object.keys(drmSupport).forEach(key => {
                    drmSupport[key] = 'EME not supported';
                });
            }
            
            const result = {
                video: videoCodecs,
                audio: audioCodecs,
                mediaSource: {
                    supported: mseSupported,
                    codecs: mseCodecs
                },
                drm: drmSupport
            };
            
            if (window.endTiming) window.endTiming('enhanced-codecs');
            return result;
        } catch (error) {
            console.error('Fatal error in codec detection:', error);
            
            if (window.endTiming) window.endTiming('enhanced-codecs');
            return {
                error: 'Codec detection failed: ' + error.message,
                video: [],
                audio: [],
                mediaSource: { supported: false },
                drm: {}
            };
        }
    }

    /**
     * Collects information about advanced browser features
     */
    async collectExtendedFeaturesData() {
        if (window.startTiming) window.startTiming('enhanced-features');
        
        const features = {
            // Progressive Web Apps
            pwa: {
                serviceWorkerSupport: 'serviceWorker' in navigator,
                manifestSupport: !!Array.from(document.querySelectorAll('link'))
                    .find(link => link.rel === 'manifest'),
                installable: 'onbeforeinstallprompt' in window || 'onappinstalled' in window
            },
            
            // Hardware APIs
            bluetooth: {
                available: 'bluetooth' in navigator
            },
            usb: {
                available: 'usb' in navigator
            },
            serial: {
                available: 'serial' in navigator
            },
            
            // Sharing & Communication
            webShare: {
                available: 'share' in navigator,
                files: 'canShare' in navigator && navigator.canShare && navigator.canShare({ files: [new File([], 'test')] })
            },
            webNFC: {
                available: 'NDEFReader' in window
            },
            
            // Extended Reality
            webXR: {
                available: 'xr' in navigator,
                vrSupport: 'xr' in navigator && navigator.xr.isSessionSupported && 
                           navigator.xr.isSessionSupported('immersive-vr').catch(() => false),
                arSupport: 'xr' in navigator && navigator.xr.isSessionSupported &&
                           navigator.xr.isSessionSupported('immersive-ar').catch(() => false)
            },
            
            // Other Emerging APIs
            webAuthn: {
                available: 'credentials' in navigator && 'PublicKeyCredential' in window
            },
            speechRecognition: {
                available: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
            },
            speechSynthesis: {
                available: 'speechSynthesis' in window
            },
            offscreenCanvas: {
                available: typeof OffscreenCanvas !== 'undefined'
            }
        };
        
        if (window.endTiming) window.endTiming('enhanced-features');
        return features;
    }

    /**
     * Collects detailed information about graphics capabilities
     */
    async collectGraphicsData() {
        if (window.startTiming) window.startTiming('enhanced-graphics');
        
        const canvas = document.createElement('canvas');
        let webglData = { available: false };
        let canvas2DData = { error: 'Canvas 2D context not supported' };
        let hardwareAcceleration = { error: 'Hardware acceleration detection failed' };
        
        // WebGL information
        try {
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (gl) {
                webglData = {
                    available: true,
                    version: 'WebGL 1.0',
                    vendor: gl.getParameter(gl.VENDOR),
                    renderer: gl.getParameter(gl.RENDERER),
                    antialiasing: gl.getContextAttributes().antialias,
                    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                    extensionsCount: gl.getSupportedExtensions().length
                };
                
                // Try to get debug info extension
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    webglData.unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    webglData.unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
                
                // Check for WebGL 2.0
                const gl2 = canvas.getContext('webgl2');
                if (gl2) {
                    webglData.version = 'WebGL 2.0';
                }
            }
        } catch (error) {
            console.error('Error collecting WebGL data:', error);
            webglData = { 
                available: false, 
                error: 'WebGL detection failed: ' + error.message 
            };
        }
        
        // Canvas 2D performance test
        try {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const startTime = performance.now();
                const iterations = 100;
                
                // Run a series of drawing operations
                canvas.width = 500;
                canvas.height = 500;
                
                for (let i = 0; i < iterations; i++) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = `rgb(${i % 255}, ${(i * 2) % 255}, ${(i * 3) % 255})`;
                    ctx.fillRect(i % 100, (i * 2) % 100, 50, 50);
                    ctx.font = '16px Arial';
                    ctx.fillText('Performance Test', 10, 50);
                    ctx.strokeRect(10, 10, 80, 80);
                }
                
                const endTime = performance.now();
                const totalTime = endTime - startTime;
                
                canvas2DData = {
                    performanceScore: Math.round(100000 / totalTime), // Higher is better
                    timePerOperation: (totalTime / iterations).toFixed(2),
                    imageSmoothing: 'imageSmoothingEnabled' in ctx
                };
            }
        } catch (error) {
            console.error('Error testing Canvas 2D:', error);
            canvas2DData = { error: 'Canvas 2D performance test failed' };
        }
        
        // Attempt to detect hardware acceleration
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            let likely = false;
            let certainty = 'Low';
            
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
                    
                    // Check for hardware acceleration indicators
                    if (/(nvidia|amd|radeon|intel|geforce|mali|adreno)/i.test(renderer)) {
                        likely = true;
                        certainty = 'High';
                    } else if (!/(software|swiftshader|llvmpipe)/i.test(renderer)) {
                        likely = true;
                        certainty = 'Medium';
                    }
                } else {
                    // If we can't get detailed info, make an educated guess
                    likely = true;
                    certainty = 'Low';
                }
            }
            
            hardwareAcceleration = { likely, certainty };
        } catch (error) {
            console.error('Error detecting hardware acceleration:', error);
            hardwareAcceleration = { error: 'Hardware acceleration detection failed' };
        }
        
        // Detect color gamut
        let colorGamut = {
            highest: 'srgb',
            description: 'Your display supports standard sRGB color space.'
        };
        
        if (window.matchMedia('(color-gamut: rec2020)').matches) {
            colorGamut = {
                highest: 'rec2020',
                description: 'Your display supports the wide rec2020 color gamut used in HDR content.'
            };
        } else if (window.matchMedia('(color-gamut: p3)').matches) {
            colorGamut = {
                highest: 'p3',
                description: 'Your display supports the wide P3 color gamut used in modern displays.'
            };
        }
        
        const result = {
            webgl: webglData,
            canvas2D: canvas2DData,
            hardwareAcceleration,
            colorGamut
        };
        
        if (window.endTiming) window.endTiming('enhanced-graphics');
        return result;
    }

    /**
     * Collects information about browser security features
     */
    async collectSecurityData() {
        if (window.startTiming) window.startTiming('enhanced-security');
        
        // Check HTTPS
        const isHttps = window.location.protocol === 'https:';
        
        // Check Content Security Policy
        let cspData = {
            present: false,
            source: 'Not detected',
            note: 'No Content Security Policy detected. CSP helps prevent XSS and data injection attacks.'
        };
        
        // Check for CSP in meta tag
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (cspMeta) {
            cspData = {
                present: true,
                source: 'Meta tag',
                policy: cspMeta.content,
                note: 'Content Security Policy implemented via meta tag.'
            };
        }
        
        // Check for TLS features
        const modernTLSFeatures = {
            note: isHttps ? 
                'Your connection is using HTTPS, which encrypts data in transit.' : 
                'Your connection is not using HTTPS, which means data is transmitted in clear text.'
        };
        
        // Check for security headers - we can't directly detect server-sent headers in client-side JS
        const securityHeaders = {
            note: 'Security headers are set by the server and can\'t be fully detected from the client.',
            recommendations: [
                'Strict-Transport-Security (HSTS) - Enforces HTTPS connections',
                'X-Content-Type-Options - Prevents MIME type sniffing',
                'X-Frame-Options - Prevents clickjacking',
                'X-XSS-Protection - Helps prevent cross-site scripting attacks',
                'Referrer-Policy - Controls how referrer information is shared',
                'Permissions-Policy - Limits which features can be used'
            ]
        };
        
        const result = {
            https: isHttps,
            contentSecurityPolicy: cspData,
            modernTLSFeatures,
            securityHeaders
        };
        
        if (window.endTiming) window.endTiming('enhanced-security');
        return result;
    }
}

// Create global instance
window.enhancedDataCollector = new EnhancedDataCollector();
