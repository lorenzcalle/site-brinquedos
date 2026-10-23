import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Equipe: grupos (Coordenação, Professores…) com seus integrantes, editados no
// /admin → Equipe. Tabelas em supabase/equipe-e-textos.sql.

export type TeamMember = {
  id: string;
  group_id: string;
  name: string;
  role?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  position: number;
};

export type TeamGroup = {
  id: string;
  title: string;
  subtitle?: string | null;
  position: number;
  members: TeamMember[];
};

export async function fetchTeam(): Promise<TeamGroup[]> {
  const [g, m] = await Promise.all([
    supabase.from("team_groups").select("*").order("position"),
    supabase.from("team_members").select("*").order("position"),
  ]);
  if (g.error) throw g.error;
  if (m.error) throw m.error;
  const members = (m.data ?? []) as TeamMember[];
  return ((g.data ?? []) as Omit<TeamGroup, "members">[]).map(grp => ({
    ...grp,
    members: members.filter(x => x.group_id === grp.id),
  }));
}

export function useTeam() {
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTeam().then(setGroups).catch(() => setGroups([])).finally(() => setLoading(false));
  }, []);
  return { groups, loading };
}

export const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("");
