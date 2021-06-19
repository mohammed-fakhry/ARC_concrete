import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConcreteBonComponent } from './add-concrete-bon.component';

describe('AddConcreteBonComponent', () => {
  let component: AddConcreteBonComponent;
  let fixture: ComponentFixture<AddConcreteBonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddConcreteBonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddConcreteBonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
