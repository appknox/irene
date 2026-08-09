import ENUMS from 'irene/enums';

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
