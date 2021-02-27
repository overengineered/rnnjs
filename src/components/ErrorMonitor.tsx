import * as React from 'react';

export default class ErrorMonitor extends React.Component<{onError: (error: Error) => void}> {
  static getDerivedStateFromError(error: unknown) {
    return {error};
  }

  state = {error: null};

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.state.error ? null : this.props.children ?? null;
  }
}
