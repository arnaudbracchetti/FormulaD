

import { BoardDefinitionComponent } from './board-definition/board-definition.component';
import { TrackSelectionComponent } from './track-selection/track-selection.component';
import { Routes } from '@angular/router';

export let routes: Routes = [
    { path: 'track-config/:trackKey', component: BoardDefinitionComponent },
    { path: 'select', component: TrackSelectionComponent },


    // default path
    {
        path: '',
        redirectTo: '/select',
        pathMatch: 'full'
    },

];
