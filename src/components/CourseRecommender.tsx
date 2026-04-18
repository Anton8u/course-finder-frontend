import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown, Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";

const STUDY_PERIODS = ["sp1", "sp2", "sp3", "sp4", "summer"] as const;
type StudyPeriod = (typeof STUDY_PERIODS)[number];

const PROGRAMS = Array.from({ length: 10 }, (_, i) => `program${i + 1}`);

const ENDPOINT_KEY = "course_recommender_endpoint";

export function CourseRecommender() {
  const [periods, setPeriods] = useState<StudyPeriod[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [endpointDraft, setEndpointDraft] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(ENDPOINT_KEY) ?? "";
    setEndpoint(saved);
    setEndpointDraft(saved);
  }, []);

  const togglePeriod = (p: StudyPeriod) =>
    setPeriods((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );

  const toggleProgram = (p: string) =>
    setPrograms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );

  const programLabel = useMemo(() => {
    if (programs.length === 0) return "All programs";
    if (programs.length <= 2) return programs.join(", ");
    return `${programs.length} programs selected`;
  }, [programs]);

  const handleQuery = async () => {
    if (!query.trim()) {
      toast.error("Please describe the course you're looking for.");
      return;
    }
    if (!endpoint) {
      toast.error("Set your API endpoint first (gear icon).");
      setSettingsOpen(true);
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          studyPeriods: periods.length ? periods : STUDY_PERIODS,
          programs,
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        setResult(
          typeof data === "string"
            ? data
            : (data.result ?? data.text ?? JSON.stringify(data, null, 2)),
        );
      } else {
        setResult(await res.text());
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(msg);
      setResult(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const saveEndpoint = () => {
    localStorage.setItem(ENDPOINT_KEY, endpointDraft.trim());
    setEndpoint(endpointDraft.trim());
    setSettingsOpen(false);
    toast.success("Endpoint saved");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Chalmers Course Recommender
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe what you want to learn — get tailored course suggestions.
          </p>
        </div>
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Settings">
              <Settings2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="endpoint">API endpoint</Label>
                <Input
                  id="endpoint"
                  placeholder="https://your-api.example.com/recommend"
                  value={endpointDraft}
                  onChange={(e) => setEndpointDraft(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  POSTs JSON {"{ query, studyPeriods, programs }"} and expects{" "}
                  {"{ result: string }"}.
                </p>
              </div>
              <Button onClick={saveEndpoint} className="w-full">
                Save
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Study period</Label>
            <div className="flex flex-wrap gap-2">
              {STUDY_PERIODS.map((p) => (
                <Toggle
                  key={p}
                  pressed={periods.includes(p)}
                  onPressedChange={() => togglePeriod(p)}
                  variant="outline"
                  size="sm"
                  className="uppercase"
                >
                  {p}
                </Toggle>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select none to include all periods.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Study programs</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  <span className="truncate">{programLabel}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-2">
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {PROGRAMS.map((p) => {
                    const checked = programs.includes(p);
                    return (
                      <label
                        key={p}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleProgram(p)}
                        />
                        <span className="text-sm">{p}</span>
                      </label>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
            {programs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {programs.map((p) => (
                  <Badge
                    key={p}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleProgram(p)}
                  >
                    {p} ✕
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Describe your ideal course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="e.g. I want a hands-on course about machine learning applied to image data, ideally with a project component."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={5}
          />
          <Button
            onClick={handleQuery}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Querying…
              </>
            ) : (
              "Query"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            readOnly
            value={result}
            placeholder="Results will appear here after you query."
            rows={12}
            className="resize-y font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}
