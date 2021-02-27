import * as React from 'react';
import {Options} from 'react-native-navigation';
import {Command, ScreenComponent} from './common';

type Context = {
  submit: React.Dispatch<Command>;
  locate: (id: string) => ScreenComponent;
  connect: (channel: string, listener: (value: Options) => void) => () => void;
  getScreenToken: (screen: {componentId: string; name: string}) => string;
  onError: (error: Error) => void;
};

const Navigator = React.createContext<Context | null>(null);

export function useNavigator(): Context {
  const context = React.useContext(Navigator);
  if (context === null) {
    throw new Error('Must be wrapped with NavigatorProvider');
  }
  return context;
}

export const NavigatorProvider = Navigator.Provider;
