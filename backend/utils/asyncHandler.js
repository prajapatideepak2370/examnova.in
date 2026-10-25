/**
 * Wraps an async express handler so rejected promises reach the error middleware.
 */
export default function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
