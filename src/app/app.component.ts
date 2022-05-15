import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
// import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { HomePage } from '../pages/home/home';
// import { ListPage } from '../pages/list/list';
import { QuestionListPage } from '../pages/questionlist/questionlist';
import { LevelsPage } from '../pages/levels/levels';

//import { InnerQuestionsPage } from '../pages/innerquestions/innerquestions';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
    rightAnswers:number;
    wrongAnswers:number;
    rwRatio:number;
    rwRatioPercent:number;
    totalQuestionsAnswered:number;

    items: Array<{id: number, title: string, component:any}>;

  rootPage: any = HomePage;

  pages: Array<{id:number, title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private storage: Storage) { //,private ga: GoogleAnalytics
    this.initializeApp();
    this.items = [];
    this.pages = [];



    //Push pages into array Page for sidemenu
    this.items.push(
        { id: 1, title: 'Dashboard',component: HomePage },
        { id: 2, title: 'Alle spørgsmål', component: QuestionListPage },
        { id: 3, title: 'Vælg Kup/Dan', component: LevelsPage },
    );

    for (let item of this.items) {
        this.pages.push({id: item.id, title: item.title, component:item.component});
    }



  }
  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //
      // this.ga.startTrackerWithId('UA-128180348-1')
      //  .then(() => {
      //    console.log('Google analytics is ready now');
      //     this.ga.trackView('Home page');
      //    // Tracker is ready
      //    // You can now track pages or set additional information such as AppVersion or UserId
      //  })
      //  .catch(e => console.log('Error starting GoogleAnalytics', e));
      this.statusBar.overlaysWebView(true);
      this.statusBar.hide();
      this.splashScreen.hide();

       // Instantiation function
        this.storage.get('userData').then((result) => {
            if ( !result ) {

                let topicobject:any = {};
                // 104 is the id from the category in wordpress - dosnt matter its hardcoded.
                topicobject[104] = {0:{rightAnswers:0,wrongAnswers:0,userCurrentInnerLevel:0,userXp:0}};

                let userData = [{topics:topicobject, userId:this.makeid(),username:''}];
//
                this.storage.set('userData', userData);
            }else{
//                if(result[0].topics[104].wrongAnswers !== 0 && result[0].topics[104].rightAnswers !== 0){
//                     //push data to sidemenu info bar
//                     this.rightAnswers = result[0].topics[104].rightAnswers;
//                     this.wrongAnswers = result[0].topics[104].wrongAnswers;
//                     this.rwRatio = (this.rightAnswers / this.wrongAnswers ) / 100 ;
//                     this.rwRatioPercent = ((this.rightAnswers / (this.rightAnswers + this.wrongAnswers)) * 100);
//                }
//                this.totalQuestionsAnswered = this.rightAnswers + this.wrongAnswers;
            }
        }).catch((err) => {
           console.log('Your data dont exist and returns error in catch: ' + JSON.stringify(err) );
        });
    });


  }
    makeid() {
        //make this a unique device id that can be save in the db.
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.*";

        for (var i = 0; i < 20; i++){
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }




  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);

  }
}
