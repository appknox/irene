import Component from '@glimmer/component';

interface StoreknoxProductIconSignature {
  Args: {
    product: 'sm' | 'vapt' | 'android' | 'ios';
  };
  Blocks: { default: [] };
}

export default class StoreknoxProductIcon extends Component<StoreknoxProductIconSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::ProductIcon': typeof StoreknoxProductIcon;
  }
}
