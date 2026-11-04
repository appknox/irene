import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import {
  render,
  click,
  fillIn,
  find,
  findAll,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';
import { selectFiles } from 'ember-file-upload/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class NotificationsStub extends Service {
  messages = [];

  success(msg) {
    this.messages.push({ type: 'success', msg });
  }

  error(msg) {
    this.messages.push({ type: 'error', msg });
  }
}

class RouterStub extends Service {
  transitionedTo = null;
  listeners = {};

  on(name, fn) {
    (this.listeners[name] ??= []).push(fn);
  }

  off(name, fn) {
    this.listeners[name] = (this.listeners[name] ?? []).filter((f) => f !== fn);
  }

  transitionTo(route) {
    this.transitionedTo = route;
  }
}

// The scan created by Begin shows up on the first poll, so the page opens it
class StoreStub extends Service {
  query() {
    return Promise.resolve([
      { id: '42', createdAt: new Date(Date.now() + 60 * 1000) },
    ]);
  }
}

let rejectPendingUpload;

class PendingStoreStub extends Service {
  queryRecord() {
    return new Promise((_, reject) => {
      rejectPendingUpload = reject;
    });
  }
}

class RealtimeStub extends Service {
  submissionCounter = 0;

  incrementProperty(prop) {
    if (prop === 'SubmissionCounter') {
      this.submissionCounter++;
    }
  }
}

