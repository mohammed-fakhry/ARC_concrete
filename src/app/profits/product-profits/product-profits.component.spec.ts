import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductProfitsComponent } from './product-profits.component';

describe('ProductProfitsComponent', () => {
  let component: ProductProfitsComponent;
  let fixture: ComponentFixture<ProductProfitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductProfitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductProfitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
