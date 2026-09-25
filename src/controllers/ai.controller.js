import { explainSchema } from '../validators/ai.validator.js';
import { explainWithGemini } from '../services/ai.service.js';

export async function explain(req, res) {
  const input = explainSchema.parse(req.body);
  const answer = await explainWithGemini(input);
  res.json({ success: true, answer });
}
