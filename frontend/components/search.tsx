"use client";

import {
  SearchIcon,
  Loader2,
  X,
  ArrowUpDown,
  Mail,
  ShieldCheck,
  User,
  Users,
  Shield,
} from "lucide-react";
import * as React from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { debounce } from "lodash";
import { searchUser } from "@/lib/actions/users";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserResult = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "user";
  image_url: string;
};

type SearchCategory = "all" | "admin" | "supervisor" | "user";

export default function Search() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<UserResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] =
    React.useState<SearchCategory>("all");
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Handle keyboard shortcut (Cmd + K / Ctrl + K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      setSelectedIndex(-1);
    } else {
      // Focus the input when dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  // Debounced search function
  const debouncedSearchFn = React.useMemo(
    () =>
      debounce(async (searchTerm: string) => {
        if (searchTerm.length < 2) {
          setResults([]);
          setError(null);
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const { users, error } = await searchUser(searchTerm);
          if (error) {
            setError(error);
          } else {
            setResults(users || []);
            // Reset selected index when new results come in
            setSelectedIndex(-1);
          }
        } catch {
          setError("Failed to fetch results.");
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  // Use the memoized debounced function
  const handleSearch = React.useCallback(
    (searchTerm: string) => {
      debouncedSearchFn(searchTerm);
    },
    [debouncedSearchFn]
  );

  // Clear search input
  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    setError(null);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const filteredResults = getFilteredResults();

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (
      e.key === "Enter" &&
      selectedIndex >= 0 &&
      selectedIndex < filteredResults.length
    ) {
      e.preventDefault();
      handleSelectUser(filteredResults[selectedIndex]);
    }
  };

  // Handle user selection
  const handleSelectUser = (user: UserResult) => {
    // Here you would typically navigate to the user profile or perform an action
    console.log("Selected user:", user);
    setOpen(false);
    // Example: router.push(`/users/${user.id}`);
  };

  // Filter results based on active category
  const getFilteredResults = (): UserResult[] => {
    if (activeCategory === "all") return results;
    return results.filter((user) => user.role === activeCategory);
  };

  // Get role counts
  const getRoleCounts = () => {
    const counts = {
      admin: 0,
      supervisor: 0,
      user: 0,
    };

    results.forEach((user) => {
      if (user.role in counts) {
        counts[user.role as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const filteredResults = getFilteredResults();
  const hasResults = results.length > 0;
  const roleCounts = getRoleCounts();

  // Watch for query changes
  React.useEffect(() => {
    if (query.length >= 2) {
      handleSearch(query);
    } else if (query.length === 0) {
      setResults([]);
      setError(null);
    }
  }, [query, handleSearch]);

  // Get role icon based on user role
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldCheck className="h-3.5 w-3.5 text-primary" />;
      case "supervisor":
        return <Shield className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <User className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  // Get role badge variant based on user role
  const getRoleBadgeVariant = (
    role: string
  ): "default" | "outline" | "secondary" => {
    switch (role) {
      case "admin":
        return "default";
      case "supervisor":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 w-fit items-center rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        onClick={() => setOpen(true)}
        aria-label="Search users"
      >
        <span className="flex grow items-center">
          <SearchIcon
            className="-ms-1 me-3 text-muted-foreground/80"
            size={16}
            aria-hidden="true"
          />
          <span className="font-normal text-muted-foreground/70">
            Search users
          </span>
        </span>
        <kbd className="-me-1 ms-12 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
          <SearchIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <CommandInput
            ref={inputRef}
            placeholder="Search users by name or email..."
            value={query}
            onValueChange={setQuery}
            onKeyDown={handleKeyDown}
            className="flex-1 border-0 outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-muted-foreground/70"
          />
          {query && (
            <button
              onClick={handleClearSearch}
              className="rounded-full p-1 hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {query.length > 0 && hasResults && (
          <div className="border-b">
            <div className="flex items-center gap-2 p-2">
              <Badge
                variant={activeCategory === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveCategory("all")}
              >
                All ({results.length})
              </Badge>
              {roleCounts.admin > 0 && (
                <Badge
                  variant={activeCategory === "admin" ? "default" : "outline"}
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => setActiveCategory("admin")}
                >
                  <ShieldCheck className="h-3 w-3" />
                  <span>Admins ({roleCounts.admin})</span>
                </Badge>
              )}
              {roleCounts.supervisor > 0 && (
                <Badge
                  variant={
                    activeCategory === "supervisor" ? "secondary" : "outline"
                  }
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => setActiveCategory("supervisor")}
                >
                  <Users className="h-3 w-3" />
                  <span>Supervisors ({roleCounts.supervisor})</span>
                </Badge>
              )}
              {roleCounts.user > 0 && (
                <Badge
                  variant={activeCategory === "user" ? "outline" : "outline"}
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => setActiveCategory("user")}
                >
                  <User className="h-3 w-3" />
                  <span>Users ({roleCounts.user})</span>
                </Badge>
              )}
            </div>
          </div>
        )}

        <CommandList
          onKeyDown={handleKeyDown}
          className="max-h-[300px] overflow-y-auto"
        >
          {loading && (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-destructive">
              <p>{error}</p>
            </div>
          )}

          <CommandEmpty className="py-6 text-center text-sm">
            {query.length > 0 ? (
              <div className="space-y-1">
                <p>No results found for &quot;{query}&quot;</p>
                <p className="text-xs text-muted-foreground">
                  Try a different search term
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Start typing to search...</p>
            )}
          </CommandEmpty>

          {hasResults && (
            <CommandGroup
              heading={
                activeCategory === "all"
                  ? "All Users"
                  : `${
                      activeCategory.charAt(0).toUpperCase() +
                      activeCategory.slice(1)
                    }s`
              }
            >
              {filteredResults.map((user, index) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => handleSelectUser(user)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    selectedIndex === index && "bg-accent"
                  )}
                >
                  <Avatar className="h-10 w-10 border">
                    {user.image_url ? (
                      <AvatarImage src={user.image_url} alt={user.name} />
                    ) : (
                      <AvatarFallback>
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{user.name}</span>
                      <Badge
                        variant={getRoleBadgeVariant(user.role)}
                        className="flex items-center gap-1 text-xs"
                      >
                        {getRoleIcon(user.role)}
                        <span>{user.role}</span>
                      </Badge>
                    </div>
                    <span className="flex items-center text-xs text-muted-foreground">
                      <Mail className="mr-1 h-3 w-3" />
                      {user.email}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {query.length > 0 && hasResults && (
            <div className="border-t p-2 text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <ArrowUpDown className="h-3 w-3" />
                <span>to navigate</span>
                <span className="mx-1">•</span>
                <span>enter to select</span>
                <span className="mx-1">•</span>
                <span>esc to close</span>
              </div>
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
