"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Edit3,
  Trash2,
  GripVertical,
  ExternalLink,
  Eye,
  BarChart3,
  Settings,
  Copy,
  Link2,
  Check,
  Palette,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import { getUserById } from "@/lib/actions/user.actions";
import {
  createLink,
  editLink,
  deleteLink,
  toggleLinkActivation,
  updateLinkPositions,
} from "@/lib/actions/link.actions";
import { User, Link as LinkType } from "@/types";
import Link from "next/link";
import { UILink } from "@/types";
import EditLinkForm from "@/components/dashboard/EditLinkForm";
import EditLinkThemeForm from "@/components/dashboard/EditLinkThemeForm";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Link Item Component
function SortableLinkItem({
  link,
  onToggleActive,
  onEdit,
  onEditTheme,
  onDelete,
  editingLink,
  editingLinkTheme,
  setEditingLink,
  setEditingLinkTheme,
  handleEditLink,
}: {
  link: UILink;
  onToggleActive: (linkId: string) => void;
  onEdit: (link: UILink) => void;
  onEditTheme: (link: UILink) => void;
  onDelete: (linkId: string) => void;
  editingLink: UILink | null;
  editingLinkTheme: UILink | null;
  setEditingLink: (link: UILink | null) => void;
  setEditingLinkTheme: (link: UILink | null) => void;
  handleEditLink: (link: UILink) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 border rounded-lg bg-card"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-black dark:text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-card-foreground truncate">
            {link.title}
          </h3>
          {!link.isActive && (
            <Badge variant="secondary" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>
        <p className="text-sm text-neutral-600 dark:text-primary/70 truncate">
          {link.url}
        </p>
        {link.description && (
          <p className="text-sm text-neutral-600 mt-1">{link.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-primary/85 dark:text-muted-foreground">
        <BarChart3 className="w-4 h-4" />
        {link.clicks}
      </div>

      <div className="flex items-center gap-2">
        {/* Active Toggle */}
        <Switch
          checked={link.isActive}
          onCheckedChange={() => onToggleActive(link.id)}
        />
        {/*Edit Link Dialog */}
        <Dialog
          open={editingLink?.id === link.id}
          onOpenChange={(open) => {
            if (!open) setEditingLink(null);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => onEdit(link)}>
              <Edit3 className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Link</DialogTitle>
            </DialogHeader>
            <EditLinkForm
              link={link}
              onSave={handleEditLink}
              onCancel={() => setEditingLink(null)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Link Theme Dialog */}
        <Dialog
          open={editingLinkTheme?.id === link.id}
          onOpenChange={(open) => {
            if (!open) setEditingLinkTheme(null);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => onEditTheme(link)}>
              <Palette className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Link Theme</DialogTitle>
            </DialogHeader>
            <EditLinkThemeForm
              link={link}
              onSave={handleEditLink}
              onCancel={() => setEditingLinkTheme(null)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Link */}
        <Button variant="ghost" size="sm" onClick={() => onDelete(link.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [links, setLinks] = useState<UILink[]>([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLink, setEditingLink] = useState<UILink | null>(null);
  const [editingLinkTheme, setEditingLinkTheme] = useState<UILink | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.id) {
        try {
          setLoading(true);
          const userData = await getUserById(session.user.id);
          if (userData) {
            // Create a clean user object for the state
            const cleanUser = {
              id: userData.id,
              email: userData.email,
              username: userData.username,
              name: userData.name,
              bio: userData.bio,
              avatar: userData.avatar,
              theme: userData.theme,
              backgroundColor: userData.backgroundColor,
              textColor: userData.textColor,
              instagram: userData.instagram,
              twitter: userData.twitter,
              linkedin: userData.linkedin,
              youtube: userData.youtube,
              facebook: userData.facebook,
              tiktok: userData.tiktok,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
            };
            setUser(cleanUser);

            // Map database links to UI links
            const uiLinks: UILink[] =
              userData.links?.map((link: UILink) => ({
                id: link.id,
                title: link.title,
                url: link.url,
                description: link.description,
                icon: link.icon,
                position: link.position,
                isActive: link.isActive,
                clicks: link.clicks,
                backgroundColor: link.backgroundColor,
                textColor: link.textColor,
                appearInSlider: link.appearInSlider || false,
                bannerImage: link.bannerImage,
              })) || [];
            setLinks(uiLinks);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session?.user?.id]);

  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
  });

  const profileUrl = `${
    typeof window !== "undefined"
      ? window.location.origin
      : "https://yoursite.com"
  }/${user?.username || ""}`;

  // Show loading state
  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if no user data
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">User not found</p>
          <Button onClick={() => signOut()} className="mt-4">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) {
      toast("Title and URL are required");
      return;
    }

    if (!session?.user?.id) {
      toast("User not authenticated");
      return;
    }

    try {
      const result = await createLink({
        title: newLink.title,
        url: newLink.url,
        description: newLink.description || undefined,
        userId: session.user.id,
      });

      if (result.success && result.data) {
        // Add the new link to the local state
        const newUILink: UILink = {
          id: result.data.id,
          title: result.data.title,
          url: result.data.url,
          description: result.data.description,
          icon: result.data.icon,
          position: result.data.position,
          isActive: result.data.isActive,
          clicks: result.data.clicks,
          backgroundColor: result.data.backgroundColor,
          textColor: result.data.textColor,
          appearInSlider: result.data.appearInSlider || false,
          bannerImage: result.data.bannerImage,
        };

        setLinks([...links, newUILink]);
        setNewLink({ title: "", url: "", description: "" });
        setIsAddingLink(false);
        toast("Your new link has been added successfully.");
      } else {
        toast(result.error || "Failed to create link");
      }
    } catch (error) {
      console.error("Error creating link:", error);
      toast("Failed to create link");
    }
  };

  const handleEditLink = async (link: UILink) => {
    console.log("handleEditLink called with link:", link);
    try {
      const result = await editLink(link.id, {
        title: link.title,
        url: link.url,
        description: link.description || undefined,
        appearInSlider: link.appearInSlider,
        bannerImage: link.bannerImage,
      });

      if (result.success && result.data) {
        // Update the link in local state with the returned data
        const updatedUILink: UILink = {
          id: result.data.id,
          title: result.data.title,
          url: result.data.url,
          description: result.data.description,
          icon: result.data.icon,
          position: result.data.position,
          isActive: result.data.isActive,
          clicks: result.data.clicks,
          backgroundColor: result.data.backgroundColor,
          textColor: result.data.textColor,
          appearInSlider: result.data.appearInSlider || false,
          bannerImage: result.data.bannerImage,
        };

        const updatedLinks = links.map((l) =>
          l.id === link.id ? updatedUILink : l
        );
        setLinks(updatedLinks);
        setEditingLink(null); // Close the dialog
        toast("Your link has been updated successfully.");
      } else {
        toast(result.error || "Failed to update link");
      }
    } catch (error) {
      console.error("Error updating link:", error);
      toast("Failed to update link");
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const result = await deleteLink(linkId);
      if (result.success) {
        setLinks(links.filter((l) => l.id !== linkId));
        toast(result.message);
      } else {
        toast(result.error || "Failed to delete link");
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      toast("Failed to delete link");
    }
  };

  const handleToggleActive = async (linkId: string) => {
    // Find the current link to get its current state
    const currentLink = links.find((l) => l.id === linkId);
    if (!currentLink) {
      toast("Link not found");
      return;
    }

    const newActiveState = !currentLink.isActive;

    console.log("Toggling link:", linkId, "to", newActiveState);

    try {
      const result = await toggleLinkActivation(linkId, newActiveState);
      if (result.success && result.data) {
        // Update the link in local state with the returned data
        const updatedLinks = links.map((l) =>
          l.id === linkId ? { ...l, isActive: result.data!.isActive } : l
        );
        setLinks(updatedLinks);
        toast(result.message || "Link status updated successfully.");
      } else {
        toast(result.error || "Failed to update link status");
      }
    } catch (error) {
      console.error("Error toggling link activation:", error);
      toast("Failed to update link status");
    }
  };

  const copyProfileUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast("Profile URL copied to clipboard.");
    } catch (err) {
      toast("Could not copy URL to clipboard.");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = links.findIndex((link) => link.id === active.id);
    const newIndex = links.findIndex((link) => link.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Update the local state immediately for better UX
      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);

      // Prepare the position updates for the server
      const linkUpdates = newLinks.map((link, index) => ({
        id: link.id,
        position: index,
      }));

      try {
        // Update positions in the database
        const result = await updateLinkPositions(linkUpdates);
        if (result.success) {
          toast("Link order updated successfully.");
        } else {
          // Revert the local state if server update fails
          setLinks(links);
          toast(result.error || "Failed to update link order");
        }
      } catch (error) {
        // Revert the local state if server update fails
        setLinks(links);
        console.error("Error updating link positions:", error);
        toast("Failed to update link order");
      }
    }
  };

  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const activeLinks = links.filter((link) => link.isActive).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <Avatar className="w-18 h-18 ">
              <AvatarImage
                src={user?.avatar || "/placeholder.svg"}
                alt={user?.username || "User Avatar"}
                className="object-cover object-center"
                style={{
                  imageRendering: "auto",
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                }}
              />
              <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {user?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-primary">
                Welcome back, {user.name || user.username}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="cursor-pointer" variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Link href={`/settings`} rel="noopener noreferrer">
              <Button className="cursor-pointer" variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clicks
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary/85 dark:text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalClicks.toLocaleString()}
              </div>
              <p className="text-xs text-neutral-600 dark:text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Links
              </CardTitle>
              <ExternalLink className="h-4 w-4 text-primary/85 dark:text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLinks}</div>
              <p className="text-xs text-neutral-600 dark:text-muted-foreground">
                of {links.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile URL</CardTitle>
              <Link2 className="h-4 w-4 text-primary/85 dark:text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded flex-1 truncate">
                  /{user.username}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyProfileUrl}
                  className="h-6 w-6 p-0"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Links</CardTitle>
                <CardDescription>
                  Manage and organize your links
                </CardDescription>
              </div>
              <Dialog open={isAddingLink} onOpenChange={setIsAddingLink}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Link</DialogTitle>
                    <DialogDescription>
                      Create a new link for your profile
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newLink.title}
                        onChange={(e) =>
                          setNewLink({ ...newLink, title: e.target.value })
                        }
                        placeholder="Enter link title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        value={newLink.url}
                        onChange={(e) =>
                          setNewLink({ ...newLink, url: e.target.value })
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">
                        Description (optional)
                      </Label>
                      <Textarea
                        id="description"
                        value={newLink.description}
                        onChange={(e) =>
                          setNewLink({
                            ...newLink,
                            description: e.target.value,
                          })
                        }
                        placeholder="Brief description of this link"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingLink(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddLink}>Add Link</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {links.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted mb-4">No links yet</p>
                  <Button onClick={() => setIsAddingLink(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Link
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={links.map((link) => link.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {links
                      .sort((a, b) => a.position - b.position)
                      .map((link) => (
                        <SortableLinkItem
                          key={link.id}
                          link={link}
                          onToggleActive={handleToggleActive}
                          onEdit={setEditingLink}
                          onEditTheme={setEditingLinkTheme}
                          onDelete={handleDeleteLink}
                          editingLink={editingLink}
                          editingLinkTheme={editingLinkTheme}
                          setEditingLink={setEditingLink}
                          setEditingLinkTheme={setEditingLinkTheme}
                          handleEditLink={handleEditLink}
                        />
                      ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
