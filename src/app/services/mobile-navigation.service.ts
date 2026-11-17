import { Injectable, signal } from '@angular/core';

export type MobileNavigationMenu =
  | 'main'
  | 'user-filters'
  | 'plan-actions'
  | 'shift-actions'
  | 'warehouse-actions';

@Injectable({ providedIn: 'root' })
export class MobileNavigationService {
  readonly activeMenu = signal<MobileNavigationMenu | null>(null);

  toggle(menu: MobileNavigationMenu): void {
    this.activeMenu.update((active) => (active === menu ? null : menu));
  }

  close(): void {
    this.activeMenu.set(null);
  }
}
