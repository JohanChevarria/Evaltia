-- =============================================
-- Exam sessions: status + pause/resume metadata
-- =============================================

-- Add new columns (nullable first for safe backfill).
alter table public.exam_sessions
  add column if not exists status text;

alter table public.exam_sessions
  add column if not exists paused_at timestamptz;

alter table public.exam_sessions
  add column if not exists started_at timestamptz;

-- Note: total questions already tracked by question_count; answer counts are derived from exam_answers.

-- Backfill status based on finished_at (do not overwrite existing).
update public.exam_sessions
set status = case when finished_at is not null then 'finished' else 'in_progress' end
where status is null;

-- Backfill started_at from created_at when missing.
update public.exam_sessions
set started_at = coalesce(started_at, created_at)
where started_at is null;

-- Defaults for new rows.
alter table public.exam_sessions
  alter column status set default 'in_progress';

alter table public.exam_sessions
  alter column started_at set default now();

-- Enforce valid status values (safe guard).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'exam_sessions_status_check'
  ) then
    alter table public.exam_sessions
      add constraint exam_sessions_status_check
      check (status in ('in_progress', 'paused', 'finished', 'cancelled'));
  end if;
end $$;

-- =============================================
-- Performance indexes for analytics and resume
-- =============================================

create index if not exists exam_sessions_user_mode_status_idx
  on public.exam_sessions (user_id, mode, status);

create index if not exists exam_sessions_user_course_idx
  on public.exam_sessions (user_id, course_id);

create index if not exists exam_sessions_user_paused_at_idx
  on public.exam_sessions (user_id, paused_at desc)
  where paused_at is not null;

create index if not exists exam_sessions_user_finished_at_idx
  on public.exam_sessions (user_id, finished_at desc)
  where finished_at is not null;

-- =============================================
-- Enforce 1 paused practice per user
-- =============================================

create unique index if not exists exam_sessions_practica_paused_unique
  on public.exam_sessions (user_id)
  where mode = 'practica' and status = 'paused';

-- =============================================
-- RPC: pause practice (atomic + auto-close other paused practice)
-- =============================================

create or replace function public.pause_practice_session(
  p_session_id uuid,
  p_user_id uuid,
  p_current_index integer default null
) returns void
language plpgsql
as $$
begin
  -- Only one paused practice per user: close any previous paused session before pausing this one.
  update public.exam_sessions
    set status = 'cancelled',
        finished_at = now(),
        paused_at = null
  where user_id = p_user_id
    and mode = 'practica'
    and status = 'paused'
    and id <> p_session_id;

  update public.exam_sessions
    set status = 'paused',
        paused_at = now(),
        finished_at = null,
        current_index = coalesce(p_current_index, current_index)
  where id = p_session_id
    and user_id = p_user_id
    and mode = 'practica';
end;
$$;

-- =============================================
-- RPC: finish session (atomic finish/status update)
-- =============================================

create or replace function public.finish_exam_session(
  p_session_id uuid,
  p_user_id uuid,
  p_current_index integer default null
) returns void
language plpgsql
as $$
begin
  update public.exam_sessions
    set status = 'finished',
        finished_at = now(),
        paused_at = null,
        current_index = coalesce(p_current_index, current_index)
  where id = p_session_id
    and user_id = p_user_id;
end;
$$;
