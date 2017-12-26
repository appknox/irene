`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'attachment-detail', 'Integration | Component | attachment detail', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  @render hbs """{{attachment-detail}}"""
  assert.equal @$().text().trim(), '_'
