'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Image from 'next/image';
import api from '@/lib/api';
import {
  KeyRound,
  User,
  Sparkles,
  Save,
  Loader2,
  GraduationCap,
  Code,
  Heart,
  Link as LinkIcon,
  Github,
  Globe,
  FileText,
  Award,
} from 'lucide-react';

interface ProfileData {
  name: string;
  bio: string;
  skills: string;
  interests: string;
  university: string;
  major: string;
  graduationYear: string;
  linkedin: string;
  github: string;
  portfolio: string;
  resume: string;
}

export default function MePage() {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [profileScore, setProfileScore] = useState(0);
  const [resumeText, setResumeText] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    bio: '',
    skills: '',
    interests: '',
    university: '',
    major: '',
    graduationYear: '',
    linkedin: '',
    github: '',
    portfolio: '',
    resume: '',
  });

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
  });

  // Fetch user profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/users/me');
        const user = res.data.user;
        setProfile({
          name: user.name || '',
          bio: user.bio || '',
          skills: user.skills?.join(', ') || '',
          interests: user.interests?.join(', ') || '',
          university: user.university || '',
          major: user.major || '',
          graduationYear: user.graduationYear?.toString() || '',
          linkedin: user.linkedin || '',
          github: user.github || '',
          portfolio: user.portfolio || '',
          resume: user.resume || '',
        });
        setProfileScore(user.profileScore || 0);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    }

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...profile,
        skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: profile.interests.split(',').map(i => i.trim()).filter(Boolean),
        graduationYear: profile.graduationYear ? parseInt(profile.graduationYear) : null,
      };

      const res = await api.patch('/users/me', payload);
      setProfileScore(res.data.user.profileScore || 0);
      toast.success('Profile updated successfully!');

      // Update session
      await update({ name: profile.name });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (resumeText.length < 50) {
      toast.error('Please paste more resume content (at least 50 characters)');
      return;
    }

    setAiLoading(true);
    try {
      const res = await api.post('/ai/generate-profile', { resumeText });
      const generated = res.data.profile;

      setProfile({
        ...profile,
        name: generated.name || profile.name,
        bio: generated.bio || profile.bio,
        skills: generated.skills?.join(', ') || profile.skills,
        interests: generated.interests?.join(', ') || profile.interests,
        university: generated.university || profile.university,
        major: generated.major || profile.major,
        linkedin: generated.linkedin || profile.linkedin,
        github: generated.github || profile.github,
        portfolio: generated.portfolio || profile.portfolio,
      });

      toast.success('Profile generated from resume!');
      setShowAiModal(false);
      setResumeText('');
    } catch (error) {
      toast.error('AI generation failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/change-password', {
        email: session?.user?.email,
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });

      toast.success('Password updated successfully');
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-neutral-900 dark:to-neutral-950">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-neutral-900 dark:to-neutral-950">
        <p className="text-lg text-gray-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  const { user }: any = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile information and account settings
          </p>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || 'User'}
                width={100}
                height={100}
                className="rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 w-20 h-20 sm:w-24 sm:h-24"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full gradient-bg flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-gray-500 text-sm sm:text-base">{user.email}</p>
              <div className="mt-3">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Profile Completeness
                  </span>
                </div>
                <div className="w-full max-w-xs mx-auto sm:mx-0 h-3 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-bg rounded-full transition-all duration-500"
                    style={{ width: `${profileScore}%` }}
                  />
                </div>
                <p className="text-sm text-indigo-500 mt-1 font-medium">
                  {profileScore}% Complete
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAiModal(true)}
              className="btn-primary inline-flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Generate from Resume</span>
              <span className="sm:hidden">AI Generate</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSaveProfile}
          className="glass-card p-8 mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="input-modern"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                University
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="university"
                  value={profile.university}
                  onChange={handleProfileChange}
                  className="input-modern pl-10"
                  placeholder="Your university"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Major / Field
              </label>
              <input
                name="major"
                value={profile.major}
                onChange={handleProfileChange}
                className="input-modern"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Graduation Year
              </label>
              <input
                name="graduationYear"
                type="number"
                value={profile.graduationYear}
                onChange={handleProfileChange}
                className="input-modern"
                placeholder="e.g., 2025"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleProfileChange}
                className="input-modern resize-none"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Code className="w-4 h-4 inline mr-1" />
                Skills (comma-separated)
              </label>
              <input
                name="skills"
                value={profile.skills}
                onChange={handleProfileChange}
                className="input-modern"
                placeholder="e.g., React, Python, UI/UX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Heart className="w-4 h-4 inline mr-1" />
                Interests (comma-separated)
              </label>
              <input
                name="interests"
                value={profile.interests}
                onChange={handleProfileChange}
                className="input-modern"
                placeholder="e.g., AI, Startups, Web Dev"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <LinkIcon className="w-4 h-4 inline mr-1" />
                LinkedIn URL
              </label>
              <input
                name="linkedin"
                value={profile.linkedin}
                onChange={handleProfileChange}
                className="input-modern"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Github className="w-4 h-4 inline mr-1" />
                GitHub URL
              </label>
              <input
                name="github"
                value={profile.github}
                onChange={handleProfileChange}
                className="input-modern"
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Portfolio URL
              </label>
              <input
                name="portfolio"
                value={profile.portfolio}
                onChange={handleProfileChange}
                className="input-modern"
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Resume URL
              </label>
              <input
                name="resume"
                value={profile.resume}
                onChange={handleProfileChange}
                className="input-modern"
                placeholder="Link to your resume"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </motion.button>
        </motion.form>

        {/* Password Change - Only for credential users */}
        {!user.image && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleChangePassword}
            className="glass-card p-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Change Password
            </h3>

            <div className="space-y-4 max-w-md">
              <input
                type="password"
                placeholder="Current Password"
                value={passwords.oldPassword}
                onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                required
                className="input-modern"
              />

              <input
                type="password"
                placeholder="New Password"
                value={passwords.newPassword}
                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
                className="input-modern"
              />

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary inline-flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                Update Password
              </motion.button>
            </div>
          </motion.form>
        )}
      </div>

      {/* AI Generate Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 max-w-lg w-full"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Generate Profile from Resume
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Paste your resume text and our AI will extract your information automatically.
            </p>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              className="input-modern h-48 resize-none mb-4"
              placeholder="Paste your resume content here..."
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAIGenerate}
                disabled={aiLoading}
                className="btn-primary inline-flex items-center gap-2"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
