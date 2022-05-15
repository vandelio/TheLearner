import { Component } from '@angular/core';
import { NavController, PopoverController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';
import { Http, Headers, RequestOptions} from '@angular/http';

import { LevelsPage } from '../levels/levels';
import { PopoverPage } from '../popover/popover';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
    topics: any;
    topic:string[];
    levels: any;
    questions: any;
    constructor(public navCtrl: NavController, public popoverCtrl: PopoverController,public statusBar: StatusBar,private storage: Storage, public http: Http) {
        this.topics = [];
        this.levels = [];
        this.questions = [];
        this.statusBar.overlaysWebView(true);
        this.statusBar.hide();
        this.getLevels();


    }
     getHeaders(){
        var headers = new Headers();
    //        headers.append('Access-Control-Allow-Methods', 'GET');
            headers.append('Accept','application/json');
            headers.append('content-type','application/json');
            let options = new RequestOptions({ headers:headers, withCredentials: true});
            return options;
    }
    getLevels(){
//        this.levels = this.getFromStorageStandard('levels');
//        this.storagetype = 'local';

        let options = this.getHeaders();

        this.http.get('https://vandel.io/wp-json/wp/v2/LPlevels?per_page=99&filter[orderby]=id&order=asc', options).map(res => res.json()).subscribe(levels => {
//            response = JSON.parse(JSON.stringify(response));
            let tmpArray2 = [];
//            this.storagetype = 'server';
            for (let item of levels) {
                tmpArray2.push({
                    id: item.id,
                    title: item.title.rendered.replace(/\"([^(\")"]+)\":/g,"$1:"),
                    imgpath: item.imgpath,
                    note:item.note,
                    topicid:item.topicid,
                    component:item.component
                })
            }
            let newRes  = tmpArray2;
            this.setInStorage('levels',newRes);
            this.levels = newRes;
            console.log(JSON.stringify(newRes));
            console.log('got levels');

            }, err => {
          console.log(err);
        });

    }
    setInStorage(name,value){
        this.storage.set(name, value);
    }
    presentRadioPopover(ev: UIEvent) {
     let popover = this.popoverCtrl.create(PopoverPage);

     popover.present({
       ev: ev
     });
   }

    goToLevels(event,item){
        // That's right, we're pushing to ourselves!
          this.navCtrl.push(LevelsPage, {
            Tid:104,
            levels:this.levels
        });
    }


}