module(
  'Integration | Component | offensive-security/new-assessment',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);
      this.owner.register('service:realtime', RealtimeStub);
      this.owner.unregister('service:store');
      this.owner.register('service:store', StoreStub);
    });

    test('it renders Step 1 dropzone with locked steps and summary when no file has been uploaded', async function (assert) {
      const offsecService = this.owner.lookup('service:offsec-new-assessment');
      offsecService.reset();

      await render(hbs`<OffensiveSecurity::NewAssessment />`);

      assert
        .dom('[data-test-new-assessment-title]')
        .hasText('Start a new assessment');
      assert.dom('[data-test-new-assessment-header-card]').exists();
      assert.dom('[data-test-new-assessment-dropzone]').exists();
      assert.dom('[data-test-file-input]').exists();
      assert.dom('[data-test-uploaded-build-card]').doesNotExist();

      assert
        .dom(
          '[data-test-new-assessment-step="1"] [data-test-new-assessment-step-marker]'
        )
        .hasAttribute('data-test-new-assessment-step-marker', 'current');
      assert
        .dom(
          '[data-test-new-assessment-step="2"] [data-test-new-assessment-step-marker]'
        )
        .hasAttribute('data-test-new-assessment-step-marker', 'upcoming');

      assert.dom('[data-test-assessment-type-locked]').exists();
      assert.dom('[data-test-credentials-locked]').exists();
      assert.dom('[data-test-card-comprehensive]').doesNotExist();
      assert.dom('[data-test-credentials-card]').doesNotExist();

      assert
        .dom('[data-test-new-assessment-summary-build]')
        .hasAttribute('data-test-new-assessment-summary-item', 'locked');
      assert
        .dom(
          '[data-test-new-assessment-summary-build] [data-test-new-assessment-summary-item-value]'
        )
        .hasText('No build yet');
      assert.dom('[data-test-begin-assessment-btn]').isDisabled();
      assert
        .dom('[data-test-begin-assessment-help]')
        .hasText('Upload a build to continue.');
    });

    test('summary reflects uploaded build, assessment type and added credentials', async function (assert) {
      const offsecService = this.owner.lookup('service:offsec-new-assessment');
      offsecService.reset();
      offsecService.setUploadedApp({
        uploadItem: { url: 'https://test.com' },
        file: { name: 'bank.ipa', size: 10485760 },
      });

      await render(hbs`<OffensiveSecurity::NewAssessment />`);

      assert
        .dom(
          '[data-test-new-assessment-step="1"] [data-test-new-assessment-step-marker]'
        )
        .hasAttribute('data-test-new-assessment-step-marker', 'done');

      assert
        .dom(
          '[data-test-new-assessment-summary-build] [data-test-new-assessment-summary-item-value]'
        )
        .hasText('bank.ipa');
      assert
        .dom(
          '[data-test-new-assessment-summary-build] [data-test-new-assessment-summary-item-sub]'
        )
        .hasText('Uploaded · 10.0 MB · iOS');

      assert
        .dom(
          '[data-test-new-assessment-summary-type] [data-test-new-assessment-summary-item-value]'
        )
        .hasText('Comprehensive Offensive PT');

      await click('[data-test-card-resilience]');
      assert
        .dom(
          '[data-test-new-assessment-summary-type] [data-test-new-assessment-summary-item-value]'
        )
        .hasText('Only Resilience Assessment');

      assert
        .dom('[data-test-new-assessment-summary-credentials]')
        .hasAttribute('data-test-new-assessment-summary-item', 'optional');
      assert
        .dom(
          '[data-test-new-assessment-summary-credentials] [data-test-new-assessment-summary-item-value]'
        )
        .hasText('None added');

      await click('[data-test-add-first-credential-btn]');
      await fillIn('[data-test-cred-role="0"]', 'Admin');
      await fillIn('[data-test-cred-username="0"]', 'admin@example.com');
      await fillIn('[data-test-cred-password="0"]', 'Secret123!');

      assert
        .dom('[data-test-new-assessment-summary-credentials]')
        .hasAttribute('data-test-new-assessment-summary-item', 'done');
      assert
        .dom(
          '[data-test-new-assessment-summary-credentials] [data-test-new-assessment-summary-item-value]'
        )
        .hasText('1 credential added');
      assert
        .dom(
          '[data-test-new-assessment-summary-credentials] [data-test-new-assessment-summary-item-sub]'
        )
        .hasText('Admin');
      assert
        .dom(
          '[data-test-new-assessment-step="3"] [data-test-new-assessment-step-marker]'
        )
        .hasAttribute('data-test-new-assessment-step-marker', 'done');
    });

    test('it renders Step 2 when an uploaded file is in state, and allows switching type & credentials', async function (assert) {
      const offsecService = this.owner.lookup('service:offsec-new-assessment');
      let savedOptions = null;

      const mockUploadItem = {
        url: 'https://s3.amazonaws.com/test-bucket/app.apk',
        save(opts) {
          savedOptions = opts;

          return Promise.resolve(this);
        },
      };

      offsecService.setUploadedApp({
        uploadItem: mockUploadItem,
        file: { name: 'my-app.apk', size: 10485760 },
      });

      await render(hbs`<OffensiveSecurity::NewAssessment />`);

      assert.dom('[data-test-uploaded-build-card]').exists();
      assert.dom('[data-test-uploaded-filename]').hasText('my-app.apk');
      assert.dom('[data-test-card-comprehensive]').exists();
      assert.dom('[data-test-card-resilience]').exists();

      assert
        .dom('[data-test-begin-assessment-btn]')
        .containsText('Begin assessment');

      // Switch to resilience
      await click('[data-test-card-resilience]');
      assert.strictEqual(offsecService.assessmentType, 'resilience');

      // Credentials start empty, with an add button
      assert.dom('[data-test-credentials-empty]').exists();
      assert.strictEqual(findAll('[data-test-credential-row]').length, 0);

      await click('[data-test-add-first-credential-btn]');
      assert.strictEqual(findAll('[data-test-credential-row]').length, 1);
      assert.dom('[data-test-credentials-count]').hasText('1 of 5');

      // Add another credential row
      await click('[data-test-add-role-btn]');
      assert.strictEqual(findAll('[data-test-credential-row]').length, 2);
      assert.dom('[data-test-credentials-count]').hasText('2 of 5');

      // Fill in credentials
      await fillIn('[data-test-cred-role="0"]', 'Security Auditor');
      await fillIn('[data-test-cred-username="0"]', 'audit@example.com');
      await fillIn('[data-test-cred-password="0"]', 'SuperSecret123');

      // Test eye icon visibility toggle
      assert
        .dom('[data-test-cred-password="0"]')
        .hasAttribute('type', 'password');
      await click('[data-test-show-hide-btn="0"]');
      assert.dom('[data-test-cred-password="0"]').hasAttribute('type', 'text');
      await click('[data-test-show-hide-btn="0"]');
      assert
        .dom('[data-test-cred-password="0"]')
        .hasAttribute('type', 'password');

      // Click Begin Assessment CTA
      await click('[data-test-begin-assessment-btn]');

      assert.ok(savedOptions, 'uploadItem.save was called');
      assert.strictEqual(
        savedOptions.adapterOptions.assessment_type,
        'resilience'
      );
      assert.true(savedOptions.adapterOptions.offsec);
      assert.strictEqual(savedOptions.adapterOptions.credentials.length, 1);
      assert.strictEqual(
        savedOptions.adapterOptions.credentials[0].role,
        'Security Auditor'
      );
      assert.strictEqual(
        savedOptions.adapterOptions.credentials[0].username,
        'audit@example.com'
      );
      assert.strictEqual(
        savedOptions.adapterOptions.credentials[0].password,
        'SuperSecret123'
      );

      const router = this.owner.lookup('service:router');

      assert.strictEqual(
        router.transitionedTo,
        'authenticated.offensive-security.scan',
        'the page opens the new scan once it appears'
      );
      assert.strictEqual(
        offsecService.assessmentStartedAt,
        null,
        'the started marker is cleared once the scan opens'
      );
    });

    test('clicking Change build clears uploaded state and returns to Step 1 dropzone', async function (assert) {
      const offsecService = this.owner.lookup('service:offsec-new-assessment');
      offsecService.setUploadedApp({
        uploadItem: { url: 'https://test.com' },
        file: { name: 'test.apk', size: 5000 },
      });

      await render(hbs`<OffensiveSecurity::NewAssessment />`);
      assert.dom('[data-test-uploaded-build-card]').exists();

      await click('[data-test-change-build-btn]');
      assert.dom('[data-test-uploaded-build-card]').doesNotExist();
      assert.dom('[data-test-new-assessment-dropzone]').exists();
    });

    test('unfilled credential rows are omitted and not sent to backend in resilience mode', async function (assert) {
      const offsecService = this.owner.lookup('service:offsec-new-assessment');
      let savedOptions = null;

      offsecService.setUploadedApp({
        uploadItem: {
          url: 'https://test.com',
          save(opts) {
            savedOptions = opts;

            return Promise.resolve(this);
          },
        },
        file: { name: 'test.apk', size: 5000 },
      });

      await render(hbs`<OffensiveSecurity::NewAssessment />`);

      // Switch to resilience where credentials are optional
      await click('[data-test-card-resilience]');

      // An added row left empty is omitted
      await click('[data-test-add-first-credential-btn]');
      assert.strictEqual(findAll('[data-test-credential-row]').length, 1);

      // User submits without filling the row
      await click('[data-test-begin-assessment-btn]');

      assert.ok(savedOptions, 'uploadItem.save was called');
      assert.deepEqual(
        savedOptions.adapterOptions.credentials,
        [],
        'credentials array sent to backend is empty since rows were unfilled'
      );
    });

    test('for comprehensive assessment, credentials are optional and assessment can begin without entering credentials', async function (assert) {
      const offsecService = this.owner.lookup('service:offsec-new-assessment');
      let savedOptions = null;

      offsecService.setUploadedApp({
        uploadItem: {
          url: 'https://test.com',
          save(opts) {
            savedOptions = opts;

            return Promise.resolve(this);
          },
        },
        file: { name: 'test.apk', size: 5000 },
      });

      await render(hbs`<OffensiveSecurity::NewAssessment />`);

      // Default is comprehensive: credentials are optional, no mandatory badge or hint
      assert.dom('[data-test-creds-mandatory-badge]').doesNotExist();
      assert.dom('[data-test-creds-missing-hint]').doesNotExist();
      assert.dom('[data-test-begin-assessment-btn]').isNotDisabled();

      // Submit comprehensive assessment without credentials
      await click('[data-test-begin-assessment-btn]');

      assert.ok(savedOptions, 'uploadItem.save was called');
      assert.strictEqual(
        savedOptions.adapterOptions.assessment_type,
        'comprehensive'
      );
      assert.deepEqual(
        savedOptions.adapterOptions.credentials,
        [],
        'credentials array sent to backend is empty when rows are unfilled'
      );
    });

    test('for comprehensive assessment, credentials are sent if provided', async function (assert) {
      const offsecService = this.owner.lookup('service:offsec-new-assessment');
      let savedOptions = null;

      offsecService.setUploadedApp({
        uploadItem: {
          url: 'https://test.com',
          save(opts) {
            savedOptions = opts;

            return Promise.resolve(this);
          },
        },
        file: { name: 'test.apk', size: 5000 },
      });

      await render(hbs`<OffensiveSecurity::NewAssessment />`);

      await click('[data-test-add-first-credential-btn]');
      await fillIn('[data-test-cred-role="0"]', 'Auditor');
      await fillIn('[data-test-cred-username="0"]', 'audit@example.com');
      await fillIn('[data-test-cred-password="0"]', 'Secret123!');

      await click('[data-test-begin-assessment-btn]');

      assert.ok(savedOptions, 'uploadItem.save was called');
      assert.strictEqual(
        savedOptions.adapterOptions.assessment_type,
        'comprehensive'
      );
      assert.strictEqual(savedOptions.adapterOptions.credentials.length, 1);
      assert.strictEqual(
        savedOptions.adapterOptions.credentials[0].username,
        'audit@example.com'
      );
      assert.strictEqual(
        savedOptions.adapterOptions.credentials[0].password,
        'Secret123!'
      );
    });

    test('a partly filled credential row shows an error and blocks Begin until finished or removed', async function (assert) {
      const offsecService = this.owner.lookup('service:offsec-new-assessment');

      offsecService.setUploadedApp({
        uploadItem: { url: 'https://test.com' },
        file: { name: 'test.apk', size: 5000 },
      });

      await render(hbs`<OffensiveSecurity::NewAssessment />`);

      await click('[data-test-add-first-credential-btn]');
      await fillIn('[data-test-cred-username="0"]', 'audit@example.com');

      assert
        .dom('[data-test-credential-row-error="0"]')
        .hasText('Fill in all three fields, or remove this row.');
      assert.dom('[data-test-begin-assessment-btn]').isDisabled();
      assert
        .dom('[data-test-new-assessment-summary-credentials]')
        .hasAttribute('data-test-new-assessment-summary-item', 'todo');

      await click('[data-test-remove-cred-btn="0"]');

      assert.dom('[data-test-credential-row-error]').doesNotExist();
      assert.dom('[data-test-begin-assessment-btn]').isNotDisabled();
    });

    test('switching between comprehensive and resilience keeps credentials optional in both modes', async function (assert) {
      const offsecService = this.owner.lookup('service:offsec-new-assessment');

      offsecService.setUploadedApp({
        uploadItem: {
          url: 'https://test.com',
          save() {
            return Promise.resolve(this);
          },
        },
        file: { name: 'test.apk', size: 5000 },
      });

      await render(hbs`<OffensiveSecurity::NewAssessment />`);

      // In comprehensive, credentials are optional, button enabled
      assert.dom('[data-test-creds-mandatory-badge]').doesNotExist();
      assert.dom('[data-test-creds-missing-hint]').doesNotExist();
      assert.dom('[data-test-begin-assessment-btn]').isNotDisabled();

      // Switch to resilience: credentials optional, button enabled
      await click('[data-test-card-resilience]');
      assert.dom('[data-test-creds-mandatory-badge]').doesNotExist();
      assert.dom('[data-test-creds-missing-hint]').doesNotExist();
      assert.dom('[data-test-begin-assessment-btn]').isNotDisabled();

      // Switch back to comprehensive: credentials still optional, button enabled
      await click('[data-test-card-comprehensive]');
      assert.dom('[data-test-creds-mandatory-badge]').doesNotExist();
      assert.dom('[data-test-creds-missing-hint]').doesNotExist();
      assert.dom('[data-test-begin-assessment-btn]').isNotDisabled();
    });

    test('it renders the dropzone in idle state without progress bar before upload starts', async function (assert) {
      const offsecService = this.owner.lookup('service:offsec-new-assessment');
      offsecService.reset();

      await render(hbs`<OffensiveSecurity::NewAssessment />`);

      assert.dom('[data-test-new-assessment-dropzone]').exists();
      assert.dom('[data-test-upload-progress-bar]').doesNotExist();
    });

    module('leaving while a build is uploading', function (hooks) {
      hooks.beforeEach(async function () {
        const offsecService = this.owner.lookup(
          'service:offsec-new-assessment'
        );
        offsecService.reset();

        // keeps the upload pending so the page stays in its uploading state
        this.owner.unregister('service:store');
        this.owner.register('service:store', PendingStoreStub);

        await render(hbs`<OffensiveSecurity::NewAssessment />`);

        const file = new File(['content'], 'my-app.apk');

        selectFiles('[data-test-file-input]', file);
        await waitFor('[data-test-upload-progress-bar]');

        this.fakeTransition = {
          aborted: false,
          retried: false,
          abort() {
            this.aborted = true;
          },
          retry() {
            this.retried = true;
          },
        };

        this.navigate = () => {
          const router = this.owner.lookup('service:router');
          router.listeners.routeWillChange.forEach((fn) =>
            fn(this.fakeTransition)
          );
        };
      });

      hooks.afterEach(function () {
        rejectPendingUpload?.(new Error('test cleanup'));
      });

      test('it holds the navigation and asks before leaving', async function (assert) {
        this.navigate();

        await waitFor('[data-test-confirmbox-description]');

        assert.true(this.fakeTransition.aborted, 'navigation is held');
        assert.false(this.fakeTransition.retried);
        assert
          .dom('[data-test-confirmbox-confirmBtn]')
          .hasText('Leave and cancel upload');
        assert
          .dom('[data-test-confirmbox-cancelBtn]')
          .hasText('Stay on this page');
      });

      test('Stay on this page keeps the upload running and drops the navigation', async function (assert) {
        this.navigate();
        await waitFor('[data-test-confirmbox-description]');

        // click() waits for settled, which the pending upload never reaches
        find('[data-test-confirmbox-cancelBtn]').click();
        await waitUntil(() => !find('[data-test-confirmbox-description]'));

        assert.dom('[data-test-confirmbox-description]').doesNotExist();
        assert.dom('[data-test-upload-progress-bar]').exists();
        assert.false(this.fakeTransition.retried, 'navigation stays cancelled');
      });

      test('Leave and cancel upload lets the held navigation continue', async function (assert) {
        this.navigate();
        await waitFor('[data-test-confirmbox-description]');

        // click() waits for settled, which the pending upload never reaches
        find('[data-test-confirmbox-confirmBtn]').click();
        await waitUntil(() => !find('[data-test-confirmbox-description]'));

        assert.true(this.fakeTransition.retried, 'navigation is retried');
        assert.dom('[data-test-confirmbox-description]').doesNotExist();
      });
    });
  }
);
