import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectLanguaeModal } from './select-languae-modal';

describe('SelectLanguaeModal', () => {
  let component: SelectLanguaeModal;
  let fixture: ComponentFixture<SelectLanguaeModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectLanguaeModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectLanguaeModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
