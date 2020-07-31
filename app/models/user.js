import DS from 'ember-data';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import { t } from 'ember-intl';

const User = DS.Model.extend({

  intl: service(),

  uuid: DS.attr('string'),
  lang: DS.attr('string'),
  username: DS.attr('string'),
  email: DS.attr('string'),
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  ownedProjects: DS.hasMany('project', {inverse:'owner'}),
  projects: DS.hasMany('project'),
  pricings: DS.hasMany('pricing'),
  submissions: DS.hasMany('submission', {inverse:'user'}),
  namespaces: DS.attr('string'),
  expiryDate: DS.attr('date'),
  devknoxExpiry: DS.attr('date'),
  projectCount: DS.attr('number'),
  hasGithubToken: DS.attr('boolean'),
  hasJiraToken: DS.attr('boolean'),
  socketId: DS.attr('string'),
  limitedScans: DS.attr('boolean'),
  scansLeft: DS.attr('number'),
  githubRedirectUrl: DS.attr('string'),
  billingHidden: DS.attr('boolean'),
  mfaMethod: DS.attr('number'),
  mfaSecret: DS.attr('string'),
  isTrial: DS.attr('boolean'),
  crispHash: DS.attr('string'),
  canDisableMfa: DS.attr('boolean'),
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
