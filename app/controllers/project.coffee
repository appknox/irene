`import Ember from 'ember'`
`import SocketMixin from 'irene/mixins/socket';`

ProjectController = Ember.Controller.extend SocketMixin,

  needs: ['application']

`export default ProjectController`
