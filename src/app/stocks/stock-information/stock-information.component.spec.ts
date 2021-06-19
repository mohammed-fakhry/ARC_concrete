import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockInformationComponent } from './stock-information.component';

describe('StockInformationComponent', () => {
  let component: StockInformationComponent;
  let fixture: ComponentFixture<StockInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
