const { config } = require("dotenv");
const { connection } = require("./config/db");
const userRouter = require("./routes/user.route");
const fileRouter = require("./routes/file.route");
const authenticate = require("./middleware/authenticate");
const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("<h1>HomePage</h1>");
});
// app.use(authenticate)
app.use("/users", userRouter);
app.use("/files", fileRouter);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);
app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
});
