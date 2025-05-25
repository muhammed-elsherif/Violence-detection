import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMagementNavComponent } from './developer-magement-nav.component';

describe('UserMagementNavComponent', () => {
  let component: UserMagementNavComponent;
  let fixture: ComponentFixture<UserMagementNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMagementNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMagementNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
