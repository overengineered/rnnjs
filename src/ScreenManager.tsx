import * as React from 'react';
import {Options} from 'react-native-navigation';
import ErrorMonitor from './components/ErrorMonitor';
import BottomTabs from './components/BottomTabs';
import ScreenStack from './components/ScreenStack';
import {applyCommand, findActiveScreen} from './core';
import {forward, noop, getComponentId, just, useTransmissionChannels} from './utils';
import {Command, Configuration, ScreenComponent, ScreenData} from './common';
import {NavigatorProvider} from './context';
import {proxy} from './proxy';

type Props = {
  initialTabs?: {testID?: string; text?: string; screenId: string}[];
  locate: (id: string) => ScreenComponent;
  transmit?: (command: Command, dispatcher: React.Dispatch<Command>) => void;
  getScreenToken?: (screen: {componentId: string; name: string}) => string;
  onSwitchScreen?: (screenToken?: string) => void;
  onError?: (error: Error) => void;
};

export default function ScreenManager({
  initialTabs = [],
  locate,
  transmit = forward,
  getScreenToken = getComponentId,
  onSwitchScreen = noop,
  onError = noop,
}: Props) {
  const [cleanSlate] = React.useState<Omit<Configuration, 'nextId'>>(() => {
    const staticTabs = initialTabs.map((tab, i): ScreenData[] => [{componentId: `tab#${i}`, name: tab.screenId}]);
    return {
      activeId: staticTabs[0]?.[0]?.componentId ?? null,
      selectedTab: staticTabs.length > 0 ? 0 : NaN,
      tabs: staticTabs,
      modals: [],
    };
  });

  // At the moment dynamically changing tabs or transmit function is not supported
  const [tabs] = React.useState(initialTabs);

  const [configuration, dispatch] = React.useReducer(applyCommand, {...cleanSlate, nextId: tabs.length + 1});
  const [update, connect] = useTransmissionChannels<Options>();

  const send = React.useCallback(
    (message) => {
      proxy.process(message);

      switch (message.type) {
        case 'mergeOptions':
          update(message.target, message.options);
          break;
        case 'launch':
          dispatch({type: 'launch', ...cleanSlate});
          break;
        default:
          dispatch(message);
          break;
      }
    },
    [update, cleanSlate],
  );

  const submit = React.useCallback((command) => just(transmit(command, send)), [transmit, send]);

  React.useEffect(() => proxy.connect(submit, onError), [submit, onError]);

  const [context] = React.useState(() => ({submit, locate, connect, getScreenToken, onError}));

  const [initOnce] = React.useState(() => submit);
  React.useEffect(() => just(initOnce({type: 'launch'})), [initOnce]);

  const activeScreen = findActiveScreen(configuration);
  const activeScreenToken = activeScreen ? getScreenToken(activeScreen) : undefined;
  React.useEffect(() => just(onSwitchScreen(activeScreenToken)), [onSwitchScreen, activeScreenToken]);

  return (
    <ErrorMonitor onError={onError}>
      <NavigatorProvider value={context}>
        <BottomTabs key="tab-buttons" tabs={tabs} />
        {configuration.tabs.map((stack, index) => (
          <ScreenStack key={`tab-${index}`} stack={stack} modal={false} />
        ))}
        {configuration.modals.map((stack, index) => (
          <ScreenStack key={`modal-${index}`} stack={stack} modal={true} />
        ))}
      </NavigatorProvider>
    </ErrorMonitor>
  );
}
