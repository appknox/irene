import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('subscription-component', 'Integration | Component | subscription component', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{subscription-component}}"));

  assert.equal(this.$().text().trim(), 'Subscription DetailsCurrent PlanBilling Period You will be charged on   Cancel SubscriptionAre you sure you want to cancel Subscription?CancelOk');
});
