import { useRoute } from "wouter";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Preview() {
  const [match, params] = useRoute("/preview/:token");
  const token = params?.token;
  const [html, setHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const getPublicPreview = trpc.deployment.getPublicPreview.useQuery(
    { token: token! },
    { enabled: !!token }
  );

  useEffect(() => {
    if (getPublicPreview.data?.html) {
      setHtml(getPublicPreview.data.html);
      setIsLoading(false);
    }

    if (getPublicPreview.error) {
      setError(getPublicPreview.error.message);
      setIsLoading(false);
    }
  }, [getPublicPreview.data, getPublicPreview.error]);

  if (!match || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Preview not found</h1>
          <p className="text-slate-600">The preview link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-red-600">Error</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        width: "100%",
        height: "100vh",
        overflow: "auto",
      }}
    />
  );
}
