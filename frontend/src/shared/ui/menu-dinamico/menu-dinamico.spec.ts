import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuDinamico } from './menu-dinamico';

describe('MenuDinamico', () => {
  let component: MenuDinamico;
  let fixture: ComponentFixture<MenuDinamico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuDinamico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuDinamico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
