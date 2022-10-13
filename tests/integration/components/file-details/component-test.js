import { underscore } from '@ember/string';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import ENUMS from 'irene/enums';
import { Response } from 'miragejs';
import { module, test } from 'qunit';

function profile_serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).forEach((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });

  return serializedPayload;
}

module('Integration | Component | file-details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.profile = this.server.create('profile');
    this.file = this.server.create('file', {
      profile: this.profile,
    });
  });

  test('it renders correctly', async function (assert) {
    assert.expect(17);
    this.server.get('v2/files/:id/reports', () => {
      return [];
    });

    this.server.get('/hudson-api/projects', () => {
      return [];
    });

    this.server.get('/profiles/:id/proxy_settings', (schema, req) => {
      return {
        id: req.params.id,
        host: '',
        port: '',
        enabled: false,
      };
    });

    this.server.get('v2/files/:id', () => {
      return {
        id: 1,
      };
    });

    this.server.get('/manualscans/:id', () => {
      return {
        id: 1,
        status: true,
      };
    });

    this.server.get(
      '/profiles/:id/unknown_analysis_status',
      (schema, request) => {
        return profile_serializer(schema['profiles'].find(request.params.id));
      }
    );

    await render(hbs`<FileDetails @file={{this.file}} />`);
    assert.dom('[data-test="file-header"]').exists();
    assert.dom('[data-test-edit-analyses-link-wrapper]').exists();
    assert.dom('[data-test-edit-analyses-link]').exists();
    assert.ok(
      this.element
        .querySelector('[data-test-edit-analyses-link]')
        .href.includes(`/security/file/${this.file.id}`)
    );
    assert
      .dom('[data-test-sort-analyses-by-impact]')
      .exists()
      .hasAnyText('t:impact:()');
    assert.dom('[data-test-vulnerability-details-header]').exists();
    assert.dom('[data-test-vulnerability-filter]').exists();
    assert.dom('[data-test-vulnerability-filter-select]').exists();

    const vulnerabilityTypes = ENUMS.VULNERABILITY_TYPE.CHOICES.slice(0, -1);
    const vulnerabilitySelectOptions = this.element.querySelectorAll(
      '[data-test-vulnerability-filter-select-option]'
    );

    // The first select option is not part of the vulnerabilityTypes list
    // It has a value of -1

    assert.strictEqual(
      vulnerabilitySelectOptions.length,
      vulnerabilityTypes.length + 1
    );

    assert.strictEqual(vulnerabilitySelectOptions[0].value, '-1');
    assert.ok(
      vulnerabilitySelectOptions[0].innerText.includes('t:allScans:()')
    );
    assert.dom('[data-test-no-analyses-found]').exists();

    for (const type of vulnerabilityTypes) {
      assert.strictEqual(
        vulnerabilitySelectOptions[type.value].value,
        `${type.value}`
      );
    }
  });
  test('it hides edit analyses button when hudson projects api returns a 403 i.e a user is unauthorized', async function (assert) {
    this.server.get('v2/files/:id/reports', () => {
      return [];
    });

    this.server.get('/hudson-api/projects', () => {
      return Response(403);
    });

    this.server.get('/profiles/:id/proxy_settings', (schema, req) => {
      return {
        id: req.params.id,
        host: '',
        port: '',
        enabled: false,
      };
    });

    this.server.get('v2/files/:id', () => {
      return {
        id: 1,
      };
    });

    this.server.get('/manualscans/:id', () => {
      return {
        id: 1,
        status: true,
      };
    });

    this.server.get(
      '/profiles/:id/unknown_analysis_status',
      (schema, request) => {
        return profile_serializer(schema['profiles'].find(request.params.id));
      }
    );

    await render(hbs`<FileDetails @file={{this.file}} />`);
    assert.dom('[data-test-edit-analyses-link-wrapper]').doesNotExist();
    assert.dom('[data-test-edit-analyses-link]').doesNotExist();
  });
});
