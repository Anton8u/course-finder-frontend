import { createFileRoute } from "@tanstack/react-router";
import { CourseRecommender } from "@/components/CourseRecommender";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Chalmers Course Recommender" },
      {
        name: "description",
        content:
          "Find Chalmers courses that match your interests — filter by study period and program, then describe what you want to learn.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <CourseRecommender />
      <Toaster />
    </main>
  );
}
