import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import {
  createResource,
  deleteResource,
  getResource,
  listResources,
  updateResource,
} from '../services/contentService.js'

export function createResourceController(config) {
  return {
    list: asyncHandler(async (req, res) => {
      const result = config.listService
        ? await config.listService(req.validatedQuery, req.user?.role === 'admin')
        : await listResources(config, req.validatedQuery, req.user?.role === 'admin')
      return res.status(200).json(new ApiResponse(200, `${config.plural} fetched successfully`, result.documents, result.pagination))
    }),

    get: asyncHandler(async (req, res) => {
      const item = await getResource(config, req.params.slugOrId, req.user?.role === 'admin')
      return res.status(200).json(new ApiResponse(200, `${config.singular} fetched successfully`, item))
    }),

    create: asyncHandler(async (req, res) => {
      const item = await createResource(config, req.body, req.user)
      return res.status(201).json(new ApiResponse(201, `${config.singular} created successfully`, item))
    }),

    update: asyncHandler(async (req, res) => {
      const item = await updateResource(config, req.params.id, req.body)
      return res.status(200).json(new ApiResponse(200, `${config.singular} updated successfully`, item))
    }),

    remove: asyncHandler(async (req, res) => {
      await deleteResource(config, req.params.id)
      return res.status(200).json(new ApiResponse(200, `${config.singular} deleted successfully`))
    }),
  }
}
