import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrucksListComponent } from './trucks-list.component';

describe('TrucksListComponent', () => {
  let component: TrucksListComponent;
  let fixture: ComponentFixture<TrucksListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrucksListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrucksListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
