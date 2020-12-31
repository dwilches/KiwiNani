import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PracticeGameComponent } from './practice-game.component';

describe('PracticeGameComponent', () => {
  let component: PracticeGameComponent;
  let fixture: ComponentFixture<PracticeGameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PracticeGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
