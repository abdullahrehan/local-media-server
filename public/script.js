let mediaFiles = [];
let currentIndex = 0;

const mediaContainer = document.getElementById("mediaContainer");
const counter = document.getElementById("counter");
const filename = document.getElementById("filename");
const nextButton = document.getElementById("nextButton");
const prevButton = document.getElementById("prevButton");
const loginForm = document.getElementById("loginForm");
const loginScreen = document.getElementById("loginScreen");
const codeInput = document.getElementById("codeInput");
const loginMessage = document.getElementById("loginMessage");

async function loadMedia() {
  try {
    const response = await fetch("/api/media");

    if (response.status === 401) {
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error("Media request failed");
    }

    showViewer();
    mediaFiles = await response.json();

    if (mediaFiles.length === 0) {
      mediaContainer.textContent = "No images or videos found.";
      counter.textContent = "";
      filename.textContent = "";
      return;
    }

    showMedia();
  } catch (error) {
    mediaContainer.textContent = "Failed to load media.";
    counter.textContent = "";
    filename.textContent = "";
    console.error(error);
  }
}

function showLogin(message = "") {
  document.body.classList.remove("is-authenticated");
  loginMessage.textContent = message;
  codeInput.focus();
}

function showViewer() {
  document.body.classList.add("is-authenticated");
}

async function submitCode(event) {
  event.preventDefault();

  const code = codeInput.value.trim().toUpperCase();

  if (code.length !== 4) {
    showLogin("Enter the 4-character code.");
    return;
  }

  loginMessage.textContent = "";

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      const message =
        response.status === 429
          ? "Too many tries. Wait a few minutes."
          : "Wrong code.";

      showLogin(message);
      codeInput.select();
      return;
    }

    codeInput.value = "";
    await loadMedia();
  } catch (error) {
    showLogin("Could not check the code.");
    console.error(error);
  }
}

function isVideo(file) {
  const videoExtensions = [".mp4", ".webm", ".ogg"];

  return videoExtensions.some((extension) =>
    file.toLowerCase().endsWith(extension)
  );
}

function showMedia() {
  if (mediaFiles.length === 0) {
    return;
  }

  const file = mediaFiles[currentIndex];
  const mediaUrl = `/media/${encodeURIComponent(file)}`;

  mediaContainer.innerHTML = "";

  if (isVideo(file)) {
    const video = document.createElement("video");

    video.src = mediaUrl;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;

    mediaContainer.appendChild(video);
  } else {
    const image = document.createElement("img");

    image.src = mediaUrl;
    image.alt = file;

    mediaContainer.appendChild(image);
  }

  counter.textContent = `${currentIndex + 1} / ${mediaFiles.length}`;
  filename.textContent = file;
}

function nextMedia() {
  if (mediaFiles.length === 0) {
    return;
  }

  currentIndex = (currentIndex + 1) % mediaFiles.length;
  showMedia();
}

function previousMedia() {
  if (mediaFiles.length === 0) {
    return;
  }

  currentIndex = (currentIndex - 1 + mediaFiles.length) % mediaFiles.length;
  showMedia();
}

nextButton.addEventListener("click", nextMedia);
prevButton.addEventListener("click", previousMedia);
loginForm.addEventListener("submit", submitCode);

codeInput.addEventListener("input", () => {
  codeInput.value = codeInput.value.toUpperCase().slice(0, 4);
});

document.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("is-authenticated")) {
    return;
  }

  if (event.key === "ArrowRight") {
    nextMedia();
  }

  if (event.key === "ArrowLeft") {
    previousMedia();
  }
});

loadMedia();
