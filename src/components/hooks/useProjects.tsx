"use client";

import { useState, useEffect, useMemo } from "react";
import {
  mockProjects,
  projectsSummary,
  quirkyverseCharacters,
  getRelatedProjects,
} from "@/lib/mock-data/projects";
import { Project, ProjectScope, ProjectStatus, ProjectCharacter } from "@/types/admin";

interface ProjectsData {
  projects: Project[];
  summary: typeof projectsSummary;
  characters: ProjectCharacter[];
  loading: boolean;
  error: string | null;
}

export function useProjects(
  scopeFilter?: ProjectScope | "all",
  statusFilter?: ProjectStatus | "all"
): ProjectsData {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 400));

        let filteredProjects = [...mockProjects];

        if (scopeFilter && scopeFilter !== "all") {
          filteredProjects = filteredProjects.filter((p) => p.scope === scopeFilter);
        }

        if (statusFilter && statusFilter !== "all") {
          filteredProjects = filteredProjects.filter((p) => p.status === statusFilter);
        }

        setProjects(filteredProjects);
      } catch (err) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [scopeFilter, statusFilter]);

  return {
    projects,
    summary: projectsSummary,
    characters: quirkyverseCharacters,
    loading,
    error,
  };
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const foundProject = mockProjects.find((p) => p.id === projectId);
        if (foundProject) {
          setProject(foundProject);
          setRelatedProjects(getRelatedProjects(projectId));
        } else {
          setError("Project not found");
        }
      } catch (err) {
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  return { project, relatedProjects, loading, error };
}

export function useQuirkyverseCharacters() {
  const [characters, setCharacters] = useState<ProjectCharacter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setCharacters(quirkyverseCharacters);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { characters, loading };
}
