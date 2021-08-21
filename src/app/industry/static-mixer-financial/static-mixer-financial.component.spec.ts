import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticMixerFinancialComponent } from './static-mixer-financial.component';

describe('StaticMixerFinancialComponent', () => {
  let component: StaticMixerFinancialComponent;
  let fixture: ComponentFixture<StaticMixerFinancialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaticMixerFinancialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticMixerFinancialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
