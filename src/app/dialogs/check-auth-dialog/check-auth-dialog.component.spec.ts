import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckAuthDialogComponent } from './check-auth-dialog.component';

describe('CheckAuthDialogComponent', () => {
  let component: CheckAuthDialogComponent;
  let fixture: ComponentFixture<CheckAuthDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckAuthDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckAuthDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
