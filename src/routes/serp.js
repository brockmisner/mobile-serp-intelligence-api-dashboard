import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  return res.status(200).json({
    data: [
      {
        keyword: 'best pizza brooklyn',
        rank: 3,
        source: 'google_mobile'
      }
    ],
    requestedBy: req.user.username
  });
});

export { router as serpRouter };
