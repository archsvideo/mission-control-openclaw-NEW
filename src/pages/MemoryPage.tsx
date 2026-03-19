import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMemoryEntries } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BookOpen, Brain, GitBranch, Search } from "lucide-react";

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  journal: { icon: BookOpen, color: "border-info" },
  lesson: { icon: Brain, color: "border-warning" },
  decision: { icon: GitBranch, color: "border-primary" },
};

export default function MemoryPage() {
  const { data: entries = [] } = useQuery({ queryKey: ["memory"], queryFn: getMemoryEntries });
  const [search, setSearch] = useState("");

  const filtered = entries.filter((e) =>
    search === "" || e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase()) ||
    e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const renderEntries = (type?: string) => {
    const items = type ? filtered.filter((e) => e.type === type) : filtered;
    if (items.length === 0) return <p className="text-sm text-muted-foreground py-4">No entries found.</p>;
    return (
      <div className="space-y-3">
        {items.map((entry) => {
          const cfg = typeConfig[entry.type];
          const Icon = cfg.icon;
          return (
            <Card key={entry.id} className={`border-l-2 ${cfg.color}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm">{entry.title}</CardTitle>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{entry.date}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{entry.content}</p>
                <div className="flex gap-1 flex-wrap">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] cursor-pointer" onClick={() => setSearch(tag)}>{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Memory</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search entries, tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="journal"><BookOpen className="h-3 w-3 mr-1" /> Journal</TabsTrigger>
          <TabsTrigger value="lesson"><Brain className="h-3 w-3 mr-1" /> Lessons</TabsTrigger>
          <TabsTrigger value="decision"><GitBranch className="h-3 w-3 mr-1" /> Decisions</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">{renderEntries()}</TabsContent>
        <TabsContent value="journal" className="mt-4">{renderEntries("journal")}</TabsContent>
        <TabsContent value="lesson" className="mt-4">{renderEntries("lesson")}</TabsContent>
        <TabsContent value="decision" className="mt-4">{renderEntries("decision")}</TabsContent>
      </Tabs>
    </div>
  );
}
