import Service from '@ember/service';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import ENUMS from 'irene/enums';
import { module, test } from 'qunit';

module('Integration | Component | edit-analysis-button', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();

    this.store = this.owner.lookup('service:store');
  });

  test('it hides button when user is not admin and isRisky is "false" ', async function (assert) {
    class OrganizationMeStub extends Service {
      org = {
        is_owner: true,
        is_admin: false,
      };
    }
    this.owner.register('service:me', OrganizationMeStub);

    this.analysis = this.store.createRecord('analysis', {
      computedRisk: ENUMS.RISK.UNKNOWN,
    });

    await render(hbs`<EditAnalysisButton @analysis={{this.analysis}} />`);

    assert.dom('[data-test-edit-analysis-btn]').doesNotExist();
  });

  test('it shows button when user is admin isRisky is "true" ', async function (assert) {
    class OrganizationMeStub extends Service {
      org = {
        is_owner: true,
        is_admin: true,
      };
    }

    this.owner.register('service:me', OrganizationMeStub);
    this.analysis = this.store.createRecord('analysis', {
      computedRisk: ENUMS.RISK.LOW,
    });

    this.confirmCallback = function () {};

    await render(
      hbs`<EditAnalysisButton 
          @analysis={{this.analysis}} 
          @confirmCallback={{this.confirmCallback}} 
        />`
    );

    assert
      .dom('[data-test-edit-analysis-btn]')
      .exists()
      .hasAnyText('t:editAnalysis:()');

    assert.dom('[data-test-edit-analysis-btn] i.fa-pencil').exists();
  });

  test('It triggers callback when clicked ', async function (assert) {
    assert.expect(4);

    class OrganizationMeStub extends Service {
      org = {
        is_owner: true,
        is_admin: true,
      };
    }

    this.owner.register('service:me', OrganizationMeStub);
    this.analysis = this.store.createRecord('analysis', 1, {
      computedRisk: ENUMS.RISK.LOW,
    });

    this.confirmCallback = function () {
      assert.ok(true, 'Callback was triggered successfully');
    };

    await render(
      hbs`
        <EditAnalysisButton 
          @analysis={{this.analysis}} 
          @confirmCallback={{this.confirmCallback}} 
        />`
    );

    assert
      .dom('[data-test-edit-analysis-btn]')
      .exists()
      .hasAnyText('t:editAnalysis:()');

    assert.dom('[data-test-edit-analysis-btn] i.fa-pencil').exists();
    await click('[data-test-edit-analysis-btn]');
  });
});
