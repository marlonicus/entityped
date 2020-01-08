/**
 * This file is auto-generated and shouldn't be edited manually.
 * (... or at the very least don't piss around with the @...@ comments)
 */

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

