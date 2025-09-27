"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  User as UserIcon,
  Palette,
  Shield,
  Bell,
  Trash2,
  Upload,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Eye,
  ArrowLeft,
  Facebook,
  TvMinimalPlay,
} from "lucide-react";
import NextLink from "next/link";
import { toast } from "sonner";
import { User } from "@/types";
import { useSession, signOut } from "next-auth/react";
import {
  getUserById,
  updateUserProfileInfo,
  updateUserSocialLinks,
} from "@/lib/actions/user.actions";
import { UploadButton } from "@/config/uploadthing";
import {
  updateUserProfileSchema,
  updateUserSocialLinksSchema,
} from "@/lib/validators";

type UserProfileFormData = z.infer<typeof updateUserProfileSchema>;
type UserSocialLinksFormData = z.infer<typeof updateUserSocialLinksSchema>;

// Mock user data
const mockUser = {
  id: "1",
  username: "johndoe",
  name: "John Doe",
  email: "john@example.com",
  bio: "Digital creator, entrepreneur, and coffee enthusiast. Sharing my journey and favorite resources.",
  avatar: "/placeholder.svg?key=119qd",
  theme: "default",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  instagram: "https://instagram.com/johndoe",
  twitter: "https://twitter.com/johndoe",
  linkedin: "https://linkedin.com/in/johndoe",
  youtube: "",
  facebook: "",
  tiktok: "",
  emailNotifications: true,
  profilePublic: true,
  showClickCounts: false,
};

