import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { create, getOne, list, remove, update } from '../controllers/topic.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(list));
router.post('/', asyncHandler(create));
router.get('/:id', asyncHandler(getOne));
router.patch('/:id', asyncHandler(update));
router.put('/:id', asyncHandler(update));
router.delete('/:id', asyncHandler(remove));

export default router;
