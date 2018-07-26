import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('file-search-overview', 'Integration | Component | file search overview', {
  integration: true
});

test('it renders', function(assert) {

  this.render(hbs`{{file-search-overview}}`);

  assert.equal(this.$().text().trim(), 'ViewDownload App');
});
