import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, render, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { Response } from 'miragejs';
import Service from '@ember/service';
import dayjs from 'dayjs';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

module('Integration | Component | file-cleanup', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.owner.register('service:notifications', NotificationsStub);

    // Mock organization
    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();
  });

  test('it renders storage management settings when cleanup preference exists', async function (assert) {
    const cleanupPref = {
      is_enabled: true,
      files_to_keep: 5,
      last_cleaned_at: new Date('2024-01-15'),
    };

    this.server.get('/organizations/:id/cleanup-preference', () => cleanupPref);

    await render(hbs`<FileCleanup />`);

    assert.dom('[data-test-fileCleanup-title]').hasText(t('storageManagement'));
    assert.dom('[data-test-fileCleanup-toggle]').exists();

    assert
      .dom('[data-test-fileCleanup-autoCleanupTitle]')
      .hasText(t('fileCleanup.autoCleanup'));

    assert
      .dom('[data-test-fileCleanup-description]')
      .hasText(t('fileCleanup.description'));

    assert
      .dom('[data-test-fileCleanup-filesToKeepInput]')
      .hasValue(String(cleanupPref.files_to_keep));

    assert
      .dom('[data-test-fileCleanup-lastActivityLabel]')
      .hasText(`${t('fileCleanup.lastActivity')}:`);

    assert
      .dom('[data-test-fileCleanup-lastActivityDate]')
      .hasText(dayjs(cleanupPref.last_cleaned_at).format('DD MMM YYYY'));

    assert
      .dom('[data-test-fileCleanup-viewListBtn]')
      .hasText(t('fileCleanup.viewList'));

    assert.dom('[data-test-fileCleanup-runBtn]').hasText(t('fileCleanup.run'));
    assert.dom('[data-test-fileCleanup-divider]').exists();
  });

  test('it hides settings when cleanup preference returns 404', async function (assert) {
    this.server.get('/organizations/:id/cleanup-preference', () => {
      return new Response(404, {}, { errors: [{ status: '404' }] });
    });

    await render(hbs`<FileCleanup />`);

    assert.dom('[data-test-fileCleanup-title]').doesNotExist();
    assert.dom('[data-test-fileCleanup-toggle]').doesNotExist();
    assert.dom('[data-test-fileCleanup-divider]').doesNotExist();
  });

  test.each(
    'it toggles auto cleanup on/off',
    [false, true],
    async function (assert, is_enabled) {
      const cleanupPref = {
        is_enabled,
        files_to_keep: 5,
        last_cleaned_at: new Date(),
      };

      this.server.get(
        '/organizations/:id/cleanup-preference',
        () => cleanupPref
      );

      this.server.put('/organizations/:id/cleanup-preference', () => ({
        ...cleanupPref,
        is_enabled: !is_enabled,
      }));

      await render(hbs`<FileCleanup />`);

      const toggleInput = '[data-test-fileCleanup-toggle] input';
      const filesToKeepInput = '[data-test-fileCleanup-filesToKeepInput]';

      if (is_enabled) {
        assert.dom(toggleInput).isChecked();
      } else {
        assert.dom(filesToKeepInput).doesNotExist();
        assert.dom(toggleInput).isNotChecked();
      }

      await click(toggleInput);

      const notify = this.owner.lookup('service:notifications');
      assert.strictEqual(notify.successMsg, t('fileCleanup.msg.saveSuccess'));

      if (!is_enabled) {
        assert.dom(filesToKeepInput).exists();
      } else {
        assert.dom(filesToKeepInput).doesNotExist();
      }
    }
  );

  test('it validates filesToKeep input (min/max)', async function (assert) {
    this.server.get('/organizations/:id/cleanup-preference', () => {
      return {
        is_enabled: true,
        files_to_keep: 5,
        last_cleaned_at: new Date(),
      };
    });

    await render(hbs`<FileCleanup />`);

    // Test invalid value (less than minimum)
    await fillIn('[data-test-fileCleanup-filesToKeepInput]', '1');

    assert
      .dom('[data-test-fileCleanup-filesToKeepError]')
      .hasText('Value must be between 2 and 50');

    assert.dom('[data-test-fileCleanup-saveBtn]').isDisabled();

    // Test invalid value (more than maximum)
    await fillIn('[data-test-fileCleanup-filesToKeepInput]', '51');

    assert
      .dom('[data-test-fileCleanup-filesToKeepError]')
      .hasText('Value must be between 2 and 50');

    assert.dom('[data-test-fileCleanup-saveBtn]').isDisabled();

    // Test valid value
    await fillIn('[data-test-fileCleanup-filesToKeepInput]', '10');

    assert.dom('[data-test-fileCleanup-filesToKeepError]').hasText('');
    assert.dom('[data-test-fileCleanup-saveBtn]').isNotDisabled();
  });

  test.each(
    'it saves cleanup preferences',
    [{ success: true }, { success: false }],
    async function (assert, { success }) {
      const errorMsg = 'Failed to save preferences';

      const cleanupPref = {
        is_enabled: true,
        files_to_keep: 5,
        last_cleaned_at: new Date(),
      };

      this.server.get(
        '/organizations/:id/cleanup-preference',
        () => cleanupPref
      );

      this.server.put('/organizations/:id/cleanup-preference', () => {
        if (success) {
          return {
            ...cleanupPref,
            files_to_keep: 10,
          };
        } else {
          return new Response(500, {}, { errors: [{ detail: errorMsg }] });
        }
      });

      await render(hbs`<FileCleanup />`);

      await fillIn('[data-test-fileCleanup-filesToKeepInput]', '10');
      await click('[data-test-fileCleanup-saveBtn]');

      const notify = this.owner.lookup('service:notifications');

      if (success) {
        assert.strictEqual(notify.successMsg, t('fileCleanup.msg.saveSuccess'));
      } else {
        assert.strictEqual(notify.errorMsg, errorMsg);
      }
    }
  );

  test.each(
    'it triggers file cleanup',
    [{ success: true }, { success: false }],
    async function (assert, { success }) {
      const cleanupPref = {
        is_enabled: true,
        files_to_keep: 5,
        last_cleaned_at: new Date(),
      };

      this.server.get(
        '/organizations/:id/cleanup-preference',
        () => cleanupPref
      );

      this.server.post('/organizations/:id/cleanups', () => {
        if (success) {
          return { id: 1, type: 'Manual', created_on: new Date() };
        } else {
          return new Response(
            500,
            {},
            { errors: [{ detail: 'Failed to trigger cleanup' }] }
          );
        }
      });

      await render(hbs`<FileCleanup />`);

      assert.dom('[data-test-fileCleanup-runBtn]').isNotDisabled();

      await click('[data-test-fileCleanup-runBtn]');

      const notify = this.owner.lookup('service:notifications');

      if (success) {
        assert.strictEqual(
          notify.successMsg,
          t('fileCleanup.msg.triggerSuccess')
        );
      } else {
        assert.strictEqual(notify.errorMsg, 'Failed to trigger cleanup');
      }
    }
  );

  test('it opens and closes cleanup list modal', async function (assert) {
    this.server.get('/organizations/:id/cleanup-preference', () => {
      return {
        is_enabled: true,
        files_to_keep: 5,
        last_cleaned_at: new Date(),
      };
    });

    this.server.get('/organizations/:id/cleanups', () => {
      return [
        { id: 1, type: 'Manual', created_on: new Date() },
        { id: 2, type: 'Automatic', created_on: new Date() },
      ];
    });

    await render(hbs`<FileCleanup />`);

    assert.dom('[data-test-fileCleanup-modal]').doesNotExist();

    await click('[data-test-fileCleanup-viewListBtn]');

    assert.dom('[data-test-fileCleanup-modal]').exists();

    assert
      .dom('[data-test-ak-modal-header]')
      .hasText(t('fileCleanup.listTitle'));

    await click('[data-test-modal-close-btn]');

    assert.dom('[data-test-fileCleanup-modal]').doesNotExist();
  });

  test('it disables run button when auto cleanup is disabled', async function (assert) {
    this.server.get('/organizations/:id/cleanup-preference', () => {
      return {
        is_enabled: false,
        files_to_keep: 5,
        last_cleaned_at: new Date(),
      };
    });

    await render(hbs`<FileCleanup />`);

    // When disabled, the input and buttons should not be visible
    assert.dom('[data-test-fileCleanup-filesToKeepInput]').doesNotExist();
    assert.dom('[data-test-fileCleanup-runBtn]').doesNotExist();
    assert.dom('[data-test-fileCleanup-viewListBtn]').doesNotExist();
  });

  test('it disables save button when there are validation errors', async function (assert) {
    this.server.get('/organizations/:id/cleanup-preference', () => {
      return {
        is_enabled: true,
        files_to_keep: 5,
        last_cleaned_at: new Date(),
      };
    });

    await render(hbs`<FileCleanup />`);

    assert.dom('[data-test-fileCleanup-saveBtn]').isNotDisabled();

    await fillIn('[data-test-fileCleanup-filesToKeepInput]', '100');

    assert.dom('[data-test-fileCleanup-saveBtn]').isDisabled();

    await fillIn('[data-test-fileCleanup-filesToKeepInput]', '10');

    assert.dom('[data-test-fileCleanup-saveBtn]').isNotDisabled();
  });
});
