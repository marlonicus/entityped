import { Game } from "../engine";

const RenderSystem = Game.System({
    name: "render",

    update: ({ entities }) => {
        let renderOutput = "Characters:\n";

        // Loop through each entity and render their status to the console
        for (let entityId in entities) {
            const entity = entities[entityId];
            renderOutput += `\nName: ${entity.components.character.name} / Age: ${entity.components.character.age}`
        }

        // Very crude rendering system :)
        document.getElementById("canvas").innerText = renderOutput
    }
})

export default RenderSystem;