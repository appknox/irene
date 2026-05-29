import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type { CyodEncKeyItem } from '../index';

interface Signature {
  Args: {
    encKey: CyodEncKeyItem;
    reloadKeys: () => void;
  };
}

export default class AccountSettingsDeveloperSettingsCyodProxyKeyRevokeKeyComponent extends Component<Signature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked showConfirmBox = false;

  get keysUrl() {
    const orgId = this.organization.selected?.id;
    return `/api/organizations/${orgId}/cyod-keys/${this.args.encKey.id}`;
  }

  @action openConfirmBox() {
    this.showConfirmBox = true;
  }

  @action closeConfirmBox() {
    this.showConfirmBox = false;
  }

  revokeKey = task(async () => {
    await this.ajax.delete(this.keysUrl);
    this.showConfirmBox = false;
    this.notify.success(this.intl.t('cyodProxyKeyRevoked'));
    this.args.reloadKeys();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'account-settings/developer-settings/cyod-proxy-key/revoke-key': typeof AccountSettingsDeveloperSettingsCyodProxyKeyRevokeKeyComponent;
  }
}
