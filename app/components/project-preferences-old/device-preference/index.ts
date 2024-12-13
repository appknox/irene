import Component from '@glimmer/component';

import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';
import type { DevicePreferenceContext } from '../provider';

export interface ProjectPreferencesOldDevicePreferenceSignature {
  Args: {
    file?: FileModel | null;
    dpContext: DevicePreferenceContext;
  };
  Blocks: {
    title: [];
  };
}

export default class ProjectPreferencesOldDevicePreferenceComponent extends Component<ProjectPreferencesOldDevicePreferenceSignature> {
  // TODO: Remove when information is provided from the backend
  maxSupportedIOSDeviceVersion = '17';
  maxSupportedAndroidDeviceVersion = '14';

  get isPreferredDeviceNotAvailable() {
    return this.args.dpContext.isPreferredDeviceAvailable === false;
  }

  get noDevicePlatformVersions() {
    return this.args.dpContext.devicePlatformVersions.length === 1;
  }

  get minOsVersionUnsupported() {
    const file = this.args.file;
    const project = file?.get('project');

    if (project) {
      const platform = project.get('platform');

      const maxSupportedDeviceVersion =
        platform === ENUMS.PLATFORM.IOS
          ? this.maxSupportedIOSDeviceVersion
          : this.maxSupportedAndroidDeviceVersion;

      return (
        this.noDevicePlatformVersions &&
        this.args.dpContext.compareVersions(
          maxSupportedDeviceVersion,
          file?.get('minOsVersion') as string
        ) <= 0
      );
    }

    return false;
  }

  get isAllDevicesAllocated() {
    return this.isPreferredDeviceNotAvailable && this.noDevicePlatformVersions;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectPreferencesOld::DevicePreference': typeof ProjectPreferencesOldDevicePreferenceComponent;
    'project-preferences-old/device-preference': typeof ProjectPreferencesOldDevicePreferenceComponent;
  }
}
