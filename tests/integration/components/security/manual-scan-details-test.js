import Service from '@ember/service';
import {
  click,
  fillIn,
  find,
  findAll,
  render,
  triggerEvent,
  triggerKeyEvent,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { Response } from 'miragejs';

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

const SAVE_BTN = '[data-test-securityManualScanDetails-saveBtn]';
const NAME_INPUT = '[data-test-securityManualScanDetailsNameList-input]';
const NAME_ADD_BTN = '[data-test-securityManualScanDetailsNameList-addBtn]';
const TEXT_AREA = '[data-test-securityManualScanDetailsTextArea-input]';
const HELPER_TEXT = '[data-test-securityManualScanDetailsTextArea-helperText]';

const field = (name, inner) =>
  `[data-test-securityManualScanDetails-${name}] ${inner}`;

const EMPTY_DETAIL = {
  testers: [],
  reviewers: [],
  covered_scope: '',
  exempted_scope: '',
  covered_api_endpoints: [],
  exempted_api_endpoints: [],
};

module(
  'Integration | Component | security/manual-scan-details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);

      this.notify = this.owner.lookup('service:notifications');
      this.store = this.owner.lookup('service:store');

      this.pushDetail = (attrs = {}) => {
        const detail = this.server.create('security/manual-scan-detail', {
          id: 1,
          testers: ['Asha Rao'],
          reviewers: ['Chitra Nair'],
          covered_scope: 'Login flow',
          exempted_scope: 'Admin console',
          covered_api_endpoints: ['/api/login', '/api/pay'],
          exempted_api_endpoints: ['/api/admin'],
          ...attrs,
        });

        this.set(
          'detail',
          this.store.push(
            this.store.normalize('security/manual-scan-detail', detail.toJSON())
          )
        );
      };

      this.renderForm = () =>
        render(hbs`<Security::ManualScanDetails @detail={{this.detail}} />`);

      // The form inside a box of a set width.
      this.renderFormAt = (width) => {
        this.set('probeWidth', `${width}px`);

        return render(hbs`
          <div {{style width=this.probeWidth}}>
            <Security::ManualScanDetails @detail={{this.detail}} />
          </div>
        `);
      };
    });

    test('it renders the saved details', async function (assert) {
      this.pushDetail();

      await this.renderForm();

      assert
        .dom('[data-test-securityManualScanDetails-title]')
        .hasText(t('securityManualScanDetails.title'));

      assert
        .dom(
          field(
            'testers',
            "[data-test-securityManualScanDetailsNameList-name='Asha Rao']"
          )
        )
        .exists();

      assert
        .dom(
          field(
            'reviewers',
            "[data-test-securityManualScanDetailsNameList-name='Chitra Nair']"
          )
        )
        .exists();

      assert.dom(field('coveredScope', TEXT_AREA)).hasValue('Login flow');
      assert.dom(field('exemptedScope', TEXT_AREA)).hasValue('Admin console');

      assert
        .dom(field('coveredApiEndpoints', TEXT_AREA))
        .hasValue('/api/login\n/api/pay');

      assert
        .dom(field('coveredApiEndpoints', HELPER_TEXT))
        .containsText(t('securityManualScanDetails.endpointsHelper'))
        .containsText('2 endpoints');

      assert.dom(SAVE_BTN).isDisabled();
    });

    test('it renders empty fields for a file with no details', async function (assert) {
      this.pushDetail(EMPTY_DETAIL);

      await this.renderForm();

      assert
        .dom(
          field('testers', '[data-test-securityManualScanDetailsNameList-name]')
        )
        .doesNotExist();

      assert.dom(field('coveredScope', TEXT_AREA)).hasValue('');

      assert
        .dom(field('coveredApiEndpoints', HELPER_TEXT))
        .containsText('No endpoints');
    });

    test('it adds names with Enter or the button, once, and removes them', async function (assert) {
      this.pushDetail(EMPTY_DETAIL);

      await this.renderForm();

      const input = field('testers', NAME_INPUT);
      const chips = field(
        'testers',
        '[data-test-securityManualScanDetailsNameList-name]'
      );

      assert.dom(field('testers', NAME_ADD_BTN)).isDisabled('blank name');

      await fillIn(input, '  Asha Rao  ');
      await triggerKeyEvent(input, 'keydown', 'Enter');

      assert.strictEqual(findAll(chips).length, 1);
      assert.dom(chips).hasText('Asha Rao');
      assert.dom(input).hasValue('', 'input is cleared after adding');

      await fillIn(input, 'Asha Rao');
      await click(field('testers', NAME_ADD_BTN));

      assert.strictEqual(
        findAll(chips).length,
        1,
        'same name is not added twice'
      );

      await fillIn(input, 'ASHA rao');
      await click(field('testers', NAME_ADD_BTN));

      assert.strictEqual(
        findAll(chips).length,
        1,
        'same name in a different case is not added twice'
      );

      await fillIn(input, 'Ben Cho');
      await click(field('testers', NAME_ADD_BTN));

      assert.strictEqual(findAll(chips).length, 2);
      assert.dom(SAVE_BTN).isNotDisabled();

      await click(find(`${chips} [data-test-chip-delete-btn]`));

      assert.strictEqual(findAll(chips).length, 1);
      assert.dom(chips).hasText('Ben Cho');
    });

    test('it stops accepting names at the limit', async function (assert) {
      this.pushDetail({
        ...EMPTY_DETAIL,
        testers: Array.from({ length: 19 }, (_, i) => `Tester ${i}`),
      });

      await this.renderForm();

      await fillIn(field('testers', NAME_INPUT), 'Last Tester');
      await click(field('testers', NAME_ADD_BTN));

      assert
        .dom(
          field(
            'testers',
            '[data-test-securityManualScanDetailsNameList-limit]'
          )
        )
        .hasText(t('securityManualScanDetails.maxNames', { max: 20 }));

      assert.dom(field('testers', NAME_INPUT)).isDisabled();
      assert.dom(field('testers', NAME_ADD_BTN)).isDisabled();
    });

    test('it counts endpoints from the lines typed, ignoring blanks and repeats', async function (assert) {
      this.pushDetail(EMPTY_DETAIL);

      await this.renderForm();

      await fillIn(
        field('exemptedApiEndpoints', TEXT_AREA),
        '/a\n\n  /b  \n/a\n'
      );

      assert
        .dom(field('exemptedApiEndpoints', HELPER_TEXT))
        .containsText('2 endpoints');
    });

    test('it saves what was entered and reflects the server result', async function (assert) {
      this.pushDetail(EMPTY_DETAIL);

      let body = null;

      this.server.put(
        '/hudson-api/files/:id/manual_scan_details',
        (schema, req) => {
          body = JSON.parse(req.requestBody);

          return { id: req.params.id, ...body };
        }
      );

      await this.renderForm();

      await fillIn(field('testers', NAME_INPUT), 'Asha Rao');
      await click(field('testers', NAME_ADD_BTN));
      await fillIn(field('reviewers', NAME_INPUT), 'Chitra Nair');
      await click(field('reviewers', NAME_ADD_BTN));
      await fillIn(field('coveredScope', TEXT_AREA), '  Login flow  ');
      await fillIn(field('exemptedScope', TEXT_AREA), 'Admin console');
      await fillIn(
        field('coveredApiEndpoints', TEXT_AREA),
        '/api/login\n\n /api/pay \n/api/login'
      );
      await fillIn(field('exemptedApiEndpoints', TEXT_AREA), '/api/admin');

      await click(SAVE_BTN);

      assert.deepEqual(
        {
          testers: body.testers,
          reviewers: body.reviewers,
          covered_scope: body.covered_scope,
          exempted_scope: body.exempted_scope,
          covered_api_endpoints: body.covered_api_endpoints,
          exempted_api_endpoints: body.exempted_api_endpoints,
        },
        {
          testers: ['Asha Rao'],
          reviewers: ['Chitra Nair'],
          covered_scope: 'Login flow',
          exempted_scope: 'Admin console',
          covered_api_endpoints: ['/api/login', '/api/pay'],
          exempted_api_endpoints: ['/api/admin'],
        },
        'sends trimmed, deduplicated values'
      );

      assert.strictEqual(
        this.notify.successMsg,
        t('securityManualScanDetails.savedSuccessfully')
      );

      assert.dom(SAVE_BTN).isDisabled('nothing left to save');
    });

    test('it keeps what was typed when saving fails', async function (assert) {
      this.pushDetail(EMPTY_DETAIL);

      this.server.put(
        '/hudson-api/files/:id/manual_scan_details',
        () => new Response(400, {}, { testers: ['Too many names.'] })
      );

      await this.renderForm();

      await fillIn(field('coveredScope', TEXT_AREA), 'Login flow');
      await click(SAVE_BTN);

      assert.ok(this.notify.errorMsg, 'shows the failure');
      assert.strictEqual(this.notify.successMsg, null);
      assert.dom(field('coveredScope', TEXT_AREA)).hasValue('Login flow');
      assert.dom(SAVE_BTN).isNotDisabled('can retry');
    });
    test('it has no required markers: every field is optional', async function (assert) {
      this.pushDetail(EMPTY_DETAIL);

      await this.renderForm();

      assert
        .dom('[data-test-securityManualScanDetails-container]')
        .doesNotContainText('*');
    });

    test('it enables Save as soon as any one field is edited, added to or cleared', async function (assert) {
      const edits = {
        testers: async () => {
          await fillIn(field('testers', NAME_INPUT), 'New Tester');
          await click(field('testers', NAME_ADD_BTN));
        },
        reviewers: async () => {
          await click(
            find(
              field(
                'reviewers',
                '[data-test-securityManualScanDetailsNameList-name] [data-test-chip-delete-btn]'
              )
            )
          );
        },
        coveredScope: () => fillIn(field('coveredScope', TEXT_AREA), 'Changed'),
        exemptedScope: () => fillIn(field('exemptedScope', TEXT_AREA), ''),
        coveredApiEndpoints: () =>
          fillIn(field('coveredApiEndpoints', TEXT_AREA), '/api/login'),
        exemptedApiEndpoints: () =>
          fillIn(field('exemptedApiEndpoints', TEXT_AREA), ''),
      };

      for (const [name, edit] of Object.entries(edits)) {
        this.pushDetail();

        await this.renderForm();

        assert.dom(SAVE_BTN).isDisabled(`${name}: nothing to save yet`);

        await edit();

        assert.dom(SAVE_BTN).isNotDisabled(`${name}: enabled by the edit`);
      }
    });

    test('it saves a field that was only added, with the others left empty', async function (assert) {
      this.pushDetail(EMPTY_DETAIL);

      let body = null;

      this.server.put(
        '/hudson-api/files/:id/manual_scan_details',
        (schema, req) => {
          body = JSON.parse(req.requestBody);

          return { id: req.params.id, ...body };
        }
      );

      await this.renderForm();
      await fillIn(field('exemptedScope', TEXT_AREA), 'Admin console');
      await click(SAVE_BTN);

      assert.strictEqual(body.exempted_scope, 'Admin console');
      assert.deepEqual(body.testers, []);
      assert.strictEqual(body.covered_scope, '');
      assert.deepEqual(body.covered_api_endpoints, []);
      assert.strictEqual(
        this.notify.successMsg,
        t('securityManualScanDetails.savedSuccessfully')
      );
    });

    test('it saves when every field has been cleared', async function (assert) {
      this.pushDetail();

      let body = null;

      this.server.put(
        '/hudson-api/files/:id/manual_scan_details',
        (schema, req) => {
          body = JSON.parse(req.requestBody);

          return { id: req.params.id, ...body };
        }
      );

      await this.renderForm();

      for (const name of ['testers', 'reviewers']) {
        await click(
          find(
            field(
              name,
              '[data-test-securityManualScanDetailsNameList-name] [data-test-chip-delete-btn]'
            )
          )
        );
      }

      for (const name of [
        'coveredScope',
        'exemptedScope',
        'coveredApiEndpoints',
        'exemptedApiEndpoints',
      ]) {
        await fillIn(field(name, TEXT_AREA), '');
      }

      await click(SAVE_BTN);

      assert.deepEqual(body, {
        testers: [],
        reviewers: [],
        covered_scope: '',
        exempted_scope: '',
        covered_api_endpoints: [],
        exempted_api_endpoints: [],
      });

      assert.dom(SAVE_BTN).isDisabled('nothing left to save');
    });
    module('long names', function () {
      const CHIP = '[data-test-securityManualScanDetailsNameList-name]';
      const LONG_NAME = 'A'.repeat(100);

      const rect = (el) => el.getBoundingClientRect();

      const isInside = (inner, outer) =>
        rect(inner).left >= rect(outer).left - 1 &&
        rect(inner).right <= rect(outer).right + 1;

      for (const width of [1200, 700, 360]) {
        test(`it keeps a 100-character name inside its column at ${width}px, cut with an ellipsis`, async function (assert) {
          this.pushDetail({ ...EMPTY_DETAIL, testers: [LONG_NAME] });

          await this.renderFormAt(width);

          const column = find('[data-test-securityManualScanDetails-testers]');
          const chip = find(field('testers', CHIP));
          const label = chip.querySelector(':scope > span');

          assert.true(isInside(chip, column), 'the chip stays in its column');

          assert.true(
            isInside(chip.querySelector('[data-test-chip-delete-btn]'), column),
            'its delete button stays reachable'
          );

          assert.true(label.scrollWidth > label.clientWidth, 'the name is cut');
          assert.strictEqual(getComputedStyle(label).textOverflow, 'ellipsis');
        });
      }

      test('it shows the full name in a tooltip for a long name', async function (assert) {
        this.pushDetail({ ...EMPTY_DETAIL, testers: [LONG_NAME] });

        await this.renderFormAt(360);

        await triggerEvent(
          find(field('testers', CHIP)).closest('[data-test-ak-tooltip-root]'),
          'mouseenter'
        );

        assert.dom('[data-test-ak-tooltip-content]').hasText(LONG_NAME);
      });

      test('it adds no tooltip for a short name, and does not cut it', async function (assert) {
        this.pushDetail({ ...EMPTY_DETAIL, testers: ['Asha Rao'] });

        await this.renderFormAt(360);

        const chip = find(field('testers', CHIP));
        const label = chip.querySelector(':scope > span');

        await triggerEvent(
          chip.closest('[data-test-ak-tooltip-root]'),
          'mouseenter'
        );

        assert.dom('[data-test-ak-tooltip-content]').doesNotExist();
        assert.true(label.scrollWidth <= label.clientWidth, 'not cut');
      });

      test('it wraps 20 long names onto more lines without widening the form', async function (assert) {
        this.pushDetail({
          ...EMPTY_DETAIL,
          testers: Array.from(
            { length: 20 },
            (_, i) => `${i}${'B'.repeat(99)}`
          ),
        });

        await this.renderFormAt(360);

        const form = find('[data-test-securityManualScanDetails-container]');
        const column = find('[data-test-securityManualScanDetails-testers]');
        const chips = findAll(field('testers', CHIP));

        assert.strictEqual(chips.length, 20);
        assert.true(
          chips.every((chip) => isInside(chip, column)),
          'all inside'
        );
        assert.true(
          form.scrollWidth <= form.clientWidth + 1,
          'no sideways scroll'
        );
      });

      test('it does not push the neighbouring column aside when a name is long', async function (assert) {
        this.pushDetail({ ...EMPTY_DETAIL, testers: [LONG_NAME] });

        await this.renderFormAt(1200);

        const testers = find('[data-test-securityManualScanDetails-testers]');
        const reviewers = find(
          '[data-test-securityManualScanDetails-reviewers]'
        );

        assert.true(
          rect(testers).right <= rect(reviewers).left + 1,
          'the Testers column ends before the Reviewers column starts'
        );
      });
    });
  }
);
