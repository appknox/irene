/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('jira-account', 'Integration | Component | jira account', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with @set 'myProperty', 'value'
  // Handle any actions with @on 'myAction', (val) ->

  this.render(hbs("{{jira-account}}"));

  return assert.equal(this.$().text().trim(), 'Integrate JIRAAre you sure you want to revoke JIRA Integration?CancelOk');
});
