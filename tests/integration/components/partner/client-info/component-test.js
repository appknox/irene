import {
  module,
  test
} from 'qunit';
import {
  setupRenderingTest
} from 'ember-qunit';
import {
  render
} from '@ember/test-helpers';
import {
  hbs
} from 'ember-cli-htmlbars';
import {
  setupMirage
} from "ember-cli-mirage/test-support";
import {
  setupIntl
} from 'ember-intl/test-support';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import faker from 'faker';

module('Integration | Component | cards/client-info', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
    await this.owner.lookup('service:partner').load();
  });

  test('Client thumbnail', async function (assert) {
    const client = this.server.create('partnerclient');
    this.set('client', client);
    await render(hbs `<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('span[data-test-thumbnail] i').hasClass('fa-users')
  });

  test("Client has valid name", async function (assert) {
    const client = this.server.create('partnerclient');
    this.set('client', client);
    await render(hbs `<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-title]').hasText(this.client.name);
  });

  test("Client doesn't have name", async function (assert) {
    const client = this.server.create('partnerclient', {
      name: null
    });
    this.set('client', client);
    await render(hbs `<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-title]').hasText(`t:noName:()`);
    assert.dom('div[data-test-title]').hasStyle({
      "color": "rgb(66, 70, 81)",
      "font-size": "14px",
      "font-style": "italic"
    });
  });

  test('No uploads scenario', async function (assert) {
    const client = this.server.create('partnerclient');
    client.lastUploadedOn = null;
    this.set('client', client);
    await render(hbs `<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-last-upload]').hasText('t:noUploads:()')
  });

  test('Last uploaded date shown in relative time', async function (assert) {
    const client = this.server.create('partnerclient');
    this.set('client', client);
    dayjs.extend(relativeTime)
    await render(hbs `<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('div[data-test-last-upload-label]').hasText(`t:lastUpload:()`);
    assert.dom('div[data-test-last-upload]').hasText(dayjs(this.client.lastUploadedOn).fromNow())
  });

  test("2 owners for a client", async function (assert) {
    const client = this.server.create('partnerclient');
    this.set('client', client);
    await render(hbs `<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('span[data-test-first-owner]').hasText(this.client.ownerEmails[0]);
    assert.dom('button[data-test-owner-list-btn]').exists();
  });

  test("One owner for a client", async function (assert) {
    const client = this.server.create('partnerclient', {
      ownerEmails: [faker.internet.email()]
    });
    this.set('client', client);
    await render(hbs `<Partner::ClientInfo @client={{this.client}}/>`);
    assert.dom('span[data-test-first-owner]').hasText(this.client.ownerEmails[0]);
    assert.dom('button[data-test-owner-list-btn]').doesNotExist();
  })
});
