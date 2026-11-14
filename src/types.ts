export interface TuitionRecord {
  id: string
  year: 2025 | 2026
  schoolName: string
  schoolType: string
  establishment: string
  region: string
  status: string
  tuition: number
  humanities: number
  naturalScience: number
  artsSports: number
  engineering: number
  medicine: number
  tuitionBand: string
}

export interface ChangeRecord {
  schoolName: string
  schoolType: string
  establishment: string
  region: string
  tuition2025: number
  tuition2026: number
  changeRate: number
}

export interface Filters {
  year: 'ALL' | 2025 | 2026
  schoolType: string
  establishment: string
  region: string
  tuitionBand: string
  query: string
  includeZero: boolean
  sort: 'DESC' | 'ASC' | 'NAME'
  limit: number
}
