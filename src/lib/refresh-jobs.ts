import { refreshCommercialData, type DashboardFilters, type DashboardDataResult } from "@/lib/comercial-data";

type JobState = "pending" | "running" | "done" | "error";

type RefreshJob = {
  id: string;
  state: JobState;
  filters: DashboardFilters;
  createdAt: number;
  completedAt?: number;
  result?: {
    periodo: string;
    fecha: string;
    rowsAfterRefresh: number;
    data: DashboardDataResult;
  };
  error?: string;
};

const jobs = new Map<string, RefreshJob>();

function generateId() {
  return `refresh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createJob(filters: DashboardFilters): string {
  const id = generateId();
  const job: RefreshJob = {
    id,
    state: "pending",
    filters,
    createdAt: Date.now(),
  };
  jobs.set(id, job);
  return id;
}

export function getJob(id: string): RefreshJob | undefined {
  return jobs.get(id);
}

async function executeJob(job: RefreshJob): Promise<void> {
  job.state = "running";
  try {
    const result = await refreshCommercialData(job.filters);
    job.state = "done";
    job.completedAt = Date.now();
    job.result = {
      periodo: result.periodo,
      fecha: result.fecha,
      rowsAfterRefresh: result.rowsAfterRefresh,
      data: result.data,
    };
  } catch (err) {
    job.state = "error";
    job.completedAt = Date.now();
    job.error = err instanceof Error ? err.message : "Error desconocido durante el refresh";
  }
}

export function startRefreshJob(filters: DashboardFilters): { jobId: string } {
  const id = createJob(filters);
  const job = jobs.get(id)!;
  executeJob(job).catch(() => {});
  return { jobId: id };
}

export function cleanupOldJobs(maxAgeMs = 300_000) {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (job.completedAt && now - job.completedAt > maxAgeMs) {
      jobs.delete(id);
    }
  }
}

setInterval(() => cleanupOldJobs(), 60_000);
