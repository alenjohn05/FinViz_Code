import express from "express";
import rateLimit from "express-rate-limit";
import { config } from "../config";
import { getSubcategories, getTreeData } from "../services/dataProcessor";

const router = express.Router();

const limiter = rateLimit(config.rateLimit);

router.use(limiter);

router.get("/", (req, res) => {
  res.send("Hello, TypeScript with Node.js!");
});

router.get("/api/getTreeData", getTreeData);
router.get("/api/subcategories/:category", getSubcategories);

export default router;