import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcreteCustomerInformationComponent } from './concrete-customer-information.component';

describe('ConcreteCustomerInformationComponent', () => {
  let component: ConcreteCustomerInformationComponent;
  let fixture: ComponentFixture<ConcreteCustomerInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConcreteCustomerInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcreteCustomerInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
