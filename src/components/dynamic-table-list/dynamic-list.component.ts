import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  Output,
  ViewChild,
  EventEmitter,
  TemplateRef,
  AfterViewInit
} from '@angular/core';
import { SubscriptionList } from '@angular/flex-layout';
import { MatDialog, MatIconRegistry, MatPaginator, MatSort } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { TableDataSource } from './table-data-source';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'dynamic-table-list',
  templateUrl: './dynamic-list.component.html',
  styleUrls: ['./dynamic-list.component.scss'],
  providers: [DatePipe]
})
export class DynamicListComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() displayedColumns: string[];
  @Input() actions: string[];
  @Input() data: Array<any>;
  @Input() pagination: boolean = true;
  @Input() finishedLoading;

  // work around for Angular Material sort bug -> undefined and null values are not sorted correctly
  // -1 will be passed instead, but this wil work only if table is displaying prime numbers
  @Input() primeNumbers: boolean = false;
  @Input() dateType: string = 'medium';

  @Input() template: TemplateRef<any>;

  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('filter') filter: ElementRef;

  dataSource: TableDataSource | null;

  displayedColumnsWithActions: any = {};

  currentPage: number = 1;

  dataCount: number;

  pageSize = 10;

  private subscribes: SubscriptionList = [];

  private loading: boolean = true;

  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {
    iconRegistry.addSvgIcon(
      'edit',
      sanitizer.bypassSecurityTrustResourceUrl('assets/svg-icons/icon-edit.svg')
    );
    iconRegistry.addSvgIcon(
      'remove',
      sanitizer.bypassSecurityTrustResourceUrl('assets/svg-icons/icon-trash.svg')
    );
  }

  ngOnInit() {
    this.displayedColumnsWithActions = Object.assign({}, this.displayedColumns);
    if (this.actions && this.actions.length) {
      this.displayedColumnsWithActions['actions'] = this.actions;
    }
    const sub = Observable.fromEvent(this.filter.nativeElement, 'keyup')
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;

        this.dataCount = this.dataSource.dataCount;
        this.pageChange(1);
      });

    this.subscribes.push(sub);
  }

  ngAfterViewInit() {}

  ngOnChanges(changes) {
    this.dataCount = this.data.length;
    if (changes.data && changes.data.firstChange === false || this.finishedLoading === true) {
      this.loading = false;
    }
    this.dataSource = new TableDataSource(
      this.data,
      this.sort,
      this.displayedColumns,
      this.datePipe,
      this.pagination
    );
  }

  ngOnDestroy() {
    this.subscribes.map(sub => sub.unsubscribe());
  }

  onDeleteAction(item) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);
    dialogRef.componentInstance.onConfirm.subscribe(data => {
      this.onDelete.emit(item);
    });
  }

  onEditAction(item) {
    this.onEdit.emit(item);
  }

  pageChange(pageIndex) {
    this.currentPage = pageIndex;
    this.dataSource.pageIndex = pageIndex;
  }

  limitChange(limit) {
    this.pageSize = limit;
    this.dataSource.setPageSize(limit);
  }

  stripTags(cellValue: string | number, column: string): string | number {
    if (column === 'title') {
      return cellValue ? String(cellValue).replace(/<[^>]+>/gm, '') : '';
    } else {
      return cellValue;
    }
  }
}
