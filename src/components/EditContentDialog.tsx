import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  useUpdateRegularContentMutation,
  ContentType,
} from "@/redux/features/content/contentApi";
import { useGetAllBusinessesQuery, useUpdateBusinessMutation } from "@/redux/features/business/businessApi";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";

// Form validation schema
const editContentFormSchema = z.object({
  business: z.string().min(1, "Please select a business"),
  date: z.date(),
  contentType: z.nativeEnum(ContentType),
  postMaterial: z.string().optional(),
  tags: z.string().optional(),
  videoMaterial: z.string().optional(),
  vision: z.string().optional(),
  posterMaterial: z.string().optional(),
  comments: z.string().optional(),
});

type EditContentFormValues = z.infer<typeof editContentFormSchema>;

interface Content {
  id: string;
  businessId: string;
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

interface EditContentDialogProps {
  content: Content | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditContentDialog({
  content,
  open,
  onOpenChange,
}: EditContentDialogProps) {
  const [updateContent, { isLoading: isUpdating }] =
    useUpdateRegularContentMutation();
  const { data: businessesData, isLoading: isLoadingBusinesses } =
    useGetAllBusinessesQuery();
  const [updateBusiness] = useUpdateBusinessMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditContentFormValues>({
    resolver: zodResolver(editContentFormSchema),
  });

  const selectedDate = watch("date");
  const contentType = watch("contentType");
  const postMaterial = watch("postMaterial");
  const selectedBusiness = watch("business");

  // Auto-populate tags when business is changed
  useEffect(() => {
    if (selectedBusiness && businessesData?.data && open) {
      const business = businessesData.data.find(b => b._id === selectedBusiness);
      if (business && business.tags) {
        // Only update if the business was actually changed (not initial load)
        if (content && selectedBusiness !== content.businessId) {
          setValue("tags", business.tags);
        }
      }
    }
  }, [selectedBusiness, businessesData, setValue, open, content]);

  // Initialize form when content changes
  useEffect(() => {
    if (content && open) {
      // Parse the date string (assuming MM/DD/YYYY format)
      const [month, day, year] = content.date.split("/");
      const parsedDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );

      reset({
        business: content.businessId,
        date: parsedDate,
        contentType: content.contentType as ContentType,
        postMaterial: content.postMaterial || "",
        tags: content.tags || "",
        videoMaterial: content.videoMaterial || "",
        vision: content.vision || "",
        posterMaterial: content.posterMaterial || "",
        comments: content.comments || "",
      });
    }
  }, [content, open, reset]);

  if (!content) return null;

  const showPosterFields =
    contentType === ContentType.POSTER || contentType === ContentType.BOTH;
  const showVideoFields =
    contentType === ContentType.VIDEO || contentType === ContentType.BOTH;

  const businesses = businessesData?.data || [];

