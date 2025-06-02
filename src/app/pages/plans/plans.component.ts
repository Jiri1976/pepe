import { Component, computed, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule, Calendar } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { ProposalsComponent } from '../../components/proposals/proposals.component';
import { ProposalsService } from '../../services/proposals.service';
import { ConfirmService } from '../../services/confirm.service';
import { OverlayModule } from 'primeng/overlay';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';
import { tap } from 'rxjs';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { ProposalsPDF, ShiftPDF, UserPDF } from '../../models/proposals/proposalsPDF.interface';
import { ProposalsNavComponent } from "../../components/proposals/proposals-nav/proposals-nav.component";
import { PageAnimation } from '../../animations/page.animation';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-plans',
  imports: [
    CalendarModule,
    ConfirmComponent,
    ProposalsComponent,
    DialogModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    OverlayModule,
    ProposalsNavComponent,
    DragDropModule
],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
  animations: [
    PageAnimation
  ]
})
export class PlansComponent implements OnInit {
  private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  private authService = inject(AuthService);
  private proposalsService = inject(ProposalsService);
  private confirmService = inject(ConfirmService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private errorHandlingService = inject(ErrorHandlingService);
  defaultDate = new Date(new Date().getFullYear(), new Date().getMonth());
  maxDate: Date = new Date(new Date().getFullYear(), new Date().getMonth());
  loggedUser = this.authService.getUser();
  proposalCard = computed(() => this.proposalsService.proposalCard());
  isLoading = computed(() => this.proposalsService.isProposalLoading());
  user = computed(() => this.authService.user());
  users = computed(() => this.proposalsService.users());
  nothingChanched = computed(() => this.proposalsService.nothingChanged());
  assignments = computed(() => this.proposalsService.assignments());
  pdfLoading = signal(false);
  @ViewChild('calendar', { static: false }) calendar!: Calendar;

  ngOnInit(): void {
    if (this.loggedUser.role === 'Admin') {
      this.proposalsService.destination.set('F-M');
    } else {
      this.proposalsService.destination.set(this.loggedUser.destination);
    }
  }

  toggleCalendar() {
    if (this.calendar) {
      if (this.calendar.overlayVisible) {
        this.calendar.hideOverlay();
        this.calendar.cd.detectChanges();
      } else {
        this.calendar.showOverlay();
        this.calendar.cd.detectChanges();
      }
    }
  }

  onSelectMonth() {
    let date = this.calendar.value;
    let monthYear = this.MONTHS_NUM[new Date(date).getMonth()] + new Date(date).getFullYear();
    this.proposalsService.monthYear.set(monthYear);
    this.proposalsService.uploadProposals();
  }

  onChangeDestination(destination: string) {
    if (!this.nothingChanched()) {
      this.confirmService.confirm('Nejsou uloženy změny, chceš pokračovat?')
        .then((confirmed) => {
          if (confirmed) {
            this.changeDestination(destination);
          }
        });
    } else {
      this.changeDestination(destination);
    }
  }

  onSave() {
    this.proposalsService.isSaving.set(true);
    this.proposalsService.onSave();
  }

  onDelete() {
    this.confirmService.confirm('Opravdu chceš smazat kartu s návrhy směn?')
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
            this.proposalsService.uploadProposals();
          }
        });
    } else {
      this.proposalsService.uploadProposals();
    }
  }

  onOpenPDF() {
    this.pdfLoading.set(true);
    let pdfCard = this.preparePDFData();
    const subscription = this.proposalsService.uploadPDF(pdfCard, this.user().role).pipe(
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
          a.download = pdfCard.title;
          a.click();
          URL.revokeObjectURL(url);
        }
      })
    ).subscribe({
      error: error => this.handleError(error)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  isPassedMonth() {
    let today = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let _monthYear = this.proposalCard().monthYear.length === 5 ? '0' + this.proposalCard().monthYear : this.proposalCard().monthYear;

    let day = new Date(parseInt(_monthYear.substring(2, 6)), parseInt(_monthYear.substring(0, 2)) - 1, 1);
    if (day >= today) {
      return false;
    }
    return true;
  }

  private changeDestination(destination: string) {
    this.proposalsService.isProposalLoading.set(true);
    this.proposalsService.destination.set(destination);
    this.proposalsService.uploadProposals();
  }

  private preparePDFData() {
    let destination = this.proposalCard().destination === 'F-M' ? 'Frýdek-Místek' : 'Ostrava';
    let MONTHS_NAMES = ["LEDEN", "ÚNOR", "BŘEZEN", "DUBEN", "KVĚTEN", "ČERVEN", "ČERVENEC", "SRPEN", "ZÁŘÍ", "ŘÍJEN", "LISTOPAD", "PROSINEC"];
    let proposalPDF: ProposalsPDF = {
      title: `${destination} - ${MONTHS_NAMES[parseInt(this.proposalCard().monthYear.substring(0, 2)) - 1] + ' ' + this.proposalCard().monthYear.substring(2)}`,
      countOfDays: this.proposalCard().proposalDays.length,
      startDay: this.proposalCard().proposalDays[0].date,
      users: []
    };

    let card = { ...this.proposalCard() };
    let _assigments = { ...this.assignments() }
    for (let i = 0; i < this.users().length; i++) {
      let user = this.users()[i];
      let userPDF: UserPDF = {
        name: user.name,
        position: user.position,
        shifts: []
      };
      proposalPDF.users.push(userPDF);
      for (let j = 0; j < card.proposalDays.length; j++) {
        let proposalDay = card.proposalDays[j];
        let updateShift = proposalDay.proposalShifts.filter(s => s.userId === user.userId);
        if (updateShift[0]) {

          let assignment: any = _assigments[i + 1][j];
          if (assignment[0]) {
            let shiftPDF: ShiftPDF = {
              from: assignment[0].from,
              to: assignment[0].to
            }
            proposalPDF.users[i].shifts.push(shiftPDF);
          } else {
            let shiftPDF: ShiftPDF = {
              from: null,
              to: null
            }
            proposalPDF.users[i].shifts.push(shiftPDF);
          }
        }
      }
    }

    return proposalPDF;
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.proposalsService.isProposalLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}