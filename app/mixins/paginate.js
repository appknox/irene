import Ember from 'ember';
import ENV from 'irene/config/environment';

const PaginateMixin = Ember.Mixin.create({

  offset: 0,
  meta: null,
  version: 0,
  extraQueryStrings: "",
  limit: ENV.paginate.perPageLimit,
  isJsonApiPagination: false,
  isDRFPagination: false,
  offsetMultiplier: ENV.paginate.offsetMultiplier,

  versionIncrementer() {
    this.incrementProperty("version");
  },

  versionTrigger: Ember.observer('limit', 'offset', "targetObject", "extraQueryStrings", function() {
    return (() => {
      const result = [];
      for (let property of ['limit', 'offset', "targetObject", "extraQueryStrings"]) {
        const propertyOldName = `_${property}`;
        const propertyNewValue = this.get(property);
        const propertyOldValue = this.get(propertyOldName);
        const propertyChanged = propertyOldValue !== propertyNewValue;
        if (propertyChanged) {
          this.set(propertyOldName, propertyNewValue);
          result.push(Ember.run.once(this, 'versionIncrementer'));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }),

  objects: ( function() {
    let query;
    window.scrollTo(0, 0);
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
        offset: this.get("offset")
      };
    }
    const extraQueryStrings = this.get("extraQueryStrings");
    if (!Ember.isEmpty(extraQueryStrings)) {
      const extraQueries = JSON.parse(extraQueryStrings);
      for (let key in extraQueries) {
        const value = extraQueries[key];
        query[key] = value;
      }
    }
    const targetObject = this.get("targetObject");
    if(this.get('isDRFPagination')) {
      query.offset = query.offset * (this.get("offsetMultiplier") || 1);
    }
    const objects = this.get('store').query(targetObject, query);
    objects.then((result) => {
      const { meta } = result;
      if (result.links && result.meta.pagination) {
        meta.total = result.meta.pagination.count;
        this.set('isJsonApiPagination', true);
      }
      if("count" in result.meta) {
        meta.total = result.meta.count || 0 ;
        /*
        count is only defined for DRF
        JSONAPI has total
        */
        this.set('isDRFPagination', true);
      }
      return this.set("meta", meta);
    });
    return objects;
  }).property("version"),

  sortedObjects: Ember.computed.sort('objects', 'sortProperties'),
  objectCount: Ember.computed.alias('objects.length'),
  hasObjects: Ember.computed.gt('objectCount', 0),

  maxOffset: Ember.computed("meta.total", "limit", function() {
    const limit = this.get("limit");
    const total = this.get("meta.total" || 0);
    if (total === 0) {
      return 0;
    }
    return Math.ceil(total/limit) - 1;
  }),  // `-1` because offset starts from 0

  pages: Ember.computed("maxOffset", "offset", function() {
    const offset = this.get("offset");
    const maxOffset = this.get("maxOffset");
    let startPage = 0;
    let stopPage = maxOffset;
    let offsetDiffStart = 0;
    let offsetDiffStop = 0;

    if ([NaN, 0, 1].includes(maxOffset)) {
      return [];
    }
    if (maxOffset <= (ENV.paginate.pagePadding * 2)) {
      return __range__(startPage, stopPage, true);
    }

    if (offset > ENV.paginate.pagePadding) {
      startPage = offset - ENV.paginate.pagePadding;
    } else {
      offsetDiffStart = ENV.paginate.pagePadding - offset;
    }

    if (maxOffset >= (ENV.paginate.pagePadding + offset)) {
      stopPage = ENV.paginate.pagePadding + offset;
    } else {
      offsetDiffStop =  (ENV.paginate.pagePadding + offset) - maxOffset;
    }

    startPage -= offsetDiffStop;
    stopPage += offsetDiffStart;

    return __range__(startPage, stopPage, true);
}),

  preDot: Ember.computed("offset", function() {
    const offset = this.get("offset");
    return (offset - ENV.paginate.pagePadding) > 0;
  }),

  postDot: Ember.computed("offset", "maxOffset", function() {
    const offset = this.get("offset");
    const maxOffset = this.get("maxOffset");
    return (offset + ENV.paginate.pagePadding) < maxOffset;
  }),

  hasPrevious: Ember.computed.gt("offset", 0),

  hasNext: Ember.computed('offset', 'maxOffset', function() {
    const offset = this.get("offset");
    const maxOffset = this.get("maxOffset");
    return offset < maxOffset;
  }),

  setOffset(offset) {
    this.set("offset", offset);
  },

  actions: {

    gotoPageFirst() {
      this.send("gotoPage", 0);
    },

    gotoPagePrevious() {
      this.decrementProperty("offset");
      this.send("gotoPage", this.get("offset"));
    },

    gotoPage(offset) {
      this.setOffset(offset);
    },

    gotoPageNext() {
      this.incrementProperty("offset");
      this.send("gotoPage", this.get("offset"));
    },

    gotoPageLast() {
      this.send("gotoPage", this.get("maxOffset"));
    }
  }
});

export default PaginateMixin;

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