  const onSubmit = async (data: EditContentFormValues) => {
    try {
      // Format date to MM/DD/YYYY as required by backend
      const formattedDate = format(data.date, "MM/dd/yyyy");

      const payload = {
        business: data.business,
        date: formattedDate,
        contentType: data.contentType,
        postMaterial: data.postMaterial,
        tags: data.tags,
        videoMaterial: data.videoMaterial,
        vision: data.vision,
        posterMaterial: data.posterMaterial,
        comments: data.comments,
      };

      await updateContent({ id: content.id, data: payload }).unwrap();

      // Update business tags with the latest tags from this edited content
      // This updates even if tags are empty (to clear previous tags)
      await updateBusiness({
        id: data.business,
        data: { tags: data.tags || "" }
      }).unwrap();

      onOpenChange(false);
      toast.success("Content updated successfully!", { duration: Infinity });
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Failed to update content. Please try again.", { duration: Infinity });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[85vw] !w-[85vw] h-[85vh] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-2xl font-bold">
              Edit Content
            </DialogTitle>
            <div className="flex gap-2">
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <Card className="p-6">
                <div className="space-y-6">
                  {/* Basic Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-blue-600" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Business Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="business">
                          Business <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="business"
                          {...register("business")}
                          disabled={isLoadingBusinesses}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">
                            {isLoadingBusinesses
                              ? "Loading businesses..."
                              : "Select a business"}
                          </option>
                          {businesses.map((business) => (
                            <option key={business._id} value={business._id}>
                              {business.businessName}
                            </option>
                          ))}
                        </select>
                        {errors.business && (
                          <p className="text-sm text-red-500">
                            {errors.business.message}
                          </p>
                        )}
                      </div>

                      {/* Date Selection */}
                      <div className="space-y-2">
                        <Label>
                          Content Date <span className="text-red-500">*</span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate
                                ? format(selectedDate, "PPP")
                                : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(newDate) => {
                                if (newDate) {
                                  setValue("date", newDate);
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.date && (
                          <p className="text-sm text-red-500">
                            {errors.date.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Type Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-blue-600" />
                      Content Type <span className="text-red-500">*</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          value: ContentType.POSTER,
                          label: "Poster Only",
                          desc: "For Content Designer",
                        },
                        {
                          value: ContentType.VIDEO,
                          label: "Video Only",
                          desc: "For Video Editor",
                        },
                        {
                          value: ContentType.BOTH,
                          label: "Both",
                          desc: "Poster & Video",
                        },
                      ].map((type) => (
                        <label
                          key={type.value}
                          className={cn(
                            "relative flex cursor-pointer rounded-lg border p-4 transition-all hover:border-blue-600",
                            contentType === type.value
                              ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40"
                              : "border-border"
                          )}
                        >
                          <input
                            type="radio"
                            value={type.value}
                            {...register("contentType")}
                            className="sr-only"
                          />
                          <div className="flex flex-1 flex-col">
                            <span className="font-semibold">{type.label}</span>
                            <span className="text-sm text-muted-foreground">
                              {type.desc}
                            </span>
                          </div>
                          {contentType === type.value && (
                            <div className="absolute right-4 top-4 h-4 w-4 rounded-full bg-blue-600" />
                          )}
                        </label>
                      ))}
                    </div>
                    {errors.contentType && (
                      <p className="text-sm text-red-500">
                        {errors.contentType.message}
                      </p>
                    )}
                  </div>

                  {/* Content Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-blue-600" />
                      Content Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Post Material */}
                      <div className="space-y-2">
                        <Label htmlFor="postMaterial">
                          Social Media Caption
                        </Label>
                        <RichTextEditor
                          value={postMaterial || ""}
                          onChange={(value) => setValue("postMaterial", value)}
                          placeholder="Write your social media post content here..."
                          rows={4}
                        />
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags & Hashtags</Label>
                        <textarea
                          id="tags"
                          {...register("tags")}
                          rows={4}
                          placeholder="#hashtag1 #hashtag2 @mention"
                          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 pb-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                        />
                      </div>

                      {/* Poster Material - Show if contentType is poster or both */}
                      {showPosterFields && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="posterMaterial">
                              Poster Content Text
                            </Label>
                            <textarea
                              id="posterMaterial"
                              {...register("posterMaterial")}
                              rows={4}
                              placeholder="Text to include in the poster/graphic..."
                              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="vision">
                              Design Vision & Instructions
                            </Label>
                            <textarea
                              id="vision"
                              {...register("vision")}
                              rows={4}
                              placeholder="Design style, color scheme, mood, inspiration..."
                              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                            />
                          </div>
                        </>
                      )}

                      {/* Video Material - Show if contentType is video or both */}
                      {showVideoFields && (
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="videoMaterial">
                            Video Script & Instructions
                          </Label>
                          <textarea
                            id="videoMaterial"
                            {...register("videoMaterial")}
                            rows={4}
                            placeholder="Video script, scenes, voiceover text, editing instructions..."
                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                          />
                        </div>
                      )}

                      {/* Comments */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="comments">
                          Internal Notes & Comments
                        </Label>
                        <textarea
                          id="comments"
                          {...register("comments")}
                          rows={2}
                          placeholder="Additional notes for the team..."
                          className="flex min-h-15 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isUpdating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
