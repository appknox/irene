import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import dayjs from 'dayjs';

module(
  'Integration | Component | partner/client-project-list/item',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    test('it should show project details', async function (assert) {
      this.set('project', this.server.create('partner/partnerclient-project'));

      await render(
        hbs`<Partner::ClientProjectList::Item @project={{this.project}}/>`
      );
      assert
        .dom(`[data-test-platform="${this.project.platformIcon}"]`)
        .exists();
      assert.dom(`[data-test-package_name]`).hasText(this.project.packageName);
      assert
        .dom(`[data-test-created_on]`)
        .hasText(new dayjs(this.project.createdOn).format('DD MMM YYYY'));

      assert.dom(`[data-test-view-files]`).doesNotExist();
    });

    test('it should android icon in the platform', async function (assert) {
      this.set(
        'project',
        this.server.create('partner/partnerclient-project', {
          platform: 'Android',
        })
      );

      await render(
        hbs`<Partner::ClientProjectList::Item @project={{this.project}}/>`
      );
      assert.dom(`[data-test-platform="android"]`).exists();
    });

    test('it should apple icon in the platform', async function (assert) {
      this.set(
        'project',
        this.server.create('partner/partnerclient-project', {
          platform: 'iOS',
        })
      );

      await render(
        hbs`<Partner::ClientProjectList::Item @project={{this.project}}/>`
      );
      assert.dom(`[data-test-platform="apple"]`).exists();
    });

    test('it should show view files btn', async function (assert) {
      this.set('enableViewFiles', true);
      this.set('clientId', 1);
      this.set('project', {
        id: 2,
      });
      await render(
        hbs`<Partner::ClientProjectList::Item
        @enableViewFiles={{this.enableViewFiles}}
        @clientId={{this.clientId}}
        @project={{this.project}}/>`
      );
      assert
        .dom(`[data-test-view-files]`)
        .exists()
        .hasText(`t:viewUploads:()`)
        .hasTagName('a');
    });

    test('it should not show view files btn', async function (assert) {
      this.set('enableViewFiles', true);
      await render(
        hbs`<Partner::ClientProjectList::Item
        @enableViewFiles={{this.enableViewFiles}} />`
      );
      assert.dom(`[data-test-view-files]`).doesNotExist();
    });
  }
);
