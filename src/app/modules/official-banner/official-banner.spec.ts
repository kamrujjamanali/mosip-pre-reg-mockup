import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficialBanner } from './official-banner';

describe('OfficialBanner', () => {
  let component: OfficialBanner;
  let fixture: ComponentFixture<OfficialBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficialBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficialBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
