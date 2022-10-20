import Service from '@ember/service';
import { underscore } from '@ember/string';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

function profile_serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).forEach((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });

  return serializedPayload;
}
class OrganizationStub extends Service {
  selected = {
    id: 1,
    features: {
      manualscan: true,
    },
  };
}

module('Integration | Component | file-overview', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:organization', OrganizationStub);

    this.project = this.server.create('project');

    this.server.create('profile');
    this.file = this.server.create('file', 1, {
      iconUrl:
        'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/315.jpg',
      project: this.project,
    });

    this.server.get(
      '/profiles/:id/unknown_analysis_status',
      (schema, request) => {
        return profile_serializer(schema['profiles'].find(request.params.id));
      }
    );
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
      .containsText(this.file.project.packageName);

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
      `[data-test-file-overview-platform-icon] i`
    )?.className;

    assert.ok(
      platformIconElementClass?.includes(this.file.project.platformIconClass),
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

    assert.dom(`[data-test-file-overview-file-id] i`).exists();

    this.file.isActive = true;
    await render(
      hbs`
      <FileOverview  @file={{this.file}} @profileId={{this.file.id}} />`
    );
    assert.dom(`[data-test-file-overview-file-id] i`).doesNotExist();
  });

  test('It renders the right number of tags if available', async function (assert) {
    this.file.tags = ['New_Detailed_Scan', 'New_Detailed_Test'];
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
    class OrganizationStub extends Service {
      selected = {
        id: 1,
        features: {
          manualscan: false,
        },
      };
    }

    this.owner.register('service:organization', OrganizationStub);

    await render(
      hbs`
      <FileOverview  @file={{this.file}} @profileId={{this.file.id}} />`
    );

    assert.dom(`[data-test-manual-scan-status-tag]`).doesNotExist();
    assert.dom(`[data-test-manual-scan-status-tag-label]`).doesNotExist();
  });
});
