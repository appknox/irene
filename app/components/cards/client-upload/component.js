import Component from '@glimmer/component';
import {
  htmlSafe
} from '@ember/template';
import {
  computed
} from '@ember/object';

export default class CardsClientUploadComponent extends Component {


  @computed('args.upload.iconUrl')
  get iconUrl() {
    return htmlSafe(`background-image: url(${this.args.upload.iconUrl})`);
  }

}
