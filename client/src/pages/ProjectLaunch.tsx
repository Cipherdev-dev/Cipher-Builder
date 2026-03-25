import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft, Loader2, Globe, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProjectLaunch() {
  const [match, params] = useRoute("/project/:projectId/launch");
  const [, setLocation] = useLocation();
  const projectId = params?.projectId ? parseInt(params.projectId) : null;
  const [customDomain, setCustomDomain] = useState("");
  const [launchTab, setLaunchTab] = useState("temp");

  const { data: project } = trpc.projects.get.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const { data: domain } = trpc.deployment.getDomain.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const createDomain = trpc.deployment.createDomain.useMutation();
  const verifyDomain = trpc.deployment.verifyDomain.useMutation();
  const launchWebsite = trpc.deployment.launchWebsite.useMutation();

  const handleCreateTempDomain = async () => {
    if (!projectId) return;

    try {
      await createDomain.mutateAsync({
        projectId,
      });
      toast.success("Temporary domain created!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create domain");
    }
  };

  const handleLaunchToCustomDomain = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customDomain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    try {
      await launchWebsite.mutateAsync({
        projectId: projectId!,
        customDomain,
      });
      toast.success("Website launched successfully!");
      setLocation(`/project/${projectId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to launch website");
    }
  };

  if (!match || !projectId) {
    return <div>Project not found</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setLocation(`/project/${projectId}`)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Project
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Launch Your Website</h1>
          <p className="text-slate-600 mt-1">Choose how you want to publish your website</p>
        </div>

        {/* Launch Options */}
        <Tabs value={launchTab} onValueChange={setLaunchTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="temp">Temporary Domain</TabsTrigger>
            <TabsTrigger value="custom">Custom Domain</TabsTrigger>
          </TabsList>

          {/* Temporary Domain Tab */}
          <TabsContent value="temp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Temporary Domain
                </CardTitle>
                <CardDescription>
                  Get a temporary domain to test your website before using a custom domain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {domain && domain.status !== "pending" ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">Domain Active</span>
                      </div>
                      <p className="text-green-800">
                        Your website is live at:{" "}
                        <a
                          href={domain.deploymentUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono font-bold underline"
                        >
                          {domain.deploymentUrl}
                        </a>
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => window.open(domain.deploymentUrl || "#", "_blank")}
                    >
                      Visit Website
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-600">
                      We'll create a temporary domain for your website. You can use this to share with others
                      or test before launching to a custom domain.
                    </p>
                    <Button
                      className="w-full"
                      onClick={handleCreateTempDomain}
                      disabled={createDomain.isPending}
                    >
                      {createDomain.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Domain...
                        </>
                      ) : (
                        "Create Temporary Domain"
                      )}
                    </Button>
                  </>
                )}

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Temporary Domain Benefits:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Instant access to your website</li>
                    <li>✓ Share with team members and customers</li>
                    <li>✓ Test before using a custom domain</li>
                    <li>✓ Available for 30 days</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Domain Tab */}
          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Custom Domain
                </CardTitle>
                <CardDescription>
                  Launch your website to your own domain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLaunchToCustomDomain} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Your Domain</Label>
                    <Input
                      id="domain"
                      type="text"
                      placeholder="example.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      disabled={launchWebsite.isPending}
                    />
                    <p className="text-xs text-slate-500">
                      Enter your domain without https:// (e.g., example.com)
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-900">Before you continue:</h4>
                        <ul className="text-sm text-amber-800 mt-2 space-y-1">
                          <li>✓ You must own the domain</li>
                          <li>✓ Update your domain's DNS records to point to our servers</li>
                          <li>✓ We'll provide DNS instructions after launch</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={launchWebsite.isPending}
                  >
                    {launchWebsite.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      "Launch to Custom Domain"
                    )}
                  </Button>
                </form>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 Custom Domain Process:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Enter your domain name</li>
                    <li>2. We'll provide DNS records to add to your domain registrar</li>
                    <li>3. Update your domain's DNS settings</li>
                    <li>4. Your website will be live (usually within 24 hours)</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
