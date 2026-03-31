import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DekraUserLibComponent } from './dekra-user-lib.component';

describe('DekraUserLibComponent', () => {
  let component: DekraUserLibComponent;
  let fixture: ComponentFixture<DekraUserLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DekraUserLibComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DekraUserLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
