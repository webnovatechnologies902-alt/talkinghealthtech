import { Router } from 'express'
import * as controller from '../controllers/categoryController.js'
import { protect } from '../middleware/authMiddleware.js'
import { optionalProtect } from '../middleware/optionalAuthMiddleware.js'
import requireAdmin from '../middleware/adminMiddleware.js'
import validate from '../middleware/validateMiddleware.js'
import listQuerySchema from '../validations/listQueryValidation.js'
import { createCategorySchema, idParamSchema, updateCategorySchema } from '../validations/resourceValidation.js'

const router = Router()
router.get('/', validate(listQuerySchema, 'query'), optionalProtect, controller.list)
router.get('/:slugOrId', optionalProtect, controller.get)
router.post('/', protect, requireAdmin, validate(createCategorySchema), controller.create)
router.put('/:id', protect, requireAdmin, validate(idParamSchema, 'params'), validate(updateCategorySchema), controller.update)
router.delete('/:id', protect, requireAdmin, validate(idParamSchema, 'params'), controller.remove)

export default router
