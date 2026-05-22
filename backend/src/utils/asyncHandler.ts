import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express route handler so that any rejected Promises
 * are automatically passed to the next() function, routing them into 
 * the global error handling middleware.
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
