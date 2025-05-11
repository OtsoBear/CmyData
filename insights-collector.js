/**
 * Insights Collector
 * Provides additional insights and analysis based on collected browser data
 */
class InsightsCollector {
    constructor() {
        console.log('InsightsCollector initialized');
        
        // Safely wrap collection methods to prevent errors from breaking the UI
        if (window.DataValidator && window.DataValidator.safeDataCollection) {
            this.collectAllInsights = window.DataValidator.safeDataCollection(this.collectAllInsights.bind(this));
        }
    }

    /**
     * Collects all insights based on provided browser data
     * @param {Object} collectedData Data from basic and enhanced collectors
     * @returns {Promise<Object>} Insights object
     */
    async collectAllInsights(collectedData) {
        console.log('Collecting insights...');
        
        if (window.startTiming) window.startTiming('insights', 'Insights Analysis');
        
        try {
            // Validate input data
            if (!collectedData) {
                throw new Error('No data provided to insights collector');
            }
            
            // Extract geolocation for location-based insights
            let coords = null;
            if (collectedData.geolocation && 
                collectedData.geolocation.latitude && 
                collectedData.geolocation.longitude &&
                !collectedData.geolocation.error) {
                coords = {
                    latitude: collectedData.geolocation.latitude,
                    longitude: collectedData.geolocation.longitude
                };
            } else if (collectedData.network?.ip?.geolocation) {
                // Fall back to IP-based geolocation if available
                const geo = collectedData.network.ip.geolocation;
                if (geo.latitude && geo.longitude) {
                    coords = {
                        latitude: geo.latitude,
                        longitude: geo.longitude
                    };
                }
            }
            
            // Collect insights in parallel to improve performance
            const [issData, weatherData, astronomyData, privacyScore, fingerprintScore, carbonFootprint] = await Promise.all([
                this.getISSDistance(coords),
                this.getWeatherData(coords),
                this.getAstronomyData(coords),
                this.analyzePrivacy(collectedData),
                this.analyzeFingerprintUniqueness(collectedData),
                this.estimateCarbonFootprint(collectedData)
            ]);
            
            const insights = {
                iss: issData,
                weather: weatherData,
                astronomy: astronomyData,
                privacyScore,
                fingerprint: fingerprintScore,
                carbonFootprint
            };
            
            console.log('Insights collection complete');
            
            if (window.endTiming) window.endTiming('insights');
            return insights;
        } catch (error) {
            console.error('Error in insights collection:', error);
            
            if (window.endTiming) window.endTiming('insights');
            return {
                error: 'Failed to collect insights: ' + error.message
            };
        }
    }

