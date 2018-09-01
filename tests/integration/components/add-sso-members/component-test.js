import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('add-sso-members', 'Integration | Component | add sso members', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{add-sso-members}}`);

  assert.equal(
    this.$().text().split("\n").map(a=>a.trim()).filter(a=>a).join(" "),
    "Add SSO members Add SSO members Email (for multiple entries, separate by comma) or Upload CSV file Add Members"
  );
});
