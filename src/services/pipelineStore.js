const state = {
  clients: [],
  observations: [],
  signalJobs: [],
  signals: []
}

const counters = {
  client: 1,
  observation: 1,
  job: 1,
  signal: 1
}

function nextId(kind) {
  const value = counters[kind]
  counters[kind] += 1
  return `${kind}-${value}`
}

export function listClients() {
  return state.clients
}

export function getClientById(clientId) {
  return state.clients.find((client) => client.id === clientId) ?? null
}

export function createClient({ name, location, primaryDomain, createdBy }) {
  const client = {
    id: nextId('client'),
    name,
    location,
    primaryDomain,
    createdBy,
    createdAt: new Date().toISOString()
  }

  state.clients.push(client)
  return client
}

export function createObservation({
  clientId,
  provider,
  channel,
  observedAt,
  payload,
  createdBy
}) {
  const observation = {
    id: nextId('observation'),
    clientId,
    provider,
    channel,
    observedAt,
    payload,
    createdBy,
    createdAt: new Date().toISOString()
  }

  state.observations.push(observation)
  return observation
}

export function enqueueSignalJob({ observationId, clientId }) {
  const job = {
    id: nextId('job'),
    observationId,
    clientId,
    status: 'queued',
    queuedAt: new Date().toISOString(),
    processedAt: null
  }

  state.signalJobs.push(job)
  return job
}

function deriveSignalType(rank) {
  if (rank <= 3) {
    return 'high_visibility'
  }

  if (rank <= 10) {
    return 'mid_visibility'
  }

  return 'low_visibility'
}

export function processQueuedSignalJobs({ processedBy }) {
  let processedJobs = 0
  let generatedSignals = 0

  for (const job of state.signalJobs) {
    if (job.status !== 'queued') {
      continue
    }

    const observation = state.observations.find(
      (item) => item.id === job.observationId,
    )

    if (!observation) {
      job.status = 'failed'
      job.processedAt = new Date().toISOString()
      continue
    }

    const signal = {
      id: nextId('signal'),
      clientId: observation.clientId,
      observationId: observation.id,
      keyword: observation.payload.keyword,
      location: observation.payload.location,
      rank: observation.payload.rank,
      competitorCount: observation.payload.competitors.length,
      signalType: deriveSignalType(observation.payload.rank),
      generatedBy: processedBy,
      generatedAt: new Date().toISOString()
    }

    state.signals.push(signal)
    generatedSignals += 1

    job.status = 'processed'
    job.processedAt = new Date().toISOString()
    processedJobs += 1
  }

  return { processedJobs, generatedSignals }
}

export function listSignalJobs() {
  return state.signalJobs
}

export function listSignals({ clientId }) {
  if (clientId) {
    return state.signals.filter((signal) => signal.clientId === clientId)
  }

  return state.signals
}

export function resetPipelineStore() {
  state.clients = []
  state.observations = []
  state.signalJobs = []
  state.signals = []

  counters.client = 1
  counters.observation = 1
  counters.job = 1
  counters.signal = 1
}
