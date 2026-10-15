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

    test('it renders Step 1 dropzone when no file has been uploaded', async function (assert) {
      const offsecService = this.owner.lookup('service:offsec-new-assessment');
      offsecService.reset();

      await render(hbs`<OffensiveSecurity::NewAssessment />`);

      assert
        .dom('[data-test-new-assessment-title]')
        .hasText('Start a new assessment');
      assert.dom('[data-test-new-assessment-header-card]').exists();
      assert.dom('[data-test-back-to-runs-btn]').exists();
      assert.dom('[data-test-new-assessment-dropzone]').exists();
      assert.dom('[data-test-file-input]').exists();
      assert.dom('[data-test-uploaded-build-card]').doesNotExist();

      await click('[data-test-back-to-runs-btn]');
      const router = this.owner.lookup('service:router');
      assert.equal(
        router.transitionedTo,
        'authenticated.offensive-security.index'
      );
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
      assert.dom('[data-test-begin-assessment-btn]').containsText('Comprehensive');

      // Switch to resilience
      await click('[data-test-card-resilience]');
      assert.equal(offsecService.assessmentType, 'resilience');
      assert.dom('[data-test-begin-assessment-btn]').containsText('Resilience');

      // Check credentials rows
      const initialRows = findAll('[data-test-credential-row]');
      assert.equal(initialRows.length, 3);

      // Add another credential row
      await click('[data-test-add-role-btn]');
      const updatedRows = findAll('[data-test-credential-row]');
      assert.equal(updatedRows.length, 4);

      // Fill in credentials
      await fillIn('[data-test-cred-role="0"]', 'Security Auditor');
      await fillIn('[data-test-cred-username="0"]', 'audit@example.com');
      await fillIn('[data-test-cred-password="0"]', 'SuperSecret123');

      // Click Begin Assessment CTA
      await click('[data-test-begin-assessment-btn]');

      assert.ok(savedOptions, 'uploadItem.save was called');
      assert.equal(savedOptions.adapterOptions.assessment_type, 'resilience');
      assert.equal(savedOptions.adapterOptions.offsec, true);
      assert.equal(savedOptions.adapterOptions.credentials.length, 1);
      assert.equal(savedOptions.adapterOptions.credentials[0].role, 'Security Auditor');
      assert.equal(savedOptions.adapterOptions.credentials[0].username, 'audit@example.com');
      assert.equal(savedOptions.adapterOptions.credentials[0].password, 'SuperSecret123');

      const router = this.owner.lookup('service:router');
      assert.equal(
        router.transitionedTo,
        'authenticated.offensive-security.index'
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

    test('unfilled credential rows are omitted and not sent to backend', async function (assert) {
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

      // 3 empty rows are present on screen
      const rows = findAll('[data-test-credential-row]');
      assert.equal(rows.length, 3);

      // User submits without filling any of the 3 rows
      await click('[data-test-begin-assessment-btn]');

      assert.ok(savedOptions, 'uploadItem.save was called');
      assert.deepEqual(
        savedOptions.adapterOptions.credentials,
        [],
        'credentials array sent to backend is empty since rows were unfilled'
      );
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

