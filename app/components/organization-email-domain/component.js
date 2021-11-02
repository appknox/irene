import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import parseError from 'irene/utils/parse-error';
import { isEmpty } from '@ember/utils';

export default class OrganizationEmailDomainComponent extends Component {
  @service store;
  @service('notifications') notify;
  @service intl;

  @tracked tDomain = '';

  @tracked domains = [];

  get isDisableSave() {
    return isEmpty(this.tDomain) || this.addDomain.isRunning;
  }

  @action
  initializeComp() {
    this.fetchDomains.perform();
  }

  @action
  async saveDomainInput() {
    try {
      const domainInfo = await this.addDomain.perform(this.tDomain);
      this.tDomain = '';
      this.domains.pushObject(domainInfo);
    } catch {
      return;
    }
  }

  @action
  onDeleteDomain(domain) {
    this.deleteDomain.perform(domain);
  }

  @task(function* () {
    this.domains = yield this.store.findAll('organization-email-domain');
  })
  fetchDomains;

  @task(function* (domainName) {
    const domainInfo = yield this.store.createRecord(
      'organization-email-domain',
      {
        domainName,
      }
    );
    return domainInfo
      .save()
      .then(() => {
        this.notify.success(
          `${domainName} ${this.intl.t('addedSuccessfully')}`
        );
        return domainInfo;
      })
      .catch((err) => {
        domainInfo.rollbackAttributes();
        this.notify.error(parseError(err, `${domainName}`));
        return false;
      });
  })
  addDomain;

  @task(function* (domain) {
    try {
      yield domain.deleteRecord();
      yield domain.save();
      this.domains.removeObject(domain);
      this.notify.success(this.intl.t('domainDeleted'));
    } catch (err) {
      this.notify.error(
        parseError(err, this.intl.t('problemWhileDeletingDomain'))
      );
    }
  })
  deleteDomain;
}
