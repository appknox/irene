`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'personaltoken-detail', 'Integration | Component | personaltoken detail', {
  integration: true
}

test 'it renders', (assert) ->
  assert.ok true
  assert.equal @$().text().trim(), ''
