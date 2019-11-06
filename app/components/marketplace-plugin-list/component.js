import Component from '@ember/component';
import constants from 'irene/components/marketplace-plugin-list/constants';
import { htmlSafe } from '@ember/template';

export default Component.extend({
    showInstructionsModal: false,
    data: [
        {
            "title": "Azure Pipeline",
            "description": "Install Appknox Plugin to Azure Pipeline",
            "logo": "images/azure-icon.png",
            "link": "https://marketplace.visualstudio.com/items?itemName=appknox.appknox-security-test",
            "published": true,
            "instructions": ""
        },
        {
            "title": "Jenkins Pipeline",
            "description": "View Instructions to Integrate",
            "logo": "images/jenkins-icon.png",
            "link": "",
            "published": false,
            "instructions": htmlSafe(constants.instructions)
        },
        {
            "title": "CircleCi Pipeline",
            "description": "View Instructions to Integrate",
            "logo": "images/circleci-icon.png",
            "link": "",
            "published": false,
            "instructions": htmlSafe(constants.instructions)
        },
        {
            "title": "Bitbucket Pipeline",
            "description": "View Instructions to Integrate",
            "logo": "images/bitbucket-icon.png",
            "link": "",
            "published": false,
            "instructions": htmlSafe(constants.instructions)
        }
    ],
});
