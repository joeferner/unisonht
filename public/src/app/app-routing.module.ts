import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigPageComponent } from './pages/config-page/config-page.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigPageComponent,
  },
  {
    path: 'config',
    component: ConfigPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
