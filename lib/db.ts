// Hand-rolled IndexedDB wrapper — no external package. Everything here is
// client-only; every exported function must only ever be called from code
// that runs in the browser ('use client' components / hooks), never during
// a server render or static export build step.

import { v4 as uuidv4 } from 'uuid'
import { ApplicabilityResult, ControlState, EvidenceFile, Profile } from './types'
import { AiMitigation, AiRiskFinding, AiTool } from './ai-inventory-types'
import { IntegrationFixture } from './demo-tenants'

const DB_NAME = 'airo-compliance'
const DB_VERSION = 3

const STORE_PROFILE = 'profile'
const STORE_APPLICABILITY = 'applicability'
const STORE_CONTROL_STATES = 'controlStates'
const STORE_EVIDENCE_FILES = 'evidenceFiles'
const STORE_AI_TOOLS = 'aiTools'
const STORE_AI_RISK_FINDINGS = 'aiRiskFindings'
const STORE_AI_MITIGATIONS = 'aiMitigations'
const STORE_DEMO_INTEGRATION = 'demoIntegration'

const PROFILE_KEY = 'current'
const APPLICABILITY_KEY = 'current'
const DEMO_INTEGRATION_KEY = 'current'

/** The demo workspace's active integration, if any. Stored separately from
 * Profile so the real (non-demo) profile wizard path never touches it. */
export interface DemoIntegrationRecord {
  tenantId: string
  fixture: IntegrationFixture
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
}

let dbPromise: Promise<IDBDatabase> | null = null

export function initDB(): Promise<IDBDatabase> {
  if (!isBrowser()) {
    return Promise.reject(new Error('IndexedDB is not available outside the browser.'))
  }
  if (dbPromise) return dbPromise

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE)
      }
      if (!db.objectStoreNames.contains(STORE_APPLICABILITY)) {
        db.createObjectStore(STORE_APPLICABILITY)
      }
      if (!db.objectStoreNames.contains(STORE_CONTROL_STATES)) {
        db.createObjectStore(STORE_CONTROL_STATES, { keyPath: 'controlId' })
      }
      if (!db.objectStoreNames.contains(STORE_EVIDENCE_FILES)) {
        const store = db.createObjectStore(STORE_EVIDENCE_FILES, { keyPath: 'id' })
        store.createIndex('byControlId', 'controlId', { unique: false })
      }
      // v2 — AI Discovery & Monitoring stores. Guarded the same way as the
      // v1 stores above so this upgrade handler stays safe to re-run.
      if (!db.objectStoreNames.contains(STORE_AI_TOOLS)) {
        db.createObjectStore(STORE_AI_TOOLS, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_AI_RISK_FINDINGS)) {
        const store = db.createObjectStore(STORE_AI_RISK_FINDINGS, { keyPath: 'id' })
        store.createIndex('byToolId', 'toolId', { unique: false })
      }
      if (!db.objectStoreNames.contains(STORE_AI_MITIGATIONS)) {
        const store = db.createObjectStore(STORE_AI_MITIGATIONS, { keyPath: 'id' })
        store.createIndex('byFindingId', 'findingId', { unique: false })
      }
      // v3 — the demo workspace's active integration record (see
      // lib/demo-tenants.ts). Guarded the same way as earlier stores.
      if (!db.objectStoreNames.contains(STORE_DEMO_INTEGRATION)) {
        db.createObjectStore(STORE_DEMO_INTEGRATION)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return dbPromise
}

function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return initDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode)
        const store = tx.objectStore(storeName)
        const request = fn(store)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }),
  )
}

// ---- Profile ----------------------------------------------------------

export async function saveProfile(profile: Profile): Promise<void> {
  await withStore(STORE_PROFILE, 'readwrite', (store) => store.put(profile, PROFILE_KEY))
}

export async function getProfile(): Promise<Profile | undefined> {
  return withStore<Profile | undefined>(STORE_PROFILE, 'readonly', (store) =>
    store.get(PROFILE_KEY),
  )
}

// ---- Applicability ------------------------------------------------------

export async function saveApplicability(results: ApplicabilityResult[]): Promise<void> {
  await withStore(STORE_APPLICABILITY, 'readwrite', (store) =>
    store.put(results, APPLICABILITY_KEY),
  )
}

export async function getApplicability(): Promise<ApplicabilityResult[] | undefined> {
  return withStore<ApplicabilityResult[] | undefined>(STORE_APPLICABILITY, 'readonly', (store) =>
    store.get(APPLICABILITY_KEY),
  )
}

// ---- Control states -------------------------------------------------------

export async function saveControlState(state: ControlState): Promise<void> {
  await withStore(STORE_CONTROL_STATES, 'readwrite', (store) => store.put(state))
}

export async function getControlState(controlId: string): Promise<ControlState | undefined> {
  return withStore<ControlState | undefined>(STORE_CONTROL_STATES, 'readonly', (store) =>
    store.get(controlId),
  )
}

export async function getAllControlStates(): Promise<ControlState[]> {
  return withStore<ControlState[]>(STORE_CONTROL_STATES, 'readonly', (store) => store.getAll())
}

// ---- Evidence files ------------------------------------------------------

export async function saveEvidenceFile(file: {
  controlId: string
  filename: string
  mimeType: string
  blob: Blob
}): Promise<EvidenceFile> {
  const record: EvidenceFile = {
    id: uuidv4(),
    controlId: file.controlId,
    filename: file.filename,
    mimeType: file.mimeType,
    sizeBytes: file.blob.size,
    addedAt: new Date().toISOString(),
    blob: file.blob,
  }
  await withStore(STORE_EVIDENCE_FILES, 'readwrite', (store) => store.put(record))
  return record
}

