import ENUMS from 'irene/enums';

/**
 * Whether a project's iOS signing-certificate section applies.
 *
 * Signing certificates are a CYOD capability, so they need the organization's
 * CYOD switch on, and they only affect iOS scans.
 *
 * Shared by `Organization::SigningCertificate` (which renders the panel) and
 * `ProjectSettings::GeneralSettings` (which places it, and owns the divider that
 * introduces it). Keeping one predicate means the section and its divider cannot
 * disagree and leave a rule with nothing under it.
 *
 * @param registrationEnabled the org's CYOD registration switch
 * @param platform the project's `ENUMS.PLATFORM` value
 */
export function showsProjectSigningCertificate(
  registrationEnabled: boolean | undefined,
  platform: number | undefined
): boolean {
  return Boolean(registrationEnabled) && platform === ENUMS.PLATFORM.IOS;
}
