import { Request, Response, NextFunction } from 'express';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof NotFoundError) {
    res.status(404).json({
      status: 'error',
      message: error.message 
    });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({
      status: 'error',
      message: error.message 
    });
    return;
  }

  if (error instanceof AuthorizationError) {
    res.status(403).json({
      status: 'error',
      message: error.message 
    });
    return;
  }

  console.error(error);
   res.status(500).json({
    status: 'error',
    message: 'Internal server error' 
  });
};
