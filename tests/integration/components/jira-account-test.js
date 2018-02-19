import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('jira-account', 'Integration | Component | jira account', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{jira-account}}"));

  assert.equal(this.$().text().trim(), 'Integrate JIRAAre you sure you want to revoke JIRA Integration?CancelOk');
});
