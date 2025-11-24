import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateView } from './template-view';

describe('TemplateView', () => {
  let component: TemplateView;
  let fixture: ComponentFixture<TemplateView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
