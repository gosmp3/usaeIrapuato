import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Form2Component } from './form/form2.component';
import { AdminViewComponent } from './admin-view/admin-view.component';
import { AdminGuard } from './admin.guard'; // Asegúrate de importar correctamente el guard de ruta

const routes: Routes = [
  { path: '', component: Form2Component},
  { path: 'admin', component: AdminViewComponent,canActivate: [AdminGuard] },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AdminGuard]
})
export class AppRoutingModule { }