import {
  BookOpen, Bot, Brush, Briefcase, Camera, Cloud, Code, Coffee, Cpu, Database, Film, Folder,
  Gamepad2, GraduationCap, Globe, Headphones, Heart, House, Layers, Mail, MessageSquare, Music,
  Newspaper, Palette, PenTool, Rocket, ShoppingBag, Star, Terminal, Video, Wrench, Zap,
  type LucideIcon,
} from 'lucide-react';

export interface WorkspaceIconOption {
  id: string;
  label: string;
  Icon: LucideIcon;
}

export const WORKSPACE_ICONS: WorkspaceIconOption[] = [
  { id: 'layers', label: 'Layers', Icon: Layers },
  { id: 'code', label: 'Code', Icon: Code },
  { id: 'terminal', label: 'Terminal', Icon: Terminal },
  { id: 'cpu', label: 'Hardware', Icon: Cpu },
  { id: 'database', label: 'Database', Icon: Database },
  { id: 'bot', label: 'AI', Icon: Bot },
  { id: 'wrench', label: 'Tools', Icon: Wrench },
  { id: 'palette', label: 'Design', Icon: Palette },
  { id: 'pen-tool', label: 'Illustration', Icon: PenTool },
  { id: 'brush', label: 'Art', Icon: Brush },
  { id: 'camera', label: 'Photo', Icon: Camera },
  { id: 'film', label: 'Film', Icon: Film },
  { id: 'video', label: 'Video', Icon: Video },
  { id: 'music', label: 'Music', Icon: Music },
  { id: 'headphones', label: 'Audio', Icon: Headphones },
  { id: 'gamepad', label: 'Gaming', Icon: Gamepad2 },
  { id: 'book-open', label: 'Reading', Icon: BookOpen },
  { id: 'graduation-cap', label: 'Study', Icon: GraduationCap },
  { id: 'newspaper', label: 'News', Icon: Newspaper },
  { id: 'briefcase', label: 'Work', Icon: Briefcase },
  { id: 'mail', label: 'Mail', Icon: Mail },
  { id: 'message-square', label: 'Chat', Icon: MessageSquare },
  { id: 'globe', label: 'Web', Icon: Globe },
  { id: 'cloud', label: 'Cloud', Icon: Cloud },
  { id: 'folder', label: 'Files', Icon: Folder },
  { id: 'shopping-bag', label: 'Shopping', Icon: ShoppingBag },
  { id: 'house', label: 'Home', Icon: House },
  { id: 'coffee', label: 'Break', Icon: Coffee },
  { id: 'heart', label: 'Personal', Icon: Heart },
  { id: 'star', label: 'Favorites', Icon: Star },
  { id: 'zap', label: 'Quick', Icon: Zap },
  { id: 'rocket', label: 'Launch', Icon: Rocket },
];

export const DEFAULT_ICON_ID = 'layers';

export const WORKSPACE_ICON_COMPONENTS: Record<string, LucideIcon> = Object.fromEntries(
  WORKSPACE_ICONS.map(({ id, Icon }) => [id, Icon]),
);
