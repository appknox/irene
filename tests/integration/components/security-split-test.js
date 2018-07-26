import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('security-split', 'Integration | Component | security split', {
  integration: true
});

test('it renders', function(assert) {

  this.render(hbs`{{security-split}}`);

  assert.equal(this.$().text().trim(), 'ProjectsDownload AppPurge API Analyses');
});
