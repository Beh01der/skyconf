import { resolve } from "node:path";

export const config = {
  port: parseInt(process.env.SKYCONF_PORT || "3000"),
  dataDir: resolve(process.env.SKYCONF_DATA_DIR || "./data"),
  unsafeRemoveDir: process.env.SKYCONF_UNSAFE_REMOVE_DIR === "true",
};
