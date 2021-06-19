import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConcreteComponent } from './add-concrete.component';

describe('AddConcreteComponent', () => {
  let component: AddConcreteComponent;
  let fixture: ComponentFixture<AddConcreteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddConcreteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddConcreteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
