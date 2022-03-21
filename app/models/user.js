/* eslint-disable prettier/prettier, ember/no-classic-classes, ember/no-get */
import Model, { attr, hasMany }  from '@ember-data/model';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { t } from 'ember-intl';

const User = Model.extend({

  intl: service(),

  uuid: attr('string'),
  lang: attr('string'),
  username: attr('string'),
  email: attr('string'),
  firstName: attr('string'),
  lastName: attr('string'),
  ownedProjects: hasMany('project', {inverse:'owner'}),
  projects: hasMany('project'),
  pricings: hasMany('pricing'),
  submissions: hasMany('submission', {inverse:'user'}),
  namespaces: attr('string'),
  expiryDate: attr('date'),
  devknoxExpiry: attr('date'),
  projectCount: attr('number'),
  hasGithubToken: attr('boolean'),
  hasJiraToken: attr('boolean'),
  socketId: attr('string'),
  limitedScans: attr('boolean'),
  scansLeft: attr('number'),
  githubRedirectUrl: attr('string'),
  billingHidden: attr('boolean'),
  mfaMethod: attr('number'),
  mfaSecret: attr('string'),
  isTrial: attr('boolean'),
  crispHash: attr('string'),
  canDisableMfa: attr('boolean'),
  isSecurity: true, // FIXME:

  isNotSecurity: computed.not('isSecurity'),

  tProject: t("project"),
  tProjects: t("projects"),
  tNoProject: t("noProject"),

  provisioningURL: computed("mfaSecret", "email", function() {
    const mfaSecret = this.get("mfaSecret");
    const email = this.get("email");
    return `otpauth://totp/Appknox:${email}?secret=${mfaSecret}&issuer=Appknox`;
  }),

  mfaEnabled: computed("mfaMethod", function() {
    const mfaMethod = this.get("mfaMethod");
    if (mfaMethod === ENUMS.MFA_METHOD.TOTP || mfaMethod === ENUMS.MFA_METHOD.HOTP) {
      return true;
    }
    return false;
  }),

  totalProjects: computed('projectCount', 'tNoProject', 'tProject', 'tProjects', function() {
    const tProject = this.get("tProject");
    const tNoProject = this.get("tNoProject");
    const projectCount = this.get("projectCount");
    const tProjects = this.get("tProjects").toLowerCase();
    if (projectCount === 0) {
      return tNoProject;
    } else if (projectCount === 1) {
      return `${projectCount} ${tProject}`;
    }
    return `${projectCount} ${tProjects}`;
  }),

  ifBillingIsNotHidden: computed('billingHidden', function() {
    if (ENV.isEnterprise) {
      return false;
    }
    const billingHidden = this.get('billingHidden');
    return !billingHidden;
  }),

  getExpiryDate: computed('devknoxExpiry', 'expiryDate', function() {
    if (ENV.isAppknox) {
      return this.get("expiryDate");
    } else {
      return this.get("devknoxExpiry");
    }
  }),

  hasExpiryDate: computed("getExpiryDate", function() {
    const getExpiryDate = this.get("getExpiryDate");
    if (isEmpty(getExpiryDate)) {
      return false;
    } else {
      return true;
    }
  }),

  expiryText: computed("expiryDate", function() {
    const currentDate = new Date();
    const expiryDate = this.get("expiryDate");
    let prefix = "subscriptionWillExpire";
    if (currentDate > expiryDate) {
      prefix = "subscriptionExpired";
    }
    return prefix;
  }),

  namespaceItems: computed("namespaces", function() {
    const namespaces = this.get("namespaces");
    return (namespaces != null ? namespaces.split(",") : undefined);
  }),

  namespacesCount: computed.alias('namespaces.length'),

  hasNamespace: computed.gt('namespacesCount', 0),

  hasProject: computed.gt('projectCount', 0)
});

export default User;
