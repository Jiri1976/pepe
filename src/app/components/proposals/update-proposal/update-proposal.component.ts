import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProposalsService } from '../../../services/proposals.service';
import { DatePickerModule } from 'primeng/datepicker';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateValidator } from '../../../helpers/proposal-times.validator';
import { DialogRef } from '@angular/cdk/dialog';
import { ProposalCard } from '../../../models/proposals/proposalCard.interface';

@Component({
  selector: 'app-update-proposal',
  imports: [
    DialogModule,
    ButtonModule,
    DatePickerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './update-proposal.component.html',
  styleUrl: './update-proposal.component.scss'
})
export class UpdateProposalComponent implements OnInit {
  private dialogRef = inject(DialogRef, { optional: true });
  proposalsService = inject(ProposalsService);
  selectedProposal = computed(() => this.proposalsService.selectedProposal());
  proposalForm!: FormGroup;
  errorMessage = signal<string | null>(null);
  planCard = computed(() => this.proposalsService.schedules().find(c => c.destination === this.proposalsService.destination()));

  get timeFrom() {
    return this.proposalForm.get('timeFrom');
  }

  get timeTo() {
    return this.proposalForm.get('timeTo');
  }

  ngOnInit(): void {
    this.initializeProposalForm();
  }

  onClearErrorMessage() {
    this.errorMessage.set(null);
  }

  onUpdate(shiftType?: string) {
    const inputs = this.checkInputShiftTimes(shiftType);
    if (inputs === undefined) {
      return;
    }
    let cards = [...this.proposalsService.schedules()];
    let currentCard = cards.find(c => c.destination === this.proposalsService.destination());
    let nextCard = cards.find(c => c.destination !== this.proposalsService.destination());
    const sameUsers = nextCard!.users.filter(u => u.id === this.selectedProposal()?.userId);
    let shifts = cards.flatMap(c => c.users).flatMap(u => u.shifts.filter(s => s.proposalDate === this.selectedProposal()!.proposalDate && s.userId === this.selectedProposal()!.userId && s.from !== null && s.to !== null && s.id !== this.selectedProposal()!.id));
    if (shifts.length === 0) {
      this.updateAndSave(currentCard!, nextCard!, inputs, sameUsers, cards);
    } else {
      let selectedShift = { ...this.selectedProposal() };
      selectedShift.from = shiftType === 'OVA' || shiftType === 'F-M' ? '11:00' : `${inputs.hoursFrom}:${inputs.minutesFrom}`;
      selectedShift.to = `${inputs.hoursTo}:${inputs.minutesTo}`;

      let isColliding = false;
      shifts?.forEach(shift => {
        if (!((shiftType === 'OVA' || shiftType === 'F-M') && (shift.destination !== shiftType))) {
          if (shift.from !== 'OVA' && shift.from !== 'F-M') {
            if (this.proposalsService.collideShifts(selectedShift.from!, selectedShift.to!, shift.from!, shift.to!)) {
              isColliding = true;
              this.errorMessage.set(`POZOR: Směna ${shift.destination} - ${shift.from} - ${shift.to}`);
              return;
            }
          }
        }
      });

      if (!isColliding) {
        this.updateAndSave(currentCard!, nextCard!, inputs, sameUsers, cards);
      }
    }
  }

  private updateAndSave(currentCard: ProposalCard, nextCard: ProposalCard, inputs: any, sameUsers: any[], cards: ProposalCard[]) {
    let samePositionExists = sameUsers.flatMap(u => u.shifts).some(s => s.position === this.selectedProposal()!.position)
    if (samePositionExists) {
      if (nextCard!.users.find(u => u.id === this.selectedProposal()?.userId && u.position === this.selectedProposal()?.position)!.shifts.find(s => s.proposalDate === this.selectedProposal()!.proposalDate)!.from === null) {
        nextCard!.users.find(u => u.id === this.selectedProposal()?.userId && u.position === this.selectedProposal()?.position)!.shifts.find(s => s.proposalDate === this.selectedProposal()!.proposalDate)!.from = this.proposalsService.destination();
        nextCard!.users.find(u => u.id === this.selectedProposal()?.userId && u.position === this.selectedProposal()?.position)!.shifts.find(s => s.proposalDate === this.selectedProposal()!.proposalDate)!.to = `${inputs.hoursTo}:${inputs.minutesTo}`;
      }
    }
    currentCard!.users[this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].from = `${inputs.hoursFrom}:${inputs.minutesFrom}`;
    currentCard!.users[this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].to = `${inputs.hoursTo}:${inputs.minutesTo}`;
    this.proposalsService.updateSchedulesAndCheckChanges(cards);
    this.onClose();
    return;
  }


  onDelete() {
    let _cards = [...this.proposalsService.schedules()];
    let _users = _cards.find(c => c.destination === this.proposalsService.destination())!.users!;
    let shiftToDelete = { ..._users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()] };
    if (shiftToDelete.from === 'F-M' || shiftToDelete.from === 'OVA') {
      this.errorMessage.set('Směnu odstraníš na druhé kartě.');
      return;
    }
    let secondCard = _cards.find(c => c.destination !== this.proposalsService.destination());
    let _oppositeUsers = secondCard!.users;
    let _oppositeUser = _oppositeUsers.find(u => u.id === shiftToDelete.userId && u.shifts.some(s => s.position === this.selectedProposal()?.position));

    if (_oppositeUser) {
      let _card2 = _cards.find(c => c.destination !== this.proposalsService.destination());
      let shift = _oppositeUser.shifts.find(s => s.proposalDate === this.selectedProposal()?.proposalDate)!;

      if (shift.from === 'F-M' || shift.from === 'OVA' || shiftToDelete.from === 'F-M' || shiftToDelete.from === 'OVA') {
        shift.from = null;
        shift.to = null;
        _card2!.users = _oppositeUsers;
      }

      if (shift.from !== null && shift.from !== 'F-M' && shift.from !== 'OVA') {
        _users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].from = shift.destination;
        _users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].to = shift.to;
      } else {
        _users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].from = null;
        _users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].to = null;
      }
    } else {
      _users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].from = null;
      _users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].to = null;
    }
    this.proposalsService.schedules.set(_cards);
    this.proposalsService.checkNothingChanged();
    this.onClose();
  }

  onClose() {
    this.dialogRef?.close();
  }

  isFridayOrSaturday(date: string) {
    var day = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (day.getDay() == 5 || day.getDay() == 6) {
      return true;
    }
    return false;
  }

  private checkInputShiftTimes(shiftType?: string) {
    let isFridaySaturday = this.isFridayOrSaturday(this.selectedProposal()!.proposalDate);
    let hoursFrom = new Date(this.timeFrom?.value).getHours() < 10 ? '0' + new Date(this.timeFrom?.value).getHours() : new Date(this.timeFrom?.value).getHours();
    let minutesFrom = new Date(this.timeFrom?.value).getMinutes() < 10 ? '0' + new Date(this.timeFrom?.value).getMinutes() : new Date(this.timeFrom?.value).getMinutes();
    let hoursTo = new Date(this.timeTo?.value).getHours() < 10 ? '0' + new Date(this.timeTo?.value).getHours() : new Date(this.timeTo?.value).getHours();
    let minutesTo = new Date(this.timeTo?.value).getMinutes() < 10 ? '0' + new Date(this.timeTo?.value).getMinutes() : new Date(this.timeTo?.value).getMinutes();

    if (parseInt(hoursFrom.toString()) < 11) {
      this.errorMessage.set('Směna musí začínat v 11:00.');
      return;
    }

    if (isFridaySaturday) {
      if (parseInt(hoursTo.toString()) === 23 && (parseInt(minutesTo.toString()) > 0)) {
        this.errorMessage.set('Směna musí končit ve 23:00.');
        return;
      }
    }

    if (!isFridaySaturday) {
      if (parseInt(hoursTo.toString()) > 22 || (parseInt(hoursTo.toString()) === 22 && (parseInt(minutesTo.toString()) > 0))) {
        this.errorMessage.set('Směna musí končit ve 22:00.');
        return;
      }
    }

    if (shiftType === 'W') {
      hoursFrom = '11';
      minutesFrom = '00';
      hoursTo = isFridaySaturday ? '23' : '22';
      minutesTo = '00';
    } else if (shiftType === 'M') {
      hoursFrom = '11';
      minutesFrom = '00';
      hoursTo = '17';
      minutesTo = '00';
    } else if (shiftType === 'A') {
      hoursFrom = '17';
      minutesFrom = '00';
      hoursTo = isFridaySaturday ? '23' : '22';
      minutesTo = '00';
    }
    return { isFridaySaturday, hoursFrom, minutesFrom, hoursTo, minutesTo };
  }

  private initializeProposalForm() {
    this.proposalForm = new FormGroup({
      'timeFrom': new FormControl({
        value: this.setTimeFrom(),
        disabled: false,
      }, [Validators.required]),
      'timeTo': new FormControl({
        value: this.setTimeTo(),
        disabled: false
      }, [Validators.required,])
    }, { validators: DateValidator.ProposalTimesValidator });
  }

  private setTimeFrom() {
    if (this.selectedProposal()!.from === null) {
      return null;
    }
    if (this.selectedProposal()!.from === 'F-M' || this.selectedProposal()!.from === 'OVA') {
      return new Date(parseInt(this.selectedProposal()!.proposalDate.split('.')[2]), parseInt(this.selectedProposal()!.proposalDate.split('.')[1]) - 1, parseInt(this.selectedProposal()!.proposalDate.split('.')[0]), 11, 0);
    }
    else {
      return new Date(parseInt(this.selectedProposal()!.proposalDate.split('.')[2]), parseInt(this.selectedProposal()!.proposalDate.split('.')[1]) - 1, parseInt(this.selectedProposal()!.proposalDate.split('.')[0]), parseInt(this.selectedProposal()!.from?.split(':')[0]!), parseInt(this.selectedProposal()!.from?.split(':')[1]!));
    }
  }

  private setTimeTo() {
    if (this.selectedProposal()!.to === null) {
      return null;
    }
    return new Date(parseInt(this.selectedProposal()!.proposalDate.split('.')[2]), parseInt(this.selectedProposal()!.proposalDate.split('.')[1]) - 1, parseInt(this.selectedProposal()!.proposalDate.split('.')[0]), parseInt(this.selectedProposal()!.to?.split(':')[0]!), parseInt(this.selectedProposal()!.to?.split(':')[1]!));
  }
}