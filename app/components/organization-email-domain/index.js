import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import parseError from 'irene/utils/parse-error';
import { isEmpty } from '@ember/utils';

export default class OrganizationEmailDomainComponent extends Component {
  @service store;
  @service('notifications') notify;
  @service intl;

  @tracked tDomain = '';
  @tracked domains = [];

  constructor() {
    super(...arguments);

    this.fetchDomains.perform();
  }

  get isDisableSave() {
    return isEmpty(this.tDomain.trim());
  }

  @task
  *fetchDomains() {
    this.domains = (yield this.store.findAll(
      'organization-email-domain'
    )).toArray();
  }

  @task
  *addDomain() {
    const domainName = this.tDomain;

    const domainInfo = yield this.store.createRecord(
      'organization-email-domain',
      { domainName }
    );

    try {
      yield domainInfo.save();

      this.notify.success(`${domainName} ${this.intl.t('addedSuccessfully')}`);

      this.domains = [domainInfo, ...this.domains];

      this.tDomain = '';
    } catch (err) {
      domainInfo.rollbackAttributes();

      this.notify.error(parseError(err, domainName));
    }
  }

  @task
  *deleteDomain(domain, index) {
    try {
      this.domains = this.domains.filter((d) => d.id !== domain.id);

      yield domain.deleteRecord();
      yield domain.save();

      this.notify.success(this.intl.t('domainDeleted'));
    } catch (err) {
      // insert back on error
      this.domains.splice(index, 0, domain);
      this.domains = [...this.domains];

      this.notify.error(
        parseError(err, this.intl.t('problemWhileDeletingDomain'))
      );
    }
  }
}
