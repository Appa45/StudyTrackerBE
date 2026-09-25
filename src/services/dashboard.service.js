import { Topic } from '../models/Topic.js';

export async function getDashboardOverview(userId) {
  const [statsRows, overallRows, todayTopics, recentTopics] = await Promise.all([
    Topic.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Topic.aggregate([
      { $match: { userId } },
      { $group: { _id: null, averageProgress: { $avg: '$progress' } } }
    ]),
    Topic.find({
      userId,
      targetDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)), $lt: new Date(new Date().setHours(24, 0, 0, 0)) }
    }).sort({ progress: 1 }).limit(5),
    Topic.find({ userId }).sort({ updatedAt: -1 }).limit(5)
  ]);

  const counts = { completed: 0, inProgress: 0, notStarted: 0 };
  for (const row of statsRows) {
    if (row._id === 'Completed') counts.completed = row.count;
    if (row._id === 'In Progress') counts.inProgress = row.count;
    if (row._id === 'Not Started') counts.notStarted = row.count;
  }

  const totalTopics = counts.completed + counts.inProgress + counts.notStarted;
  const overallProgress = Math.round(overallRows[0]?.averageProgress || 0);

  return {
    stats: {
      totalTopics,
      completed: counts.completed,
      inProgress: counts.inProgress,
      notStarted: counts.notStarted,
      overallProgress
    },
    todayTopics,
    recentTopics
  };
}
