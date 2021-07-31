import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaxesListComponent } from './add-taxes-list.component';

describe('AddTaxesListComponent', () => {
  let component: AddTaxesListComponent;
  let fixture: ComponentFixture<AddTaxesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTaxesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTaxesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
