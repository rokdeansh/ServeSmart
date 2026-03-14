const express = require("express");
const fetchFn = (...args) => {
  if (typeof fetch !== "undefined") {
    return fetch(...args);
  }
  return import("node-fetch").then(({ default: fetch }) => fetch(...args));
};

const router = express.Router();

router.get("/search/:name", async (req, res) => {

  try {
    const query = encodeURIComponent(req.params.name);
    const response = await fetchFn(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
    );

    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Recipe search failed" });
  }

});

router.get("/detail/:id", async (req, res) => {
  try {
    const id = encodeURIComponent(req.params.id);
    const response = await fetchFn(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );

    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Recipe lookup failed" });
  }
});

router.get("/area/:area", async (req, res) => {
  try {
    const area = encodeURIComponent(req.params.area);
    const response = await fetchFn(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`
    );

    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Area search failed" });
  }
});

router.get("/category/:category", async (req, res) => {
  try {
    const category = encodeURIComponent(req.params.category);
    const response = await fetchFn(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    );

    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Category search failed" });
  }
});

module.exports = router;
