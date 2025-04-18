const socket = require("socket.io");
const bodyParser = require("body-parser");
const express = require("express");
const session = require("express-session");
const sharedsession = require("express-socket.io-session");
const multer = require("multer");
const Filter = require("bad-words");
const filter = new Filter();
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});

const upload = multer({ storage: storage });

const app = express();
const server = app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
const io = socket(server);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("public/uploads"));

let expressSession = session({
  secret: "your secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // set to true if your app is on https
});

app.use(expressSession);

io.use(
  sharedsession(expressSession, {
    autoSave: true,
  })
);

app.get("/", (req, res) => {
  res.render("index");
});

const rooms = {};
const roomUsers = {};

app.post("/create_room", (req, res) => {
  const roomId = Math.random().toString(36).substring(7);
  req.session.chatId = Math.random().toString(36).substring(7); // store the chatId in the session
  rooms[roomId] = req.session.chatId; // set the admin for the room
  res.redirect(`/room/${roomId}`); // redirect to the room
});

app.get("/room/:room", (req, res) => {
  res.render("room", { roomId: req.params.room }); // render the room view
});

io.on("connection", (socket) => {
  socket.on("join room", (roomId) => {
    const chatId =
      socket.handshake.session.chatId ||
      Math.random().toString(36).substring(7); // retrieve the chatId from the session
    socket.join(roomId); // join the user to the room
    socket.username = chatId; // assign the chatId as a username
    socket.emit("admin", rooms[roomId] === chatId); // emit an "admin" event

    //console.log admin
    console.log(rooms[roomId] === chatId);

    if (!roomUsers[roomId]) {
      roomUsers[roomId] = 0;
    }

    // Only increase the user count if the user has not joined the room before
    if (!socket.handshake.session.hasJoinedRoom) {
      roomUsers[roomId]++;
      socket.handshake.session.hasJoinedRoom = true; // set the flag
      socket.handshake.session.save(); // save the session
    }

    io.to(roomId).emit("user connected", socket.username);
    io.to(roomId).emit("user count", roomUsers[roomId]);

    console.log(`User ${chatId} connected to room ${roomId}`);
  });

  socket.on("end room", (roomId) => {
    if (rooms[roomId] === socket.username) {
      // if the user is the admin
      io.to(roomId).emit("room ended"); // emit a "room ended" event
      delete rooms[roomId]; // delete the room
    }
  });

  socket.on("disconnect", () => {
    Object.keys(roomUsers).forEach((roomId) => {
      if (io.sockets.adapter.rooms[roomId]) {
        roomUsers[roomId]--;
        io.to(roomId).emit("user disconnected", socket.username);
        io.to(roomId).emit("user count", roomUsers[roomId]);
      }
    });

    socket.on("typing", () => {
      console.log("Received typing event from:", socket.username);
      socket.broadcast.emit("typing", { username: socket.username });
    });

    socket.on("stopTyping", () => {
      console.log("Received stopTyping event from:", socket.username);
      socket.broadcast.emit("stopTyping", { username: socket.username });
    });

    socket.on("end room", (roomId) => {
      // Check if the user is the admin
      if (socket.id === rooms[roomId].admin) {
        // Delete the room
        delete rooms[roomId];

        // Notify all users in the room that it has been ended
        io.to(roomId).emit("room ended");
      }
    });
    console.log(`User ${socket.username} disconnected`);
  });

  socket.on("chat message", (roomId, msg, file) => {
    if (typeof msg === "string" && msg.trim() !== "") {
      msg = filter.clean(msg);
    }
    io.to(roomId).emit("chat message", socket.username, msg, file);
  });
});
function roomExists(roomId) {
  return roomId in rooms;
}
app.post("/join_room", (req, res) => {
  const roomId = req.body.roomId;

  if (roomExists(roomId)) {
    res.redirect(`/room/${roomId}`); // redirect to the room
  } else {
    res
      .status(404)
      .send(
        `<script>alert('Room not found!');window.location.href = '/';</script>`
      );
  }
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ fileUrl: "/uploads/" + req.file.filename });
});
