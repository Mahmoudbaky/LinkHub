"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";
import { Switch } from "@/components/ui/switch";
import { UILink } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { UploadButton } from "@/config/uploadthing";
// import Image from "next/image";

const EditLinkForm = ({
  link,
  onSave,
  onCancel,
}: {
  link: UILink;
  onSave: (link: UILink) => Promise<void>;
  onCancel: () => void;
}) => {
  const [editedLink, setEditedLink] = useState(link);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editedLink.title || !editedLink.url) {
      toast("Title and URL are required");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editedLink);
    } catch (error) {
      console.error("Error saving link:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            value={editedLink.title}
            onChange={(e) =>
              setEditedLink({ ...editedLink, title: e.target.value })
            }
            disabled={isSaving}
          />
        </div>
        <div>
          <Label htmlFor="edit-url">URL</Label>
          <Input
            id="edit-url"
            value={editedLink.url}
            onChange={(e) =>
              setEditedLink({ ...editedLink, url: e.target.value })
            }
            disabled={isSaving}
          />
        </div>
        <div>
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            value={editedLink.description || ""}
            onChange={(e) =>
              setEditedLink({
                ...editedLink,
                description: e.target.value || null,
              })
            }
            rows={3}
            disabled={isSaving}
          />
        </div>

        {/* Slider Settings Section */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="slider-switch">Show in Slider</Label>
              <p className="text-sm text-muted-foreground">
                Display this link in the featured slider section
              </p>
            </div>
            <Switch
              id="slider-switch"
              checked={editedLink.appearInSlider || false}
              onCheckedChange={(checked) =>
                setEditedLink({ ...editedLink, appearInSlider: checked })
              }
              disabled={isSaving}
            />
          </div>

          {/* Banner Upload - only shown when slider is enabled */}
          {editedLink.appearInSlider && (
            <div className="space-y-2">
              <Label>Banner Image</Label>
              {editedLink.bannerImage && (
                <div className="relative">
                  <img
                    src={editedLink.bannerImage}
                    alt="Current banner"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      setEditedLink({ ...editedLink, bannerImage: null })
                    }
                    disabled={isSaving}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.url) {
                    setEditedLink({ ...editedLink, bannerImage: res[0].url });
                    toast("Banner image uploaded successfully!");
                  }
                }}
                onUploadError={(error: Error) => {
                  toast(`Upload failed: ${error.message}`);
                }}
                appearance={{
                  button:
                    "ut-ready:bg-primary ut-uploading:cursor-not-allowed ut-ready:bg-primary/90 bg-primary text-primary-foreground hover:bg-primary/90 text-sm",
                  container: "w-full",
                  allowedContent: "text-xs text-muted-foreground",
                }}
              />
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  );
};

export default EditLinkForm;
