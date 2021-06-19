import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherAccComponent } from './other-acc.component';

describe('OtherAccComponent', () => {
  let component: OtherAccComponent;
  let fixture: ComponentFixture<OtherAccComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherAccComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherAccComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
