import { Component, Input, EventEmitter, Output, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() page: number = 1;
  @Input() count: number = 0;
  @Input() perPage: number = 10;
  @Input() pagesToShow: number = 8;

  pages: number[] = [];

  @Output() goPage = new EventEmitter<number>();

  ngOnInit() {

  }

  ngOnChanges(changes) {
    this.updatePages();
    if (changes.perPage || changes.count) {
      this.page = 1;
      this.goPage.emit(1);
    }
  }

  getMin(): number {
    return ((this.perPage * this.page) - this.perPage) + 1;
  }

  getMax(): number {
    let max = this.perPage * this.page;
    if (max > this.count) {
      max = this.count;
    }
    return max;
  }

  onPage(n: number): void {
    this.updatePages();
    this.goPage.emit(n);
  }

  onPrev(): void {
    if (this.firstPage()) {
      return;
    }
    this.updatePages();
    this.goPage.emit(this.page - 1);
  }

  onNext(): void {
    if (this.lastPage()) {
      return;
    }
    this.updatePages();
    this.goPage.emit(this.page + 1);
  }

  onFirst(): void {
    if (this.firstPage()) {
      return;
    }
    this.updatePages();
    this.goPage.emit(1);
  }

  onLast(): void {
    if (this.lastPage()) {
      return;
    }
    this.updatePages();
    this.goPage.emit(this.totalPages());
  }

  totalPages(): number {
    return Math.ceil(this.count / this.perPage) || 0;
  }

  lastPage(): boolean {
    return this.perPage * this.page >= this.count;
  }

  firstPage(): boolean {
    return this.page === 1;
  }

  updatePages(): void {
    const totalPages = Math.ceil(this.count / this.perPage) || 1;
    const currentPage = this.page ;
    const pagesToShow = this.pagesToShow;
    const sidePages = (pagesToShow / 2);

    const rangePagesBefore = Array(sidePages).fill(currentPage).map((x, y) => x + y);
    const rangePagesAfter = Array(sidePages).fill(currentPage - 1).map((x, y) => x - y);

    this.pages = [...rangePagesBefore, ...rangePagesAfter]
                  .filter(page => page >= 1 && page <= totalPages)
                  .sort((x, y) => x - y);

  }
}
