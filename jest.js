const {proxy} = require('./dist/proxy');

class NotImplementedError extends Error {
  constructor(message = '', ...args) {
    super(message, ...args);
    this.name = 'NotImplementedError';
    this.message = message ? message + ' has not yet been implemented.' : 'Missing implementation';
  }
}

exports.Navigation = {
  showModal: jest.fn(async (layout) => proxy.submit({type: 'showModal', layout})),
  dismissModal: jest.fn(async (target) => proxy.submit({type: 'dismissModal', target})),
  dismissAllModals: jest.fn(async () => proxy.submit({type: 'dismissAllModals'})),
  push: jest.fn(async (target, layout) => proxy.submit({type: 'push', target, layout})),
  pop: jest.fn(async (target, mergeOptions) => proxy.submit({type: 'pop', target, mergeOptions})),
  popTo: jest.fn(async (target, mergeOptions) => proxy.submit({type: 'popTo', target, mergeOptions})),
  mergeOptions: jest.fn((target, options) => proxy.submit({type: 'mergeOptions', target, options})),

  addLayoutProcessor: proxy.addLayoutProcessor,

  addOptionProcessor: jest.fn(() => proxy.fail(new NotImplementedError('addOptionProcessor'))),
  registerComponent: jest.fn(() => proxy.fail(new NotImplementedError('registerComponent'))),
  showOverlay: jest.fn(() => proxy.fail(new NotImplementedError('showOverlay'))),
  dismissOverlay: jest.fn(() => proxy.fail(new NotImplementedError('dismissOverlay'))),

  events: (() => {
    const registry = Object.assign(jest.requireActual('react-native-navigation').Navigation.events(), {
      registerCommandListener: proxy.registerCommandListener,
      registerModalDismissedListener: proxy.registerModalDismissedListener,
    });
    return () => registry;
  })(),
};

exports.CommandName = jest.requireActual('react-native-navigation').CommandName;
