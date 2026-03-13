import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import type { Business } from "@/types";

// Helper to ensure URLs have proper protocol
const ensureProtocol = (url: string): string => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

interface BusinessCardProps {
  business: Business;
  onView: (business: Business) => void;
}

export function BusinessCard({
  business,
  onView,
}: BusinessCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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

  const socialLinks = [
    { icon: Facebook, url: business.socialMediaLinks?.facebook?.url, label: "Facebook" },
    { icon: Instagram, url: business.socialMediaLinks?.instagram?.url, label: "Instagram" },
    { icon: MessageCircle, url: business.socialMediaLinks?.whatsApp?.url, label: "WhatsApp" },
    { icon: Youtube, url: business.socialMediaLinks?.youtube?.url, label: "YouTube" },
    { icon: Globe, url: business.socialMediaLinks?.website, label: "Website" },
  ];

  const activeSocialLinks = socialLinks.filter((link) => link.url && link.url !== "No link" && link.url.trim() !== "");

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {business.businessName}
            </h3>
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
        </div>

        {/* Details Grid */}
        <div className="space-y-3 text-sm">
          {/* Country */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium">Country:</span>
            <span>{business.country}</span>
          </div>

          {/* Entry Date */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="font-medium">Entry Date:</span>
            <span>{formatDate(business.entryDate)}</span>
          </div>

          {/* Contact Details */}
          {business.contactDetails && business.contactDetails !== "N/A" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium">Contact:</span>
              <span>{business.contactDetails}</span>
            </div>
          )}

          {/* Email */}
          {business.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span className="font-medium">Email:</span>
              <span className="text-blue-600 dark:text-blue-400 break-words">
                {business.email}
              </span>
            </div>
          )}

          {/* Address */}
          {business.address && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium">Address:</span>
                <p className="mt-1">{business.address}</p>
              </div>
            </div>
          )}

          {/* Note */}
          {business.note && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <StickyNote className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium">Note:</span>
                <p className="mt-1">{business.note}</p>
              </div>
            </div>
          )}
        </div>

        {/* Social Media Links */}
        {activeSocialLinks.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Social Media Links:
            </p>
            <div className="flex flex-wrap gap-2">
              {activeSocialLinks.map((link) => {
                const Icon = link.icon;

                // Brand-specific colors for each social media platform
                const getBrandColors = (label: string) => {
                  switch (label) {
                    case "Facebook":
                      return "bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:hover:bg-sky-950/60";
                    case "Instagram":
                      return "bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-950/40 dark:text-pink-400 dark:hover:bg-pink-950/60";
                    case "WhatsApp":
                      return "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400 dark:hover:bg-green-950/60";
                    case "YouTube":
                      return "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60";
                    case "Website":
                      return "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950/60";
                    default:
                      return "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/60";
                  }
                };

                return (
                  <a
                    key={link.label}
                    href={ensureProtocol(link.url!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${getBrandColors(link.label)}`}
                  >
                    <Icon className="h-3 w-3" />
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(business)}
            className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 dark:hover:border-blue-600"
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
