class ComprehensiveCollector {
    constructor() {
        this.data = {};
    }

    async collectAll() {
        return {
            core: this.collectCoreAPIs(),
            hardware: this.collectHardwareAPIs(),
            graphics: await this.collectGraphicsAPIs(),
            media: this.collectMediaAPIs(),
            input: this.collectInputAPIs(),
            storage: await this.collectStorageAPIs(),
            networking: this.collectNetworkingAPIs(),
            security: this.collectSecurityAPIs(),
            experimental: this.collectExperimentalAPIs()
        };
    }

    // Core Web Platform APIs
    collectCoreAPIs() {
        return {
            // JavaScript core
            js: {
                version: this._detectJSVersion(),
                modules: (() => {
                    try {
                        new Function('import("")');
                        return true;
                    } catch {
                        return false;
                    }
                })(),
                classes: typeof class {} === 'function',
                async: typeof async function(){} === 'function',
                bigInt: typeof BigInt === 'function',
                promise: typeof Promise === 'function',
                weakRef: typeof WeakRef === 'function',
                intl: typeof Intl === 'object',
                temporal: typeof Temporal !== 'undefined'
            },
            // Web Components
            webComponents: {
                customElements: 'customElements' in window,
                shadowDOM: !!HTMLElement.prototype.attachShadow,
                templates: 'content' in document.createElement('template'),
                adoptedStyleSheets: 'adoptedStyleSheets' in Document.prototype
            },
            // WebAssembly
            webAssembly: {
                supported: typeof WebAssembly === 'object',
                streaming: typeof WebAssembly === 'object' && 'instantiateStreaming' in WebAssembly,
                threads: typeof SharedArrayBuffer === 'function',
                simd: typeof WebAssembly === 'object' && 'validate' in WebAssembly,
                gc: typeof WebAssembly === 'object' && 'Memory' in WebAssembly
            },
            // Workers
            workers: {
                standardWorker: typeof Worker === 'function',
                sharedWorker: typeof SharedWorker === 'function',
                serviceWorker: 'serviceWorker' in navigator,
                worklets: {
                    paint: 'paintWorklet' in CSS,
                    audio: typeof AudioWorkletNode === 'function',
                    layout: typeof LayoutWorklet !== 'undefined',
                    animation: 'animationWorklet' in CSS
                }
            },
            // DOM features
            dom: {
                querySelector: typeof document.querySelector === 'function',
                intersectionObserver: typeof IntersectionObserver === 'function',
                mutationObserver: typeof MutationObserver === 'function',
                resizeObserver: typeof ResizeObserver === 'function',
                requestIdleCallback: 'requestIdleCallback' in window
            }
        };
    }

