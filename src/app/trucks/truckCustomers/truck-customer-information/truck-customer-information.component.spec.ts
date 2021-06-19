import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckCustomerInformationComponent } from './truck-customer-information.component';

describe('TruckCustomerInformationComponent', () => {
  let component: TruckCustomerInformationComponent;
  let fixture: ComponentFixture<TruckCustomerInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TruckCustomerInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TruckCustomerInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
