import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | partner/client-project-detail',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders package name', async function (assert) {
      this.set('project', {
        id: '1',
        platformIcon: 'android',
        packageName: 'com.example.app',
      });
      await render(
        hbs`<Partner::ClientProjectDetail @project={{this.project}} />`
      );

      assert.equal(this.element.textContent.trim(), 'com.example.app');
    });
  }
);
