import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }

  setDefaultClearDuration() {}
  clearAll() {}
}

module('Unit | Service | rate-limit', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:notifications', NotificationsStub);
    const notify = this.owner.lookup('service:notifications');
    notify.setDefaultClearDuration(0);
  });

  test('it initializes with default state', function (assert) {
    const service = this.owner.lookup('service:rate-limit');
    assert.notOk(service.isActive, 'should not be active initially');

    assert.strictEqual(
      service.remainingTime,
      0,
      'should have 0 remaining time'
    );

    assert.strictEqual(service.progress, 0, 'should have 0 progress');
  });

  test('it handles rate limit response', function (assert) {
    const service = this.owner.lookup('service:rate-limit');
    const notify = this.owner.lookup('service:notifications');

    const mockResponse = {
      error: 'Rate Limit Exceeded',
      detail: {
        message:
          'Too many requests. Please try again later after 30.5 seconds.',
        code: 'RATE_LIMIT_EXCEEDED',
        lock_time: 30.5,
      },
    };

    // Handle the rate limit response
    const newState = service.handleResponse(this, mockResponse, {
      url: '/api/endpoint',
    });

    assert.ok(newState, 'should return new state');
    assert.ok(service.isActive, 'should be active after handling response');
    assert.strictEqual(service.remainingTime, 31);

    assert.strictEqual(notify.errorMsg, `${t('rateLimitExceeded')} 31s`);

    // Clean up
    service.clearCountdown(this);
  });

  test('it bypasses rate limiting for configured endpoints', function (assert) {
    const service = this.owner.lookup('service:rate-limit');

    const result = service.handleResponse(
      this,
      { lock_time: '30' },
      { url: '/upload_app' }
    );

    assert.notOk(result, 'should return null for bypassed endpoints');
    assert.notOk(
      service.isActive,
      'should not be active for bypassed endpoints'
    );
  });

  test('it shows rate limit lifted info when countdown completes', function (assert) {
    const service = this.owner.lookup('service:rate-limit');
    const notify = this.owner.lookup('service:notifications');

    const mockResponse = {
      error: 'Rate Limit Exceeded',
      detail: {
        message:
          'Too many requests. Please try again later after 30.5 seconds.',
        code: 'RATE_LIMIT_EXCEEDED',
        lock_time: 30.5,
      },
    };

    const newState = service.handleResponse(this, mockResponse, {
      url: '/api/endpoint',
    });

    assert.ok(newState, 'should return new state');
    assert.ok(service.isActive, 'should be active after handling response');

    service.onRateLimitTimerComplete(newState);

    assert.strictEqual(
      notify.infoMsg,
      t('rateLimitLifted'),
      'should show rate limit lifted info'
    );

    service.clearCountdown(this);
  });
});
