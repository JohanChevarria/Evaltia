-- Exam sessions core tables
create table if not exists public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  university_id uuid null,
  course_id uuid null,
  name text not null default '',
  mode text not null check (mode in ('repaso', 'practica', 'simulacro')),
  topic_ids uuid[] default '{}'::uuid[],
  question_count integer not null check (question_count > 0),
  timed boolean not null default false,
  time_limit_minutes integer null check (time_limit_minutes is null or time_limit_minutes > 0),
  current_index integer not null default 0,
  flagged_question_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  finished_at timestamptz null
);

create index if not exists exam_sessions_user_idx on public.exam_sessions (user_id);

create table if not exists public.exam_session_questions (
  session_id uuid not null references public.exam_sessions (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  position integer not null,
  primary key (session_id, question_id)
);

create index if not exists exam_session_questions_session_idx on public.exam_session_questions (session_id, position);

create table if not exists public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.exam_sessions (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  selected_option_label text not null,
  is_correct boolean not null,
  attempt integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists exam_answers_session_question_idx on public.exam_answers (session_id, question_id, attempt desc);

create table if not exists public.exam_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.exam_sessions (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  text text not null,
  updated_at timestamptz not null default now(),
  unique (session_id, question_id)
);

-- Helper function: random questions by topics/course/university
create or replace function public.get_random_questions(
  topic_ids uuid[],
  limit_count integer,
  p_course_id uuid default null,
  p_university_id uuid default null
) returns table (id uuid) language sql volatile as $$
  select q.id
  from public.questions q
  where (coalesce(array_length(topic_ids, 1), 0) = 0 or q.topic_id = any(topic_ids))
    and (p_course_id is null or q.course_id = p_course_id)
    and (p_university_id is null or q.university_id = p_university_id)
  order by random()
  limit greatest(limit_count, 1)
$$;

-- Row level security
alter table public.exam_sessions enable row level security;
alter table public.exam_session_questions enable row level security;
alter table public.exam_answers enable row level security;
alter table public.exam_notes enable row level security;

drop policy if exists "exam_sessions_select" on public.exam_sessions;
create policy "exam_sessions_select" on public.exam_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "exam_sessions_mod" on public.exam_sessions;
create policy "exam_sessions_mod" on public.exam_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "exam_session_questions_select" on public.exam_session_questions;
create policy "exam_session_questions_select" on public.exam_session_questions
  for select using (
    exists (
      select 1 from public.exam_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "exam_session_questions_mod" on public.exam_session_questions;
create policy "exam_session_questions_mod" on public.exam_session_questions
  for all using (
    exists (
      select 1 from public.exam_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.exam_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "exam_answers_select" on public.exam_answers;
create policy "exam_answers_select" on public.exam_answers
  for select using (
    exists (
      select 1 from public.exam_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "exam_answers_mod" on public.exam_answers;
create policy "exam_answers_mod" on public.exam_answers
  for all using (
    exists (
      select 1 from public.exam_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.exam_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "exam_notes_select" on public.exam_notes;
create policy "exam_notes_select" on public.exam_notes
  for select using (
    exists (
      select 1 from public.exam_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "exam_notes_mod" on public.exam_notes;
create policy "exam_notes_mod" on public.exam_notes
  for all using (
    exists (
      select 1 from public.exam_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.exam_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
