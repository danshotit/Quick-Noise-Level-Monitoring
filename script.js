// Get references to the DOM elements
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const noiseLevelDisplay = document.getElementById('level');
const statusDisplay = document.getElementById('status');

let audioContext;
let analyser;
let microphoneStream;

// Function to start monitoring noise levels
async function startMonitoring() {
    try {
        // Request microphone access
        microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        
        const microphone = audioContext.createMediaStreamSource(microphoneStream);
        microphone.connect(analyser);
        analyser.fftSize = 2048;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        // Start monitoring noise levels
        const monitorNoiseLevels = () => {
            if (analyser) {
                analyser.getByteFrequencyData(dataArray);
                const average = getAverageVolume(dataArray);
                if (noiseLevelDisplay) {
                    noiseLevelDisplay.innerText = Math.round(average);
                }
                if (statusDisplay) {
                    statusDisplay.innerText = getStatus(average);
                }
                requestAnimationFrame(monitorNoiseLevels);
            }
        };
        
        monitorNoiseLevels();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    } catch (error) {
        console.error('Error accessing microphone: ', error);
        statusDisplay.innerText = 'Error accessing microphone';
    }
}

// Function to stop monitoring
function stopMonitoring() {
    if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop());
    }
    audioContext.close();
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

// Function to calculate the average volume from frequency data
function getAverageVolume(dataArray) {
    const sum = dataArray.reduce((acc, value) => acc + value, 0);
    return sum / dataArray.length;
}

// Function to determine status based on noise level
function getStatus(noiseLevel) {
    if (noiseLevel < 40) return 'Quiet';
    if (noiseLevel < 70) return 'Moderate';
    return 'Noisy';
}

// Event listeners for buttons
startBtn.addEventListener('click', startMonitoring);
stopBtn.addEventListener('click', stopMonitoring);
