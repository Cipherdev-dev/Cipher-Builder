import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Zap, FileText, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Website Builder</h1>
          <p className="text-slate-600">
            Analyze, rebuild, and launch websites with AI-powered automation
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setLocation("/discover")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Discovery Mode
              </CardTitle>
              <CardDescription>Analyze & rebuild any website</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Paste any URL and instantly see an improved version built with Cipher.
              </p>
              <Button className="w-full">Start Discovery</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setLocation("/rebuild")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Rebuild Existing Site
              </CardTitle>
              <CardDescription>Analyze and improve an existing website</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Enter a domain URL to analyze its structure, identify improvements, and generate a
                better version.
              </p>
              <Button className="w-full">Start Rebuild</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setLocation("/generate")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generate New Site
              </CardTitle>
              <CardDescription>Create a website from scratch with AI</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Describe your business and let AI create a professional website tailored to your
                needs.
              </p>
              <Button className="w-full">Start Generation</Button>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Recent Projects</h2>
            <Button onClick={() => setLocation("/rebuild")} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-600">Loading projects...</p>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setLocation(`/project/${project.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {project.projectType === "rebuild" ? "Rebuild" : "Generate"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {project.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-full">
                          {project.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-slate-600 mb-4">No projects yet. Create one to get started!</p>
                <Button onClick={() => setLocation("/rebuild")}>Create Your First Project</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
