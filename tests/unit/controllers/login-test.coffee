`import Ember from "ember";`
`import { test, moduleFor } from 'ember-qunit';`
`import startApp from '../../helpers/start-app';`

moduleFor 'controller:login', 'LoginController', {
  # Specify the other units that are required for this test.
  # needs: ['controller:foo']
}

App = null

module 'Testing login interactions',
  setup: ->
    App = startApp()

  teardown: ->
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
