import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function Rebuild() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createProject = trpc.projects.create.useMutation();
  const analyzeWebsite = trpc.projects.analyzeWebsite.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    if (!sourceUrl.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    // Validate URL
    try {
      new URL(sourceUrl);
    } catch {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setIsLoading(true);

    try {
      // Create project
      const project = await createProject.mutateAsync({
        title,
        description,
        sourceUrl,
        projectType: "rebuild",
      });

      toast.success("Project created! Analyzing website...");

      // Analyze website
      await analyzeWebsite.mutateAsync({
        projectId: project.id,
        sourceUrl,
      });

      toast.success("Website analyzed successfully!");
      setLocation(`/project/${project.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Rebuild Existing Website</CardTitle>
            <CardDescription>
              Enter the details of the website you want to analyze and rebuild
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Acme Corp Website Redesign"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">
                  A name to identify this project in your dashboard
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any notes about this project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              {/* Website URL */}
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">Website URL</Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">
                  The website you want to analyze and rebuild
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Website...
                  </>
                ) : (
                  "Analyze & Start Rebuild"
                )}
              </Button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ We'll analyze your website structure and content</li>
                <li>✓ Identify strengths and areas for improvement</li>
                <li>✓ Scrape key sections (header, hero, features, etc.)</li>
                <li>✓ Fetch and analyze customer reviews</li>
                <li>✓ Show you a detailed analysis and preview</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
