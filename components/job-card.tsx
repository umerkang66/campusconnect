'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function JobCard({ job }: { job: any }) {
  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col justify-between transition-transform"
    >
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {job.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mt-3 line-clamp-3">
          {job.description}
        </p>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {job.type}
          </span>
          <span className="text-sm text-gray-500">
            {job.applicationsCount || 0}{' '}
            {job.applicationsCount === 1 ? 'applicant' : 'applicants'}
          </span>
        </div>
        <Link
          href={`/jobs/${job._id}`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition-colors"
        >
          View
        </Link>
      </div>

      {job.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {job.tags.map((tag: string) => (
            <span
              key={tag}
              className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}
