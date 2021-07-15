import * as React from 'react';
import {Command} from './common';

type Dictionary<T> = {[key: string]: T};

export function noop() {}

export function getComponentId(value: {componentId: string}) {
  return value.componentId;
}

export function forward(command: Command, dispatcher: (command: Command) => void) {
  dispatcher(command);
}

export function useTransmissionChannels<T>(): [
  (channel: string, value: T) => void,
  (channel: string, listener: (value: T) => void) => () => void,
] {
  const [subscribers] = React.useState<Dictionary<((value: T) => void) | undefined | null | T[]>>({});
  const publish = React.useCallback(
    (channel: string, value: T) => {
      const receiver = subscribers[channel];
      if (receiver === undefined) {
        subscribers[channel] = [value];
      } else if (receiver === null) {
        throw new Error(`Closed channel ${channel}`);
      } else if (Array.isArray(receiver)) {
        receiver.push(value);
      } else if (typeof receiver === 'function') {
        receiver(value);
      }
    },
    [subscribers],
  );
  const subscribe = React.useCallback(
    (channel: string, listener: (value: T) => void) => {
      const queue = subscribers[channel];
      subscribers[channel] = listener;
      Array.isArray(queue) && queue.forEach(listener);
      return () => {
        subscribers[channel] = () => undefined;
        setTimeout(() => (subscribers[channel] = null), 0);
      };
    },
    [subscribers],
  );
  return [publish, subscribe];
}
