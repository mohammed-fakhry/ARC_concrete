import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcreteFinancialComponent } from './concrete-financial.component';

describe('ConcreteFinancialComponent', () => {
  let component: ConcreteFinancialComponent;
  let fixture: ComponentFixture<ConcreteFinancialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConcreteFinancialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcreteFinancialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
