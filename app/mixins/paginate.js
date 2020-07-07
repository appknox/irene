import Mixin from '@ember/object/mixin';
import ENV from 'irene/config/environment';
import { observer, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';

const PaginateMixin = Mixin.create({

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

  versionTrigger: observer('limit', 'offset', "targetModel", "extraQueryStrings", function () {
    return (() => {
      const result = [];
      for (let property of ['limit', 'offset', "targetModel", "extraQueryStrings"]) {
        const propertyOldName = `_${property}`;
        const propertyNewValue = this.get(property);
        const propertyOldValue = this.get(propertyOldName);
        const propertyChanged = propertyOldValue !== propertyNewValue;
        if (propertyChanged) {
          this.set(propertyOldName, propertyNewValue);
          result.push(run.once(this, 'versionIncrementer'));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }),

  objects: computed('extraQueryStrings', 'isDRFPagination', 'isJsonApiPagination', 'limit', 'offset', 'offsetMultiplier', 'store', 'targetModel', 'version', function () {
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
        offset: this.get("offset")
      };
    }
    const extraQueryStrings = this.get("extraQueryStrings");
    if (!isEmpty(extraQueryStrings)) {
      const extraQueries = JSON.parse(extraQueryStrings);
      for (let key in extraQueries) {
        const value = extraQueries[key];
        query[key] = value;
      }
    }
    const targetModel = this.get("targetModel");
    if (this.get('isDRFPagination')) {
      query.offset = query.offset * (this.get("offsetMultiplier") || 1);
    }
    const objects = this.get('store').query(targetModel, query);
    objects.then((result) => {
      const { meta } = result;
      if (result.links && result.meta.pagination) {
        meta.total = result.meta.pagination.count;
        this.set('isJsonApiPagination', true); // eslint-disable-line
      }
      if ("count" in result.meta) {
        meta.total = result.meta.count || 0;
        /*
        count is only defined for DRF
        JSONAPI has total
        */
        this.set('isDRFPagination', true); // eslint-disable-line
      }
      return this.set("meta", meta); // eslint-disable-line
    });
    return objects;
  }),

  sortedObjects: computed.sort('objects', 'sortProperties'),
  objectCount: computed.alias('objects.length'),
  hasObjects: computed.gt('objectCount', 0),
  hasNoObject: computed.equal('meta.count', 0),

  maxOffset: computed("meta.total", "limit", function () {
    const limit = this.get("limit");
    const total = this.get("meta.total" || 0);
    if (total === 0) {
      return 0;
    }
    return Math.ceil(total / limit) - 1;
  }),  // `-1` because offset starts from 0

  pages: computed("maxOffset", "offset", function () {
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
      offsetDiffStop = (ENV.paginate.pagePadding + offset) - maxOffset;
    }

    startPage -= offsetDiffStop;
    stopPage += offsetDiffStart;

    return __range__(startPage, stopPage, true);
  }),

  preDot: computed("offset", function () {
    const offset = this.get("offset");
    return (offset - ENV.paginate.pagePadding) > 0;
  }),

  postDot: computed("offset", "maxOffset", function () {
    const offset = this.get("offset");
    const maxOffset = this.get("maxOffset");
    return (offset + ENV.paginate.pagePadding) < maxOffset;
  }),

  hasPrevious: computed.gt("offset", 0),

  hasNext: computed('offset', 'maxOffset', function () {
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
