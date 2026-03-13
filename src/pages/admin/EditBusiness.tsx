import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountryCombobox } from "@/components/ui/CountryCombobox";
import { BusinessTypeCombobox } from "@/components/ui/BusinessTypeCombobox";
import { UserMultiSelect } from "@/components/ui/UserMultiSelect";
import {
  useGetBusinessByIdQuery,
  useUpdateBusinessMutation,
} from "@/redux/features/business/businessApi";
import { useGetAllUsersQuery } from "@/redux/features/user/userApi";
import { useNavigate, useParams } from "react-router";
import { PACKAGES } from "@/constants/business";
import { toast } from "sonner";

const businessSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  typeOfBusiness: z.string().min(1, "Type of business is required"),
  country: z.string().min(1, "Country is required"),
  package: z.string().min(1, "Package is required"),
  entryDate: z.date({ message: "Entry date is required" }),
  contactDetails: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  note: z.string().optional(),
  tags: z.string().optional(),
  assignedCW: z.array(z.string()).optional(),
  assignedCD: z.array(z.string()).optional(),
  assignedVE: z.array(z.string()).optional(),
  // Social media links
  facebookUrl: z.string().optional(),
  facebookUsername: z.string().optional(),
  facebookPassword: z.string().optional(),
  instagramUrl: z.string().optional(),
  instagramUsername: z.string().optional(),
  instagramPassword: z.string().optional(),
  whatsAppUrl: z.string().optional(),
  whatsAppUsername: z.string().optional(),
  whatsAppPassword: z.string().optional(),
  youtubeUrl: z.string().optional(),
  youtubeUsername: z.string().optional(),
  youtubePassword: z.string().optional(),
  website: z.string().optional(),
  tripAdvisor: z.string().optional(),
  googleBusiness: z.string().optional(),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

