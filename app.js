// app.js
import express from "express";
import router from "./routes/index.js";

const app = express();

// app middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v2", router);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res) => {
  res.status(500).json({ message: "Try again later..." });
});

export default app;
