import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckOrdetListComponent } from './truck-ordet-list.component';

describe('TruckOrdetListComponent', () => {
  let component: TruckOrdetListComponent;
  let fixture: ComponentFixture<TruckOrdetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TruckOrdetListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TruckOrdetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
