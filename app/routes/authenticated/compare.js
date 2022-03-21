/* eslint-disable ember/no-mixins, prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import Route from '@ember/routing/route';
import { ScrollTopMixin } from '../../mixins/scroll-top';
import { debug } from '@ember/debug';

export default class AuthenticatedCompareRoute extends ScrollTopMixin(Route) {
  async model(data){
    const files = data.files.split("...");
    debug(`Comparing files ${files[0]} and ${files[1]}`)
    const file1 = await this.get('store').find('file', parseInt(files[0]));
    const file2 = await this.get('store').find('file', parseInt(files[1]));
    return {
      file: file1,
      fileOld: file2
    };
  }
}
