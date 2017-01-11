`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'submission-list', 'Integration | Component | submission list', {
  integration: true
}

test 'it renders', (assert) ->
  assert.ok true
  assert.equal @$().text().trim(), ''