export default function SettingsPage() {
  // const [user, setUser] = useState(mockUser);
  const { data: session } = useSession();
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<string>("");

  console.log("Session data:", session);

  // Initialize React Hook Form for Profile
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
      avatar: "",
    },
  });

  // Initialize React Hook Form for Social Links
  const {
    register: registerSocial,
    handleSubmit: handleSubmitSocial,
    formState: { errors: socialErrors, isSubmitting: isSubmittingSocial },
    reset: resetSocial,
  } = useForm<UserSocialLinksFormData>({
    resolver: zodResolver(updateUserSocialLinksSchema),
    defaultValues: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      tiktok: "",
      youtube: "",
    },
  });

  const watchedBio = watch("bio");
  const watchedAvatar = watch("avatar");

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.id) {
        try {
          // setLoading(true);
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

            // Populate form with user data
            reset({
              name: userData.name || "",
              bio: userData.bio || "",
              avatar: userData.avatar || "",
            });

            // Populate social links form
            resetSocial({
              facebook: userData.facebook || "",
              twitter: userData.twitter || "",
              instagram: userData.instagram || "",
              linkedin: userData.linkedin || "",
              tiktok: userData.tiktok || "",
              youtube: userData.youtube || "",
            });

            // Map database links to UI links
            // const uiLinks: UILink[] =
            //   userData.links?.map((link) => ({
            //     id: link.id,
            //     title: link.title,
            //     url: link.url,
            //     description: link.description,
            //     icon: link.icon,
            //     position: link.position,
            //     isActive: link.isActive,
            //     clicks: link.clicks,
            //   })) || [];
            // setLinks(uiLinks);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        } finally {
          // setLoading(false);
        }
      } else {
        // setLoading(false);
      }
    };

    fetchUser();
  }, [session?.user?.id, reset, resetSocial]);

  const handleSave = async (section: string) => {
    setIsLoading(true);
    // Mock save - in real app this would call your API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast(`Your ${section} settings have been updated successfully.`);
  };

  // Form submission handler
  const onSubmitProfile = async (data: UserProfileFormData) => {
    if (!session?.user?.id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      await updateUserProfileInfo(
        session.user.id,
        data.name,
        data.bio || "",
        data.avatar || ""
      );

      // Update local user state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: data.name,
              bio: data.bio || "",
              avatar: data.avatar || "",
            }
          : null
      );

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  // Social links form submission handler
  const onSubmitSocialLinks = async (data: UserSocialLinksFormData) => {
    if (!session?.user?.id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      await updateUserSocialLinks(
        session.user.id,
        data.facebook || "",
        data.twitter || "",
        data.instagram || "",
        data.linkedin || "",
        data.tiktok || "",
        data.youtube || ""
      );

      // Update local user state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              facebook: data.facebook || "",
              twitter: data.twitter || "",
              instagram: data.instagram || "",
              linkedin: data.linkedin || "",
              tiktok: data.tiktok || "",
              youtube: data.youtube || "",
            }
          : null
      );

      toast.success("Social links updated successfully!");
    } catch (error) {
      console.error("Failed to update social links:", error);
      toast.error("Failed to update social links. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    toast("Account deletion would be processed here.");
  };

  const themes = [
    { value: "default", label: "Default" },
    { value: "minimal", label: "Minimal" },
    { value: "gradient", label: "Gradient" },
    { value: "dark", label: "Dark" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-gray-600">
              Manage your account and profile settings
            </p>
          </div>
          <NextLink href="/">
            <Button className="cursor-pointer" variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </NextLink>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            {/* <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger> */}
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form
                  onSubmit={handleSubmit(onSubmitProfile)}
                  className="space-y-6"
                >
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20 ring-2 ring-gray-200 ring-offset-2">
                      <AvatarImage
                        src={
                          watchedAvatar || user?.avatar || "/placeholder.svg"
                        }
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
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          console.log(
                            "********Upload complete:********",
                            res[0].url
                          );
                          if (res) {
                            // Optionally add parameters for better quality
                            const imageUrl = res[0].url;
                            setValue("avatar", imageUrl);
                          }
                        }}
                        onUploadError={(error: Error) => {
                          console.error("Upload failed:", error);
                          toast.error("Upload failed. Please try again.");
                        }}
                        className="mb-2"
                        appearance={{
                          button:
                            "bg-black hover:bg-gray-800 transition-colors",
                          container: "flex flex-col items-center gap-1",
                          allowedContent: "text-xs text-muted-foreground",
                        }}
                        content={{
                          button: (
                            <div className="flex items-center">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Photo
                            </div>
                          ),
                          allowedContent: "Recommended: Square image, max 2MB",
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={user?.username || ""}
                        disabled
                        className="opacity-50"
                      />
                      <p className="text-xs text-muted">
                        yoursite.com/{user?.username}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...register("bio")}
                      rows={3}
                      placeholder="Tell people about yourself..."
                      className={errors.bio ? "border-red-500" : ""}
                    />
                    {errors.bio && (
                      <p className="text-sm text-red-500">
                        {errors.bio.message}
                      </p>
                    )}
                    <p className="text-xs text-muted">
                      {watchedBio?.length || 0}/160 characters
                    </p>
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Add your social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={handleSubmitSocial(onSubmitSocialLinks)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="instagram"
                        className="flex items-center gap-2"
                      >
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        {...registerSocial("instagram")}
                        placeholder="https://instagram.com/username"
                        className={
                          socialErrors.instagram ? "border-red-500" : ""
                        }
                      />
                      {socialErrors.instagram && (
                        <p className="text-sm text-red-500">
                          {socialErrors.instagram.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="twitter"
                        className="flex items-center gap-2"
                      >
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </Label>
                      <Input
                        id="twitter"
                        {...registerSocial("twitter")}
                        placeholder="https://twitter.com/username"
                        className={socialErrors.twitter ? "border-red-500" : ""}
                      />
                      {socialErrors.twitter && (
                        <p className="text-sm text-red-500">
                          {socialErrors.twitter.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="linkedin"
                        className="flex items-center gap-2"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        {...registerSocial("linkedin")}
                        placeholder="https://linkedin.com/in/username"
                        className={
                          socialErrors.linkedin ? "border-red-500" : ""
                        }
                      />
                      {socialErrors.linkedin && (
                        <p className="text-sm text-red-500">
                          {socialErrors.linkedin.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="youtube"
                        className="flex items-center gap-2"
                      >
                        <Youtube className="w-4 h-4" />
                        YouTube
                      </Label>
                      <Input
                        id="youtube"
                        {...registerSocial("youtube")}
                        placeholder="https://youtube.com/@username"
                        className={socialErrors.youtube ? "border-red-500" : ""}
                      />
                      {socialErrors.youtube && (
                        <p className="text-sm text-red-500">
                          {socialErrors.youtube.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="facebook"
                        className="flex items-center gap-2"
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </Label>
                      <Input
                        id="facebook"
                        {...registerSocial("facebook")}
                        placeholder="https://facebook.com/username"
                        className={
                          socialErrors.facebook ? "border-red-500" : ""
                        }
                      />
                      {socialErrors.facebook && (
                        <p className="text-sm text-red-500">
                          {socialErrors.facebook.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="tiktok"
                        className="flex items-center gap-2"
                      >
                        <TvMinimalPlay className="w-4 h-4" />
                        TikTok
                      </Label>
                      <Input
                        id="tiktok"
                        {...registerSocial("tiktok")}
                        placeholder="https://tiktok.com/@username"
                        className={socialErrors.tiktok ? "border-red-500" : ""}
                      />
                      {socialErrors.tiktok && (
                        <p className="text-sm text-red-500">
                          {socialErrors.tiktok.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmittingSocial}>
                    {isSubmittingSocial ? "Saving..." : "Save Social Links"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme & Colors</CardTitle>
                <CardDescription>
                  Customize how your profile looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={user?.theme}
                    onValueChange={(value) =>
                      setUser({ ...user, theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={user?.backgroundColor as string}
                        onChange={(e) =>
                          setUser({ ...user, backgroundColor: e.target.value })
                        }
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        value={user?.backgroundColor as string}
                        onChange={(e) =>
                          setUser({ ...user, backgroundColor: e.target.value })
                        }
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={user?.textColor as string}
                        onChange={(e) =>
                          setUser({ ...user, textColor: e.target.value })
                        }
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        value={user?.textColor as string}
                        onChange={(e) =>
                          setUser({ ...user, textColor: e.target.value })
                        }
                        placeholder="#1f2937"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Eye className="w-5 h-5 text-muted" />
                  <div>
                    <p className="font-medium">Preview</p>
                    <p className="text-sm text-muted">
                      See how your profile will look
                    </p>
                  </div>
                  <NextLink href={`/${user?.username}`} className="ml-auto">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </NextLink>
                </div>

                <Button
                  onClick={() => handleSave("appearance")}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Appearance"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          {/* <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Visibility</CardTitle>
                <CardDescription>
                  Control who can see your profile and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted">
                      Make your profile visible to everyone
                    </p>
                  </div>
                  <Switch
                    checked={user?.pub}
                    onCheckedChange={(checked) =>
                      setUser({ ...user, profilePublic: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Click Counts</Label>
                    <p className="text-sm text-muted">
                      Display click statistics on your links
                    </p>
                  </div>
                  <Switch
                    checked={user.showClickCounts}
                    onCheckedChange={(checked) =>
                      setUser({ ...user, showClickCounts: checked })
                    }
                  />
                </div>

                <Button
                  onClick={() => handleSave("privacy")}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email}
                    onChange={(e) =>
                      setUser({ ...user, email: e.target.value })
                    }
                  />
                </div>

                <Separator />

                {/* <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted">
                      Receive updates about your account
                    </p>
                  </div>
                  <Switch
                    checked={user.emailNotifications}
                    onCheckedChange={(checked) =>
                      setUser({ ...user, emailNotifications: checked })
                    }
                  />
                </div> */}

                <Button
                  onClick={() => handleSave("account")}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Account Settings"}
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
