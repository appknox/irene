import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('report-preferences', 'Integration | Component | report preferences', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{report-preferences}}`);

  assert.equal(this.$().text().trim(), 'Report CustomizationDo you want to show the hidden analysis in the Report?');

});
