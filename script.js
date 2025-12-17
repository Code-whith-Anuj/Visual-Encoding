// DOM Elements
const image = document.getElementById("randomImage");
const instructions = document.getElementById("instructions");
const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const fullscreenIcon = document.querySelector('.fullscreen-icon');
const exitFullscreenIcon = document.querySelector('.exit-fullscreen-icon');
const imageContainer = document.getElementById("imageContainer");

// Fullscreen-only UI elements
const repeatBtn = document.getElementById("repeatBtn");
const fullscreenTimer = document.getElementById("fullscreenTimer");

// Theme elements
const themeToggle = document.getElementById("themeToggle");
const sunIcon = themeToggle.querySelector('.fa-sun');
const moonIcon = themeToggle.querySelector('.fa-moon');

// Settings elements
const settingsIcon = document.getElementById("settings");
const settingsPanel = document.getElementById("settingsPanel");
const viewTimeSlider = document.getElementById("viewTime");
const rebuildTimeSlider = document.getElementById("rebuildTime");
const viewTimeValue = document.getElementById("viewTimeValue");
const rebuildTimeValue = document.getElementById("rebuildTimeValue");
const presetButtons = document.querySelectorAll('.preset-btn');

// Game state
let round = 0;
let countdown = null;
let viewTime = 30;
let rebuildTime = 20;
let isFullscreenMode = false;
let currentPhase = null; // 'view', 'rebuild', or 'review'

/* ---------------- THEME TOGGLE ---------------- */
function toggleTheme() {
  const body = document.body;
  const isDarkMode = body.classList.contains('dark-mode');
  
  if (isDarkMode) {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
    localStorage.setItem('theme', 'dark');
  }
}

// Initialize theme from localStorage or default
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  }
}

/* ---------------- FULLSCREEN FUNCTIONALITY ---------------- */
function toggleFullscreen() {
  const isFullscreen = document.fullscreenElement || 
                       document.webkitFullscreenElement || 
                       document.mozFullScreenElement ||
                       document.msFullscreenElement;
  
  if (!isFullscreen) {
    // Enter fullscreen
    if (imageContainer.requestFullscreen) {
      imageContainer.requestFullscreen();
    } else if (imageContainer.webkitRequestFullscreen) {
      imageContainer.webkitRequestFullscreen();
    } else if (imageContainer.mozRequestFullScreen) {
      imageContainer.mozRequestFullScreen();
    } else if (imageContainer.msRequestFullscreen) {
      imageContainer.msRequestFullscreen();
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

function updateFullscreenButton() {
  const isFullscreen = document.fullscreenElement || 
                       document.webkitFullscreenElement || 
                       document.mozFullScreenElement ||
                       document.msFullscreenElement;
  
  isFullscreenMode = !!isFullscreen;
  
  if (isFullscreen) {
    fullscreenIcon.classList.add('hidden');
    exitFullscreenIcon.classList.remove('hidden');
    fullscreenBtn.setAttribute('title', 'Exit Fullscreen (Press ESC)');
    
    // Show fullscreen-only UI
    repeatBtn.classList.remove('hidden');
  } else {
    fullscreenIcon.classList.remove('hidden');
    exitFullscreenIcon.classList.add('hidden');
    fullscreenBtn.setAttribute('title', 'Enter Fullscreen');
    
    // Hide fullscreen-only UI
    repeatBtn.classList.add('hidden');
    fullscreenTimer.classList.add('hidden');
  }
}

// Fullscreen event listeners
fullscreenBtn.addEventListener('click', toggleFullscreen);

// Listen for fullscreen change events
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('mozfullscreenchange', updateFullscreenButton);
document.addEventListener('MSFullscreenChange', updateFullscreenButton);

// Exit fullscreen with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isFullscreenMode) {
    toggleFullscreen();
  }
});

/* ---------------- IMAGE ---------------- */
function loadRandomImage() {
  const seed = Math.floor(Math.random() * 100000);
  const timestamp = new Date().getTime();

  image.classList.remove("loaded");
  image.style.display = "block";
  
  image.onload = () => {
    image.classList.add("loaded");
  };

  image.onerror = () => {
    console.log("Image failed to load, using fallback");
    image.src = "https://picsum.photos/800/600?grayscale&" + timestamp;
  };

  image.src = `https://picsum.photos/800/600?random=${seed}&t=${timestamp}`;
}

/* ---------------- TIMER ---------------- */
function startCountdown(seconds, phase, callback) {
  clearInterval(countdown);
  currentPhase = phase;

  let timeLeft = seconds;
  
  const updateTimerDisplay = () => {
    const text = `Time left: ${timeLeft}s`;
    timerEl.textContent = text;
    
    if (isFullscreenMode) {
      fullscreenTimer.textContent = text;
      fullscreenTimer.classList.remove('hidden');
    }
  };

  updateTimerDisplay();

  countdown = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(countdown);
      fullscreenTimer.classList.add('hidden');
      currentPhase = null;
      callback();
    }
  }, 1000);
}

