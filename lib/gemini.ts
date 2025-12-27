import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function getGeminiModel() {
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite", });
}

// Generate job recommendations based on user profile
export async function generateJobRecommendations(
    userProfile: {
        skills: string[];
        interests: string[];
        bio?: string;
        major?: string;
    },
    availableJobs: {
        _id: string;
        title: string;
        description: string;
        type: string;
        tags: string[];
        requirements: string[];
    }[]
) {
    if (!process.env.GEMINI_API_KEY) {
        // Fallback to simple matching if no API key
        return availableJobs.slice(0, 5).map(job => ({
            jobId: job._id,
            score: 70,
            reason: 'Based on your profile',
        }));
    }

    const model = await getGeminiModel();

    const prompt = `You are a job matching AI. Given a user's profile and available job listings, rank the top 5 most suitable jobs.

User Profile:
- Skills: ${userProfile.skills.join(', ') || 'Not specified'}
- Interests: ${userProfile.interests.join(', ') || 'Not specified'}
- Bio: ${userProfile.bio || 'Not provided'}
- Major: ${userProfile.major || 'Not specified'}

Available Jobs:
${availableJobs
            .map(
                (job, i) => `
${i + 1}. ID: ${job._id}
   Title: ${job.title}
   Type: ${job.type}
   Tags: ${job.tags.join(', ')}
   Requirements: ${job.requirements.join(', ')}
   Description: ${job.description.substring(0, 200)}...
`
            )
            .join('\n')}

Return a JSON array with the top 5 recommended jobs in this exact format (no markdown, just JSON):
[{"jobId": "id", "score": 85, "reason": "Brief reason for match"}]

Score should be 0-100. Be specific in reasons.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (error) {
        console.error('Gemini recommendation error:', error);
        return [];
    }
}

// Generate profile from resume text
export async function generateProfileFromResume(resumeText: string) {
    if (!process.env.GEMINI_API_KEY) {
        return null;
    }

    const model = await getGeminiModel();

    const prompt = `Extract profile information from this resume text and return JSON:

Resume:
${resumeText}

Return JSON in this exact format (no markdown):
{
  "name": "Full Name",
  "bio": "A brief professional summary (max 200 chars)",
  "skills": ["skill1", "skill2", "skill3"],
  "interests": ["interest1", "interest2"],
  "university": "University name if mentioned",
  "major": "Major/field if mentioned",
  "linkedin": "LinkedIn URL if found",
  "github": "GitHub URL if found",
  "portfolio": "Portfolio URL if found"
}

Only include fields that can be extracted. Skills and interests should be arrays of strings.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (error) {
        console.error('Gemini profile generation error:', error);
        return null;
    }
}

// Enhance job description
export async function enhanceJobDescription(
    title: string,
    basicDescription: string,
    type: string
) {
    if (!process.env.GEMINI_API_KEY) {
        return basicDescription;
    }

    const model = await getGeminiModel();

    const prompt = `Enhance this job posting description to be more engaging and professional while keeping the core message. Keep it concise (under 500 words).

Job Title: ${title}
Type: ${type}
Original Description: ${basicDescription}

Return only the enhanced description text, no additional formatting or explanations.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Gemini enhance description error:', error);
        return basicDescription;
    }
}

// Generate cover letter suggestion
export async function generateCoverLetterSuggestion(
    userProfile: {
        name: string;
        skills: string[];
        bio?: string;
    },
    job: {
        title: string;
        description: string;
        requirements: string[];
    }
) {
    if (!process.env.GEMINI_API_KEY) {
        return null;
    }

    const model = await getGeminiModel();

    const prompt = `Write a brief, personalized cover letter (max 200 words) for this job application.

Applicant:
- Name: ${userProfile.name}
- Skills: ${userProfile.skills.join(', ')}
- Bio: ${userProfile.bio || 'Not provided'}

Job:
- Title: ${job.title}
- Description: ${job.description.substring(0, 300)}
- Requirements: ${job.requirements.join(', ')}

Write a casual but professional cover letter suitable for a university student. Return only the letter text.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Gemini cover letter error:', error);
        return null;
    }
}

// Generate match explanation
export async function generateMatchExplanation(
    userProfile: {
        skills: string[];
        interests: string[];
        major?: string;
    },
    job: {
        title: string;
        tags: string[];
        requirements: string[];
    },
    matchScore: number
) {
    if (!process.env.GEMINI_API_KEY) {
        return `You match ${matchScore}% of this opportunity based on your skills and interests.`;
    }

    const model = await getGeminiModel();

    const prompt = `Explain briefly (1-2 sentences) why this candidate matches ${matchScore}% with this job.

Candidate: Skills: ${userProfile.skills.join(', ')}, Interests: ${userProfile.interests.join(', ')}, Major: ${userProfile.major || 'N/A'}
Job: ${job.title}, Tags: ${job.tags.join(', ')}, Requirements: ${job.requirements.join(', ')}

Be specific about matching skills/interests. Return only the explanation.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Gemini match explanation error:', error);
        return `You match ${matchScore}% of this opportunity based on your skills and interests.`;
    }
}
