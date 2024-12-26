'use client'

import { useState, useRef, useCallback } from 'react'
import { useCombobox } from 'downshift'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, X } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Disease, SearchBarProps } from '../app/types/disease'

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [inputItems, setInputItems] = useState<Disease[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const searchDiseases = useCallback(async (inputValue: string) => {
    if (!inputValue) {
      setInputItems([])
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `https://www.ebi.ac.uk/ols4/api/search?q=${encodeURIComponent(inputValue)}&ontology=efo&fieldList=id,label,description`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch diseases')
      }
      const data = await response.json()
      // const diseases = data.response.docs.map((doc: any) => ({
      //   id: doc.id,
      //   label: doc.label,
      //   description: doc.description ? doc.description[0] : undefined
      // }))

      const diseases = data.response.docs.map((doc: { id: string; label: string; description?: string[] }) => ({
        id: doc.id,
        label: doc.label,
        description: doc.description ? doc.description[0] : undefined,
      }));
      
      if (diseases.length === 0) {
        setError('Please provide an actual disease name.')
      } else {
        setInputItems(diseases)
      }
    } catch (error) {
      console.error('Error fetching diseases:', error)
      setError('Failed to fetch diseases. Please try again.')
      setInputItems([])
    }
    setLoading(false)
  }, [])

  const {
  
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    setInputValue,
  } = useCombobox({
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      searchTimeoutRef.current = setTimeout(() => {
        if (inputValue) searchDiseases(inputValue)
      }, 300)
    },
    itemToString: (item: Disease | null) => (item ? item.label : ''),
    onSelectedItemChange: ({ selectedItem }) => onSelect(selectedItem || null),
  })

  const menuProps = getMenuProps()

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <div className="relative">
        <Input
          {...getInputProps()}
          placeholder="Search for a disease..."
          className="w-full pl-12 pr-12 py-3 text-lg rounded-full shadow-md focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 transition-shadow duration-200"
          aria-label="Search for a disease"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-500 animate-spin" />
        )}
        {inputItems.length > 0 && !loading && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
            onClick={() => {
              setInputValue('')
              setInputItems([])
            }}
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div {...menuProps}>
        <AnimatePresence>
          {isOpen && (inputItems.length > 0 || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 w-full mt-2 max-h-80 overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            >
              {error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : (
                <ul>
                  {inputItems.map((item, index) => (
                    <li
                      key={`${item.id}-${index}`}
                      {...getItemProps({ item, index })}
                      className={`${
                        highlightedIndex === index ? 'bg-blue-100 dark:bg-blue-700' : ''
                      } p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-600 transition-colors duration-150`}
                    >
                      <div className="font-semibold text-gray-800 dark:text-white">{item.label}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.description}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

