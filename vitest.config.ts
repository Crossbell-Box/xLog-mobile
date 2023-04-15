import { defineConfig } from "vitest/config";
import fs from "fs";
import path from "path";
const srcDir = path.resolve(__dirname, "src");
const dirs = fs.readdirSync(srcDir).filter((file) => fs.statSync(path.join(srcDir, file)).isDirectory());

export default defineConfig({
    test: {
    },
    resolve: {
        alias: dirs.reduce((acc, dir) => {
            acc[`@/${dir}`] = `./src/${dir}`;
            return acc;
          }, { })
    },
});
