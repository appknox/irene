`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'github-project', 'Integration | Component | github project', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{github-project}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#github-project}}
      template block text
    {{/github-project}}
  """

  assert.equal @$().text().trim(), 'template block text'
