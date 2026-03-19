import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TaskStatus, TaskPriority } from "@/types/models";

const columns: { key: TaskStatus; label: string; color: string }[] = [
  { key: "inbox", label: "Inbox", color: "bg-info" },
  { key: "running", label: "Running", color: "bg-success" },
  { key: "waiting", label: "Waiting", color: "bg-warning" },
  { key: "done", label: "Done", color: "bg-muted-foreground" },
  { key: "blocked", label: "Blocked", color: "bg-destructive" },
];

const priorityColor: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/20 text-info",
  high: "bg-warning/20 text-warning",
  critical: "bg-destructive/20 text-destructive",
};

export default function TasksPage() {
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: getTasks });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="min-w-[260px] flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                <span className="text-sm font-semibold">{col.label}</span>
                <Badge variant="secondary" className="text-xs ml-auto">{colTasks.length}</Badge>
              </div>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:border-primary/40 transition-colors">
                    <CardContent className="p-3 space-y-2">
                      <p className="text-sm font-medium leading-tight">{task.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-[10px] ${priorityColor[task.priority]}`}>{task.priority}</Badge>
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {colTasks.length === 0 && (
                  <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
