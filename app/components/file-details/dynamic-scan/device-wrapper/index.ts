import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

interface DeviceWrapperSignature {
  Args: {
    showStatusChip?: boolean;
    showActionButton?: boolean;
    loadingScanStatus?: boolean;
    isFullscreenSupported?: boolean;
  };
  Blocks: {
    default: [{ isFullscreen: boolean; closeFullscreen: () => void }];
    statusChip: [];
    actionDrawer: [{ closeActionDrawer: () => void }];

    actionButton: [
      { closeFullscreen: () => void; openActionDrawer: () => void },
    ];
  };
}

export default class FileDetailsDynamicScanDeviceWrapper extends Component<DeviceWrapperSignature> {
  @tracked isFullscreenView = false;
  @tracked showActionDrawer = false;

  @action
  handleFullscreenClose() {
    this.isFullscreenView = false;
  }

  @action
  toggleFullscreenView() {
    this.isFullscreenView = !this.isFullscreenView;
  }

  @action
  handleActionDrawerOpen() {
    this.showActionDrawer = true;
  }

  @action
  handleActionDrawerClose() {
    this.showActionDrawer = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::DeviceWrapper': typeof FileDetailsDynamicScanDeviceWrapper;
  }
}
