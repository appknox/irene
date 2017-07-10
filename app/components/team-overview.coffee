`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`

TeamOverviewComponent = Ember.Component.extend

  team: null
  classNames: ["column" , "is-one-third"]

  actions:
    deleteTeam: ->
      team = @get "team"
      teamName = team.get("name").toLowerCase()
      deletedName = prompt("Enter the team name which you want to delete ", "").toLowerCase()
      if deletedName isnt teamName
        return @get("notify").error "Enter the right team name to delete it"
      team.destroyRecord()
      ###
      # @yashwin implemnt `then` & `catch`
      @get("ajax").delete ENV.endpoints.teams, data: data
      .then (data)->
        that.get("notify").success "Team - #{teamName} has been deleted successfully"
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message
      ###

`export default TeamOverviewComponent`
