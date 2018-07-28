import {MatSort} from '@angular/material';
import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {DatePipe} from '@angular/common';
import {Message} from '../../../w-bullhorn/messages/message.model';

export class TableDataSource extends DataSource<any> {

  private _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  private _sortChange = new BehaviorSubject<object>({});

  private _pageChange = new BehaviorSubject<number>(1);

  get pageIndex(): number {
    return this._pageChange.value;
  }

  set pageIndex(pageIndex: number) {
    this._pageChange.next(pageIndex);
  }

  pageSize: number = 10;

  dataCount: number;

  constructor(private data, private _sort: MatSort, private displayedColumns: object, private datePipe: DatePipe, private pagination: Boolean) {
    super();

    this.dataCount = this.data.length;

    this._sort.sortChange.subscribe(options => {
      this._sortChange.next(options)
    })
  }

  setPageSize(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Array<any>> {

    const displayDataChanges = [
      this._sortChange,
      this._filterChange,
      this._pageChange,
    ];

    return Observable.combineLatest(...displayDataChanges, (sortOptions, filterOptions, pageIndex) => {
      let data = this.data.slice();

      data = this.getFilteredData(data);
      this.dataCount = data.length;

      data = this.getSortedData(data);
      data = this.getPaginatedData(data);

      return data;
    }).map((formattedData) => {
      return formattedData;
    });

  }

  disconnect() {
  }


  /** Returns a sorted copy of the database data. */
  getSortedData(data): Message[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: Date | string = '';
      let propertyB: Date | string = '';

      const fieldName = this._sort.active;
      [propertyA, propertyB] = [a[fieldName], b[fieldName]];

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }

  getFilteredData(data): Message[] {
    return data.filter((item: Message) => {
      const searchStr = Object.keys(this.displayedColumns).reduce((res, column) => {
        let value = item[column];
        if (column.toLowerCase().endsWith('date')) {
          value = this.datePipe.transform(value, 'medium');
        }
        return res.concat(value);
      }, '').toLowerCase();
      return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
    });
  }

  getPaginatedData(data): Message[] {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    if (!this.pagination) {
      return data.splice(startIndex, this.dataCount);
    }
    return data.splice(startIndex, this.pageSize)

  }
}
