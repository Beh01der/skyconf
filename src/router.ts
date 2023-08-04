import { Request, Response, Router } from "express";
import { applyPatch } from "fast-json-patch";
import { JSONPath } from "jsonpath-plus";
import { mkdir, readdir, readFile, rm, rmdir, stat, writeFile } from "node:fs/promises";
import { parse } from "node:path";
import { config } from "./config";
import { getNormalizedPath } from "./util";

export const storageRouter = Router();

storageRouter
  .get("*", async (req: Request, res: Response) => {
    const path = getNormalizedPath(req);
    const fileStat = await stat(path);
    if (fileStat.isDirectory()) {
      const items = await readdir(path, { withFileTypes: true });
      res.json({
        result: "success",
        isDirectory: true,
        items: items.map((it) => {
          const result = { name: it.name } as any;
          if (it.isDirectory()) {
            result.isDirectory = true;
          }
          return result;
        }),
      });
    } else {
      const jsonpath = req.query["jsonpath"];
      let item = await readFile(path)
        .then((buffer) => buffer.toString())
        .then((str) => JSON.parse(str));

      if (jsonpath) {
        item = JSONPath({ path: jsonpath as string, json: item });
      }

      res.json({ result: "success", item });
    }
  })
  .post("*", async (req: Request, res: Response) => {
    const path = getNormalizedPath(req);
    // create dir if not exists
    const { dir } = parse(path);
    const item = req.body;
    await mkdir(dir, { recursive: true });
    await writeFile(path, JSON.stringify(item, null, 2));
    res.json({ result: "success", item });
  })
  .patch("*", async (req: Request, res: Response) => {
    const patch = req.body;
    const path = getNormalizedPath(req);

    let item = await readFile(path)
      .then((buffer) => buffer.toString())
      .then((str) => JSON.parse(str));

    const format = req.query["format"] || "json";
    switch (format) {
      case "json-patch":
        item = applyPatch(item, patch).newDocument;
        break;
      default:
        item = { ...item, ...patch };
    }

    await writeFile(path, JSON.stringify(item, null, 2));
    res.json({ result: "success", item });
  })
  .delete(/\/.+/, async (req: Request, res: Response) => {
    const path = getNormalizedPath(req);
    const fileStat = await stat(path);
    if (fileStat.isDirectory()) {
      if (config.unsafeRemoveDir) {
        await rm(path, { recursive: true, force: true });
      } else {
        await rmdir(path);
      }
    } else {
      await rm(path);
    }

    res.json({ result: "success" });
  });
