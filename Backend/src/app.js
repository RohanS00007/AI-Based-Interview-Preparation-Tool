const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-based-interview-preparation-tool-eta.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Require all the routes
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

// Using all the routes
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

app.get("/test", (req, res) => {
  console.log(req.cookies);
  res.send("ok");
});

module.exports = app;
