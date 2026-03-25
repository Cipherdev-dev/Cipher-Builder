import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "E-commerce",
  "Real Estate",
  "Hospitality",
  "Education",
  "Consulting",
  "Restaurant",
  "Fitness",
  "Other",
];

const STYLES = [
  "Modern & Minimalist",
  "Professional & Corporate",
  "Creative & Artistic",
  "Playful & Fun",
  "Luxury & Premium",
  "Tech & Innovative",
];

export default function Generate() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [industry, setIndustry] = useState("");
  const [style, setStyle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createProject = trpc.projects.create.useMutation();
  const generateFromPrompt = trpc.projects.generateFromPrompt.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    if (!prompt.trim() || prompt.length < 20) {
      toast.error("Please enter a detailed description (at least 20 characters)");
      return;
    }

    setIsLoading(true);

    try {
      // Create project
      const project = await createProject.mutateAsync({
        title,
        description: prompt.substring(0, 200),
        projectType: "generate",
      });

      toast.success("Project created! Generating website...");

      // Generate website
      await generateFromPrompt.mutateAsync({
        projectId: project.id,
        prompt,
        industry: industry || undefined,
        style: style || undefined,
      });

      toast.success("Website generated successfully!");
      setLocation(`/project/${project.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate website");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Website from AI Prompt</CardTitle>
            <CardDescription>
              Describe your business and let AI create a professional website for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., My Coffee Shop Website"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry (Optional)</Label>
                <Select value={industry} onValueChange={setIndustry} disabled={isLoading}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Design Style */}
              <div className="space-y-2">
                <Label htmlFor="style">Design Style (Optional)</Label>
                <Select value={style} onValueChange={setStyle} disabled={isLoading}>
                  <SelectTrigger id="style">
                    <SelectValue placeholder="Select a design style" />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Website Description */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Website Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe your business, what you do, your target audience, and any specific features you want on your website. The more details you provide, the better the generated website will be."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isLoading}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-slate-500">
                  {prompt.length}/500 characters (minimum 20 required)
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
                    Generating Website...
                  </>
                ) : (
                  "Generate My Website"
                )}
              </Button>
            </form>

            {/* Tips Box */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">💡 Tips for best results:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✓ Be specific about your business and services</li>
                <li>✓ Mention your target audience</li>
                <li>✓ Include any specific features or sections you want</li>
                <li>✓ Describe your brand personality and values</li>
                <li>✓ Mention any unique selling points</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
