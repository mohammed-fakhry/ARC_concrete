import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockingListComponent } from './stocking-list.component';

describe('StockingListComponent', () => {
  let component: StockingListComponent;
  let fixture: ComponentFixture<StockingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockingListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
