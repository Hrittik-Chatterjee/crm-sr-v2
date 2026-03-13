import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, List, Sparkles } from "lucide-react";
import { useGetAllBusinessesQuery } from "@/redux/features/business/businessApi";
import type { Business } from "@/types";
import { BusinessCard } from "@/components/BusinessCard";
import { BusinessDetailsSheet } from "@/components/BusinessDetailsSheet";

export default function Businesses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isBusinessListOpen, setIsBusinessListOpen] = useState(false);

  // Fetch businesses data with pagination (fetch all for now by setting high limit)
  const {
    data: businessesData,
    isLoading,
    isError,
  } = useGetAllBusinessesQuery({
    page: 1,
    limit: 1000, // Fetch all businesses for client-side filtering
    sortBy: "businessName",
    sortOrder: "asc",
  });

  // Memoize businesses array to prevent unnecessary re-renders
  const businesses: Business[] = useMemo(() => {
    return businessesData?.data || [];
  }, [businessesData]);

  // Filter businesses based on search query
  const filteredBusinesses = useMemo(() => {
    if (!searchQuery) return businesses;

    const query = searchQuery.toLowerCase();
    return businesses.filter(
      (business) =>
        business.businessName.toLowerCase().includes(query) ||
        business.typeOfBusiness.toLowerCase().includes(query) ||
        business.country.toLowerCase().includes(query) ||
        business.package.toLowerCase().includes(query)
    );
  }, [businesses, searchQuery]);

  const handleView = (business: Business) => {
    setSelectedBusiness(business);
    setIsDetailsSheetOpen(true);
  };

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business);
    setIsBusinessListOpen(false);
    setIsDetailsSheetOpen(true);
  };

  return (
    <div className="space-y-6 mt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-linear-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 p-4 sm:p-6 rounded-lg border">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-600" />
            Businesses
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your business accounts and view details
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Show All Businesses Sidebar */}
          <Sheet open={isBusinessListOpen} onOpenChange={setIsBusinessListOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                <List className="h-4 w-4 mr-2" />
                All Businesses
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                >
                  {businesses.length}
                </Badge>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[85vw] sm:w-full sm:max-w-md overflow-hidden flex flex-col p-0">
              <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  All Businesses
                </SheetTitle>
                <SheetDescription>
                  Select a business to view details
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 overflow-auto">
                <div className="p-4 space-y-2">
                  {businesses.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No businesses found
                      </p>
                    </div>
                  ) : (
                    businesses.map((business) => (
                      <button
                        key={business._id}
                        onClick={() => handleBusinessSelect(business)}
                        className="w-full text-left p-4 rounded-lg border-2 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                      >
                        <div className="space-y-2">
                          <h4 className="font-semibold text-base">
                            {business.businessName}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                            >
                              {business.typeOfBusiness}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800"
                            >
                              {business.country}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search businesses by name, type, country, or package..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {filteredBusinesses.length} of {businesses.length} businesses
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">
              Loading businesses...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto">
              <Building2 className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Failed to Load Businesses
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                There was an error loading the businesses. Please try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredBusinesses.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {searchQuery ? "No Businesses Found" : "No Businesses Yet"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Get started by adding your first business"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Business Cards Grid */}
      {!isLoading && !isError && filteredBusinesses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard
              key={business._id}
              business={business}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Business Details Sheet */}
      <BusinessDetailsSheet
        business={selectedBusiness}
        open={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
      />
    </div>
  );
}
