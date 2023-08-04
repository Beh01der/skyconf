import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  if (error.code === "ENOENT") {
    res.status(404);
    res.json({ error: "Entity not found", path: req.path });
  } else if (error.code === "ENOTEMPTY") {
    res.status(405);
    res.json({ error: "Directory is not empty", path: req.path });
  } else {
    console.error("Unexpected error:", error);
    res.status(500);
    res.json({ error: "Internal server error", path: req.path });
  }
};
