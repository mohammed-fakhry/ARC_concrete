import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOtherAccComponent } from './add-other-acc.component';

describe('AddOtherAccComponent', () => {
  let component: AddOtherAccComponent;
  let fixture: ComponentFixture<AddOtherAccComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOtherAccComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOtherAccComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
