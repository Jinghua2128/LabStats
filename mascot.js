// mascot.js

const audioFiles = [
    'audios/web gravity lab.wav',
    'audios/web home.wav',
    'audios/web settings.wav'
];

let currentAudio = null;

function createMascot() {
    // Create container
    const container = document.createElement('div');
    container.id = 'rat-mascot-container';
    container.className = 'fixed bottom-4 right-4 z-50 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95';
    // Add title attribute for tooltip
    container.title = "Click me for science tips!";

    // Create Image
    const img = document.createElement('img');
    img.src = 'imgs/rat_speaking_button.png';
    img.alt = 'LabRats Mascot';
    img.className = 'w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-2xl'; // Responsive size

    // Append to container
    container.appendChild(img);

    // Add Click Event
    container.addEventListener('click', playRandomAudio);

    // Add to body
    document.body.appendChild(container);
}

function playRandomAudio() {
    // Stop current audio and animation if playing
    const img = document.querySelector('#rat-mascot-container img');

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (img) img.classList.remove('animate-bounce');
    }

    // Pick random audio
    const randomIndex = Math.floor(Math.random() * audioFiles.length);
    const audioSrc = audioFiles[randomIndex];

    // Play
    currentAudio = new Audio(audioSrc);

    // Animation: Start
    if (img) img.classList.add('animate-bounce');

    currentAudio.play().catch(e => console.error("Audio play failed:", e));

    // Animation: Stop on end
    currentAudio.onended = () => {
        if (img) img.classList.remove('animate-bounce');
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createMascot);
} else {
    createMascot();
}
