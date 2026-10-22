'use client'

import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'
import { evaluateApplicability } from '@/lib/decision-tree'
import * as db from '@/lib/db'
import { defaultMitigationsFor, scoreTool } from '@/lib/ai-risk-engine'
import {
  AiMitigation,
  AiMitigationStatus,
  AiRiskFinding,
  AiTool,
} from '@/lib/ai-inventory-types'
import {
  ApplicabilityResult,
  ControlState,
  ControlStatus,
  Profile,
} from '@/lib/types'
import { applyIntegrationFixture } from '@/lib/demo-control-mapping'
import { DemoTenant, IntegrationFixture } from '@/lib/demo-tenants'

interface AppState {
  hydrated: boolean
  profile: Profile | null
  applicability: ApplicabilityResult[]
  controlStates: Record<string, ControlState>
  aiTools: Record<string, AiTool>
  aiRiskFindings: Record<string, AiRiskFinding>
  aiMitigations: Record<string, AiMitigation>
  /** Set only when the current session came through the simulated
   * demo-workspace path (/login → /connect). Null for the real profile
   * wizard flow. See lib/demo-tenants.ts. */
  activeIntegration: { tenantId: string; fixture: IntegrationFixture } | null

  hydrate: () => Promise<void>
  submitProfile: (profile: Profile) => Promise<void>
  seedFromDemoTenant: (tenant: DemoTenant) => Promise<void>
  setControlStatus: (controlId: string, status: ControlStatus) => Promise<void>
  setControlNotes: (controlId: string, notes: string) => Promise<void>
  addEvidenceFileId: (controlId: string, fileId: string) => Promise<void>
  removeEvidenceFileId: (controlId: string, fileId: string) => Promise<void>
  addAiTool: (tool: Omit<AiTool, 'id' | 'addedAt' | 'lastReviewedAt'>) => Promise<void>
  updateAiTool: (toolId: string, updates: Partial<Omit<AiTool, 'id'>>) => Promise<void>
  removeAiTool: (toolId: string) => Promise<void>
  rescoreAiTool: (toolId: string) => Promise<void>
  setAiMitigationStatus: (mitigationId: string, status: AiMitigationStatus) => Promise<void>
  setAiMitigationNotes: (mitigationId: string, notes: string) => Promise<void>
  resetAll: () => Promise<void>
}

