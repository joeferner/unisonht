import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigPageComponent } from './pages/config-page/config-page.component';
import { ConfigGraphComponent } from './pages/config-page/components/config-graph/config-graph.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfigPageComponent,
    ConfigGraphComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
