import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';


import { AppComponent } from './app.component';
import { GameboardComponent } from './gameboard/gameboard.component';
import { BoardDefinitionComponent } from './board-definition/board-definition.component';
import { BoardDefinitionService } from './board-definition/board-definition.service';
import { TrackSelectionComponent } from './track-selection/track-selection.component';

import { routes } from './routes-definition';
import { SpaceDefinitionComponent } from './tokens/space-definition/space-definition.component';

@NgModule({
    declarations: [
        AppComponent,
        GameboardComponent,
        BoardDefinitionComponent,
        TrackSelectionComponent,
        SpaceDefinitionComponent
    ],
    imports: [
        BrowserModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
        RouterModule.forRoot(
            routes,
            { enableTracing: false } // <-- debugging purposes only
        )
    ],
    providers: [BoardDefinitionService],
    bootstrap: [AppComponent]
})
export class AppModule { }
