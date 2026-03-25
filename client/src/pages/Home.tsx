import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Zap, Sparkles, Rocket, CheckCircle2, Loader2, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Demo Mode State
  const [demoUrl, setDemoUrl] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoAnalysis, setDemoAnalysis] = useState<AnalysisResult | null>(null);
  const [demoRebuildCopy, setDemoRebuildCopy] = useState<any>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleDemoAnalyze = async (urlToAnalyze?: string) => {
    const urlInput = urlToAnalyze || demoUrl;
    if (!urlInput.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    setDemoLoading(true);
    try {
      const result = await analyzeSite(urlInput);
      setDemoAnalysis(result);

      // Generate premium copy
      const copy = generateRebuildCopy(result.businessName, result.services, result.tone);
      setDemoRebuildCopy(copy);

      toast.success("Analysis complete! Rebuild generated.");

      // Auto-scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (error) {
      toast.error("Failed to analyze site. Please try again.");
      console.error(error);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleDemoExample = () => {
    setDemoUrl("joesbarbershop.com");
    setTimeout(() => handleDemoAnalyze("joesbarbershop.com"), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold">Cipher</span>
          </div>
          <div>
            {user ? (
              <Button onClick={() => setLocation("/dashboard")}>Dashboard</Button>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Demo Mode */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* New Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-center">
            Most Business Websites Are Broken.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              We Fix Them in 60 Seconds.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-xl text-slate-300 mb-12 text-center">
            Paste your website below and see a live rebuild instantly.
          </p>

          {/* Demo Input Section */}
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-3 flex-col sm:flex-row">
                  <Input
                    placeholder="Enter a website (e.g. joesbarbershop.com)"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    disabled={demoLoading}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleDemoAnalyze();
                    }}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 flex-1"
                  />
                  <Button
                    onClick={() => handleDemoAnalyze()}
                    disabled={demoLoading || !demoUrl.trim()}
                    className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                    size="lg"
                  >
                    {demoLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze & Rebuild
                      </>
                    )}
                  </Button>
                </div>

                {/* Demo Example Button */}
                <div className="text-center">
                  <button
                    onClick={handleDemoExample}
                    disabled={demoLoading}
                    className="text-sm text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50"
                  >
                    or try demo: Barbershop Example
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Results Section */}
          {demoAnalysis && demoRebuildCopy && (
            <div ref={resultsRef} className="space-y-8 animate-in fade-in duration-500">
              {/* Analysis Results */}
              <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-700/50">
                <CardHeader>
                  <CardTitle className="text-2xl">{demoAnalysis.businessName}</CardTitle>
                  <CardDescription>AI Analysis Results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold">Performance</span>
                        <span className="text-sm font-bold text-blue-400">
                          {demoAnalysis.performanceScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${demoAnalysis.performanceScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold">SEO</span>
                        <span className="text-sm font-bold text-green-400">
                          {demoAnalysis.seoScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${demoAnalysis.seoScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold">Conversion</span>
                        <span className="text-sm font-bold text-purple-400">
                          {demoAnalysis.conversionScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${demoAnalysis.conversionScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Services Identified
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {demoAnalysis.services.map((service, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-slate-200"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Issues */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      Issues Found
                    </h4>
                    <ul className="space-y-2">
                      {demoAnalysis.issues.slice(0, 4).map((issue, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Before vs After Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Site Issues */}
                <Card className="bg-red-900/20 border-red-700/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-300">Current Site Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {demoAnalysis.issues.map((issue, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Cipher Rebuild */}
                <Card className="bg-green-900/20 border-green-700/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-300">Cipher Rebuild</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-2">Hero Headline</p>
                      <p className="text-lg font-bold text-green-300">{demoRebuildCopy.heroHeadline}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-2">Subheadline</p>
                      <p className="text-sm text-slate-200">{demoRebuildCopy.heroSubtitle}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-2">Primary CTA</p>
                      <p className="text-sm font-semibold text-green-400">{demoRebuildCopy.ctaPrimary}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Confidence Display */}
              <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">Cipher Confidence Score</span>
                      </div>
                      <span className="text-3xl font-bold text-green-400">{demoAnalysis.confidenceScore}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all"
                        style={{ width: `${demoAnalysis.confidenceScore}%` }}
                      />
                    </div>
                    <div className="bg-slate-800/50 rounded p-4 border border-slate-700">
                      <p className="text-sm text-slate-300 mb-2">Estimated Conversion Improvement:</p>
                      <p className="text-2xl font-bold text-green-400">{demoAnalysis.expectedImprovement}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={() => setDemoAnalysis(null)}
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-800"
                >
                  Try Another URL
                </Button>
                {user ? (
                  <Button
                    onClick={() => setLocation("/discover")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Full Analysis
                  </Button>
                ) : (
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <a href={getLoginUrl()}>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Save & Launch
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      {!demoAnalysis && (
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Analyze Websites</h3>
              <p className="text-slate-300">
                Enter any website URL and let AI analyze its structure, identify strengths, weaknesses, and improvement opportunities.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Improvements</h3>
              <p className="text-slate-300">
                Get specific recommendations for design, content, and functionality improvements based on AI analysis.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Launch Instantly</h3>
              <p className="text-slate-300">
                Preview your rebuilt website, make adjustments, and launch to your own domain with one click.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Review Integration</h3>
              <p className="text-slate-300">
                Automatically scrape and analyze customer reviews to understand sentiment and improve your site.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Generate from Scratch</h3>
              <p className="text-slate-300">
                Describe your business and let AI create a complete, professional website tailored to your needs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Drag & Drop Builder</h3>
              <p className="text-slate-300">
                Easily customize sections, reorder content, and fine-tune your website before launch.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!demoAnalysis && (
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Build Better Websites?</h2>
            <p className="text-lg text-blue-100 mb-8">
              Start for free and see how AI can transform your web presence
            </p>
            {user ? (
              <Button
                size="lg"
                onClick={() => setLocation("/dashboard")}
                className="bg-white text-blue-600 hover:bg-slate-100"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-600 hover:bg-slate-100"
              >
                <a href={getLoginUrl()}>Get Started Now</a>
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2026 Cipher. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}
