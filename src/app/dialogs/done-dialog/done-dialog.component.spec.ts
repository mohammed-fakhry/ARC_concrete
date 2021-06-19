import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoneDialogComponent } from './done-dialog.component';

describe('DoneDialogComponent', () => {
  let component: DoneDialogComponent;
  let fixture: ComponentFixture<DoneDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoneDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoneDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
