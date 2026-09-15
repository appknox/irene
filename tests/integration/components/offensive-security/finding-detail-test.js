import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  error(msg) {
    this.errorMsg = msg;
  }

  success() {
    // Mock success notification for tests
  }
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

      assert.dom(this.element).includesText('root-build-props');
      assert.dom(this.element).includesText('Build tags and system properties');
      assert.dom(this.element).includesText('Bypassed');
      assert.dom(this.element).includesText('14');
      assert.dom(this.element).includesText('WEAK RESILIENCE');
      assert.dom(this.element).includesText('Evidence');
    });

    test('the hero pill reads Untriggered for a detected but not-attempted finding', async function (assert) {
      const finding = this.server.create('offsec-finding', {
        signature_id: 'frida-port-scan',
        name: 'Frida port scan',
        category: 'resilience',
        check_type: 'frida_detection',
        outcome: 'not_attempted',
        detected: true,
        triggered: false,
      });

      this.set('scanId', '9');
      this.set('findingId', String(finding.id));

      await render(hbs`
        <OffensiveSecurity::FindingDetail
          @scanId={{this.scanId}}
          @findingId={{this.findingId}}
        />
      `);

      assert.dom(this.element).includesText('Untriggered');
      // The raw outcome token must not leak into the hero.
      assert.dom(this.element).doesNotIncludeText('not_attempted');
    });

    test('the hero pill reads Triggered when the check fired at runtime', async function (assert) {
      const finding = this.server.create('offsec-finding', {
        signature_id: 'root-package-query',
        name: 'Superuser package-manager query',
        category: 'resilience',
        check_type: 'root_detection',
        outcome: 'not_attempted',
        detected: true,
        triggered: true,
      });

      this.set('scanId', '9');
      this.set('findingId', String(finding.id));

      await render(hbs`
        <OffensiveSecurity::FindingDetail
          @scanId={{this.scanId}}
          @findingId={{this.findingId}}
        />
      `);

      assert.dom(this.element).includesText('Triggered');
      assert.dom(this.element).doesNotIncludeText('Untriggered');
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

    test('it does not render Working exploit, Impact, or Business risk when API values are missing or empty', async function (assert) {
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

      assert.dom(this.element).doesNotIncludeText('Working exploit');
      assert.dom(this.element).doesNotIncludeText('Impact');
      assert.dom(this.element).doesNotIncludeText('Business risk');
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

    test('it omits execution attempts card and supports re-visiting cached finding', async function (assert) {
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
              evidence: [
                'Hooked execve successfully',
                'Neutralized /system/bin/su check',
              ],
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
      assert.dom(this.element).doesNotIncludeText('Execution attempts');
      assert.dom(this.element).doesNotIncludeText('Attempt #2');

      // Second render (simulates visiting an already-visited finding from cache)
      await render(hbs`
      <OffensiveSecurity::FindingDetail
        @scanId={{this.scanId}}
        @findingId={{this.findingId}}
      />
    `);

      assert.dom(this.element).includesText('Native libc path/exec probes');
      assert.dom(this.element).doesNotIncludeText('Execution attempts');
    });

    test('it renders the detection backtrace as evidence of presence', async function (assert) {
      const finding = this.server.create('offsec-finding', {
        signature_id: 'root-file-probe',
        name: 'Root artifact file probe',
        outcome: 'bypassed',
        detail: {
          detection_backtrace: [
            {
              kind: 'file-exists',
              arg: '/system/xbin/su',
              layer: 'java',
              app_frame: 'o.im.p',
              smali_path: 'apktool/smali/o/im.smali',
            },
          ],
        },
      });

      this.set('scanId', '9');
      this.set('findingId', String(finding.id));

      await render(hbs`
        <OffensiveSecurity::FindingDetail
          @scanId={{this.scanId}}
          @findingId={{this.findingId}}
        />
      `);

      assert.dom(this.element).includesText('Detection backtrace');
      assert.dom(this.element).includesText('o.im.p');
      assert.dom(this.element).includesText('apktool/smali/o/im.smali');
      assert.dom(this.element).includesText('/system/xbin/su');
    });

    test('it renders the smali patch and the patched APK download', async function (assert) {
      const finding = this.server.create('offsec-finding', {
        signature_id: 'root-file-probe',
        name: 'Root artifact file probe',
        outcome: 'bypassed',
        detail: {
          smali_patch: {
            path: 'apktool/smali/o/im.smali',
            diff: '- if-eqz v0, :cond_0\n+ goto :cond_0',
          },
          patched_apk: { name: 'patched.apk' },
        },
      });

      this.set('scanId', '9');
      this.set('findingId', String(finding.id));

      await render(hbs`
        <OffensiveSecurity::FindingDetail
          @scanId={{this.scanId}}
          @findingId={{this.findingId}}
        />
      `);

      assert.dom(this.element).includesText('Bypass artifacts');
      assert.dom(this.element).includesText('apktool/smali/o/im.smali');
      assert.dom(this.element).includesText('goto :cond_0');
      assert.dom(this.element).includesText('Patched APK');
      assert.dom(this.element).includesText('Download');
    });

    test('it drops the raw UI screen dump from the evidence card', async function (assert) {
      const finding = this.server.create('offsec-finding', {
        signature_id: 'root-file-probe',
        name: 'Root artifact file probe',
        outcome: 'bypassed',
        evidence: [
          {
            evidence_id: 'E11',
            tool: 'android:ui_get_text',
            source: 'ui',
            summary: 'POST_BYPASS_SCREEN_DUMP',
            ok: true,
          },
          {
            evidence_id: 'E0',
            tool: 'frida_diagnose',
            source: 'frida_diagnostic',
            summary: 'DIAGNOSTIC_KEEP',
            ok: true,
          },
        ],
      });

      this.set('scanId', '9');
      this.set('findingId', String(finding.id));

      await render(hbs`
        <OffensiveSecurity::FindingDetail
          @scanId={{this.scanId}}
          @findingId={{this.findingId}}
        />
      `);

      assert.dom(this.element).doesNotIncludeText('POST_BYPASS_SCREEN_DUMP');
      assert.dom(this.element).includesText('DIAGNOSTIC_KEEP');
    });

    test('it drops the raw UI click dump from the evidence card', async function (assert) {
      const finding = this.server.create('offsec-finding', {
        signature_id: 'root-file-probe',
        name: 'Root artifact file probe',
        outcome: 'bypassed',
        evidence: [
          {
            evidence_id: 'E27',
            tool: 'android:ui_click',
            summary: 'CLICK_START_SETUP_DUMP',
            ok: true,
          },
        ],
      });

      this.set('scanId', '9');
      this.set('findingId', String(finding.id));

      await render(hbs`
        <OffensiveSecurity::FindingDetail
          @scanId={{this.scanId}}
          @findingId={{this.findingId}}
        />
      `);

      assert.dom(this.element).doesNotIncludeText('CLICK_START_SETUP_DUMP');
    });

    test('it showcases static evidence of presence', async function (assert) {
      const finding = this.server.create('offsec-finding', {
        signature_id: 'root-file-probe',
        name: 'Root artifact file probe',
        outcome: 'bypassed',
        detail: {
          static_evidence: [
            {
              id: 'E0_rasp',
              kind: 'rasp_scan',
              summary: 'Protection families detected by APKiD',
              detail: 'anti_vm: Build.MODEL check; root_detection: su path',
            },
            {
              id: 'E18',
              kind: 'native_inspect',
              summary: 'Inspected native library libhnb.so',
              detail: 'ELF arm64 libhnb.so exports',
            },
          ],
        },
      });

      this.set('scanId', '9');
      this.set('findingId', String(finding.id));

      await render(hbs`
        <OffensiveSecurity::FindingDetail
          @scanId={{this.scanId}}
          @findingId={{this.findingId}}
        />
      `);

      assert.dom(this.element).includesText('Static evidence');
      assert
        .dom(this.element)
        .includesText('Protection families detected by APKiD');
      assert.dom(this.element).includesText('root_detection: su path');
      assert.dom(this.element).includesText('libhnb.so');
    });
  }
);
