import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type OrganizationService from 'irene/services/organization';

export interface OrganizationDeviceRegistrationSignature {
  Element: HTMLDivElement;
}

export default class OrganizationDeviceRegistrationComponent extends Component<OrganizationDeviceRegistrationSignature> {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  get isRegistrationEnabled() {
    return !!this.organization.selected?.cyodRegistrationEnabled;
  }

  setRegistrationEnabled = task(async (_evt: Event, checked: boolean) => {
    const org = this.organization.selected;

    if (!org) {
      return;
    }

    try {
      org.set('cyodRegistrationEnabled', checked);
      await org.save();

      this.notify.success(this.intl.t('cyod.registration.saved'));
    } catch (err) {
      org.rollbackAttributes();

      this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::DeviceRegistration': typeof OrganizationDeviceRegistrationComponent;
    'organization/device-registration': typeof OrganizationDeviceRegistrationComponent;
  }
}
