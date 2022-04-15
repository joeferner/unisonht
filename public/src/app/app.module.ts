import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigPageComponent } from './pages/config-page/config-page.component';
import { ConfigGraphComponent } from './pages/config-page/components/config-graph/config-graph.component';
import { ConfigGraphNodeComponent } from './pages/config-page/components/config-graph/components/config-graph-node/config-graph-node.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfigPageComponent,
    ConfigGraphComponent,
    ConfigGraphNodeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
