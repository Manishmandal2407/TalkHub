import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const secretKeyJWT = "manishmandal";
const port = 3000;

const app = express();
const server = createServer(app);

app.use(cookieParser());

//Attach socket.io to server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5174",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello world");
});

// Login API
app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "manishmandal" }, secretKeyJWT);

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: false, // IMPORTANT for localhost
      sameSite: "lax",
    })
    .json({ message: "Login Success" });
});

// FIXED SOCKET MIDDLEWARE
io.use((socket, next) => {
  cookieParser()(socket.request, {}, () => {
    try {
      const token = socket.request.cookies?.token;

      if (!token) return next(new Error("No token found"));

      const decoded = jwt.verify(token, secretKeyJWT);
      socket.user = decoded;
      next();
    } catch (e) {
      next(new Error("Invalid token"));
    }
  });
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("Join-Room", (Room) => {
    socket.join(Room);
    console.log(`User joined room: ${Room}`);
  });

  socket.on("message", (Room, message) => {
    socket.to(Room).emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});
