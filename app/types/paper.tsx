export interface Paper {
    id: string
    label: string
    description?: string
  }
  
  export interface SearchBarProps {
    onSelect: (disease: Paper | null) => void
  }
  
  export interface ResultsDisplayProps {
    disease: Paper
  }
  