`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'team-overview', 'Integration | Component | team overview', {
  integration: true
}

test 'it renders', (assert) ->
  assert.ok true
  assert.equal @$().text().trim(), ''
