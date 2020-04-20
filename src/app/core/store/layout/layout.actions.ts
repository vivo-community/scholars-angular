import { Action } from '@ngrx/store';
import { WindowDimensions } from './layout.reducer';

export enum LayoutActionTypes {
  CHECK_WINDOW = '[Layout] check window',
  RESIZE_WINDOW = '[Layout] resize window',
  TOGGLE_NAVBAR = '[Layout] toggle navbar',
  TOGGLE_NAVIGATION = '[Layout] toggle navigation',
  OPEN_SIDEBAR = '[Layout] open sidebar',
  CLOSE_SIDEBAR = '[Layout] close sidebar',
  TOGGLE_SIDEBAR = '[Layout] toggle sidebar',
}

export class CheckWindowAction implements Action {
  readonly type = LayoutActionTypes.CHECK_WINDOW;
  constructor(public payload: { windowDimensions: WindowDimensions }) { }
}

export class ResizeWindowAction implements Action {
  readonly type = LayoutActionTypes.RESIZE_WINDOW;
  constructor(public payload: { windowDimensions: WindowDimensions }) { }
}

export class ToggleNavbarAction implements Action {
  readonly type = LayoutActionTypes.TOGGLE_NAVBAR;
}

export class ToggleNavigationAction implements Action {
  readonly type = LayoutActionTypes.TOGGLE_NAVIGATION;
}

export class OpenSidebarAction implements Action {
  readonly type = LayoutActionTypes.OPEN_SIDEBAR;
}

export class CloseSidebarAction implements Action {
  readonly type = LayoutActionTypes.CLOSE_SIDEBAR;
}

export class ToggleSidebarAction implements Action {
  readonly type = LayoutActionTypes.TOGGLE_SIDEBAR;
}

export type LayoutActions =
  CheckWindowAction |
  ResizeWindowAction |
  ToggleNavbarAction |
  ToggleNavigationAction |
  OpenSidebarAction |
  CloseSidebarAction |
  ToggleSidebarAction;
