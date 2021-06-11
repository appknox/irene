import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { underscore } from '@ember/string';
import styles from 'irene/components/partner/partner-plan/index.scss';

function serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).map((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });
  return serializedPayload;
}

module('Integration | Component | partner/partner-plan', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
  });

  test('it should render per-scan', async function (assert) {
    const partnerPlan = this.server.create('partner/plan', {
      limitedScans: true,
    });
    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });
    await render(hbs`<Partner::PartnerPlan />`);

    assert.dom(`[data-test-plan-label]`).hasText('t:yourPlan:()');
    assert.dom('[data-test-plan-type]').hasClass(styles['per-scan']);
    assert.dom(`[data-test-plan-type]`).hasText(`t:perScan:()`);
    assert.dom(`[data-test-credits-left]`).hasText(`${partnerPlan.scansLeft}`);
    assert
      .dom(`[data-test-credits-type]`)
      .hasText(`t:pluralScans:("itemCount":${partnerPlan.scansLeft})`);
  });

  test('it should render per-app', async function (assert) {
    const partnerPlan = this.server.create('partner/plan', {
      limitedScans: false,
    });
    this.server.get('v2/partners/:id/plan', (schema) => {
      return serializer(schema['partner/plans'].find(1));
    });
    await render(hbs`<Partner::PartnerPlan />`);

    assert.dom(`[data-test-plan-label]`).hasText('t:yourPlan:()');
    assert.dom('[data-test-plan-type]').hasClass(styles['per-app']);
    assert.dom(`[data-test-plan-type]`).hasText(`t:perApp:()`);
    assert
      .dom(`[data-test-credits-left]`)
      .hasText(`${partnerPlan.projectsLimit}`);
    assert
      .dom(`[data-test-credits-type]`)
      .hasText(`t:pluralApps:("itemCount":${partnerPlan.projectsLimit})`);
  });

  test('it should not render anything if error occured', async function (assert) {
    this.server.get('v2/partners/:id/plan', () => {
      return Response(500);
    });
    await render(hbs`<Partner::PartnerPlan />`);

    assert.dom(`[data-test-partner-plan] div`).doesNotExist();
  });
});
