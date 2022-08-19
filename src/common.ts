import * as React from 'react';
import {Options, Layout} from 'react-native-navigation';
import _ from 'lodash/fp';

export type ScreenComponent = React.ComponentType<{componentId: string}> & {options?: unknown};

export type Command =
  | {type: 'launch'}
  | {type: 'selectTab'; tab: number}
  | {type: 'push'; target: string; layout: Layout}
  | {type: 'pop'; target: string; mergeOptions?: Options}
  | {type: 'popTo'; target: string; mergeOptions?: Options}
  | {type: 'showModal'; layout: Layout}
  | {type: 'dismissModal'; target: string}
  | {type: 'dismissAllModals'}
  | {type: 'mergeOptions'; target: string; options: Options};

export type ScreenData = {
  componentId: string;
  name: string;
  props?: object;
  options?: Options;
};

export type ScreenStack = ScreenData[];

export type Configuration = {
  nextId: number;
  activeId: string | null;
  selectedTab: number;
  tabs: ScreenStack[];
  modals: ScreenStack[];
};

export type CloseAction = 'BACK' | 'DISMISS';

function arraysAsValues(objValue: unknown, srcValue: unknown) {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return srcValue;
  }
  return undefined; // default lodash merge
}

export function mergeNavigationOptions(currentOptions: Options | undefined, patch: Options | undefined): Options {
  return patch == null ? currentOptions ?? {} : _.mergeWith(arraysAsValues, currentOptions, patch);
}
