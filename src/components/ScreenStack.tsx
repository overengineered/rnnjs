import * as React from 'react';
import {ScreenStack} from '../common';
import ScreenFrame from './ScreenFrame';

export default React.memo(function ScreenStack(props: {stack: ScreenStack; modal: boolean}) {
  return (
    <>
      {props.stack.map((screen, index) => (
        <ScreenFrame key={index} screen={screen} closeAction={props.modal && index === 0 ? 'DISMISS' : 'BACK'} />
      ))}
    </>
  );
});
