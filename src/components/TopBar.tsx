import * as React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Options, OptionsTopBar} from 'react-native-navigation';
import TopBarButton from './TopBarButton';
import {mergeNavigationOptions, CloseAction} from '../common';
import {useNavigator} from '../context';

function createTopBarPatch(update?: OptionsTopBar) {
  return (current?: OptionsTopBar) => mergeNavigationOptions({topBar: current}, {topBar: update}).topBar;
}

export default function TopBar(props: {topBar?: OptionsTopBar; componentId: string; closeAction: CloseAction}) {
  const {componentId} = props;
  const {connect, submit} = useNavigator();

  const [topBar, setTopBar] = React.useState<OptionsTopBar | undefined>(props.topBar);

  React.useEffect(
    () => connect(props.componentId, (options: Options) => setTopBar(createTopBarPatch(options.topBar))),
    [connect, props.componentId],
  );

  const buttons = (topBar?.leftButtons || []).concat(topBar?.rightButtons || []);
  const pop = React.useCallback(() => submit({type: 'pop', target: componentId}), [submit, componentId]);
  const dismiss = React.useCallback(() => submit({type: 'dismissModal', target: componentId}), [submit, componentId]);
  const close = props.closeAction === 'DISMISS' ? dismiss : pop;

  return topBar?.visible === false ? null : (
    <View testID={topBar?.testID}>
      {!!topBar?.backButton && <TouchableOpacity testID={topBar.backButton.testID} onPress={close} />}
      {!!topBar?.title?.text && <Text>{topBar.title.text}</Text>}
      {!!topBar?.subtitle?.text && <Text>{topBar.subtitle.text}</Text>}
      {buttons.map((button) => (
        <TopBarButton key={button.id} componentId={props.componentId} {...button} />
      ))}
    </View>
  );
}
