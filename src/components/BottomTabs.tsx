import * as React from 'react';
import {OptionsBottomTab} from 'react-native-navigation';
import BottomTabButton from './BottomTabButton';

export default React.memo(function BottomTabs(props: {tabs: OptionsBottomTab[]}) {
  return props.tabs.length < 2 ? null : (
    <>
      {props.tabs.map((tabProps, index) => (
        <BottomTabButton key={index} {...tabProps} index={index} />
      ))}
    </>
  );
});
