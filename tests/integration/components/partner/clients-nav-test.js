import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import styles from 'irene/components/partner/clients-nav/index.scss';

class RouterStub extends Service {
  currentRoute = {
    name: '',
  };
}

class PartnerStub extends Service {
  access = {};
}

module('Integration | Component | partner/clients-nav', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:router', RouterStub);
    this.owner.register('service:partner', PartnerStub);
  });

  test('it should render overview & invitations tabs always', async function (assert) {
    await render(hbs`<Partner::ClientsNav/>`);

    assert.dom('[data-test-clients-nav]').exists();

    assert.dom('[data-test-nav-tab="overview"]').exists();
    assert.dom('[data-test-nav-tab="invitations"]').exists();

    assert.dom('[data-test-nav-tab="overview"]').hasText('t:overview:()');
    assert.dom('[data-test-nav-tab="invitations"]').hasText('t:invitations:()');
  });

  test('it should not render registration requests tab if admin_registration privilege is false', async function (assert) {
    const partner = this.owner.lookup('service:partner');
    partner.access.admin_registration = false;

    await render(hbs`<Partner::ClientsNav/>`);
    assert.dom('[data-test-nav-tab="registration-requests"]').doesNotExist();
  });

  test('it should render registration requests tab if admin_registration privilege is true', async function (assert) {
    const partner = this.owner.lookup('service:partner');
    partner.access.admin_registration = true;

    await render(hbs`<Partner::ClientsNav/>`);
    assert.dom('[data-test-nav-tab="registration-requests"]').exists();
    assert
      .dom('[data-test-nav-tab="registration-requests"]')
      .hasText('t:registrationRequests:()');
  });

  test('it should activate tab of current route', async function (assert) {
    const router = this.owner.lookup('service:router');

    // current route: overview
    router.currentRoute.name = 'authenticated.partner.clients.overview';
    await render(hbs`<Partner::ClientsNav/>`);
    assert.dom('[data-test-nav-tab="overview"]').hasClass(styles['active']);

    // current route: invitations
    router.currentRoute.name = 'authenticated.partner.clients.invitations';
    await render(hbs`<Partner::ClientsNav/>`);
    assert.dom('[data-test-nav-tab="invitations"]').hasClass(styles['active']);

    // current route: registration-requests
    const partner = this.owner.lookup('service:partner');
    partner.access.admin_registration = true;
    router.currentRoute.name =
      'authenticated.partner.clients.registration-requests';
    await render(hbs`<Partner::ClientsNav/>`);
    assert
      .dom('[data-test-nav-tab="registration-requests"]')
      .hasClass(styles['active']);
  });
});
