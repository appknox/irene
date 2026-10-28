import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, click, fillIn, findAll } from '@ember/test-helpers';
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

  transitionTo(route) {
    this.transitionedTo = route;
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

      // Default is comprehensive
      assert
        .dom('[data-test-begin-assessment-btn]')
        .containsText('Comprehensive');

      // Switch to resilience
      await click('[data-test-card-resilience]');
      assert.strictEqual(offsecService.assessmentType, 'resilience');
      assert.dom('[data-test-begin-assessment-btn]').containsText('Resilience');

      // Check credentials rows
      const initialRows = findAll('[data-test-credential-row]');
      assert.strictEqual(initialRows.length, 3);

      // Add another credential row
      await click('[data-test-add-role-btn]');
      const updatedRows = findAll('[data-test-credential-row]');
      assert.strictEqual(updatedRows.length, 4);

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
        'authenticated.offensive-security.index'
      );
      assert.ok(
        offsecService.assessmentStartedAt,
        'the runs page is told to open the new scan once it appears'
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

      // 3 empty rows are present on screen
      const rows = findAll('[data-test-credential-row]');
      assert.strictEqual(rows.length, 3);

      // User submits without filling any of the 3 rows
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
  }
);
