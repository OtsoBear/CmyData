/**
 * Loading Tracker
 * Monitors and displays progress of data collection operations using manual timing calls.
 */

class LoadingTracker {
    constructor() {
        this.steps = [
            // Keep the main steps definition
            { id: 'scan', name: 'Overall Scan', weight: 0 }, // Add an overall step
            { id: 'initialization', name: 'Initializing', weight: 5, timeEstimate: 50 },
            { id: 'basicInfo', name: 'Collecting Basic Browser Info', weight: 10, timeEstimate: 50 },
            { id: 'processing-basic', name: 'Processing Basic Data', weight: 2, timeEstimate: 20 }, // Example processing step
            { id: 'deviceInfo', name: 'Analyzing Device Information', weight: 15, timeEstimate: 700,
              subSteps: [
                { id: 'deviceInfo-hardware', name: 'Hardware Detection', weight: 4 },
                { id: 'deviceInfo-platform', name: 'Platform Analysis', weight: 3 },
                { id: 'deviceInfo-screen', name: 'Screen Configuration', weight: 3 },
                { id: 'deviceInfo-memory', name: 'Memory Assessment', weight: 5 }
              ]
            },
            { id: 'processing-device', name: 'Processing Device Data', weight: 3, timeEstimate: 30 }, // Example processing step
            { id: 'graphicsInfo', name: 'Processing Graphics Data', weight: 20, timeEstimate: 1500, isHeavy: true },
            { id: 'processing-graphics', name: 'Processing Graphics Data', weight: 3, timeEstimate: 30 }, // Example processing step
            { id: 'networkInfo', name: 'Checking Network Status', weight: 15, timeEstimate: 1000 },
            { id: 'processing-network', name: 'Processing Network Data', weight: 2, timeEstimate: 20 }, // Example processing step
            { id: 'storageInfo', name: 'Scanning Storage Information', weight: 10, timeEstimate: 500 },
            { id: 'localizationInfo', name: 'Detecting Localization Settings', weight: 10, timeEstimate: 400 },
            { id: 'fingerprinting', name: 'Calculating Fingerprint', weight: 25, timeEstimate: 2000, isHeavy: true,
              subSteps: [
                { id: 'fingerprinting-canvas', name: 'Canvas Fingerprinting', weight: 5 },
                { id: 'fingerprinting-webgl', name: 'WebGL Analysis', weight: 6 },
                { id: 'fingerprinting-fonts', name: 'Font Enumeration', weight: 5 },
                { id: 'fingerprinting-audio', name: 'Audio Context Analysis', weight: 4 },
                { id: 'fingerprinting-browser', name: 'Browser Feature Detection', weight: 5 }
              ]
            },
            { id: 'processing-fingerprint', name: 'Processing Fingerprint Data', weight: 5, timeEstimate: 50 }, // Example processing step
            { id: 'finalization', name: 'Finalizing Results & UI', weight: 10, timeEstimate: 300 }
        ];

        // Recalculate total weight excluding the 'scan' step
        this.totalWeight = this.steps.filter(s => s.id !== 'scan').reduce((sum, step) => sum + step.weight, 0);

        // Initialize trackers for substeps
        this.steps.forEach(step => {
            if (step.subSteps) {
                step.currentSubStep = -1;
                step.subStepTimings = {};
            }
        });

        // Initialize general tracking variables
        this.currentStepId = null;
        this.currentStepIndex = -1; // Index relative to steps array
        this.actualTimings = {}; // Stores duration for each stepId
        this.stepStartTimes = {}; // Stores start time for each stepId
        this.subStepTimings = {}; // Stores { parentStepId: { subStepId: { start, end, duration, name } } }
        this.startTime = null; // Overall scan start time
        this.isRunning = false;

        this.setupUI();
    }

