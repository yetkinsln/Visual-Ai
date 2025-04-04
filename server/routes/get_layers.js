// routes/layerRoutes.js
const express = require("express");
const router = express.Router();
const Layer = require("../models/Layer");
const verifyToken = require("../middleware/authMiddleware");

router.get("/user_models", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userModels = await Layer.find({ userId: userId });

    res.status(200).json(userModels);
  } catch (err) {
    res.status(500).json({ message: "Modeller alınırken hata oluştu.", error: err.message });
  }
});

// routes/layerRoutes.js
router.delete("/user_models/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const modelId = req.params.id;

    const deletedModel = await Layer.findOneAndDelete({ _id: modelId, userId: userId });

    if (!deletedModel) {
      return res.status(404).json({ message: "Model bulunamadı veya silme yetkiniz yok." });
    }

    res.status(200).json({ message: "Model başarıyla silindi." });
  } catch (err) {
    res.status(500).json({ message: "Model silinirken hata oluştu.", error: err.message });
  }
});

module.exports = router;