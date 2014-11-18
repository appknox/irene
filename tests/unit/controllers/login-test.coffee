`import Ember from "ember";`
`import { test, moduleFor } from 'ember-qunit';`
`import startApp from '../../helpers/start-app';`
`import $ from 'vendor/jquery/dist/jquery';`


moduleFor 'controller:login', 'LoginController', {
  # Specify the other units that are required for this test.
  # needs: ['controller:foo']
}

App = null

module 'Testing login interactions',
  setup: ->
    App = startApp()
    @controller = LoginController.create()

  teardown: ->
    App.reset()
    Ember.run App, App.destroy


test 'it redirects to login when the user is not authenticated', ->
  expect 1
  invalidateSession()
  visit "/"

  andThen ->
    equal currentRouteName(), "login"


test 'it stays in `index` when the user is authenticated', ->
  expect 1
  authenticateSession()
  visit "/"

  andThen ->
    equal currentRouteName(), "index"


test 'it validates properly', ->
  expect 1
  invalidateSession()
  visit "/login"
  click "[type='submit']"

  andThen ->
    ok $(".ember-notify").hasClass "error"

###
  # For some reasons these folling stuff is not working. Lets fix this later.
  # No Credientials
  controller.send "setCredentials", '', ''
  errors = controller.validate()

  equal errors.length, 2
  equal errors[0], 'Username'
  equal errors[1], 'Password'

  # Only username
  controller.send "setCredentials", 'foo', ''
  errors = controller.validate()

  equal errors.length, 1
  equal errors[0], 'Password'

  # Only password
  controller.send "setCredentials", '', 'bar'
  errors = controller.validate()

  equal errors.length, 1
  equal errors[0], 'Username'

  # Both
  controller.send "setCredentials", 'foo', 'bar'
  errors = controller.validate()

  equal errors.length, 0
###
