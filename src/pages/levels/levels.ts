import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { InnerQuestionsPage } from '../innerquestions/innerquestions';
//import {Observable} from 'rxjs/Observable';
//import 'rxjs/add/observable/timer';
//import 'rxjs/add/operator/map';
//import 'rxjs/add/operator/take';

@Component({
  selector: 'page-levels',
  templateUrl: 'levels.html'
})
export class LevelsPage {
    selectedItem: any;
    storedlevels: any;
    levels: any;
    innerLevels: Array<{name:string,order:number,levelid:Array<{id:number}>}>;
    storagetype: any;
    items: any;
    icons: string[];
    questions: any
    questionsRound: Array<{id: number, question: string, note: string, answar:string, questiontype:string, answartype:string, levelid:number,topicid:number, component:any}>;
    answaroptions: Array<{ answar: string, answartype: string, correct: boolean , handler: any}>;
    arrayIn: string[];
    randOption: Array<{id: number, question: string, note: string, answar:string, questiontype:string, answartype:string, levelid:number,topicid:number, component:any}>;
    userXpUntilNextlevel:number;
    timeLeft: any;
    counter:number;
    page:any;
    topicid:number;
    tmpArray:any;
    collector:Array<{id: number, question: string, note: string, answar:string, questiontype:string, answartype:string, levelid:number,topicid:number, component:any}>;
    difficulties:any;
    difficultyIncreased:boolean = false;
////  items: Array<{title: string, note: string, icon: string}>;
//
  constructor(public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, private storage: Storage) {
    this.page = navParams.get('items');
    this.topicid = 104;
//    this.levels = navParams.get('levels');
    this.questions = navParams.get('questions');
    // Prepare innerLevels for next page
    this.innerLevels = [
        {name:'Teori',order:1,levelid:[{id:110},{id:113},{id:117},{id:119},{id:121},{id:585},{id:587},{id:640},{id:642},{id:644}]},
        {name:'Spark',order:2,levelid:[{id:110},{id:113},{id:117},{id:119},{id:121},{id:585},{id:587},{id:640},{id:642},{id:644}]},
        {name:'Håndteknik',order:3,levelid:[{id:110},{id:113},{id:117},{id:119},{id:121},{id:585},{id:587},{id:640},{id:642},{id:644}]},
        {name:'Stand',order:4,levelid:[{id:110},{id:113},{id:117},{id:119},{id:121},{id:585},{id:587},{id:640},{id:642},{id:644}]},
        {name:'Diverse',order:5,levelid:[{id:110},{id:113},{id:116},{id:117},{id:119},{id:121},{id:585},{id:587},{id:640},{id:642},{id:644}]},
    ];
    this.setInStorage('innerLevels',this.innerLevels);


    this.difficulties = [
        {id:0, title:'Koreask > Dansk'},
        {id:1, title:'Dansk > Koreansk'},
    ];
    this.setInStorage('difficulties',this.difficulties);

    this.items = [];
    this.collector = [];
//    this.levels = [];
//    this.tmpArray = [];
    this.storagetype = 'local';
  }

    toggleDifficulties(){
        this.difficultyIncreased = !this.difficultyIncreased;
        // console.log(this.difficultyIncreased);
    }
    log(){
    // console.log('log');
    }

    ionViewDidLoad(){
        this.getFromStorageStandard('levels');
    }
    setInStorage(name,value){
        this.storage.set(name, value);
    }
    getFromStorageStandard(table){
        this.storage.get(table).then((result) => {
            if(table == 'topics'){
//                this.topics = result;
            }else if(table == 'levels'){
//                this.levels = result;

                for(let item of result){
                    if ( item.topicid == this.topicid){
                       this.collector.push(item);
                    }
                }
                this.levels = this.collector;

            }else if(table == 'questions'){
//                this.questions = result;
            }

        }).catch((error) => {
          console.log('shit happend');
        });

    }
  getRandomFromArray(value){
      let rand = value[Math.floor(Math.random() * value.length)];
      return rand;
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
      this.navCtrl.push(InnerQuestionsPage, {
        specific:'false',
        topicid:this.topicid,
        items: item,
        title: item.title,
        levelid:item.id,
        levels:this.levels,
        questions:this.questions,
        difficulties:this.difficulties,
        difficultyChanged:this.difficultyIncreased
    });
  }
}