    setupUI() {
        this.progressBarContainer = document.createElement('div');
        this.progressBarContainer.className = 'progress-container';

        this.progressBar = document.createElement('div');
        this.progressBar.className = 'progress-bar';

        this.progressBarFill = document.createElement('div');
        this.progressBarFill.className = 'progress-bar-fill';
        this.progressBar.appendChild(this.progressBarFill);

        this.progressStatus = document.createElement('div');
        this.progressStatus.className = 'progress-status';

        this.progressDetails = document.createElement('div');
        this.progressDetails.className = 'progress-details';

        this.progressBarContainer.appendChild(this.progressBar);
        this.progressBarContainer.appendChild(this.progressStatus);
        this.progressBarContainer.appendChild(this.progressDetails);

        // Insert into loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.appendChild(this.progressBarContainer);
        }
    }

    _getStepById(stepId) {
        return this.steps.find(s => s.id === stepId);
    }

    _getSubStepById(parentStepId, subStepId) {
        const parentStep = this._getStepById(parentStepId);
        return parentStep?.subSteps?.find(s => s.id === subStepId);
    }

    _startStep(stepId) {
        if (stepId === 'scan' && !this.isRunning) {
            this.startTime = performance.now();
            this.isRunning = true;
            this.currentStepId = 'scan';
            this.stepStartTimes[stepId] = this.startTime;
            this.actualTimings = {}; // Reset timings
            this.subStepTimings = {}; // Reset sub-step timings
            this.updateProgress(0, 'Starting scan...');
            console.log(`📊 Scan started.`);
            return;
        }

        if (!this.isRunning) {
            console.warn(`📊 Cannot start step "${stepId}" - Scan not running. Call startTiming('scan') first.`);
            return;
        }

        const step = this._getStepById(stepId);
        if (!step) {
            console.warn(`📊 Unknown step ID "${stepId}" for startTiming.`);
            return;
        }

        this.currentStepId = stepId;
        this.stepStartTimes[stepId] = performance.now();

        const stepIndex = this.steps.findIndex(s => s.id === stepId);
        const completedWeight = this.steps
            .slice(0, stepIndex)
            .filter(s => s.id !== 'scan')
            .reduce((sum, s) => sum + s.weight, 0);

        const progress = this.totalWeight > 0 ? (completedWeight / this.totalWeight) * 100 : 0;

        const stepDisplay = step.isHeavy ?
            `${step.name} <span class="heavy-task">(may take longer)</span>` :
            step.name;

        this.updateProgress(progress, stepDisplay);
        console.log(`📊 Started step: ${step.name}`);
    }

    _endStep(stepId) {
        if (!this.isRunning) {
            console.warn(`📊 Cannot end step "${stepId}" - Scan not running.`);
            return 0;
        }

        const startTime = this.stepStartTimes[stepId];
        if (startTime === undefined) {
            console.warn(`📊 Cannot end step "${stepId}" - Step was not started.`);
            return 0;
        }

        const endTime = performance.now();
        const duration = endTime - startTime;
        this.actualTimings[stepId] = duration;
        delete this.stepStartTimes[stepId];

        const step = this._getStepById(stepId);
        console.log(`📊 Ended step: ${step?.name || stepId} in ${Math.round(duration)}ms`);

        if (stepId === 'scan') {
            this.isRunning = false;
            this.complete(duration);
        } else {
            const stepIndex = this.steps.findIndex(s => s.id === stepId);
            const completedWeight = this.steps
                .slice(0, stepIndex + 1)
                .filter(s => s.id !== 'scan')
                .reduce((sum, s) => sum + s.weight, 0);
            const progress = this.totalWeight > 0 ? (completedWeight / this.totalWeight) * 100 : 0;
            this.updateProgress(progress, step?.name || stepId);
        }

        return duration;
    }

    _startSubStep(parentStepId, subStepId, displayName) {
        if (!this.isRunning) return;

        const parentStep = this._getStepById(parentStepId);
        if (!parentStep || !parentStep.subSteps) {
            console.warn(`📊 Parent step "${parentStepId}" not found or has no sub-steps.`);
            return;
        }

        let subStep = this._getSubStepById(parentStepId, subStepId);
        if (!subStep) {
            console.warn(`📊 Sub-step "${subStepId}" not pre-defined for "${parentStepId}". Using provided name.`);
            subStep = { id: subStepId, name: displayName || subStepId, weight: 0 };
        }

        if (!this.subStepTimings[parentStepId]) {
            this.subStepTimings[parentStepId] = {};
        }

        this.subStepTimings[parentStepId][subStepId] = {
            start: performance.now(),
            name: subStep.name
        };

        const currentProgress = this.getCurrentProgressPercent();
        this.updateProgress(
            currentProgress,
            `${parentStep.name} - ${subStep.name}`
        );

        console.log(`📊 Started sub-step: ${parentStepId} > ${subStep.name}`);
    }

    _endSubStep(parentStepId, subStepId) {
        if (!this.isRunning || !this.subStepTimings[parentStepId] || !this.subStepTimings[parentStepId][subStepId]) {
            console.warn(`📊 Cannot end sub-step "${parentStepId} > ${subStepId}" - Not started or scan not running.`);
            return 0;
        }

        const subTiming = this.subStepTimings[parentStepId][subStepId];
        const now = performance.now();
        const startTime = subTiming.start;
        const duration = now - startTime;

        subTiming.end = now;
        subTiming.duration = duration;

        const parentStep = this._getStepById(parentStepId);
        console.log(`📊 Completed sub-step: ${parentStepId} > ${subTiming.name} in ${Math.round(duration)}ms`);

        if (parentStep && this.currentStepId === parentStepId) {
            const stepDisplay = parentStep.isHeavy ?
                `${parentStep.name} <span class="heavy-task">(may take longer)</span>` :
                parentStep.name;

            this.updateProgress(this.getCurrentProgressPercent(), stepDisplay);
        }
        return duration;
    }

    getCurrentProgressPercent() {
        if (!this.currentStepId || this.currentStepId === 'scan') return 0;

        const stepIndex = this.steps.findIndex(s => s.id === this.currentStepId);
        if (stepIndex < 0) return 0;

        const completedWeight = this.steps
            .slice(0, stepIndex)
            .filter(s => s.id !== 'scan')
            .reduce((sum, s) => sum + s.weight, 0);

        return this.totalWeight > 0 ? (completedWeight / this.totalWeight) * 100 : 0;
    }

    start() {
        this.startTime = null;
        this.isRunning = false;
        this.currentStepId = null;
        this.actualTimings = {};
        this.subStepTimings = {};
        this.stepStartTimes = {};
        this.updateProgress(0, 'Ready to scan...');
    }

    nextStep() {
        console.warn("nextStep() is deprecated. Use startTiming('stepId') instead.");
        return null;
    }

    updateProgress(percent, statusText) {
        this.progressBarFill.style.width = `${percent}%`;
        this.progressStatus.innerHTML = statusText;

        const formattedPercent = Math.round(percent);
        this.progressDetails.textContent = `${formattedPercent}% complete`;
    }

    complete(totalDuration) {
        const totalTime = totalDuration || (performance.now() - this.startTime);
        this.isRunning = false;
        this.updateProgress(100, 'Scan complete!');

        console.log('%c📊 Detailed Scan Timing Report 📊', 'font-size: 16px; font-weight: bold; color: #1890ff;');
        console.log('───────────────────────────────────────');

        const stepTimings = [];
        let totalMeasuredDuration = 0;

        Object.entries(this.actualTimings).forEach(([stepId, duration]) => {
            if (stepId === 'scan') return;

            const step = this._getStepById(stepId);
            if (!step) return;

            totalMeasuredDuration += duration;
            const percent = totalTime > 0 ? (duration / totalTime * 100) : 0;
            stepTimings.push({
                name: step.name,
                id: stepId,
                duration,
                percent,
                hasSubSteps: !!step.subSteps
            });
        });

        stepTimings.sort((a, b) => b.duration - a.duration);

        stepTimings.forEach(timing => {
            const durationStr = timing.duration.toFixed(2).padStart(8);
            const percentStr = timing.percent.toFixed(2).padStart(5);
            const barLength = Math.round(timing.percent / 2);
            const bar = '█'.repeat(barLength);

            console.log(
                `%c${timing.name}:%c ${durationStr} ms (${percentStr}%) %c${bar}`,
                'color: #333; font-weight: bold;',
                'color: #1890ff',
                `color: ${timing.percent > 20 ? '#ff4d4f' : '#1890ff'}`
            );

            if (timing.hasSubSteps && this.subStepTimings[timing.id]) {
                const subSteps = Object.entries(this.subStepTimings[timing.id]);

                if (subSteps.length === 0) return;

                subSteps.sort((a, b) => (b[1].duration || 0) - (a[1].duration || 0));

                subSteps.forEach(([subId, subTiming]) => {
                    if (!subTiming.duration) return;

                    const subDurationStr = subTiming.duration.toFixed(2).padStart(8);
                    const subPercent = timing.duration > 0 ? ((subTiming.duration / timing.duration) * 100) : 0;
                    const subPercentStr = subPercent.toFixed(2).padStart(5);
                    const subBarLength = timing.duration > 0 ? Math.round((subTiming.duration / timing.duration) * barLength) : 0;
                    const subBar = '▓'.repeat(subBarLength);

                    console.log(
                        `  %c↪ ${subTiming.name}:%c ${subDurationStr} ms (${subPercentStr}%) %c${subBar}`,
                        'color: #666; font-weight: normal;',
                        'color: #69c0ff',
                        'color: #69c0ff'
                    );
                });
            }
        });

        console.log('───────────────────────────────────────');
        console.log(`%cTotal measured time: ${totalMeasuredDuration.toFixed(2)} ms`, 'font-weight: bold');
        console.log(`%cTotal scan time:     ${totalTime.toFixed(2)} ms`, 'font-weight: bold');

        const overhead = totalTime - totalMeasuredDuration;
        if (Math.abs(overhead) > 10) {
            const overheadPercent = totalTime > 0 ? (overhead / totalTime * 100).toFixed(2) : 0;
            console.log(`%cOverhead/Untracked: ${overhead.toFixed(2)} ms (${overheadPercent}%)`, 'color: #ff4d4f');
        }

        console.log('───────────────────────────────────────');

        const browserInfo = this.detectBrowser();
        console.log(`%cBrowser: ${browserInfo.name} ${browserInfo.version} on ${browserInfo.os}`, 'color: #888');

        window.scanTimings = {
            total: totalTime,
            steps: this.actualTimings,
            subSteps: this.subStepTimings,
            reportGenerated: new Date().toISOString()
        };

        return totalTime;
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        let browserName = "Unknown";
        let browserVersion = "";
        let os = "Unknown";

        if (userAgent.indexOf("Windows") !== -1) os = "Windows";
        else if (userAgent.indexOf("Mac") !== -1) os = "macOS";
        else if (userAgent.indexOf("Linux") !== -1) os = "Linux";
        else if (userAgent.indexOf("Android") !== -1) os = "Android";
        else if (userAgent.indexOf("iOS") !== -1) os = "iOS";

        if (userAgent.indexOf("Firefox") !== -1) {
            browserName = "Firefox";
            browserVersion = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || "";
        } else if (userAgent.indexOf("Chrome") !== -1 && userAgent.indexOf("Edg") === -1 && userAgent.indexOf("OPR") === -1) {
            browserName = "Chrome";
            browserVersion = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || "";
        } else if (userAgent.indexOf("Safari") !== -1 && userAgent.indexOf("Chrome") === -1) {
            browserName = "Safari";
            browserVersion = userAgent.match(/Version\/([\d.]+)/)?.[1] || "";
        } else if (userAgent.indexOf("Edg") !== -1) {
            browserName = "Edge";
            browserVersion = userAgent.match(/Edg\/([\d.]+)/)?.[1] || "";
        } else if (userAgent.indexOf("OPR") !== -1) {
            browserName = "Opera";
            browserVersion = userAgent.match(/OPR\/([\d.]+)/)?.[1] || "";
        }

        return { name: browserName, version: browserVersion, os };
    }

    static generateTimingHelpers() {
        if (!window.loadingTracker) {
            console.error("LoadingTracker instance not found. Timing helpers cannot be generated.");
            return;
        }
        const tracker = window.loadingTracker;

        window.startTiming = function(stepId) {
            tracker._startStep(stepId);
        };

        window.endTiming = function(stepId) {
            return tracker._endStep(stepId);
        };

        window.startSubTiming = function(parentStepId, subStepId, displayName) {
            tracker._startSubStep(parentStepId, subStepId, displayName);
        };

        window.endSubTiming = function(parentStepId, subStepId) {
            return tracker._endSubStep(parentStepId, subStepId);
        };

        window.showAllTimings = function(includeSubSteps = true) {
            console.log("--- Current Timing State ---");
            console.log("Main Steps Durations:", tracker.actualTimings);
            if (includeSubSteps) {
                console.log("Sub-Steps Durations:", tracker.subStepTimings);
            }
            console.log("Currently Running Steps:", tracker.stepStartTimes);
            console.log("--------------------------");
        };

        console.log('📊 Manual timing helpers created: window.startTiming(), window.endTiming(), window.startSubTiming(), window.endSubTiming(), window.showAllTimings()');
    }
}

