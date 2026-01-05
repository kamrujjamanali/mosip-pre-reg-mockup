import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Demographic } from './demographic';

describe('Demographic', () => {
  let component: Demographic;
  let fixture: ComponentFixture<Demographic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Demographic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Demographic);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
