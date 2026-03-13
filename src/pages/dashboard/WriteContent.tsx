import { useState, useMemo, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  useGetAllBusinessesQuery,
  useUpdateBusinessMutation,
} from "@/redux/features/business/businessApi";
import {
  useCreateRegularContentMutation,
  ContentType,
  useGetAllRegularContentsQuery,
  useUpdateRegularContentMutation,
  useDeleteRegularContentMutation,
  RegularContent,
} from "@/redux/features/content/contentApi";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ViewContentDialog } from "@/components/ViewContentDialog";
import { EditContentDialog } from "@/components/EditContentDialog";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

// Content type for table display
type Content = {
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
};

// Status Switch Component
function StatusSwitch({
  initialStatus,
  onStatusChange,
}: {
  initialStatus: boolean;
  onStatusChange: (newStatus: boolean) => void;
}) {
  const [checked, setChecked] = useState<boolean>(initialStatus);

  // Sync with prop changes (for socket updates)
  useEffect(() => {
    setChecked(initialStatus);
  }, [initialStatus]);

  const handleChange = (newChecked: boolean) => {
    setChecked(newChecked);
    onStatusChange(newChecked);
  };

  return (
    <div className="flex justify-center items-center">
      <Switch
        checked={checked}
        onCheckedChange={handleChange}
        className="h-4 w-6 md:h-[1.15rem] md:w-8"
        thumbClassName="size-3 md:size-4"
      />
    </div>
  );
}

