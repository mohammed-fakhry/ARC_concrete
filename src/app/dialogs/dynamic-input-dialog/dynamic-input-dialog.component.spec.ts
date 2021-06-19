import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicInputDialogComponent } from './dynamic-input-dialog.component';

describe('DynamicInputDialogComponent', () => {
  let component: DynamicInputDialogComponent;
  let fixture: ComponentFixture<DynamicInputDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicInputDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
