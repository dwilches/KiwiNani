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