// Form validation schema based on backend requirements
const contentFormSchema = z.object({
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

type ContentFormValues = z.infer<typeof contentFormSchema>;

// Define columns for data table
const createColumns = (
  handleStatusChange: (id: string, newStatus: boolean) => void,
  handleView: (content: Content) => void,
  handleEdit: (content: Content) => void,
  handleDelete: (id: string, businessName: string) => void
): ColumnDef<Content>[] => [
  {
    accessorKey: "businessName",
    header: () => <div className="text-center text-xs md:text-sm">Business Name</div>,
    cell: ({ row }) => {
      return <div className="text-center text-xs md:text-sm">{row.getValue("businessName")}</div>;
    },
  },
  {
    accessorKey: "date",
    header: () => <div className="text-center text-xs md:text-sm">Date</div>,
    cell: ({ row }) => {
      return <div className="text-center text-xs md:text-sm">{row.getValue("date")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center text-xs md:text-sm">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as boolean;
      return (
        <div className="flex justify-center">
          <Badge
            variant={status ? "default" : "outline"}
            className={
              status
                ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800 text-[10px] md:text-xs px-1.5 md:px-2.5"
                : "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800 text-[10px] md:text-xs px-1.5 md:px-2.5"
            }
          >
            {status ? "Done" : "Pending"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "contentType",
    header: () => <div className="text-center text-xs md:text-sm">Content Type</div>,
    cell: ({ row }) => {
      const contentType = row.getValue("contentType") as string;
      const getContentTypeColor = () => {
        switch (contentType.toLowerCase()) {
          case "poster":
            return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 text-[10px] md:text-xs px-1.5 md:px-2.5";
          case "video":
            return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800 text-[10px] md:text-xs px-1.5 md:px-2.5";
          case "both":
            return "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800 text-[10px] md:text-xs px-1.5 md:px-2.5";
          default:
            return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-950/40 dark:text-gray-400 dark:border-gray-800 text-[10px] md:text-xs px-1.5 md:px-2.5";
        }
      };
      return (
        <div className="flex justify-center">
          <Badge variant="outline" className={getContentTypeColor()}>
            {contentType}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "changeStatus",
    header: () => <div className="text-center text-xs md:text-sm">Change Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as boolean;
      return (
        <StatusSwitch
          key={row.original.id}
          initialStatus={status}
          onStatusChange={(newStatus) =>
            handleStatusChange(row.original.id, newStatus)
          }
        />
      );
    },
  },
  {
    id: "action",
    header: () => <div className="text-center text-xs md:text-sm">Action</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center gap-1 md:gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row.original)}
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 dark:hover:border-blue-600 text-xs md:text-sm px-2 md:px-3"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleView(row.original)}
            className="hover:bg-green-50 hover:text-green-600 hover:border-green-600 dark:hover:bg-green-950/40 dark:hover:text-green-400 dark:hover:border-green-600 text-xs md:text-sm px-2 md:px-3"
          >
            View
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-600 text-xs md:text-sm px-2 md:px-3"
              >
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the content for "{row.original.businessName}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(row.original.id, row.original.businessName)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];

export default function WriteContent() {
  const [date, setDate] = useState<Date>(new Date());
  const [contentType, setContentType] = useState<ContentType>(
    ContentType.POSTER
  );
  const [viewContent, setViewContent] = useState<Content | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState<Content | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // RTK Query hooks
  const { data: businessesData, isLoading: isLoadingBusinesses } =
    useGetAllBusinessesQuery();
  const [createContent, { isLoading: isCreating }] =
    useCreateRegularContentMutation();
  const [updateContent] = useUpdateRegularContentMutation();
  const [deleteContent] = useDeleteRegularContentMutation();
  const [updateBusiness] = useUpdateBusinessMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      contentType: ContentType.POSTER,
      date: new Date(),
    },
  });

  const postMaterial = watch("postMaterial");
  const selectedBusiness = watch("business");
  const selectedDate = watch("date");

  // Fetch contents filtered by date
  const { data: contentsData, isLoading: isLoadingContents } =
    useGetAllRegularContentsQuery({
      date: selectedDate
        ? format(selectedDate, "MM/dd/yyyy")
        : format(new Date(), "MM/dd/yyyy"),
    });

  // Auto-populate tags when business is selected
  useEffect(() => {
    if (selectedBusiness && businessesData?.data) {
      const business = businessesData.data.find(
        (b) => b._id === selectedBusiness
      );
      if (business && business.tags) {
        setValue("tags", business.tags);
      }
    }
  }, [selectedBusiness, businessesData, setValue]);

  // Sync form state with local state when radio button changes
  const handleContentTypeChange = (newType: ContentType) => {
    setContentType(newType);
    setValue("contentType", newType);
  };

  const onSubmit = async (data: ContentFormValues) => {
    try {
      // Format date to MM/DD/YYYY as required by backend
      const formattedDate = format(data.date, "MM/dd/yyyy");

      // Team assignments will be auto-assigned from business settings by backend
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

      // Create content using RTK Query mutation
      await createContent(payload).unwrap();

      // Update business tags with the latest tags from this content
      // This updates even if tags are empty (to clear previous tags)
      await updateBusiness({
        id: data.business,
        data: { tags: data.tags || "" },
      }).unwrap();

      // Reset form after successful submission
      const today = new Date();
      reset({
        contentType: ContentType.POSTER,
        date: today,
        business: "",
        postMaterial: "",
        tags: "",
        videoMaterial: "",
        vision: "",
        posterMaterial: "",
        comments: "",
      });
      setDate(today);
      setContentType(ContentType.POSTER);

      toast.success("Content created successfully!", { duration: Infinity });
    } catch (error) {
      console.error("Error creating content:", error);
      toast.error("Failed to create content. Please try again.", {
        duration: Infinity,
      });
    }
  };

  // Use local state for instant UI updates
  const showPosterFields =
    contentType === ContentType.POSTER || contentType === ContentType.BOTH;
  const showVideoFields =
    contentType === ContentType.VIDEO || contentType === ContentType.BOTH;

  // Get businesses list from API
  const businesses = businessesData?.data || [];

  // Transform API data to table format and filter by selected business
  const contents: Content[] = useMemo(
    () =>
      contentsData?.data
        ?.map((content: RegularContent) => ({
          id: content._id,
          businessId:
            typeof content.business === "string"
              ? content.business
              : content.business?._id || "",
          businessName:
            typeof content.business === "string"
              ? businessesData?.data?.find((b) => b._id === content.business)
                  ?.businessName || "Unknown"
              : content.business?.businessName || "Unknown",
          date: content.date,
          status: content.status,
          contentType: content.contentType,
          postMaterial: content.postMaterial,
          tags: content.tags,
          videoMaterial: content.videoMaterial,
          vision: content.vision,
          posterMaterial: content.posterMaterial,
          comments: content.comments,
        }))
        .filter((content: Content) =>
          selectedBusiness ? content.businessId === selectedBusiness : false
        ) || [],
    [contentsData, businessesData, selectedBusiness]
  );

  // Handlers for table actions
  const handleStatusChange = useCallback(
    async (id: string, newStatus: boolean) => {
      try {
        await updateContent({ id, data: { status: newStatus } }).unwrap();
        toast.success("Status updated successfully", { duration: Infinity });
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("Failed to update status", { duration: Infinity });
      }
    },
    [updateContent]
  );

  const handleView = (content: Content) => {
    setViewContent(content);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (content: Content) => {
    setEditContent(content);
    setIsEditDialogOpen(true);
  };

  const handleDelete = useCallback(
    async (id: string, businessName: string) => {
      try {
        await deleteContent(id).unwrap();
        toast.success(`Content for "${businessName}" deleted successfully`, { duration: Infinity });
      } catch (error) {
        console.error("Error deleting content:", error);
        toast.error("Failed to delete content", { duration: Infinity });
      }
    },
    [deleteContent]
  );

  const columns = useMemo(
    () =>
      createColumns(handleStatusChange, handleView, handleEdit, handleDelete),
    [handleStatusChange, handleDelete]
  );

  return (
    <div className="space-y-6 mt-2">
      {/* Header */}
      <div className="flex items-center justify-between bg-linear-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 p-6 rounded-lg border">
        <div>
          <h2 className="text-3xl font-bold bg-linear-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-cyan-600" />
            Write Content
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create new content for your campaigns
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          if (newDate) {
                            setDate(newDate);
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                      onChange={() =>
                        handleContentTypeChange(type.value as ContentType)
                      }
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
                  <Label htmlFor="postMaterial">Social Media Caption</Label>
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
                  <Label htmlFor="comments">Internal Notes & Comments</Label>
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

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating}
            className="gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isCreating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Create Content
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Data Table Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between bg-linear-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 p-4 rounded-lg border">
          <div>
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
              Existing Content for Selected Business
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedBusiness
                ? `Showing content for ${
                    businesses.find((b) => b._id === selectedBusiness)
                      ?.businessName || "selected business"
                  } on ${
                    selectedDate ? format(selectedDate, "PPP") : "selected date"
                  }`
                : "Select a business and date above to view existing content"}
            </p>
          </div>
        </div>

        {/* Table or Empty State */}
        {!selectedBusiness || !selectedDate ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Business Selected</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Select a business and date from the form above to view
                  existing content
                </p>
              </div>
            </div>
          </Card>
        ) : isLoadingContents ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
              <p className="text-sm text-muted-foreground">
                Loading contents...
              </p>
            </div>
          </Card>
        ) : contents.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Content Found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  No content exists for this business on the selected date
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <DataTable columns={columns} data={contents} />
          </Card>
        )}
      </div>

      {/* View Content Dialog */}
      <ViewContentDialog
        content={viewContent}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />

      {/* Edit Content Dialog */}
      <EditContentDialog
        content={editContent}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
