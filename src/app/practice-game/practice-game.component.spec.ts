import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeGameComponent } from './practice-game.component';

describe('PracticeGameComponent', () => {
  let component: PracticeGameComponent;
  let fixture: ComponentFixture<PracticeGameComponent>;

  beforeEach(async(() => {
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
