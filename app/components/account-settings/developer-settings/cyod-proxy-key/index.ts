import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type IreneAjaxService from 'irene/services/ajax';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';

export type CyodEncKeyItem = {
  id: number;
  name: string;
  key: string;
  created_at: string;
};

type CyodKeysResponse = {
  results: CyodEncKeyItem[];
  ws_url: string;
};

type CyodKeyCreateResponse = CyodEncKeyItem & { ws_url: string };

export default class AccountSettingsDeveloperSettingsCyodProxyKeyComponent extends Component {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked keys: CyodEncKeyItem[] = [];
  @tracked wsUrl = '';
  @tracked newKeyName = '';

  get orgId() {
    return this.organization.selected?.id;
  }

  get keysUrl() {
    return `/api/organizations/${this.orgId}/cyod-keys`;
  }

  get isOwner() {
    return this.me.org?.get('is_owner') ?? false;
  }

  get hasKeys() {
    return this.keys.length > 0;
  }

  get columns() {
    return [
      { name: this.intl.t('name'), valuePath: 'name', width: 150 },
      { name: this.intl.t('created'), valuePath: 'created_at', width: 120 },
      { name: this.intl.t('cyodProxyKeyLabel'), valuePath: 'key', width: 350 },
      {
        name: this.intl.t('copy'),
        component:
          'account-settings/developer-settings/cyod-proxy-key/copy-key',
        textAlign: 'center',
      },
      {
        name: this.intl.t('cyodProxyKeyRevoke'),
        component:
          'account-settings/developer-settings/cyod-proxy-key/revoke-key',
        textAlign: 'center',
      },
    ];
  }

  constructor(owner: unknown, args: Record<string, never>) {
    super(owner, args);
    this.loadKeys.perform();
  }

  loadKeys = task(async () => {
    if (!this.orgId || !this.isOwner) return;
    const data = await this.ajax.request<CyodKeysResponse>(this.keysUrl);
    this.keys = data.results;
    this.wsUrl = data.ws_url;
  });

  generateKey = task(async (event: Event) => {
    event.preventDefault();
    const name = this.newKeyName.trim();
    if (!name) {
      this.notify.error(this.intl.t('cyodProxyKeyNameRequired'));
      return;
    }
    const data = await this.ajax.post<CyodKeyCreateResponse>(this.keysUrl, {
      data: { name },
    });
    this.keys = [
      { id: data.id, name: data.name, key: data.key, created_at: data.created_at },
      ...this.keys,
    ];
    this.wsUrl = data.ws_url;
    this.newKeyName = '';
    this.notify.success(this.intl.t('cyodProxyKeyGenerated'));
  });

  @action reloadKeys() {
    return this.loadKeys.perform();
  }

  @action setNewKeyName(event: Event) {
    this.newKeyName = (event.target as HTMLInputElement).value;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::DeveloperSettings::CyodProxyKey': typeof AccountSettingsDeveloperSettingsCyodProxyKeyComponent;
  }
}
