import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSafeReceiptComponent } from './add-safe-receipt.component';

describe('AddSafeReceiptComponent', () => {
  let component: AddSafeReceiptComponent;
  let fixture: ComponentFixture<AddSafeReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSafeReceiptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSafeReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
