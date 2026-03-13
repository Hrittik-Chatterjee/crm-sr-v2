/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Globe,
  Package,
  StickyNote,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  ExternalLink,
  Eye,
  EyeOff,
  User,
  Key,
} from "lucide-react";
import type { Business } from "@/types";

interface BusinessDetailsSheetProps {
  business: Business | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper to ensure URLs have proper protocol
const ensureProtocol = (url: string): string => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

export function BusinessDetailsSheet({
  business,
  open,
  onOpenChange,
}: BusinessDetailsSheetProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});

  if (!business) return null;

  const togglePasswordVisibility = (platform: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPackageBadgeColor = (packageName: string) => {
    switch (packageName.toLowerCase()) {
      case "elite growth plan":
        return "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800";
      case "premium growth plan":
        return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
      case "starter growth plan":
        return "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-950/40 dark:text-gray-400 dark:border-gray-800";
    }
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    isLink = false,
    iconColor = "text-blue-600 dark:text-blue-400",
  }: {
    icon: any;
    label: string;
    value?: string;
    isLink?: boolean;
    iconColor?: string;
  }) => {
    if (!value || value === "N/A") return null;

    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          {label}
        </Label>
        <div className="rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
          {isLink ? (
            <a
              href={ensureProtocol(value)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {value}
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <p className="whitespace-pre-wrap">{value}</p>
          )}
        </div>
      </div>
    );
  };

  const SocialMediaCredentials = ({
    icon: Icon,
    label,
    platform,
    credentials,
    iconColor = "text-blue-600 dark:text-blue-400",
  }: {
    icon: any;
    label: string;
    platform: string;
    credentials?: {
      url?: string;
      username?: string;
      password?: string;
    };
    iconColor?: string;
  }) => {
    if (
      !credentials ||
      (!credentials.url && !credentials.username && !credentials.password)
    ) {
      return null;
    }

    const hasCredentials = credentials.username || credentials.password;

    return (
      <div className="space-y-2 min-w-0">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          {label}
        </Label>
        <div className="rounded-md border border-input bg-muted/30 p-3 space-y-3 overflow-hidden">
          {/* URL */}
          {credentials.url && (
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
              <a
                href={ensureProtocol(credentials.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1"
              >
                <span>{label}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}

          {/* Username */}
          {credentials.username && (
            <div className="flex items-center gap-2 min-w-0">
              <User className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium shrink-0">Username:</span>
              <code className="text-sm bg-background px-2 py-0.5 rounded truncate">
                {credentials.username}
              </code>
            </div>
          )}

          {/* Password */}
          {credentials.password && (
            <div className="flex items-center gap-2 min-w-0">
              <Key className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium shrink-0">Password:</span>
              <code className="text-sm bg-background px-2 py-0.5 rounded flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {visiblePasswords[platform] ? credentials.password : "••••••••"}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => togglePasswordVisibility(platform)}
                className="h-7 w-7 p-0 shrink-0"
                title={
                  visiblePasswords[platform] ? "Hide password" : "Show password"
                }
              >
                {visiblePasswords[platform] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {!hasCredentials && credentials.url && (
            <p className="text-xs text-muted-foreground italic">
              No login credentials stored
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[85vw] sm:w-full sm:max-w-2xl overflow-hidden flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="space-y-3">
            <SheetTitle className="text-2xl font-bold">
              {business.businessName}
            </SheetTitle>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
              >
                <Building2 className="h-3 w-3 mr-1" />
                {business.typeOfBusiness}
              </Badge>
              <Badge
                variant="outline"
                className={getPackageBadgeColor(business.package)}
              >
                <Package className="h-3 w-3 mr-1" />
                {business.package}
              </Badge>
            </div>
          </div>
          <SheetDescription>
            View complete business information
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-600" />
                Basic Information
              </h3>

              <InfoRow
                icon={Globe}
                label="Country"
                value={business.country}
                iconColor="text-emerald-600 dark:text-emerald-400"
              />
              <InfoRow
                icon={Calendar}
                label="Entry Date"
                value={formatDate(business.entryDate)}
                iconColor="text-violet-600 dark:text-violet-400"
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-600" />
                Contact Information
              </h3>

              <InfoRow
                icon={Phone}
                label="Contact Details"
                value={business.contactDetails}
                iconColor="text-blue-600 dark:text-blue-400"
              />
              <InfoRow
                icon={Mail}
                label="Email"
                value={business.email}
                isLink={true}
                iconColor="text-rose-600 dark:text-rose-400"
              />
              <InfoRow
                icon={MapPin}
                label="Address"
                value={business.address}
                iconColor="text-orange-600 dark:text-orange-400"
              />
            </div>

            {/* Social Media Links & Credentials */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-600" />
                Social Media Links & Credentials
              </h3>

              <SocialMediaCredentials
                icon={Facebook}
                label="Facebook"
                platform="facebook"
                credentials={business.socialMediaLinks?.facebook}
                iconColor="text-sky-600 dark:text-sky-400"
              />
              <SocialMediaCredentials
                icon={Instagram}
                label="Instagram"
                platform="instagram"
                credentials={business.socialMediaLinks?.instagram}
                iconColor="text-pink-600 dark:text-pink-400"
              />
              <SocialMediaCredentials
                icon={MessageCircle}
                label="WhatsApp"
                platform="whatsapp"
                credentials={business.socialMediaLinks?.whatsApp}
                iconColor="text-green-600 dark:text-green-400"
              />
              <SocialMediaCredentials
                icon={Youtube}
                label="YouTube"
                platform="youtube"
                credentials={business.socialMediaLinks?.youtube}
                iconColor="text-red-600 dark:text-red-400"
              />
              <InfoRow
                icon={Globe}
                label="Website"
                value={business.socialMediaLinks?.website}
                isLink={true}
                iconColor="text-indigo-600 dark:text-indigo-400"
              />
              <InfoRow
                icon={Globe}
                label="TripAdvisor"
                value={business.socialMediaLinks?.tripAdvisor}
                isLink={true}
                iconColor="text-teal-600 dark:text-teal-400"
              />
              <InfoRow
                icon={Globe}
                label="Google Business"
                value={business.socialMediaLinks?.googleBusiness}
                isLink={true}
                iconColor="text-cyan-600 dark:text-cyan-400"
              />
            </div>

            {/* Additional Notes */}
            {business.note && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-blue-600" />
                  Additional Notes
                </h3>

                <InfoRow
                  icon={StickyNote}
                  label="Note"
                  value={business.note}
                  iconColor="text-amber-600 dark:text-amber-400"
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
