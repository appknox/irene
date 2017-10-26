RouteTitleMixin = Ember.Mixin.create
  title: (->
    "#{@get "subtitle"} | Appknox"
  ).property "subtitle"

`export default RouteTitleMixin`
