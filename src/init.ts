#!/usr/bin/env node

import { prompt } from "promptly";
const { promises: fs } = require("fs");
const path = require("path");

const CONFIG_FILE = "entitypedConfig.json";
const TYPES_FILE_DEFAULT = "src/entityped.ts";
const COMPONENTS_FOLDER_DEFAULT = "src/components/";
const cwd = process.cwd();

(async () => {
    console.log("Entityped\n---\n");

    const typesFile = await prompt(`Type file destination? (default: ${TYPES_FILE_DEFAULT}):`, { default: TYPES_FILE_DEFAULT });
    const componentsFolder = await prompt(`Components directory? (default: ${COMPONENTS_FOLDER_DEFAULT}):`, { default: COMPONENTS_FOLDER_DEFAULT })

    console.log("---\nConfiguring...");

    const config = {
        typesFile,
        componentsFolder
    };

    // Create config file
    await fs.writeFile(path.resolve(cwd, CONFIG_FILE), JSON.stringify(config, null, 2));

    // Create base types file
    await fs.copyFile(path.resolve(__dirname, `../templates/types.ts`), path.resolve(cwd, typesFile));

    console.log("---\nEntitype init complete :)")
})()