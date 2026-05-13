import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { resetPipelineStore } from '../src/services/pipelineStore.js'

describe('core MVP feature flow', () => {
  const app = createApp()

  beforeEach(() => {
    resetPipelineStore()
  })

  async function loginAndGetToken() {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'password123' })

    expect(response.status).toBe(200)
    return response.body.accessToken
  }

  it('supports the end-to-end intelligence pipeline', async () => {
    const token = await loginAndGetToken()

    const createClientResponse = await request(app)
      .post('/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Acme Dental',
        location: 'Austin, TX',
        primaryDomain: 'acmedental.example'
      })

    expect(createClientResponse.status).toBe(201)
    expect(createClientResponse.body.id).toBeTypeOf('string')

    const clientId = createClientResponse.body.id

    const ingestResponse = await request(app)
      .post('/pipeline/observations/ingest')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId,
        provider: 'dataforseo',
        channel: 'mobile_serp',
        observedAt: '2026-05-13T12:00:00Z',
        payload: {
          keyword: 'dentist austin',
          location: 'Austin, TX',
          rank: 4,
          competitors: ['competitor-a.example', 'competitor-b.example']
        }
      })

    expect(ingestResponse.status).toBe(202)
    expect(ingestResponse.body.status).toBe('queued')

    const processResponse = await request(app)
      .post('/pipeline/signals/jobs/process')
      .set('Authorization', `Bearer ${token}`)

    expect(processResponse.status).toBe(200)
    expect(processResponse.body.processedJobs).toBe(1)
    expect(processResponse.body.generatedSignals).toBe(1)

    const signalsResponse = await request(app)
      .get('/pipeline/signals')
      .query({ clientId })
      .set('Authorization', `Bearer ${token}`)

    expect(signalsResponse.status).toBe(200)
    expect(signalsResponse.body.data).toHaveLength(1)
    expect(signalsResponse.body.data[0].clientId).toBe(clientId)
    expect(signalsResponse.body.data[0].keyword).toBe('dentist austin')
    expect(signalsResponse.body.data[0].signalType).toBe('mid_visibility')

    const jobsResponse = await request(app)
      .get('/pipeline/signals/jobs')
      .set('Authorization', `Bearer ${token}`)

    expect(jobsResponse.status).toBe(200)
    expect(jobsResponse.body.data).toHaveLength(1)
    expect(jobsResponse.body.data[0].status).toBe('processed')
  })

  it('returns validation errors for malformed ingestion payloads', async () => {
    const token = await loginAndGetToken()

    const response = await request(app)
      .post('/pipeline/observations/ingest')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId: '',
        provider: 'dataforseo',
        channel: 'mobile_serp',
        observedAt: 'not-a-date',
        payload: {
          keyword: '',
          location: '',
          rank: 0,
          competitors: ['']
        }
      })

    expect(response.status).toBe(422)
    expect(response.body.error).toBe('validation_error')
    expect(response.body.details.length).toBeGreaterThan(0)
  })

  it('returns 404 when ingesting for an unknown client', async () => {
    const token = await loginAndGetToken()

    const response = await request(app)
      .post('/pipeline/observations/ingest')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId: 'missing-client',
        provider: 'dataforseo',
        channel: 'mobile_serp',
        observedAt: '2026-05-13T12:00:00Z',
        payload: {
          keyword: 'dentist austin',
          location: 'Austin, TX',
          rank: 5,
          competitors: []
        }
      })

    expect(response.status).toBe(404)
    expect(response.body.error).toBe('not_found')
  })
})
