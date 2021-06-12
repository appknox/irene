import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import dayjs from 'dayjs';

const noop = () => {};

module(
  'Integration | Component | partner/registration-request-pending',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    test('it renders email', async function (assert) {
      this.set('request', {
        id: '1',
        email: 'test1@test.test',
        data: {
          company: 'TestCompany',
          firstName: 'FirstName',
          lastName: 'LastName',
        },
        source: 'registration',
        approvalStatus: 'pending',
        isActivated: false,
        createdOn: '2020-05-22T15:08:18.008097Z',
        updatedOn: '2021-03-24T18:02:22.481033Z',
        validUntil: '2022-05-31T17:48:58.330920Z',
        moderatedBy: 1,
      });
      this.set('onApprove', noop);
      this.set('onReject', noop);
      await render(
        hbs`<Partner::RegistrationRequestPending @request={{this.request}} @onApprove={{this.onApprove}} @onReject={{this.onReject}} />`
      );
      assert.dom('[data-test-pending-request-email]').exists();
      assert
        .dom('[data-test-pending-request-email]')
        .hasText('test1@test.test');
    });

    test('it renders first name & last name if exists', async function (assert) {
      this.set('request', {
        id: '1',
        email: 'test1@test.test',
        data: {
          company: 'TestCompany',
          firstName: 'FirstName',
          lastName: 'LastName',
        },
        source: 'registration',
        approvalStatus: 'pending',
        isActivated: false,
        createdOn: '2020-05-22T15:08:18.008097Z',
        updatedOn: '2021-03-24T18:02:22.481033Z',
        validUntil: '2022-05-31T17:48:58.330920Z',
        moderatedBy: 1,
        get fullName() {
          return 'FirstName LastName';
        },
      });
      this.set('onApprove', noop);
      this.set('onReject', noop);
      await render(
        hbs`<Partner::RegistrationRequestPending @request={{this.request}} @onApprove={{this.onApprove}} @onReject={{this.onReject}} />`
      );
      assert.dom('[data-test-pending-request-name]').exists();
      assert
        .dom('[data-test-pending-request-name]')
        .hasText('FirstName LastName');
    });

    test('it supports full name if empty', async function (assert) {
      this.set('request', {
        id: '1',
        email: 'test1@test.test',
        data: {},
        source: 'registration',
        approvalStatus: 'pending',
        isActivated: false,
        createdOn: '2020-05-22T15:08:18.008097Z',
        updatedOn: '2021-03-24T18:02:22.481033Z',
        validUntil: '2022-05-31T17:48:58.330920Z',
        moderatedBy: 1,
        get fullName() {
          return '';
        },
      });
      this.set('onApprove', noop);
      this.set('onReject', noop);
      await render(
        hbs`<Partner::RegistrationRequestPending @request={{this.request}} @onApprove={{this.onApprove}} @onReject={{this.onReject}} />`
      );
      assert.dom('[data-test-pending-request-name]').exists();
      assert.dom('[data-test-pending-request-name]').hasText('');
    });

    test('it supports if only first name is provided', async function (assert) {
      this.set('request', {
        id: '1',
        email: 'test1@test.test',
        data: {
          first_name: 'FirstName',
        },
        source: 'registration',
        approvalStatus: 'pending',
        isActivated: false,
        createdOn: '2020-05-22T15:08:18.008097Z',
        updatedOn: '2021-03-24T18:02:22.481033Z',
        validUntil: '2022-05-31T17:48:58.330920Z',
        moderatedBy: 1,
        get fullName() {
          return 'FirstName';
        },
      });
      this.set('onApprove', noop);
      this.set('onReject', noop);
      await render(
        hbs`<Partner::RegistrationRequestPending @request={{this.request}} @onApprove={{this.onApprove}} @onReject={{this.onReject}} />`
      );
      assert.dom('[data-test-pending-request-name]').exists();
      assert.dom('[data-test-pending-request-name]').hasText('FirstName');
    });

    test('it renders company name', async function (assert) {
      this.set('request', {
        id: '1',
        email: 'test1@test.test',
        data: {
          company: 'TestCompany',
        },
        source: 'registration',
        approvalStatus: 'pending',
        isActivated: false,
        createdOn: '2020-05-22T15:08:18.008097Z',
        updatedOn: '2021-03-24T18:02:22.481033Z',
        validUntil: '2022-05-31T17:48:58.330920Z',
        moderatedBy: 1,
      });
      this.set('onApprove', noop);
      this.set('onReject', noop);
      await render(
        hbs`<Partner::RegistrationRequestPending @request={{this.request}} @onApprove={{this.onApprove}} @onReject={{this.onReject}} />`
      );
      assert.dom('[data-test-pending-request-company]').exists();
      assert.dom('[data-test-pending-request-company]').hasText('TestCompany');
    });

    test('it supports empty company name', async function (assert) {
      this.set('request', {
        id: '1',
        email: 'test1@test.test',
        data: {},
        source: 'registration',
        approvalStatus: 'pending',
        isActivated: false,
        createdOn: '2020-05-22T15:08:18.008097Z',
        updatedOn: '2021-03-24T18:02:22.481033Z',
        validUntil: '2022-05-31T17:48:58.330920Z',
        moderatedBy: 1,
      });
      this.set('onApprove', noop);
      this.set('onReject', noop);
      await render(
        hbs`<Partner::RegistrationRequestPending @request={{this.request}} @onApprove={{this.onApprove}} @onReject={{this.onReject}} />`
      );
      assert.dom('[data-test-pending-request-company]').exists();
      assert.dom('[data-test-pending-request-company]').hasText('');
    });

    test('it renders relative time for created on date', async function (assert) {
      const createdOn = new dayjs('2020-05-22T03:08:18.008097Z');
      this.set('request', {
        id: '1',
        email: 'test1@test.test',
        data: {},
        source: 'registration',
        approvalStatus: 'pending',
        isActivated: false,
        createdOn: createdOn.toISOString(),
        updatedOn: '2021-03-24T18:02:22.481033Z',
        validUntil: '2022-05-31T17:48:58.330920Z',
        moderatedBy: 1,
      });
      this.set('onApprove', noop);
      this.set('onReject', noop);
      await render(
        hbs`<Partner::RegistrationRequestPending @request={{this.request}} @onApprove={{this.onApprove}} @onReject={{this.onReject}} />`
      );
      assert.dom('[data-test-pending-request-createdon]').exists();

      const createdOnElem = this.element.querySelector(
        '[data-test-pending-request-createdon]'
      );
      assert.equal(
        createdOnElem.title,
        createdOn.format('DD MMM YYYY HH:mm A')
      );
    });

    test('it renders absolute time as title for created on relative date', async function (assert) {
      const createdOn = new dayjs('2020-05-22T03:08:18.008097Z');
      this.set('request', {
        id: '1',
        email: 'test1@test.test',
        data: {},
        source: 'registration',
        approvalStatus: 'pending',
        isActivated: false,
        createdOn: createdOn.toISOString(),
        updatedOn: '2021-03-24T18:02:22.481033Z',
        validUntil: '2022-05-31T17:48:58.330920Z',
        moderatedBy: 1,
      });
      this.set('onApprove', noop);
      this.set('onReject', noop);
      await render(
        hbs`<Partner::RegistrationRequestPending @request={{this.request}} @onApprove={{this.onApprove}} @onReject={{this.onReject}} />`
      );
      assert.dom('[data-test-pending-request-createdon]').exists();

      const createdOnElem = this.element.querySelector(
        '[data-test-pending-request-createdon]'
      );
      assert.dom('[data-test-pending-request-createdon]').hasAttribute('title');
      assert.equal(
        createdOnElem.title,
        createdOn.format('DD MMM YYYY HH:mm A')
      );
    });

    test('it renders invite button as success btn with title send invite email', async function (assert) {
      this.set('request', {
        id: '1',
        email: 'test1@test.test',
        data: {},
        source: 'registration',
        approvalStatus: 'pending',
        isActivated: false,
        createdOn: '2020-05-22T03:08:18.008097Z',
        updatedOn: '2021-03-24T18:02:22.481033Z',
        validUntil: '2022-05-31T17:48:58.330920Z',
        moderatedBy: 1,
      });
      this.set('onApprove', noop);
      this.set('onReject', noop);
      await render(
        hbs`<Partner::RegistrationRequestPending @request={{this.request}} @onApprove={{this.onApprove}} @onReject={{this.onReject}} />`
      );
      assert.dom('[data-test-pending-request-approve-button]').exists();

      const btn = this.element.querySelector(
        '[data-test-pending-request-approve-button]'
      );
      assert
        .dom('[data-test-pending-request-approve-button]')
        .hasClass('is-success');
      assert
        .dom('[data-test-pending-request-approve-button]')
        .hasAttribute('title');
      assert.equal(btn.title, 'Send invitation');
    });

    test('it renders reject button as primary btn with title reject request', async function (assert) {
      this.set('request', {
        id: '1',
        email: 'test1@test.test',
        data: {},
        source: 'registration',
        approvalStatus: 'pending',
        isActivated: false,
        createdOn: '2020-05-22T03:08:18.008097Z',
        updatedOn: '2021-03-24T18:02:22.481033Z',
        validUntil: '2022-05-31T17:48:58.330920Z',
        moderatedBy: 1,
      });
      this.set('onApprove', noop);
      this.set('onReject', noop);
      await render(
        hbs`<Partner::RegistrationRequestPending @request={{this.request}} @onApprove={{this.onApprove}} @onReject={{this.onReject}} />`
      );
      assert.dom('[data-test-pending-request-reject-button]').exists();

      const btn = this.element.querySelector(
        '[data-test-pending-request-reject-button]'
      );
      assert
        .dom('[data-test-pending-request-reject-button]')
        .hasClass('is-primary');
      assert
        .dom('[data-test-pending-request-reject-button]')
        .hasAttribute('title');
      assert.equal(btn.title, 'Reject request');
    });
  }
);
