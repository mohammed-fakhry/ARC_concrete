import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddtruckOrderComponent } from './addtruck-order.component';

describe('AddtruckOrderComponent', () => {
  let component: AddtruckOrderComponent;
  let fixture: ComponentFixture<AddtruckOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddtruckOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddtruckOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
