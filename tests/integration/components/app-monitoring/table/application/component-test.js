import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';

module(
  'Integration | Component | app-monitoring/table/application',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.file = this.server.create('file');

      this.project = this.server.create('project', {
        lastFile: this.file,
      });

      this.amApp = this.server.create('am-app', 1, {
        project: this.project,
      });
    });

    test('It renders with the right amApp names ', async function (assert) {
      await render(
        hbs`<AppMonitoring::Table::Application @amApp={{this.amApp}} />`
      );

      assert
        .dom(`[data-test-am-table-row-app-namespace]`)
        .containsText(this.amApp.project.packageName);

      assert
        .dom(`[data-test-am-table-row-app-name]`)
        .containsText(this.amApp.project.lastFile.name);
    });
  }
);
