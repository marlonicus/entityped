import { Game } from "./engine";
import RenderSystem from "./systems/render";

const playerEntity = Game.Entity({
    components: [
        Game.Components.Character({
            name: "Mr. Hello World"
        })
    ]
});

Game.addEntity(playerEntity);
Game.addSystem(RenderSystem);

Game.updateSystems();