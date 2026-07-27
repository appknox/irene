/**
 * Organization CYOD Registration panel (owners).
 *
 * An add-on section in Organization Settings: an owner switch for CYOD device
 * self-registration, plus a read-only table of the org's registered devices.
 *
 * Registration itself does NOT happen here — a member enrols their own device
 * from Account Settings → CYOD Settings using the Mercer app. This panel is the
 * org-wide view and kill-switch.
 *
 * The switch (`cyodRegistrationEnabled`) is layered under the paid `cyod`
 * entitlement, which stays tech-admin controlled. Flipping it off blocks new
 * enrolments server-side; devices already registered keep serving scans.
 */
import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationService from 'irene/services/organization';
import parseError from 'irene/utils/parse-error';

export interface OrganizationDeviceRegistrationSignature {
  Element: HTMLDivElement;
}

export default class OrganizationDeviceRegistrationComponent extends Component<OrganizationDeviceRegistrationSignature> {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked isSaving = false;

  // AkToggle's inner <Input @checked> is a two-way binding, so this needs a
  // setter as well as a getter. `pendingState` holds the optimistic value while
  // the save is in flight; until then the persisted org value is the source of
  // truth (the org loads asynchronously).
  @tracked pendingState: boolean | null = null;

  get isRegistrationEnabled() {
    if (this.pendingState !== null) {
      return this.pendingState;
    }

    return !!this.organization.selected?.cyodRegistrationEnabled;
  }

  set isRegistrationEnabled(checked: boolean) {
    this.pendingState = checked;
  }

  setRegistrationEnabled = task(async (_evt: Event, checked: boolean) => {
    const org = this.organization.selected;

    if (!org) {
      return;
    }

    this.isSaving = true;
    this.pendingState = checked;

    try {
      org.set('cyodRegistrationEnabled', checked);

      await org.save();

      this.notify.success(this.intl.t('cyodRegistration.saved'));
    } catch (err) {
      // Roll the toggle back so it keeps reflecting the persisted state.
      org.set('cyodRegistrationEnabled', !checked);
      this.pendingState = !checked;

      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    } finally {
      this.isSaving = false;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::DeviceRegistration': typeof OrganizationDeviceRegistrationComponent;
    'organization/device-registration': typeof OrganizationDeviceRegistrationComponent;
  }
}
