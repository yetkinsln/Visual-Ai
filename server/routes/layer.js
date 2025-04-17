const express = require("express");
const router = express.Router();
const Layer = require("../models/Layer");
const verifyToken = require("../middleware/authMiddleware");

router.post("/save_model", verifyToken, async (req, res) => {
    try {
        console.log("🔹 Token doğrulandı, istek alındı...");
        console.log("🧑‍💻 Kullanıcı ID:", req.user); // ✅ req.user burada doğru geliyor mu?
        console.log("📥 Gelen veri:", req.body); // ✅ İstekle birlikte gelen veri doğru mu?

        if (!req.user || !req.user.userId) {
            console.log("🚨 HATA: Kullanıcı kimliği alınamadı!");
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        }

        const {
            weights,
            test_score,
            model_type,
            scaler,
            max_y,
            target,
            columns,
            frames,
            mapping,
            name,
            userId,
          } = req.body;

        const newLayer = new Layer({
            userId: req.user.userId, // ✅ req.user.userId kullanıyoruz
            weights,
            testScore: test_score,
            model_type,
            scaler,
            max_y,
            target,
            columns,
            frames,
            mapping,
            name,
        
        });

        const savedLayer = await newLayer.save();
        console.log("✅ Katman başarıyla kaydedildi:", savedLayer);
        res.status(200).json({ message: "Layer saved successfully", savedLayer });

    } catch (err) {
        console.error("🚨 HATA: Layer kaydedilirken hata oluştu!", err);
        res.status(500).json({ message: "Error saving layer", error: err.message });
    }
});

module.exports = router;