import { Component } from '@angular/core';
import { Platform, NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
//import { NativeAudio } from '@ionic-native/native-audio';
import { Storage } from '@ionic/storage';
//import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { InnerQuestionsPage } from '../innerquestions/innerquestions';


@Component({
  selector: 'page-questionlist',
  templateUrl: 'questionlist.html'
})
export class QuestionListPage {
    selectedItem: any;
    questions: any; //Array<{id: number, audio: string, question: string, note: string, answar:string, questiontype:string, answartype:string, levelid:number,topicid:number, component:any}>;
    questionsRound: Array<{id: number, question: string, note: string, answar:string, questiontype:string, answartype:string, levelid:number,topicid:number, component:any}>;
    answaroptions: Array<{ answar: string, answartype: string, correct: boolean , handler: any}>;
    arrayIn: string[];
    randOption: Array<{id: number, question: string, note: string, answar:string, questiontype:string, answartype:string, levelid:number,topicid:number, component:any}>;
    userXpUntilNextlevel:number;
    timeLeft: any;
    counter:number;
    page:any;
    levels:any;
    questionSound:string[];
////  items: Array<{title: string, note: string, icon: string}>;
//
  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController,  private storage: Storage) {
//      this.selectedItem = navParams.get('selectedItem');
    this.levels;
    this.page = navParams.get('items');
      this.questions = [];

  }
    ionViewDidLoad(){
        this.getFromStorageStandard('allquestions');
    }
    getFromStorageStandard(table){
        this.storage.get(table).then((result) => {
            if(table == 'topics'){
//                this.topics = result;
            }else if(table == 'levels'){
               this.levels = result;
            }else if(table == 'allquestions'){
                this.questions = result;
            }

        }).catch((e)=>{
          console.log(e);
        });

    }
    itemTapped(event, item) {
        // That's right, we're pushing to ourselves!
        this.navCtrl.push(InnerQuestionsPage, {
          specific: 'true',
          items: item,
          title: item.question,
          levelid: item.levelid,
          topicid: 104,
        });
      }

}
