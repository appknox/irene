import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('analysis-settings', 'Integration | Component | analysis settings', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{analysis-settings}}"));

  assert.equal(this.$().text().trim(), 'SHOW/HIDE Unknown AnalysisDo you want us to show unknown analysis?');
});
