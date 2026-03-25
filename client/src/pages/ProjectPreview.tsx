import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft, Loader2, Mail, Share2, CheckCircle2 } from "lucide-react";

export default function ProjectPreview() {
  const [match, params] = useRoute("/project/:projectId/preview");
  const [, setLocation] = useLocation();
  const projectId = params?.projectId ? parseInt(params.projectId) : null;
  const [recipientEmail, setRecipientEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  const { data: project } = trpc.projects.get.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const { data: preview } = trpc.projects.getPreview.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const sendEmail = trpc.deployment.sendPreviewEmail.useMutation();
  const approveProject = trpc.projects.approve.useMutation();

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      const result = await sendEmail.mutateAsync({
        projectId: projectId!,
        recipientEmail,
        subject: `Preview: ${project?.title || "Your Website"}`,
      });

      toast.success("Preview email sent successfully!");
      setRecipientEmail("");
      setShowEmailForm(false);

      // Copy preview URL to clipboard
      const previewUrl = `${window.location.origin}/preview/${preview?.previewToken}`;
      navigator.clipboard.writeText(previewUrl);
      toast.success("Preview URL copied to clipboard!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send email");
    }
  };

  const handleApprove = async () => {
    if (!projectId) return;

    try {
      await approveProject.mutateAsync({ projectId });
      toast.success("Project approved! Ready to launch.");
      setLocation(`/project/${projectId}/launch`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve project");
    }
  };

  if (!match || !projectId) {
    return <div>Project not found</div>;
  }

  if (!project || !preview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const previewUrl = `${window.location.origin}/preview/${preview.previewToken}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setLocation(`/project/${projectId}`)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Project
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Preview & Approval</h1>
          <p className="text-slate-600 mt-1">Review your rebuilt website and get it ready for launch</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Website Preview</CardTitle>
                <CardDescription>
                  This is how your website will look when launched
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
                  <iframe
                    src={previewUrl}
                    title="Website Preview"
                    className="w-full"
                    style={{ height: "600px", border: "none" }}
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(previewUrl, "_blank")}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(previewUrl);
                      toast.success("Preview URL copied!");
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-4">
            {/* Share Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Share Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showEmailForm ? (
                  <Button
                    className="w-full"
                    onClick={() => setShowEmailForm(true)}
                  >
                    Send Preview Email
                  </Button>
                ) : (
                  <form onSubmit={handleSendEmail} className="space-y-3">
                    <div>
                      <Label htmlFor="email" className="text-sm">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="customer@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        disabled={sendEmail.isPending}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        className="flex-1"
                        disabled={sendEmail.isPending}
                      >
                        {sendEmail.isPending ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send"
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowEmailForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
                <p className="text-xs text-slate-500 mt-3">
                  Send a link to your customer so they can review the website before launch
                </p>
              </CardContent>
            </Card>

            {/* Approval Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Approve & Launch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">
                  Once you approve this website, you'll be able to launch it to your domain.
                </p>
                <Button
                  className="w-full"
                  onClick={handleApprove}
                  disabled={approveProject.isPending}
                >
                  {approveProject.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    "Approve & Continue"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-blue-900 mb-2">Preview Stats</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>Views: {preview.accessCount || 0}</p>
                  <p>Expires: {preview.expiresAt ? new Date(preview.expiresAt).toLocaleDateString() : "Never"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
