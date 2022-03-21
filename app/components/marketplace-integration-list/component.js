/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-get */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { t } from 'ember-intl';

export default Component.extend({
  intl: service(),

  tGithub: t("github"),
  tJira: t("jira"),
  tSlack: t("slack"),
  tGitlab: t("gitlab"),
  tIntegrateAppknoxTo: t("integrateAppknoxTo"),
  tComingSoon: t("comingSoon"),

  data: computed('tComingSoon', 'tGithub', 'tGitlab', 'tIntegrateAppknoxTo', 'tJira', 'tSlack', function() {
    return [
      {
        "title": this.get("tGithub"),
        "description": this.get("tIntegrateAppknoxTo") + this.get("tGithub"),
        "logo": "images/github-icon.png",
        "link": "authenticated.organization.settings",
      },
      {
        "title": this.get("tJira"),
        "description": this.get("tIntegrateAppknoxTo") + this.get("tJira"),
        "logo": "images/jira-icon.png",
        "link": "authenticated.organization.settings",
      },
      {
        "title": this.get("tSlack"),
        "description": this.get("tComingSoon"),
        "logo": "images/slack-icon.png",
        "link": "",
      },
      {
        "title": this.get("tGitlab"),
        "description": this.get("tComingSoon"),
        "logo": "images/gitlab-icon.png",
        "link": "",
      }
    ]
  }),
});
