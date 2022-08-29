import Component from '@glimmer/component';

export default class ProjectOverviewComponent extends Component {
  get project() {
    return this.args.project || null;
  }
}
