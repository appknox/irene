import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }
}

module('Integration | Component | file-details/static-scan', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const store = this.owner.lookup('service:store');

    const file = this.server.create('file', {
      project: '1',
    });

    this.server.create('project', { file: file.id, id: '1' });

    this.setProperties({
      file: store.push(store.normalize('file', file.toJSON())),
    });

    await this.owner.lookup('service:organization').load();

    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders', async function (assert) {
    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`<FileDetails::StaticScan @file={{this.file}} />`);

    assert
      .dom('[data-test-fileDetails-staticscan-breadcrumbContainer]')
      .exists();

    assert
      .dom('[data-test-fileDetails-staticscan-sast-results-tab]')
      .exists()
      .containsText(t('sastResults'));

    if (this.file.staticVulnerabilityCount) {
      assert
        .dom('[data-test-fileDetails-staticscan-badge-count]')
        .exists()
        .containsText(this.file.staticVulnerabilityCount);
    }

    assert
      .dom('[data-test-fileDetails-staticscan-info]')
      .exists()
      .containsText(t('sastResultsInfo'));

    assert
      .dom(
        '[data-test-fileDetails-staticscan-tabs="vulnerability-details-tab"]'
      )
      .exists()
      .containsText(t('vulnerabilityDetails'));
  });

  test.each(
    'test restart static scan',
    [true, false],
    async function (assert, isStaticDone) {
      this.file.isActive = true;
      this.file.isStaticDone = isStaticDone;

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      if (isStaticDone) {
        this.server.post('/rescan', () => {});
      }

      await render(hbs`<FileDetails::StaticScan @file={{this.file}} />`);

      if (isStaticDone) {
        assert
          .dom('[data-test-fileDetails-staticscan-restartBtn]')
          .isNotDisabled();

        await click('[data-test-fileDetails-staticscan-restartBtn]');

        assert
          .dom('[data-test-ak-modal-header]')
          .hasText(t('modalCard.rescan.title'));

        assert
          .dom('[data-test-confirmbox-description]')
          .hasText(t('modalCard.rescan.description'));

        assert.dom('[data-test-confirmbox-confirmBtn]').hasText(t('yes'));

        assert.dom('[data-test-confirmbox-cancelBtn]').hasText(t('no'));

        await click('[data-test-confirmbox-confirmBtn]');

        const notify = this.owner.lookup('service:notifications');

        assert.strictEqual(notify.infoMsg, t('rescanInitiated'));
      } else {
        assert
          .dom('[data-test-fileDetails-staticscan-restartBtn]')
          .isDisabled();
      }
    }
  );

  test('static scan restart button should be disabled for inactive file', async function (assert) {
    this.file.isActive = false;
    this.file.isStaticDone = true;

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`<FileDetails::StaticScan @file={{this.file}} />`);

    assert.dom('[data-test-fileDetails-staticscan-restartBtn]').isDisabled();
  });
});
