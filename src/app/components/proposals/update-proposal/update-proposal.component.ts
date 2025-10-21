import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProposalsService } from '../../../services/proposals.service';
import { DatePickerModule } from 'primeng/datepicker';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateValidator } from '../../../helpers/proposal-times.validator';
import { DialogRef } from '@angular/cdk/dialog';
import { AlertService } from '../../../services/alert.service';

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
  private alertService = inject(AlertService);
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

    this.onClose();

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

    let _users = [...this.planCard()!.users!];
    let secondCard = computed(() => this.proposalsService.schedules().find(c => c.destination !== this.proposalsService.destination())!);
    let _oppositeUsers = [...secondCard()!.users];
    let _oppositeUser = _oppositeUsers.find(u => u.id === this.selectedProposal()?.userId);

    if (shiftType === 'OVA' || shiftType === 'F-M') {
      if (!_oppositeUser) {
        this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: `${this.selectedProposal()?.userName} ${this.selectedProposal()?.userSurname} nemá registraci pro ${this.proposalsService.destination() === 'F-M' ? 'OVA' : 'F-M'}.` });
        return;
      } else {

        let index = _oppositeUsers.findIndex(u => u.id === _oppositeUser.id);
        let shiftIndex = _oppositeUsers[index].shifts.findIndex(s => s.proposalDate === this.selectedProposal()?.proposalDate);
        let shift = _oppositeUsers[index].shifts[shiftIndex];

        if (shift.from === null && shift.to === null) {
          shift.from = '11:00';
          shift.to = isFridaySaturday ? '23:00' : '22:00';
        }
        _users[this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].from = this.proposalsService.destination() === 'F-M' ? 'OVA' : 'F-M';
        _users[this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].to = isFridaySaturday ? '23:00' : '22:00';
      }
    } else {
      if (_oppositeUser) {
        let index = _oppositeUsers.findIndex(u => u.id === _oppositeUser.id);
        let shiftIndex = _oppositeUsers[index].shifts.findIndex(s => s.proposalDate === this.selectedProposal()?.proposalDate);
        let shift = _oppositeUsers[index].shifts[shiftIndex];

        if (shift.from !== null && shift.from !== 'F-M' && shift.from !== 'OVA') {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: `${this.selectedProposal()?.userName} ${this.selectedProposal()?.userSurname} má směnu v ${this.proposalsService.destination() === 'F-M' ? 'OVA' : 'F-M'}.` });
          return;
        } else {
          _users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].from = `${hoursFrom}:${minutesFrom}`;
          _users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].to = `${hoursTo}:${minutesTo}`;
        }
      } else {
        _users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].from = `${hoursFrom}:${minutesFrom}`;
        _users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].to = `${hoursTo}:${minutesTo}`;
      }
    }
    let _cards = [...this.proposalsService.schedules()];
    let _card = _cards.find(c => c.destination === this.proposalsService.destination());
    _card!.users = _users;

    if (_oppositeUser) {
      let _card2 = _cards.find(c => c.destination !== this.proposalsService.destination());
      _card2!.users = _oppositeUsers;
    }
    this.proposalsService.schedules.set(_cards);
    this.proposalsService.checkNothingChanged();
  }

  onDelete() {
    let _cards = [...this.proposalsService.schedules()];
    let _users = _cards.find(c => c.destination === this.proposalsService.destination())!.users!;

    let shiftToDelete = { ..._users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()] };

    let secondCard = _cards.find(c => c.destination !== this.proposalsService.destination());
    let _oppositeUsers = secondCard!.users;
    let _oppositeUser = _oppositeUsers.find(u => u.id === shiftToDelete.userId);

    if (_oppositeUser) {
      let _card2 = _cards.find(c => c.destination !== this.proposalsService.destination());
      let index = _oppositeUsers.findIndex(u => u.id === _oppositeUser.id);
      let shiftIndex = _oppositeUsers[index].shifts.findIndex(s => s.proposalDate === shiftToDelete.proposalDate);
      let shift = _oppositeUsers[index].shifts[shiftIndex];

      if (shift.from === 'F-M' || shift.from === 'OVA' || shiftToDelete.from === 'F-M' || shiftToDelete.from === 'OVA') {
        shift.from = null;
        shift.to = null;
        _card2!.users = _oppositeUsers;
      }
    }
    _users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].from = null;
    _users![this.proposalsService.selectedUserIndex()]!.shifts[this.proposalsService.selectedShiftIndex()].to = null;

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