// Manual timing helpers
(() => {
    console.info(
        '📊 Manual timing helpers created: ' +
        'window.startTiming(), window.endTiming(), ' +
        'window.startSubTiming(), window.endSubTiming(), ' +
        'window.showAllTimings()'
    );
    const store = {
        steps: [],
        current: {}
    };
    window.startTiming = (id, name = id) => {
        store.current[id] = { start: performance.now(), name };
    };
    window.endTiming = (id) => {
        const entry = store.current[id];
        if (!entry) {
            console.warn(`Cannot end step "${id}" - not running.`);
            return;
        }
        const duration = performance.now() - entry.start;
        store.steps.push({ id, name: entry.name, duration });
        delete store.current[id];
    };
    window.startSubTiming = (parentId, subId, name) =>
        window.startTiming(`${parentId}.${subId}`, name);
    window.endSubTiming = (parentId, subId) =>
        window.endTiming(`${parentId}.${subId}`);
    window.showAllTimings = () => {
        console.group('--- Current Timing State ---');
        console.table(store.steps.map(s => ({
            Operation: s.name,
            TimeMs: Math.round(s.duration)
        })));
        console.log('Unfinished:', Object.keys(store.current));
        console.groupEnd();

        // Mirror into loadingTracker so UI sees it
        if (window.loadingTracker) {
            window.loadingTracker.steps = store.steps.slice();
            window.loadingTracker.totalTime = store.steps.reduce((sum, s) => sum + s.duration, 0);
        }
        const steps = {};
        store.steps.forEach(s => { steps[s.id] = s.duration; });
        const total = store.steps.reduce((sum, s) => sum + s.duration, 0);
        window.scanTimings = { steps, total };
        return window.scanTimings;
    };
})();

