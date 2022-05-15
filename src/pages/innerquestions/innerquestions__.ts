import { Component } from '@angular/core';
import { Platform, NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { NativeAudio } from '@ionic-native/native-audio';
import { Storage } from '@ionic/storage';
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
    
    rightAnswers:number;
    wrongAnswers:number;
    rwRatio:number;
    
    innerLevelTag:string[];
    innerLevelTag1:string[];
    innerLevelTag2:string[];
    innerLevelTag3:string[];
    
    
    gotQuestionsForLevel:string = 'false';
//    whenDataIsFetched:any;
    
////  items: Array<{title: string, note: string, icon: string}>;
//
    constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, private nativeAudio: NativeAudio, private storage: Storage,public http: Http) {
        
    
//    this.questions = [];
        
    this.page = navParams.get('title');
    this.topicid = navParams.get('topicid');
    console.log(this.topicid);
    this.levels = navParams.get('levels');
    this.levelid = navParams.get('levelid');
    this.specific = navParams.get('specific');
    //find kun spørgsmål ved den korrekt level
    this.targets = [{target:600, innerLevelIdentifyer:0},{target:1200, innerLevelIdentifyer:1},{target:1800, innerLevelIdentifyer:2},{target:2400, innerLevelIdentifyer:3},{target:3000, innerLevelIdentifyer:4}];
    this.levelUpTarget = this.targets[0].target;
    this.progressTarget = this.levelUpTarget - 0;
    this.userCurrentInnerLevel = 0;
    this.levelid_getname = '';
    this.answeroptions = [];
    this.randOption = [];
    this.questionsRound = [];
    this.rwRatio = 1;
      
    this.userXpUntilNextlevel = this.levelUpTarget - this.userXp;
      //find way to clear timer and reset when new round starts
    this.timer = Observable.timer(1000,1000).subscribe(val => this.timeParsed = val + ' Sek');
      
    } 
    ionViewDidLoad() {
        //load userdata
        this.getFromStorageStandard('userData');
       
    }
    getLevelNameById(levelid){
            console.log('get name by levels');
            if(this.levels){
                for(let level in this.levels){
                    if (this.levels[level].id == levelid){
                        console.log('getlevelname changed'+  this.levels[level].title);
                            this.levelid_getname = this.levels[level].title;
                            break;
                    }
                }
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
                    //load game
                    this.getQuestions();
                    this.getFromStorageStandard('innerLevels');
//                    this.getFromStorageStandard('userCurrentInnerLevel');
                }else{
                //has data for topic
                    this.userXp = result[0].topics[this.topicid][this.levelid].userXp;
                    this.userId = result[0].userId;
                    this.userCurrentInnerLevel = result[0].topics[this.topicid][this.levelid].userCurrentInnerLevel;
                    this.rightAnswers = result[0].topics[this.topicid][this.levelid].rightAnswers;
                    this.wrongAnswers = result[0].topics[this.topicid][this.levelid].wrongAnswers;
                    this.rwRatio = (this.rightAnswers / this.wrongAnswers ) / 10;
                    //load game
                    this.getQuestions();
                    this.getFromStorageStandard('innerLevels');
                    
                    this.setupQuestionsForCurrentInnerLevel();
                    
                }

               
                
            }else if(table == 'questions'){ 
                //Setting question for this question round
            
                this.questions = result;
                
                if(this.specific !== 'false'){ 
                    console.log('specific');
                    this.questionsRound.push(this.getSpecificByQuestion(this.page));
                }else{
                    //random
                    this.questionsRound.push(this.getRandomQuestion());
                    console.log('random');
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
                console.log('got inner levels');
            
            }else if(table === 'allquestions'){
            
                let tmpArray3 = [];
                if(result){
                    
                    //Setting up which categories to take by tags to ensure the questions is within the current innerlevel and outerlevel
                    //create a better way for this
                    console.log(this.innerLevels);
                    if(this.userCurrentInnerLevel === 0){
                        if(this.userCurrentInnerLevel >= this.innerLevels.length-1){
                            this.innerLevelTag = this.innerLevels[this.innerLevels.length-1].name;
                        }else{
                            this.innerLevelTag = this.innerLevels[this.userCurrentInnerLevel].name;
                        }
                        this.innerLevelTag1 = this.innerLevelTag;
                        this.innerLevelTag2 = this.innerLevelTag;
                        this.innerLevelTag3 = this.innerLevelTag;
                        console.log('innerlevel 0 questions are based on these '+ this.innerLevelTag +' - '+ this.innerLevelTag1 +' - '+ this.innerLevelTag2  +' - '+ this.innerLevelTag3);

                    }else if(this.userCurrentInnerLevel === 1){

                        this.innerLevelTag = this.innerLevels[1].name;
                        this.innerLevelTag1 = this.innerLevels[1].name;
                        this.innerLevelTag2 = this.innerLevels[1].name;
                        this.innerLevelTag3 = this.innerLevels[1].name;
                        console.log('innerlevel 1 questions are based on these '+ this.innerLevelTag +' - '+ this.innerLevelTag1 +' - '+ this.innerLevelTag2  +' - '+ this.innerLevelTag3);

                    }else if(this.userCurrentInnerLevel === 2){

                        this.innerLevelTag = this.innerLevels[2].name;
                        this.innerLevelTag1 = this.innerLevels[2].name;
                        this.innerLevelTag2 = this.innerLevels[2].name;
                        this.innerLevelTag3 = this.innerLevels[2].name;
                        console.log('innerlevel 2 questions are based on these '+ this.innerLevelTag +' - '+ this.innerLevelTag1 +' - '+ this.innerLevelTag2  +' - '+ this.innerLevelTag3);

                    }else if(this.userCurrentInnerLevel === 3){

                        this.innerLevelTag = this.innerLevels[0].name;
                        this.innerLevelTag1 = this.innerLevels[1].name;
                        this.innerLevelTag2 = this.innerLevels[2].name;
                        this.innerLevelTag3 = this.innerLevels[3].name;
                        console.log('innerlevel 3 questions are based on these '+ this.innerLevelTag +' - '+ this.innerLevelTag1 +' - '+ this.innerLevelTag2  +' - '+ this.innerLevelTag3);

                    }else if(this.userCurrentInnerLevel === 4){

                        this.innerLevelTag = this.innerLevels[0].name;
                        this.innerLevelTag1 = this.innerLevels[1].name;
                        this.innerLevelTag2 = this.innerLevels[2].name;
                        this.innerLevelTag3 = this.innerLevels[3].name;
                        console.log('innerlevel 4 questions are based on these '+ this.innerLevelTag +' - '+ this.innerLevelTag1 +' - '+ this.innerLevelTag2  +' - '+ this.innerLevelTag3);

                    }else if(this.userCurrentInnerLevel > 4){

                        this.innerLevelTag = this.innerLevels[0].name;
                        this.innerLevelTag1 = this.innerLevels[1].name;
                        this.innerLevelTag2 = this.innerLevels[2].name;
                        this.innerLevelTag3 = this.innerLevels[3].name;
                        console.log('innerlevel > 4 questions are based on these '+ this.innerLevelTag +' - '+ this.innerLevelTag1 +' - '+ this.innerLevelTag2  +' - '+ this.innerLevelTag3);

                    }
                    for (let item of result) {
                        
                        console.log(item.question_tags);
                        console.log(this.innerLevelTag);
                        if (item.question_tags.toLowerCase() === this.innerLevelTag.toString().toLowerCase()
                            || item.question_tags.toLowerCase() === this.innerLevelTag1.toString().toLowerCase()
                            || item.question_tags.toLowerCase() === this.innerLevelTag2.toString().toLowerCase()
                            || item.question_tags.toLowerCase() === this.innerLevelTag3.toString().toLowerCase()){
                            //Take only question below this current level.
//                            if (item.levelid <= this.levelid){
                            //Take only from current level
                            console.log('innerLevels.length');
                            console.log(this.innerLevels.length);
                            if (this.userCurrentInnerLevel == this.innerLevels.length-1){
                                if (item.levelid <= this.levelid){
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
                            }else{
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
                                        question_tags:item.question_tags,
                                        component:item.component
                                    });
                                }
                            }
                             
                            
                        }

                    }
                    this.gotQuestionsForLevel = 'true';
                    this.questions = tmpArray3;
                    this.storeData('questions',tmpArray3);
                    
                }
                
            }
            return table;
        }).then((val1) => this.whenDataIsFetched(val1) );

    }
    whenDataIsFetched(val1:any){
        console.log('DATA FETCHED***** '+val1);
        if(val1 == 'allquestions'){
            console.log('data is fetch from storage now');
            //does questions contain the questions for this level
            
            if(this.checkIfQuestionsMatchLevel()){
                console.log('calling getData');
                this.getData('');
            }else{
                console.log('questions dont match');
            }
        }
    }
    checkIfQuestionsMatchLevel(){
        let result = false;
        for(let q in this.questions){
            if(this.questions[q].levelid !== this.levelid){
                result = true;
                break;
            }
        }
        return result;
    }
    
    getData(key){
//        this.getQuestions();

        if(this.specific !== 'false'){ 
            console.log('specific');
            this.questionsRound.push(this.getSpecificByQuestion(this.page));
        }else{
            let data = this.getRandomQuestion();
            //random
            this.questionsRound.push(data);
            console.log('random');
            console.log(data);
        }
        

        this.getLevelNameById( this.questionsRound[0].levelid);
        if (this.platform.is('cordova')) {
            this.platform.ready().then(() => {	
                this.nativeAudio.preloadComplex(this.questionsRound[0].question, this.getSoundIfExist(this.questionsRound[0].question), 1, 1, 0).then(() => {     
                this.nativeAudio.play(this.questionsRound[0].question);
              });
            });
        } else {
         console.log('cannot play native audio here');
        }
        
    }
    
    
    
    
  
  
  getSpecificByQuestion(pagetitle){
   
      for(let i = 0; i <= this.questions.length; i++){

        if(this.questions[i].question === pagetitle ){
            console.log(this.questions[i]);
            return this.questions[i];

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
      getQuestions(){
//        this.levels = this.getFromStorageStandard('levels');
//        this.storagetype = 'local';
        
        let options = this.getHeaders();

        this.http.get('https://vandel.io/wp-json/wp/v2/LPquestions?filter[meta_key].acf=levelid&filter[meta_compare]=RLIKE&filter[meta_value]='+this.levelid+'&filter[order]=desc&filter[posts_per_page]=99', options).map(res => res.json()).subscribe(allquestions => {
//            response = JSON.parse(JSON.stringify(response));
            
//            this.storagetype = 'server';
            let tmpArray3 = [];
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
                }) 
            }
            this.storeData('allquestions',tmpArray3);
            this.setupQuestionsForCurrentInnerLevel();
            
            }, err => {
          console.log(err);
        });

    }
    
    setupQuestionsForCurrentInnerLevel(){
       
        this.setNewLeveltarget();
        this.getFromStorageStandard('allquestions');
        var calc = ((this.pointsForWin / this.progressTarget) * 100) + this.progress;
        this.progress = calc;

    }
    
    playSound(){
        if (this.platform.is('cordova')) {
            this.platform.ready().then(() => {	
               this.nativeAudio.play(this.questionsRound[0].question);
            });
        } else {
            console.log('cannot play native audio here');
        }
    }
  onSuccess(){
      console.log(' success');
  }
  onError(){
      console.log(' error');
  }
  getSoundIfExist(name){
      return 'assets/audio/'+ name +'.mp3';
  }
    setNewRound(){
        //reset timer
        this.timer.unsubscribe();
        this.timer = Observable.timer(1000,1000).subscribe(val => this.timeParsed = val + ' Sek');
        //reset questions
        this.answeroptions = [];
        this.randOption = [];
        this.questionsRound = [];
        this.retry = 'false';
        this.questionsRound.push(this.getRandomQuestion());
        this.getLevelNameById( this.questionsRound[0].levelid);
//        this.ionViewDidLoad();
        this.userXpUntilNextlevel = this.levelUpTarget - this.userXp;
        
    }
  
  
    requiredToLevelUp(){
        //get next level up xp step 
        return this.levelUpTarget;
    }
    getRandomQuestion(){
        //get question from innerLevel that the user is currently on
        let rand = this.questions[Math.floor(Math.random() * this.questions.length)];
        
        
        
        return rand;
    }
    randomizeArray(arrayIn: {sort: (arg0: () => number) => void;}){
      arrayIn.sort(function() {
        return .5 - Math.random();
      });
    }
    showAlert(title: string, subTitle:string, timeVisible:number) {
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
                    this.setNewRound();
                }   
            }],
          
        });
        alert.present();
        this.hideFooterTimeout = setTimeout( () => {
            alert.dismiss();
            
            this.setNewRound();
       }, timeVisible);
    }
    showConfirmRetry(wronganswer){
        if(this.retry === 'true'){
            //Show message
            this.showAlert('Du svarede forkert igen', 'Du får et nyt spørgsmål nu, hvis du gerne vil prøve igen med det tidligere spørgsmål, så kan du finde alle spørgsmål i hovedemenuen og dermed gå til et specifikt spørgmål. Du klare det ellers godt!</h1><br><h3></h3>',7000);
            
            this.retry = 'false';
            this.setNewRound();
        }else{
            this.wrongAnswers =  this.wrongAnswers + 1;
            const alert = this.alertCtrl.create({
                title: 'Du svarede forkert',
                subTitle: 'Vil du prøve at besvare samme spørgsmål igen ?',
                buttons: [
                  {
                    text: 'Ny runde med nu',
                    role: 'cancel',
                    handler: () => {
                      console.log('Cancel clicked');
                      this.setNewRound();
                    }
                  },
                  {
                    text: 'Jeg vil gerne prøve igen',
                    handler: () => {
                        
                      this.retry = 'true';
                      
                      console.log('Trying again');
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
        
        this.userXpUntilNextlevel = this.levelUpTarget - this.userXp;
        
        var calc = ((this.pointsForWin / this.progressTarget) * 100) + this.progress;
        this.progress = calc;
        
        let InnerLevelMaxedUp = false;
        if(this.userXp >= this.levelUpTarget){
            console.log('target reached');
            console.log('current user inner level before '+ this.userCurrentInnerLevel);
            this.userCurrentInnerLevel =  this.userCurrentInnerLevel+1;
            if(this.targets.length < this.userCurrentInnerLevel){
                InnerLevelMaxedUp = true;
            }
            console.log('current user inner level after'+ this.userCurrentInnerLevel);
            this.setNewLeveltarget();
            
            let rwRatioPercent = ((this.rightAnswers / (this.rightAnswers + this.wrongAnswers)) * 100);
            if(InnerLevelMaxedUp && rwRatioPercent >= 75){
                //Generate random victory message
                this.showAlert('Det kører for dig!', 'Du har nået målet for denne underkategori<br><br>Med en besvarelse på <br><h1>' + rwRatioPercent.toFixed(3) +'%</h1><br>Så er du er klar til næste hovedkategori<br><h3></h3>',4000);
            }else if(InnerLevelMaxedUp && rwRatioPercent < 75){
                //Generate random victory message
                this.showAlert('Du bør øve dig en smule mere', 'Du har nået målet for denne underkategori, men baseret på din besvarelsesprocent ser det ikke ud til at du altid svare rigtigt.<br>Din besvarelse på: <br><h1>' + rwRatioPercent.toFixed(3) +'%</h1><br>Denne bør være over 75% for at du kan følge med til træningen.<h3></h3>',4000);
            }else{
                 this.showAlert('Det kører for dig!', 'Du har nået målet for dette underkategori<br><h1>1 UP</h1><br><h3>Er du klar til nye spørgsmål : ' + this.innerLevels[this.userCurrentInnerLevel].name+'</h3>',4000);
                 
            }
           
            this.setupQuestionsForCurrentInnerLevel();
//            this.storeData('userCurrentInnerLevel', this.userCurrentInnerLevel);
        }else{
            this.showAlert('Perfekt!','Du har fået <br><h1>'+this.pointsForWin+' XP</h1><br> for dette korrekt svar. <br><h3>Kun '+this.userXpUntilNextlevel+' indtil næste level up</h3>',4000);
        }
        
        this.storeUserData();
        
    }
    storeUserData(){
        let topicobject:any = {};
         topicobject[this.topicid] = []; 
        topicobject[this.topicid][this.levelid] = {rightAnswers:this.rightAnswers,wrongAnswers:this.wrongAnswers,userCurrentInnerLevel:this.userCurrentInnerLevel,userXp:this.userXp};
        
        let userData = [{topics:topicobject, userId:this.userId,username:''}];
        this.storeData('userData', userData);
    }
    setNewLeveltarget(){
        let oldTarget = this.levelUpTarget;
        if(this.targets.length <= this.userCurrentInnerLevel ){
            console.log('continue in this innerlevel');
        }else{
            console.log('new  innerlevel');
            this.levelUpTarget = this.targets[this.userCurrentInnerLevel].target;
        }
        
        this.progressTarget = this.levelUpTarget - oldTarget;
        console.log('new target to reach '+ this.levelUpTarget);
        //reset progress
        this.progress = 0;
    }
    
    
    presentAnswarOption(){
        //difficulty increase -
        //show answer as qustion., and the questions as answers.
        
        //Filter the previous asked and answered questions
        if (this.retry == 'true'){
            
        }else{
           
        let prev = [];
        prev.push(this.questionsRound[0].answer);
        
        if(this.questionsRound[0].answertype = 'multiplechoice'){
          
          //
          //Generate false answers
          for(var i = 0;i < this.numberOfQuestionOtions; i++){
            let randOpt = this.getRandomQuestion();

                console.log(prev.indexOf(randOpt.answer));
            if(prev.indexOf(randOpt.answer) == -1){
                console.log(randOpt.answer+' exists not ');
            }else{
                console.log(randOpt.answer+' exists');
            }
            //
            //Check if answer option is equal to the true answer
            if(this.questionsRound[0].answer ==  randOpt.answer || prev.indexOf(randOpt.answer) != -1 ){
                
                i--;
            }else{
                prev.push(randOpt.answer);
                this.answeroptions.push( 
                    {
                    text: randOpt.answer,
                        handler: () => {
                                this.showConfirmRetry(0);
                        }
                    }
                );
            }
            
            
          }
          
          
          
          //
          //Generate true answers
          //
          this.answeroptions.push(
                {
                text: this.questionsRound[0].answer,
                    handler: () => {
                        this.addXp();
                    }
                }
            );
//           answers.push(
//                {
//                text: this.questionsRound[0].answer,
//                    handler: () => {
//                        this.addXp();
//                    }
//                }
//            );
            console.log('generate answer option');
            console.log(prev);
            this.randomizeArray(this.answeroptions);
            
             this.answeroptions.push(
                {
                text: 'Cancel - Pas Question',
                role: 'cancel',
                handler: () => {
                  console.log('Cancel clicked');
                    this.setNewRound();
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