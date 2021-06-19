import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewSafeComponent } from './add-new-safe.component';

describe('AddNewSafeComponent', () => {
  let component: AddNewSafeComponent;
  let fixture: ComponentFixture<AddNewSafeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewSafeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewSafeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
