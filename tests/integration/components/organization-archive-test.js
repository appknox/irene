import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import { getDatePicker } from 'ember-date-components/test-support/helpers/date-picker';
import styles from 'irene/components/ak-date-picker/index.scss';

import Service from '@ember/service';
import dayjs from 'dayjs';
import faker from 'faker';

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

module('Integration | Component | organization-archive', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();

    const organizationArchives = this.server.createList(
      'organization-archive',
      5
    );
    const organizationUsers = this.server.createList('organization-user', 5);

    this.setProperties({
      organizationArchives,
      organizationUsers,
    });

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders organization-archive', async function (assert) {
    this.server.get('/organizations/:id/archives', (schema) => {
      return schema.organizationArchives.all().models;
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`<OrganizationArchive />`);

    assert
      .dom('[data-test-orgArchive-title]')
      .hasText('t:organizationArchive:()');

    assert
      .dom('[data-test-orgArchive-subtitle]')
      .hasText('t:organizationArchiveDescription:()');

    assert
      .dom('[data-test-orgArchive-dateTitle]')
      .hasText('t:organizationArchiveSelectDateTitle:()');

    assert
      .dom('[data-test-orgArchive-dateSubtitle]')
      .hasText('t:organizationArchiveSelectDateDesc:()');

    assert
      .dom('[data-test-orgArchive-exportBtn]')
      .isNotDisabled()
      .hasText('t:organizationArchiveExport:()');

    // archive table
    assert
      .dom('[data-test-orgArchiveList-title]')
      .hasText('t:organizationArchiveTableHeading:()');

    assert
      .dom('[data-test-orgArchiveList-desc]')
      .hasText('t:organizationArchiveTableDesc:()');

    const headerContent = findAll('[data-test-orgArchiveList-thead] th');

    assert.dom(headerContent[0]).hasText('t:organizationTableCreatedOn:()');
    assert.dom(headerContent[1]).hasText('t:organizationTableGeneratedBy:()');
    assert.dom(headerContent[2]).hasText('t:organizationTableDuration:()');
    assert.dom(headerContent[3]).hasText('t:status:()');
    assert.dom(headerContent[4]).hasText('t:action:()');

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

    const fromDate = dayjs(this.organizationArchives[0].from_date).format(
      'DD MMM YYYY'
    );

    const toDate = dayjs(this.organizationArchives[0].to_date).format(
      'DD MMM YYYY'
    );

    assert.dom(contentRow[2]).hasText(`${fromDate} - ${toDate}`);

    const availableUntil = dayjs(
      this.organizationArchives[0].available_until
    ).fromNow();

    assert.dom(contentRow[3]).hasText(`t:expires:() ${availableUntil}`);

    assert.dom('[data-test-archiveAction-btn]', contentRow[4]).isNotDisabled();
  });

  test('it should render expired excel export', async function (assert) {
    this.server.get('/organizations/:id/archives', (schema) => {
      const archives = schema.organizationArchives.all().models;

      archives[3].available_until = faker.date.past();
      archives[4].available_until = faker.date.past();

      return archives;
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`<OrganizationArchive />`);

    assert
      .dom('[data-test-orgArchive-title]')
      .hasText('t:organizationArchive:()');

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

    const fromDate = dayjs(this.organizationArchives[3].from_date).format(
      'DD MMM YYYY'
    );

    const toDate = dayjs(this.organizationArchives[3].to_date).format(
      'DD MMM YYYY'
    );

    assert.dom(contentRow[2]).hasText(`${fromDate} - ${toDate}`);

    assert.dom(contentRow[3]).hasText('t:expired:()');

    assert.dom('[data-test-archiveAction-btn]', contentRow[4]).doesNotExist();
  });

  test.each(
    'it should download excel export archive',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      assert.expect(fail ? 3 : 4);

      window.open = (url) => {
        assert.strictEqual(
          url,
          'https://appknox.archive_download_url.amazonaws.com/'
        );
      };

      this.server.get('/organizations/:id/archives', (schema) => {
        const archives = schema.organizationArchives.all().models;

        return archives;
      });

      this.server.get(
        '/organizations/:id/archives/:archiveId/download_url',
        () => {
          return fail
            ? new Response(500)
            : {
                url: 'https://appknox.archive_download_url.amazonaws.com/',
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
        .hasText('t:organizationArchive:()');

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
          't:organizationArchiveDownloadErrored:()'
        );
      } else {
        assert.notOk(notify.errorMsg);
      }
    }
  );

  test.each(
    'it should export excel archive for selected dates',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      this.server.get('/organizations/:id/archives', (schema) => {
        return schema.organizationArchives.all().models;
      });

      this.server.post('/organizations/:id/archives', () => {
        return fail ? new Response(500) : {};
      });

      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        const user = schema.organizationUsers.find(req.params.userId);

        return user?.toJSON();
      });

      await render(hbs`<OrganizationArchive />`);

      assert
        .dom('[data-test-orgArchive-title]')
        .hasText('t:organizationArchive:()');

      assert
        .dom('[data-test-orgArchive-dateRangeLabel]')
        .hasText('t:fromDate:() - t:toDate:()');

      assert
        .dom('[data-test-orgArchive-dateClearBtn]')
        .isNotDisabled()
        .hasText('Clear');

      const datePicker = await getDatePicker(
        `.${styles['ak-date-picker-root']}`
      );

      await datePicker.toggle();
      await datePicker.previousMonth();

      const prevMonth = dayjs().subtract(1, 'month');

      const dateFrom = `${prevMonth.year()}-${prevMonth.month()}-1`;
      const dateTo = `${prevMonth.year()}-${prevMonth.month()}-24`;

      await click(`[data-test-date-picker-day="${dateFrom}"]`);
      await click(`[data-test-date-picker-day="${dateTo}"]`);

      // adding a month above month is 0 indexed
      const fomatedFrom = dayjs(dateFrom).add(1, 'month').format('DD MMM YYYY');
      const fomatedTo = dayjs(dateTo).add(1, 'month').format('DD MMM YYYY');

      assert
        .dom('[data-test-orgArchive-dateRangeLabel]')
        .hasText(`${fomatedFrom} - ${fomatedTo}`);

      await click('[data-test-orgArchive-exportBtn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(notify.errorMsg, 't:organizationArchiveFailed:()');
      } else {
        assert.strictEqual(
          notify.successMsg,
          't:organizationArchiveSuccess:()'
        );
      }
    }
  );
});
