`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`

TeamOverviewComponent = Ember.Component.extend

  classNames: ["column" , "is-one-third"]

  actions:
    deleteTeam: ->
      teamName = @get "team.name"
      deletedName = prompt "Enter the team name which you want to delete ", ""
      if deletedName is null
        return
      else if deletedName isnt teamName
        return @get("notify").error "Enter the right team name to delete it"
      teamId = @get "team.id"
      that = @
      data =
        name: teamName
      @get("ajax").delete ENV.endpoints.teams, data: data
      .then (data)->
        that.get("notify").success "Team - #{teamName} has been deleted successfully"
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default TeamOverviewComponent`
