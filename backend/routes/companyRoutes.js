import { Router } from 'express'
import controller from '../controllers/companyController.js'
import { protect } from '../middleware/authMiddleware.js'
import { optionalProtect } from '../middleware/optionalAuthMiddleware.js'
import requireAdmin from '../middleware/adminMiddleware.js'
import validate from '../middleware/validateMiddleware.js'
import listQuerySchema from '../validations/listQueryValidation.js'
import { createCompanySchema, idParamSchema, updateCompanySchema } from '../validations/resourceValidation.js'

const router = Router()
router.get('/', validate(listQuerySchema, 'query'), optionalProtect, controller.list)
router.get('/:slugOrId', optionalProtect, controller.get)
router.post('/', protect, requireAdmin, validate(createCompanySchema), controller.create)
router.put('/:id', protect, requireAdmin, validate(idParamSchema, 'params'), validate(updateCompanySchema), controller.update)
router.delete('/:id', protect, requireAdmin, validate(idParamSchema, 'params'), controller.remove)

export default router
