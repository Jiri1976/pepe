import { Component, computed, inject, model } from '@angular/core';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { HideWhenAdminDirective } from '../../../directives/hide-when-admin.directive';
import { ProposalsService } from '../../../services/proposals.service';
import { PlansComponent } from '../../../pages/plans/plans.component';
import { AuthService } from '../../../services/auth.service';
import { InactiveUsersComponent } from '../inactive-users/inactive-users.component';
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'app-proposals-nav',
  imports: [HideElementDirective, HideWhenAdminDirective],
  templateUrl: './proposals-nav.component.html',
  styleUrl: './proposals-nav.component.scss'
})
export class ProposalsNavComponent {
  private proposalsService = inject(ProposalsService);
  private authService = inject(AuthService);
  private dialog = inject(Dialog)
  loggedUser = this.authService.getUser();
  plansComponent = inject(PlansComponent);
  calendarTitle = computed(() => this.proposalsService.calendarTitle());
  destination = computed(() => this.proposalsService.destination());
  pdfLoading = model(false);
  isSaving = computed(() => this.proposalsService.isSaving());
  currentCard = computed(() => this.proposalsService.schedules().find(c => c.destination === this.proposalsService.destination()))!;

  openModal() {
    this.dialog.open(InactiveUsersComponent, { disableClose: false });
  }

  onChangeDestination(destination: string) {
    this.proposalsService.destination.set(destination);
  }
}