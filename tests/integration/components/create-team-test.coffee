`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'create-team', 'Integration | Component | create team', {
  integration: true
}

test 'it renders', (assert) ->
  assert.ok true
  assert.equal @$().text().trim(), ''
