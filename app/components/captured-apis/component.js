import Component from '@ember/component';
import { computed } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';
import { task } from 'ember-concurrency';

import ENV from 'irene/config/environment';
export default Component.extend(PaginateMixin, {

  countCapturedAPI: task(function * (){
    let data = {fileId: this.get('file.id'), is_active:true};
    const url = [ENV.endpoints.files, this.get('file.id'), "capturedapis"].join('/');
    return yield this.get("ajax").request(url,{namespace: ENV.namespace_v2, data});

  }),
  someAction: task(function * (capturedApiObject, isActive){
    yield capturedApiObject.set('isActive', !(isActive));
    yield capturedApiObject.save();
    try{
      let filterCapturedAPIData = yield this.get('countCapturedAPI').perform()
      yield this.set('count', filterCapturedAPIData.count)
        
    }catch(error){
      this.get("notify").error(error.toString())
    }
  }),
  targetObject: "capturedapi",
  sortProperties: ["id:asc"],
  extraQueryStrings: computed("query", function() {
    const query =
      {fileId: this.get("file.id")};
    return JSON.stringify(query, Object.keys(query).sort());
  })

}
);
