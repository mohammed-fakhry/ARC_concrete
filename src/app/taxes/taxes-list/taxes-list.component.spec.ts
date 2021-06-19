import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxesListComponent } from './taxes-list.component';

describe('TaxesListComponent', () => {
  let component: TaxesListComponent;
  let fixture: ComponentFixture<TaxesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
