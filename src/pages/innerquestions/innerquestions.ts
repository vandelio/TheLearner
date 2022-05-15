import { Component } from '@angular/core';
import { Platform, NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { NativeAudio } from '@ionic-native/native-audio';
import { Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

@Component({
  selector: 'page-innerquestions',
  templateUrl: 'innerquestions.html'
})
export class InnerQuestionsPage {
    selectedItem: any;
    allquestions:any;
    userdata:any;
    questions: Array<{id: number, question: string, note: string, answer:string, questiontype:string, answertype:string,levelid:number,topicid:number,question_tags:any, component:any}>;
    questionsRound: Array<{id: number, question: string, note: string, answer:string, questiontype:string, answertype:string, levelid:number,topicid:number,question_tags:any, component:any}>;
    answeroptions: any;
    arrayIn: string[];
    randOption: Array<{id: number, question: string, note: string, answer:string, questiontype:string, answertype:string, levelid:number,topicid:number, component:any}>;
    levelid:number;
    levelid_getname: string;
    levels:any;
    innerLevels:any;
    userCurrentInnerLevel:number;
    topicid:number;
    targets:any;

    timer:any;
    timeParsed: any;
    counter:number;
    page:any;
    questionSound:string[];
    previousPageWasQuestionList:string[];
    userId:string[];
    userXpUntilNextlevel:number = 0;
    progress:number = 0;
    levelUpTarget:number = 0;
    progressTarget:number = 0;

    WinPoint:number = 100;
    halfWinPoint:number = this.WinPoint/2;
    userXp:number;

    retry:string = 'false';
    pointsForWin:number;
    numberOfQuestionOtions:number = 3;

    hideFooterTimeout:any;
    specific:any;
    items:any;
    rightAnswers:number;
    wrongAnswers:number;
    rwRatio:number;
    streaks:any;
    innerLevelTag:string[];
    innerLevelTag1:string[];
    innerLevelTag2:string[];
    innerLevelTag3:string[];

    soundstatus:string;
    alertPopUpTime:number;
    alertPopUpTimeNextLevel:number;
    gotQuestionsForLevel:string = 'false';
    totalQuestionsAnswered:number;

    difficulties:any;
    difficultyChanged:boolean;
    difficultyVariableKey:string = 'question';
    constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, private nativeAudio: NativeAudio, private storage: Storage,public http: Http, public statusBar: StatusBar) {

    this.page = navParams.get('title');
    this.topicid = navParams.get('topicid');
    console.log(this.topicid);
    this.levels = navParams.get('levels');
    this.levelid = navParams.get('levelid');
    this.specific = navParams.get('specific');
    this.items = navParams.get('items');
    //find kun spørgsmål ved den korrekt level
    this.targets = [{target:600, innerLevelIdentifyer:0},{target:1200, innerLevelIdentifyer:1},{target:1800, innerLevelIdentifyer:2},{target:2400, innerLevelIdentifyer:3},{target:3000, innerLevelIdentifyer:4},{target:6000, innerLevelIdentifyer:5},{target:10000, innerLevelIdentifyer:6},{target:100000, innerLevelIdentifyer:7}];
    this.levelUpTarget = this.targets[0].target;
    this.progressTarget = this.levelUpTarget - 0;
    this.userCurrentInnerLevel = 0;
    this.levelid_getname = '';
    this.answeroptions = [];
    this.randOption = [];
    this.questionsRound = [];
    this.rwRatio = 1;
    this.streaks;
    this.questions = []; // the questions for the current innerlevel
    this.userXpUntilNextlevel = this.levelUpTarget - this.userXp;
      //find way to clear timer and reset when new round starts
    this.timer = Observable.timer(1000,1000).subscribe(val => this.timeParsed = val + ' Sek');
    this.alertPopUpTime = 300000; //4000
    this.alertPopUpTimeNextLevel = 100000; //7000
    this.difficulties = navParams.get('difficulties');
    this.difficultyChanged = navParams.get('difficultyChanged');

    }
    ionViewDidLoad() {
        this.prepareGameLevelQuestions();
        this.storeData('difficulties',this.difficulties);
    }


    async prepareGameLevelQuestions(){
        // console.log('prepareGameLevelQuestions init')
        //Get userdate
        // then get questions from server
        this.getUserData()
        .then( (result) =>  this.prepareLevels()
        ).then((result) =>  {
            // console.log('setUpUserData')
            result = this.userdata;
            if (!result[0].topics || !result[0].topics[104] || !result[0].topics[104][this.levelid]){
                //set default start data
                this.userXp = 0;
                this.userCurrentInnerLevel = 0;
                this.rightAnswers = 0;
                this.wrongAnswers = 0;
                this.streaks = [];
                this.rwRatio = (this.rightAnswers / this.rightAnswers + this.wrongAnswers ) / 10;
                this.userId = result[0].userId;

            }else{
            //has data for topic
                // console.log(result[0].topics[104][this.levelid].userXp);
                this.userXp = result[0].topics[104][this.levelid].userXp;
                this.userId = result[0].userId;
                this.userCurrentInnerLevel = result[0].topics[104][this.levelid].userCurrentInnerLevel;
                this.rightAnswers = result[0].topics[104][this.levelid].rightAnswers;
                this.wrongAnswers = result[0].topics[104][this.levelid].wrongAnswers;
                this.streaks = [];
                this.rwRatio = (this.rightAnswers / this.wrongAnswers ) / 10;
                this.storeUserData();
            }

             this.totalQuestionsAnswered = this.rightAnswers + this.wrongAnswers;

           	return Promise.resolve();
        })
        .then(() => {
          this.getInnerLevels()

        	return Promise.resolve();
        })
        .then(() => {
             this.setupQuestionsForCurrentInnerLevel()

           	return Promise.resolve();
        })
        .then(() => {
             this.getAllQuestionsAlreadyLoaded()
           	return Promise.resolve();
        })
        .catch((e)=>{
          console.log(e);
        });

    }

    async prepareLevels(){
    return await this.storage.get('levels').then((result) => {
        this.levels = result;
         return Promise.resolve();
      }). catch ((e) => {
          console.log(e);   // uncaught
      });
    }
    async getAllQuestionsAlreadyLoaded(){
        return await this.storage.get('allquestions').then((result) => {
            // console.log(result);
            if(result !== null){
              return this.getQuestionsFromServer(this, result)
            }else{
              return this.getQuestionsFromServer(this, false)
            }

          }). catch ((e) => {
              console.log(e);   // uncaught
          });
    }
    async getUserData(){
          return await this.storage.get('userData').then((result) => {
          this.userdata = result;
          	return Promise.resolve();
        }). catch ((e) => {
            console.log(e);   // uncaught
        });
    }

    getInnerLevels(){
        return this.storage.get('innerLevels').then((result) => {
         this.innerLevels = result;
         	return Promise.resolve();
        }). catch ((e) => {
            console.log(e);   // uncaught
        });
    }
     setUpGame(res:any){

        // console.log('*** Setupgame');
        this.questions = res;
        if(this.specific !== 'false'){
            // console.log('specific');
            this.questionsRound.push(this.getSpecificByQuestion(this.page));
        }else{
            //random
            // console.log(this.questions);
        let quest:any = this.getRandomQuestion(res);
            // console.log(quest);
            this.questionsRound.push(quest);
            // console.log('random');
        }
          // console.log(this.questionsRound);
        //Get name of level
        this.getLevelNameById(this.questionsRound[0].levelid);

        if (this.platform.is('cordova')) {
            this.platform.ready().then(() => {
                this.nativeAudio.preloadComplex(this.questionsRound[0].question, this.getSoundIfExist(this.questionsRound[0].question), 1, 1, 0).then(() => {
                    this.soundstatus = 'true';
                this.nativeAudio.play(this.questionsRound[0].question);
              }). catch ((e) => {
                  console.log(e);   // uncaught
              });
            }). catch ((e) => {
                console.log(e);   // uncaught
            });
        } else {
         // console.log('cannot play native audio here');
        }
        // console.log('start setup complete');

    }
   // async ensureQuestionsIsSet() {
   //     return await this.checkIfQuestionsMatchLevel();
   //  }

    setUpLevelQuestions(previouslyLoadedQuestions:any){
//        if(!this.checkIfQuestionsMatchLevel()){
            //get all allquestions
                let tmpArray3 = [];
                let c = this.allquestions;
                    for (let item of c) {
                      if(item !== undefined){

//                        console.log(item.question_tags);
//                        console.log(this.innerLevelTag);
                        // if (item.question_tags.toLowerCase() === this.innerLevelTag.toString().toLowerCase()
                        //     || item.question_tags.toLowerCase() === this.innerLevelTag1.toString().toLowerCase()
                        //     || item.question_tags.toLowerCase() === this.innerLevelTag2.toString().toLowerCase()
                        //     || item.question_tags.toLowerCase() === this.innerLevelTag3.toString().toLowerCase()){
                            //Take only question below this current level.
//                            if (item.levelid <= this.levelid){
                            //Take only from current level
//                            console.log('innerLevels.length');
//                            console.log(this.innerLevels.length);
                            if (item.levelid == this.levelid){
                                tmpArray3.push({
                                    id: item.id,
                                    question: item.question,
                                    questiontype: item.questiontype,
                                    answer: item.answer,
                                    answertype: item.answertype,
                                    note:item.note,
                                    topicid:item.topicid,
                                    levelid:item.levelid,
                                    question_tags: item.question_tags,
                                    component: item.component
                                });
                            }

                            // }
                        }

                    }
                    this.gotQuestionsForLevel = 'true';

                    // console.log(this.questions);
                    this.questions = tmpArray3;
                    this.storeData('questions',tmpArray3);
                    // console.log(this.questions);
                    // console.log('allquestions end')

                    return tmpArray3;


//        }else{
//            return this.questions;
//
//        }
    }

    getLevelNameById(levelid:any){
            let levelname:string;
            if(this.levels){
                for(let level in this.levels){
                  if(typeof levelid == 'object'){
                      let stringid = this.levels[level].id;
                          stringid.toString();
                          console.log(stringid.toString() );
                          console.log(levelid[1]);
                    if (levelid.indexOf(stringid) > -1 || levelid.find(x => x === stringid)){
                        console.log('is in object');
                        levelname = this.levels[level].title;
                        break;
                    }
                  }else{
                      console.log('is singular');
                    if (this.levels[level].id == levelid){
                        console.log('is in singular');
                        levelname = this.levels[level].title;
                        break;
                    }
                  }

                }
                this.levelid_getname = levelname;
            }
    }

    storeData(key,value){
        this.storage.set(key, value);
    }


    getFromStorageStandard(table){
        this.storage.get(table).then((result) => {
            if(table == 'userData'){
                if (!result[0].topics[this.topicid] || !result[0].topics[this.topicid][this.levelid]){
                    //set default start data
                    this.userXp = 0;
                    this.userCurrentInnerLevel = 0;
                    this.rightAnswers = 0;
                    this.wrongAnswers = 0;
                    this.rwRatio = (this.rightAnswers / this.rightAnswers + this.wrongAnswers ) / 10;
                    this.userId = result[0].userId;
                }else{
                //has data for topic
                    this.userXp = result[0].topics[this.topicid][this.levelid].userXp;
                    this.userId = result[0].userId;
                    this.userCurrentInnerLevel = result[0].topics[this.topicid][this.levelid].userCurrentInnerLevel;
                    this.rightAnswers = result[0].topics[this.topicid][this.levelid].rightAnswers;
                    this.wrongAnswers = result[0].topics[this.topicid][this.levelid].wrongAnswers;
                    this.rwRatio = (this.rightAnswers / this.wrongAnswers ) / 10;

                }



            }else if(table == 'questions'){
                //Setting question for this question round

                this.questions = result;

                if(this.specific !== 'false'){
                    // console.log('specific');
                    this.questionsRound.push(this.getSpecificByQuestion(this.page));
                }else{
                    //random
                    this.questionsRound.push(this.getRandomQuestion(result));
                    // console.log('random');
                }


                if (this.platform.is('cordova')) {
                    this.platform.ready().then(() => {
                        this.nativeAudio.preloadComplex(this.questionsRound[0].question, this.getSoundIfExist(this.questionsRound[0].question), 1, 1, 0).then(() => {
                        this.nativeAudio.play(this.questionsRound[0].question);
                      });
                    });
                } else {
                 console.log('cannot play native audio here');
                }


            }else if(table == 'innerLevels'){
                this.innerLevels = result;
                // console.log('got inner levels');

            }else if(table === 'allquestions'){

                let tmpArray3 = [];
                if(result){
                    //
                    //Setting up which categories to take by tags to ensure the questions is within the current innerlevel and outerlevel
                    //create a better way for this
                    // console.log(this.innerLevels);
                    if(this.userCurrentInnerLevel === 0){
                        if(this.userCurrentInnerLevel >= this.innerLevels.length-1){
                            this.innerLevelTag = this.innerLevels[this.innerLevels.length-1].name;
                        }else{
                            this.innerLevelTag = this.innerLevels[this.userCurrentInnerLevel].name;
                        }
                        this.innerLevelTag1 = this.innerLevelTag;
                        this.innerLevelTag2 = this.innerLevelTag;
                        this.innerLevelTag3 = this.innerLevelTag;
                        // console.log('innerlevel 0 questions are based on these '+ this.innerLevelTag +' - '+ this.innerLevelTag1 +' - '+ this.innerLevelTag2  +' - '+ this.innerLevelTag3);

                    }else if(this.userCurrentInnerLevel === 1){

                        this.innerLevelTag = this.innerLevels[1].name;
                        this.innerLevelTag1 = this.innerLevels[1].name;
                        this.innerLevelTag2 = this.innerLevels[1].name;
                        this.innerLevelTag3 = this.innerLevels[1].name;
                        // console.log('innerlevel 1 questions are based on these '+ this.innerLevelTag +' - '+ this.innerLevelTag1 +' - '+ this.innerLevelTag2  +' - '+ this.innerLevelTag3);

                    }else if(this.userCurrentInnerLevel === 2){

                        this.innerLevelTag = this.innerLevels[2].name;
                        this.innerLevelTag1 = this.innerLevels[2].name;
                        this.innerLevelTag2 = this.innerLevels[2].name;
                        this.innerLevelTag3 = this.innerLevels[2].name;
                        // console.log('innerlevel 2 questions are based on these '+ this.innerLevelTag +' - '+ this.innerLevelTag1 +' - '+ this.innerLevelTag2  +' - '+ this.innerLevelTag3);

                    }else if(this.userCurrentInnerLevel === 3){

                        this.innerLevelTag = this.innerLevels[0].name;
                        this.innerLevelTag1 = this.innerLevels[1].name;
                        this.innerLevelTag2 = this.innerLevels[2].name;
                        this.innerLevelTag3 = this.innerLevels[3].name;
                        // console.log('innerlevel 3 questions are based on these '+ this.innerLevelTag +' - '+ this.innerLevelTag1 +' - '+ this.innerLevelTag2  +' - '+ this.innerLevelTag3);

                    }else if(this.userCurrentInnerLevel === 4){

                        this.innerLevelTag = this.innerLevels[0].name;
                        this.innerLevelTag1 = this.innerLevels[1].name;
                        this.innerLevelTag2 = this.innerLevels[2].name;
                        this.innerLevelTag3 = this.innerLevels[3].name;
                        // console.log('innerlevel 4 questions are based on these '+ this.innerLevelTag +' - '+ this.innerLevelTag1 +' - '+ this.innerLevelTag2  +' - '+ this.innerLevelTag3);

                    }else if(this.userCurrentInnerLevel > 4){

                        this.innerLevelTag = this.innerLevels[0].name;
                        this.innerLevelTag1 = this.innerLevels[1].name;
                        this.innerLevelTag2 = this.innerLevels[2].name;
                        this.innerLevelTag3 = this.innerLevels[3].name;
                        // console.log('innerlevel > 4 questions are based on these '+ this.innerLevelTag +' - '+ this.innerLevelTag1 +' - '+ this.innerLevelTag2  +' - '+ this.innerLevelTag3);

                    }
                    for (let item of result) {
                      if(item !== undefined){

//
//                         console.log(item.question_tags);
//                         console.log(this.innerLevelTag);
//                         if (item.question_tags.toLowerCase() === this.innerLevelTag.toString().toLowerCase()
//                             || item.question_tags.toLowerCase() === this.innerLevelTag1.toString().toLowerCase()
//                             || item.question_tags.toLowerCase() === this.innerLevelTag2.toString().toLowerCase()
//                             || item.question_tags.toLowerCase() === this.innerLevelTag3.toString().toLowerCase()){
//                             //Take only question below this current level.
// //                            if (item.levelid <= this.levelid){
//                             //Take only from current level
//                             console.log('innerLevels.length');
//                             console.log(this.innerLevels.length);
//                             if (item.levelid <= this.levelid){
                                tmpArray3.push({
                                    id: item.id,
                                    question: item.question,
                                    questiontype: item.questiontype,
                                    answer: item.answer,
                                    answertype: item.answertype,
                                    note:item.note,
                                    topicid:item.topicid,
                                    levelid:item.levelid,
                                    question_tags:item.question_tags,
                                    component:item.component
                                });
                        //     }
                        //
                        //
                        // }

                        }
                    }
                    this.gotQuestionsForLevel = 'true';
                    this.questions = tmpArray3;
                    this.storeData('questions',tmpArray3);

                }

            }
            return table;
        })
        .catch((e)=>{
          console.log(e);
        });

    }
    
    getData(key){
//        this.getQuestions();

        if(this.specific !== 'false'){
            // console.log('specific' + this.page);
            this.questionsRound.push(this.getSpecificByQuestion(this.page));
        }else{
            let data = this.getRandomQuestion(false);
            //random
            this.questionsRound.push(data);
            // console.log('random');
            // console.log(data);
        }

        this.getLevelNameById( this.questionsRound[0].levelid);
        if (this.platform.is('cordova')) {
            this.platform.ready().then(() => {
                this.nativeAudio.preloadComplex(this.questionsRound[0].question, this.getSoundIfExist(this.questionsRound[0].question), 1, 1, 0).then(() => {
                this.nativeAudio.play(this.questionsRound[0].question);
              }).catch((e)=>{
                console.log(e);
              });
            });
        } else {
         console.log('cannot play native audio here');
        }

    }



  getSpecificByQuestion(pagetitle){

      for(let i = 0; i <= this.allquestions.length; i++){

        if(this.allquestions[i].question == pagetitle ){
            // console.log(this.questions[i]);
            return this.allquestions[i];

        }
      }
  }

    getHeaders(){
        var headers = new Headers();
    //        headers.append('Access-Control-Allow-Methods', 'GET');
            headers.append('Accept','application/json');
            headers.append('content-type','application/json');
            let options = new RequestOptions({ headers:headers, withCredentials: true});
            return options;
    }
    async getQuestionsFromServer(that, previouslyLoadedQuestions){
        // console.log('getQuestionsFromServer  begin');
          let tmpArray3 = [];
          //check if data is already in app
          if(this.existInObject(this.levelid, previouslyLoadedQuestions, 'levelid')){
              // push only already loaded question
              // console.log('dont fetch data - we got it');
              // console.log(tmpArray3);
              // console.log(previouslyLoadedQuestions);
              if(previouslyLoadedQuestions != false){
                for (let item of previouslyLoadedQuestions) {
                  if(item !== undefined){

                    if(!this.existInObject(item.id,tmpArray3,'id')){
                      tmpArray3.push({
                          id: item.id,
                          question: item.question,
                          questiontype: item.questiontype,
                          answer: item.answer,
                          answertype: item.answertype,
                          note:item.note,
                          topicid:item.topicid,
                          levelid:item.levelid,
                          question_tags:item.question_tags,
                          component:item.component
                      });
                    }
                  }
                }
              }



              // console.dir(this.allquestions);
              this.allquestions = tmpArray3;

              this.storeData('allquestions',this.allquestions);
  //            this.setupQuestionsForCurrentInnerLevel();
              // console.log(' Data from server is delivered');
              // console.log(tmpArray3);


              let res = this.setUpLevelQuestions(previouslyLoadedQuestions)
              this.setUpGame(res);
          }else{
             //fetch the data
             let options = this.getHeaders();
                return await this.http.get('https://vandel.io/wp-json/wp/v2/LPquestions?filter[meta_key].acf=levelid&filter[meta_compare]=RLIKE&filter[meta_value]='+this.levelid+'&filter[order]=desc&filter[posts_per_page]=99', options).map(res => res.json()).subscribe(allquestions => {
        //            response = JSON.parse(JSON.stringify(response));

                    // console.log('getQuestionsFromServer  fetched');
        //            this.storagetype = 'server';
                    for (let item of allquestions) {

                        tmpArray3.push({
                            id: item.id,
                            question: item.question,
                            questiontype: item.questiontype,
                            answer: item.answer,
                            answertype: item.answertype,
                            note:item.note,
                            topicid:item.topicid,
                            levelid:item.levelid,
                            question_tags:item.question_tags[0].name,
                            component:item.component
                        });
                    }
                    // console.log(tmpArray3);
                    let c = previouslyLoadedQuestions;
                    // console.log(previouslyLoadedQuestions);
                    if(previouslyLoadedQuestions != false){
                      for (let item of c) {
                        if(item !== undefined){

                          if(!this.existInObject(item.id,tmpArray3,'id')){
                            tmpArray3.push({
                                id: item.id,
                                question: item.question,
                                questiontype: item.questiontype,
                                answer: item.answer,
                                answertype: item.answertype,
                                note:item.note,
                                topicid:item.topicid,
                                levelid:item.levelid,
                                question_tags:item.question_tags,
                                component:item.component
                            });
                          }
                        }
                      }
                    }



                    // console.dir(this.allquestions);
                    this.allquestions = tmpArray3;

                    this.storeData('allquestions',this.allquestions);
        //            this.setupQuestionsForCurrentInnerLevel();
                    // console.log(' Data from server is delivered');
                    // console.log(tmpArray3);


                    let res = this.setUpLevelQuestions(previouslyLoadedQuestions)
                    this.setUpGame(res);

                    }, err => {
                    // console.log(err);
    //                return reject();
                });
          }


    }
//    async waitForFoo(){
//         let options = this.getHeaders();
//         this.http.get('https://vandel.io/wp-json/wp/v2/LPquestions?filter[meta_key].acf=levelid&filter[meta_compare]=RLIKE&filter[meta_value]='+this.levelid+'&filter[order]=desc&filter[posts_per_page]=99', options).map(res => res.json()).subscribe(allquestions => {
// //            response = JSON.parse(JSON.stringify(response));
//
// //            this.storagetype = 'server';
//             let tmpArray3 = [];
//             for (let item of allquestions) {
//
//                 tmpArray3.push({
//                     id: item.id,
//                     question: item.question,
//                     questiontype: item.questiontype,
//                     answer: item.answer,
//                     answertype: item.answertype,
//                     note:item.note,
//                     topicid:item.topicid,
//                     levelid:item.levelid,
//                     question_tags:item.question_tags[0].name,
//                     component:item.component
//                 })
//             }
//             this.storeData('allquestions',tmpArray3);
// //            this.setupQuestionsForCurrentInnerLevel();
//             console.log('waitforFoo Data from server is here');
//             console.log(tmpArray3);
//             return true;
//             }, err => {
//             console.log(err);
//         });
//
//     }

    existInObject(needle:number, haystack:any,needletype:string){
      if(haystack.length > 0)
      for (let item of haystack) {
          if(needletype === 'id' && item.id == needle){
            return true;
          }
          if(needletype === 'levelid' && item.levelid == needle){
            return true;
          }
      }
      return false;
    }

    setupQuestionsForCurrentInnerLevel(){

        this.setNewLeveltarget();
        var calc = ((this.pointsForWin / this.progressTarget) * 100) + this.progress;
        this.progress = calc;
        return true;
    }

    playSound(){
        if (this.platform.is('cordova')) {
            this.platform.ready().then(() => {
               this.nativeAudio.play(this.questionsRound[0].question);
            });
        } else {
            // console.log('cannot play native audio here');
        }
    }
  onSuccess(){
      // console.log(' success');
  }
  onError(){
      // console.log(' error');
  }
  getSoundIfExist(name){
      return 'https://vandel.io/learningapp/assets/sounds/'+ name +'.mp3';
  }
    setNewRound(reason:string){
        //save the question which just got answared, to track progress.
        //Streaks
        if(reason == 'canceled'){
            this.streaks[this.questionsRound[0].id] = 0;
        }else if(reason === 'rightanswar'){

            if(this.streaks[this.questionsRound[0].id]){
              this.streaks[this.questionsRound[0].id]++;
            }else{
              this.streaks[this.questionsRound[0].id] = 1;
            }

        }else if(reason === 'wronganswar'){
          this.streaks[this.questionsRound[0].id] = 0;
        }



        //reset timer
        this.timer.unsubscribe();
        this.timer = Observable.timer(1000,1000).subscribe(val => this.timeParsed = val + ' Sek');
        //reset questions
        this.answeroptions = [];
        this.randOption = [];
        this.questionsRound = [];
        this.retry = 'false';
        this.questionsRound.push(this.getRandomQuestion(false));
        this.getLevelNameById( this.questionsRound[0].levelid);
//        this.ionViewDidLoad();
        this.userXpUntilNextlevel = this.levelUpTarget - this.userXp;

    }


    requiredToLevelUp(){
        //get next level up xp step
        return this.levelUpTarget;
    }
   getRandomQuestion(res:any){
        //get question from innerLevel that the user is currently on
       if(res === false){
           let question = this.questions[Math.floor(Math.random() * this.questions.length)];
           // console.log(question);

           return question;
       }else{

           return this.questions[Math.floor(Math.random() * this.questions.length)];
       }
    }
    randomizeArray(arrayIn: {sort: (arg0: () => number) => void;}){
      arrayIn.sort(function() {
        return .5 - Math.random();
      });
    }
    showAlert(title: string, subTitle:string, timeVisible:number,reason:string) {
        const alert = this.alertCtrl.create({
            title: title,
            subTitle: subTitle,
            enableBackdropDismiss: false,
            buttons: [
                {
                text:'New round',
                role: 'cancel',
                handler: () => {
                    clearTimeout(this.hideFooterTimeout);
                    this.setNewRound(reason);
                }
            }],

        });
        alert.present();
        this.hideFooterTimeout = setTimeout( () => {
            alert.dismiss();

            this.setNewRound(reason);
       }, timeVisible);
    }
    showConfirmRetry(wronganswer){
        if(this.retry === 'true'){
            //Show message
            this.retry = 'false';
            this.showAlert(
              'Du svarede forkert igen',
              'Du får et nyt spørgsmål nu, hvis du gerne vil prøve igen med det tidligere spørgsmål, så kan du finde alle spørgsmål i hovedemenuen og dermed gå til et specifikt spørgmål. Du klare det ellers godt!</h1><br><h3></h3>',
              7000,
              'wronganswar'
            );


        }else{
            this.wrongAnswers =  this.wrongAnswers + 1;
            const alert = this.alertCtrl.create({
                title: 'Du svarede forkert',
                subTitle: 'Vil du prøve at besvare samme spørgsmål igen ?',
                buttons: [
                  {
                    text: 'Nyt spørgsmål',
                    role: 'cancel',
                    handler: () => {
                      // console.log('Cancel clicked');
                      this.setNewRound('wronganswar');
                    }
                  },
                  {
                    text: 'Jeg vil gerne prøve igen!',
                    handler: () => {

                      this.retry = 'true';

                      // console.log('Trying again');
                    }
                  }
                ]
              });
              alert.present();
          }

        this.storeUserData();
    }
    addXp(){
        let speedPoints:number = parseInt(this.timeParsed);
        this.rightAnswers =  this.rightAnswers + 1;
        if(this.retry == 'false'){
            this.pointsForWin = Math.floor(this.WinPoint / (Math.floor(speedPoints)));
        }else{
            this.pointsForWin = Math.floor(this.halfWinPoint / (Math.floor(speedPoints)));
        }
        this.userXp = this.userXp + this.pointsForWin;

        // this.userXpUntilNextlevel = this.levelUpTarget - this.userXp;

        var calc = ((this.pointsForWin / this.progressTarget) * 100) + this.progress;
        this.progress = calc;

        let InnerLevelMaxedUp = false;
        if(this.userXp >= this.levelUpTarget){
            if(this.targets.length < this.userCurrentInnerLevel){
                InnerLevelMaxedUp = true;
            }
            this.setNewLeveltarget();
            let stringtext = '';
            let rwRatioPercent = ((this.rightAnswers / (this.rightAnswers + this.wrongAnswers)) * 100);
            if(InnerLevelMaxedUp && rwRatioPercent >= 80){
                //Generate random victory message
                this.showAlert(
                'Det kører for dig!', 'Dit rigtigt/forkert ratio ligger nu på: <br><h1>'
                + rwRatioPercent.toFixed(3) +'%</h1>',
                this.alertPopUpTime,
                'rightanswar');
            }else if(InnerLevelMaxedUp && rwRatioPercent < 80){
                //Generate random victory message
                this.showAlert(
                'Du bør måske øve dig en smule mere',
                'Baseret på din rigtigt/forkert ratio, ser det ikke ud til at du altid svare rigtigt.<br>Du svare korrekt: <br><h1>'
                + rwRatioPercent.toFixed(3) +'% af gangende</h1><br><h3>Øvelse gør mester!<h3></h3>',
                this.alertPopUpTime,
                'rightanswar');
            }else{
              if(this.streaks[this.questionsRound[0].id] > 2){
                stringtext = 'Hold din streak kørende på dette spørgsmål';
              }else{
                stringtext = 'Dit rigtigt/forkert ratio ligger nu på: <br><h1>'
                + rwRatioPercent.toFixed(3) +'%</h1>';
              }
                 this.showAlert(
                   'Det kører for dig!',
                   '<h2>' + stringtext + '</h2>',
                   this.alertPopUpTime,
                   'rightanswar');

            }

            this.setupQuestionsForCurrentInnerLevel();
//            this.storeData('userCurrentInnerLevel', this.userCurrentInnerLevel);
        }else{
          if(this.rightAnswers){
            this.totalQuestionsAnswered = this.rightAnswers + this.wrongAnswers;
          }
            this.showAlert(
              'Perfekt!',
            'Du har fået <br><h1>+ ' + this.pointsForWin + ' XP</h1><br>Du har svaret korrekt på <br><h2>' + this.rightAnswers +' ud af '+ this.totalQuestionsAnswered +'</h2> spørgsmål i denne grad: ' + this.levelid_getname+'. <br>',
            this.alertPopUpTimeNextLevel,
            'rightanswar');
        }

        this.storeUserData();

    }
    storeUserData(){
        let topicobject:any = {};
        // console.log('push');
        // 104 is the id from the category in wordpress - dosnt matter its hardcoded.
        topicobject[104] = {0:{ levelInTopic:0,rightAnswers:0,wrongAnswers:0,userCurrentInnerLevel:0,userXp:0,streaks:this.streaks}};

        // console.log(this.userdata[0].topics);
        topicobject = this.userdata[0].topics;

        if (topicobject[this.topicid] && topicobject[this.topicid][this.levelid] && topicobject[this.topicid][this.levelid].userXp){
            topicobject[this.topicid][this.levelid] = {rightAnswers:this.rightAnswers,wrongAnswers:this.wrongAnswers,userCurrentInnerLevel:this.userCurrentInnerLevel,userXp:this.userXp,streaks:this.streaks};
        }else{
            //push
            topicobject[this.topicid][this.levelid] = [];
            topicobject[this.topicid][this.levelid] = {rightAnswers:this.rightAnswers,wrongAnswers:this.wrongAnswers,userCurrentInnerLevel:this.userCurrentInnerLevel,userXp:this.userXp,streaks:this.streaks};

        }

        let userData = [{topics:topicobject, userId:this.userId,username:''}];
        this.storeData('userData', userData);
    }
    setNewLeveltarget(){
        let oldTarget = this.levelUpTarget;
        if(this.targets.length <= this.userCurrentInnerLevel ){
            // console.log('continue in this innerlevel');
        }else{
            // console.log('new  innerlevel');
            this.levelUpTarget = this.targets[this.userCurrentInnerLevel].target;
        }

        this.progressTarget = this.levelUpTarget - oldTarget;
        // console.log('new target to reach '+ this.levelUpTarget);
        //reset progress
        this.progress = 0;
    }


    presentAnswarOption(){
        //difficulty increase -
        //show answer as qustion., and the questions as answers.

        //Filter the previous asked and answered questions
        if (this.retry == 'true'){

        }else{
          this.difficultyVariableKey = 'question';
          if(this.difficultyChanged){
            // Dansk til koreansk - Show answar as question, and question as answar
            this.difficultyVariableKey = 'question';
          }else{
            // Koreansk til Dansk - Show question as question, and answar as answar
            this.difficultyVariableKey = 'answer';
          }
          // console.log(this.difficultyVariableKey);

        let prev = [];
        let trueAnswarTag = this.questionsRound[0].question_tags;
        prev.push(this.questionsRound[0][this.difficultyVariableKey]);
        console.log(prev);

        if(this.questionsRound[0].answertype = 'multiplechoice'){
          //
          //Generate false answers
          for(var i = 0;i < this.numberOfQuestionOtions; i++){
              let randOpt = this.getRandomQuestion(false);
              let maxLoops = 10;
              let currentLoop = 0;
              while(randOpt.question_tags !== trueAnswarTag){
                  randOpt = this.getRandomQuestion(false);
                  currentLoop++;
                  if(randOpt.question_tags == trueAnswarTag || maxLoops > currentLoop){
                    break;
                  }

              }

            //Check if answer option is equal to the true answer
            if(this.questionsRound[0][this.difficultyVariableKey] ==  randOpt[this.difficultyVariableKey] || prev.indexOf(randOpt[this.difficultyVariableKey]) != -1 ){
                // Roll back loop counter
                i--;
            }else{
                prev.push(randOpt[this.difficultyVariableKey]);
                this.answeroptions.push(
                    {
                    text: randOpt[this.difficultyVariableKey],
                        handler: () => {
                                this.showConfirmRetry(0);
                        }
                    }
                );
            }


          }

          //
          //Generate true answer
          //
          this.answeroptions.push(
                {
                text: this.questionsRound[0][this.difficultyVariableKey],
                    handler: () => {
                        this.addXp();
                    }
                }
            );
            console.log('generate answer option');
            console.log(prev);
            this.randomizeArray(this.answeroptions);

             this.answeroptions.push(
                {
                text: 'Cancel - Pas Question',
                role: 'cancel',
                handler: () => {
                  console.log('Cancel clicked');
                    this.setNewRound('canceled');
                }
                }
            );
        }

    }

    const actionSheet = this.actionSheetCtrl.create({
        title: 'Multiplechoice',
        buttons: this.answeroptions

      });
      actionSheet.present();
  }

}
