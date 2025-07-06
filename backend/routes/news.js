const express = require("express");
const axios = require("axios");
const router = express.Router();

const NEWS_API_KEY = process.env.NEWS_API_KEY;

router.get("/weather", async (req, res) => {
  try {
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: "weather OR typhoon OR storm OR rainfall OR climate OR flood OR heatwave OR meteorology",
        language: "en",
        sortBy: "publishedAt",
        apiKey: NEWS_API_KEY,
      },
    });

    // Optional: Filter out unrelated articles (e.g., those without 'weather' in title or description)
    const filteredArticles = response.data.articles.filter(article =>
      article.title?.toLowerCase().includes("weather") ||
      article.description?.toLowerCase().includes("weather") ||
      article.content?.toLowerCase().includes("weather")
    );

    res.json({ articles: filteredArticles });
  } catch (error) {
    console.error("News API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch weather news" });
  }
});

module.exports = router;
