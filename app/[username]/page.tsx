import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
  Settings,
} from "lucide-react";
import { getUserByUserName } from "@/lib/actions/user.actions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Adjust path to your auth config
import Link from "next/link";
import { ClientThemeToggle } from "@/components/client-theme-toggle";
import { UILink } from "@/types";

export default async function ProfilePage(props: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await props.params;
  const session = await getServerSession(authOptions);
  const user = await getUserByUserName(username); // In real app: await getUserByUsername(params.username)

  // Check if the current session user is viewing their own profile
  const isOwnProfile = session?.user?.username === username;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            User not found
          </h1>
          <p className="text-gray-600">
            {"The profile you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  const socialLinks = [
    {
      platform: "instagram",
      url: user.instagram,
      icon: Instagram,
      label: "Instagram",
    },
    { platform: "twitter", url: user.twitter, icon: Twitter, label: "Twitter" },
    {
      platform: "linkedin",
      url: user.linkedin,
      icon: Linkedin,
      label: "LinkedIn",
    },
    { platform: "youtube", url: user.youtube, icon: Youtube, label: "YouTube" },
    {
      platform: "facebook",
      url: user.facebook,
      icon: Facebook,
      label: "Facebook",
    },
    {
      platform: "tiktok",
      url: user.tiktok,
      icon: ExternalLink,
      label: "TikTok",
    },
  ].filter((link) => link.url);

  const activeLinks = user.links
    .filter((link: UILink) => link.isActive)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Show dashboard button if user is logged in and viewing their own profile */}
        <div className="flex mb-4 w-full items-center justify-between gap-2">
          {isOwnProfile && (
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="w-full cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          )}
          <ClientThemeToggle />
        </div>

        {/* Profile Header */}
        <div className="text-center mb-8">
          <Avatar className="w-24 h-24 ring-2 mb-4 mx-auto ring-gray-200 ring-offset-2">
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

          <h1 className="text-2xl font-bold text-black dark:text-white mb-1 text-balance">
            {user.name}
          </h1>

          <p className="text-sm text-primary mb-3">@{user.username}</p>

          {user.bio && (
            <p className="text-primary leading-relaxed text-pretty">
              {user.bio}
            </p>
          )}
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mb-8">
            {socialLinks.map(({ platform, url, icon: Icon, label }) => {
              return (
                <a
                  key={platform}
                  href={url || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-card hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        )}

        {/* Links */}
        <div className="space-y-4">
          {activeLinks.map((link) => (
            <Card key={link.id} className="p-0 overflow-hidden">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: link.backgroundColor || undefined,
                }}
                className={`block p-4 hover:bg-accent hover:text-accent-foreground transition-colors duration-200 group`}
              >
                <div className="flex items-center">
                  <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
                    {/* The logo */}
                    {link.icon ? (
                      <img src={link.icon} alt="logo" className="w-7 h-7" />
                    ) : (
                      <></>
                    )}

                    {/* The Text */}
                    <h3
                      style={{
                        color: link.textColor || undefined,
                      }}
                      className={`font-semibold text-card-foreground group-hover:text-accent-foreground mb-1 text-balance`}
                    >
                      {link.title}
                    </h3>
                  </div>
                </div>
              </a>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-sm text-gray-600 dark:text-white">
            Create your own link page from{" "}
            <span>
              <Link href={"/signup"} className="underline font-medium">
                here
              </Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
