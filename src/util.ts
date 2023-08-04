import { resolve } from "path";
import { config } from "./config";

export const getNormalizedPath = ({ path }: { path: string }) => resolve(config.dataDir, "." + path);
