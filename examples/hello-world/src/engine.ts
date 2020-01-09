import { Engine } from "entityped";
import { TComponentStateMap, ComponentTypes, Components } from "./entityped";

export const Game = Engine<TComponentStateMap, ComponentTypes>({ Components });