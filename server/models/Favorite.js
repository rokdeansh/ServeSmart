const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  userId: String,
  mealId: String,
  mealName: String,
  mealImage: String
});

favoriteSchema.index({ userId: 1, mealId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
