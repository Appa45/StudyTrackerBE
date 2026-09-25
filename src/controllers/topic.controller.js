import {
  createTopicSchema,
  topicQuerySchema,
  updateTopicSchema
} from '../validators/topic.validator.js';
import {
  createTopic,
  deleteTopic,
  getTopic,
  listTopics,
  updateTopic
} from '../services/topic.service.js';

export async function create(req, res) {
  const input = createTopicSchema.parse(req.body);
  const topic = await createTopic(req.userId, input);
  res.status(201).json({ success: true, message: 'Topic created successfully.', topic });
}

export async function list(req, res) {
  const query = topicQuerySchema.parse(req.query);
  const result = await listTopics(req.userId, query);
  res.json({ success: true, ...result });
}

export async function getOne(req, res) {
  const topic = await getTopic(req.userId, req.params.id);
  res.json({ success: true, topic });
}

export async function update(req, res) {
  const input = updateTopicSchema.parse(req.body);
  if (Object.keys(input).length === 0) {
    return res.status(400).json({ success: false, error: 'At least one field is required.' });
  }

  const topic = await updateTopic(req.userId, req.params.id, input);
  res.json({ success: true, message: 'Topic updated successfully.', topic });
}

export async function remove(req, res) {
  await deleteTopic(req.userId, req.params.id);
  res.json({ success: true, message: 'Topic deleted successfully.' });
}
