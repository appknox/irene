import Component from '@ember/component';
import { computed } from '@ember/object';
import LoadMorePaginate from 'irene/mixins/loadmore-pagination';
import poll from 'irene/services/poll';
import { inject as service } from '@ember/service';
import ENUMS from 'irene/enums';

export default Component.extend(LoadMorePaginate,{

  targetObject: "dynamicscan-timeline",
  isDynamicDetails: true,
  isCoverageDetails: false,
  poll: service(),
  filterContent:computed(function(){
    let filterObj= 'dynamicscan';
    if (filterObj){
      return {filterObj:'dynamicscan',filterProp: 'id'}
    }
    return;
  }),
  sortProperties: ["createdAt:asc"],
  extraQueryStrings: computed(function() {
    const query =
      {dynamicscanId: this.get("dynamicscan.id")};
    return JSON.parse(JSON.stringify(query, Object.keys(query).sort()));
  }),
  didInsertElement() {
    const status = this.get('dynamicscan.status');
    if (status!==ENUMS.DYNAMIC_STATUS.COMPLETED && status!==ENUMS.DYNAMIC_STATUS.ERROR){
      this.send('pollTimeline');
    }
  },
  actions:{
    pollTimeline(){
      const currentDynamicScanId = this.get('dynamicscan.id');
      if(!currentDynamicScanId) {
        return;
      }
      var stopPoll = poll(()=>{
        const dynamicStatus = this.get('dynamicscan.status');
        if (dynamicStatus === ENUMS.DYNAMIC_STATUS.COMPLETED || dynamicStatus === ENUMS.DYNAMIC_STATUS.ERROR) {
          stopPoll();
        }
        this.incrementProperty('version');
      }, 5000);
    }
  }
 }
);
