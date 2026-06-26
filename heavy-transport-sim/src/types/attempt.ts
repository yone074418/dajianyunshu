export const STAGE_IDS = [
  'stage_1_task_intro',
  'stage_2_simple_vehicle_selection',
  'stage_3_route_survey',
  'stage_4_vehicle_group_confirmation',
  'stage_5_loading_and_lashing',
  'stage_6_transport',
] as const

export const STAGE_NAMES: Record<StageId, string> = {
  stage_1_task_intro: '运输任务及货物介绍',
  stage_2_simple_vehicle_selection: '简单配车',
  stage_3_route_survey: '路线勘测',
  stage_4_vehicle_group_confirmation: '车组确定',
  stage_5_loading_and_lashing: '货物装车与绑扎加固',
  stage_6_transport: '货物运输',
}

export type StageId = (typeof STAGE_IDS)[number]

export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned'
export type StepStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'completed'
  | 'failed'

export interface Attempt {
  id: string
  studentId: string
  caseId: string
  status: AttemptStatus
  currentStageIndex: number
  createdAt: string
  updatedAt: string
}

export interface AttemptStep {
  id: string
  attemptId: string
  stageId: StageId
  stageIndex: number
  status: StepStatus
  dataSnapshot: unknown
  savedAt: string | null
}

export interface AttemptWithSteps {
  attempt: Attempt
  steps: AttemptStep[]
}

export interface AttemptResumeState {
  attempt: Attempt
  steps: AttemptStep[]
  currentStep: AttemptStep
}

export interface OperationLog {
  id: string
  attemptId: string
  studentId: string
  eventType: string
  stageId: StageId | null
  result: string
  timestamp: string
}
