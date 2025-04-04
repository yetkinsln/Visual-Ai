const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        console.log("Token içeriği:", req.user); // 🔥 Debug için ekle

        const user = await User.findById(req.user.userId || req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// Login Route
router.post('/login', async (req, res) => {

    if (req.headers.authorization) {
        return res.status(400).json({ message: "You are already logged in." });
    }
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        // Kullanıcıyı bul
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        // Şifreyi doğrula
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        // JWT oluştur
        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1y" });

        res.status(200).json({ message: "Login successful!", token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
});


// Signup Route
router.post('/signup', async (req, res) => {

    if (req.headers.authorization) {
        return res.status(400).json({ message: "You are already logged in." });
    }


    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Kullanıcı var mı kontrol et
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "username already exists." });
        }

        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluştur
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
