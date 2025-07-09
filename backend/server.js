const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/schedules", require("./routes/lguSchedule"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/news", require("./routes/news"));
app.use("/api/flood-analyze", require("./routes/flood"));         // ✅ Flood analysis
app.use("/api/flood-reports", require("./routes/floodReports"));  // ✅ Flood report submission

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
