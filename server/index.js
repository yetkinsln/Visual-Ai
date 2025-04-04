require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// CORS Ayarları
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Middleware'ler
app.use(logger);
app.use(express.json({ limit: "100mb" })); // **Tekrar eden middleware kaldırıldı**
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// MongoDB Bağlantısı
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Rotalar
app.use("/", require("./routes/root"));
app.use("/users", require("./routes/userRoutes"));
app.use("/", require("./routes/layer"));
app.use("/",require("./routes/get_layers"))

// Login Endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username or password cannot be empty." });
  }

  // Burada gerçek kullanıcı doğrulama işlemi olmalı
  res.status(200).json({ message: "Login successful" });
});

// Signup Endpoint
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "An error occurred. Empty credentials are not allowed." });
  }

  // Kullanıcı kayıt işlemi burada yapılmalı (örneğin MongoDB ile)
  res.status(201).json({ message: "Signup successful!" });
});

// 404 Sayfası
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found.");
  }
});

// Hata Yönetimi Middleware
app.use(errorHandler);

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LISTENING ON PORT ${PORT}`);
});
