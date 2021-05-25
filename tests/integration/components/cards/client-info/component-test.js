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

module('Integration | Component | cards/client-info', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
    await this.owner.lookup('service:partner').load();
  });

  test('No uploads text should be shown', async function (assert) {
    const client = this.server.create('partnerclient');
    client.lastUploadedOn = null;
    this.set('client', client);
    await render(hbs `<Cards::ClientInfo @client={{this.client}}/>`);
    assert.dom('span[data-elem-last-uploaded]').hasText('t:noUploads:()')
  })

  test('Last uploaded date shown in relative time', async function (assert) {
    const client = this.server.create('partnerclient');
    this.server.create('partnerclient-plan');
    this.set('client', client);
    dayjs.extend(relativeTime)
    await render(hbs `<Cards::ClientInfo @client={{this.client}}/>`);
    assert.dom('span[data-elem-last-uploaded]').hasText(dayjs(this.client.lastUploadedOn).fromNow())
  })
});
