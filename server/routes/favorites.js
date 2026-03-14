const express = require("express");
const Favorite = require("../models/Favorite");

const router = express.Router();

router.post("/add", async (req, res) => {

  try {
    const { userId, mealId, mealName, mealImage } = req.body;

    if (!userId || !mealId) {
      return res.status(400).json({ message: "Missing user or meal" });
    }

    const fav = new Favorite({ userId, mealId, mealName, mealImage });

    await fav.save();

    res.json({ message: "Added to favorites" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Already in favorites" });
    }
    res.status(500).json({ message: "Failed to add favorite" });
  }

});

router.get("/:userId", async (req, res) => {

  try {
    const favs = await Favorite.find({ userId: req.params.userId });
    res.json(favs);
  } catch (err) {
    res.status(500).json({ message: "Failed to load favorites" });
  }

});

router.delete("/:userId/:mealId", async (req, res) => {
  try {
    const { userId, mealId } = req.params;
    await Favorite.deleteOne({ userId, mealId });
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove favorite" });
  }
});

module.exports = router;
