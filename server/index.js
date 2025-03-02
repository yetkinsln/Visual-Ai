require('dotenv').config();
const express = require('express')
const cors = require('cors')
const path = require('path')
const mongoose = require('mongoose');
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')

const app = express()

// CORS Ayarları
app.use(cors({
    origin: 'http://localhost:5173'
}))

// Middleware'ler
app.use(logger)
app.use(express.json())
app.use(express.urlencoded({ extended: true })) 
app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoutes'));
// Login Endpoint
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));



app.post('/login', (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).json({ message: "Username or password cannot be empty." })
        return
    }

    // Burada gerçek kullanıcı doğrulama işlemi olmalı
    res.status(200).json({ message: "Login successful" })
})

// Signup Endpoint
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        res.status(400).json({ message: "An error occurred. Empty credentials are not allowed." })
        return
    }

    // Kullanıcı kayıt işlemi burada yapılmalı (örneğin MongoDB veya PostgreSQL ile)
    res.status(201).json({ message: "Signup successful!" })
})

// 404 Sayfası
app.all('*', (req, res) => {
    res.status(404)

    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found.')
    }
})

// Hata Yönetimi Middleware
app.use(errorHandler)

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`LISTENING ON PORT ${PORT}`)
})
