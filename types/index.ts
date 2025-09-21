export type User = {
  id: string;
  email: string;
  username: string;
  password: string;
  name: string | null;
  bio: string | null;
  avatar: string | null; // URL to profile image
  createdAt: Date;
  updatedAt: Date;

  // User customization options
  theme: string; // Theme for their page
  backgroundColor: string | null; // Custom background color
  textColor: string | null; // Custom text color

  // Social links (optional)
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  youtube: string | null;
  facebook: string | null;
  tiktok: string | null;

  // Relations
  links: Link[];
  Session: Session[];
};

export type Link = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null; // URL to custom icon or icon name
  position: number; // For ordering links
  isActive: boolean;
  clicks: number; // Track click count
  createdAt: Date;
  updatedAt: Date;

  // Relations
  userId: string;
  user: User;
};

export type Session = {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: User;
};
