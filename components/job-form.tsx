'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Sparkles, Save, Send, Loader2 } from 'lucide-react';

const JOB_TYPES = [
  { value: 'ACADEMIC_PROJECT', label: 'Academic Project' },
  { value: 'STARTUP_COLLABORATION', label: 'Startup / Collaboration' },
  { value: 'PART_TIME_JOB', label: 'Part-Time Job' },
  { value: 'COMPETITION_TEAM', label: 'Competition Team' },
  { value: 'HACKATHON', label: 'Hackathon' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

interface JobFormProps {
  initialData?: {
    _id?: string;
    title: string;
    description: string;
    type: string;
    tags: string[];
    requirements: string[];
    compensation?: string;
    duration?: string;
    status: string;
  };
  isEdit?: boolean;
}

export default function JobForm({ initialData, isEdit }: JobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'PART_TIME_JOB',
    tags: initialData?.tags?.join(', ') || '',
    requirements: initialData?.requirements?.join(', ') || '',
    compensation: initialData?.compensation || '',
    duration: initialData?.duration || '',
    status: initialData?.status || 'ACTIVE',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAIEnhance = async () => {
    if (!form.title || !form.description) {
      toast.error('Please enter a title and description first');
      return;
    }

    setAiLoading(true);
    try {
      const res = await api.post('/ai/enhance-description', {
        title: form.title,
        description: form.description,
        type: form.type,
      });
      setForm({ ...form, description: res.data.description });
      toast.success('Description enhanced with AI!');
    } catch (error) {
      toast.error('AI enhancement failed. Try again later.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    setLoading(true);

    const tagsArray = form.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const requirementsArray = form.requirements
      .split(',')
      .map(r => r.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      tags: tagsArray,
      requirements: requirementsArray,
      status: isDraft ? 'DRAFT' : 'ACTIVE',
    };

    try {
      if (isEdit && initialData?._id) {
        await api.patch(`/jobs/${initialData._id}`, payload);
        toast.success('Job updated successfully!');
      } else {
        await api.post('/jobs', payload);
        toast.success(isDraft ? 'Draft saved!' : 'Job posted successfully!');
      }
      router.push('/dashboard/finder/my-jobs');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={e => handleSubmit(e, false)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g., Frontend Developer for Startup"
          required
          className="input-modern"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type *
        </label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="input-modern"
        >
          {JOB_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description with AI Enhancement */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description *
          </label>
          <motion.button
            type="button"
            onClick={handleAIEnhance}
            disabled={aiLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Enhance with AI
          </motion.button>
        </div>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the opportunity, what you're looking for, and what you offer..."
          rows={6}
          required
          className="input-modern resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags (comma-separated)
        </label>
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="e.g., React, Node.js, UI/UX, Machine Learning"
          className="input-modern"
        />
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Requirements (comma-separated)
        </label>
        <input
          name="requirements"
          value={form.requirements}
          onChange={handleChange}
          placeholder="e.g., 2+ years experience, Good communication, Team player"
          className="input-modern"
        />
      </div>

      {/* Duration & Compensation */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duration
          </label>
          <input
            name="duration"
            value={form.duration}
            onChange={handleChange}
            placeholder="e.g., 3 months, Ongoing"
            className="input-modern"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Compensation
          </label>
          <input
            name="compensation"
            value={form.compensation}
            onChange={handleChange}
            placeholder="e.g., Paid, Equity, Unpaid"
            className="input-modern"
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center gap-4 pt-4">
        <motion.button
          type="button"
          onClick={e => handleSubmit(e, true)}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save as Draft
        </motion.button>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary inline-flex items-center gap-2 flex-1 justify-center"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isEdit ? 'Update Job' : 'Post Job'}
        </motion.button>
      </div>
    </form>
  );
}
