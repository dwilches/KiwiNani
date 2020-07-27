import { Component } from "@angular/core"
import { WanikaniService } from "../wanikani.service/wanikani.service"
import { Router } from "@angular/router"
import { map } from "rxjs/operators"
import { Observable } from "rxjs"

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: [ "./navbar.component.scss" ]
})
export class NavbarComponent {

  username$: Observable<string>

  constructor(private wanikani: WanikaniService,
              private router: Router) {
    this.username$ = wanikani.getUser$()
      .pipe(map(user => user?.username))
  }

  logout(): void {
    this.wanikani.removeToken()
    this.router.navigate([ "login" ])
  }
}
