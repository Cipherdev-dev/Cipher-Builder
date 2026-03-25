import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, AlertCircle, CheckCircle, Sparkles, TrendingUp, Zap } from "lucide-react";
import { analyzeSite, generateRebuildCopy } from "@/utils/siteAnalyzer";
import { toast } from "sonner";

interface AnalysisResult {
  businessName: string;
  services: string[];
  tone: string;
  sections: string[];
  issues: string[];
  performanceScore: number;
  seoScore: number;
  conversionScore: number;
  confidenceScore: number;
  expectedImprovement: string;
}

export default function Discover() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [generatedSections, setGeneratedSections] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [rebuildCopy, setRebuildCopy] = useState<any>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to use Discovery Mode</p>
        </div>
      </div>
    );
  }

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeSite(url);
      setAnalysisResult(result);
      toast.success("Site analysis complete!");
    } catch (error) {
      toast.error("Failed to analyze site. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRebuild = () => {
    if (!analysisResult) return;

    // Generate premium copy
    const copy = generateRebuildCopy(analysisResult.businessName, analysisResult.services, analysisResult.tone);
    setRebuildCopy(copy);

    // Convert analysis result into builder-compatible sections with premium copy
    const sections = [
      {
        id: "hero",
        type: "hero",
        title: copy.heroHeadline,
        subtitle: copy.heroSubtitle,
        content: `Welcome to ${analysisResult.businessName}`,
        cta: copy.ctaPrimary,
        included: true,
        order: 0,
      },
      {
        id: "services",
        type: "services",
        title: "Our Services",
        items: analysisResult.services.map((service) => ({
          name: service,
          description: `Professional ${service.toLowerCase()} service tailored to your needs`,
        })),
        included: true,
        order: 1,
      },
      {
        id: "about",
        type: "about",
        title: "Why Choose Us",
        content: `${analysisResult.businessName} is dedicated to providing exceptional ${analysisResult.services[0]?.toLowerCase() || "service"} with a ${analysisResult.tone} approach. We combine expertise, innovation, and customer-focused solutions to deliver outstanding results.`,
        included: true,
        order: 2,
      },
      {
        id: "contact",
        type: "contact",
        title: "Ready to Get Started?",
        subtitle: "Let's transform your experience",
        cta: copy.ctaPrimary,
        included: true,
        order: 3,
      },
    ];

    setGeneratedSections(sections);
    setShowPreview(true);
    toast.success("Premium rebuild generated! Preview ready.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Discovery Mode</h1>
          </div>
          <p className="text-slate-600">
            Analyze any website with AI-powered insights and instantly generate an improved version
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Input & Analysis */}
          <div className="lg:col-span-1 space-y-6">
            {/* URL Input Card */}
            <Card>
              <CardHeader>
                <CardTitle>Enter Website URL</CardTitle>
                <CardDescription>Paste the URL of any website to analyze</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="e.g., joesbarbershop.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleAnalyze();
                  }}
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !url.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Site...
                    </>
                  ) : (
                    "Analyze Site"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <>
                {/* Business Info */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900">{analysisResult.businessName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Tone</p>
                      <p className="text-sm text-blue-800 capitalize font-medium">{analysisResult.tone}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Scores */}
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Performance Score */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">Performance</span>
                        <span className="text-sm font-bold text-blue-600">
                          {analysisResult.performanceScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${analysisResult.performanceScore}%` }}
                        />
                      </div>
                    </div>

                    {/* SEO Score */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">SEO Score</span>
                        <span className="text-sm font-bold text-green-600">
                          {analysisResult.seoScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${analysisResult.seoScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Conversion Score */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">Conversion</span>
                        <span className="text-sm font-bold text-purple-600">
                          {analysisResult.conversionScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${analysisResult.conversionScore}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Services */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Services Identified</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.services.map((service, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Issues */}
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-900">Issues Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.issues.map((issue, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-800">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Confidence & Improvement */}
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Improvement Potential
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-green-900 mb-2">
                        Confidence Score: {analysisResult.confidenceScore}%
                      </p>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all"
                          style={{ width: `${analysisResult.confidenceScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-white rounded p-3 border border-green-200">
                      <p className="text-sm font-semibold text-green-900">Expected Result:</p>
                      <p className="text-lg font-bold text-green-700 mt-1">
                        {analysisResult.expectedImprovement}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Rebuild Button */}
                <Button onClick={handleRebuild} className="w-full" size="lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Premium Rebuild
                </Button>
              </>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            {showPreview && generatedSections.length > 0 && rebuildCopy ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Premium Rebuild Preview</CardTitle>
                  <CardDescription>Your AI-improved website</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Side-by-side comparison */}
                  <div className="space-y-6">
                    {/* Hero Section Preview */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg">
                      <h2 className="text-3xl font-bold mb-2">{rebuildCopy.heroHeadline}</h2>
                      <p className="text-blue-100 mb-6">{rebuildCopy.heroSubtitle}</p>
                      <Button className="bg-white text-blue-600 hover:bg-blue-50">
                        {rebuildCopy.ctaPrimary}
                      </Button>
                    </div>

                    {/* Services Section Preview */}
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Our Services</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generatedSections[1]?.items?.map(
                          (
                            item: { name: string; description: string },
                            idx: number
                          ) => (
                            <Card key={idx} className="bg-slate-50 border-slate-200">
                              <CardContent className="pt-6">
                                <h4 className="font-semibold mb-2">{item.name}</h4>
                                <p className="text-sm text-slate-600">{item.description}</p>
                              </CardContent>
                            </Card>
                          )
                        )}
                      </div>
                    </div>

                    {/* Why Choose Us Section Preview */}
                    <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">
                      <h3 className="text-2xl font-bold mb-4">Why Choose Us</h3>
                      <p className="text-slate-700 leading-relaxed">{generatedSections[2]?.content}</p>
                    </div>

                    {/* Contact Section Preview */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-lg text-center">
                      <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
                      <p className="text-slate-300 mb-6">Let's transform your experience</p>
                      <Button className="bg-white text-slate-900 hover:bg-slate-100">
                        {rebuildCopy.ctaPrimary}
                      </Button>
                    </div>

                    {/* Improvement Summary */}
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Zap className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-green-900 mb-1">Key Improvements Made:</p>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>✓ Strong, benefit-driven headline</li>
                              <li>✓ Clear call-to-action buttons</li>
                              <li>✓ Professional service descriptions</li>
                              <li>✓ Improved visual hierarchy</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowPreview(false);
                        setAnalysisResult(null);
                        setGeneratedSections([]);
                        setUrl("");
                        setRebuildCopy(null);
                      }}
                    >
                      Start Over
                    </Button>
                    <Button className="flex-1" onClick={() => setLocation("/dashboard")}>
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-4 h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    {analysisResult
                      ? "Click 'Generate Premium Rebuild' to see your improved website"
                      : "Enter a URL and click 'Analyze Site' to get started"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
