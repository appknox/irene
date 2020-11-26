import Ember from 'ember';
import {
  test,
  moduleFor
} from 'ember-qunit';
import {
  startMirage
} from 'irene/initializers/ember-cli-mirage';

moduleFor('authenticator:irene', 'Unit | Authenticator | irene', {
  needs: [
    'route:authenticated',
    'route:application',
    'service:i18n',
    'service:ajax',
    'service:realtime',
    'service:mixpanel',
    'service:trial',
    'service:socket-io',
    'service:notifications',
    'service:session'
  ],
  beforeEach() {

    // start Mirage
    this.server = startMirage();
  },
  afterEach() {
    // shutdown Mirage
    this.server.shutdown();
  }
});

test('it exists', function (assert) {
  const authenticator = this.subject();
  run(function () {
    assert.ok(authenticator.restore());
  });
});
