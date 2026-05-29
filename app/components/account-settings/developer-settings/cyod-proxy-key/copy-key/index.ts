import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type ClipboardJS from 'clipboard/src/clipboard';

import type { CyodEncKeyItem } from '../index';

interface Signature {
  Args: {
    encKey: CyodEncKeyItem;
    reloadKeys: () => void;
  };
}

export default class AccountSettingsDeveloperSettingsCyodProxyKeyCopyKeyComponent extends Component<Signature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @action handleCopySuccess(event: ClipboardJS.Event) {
    this.notify.info(this.intl.t('tokenCopied'));
    event.clearSelection();
  }

  @action handleCopyError() {
    this.notify.error(this.intl.t('pleaseTryAgain'));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'account-settings/developer-settings/cyod-proxy-key/copy-key': typeof AccountSettingsDeveloperSettingsCyodProxyKeyCopyKeyComponent;
  }
}
