import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchInvoiceDialogComponent } from './search-invoice-dialog.component';

describe('SearchInvoiceDialogComponent', () => {
  let component: SearchInvoiceDialogComponent;
  let fixture: ComponentFixture<SearchInvoiceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchInvoiceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchInvoiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
