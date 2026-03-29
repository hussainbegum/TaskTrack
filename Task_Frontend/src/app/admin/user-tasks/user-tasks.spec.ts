import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTasks } from './user-tasks';

describe('UserTasks', () => {
  let component: UserTasks;
  let fixture: ComponentFixture<UserTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTasks],
    }).compileComponents();

    fixture = TestBed.createComponent(UserTasks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
