-- ==============================================================================
-- GAG CORE OS — FASE 3: PERSISTÊNCIA, STORAGE, AUDIT & RECOVERY (SCHEMA SQL)
-- PostgreSQL / Supabase Schema for Agents, Tasks, Executions, Skills, Tools,
-- Capabilities, Retries, Handoffs, QA, Artifacts, Knowledge & SHA-256 Audit Chain
-- ==============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. AGENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialty TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('CORE', 'TECHNICAL', 'CREATIVE', 'BUSINESS', 'OPERATIONAL')),
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BUSY', 'OFFLINE', 'MAINTENANCE')),
  is_available BOOLEAN NOT NULL DEFAULT true,
  max_concurrent_tasks INT NOT NULL DEFAULT 3,
  current_tasks_count INT NOT NULL DEFAULT 0,
  avatar_url TEXT,
  system_prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- ------------------------------------------------------------------------------
-- 2. SKILLS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  risk_level TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  required_capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  input_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_enabled ON skills(enabled);

-- ------------------------------------------------------------------------------
-- 3. TOOLS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INTERNAL' CHECK (type IN ('INTERNAL', 'API', 'EXTERNAL', 'AUTOMATION', 'STORAGE')),
  category TEXT NOT NULL DEFAULT 'CORE',
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  enabled BOOLEAN NOT NULL DEFAULT true,
  permissions JSONB NOT NULL DEFAULT '["OWNER", "ADMIN", "AGENT"]'::jsonb,
  risk_level TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tools_enabled ON tools(enabled);
CREATE INDEX IF NOT EXISTS idx_tools_type ON tools(type);

-- ------------------------------------------------------------------------------
-- 4. CAPABILITIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS capabilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  risk_level TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  default_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  compatible_agents JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_capabilities_enabled ON capabilities(enabled);

