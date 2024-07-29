import { Request, Response } from "express";
import axios from "axios";
import xml2js from "xml2js";
import { Worker } from "worker_threads";
import { reconstructTreeFromDB } from "../utils/treeReconstructor";
import os from "os";
import { redisPool } from "../cache";
import { dbPool, initializeDatabase } from "../db";
import { config } from "../config";
import fs from "fs/promises";

export async function getTreeData(req: Request, res: Response): Promise<void> {
  const cacheKey = "treeData";
  try {
    const redisClient = await redisPool.acquire();
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        res.json(JSON.parse(cachedData));
        return;
        1;
      }
    } finally {
      redisPool.release(redisClient);
    }

    const db = await dbPool.acquire();
    try {
      const result = await db.all("SELECT name, size FROM ImageNetData");
      const tree = reconstructTreeFromDB(result);

      const redisClient = await redisPool.acquire();
      try {
        await redisClient.set(cacheKey, JSON.stringify(tree), { EX: 3600 });
      } finally {
        redisPool.release(redisClient);
      }

      res.json(tree);
    } finally {
      dbPool.release(db);
    }
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
}

export async function getSubcategories(
  req: Request,
  res: Response
): Promise<void> {
  const category = req.params.category;
  const cacheKey = `subcategories_${category}`;
  let redisClient, db;
  try {
    redisClient = await redisPool.acquire();
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      res.json(JSON.parse(cachedData));
      return;
    }
    db = await dbPool.acquire();
    const results = await db.all(
      `
      SELECT name AS category, size
      FROM ImageNetData
      WHERE category LIKE ? || ' > %'
    `,
      [category]
    );
    if (!results.length) {
      res.status(404).send("Category not found");
      return;
    }
    const response: ResponseType = {};
    results.forEach((row) => {
      const subcategory = row.category
        .replace(`${category} > `, "")
        .split(" > ")[0];
      if (!response[subcategory]) {
        response[subcategory] = {
          name: category,
          size: row.size,
          children: subcategory,
          next: `${category} > ${subcategory}`
        };
      }
    });
    const responseArray = Object.values(response);
    await redisClient.set(cacheKey, JSON.stringify(responseArray), {
      EX: 3600
    });
    res.json(responseArray);
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    res.status(500).send("An error occurred while fetching subcategories");
  } finally {
    if (redisClient) await redisPool.release(redisClient);
    if (db) await dbPool.release(db);
  }
}

export async function initialize(): Promise<void> {
  try {
    await fs.unlink(config.database.filename).catch((err) => {
      if (err.code !== "ENOENT") throw err;
    });

    await initializeDatabase();

    const url = config.url;
    const parsedXML = await fetchAndParseXML(url);
    const worker = new Worker("./src/workers/dataTransformer.js", {
      workerData: parsedXML
    });
    worker.on("message", async (data) => {
      await insertDataToDB(data);
      console.log("Data ingested, transformed, and stored successfully.");
    });
    worker.on("error", (error) => {
      console.error("Worker error:", error);
    });
    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  } catch (err) {
    console.error("Error during initialization:", err);
  }
}

async function fetchAndParseXML(url: string) {
  const response = await axios.get(url);
  const parser = new xml2js.Parser();
  return parser.parseStringPromise(response.data);
}

async function insertDataToDB(data: { name: string; size: number }[]) {
  const db = await dbPool.acquire();
  try {
    await db.run("BEGIN TRANSACTION");
    const insertQuery = "INSERT INTO ImageNetData (name, size) VALUES (?, ?)";
    const stmt = await db.prepare(insertQuery);
    for (const item of data) {
      await stmt.run([item.name, item.size]);
    }
    await stmt.finalize();
    await db.run("COMMIT");
  } catch (err) {
    await db.run("ROLLBACK");
    console.error(err);
  } finally {
    dbPool.release(db);
  }
}

type ResponseType = {
  [key: string]: {
    name: string;
    size: number;
    children: string;
    next: string;
  };
};
