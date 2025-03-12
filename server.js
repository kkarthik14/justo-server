const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cors = require("cors");

dotenv.config();
connectDB();


const app = express();
app.use(express.json());

app.use(cors({ origin: process.env.BASE_URL, credentials: true })); // frontend should be running on this port

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));