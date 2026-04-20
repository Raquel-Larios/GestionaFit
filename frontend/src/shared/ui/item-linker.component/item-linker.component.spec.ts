import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemLinkerComponent } from './item-linker.component';

describe('ItemLinkerComponent', () => {
  let component: ItemLinkerComponent;
  let fixture: ComponentFixture<ItemLinkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemLinkerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemLinkerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
