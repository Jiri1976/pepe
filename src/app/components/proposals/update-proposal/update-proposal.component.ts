import { Component, computed, effect, inject, input, model, OnInit, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProposalsService } from '../../../services/proposals.service';
import { DatePickerModule } from 'primeng/datepicker';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationComponent } from "../../notification/notification.component";
import { DateValidator } from '../../../helpers/proposal-times.validator';

@Component({
  selector: 'app-update-proposal',
  imports: [
    DialogModule,
    ButtonModule,
    DatePickerModule,
    FormsModule,
    ReactiveFormsModule,
    NotificationComponent,
  ],
  templateUrl: './update-proposal.component.html',
  styleUrl: './update-proposal.component.scss'
})
export class UpdateProposalComponent implements OnInit {
  private proposalsService = inject(ProposalsService);
  destination = input.required<string>();
  updateVisible = model<boolean>(false);
  selectedProposal = computed(() => this.proposalsService.selectedProposal());
  assignments = computed(() => this.proposalsService.assignments());
  selectedProposalTimeFrom = computed(() => this.proposalsService.timeFrom());
  selectedProposalTimeTo = computed(() => this.proposalsService.timeTo());
  proposalForm!: FormGroup;
  masterAdd = model(false);
  errorMessage = signal<string | null>(null);

  get timeFrom() {
    return this.proposalForm.get('timeFrom');
  }

  get timeTo() {
    return this.proposalForm.get('timeTo');
  }

  ngOnInit(): void {
    this.initializeProposalForm();
  }

  changes = effect(() => {
    this.proposalForm.patchValue({
      'timeFrom': this.selectedProposalTimeFrom(),
      'timeTo': this.selectedProposalTimeTo()
    });
  });

  onClearErrorMessage() {
    this.errorMessage.set(null);
  }

  onUpdate(shiftType?: string) {
    let isFridaySaturday = this.isFridayOrSaturday(this.selectedProposal().date);
    let hoursFrom = new Date(this.timeFrom?.value).getHours() < 10 ? '0' + new Date(this.timeFrom?.value).getHours() : new Date(this.timeFrom?.value).getHours();
    let minutesFrom = new Date(this.timeFrom?.value).getMinutes() < 10 ? '0' + new Date(this.timeFrom?.value).getMinutes() : new Date(this.timeFrom?.value).getMinutes();
    let hoursTo = new Date(this.timeTo?.value).getHours() < 10 ? '0' + new Date(this.timeTo?.value).getHours() : new Date(this.timeTo?.value).getHours();
    let minutesTo = new Date(this.timeTo?.value).getMinutes() < 10 ? '0' + new Date(this.timeTo?.value).getMinutes() : new Date(this.timeTo?.value).getMinutes();
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

    this.updateVisible.set(false);
    let _assignments = { ...this.assignments() };
    let assignment: any = _assignments[this.selectedProposal().x][this.selectedProposal().y];

    if (assignment.length > 0) {
      assignment[0].from = `${hoursFrom}:${minutesFrom}`;
      assignment[0].to = `${hoursTo}:${minutesTo}`;
    } else {
      let newAssignment: any = { name: 'W', from: `${hoursFrom}:${minutesFrom}`, to: `${hoursTo}:${minutesTo}` };
      _assignments[this.selectedProposal().x][this.selectedProposal().y] = [newAssignment];
      assignment = _assignments[this.selectedProposal().x][this.selectedProposal().y]
    }

    assignment[0].name = '';

    if (isFridaySaturday) {
      if (parseInt(hoursFrom.toString()) === 11 && (parseInt(minutesFrom.toString()) === 0) && parseInt(hoursTo.toString()) === 23) {
        assignment[0].name = 'W';
      }
      if (parseInt(hoursFrom.toString()) === 11 && (parseInt(minutesFrom.toString()) === 0) && parseInt(hoursTo.toString()) === 17) {
        assignment[0].name = 'M';
      }
      if (parseInt(hoursFrom.toString()) === 17 && (parseInt(minutesFrom.toString()) === 0) && parseInt(hoursTo.toString()) === 23) {
        assignment[0].name = 'A';
      }
    } else {
      if (parseInt(hoursFrom.toString()) === 11 && (parseInt(minutesFrom.toString()) === 0) && parseInt(hoursTo.toString()) === 22) {
        assignment[0].name = 'W';
      }
      if (parseInt(hoursFrom.toString()) === 11 && (parseInt(minutesFrom.toString()) === 0) && parseInt(hoursTo.toString()) === 17) {
        assignment[0].name = 'M';
      }
      if (parseInt(hoursFrom.toString()) === 17 && (parseInt(minutesFrom.toString()) === 0) && parseInt(hoursTo.toString()) === 22) {
        assignment[0].name = 'A';
      }
    }

    if (shiftType === 'OVA' || shiftType === 'F-M') {
      assignment[0].from = this.destination();
      assignment[0].to = isFridaySaturday ? '23:00' : '22:00';
    }
    this.proposalsService.updateAssigments(_assignments);
    this.proposalsService.setProposals();
  }

  onDelete() {
    this.updateVisible.set(false)
    let assignments = { ...this.assignments() };
    assignments[this.selectedProposal().x][this.selectedProposal().y] = [];
    this.proposalsService.assignments.set(assignments);
    this.proposalsService.setProposals();
  }

  private isFridayOrSaturday(date: string) {
    var day = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (day.getDay() == 5 || day.getDay() == 6) {
      return true;
    }
    return false;
  }

  private initializeProposalForm() {
    this.proposalForm = new FormGroup({
      'timeFrom': new FormControl({
        value: this.selectedProposalTimeFrom(),
        disabled: false,
      }, [Validators.required]),
      'timeTo': new FormControl({
        value: this.selectedProposalTimeTo(),
        disabled: false
      }, [Validators.required,])
    }, { validators: DateValidator.ProposalTimesValidator });
  }
}