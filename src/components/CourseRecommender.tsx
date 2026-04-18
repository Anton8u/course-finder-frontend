import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { MultiSelectPopover } from "./MultiSelectPopover";
import { translations, type Lang } from "@/lib/i18n";
import { PROGRAMS_SV, PROGRAMS_EN } from "@/lib/programs";

const STUDY_PERIODS = ["SP1", "SP2", "SP3", "SP4", "Summer"] as const;
type StudyPeriod = (typeof STUDY_PERIODS)[number];

type TeachingLang = "swedish" | "english" | "both";

export function CourseRecommender() {
  const [lang, setLang] = useState<Lang>("en");
  const [periods, setPeriods] = useState<StudyPeriod[]>([]);
  const [withinPrograms, setWithinPrograms] = useState<string[]>([]);
  const [hostedByPrograms, setHostedByPrograms] = useState<string[]>([]);
  const [teachingLang, setTeachingLang] = useState<TeachingLang>("both");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const t = translations[lang];
  const PROGRAMS = lang === "sv" ? PROGRAMS_SV : PROGRAMS_EN;

  const togglePeriod = (p: StudyPeriod) =>
    setPeriods((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const toggleIn = (list: string[], setList: (v: string[]) => void) => (p: string) =>
    setList(list.includes(p) ? list.filter((x) => x !== p) : [...list, p]);

  const handleQuery = async () => {
    if (!query.trim()) {
      toast.error(t.emptyQuery);
      return;
    }
    setLoading(true);
    setResult("");
    await new Promise((r) => setTimeout(r, 600));
    setResult(
      JSON.stringify(
        {
          query,
          studyPeriods: periods.length ? periods : STUDY_PERIODS,
          courseWithinProgram: withinPrograms,
          courseHostedBy: hostedByPrograms,
          teachingLanguage: teachingLang,
          pageLanguage: lang,
        },
        null,
        2,
      ),
    );
    setLoading(false);
  };

  const teachingOptions: { value: TeachingLang; label: string }[] = [
    { value: "swedish", label: t.swedish },
    { value: "english", label: t.english },
    { value: "both", label: t.both },
  ];

  return (
    <div className="relative isolate overflow-hidden">

      {/* Subtle grid texture */}
      {/*
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
        }}
      />*/}

      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6 sm:py-16">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tighter text-foreground sm:text-5xl">
              {t.title}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "sv" : "en")}
            aria-label={t.switchTo}
            title={t.switchTo}
            className="group inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 px-1 py-1 text-xs font-medium backdrop-blur transition-colors hover:border-primary/40"
          >
            <span
              className={`rounded-full px-2.5 py-1 transition-colors ${
                lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              EN
            </span>
            <span
              className={`rounded-full px-2.5 py-1 transition-colors ${
                lang === "sv" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              SV
            </span>
          </button>
        </header>

        <Card className="border-border/60 bg-card/60 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:border-border">
          <CardHeader className="space-y-1.5">
            <CardTitle className="text-lg font-semibold">{t.filters}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.studyPeriod}
              </Label>
              <MultiSelectPopover
                options={STUDY_PERIODS}
                selected={periods}
                onToggle={(p) => togglePeriod(p as StudyPeriod)}
                emptyLabel={t.allPeriods}
                countLabel={t.periodsSelected}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.courseWithinProgram}
              </Label>
              <MultiSelectPopover
                options={PROGRAMS}
                selected={withinPrograms}
                onToggle={toggleIn(withinPrograms, setWithinPrograms)}
                emptyLabel={t.allPrograms}
                countLabel={t.programsSelected}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.courseHostedBy}
              </Label>
              <MultiSelectPopover
                options={PROGRAMS}
                selected={hostedByPrograms}
                onToggle={toggleIn(hostedByPrograms, setHostedByPrograms)}
                emptyLabel={t.allPrograms}
                countLabel={t.programsSelected}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.teachingLanguage}
              </Label>
              <div className="flex flex-wrap gap-2">
                {teachingOptions.map((opt) => (
                  <Toggle
                    key={opt.value}
                    pressed={teachingLang === opt.value}
                    onPressedChange={() => setTeachingLang(opt.value)}
                    variant="outline"
                    size="sm"
                    className="border-border/60 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    {opt.label}
                  </Toggle>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:border-border">
          <CardHeader className="space-y-1.5">
            <CardTitle className="text-lg font-semibold">{t.describe}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={5}
              className="resize-y border-border/60 bg-background/40 text-base leading-relaxed focus-visible:ring-primary/40"
            />
            <Button
              onClick={handleQuery}
              disabled={loading}
              size="lg"
              className="group w-full bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_12px_-4px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_8px_24px_-8px_rgba(255,255,255,0.2)] sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.querying}
                </>
              ) : (
                <>
                  {t.query}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <CardHeader className="space-y-1.5">
            <CardTitle className="text-lg font-semibold">{t.recommendations}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={result}
              placeholder={t.resultsPlaceholder}
              rows={12}
              className="resize-y border-border/60 bg-background/60 font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/*}
        <footer className="pt-4 text-center text-xs text-muted-foreground">
          <span className="font-serif italic">Authors</span> · Chalmers Course Compass
        </footer>
        */}
      </div>
    </div>
  );
}
