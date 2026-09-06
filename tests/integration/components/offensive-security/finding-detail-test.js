import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  error(msg) {
    this.errorMsg = msg;
  }
  success() {}
}

class RouterStub extends Service {
  lastRoute = null;
  lastModels = [];

  transitionTo(route, ...models) {
    this.lastRoute = route;
    this.lastModels = models;
  }
}

module(
  'Integration | Component | offensive-security/finding-detail',
  (hooks) => {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);
    });

    test('it renders the finding detail page and hero card', async function (assert) {
      this.server.create('offsec-scan', {
        id: '9',
        app_name: 'Netflix',
      });

      const finding = this.server.create('offsec-finding', {
        signature_id: 'root-build-props',
        name: 'Build tags and system properties',
        category: 'resilience',
        check_type: 'root_detection',
        outcome: 'bypassed',
        score: 14,
        band: 'weak',
        rationale: 'Defeated at runtime. Build.TAGS returns release-keys.',
      });

      this.set('scanId', '9');
      this.set('findingId', String(finding.id));

      await render(hbs`
      <OffensiveSecurity::FindingDetail
        @scanId={{this.scanId}}
        @findingId={{this.findingId}}
      />
    `);

      assert
        .dom('[aria-label="Breadcrumb"]')
        .includesText('Offensive Security Runs');
      assert.dom('[aria-label="Breadcrumb"]').includesText('Netflix');
      assert
        .dom('[aria-label="Breadcrumb"]')
        .includesText('Build tags and system properties');
      assert.dom('[aria-label="Breadcrumb"]').includesText('/');
      assert.dom(this.element).includesText('root-build-props');
      assert.dom(this.element).includesText('Build tags and system properties');
      assert.dom(this.element).includesText('Bypassed');
      assert.dom(this.element).includesText('14');
      assert.dom(this.element).includesText('WEAK RESILIENCE');
      assert.dom(this.element).includesText('Working exploit');
      assert.dom(this.element).includesText('Evidence');
      assert.dom(this.element).includesText('Impact');
      assert.dom(this.element).includesText('Business risk');
    });

    test('view details button is commented out for now', async function (assert) {
      const finding = this.server.create('offsec-finding', {
        signature_id: 'debug_settings_probe',
        name: 'Developer-options detection',
        outcome: 'bypassed',
        score: 14,
        band: 'weak',
      });

      this.set('scanId', '9');
      this.set('findingId', String(finding.id));

      await render(hbs`
      <OffensiveSecurity::FindingDetail
        @scanId={{this.scanId}}
        @findingId={{this.findingId}}
      />
    `);

      const viewDetailsBtn = this.element.querySelector(
        'button[aria-haspopup="dialog"]'
      );
      assert.notOk(
        viewDetailsBtn,
        'View details button is currently commented out'
      );
    });

    test('breadcrumb links navigate to home and back to scan', async function (assert) {
      this.server.create('offsec-scan', {
        id: '42',
        app_name: 'Netflix',
      });

      const finding = this.server.create('offsec-finding', {
        signature_id: 'root-build-props',
        name: 'Build tags',
        category: 'resilience',
        check_type: 'root_detection',
      });

      this.set('scanId', '42');
      this.set('findingId', String(finding.id));

      await render(hbs`
      <OffensiveSecurity::FindingDetail
        @scanId={{this.scanId}}
        @findingId={{this.findingId}}
      />
    `);

      const router = this.owner.lookup('service:router');

      const homeBtn = this.element.querySelector(
        '[data-test-finding-breadcrumb-home]'
      );
      assert.ok(homeBtn, 'Home breadcrumb button is present');
      await click(homeBtn);
      assert.strictEqual(
        router.lastRoute,
        'authenticated.dashboard.offensive-security.index',
        'transitions to offensive security runs home'
      );

      const crumbBtn = this.element.querySelector(
        '[data-test-finding-breadcrumb-link]'
      );
      assert.ok(crumbBtn, 'Breadcrumb button is present');

      await click(crumbBtn);
      assert.strictEqual(
        router.lastRoute,
        'authenticated.dashboard.offensive-security.scan',
        'transitions back to scan'
      );
      assert.deepEqual(router.lastModels, ['42'], 'passes scanId');
    });

    test('it uses frida_script, impact, and business_risk from API when present', async function (assert) {
      const findingWithData = this.server.create('offsec-finding', {
        signature_id: 'custom-probe',
        name: 'Custom Detection Check',
        outcome: 'bypassed',
        score: 20,
        band: 'weak',
        frida_script: 'console.log("custom frida script from API");',
        impact: {
          summary: 'Custom technical impact from API.',
          points: ['Custom impact bullet 1', 'Custom impact bullet 2'],
          mitre_attack: {
            code: 'T1999',
            name: 'Custom ATT&CK Tech',
          },
        },
        business_risk: {
          summary: 'Custom business risk summary from API.',
          points: ['Custom business risk bullet 1'],
        },
      });

      this.set('scanId', '10');
      this.set('findingId', String(findingWithData.id));

      await render(hbs`
      <OffensiveSecurity::FindingDetail
        @scanId={{this.scanId}}
        @findingId={{this.findingId}}
      />
    `);

      assert.dom(this.element).includesText('custom frida script from API');
      assert
        .dom(this.element)
        .includesText('Custom technical impact from API.');
      assert.dom(this.element).includesText('Custom impact bullet 1');
      assert.dom(this.element).includesText('Custom impact bullet 2');
      assert.dom(this.element).includesText('T1999');
      assert.dom(this.element).includesText('Custom ATT&CK Tech');
      assert
        .dom(this.element)
        .includesText('Custom business risk summary from API.');
      assert.dom(this.element).includesText('Custom business risk bullet 1');
    });

    test('it falls back to signature-tailored frida script and default impact/risk when API values are null or empty', async function (assert) {
      const findingEmpty = this.server.create('offsec-finding', {
        signature_id: 'root-build-props',
        name: 'Build tags',
        frida_script: '',
        impact: null,
        business_risk: '',
      });

      this.set('scanId', '10');
      this.set('findingId', String(findingEmpty.id));

      await render(hbs`
      <OffensiveSecurity::FindingDetail
        @scanId={{this.scanId}}
        @findingId={{this.findingId}}
      />
    `);

      assert
        .dom(this.element)
        .includesText('root-build-props probe neutralized');
      assert
        .dom(this.element)
        .includesText('This control exists to stop the app from running');
      assert
        .dom(this.element)
        .includesText('Trace and tamper with live internals');
      assert
        .dom(this.element)
        .includesText('Instrumentation-based reverse engineering');
    });

    test('it renders Exploit attached only when exploit evidence or script is attached', async function (assert) {
      const findingWithExploit = this.server.create('offsec-finding', {
        signature_id: 'root-build-props',
        name: 'Build tags',
        frida_script: 'Java.perform(function() {});',
      });

      this.set('scanId', '11');
      this.set('findingId', String(findingWithExploit.id));

      await render(hbs`
      <OffensiveSecurity::FindingDetail
        @scanId={{this.scanId}}
        @findingId={{this.findingId}}
      />
    `);

      assert.dom(this.element).includesText('Exploit attached');
    });

    test('it does not render Exploit attached when no exploit evidence or script is attached', async function (assert) {
      const findingWithoutExploit = this.server.create('offsec-finding', {
        signature_id: 'root-build-props',
        name: 'Build tags',
        frida_script: null,
        evidence: [],
        detail: {
          attempts: [],
        },
      });

      this.set('scanId', '11');
      this.set('findingId', String(findingWithoutExploit.id));

      await render(hbs`
      <OffensiveSecurity::FindingDetail
        @scanId={{this.scanId}}
        @findingId={{this.findingId}}
      />
    `);

      assert.dom(this.element).doesNotIncludeText('Exploit attached');
    });

    test('it renders execution attempts and supports re-visiting cached finding', async function (assert) {
      const finding = this.server.create('offsec-finding', {
        signature_id: 'native-libc-exec',
        name: 'Native libc path/exec probes',
        category: 'root_detection',
        check_type: 'root_detection',
        outcome: 'bypassed',
        score: 12,
        band: 'weak',
        detail: {
          attempts: [
            {
              attempt_no: 1,
              state: 'failed',
              technique_id: 'probe_01',
              evidence: ['Attempt 1 failed probe'],
            },
            {
              attempt_no: 2,
              state: 'verified_effective',
              technique_id: 'libc_hook',
              evidence: ['Hooked execve successfully', 'Neutralized /system/bin/su check'],
              verifier_ids: 'V1, V2',
            },
          ],
        },
      });

      this.set('scanId', '9');
      this.set('findingId', String(finding.id));

      // First render (uncached / fresh fetch)
      await render(hbs`
      <OffensiveSecurity::FindingDetail
        @scanId={{this.scanId}}
        @findingId={{this.findingId}}
      />
    `);

      assert.dom(this.element).includesText('Native libc path/exec probes');
      assert.dom(this.element).includesText('Execution attempts');
      assert.dom(this.element).includesText('Attempt #2');
      assert.dom(this.element).includesText('Hooked execve successfully');

      // Second render (simulates visiting an already-visited finding from cache)
      await render(hbs`
      <OffensiveSecurity::FindingDetail
        @scanId={{this.scanId}}
        @findingId={{this.findingId}}
      />
    `);

      assert.dom(this.element).includesText('Native libc path/exec probes');
      assert.dom(this.element).includesText('Execution attempts');
    });
  }
);
