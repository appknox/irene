import commondrf from '../commondrf';

export default class RecentIssue extends commondrf {

  _buildURL() {
    return this.buildURLFromBase(`${this.get('namespace')}/organizations/${this.get('organization').selected.id}/recent_issues`);
  }
}
