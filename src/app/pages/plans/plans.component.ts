import { Component, computed, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { ProposalsComponent } from '../../components/proposals/proposals.component';
import { ProposalsService } from '../../services/proposals.service';
import { ConfirmService } from '../../services/confirm.service';
import { OverlayModule } from 'primeng/overlay';
import { AlertService } from '../../services/alert.service';
import { tap } from 'rxjs';
import { ProposalsNavComponent } from "../../components/proposals/proposals-nav/proposals-nav.component";
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-plans',
  imports: [
    ConfirmComponent,
    ProposalsComponent,
    DialogModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    DatePicker,
    OverlayModule,
    ProposalsNavComponent,
    DragDropModule
  ],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss'
})
export class PlansComponent {
  private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  private authService = inject(AuthService);
  private proposalsService = inject(ProposalsService);
  private confirmService = inject(ConfirmService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  defaultDate = new Date(new Date().getFullYear(), new Date().getMonth());
  maxDate: Date = new Date(new Date().getFullYear(), new Date().getMonth());
  isLoading = computed(() => this.proposalsService.isProposalLoading());
  user = computed(() => this.authService.user());
  nothingChanched = computed(() => this.proposalsService.nothingChanged());
  pdfLoading = signal(false);
  calendar = viewChild<DatePicker>('calendar');

  toggleCalendar() {
    if (this.calendar) {
      if (this.calendar()?.overlayVisible) {
        this.calendar()?.hideOverlay();
        this.calendar()?.cd.detectChanges();
      } else {
        this.calendar()?.showOverlay();
        this.calendar()?.cd.detectChanges();
      }
    }
  }

  onSelectMonth() {
    if (!this.nothingChanched()) {
      this.confirmService.confirm('Nejsou uloženy změny, chceš pokračovat?')
        .then((confirmed) => {
          if (confirmed) {
            this.selectMonth();
          }
        });
    } else {
      this.selectMonth();
    }
  }

  onSave() {
    this.proposalsService.isSaving.set(true);
    this.proposalsService.onSave();
  }

  onDelete() {
    let card = this.proposalsService.schedules().find(c => c.destination === this.proposalsService.destination());
    this.confirmService.confirm(`Odstranit plán směn pro - ${card?.destination} - ${card?.monthYearName.toLowerCase()}?`)
      .then((confirmed) => {
        if (confirmed) {
          this.proposalsService.onDelete();
        }
      });
  }

  onReset() {
    if (!this.nothingChanched()) {
      this.confirmService.confirm('Nejsou uloženy změny, chceš pokračovat?')
        .then((confirmed) => {
          if (confirmed) {
            this.proposalsService.uploadSchedulesShifts();
          }
        });
    } else {
      this.proposalsService.uploadSchedulesShifts();
    }
  }

  onOpenPDF() {
    if (!this.nothingChanched()) {
      this.confirmService.confirm('Nejsou uloženy změny, chceš pokračovat?')
        .then((confirmed) => {
          if (confirmed) {
            this.getPDF();
          }
        });
    } else {
      this.getPDF();
    }
  }

  isPassedMonth() {
    let card = this.proposalsService.schedules().find(c => c.destination === this.proposalsService.destination());
    let today = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let _monthYear = card!.monthYear.length === 5 ? '0' + card!.monthYear : card!.monthYear;

    let day = new Date(parseInt(_monthYear.substring(2, 6)), parseInt(_monthYear.substring(0, 2)) - 1, 1);
    if (day >= today) {
      return false;
    }
    return true;
  }

  private getPDF() {
    this.pdfLoading.set(true);
    const card = this.proposalsService.schedules().find(c => c.destination === this.proposalsService.destination())!; // check for shift count???
    const subscription = this.proposalsService.uploadPDF(card, this.user().role).pipe(
      tap(response => {
        if (response === null) {
          this.pdfLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.pdfLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else {
          this.pdfLoading.set(false);
          const binary = atob(response.result);
          const uint8Array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            uint8Array[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([uint8Array], { type: 'application/pdf' });
          var url = window.URL.createObjectURL(blob);
          const a = document.createElement('a')
          a.href = url;
          a.download = `Směny - ${card?.destination} - ${card?.monthYearName.toLowerCase()}`;
          a.click();
          URL.revokeObjectURL(url);
        }
      })
    ).subscribe({
      error: () => this.proposalsService.isProposalLoading.set(false)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private selectMonth() {
    let date = this.calendar()?.value;
    let monthYear = this.MONTHS_NUM[new Date(date).getMonth()] + new Date(date).getFullYear();
    this.proposalsService.monthYear.set(monthYear);
    this.proposalsService.uploadSchedulesShifts();
  }
}