import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';
import type AvailableManualDeviceModel from 'irene/models/available-manual-device';
import { getPlatformMajorVersion } from 'irene/utils/platform-version';

const IOS_MODERN_DEVICE_VERSION_CUTOFF = 17;

export interface DynamicScanDeviceVersionQuery {
  platform_version_min?: string;
}

export function getDynamicScanDeviceVersionQuery(
  file: FileModel
): DynamicScanDeviceVersionQuery {
  const platformVersionMin = file.minOsVersion;
  const query: DynamicScanDeviceVersionQuery = {};

  if (platformVersionMin) {
    query.platform_version_min = platformVersionMin;
  }

  return query;
}

export function fileRequiresIOS17OrAbove(file: FileModel) {
  const platform = file.project.get('platform');
  const minMajorVersion = getPlatformMajorVersion(file.minOsVersion);

  return (
    platform === ENUMS.PLATFORM.IOS &&
    minMajorVersion !== null &&
    minMajorVersion >= IOS_MODERN_DEVICE_VERSION_CUTOFF
  );
}

export function isAvailableManualDeviceAllowedForFile(
  file: FileModel,
  device: AvailableManualDeviceModel
) {
  if (file.project.get('platform') !== ENUMS.PLATFORM.IOS) {
    return true;
  }

  if (fileRequiresIOS17OrAbove(file)) {
    return true;
  }

  const deviceMajorVersion = getPlatformMajorVersion(device.platformVersion);

  return (
    deviceMajorVersion === null ||
    deviceMajorVersion < IOS_MODERN_DEVICE_VERSION_CUTOFF
  );
}
