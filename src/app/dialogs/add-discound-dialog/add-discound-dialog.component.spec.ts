import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDiscoundDialogComponent } from './add-discound-dialog.component';

describe('AddDiscoundDialogComponent', () => {
  let component: AddDiscoundDialogComponent;
  let fixture: ComponentFixture<AddDiscoundDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDiscoundDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDiscoundDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
