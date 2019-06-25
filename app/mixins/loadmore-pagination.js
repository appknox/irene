import Mixin from '@ember/object/mixin';
import ENV from 'irene/config/environment';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';

const LoadMorePaginate = Mixin.create({

  routing: service('-routing'),
  offset: 0,
  meta: null,
  onevar: null,
  version: 0,
  extraQueryStrings: "",
  limit: ENV.paginate.perPageLimit,
  isJsonApiPagination: false,
  isDRFPagination: false,
  offsetMultiplier: ENV.paginate.offsetMultiplier,
  someArray: A([]),
  isLoading: false,

  allobjects: computed('version','offset', function(){

    let query;
    if (this.get('isJsonApiPagination')) {
      const query_limit = this.get("limit");
      const query_offset = this.get("offset");
      query = {
        'page[limit]': this.get("limit"),
        'page[offset]': query_limit * query_offset
      };
    } else {
      query = {
        limit: this.get("limit"),
        offset: this.get("offset" )
      };
    }
    const extraQueryStrings = this.get("extraQueryStrings");
    if (!isEmpty(extraQueryStrings)) {
      const extraQueries = JSON.parse(JSON.stringify(extraQueryStrings));
      for (let key in extraQueries) {
        const value = extraQueries[key];
        query[key] = value;
      }
    }
    this.set('isLoading', true); // eslint-disable-line
    const targetObject = this.get("targetObject");
    if(this.get('isDRFPagination')) {
      query.offset = query.offset * (this.get("offsetMultiplier") || 1);
    }
    const objects = this.get('store').query(targetObject, query);
    objects.then((result) => {
      this.set('isLoading', false); // eslint-disable-line
      this.get('someArray').pushObjects(result.toArray())
      const { meta } = result;
      if (result.links && result.meta.pagination) {
        meta.total = result.meta.pagination.count;
        this.set('isJsonApiPagination', true); // eslint-disable-line
      }
      if("count" in result.meta) {
        meta.total = result.meta.count || 0 ;
        /*
        count is only defined for DRF
        JSONAPI has total
        */
        this.set('isDRFPagination', true); // eslint-disable-line
      }
      return this.set("meta", meta); // eslint-disable-line
    });

    return this.get('store').peekAll(targetObject);
  }),
  objects: computed('allobjects.content.length', function() {
    let filterContent = this.get('filterContent');
    if (filterContent){
      return this.get('allobjects').filter(value=>(value.get(`${filterContent.filterObj}.${filterContent.filterProp}`)===this.get(`${filterContent.filterObj}.${filterContent.filterProp}`)))
    }
    return this.get('allobjects');
  }),
  sortedObjects: computed.sort('objects', 'sortProperties'),

  objectCount: computed.alias('objects.length'),
  hasObjects: computed.gt('objectCount', 0),
  hasNoObject: computed.equal('hasObjects', 0),

  maxOffset: computed("meta.total", "allobjects.content.length", function() {
    const limit = this.get("allobjects.content.length");
    const total = this.get("meta.total" || 0);
    if (total === 0) {
      return 0;
    }
    return Math.ceil(total/limit) - 1;
  }),

  hasNext: computed('version','offset', 'maxOffset','meta.total','objects','objects.length', function() {
    let mylength = this.get('objects.length')
    const maxOffset = this.get("meta.total");
    return mylength < maxOffset;
  }),

  actions: {

    gotoPageNext() {
      this.incrementProperty("offset");
    },

  }
});

export default LoadMorePaginate;
