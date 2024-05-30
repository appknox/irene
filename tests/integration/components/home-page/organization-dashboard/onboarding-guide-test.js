import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import Service from '@ember/service';

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isCrispEnabled() {
    return true;
  }
}

module(
  'Integration | Component | home-page/organization-dashboard/header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:integration', IntegrationStub);

      this.setProperties({
        onClose: () => {},
      });
    });

    test('it renders onboarding guide', async function (assert) {
      await render(hbs`
      <HomePage::OrganizationDashboard::OnboardingGuide 
        @onClose={{this.onClose}} 
      />
    `);

      assert.dom('[data-test-onboarding-guide-modal]').exists();

      assert
        .dom('[data-test-onboarding-guide-modal]')
        .containsText('t:onboardingGuides:()');

      assert.dom('[data-test-onboarding-guide-category]').exists({ count: 3 });

      const categories = findAll('[data-test-onboarding-guide-category]');

      assert
        .dom(categories[0])
        .containsText(this.intl.t('onboardingGuideModule.VA'));

      assert.dom(categories[1]).containsText(this.intl.t('SBOM'));
      assert.dom(categories[2]).containsText(this.intl.t('appMonitoring'));

      assert.dom('[data-test-onboarding-guide-list-item]').exists({ count: 7 });

      const guides = findAll('[data-test-onboarding-guide-list-item]');

      assert
        .dom(guides[0])
        .containsText(this.intl.t('onboardingGuideModule.initiateVA'));

      assert
        .dom(guides[1])
        .containsText(this.intl.t('onboardingGuideModule.viewReports'));

      assert.dom(guides[2]).containsText(this.intl.t('inviteUsers'));

      assert
        .dom(guides[3])
        .containsText(this.intl.t('onboardingGuideModule.createTeams'));

      assert
        .dom(guides[4])
        .containsText(this.intl.t('onboardingGuideModule.uploadAccess'));

      assert
        .dom(guides[5])
        .containsText(this.intl.t('onboardingGuideModule.generateSBOM'));

      assert
        .dom(guides[6])
        .containsText(this.intl.t('onboardingGuideModule.detectDrift'));

      assert.dom('[data-test-onboarding-guide-iframe="va-guide"]').exists();
    });
  }
);
