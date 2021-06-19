import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherAccInformationComponent } from './other-acc-information.component';

describe('OtherAccInformationComponent', () => {
  let component: OtherAccInformationComponent;
  let fixture: ComponentFixture<OtherAccInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherAccInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherAccInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
