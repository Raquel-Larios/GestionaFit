import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoView } from './video-view';

describe('VideoView', () => {
  let component: VideoView;
  let fixture: ComponentFixture<VideoView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
