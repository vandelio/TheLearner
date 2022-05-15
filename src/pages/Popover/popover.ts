import { Component,ViewChild } from '@angular/core';
import {  ViewController,Slides} from 'ionic-angular';

@Component({
  selector: 'page-popover',
  templateUrl: 'popover.html'
})
export class  PopoverPage {
    @ViewChild(Slides) slides: Slides;
     constructor(public viewCtrl: ViewController) {}

    goToSlide() {
        this.slides.slideTo(2, 500);
    }
    
    close() {
        this.viewCtrl.dismiss();
    }
}
