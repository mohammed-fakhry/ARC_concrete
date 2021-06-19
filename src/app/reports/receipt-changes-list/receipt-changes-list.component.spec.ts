import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptChangesListComponent } from './receipt-changes-list.component';

describe('ReceiptChangesListComponent', () => {
  let component: ReceiptChangesListComponent;
  let fixture: ComponentFixture<ReceiptChangesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiptChangesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptChangesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
