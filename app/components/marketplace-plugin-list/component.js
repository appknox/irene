import Component from '@ember/component';
import { computed } from '@ember/object';
import constants from 'irene/components/marketplace-plugin-list/constants';
import { htmlSafe } from '@ember/template';
import { inject as service } from '@ember/service';
import { t } from 'ember-intl';

export default Component.extend({
  intl: service(),

  tAzurePipeline: t("azurePipeline"),
  tJenkinsPipeline: t("jenkinsPipeline"),
  tCircleCIPipeline: t("circleCIPipeline"),
  tBitbucketPipeline: t("bitbucketPipeline"),
  tBitriseWorkflow: t("bitriseWorkflow"),
  tAppCenterPipeline: t("appCenterPipeline"),
  tViewIntegrationInstructions: t("viewIntegrationInstructions"),
  tInstallAppknoxPluginTo: t("installAppknoxPluginTo"),

  showInstructionsModal: false,

  data: computed('tAppCenterPipeline', 'tAzurePipeline', 'tBitbucketPipeline', 'tBitriseWorkflow', 'tCircleCIPipeline', 'tInstallAppknoxPluginTo', 'tJenkinsPipeline', 'tViewIntegrationInstructions', function() {
    return [
      {
        "title": this.get("tAzurePipeline"),
        "description": this.get("tInstallAppknoxPluginTo") + this.get("tAzurePipeline"),
        "logo": "images/azure-icon.png",
        "link": "https://marketplace.visualstudio.com/items?itemName=appknox.appknox",
        "published": true,
        "instructions": ""
      },
      {
        "title": this.get("tJenkinsPipeline"),
        "description": this.get("tViewIntegrationInstructions"),
        "logo": "images/jenkins-icon.png",
        "link": "",
        "published": false,
        "instructions": htmlSafe(constants.instructions)
      },
      {
        "title": this.get("tCircleCIPipeline"),
        "description": this.get("tViewIntegrationInstructions"),
        "logo": "images/circleci-icon.png",
        "link": "",
        "published": false,
        "instructions": htmlSafe(constants.instructions)
      },
      {
        "title": this.get("tBitbucketPipeline"),
        "description": this.get("tViewIntegrationInstructions"),
        "logo": "images/bitbucket-icon.png",
        "link": "",
        "published": false,
        "instructions": htmlSafe(constants.instructions)
      },
      {
        "title": this.get("tAppCenterPipeline"),
        "description": this.get("tViewIntegrationInstructions"),
        "logo": "images/app-center-icon.png",
        "link": "",
        "published": false,
        "instructions": htmlSafe(constants.appCenterInstructions)
      },
      {
        "title": this.get("tBitriseWorkflow"),
        "description": this.get("tViewIntegrationInstructions"),
        "logo": "images/bitrise-icon.png",
        "link": "",
        "published": false,
        "instructions": htmlSafe(constants.bitriseInstructions)
      },
    ]
  }),
});
