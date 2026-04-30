import type FileModel from 'irene/models/file';
import ENUMS from 'irene/enums';

export const IOS_MODERN_DEVICE_VERSION_CUTOFF = 17;

// Sentinel ceiling for legacy iOS apps. Sent as `platform_version_max` so the
// backend (moriarty2) returns only devices on iOS < 17, while still including
// any minor/patch under 17 (e.g. 16.7.10). Keep > any real 16.x.y.
const LEGACY_IOS_MAX_VERSION = '16.99.99';

export function getPlatformMajorVersion(platformVersion?: string | null) {
  const majorVersion = /\d+/.exec(platformVersion ?? '')?.[0];

  return majorVersion ? Number.parseInt(majorVersion, 10) : null;
}

export interface AvailableManualDeviceVersionParams {
  platform_version_min?: string;
  platform_version_max?: string;
}

export function getIOSManualDeviceVersionParams(
  file: FileModel
): AvailableManualDeviceVersionParams {
  if (file.project.get('platform') !== ENUMS.PLATFORM.IOS) {
    return {};
  }

  const minOsVersion = file.minOsVersion;
  const minMajorVersion = getPlatformMajorVersion(minOsVersion);
  const isModernApp =
    minMajorVersion !== null &&
    minMajorVersion >= IOS_MODERN_DEVICE_VERSION_CUTOFF;

  if (isModernApp) {
    return { platform_version_min: minOsVersion as string };
  }

  return {
    ...(minOsVersion ? { platform_version_min: minOsVersion } : {}),
    platform_version_max: LEGACY_IOS_MAX_VERSION,
  };
}
