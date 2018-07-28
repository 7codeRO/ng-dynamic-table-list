import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'pagination-items-no',
  templateUrl: './pagination-items-no.html',
  styleUrls: ['./pagination-items-no.scss']
})

export class PaginationItemsNoComponent implements OnInit, OnChanges {

  @Input() itemCount;
  @Input() limit;
  @Input() showAll;
  @Output() onLimitChange  = new EventEmitter<any>();

  itemSelection: Array<any> = [];

  constructor() {

  }

  ngOnInit() {
    this.itemCount = 0;
  }

  ngOnChanges(changes) {
    if (changes.itemCount) {
      this.itemCount = changes.itemCount.currentValue;
      this.setPageSelections();
    }
  }

  setPageSelections() {
    this.itemSelection = [];
    if (this.itemCount > 10) {
      this.itemSelection.push({ name: '10', value: 10 });
    }
    if (this.itemCount > 21) {
      this.itemSelection.push({ name: '20', value: 20 });
    }
    if (this.itemCount > 51) {
      this.itemSelection.push({ name: '50', value: 50 });
    }
    if (this.showAll || this.itemSelection.length === 0 ) {
      this.itemSelection.push({ name: 'All', value: this.itemCount });
    }
  }

  selectNo(item) {
    this.onLimitChange.emit(item);
  }
}
