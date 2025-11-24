import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDinamico } from './form-dinamico';

describe('FormDinamico', () => {
  let component: FormDinamico;
  let fixture: ComponentFixture<FormDinamico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDinamico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormDinamico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
