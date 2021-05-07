import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';
import {
  task
} from 'ember-concurrency';
import {
  tracked
} from '@glimmer/tracking';
import {
  action,
  set
} from '@ember/object';
import ENV from 'irene/config/environment';
import {
  extractFilenameResHeader
} from 'irene/utils/utils';
import parseError from 'irene/utils/parse-error';

export default class PartnerComponent extends Component {

  @service store;
  @service('notifications') notify;
  @service me;
  @service ajax;
  @service intl;

  @tracked isShowInviteClientModal = false;

  @tracked clientGroups = [{
      label: 'Registered Clients',
      key: 'registered',
      model: 'client',
      active: true
    },
    {
      label: 'Invited Users',
      key: 'invited',
      model: 'client-invite',
      active: false
    },
    {
      label: 'Self Registered Users',
      key: 'self-registered',
      model: 'self-register-client',
      active: false
    }
  ];

  @tracked creditsStats = {};

  @action
  initializeComp() {
    this.fetchPartnerCreditStats.perform();
  }

  @action
  onSelectClientGroup(clientGroup) {
    this.clientGroups.map((group) =>
      set(group, 'active', clientGroup.key == group.key)
    )
  }

  @action
  onClientInvited(client) {
    this.isShowInviteClientModal = false;
    this.clientGroups.map((group) =>
      set(group, 'active', group.key == 'invited')
    )
    this.store.pushPayload('client-invite', client)
    this.notify.success(`Invitation has been sent to: ${client.email}`);
  }

  @action
  openInviteModal() {
    this.isShowInviteClientModal = true;
  }

  @action
  onCloseModal() {
    this.isShowInviteClientModal = false;
  }

  @task(function* () {
    try {
      this.creditsStats = yield this.store.queryRecord('credits/partner-credits-stat', {});
    } catch (e) {
      this.creditsStats = {};
    }
  }) fetchPartnerCreditStats;

  @task(function* () {
    const url = [this.me.partner.id, ENV.endpoints.partnerOverallPlatformUsage].join('/');
    yield this.ajax.raw(url, {
      namespace: '/api/v2/partner',
      dataType: 'text',
      success(response, _, xhr) {
        const disposition = xhr.getResponseHeader('Content-Disposition');
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([response]));
        link.download = extractFilenameResHeader(disposition);
        link.click();
      },
      error(err) {
        this.notify.error(parseError(err, this.intl.t('pleaseTryAgain')));
      }
    })
  }) exportOverallPlatformUsage;
}
