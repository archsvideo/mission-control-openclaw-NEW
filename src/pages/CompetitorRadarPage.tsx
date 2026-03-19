import { useQuery } from "@tanstack/react-query";
import { getCompetitors } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Lightbulb, ListPlus, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function CompetitorRadarPage() {
  const { data: entries = [] } = useQuery({ queryKey: ["competitors"], queryFn: getCompetitors });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Competitor Radar</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Tracked Content</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Hook Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead className="text-right">Engagement</TableHead>
                <TableHead>Pattern</TableHead>
                <TableHead>Tested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">{e.platform}</Badge>
                      <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 text-muted-foreground" /></a>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{e.hookType}</TableCell>
                  <TableCell className="text-sm">{e.format}</TableCell>
                  <TableCell className="text-right font-mono">{e.engagement.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{e.pattern}</TableCell>
                  <TableCell>
                    {e.testedInternally ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <span className="text-xs text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => toast.info("Idea created from competitor insight")}><Lightbulb className="h-3 w-3 mr-1" /> Idea</Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => toast.info("Added to content queue")}><ListPlus className="h-3 w-3 mr-1" /> Queue</Button>
                      {!e.testedInternally && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => toast.success("Marked as tested")}><CheckCircle className="h-3 w-3 mr-1" /> Tested</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
