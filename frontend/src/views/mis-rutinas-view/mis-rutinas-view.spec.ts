import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisRutinasView } from './mis-rutinas-view';

describe('MisRutinasView', () => {
  let component: MisRutinasView;
  let fixture: ComponentFixture<MisRutinasView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisRutinasView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisRutinasView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
