import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import SectionBuilder from "@/components/SectionBuilder";

export default function ProjectAnalysis() {
  const [match, params] = useRoute("/project/:projectId");
  const [, setLocation] = useLocation();
  const projectId = params?.projectId ? parseInt(params.projectId) : null;
  const [showBuilder, setShowBuilder] = useState(false);

  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const { data: analysis } = trpc.projects.getAnalysis.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const { data: sections } = trpc.projects.getSections.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const { data: reviews } = trpc.projects.getReviews.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const buildWebsite = trpc.projects.buildWebsite.useMutation();

  const handleBuildWebsite = async () => {
    if (!projectId) return;

    try {
      await buildWebsite.mutateAsync({ projectId });
      toast.success("Website built successfully!");
      setShowBuilder(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to build website");
    }
  };

  if (!match || !projectId) {
    return <div>Project not found</div>;
  }

  if (projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project not found</h1>
          <Button onClick={() => setLocation("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{project.title}</h1>
              <p className="text-slate-600 mt-1">{project.description}</p>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {project.status}
            </Badge>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quality Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">
                  {(analysis.score as any) || 0}/10
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  {(analysis.sentiment as any) === "positive"
                    ? "Strong website foundation"
                    : (analysis.sentiment as any) === "neutral"
                      ? "Average performance"
                      : "Needs improvement"}
                </p>
              </CardContent>
            </Card>

            {/* Strengths Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {((analysis.strengths as any) || []).slice(0, 3).map((strength: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700">
                      • {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {((analysis.weaknesses as any) || []).slice(0, 3).map((weakness: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700">
                      • {weakness}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sections */}
        {sections && sections.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Website Sections</CardTitle>
              <CardDescription>Select sections to include in the rebuilt website</CardDescription>
            </CardHeader>
            <CardContent>
              <SectionBuilder projectId={projectId} sections={sections} />
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>Recent reviews for this business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">{review.author}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating || 0 }).map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700">{review.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {project.status === "analyzed" && (
            <Button
              size="lg"
              onClick={handleBuildWebsite}
              disabled={buildWebsite.isPending}
            >
              {buildWebsite.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Building Website...
                </>
              ) : (
                "Build Website"
              )}
            </Button>
          )}
          {project.status === "preview" && (
            <Button
              size="lg"
              onClick={() => setLocation(`/project/${projectId}/preview`)}
            >
              Review & Approve
            </Button>
          )}
          {project.status === "approved" && (
            <Button
              size="lg"
              onClick={() => setLocation(`/project/${projectId}/launch`)}
            >
              Launch Website
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={() => setLocation("/")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
