import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckCustomersListComponent } from './truck-customers-list.component';

describe('TruckCustomersListComponent', () => {
  let component: TruckCustomersListComponent;
  let fixture: ComponentFixture<TruckCustomersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TruckCustomersListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TruckCustomersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
