import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | file-details/screenshots', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    const file = this.server.create('file', {
      id: '1',
      name: 'test-app.apk',
      package_name: 'com.example.test',
    });

    const analysis = this.server.create('analysis', {
      id: '1',
      file_id: file.id,
    });

    this.server.create('detailed-analysis', {
      id: analysis.id,
    });

    this.setProperties({ analysis });
  });

  test('it renders no screenshots component when there are no screenshots', async function (assert) {
    this.server.get('/v2/analyses/:id/detailed-analysis', (schema, request) => {
      return {
        id: request.params.id,
        screenshots: [],
      };
    });

    await render(hbs`
      <FileDetails::Screenshots @analysis={{this.analysis}} />
    `);

    assert.dom('[data-test-screenshot-image]').doesNotExist();
    assert.dom('[data-test-fileDetails-screenshots-title]').doesNotExist();
    assert.dom('[data-test-fileDetails-screenshots-container]').doesNotExist();
  });

  test('it renders screenshots with navigation when multiple screenshots exist', async function (assert) {
    const screenshots = [
      'https://picsum.photos/200/300',
      'https://picsum.photos/200/400',
    ];

    this.server.get('/v2/analyses/:id/detailed-analysis', (schema, request) => {
      return {
        id: request.params.id,
        screenshots,
      };
    });

    await render(hbs`
      <FileDetails::Screenshots @analysis={{this.analysis}} />
    `);

    assert.dom('[data-test-screenshot-image]').exists();

    assert
      .dom('[data-test-fileDetails-screenshots-title]')
      .hasText(t('screenshots'));

    assert
      .dom('[data-test-screenshot-image]')
      .hasAttribute('src', screenshots[0]);

    assert.dom('[data-test-fileDetails-screenshots-prev-button]').exists();
    assert.dom('[data-test-fileDetails-screenshots-next-button]').exists();

    assert
      .dom('[data-test-screenshot-counter]')
      .includesText('1')
      .includesText(t('outOf'))
      .includesText('2');

    // Navigate to next screenshot
    await click('[data-test-fileDetails-screenshots-next-button]');

    assert
      .dom('[data-test-screenshot-image]')
      .hasAttribute('src', screenshots[1]);

    // Navigate back to first screenshot
    await click('[data-test-fileDetails-screenshots-prev-button]');

    assert
      .dom('[data-test-screenshot-image]')
      .hasAttribute('src', screenshots[0]);
  });
});
