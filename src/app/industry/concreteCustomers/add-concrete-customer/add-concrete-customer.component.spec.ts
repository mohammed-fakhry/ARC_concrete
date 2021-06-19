import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConcreteCustomerComponent } from './add-concrete-customer.component';

describe('AddConcreteCustomerComponent', () => {
  let component: AddConcreteCustomerComponent;
  let fixture: ComponentFixture<AddConcreteCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddConcreteCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddConcreteCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
