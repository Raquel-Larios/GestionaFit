import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteOptionComponent } from './cliente-option.component';

describe('ClienteOptionComponent', () => {
  let component: ClienteOptionComponent;
  let fixture: ComponentFixture<ClienteOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteOptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteOptionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
