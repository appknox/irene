`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`

TeamOverviewComponent = Ember.Component.extend

  team: null
  classNames: ["column" , "is-one-third"]

  promptCallback: (promptedItem) ->
    team = @get "team"
    deletedTeam = team.get("name")
    teamName = deletedTeam.toLowerCase()
    promptedTeam = promptedItem.toLowerCase()
    if promptedTeam isnt teamName
      return @get("notify").error "Enter the right team name to delete it"
    that = @
    team.destroyRecord()
    .then ()->
      that.get("notify").success "Team - #{deletedTeam} has been deleted successfully"
    .catch (error) ->
      that.get("notify").error error.payload.message
      for error in error.errors
        that.get("notify").error error.detail?.message

  actions:
    openDeleteTeamPrompt: ->
      @set "showDeleteTeamPrompt", true

    closeDeleteTeamPrompt: ->
      @set "showDeleteTeamPrompt", false


`export default TeamOverviewComponent`
