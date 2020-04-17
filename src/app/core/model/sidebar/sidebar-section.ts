import { SidebarItem } from './';

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
  collapsible: boolean;
  collapsed: boolean;
  classes?: string;
}
