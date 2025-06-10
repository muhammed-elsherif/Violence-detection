import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestStreamingComponent } from './test-streaming.component';

describe('TestStreamingComponent', () => {
  let component: TestStreamingComponent;
  let fixture: ComponentFixture<TestStreamingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestStreamingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestStreamingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
