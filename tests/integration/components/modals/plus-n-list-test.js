import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | modals/plus-n-list', function (hooks) {
  setupRenderingTest(hooks);

  const emails = [];
  for (let i = 0; i <= 5; i++) {
    emails.push(`test+${i}@test.app`);
  }

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Modals::PlusNList />`);
    assert.dom('div[data-test="initial-container"]').exists();
  });

  test('it renders 1 default items', async function (assert) {
    const emails = [];
    for (let i = 0; i <= 5; i++) {
      emails.push(`test+${i}@test.app`);
    }
    this.set('emails', emails);
    await render(hbs`<Modals::PlusNList @list={{this.emails}}/>`);
    assert
      .dom('div[data-test="default-items"]')
      .hasText(this.emails.firstObject);
  });

  test('it renders 3 default items', async function (assert) {
    this.set('emails', emails);
    await render(
      hbs`<Modals::PlusNList @list={{this.emails}} @defaultCount=3/>`
    );
    const defaultEmails = this.emails.slice(0, 3).join(', ');
    assert.dom('div[data-test="default-items"]').hasText(defaultEmails);
  });

  test('it renders button with remaining count as +5', async function (assert) {
    this.set('emails', emails);
    await render(hbs`<Modals::PlusNList @list={{this.emails}}/>`);
    assert.dom('button[data-test="more-btn"]').hasText('+ 5');
  });

  test('it renders button with remaining count and suffix', async function (assert) {
    this.set('emails', emails);
    this.set('suffix', 'items');
    await render(
      hbs`<Modals::PlusNList @list={{this.emails}} @suffix={{this.suffix}}/>`
    );
    assert.dom('button[data-test="more-btn"]').hasText('+ 5 items');
  });

  test('it should not render remaining count button', async function (assert) {
    let emails = ['test+0@test.app'];
    this.set('emails', emails);
    await render(hbs`<Modals::PlusNList @list={{this.emails}}/>`);
    assert.dom('button[data-test="more-btn"]').doesNotExist();
  });

  test('it should open list with modal when clicking on remaining count btn', async function (assert) {
    this.set('emails', emails);
    await render(hbs`<Modals::PlusNList @list={{this.emails}}/>`);
    await click(this.element.querySelector('button[data-test="more-btn"]'));
    assert.dom('div[data-test="list-modal"]').exists();
  });

  test('it should show 6 items in the modal with seq', async function (assert) {
    this.set('emails', emails);
    await render(
      hbs`<Modals::PlusNList @list={{this.emails}} @isShowSeq={{true}}/>`
    );
    await click(this.element.querySelector('button[data-test="more-btn"]'));
    for (let i = 0; i <= 5; i++) {
      assert
        .dom(`div[data-test="list-item-${i}"]`)
        .hasText(`${i + 1}. test+${i}@test.app`);
    }
  });

  test('it should show 6 items in the modal without seq', async function (assert) {
    this.set('emails', emails);
    await render(hbs`<Modals::PlusNList @list={{this.emails}}/>`);
    await click(this.element.querySelector('button[data-test="more-btn"]'));
    for (let i = 0; i <= 5; i++) {
      assert
        .dom(`div[data-test="list-item-${i}"]`)
        .hasText(`test+${i}@test.app`);
    }
  });

  test('it renders empty when empty prop is sent', async function (assert) {
    const emails = [];
    this.set('emails', emails);
    await render(hbs`<Modals::PlusNList @list={{this.emails}}/>`);

    assert.dom('div[data-test="default-items"]').hasText('');
  });
});
