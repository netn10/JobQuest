export type ApplicationStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN'

export interface JobApplication {
  id?: string
  company: string
  role: string
  description?: string
  appliedDate: string
  status: ApplicationStatus
  notes?: string
  nextAction?: string
  salary?: string
  location?: string
  jobUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface JobApplicationWithId extends Omit<JobApplication, 'id'> {
  id: string
}
