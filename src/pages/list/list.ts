import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http, Headers, RequestOptions} from '@angular/http';

import {LevelsPage } from '../levels/levels';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  selectedItem: any;
  page: any;
  icons: string[];
    topics: any;//Array<{id:number, title: string, note:string, imgpath:string, component:any}>;
    levels: any;
    innerLevels:any;
    questions: any;
    data:any;
    storagetype:any;
    items: Array<{ title: string,note:string, levelsid: number, imgpath:string, component:any}>;
//  items: Array<{title: string, note: string, icon: string}>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage,public http: Http) {
    // If we navigated to this page, we will have an item available as a nav param
    this.page = navParams.get('item');
    this.data = [];
    this.topics = [];
    this.levels = [];
    this.questions = [];
    this.innerLevels = [
                {name:'Teori',order:1,levelid:[{id:110},{id:113}]},
                {name:'Spark',order:2,levelid:[{id:110},{id:113}]},
                {name:'Håndteknik',order:3,levelid:[{id:110},{id:113}]},
                {name:'Stand',order:4,levelid:[{id:110},{id:113}]},
                {name:'Diverse',order:5,levelid:[{id:113}]},
    ];
    this.setInStorage('innerLevels',this.innerLevels);

  }
    ionViewDidLoad(){
        this.getTopics();
    }
    stripquotes(a) {
    if (a.charAt(0) === '"' && a.charAt(a.length-1) === '"') {
        return a.substr(1, a.length-2);
    }
    return a;
}
    getHeaders(){
        var headers = new Headers();
    //        headers.append('Access-Control-Allow-Methods', 'GET');
            headers.append('Accept','application/json');
            headers.append('content-type','application/json');
            let options = new RequestOptions({ headers:headers, withCredentials: true});
            return options;
    }

    getTopics(){
        this.topics = this.getFromStorageStandard('topics');
        this.storagetype = 'local';

        let options = this.getHeaders();

        this.http.get('https://vandel.io/wp-json/wp/v2/LPtopics?per_page=99', options).map(res => res.json()).subscribe(response => {
//            response = JSON.parse(JSON.stringify(response));
            let tmpArray = [];
            this.storagetype = 'server';
            for (let item of response) {
                tmpArray.push({
                    id: item.id,
                    title: item.title.rendered.replace(/\"([^(\")"]+)\":/g,"$1:"),
                    imgpath: item.imgpath,
                    note:item.note,
                    component:item.component,
                    levelid:item.levelid
                })

            }
            let newRes  = tmpArray;
            this.setInStorage('topics',newRes);
            this.topics = newRes;
            console.log(JSON.stringify(newRes));
            console.log('got topics');
            }, err => {
          console.log(err);
        });

    }

    removeCharInString(str){
        return str.replace('"','');
    }


    getFromStorageStandard(table){
        this.storage.get(table).then((result) => {
            if(table == 'topics'){
                this.topics = result;
            }else if(table == 'levels'){
                this.levels = result;
            }else if(table == 'questions'){
                this.questions = result;
            }

        });

    }

    setInStorage(name,value){
        this.storage.set(name, value);
    }

  getRandomFromArray(value){
      let rand = value[Math.floor(Math.random() * value.length)];
      return rand;
  }
  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(LevelsPage, {
      items: item,
      Tid: item.id,
      topicid:104,
      levelid: item.levelid
    });
  }
}
