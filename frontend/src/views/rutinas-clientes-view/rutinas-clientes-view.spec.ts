import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutinasClientesView } from './rutinas-clientes-view';

describe('RutinasClientesView', () => {
  let component: RutinasClientesView;
  let fixture: ComponentFixture<RutinasClientesView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutinasClientesView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RutinasClientesView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
