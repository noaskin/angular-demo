import { Component } from '@angular/core';
import 'style-loader!./app.themes.scss';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  title = 'app';
}
