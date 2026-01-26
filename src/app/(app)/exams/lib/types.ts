export type ExamMode = "repaso" | "practica" | "simulacro";

export type ExamOption = {
  id: string;
  label: string;
  text: string;
  explanation?: string | null;
  is_correct: boolean;
};

export type MatchingData = {
  left: string[];
  right: string[];
};

export type ExamQuestion = {
  id: string;
  topic_id?: string | null;
  course_id?: string | null;
  university_id?: string | null;
  text: string;
  image_url?: string | null;
  hint?: string | null;
  position?: number;
  options: ExamOption[];
  question_type?: string | null;
  matching_data?: MatchingData | null;
  matching_key?: number[] | null;
};

export type ExamSession = {
  id: string;
  user_id?: string;
  university_id?: string | null;
  course_id?: string | null;
  name: string;
  mode: ExamMode;
  topic_ids: string[];
  question_count: number;
  timed: boolean;
  time_limit_minutes?: number | null;
  current_index: number;
  flagged_question_ids?: string[];
  created_at?: string;
  started_at?: string | null;
  paused_at?: string | null;
  finished_at?: string | null;
  status?: "in_progress" | "paused" | "finished" | "cancelled";
};

export type ExamAnswer = {
  id: string;
  session_id?: string;
  question_id: string;
  selected_option_label: string;
  is_correct: boolean;
  attempt: number;
  created_at: string;
};

export type ExamNote = {
  id?: string;
  session_id?: string;
  question_id: string;
  text: string;
  updated_at: string;
};

export type SessionPayload = {
  session: ExamSession;
  questions: ExamQuestion[];
  answers: ExamAnswer[];
  notes: ExamNote[];
};
