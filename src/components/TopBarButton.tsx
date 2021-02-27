import * as React from 'react';
import {Button} from 'react-native';
import {Navigation, OptionsTopBarButton} from 'react-native-navigation';

export default function TopBarButton(props: OptionsTopBarButton & {componentId: string}) {
  const {id: buttonId, componentId, enabled = true} = props;
  const emitEvent = React.useCallback(() => {
    // @ts-ignore
    Navigation.events().componentEventsObserver.notifyNavigationButtonPressed({buttonId, componentId});
  }, [buttonId, componentId]);
  return <Button disabled={!enabled} title={props.text ?? ''} testID={props.testID} onPress={emitEvent} />;
}
