import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import { selectChoose } from 'ember-power-select/test-support';

import {
  calendarCenter,
  calendarSelect,
} from 'ember-power-calendar/test-support/helpers';

import Service from '@ember/service';
import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';

import { OrganizationArchiveType } from 'irene/models/organization-archive';
import styles from 'irene/components/ak-select/index.scss';

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

class OrganizationMeStub extends Service {
  org = {
    is_owner: true,
    is_admin: true,
  };
}

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

class WindowStub extends Service {
  url = null;

  open(url) {
    this.url = url;
  }
}

module('Integration | Component | organization-archive', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();

    const organizationArchives = this.server.createList(
      'organization-archive',
      5
    );

    const organizationUsers = this.server.createList('organization-user', 6);

    this.setProperties({
      organizationArchives,
      organizationUsers,
    });

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:browser/window', WindowStub);
  });

  test('it renders organization-archive', async function (assert) {
    this.server.get('/organizations/:id/archives', (schema) => {
      const results = schema.organizationArchives.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`<OrganizationArchive />`);

    assert
      .dom('[data-test-orgArchive-title]')
      .hasText(t('organizationArchive'));

    assert
      .dom('[data-test-orgArchive-selectArchiveTypeTitle]')
      .hasText(t('organizationArchiveTypeSelectTitle'));

    assert.dom('[data-test-orgArchive-exportBtn]').doesNotExist();
    assert.dom('[data-test-orgArchive-dateRangeLabel]').doesNotExist();
    assert.dom('[data-test-orgArchive-dateClearBtn]').doesNotExist();
    assert.dom('[data-test-orgArchive-archiveTypeDescription]').doesNotExist();

    // archive table
    assert
      .dom('[data-test-orgArchiveList-title]')
      .hasText(t('organizationArchiveTableHeading'));

    assert
      .dom('[data-test-orgArchiveList-desc]')
      .hasText(t('organizationArchiveTableDesc'));

    const headerContent = findAll('[data-test-orgArchiveList-thead] th');

    assert.dom(headerContent[0]).hasText(t('organizationTableCreatedOn'));
    assert.dom(headerContent[1]).hasText(t('organizationTableGeneratedBy'));
    assert.dom(headerContent[2]).hasText(t('reportType'));
    assert.dom(headerContent[3]).hasText(t('status'));
    assert.dom(headerContent[4]).hasText(t('action'));

    const contentRows = findAll('[data-test-orgArchiveList-row]');

    const contentRow = contentRows[0].querySelectorAll(
      '[data-test-orgArchiveList-cell]'
    );

    assert
      .dom(contentRow[0])
      .hasText(
        dayjs(this.organizationArchives[0].created_on).format('DD MMM YYYY')
      );

    assert.dom(contentRow[1]).hasText(this.organizationUsers[0].username);

    if (
      this.organizationArchives[0].archive_type ===
      OrganizationArchiveType.COMPREHENSIVE
    ) {
      const fromDate = dayjs(this.organizationArchives[0].from_date).format(
        'DD MMM YYYY'
      );

      const toDate = dayjs(this.organizationArchives[0].to_date).format(
        'DD MMM YYYY'
      );

      assert.dom(contentRow[2]).hasText(t('comprehensive'));

      const durationIcon = contentRow[2].querySelector(
        '[data-test-orgArchive-durationIcon]'
      );

      assert.dom(durationIcon).exists();

      assert.dom('[data-test-orgArchive-durationDateRange]').doesNotExist();

      await triggerEvent(durationIcon, 'mouseenter');

      assert
        .dom('[data-test-orgArchive-durationDateRange]')
        .hasText(`${fromDate} - ${toDate}`);

      await triggerEvent(durationIcon, 'mouseleave');

      assert.dom('[data-test-orgArchive-durationDateRange]').doesNotExist();
    } else {
      assert.dom(contentRow[2]).hasText(t('latestScan'));
    }

    const availableUntil = dayjs(
      this.organizationArchives[0].available_until
    ).fromNow();

    assert.dom(contentRow[3]).hasText(`${t('expires')} ${availableUntil}`);

    assert.dom('[data-test-archiveAction-btn]', contentRow[4]).isNotDisabled();
  });

  test('it should render expired excel export', async function (assert) {
    this.server.get('/organizations/:id/archives', (schema) => {
      const results = schema.organizationArchives.all().models;

      results[3].available_until = faker.date.past();
      results[4].available_until = faker.date.past();

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`<OrganizationArchive />`);

    assert
      .dom('[data-test-orgArchive-title]')
      .hasText(t('organizationArchive'));

    const contentRows = findAll('[data-test-orgArchiveList-row]');

    assert.dom(contentRows[3]).hasClass(/archive-row-expired/);

    const contentRow = contentRows[3].querySelectorAll(
      '[data-test-orgArchiveList-cell]'
    );

    assert
      .dom(contentRow[0])
      .hasText(
        dayjs(this.organizationArchives[3].created_on).format('DD MMM YYYY')
      );

    assert.dom(contentRow[1]).hasText(this.organizationUsers[3].username);

    if (
      this.organizationArchives[3].archive_type ===
      OrganizationArchiveType.COMPREHENSIVE
    ) {
      const fromDate = dayjs(this.organizationArchives[3].from_date).format(
        'DD MMM YYYY'
      );

      const toDate = dayjs(this.organizationArchives[3].to_date).format(
        'DD MMM YYYY'
      );

      assert.dom(contentRow[2]).hasText(t('comprehensive'));

      const durationIcon = contentRow[2].querySelector(
        '[data-test-orgArchive-durationIcon]'
      );

      assert.dom(durationIcon).exists();

      assert.dom('[data-test-orgArchive-durationDateRange]').doesNotExist();

      await triggerEvent(durationIcon, 'mouseenter');

      assert
        .dom('[data-test-orgArchive-durationDateRange]')
        .hasText(`${fromDate} - ${toDate}`);

      await triggerEvent(durationIcon, 'mouseleave');

      assert.dom('[data-test-orgArchive-durationDateRange]').doesNotExist();
    } else {
      assert.dom(contentRow[2]).hasText(t('latestScan'));
    }

    assert.dom(contentRow[3]).hasText(t('expired'));

    assert.dom('[data-test-archiveAction-btn]', contentRow[4]).doesNotExist();
  });

  test.each(
    'it should download excel export archive',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      assert.expect(fail ? 3 : 4);

      const downloadURL = 'https://appknox.archive_download_url.amazonaws.com/';

      this.server.get('/organizations/:id/archives', (schema) => {
        const results = schema.organizationArchives.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get(
        '/organizations/:id/archives/:archiveId/download_url',
        () => {
          return fail
            ? new Response(500)
            : {
                url: downloadURL,
              };
        }
      );

      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        const user = schema.organizationUsers.find(req.params.userId);

        return user?.toJSON();
      });

      await render(hbs`<OrganizationArchive />`);

      assert
        .dom('[data-test-orgArchive-title]')
        .hasText(t('organizationArchive'));

      const contentRows = findAll('[data-test-orgArchiveList-row]');

      const contentRow = contentRows[0].querySelectorAll(
        '[data-test-orgArchiveList-cell]'
      );

      assert
        .dom('[data-test-archiveAction-btn]', contentRow[4])
        .isNotDisabled();

      await click(`#${contentRow[4].id} [data-test-archiveAction-btn]`);

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(
          notify.errorMsg,
          t('organizationArchiveDownloadErrored')
        );
      } else {
        assert.notOk(notify.errorMsg);

        const window = this.owner.lookup('service:browser/window');

        assert.strictEqual(window.url, downloadURL);
      }
    }
  );

  test.each(
    'it should export excel archive for selected dates/latest scan',
    [
      { fail: false, archiveType: OrganizationArchiveType.COMPREHENSIVE },
      { fail: false, archiveType: OrganizationArchiveType.LATEST_SCAN },
      { fail: true, archiveType: OrganizationArchiveType.COMPREHENSIVE },
      { fail: true, archiveType: OrganizationArchiveType.LATEST_SCAN },
    ],
    async function (assert, { fail, archiveType }) {
      const isComprehensive =
        archiveType === OrganizationArchiveType.COMPREHENSIVE;

      const createOrgArchive = (archive_type) =>
        this.server.create('organization-archive', { archive_type });

      this.server.get('/organizations/:id/archives', (schema) => {
        const results = schema.organizationArchives.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.post('/organizations/:id/archives', () => {
        return fail
          ? new Response(500)
          : createOrgArchive(archiveType)?.toJSON();
      });

      this.server.post(
        '/organizations/:id/archives/generate_excel_project_latest_scans',
        () => {
          return fail
            ? new Response(500)
            : createOrgArchive(archiveType)?.toJSON();
        }
      );

      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        const user = schema.organizationUsers.find(req.params.userId);

        return user?.toJSON();
      });

      await render(hbs`<OrganizationArchive />`);

      assert
        .dom('[data-test-orgArchive-title]')
        .hasText(t('organizationArchive'));

      assert
        .dom('[data-test-orgArchive-selectArchiveTypeTitle]')
        .hasText(t('organizationArchiveTypeSelectTitle'));

      assert.dom('[data-test-orgArchive-archiveTypeSelect]').exists();

      assert.dom('[data-test-orgArchive-exportBtn]').doesNotExist();
      assert.dom('[data-test-orgArchive-dateRangeLabel]').doesNotExist();
      assert.dom('[data-test-orgArchive-dateClearBtn]').doesNotExist();

      assert
        .dom('[data-test-orgArchive-archiveTypeDescription]')
        .doesNotExist();

      await selectChoose(
        `[data-test-orgArchive-archiveTypeSelect] .${classes.trigger}`,
        isComprehensive ? t('comprehensive') : t('latestScan')
      );

      assert
        .dom(`[data-test-orgArchive-archiveTypeSelect] .${classes.trigger}`)
        .hasText(isComprehensive ? t('comprehensive') : t('latestScan'));

      assert
        .dom('[data-test-orgArchive-exportBtn]')
        .isNotDisabled()
        .hasText(t('organizationArchiveExport'));

      assert
        .dom('[data-test-orgArchive-archiveTypeDescription]')
        .hasText(
          isComprehensive
            ? t('organizationArchiveComprehensiveDescription')
            : t('organizationArchiveLatestScanDescription')
        );

      if (isComprehensive) {
        assert
          .dom('[data-test-orgArchive-dateRangeLabel]')
          .hasText(`${t('fromDate')} - ${t('toDate')}`);

        assert
          .dom('[data-test-orgArchive-dateClearBtn]')
          .isNotDisabled()
          .hasText(t('clear'));

        assert.dom('[data-test-akDatePicker-calendar]').doesNotExist();

        // open date picker
        await click('[data-test-date-picker-toggle-button]');

        assert.dom('[data-test-akDatePicker-calendar]').exists();

        const prevMonth = dayjs().subtract(1, 'month');

        await calendarCenter(
          '[data-test-akDatePicker-calendar]',
          prevMonth.toDate()
        );

        const dateFrom = new Date(prevMonth.year(), prevMonth.month(), 1);
        const dateTo = new Date(prevMonth.year(), prevMonth.month(), 24);

        await calendarSelect('[data-test-akDatePicker-calendar]', dateFrom);
        await calendarSelect('[data-test-akDatePicker-calendar]', dateTo);

        const fomatedFrom = dayjs(dateFrom).format('DD MMM YYYY');
        const fomatedTo = dayjs(dateTo).format('DD MMM YYYY');

        assert
          .dom('[data-test-orgArchive-dateRangeLabel]')
          .hasText(`${fomatedFrom} - ${fomatedTo}`);
      }

      await click('[data-test-orgArchive-exportBtn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(notify.errorMsg, t('organizationArchiveFailed'));
      } else {
        assert.strictEqual(notify.successMsg, t('organizationArchiveSuccess'));
      }
    }
  );

  test('it should render system if CRM generated', async function (assert) {
    this.server.schema.organizationArchives.all().destroy();
    this.server.schema.organizationUsers.all().destroy();

    const systemUser = this.server.create('organization-user', {
      username: 'system-user1',
    });

    const nonSystemUser = this.server.create('organization-user', {
      username: 'non-system-user1',
    });

    this.server.create('organization-archive', {
      generated_by: nonSystemUser.id,
    });

    this.server.create('organization-archive', {
      generated_by: nonSystemUser.id,
      generated_via: 2,
    });

    this.server.create('organization-archive', {
      generated_by: systemUser.id,
      generated_via: 1,
    });

    this.server.get('/organizations/:id/archives', (schema) => {
      const results = schema.organizationArchives.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);
      if (user.id == systemUser.id) {
        return new Response(404, {});
      }
      return user?.toJSON();
    });

    await render(hbs`<OrganizationArchive />`);

    const cells = findAll('[data-test-orgArchiveList-cell]');
    const systemText = t('system');

    const contentWithSystem = cells
      .map((_) => _.textContent.trim())
      .filter((_) => _.includes(systemText));

    assert.strictEqual(
      contentWithSystem.length,
      1,
      'contains 1 System generatedBy'
    );

    assert.strictEqual(
      contentWithSystem[0],
      t('system'),
      'System generatedBy exists'
    );
  });
});
