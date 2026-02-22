import express from "express";
import os from "os";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Hello from TypeScript!", hostname: os.hostname() });
});

app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.listen(3000, () => console.log("Server on port 3000"));
