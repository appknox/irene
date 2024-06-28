import { click, fillIn, find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

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

module('Integration | Component | file-details/summary-old', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const store = this.owner.lookup('service:store');
    const tags = this.server.createList('tag', 2);

    const file = this.server.create('file', {
      project: '1',
      tags: tags.map((tag) => tag.toJSON()),
    });

    this.server.create('project', { file: file.id, id: '1' });

    const pushedFile = store.push(store.normalize('file', file.toJSON()));

    this.setProperties({
      file: pushedFile,
      tags,
      store,
    });

    await this.owner.lookup('service:organization').load();
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders file-details/summary-old', async function (assert) {
    this.file.isStaticDone = true;

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
        <FileDetails::SummaryOld @file={{this.file}} />
    `);

    assert.dom('[data-test-appLogo-img]').exists();

    assert
      .dom('[data-test-fileDetailsSummary-appName]')
      .hasText(this.file.name);

    assert
      .dom('[data-test-fileDetailsSummary-appPackageName]')
      .hasText(this.file.project.get('packageName'));

    assert
      .dom('[data-test-fileReportBtn]')
      .isNotDisabled()
      .hasText('t:viewReport:()');

    assert.dom('[data-test-fileDetailsSummary-moreMenuBtn]').isNotDisabled();

    assert
      .dom('[data-test-fileDetailsSummary-fileId]')
      .hasText(`t:fileID:() - ${this.file.id}`);

    assert
      .dom('[data-test-fileDetailsSummary-fileOverview-appPlatform]')
      .exists();

    assert
      .dom('[data-test-fileDetailsSummary-showMoreOrLessBtn]')
      .isNotDisabled()
      .hasText('t:showMore:()');
  });

  test('it should toggle show more for file overview', async function (assert) {
    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
        <FileDetails::SummaryOld @file={{this.file}} />
    `);

    const hiddenFileOverviewDetails = [
      { label: 't:version:()', value: this.file.version },
      {
        label: 'T:versionCode:()',
        value: this.file.versionCode,
      },
      {
        label: 't:uploadedOn:()',
        value: dayjs(this.file.createdOn).fromNow(),
      },
    ];

    hiddenFileOverviewDetails.forEach((fod) => {
      assert
        .dom(`[data-test-fileDetailsSummary-fileOverviewGroup='${fod.label}']`)
        .doesNotExist();
    });

    assert
      .dom('[data-test-fileDetailsSummary-showMoreOrLessBtn]')
      .isNotDisabled()
      .hasText('t:showMore:()');

    await click('[data-test-fileDetailsSummary-showMoreOrLessBtn]');

    assert
      .dom('[data-test-fileDetailsSummary-showMoreOrLessBtn]')
      .isNotDisabled()
      .hasText('t:showLess:()');

    hiddenFileOverviewDetails.forEach((d) => {
      assert
        .dom(
          '[data-test-fileDetailsSummary-fileOverviewLabel]',
          find(`[data-test-fileDetailsSummary-fileOverviewGroup='${d.label}']`)
        )
        .hasText(d.label);

      assert
        .dom(
          '[data-test-fileDetailsSummary-fileOverviewValue]',
          find(`[data-test-fileDetailsSummary-fileOverviewGroup='${d.label}']`)
        )
        .hasText(d.value);
    });

    assert
      .dom('[data-test-fileDetailsSummary-fileTagTitle]')
      .hasText('t:tags:()');

    assert
      .dom('[data-test-fileDetailsSummary-addTagBtn]')
      .isNotDisabled()
      .hasText('t:addTags:()');
  });

  test('it should render file more menu', async function (assert) {
    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
        <FileDetails::SummaryOld @file={{this.file}} />
    `);

    // set project file count to 3
    const project = this.store.peekRecord('project', '1');
    project.fileCount = 3;

    assert.dom('[data-test-fileDetailsSummary-moreMenuBtn]').isNotDisabled();

    await click('[data-test-fileDetailsSummary-moreMenuBtn]');

    let menuItems = findAll('[data-test-fileDetailsSummary-moreMenuItem]');

    // project file count is more than 1
    assert.strictEqual(menuItems.length, 3);

    assert.dom(menuItems[0]).hasText('t:compare:()');
    assert.dom(menuItems[1]).hasText('t:allUploads:()');
    assert.dom(menuItems[2]).hasText('t:settings:()');

    // close menu
    await click('[data-test-ak-popover-backdrop]');

    // set project file count to 1
    project.fileCount = 1;

    await click('[data-test-fileDetailsSummary-moreMenuBtn]');

    // refresh menu items
    menuItems = findAll('[data-test-fileDetailsSummary-moreMenuItem]');

    assert.strictEqual(menuItems.length, 1);

    assert.dom(menuItems[0]).hasText('t:settings:()');
  });

  test.each('test add tag', [false, true], async function (assert, fail) {
    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.post('/v2/files/:id/tags', (schema, req) => {
      if (fail) {
        return new Response(500, {}, { errors: ['server error'] });
      }

      const tag = schema.create('tag', { name: req.requestBody.split('=')[1] });
      const file = schema.files.find(this.file.id);

      file.tags.push(tag.toJSON());
      file.save();

      return new Response(201);
    });

    await render(hbs`
        <FileDetails::SummaryOld @file={{this.file}} />
    `);

    assert
      .dom('[data-test-fileDetailsSummary-showMoreOrLessBtn]')
      .isNotDisabled()
      .hasText('t:showMore:()');

    await click('[data-test-fileDetailsSummary-showMoreOrLessBtn]');

    assert
      .dom('[data-test-fileDetailsSummary-fileTagTitle]')
      .hasText('t:tags:()');

    this.tags.forEach((tag) => {
      assert
        .dom(`[data-test-fileDetailsSummary-fileTag='${tag.name}']`)
        .hasText(tag.name);
    });

    assert
      .dom('[data-test-fileDetailsSummary-addTagBtn]')
      .isNotDisabled()
      .hasText('t:addTags:()');

    await click('[data-test-fileDetailsSummary-addTagBtn]');

    assert.dom('[data-test-fileDetailsSummary-addTagBtn]').doesNotExist();

    assert
      .dom('[data-test-fileDetailsSummary-addTagInput]')
      .isNotDisabled()
      .hasNoValue();

    assert
      .dom('[data-test-fileDetailsSummary-addTagConfirmBtn]')
      .isNotDisabled();

    assert
      .dom('[data-test-fileDetailsSummary-addTagCancelBtn]')
      .isNotDisabled();

    // test blank state
    await click('[data-test-fileDetailsSummary-addTagConfirmBtn]');

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.errorMsg, 't:fileTag.blankErrorMsg:()');

    await fillIn('[data-test-fileDetailsSummary-addTagInput]', 'testTag');

    await click('[data-test-fileDetailsSummary-addTagConfirmBtn]');

    if (fail) {
      assert
        .dom(`[data-test-fileDetailsSummary-fileTag='testTag']`)
        .doesNotExist();

      assert
        .dom('[data-test-fileDetailsSummary-addTagInput]')
        .isNotDisabled()
        .hasValue('testTag');

      assert
        .dom('[data-test-fileDetailsSummary-addTagConfirmBtn]')
        .isNotDisabled();

      assert
        .dom('[data-test-fileDetailsSummary-addTagCancelBtn]')
        .isNotDisabled();

      assert.dom('[data-test-fileDetailsSummary-addTagBtn]').doesNotExist();

      assert.strictEqual(notify.errorMsg, 'server error');
    } else {
      assert
        .dom(`[data-test-fileDetailsSummary-fileTag='testTag']`)
        .hasText('testTag');

      assert.dom('[data-test-fileDetailsSummary-addTagInput]').doesNotExist();

      assert
        .dom('[data-test-fileDetailsSummary-addTagConfirmBtn]')
        .doesNotExist();

      assert
        .dom('[data-test-fileDetailsSummary-addTagCancelBtn]')
        .doesNotExist();

      assert.dom('[data-test-fileDetailsSummary-addTagBtn]').exists();

      assert.strictEqual(notify.successMsg, 't:fileTag.addedSuccessMsg:()');
    }
  });

  test.each('test delete tag', [false, true], async function (assert, fail) {
    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.delete('/v2/files/:id/tags/:tagId', (schema, req) => {
      if (fail) {
        return new Response(500, {}, { errors: ['server error'] });
      }

      const file = schema.files.find(this.file.id);

      file.tags = file.tags.filter((t) => t.id !== req.params.tagId);
      file.save();

      return new Response(204);
    });

    await render(hbs`
        <FileDetails::SummaryOld @file={{this.file}} />
    `);

    assert
      .dom('[data-test-fileDetailsSummary-showMoreOrLessBtn]')
      .isNotDisabled()
      .hasText('t:showMore:()');

    await click('[data-test-fileDetailsSummary-showMoreOrLessBtn]');

    assert
      .dom('[data-test-fileDetailsSummary-fileTagTitle]')
      .hasText('t:tags:()');

    this.tags.forEach((tag) => {
      assert
        .dom(`[data-test-fileDetailsSummary-fileTag='${tag.name}']`)
        .hasText(tag.name);
    });

    assert
      .dom('[data-test-fileDetailsSummary-addTagBtn]')
      .isNotDisabled()
      .hasText('t:addTags:()');

    await click(
      find(
        `[data-test-fileDetailsSummary-fileTag='${this.tags[0].name}']`
      ).querySelector('[data-test-chip-delete-btn]')
    );

    const notify = this.owner.lookup('service:notifications');

    if (fail) {
      assert
        .dom(`[data-test-fileDetailsSummary-fileTag='${this.tags[0].name}']`)
        .exists();

      assert.ok(notify.errorMsg);
    } else {
      assert
        .dom(`[data-test-fileDetailsSummary-fileTag='${this.tags[0].name}']`)
        .doesNotExist();

      assert.strictEqual(notify.successMsg, 't:fileTag.deletedSuccessMsg:()');
    }
  });
});
