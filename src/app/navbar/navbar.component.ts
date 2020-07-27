import { Component, OnInit } from "@angular/core"
import { WanikaniService } from "../wanikani.service/wanikani.service"
import { Router } from "@angular/router"

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: [ "./navbar.component.css" ]
})
export class NavbarComponent implements OnInit {

  constructor(private wanikani: WanikaniService,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.wanikani.removeToken()
    this.router.navigate([ "login" ])
  }

}
