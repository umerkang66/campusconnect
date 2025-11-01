'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, MapPin, DollarSign, Mail } from 'lucide-react';

interface Applicant {
  _id: string;
  applicantId: {
    name: string;
    email: string;
    university?: string;
    major?: string;
  };
  createdAt: string;
}

export default function JobApplicationsPage() {
  const { id } = useParams();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchApplicants = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/${id}/applications`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Failed to fetch applicants');
          return;
        }

        setApplicants(data.applications || []);
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [id]);

  return (
    <section className="min-h-screen px-6 py-16 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-neutral-900 dark:to-neutral-950">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">
        Job Applicants
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Loading applicants...
        </p>
      ) : applicants.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No applicants found for this job.
        </p>
      ) : (
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applicants.map(applicant => (
            <motion.div
              key={applicant._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 transition-colors hover:shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-neutral-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {applicant.applicantId.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="w-4 h-4" /> {applicant.applicantId.email}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-gray-600 dark:text-gray-400 text-sm mb-3">
                {applicant.applicantId.university && (
                  <p className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />{' '}
                    {applicant.applicantId.university}
                  </p>
                )}
                {applicant.applicantId.major && (
                  <p className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />{' '}
                    {applicant.applicantId.major}
                  </p>
                )}
              </div>

              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Applied on: {new Date(applicant.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
