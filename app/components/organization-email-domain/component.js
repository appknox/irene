import Component from '@glimmer/component';
import {
  tracked
} from '@glimmer/tracking'
import {
  action,
  computed,
  set
} from '@ember/object';
import {
  task
} from 'ember-concurrency';
import {
  inject as service
} from '@ember/service';
import parseError from 'irene/utils/parse-error';

export default class OrganizationEmailDomainComponent extends Component {

  @service store;
  @service('notifications') notify;
  @service me;
  @service intl;

  @tracked tempDomains = [{
    domain: null
  }];

  @tracked domains = [];

  @computed('tempDomains.@each.domain')
  get isLastDomainInputAdded() {
    return this.tempDomains.some((tDomain) => tDomain && tDomain.domain);
  }

  @action
  initializeComp() {
    this.fetchDomains.perform();
  }

  @action
  addNewInput() {
    this.tempDomains.pushObject({
      domain: null
    });
  }

  @action
  handleKey(_, event) {
    if (event.keyCode === 13) {
      this.addNewInput();
    }
  }

  @action
  removeItem(tDomain) {
    this.tempDomains.removeObject(tDomain);
  }

  @action
  saveDomainInput() {
    this.tempDomains.map(async (tDomain) => {
      if (tDomain.domain) {
        const domainInfo = await this.addDomain.perform(tDomain.domain);
        if (domainInfo) {
          await this.tempDomains.removeObject(tDomain);
        } else {
          set(tDomain, 'isError', true);
        }
      }
      return;
    });
    // Add an empty domain, if all the domains has been submitted
    if (this.isLastDomainInputAdded) {
      this.tempDomains.pushObject({
        domain: null
      });
    }
  }

  @task(function* () {
    this.domains = yield this.store.findAll('organization-email-domain');
  }) fetchDomains;

  @task(function* (domainName) {
    const domainInfo = yield this.store.createRecord('organization-email-domain', {
      domainName
    })
    return domainInfo.save().then(() => {
      this.notify.success(`${domainName} ${this.intl.t('whitelistEmailDomain.added')}`);
      return domainInfo;
    }).catch((err) => {
      domainInfo.rollbackAttributes();
      this.notify.error(parseError(err, `${domainName}`));
      return false;
    })

  }).enqueue() addDomain;

  @task(function* (domain) {
    try {
      yield domain.deleteRecord();
      yield domain.save();
      this.notify.success(this.intl.t('whitelistEmailDomain.deleted'));
    } catch (err) {
      this.notify.error(parseError(err, 'Problem while deleting domain'))
    }
  }) deleteDomain;
}
