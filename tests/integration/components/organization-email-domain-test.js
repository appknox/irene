import {
  module,
  test
} from 'qunit';
import {
  setupRenderingTest
} from 'ember-qunit';
import tHelper from 'ember-intl/helpers/t';
import {
  render
} from '@ember/test-helpers';
import {
  hbs
} from 'ember-cli-htmlbars';
import {
  setupMirage
} from "ember-cli-mirage/test-support";

module('Integration | Component | organization-email-domain', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks)

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
    await this.owner.lookup('service:me');

    this.owner.lookup('service:intl').setLocale('en');
    this.owner.register('helper:t', tHelper);
  })

  test('Render', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    await render(hbs `<OrganizationEmailDomain />`);
    assert.equal(this.element.querySelector('p').textContent.trim(), 'Email domains which are allowed to invite and or register organization members', 'Sub description rendered');

  });

  test('Domain List', async function (assert) {
    this.server.createList('organization-email-domain', 5);
    await render(hbs `<OrganizationEmailDomain />`);
    assert.equal(this.element.querySelector('ul').childElementCount, 5, 'Five domains rendered')
  });

  test('Accessibility', async function (assert) {
    await render(hbs `<OrganizationEmailDomain />`);
    assert.ok(this.element.querySelector('ul#domain-input-list'), 'Domain input list enabled for owner')
  })
});
