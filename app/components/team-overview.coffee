`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`

TeamOverviewComponent = Ember.Component.extend

  team: null
  classNames: ["column" , "is-one-third"]

  actions:
    openRemoveTeamPrompt: ->
      @set "showRemoveTeamPrompt", true

    closeRemoveTeamPrompt: ->
      @set "showRemoveTeamPrompt", false

    deleteTeam: ->
      team = @get "team"
      promptedItem = @$('.deleted-item').val()
      deletedTeam = team.get("name")
      teamName = deletedTeam.toLowerCase()
      if promptedItem isnt teamName
        return @get("notify").error "Enter the right team name to delete it"
      that = @
      team.destroyRecord()
      .then ()->
        that.get("notify").success "Team - #{deletedTeam} has been deleted successfully"
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default TeamOverviewComponent`
