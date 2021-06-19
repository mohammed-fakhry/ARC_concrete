import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcreteBonListComponent } from './concrete-bon-list.component';

describe('ConcreteBonListComponent', () => {
  let component: ConcreteBonListComponent;
  let fixture: ComponentFixture<ConcreteBonListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConcreteBonListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcreteBonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
