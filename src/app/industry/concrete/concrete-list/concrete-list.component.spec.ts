import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcreteListComponent } from './concrete-list.component';

describe('ConcreteListComponent', () => {
  let component: ConcreteListComponent;
  let fixture: ComponentFixture<ConcreteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConcreteListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcreteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
