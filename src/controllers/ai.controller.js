import Groq from 'groq-sdk';

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

    // Check whether the Groq API key is loaded
    const apiKey = process.env.GROQ_API_KEY?.trim();

    console.log('Groq API key loaded:', Boolean(apiKey));
    console.log('Groq API key length:', apiKey?.length ?? 0);

    if (!apiKey) {
      console.error(
        'GROQ_API_KEY is missing from backend environment'
      );

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
          content: `Explain this study topic clearly for a student:\n\n${topic}`,
        },
      ],
      max_completion_tokens: 800,
    });

    const explanation =
      completion.choices[0]?.message?.content ?? '';

    return res.status(200).json({
      success: true,
      data: {
        explanation,
      },
    });
  } catch (error) {
    console.error('StudyTrack AI error:', {
      message: error instanceof Error ? error.message : String(error),
      status: error?.status,
    });

    return res.status(502).json({
      success: false,
      message: 'Unable to generate an explanation. Please try again.',
    });
  }
};