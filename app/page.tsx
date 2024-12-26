'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import ResultsDisplay from '../components/ResultDisplay'
import ResearchPapers from '../components/ResearchPapers'
import type { Disease } from '../app/types/disease'

export default function Home() {
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Disease Ontology Explorer
          </h1>
          <SearchBar onSelect={setSelectedDisease} />
          <AnimatePresence mode="wait">
            {selectedDisease && (
              <motion.div
                key={selectedDisease.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <ResultsDisplay disease={selectedDisease} />
                <ResearchPapers diseaseId={selectedDisease.id} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  )
}

