import { Inject, Injectable, InjectionToken } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import * as _ from "lodash"

export const WANIKANI_TOKEN = new InjectionToken("WANIKANI_TOKEN")


interface WaniKaniResponse {
  object: string
  url: string
  data_updated_at: date
  data: unknown
  pages?: object
}

interface UserResponse {
  id: string
  username: string
  level: number
  profile_url: string
  started_at: date
  subscription: object
  current_vacation_started_at: date
  preferences: object
}

type LevelProgressionResponse = LevelProgressionMetadata[]

interface LevelProgressionMetadata {
  id: number
  object: string
  url: string
  data_updated_at: date
  data: LevelProgression
}

interface LevelProgression {
  created_at: date
  level: number
  unlocked_at: date
  started_at: date
  passed_at: date
  completed_at: date
  abandoned_at: date
}

type AssignmentResponse = AssignmentMetadata[]

interface AssignmentMetadata {
  id: number
  object: string
  url: string
  data_updated_at: date
  data: Assignment
}

interface Assignment {
  available_at: date
  burned_at: date
  created_at: date
  hidden: boolean
  passed_at: date
  passed: boolean
  resurrected_at: date
  srs_stage_name: string
  srs_stage: number
  started_at: date
  subject_id: number
  subject_type: string
  unlocked_at: date
}

@Injectable({
  providedIn: "root"
})
export class WanikaniService {

  private readonly wanikaniServer = "https://api.wanikani.com"

  constructor(private http: HttpClient,
              @Inject(WANIKANI_TOKEN) private authToken: string) {
  }

  public getUser(): Observable<UserResponse> {
    return this.get<UserResponse>(`user`)
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

  private get<T>(url: string): Observable<T> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + this.authToken
    })

    return this.http.get<WaniKaniResponse>(`${ this.wanikaniServer }/v2/${ url }`, { headers })
      .pipe(map(response => response.data as T))
  }

}
