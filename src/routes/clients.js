import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { createClient, listClients } from '../services/pipelineStore.js'

const router = Router()

function validateCreateClientBody(body) {
  const errors = []

  if (!body || typeof body !== 'object') {
    errors.push({ field: 'body', message: 'Request body must be an object' })
    return errors
  }

  for (const field of ['name', 'location', 'primaryDomain']) {
    if (typeof body[field] !== 'string' || body[field].trim().length === 0) {
      errors.push({
        field,
        message: `${field} is required and must be a non-empty string`
      })
    }
  }

  return errors
}

router.get('/', requireAuth, (_req, res) => {
  return res.status(200).json({ data: listClients() })
})

router.post('/', requireAuth, (req, res) => {
  const errors = validateCreateClientBody(req.body)

  if (errors.length > 0) {
    return res.status(422).json({
      error: 'validation_error',
      message: 'Client payload is invalid',
      details: errors
    })
  }

  const client = createClient({
    name: req.body.name.trim(),
    location: req.body.location.trim(),
    primaryDomain: req.body.primaryDomain.trim(),
    createdBy: req.user.username
  })

  return res.status(201).json(client)
})

export { router as clientsRouter }
