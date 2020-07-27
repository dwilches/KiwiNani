import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

@Injectable({
  providedIn: "root"
})
export class WanikaniService {

  private readonly wanikaniServer = "https://api.wanikani.com"
  private authToken: string

  constructor(private http: HttpClient) {
    this.authToken = localStorage.getItem("WANIKANI_TOKEN")
  }

  public isAuthed(): boolean {
    return !!this.authToken
  }

  public setToken(authToken: string): Promise<UserResponse> {
    // Validate the token before accepting ir
    return this.get<UserResponse>(`user`, authToken)
      .toPromise()
      .then(user => {
        localStorage.setItem("WANIKANI_TOKEN", authToken)
        this.authToken = authToken
        return user
      })
  }

  public removeToken(): void {
    localStorage.removeItem("WANIKANI_TOKEN")
  }

  public getUser(): Promise<UserResponse> {
    return this.get<UserResponse>(`user`)
      .toPromise()
  }

  public getLevelProgressions(): Promise<LevelProgression[]> {
    return this.get<LevelProgressionResponse>(`level_progressions`)
      .toPromise()
      .then(levels => levels.map(level => level.data))
  }

  public getAllAssignments(): Promise<Assignment[]> {
    return this.get<AssignmentResponse>(`assignments`)
      .toPromise()
      .then(assignments => assignments.map(a => a.data))
  }

  private get<T>(url: string, overrideAuthToken?: string): Observable<T> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + (overrideAuthToken || this.authToken)
    })

    return this.http.get<WaniKaniResponse>(`${ this.wanikaniServer }/v2/${ url }`, { headers })
      .pipe(map(response => response.data as T))
  }

}
