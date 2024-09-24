import Component from '@glimmer/component';

export interface StoreknoxCommonTableColumnsData {
  devName?: string;
  devEmail?: string;
  appUrl: string;
  isAndroid?: boolean;
  isIos?: boolean;
  iconUrl: string;
  name: string;
  packageName: string;
  companyName: string;
  mailId?: string;
  title: string;
  reason: string;
  svg: string;
  docUlid: string;
}

export default class StoreknoxDiscoverTableColumnsComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::TableColumns': typeof StoreknoxDiscoverTableColumnsComponent;
  }
}
