import { Router } from 'express'
import controller from '../controllers/glossaryController.js'
import { protect } from '../middleware/authMiddleware.js'
import requireAdmin from '../middleware/adminMiddleware.js'
import validate from '../middleware/validateMiddleware.js'
import listQuerySchema from '../validations/listQueryValidation.js'
import { createGlossarySchema, idParamSchema, updateGlossarySchema } from '../validations/resourceValidation.js'

const router = Router()
router.get('/', validate(listQuerySchema, 'query'), controller.list)
router.get('/:slugOrId', controller.get)
router.post('/', protect, requireAdmin, validate(createGlossarySchema), controller.create)
router.put('/:id', protect, requireAdmin, validate(idParamSchema, 'params'), validate(updateGlossarySchema), controller.update)
router.delete('/:id', protect, requireAdmin, validate(idParamSchema, 'params'), controller.remove)

export default router
