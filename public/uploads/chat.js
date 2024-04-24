const socket = io();
const popup = document.querySelector(".popup");

let mediaRecorder;
let chunks = [];

// Join the room
socket.emit("join room", "<%= roomId %>");

// Listen for chat messages
socket.on("chat message", (username, msg, fileUrl) => {
  const item = document.createElement("li");
  const userNameSpan = document.createElement("span");
  userNameSpan.textContent = username;
  const messageContent = document.createElement("p");
  messageContent.textContent = msg;
  item.appendChild(userNameSpan);
  item.appendChild(messageContent);
  if (fileUrl) {
    let fileElement;
    console.log("file url", fileUrl);
    if (fileUrl.endsWith(".mp4")) {
      fileElement = document.createElement("video");
      fileElement.type = "video/mp4";
    } else if (fileUrl.endsWith(".webm")) {
      fileElement = document.createElement("audio");
      fileElement.type = "audio/webm";
    } else {
      fileElement = document.createElement("img");
    }
    fileElement.src = fileUrl;
    fileElement.controls = true; // add controls to the audio/video
    item.appendChild(fileElement);
  }
  const messages = document.getElementById("messages");
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);

  messages.scrollTop = messages.scrollHeight - messages.clientHeight;
});

// Send a chat message
document.getElementById("messageForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const messageInput = document.getElementById("messageInput");
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        socket.emit(
          "chat message",
          "<%= roomId %>",
          messageInput.value,
          data.fileUrl
        );
      });
  } else {
    socket.emit("chat message", "<%= roomId %>", messageInput.value);
  }
  messageInput.value = "";
  fileInput.value = "";
});

// Start recording
function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = (e) => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      chunks = [];

      // Upload the audio file
      const formData = new FormData();
      formData.append("file", blob, "audio.webm"); // append the .webm extension
      fetch("/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          socket.emit("chat message", "<%= roomId %>", "", data.fileUrl);
        });
    };
  });
}

// Stop recording
function stopRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop();
  }
}

let isRecording = false;

document.getElementById("recordButton").addEventListener("click", () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
  isRecording = !isRecording;
});

socket.on("admin", (isAdmin) => {
  const endRoomButton = document.getElementById("endRoomButton");
  if (isAdmin) {
    endRoomButton.classList.remove("hidden"); // show the "End Room" button
  } else {
    endRoomButton.classList.add("hidden"); // hide the "End Room" button
  }
});

socket.on("user connected", (username) => {
  // Show the popup
  popup.textContent = `${username} has joined the room`;
  popup.classList.add("show");

  // Hide the popup after 3 seconds
  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
});

// Listen for user disconnected
socket.on("user disconnected", (username) => {
  const item = document.createElement("li");
  item.textContent = `${username} has left the room`;
  const messages = document.getElementById("messages");
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

// Listen for user count
socket.on("user count", (count) => {
  // Show the popup
  popup.textContent = `There are now ${count} users in the room`;
  popup.classList.add("show");

  // Hide the popup after 3 seconds
  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
});

document.getElementById("endRoomButton").addEventListener("click", () => {
  socket.emit("end room", "<%= roomId %>"); // emit an "end room" event
});

socket.on("room ended", () => {
  alert("Room has been ended by the admin");
  window.location.href = "/"; // redirect to the home page
});
