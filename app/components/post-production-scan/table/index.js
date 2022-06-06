import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PostProductionScanTableComponent extends Component {
  @tracked allTableResults = this.args.totalTableData;
  @tracked currentPageResults = this.args.tableData.result
    .slice(0, 5)
    .map((item, idx) => ({
      ...item,
      name: 'Appknox',
      index: 1 + idx,
    }));

  get allResultCount() {
    return this.args.totalTableData.length;
  }

  @action getPage({ startIdx, endOffset, selectedItemsPerPage }) {
    let currentPageItems = [];
    if (this.allResultCount > selectedItemsPerPage) {
      currentPageItems = this.allTableResults.slice(startIdx - 1, endOffset);
    } else {
      currentPageItems = this.allTableResults;
    }

    this.currentPageResults = currentPageItems.map((item, idx) => ({
      ...item,
      name: 'Appknox',
      index: startIdx + idx,
    }));
  }

  @action goToNextPage({ startIdx, endOffset, selectedItemsPerPage }) {
    this.getPage({
      startIdx,
      endOffset,
      selectedItemsPerPage,
    });
  }

  @action goToPrevPage({ startIdx, endOffset, selectedItemsPerPage }) {
    this.getPage({
      startIdx,
      endOffset,
      selectedItemsPerPage,
    });
  }
}
