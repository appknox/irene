/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { AsyncHasMany, attr, hasMany } from '@ember-data/model';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import IntlService from 'ember-intl/services/intl';

import ProjectModel from './project';
import PricingModel from './pricing';
import SubmissionModel from './submission';

export default class UserModel extends Model {
  @service declare intl: IntlService;

  @attr('string')
  declare uuid: string;

  @attr('string')
  declare lang: string;

  @attr('string')
  declare username: string;

  @attr('string')
  declare email: string;

  @attr('string')
  declare firstName: string;

  @attr('string')
  declare lastName: string;

  @hasMany('project', { inverse: 'owner' })
  declare ownedProjects: AsyncHasMany<ProjectModel>;

  @hasMany('project')
  declare projects: AsyncHasMany<ProjectModel>;

  @hasMany('pricing')
  declare pricings: AsyncHasMany<PricingModel>;

  @hasMany('submission', { inverse: 'user' })
  declare submissions: AsyncHasMany<SubmissionModel>;

  @attr('string')
  declare namespaces: string;

  @attr('date')
  declare expiryDate: Date;

  @attr('date')
  declare devknoxExpiry: Date;

  @attr('number')
  declare projectCount: number;

  @attr('boolean')
  declare hasGithubToken: boolean;

  @attr('boolean')
  declare hasJiraToken: boolean;

  @attr('string')
  declare socketId: string;

  @attr('boolean')
  declare limitedScans: boolean;

  @attr('number')
  declare scansLeft: number;

  @attr('string')
  declare githubRedirectUrl: string;

  @attr('boolean')
  declare billingHidden: boolean;

  @attr('number')
  declare mfaMethod: number;

  @attr('string')
  declare mfaSecret: string;

  @attr('boolean')
  declare isTrial: boolean;

  @attr('string')
  declare crispHash: string;

  @attr('boolean')
  declare canDisableMfa: boolean;

  isSecurity = true; // FIXME:

  get translations() {
    return {
      tProject: this.intl.t('project'),
      tProjects: this.intl.t('projects'),
      tNoProject: this.intl.t('noProject'),
    };
  }

  @computed('isSecurity')
  get isNotSecurity() {
    return !this.isSecurity;
  }

  @computed('mfaSecret', 'email')
  get provisioningURL() {
    return `otpauth://totp/Appknox:${this.email}?secret=${this.mfaSecret}&issuer=Appknox`;
  }

  @computed('mfaMethod')
  get mfaEnabled() {
    if (
      this.mfaMethod === ENUMS.MFA_METHOD.TOTP ||
      this.mfaMethod === ENUMS.MFA_METHOD.HOTP
    ) {
      return true;
    }

    return false;
  }

  @computed('projectCount', 'translations')
  get totalProjects() {
    const { tProject, tProjects, tNoProject } = this.translations;

    if (this.projectCount === 0) {
      return tNoProject;
    } else if (this.projectCount === 1) {
      return `${this.projectCount} ${tProject}`;
    }

    return `${this.projectCount} ${tProjects.toLowerCase()}`;
  }

  @computed('billingHidden')
  get ifBillingIsNotHidden() {
    if (ENV.isEnterprise) {
      return false;
    }

    return !this.billingHidden;
  }

  @computed('devknoxExpiry', 'expiryDate')
  get getExpiryDate() {
    if (ENV.isAppknox) {
      return this.expiryDate;
    } else {
      return this.devknoxExpiry;
    }
  }

  @computed('getExpiryDate')
  get hasExpiryDate() {
    if (isEmpty(this.getExpiryDate)) {
      return false;
    } else {
      return true;
    }
  }

  @computed('expiryDate')
  get expiryText() {
    const currentDate = new Date();
    let prefix = 'subscriptionWillExpire';

    if (currentDate > this.expiryDate) {
      prefix = 'subscriptionExpired';
    }

    return prefix;
  }

  @computed('namespaces')
  get namespaceItems() {
    return this.namespaces != null ? this.namespaces.split(',') : undefined;
  }

  @computed('namespaces.length')
  get namespacesCount() {
    return this.namespaces.length;
  }

  @computed('namespacesCount')
  get hasNamespace() {
    return this.namespacesCount > 0;
  }

  @computed('projectCount')
  get hasProject() {
    return this.projectCount > 0;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    user: UserModel;
  }
}