function emptyState(controlId: string): ControlState {
  return {
    controlId,
    status: 'not_started',
    notes: '',
    evidenceFileIds: [],
    updatedAt: new Date().toISOString(),
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  profile: null,
  applicability: [],
  controlStates: {},
  aiTools: {},
  aiRiskFindings: {},
  aiMitigations: {},
  activeIntegration: null,

  hydrate: async () => {
    if (get().hydrated) return
    try {
      const [profile, applicability, states, aiToolsList, aiFindingsList, aiMitigationsList, demoIntegration] = await Promise.all([
        db.getProfile(),
        db.getApplicability(),
        db.getAllControlStates(),
        db.getAllAiTools(),
        db.getAllAiRiskFindings(),
        db.getAllAiMitigations(),
        db.getDemoIntegration(),
      ])
      const controlStates: Record<string, ControlState> = {}
      for (const s of states) {
        controlStates[s.controlId] = s
      }
      const aiTools: Record<string, AiTool> = {}
      for (const t of aiToolsList) {
        aiTools[t.id] = t
      }
      const aiRiskFindings: Record<string, AiRiskFinding> = {}
      for (const f of aiFindingsList) {
        aiRiskFindings[f.id] = f
      }
      const aiMitigations: Record<string, AiMitigation> = {}
      for (const m of aiMitigationsList) {
        aiMitigations[m.id] = m
      }
      set({
        profile: profile ?? null,
        applicability: applicability ?? [],
        controlStates,
        aiTools,
        aiRiskFindings,
        aiMitigations,
        activeIntegration: demoIntegration
          ? { tenantId: demoIntegration.tenantId, fixture: demoIntegration.fixture }
          : null,
        hydrated: true,
      })
    } catch (err) {
      // IndexedDB can fail in restrictive browser contexts (private mode,
      // disabled storage). Fail soft so the app still renders.
      console.error('Failed to hydrate AIro store from IndexedDB', err)
      set({ hydrated: true })
    }
  },

  submitProfile: async (profile: Profile) => {
    const applicability = evaluateApplicability(profile)
    await db.saveProfile(profile)
    await db.saveApplicability(applicability)
    set({ profile, applicability })
  },

  seedFromDemoTenant: async (tenant) => {
    // Seeds the store + IndexedDB with a demo persona's Profile, the
    // decision-tree-evaluated applicability for it, and the control states
    // derived from its (fixture, not live) integration data. This is the
    // only place a DemoTenant touches persistence — the fake /connect
    // consent screen calls this on "Accept", nothing else does.
    const applicability = evaluateApplicability(tenant.profile)
    const integrationStates = applyIntegrationFixture(tenant.integration)

    await db.saveProfile(tenant.profile)
    await db.saveApplicability(applicability)
    await db.saveDemoIntegration({ tenantId: tenant.id, fixture: tenant.integration })
    for (const state of Object.values(integrationStates)) {
      if (state) await db.saveControlState(state)
    }

    set((state) => ({
      profile: tenant.profile,
      applicability,
      controlStates: { ...state.controlStates, ...integrationStates },
      activeIntegration: { tenantId: tenant.id, fixture: tenant.integration },
    }))
  },

  setControlStatus: async (controlId, status) => {
    const current = get().controlStates[controlId] ?? emptyState(controlId)
    const updated: ControlState = { ...current, status, updatedAt: new Date().toISOString() }
    await db.saveControlState(updated)
    set((state) => ({
      controlStates: { ...state.controlStates, [controlId]: updated },
    }))
  },

  setControlNotes: async (controlId, notes) => {
    const current = get().controlStates[controlId] ?? emptyState(controlId)
    const updated: ControlState = { ...current, notes, updatedAt: new Date().toISOString() }
    await db.saveControlState(updated)
    set((state) => ({
      controlStates: { ...state.controlStates, [controlId]: updated },
    }))
  },

  addEvidenceFileId: async (controlId, fileId) => {
    const current = get().controlStates[controlId] ?? emptyState(controlId)
    const updated: ControlState = {
      ...current,
      evidenceFileIds: [...current.evidenceFileIds, fileId],
      updatedAt: new Date().toISOString(),
    }
    await db.saveControlState(updated)
    set((state) => ({
      controlStates: { ...state.controlStates, [controlId]: updated },
    }))
  },

  removeEvidenceFileId: async (controlId, fileId) => {
    const current = get().controlStates[controlId] ?? emptyState(controlId)
    const updated: ControlState = {
      ...current,
      evidenceFileIds: current.evidenceFileIds.filter((id) => id !== fileId),
      updatedAt: new Date().toISOString(),
    }
    await db.saveControlState(updated)
    set((state) => ({
      controlStates: { ...state.controlStates, [controlId]: updated },
    }))
  },

  addAiTool: async (toolInput) => {
    const now = new Date().toISOString()
    const tool: AiTool = {
      ...toolInput,
      id: uuidv4(),
      addedAt: now,
      lastReviewedAt: now,
    }
    await db.saveAiTool(tool)

    const findings = scoreTool(tool)
    const mitigationsByFindingId: Record<string, AiMitigation[]> = {}
    for (const f of findings) {
      await db.saveAiRiskFinding(f)
      const mitigations = defaultMitigationsFor(f)
      mitigationsByFindingId[f.id] = mitigations
      for (const m of mitigations) {
        await db.saveAiMitigation(m)
      }
    }

    set((state) => {
      const aiRiskFindings = { ...state.aiRiskFindings }
      const aiMitigations = { ...state.aiMitigations }
      for (const f of findings) {
        aiRiskFindings[f.id] = f
        for (const m of mitigationsByFindingId[f.id]) {
          aiMitigations[m.id] = m
        }
      }
      return {
        aiTools: { ...state.aiTools, [tool.id]: tool },
        aiRiskFindings,
        aiMitigations,
      }
    })
  },

  updateAiTool: async (toolId, updates) => {
    const current = get().aiTools[toolId]
    if (!current) return
    const updated: AiTool = { ...current, ...updates }
    await db.saveAiTool(updated)
    set((state) => ({ aiTools: { ...state.aiTools, [toolId]: updated } }))
  },

  removeAiTool: async (toolId) => {
    const findingsForTool = Object.values(get().aiRiskFindings).filter((f) => f.toolId === toolId)
    for (const f of findingsForTool) {
      await db.deleteAiMitigationsForFinding(f.id)
    }
    await db.deleteAiRiskFindingsForTool(toolId)
    await db.deleteAiTool(toolId)
    set((state) => {
      const aiTools = { ...state.aiTools }
      delete aiTools[toolId]
      const aiRiskFindings = { ...state.aiRiskFindings }
      const aiMitigations = { ...state.aiMitigations }
      for (const f of findingsForTool) {
        delete aiRiskFindings[f.id]
        for (const m of Object.values(state.aiMitigations)) {
          if (m.findingId === f.id) delete aiMitigations[m.id]
        }
      }
      return { aiTools, aiRiskFindings, aiMitigations }
    })
  },

  rescoreAiTool: async (toolId) => {
    const current = get().aiTools[toolId]
    if (!current) return

    // Clear out the tool's previous findings/mitigations before re-running
    // the deterministic engine, so a re-check reflects only the tool's
    // current attributes rather than accumulating stale findings.
    const previousFindings = Object.values(get().aiRiskFindings).filter((f) => f.toolId === toolId)
    for (const f of previousFindings) {
      await db.deleteAiMitigationsForFinding(f.id)
    }
    await db.deleteAiRiskFindingsForTool(toolId)

    const reviewed: AiTool = { ...current, lastReviewedAt: new Date().toISOString() }
    await db.saveAiTool(reviewed)

    const findings = scoreTool(reviewed)
    const mitigationsByFindingId: Record<string, AiMitigation[]> = {}
    for (const f of findings) {
      await db.saveAiRiskFinding(f)
      const mitigations = defaultMitigationsFor(f)
      mitigationsByFindingId[f.id] = mitigations
      for (const m of mitigations) {
        await db.saveAiMitigation(m)
      }
    }

    set((state) => {
      const aiRiskFindings = { ...state.aiRiskFindings }
      const aiMitigations = { ...state.aiMitigations }
      for (const f of previousFindings) {
        delete aiRiskFindings[f.id]
        for (const m of Object.values(state.aiMitigations)) {
          if (m.findingId === f.id) delete aiMitigations[m.id]
        }
      }
      for (const f of findings) {
        aiRiskFindings[f.id] = f
        for (const m of mitigationsByFindingId[f.id]) {
          aiMitigations[m.id] = m
        }
      }
      return {
        aiTools: { ...state.aiTools, [toolId]: reviewed },
        aiRiskFindings,
        aiMitigations,
      }
    })
  },

  setAiMitigationStatus: async (mitigationId, status) => {
    const current = get().aiMitigations[mitigationId]
    if (!current) return
    const updated: AiMitigation = { ...current, status }
    await db.saveAiMitigation(updated)
    set((state) => ({ aiMitigations: { ...state.aiMitigations, [mitigationId]: updated } }))
  },

  setAiMitigationNotes: async (mitigationId, notes) => {
    const current = get().aiMitigations[mitigationId]
    if (!current) return
    const updated: AiMitigation = { ...current, notes }
    await db.saveAiMitigation(updated)
    set((state) => ({ aiMitigations: { ...state.aiMitigations, [mitigationId]: updated } }))
  },

  resetAll: async () => {
    await db.clearAll()
    set({
      profile: null,
      applicability: [],
      controlStates: {},
      aiTools: {},
      aiRiskFindings: {},
      aiMitigations: {},
      activeIntegration: null,
    })
  },
}))
