import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcreteReceiptListComponent } from './concrete-receipt-list.component';

describe('ConcreteReceiptListComponent', () => {
  let component: ConcreteReceiptListComponent;
  let fixture: ComponentFixture<ConcreteReceiptListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConcreteReceiptListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcreteReceiptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
