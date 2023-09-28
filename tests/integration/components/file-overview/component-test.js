import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import faker from 'faker';
import { module, test } from 'qunit';

module('Integration | Component | file-overview', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');
    this.project = this.store.createRecord('project', {
      id: 1,
      isManualScanAvailable: true,
      name: faker.company.companyName(),
      packageName: 'MFVA',
    });

    this.file = this.store.createRecord('file', {
      id: 1,
      project: this.project,
      name: faker.company.companyName(),
      iconUrl:
        'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/315.jpg',
      version: faker.random.number(),
      versionCode: faker.random.number(),
    });

    this.server.create('profile');

    this.server.get('/profiles/:id/unknown_analysis_status', () => {
      return {
        id: 1,
        status: true,
      };
    });
  });

  test('it renders with yielded content', async function (assert) {
    await render(
      hbs`
      <FileOverview  @file={{this.file}} @profileId={{this.file.id}}>
        <div data-test-yielded-content>
          Yielded Content
        </div>
      </FileOverview>`
    );

    assert
      .dom(`[data-test-yielded-content]`)
      .exists()
      .containsText('Yielded Content');
  });

  test('it renders and displays the right content ', async function (assert) {
    await render(
      hbs`
      <FileOverview  @file={{this.file}} @profileId={{this.file.id}} />`
    );

    assert.dom(`[data-test-file-overview-container]`).exists();

    // File name
    assert
      .dom(`[data-test-file-overview-file-name]`)
      .exists()
      .containsText(this.file.name);

    // Package name
    assert
      .dom(`[data-test-file-overview-package-name]`)
      .exists()
      .containsText(this.file.project.get('packageName'));

    // File Version
    assert
      .dom(`[data-test-file-overview-version]`)
      .exists()
      .includesText(this.file.version)
      .includesText(this.file.versionCode);

    // File ID
    assert
      .dom(`[data-test-file-overview-file-id]`)
      .exists()
      .includesText(this.file.id);

    // File creation date
    assert
      .dom(`[data-test-file-overview-date-created]`)
      .exists()
      .includesText(`t:started:()`);

    // File critical risk count/levels
    assert
      .dom(`[data-test-critical-risk-count]`)
      .exists()
      .hasText(`${this.file.countRiskCritical}`);

    assert
      .dom(`[data-test-count-risk-high]`)
      .exists()
      .includesText(this.file.countRiskHigh);

    assert
      .dom(`[data-test-count-risk-medium]`)
      .exists()
      .includesText(this.file.countRiskMedium);

    assert
      .dom(`[data-test-count-risk-low]`)
      .exists()
      .includesText(this.file.countRiskLow);

    assert
      .dom(`[data-test-count-risk-none]`)
      .exists()
      .includesText(this.file.countRiskNone);

    assert
      .dom(`[data-test-count-risk-unknown]`)
      .exists()
      .includesText(this.file.countRiskUnknown);

    // Status tags
    assert.dom(`[data-test-static-scan-status-tag]`).exists();
    assert
      .dom(`[data-test-static-scan-status-tag-label]`)
      .exists()
      .containsText('t:static:()');
    assert.dom(`[data-test-api-scan-status-tag]`).exists();
    assert
      .dom(`[data-test-api-scan-status-tag-label]`)
      .exists()
      .containsText('t:api:()');
    assert.dom(`[data-test-manual-scan-status-tag]`).exists();
    assert
      .dom(`[data-test-manual-scan-status-tag-label]`)
      .exists()
      .containsText('t:manual:()');
    assert.dom(`[data-test-dynamic-scan-status-tag]`).exists();
    assert
      .dom(`[data-test-dynamic-scan-status-tag-label]`)
      .exists()
      .containsText('t:dynamic:()');

    // Platform Icon
    assert.dom(`[data-test-file-overview-platform-icon]`).exists();
    const platformIconElementClass = this.element.querySelector(
      `[data-test-file-overview-platform-icon]`
    )?.className;

    assert.ok(
      platformIconElementClass?.includes(
        this.file.project.get('platformIconClass')
      ),
      'Contains the right platform icon class.'
    );

    // File Icon
    const fileIconImageElement = this.element.querySelector(
      `[data-test-file-overview-icon-url]`
    );
    assert.strictEqual(
      fileIconImageElement.src,
      this.file.iconUrl,
      'Displays the correct file icon URL.'
    );
  });

  test('It shows inactive icon when file is inactive ', async function (assert) {
    this.file.isActive = false;
    await render(
      hbs`
      <FileOverview  @file={{this.file}} @profileId={{this.file.id}} />`
    );

    assert.dom(`[data-test-file-overview-file-id-icon]`).exists();

    this.file.isActive = true;
    await render(
      hbs`
      <FileOverview  @file={{this.file}} @profileId={{this.file.id}} />`
    );
    assert.dom(`[data-test-file-overview-file-id-icon]`).doesNotExist();
  });

  test('It renders the right number of tags if available', async function (assert) {
    let tags = [];
    for (let i = 0; i < 2; i++) {
      tags.push(this.store.createRecord('tag', { id: i }));
    }

    this.file.tags = tags;
    this.file.isActive = true;

    await render(
      hbs`
      <FileOverview  @file={{this.file}} @profileId={{this.file.id}} />`
    );
    assert.dom(`[data-test-file-tags]`).exists();
    const fileTags = this.element.querySelectorAll('[data-test="file-tag"]');
    assert.strictEqual(fileTags.length, 2);
  });

  test('It hides manual scan tag if manual scan feature is disabled', async function (assert) {
    this.project.isManualScanAvailable = false;
    this.file.project = this.project;

    await render(
      hbs`
      <FileOverview  @file={{this.file}} @profileId={{this.file.id}} />`
    );

    assert.dom(`[data-test-manual-scan-status-tag]`).doesNotExist();
    assert.dom(`[data-test-manual-scan-status-tag-label]`).doesNotExist();
  });
});
