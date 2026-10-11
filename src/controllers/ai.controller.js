
import Groq from 'groq-sdk';
import { generateQuiz } from '../services/quizGenerator.service.js';

// Existing AI Tutor: Explain a study topic
export const explain = async (req, res) => {
  try {
    const { topic } = req.body;

    if (typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a topic to explain.',
      });
    }

    if (topic.length > 3000) {
      return res.status(400).json({
        success: false,
        message: 'Topic must be under 3000 characters.',
      });
    }

    const apiKey = process.env.GROQ_API_KEY?.trim();

    if (!apiKey) {
      console.error('GROQ_API_KEY is missing from backend environment');

      return res.status(500).json({
        success: false,
        message: 'AI service is not configured.',
      });
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content:
            'You are StudyTrack AI, a helpful study assistant. Explain concepts in simple language, use headings and examples, and highlight important points.',
        },
        {
          role: 'user',
          content: `Explain this study topic clearly for a student:\n\n${topic.trim()}`,
        },
      ],
      max_completion_tokens: 800,
    });

    const explanation =
      completion.choices[0]?.message?.content ?? '';

    return res.status(200).json({
      success: true,
      data: { explanation },
    });
  } catch (error) {
    console.error('StudyTrack AI explanation error:', {
      message: error instanceof Error ? error.message : String(error),
      status: error?.status,
    });

    return res.status(502).json({
      success: false,
      message: 'Unable to generate an explanation. Please try again.',
    });
  }
};

// Generate a quiz from a user-provided prompt
export const generateQuizController = async (req, res) => {
  try {
    const {
      prompt,
      questionCount = 5,
      difficulty = 'Intermediate',
      questionType = 'Multiple choice',
    } = req.body ?? {};

    // Validate prompt
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a quiz prompt.',
      });
    }

    if (prompt.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Prompt must not exceed 2000 characters.',
      });
    }

    // Validate question count
    if (
      !Number.isInteger(questionCount) ||
      questionCount < 1 ||
      questionCount > 20
    ) {
      return res.status(400).json({
        success: false,
        message: 'Question count must be between 1 and 20.',
      });
    }

    // Validate difficulty
    const allowedDifficulties = [
      'Beginner',
      'Intermediate',
      'Advanced',
    ];

    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty. Choose Beginner, Intermediate, or Advanced.',
      });
    }

    // Supported question types in this version
    const allowedQuestionTypes = ['Multiple choice'];

    if (!allowedQuestionTypes.includes(questionType)) {
      return res.status(400).json({
        success: false,
        message: 'Currently, only Multiple choice questions are supported.',
      });
    }

    // Generate quiz using the Groq-backed service
    const quiz = await generateQuiz({
      prompt: prompt.trim(),
      questionCount,
      difficulty,
      questionType,
    });

    return res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error('StudyTrack AI quiz generation error:', {
      message: error instanceof Error ? error.message : String(error),
      status: error?.status,
    });

    return res.status(502).json({
      success: false,
      message: 'Unable to generate the quiz. Please try again.',
    });
  }
};
