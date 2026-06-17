import Component from '@glimmer/component';

const LIST_DATA = [
  { label: 'Projects', icon: 'folder' },
  { label: 'Store Monitoring', icon: 'inventory-2' },
  { label: 'Analytics', icon: 'graphic-eq' },
  { label: 'Organization', icon: 'group' },
  { label: 'Settings', icon: 'account-box' },
];

interface AkListFreestyleDemoSignature {
  Args: {
    button?: boolean;
    link?: boolean;
    selected?: boolean;
    disabled?: boolean;
  };
}

export default class AkListFreestyleDemoComponent extends Component<AkListFreestyleDemoSignature> {
  listData = LIST_DATA;
}
