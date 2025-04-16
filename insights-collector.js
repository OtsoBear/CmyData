class InsightsCollector {
    constructor() {
        this.insights = {};
    }

    async collectAllInsights(baseData = {}) {
        const insights = {};
        
        try {
            // Only proceed with location-based insights if we have geolocation data
            if (baseData.geolocation && !baseData.geolocation.error) {
                const coords = {
                    latitude: baseData.geolocation.latitude,
                    longitude: baseData.geolocation.longitude
                };
                
                // Collect all location-based insights
                insights.iss = await this.getISSDistance(coords);
                insights.weather = await this.getLocalWeather(coords);
                insights.astronomy = await this.getAstronomyData(coords);
                insights.timezones = await this.getTimezoneInfo(coords);
            } else {
                insights.locationBased = { 
                    error: "Location data required for these insights. Enable geolocation to see more." 
                };
            }

            // Non-location based insights
            insights.internetHealth = await this.getInternetHealthData();
            insights.fingerprint = this.calculateFingerprintUniqueness(baseData);
            insights.carbonFootprint = this.estimateCarbonFootprint(baseData);
            insights.privacyScore = this.calculatePrivacyScore(baseData);
            insights.trackingAnalysis = this.analyzeTrackingVulnerability(baseData);
            
        } catch (error) {
            console.error("Error collecting insights:", error);
            insights.error = "Failed to gather some insights. See console for details.";
        }
        
        this.insights = insights;
        return insights;
    }

    async getISSDistance(coords) {
        try {
            // Get current ISS location
            const response = await fetch('http://api.open-notify.org/iss-now.json');
            const data = await response.json();
            
            if (data.message === "success") {
                const issPosition = {
                    latitude: parseFloat(data.iss_position.latitude),
                    longitude: parseFloat(data.iss_position.longitude)
                };
                
                // Calculate distance between user and ISS
                const distance = this.calculateDistance(
                    coords.latitude, coords.longitude,
                    issPosition.latitude, issPosition.longitude
                );
                
                return {
                    issPosition,
                    userPosition: coords,
                    distance: {
                        km: Math.round(distance),
                        miles: Math.round(distance * 0.621371)
                    },
                    timestamp: new Date(data.timestamp * 1000).toISOString()
                };
            } else {
                throw new Error("ISS API returned an error");
            }
        } catch (error) {
            console.error("Error fetching ISS data:", error);
            return { error: "Could not fetch International Space Station data" };
        }
    }

    async getLocalWeather(coords) {
        try {
            // Using OpenWeatherMap API - you would need an API key in production
            // This is simplified for demonstration purposes
            const apiKey = 'demo_key'; // Replace with actual API key
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${apiKey}&units=metric`
            );
            
            // If the API call would fail due to API key, provide mock data
            if (!response.ok) {
                return this.getMockWeatherData(coords);
            }
            
            const data = await response.json();
            
            return {
                temperature: {
                    celsius: Math.round(data.main.temp),
                    fahrenheit: Math.round(data.main.temp * 9/5 + 32)
                },
                conditions: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                location: data.name,
                country: data.sys.country
            };
        } catch (error) {
            console.error("Error fetching weather data:", error);
            return this.getMockWeatherData(coords);
        }
    }
    
    getMockWeatherData(coords) {
        // Provide mock weather data based on latitude for demo purposes
        const absLat = Math.abs(coords.latitude);
        let temp;
        
        if (absLat > 60) temp = 5; // Cold near poles
        else if (absLat > 40) temp = 15; // Temperate
        else temp = 25; // Warm near equator
        
        return {
            temperature: {
                celsius: temp,
                fahrenheit: Math.round(temp * 9/5 + 32)
            },
            conditions: "Weather data simulation (API key required)",
            humidity: 60,
            windSpeed: 5,
            location: "Based on your coordinates",
            note: "This is simulated data. Add a real API key for actual weather."
        };
    }

    async getAstronomyData(coords) {
        try {
            const date = new Date();
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            
            // For demonstration, we'll calculate sunrise/sunset times
            // This is an approximation - real calculations are more complex
            const times = this.calculateSunriseSunset(coords.latitude, coords.longitude, date);
            
            return {
                sunriseTime: times.sunrise,
                sunsetTime: times.sunset,
                dayLength: times.dayLength,
                solarNoon: times.solarNoon,
                currentSolarPosition: this.calculateSolarPosition(coords.latitude, coords.longitude, date)
            };
        } catch (error) {
            console.error("Error calculating astronomy data:", error);
            return { error: "Could not calculate astronomy data" };
        }
    }
    
    calculateSunriseSunset(lat, lng, date) {
        // This is a simplified calculation - a real implementation would use a proper astronomy library
        const now = date || new Date();
        const jan = new Date(now.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((now - jan) / 86400000);
        
        // Simple approximation
        const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
        const sunrise = new Date(now.setHours(6 + (30 / 60)));
        const sunset = new Date(now.setHours(18 - (30 / 60)));
        const dayLength = "~12 hours"; // Simplified
        const solarNoon = new Date(now.setHours(12, 0, 0));
        
        return {
            sunrise: sunrise.toTimeString().split(' ')[0],
            sunset: sunset.toTimeString().split(' ')[0],
            dayLength,
            solarNoon: solarNoon.toTimeString().split(' ')[0]
        };
    }
    
    calculateSolarPosition(lat, lng, date) {
        // Simplified calculation - returns approximate solar altitude and azimuth
        const now = date || new Date();
        const hours = now.getHours() + now.getMinutes() / 60;
        
        // Simple approximation - real calculations are more complex
        const altitude = Math.sin((hours - 12) / 12 * Math.PI) * 90;
        const azimuth = (hours / 24) * 360;
        
        return {
            altitude: Math.round(altitude),
            azimuth: Math.round(azimuth),
            description: hours > 6 && hours < 18 ? "Sun is above horizon" : "Sun is below horizon"
        };
    }

    async getTimezoneInfo(coords) {
        try {
            // Try to determine timezone from browser first
            const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const now = new Date();
            
            // Calculate UTC offset in hours
            const utcOffset = -now.getTimezoneOffset() / 60;
            const utcOffsetStr = utcOffset >= 0 ? `+${utcOffset}` : `${utcOffset}`;
            
            return {
                localTimezone,
                utcOffset: utcOffsetStr,
                currentLocalTime: now.toLocaleTimeString(),
                currentUtcTime: now.toUTCString()
            };
        } catch (error) {
            console.error("Error getting timezone info:", error);
            return { error: "Could not determine timezone information" };
        }
    }

    async getInternetHealthData() {
        try {
            // Perform a simple latency test
            const startTime = performance.now();
            const response = await fetch('https://www.googleapis.com/dns/v1/resolveRecursively?servers=8.8.8.8', {
                method: 'HEAD',
                mode: 'no-cors' // This might not give accurate results due to CORS, but it's a simple test
            });
            const endTime = performance.now();
            
            return {
                latency: Math.round(endTime - startTime),
                connectionType: navigator.connection ? navigator.connection.effectiveType : 'Unknown',
                dnsResolution: 'Test completed',
                packetLoss: '0%' // This is mocked, real packet loss testing is complex in browser
            };
        } catch (error) {
            console.error("Error testing internet health:", error);
            return {
                latency: 'Test failed',
                connectionType: navigator.connection ? navigator.connection.effectiveType : 'Unknown',
                dnsResolution: 'Test failed',
                error: "Could not complete internet health tests"
            };
        }
    }

    calculateFingerprintUniqueness(baseData) {
        // This is a simplified scoring algorithm - real fingerprinting uniqueness is more complex
        let uniquenessScore = 0;
        let maxScore = 0;
        
        // Screen resolution uniqueness
        if (baseData.screen && baseData.screen.screen) {
            const resolution = `${baseData.screen.screen.width}x${baseData.screen.screen.height}`;
            uniquenessScore += resolution === "1920x1080" ? 1 : 3; // Common resolution = less unique
            maxScore += 3;
        }
        
        // Canvas fingerprint
        if (baseData.fingerprinting && baseData.fingerprinting.canvas) {
            uniquenessScore += 5; // Canvas fingerprints are highly identifying
            maxScore += 5;
        }
        
        // User agent uniqueness
        if (baseData.navigator && baseData.navigator.userAgent) {
            const ua = baseData.navigator.userAgent;
            // Common browsers are less unique
            if (ua.includes("Chrome") && !ua.includes("Edge")) uniquenessScore += 1;
            else if (ua.includes("Firefox")) uniquenessScore += 2;
            else uniquenessScore += 4; // Uncommon browser
            maxScore += 4;
        }
        
        // Fonts
        if (baseData.fingerprinting && baseData.fingerprinting.fonts) {
            uniquenessScore += 3;
            maxScore += 3;
        }
        
        // Plugins
        if (baseData.navigator && baseData.navigator.plugins && baseData.navigator.plugins.length > 0) {
            uniquenessScore += Math.min(baseData.navigator.plugins.length, 4);
            maxScore += 4;
        }
        
        // WebGL information
        if (baseData.fingerprinting && baseData.fingerprinting.webGL && !baseData.fingerprinting.webGL.error) {
            uniquenessScore += 4;
            maxScore += 4;
        }
        
        // Calculate percentage
        const uniquenessPercentage = Math.round((uniquenessScore / maxScore) * 100);
        
        // Interpretation
        let interpretation;
        if (uniquenessPercentage < 30) {
            interpretation = "Your browser configuration is fairly common and less uniquely identifiable.";
        } else if (uniquenessPercentage < 70) {
            interpretation = "Your browser has a moderately unique fingerprint.";
        } else {
            interpretation = "Your browser has a highly unique fingerprint that could make you easily identifiable.";
        }
        
        return {
            score: uniquenessPercentage,
            interpretation,
            maxPossibleScore: 100,
            fingerprintingElements: maxScore
        };
    }

    estimateCarbonFootprint(baseData) {
        // This is a very rough estimation based on device type and browser efficiency
        let baseCO2PerHour = 0.1; // Default CO2 in kg/hour for browsing
        
        // Adjust based on device type (determined from user agent)
        if (baseData.navigator && baseData.navigator.userAgent) {
            const ua = baseData.navigator.userAgent;
            if (ua.includes("Mobile") || ua.includes("Android")) {
                baseCO2PerHour = 0.05; // Mobile devices typically use less energy
            } else if (ua.includes("Mac")) {
                baseCO2PerHour = 0.12; // Macs might use slightly more energy
            } else if (ua.includes("Linux")) {
                baseCO2PerHour = 0.09; // Linux often runs on more efficient hardware
            }
        }
        
        // Adjust based on browser (some browsers are more efficient)
        if (baseData.navigator && baseData.navigator.userAgent) {
            const ua = baseData.navigator.userAgent;
            if (ua.includes("Firefox")) {
                baseCO2PerHour *= 0.95; // Firefox tends to be more efficient
            } else if (ua.includes("Edge")) {
                baseCO2PerHour *= 0.97;
            }
        }
        
        // Calculate hourly, daily, and yearly CO2
        const hourlyCO2 = baseCO2PerHour;
        const dailyCO2 = hourlyCO2 * 5; // Assuming 5 hours of browsing per day
        const yearlyCO2 = dailyCO2 * 365;
        
        // Compare to real-world examples
        const kmDriven = yearlyCO2 / 0.12; // Approx 120g CO2 per km driven
        const coffeeEquivalent = yearlyCO2 / 0.2; // Approx 200g CO2 per cup of coffee
        
        return {
            hourly: hourlyCO2.toFixed(3),
            daily: dailyCO2.toFixed(2),
            yearly: yearlyCO2.toFixed(1),
            comparisons: {
                kmDriven: Math.round(kmDriven),
                coffeeEquivalent: Math.round(coffeeEquivalent)
            },
            note: "This is a very rough estimate based on device type and browser. Actual results may vary significantly."
        };
    }

    calculatePrivacyScore(baseData) {
        // Higher score means better privacy
        let privacyScore = 100;
        const issues = [];
        
        // Check for DNT (Do Not Track)
        if (baseData.navigator && baseData.navigator.doNotTrack !== "1") {
            privacyScore -= 10;
            issues.push("Do Not Track is not enabled");
        }
        
        // Check for anti-fingerprinting features
        if (baseData.fingerprinting && baseData.fingerprinting.canvas && !baseData.fingerprinting.canvas.error) {
            privacyScore -= 15;
            issues.push("Canvas fingerprinting is possible");
        }
        
        // Check for WebRTC leaks
        if (baseData.network && baseData.network.webrtcIPs && baseData.network.webrtcIPs.length > 0) {
            privacyScore -= 20;
            issues.push("WebRTC might expose your local IP addresses");
        }
        
        // Check for third-party cookie acceptance
        if (baseData.navigator && baseData.navigator.cookieEnabled) {
            privacyScore -= 10;
            issues.push("Third-party cookies are accepted");
        }
        
        // Check if using a privacy-focused browser
        if (baseData.navigator && baseData.navigator.userAgent) {
            const ua = baseData.navigator.userAgent;
            if (!(ua.includes("Firefox") || ua.includes("Brave") || ua.includes("Tor"))) {
                privacyScore -= 5;
                issues.push("Not using a privacy-focused browser");
            }
        }
        
        // Privacy-enhancing extensions detection (simplified)
        const privacyExtensionsDetected = false; // Would need a more complex detection method
        if (!privacyExtensionsDetected) {
            privacyScore -= 15;
            issues.push("No privacy-enhancing browser extensions detected");
        }
        
        // Determine overall rating
        let rating, color;
        if (privacyScore >= 80) {
            rating = "Excellent";
            color = "#2ecc71"; // Green
        } else if (privacyScore >= 60) {
            rating = "Good";
            color = "#3498db"; // Blue
        } else if (privacyScore >= 40) {
            rating = "Fair";
            color = "#f39c12"; // Orange
        } else {
            rating = "Poor";
            color = "#e74c3c"; // Red
        }
        
        return {
            score: Math.max(0, privacyScore), // Ensure score isn't negative
            rating,
            color,
            issues,
            recommendations: this.getPrivacyRecommendations(issues)
        };
    }
    
    getPrivacyRecommendations(issues) {
        const recommendations = [];
        
        if (issues.includes("Do Not Track is not enabled")) {
            recommendations.push("Enable 'Do Not Track' in your browser settings");
        }
        
        if (issues.includes("Canvas fingerprinting is possible")) {
            recommendations.push("Use a browser extension that blocks fingerprinting or switch to a privacy-focused browser");
        }
        
        if (issues.includes("WebRTC might expose your local IP addresses")) {
            recommendations.push("Install a WebRTC blocking extension or disable WebRTC in your browser");
        }
        
        if (issues.includes("Third-party cookies are accepted")) {
            recommendations.push("Block third-party cookies in your browser settings");
        }
        
        if (issues.includes("Not using a privacy-focused browser")) {
            recommendations.push("Consider switching to Firefox, Brave, or Tor Browser");
        }
        
        if (issues.includes("No privacy-enhancing browser extensions detected")) {
            recommendations.push("Install privacy extensions like Privacy Badger, uBlock Origin, or HTTPS Everywhere");
        }
        
        // Add general recommendations if we don't have specific ones
        if (recommendations.length === 0) {
            recommendations.push("Regularly clear your browser cookies and cache");
            recommendations.push("Consider using a VPN for additional privacy");
        }
        
        return recommendations;
    }

    analyzeTrackingVulnerability(baseData) {
        // This would include analysis of which tracking methods would work on this browser
        const vulnerabilities = [];
        
        // Check if cookies are enabled
        if (baseData.navigator && baseData.navigator.cookieEnabled) {
            vulnerabilities.push({
                name: "Cookie Tracking",
                description: "Your browser accepts cookies which can be used to track you across websites",
                severity: "High"
            });
        }
        
        // Check for localStorage availability
        if (baseData.navigator && baseData.navigator.localStorageAvailable) {
            vulnerabilities.push({
                name: "Local Storage Tracking",
                description: "Sites can store tracking data in your browser's localStorage",
                severity: "Medium"
            });
        }
        
        // Check for canvas fingerprinting
        if (baseData.fingerprinting && baseData.fingerprinting.canvas && !baseData.fingerprinting.canvas.error) {
            vulnerabilities.push({
                name: "Canvas Fingerprinting",
                description: "Your browser can be identified using canvas rendering differences",
                severity: "High"
            });
        }
        
        // Check for WebGL fingerprinting
        if (baseData.fingerprinting && baseData.fingerprinting.webGL && !baseData.fingerprinting.webGL.error) {
            vulnerabilities.push({
                name: "WebGL Fingerprinting",
                description: "Your graphics hardware creates a unique signature",
                severity: "Medium"
            });
        }
        
        // Check for audio API fingerprinting
        if (baseData.fingerprinting && baseData.fingerprinting.audio && !baseData.fingerprinting.audio.error) {
            vulnerabilities.push({
                name: "Audio API Fingerprinting",
                description: "Audio processing characteristics can be used to identify your device",
                severity: "Medium"
            });
        }
        
        // Check for navigator enumeration
        if (baseData.navigator) {
            vulnerabilities.push({
                name: "Navigator Object Enumeration",
                description: "Browser details like plugins, platform and user agent can identify you",
                severity: "Medium"
            });
        }
        
        return {
            count: vulnerabilities.length,
            items: vulnerabilities,
            summary: this.getTrackingSummary(vulnerabilities)
        };
    }
    
    getTrackingSummary(vulnerabilities) {
        const highSeverityCount = vulnerabilities.filter(v => v.severity === "High").length;
        
        if (highSeverityCount >= 2) {
            return "Your browser is highly vulnerable to multiple tracking techniques";
        } else if (highSeverityCount === 1) {
            return "Your browser has some significant tracking vulnerabilities";
        } else if (vulnerabilities.length > 0) {
            return "Your browser has a few tracking vulnerabilities, but they are not severe";
        } else {
            return "Your browser appears well-protected against common tracking methods";
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula to calculate distance between two points on Earth
        const R = 6371; // Earth radius in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c; // Distance in kilometers
        return distance;
    }
    
    deg2rad(deg) {
        return deg * (Math.PI/180);
    }
}

// Create global instance
window.insightsCollector = new InsightsCollector();
