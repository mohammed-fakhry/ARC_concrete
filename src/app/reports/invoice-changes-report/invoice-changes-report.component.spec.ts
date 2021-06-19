import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceChangesReportComponent } from './invoice-changes-report.component';

describe('InvoiceChangesReportComponent', () => {
  let component: InvoiceChangesReportComponent;
  let fixture: ComponentFixture<InvoiceChangesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceChangesReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceChangesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
