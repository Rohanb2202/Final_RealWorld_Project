import { useState } from 'react';
import { motion } from 'framer-motion';
import { Paper } from '../app/types/paper';

interface DiseasePageProps {
  diseaseId: string;
}

const DiseasePage: React.FC<DiseasePageProps> = ({ diseaseId }) => {
  // eslint-disable-next-line
  const [papers] = useState<Paper[]>([]);
  // Remove the fetchPapers useEffect completely

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-8 w-full"
    >
      <h2 className="text-2xl font-semibold mb-4">Latest Research Papers</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">
          Research papers integration coming soon. This feature will allow you to explore the latest research related to {diseaseId}.
        </p>
      </div>
    </motion.div>
  );
};

export default DiseasePage;