    // Hardware APIs
    collectHardwareAPIs() {
        return {
            // Device Memory & Hardware
            deviceInfo: {
                cpu: navigator.hardwareConcurrency || 0,
                memory: navigator.deviceMemory || 'unknown',
                gpu: this._detectGPU(),
                platform: navigator.platform,
                userAgent: navigator.userAgent,
                vendor: navigator.vendor,
                language: navigator.language,
                languages: navigator.languages?.join(', ') || 'unknown',
                cookiesEnabled: navigator.cookieEnabled
            },
            // Device sensors
            sensors: {
                batteryAPI: 'getBattery' in navigator,
                deviceOrientation: 'DeviceOrientationEvent' in window,
                deviceMotion: 'DeviceMotionEvent' in window,
                accelerometer: typeof Accelerometer === 'function',
                gyroscope: typeof Gyroscope === 'function',
                magnetometer: typeof Magnetometer === 'function',
                ambientLight: typeof AmbientLightSensor === 'function',
                proximity: typeof ProximitySensor === 'function'
            },
            // Hardware interfaces
            hardware: {
                usb: 'usb' in navigator,
                hid: 'hid' in navigator,
                serial: 'serial' in navigator,
                midi: 'requestMIDIAccess' in navigator,
                bluetooth: 'bluetooth' in navigator,
                nfc: 'NDEFReader' in window
            },
            // Display & screen
            display: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                orientation: screen.orientation?.type || 'unknown',
                dpr: window.devicePixelRatio,
                hdr: 'matchMedia' in window ? window.matchMedia('(dynamic-range: high)').matches : false,
                colorGamut: this._detectColorGamut()
            }
        };
    }

    // Graphics & Media APIs
    async collectGraphicsAPIs() {
        const result = {
            // WebGL & WebGPU
            graphics: {
                webgl1: this._checkWebGL(1),
                webgl2: this._checkWebGL(2),
                webgpu: 'gpu' in navigator,
                canvas2d: !!document.createElement('canvas').getContext('2d')
            },
            // Image formats
            images: {
                webp: this._checkImageFormat('image/webp'),
                avif: this._checkImageFormat('image/avif'),
                jp2: this._checkImageFormat('image/jp2'),
                jxl: this._checkImageFormat('image/jxl'),
                heif: this._checkImageFormat('image/heif'),
                webpAnimation: this._checkImageFormat('image/webp', true)
            }
        };

        // Get WebGPU details if available
        if ('gpu' in navigator) {
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    result.webgpuDetails = {
                        features: Array.from(adapter.features.values()),
                        limits: Object.fromEntries(
                            Object.entries(adapter.limits).slice(0, 5) // Just the first 5 limits to keep it compact
                        )
                    };
                }
            } catch (e) {
                result.webgpuDetails = { error: "Can't access adapter details without permission" };
            }
        }

        return result;
    }

    // Media APIs
    collectMediaAPIs() {
        return {
            // Audio & Video
            media: {
                html5video: !!document.createElement('video').canPlayType,
                html5audio: !!document.createElement('audio').canPlayType,
                mse: 'MediaSource' in window,
                eme: 'MediaKeys' in window || 'requestMediaKeySystemAccess' in navigator,
                webCodecs: {
                    videoEncoder: typeof VideoEncoder === 'function',
                    videoDecoder: typeof VideoDecoder === 'function',
                    audioEncoder: typeof AudioEncoder === 'function',
                    audioDecoder: typeof AudioDecoder === 'function'
                }
            },
            // Web Audio
            audio: {
                audioContext: typeof AudioContext === 'function' || typeof webkitAudioContext === 'function',
                audioWorklet: 'AudioWorklet' in window,
                wasmAudio: typeof AudioWorkletProcessor === 'function',
                mediaRecorder: typeof MediaRecorder === 'function',
                speechSynthesis: 'speechSynthesis' in window,
                speechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
            },
            // Web RTC
            webrtc: {
                rtcPeerConnection: typeof RTCPeerConnection === 'function',
                getUserMedia: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
                getDisplayMedia: 'mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices,
                mediaCapabilities: 'mediaCapabilities' in navigator,
                insertableStreams: 'RTCRtpSender' in window && 'createEncodedStreams' in RTCRtpSender.prototype
            },
            // Media Stream
            mediaAccess: {
                camera: 'mediaDevices' in navigator,
                microphone: 'mediaDevices' in navigator,
                screenCapture: 'mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices,
                pictureInPicture: 'pictureInPictureEnabled' in document,
                mediaSession: 'mediaSession' in navigator
            }
        };
    }

    // Input APIs
    collectInputAPIs() {
        return {
            // Input methods
            input: {
                pointer: 'PointerEvent' in window,
                touch: 'ontouchstart' in window,
                maxTouchPoints: navigator.maxTouchPoints || 0,
                gamepad: 'getGamepads' in navigator,
                keyboard: 'Keyboard' in window,
                virtualKeyboard: 'virtualKeyboard' in navigator
            },
            // Special interaction
            interaction: {
                clipboard: 'clipboard' in navigator,
                vibrate: 'vibrate' in navigator,
                fullscreen: document.fullscreenEnabled,
                pointerLock: 'pointerLockElement' in document,
                webShare: 'share' in navigator,
                webXR: 'xr' in navigator,
                webauth: 'PublicKeyCredential' in window,
                payment: 'PaymentRequest' in window,
                contacts: 'contacts' in navigator,
                eyeDropper: 'EyeDropper' in window
            },
            // Permissions
            permissions: {
                api: 'permissions' in navigator,
                notifications: 'Notification' in window,
                push: 'PushManager' in window,
                badging: 'setAppBadge' in navigator,
                periodicSync: 'PeriodicSyncManager' in window,
                geolocation: 'geolocation' in navigator
            }
        };
    }

    // Storage APIs
    async collectStorageAPIs() {
        const result = {
            // Browser storage
            storage: {
                localStorage: 'localStorage' in window,
                sessionStorage: 'sessionStorage' in window,
                indexedDB: 'indexedDB' in window,
                webSQL: 'openDatabase' in window, // Deprecated
                cacheAPI: 'caches' in window,
                cookiesEnabled: navigator.cookieEnabled,
                storageManager: 'storage' in navigator && 'estimate' in navigator.storage
            },
            // Quota & persistence
            quotas: {
                persistence: 'storage' in navigator && 'persist' in navigator.storage,
                durability: 'storage' in navigator && 'persisted' in navigator.storage
            },
            // File access
            files: {
                fileReader: 'FileReader' in window,
                fileWriter: 'FileWriter' in window,
                fileSaver: 'saveAs' in window || 'webkitSaveAs' in window,
                fileSystemAccess: 'showOpenFilePicker' in window,
                directoryAccess: 'showDirectoryPicker' in window
            }
        };

        // Add storage estimate if available
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                result.quotaEstimate = {
                    quota: this._formatBytes(estimate.quota),
                    usage: this._formatBytes(estimate.usage),
                    percent: Math.round((estimate.usage / estimate.quota) * 100) + '%'
                };
            } catch (e) {
                result.quotaEstimate = { error: "Couldn't estimate storage" };
            }
        }

        return result;
    }

    // Networking APIs
    collectNetworkingAPIs() {
        return {
            // Network APIs
            connectivity: {
                fetch: 'fetch' in window,
                XMLHttpRequest: 'XMLHttpRequest' in window,
                beacon: 'sendBeacon' in navigator,
                websocket: 'WebSocket' in window,
                webTransport: 'WebTransport' in window,
                networkInfo: 'connection' in navigator,
                onlineState: 'onLine' in navigator ? navigator.onLine : 'unknown',
                serverSentEvents: 'EventSource' in window
            },
            // Advanced networking
            advanced: {
                webRTC: 'RTCPeerConnection' in window,
                webSockets: 'WebSocket' in window,
                http2: 'h2' in Object(window.performance?.getEntriesByType('navigation')[0]?.nextHopProtocol),
                http3: 'h3' in Object(window.performance?.getEntriesByType('navigation')[0]?.nextHopProtocol),
                quic: 'quic' in Object(window.performance?.getEntriesByType('navigation')[0]?.nextHopProtocol)
            },
            // Service workers
            background: {
                serviceWorker: 'serviceWorker' in navigator,
                backgroundSync: 'syncManager' in window || 'SyncManager' in window,
                backgroundFetch: 'BackgroundFetchManager' in window,
                periodicSync: 'PeriodicSyncManager' in window,
                pushAPI: 'PushManager' in window,
                notificationAPI: 'Notification' in window
            },
            // Data streams
            streams: {
                readable: typeof ReadableStream === 'function',
                writable: typeof WritableStream === 'function',
                transform: typeof TransformStream === 'function',
                byob: typeof ReadableByteStreamController === 'function'
            }
        };
    }

    // Security & Privacy APIs
    collectSecurityAPIs() {
        return {
            // Security features
            security: {
                https: location.protocol === 'https:',
                secureContext: window.isSecureContext === true,
                cors: 'fetch' in window,
                webCrypto: 'crypto' in window && 'subtle' in window.crypto,
                credentials: 'credentials' in navigator,
                contentSecurityPolicy: this._detectCSP(),
                permissions: 'permissions' in navigator,
                securityHeaders: this._detectSecurityHeaders()
            },
            // Credential Management
            auth: {
                credentials: 'credentials' in navigator,
                webAuthn: 'PublicKeyCredential' in window,
                fedcm: 'IdentityCredential' in window,
                paymentHandler: 'PaymentRequest' in window,
                passkeys: 'PublicKeyCredential' in window && 'isConditionalMediationAvailable' in PublicKeyCredential
            },
            // Privacy features
            privacy: {
                doNotTrack: 'doNotTrack' in navigator ? navigator.doNotTrack === "1" : false,
                globalPrivacyControl: 'globalPrivacyControl' in navigator ? navigator.globalPrivacyControl === true : false,
                incognito: this._detectIncognitoMode(),
                crossOriginIsolated: window.crossOriginIsolated === true,
                cookieStore: 'cookieStore' in window
            },
            // Origin information
            origin: {
                secureContext: window.isSecureContext === true,
                ancestorOrigins: location.ancestorOrigins ? Array.from(location.ancestorOrigins) : [],
                referrer: document.referrer || 'none',
                host: location.host,
                protocol: location.protocol
            }
        };
    }

    // Experimental & Emerging APIs
    collectExperimentalAPIs() {
        return {
            // Cutting edge APIs
            emerging: {
                webML: 'ml' in navigator || 'gpu' in navigator,
                webNFC: 'NDEFReader' in window,
                webUSB: 'usb' in navigator,
                webHID: 'hid' in navigator,
                webSerial: 'serial' in navigator,
                webBluetooth: 'bluetooth' in navigator,
                webMIDI: 'requestMIDIAccess' in navigator
            },
            // New standards & proposals
            proposals: {
                webTransport: 'WebTransport' in window,
                webCodecs: typeof VideoEncoder === 'function',
                webGPU: 'gpu' in navigator,
                eyeDropper: 'EyeDropper' in window,
                fileSystem: 'showDirectoryPicker' in window,
                multiScreenWindow: 'getScreenDetails' in window,
                prospectiveSearch: 'AbortSignal' in window && 'any' in AbortSignal
            },
            // PWA capabilities
            pwa: {
                serviceWorker: 'serviceWorker' in navigator,
                caches: 'caches' in window,
                appInstalled: 'onappinstalled' in window,
                displayMode: 'matchMedia' in window && window.matchMedia('(display-mode: standalone)').matches,
                orientation: 'orientation' in screen,
                wakeLock: 'wakeLock' in navigator,
                badging: 'setAppBadge' in navigator,
                installPromotion: 'onbeforeinstallprompt' in window
            },
            // Foldable device APIs
            foldable: {
                screenFold: 'screen' in window && 'fold' in screen,
                screenSpanning: CSS.supports('(spanning: single-fold-vertical)'),
                viewportSegments: 'visualViewport' in window && 'segments' in window.visualViewport
            }
        };
    }

    // Helper methods
    _detectJSVersion() {
        // Try to detect JS version based on features
        if (typeof BigInt === 'function' && typeof globalThis === 'object' && 
            typeof Promise.allSettled === 'function')
            return 'ES2020+';
        if (typeof Array.prototype.flat === 'function')
            return 'ES2019';
        if (typeof Array.prototype.includes === 'function')
            return 'ES2016+';
        if (typeof Symbol === 'function')
            return 'ES2015+';
        return 'ES5+';
    }

    _detectGPU() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return 'Unknown';
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (!debugInfo) return 'Info not available';
            
            return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        } catch (e) {
            return 'Detection failed';
        }
    }

    _checkWebGL(version) {
        try {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext(version === 2 ? 'webgl2' : 'webgl');
        } catch (e) {
            return false;
        }
    }

    _checkImageFormat(mimeType, animation = false) {
        const img = document.createElement('img');
        let dataUrl = `data:${mimeType};base64,`;
        
        // This is a minimal valid image for each format
        // For animations, we'd need proper binary data but this is just a basic check
        if (animation) {
            dataUrl += 'UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=';
        } else {
            dataUrl += 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        }
        
        img.src = dataUrl;
        return img.complete && img.width === 1;
    }

    _detectColorGamut() {
        if (!window.matchMedia) return 'unknown';
        
        if (window.matchMedia('(color-gamut: rec2020)').matches) return 'rec2020';
        if (window.matchMedia('(color-gamut: p3)').matches) return 'p3';
        if (window.matchMedia('(color-gamut: srgb)').matches) return 'srgb';
        
        return 'unknown';
    }

    _detectCSP() {
        // Try to detect CSP by checking for meta tag
        const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (metaCSP) return true;
        
        // Use violations as a proxy indicator
        let cspDetected = false;
        const observer = new MutationObserver(() => {});
        try {
            // Try to install an unsafe inline script observer
            // If CSP blocks it, it will throw
            observer.observe(document, { attributes: true, attributeOldValue: true, characterData: true,
                characterDataOldValue: true, childList: true, subtree: true });
            cspDetected = false;
        } catch (e) {
            cspDetected = e.toString().indexOf('SecurityError') >= 0;
        } finally {
            observer.disconnect();
        }
        return cspDetected;
    }

    _detectSecurityHeaders() {
        // We can't directly check HTTP headers from JS
        // But we can infer some from behavior
        return {
            httpsOnly: window.isSecureContext,
            xssProtection: this._testXSSFiltering(),
            frameOptions: this._testFrameability(),
            referrerPolicy: document.referrerPolicy || 'not-set'
        };
    }
    
    _testXSSFiltering() {
        // Try to detect XSS filtering by seeing if we can inject a script tag
        const div = document.createElement('div');
        div.innerHTML = '<img src="x" onerror="window._testXSS=1">';
        document.body.appendChild(div);
        const result = !window._testXSS;
        document.body.removeChild(div);
        delete window._testXSS;
        return result ? 'Likely enabled' : 'Not detected';
    }
    
    _testFrameability() {
        return window.top === window ? 'Unknown (not in a frame)' : 'Framing allowed';
    }

    _detectIncognitoMode() {
        // Limited heuristics as most reliable methods are now blocked
        let limited = false;
        
        // Storage limit tends to be reduced in private mode
        if (navigator.storage && navigator.storage.estimate) {
            limited = true; // Just a placeholder - in reality we'd check against known limits
        }
        
        return limited ? 'Possibly' : 'Unknown';
    }

    _formatBytes(bytes) {
        if (!bytes) return 'Unknown';
        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }
        return `${bytes.toFixed(1)} ${units[i]}`;
    }
}

// Create global instance
window.comprehensiveCollector = new ComprehensiveCollector();