    /**
     * Calculates distance to the International Space Station
     * @param {Object|null} coords User coordinates
     * @returns {Promise<Object>} ISS distance data
     */
    async getISSDistance(coords) {
        if (window.startTiming) window.startTiming('insights-iss');
        
        try {
            if (!coords) {
                return {
                    error: 'Geolocation data required to calculate distance to ISS'
                };
            }
            
            // Fetch the current ISS position
            const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
            
            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${response.statusText}`);
            }
            
            const issData = await response.json();
            
            // Calculate distance between user and ISS
            const distance = this.calculateDistance(
                coords.latitude, coords.longitude,
                issData.latitude, issData.longitude
            );
            
            const result = {
                issPosition: {
                    latitude: issData.latitude,
                    longitude: issData.longitude,
                    altitude: issData.altitude
                },
                distance: {
                    km: Math.round(distance),
                    miles: Math.round(distance * 0.621371)
                },
                timestamp: issData.timestamp * 1000 // Convert to milliseconds
            };
            
            if (window.endTiming) window.endTiming('insights-iss');
            return result;
        } catch (error) {
            console.error('Error getting ISS distance:', error);
            
            if (window.endTiming) window.endTiming('insights-iss');
            return {
                error: 'Failed to get ISS location: ' + error.message
            };
        }
    }

    /**
     * Gets weather data for the user's location
     * @param {Object|null} coords User coordinates
     * @returns {Promise<Object>} Weather data
     */
    async getWeatherData(coords) {
        if (window.startTiming) window.startTiming('insights-weather');
        
        try {
            if (!coords) {
                return {
                    error: 'Geolocation data required to get weather information'
                };
            }
            
            // Use OpenWeatherMap API (normally would use API key)
            // For demo purposes, we'll simulate the response
            
            // In production, would use:
            // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${API_KEY}&units=metric`);
            // const weatherData = await response.json();
            
            // Simulate weather data based on location and time
            const now = new Date();
            const season = this.getSeason(coords.latitude, now);
            const hour = now.getHours();
            const isDaytime = hour >= 6 && hour < 18;
            
            const simulatedConditions = [
                'Clear sky', 'Partly cloudy', 'Cloudy', 
                'Light rain', 'Moderate rain', 'Heavy rain',
                'Thunderstorm', 'Fog', 'Snow', 'Drizzle'
            ];
            
            // Pseudo-random but consistent weather based on coordinates
            const hashValue = Math.abs(coords.latitude * 10 + coords.longitude * 10);
            const conditionIndex = hashValue % simulatedConditions.length;
            const condition = simulatedConditions[conditionIndex];
            
            // Base temperature on season and latitude
            let baseTemp = 20; // Default moderate temperature
            if (Math.abs(coords.latitude) > 60) {
                baseTemp = 5; // Colder at extreme latitudes
            } else if (Math.abs(coords.latitude) > 30) {
                baseTemp = 15; // Moderate at middle latitudes
            }
            
            // Adjust for season
            let seasonalModifier = 0;
            if (season === 'Summer') seasonalModifier = 15;
            else if (season === 'Winter') seasonalModifier = -15;
            else seasonalModifier = 0; // Spring/Fall
            
            // Day/night adjustment
            const timeModifier = isDaytime ? 5 : -5;
            
            // Randomize slightly to simulate real weather variation
            const randomModifier = (Math.sin(hashValue) * 5);
            
            const tempCelsius = baseTemp + seasonalModifier + timeModifier + randomModifier;
            
            const result = {
                location: this.estimateLocationName(coords.latitude, coords.longitude),
                country: this.estimateCountry(coords.latitude, coords.longitude),
                temperature: {
                    celsius: tempCelsius.toFixed(1),
                    fahrenheit: (tempCelsius * 9/5 + 32).toFixed(1)
                },
                conditions: condition,
                humidity: Math.floor(hashValue % 50) + 30, // Random humidity between 30-80%
                windSpeed: (Math.abs(Math.sin(hashValue)) * 10).toFixed(1), // Random wind speed
                note: 'This is simulated weather data for demonstration purposes.'
            };
            
            if (window.endTiming) window.endTiming('insights-weather');
            return result;
        } catch (error) {
            console.error('Error getting weather data:', error);
            
            if (window.endTiming) window.endTiming('insights-weather');
            return {
                error: 'Failed to get weather information: ' + error.message
            };
        }
    }

    /**
     * Gets astronomy data for the user's location (sunrise, sunset, etc.)
     * @param {Object|null} coords User coordinates
     * @returns {Promise<Object>} Astronomy data
     */
    async getAstronomyData(coords) {
        if (window.startTiming) window.startTiming('insights-astronomy');
        
        try {
            if (!coords) {
                return {
                    error: 'Geolocation data required to calculate astronomical data'
                };
            }
            
            // Calculate sunrise and sunset times using SunCalc library
            // For demo purposes, we'll use a simplified calculation
            const now = new Date();
            const januaryDay = new Date(now.getFullYear(), 0, 1);
            const dayOfYear = Math.floor((now - januaryDay) / 86400000);
            
            // Simple sunrise/sunset approximation
            const latitude = coords.latitude;
            
            // Base times (approximate)
            let baseSunriseHour = 6; // 6 AM
            let baseSunsetHour = 18; // 6 PM
            
            // Adjust for latitude and season
            const latitudeAdjustment = latitude / 90; // -1 to 1 range
            const seasonalAdjustment = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 2; // -2 to 2 hours
            
            // Higher latitudes have more extreme day length variations
            const latitudeSeasonalEffect = Math.abs(latitudeAdjustment) * seasonalAdjustment;
            
            baseSunriseHour -= latitudeSeasonalEffect;
            baseSunsetHour += latitudeSeasonalEffect;
            
            // Format times
            const sunriseDate = new Date(now);
            sunriseDate.setHours(baseSunriseHour, (baseSunriseHour % 1) * 60, 0);
            
            const sunsetDate = new Date(now);
            sunsetDate.setHours(baseSunsetHour, (baseSunsetHour % 1) * 60, 0);
            
            // Calculate day length
            const dayLength = (baseSunsetHour - baseSunriseHour);
            const dayLengthHours = Math.floor(dayLength);
            const dayLengthMinutes = Math.floor((dayLength - dayLengthHours) * 60);
            
            // Calculate solar noon
            const solarNoonDate = new Date(now);
            const solarNoonHour = (baseSunriseHour + baseSunsetHour) / 2;
            solarNoonDate.setHours(solarNoonHour, (solarNoonHour % 1) * 60, 0);
            
            // Solar position calculation
            const hourAngle = (now.getHours() + now.getMinutes() / 60 - 12) * 15;
            const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180);
            
            const altitude = Math.asin(
                Math.sin(latitude * Math.PI / 180) * Math.sin(declination * Math.PI / 180) +
                Math.cos(latitude * Math.PI / 180) * Math.cos(declination * Math.PI / 180) * 
                Math.cos(hourAngle * Math.PI / 180)
            ) * 180 / Math.PI;
            
            const azimuth = Math.atan2(
                Math.sin(hourAngle * Math.PI / 180),
                Math.cos(hourAngle * Math.PI / 180) * Math.sin(latitude * Math.PI / 180) -
                Math.tan(declination * Math.PI / 180) * Math.cos(latitude * Math.PI / 180)
            ) * 180 / Math.PI + 180;
            
            let solarDescription;
            if (altitude > 15) {
                solarDescription = "The sun is high in the sky.";
            } else if (altitude > 0) {
                solarDescription = "The sun is low on the horizon.";
            } else if (altitude > -6) {
                solarDescription = "Civil twilight - it's dusk/dawn.";
            } else if (altitude > -12) {
                solarDescription = "Nautical twilight - the horizon is barely visible.";
            } else if (altitude > -18) {
                solarDescription = "Astronomical twilight - the sky is dark enough for most astronomical observations.";
            } else {
                solarDescription = "It's night time - the sun is far below the horizon.";
            }
            
            const result = {
                sunriseTime: sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sunsetTime: sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                dayLength: `${dayLengthHours}h ${dayLengthMinutes}m`,
                solarNoon: solarNoonDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                currentSolarPosition: {
                    altitude: altitude.toFixed(1),
                    azimuth: azimuth.toFixed(1),
                    description: solarDescription
                },
                note: 'This is approximated astronomical data for demonstration purposes.'
            };
            
            if (window.endTiming) window.endTiming('insights-astronomy');
            return result;
        } catch (error) {
            console.error('Error calculating astronomy data:', error);
            
            if (window.endTiming) window.endTiming('insights-astronomy');
            return {
                error: 'Failed to calculate astronomical data: ' + error.message
            };
        }
    }

    /**
     * Analyzes browser privacy protections
     * @param {Object} data Collected browser data
     * @returns {Promise<Object>} Privacy score and recommendations
     */
    async analyzePrivacy(data) {
        if (window.startTiming) window.startTiming('insights-privacy');
        
        try {
            const privacyIssues = [];
            const privacyRecommendations = [];
            let score = 100; // Start with perfect score and deduct points
            
            // Check for basic privacy protections
            if (data.navigator) {
                // Check Do Not Track setting
                if (!data.navigator.doNotTrack || data.navigator.doNotTrack !== '1') {
                    privacyIssues.push("Do Not Track is not enabled");
                    privacyRecommendations.push("Enable 'Do Not Track' in your browser settings");
                    score -= 10;
                }
                
                // Check for excessive plugin exposure
                if (data.navigator.plugins && data.navigator.plugins.length > 5) {
                    privacyIssues.push("Your browser exposes multiple plugins, increasing fingerprinting risk");
                    privacyRecommendations.push("Disable unnecessary browser plugins");
                    score -= 5;
                }
            }
            
            // Check for WebRTC leaks
            if (data.webrtc && data.webrtc.leakDetected) {
                privacyIssues.push("WebRTC may leak your local IP address");
                privacyRecommendations.push("Install a WebRTC blocking extension or disable WebRTC in your browser");
                score -= 15;
            }
            
            // Check for Canvas fingerprinting resistance
            if (data.fingerprinting && 
                data.fingerprinting.canvas && 
                !data.fingerprinting.canvas.error) {
                privacyIssues.push("Your browser can be tracked via canvas fingerprinting");
                privacyRecommendations.push("Use a browser with anti-fingerprinting protections like Firefox with privacy settings or Tor Browser");
                score -= 12;
            }
            
            // Check for hardware info exposure
            if (data.navigator && data.navigator.hardwareConcurrency && data.navigator.deviceMemory) {
                privacyIssues.push("Your browser reveals hardware information (CPU cores, memory)");
                privacyRecommendations.push("Use a browser that limits hardware information exposure");
                score -= 8;
            }
            
            // Check connection info exposure
            if (data.connection && 
                data.connection.connection && 
                typeof data.connection.connection === 'object' &&
                data.connection.connection.effectiveType) {
                privacyIssues.push("Your browser reveals network connection details");
                score -= 5;
            }
            
            // Check HTTPS
            if (data.security && !data.security.https) {
                privacyIssues.push("You're not using a secure HTTPS connection");
                privacyRecommendations.push("Always use websites with HTTPS connections");
                score -= 20;
            }
            
            // Check media device info
            if (data.media && 
                ((data.media.videoinput && data.media.videoinput.length > 0) ||
                 (data.media.audioinput && data.media.audioinput.length > 0))) {
                privacyIssues.push("Your browser exposes media devices information");
                score -= 8;
            }
            
            // Ensure score stays within 0-100 range
            score = Math.max(0, Math.min(100, score));
            
            // Generate rating based on score
            let rating;
            let color;
            
            if (score >= 90) {
                rating = 'Excellent';
                color = '#2ecc71'; // Green
            } else if (score >= 70) {
                rating = 'Good';
                color = '#27ae60'; // Dark green
            } else if (score >= 50) {
                rating = 'Fair';
                color = '#f39c12'; // Orange
            } else if (score >= 30) {
                rating = 'Poor';
                color = '#e67e22'; // Dark orange
            } else {
                rating = 'Very Poor';
                color = '#e74c3c'; // Red
            }
            
            const result = {
                score,
                rating,
                color,
                issues: privacyIssues,
                recommendations: privacyRecommendations
            };
            
            if (window.endTiming) window.endTiming('insights-privacy');
            return result;
        } catch (error) {
            console.error('Error analyzing privacy:', error);
            
            if (window.endTiming) window.endTiming('insights-privacy');
            return {
                error: 'Failed to analyze privacy: ' + error.message
            };
        }
    }

    /**
     * Analyzes browser fingerprint uniqueness
     * @param {Object} data Collected browser data
     * @returns {Promise<Object>} Fingerprint uniqueness score
     */
    async analyzeFingerprintUniqueness(data) {
        if (window.startTiming) window.startTiming('insights-fingerprint');
        
        try {
            // Count unique identifying factors from data
            // Note: In a real app, we'd compare these against a database of known values
            let uniquenessFactors = 0;
            let maxFactors = 0;
            
            // Helper to track factors
            const addFactor = (condition, weight = 1) => {
                maxFactors += weight;
                if (condition) uniquenessFactors += weight;
            };
            
            // Screen and resolution uniqueness
            if (data.screen && data.screen.screen) {
                addFactor(true, 2); // Having screen info at all
                
                // Unusual resolution
                const width = data.screen.screen.width;
                const height = data.screen.screen.height;
                const isCommonResolution = (
                    (width === 1920 && height === 1080) || 
                    (width === 1366 && height === 768) || 
                    (width === 1536 && height === 864) || 
                    (width === 1440 && height === 900) || 
                    (width === 1280 && height === 720)
                );
                addFactor(!isCommonResolution, 3);
                
                // Unusual pixel depth
                addFactor(data.screen.screen.pixelDepth !== 24, 2);
                
                // Unusual color depth
                addFactor(data.screen.screen.colorDepth !== 24, 2);
            }
            
            // Browser and OS uniqueness
            if (data.navigator) {
                // User agent uniqueness
                addFactor(true, 2); // Base factor for user agent
                
                // Check for uncommon browser
                const commonBrowsers = ['chrome', 'firefox', 'safari', 'edge'];
                const ua = data.navigator.userAgent.toLowerCase();
                const isCommonBrowser = commonBrowsers.some(browser => ua.includes(browser));
                addFactor(!isCommonBrowser, 3);
                
                // Hardware info
                addFactor(!!data.navigator.hardwareConcurrency, 3);
                addFactor(!!data.navigator.deviceMemory, 3);
                
                // Language settings
                addFactor(data.navigator.language !== 'en-US', 2);
                
                // Plugins
                if (data.navigator.plugins && data.navigator.plugins.length > 0) {
                    addFactor(true, 2); // Base factor for having plugins
                    addFactor(data.navigator.plugins.length > 5, 2); // Many plugins is more unique
                    
                    // Uncommon plugins would be even more unique
                    // (simplified implementation)
                }
            }
            
            // Canvas fingerprinting uniqueness
            if (data.fingerprinting && data.fingerprinting.canvas && !data.fingerprinting.canvas.error) {
                addFactor(true, 5); // Canvas fingerprinting is highly identifying
            }
            
            // WebGL fingerprinting
            if (data.fingerprinting && data.fingerprinting.webGL) {
                addFactor(true, 4); // WebGL info is somewhat identifying
                addFactor(!!data.fingerprinting.webGL.unmaskedVendor, 3); // Unmasked info is more unique
            }
            
            // Enhanced data checks
            if (data.fonts) {
                addFactor(true, 3); // Font detection adds uniqueness
                addFactor(data.fonts.detectedCount > 20, 2); // Many fonts is more unique
            }
            
            if (data.graphics && data.graphics.webgl && data.graphics.webgl.unmaskedRenderer) {
                addFactor(true, 4); // GPU info is quite identifying
            }
            
            // Calculate uniqueness percentage
            const uniquenessScore = Math.round((uniquenessFactors / maxFactors) * 100);
            
            // Generate interpretation
            let interpretation;
            if (uniquenessScore < 30) {
                interpretation = "Your browser has good protections against fingerprinting. You're less likely to be uniquely identified across websites.";
            } else if (uniquenessScore < 60) {
                interpretation = "Your browser has some fingerprinting surface area. You may be identifiable on some websites.";
            } else {
                interpretation = "Your browser appears to have a highly unique fingerprint. You can likely be identified across websites based on browser characteristics alone.";
            }
            
            const result = {
                score: uniquenessScore,
                interpretation,
                fingerprintingElements: maxFactors
            };
            
            if (window.endTiming) window.endTiming('insights-fingerprint');
            return result;
        } catch (error) {
            console.error('Error analyzing fingerprint:', error);
            
            if (window.endTiming) window.endTiming('insights-fingerprint');
            return {
                error: 'Failed to analyze fingerprint uniqueness: ' + error.message
            };
        }
    }

    /**
     * Estimates carbon footprint of web browsing
     * @param {Object} data Collected browser data
     * @returns {Promise<Object>} Carbon footprint estimates
     */
    async estimateCarbonFootprint(data) {
        if (window.startTiming) window.startTiming('insights-carbon');
        
        try {
            // Base carbon value for web browsing
            let baseCarbonPerHour = 0.06; // kgCO2e per hour (very rough estimate)
            
            // Adjust based on device type and performance
            let deviceMultiplier = 1.0;
            
            // Check for mobile vs desktop
            if (data.navigator && data.navigator.userAgent) {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
                    .test(data.navigator.userAgent);
                    
                deviceMultiplier = isMobile ? 0.7 : 1.2; // Mobile uses less power generally
            }
            
            // Adjust for hardware capabilities
            if (data.navigator && data.navigator.hardwareConcurrency) {
                const cores = parseFloat(data.navigator.hardwareConcurrency);
                if (!isNaN(cores)) {
                    deviceMultiplier *= (0.8 + (cores / 16) * 0.4); // More cores = more power
                }
            }
            
            // Adjust for screen size
            if (data.screen && data.screen.screen) {
                const area = (data.screen.screen.width * data.screen.screen.height) / 1000000; // in millions of pixels
                deviceMultiplier *= (0.8 + area * 0.2); // Larger screens use more power
            }
            
            // Adjust for connection type (mobile networks use more energy)
            if (data.connection && data.connection.connection && data.connection.connection.effectiveType) {
                const connectionType = data.connection.connection.effectiveType;
                if (connectionType === '4g') {
                    deviceMultiplier *= 1.1;
                } else if (connectionType === '3g') {
                    deviceMultiplier *= 1.2;
                } else if (connectionType === '2g' || connectionType === 'slow-2g') {
                    deviceMultiplier *= 1.3;
                }
            }
            
            // Calculate hourly carbon footprint
            const hourlyCarbon = baseCarbonPerHour * deviceMultiplier;
            
            // Calculate other time periods
            const dailyCarbon = hourlyCarbon * 5; // Assuming 5 hours per day
            const yearlyCarbon = dailyCarbon * 365;
            
            // Calculate equivalent values for context
            const kmDriven = Math.round(yearlyCarbon * 6); // ~6km per kgCO2e
            const coffeeEquivalent = Math.round(yearlyCarbon * 53); // ~53 cups per kgCO2e
            
            const result = {
                hourly: hourlyCarbon.toFixed(4),
                daily: dailyCarbon.toFixed(3),
                yearly: yearlyCarbon.toFixed(2),
                comparisons: {
                    kmDriven,
                    coffeeEquivalent
                },
                note: 'This is an approximation based on device type, screen size, and estimated usage patterns. Actual values may vary significantly.'
            };
            
            if (window.endTiming) window.endTiming('insights-carbon');
            return result;
        } catch (error) {
            console.error('Error estimating carbon footprint:', error);
            
            if (window.endTiming) window.endTiming('insights-carbon');
            return {
                error: 'Failed to estimate carbon footprint: ' + error.message
            };
        }
    }

    /* ----- Helper methods ----- */

    /**
     * Calculates distance between two lat/long points in kilometers (Haversine formula)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Determines current season based on latitude and date
     */
    getSeason(latitude, date) {
        const month = date.getMonth() + 1; // 1 = January, 12 = December
        
        // Northern hemisphere seasons
        if (latitude >= 0) {
            if (month >= 3 && month <= 5) return 'Spring';
            if (month >= 6 && month <= 8) return 'Summer';
            if (month >= 9 && month <= 11) return 'Fall';
            return 'Winter';
        } 
        // Southern hemisphere (reversed seasons)
        else {
            if (month >= 3 && month <= 5) return 'Fall';
            if (month >= 6 && month <= 8) return 'Winter';
            if (month >= 9 && month <= 11) return 'Spring';
            return 'Summer';
        }
    }

    /**
     * Roughly estimates location name based on coordinates
     * In a real app, this would use a geolocation API
     */
    estimateLocationName(latitude, longitude) {
        // Very simplistic mapping for demo purposes
        if (latitude > 40 && latitude < 50 && longitude > -80 && longitude < -70) return 'New York Area';
        if (latitude > 30 && latitude < 40 && longitude > -120 && longitude < -110) return 'Los Angeles Area';
        if (latitude > 50 && latitude < 55 && longitude > -1 && longitude < 1) return 'London Area';
        if (latitude > 48 && latitude < 50 && longitude > 1 && longitude < 3) return 'Paris Area';
        if (latitude > -35 && latitude < -33 && longitude > 150 && longitude < 152) return 'Sydney Area';
        
        return 'Unknown Location';
    }

    /**
     * Roughly estimates country based on coordinates
     */
    estimateCountry(latitude, longitude) {
        // Very simplistic mapping for demo purposes
        if (latitude > 25 && latitude < 50 && longitude > -125 && longitude < -65) return 'United States';
        if (latitude > 35 && latitude < 60 && longitude > -10 && longitude < 25) return 'Europe';
        if (latitude > -10 && latitude < 35 && longitude > 65 && longitude < 90) return 'India';
        if (latitude > 20 && latitude < 40 && longitude > 100 && longitude < 145) return 'China';
        if (latitude > -40 && latitude < -10 && longitude > 110 && longitude < 155) return 'Australia';
        
        return 'Unknown Country';
    }
}

// Create global instance
window.insightsCollector = new InsightsCollector();
