import { Component, OnInit } from "@angular/core";

@Component({
    selector: "cr-tutorial",
    templateUrl: "./tutorial.component.html",
    styleUrls: ["./tutorial.component.scss"]
})
export class TutorialComponent implements OnInit {

    public schema = {
        "@context": "http://schema.org",
        "@type": "WebPage",
        "name": "Tutorial",
        "license": "https://creativecommons.org/licenses/by/4.0/"
    };

    constructor() { }

    ngOnInit() { }

}
