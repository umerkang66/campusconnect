'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Application {
  _id: string;
  coverLetter?: string;
  resume?: string;
  jobPostId: string;
  createdAt: string;
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch('/api/applications');
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Failed to fetch applications');
        } else {
          setApplications(data.applications);
        }
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-20 text-gray-500 dark:text-gray-400">
        Loading your applications...
      </p>
    );
  }

  if (applications.length === 0) {
    return (
      <p className="text-center mt-20 text-gray-500 dark:text-gray-400">
        You have not applied to any jobs yet.
      </p>
    );
  }

  return (
    <section className="min-h-screen px-6 py-16 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-neutral-900 dark:to-neutral-950">
      <h1 className="text-3xl font-bold mb-10 text-gray-900 dark:text-gray-100 text-center">
        My Applications
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {applications.map(app => {
          return (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-neutral-800 hover:shadow-xl transition-shadow card-hover"
            >
              {/* Application Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Application #{app._id}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Job ID: {app.jobPostId}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  Applied
                </span>
              </div>

              {/* Cover Letter Section */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cover Letter
                </h4>
                <div className="bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
                  {app.coverLetter ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {app.coverLetter}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                      No cover letter provided
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resume
                </h4>
                <div className="bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
                  {app.coverLetter ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {app.resume}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                      No resume provided
                    </p>
                  )}
                </div>
              </div>

              {/* Footer with Date */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-neutral-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Applied {app.createdAt}
                </span>
                <div className="flex space-x-2"></div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
