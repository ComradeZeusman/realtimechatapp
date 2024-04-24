const socket = io();
const popup = document.querySelector(".popup");

const TypeInput = document.getElementById("messageInput");
const typingIndicator = document.getElementById("typingIndicator");
let typing = false;
const typingTimeout = 2000; // 2 seconds
let typingTimer;

let mediaRecorder;
let chunks = [];

socket.emit("join room", "<%= roomId %>");

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
    fileElement.controls = true;
    item.appendChild(fileElement);
  }
  const messages = document.getElementById("messages");
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);

  messages.scrollTop = messages.scrollHeight - messages.clientHeight;
});

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

      const formData = new FormData();
      formData.append("file", blob, "audio.webm");
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
    endRoomButton.classList.remove("hidden");
  } else {
    endRoomButton.classList.add("hidden");
  }
});

socket.on("user connected", (username) => {
  popup.textContent = `${username} has joined the room`;
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
});

socket.on("user disconnected", (username) => {
  const item = document.createElement("li");
  item.textContent = `${username} has left the room`;
  const messages = document.getElementById("messages");
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("user count", (count) => {
  popup.textContent = `There are now ${count} users in the room`;
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
});

document.getElementById("endRoomButton").addEventListener("click", () => {
  socket.emit("end room", "<%= roomId %>");
});

socket.on("room ended", () => {
  alert("Room has been ended by the admin");
  window.location.href = "/";
});

socket.on("typing", (data) => {
  console.log("Received typing event from:", data.username);
  typingIndicator.innerHTML = `${data.username} is typing...`;
  typingIndicator.classList.remove("hidden");
});

socket.on("stopTyping", (data) => {
  console.log("Received stopTyping event from:", data.username);
  typingIndicator.classList.add("hidden");
});

TypeInput.addEventListener("keypress", () => {
  if (!typing) {
    console.log("Emitting typing event");
    socket.emit("typing");
    typing = true;
  }
});

TypeInput.addEventListener("keyup", () => {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    typing = false;
    console.log("Emitting stopTyping event");
    socket.emit("stopTyping");
  }, typingTimeout);
});
