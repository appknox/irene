import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { find, render } from '@ember/test-helpers';
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

module('Integration | Component | Onboarding Guide', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.owner.register('service:integration', IntegrationStub);

    this.setProperties({
      onClose: () => {},
    });
  });

  test('it renders onboarding guide', async function (assert) {
    this.set('guideCategories', [
      {
        category: 'category-1',
        guides: [
          {
            id: 'category-1-guide-1',
            title: 'category-1-guide-1',
          },
          {
            id: 'category-1-guide-2',
            title: 'category-1-guide-2',
          },
        ],
      },
      {
        category: 'category-2',
        guides: [
          {
            id: 'category-2-guide-1',
            title: 'category-2-guide-1',
          },
          {
            id: 'category-2-guide-2',
            title: 'category-2-guide-2',
          },
        ],
      },
    ]);

    await render(hbs`
      <TopNav::OnboardingGuide 
        @guideCategories={{this.guideCategories}}
        @onClose={{this.onClose}} 
      />
    `);

    assert.dom('[data-test-onboarding-guide-modal]').exists();

    assert
      .dom('[data-test-onboarding-guide-modal]')
      .containsText(t('onboardingGuides'));

    this.guideCategories.forEach((gCat) => {
      const category = find(
        `[data-test-onboarding-guide-category='${gCat.category}']`
      );

      assert.dom(category).hasText(gCat.category);

      gCat.guides.forEach((guide) => {
        const guideElem = find(
          `[data-test-onboarding-guide-list-item='${guide.id}']`
        );

        assert.dom(guideElem).hasText(guide.title);
      });
    });

    const defaultSelectedGuide = this.guideCategories[0].guides[0];

    assert
      .dom(`[data-test-onboarding-guide-iframe='${defaultSelectedGuide.id}']`)
      .exists();
  });
});
