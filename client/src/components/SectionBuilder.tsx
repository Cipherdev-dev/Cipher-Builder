import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { GripVertical, Trash2, Eye } from "lucide-react";
import type { Section } from "../../../drizzle/schema";

interface SectionBuilderProps {
  projectId: number;
  sections: Section[];
}

export default function SectionBuilder({ projectId, sections }: SectionBuilderProps) {
  const [localSections, setLocalSections] = useState(sections);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const updateSection = trpc.projects.updateSection.useMutation();

  const handleToggleSection = async (sectionId: number, included: boolean) => {
    try {
      await updateSection.mutateAsync({
        projectId,
        sectionId,
        included,
      });

      setLocalSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, included } : s))
      );
    } catch (error) {
      toast.error("Failed to update section");
    }
  };

  const handleDragStart = (id: number) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetId: number) => {
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = localSections.findIndex((s) => s.id === draggedId);
    const targetIndex = localSections.findIndex((s) => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder sections
    const newSections = [...localSections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);

    // Update order
    for (let i = 0; i < newSections.length; i++) {
      try {
        await updateSection.mutateAsync({
          projectId,
          sectionId: newSections[i].id,
          order: i,
        });
      } catch (error) {
        toast.error("Failed to update section order");
        return;
      }
    }

    setLocalSections(newSections);
    setDraggedId(null);
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "header":
        return "📋";
      case "hero":
        return "🎯";
      case "features":
        return "⭐";
      case "testimonials":
        return "💬";
      case "footer":
        return "🔗";
      default:
        return "📄";
    }
  };

  const getSectionLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-3">
      {localSections.map((section) => (
        <Card
          key={section.id}
          draggable
          onDragStart={() => handleDragStart(section.id)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(section.id)}
          className={`cursor-move transition-all ${
            draggedId === section.id ? "opacity-50" : ""
          } ${!section.included ? "opacity-60" : ""}`}
        >
          <CardContent className="flex items-center gap-3 p-4">
            {/* Drag Handle */}
            <GripVertical className="w-5 h-5 text-slate-400 flex-shrink-0" />

            {/* Checkbox */}
            <Checkbox
              checked={section.included ?? true}
              onCheckedChange={(checked) =>
                handleToggleSection(section.id, checked as boolean)
              }
              className="flex-shrink-0"
            />

            {/* Section Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getSectionIcon(section.sectionType)}</span>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {section.title || getSectionLabel(section.sectionType)}
                  </h4>
                  <p className="text-xs text-slate-500">{section.sectionType}</p>
                </div>
              </div>
              {section.content && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {section.content}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                title="Preview section"
                className="text-slate-600 hover:text-slate-900"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Summary */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>
            {localSections.filter((s) => s.included).length} of {localSections.length}
          </strong>{" "}
          sections selected for rebuild
        </p>
      </div>
    </div>
  );
}
