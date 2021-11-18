import type {EmitterSubscription} from 'react-native';
import type {Navigation, EventsRegistry, Layout, CommandName} from 'react-native-navigation';
import {Command} from './common';

const commandHandlers: (((command: Command) => void) | null)[] = [];
const errorMonitors: (((error: Error) => void) | null)[] = [];

function createSubscription<T>(collection: (T | null)[], item: T) {
  const index = collection.length;
  collection.push(item);
  return {remove: () => void (collection[index] = null)};
}

const layoutProcessors: (Parameters<typeof Navigation['addLayoutProcessor']>[0] | null)[] = [];
const commandListeners: (Parameters<EventsRegistry['registerCommandListener']>[0] | null)[] = [];
const modalDismissedListeners: (Parameters<EventsRegistry['registerModalDismissedListener']>[0] | null)[] = [];

const callbacks: Pick<typeof Navigation, 'addLayoutProcessor'> &
  Pick<EventsRegistry, 'registerCommandListener' | 'registerModalDismissedListener'> = {
  addLayoutProcessor(processor) {
    return createSubscription(layoutProcessors, processor);
  },
  registerCommandListener(callback) {
    return createSubscription(commandListeners, callback);
  },
  registerModalDismissedListener(callback) {
    return createSubscription(modalDismissedListeners, callback) as EmitterSubscription;
  },
};

export const proxy = {
  ...callbacks,

  submit(command: Command): void {
    commandHandlers.forEach((fn) => void (fn && fn(command)));
  },

  fail(error: Error): void {
    errorMonitors.forEach((fn) => void (fn && fn(error)));
  },

  connect(submit: (command: Command) => void, onError: (error: Error) => void): () => void {
    const index = commandHandlers.length;
    commandHandlers.push(submit);
    errorMonitors.push(onError);
    return () => {
      commandHandlers[index] = null;
      errorMonitors[index] = null;
    };
  },

  process(command: Command) {
    // Call commandListeners
    commandListeners.forEach((fn) => fn?.(command.type, command));

    // Call modalDismissedListeners
    if (command.type === 'dismissModal') {
      const data = Object.defineProperties(new Object(), {
        modalsDismissed: {value: 1},
        componentId: {get: () => this.fail(new Error('Not implemented'))},
        componentName: {get: () => this.fail(new Error('Not implemented'))},
      });
      modalDismissedListeners.forEach((fn) => fn?.(data));
    }

    // Call layoutProcessors
    switch (command.type) {
      case 'showModal':
      case 'push':
        const layout = layoutProcessors.reduce(
          (layout, fn) => (fn ? fn(layout as Layout<{}>, command.type as CommandName) : layout),
          command.layout,
        );
        Object.assign(command, {layout});
        break;
    }
  },
};
