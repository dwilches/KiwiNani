import {Injectable} from "@angular/core"
import {HttpClient, HttpHeaders} from "@angular/common/http"
import {Observable, ReplaySubject} from "rxjs"
import {map} from "rxjs/operators"

@Injectable({
  providedIn: "root"
})
export class WanikaniService {

  private readonly wanikaniServer = "https://api.wanikani.com"
  private authToken: string
  private userSubject = new ReplaySubject<UserResponse>(1)

  constructor(private http: HttpClient) {
    this.authToken = localStorage.getItem("WANIKANI_TOKEN")

    if (this.isAuthed()) {
      this.getUser(this.authToken)
        .then(user => this.userSubject.next(user))
    }
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
        this.userSubject.next(user)
        return user
      })
  }

  public removeToken(): void {
    localStorage.removeItem("WANIKANI_TOKEN")
    this.authToken = null
    this.userSubject.next(null)
  }

  public getUser$(): Observable<UserResponse> {
    return this.userSubject.asObservable()
  }

  public getLevelProgressions(): Promise<LevelProgression[]> {
    return this.get<LevelProgressionResponse>(`level_progressions`)
      .toPromise()
      .then(levels => levels.map(level => level.data))
  }

  // Invokes the "assignments" endpoint once and again until all data has been retrieved.
  public async getAllAssignments(): Promise<Assignment[]> {
    let nextUrl = `${this.wanikaniServer}/v2/assignments`
    const allData = []
    while (nextUrl) {
      const response = await this.baseGet(nextUrl).toPromise()
      allData.push(...response.data as AssignmentMetadata[])
      nextUrl = response.pages.next_url
    }
    return allData.map(a => a.data)
  }

  private getUser(overrideAuthToken: string): Promise<UserResponse> {
    return this.get<UserResponse>(`user`, overrideAuthToken)
      .toPromise()
  }

  private get<T>(url: string, overrideAuthToken?: string): Observable<T> {
    return this.baseGet(`${this.wanikaniServer}/v2/${url}`, overrideAuthToken)
      .pipe(map(response => response.data as T))
  }

  private baseGet(url: string, overrideAuthToken?: string, params?: Record<string, string>): Observable<WaniKaniResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + (overrideAuthToken || this.authToken)
    })

    return this.http.get<WaniKaniResponse>(url, {headers, params})
  }

}
