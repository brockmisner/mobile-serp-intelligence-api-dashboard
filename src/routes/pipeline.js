import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  createObservation,
  enqueueSignalJob,
  getClientById,
  listSignalJobs,
  listSignals,
  processQueuedSignalJobs
} from '../services/pipelineStore.js'

const router = Router()

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function validateObservationPayload(body) {
  const errors = []

  if (!body || typeof body !== 'object') {
    errors.push({ field: 'body', message: 'Request body must be an object' })
    return errors
  }

  if (!isNonEmptyString(body.clientId)) {
    errors.push({ field: 'clientId', message: 'clientId is required' })
  }

  if (!isNonEmptyString(body.provider)) {
    errors.push({ field: 'provider', message: 'provider is required' })
  }

  if (!isNonEmptyString(body.channel)) {
    errors.push({ field: 'channel', message: 'channel is required' })
  }

  if (!isNonEmptyString(body.observedAt) || Number.isNaN(Date.parse(body.observedAt))) {
    errors.push({
      field: 'observedAt',
      message: 'observedAt must be a valid ISO timestamp'
    })
  }

  if (!body.payload || typeof body.payload !== 'object') {
    errors.push({ field: 'payload', message: 'payload is required' })
    return errors
  }

  if (!isNonEmptyString(body.payload.keyword)) {
    errors.push({ field: 'payload.keyword', message: 'keyword is required' })
  }

  if (!isNonEmptyString(body.payload.location)) {
    errors.push({ field: 'payload.location', message: 'location is required' })
  }

  if (!Number.isInteger(body.payload.rank) || body.payload.rank <= 0) {
    errors.push({
      field: 'payload.rank',
      message: 'rank must be a positive integer'
    })
  }

  if (!Array.isArray(body.payload.competitors)) {
    errors.push({
      field: 'payload.competitors',
      message: 'competitors must be an array of domains'
    })
  } else if (body.payload.competitors.some((item) => !isNonEmptyString(item))) {
    errors.push({
      field: 'payload.competitors',
      message: 'competitors entries must be non-empty strings'
    })
  }

  return errors
}

router.post('/observations/ingest', requireAuth, (req, res) => {
  const errors = validateObservationPayload(req.body)

  if (errors.length > 0) {
    return res.status(422).json({
      error: 'validation_error',
      message: 'Observation payload is invalid',
      details: errors
    })
  }

  const client = getClientById(req.body.clientId)

  if (!client) {
    return res.status(404).json({
      error: 'not_found',
      message: `No client found with id ${req.body.clientId}`
    })
  }

  const observation = createObservation({
    clientId: req.body.clientId,
    provider: req.body.provider.trim().toLowerCase(),
    channel: req.body.channel.trim().toLowerCase(),
    observedAt: req.body.observedAt,
    payload: {
      keyword: req.body.payload.keyword.trim(),
      location: req.body.payload.location.trim(),
      rank: req.body.payload.rank,
      competitors: req.body.payload.competitors.map((entry) => entry.trim())
    },
    createdBy: req.user.username
  })

  const job = enqueueSignalJob({
    observationId: observation.id,
    clientId: observation.clientId
  })

  return res.status(202).json({
    observationId: observation.id,
    jobId: job.id,
    status: job.status
  })
})

router.post('/signals/jobs/process', requireAuth, (req, res) => {
  const result = processQueuedSignalJobs({ processedBy: req.user.username })

  return res.status(200).json({
    processedJobs: result.processedJobs,
    generatedSignals: result.generatedSignals
  })
})

router.get('/signals/jobs', requireAuth, (_req, res) => {
  return res.status(200).json({ data: listSignalJobs() })
})

router.get('/signals', requireAuth, (req, res) => {
  const clientId = typeof req.query.clientId === 'string' ? req.query.clientId : null
  const data = listSignals({ clientId })

  return res.status(200).json({ data })
})

export { router as pipelineRouter }
