import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorView } from './error-view';

describe('ErrorView', () => {
  let component: ErrorView;
  let fixture: ComponentFixture<ErrorView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
