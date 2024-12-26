'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Disease } from '../app/types/disease'

interface HierarchyTerm {
  iri: string
  label: string
  description?: string[]
  obo_id?: string
}

interface ResultsDisplayProps {
  disease: Disease
}

export default function ResultsDisplay({ disease }: ResultsDisplayProps) {
  const [hierarchy, setHierarchy] = useState<HierarchyTerm[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [efoId, setEfoId] = useState<string | null>(null)

  useEffect(() => {
    const fetchDiseaseDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const searchUrl = new URL('https://www.ebi.ac.uk/ols4/api/search')
        searchUrl.searchParams.append('q', disease.label)
        searchUrl.searchParams.append('ontology', 'efo')
        searchUrl.searchParams.append('exact', 'true')
        searchUrl.searchParams.append('queryFields', 'label')

        const searchResponse = await fetch(searchUrl.toString())
        if (!searchResponse.ok) {
          throw new Error('Failed to fetch disease details')
        }

        const searchData = await searchResponse.json()
        const firstResult = searchData.response?.docs?.[0]
        
        if (!firstResult) {
          throw new Error('Disease not found in EFO')
        }

        setEfoId(firstResult.obo_id || firstResult.iri)

        const shortForm = firstResult.iri.split('/').pop()
        if (!shortForm) {
          throw new Error('Invalid IRI format')
        }

        const hierarchyUrl = new URL(`https://www.ebi.ac.uk/ols4/api/ontologies/efo/terms/http%253A%252F%252Fwww.ebi.ac.uk%252Fefo%252F${shortForm}/hierarchicalAncestors`)
        
        const hierarchyResponse = await fetch(hierarchyUrl.toString())
        if (!hierarchyResponse.ok) {
          throw new Error('Failed to fetch hierarchy')
        }

        const hierarchyData = await hierarchyResponse.json()
        if (hierarchyData._embedded?.terms) {
          setHierarchy(hierarchyData._embedded.terms)
        } else {
          setHierarchy([])
        }
      } catch (err) {
        console.error('Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        setHierarchy([])
      }
      setLoading(false)
    }

    if (disease.label) {
      fetchDiseaseDetails()
    }
  }, [disease.label])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-8 w-full"
    >
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Disease Details</h2>
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{disease.label}</h3>
          {disease.description && (
            <p className="text-gray-600 dark:text-gray-300">{disease.description}</p>
          )}
          
          <div>
            <strong className="text-gray-700 dark:text-gray-300">EFO ID:</strong>{' '}
            {efoId ? (
              <a
                href={`https://www.ebi.ac.uk/ols4/ontologies/efo/terms?iri=${encodeURIComponent(efoId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{efoId}</code>
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            ) : (
              <Skeleton className="h-6 w-32 inline-block" />
            )}
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => setExpanded(!expanded)}
              disabled={loading || hierarchy.length === 0}
            >
              {expanded ? (
                <ChevronDown className="mr-2 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Loading...' : expanded ? 'Hide' : 'Show'} Hierarchy
              {!loading && hierarchy.length > 0 && ` (${hierarchy.length})`}
            </Button>

            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}

            <AnimatePresence>
              {expanded && !loading && hierarchy.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 ml-4 overflow-hidden"
                >
                  <ul className="space-y-3">
                    {hierarchy.map((term, index) => (
                      <motion.li
                        key={term.iri}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border-l-2 border-blue-200 dark:border-blue-700 pl-4 py-2"
                      >
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {term.label}
                          {term.obo_id && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              ({term.obo_id})
                            </span>
                          )}
                        </div>
                        {term.description && term.description[0] && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {term.description[0]}
                          </div>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {expanded && !loading && hierarchy.length === 0 && !error && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">No hierarchy information available.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}