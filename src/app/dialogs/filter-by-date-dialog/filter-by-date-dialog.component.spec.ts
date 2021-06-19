import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterByDateDialogComponent } from './filter-by-date-dialog.component';

describe('FilterByDateDialogComponent', () => {
  let component: FilterByDateDialogComponent;
  let fixture: ComponentFixture<FilterByDateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterByDateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterByDateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
