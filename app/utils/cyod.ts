import ENUMS from 'irene/enums';
import type { RawDeviceType } from 'irene/models/device';

/**
 * Whether a dynamic scan ran on a CYOD device.
 *
 * A CYOD scan has no device from our farm: it is the customer's own device,
 * reached over the Mercer proxy or WebUSB, and the scan payload carries a
 * download URL instead. Either signal alone is sufficient — `registration_source`
 * is absent on scans predating it, and a download URL is only ever set for CYOD.
 */
export function isCyodScan(
  deviceUsed: RawDeviceType | null | undefined
): boolean {
  const source = deviceUsed?.registration_source;

  return (
    source === ENUMS.DEVICE_REGISTRATION_SOURCE.PROXY ||
    source === ENUMS.DEVICE_REGISTRATION_SOURCE.WEBUSB ||
    Boolean(deviceUsed?.android_download_url) ||
    Boolean(deviceUsed?.ios_itms_url)
  );
}

/**
 * Whether the current user may manage signing certificates.
 *
 * `is_admin` and `is_owner` are independent flags on `organization-me`, so an
 * owner is not implicitly an admin. Either role qualifies.
 */
export function canManageSigningCertificates(
  isAdmin: boolean | undefined,
  isOwner: boolean | undefined
): boolean {
  return Boolean(isAdmin) || Boolean(isOwner);
}

/**
 * Whether a project's iOS signing-certificate section applies.
 *
 * The certificate carries the customer's iOS signing identity, so the section is
 * limited to org admins and owners — the org-scope panel is owner-only, and this
 * project-scope override must not be a way around that for plain members.
 */
export function showsProjectSigningCertificate(
  registrationEnabled: boolean | undefined,
  platform: number | undefined,
  canManage: boolean | undefined
): boolean {
  return (
    Boolean(registrationEnabled) &&
    platform === ENUMS.PLATFORM.IOS &&
    Boolean(canManage)
  );
}
