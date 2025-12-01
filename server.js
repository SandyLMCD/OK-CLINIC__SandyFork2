const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const petRoutes = require("./routes/pet");
const bookingRoutes = require("./routes/booking");
const feedbackRoutes = require("./routes/feedback");
const invoiceRoutes = require("./routes/invoice");
const adminRoutes = require("./routes/admin");
const adminServicesRouter = require("./routes/adminServices");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// simple request logger
app.use((req, res, next) => {
  console.log("REQ", req.method, req.url);
  next();
});

// CORS: allow React dev origin and credentials
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Public routes (no auth)
app.use("/api/auth", authRoutes);

// Protected routes (need JWT)
app.use(authMiddleware);

// Core resources
app.use("/api/pets", petRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/invoices", invoiceRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);              // /api/admin/users, /pets, /invoices, /feedbacks, etc.
app.use("/api/admin/services", adminServicesRouter); // /api/admin/services[...]

mongoose
  .connect("mongodb://localhost:27017/pawcare_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(5000, () => console.log("Server running on port 5000"))
  )
  .catch((err) => console.error("Failed to connect to MongoDB:", err));
