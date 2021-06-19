import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCheckComponent } from './add-check.component';

describe('AddCheckComponent', () => {
  let component: AddCheckComponent;
  let fixture: ComponentFixture<AddCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
