import * as React from 'react';
import {View} from 'react-native';
import {Options} from 'react-native-navigation';
import {mergeNavigationOptions, CloseAction, ScreenComponent, ScreenData} from '../common';
import TopBar from './TopBar';
import {useNavigator} from '../context';

function getComponentOptions({options}: ScreenComponent, props?: object): Options {
  return typeof options === 'function' ? options(props) : typeof options === 'object' ? options : {};
}

export default React.memo(function ScreenFrame({screen, closeAction}: {screen: ScreenData; closeAction: CloseAction}) {
  const {locate, getScreenToken} = useNavigator();
  const Screen = locate(screen.name);
  const {topBar} = mergeNavigationOptions(getComponentOptions(Screen, screen.props), screen.options ?? {});
  return (
    <View testID={getScreenToken(screen)}>
      <TopBar key="topbar" topBar={topBar} componentId={screen.componentId} closeAction={closeAction} />
      <Screen key="content" {...screen.props} componentId={screen.componentId} />
    </View>
  );
});
