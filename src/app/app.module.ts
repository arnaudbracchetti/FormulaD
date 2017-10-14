import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';


import { AppComponent } from './app.component';
import { GameboardComponent } from './gameboard/gameboard.component';
import { BoardDefinitionComponent } from './board-definition/board-definition.component';
import { BoardDefinitionService } from './gameboard/board-definition.service';

@NgModule({
    declarations: [
        AppComponent,
        GameboardComponent,
        BoardDefinitionComponent
    ],
    imports: [
        BrowserModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule
    ],
    providers: [BoardDefinitionService],
    bootstrap: [AppComponent]
})
export class AppModule { }
