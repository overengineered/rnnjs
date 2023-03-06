import {Command, Configuration, ScreenData} from './common';

const PREFIX = 'rnnjs:';

function last<T>(items: T[]): T | null {
  return items.length > 0 ? items[items.length - 1] : null;
}

export function findActiveScreen(configuration: Configuration): ScreenData | null {
  return last(last(configuration.modals) ?? configuration.tabs[configuration.selectedTab]);
}

export function applyCommand(scene: Configuration, action: Command): Configuration {
  switch (action.type) {
    case 'mergeOptions':
      // For peformance, mergeOptions is handled by sending updates directly to TopBar component
      return scene;
    case 'launch': {
      const {type: _, ...rest} = action;
      return {
        nextId: 1,
        activeId: null,
        selectedTab: NaN,
        tabs: [],
        modals: [],
        ...rest,
      };
    }
    case 'selectTab': {
      if (scene.selectedTab === action.tab) {
        const targetStack = scene.tabs[action.tab];
        const modifiedStack = targetStack.slice(0, 1);
        const tabs = scene.tabs.map((stack) => (stack === targetStack ? modifiedStack : stack));
        const activeId = last(modifiedStack)!.componentId;
        return {nextId: scene.nextId, activeId, selectedTab: action.tab, tabs: tabs, modals: scene.modals};
      } else {
        const activeId = last(scene.tabs[action.tab])!.componentId;
        return {nextId: scene.nextId, activeId, selectedTab: action.tab, tabs: scene.tabs, modals: scene.modals};
      }
    }
    case 'push': {
      const componentId = action.layout.component?.id ?? PREFIX + scene.nextId;
      // TODO: verify that action.target is correct
      // TODO: verify passProps is an object|undefined
      // TODO: when action.layout.component?.id is given, it should be valid (not exist anywhere)
      const targetStack =
        scene.modals.length > 0 && last(scene.modals)?.find((it) => it.componentId === action.target)
          ? last(scene.modals)
          : scene.tabs.find((stack) => stack.find((it) => it.componentId === action.target));
      if (!targetStack) {
        throw new Error(`Cannot push to ${action.target}`);
      }
      const modifiedStack = [
        ...targetStack,
        {
          componentId,
          name: String(action.layout.component!.name),
          props: action.layout.component?.passProps,
          options: action.layout.component?.options,
        },
      ];
      const tabs = scene.tabs.map((stack) => (stack === targetStack ? modifiedStack : stack));
      const modals = scene.modals.map((stack) => (stack === targetStack ? modifiedStack : stack));
      const activeId = last(modifiedStack)?.componentId === componentId ? componentId : scene.activeId;
      return {nextId: scene.nextId + 1, activeId, selectedTab: scene.selectedTab, tabs, modals};
    }
    case 'pop': {
      const targetStack =
        scene.modals.length > 0
          ? last(scene.modals)
          : scene.tabs.find((stack) => last(stack)?.componentId === action.target);
      if (!targetStack || targetStack.length === 0) {
        throw new Error(`Cannot pop ${action.target}`);
      }
      const modifiedStack = targetStack.slice(0, targetStack.length - 1);
      const activeId = last(modifiedStack)?.componentId ?? null;
      const tabs = scene.tabs.map((stack) => (stack === targetStack ? modifiedStack : stack));
      const modals = scene.modals.map((stack) => (stack === targetStack ? modifiedStack : stack));
      return {nextId: scene.nextId + 1, activeId, selectedTab: scene.selectedTab, tabs, modals};
    }
    case 'popTo': {
      const targetStack = scene.modals.length > 0 ? last(scene.modals) : scene.tabs[scene.selectedTab];
      const remainder = targetStack?.findIndex((e) => e.componentId === action.target);
      if (!targetStack || remainder == null || remainder < 0) {
        throw new Error(`Cannot popTo ${action.target}`);
      }
      const modifiedStack = targetStack.slice(0, remainder + 1);
      const activeId = last(modifiedStack)?.componentId ?? null;
      const tabs = scene.tabs.map((stack) => (stack === targetStack ? modifiedStack : stack));
      const modals = scene.modals.map((stack) => (stack === targetStack ? modifiedStack : stack));
      return {nextId: scene.nextId + 1, activeId, selectedTab: scene.selectedTab, tabs, modals};
    }
    case 'showModal': {
      // TODO: support showing modals without stack
      const component = action.layout.stack?.children?.[0].component;
      const componentId = component?.id ?? PREFIX + scene.nextId;
      return {
        nextId: scene.nextId + 1,
        activeId: componentId,
        selectedTab: scene.selectedTab,
        tabs: scene.tabs,
        modals: [
          ...scene.modals,
          [
            {
              componentId: component?.id ?? PREFIX + scene.nextId,
              name: String(component!.name),
              props: component?.passProps,
              options: component?.options,
            },
          ],
        ],
      };
    }
    case 'dismissModal': {
      // TODO: assert that modal/alert/actionSheet is active
      const modals = scene.modals.slice(0, scene.modals.length - 1);
      const stack = last(modals);
      const revealed = stack ? last(stack) : last(scene.tabs[scene.selectedTab] ?? []);
      return {
        nextId: scene.nextId,
        activeId: revealed ? revealed.componentId : null,
        selectedTab: scene.selectedTab,
        tabs: scene.tabs,
        modals,
      };
    }
    case 'dismissAllModals': {
      // TODO: assert that modal/alert/actionSheet is active
      const revealed = last(scene.tabs[scene.selectedTab] ?? []);
      return {
        nextId: scene.nextId,
        activeId: revealed ? revealed.componentId : null,
        selectedTab: scene.selectedTab,
        tabs: scene.tabs,
        modals: [],
      };
    }
  }
}
