import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, Request, Response } from "express";
require("express-async-errors");
import { config } from "./config";
import { errorHandler } from "./errors";
import { storageRouter } from "./router";

const app: Express = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/v1/storage", storageRouter);

console.log("Using config: %j", config);
app.listen(config.port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${config.port}`);
});

app.use(errorHandler);