// Expose a helper to package timings for UI
window.showAllTimings = function() {
    if (!window.loadingTracker || !Array.isArray(window.loadingTracker.steps)) return {};
    const steps = {};
    window.loadingTracker.steps.forEach(s => {
        steps[s.id] = s.duration;
    });
    const total = window.loadingTracker.totalTime !== undefined
        ? window.loadingTracker.totalTime
        : Object.values(steps).reduce((acc, t) => acc + t, 0);
    window.scanTimings = { steps, total };
    return window.scanTimings;
};

window.loadingTracker = new LoadingTracker();
LoadingTracker.generateTimingHelpers();

console.log('%cℹ️ To manually track timing in your code:', 'font-weight: bold; color: #1890ff');
console.log('  1. window.startTiming("scan") - At the very beginning of the whole process');
console.log('  2. window.startTiming("stepId") - Before starting a specific collection or processing step');
console.log('  3. window.endTiming("stepId") - Immediately after the step completes');
console.log('  4. window.startSubTiming("parentStepId", "subStepId", "Display Name") - For sub-operations');
console.log('  5. window.endSubTiming("parentStepId", "subStepId") - After the sub-operation completes');
console.log('  6. window.endTiming("scan") - At the very end of the whole process');
console.log('  Example step IDs:', window.loadingTracker.steps.map(s => s.id).join(', '));
