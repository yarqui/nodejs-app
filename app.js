require("dotenv").config(); /** config() method searches .env file in the project, reads variables and adds them to process.env */
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const authRouter = require("./routes/api/auth");
const contactsRouter = require("./routes/api/contacts");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());

// Checks if request has a body, and if it has, it checks content type from Header, if it's json, it converts the string to an object using JSON.parse()
app.use(express.json());

// Always create a path using path.join(). Don't hardcode it, because of a relative path problems
const tempDir = path.join(__dirname, "temp");

// Returns a StorageEngine implementation configured to store files on the local file system
const multerConfig = multer.diskStorage({
  destination: tempDir,
  // filename option currently has no effect and simply saves the file using its original name, which is the default behavior
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

app.use("/api/users", authRouter);
app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;

  res.status(status).json({ message });
});

module.exports = app;
