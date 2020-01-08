import { TComponentInitialised } from "entityped";

// @entityped-component-imports@

type ComponentInit<TInit> = (init: TInit) => TComponentInitialised;

const pickComponent = <ComponentTypes>(obj: {
    [id: string]: { Component: Function };
}): ComponentTypes => {
    const newObj = {} as ComponentTypes;
    for (let i in obj) {
        newObj[i] = obj[i].Component;
    }
    return newObj;
};

export type TComponentStateMap = {
    // @entityped-component-state-map@
};

export type ComponentTypes = {
    // @entityped-component-types@
};

export const Components: ComponentTypes = pickComponent<ComponentTypes>({
    // @entityped-components@
});

