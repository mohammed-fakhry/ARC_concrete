import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasherDialogComponent } from './casher-dialog.component';

describe('CasherDialogComponent', () => {
  let component: CasherDialogComponent;
  let fixture: ComponentFixture<CasherDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CasherDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CasherDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
