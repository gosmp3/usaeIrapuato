import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      switchMap((isAuthenticated) => {
        if (isAuthenticated) {
          return this.isAdmin();
        } else {
          this.router.navigate(['/']); // Redirecciona a otra ruta si el usuario no está autenticado
          return of(false); // Evita el acceso a la ruta '/admin'
        }
      })
    );
  }

  private isAdmin(): Observable<boolean> {
    return this.authService.user$.pipe(
      map((userData: any) => {
        if (userData) {
          // Verifica si el usuario es el administrador utilizando su correo electrónico
          const isAdmin = userData.email === 'a57723480@gmail.com';
          return isAdmin;
        }
        return false; // Si no hay información del usuario, no es un administrador
      })
    );
  }
}
