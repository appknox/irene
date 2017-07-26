`import Ember from 'ember'`
`import ENV from 'irene/config/environment'`
`import ENUMS from 'irene/enums'`

roles = ENUMS.COLLABORATION_ROLE.CHOICES.reverse()[1..]

CollaborationDetailsComponent = Ember.Component.extend

  collaboration: null
  roles: roles
  currentRole: roles[0].value
  tagName: ["tr"]

  promptCallback: (promptedItem) ->
    collaboration = @get "collaboration"
    team = @get "collaboration.team.name"
    teamName = team.toLowerCase()
    promptedTeam = promptedItem.toLowerCase()
    if promptedTeam isnt teamName
      return @get("notify").error "Enter the right username to delete it"
    that = @
    collaboration.destroyRecord()
    .then (data)->
      that.get("notify").success "Team #{team} is removed from the collaboration"
    .catch (error) ->
      for error in error.errors
        that.get("notify").error error.detail?.message

  actions:

    changeRole: (value) ->
      currentRole = @set "currentRole", parseInt @$('#role-preference').val()
      collaborationId = @get "collaboration.id"
      url = [ENV.endpoints.collaborations, collaborationId ].join '/'
      data =
        role: currentRole
      that = @
      @get("ajax").post url , data:data
      .then (data)->
        that.get("notify").success "Permission changed successfully!"
      .catch (error) ->
        that.get("notify").error error.payload.message, ENV.notifications
        for error in error.errors
          that.get("notify").error error.detail?.message

    openAddCollaborationPrompt: ->
      @set "showAddCollaborationPrompt", true

    closeAddCollaborationPrompt: ->
      @set "showAddCollaborationPrompt", false


`export default CollaborationDetailsComponent`
