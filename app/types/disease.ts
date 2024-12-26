export interface Disease {
    id: string
    label: string
    description?: string
  }
  
  export interface SearchBarProps {
    onSelect: (disease: Disease | null) => void
  }
  
  export interface ResultsDisplayProps {
    disease: Disease
  }
  
  