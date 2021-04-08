import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { UserSegmentationDatabaseComponent } from "./user-segmentation-database.component";

describe("UserSegmentationDatabaseComponent", () => {
    let component: UserSegmentationDatabaseComponent;
    let fixture: ComponentFixture<UserSegmentationDatabaseComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ UserSegmentationDatabaseComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserSegmentationDatabaseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
