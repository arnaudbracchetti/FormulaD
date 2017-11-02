
import { AppComponent } from './app.component';
import { routes } from './routes-definition';
import { RouterTestingModule } from '@angular/router/testing';
import { EasyTest, easyTest } from 'ngx-easy-test';

describe('AppComponent', () => {
    type Context = EasyTest<AppComponent>;

    easyTest(AppComponent, {
        declarations: [
            AppComponent
        ],
        imports: [
            RouterTestingModule.withRoutes([])
        ]
    });

    it('should create the app', function(this: Context) {
        expect(this.testedElement).toBeTruthy();
    });

});
