import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { NativeAudio } from '@ionic-native/native-audio';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LevelsPage } from '../pages/levels/levels';
import { InnerQuestionsPage } from '../pages/innerquestions/innerquestions';
import { QuestionListPage } from '../pages/questionlist/questionlist';
import { ProgressBarComponent } from '../components/progress-bar/progress-bar';
import { PopoverPage } from '../pages/popover/popover';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    LevelsPage,
    InnerQuestionsPage,
    QuestionListPage,
    ProgressBarComponent,
    PopoverPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    LevelsPage,
    InnerQuestionsPage,
    QuestionListPage,
    PopoverPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NativeAudio, // New provider, don't forget to add comma
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {
    constructor() {
    }
}
