import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTruckCustomerComponent } from './add-truck-customer.component';

describe('AddTruckCustomerComponent', () => {
  let component: AddTruckCustomerComponent;
  let fixture: ComponentFixture<AddTruckCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTruckCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTruckCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
