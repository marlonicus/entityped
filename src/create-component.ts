#!/usr/bin/env node

import { prompt } from "promptly";
const { promises: fs } = require("fs");
const path = require("path");

const CONFIG_FILE = "entitypedConfig.json";
const cwd = process.cwd();

const COMPONENT_IDENTIFIERS = {
    imports: "@entityped-component-imports@",
    stateMap: "@entityped-component-state-map@",
    types: "@entityped-component-types@",
    components: "@entityped-components@"
}

const toPascalCase = (str: string) => str.replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '$')
    .replace(/[^A-Za-z0-9]+/g, '$')
    .replace(/([a-z])([A-Z])/g, (m, a, b) => a + '$' + b)
    .toLowerCase()
    .replace(/(\$)(\w?)/g, (m, a, b) => b.toUpperCase());

const toKebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();

const toCamelCase = (str: string) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return index == 0 ? word.toLowerCase() : word.toUpperCase();
}).replace(/\s+/g, '');

const addNameToTemplate = (template: string, name: string) => template.replace(/@name@/gi, `"${toCamelCase(name)}"`);

(async () => {
    console.log("Entityped - Create Component\n---\n");

    let config, types;

    try {
        // Load the users config
        config = JSON.parse(await fs.readFile(path.resolve(cwd, CONFIG_FILE), "utf-8"));
    } catch (err) {
        console.error(`Error: Could not find entityped config in ${cwd}.`)
        console.info(`You can run entityped-init to generate a new entitypedConfig.json.`);
        process.exit(1);
    }

    const name = await prompt("Component name? (eg. render, weapon, rigid-body..):");
    const componentTemplate = await fs.readFile(path.resolve(__dirname, `../templates/component.ts`), "utf-8");

    const componentFolderName = toKebabCase(name);

    // Create components directory (if it doesn't exist already)
    await fs.mkdir(path.resolve(cwd, config.componentsFolder, componentFolderName), { recursive: true });

    // Write new component file
    await fs.writeFile(path.resolve(cwd, config.componentsFolder, componentFolderName, "index.ts"), addNameToTemplate(componentTemplate, name));

    // Load users type file
    try {
        types = await fs.readFile(path.resolve(cwd, config.typesFile), "utf-8");
    } catch (err) {
        console.error(`Error: Could not find type definition file at ${config.typesFile}.`)
        console.info(`You can run entityped-init to generate a new one.`);
        process.exit(1);
    }

    console.log(types)

    console.log("---\nEntitype component created!")
})()