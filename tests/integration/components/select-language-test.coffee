`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'select-language', 'Integration | Component | select language', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{select-language}}"""

  assert.equal @$().text().trim().replace(/(\r\n|\n|\r|\t)/gm,""), 'English        日本語'
