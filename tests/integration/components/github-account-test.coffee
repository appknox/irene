`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'github-account', 'Integration | Component | github account', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{github-account}}"""

  assert.equal @$().text().trim(), 'Integrate GitHubAre you sure you want to revoke Github Integration?CancelOk'