/* ---------------- EXERCISE LOGIC ---------------- */
function startExercise() {
  round++;
  nextBtn.disabled = true;

  loadRandomImage();

  instructions.innerHTML = `Look at the image for <strong>${viewTime} seconds</strong>.`;

  startCountdown(viewTime, 'view', () => {
    image.style.display = "none";

    instructions.innerHTML = `
      Close your eyes and rebuild it mentally:<br><br>
      • Overall shape<br>
      • Colors<br>
      • Object positions
    `;

    startCountdown(rebuildTime, 'rebuild', () => {
      instructions.innerHTML = "Open your eyes. Notice what you missed.";
      image.style.display = "block";
      timerEl.textContent = "";
      fullscreenTimer.classList.add('hidden');

      if (round < 2) {
        nextBtn.disabled = false;
      } else {
        instructions.innerHTML += "<br><br><strong>Exercise complete.</strong>";
        startBtn.textContent = "Restart";
      }
    });
  });
}

/* ---------------- INFINITE REPEAT FUNCTIONALITY ---------------- */
function startInfiniteRepeat() {
  // Disable button during the exercise to prevent double-clicks
  repeatBtn.disabled = true;
  
  // Load a new random image
  loadRandomImage();
  
  // Show the image
  image.style.display = "block";
  
  // Update instructions if they're visible (for when exiting fullscreen)
  instructions.innerHTML = `Look at the image for <strong>${viewTime} seconds</strong>.`;
  
  // Start the view countdown
  startCountdown(viewTime, 'view', () => {
    // Hide image for rebuild phase
    image.style.display = "none";
    
    instructions.innerHTML = `
      Close your eyes and rebuild it mentally:<br><br>
      • Overall shape<br>
      • Colors<br>
      • Object positions
    `;
    
    // Start rebuild countdown
    startCountdown(rebuildTime, 'rebuild', () => {
      // Show image for review phase
      image.style.display = "block";
      
      instructions.innerHTML = "Open your eyes. Notice what you missed.";
      fullscreenTimer.classList.add('hidden');
      
      // Re-enable the repeat button for next round
      repeatBtn.disabled = false;
    });
  });
}

/* ---------------- SETTINGS ---------------- */
function updateTimes(newViewTime, newRebuildTime) {
  viewTime = newViewTime;
  rebuildTime = newRebuildTime;
  
  // Update sliders
  if (viewTimeSlider) viewTimeSlider.value = viewTime;
  if (rebuildTimeSlider) rebuildTimeSlider.value = rebuildTime;
  
  // Update display
  if (viewTimeValue) viewTimeValue.textContent = viewTime;
  if (rebuildTimeValue) rebuildTimeValue.textContent = rebuildTime;
  
  // Update active preset button
  if (presetButtons) {
    presetButtons.forEach(btn => {
      btn.classList.remove('active');
      if (parseInt(btn.dataset.view) === viewTime && 
          parseInt(btn.dataset.rebuild) === rebuildTime) {
        btn.classList.add('active');
      }
    });
  }
  
  // Save to localStorage
  localStorage.setItem('viewTime', viewTime);
  localStorage.setItem('rebuildTime', rebuildTime);
}

// Initialize settings from localStorage
function initSettings() {
  const savedViewTime = localStorage.getItem('viewTime');
  const savedRebuildTime = localStorage.getItem('rebuildTime');
  
  if (savedViewTime) viewTime = parseInt(savedViewTime);
  if (savedRebuildTime) rebuildTime = parseInt(savedRebuildTime);
  
  updateTimes(viewTime, rebuildTime);
}

// Toggle settings panel
settingsIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  settingsPanel.classList.toggle('hidden');
});

// Close panel when clicking outside
document.addEventListener('click', (e) => {
  if (settingsPanel && !settingsPanel.contains(e.target) && settingsIcon && !settingsIcon.contains(e.target)) {
    settingsPanel.classList.add('hidden');
  }
});

// Slider event listeners
viewTimeSlider.addEventListener('input', () => {
  viewTimeValue.textContent = viewTimeSlider.value;
  viewTime = parseInt(viewTimeSlider.value);
  updateActivePreset();
  localStorage.setItem('viewTime', viewTime);
});

rebuildTimeSlider.addEventListener('input', () => {
  rebuildTimeValue.textContent = rebuildTimeSlider.value;
  rebuildTime = parseInt(rebuildTimeSlider.value);
  updateActivePreset();
  localStorage.setItem('rebuildTime', rebuildTime);
});

function updateActivePreset() {
  presetButtons.forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.dataset.view) === viewTime && 
        parseInt(btn.dataset.rebuild) === rebuildTime) {
      btn.classList.add('active');
    }
  });
}

// Preset button event listeners
presetButtons.forEach(button => {
  button.addEventListener('click', () => {
    const newViewTime = parseInt(button.dataset.view);
    const newRebuildTime = parseInt(button.dataset.rebuild);
    updateTimes(newViewTime, newRebuildTime);
  });
});

/* ---------------- EVENT LISTENERS ---------------- */
themeToggle.addEventListener('click', toggleTheme);

startBtn.addEventListener("click", () => {
  round = 0;
  startBtn.textContent = "Start";
  nextBtn.disabled = false;
  startExercise();
});

nextBtn.addEventListener("click", startExercise);

repeatBtn.addEventListener("click", startInfiniteRepeat);

/* ---------------- INITIALIZATION ---------------- */
// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSettings();
  
  // Set initial instruction
  instructions.innerHTML = "Click <strong>Start</strong> to begin the exercise.";
  
  // Hide fullscreen-only UI initially
  repeatBtn.classList.add('hidden');
  fullscreenTimer.classList.add('hidden');
  
  // Change button text to "Repeat" (no "Once")
  repeatBtn.innerHTML = '<i class="fas fa-redo"></i> Repeat';
});