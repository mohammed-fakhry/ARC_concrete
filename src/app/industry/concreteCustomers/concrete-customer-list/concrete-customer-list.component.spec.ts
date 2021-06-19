import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcreteCustomerListComponent } from './concrete-customer-list.component';

describe('ConcreteCustomerListComponent', () => {
  let component: ConcreteCustomerListComponent;
  let fixture: ComponentFixture<ConcreteCustomerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConcreteCustomerListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcreteCustomerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
