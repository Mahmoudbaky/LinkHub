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
import { UploadButton } from "@/config/uploadthing";
import { editLinkTheme } from "@/lib/actions/link.actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { linkThemeSchema } from "@/lib/validators";

const EditLinkThemeForm = ({
  link,
  onSave,
  onCancel,
}: {
  link: UILink;
  onSave: (link: UILink) => Promise<void>;
  onCancel: () => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof linkThemeSchema>>({
    resolver: zodResolver(linkThemeSchema),
    defaultValues: {
      backgroundColor: link.backgroundColor || "",
      textColor: link.textColor || "",
      icon: link.icon || "",
    },
  });

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { isSubmitting },
  } = form;
  const currentIcon = watch("icon");

  const onSubmit = async (data: z.infer<typeof linkThemeSchema>) => {
    try {
      const result = await editLinkTheme(link.id, {
        backgroundColor: data.backgroundColor || null,
        textColor: data.textColor || null,
        icon: data.icon || null,
      });

      if (result.success) {
        toast.success(result.message || "Link theme updated successfully");
        await onSave(result.data!);
      } else {
        toast.error(result.error || "Failed to update link theme");
      }
    } catch (error) {
      console.error("Error updating link theme:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="backgroundColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Color</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      {...field}
                      value={field.value || "#ffffff"}
                      className="w-16 h-10 p-1 rounded border"
                      disabled={isSubmitting || isUploading}
                    />
                    <Input
                      type="text"
                      {...field}
                      value={field.value || ""}
                      placeholder="#ffffff or transparent"
                      className="flex-1"
                      disabled={isSubmitting || isUploading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="textColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Color</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      {...field}
                      value={field.value || "#000000"}
                      className="w-16 h-10 p-1 rounded border"
                      disabled={isSubmitting || isUploading}
                    />
                    <Input
                      type="text"
                      {...field}
                      value={field.value || ""}
                      placeholder="#000000"
                      className="flex-1"
                      disabled={isSubmitting || isUploading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {currentIcon && (
                      <div className="flex items-center space-x-2 p-2 border rounded">
                        <img
                          src={currentIcon}
                          alt="Current icon"
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="text-sm text-gray-600 flex-1 truncate">
                          {currentIcon}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setValue("icon", "")}
                          disabled={isSubmitting || isUploading}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        setIsUploading(false);
                        if (res?.[0]?.url) {
                          setValue("icon", res[0].url);
                          toast.success("Icon uploaded successfully!");
                        }
                      }}
                      onUploadError={(error: Error) => {
                        setIsUploading(false);
                        toast.error(`Upload failed: ${error.message}`);
                      }}
                      onUploadBegin={() => {
                        setIsUploading(true);
                      }}
                      className="ut-button:bg-primary ut-button:ut-uploading:bg-primary/50"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting
                ? "Saving..."
                : isUploading
                ? "Uploading..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default EditLinkThemeForm;
