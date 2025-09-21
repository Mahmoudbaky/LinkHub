"use client";

import { Card } from "@/components/ui/card";
import { UILink } from "@/types";
import { incrementLinkClicks } from "@/lib/actions/link.actions";

interface ClickableLinkCardProps {
  link: UILink;
}

export function ClickableLinkCard({ link }: ClickableLinkCardProps) {
  const handleLinkClick = async () => {
    try {
      const result = await incrementLinkClicks(link.id);
      if (result.success) {
        console.log("Link clicks incremented successfully");
      } else {
        console.error("Failed to increment link clicks");
      }
    } catch (error) {
      console.error("Error incrementing link clicks:", error);
    }
  };

  return (
    <Card onClick={handleLinkClick} className="p-0 overflow-hidden">
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
  );
}
