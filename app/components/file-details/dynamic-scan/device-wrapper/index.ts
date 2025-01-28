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
    statusChip: [];
    actionButton: [{ closeFullscreen: () => void }];
    default: [{ isFullscreen: boolean; closeFullscreen: () => void }];
  };
}

export default class FileDetailsDynamicScanDeviceWrapper extends Component<DeviceWrapperSignature> {
  @tracked isFullscreenView = false;

  @action
  handleFullscreenClose() {
    this.isFullscreenView = false;
  }

  @action
  toggleFullscreenView() {
    this.isFullscreenView = !this.isFullscreenView;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::DeviceWrapper': typeof FileDetailsDynamicScanDeviceWrapper;
  }
}