export default function EditBusiness() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [selectedCW, setSelectedCW] = useState<string[]>([]);
  const [selectedCD, setSelectedCD] = useState<string[]>([]);
  const [selectedVE, setSelectedVE] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({
    facebook: false,
    instagram: false,
    whatsApp: false,
    youtube: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
  });

  const { data: businessData, isLoading: isLoadingBusiness } =
    useGetBusinessByIdQuery(id!);
  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUsersQuery({
    limit: 1000,
  });
  const [updateBusiness, { isLoading: isUpdating }] =
    useUpdateBusinessMutation();

  // Filter users by role
  const cwUsers =
    usersData?.data?.filter((user) => user.roles.includes("contentwriter")) ||
    [];
  const cdUsers =
    usersData?.data?.filter((user) => user.roles.includes("contentdesigner")) ||
    [];
  const veUsers =
    usersData?.data?.filter((user) => user.roles.includes("videoeditor")) || [];

  // Populate form with existing business data
  useEffect(() => {
    if (businessData?.data) {
      const business = businessData.data;

      // Set basic fields
      setValue("businessName", business.businessName);
      setValue("typeOfBusiness", business.typeOfBusiness);
      setSelectedBusinessType(business.typeOfBusiness);
      setValue("country", business.country);
      setSelectedCountry(business.country);
      setValue("package", business.package);
      setValue("contactDetails", business.contactDetails || "");
      setValue("email", business.email || "");
      setValue("address", business.address || "");
      setValue("note", business.note || "");
      setValue("tags", business.tags || "");

      // Set entry date
      if (business.entryDate) {
        const parsedDate = parse(business.entryDate, "MM/dd/yyyy", new Date());
        setDate(parsedDate);
        setValue("entryDate", parsedDate);
      }

      // Set assignments
      setSelectedCW(business.assignedCW || []);
      setSelectedCD(business.assignedCD || []);
      setSelectedVE(business.assignedVE || []);

      // Set social media links
      if (business.socialMediaLinks) {
        setValue("facebookUrl", business.socialMediaLinks.facebook?.url || "");
        setValue(
          "facebookUsername",
          business.socialMediaLinks.facebook?.username || ""
        );
        setValue(
          "facebookPassword",
          business.socialMediaLinks.facebook?.password || ""
        );
        setValue(
          "instagramUrl",
          business.socialMediaLinks.instagram?.url || ""
        );
        setValue(
          "instagramUsername",
          business.socialMediaLinks.instagram?.username || ""
        );
        setValue(
          "instagramPassword",
          business.socialMediaLinks.instagram?.password || ""
        );
        setValue("whatsAppUrl", business.socialMediaLinks.whatsApp?.url || "");
        setValue(
          "whatsAppUsername",
          business.socialMediaLinks.whatsApp?.username || ""
        );
        setValue(
          "whatsAppPassword",
          business.socialMediaLinks.whatsApp?.password || ""
        );
        setValue("youtubeUrl", business.socialMediaLinks.youtube?.url || "");
        setValue(
          "youtubeUsername",
          business.socialMediaLinks.youtube?.username || ""
        );
        setValue(
          "youtubePassword",
          business.socialMediaLinks.youtube?.password || ""
        );
        setValue("website", business.socialMediaLinks.website || "");
        setValue("tripAdvisor", business.socialMediaLinks.tripAdvisor || "");
        setValue(
          "googleBusiness",
          business.socialMediaLinks.googleBusiness || ""
        );
      }
    }
  }, [businessData, setValue]);

  const onSubmit = async (data: BusinessFormValues) => {
    try {
      const formattedDate = data.entryDate
        ? format(data.entryDate, "MM/dd/yyyy")
        : "";

      // Build social media links object
      const socialMediaLinks = {
        facebook: {
          url: data.facebookUrl || "",
          username: data.facebookUsername || "",
          password: data.facebookPassword || "",
        },
        instagram: {
          url: data.instagramUrl || "",
          username: data.instagramUsername || "",
          password: data.instagramPassword || "",
        },
        whatsApp: {
          url: data.whatsAppUrl || "",
          username: data.whatsAppUsername || "",
          password: data.whatsAppPassword || "",
        },
        youtube: {
          url: data.youtubeUrl || "",
          username: data.youtubeUsername || "",
          password: data.youtubePassword || "",
        },
        website: data.website || "",
        tripAdvisor: data.tripAdvisor || "",
        googleBusiness: data.googleBusiness || "",
      };

      const payload = {
        businessName: data.businessName,
        typeOfBusiness: data.typeOfBusiness,
        country: data.country,
        package: data.package,
        entryDate: formattedDate,
        contactDetails: data.contactDetails || "",
        email: data.email || "",
        address: data.address || "",
        note: data.note || "",
        tags: data.tags || "",
        assignedCW: selectedCW,
        assignedCD: selectedCD,
        assignedVE: selectedVE,
        socialMediaLinks,
      };

      await updateBusiness({ id: id!, data: payload }).unwrap();

      toast.success("Business updated successfully!", { duration: 1000 });
      navigate("/admin/businesses");
    } catch (error) {
      console.error("Error updating business:", error);
      toast.error("Failed to update business. Please try again.", {
        duration: 1000,
      });
    }
  };

  const toggleSelection = (
    userId: string,
    selected: string[],
    setSelected: (value: string[]) => void
  ) => {
    if (selected.includes(userId)) {
      setSelected(selected.filter((id) => id !== userId));
    } else {
      setSelected([...selected, userId]);
    }
  };

  const togglePasswordVisibility = (platform: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  if (isLoadingBusiness) {
    return (
      <div className="space-y-6 mt-2">
        <p>Loading business data...</p>
      </div>
    );
  }

  if (!businessData?.data) {
    return (
      <div className="space-y-6 mt-2">
        <p>Business not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Business</h1>
        <p className="text-muted-foreground">Update business information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">
                Business Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessName"
                {...register("businessName")}
                placeholder="Enter business name"
              />
              {errors.businessName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="typeOfBusiness">
                Type of Business <span className="text-red-500">*</span>
              </Label>
              <BusinessTypeCombobox
                value={selectedBusinessType}
                onValueChange={(value) => {
                  setValue("typeOfBusiness", value);
                  setSelectedBusinessType(value);
                }}
                placeholder="Select business type"
              />
              {errors.typeOfBusiness && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.typeOfBusiness.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>
              </Label>
              <CountryCombobox
                value={selectedCountry}
                onValueChange={(value) => {
                  setValue("country", value);
                  setSelectedCountry(value);
                }}
                placeholder="Select a country"
              />
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="package">
                Package <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("package", value)}
                defaultValue={businessData?.data?.package}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGES.map((pkg) => (
                    <SelectItem key={pkg} value={pkg}>
                      {pkg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.package && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.package.message}
                </p>
              )}
            </div>

            <div>
              <Label>
                Entry Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      setValue("entryDate", selectedDate as Date);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.entryDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.entryDate.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactDetails">Contact Details</Label>
              <Input
                id="contactDetails"
                {...register("contactDetails")}
                placeholder="Phone number"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="Full address"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>

          {/* Facebook */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Facebook</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="facebookUrl">URL</Label>
                <Input
                  id="facebookUrl"
                  {...register("facebookUrl")}
                  placeholder="Facebook URL"
                />
              </div>
              <div>
                <Label htmlFor="facebookUsername">Username</Label>
                <Input
                  id="facebookUsername"
                  {...register("facebookUsername")}
                  placeholder="Username"
                />
              </div>
              <div>
                <Label htmlFor="facebookPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="facebookPassword"
                    type={showPasswords.facebook ? "text" : "password"}
                    {...register("facebookPassword")}
                    placeholder="Password (leave empty to keep current)"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility("facebook")}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  >
                    {showPasswords.facebook ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Instagram */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Instagram</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="instagramUrl">URL</Label>
                <Input
                  id="instagramUrl"
                  {...register("instagramUrl")}
                  placeholder="Instagram URL"
                />
              </div>
              <div>
                <Label htmlFor="instagramUsername">Username</Label>
                <Input
                  id="instagramUsername"
                  {...register("instagramUsername")}
                  placeholder="Username"
                />
              </div>
              <div>
                <Label htmlFor="instagramPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="instagramPassword"
                    type={showPasswords.instagram ? "text" : "password"}
                    {...register("instagramPassword")}
                    placeholder="Password (leave empty to keep current)"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility("instagram")}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  >
                    {showPasswords.instagram ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">WhatsApp</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="whatsAppUrl">URL</Label>
                <Input
                  id="whatsAppUrl"
                  {...register("whatsAppUrl")}
                  placeholder="WhatsApp URL"
                />
              </div>
              <div>
                <Label htmlFor="whatsAppUsername">Username</Label>
                <Input
                  id="whatsAppUsername"
                  {...register("whatsAppUsername")}
                  placeholder="Username"
                />
              </div>
              <div>
                <Label htmlFor="whatsAppPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="whatsAppPassword"
                    type={showPasswords.whatsApp ? "text" : "password"}
                    {...register("whatsAppPassword")}
                    placeholder="Password (leave empty to keep current)"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility("whatsApp")}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  >
                    {showPasswords.whatsApp ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* YouTube */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">YouTube</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="youtubeUrl">URL</Label>
                <Input
                  id="youtubeUrl"
                  {...register("youtubeUrl")}
                  placeholder="YouTube URL"
                />
              </div>
              <div>
                <Label htmlFor="youtubeUsername">Username</Label>
                <Input
                  id="youtubeUsername"
                  {...register("youtubeUsername")}
                  placeholder="Username"
                />
              </div>
              <div>
                <Label htmlFor="youtubePassword">Password</Label>
                <div className="relative">
                  <Input
                    id="youtubePassword"
                    type={showPasswords.youtube ? "text" : "password"}
                    {...register("youtubePassword")}
                    placeholder="Password (leave empty to keep current)"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility("youtube")}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  >
                    {showPasswords.youtube ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Other Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="Website URL"
              />
            </div>
            <div>
              <Label htmlFor="tripAdvisor">TripAdvisor</Label>
              <Input
                id="tripAdvisor"
                {...register("tripAdvisor")}
                placeholder="TripAdvisor URL"
              />
            </div>
            <div>
              <Label htmlFor="googleBusiness">Google Business</Label>
              <Input
                id="googleBusiness"
                {...register("googleBusiness")}
                placeholder="Google Business URL"
              />
            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Assignments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Content Writers */}
            <UserMultiSelect
              label="Assigned Content Writers (CW)"
              users={cwUsers}
              selectedUsers={selectedCW}
              onToggle={(userId) =>
                toggleSelection(userId, selectedCW, setSelectedCW)
              }
              isLoading={isLoadingUsers}
            />

            {/* Content Designers */}
            <UserMultiSelect
              label="Assigned Content Designers (CD)"
              users={cdUsers}
              selectedUsers={selectedCD}
              onToggle={(userId) =>
                toggleSelection(userId, selectedCD, setSelectedCD)
              }
              isLoading={isLoadingUsers}
            />

            {/* Video Editors */}
            <UserMultiSelect
              label="Assigned Video Editors (VE)"
              users={veUsers}
              selectedUsers={selectedVE}
              onToggle={(userId) =>
                toggleSelection(userId, selectedVE, setSelectedVE)
              }
              isLoading={isLoadingUsers}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tags">Tags</Label>
              <textarea
                id="tags"
                {...register("tags")}
                rows={4}
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
              />
            </div>

            <div>
              <Label htmlFor="note">Notes</Label>
              <Textarea
                id="note"
                {...register("note")}
                placeholder="Additional notes"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button type="submit" disabled={isUpdating} className="flex-1">
            {isUpdating ? "Updating..." : "Update Business"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/businesses")}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
