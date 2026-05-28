import "dotenv/config";
import express from "express";
import cors from "cors";
import { repairRouter } from "./routes/repair";

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(repairRouter);

app.listen(PORT, () => {
  console.log(`Webhook listening on port ${PORT}`);
});