// Express 5 handles rejected promises, but keeping this helper makes controller intent explicit
// and keeps the project easy to migrate to older Express versions if needed.
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
