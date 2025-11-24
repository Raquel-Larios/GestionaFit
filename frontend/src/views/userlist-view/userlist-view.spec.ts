import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserlistView } from './userlist-view';

describe('UserlistView', () => {
  let component: UserlistView;
  let fixture: ComponentFixture<UserlistView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserlistView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserlistView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