-- ------------------------------------------------------------------------------
-- 5. AGENT_CAPABILITIES (Junction Table)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  capability_id TEXT NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  proficiency TEXT NOT NULL DEFAULT 'EXPERT' CHECK (proficiency IN ('BEGINNER', 'INTERMEDIATE', 'EXPERT', 'MASTER')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, capability_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent ON agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_capability ON agent_capabilities(capability_id);

-- ------------------------------------------------------------------------------
-- 6. EXECUTIONS (Central Autonomous Pipeline Records)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS executions (
  id TEXT PRIMARY KEY,
  goal TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT DEFAULT 'Josemar Gourgel',
  user_role TEXT DEFAULT 'OWNER',
  state TEXT NOT NULL DEFAULT 'QUEUED' CHECK (
    state IN (
      'QUEUED', 'PLANNING', 'ASSIGNED', 'IN_PROGRESS',
      'QA_PENDING', 'QA_PASSED', 'QA_FAILED', 'RETRYING',
      'HANDOFF_PENDING', 'HANDED_OFF', 'OWNER_APPROVAL_REQUIRED',
      'COMPLETED', 'FAILED', 'CANCELLED'
    )
  ),
  preferred_agent_id TEXT REFERENCES agents(id),
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms BIGINT DEFAULT 0,
  total_retries INT NOT NULL DEFAULT 0,
  total_handoffs INT NOT NULL DEFAULT 0,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_executions_state ON executions(state);
CREATE INDEX IF NOT EXISTS idx_executions_user ON executions(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_created_at ON executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_idempotency ON executions(idempotency_key);

-- ------------------------------------------------------------------------------
-- 7. EXECUTION_STEPS (DAG Steps per Execution)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS execution_steps (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_agent_id TEXT REFERENCES agents(id),
  assigned_agent_name TEXT,
  state TEXT NOT NULL DEFAULT 'QUEUED' CHECK (
    state IN (
      'QUEUED', 'PLANNING', 'ASSIGNED', 'IN_PROGRESS',
      'QA_PENDING', 'QA_PASSED', 'QA_FAILED', 'RETRYING',
      'HANDOFF_PENDING', 'HANDED_OFF', 'OWNER_APPROVAL_REQUIRED',
      'COMPLETED', 'FAILED', 'CANCELLED'
    )
  ),
  primary_capability_id TEXT REFERENCES capabilities(id),
  selected_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_parallel_allowed BOOLEAN NOT NULL DEFAULT false,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output TEXT,
  artifacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(execution_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_execution_steps_exec ON execution_steps(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_steps_agent ON execution_steps(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_execution_steps_state ON execution_steps(state);

-- ------------------------------------------------------------------------------
-- 8. TASKS (Backlog Tasks / Operational Actions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  execution_id TEXT REFERENCES executions(id) ON DELETE SET NULL,
  parent_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  objective TEXT,
  agent_id TEXT REFERENCES agents(id),
  state TEXT NOT NULL DEFAULT 'PENDING' CHECK (state IN ('PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED', 'BLOCKED')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT')),
  dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output TEXT,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  scheduled_for TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_execution ON tasks(execution_id);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_state ON tasks(state);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- ------------------------------------------------------------------------------
-- 9. TASK_DEPENDENCIES (DAG Adjacency Junction)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, depends_on_task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_deps_task ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_depends ON task_dependencies(depends_on_task_id);

-- ------------------------------------------------------------------------------
-- 10. HANDOFFS (Inter-Agent Delegation Auditable Chain)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS handoffs (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
  step_id TEXT,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  source_agent_id TEXT NOT NULL REFERENCES agents(id),
  target_agent_id TEXT NOT NULL REFERENCES agents(id),
  reason TEXT NOT NULL,
  context_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  previous_output TEXT,
  artifacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  handoff_depth INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_handoffs_execution ON handoffs(execution_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_source ON handoffs(source_agent_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_target ON handoffs(target_agent_id);

-- ------------------------------------------------------------------------------
-- 11. RETRY_ATTEMPTS (Self-Correction Lifecycle Records)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS retry_attempts (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  agent_id TEXT REFERENCES agents(id),
  attempt_number INT NOT NULL,
  reason TEXT NOT NULL,
  error_details TEXT,
  qa_score NUMERIC DEFAULT 0,
  adapted_prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(execution_id, step_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_retries_execution ON retry_attempts(execution_id);
CREATE INDEX IF NOT EXISTS idx_retries_step ON retry_attempts(step_id);

-- ------------------------------------------------------------------------------
-- 12. QA_REPORTS (Autonomous Quality Assurance Audits)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qa_reports (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  agent_id TEXT REFERENCES agents(id),
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  requires_retry BOOLEAN NOT NULL DEFAULT false,
  requires_owner_approval BOOLEAN NOT NULL DEFAULT false,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qa_reports_execution ON qa_reports(execution_id);
CREATE INDEX IF NOT EXISTS idx_qa_reports_step ON qa_reports(step_id);
CREATE INDEX IF NOT EXISTS idx_qa_reports_passed ON qa_reports(passed);

-- ------------------------------------------------------------------------------
-- 13. ARTIFACTS (Metadata for Files, Deliverables & Visuals)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  execution_id TEXT REFERENCES executions(id) ON DELETE SET NULL,
  step_id TEXT,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  agent_id TEXT REFERENCES agents(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('documents', 'images', 'videos', 'audio', 'spreadsheets', 'code', 'archives', 'other')),
  storage_path TEXT,
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  public_url TEXT,
  content_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_execution ON artifacts(execution_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_category ON artifacts(category);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);

-- ------------------------------------------------------------------------------
-- 14. KNOWLEDGE_ITEMS (Enterprise Knowledge Base)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('BRANDING', 'DESIGN_AI', 'CONTENT_STRATEGY', 'AUTOMATION', 'INTERNAL_PROCESS', 'CLIENT_PLAYBOOK', 'TECHNICAL')),
  source TEXT DEFAULT 'MANUAL',
  version TEXT NOT NULL DEFAULT '1.0.0',
  status TEXT NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('DRAFT', 'REVIEW_REQUIRED', 'APPROVED', 'ARCHIVED')),
  owner TEXT NOT NULL DEFAULT 'Josemar Gourgel',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  associated_doc_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  associated_skill_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  associated_agent_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_items(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_status ON knowledge_items(status);

-- ------------------------------------------------------------------------------
-- 15. AUDIT_EVENTS (Cryptographically Chained SHA-256 Audit Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  execution_id TEXT REFERENCES executions(id) ON DELETE SET NULL,
  step_id TEXT,
  task_id TEXT,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_execution ON audit_events(execution_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_hash ON audit_events(hash);
CREATE INDEX IF NOT EXISTS idx_audit_events_prev_hash ON audit_events(previous_hash);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp ASC);

-- ------------------------------------------------------------------------------
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE retry_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Public/Auth read access for system agents and registries" ON agents FOR SELECT USING (true);
CREATE POLICY "Public/Auth read access for skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public/Auth read access for tools" ON tools FOR SELECT USING (true);
CREATE POLICY "Public/Auth read access for capabilities" ON capabilities FOR SELECT USING (true);
CREATE POLICY "Public/Auth read access for agent capabilities" ON agent_capabilities FOR SELECT USING (true);
CREATE POLICY "Public/Auth read access for knowledge" ON knowledge_items FOR SELECT USING (true);

-- Execution & Task Access
CREATE POLICY "Executions full access" ON executions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Execution steps full access" ON execution_steps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Tasks full access" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Task dependencies full access" ON task_dependencies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Handoffs full access" ON handoffs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Retries full access" ON retry_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "QA reports full access" ON qa_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Artifacts full access" ON artifacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Audit events append-only/read access" ON audit_events FOR ALL USING (true) WITH CHECK (true);
