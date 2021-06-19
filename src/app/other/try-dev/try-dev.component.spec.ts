import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TryDevComponent } from './try-dev.component';

describe('TryDevComponent', () => {
  let component: TryDevComponent;
  let fixture: ComponentFixture<TryDevComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TryDevComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TryDevComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
