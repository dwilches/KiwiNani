import { Component } from "@angular/core"
import { WanikaniService } from "../wanikani.service/wanikani.service"
import { Router } from "@angular/router"

const REDIRECT_TIMEOUT = 2000 // ms

@Component({
  selector: "app-authentication",
  templateUrl: "./login.component.html",
  styleUrls: [ "./login.component.scss" ]
})
export class LoginComponent {
  token: string
  savingToken = false
  invalidToken = false
  validToken = false
  user: string

  constructor(private wanikani: WanikaniService,
              private router: Router) {
  }

  saveToken(): void {
    this.savingToken = true
    this.wanikani.setToken(this.token.trim())
      .then(user => {
        this.user = user.username
        this.validToken = true
        setTimeout(() => this.router.navigate([ "main" ]), REDIRECT_TIMEOUT)
      })
      .catch(error => {
        this.invalidToken = true
      })
      .finally(() => this.savingToken = false)
  }

  onTokenChanged(): void {
    this.invalidToken = false
  }
}
