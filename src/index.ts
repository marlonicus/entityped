// UUID

export const uuid = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Component

type TComponentData = {
  [prop: string]: number | string | number[] | string[] | TComponentData;
};

export type TComponentInitialised = {
  readonly name: string;
  value: TComponentData;
};

export type TComponentUninitialised = (
  props: TComponentData
) => TComponentInitialised;

export const Component = <TInit, TReturn>(
  name: string,
  fn: (init: TInit) => TReturn
) => (props: TInit = {} as TInit) => ({
  get name() {
    return name;
  },
  value: fn(props)
});

// Entity

type TEntityCreationProps = {
  id?: string;
  components?: TComponentInitialised[];
};

type TEntityCreation<ComponentMap> = (
  init: TEntityCreationProps
) => TEntity<ComponentMap>;

export type TEntity<ComponentMap> = {
  readonly components: ComponentMap;
  readonly id: string;

  addComponent: (component: TComponentInitialised) => void;
  removeComponent: (name: keyof ComponentMap) => void;
  hasComponent: (name: string) => boolean;
  debug: () => void;
};

const createEntity = <ComponentMap>() => {
  const Entity: TEntityCreation<ComponentMap> = ({
    id = uuid(),
    components: initialComponents = []
  }) => {
    const components: ComponentMap = initialComponents.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.name]: curr.value
      }),
      {}
    ) as ComponentMap;

    return {
      get components() {
        return components;
      },

      get id() {
        return id;
      },

      addComponent: (component: TComponentInitialised) => {
        components[component.name] = component.value;
      },

      removeComponent: (name: keyof ComponentMap) => {
        delete components[name];
      },

      hasComponent: name => {
        return !!components[name];
      },

      debug: () => {
        console.log(
          JSON.stringify(
            {
              id,
              components
            },
            null,
            2
          )
        );
      }
    };
  };
  return Entity;
};

// System

export type TEntityMap<ComponentMap> = {
  [id: string]: TEntity<ComponentMap>;
};

type TSystemUpdate<ComponentMap, Inject> = ({
  entities,
  inject
}: {
  entities: TEntityMap<ComponentMap>;
  inject?: Inject;
}) => void;

type TSystem<ComponentMap, Inject = null> = {
  readonly name: string;
  readonly inject?: Inject;
  update: TSystemUpdate<ComponentMap, Inject>;
};

type TSystemCreationProps<ComponentMap, Inject> = {
  name: string;
  update: TSystemUpdate<ComponentMap, Inject>;
  inject?: Inject;
};

const createSystem = <ComponentMap>() => {
  return <Inject>({
    name,
    inject,
    update
  }: TSystemCreationProps<ComponentMap, Inject>): TSystem<
    ComponentMap,
    Inject
  > => {
    return {
      update,
      inject: inject as Inject,
      get name() {
        return name;
      }
    } as TSystem<ComponentMap, Inject>;
  };
};

// Helpers

type ValueOf<T> = T[keyof T];

const filterObj = <T>(obj: T, predicate: (x: ValueOf<T>) => boolean): T => {
  let result = {} as T,
    key: string;

  for (key in obj) {
    if (obj.hasOwnProperty(key) && predicate(obj[key])) {
      result[key] = obj[key];
    }
  }

  return result;
};

// Engine

type TSubscriptionHandler = (props?: any) => void;

type TEngine<ComponentMap, ComponentTypes> = {
  Entity: TEntityCreation<ComponentMap>;
  System: <Inject>(
    init: TSystemCreationProps<ComponentMap, Inject>
  ) => TSystem<ComponentMap, Inject>;
  Components: ComponentTypes;

  addSystem: (system: TSystem<ComponentMap, any>) => void;
  addEntity: (entity: TEntity<ComponentMap>) => void;
  removeEntityById: (id: string) => void;
  removeSystem: (name: string) => void;

  entityById: (id: string) => TEntity<ComponentMap>;

  entityQuery: ({
    id,
    include,
    exclude,
    excludeIds
  }: {
    id?: string | false;
    include?: (keyof ComponentMap)[];
    exclude?: (keyof ComponentMap)[];
    excludeIds?: string[];
  }) => TEntityMap<ComponentMap>;

  queueAction: (fn: Function) => void;

  subscribe: (name: string, handler: TSubscriptionHandler) => void;
  dispatch: (name: string, props?: any) => void;

  updateSystems: () => void;
  debug: () => void;
  toString: () => string;
};

type TSubscriptions = Record<string, TSubscriptionHandler[]>;

export const Engine = <ComponentMap, ComponentTypes>({
  Components
}): TEngine<ComponentMap, ComponentTypes> => {
  const entities: TEntityMap<ComponentMap> = {};
  const systems: TSystem<ComponentMap>[] = [];
  const subscriptions: TSubscriptions = {};
  let actionQueue: Function[] = [];

  return {
    Entity: createEntity<ComponentMap>(),
    System: createSystem<ComponentMap>(),
    Components: Components as ComponentTypes,

    addSystem: system => systems.push(system),
    addEntity: entity => (entities[entity.id] = entity),
    removeEntityById: id => delete entities[id],
    removeSystem: name => {
      for (let i = systems.length - 1; i > 0; i--) {
        if (systems[i].name === name) {
          systems.splice(i, 1);
          break;
        }
      }
    },

    entityById: id => entities[id],

    entityQuery: ({ include = [], exclude = [], excludeIds = [] }) => {
      const withoutExcludedIds = filterObj(
        entities,
        entity => !excludeIds.includes(entity.id)
      );

      return filterObj(withoutExcludedIds, ({ components }) => {
        const componentList = Object.keys(components);

        for (let i = 0; i < include.length; i++) {
          if (!componentList.includes(include[i] as string)) {
            return false;
          }
        }

        for (let i = 0; i < exclude.length; i++) {
          if (componentList.includes(exclude[i] as string)) {
            return false;
          }
        }

        return true;
      });
    },

    dispatch: (name, props) => {
      if (subscriptions[name]) {
        for (let i = 0; i < subscriptions[name].length; i++) {
          subscriptions[name][i](props);
        }
      }
    },

    subscribe: (name, handler) => {
      if (!subscriptions[name]) {
        subscriptions[name] = [];
      }
      subscriptions[name].push(handler);
    },

    // Adds an action to be called at the start of the next system update cycle
    queueAction: fn => {
      actionQueue.push(fn);
    },

    updateSystems: () => {
      if (actionQueue.length) {
        for (let i = 0; i < actionQueue.length; i++) {
          actionQueue[i]();
        }
        actionQueue = [];
      }

      for (let i = 0; i < systems.length; i++) {
        systems[i].update({
          entities,
          inject: systems[i].inject
        });
      }
    },

    toString: () =>
      JSON.stringify({
        entities
      }),

    debug: () => {
      console.log(
        JSON.stringify(
          {
            entities,
            systems: systems.map(x => x.name)
          },
          null,
          2
        )
      );
    }
  };
};
