const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://ai-based-interview-pre-tool.vercel.app",
  "https://ai-based-interview-preparation-tool-eta.vercel.app",
  process.env.CLIENT_URL,
  process.env.CLIENT_PROD_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all configured origins with credentials
    },
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
  res.send("Server is good.");
});

module.exports = app;
