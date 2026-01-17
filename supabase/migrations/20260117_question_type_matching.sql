-- Question type enum
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'question_type' and n.nspname = 'public'
  ) then
    create type public.question_type as enum (
      'default',
      'matching',
      'clinical_case',
      'premise_reason'
    );
  end if;
end $$;

-- Questions: question_type + matching_data
alter table public.questions
  add column if not exists question_type public.question_type not null default 'default',
  add column if not exists matching_data jsonb not null default '{}'::jsonb;

update public.questions
set question_type = 'default'
where question_type is null;

update public.questions
set matching_data = '{}'::jsonb
where matching_data is null;

-- RLS: questions + concepts (admin can modify within university)
alter table public.questions enable row level security;
alter table public.concepts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'questions' and policyname = 'questions_select'
  ) then
    create policy "questions_select" on public.questions
      for select
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.university_id = questions.university_id
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'questions' and policyname = 'questions_admin_insert'
  ) then
    create policy "questions_admin_insert" on public.questions
      for insert
      with check (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
            and p.university_id = questions.university_id
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'questions' and policyname = 'questions_admin_update'
  ) then
    create policy "questions_admin_update" on public.questions
      for update
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
            and p.university_id = questions.university_id
        )
      )
      with check (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
            and p.university_id = questions.university_id
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'questions' and policyname = 'questions_admin_delete'
  ) then
    create policy "questions_admin_delete" on public.questions
      for delete
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
            and p.university_id = questions.university_id
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'concepts' and policyname = 'concepts_select'
  ) then
    create policy "concepts_select" on public.concepts
      for select
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.university_id = concepts.university_id
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'concepts' and policyname = 'concepts_admin_insert'
  ) then
    create policy "concepts_admin_insert" on public.concepts
      for insert
      with check (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
            and p.university_id = concepts.university_id
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'concepts' and policyname = 'concepts_admin_update'
  ) then
    create policy "concepts_admin_update" on public.concepts
      for update
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
            and p.university_id = concepts.university_id
        )
      )
      with check (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
            and p.university_id = concepts.university_id
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'concepts' and policyname = 'concepts_admin_delete'
  ) then
    create policy "concepts_admin_delete" on public.concepts
      for delete
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
            and p.university_id = concepts.university_id
        )
      );
  end if;
end $$;
