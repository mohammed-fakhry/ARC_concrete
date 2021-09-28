import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCustomersComponent } from './main-customers.component';

describe('MainCustomersComponent', () => {
  let component: MainCustomersComponent;
  let fixture: ComponentFixture<MainCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainCustomersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
