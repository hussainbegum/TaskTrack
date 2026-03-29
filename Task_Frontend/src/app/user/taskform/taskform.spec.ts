import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Taskform } from './taskform';

describe('Taskform', () => {
  let component: Taskform;
  let fixture: ComponentFixture<Taskform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Taskform],
    }).compileComponents();

    fixture = TestBed.createComponent(Taskform);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
