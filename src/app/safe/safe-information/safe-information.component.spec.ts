import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SafeInformationComponent } from './safe-information.component';

describe('SafeInformationComponent', () => {
  let component: SafeInformationComponent;
  let fixture: ComponentFixture<SafeInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SafeInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SafeInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