export async function getEvidenceFilesForControl(controlId: string): Promise<EvidenceFile[]> {
  const db = await initDB()
  return new Promise<EvidenceFile[]>((resolve, reject) => {
    const tx = db.transaction(STORE_EVIDENCE_FILES, 'readonly')
    const store = tx.objectStore(STORE_EVIDENCE_FILES)
    const index = store.index('byControlId')
    const request = index.getAll(controlId)
    request.onsuccess = () => resolve(request.result as EvidenceFile[])
    request.onerror = () => reject(request.error)
  })
}

export async function deleteEvidenceFile(id: string): Promise<void> {
  await withStore(STORE_EVIDENCE_FILES, 'readwrite', (store) => store.delete(id))
}

// ---- AI tools ------------------------------------------------------------

export async function saveAiTool(tool: AiTool): Promise<void> {
  await withStore(STORE_AI_TOOLS, 'readwrite', (store) => store.put(tool))
}

export async function getAllAiTools(): Promise<AiTool[]> {
  return withStore<AiTool[]>(STORE_AI_TOOLS, 'readonly', (store) => store.getAll())
}

export async function deleteAiTool(id: string): Promise<void> {
  await withStore(STORE_AI_TOOLS, 'readwrite', (store) => store.delete(id))
}

// ---- AI risk findings ------------------------------------------------------

export async function saveAiRiskFinding(findingRecord: AiRiskFinding): Promise<void> {
  await withStore(STORE_AI_RISK_FINDINGS, 'readwrite', (store) => store.put(findingRecord))
}

export async function getAllAiRiskFindings(): Promise<AiRiskFinding[]> {
  return withStore<AiRiskFinding[]>(STORE_AI_RISK_FINDINGS, 'readonly', (store) => store.getAll())
}

export async function getAiRiskFindingsForTool(toolId: string): Promise<AiRiskFinding[]> {
  const db = await initDB()
  return new Promise<AiRiskFinding[]>((resolve, reject) => {
    const tx = db.transaction(STORE_AI_RISK_FINDINGS, 'readonly')
    const store = tx.objectStore(STORE_AI_RISK_FINDINGS)
    const index = store.index('byToolId')
    const request = index.getAll(toolId)
    request.onsuccess = () => resolve(request.result as AiRiskFinding[])
    request.onerror = () => reject(request.error)
  })
}

export async function deleteAiRiskFindingsForTool(toolId: string): Promise<void> {
  const findings = await getAiRiskFindingsForTool(toolId)
  const db = await initDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_AI_RISK_FINDINGS, 'readwrite')
    const store = tx.objectStore(STORE_AI_RISK_FINDINGS)
    findings.forEach((f) => store.delete(f.id))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ---- AI mitigations ---------------------------------------------------------

export async function saveAiMitigation(mitigation: AiMitigation): Promise<void> {
  await withStore(STORE_AI_MITIGATIONS, 'readwrite', (store) => store.put(mitigation))
}

export async function getAllAiMitigations(): Promise<AiMitigation[]> {
  return withStore<AiMitigation[]>(STORE_AI_MITIGATIONS, 'readonly', (store) => store.getAll())
}

export async function getAiMitigationsForFinding(findingId: string): Promise<AiMitigation[]> {
  const db = await initDB()
  return new Promise<AiMitigation[]>((resolve, reject) => {
    const tx = db.transaction(STORE_AI_MITIGATIONS, 'readonly')
    const store = tx.objectStore(STORE_AI_MITIGATIONS)
    const index = store.index('byFindingId')
    const request = index.getAll(findingId)
    request.onsuccess = () => resolve(request.result as AiMitigation[])
    request.onerror = () => reject(request.error)
  })
}

export async function deleteAiMitigationsForFinding(findingId: string): Promise<void> {
  const mitigations = await getAiMitigationsForFinding(findingId)
  const db = await initDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_AI_MITIGATIONS, 'readwrite')
    const store = tx.objectStore(STORE_AI_MITIGATIONS)
    mitigations.forEach((m) => store.delete(m.id))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ---- Demo integration (simulated, see lib/demo-tenants.ts) ---------------

export async function saveDemoIntegration(record: DemoIntegrationRecord): Promise<void> {
  await withStore(STORE_DEMO_INTEGRATION, 'readwrite', (store) =>
    store.put(record, DEMO_INTEGRATION_KEY),
  )
}

export async function getDemoIntegration(): Promise<DemoIntegrationRecord | undefined> {
  return withStore<DemoIntegrationRecord | undefined>(STORE_DEMO_INTEGRATION, 'readonly', (store) =>
    store.get(DEMO_INTEGRATION_KEY),
  )
}

export async function clearDemoIntegration(): Promise<void> {
  await withStore(STORE_DEMO_INTEGRATION, 'readwrite', (store) => store.delete(DEMO_INTEGRATION_KEY))
}

// ---- Bulk reset ------------------------------------------------------------

export async function clearAll(): Promise<void> {
  const db = await initDB()
  const storeNames = [
    STORE_PROFILE,
    STORE_APPLICABILITY,
    STORE_CONTROL_STATES,
    STORE_EVIDENCE_FILES,
    STORE_AI_TOOLS,
    STORE_AI_RISK_FINDINGS,
    STORE_AI_MITIGATIONS,
    STORE_DEMO_INTEGRATION,
  ]
  await Promise.all(
    storeNames.map(
      (name) =>
        new Promise<void>((resolve, reject) => {
          const tx = db.transaction(name, 'readwrite')
          const req = tx.objectStore(name).clear()
          req.onsuccess = () => resolve()
          req.onerror = () => reject(req.error)
        }),
    ),
  )
}
