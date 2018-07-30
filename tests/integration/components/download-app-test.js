import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('download-app', 'Integration | Component | download app', {
  integration: true
});

test('it renders', function(assert) {


  this.render(hbs`{{download-app}}`);

  assert.equal(this.$().text().trim(), 'Download AppDownload App');

});
