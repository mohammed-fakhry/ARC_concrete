import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcreteProfitsComponent } from './concrete-profits.component';

describe('ConcreteProfitsComponent', () => {
  let component: ConcreteProfitsComponent;
  let fixture: ComponentFixture<ConcreteProfitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConcreteProfitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcreteProfitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
