import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialView } from './material-view';

describe('MaterialView', () => {
  let component: MaterialView;
  let fixture: ComponentFixture<MaterialView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
