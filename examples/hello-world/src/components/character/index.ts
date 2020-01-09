import { Component as EntitypedComponent } from "entityped";

export type TInit = { name: string; age?: number; };
export type TState = { name: string; age: number; };

export const Component = EntitypedComponent<TInit, TState>(
    "character",
    ({ name, age }) => ({
        name,
        age: age || Math.floor(Math.random() * 50 + 10)
    })
);
