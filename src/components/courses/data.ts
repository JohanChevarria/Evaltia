export type Course = {
  id: string;
  slug: string;
  name: string;
  progress: number;
};

export const COURSES: Course[] = [
  { id: "anat",     slug: "anatomia",      name: "Anatomía",      progress: 0 },
  { id: "histo",    slug: "histologia",    name: "Histología",    progress: 0 },
  { id: "emb",      slug: "embriologia",   name: "Embriología",   progress: 0 },
  { id: "bioest",   slug: "bioestadistica",name: "Bioestadística",progress: 0 },
  { id: "bioq",     slug: "bioquimica",    name: "Bioquímica",    progress: 0 },
  { id: "fisiol",   slug: "fisiologia",    name: "Fisiología",    progress: 0 },
  { id: "parasito", slug: "parasitologia", name: "Parasitología", progress: 0 },
  { id: "farma",    slug: "farmacologia",  name: "Farmacología",  progress: 0 },
  { id: "pato",     slug: "patologia",     name: "Patología",     progress: 0 },
];

export default COURSES;