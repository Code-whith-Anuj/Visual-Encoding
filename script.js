const image = document.getElementById("randomImage");
const instructions = document.getElementById("instructions");
const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");

let round = 0;
let countdown = null;

function loadRandomImage() {
  const seed = Math.floor(Math.random() * 100000);

  // Reset state
  image.classList.remove("loaded");
  image.style.display = "block";

  image.onload = () => {
    image.classList.add("loaded"); // 🔥 REQUIRED by your CSS
  };

  image.onerror = () => {
    image.src = "https://picsum.photos/800/600?grayscale";
  };

  image.src = `https://picsum.photos/800/600?random=${seed}`;
}

function startExercise() {
  round++;
  nextBtn.disabled = true;

  loadRandomImage();

  instructions.innerHTML = "Look at the image for <strong>30 seconds</strong>.";

  startCountdown(30, () => {
    image.style.display = "none";

    instructions.innerHTML = `
      Close your eyes and rebuild it mentally:<br><br>
      • Overall shape<br>
      • Colors<br>
      • Object positions
    `;

    startCountdown(20, () => {
      instructions.innerHTML = "Open your eyes. Notice what you missed.";
      image.style.display = "block";
      timerEl.textContent = "";

      if (round < 2) {
        nextBtn.disabled = false;
      } else {
        instructions.innerHTML += "<br><br><strong>Exercise complete.</strong>";
      }
    });
  });
}

function startCountdown(seconds, callback) {
  clearInterval(countdown);

  let timeLeft = seconds;
  timerEl.textContent = `Time left: ${timeLeft}s`;

  countdown = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(countdown);
      callback();
    }
  }, 1000);
}

startBtn.addEventListener("click", () => {
  round = 0;
  startExercise();
});

nextBtn.addEventListener("click", startExercise);
