import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.number({ required_error: 'Booking ID is required' }).int(),
    rating: z.number({ required_error: 'Rating is required' }).int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string({ required_error: 'Comment is required' }).min(5, 'Comment must be at least 5 characters long'),
  }),
});
