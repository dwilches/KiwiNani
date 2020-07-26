import { Injectable } from "@angular/core"
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router"
import { WanikaniService } from "../wanikani.service/wanikani.service"

@Injectable({
  providedIn: "root"
})
export class AuthenticationGuard implements CanActivate {

  constructor(private wanikani: WanikaniService,
              private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): boolean {
    if (!this.wanikani.isAuthed()) {
      this.router.navigate([ "login" ])
      return false
    }
    return true
  }

}
