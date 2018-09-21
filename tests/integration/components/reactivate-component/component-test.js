import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('reactivate-component', 'Integration | Component | reactivate component', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{reactivate-component}}`);

  assert.equal(this.$().text().trim(), 'Hey, looks like the activation token is expired or invalidDo you want to recieve the activation email again? If yes, please enter the registered email id belowResend EmailThank you for registering with Appknox. An activation link has been sent to the email provided.');
});
