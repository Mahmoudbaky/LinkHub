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
import { UILink } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

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
