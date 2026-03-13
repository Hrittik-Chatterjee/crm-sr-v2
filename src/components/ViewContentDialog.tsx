import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "./ui/shadcn-io/copy-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface Content {
  id: string;
  businessName: string;
  date: string;
  status: boolean;
  contentType: string;
  postMaterial?: string;
  tags?: string;
  videoMaterial?: string;
  vision?: string;
  posterMaterial?: string;
  comments?: string;
}

interface ViewContentDialogProps {
  content: Content | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewContentDialog({
  content,
  open,
  onOpenChange,
}: ViewContentDialogProps) {
  if (!content) return null;

  const showPosterFields =
    content.contentType === "poster" || content.contentType === "both";
  const showVideoFields =
    content.contentType === "video" || content.contentType === "both";

  const ReadOnlyTextarea = ({
    label,
    value,
  }: {
    label: string;
    value?: string;
  }) => {
    if (!value) return null;

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="relative flex min-h-20 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
          <p className="whitespace-pre-wrap w-full">{value}</p>
          <CopyButton content={value} className="absolute top-2 right-2" />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-[90vw] lg:max-w-[85vw] w-full sm:w-[90vw] lg:w-[85vw] h-[90vh] sm:h-[85vh] max-h-[90vh] sm:max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              View Content
            </DialogTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`min-w-20 justify-center ${
                  content.contentType.toLowerCase() === "poster"
                    ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                    : content.contentType.toLowerCase() === "video"
                    ? "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800"
                    : "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800"
                }`}
              >
                {content.contentType.toUpperCase()}
              </Badge>
              <Badge
                variant={content.status ? "default" : "outline"}
                className={
                  content.status
                    ? "min-w-20 justify-center bg-green-100 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
                    : "min-w-20 justify-center bg-red-100 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                }
              >
                {content.status ? "Done" : "Pending"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6">
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-blue-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Business */}
                    <div className="space-y-2">
                      <Label>Business</Label>
                      <div className="relative flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm items-center">
                        {content.businessName}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                      <Label>Content Date</Label>
                      <div className="relative flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm items-center">
                        {content.date}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-blue-600" />
                    Content Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Social Media Caption with Tags Combined */}
                    {(content.postMaterial || content.tags) && (
                      <div className="space-y-2">
                        <Label>Social Media Caption & Tags</Label>
                        <div className="relative flex min-h-20 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                          <p className="whitespace-pre-wrap w-full">
                            {content.postMaterial}
                            {content.postMaterial && content.tags && '\n\n\n\n'}
                            {content.tags}
                          </p>
                          <CopyButton
                            content={`${content.postMaterial || ''}${content.postMaterial && content.tags ? '\n\n\n\n' : ''}${content.tags || ''}`}
                            className="absolute top-2 right-2"
                          />
                        </div>
                      </div>
                    )}

                    {/* Poster Material - Show if contentType is poster or both */}
                    {showPosterFields && (
                      <>
                        <ReadOnlyTextarea
                          label="Poster Content Text"
                          value={content.posterMaterial}
                        />

                        <ReadOnlyTextarea
                          label="Design Vision & Instructions"
                          value={content.vision}
                        />
                      </>
                    )}

                    {/* Video Material - Show if contentType is video or both */}
                    {showVideoFields && (
                      <ReadOnlyTextarea
                        label="Video Script & Instructions"
                        value={content.videoMaterial}
                      />
                    )}

                    {/* Comments */}
                    <div>
                      <ReadOnlyTextarea
                        label="Internal Notes & Comments"
                        value={content.comments}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
