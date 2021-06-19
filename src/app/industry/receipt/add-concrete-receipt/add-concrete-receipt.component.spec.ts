import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConcreteReceiptComponent } from './add-concrete-receipt.component';

describe('AddConcreteReceiptComponent', () => {
  let component: AddConcreteReceiptComponent;
  let fixture: ComponentFixture<AddConcreteReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddConcreteReceiptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddConcreteReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
