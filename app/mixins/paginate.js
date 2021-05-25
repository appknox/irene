import Mixin from '@ember/object/mixin';
import ENV from 'irene/config/environment';
import {
  observer,
  computed
} from '@ember/object';
import {
  isEmpty
} from '@ember/utils';
import {
  run
} from '@ember/runloop';
import {
  __range__
} from 'irene/utils/utils';

// Classic Mixin object
// Should be deprecated once all the pagination is replaced with class based
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
      const {
        meta
      } = result;
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
      // Set loading property
      this.set('isLoading', false); // eslint-disable-line
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
  }), // `-1` because offset starts from 0

  /**
   * @property {Boolean} isContainObjects
   * Property to check whether the model has atleast an object
   */
  isContainObjects: computed.or('hasObjects', 'meta.total'),

  /**
   * @property {Boolean} isEmpty
   * Property to check the number of total objects
   */
  isEmpty: computed.equal('meta.total', 0),

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

// Class basaed mixin support for glimmer components
import {
  action
} from '@ember/object';
import {
  tracked
} from '@glimmer/tracking';
import {
  gt,
  equal,
  alias
} from '@ember/object/computed';

export const PaginationMixin = superclass => class extends superclass {

  constructor() {
    super(...arguments);
  }

  @tracked offset = 0;
  @tracked meta = null;
  @tracked version = 0;
  @tracked extraQueryStrings = "";
  @tracked limit = ENV.paginate.perPageLimit;
  @tracked isJsonApiPagination = false;
  @tracked isDRFPagination = false;
  @tracked offsetMultiplier = ENV.paginate.offsetMultiplier;
  @tracked isLoading = false;
  @tracked error = null;

  @action
  gotoPage(offset) {
    this.isLoading = true;
    this.setOffset(offset);
  }

  @action
  gotoPageFirst() {
    this.gotoPage(0)
  }

  @action
  gotoPagePrevious() {
    this.gotoPage(this.offset - 1)
  }

  @action
  gotoPageNext() {
    this.gotoPage(this.offset + 1);
  }

  @action
  gotoPageLast() {
    this.gotoPage(this.maxOffset)
  }

  // refresh => dummy to reload model with current params
  @computed('extraQueryStrings', 'limit', 'offset', 'offsetMultiplier', 'targetModel', 'refresh') //eslint-disable-line
  get objects() {
    let query;
    if (this.isJsonApiPagination) { // eslint-disable-line
      const query_limit = this.limit;
      const query_offset = this.offset;
      query = {
        'page[limit]': this.limit,
        'page[offset]': query_limit * query_offset
      };
    } else {
      query = {
        limit: this.limit,
        offset: this.offset
      };
    }
    const extraQueryStrings = this.extraQueryStrings; // eslint-disable-line
    if (!isEmpty(extraQueryStrings)) {
      const extraQueries = JSON.parse(extraQueryStrings);
      for (let key in extraQueries) {
        const value = extraQueries[key];
        query[key] = value;
      }
    }
    const targetModel = this.targetModel;
    if (this.isDRFPagination) { // eslint-disable-line
      query.offset = query.offset * (this.offsetMultiplier || 1);
    }
    const objects = this.store.query(targetModel, query); // eslint-disable-line
    objects.then((result) => {
      const meta = result.meta;
      if (result.links && result.meta.pagination) {
        meta.total = result.meta.pagination.count;
        this.isJsonApiPagination = true; // eslint-disable-line
      }
      if ("count" in result.meta) {
        meta.total = result.meta.count || 0;
        /*
        count is only defined for DRF
        JSONAPI has total
        */
        this.isDRFPagination = true; // eslint-disable-line
      }
      this.isLoading = false; // eslint-disable-line
      return this.meta = meta; // eslint-disable-line
    }).catch((err) => {
      // TODO: Fix all pagination error states and then enable this:
      // this.isLoading = false; // eslint-disable-line
      this.error = err; // eslint-disable-line
      return [];
    })
    return objects;
  }

  @alias('objects.length') objectCount

  @gt('objectCount', 0) hasObjects;

  @equal('meta.count', 0) hasNoObject;

  @alias('meta.total') totalCount;

  @computed('meta.total', 'limit')
  get maxOffset() {
    const limit = this.limit;
    const total = this.meta ? this.meta.total : 0 || 0;
    if (total === 0) {
      return 0;
    }
    return Math.ceil(total / limit) - 1;
  } // `-1` because offset starts from 0

  @computed("maxOffset", "offset")
  get pages() {
    const offset = this.offset;
    const maxOffset = this.maxOffset;
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
  }

  @computed("offset")
  get preDot() {
    return (this.offset - ENV.paginate.pagePadding) > 0;
  }

  @computed("offset", "maxOffset", )
  get postDot() {
    return (this.offset + ENV.paginate.pagePadding) < this.maxOffset;
  }

  @gt("offset", 0) hasPrevious

  @computed('offset', 'maxOffset', )
  get hasNext() {
    return this.offset < this.maxOffset;
  }

  setOffset(offset) {
    this.offset = offset;
  }
}


export default PaginateMixin;
