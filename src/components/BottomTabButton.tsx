import * as React from 'react';
import {Button} from 'react-native';
import {OptionsBottomTab} from 'react-native-navigation';
import {useNavigator} from '../context';

export default function BottomTabButton({testID, text, index}: OptionsBottomTab & {index: number}) {
  const {submit} = useNavigator();
  const selectTab = React.useCallback(() => submit({type: 'selectTab', tab: index}), [submit, index]);
  return <Button testID={testID} title={text ?? `#${index}`} onPress={selectTab} />;
}
