import Application from '@ember/application';
import { initialize } from 'irene/initializers/scroll-to';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import destroyApp from '../../helpers/destroy-app';

module('Unit | Initializer | scroll to', {
  beforeEach() {
    run(() => {
      this.application = Application.create();
      this.application.deferReadiness();
    });
  },
  afterEach() {
    destroyApp(this.application);
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  initialize(this.application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
