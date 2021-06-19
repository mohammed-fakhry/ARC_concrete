import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckInformationComponent } from './truck-information.component';

describe('TruckInformationComponent', () => {
  let component: TruckInformationComponent;
  let fixture: ComponentFixture<TruckInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TruckInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TruckInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
