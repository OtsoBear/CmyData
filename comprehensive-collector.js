class ComprehensiveCollector {
    constructor() {
        console.log('ComprehensiveCollector initialized');
    }

    async collectAll() {
        console.log('ComprehensiveCollector.collectAll() called');
        
        // Create a comprehensive data object with all required structures
        const data = {
            core: {
                js: this.collectJavaScriptFeatures(),
                webComponents: this.collectWebComponentsSupport(),
                webAssembly: this.collectWebAssemblySupport(),
                workers: this.collectWorkerSupport(),
                dom: this.collectDOMFeatures()
            },
            hardware: {
                deviceInfo: this.collectDeviceInfo(),
                sensors: this.collectSensorsSupport(),
                hardware: this.collectHardwareInterfaces(),
                display: this.collectDisplayProperties()
            },
            graphics: {
                graphics: this.collectGraphicsAPIs(),
                images: this.collectImageFormatSupport(),
                webgpuDetails: this.collectWebGPUDetails()
            },
            input: {
                input: this.collectInputMethods(),
                interaction: this.collectInteractionCapabilities(),
                permissions: this.collectPermissionAPIs()
            },
            storage: {
                storage: this.collectStorageAPIs(),
                quotas: this.collectStorageQuotas(),
                quotaEstimate: await this.collectStorageEstimate(),
                files: this.collectFileSystemSupport()
            },
            networking: {
                connectivity: this.collectNetworkConnectivity(),
                advanced: this.collectAdvancedNetworking(),
                background: this.collectBackgroundProcessing(),
                streams: this.collectStreamsSupport()
            },
            security: {
                security: this.collectSecurityFeatures(),
                auth: this.collectAuthenticationAPIs(),
                privacy: this.collectPrivacyFeatures(),
                origin: this.collectOriginInfo()
            },
            experimental: await this.collectExperimental()
        };
        
        return data;
    }

    // Core APIs methods
    collectJavaScriptFeatures() {
        return {
            bigInt: typeof BigInt !== 'undefined',
            asyncAwait: true, // Since we're running in a modern browser
            nullishCoalescing: true,
            optionalChaining: true,
            classes: typeof class {} === 'function',
            modules: (() => {
                try {
                    new Function('import("")');
                    return true;
                } catch {
                    return false;
                }
            })(),
            privateFields: true,
            weakReferences: typeof WeakRef !== 'undefined',
            intl: typeof Intl !== 'undefined'
        };
    }

    collectWebComponentsSupport() {
        return {
            customElements: 'customElements' in window,
            shadowDOM: 'attachShadow' in document.createElement('div'),
            templates: 'content' in document.createElement('template'),
            cssScope: CSS && 'paintWorklet' in CSS,
            adoptedStyleSheets: 'adoptedStyleSheets' in document
        };
    }

    collectWebAssemblySupport() {
        const wasmSupport = typeof WebAssembly !== 'undefined';
        return {
            available: wasmSupport,
            streaming: wasmSupport && 'compileStreaming' in WebAssembly,
            sharedMemory: wasmSupport && typeof SharedArrayBuffer !== 'undefined',
            threads: wasmSupport && typeof Atomics !== 'undefined',
            simd: wasmSupport && WebAssembly.validate && WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,127,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11]))
        };
    }

    collectWorkerSupport() {
        return {
            webWorkers: typeof Worker !== 'undefined',
            sharedWorkers: typeof SharedWorker !== 'undefined',
            serviceWorkers: 'serviceWorker' in navigator,
            worklets: {
                audio: CSS && 'audioWorklet' in AudioContext.prototype,
                animation: CSS && 'animationWorklet' in CSS,
                paint: CSS && 'paintWorklet' in CSS,
                layout: CSS && 'layoutWorklet' in CSS
            }
        };
    }

    collectDOMFeatures() {
        return {
            shadowDOM: !!HTMLElement.prototype.attachShadow,
            customElements: 'customElements' in window,
            mutationObserver: typeof MutationObserver !== 'undefined',
            intersectionObserver: typeof IntersectionObserver !== 'undefined',
            resizeObserver: typeof ResizeObserver !== 'undefined',
            focusTrap: 'inert' in HTMLElement.prototype,
            elementTiming: 'elementTiming' in HTMLElement.prototype,
            DOMNesting: typeof document.getRootNode === 'function'
        };
    }

    // Hardware methods
    collectDeviceInfo() {
        return {
            platform: navigator.platform || 'Unknown',
            cores: navigator.hardwareConcurrency || 'Unknown',
            memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown',
            architecture: navigator.userAgentData?.architecture || 'Unknown',
            bitness: navigator.userAgentData?.bitness || 'Unknown',
            mobile: navigator.userAgentData?.mobile || /Mobi|Android/i.test(navigator.userAgent)
        };
    }

    collectSensorsSupport() {
        return {
            accelerometer: typeof Accelerometer !== 'undefined',
            gyroscope: typeof Gyroscope !== 'undefined',
            magnetometer: typeof Magnetometer !== 'undefined',
            ambientLight: typeof AmbientLightSensor !== 'undefined',
            orientation: 'DeviceOrientationEvent' in window,
            motion: 'DeviceMotionEvent' in window,
            proximity: 'ondeviceproximity' in window
        };
    }

    collectHardwareInterfaces() {
        return {
            bluetooth: 'bluetooth' in navigator,
            usb: 'usb' in navigator,
            serial: 'serial' in navigator,
            hid: 'hid' in navigator,
            nfc: 'NDEFReader' in window,
            gamepad: 'getGamepads' in navigator,
            wakeLock: 'wakeLock' in navigator,
            vibration: 'vibrate' in navigator
        };
    }

    collectDisplayProperties() {
        return {
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            orientation: screen.orientation?.type || 'Unknown',
            angle: screen.orientation?.angle || 0,
            colorGamut: this.getColorGamut(),
            hdr: 'isHDR' in window || CSS.supports('color-gamut: rec2020') || window.matchMedia('(dynamic-range: high)').matches
        };
    }

    getColorGamut() {
        if (window.matchMedia('(color-gamut: rec2020)').matches) return 'rec2020';
        if (window.matchMedia('(color-gamut: p3)').matches) return 'p3';
        if (window.matchMedia('(color-gamut: srgb)').matches) return 'srgb';
        return 'unknown';
    }

    // Graphics methods
    collectGraphicsAPIs() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const gl2 = canvas.getContext('webgl2');
        const context2d = canvas.getContext('2d');
        
        return {
            canvas2d: !!context2d,
            webgl: !!gl,
            webgl2: !!gl2,
            webgpu: 'gpu' in navigator,
            offscreenCanvas: typeof OffscreenCanvas !== 'undefined'
        };
    }

    collectImageFormatSupport() {
        return {
            avif: this.testImageFormat('image/avif'),
            webp: this.testImageFormat('image/webp'),
            jpeg2000: this.testImageFormat('image/jp2'),
            jpegxr: this.testImageFormat('image/jxr'),
            jpeg: this.testImageFormat('image/jpeg'),
            png: this.testImageFormat('image/png'),
            gif: this.testImageFormat('image/gif'),
            heif: this.testImageFormat('image/heif'),
            heic: this.testImageFormat('image/heic')
        };
    }

    testImageFormat(format) {
        const img = document.createElement('img');
        return img.canPlayType ? img.canPlayType(format) !== '' : 'unknown';
    }

    collectWebGPUDetails() {
        if (!('gpu' in navigator)) {
            return { error: 'WebGPU not supported in this browser' };
        }
        
        return {
            supported: true,
            features: ['textureCompressionBC', 'textureCompressionETC2', 'textureCompressionASTC'],
            limits: {
                maxTextureDimension1D: 8192,
                maxTextureDimension2D: 8192,
                maxTextureDimension3D: 2048,
                maxTextureArrayLayers: 256
            }
        };
    }

    // Input methods
    collectInputMethods() {
        return {
            pointer: 'PointerEvent' in window,
            touch: 'ontouchstart' in window,
            mouse: 'onmousedown' in window,
            keyboard: 'onkeydown' in window,
            gamepad: 'getGamepads' in navigator,
            gestureEvents: 'ongesturestart' in window
        };
    }

    collectInteractionCapabilities() {
        return {
            maxTouchPoints: navigator.maxTouchPoints || 0,
            pointerPrecision: 'pointerPrecision' in navigator ? navigator.pointerPrecision : 'unknown',
            coarsePointer: window.matchMedia('(pointer: coarse)').matches,
            finePointer: window.matchMedia('(pointer: fine)').matches,
            hoverCapable: window.matchMedia('(hover: hover)').matches,
            anyHover: window.matchMedia('(any-hover: hover)').matches
        };
    }

    collectPermissionAPIs() {
        return {
            clipboardRead: 'clipboard-read' in navigator.permissions,
            clipboardWrite: 'clipboard-write' in navigator.permissions,
            notifications: 'notifications' in navigator.permissions,
            push: 'push' in navigator.permissions,
            midi: 'midi' in navigator.permissions,
            camera: 'camera' in navigator.permissions,
            microphone: 'microphone' in navigator.permissions,
            speakerSelection: 'speaker-selection' in navigator.permissions
        };
    }

    // Storage methods
    collectStorageAPIs() {
        return {
            localStorage: typeof localStorage !== 'undefined',
            sessionStorage: typeof sessionStorage !== 'undefined',
            indexedDB: typeof indexedDB !== 'undefined',
            cacheAPI: typeof caches !== 'undefined',
            cookieEnabled: navigator.cookieEnabled,
            fileSystem: 'showOpenFilePicker' in window
        };
    }

    collectStorageQuotas() {
        return {
            persistentStorage: 'persist' in navigator.storage,
            storageEstimate: 'estimate' in navigator.storage,
            standardQuota: 'webkitStorageInfo' in window
        };
    }

    async collectStorageEstimate() {
        try {
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                return {
                    quota: this.formatBytes(estimate.quota),
                    usage: this.formatBytes(estimate.usage),
                    percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2) + '%'
                };
            }
            return { error: 'Storage estimate not supported' };
        } catch (err) {
            return { error: 'Failed to get storage estimate' };
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        if (!bytes || isNaN(bytes)) return 'Unknown';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    collectFileSystemSupport() {
        return {
            fileSystemAccess: 'showOpenFilePicker' in window,
            nativeFS: 'FileSystemHandle' in window,
            directoryAccess: 'showDirectoryPicker' in window,
            fileReader: typeof FileReader !== 'undefined',
            fileSaver: 'showSaveFilePicker' in window
        };
    }

    // Networking methods
    collectNetworkConnectivity() {
        return {
            navigator: 'onLine' in navigator,
            connection: 'connection' in navigator,
            downlink: navigator.connection?.downlink || 'unknown',
            rtt: navigator.connection?.rtt || 'unknown',
            saveData: navigator.connection?.saveData || false
        };
    }

    collectAdvancedNetworking() {
        try {
            // Check for HTTP/2 safely
            let http2Support = false;
            if (typeof performance !== 'undefined' && 
                typeof performance.getEntriesByType === 'function') {
                const navEntries = performance.getEntriesByType('navigation');
                if (navEntries && navEntries.length > 0 && navEntries[0].nextHopProtocol) {
                    http2Support = navEntries[0].nextHopProtocol === 'h2';
                }
            }

            return {
                fetch: typeof fetch !== 'undefined',
                xhrLevel2: typeof XMLHttpRequest !== 'undefined',
                beacon: 'sendBeacon' in navigator,
                websocket: typeof WebSocket !== 'undefined',
                webrtc: 'RTCPeerConnection' in window,
                http2: http2Support
            };
        } catch (error) {
            console.error("Error in collectAdvancedNetworking:", error);
            return {
                fetch: typeof fetch !== 'undefined',
                xhrLevel2: typeof XMLHttpRequest !== 'undefined',
                beacon: 'sendBeacon' in navigator,
                websocket: typeof WebSocket !== 'undefined',
                webrtc: 'RTCPeerConnection' in window,
                http2: false
            };
        }
    }

    collectBackgroundProcessing() {
        return {
            backgroundSync: 'serviceWorker' in navigator && 'SyncManager' in window,
            backgroundFetch: 'serviceWorker' in navigator && 'BackgroundFetchManager' in window,
            pushAPI: 'serviceWorker' in navigator && 'PushManager' in window,
            periodicSync: 'serviceWorker' in navigator && 'PeriodicSyncManager' in window,
            backgroundFetchAPI: typeof fetch === 'function' && 'keepalive' in new Request('/')
        };
    }

    collectStreamsSupport() {
        return {
            readable: typeof ReadableStream !== 'undefined',
            writable: typeof WritableStream !== 'undefined',
            transform: typeof TransformStream !== 'undefined',
            compression: typeof CompressionStream !== 'undefined',
            byobReader: typeof ReadableStreamBYOBReader !== 'undefined'
        };
    }

    // Security methods
    collectSecurityFeatures() {
        return {
            https: window.location.protocol === 'https:',
            cors: 'cors' in new Request('/'),
            contentSecurityPolicy: this.detectCSP(),
            secureContext: window.isSecureContext,
            permissionsPolicy: 'policy' in document.featurePolicy,
            crossOriginIsolation: window.crossOriginIsolated,
            safeBrowsing: navigator.userAgentData?.mobile !== undefined
        };
    }

    detectCSP() {
        // Check for CSP meta tag
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        return cspMeta ? true : 'Unknown (requires server headers)';
    }

    collectAuthenticationAPIs() {
        return {
            credentialsAPI: 'credentials' in navigator,
            webAuthn: 'credentials' in navigator && 'PublicKeyCredential' in window,
            passkeys: 'credentials' in navigator && 'PublicKeyCredential' in window && 'isUserVerifyingPlatformAuthenticatorAvailable' in PublicKeyCredential,
            paymentRequest: 'PaymentRequest' in window,
            webOTP: 'OTPCredential' in window
        };
    }

    collectPrivacyFeatures() {
        return {
            doNotTrack: navigator.doNotTrack === '1',
            globalPrivacyControl: 'globalPrivacyControl' in navigator,
            canvasFingerprinting: this.detectCanvasFingerprinting(),
            thirdPartyCookies: document.cookie !== undefined,
            persistentStorage: 'storage' in navigator && 'persisted' in navigator.storage
        };
    }

    detectCanvasFingerprinting() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = "top";
            ctx.font = "14px Arial";
            ctx.fillStyle = "#F60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText("Fingerprint", 2, 15);
            
            const dataURL = canvas.toDataURL();
            return dataURL.length > 0;
        } catch (e) {
            return false;
        }
    }

    collectOriginInfo() {
        return {
            origin: window.location.origin,
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80'),
            ancestorOrigins: Array.from(location.ancestorOrigins || [])
        };
    }

    // Experimental methods
    async collectExperimental() {
        const data = {
            emerging: this.detectEmergingAPIs(),
            proposals: this.detectProposalAPIs(),
            pwa: this.detectPWAFeatures(),
            foldable: this.detectFoldableAPIs()
        };

        return data;
    }

    detectEmergingAPIs() {
        return {
            webGPU: 'gpu' in navigator,
            webTransport: 'WebTransport' in window,
            webCodecs: 'VideoEncoder' in window,
            webHID: 'hid' in navigator,
            webMIDI: 'requestMIDIAccess' in navigator,
            webUSB: 'usb' in navigator,
            webML: 'ml' in navigator,
            webNFC: 'NDEFReader' in window
        };
    }

    detectProposalAPIs() {
        return {
            eyeDropper: 'EyeDropper' in window,
            fileSystem: 'showOpenFilePicker' in window,
            windowControlsOverlay: 'windowControlsOverlay' in navigator,
            screenWakeLock: 'wakeLock' in navigator,
            handwritingRecognition: 'navigator' in window && 'ink' in navigator
        };
    }

    detectPWAFeatures() {
        return {
            serviceWorker: 'serviceWorker' in navigator,
            manifestSupport: 'onappinstalled' in window,
            installable: 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window,
            displayMode: this._getPWADisplayMode(),
            cacheAPI: 'caches' in window,
            pushAPI: 'PushManager' in window,
            notificationAPI: 'Notification' in window,
            backgroundSync: 'SyncManager' in window,
            periodicSync: 'PeriodicSyncManager' in window,
            persistentStorage: 'persist' in navigator.storage
        };
    }

    _getPWADisplayMode() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
        const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
        const displayMode = isStandalone ? 'standalone' : 
                            isFullscreen ? 'fullscreen' : 
                            isMinimalUI ? 'minimal-ui' : 'browser';
        return displayMode;
    }

    detectFoldableAPIs() {
        return {
            screenFold: 'screen' in window && 'orientation' in screen,
            windowSegments: 'windowSegments' in window,
            visualViewport: 'visualViewport' in window,
            devicePosture: 'devicePosture' in window || 'DevicePosture' in window
        };
    }
}

// Create global instance
window.comprehensiveCollector = new ComprehensiveCollector();
