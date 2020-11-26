import Component from '@ember/component';

const ProjectOverviewComponent = Component.extend({
  project: null,
  didInsertElement() {
    console.log('pro over', this.get('project'))
  },
  classNames: ["column", "is-one-third"]
});
export default ProjectOverviewComponent;
