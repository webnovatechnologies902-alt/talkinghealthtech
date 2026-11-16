import { Router } from 'express'
import controller from '../controllers/articleController.js'
import { protect } from '../middleware/authMiddleware.js'
import { optionalProtect } from '../middleware/optionalAuthMiddleware.js'
import requireAdmin from '../middleware/adminMiddleware.js'
import validate from '../middleware/validateMiddleware.js'
import { createArticleSchema, updateArticleSchema } from '../validations/articleValidation.js'
import { idParamSchema } from '../validations/resourceValidation.js'
import listQuerySchema from '../validations/listQueryValidation.js'

const router = Router()
router.get('/', validate(listQuerySchema, 'query'), optionalProtect, controller.list)
router.get('/:slugOrId', optionalProtect, controller.get)
router.post('/', protect, requireAdmin, validate(createArticleSchema), controller.create)
router.put('/:id', protect, requireAdmin, validate(idParamSchema, 'params'), validate(updateArticleSchema), controller.update)
router.delete('/:id', protect, requireAdmin, validate(idParamSchema, 'params'), controller.remove)

export default router
