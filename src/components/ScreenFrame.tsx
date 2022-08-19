import * as React from 'react';
import {View} from 'react-native';
import {CloseAction, ScreenData} from '../common';
import TopBar from './TopBar';
import {useNavigator} from '../context';

export default React.memo(function ScreenFrame({screen, closeAction}: {screen: ScreenData; closeAction: CloseAction}) {
  const {locate, getScreenToken} = useNavigator();
  const Screen = locate(screen.name);
  return (
    <View testID={getScreenToken(screen)}>
      <TopBar key="topbar" topBar={screen.options?.topBar} componentId={screen.componentId} closeAction={closeAction} />
      <Screen key="content" {...screen.props} componentId={screen.componentId} />
    </View>
  );
});
