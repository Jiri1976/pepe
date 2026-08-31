import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ProposalStore } from '../../../../stores/proposal-store/proposal.store';
import {
  ProposalShift,
  ProposalUser,
  ScheduleConstraint,
} from '../../../../models/proposals.interface';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import {
  dateToString,
  getDateFromMonthYear,
  daysInMonth,
  getDateFromProposal,
  proposalDateToString,
} from '../../../../helpers/common-functions.helper';
import { CheckboxModule } from 'primeng/checkbox';
import { Dialog } from '@angular/cdk/dialog';
import { UpdateProposalComponent } from '../../update-proposal/update-proposal.component';

type OppositeShiftType = 'whole' | 'morning' | 'afternoon' | 'other';

type DatePickerCell = {
  day: number;
  month: number;
  year: number;
};

@Component({
  selector: 'app-user-constraint',
  imports: [SelectButtonModule, FormsModule, DatePickerModule, CheckboxModule],
  templateUrl: './user-constraint.component.html',
  styleUrls: ['./user-constraint.component.scss'],
})
export class UserConstraintComponent implements OnInit {
  readonly propStore = inject(ProposalStore);
  minDate = new Date();
  dialog = inject(Dialog);
  getDateFromMonthYear = getDateFromMonthYear;
  daysInMonth = daysInMonth;
  destination = this.propStore.destination;
  user = input.required<ProposalUser>();
  position = input.required<'Pizza' | 'Helper' | 'Driver' | 'Cook'>();
  isCalendarOpen = signal(true);
  invalidCountOfDays = signal(false);
  morning: boolean = false;
  afternoon: boolean = false;
  wholeWeek: boolean = false;
  oppositeShiftTypes: Record<string, OppositeShiftType> = {};

  weekDays: any[] = [
    { name: 'Pondělí', value: 1 },
    { name: 'Úterý', value: 2 },
    { name: 'Středa', value: 3 },
    { name: 'Čtvrtek', value: 4 },
    { name: 'Pátek', value: 5 },
    { name: 'Sobota', value: 6 },
    { name: 'Neděle', value: 7 },
  ];
  value: number[] = [];

  dates = computed(() =>
    this.parseConstraintDateList(this.getCurrentConstraint()?.unavailableDates),
  );
  oppositeDates = computed(() =>
    this.parseConstraintDateList(
      (this.getCurrentConstraint()?.oppositeShifts ?? []).map(
        (s) => s.proposalDate,
      ),
    ),
  );
  morningDates = signal<Date[]>([]);
  afternoonDates = signal<Date[]>([]);
  wholeDayDates = signal<Date[]>([]);
  oppositeAvailableShifts: ProposalShift[] = [];

  protected model = signal<ScheduleConstraint>({
    userId: 0,
    position: '',
    targetShifts: null,
    allowedWeekdays: [],
    unavailableDates: [],
    onlyMorningShifts: false,
    onlyAfternoonShifts: false,
    morningDates: [],
    afternoonDates: [],
    wholeDayDates: [],
    oppositeShifts: [],
  });

  ngOnInit() {
    const currentConstraint = this.getCurrentConstraint();

    this.morning = currentConstraint?.onlyMorningShifts || false;
    this.afternoon = currentConstraint?.onlyAfternoonShifts || false;
    this.wholeWeek = currentConstraint?.allowedWeekdays?.length === 7;
    this.value = currentConstraint?.allowedWeekdays || [];
    this.morningDates.set(
      this.parseConstraintDateList(currentConstraint?.morningDates),
    );
    this.afternoonDates.set(
      this.parseConstraintDateList(currentConstraint?.afternoonDates),
    );
    this.wholeDayDates.set(
      this.parseConstraintDateList(currentConstraint?.wholeDayDates),
    );
    this.oppositeAvailableShifts = this.updateOppositeShifts(
      currentConstraint?.oppositeShifts || [],
    );

    this.model.update((current) => ({
      userId: currentConstraint?.userId || this.user().id,
      position: currentConstraint?.position || this.position(),
      targetShifts: currentConstraint?.targetShifts || null,
      allowedWeekdays: currentConstraint?.allowedWeekdays || [],
      unavailableDates: currentConstraint?.unavailableDates || [],
      onlyMorningShifts: currentConstraint?.onlyMorningShifts || false,
      onlyAfternoonShifts: currentConstraint?.onlyAfternoonShifts || false,
      morningDates: currentConstraint?.morningDates || [],
      afternoonDates: currentConstraint?.afternoonDates || [],
      wholeDayDates: currentConstraint?.wholeDayDates || [],
      oppositeShifts: this.oppositeAvailableShifts,
    }));

    this.propStore.updateConstraints(this.model());
  }

  selectWholeDay(date: any) {
    this.wholeDayDates.set([...(this.wholeDayDates() || []), date]);
    this.updateConstraintModel((current) => ({
      ...current,
      wholeDayDates: this.wholeDayDates().map((d) => dateToString(d)),
    }));
  }

  onWholeDayDaysChange(selectedDates: Date[] | null | undefined) {
    this.wholeDayDates.set(selectedDates || []);
    this.updateConstraintModel((current) => ({
      ...current,
      wholeDayDates: this.wholeDayDates().map((d) => dateToString(d)),
    }));
  }

  onSelectDay(date: any) {
    const selectedDays = Array.isArray(this.value)
      ? this.value
      : Array.isArray(date?.value)
        ? date.value
        : [];

    this.value = selectedDays;
    this.wholeWeek = selectedDays.length === 7;
    this.updateConstraintModel((current) => ({
      ...current,
      allowedWeekdays: [...selectedDays],
    }));
  }

  selectFreeDay(date: any) {}

  onFreeDaysChange(selectedDates: Date[] | null | undefined) {
    const unavailableDates = (selectedDates || []).map((d) => dateToString(d));

    this.updateConstraintModel((current) => ({
      ...current,
      unavailableDates,
    }));

    const request = structuredClone(this.propStore.scheduleGeneratorRequest());
    request?.constraints
      ?.filter(
        (c) => c.userId === this.user().id && c.position !== this.position(),
      )
      .forEach((c) => {
        c.unavailableDates = [...unavailableDates];
        this.propStore.updateConstraints(c);
      });
  }

  onMorningDaysChange(selectedDates: Date[] | null | undefined) {
    this.morningDates.set(selectedDates || []);
    this.updateConstraintModel((current) => ({
      ...current,
      morningDates: this.morningDates().map((d) => dateToString(d)),
    }));
  }

  selectMorningDay(date: any) {}

  selectAfternoonDay(date: any) {}

  onAfternoonDaysChange(selectedDates: Date[] | null | undefined) {
    this.afternoonDates.set(selectedDates || []);
    this.updateConstraintModel((current) => ({
      ...current,
      afternoonDates: this.afternoonDates().map((d) => dateToString(d)),
    }));
  }

  onOppositeDaysChange(selectedDates: Date[] | null | undefined) {
    const nextDates = new Set(
      (selectedDates ?? []).map((d) => proposalDateToString(d)),
    );

    const removedShifts = this.oppositeAvailableShifts.filter(
      (shift) => !nextDates.has(this.toProposalDateString(shift.proposalDate)),
    );

    const filteredShifts = this.oppositeAvailableShifts.filter((shift) =>
      nextDates.has(this.toProposalDateString(shift.proposalDate)),
    );

    this.updateConstraintModel((current) => ({
      ...current,
      oppositeShifts: filteredShifts,
    }));

    let request = structuredClone(this.propStore.scheduleGeneratorRequest());

    let constraints = request!.constraints?.filter(
      (constraint) =>
        constraint.userId === this.user().id &&
        constraint.position !== this.position(),
    );

    constraints?.forEach((constraint) => {
      const filteredShifts =
        constraint.oppositeShifts?.filter((shift) =>
          nextDates.has(this.toProposalDateString(shift.proposalDate)),
        ) ?? null;
      constraint.oppositeShifts = filteredShifts;
      this.propStore.updateConstraints(constraint);
    });

    this.removeFromOppositeShifts(removedShifts);
  }

  // onSelectOppositeDaysChange(date: any) {
  //   let shift = {
  //     ...this.propStore
  //       .schedules()
  //       .find((card) => card.destination !== this.propStore.destination())!
  //       .users.find(
  //         (user) =>
  //           user.id === this.user().id && user.position === this.position(),
  //       )!
  //       .shifts.find(
  //         (s) => s.proposalDate === proposalDateToString(date.value),
  //       ),
  //   } as ProposalShift | undefined;

  //   if (!shift) {
  //     return;
  //   }

  //   console.log('Selected opposite shift:', shift);
  //   const inputs: Inputs = {
  //     hoursFrom: '11',
  //     minutesFrom: '00',
  //     hoursTo: isFridayOrSaturday(shift.proposalDate as string) ? '23' : '22',
  //     minutesTo: '00',
  //   };
  //   this.propStore.updateProposal(inputs);

  //   // const nextDates = new Set(
  //   //   (selectedDates ?? []).map((d) => proposalDateToString(d)),
  //   // );

  //   // const removedShifts = this.oppositeAvailableShifts.filter(
  //   //   (shift) => !nextDates.has(this.toProposalDateString(shift.proposalDate)),
  //   // );

  //   // const filteredShifts = this.oppositeAvailableShifts.filter((shift) =>
  //   //   nextDates.has(this.toProposalDateString(shift.proposalDate)),
  //   // );

  //   // let _shifts = this.model().oppositeShifts();

  //   // this.updateConstraintModel((current) => ({
  //   //   ...current,
  //   //   oppositeShifts: [...current.oppositeShifts(),shift],
  //   // }));

  //   // let request = structuredClone(this.propStore.scheduleGeneratorRequest());

  //   // let constraints = request!.constraints?.filter(
  //   //   (constraint) =>
  //   //     constraint.userId === this.user().id &&
  //   //     constraint.position !== this.position(),
  //   // );

  //   // constraints?.forEach((constraint) => {
  //   //   const filteredShifts =
  //   //     constraint.oppositeShifts?.filter((shift) =>
  //   //       nextDates.has(this.toProposalDateString(shift.proposalDate)),
  //   //     ) ?? null;
  //   //   constraint.oppositeShifts = filteredShifts;
  //   //   this.propStore.updateConstraints(constraint);
  //   // });

  //   // this.removeFromOppositeShifts(removedShifts);
  // }

  protected onKeydown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  protected onTargetShiftsInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.trim();
    const numericValue = rawValue === '' ? null : parseInt(rawValue, 10);
    const targetShifts = Number.isNaN(numericValue) ? null : numericValue;

    this.updateConstraintModel((current) => ({
      ...current,
      targetShifts,
    }));

    this.invalidCountOfDays.set(
      targetShifts !== null &&
        daysInMonth(this.propStore.currentCard()!.monthYear) < targetShifts,
    );
  }

  onlyMorning() {
    this.morningDates.set([]);
    this.updateConstraintModel((current) => ({
      ...current,
      onlyMorningShifts: this.morning ? true : false,
      morningDates: [],
    }));
  }

  onlyAfternoon() {
    this.afternoonDates.set([]);
    this.updateConstraintModel((current) => ({
      ...current,
      onlyAfternoonShifts: this.afternoon ? true : false,
      afternoonDates: [],
    }));
  }

  wholeWeekAvailable() {
    if (this.wholeWeek) {
      this.value = [1, 2, 3, 4, 5, 6, 7];
    } else {
      this.value = [];
    }

    this.updateConstraintModel((current) => ({
      ...current,
      allowedWeekdays: [...this.value],
    }));
  }

  getOppositeShiftType(date: DatePickerCell): OppositeShiftType | null {
    return this.oppositeShiftTypes[this.getDatePickerCellKey(date)] ?? null;
  }

  selectOppositeShift() {
    this.dialog.open(UpdateProposalComponent, { disableClose: false });
  }

  private updateOppositeShifts(savedShifts: ProposalShift[]): ProposalShift[] {
    const oppositeShifts =
      this.propStore
        .oppositeCard()
        ?.users.find(
          (user) =>
            user.id === this.user().id && user.position === this.position(),
        )
        ?.shifts.filter(
          (shift) =>
            shift.position === this.position() &&
            shift.from !== null &&
            shift.to !== null &&
            shift.from !== 'F-M' &&
            shift.from !== 'OVA',
        ) || [];

    savedShifts.forEach((savedShift) => {
      const index = oppositeShifts.findIndex(
        (shift) =>
          shift.proposalDate === savedShift.proposalDate &&
          shift.position === savedShift.position &&
          shift.destination !== this.destination(),
      );
      if (index === -1) {
        oppositeShifts.push(savedShift);
      }
    });

    this.oppositeShiftTypes = Object.fromEntries(
      oppositeShifts.map((shift) => [
        this.toDatePickerCellKey(shift.proposalDate),
        this.resolveOppositeShiftType(shift),
      ]),
    );

    return oppositeShifts;
  }

  private getCurrentConstraint(): ScheduleConstraint | undefined {
    return this.propStore
      .scheduleGeneratorRequest()
      ?.constraints?.find(
        (constraint) =>
          constraint.userId === this.user().id &&
          constraint.position === this.position(),
      );
  }
  private updateConstraintModel(
    update: (current: ScheduleConstraint) => ScheduleConstraint,
  ) {
    const latestConstraint = this.getCurrentConstraint();
    const current = latestConstraint
      ? {
          ...this.model(),
          ...latestConstraint,
        }
      : this.model();
    const next = update(current);

    this.model.set(next);
    this.propStore.updateConstraints(next);
  }

  private toProposalDateString(proposalDate: string): string {
    return proposalDateToString(getDateFromProposal(proposalDate));
  }

  private toDatePickerCellKey(proposalDate: string): string {
    return dateToString(getDateFromProposal(proposalDate));
  }

  private removeFromOppositeShifts(shifts: ProposalShift[]) {
    let schedules = structuredClone(this.propStore.schedules());
    schedules = schedules.map((card) => {
      if (card.destination !== this.propStore.destination()) {
        shifts.forEach((shift) => {
          const updatedUsers = card.users.map((user) => {
            if (
              user.id === this.user().id
              // && user.position === shift.position
            ) {
              const oppositeShifts = user.shifts;
              const index = oppositeShifts.findIndex(
                (s) =>
                  s.proposalDate === shift.proposalDate &&
                  s.position === shift.position,
              );
              if (index !== -1) {
                oppositeShifts[index].from = null;
                oppositeShifts[index].to = null;
              }
              return {
                ...user,
                shifts: oppositeShifts,
              };
            }
            return user;
          });
          return {
            ...card,
            users: updatedUsers,
          };
        });
      } else {
        shifts.forEach((shift) => {
          const updatedUsers = card.users.map((user) => {
            if (user.id === this.user().id) {
              const oppositeShifts = user.shifts;
              const index = oppositeShifts.findIndex(
                (s) =>
                  s.proposalDate === shift.proposalDate &&
                  (s.from === 'F-M' || s.from === 'OVA') &&
                  s.to === shift.to,
              );
              if (index !== -1) {
                oppositeShifts[index].from = null;
                oppositeShifts[index].to = null;
              }
              return {
                ...user,
                shifts: oppositeShifts,
              };
            }
            return user;
          });
          return {
            ...card,
            users: updatedUsers,
          };
        });
      }
      return card;
    });

    this.propStore.setSchedules(schedules);
  }

  private resolveOppositeShiftType(shift: ProposalShift): OppositeShiftType {
    if (
      shift.from === '11:00' &&
      (shift.to === '22:00' || shift.to === '23:00')
    ) {
      return 'whole';
    }

    if (shift.from === '11:00' && shift.to === '17:00') {
      return 'morning';
    }

    if (
      shift.from === '17:00' &&
      (shift.to === '22:00' || shift.to === '23:00')
    ) {
      return 'afternoon';
    }

    return 'other';
  }

  private getDatePickerCellKey(date: DatePickerCell): string {
    const day = date.day.toString().padStart(2, '0');
    const month = (date.month + 1).toString().padStart(2, '0');

    return `${day}.${month}.${date.year}`;
  }

  private parseConstraintDateList(
    dateList: string[] | null | undefined,
  ): Date[] {
    return (dateList || [])
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .map((value) => getDateFromProposal(value))
      .filter((date) => !Number.isNaN(date.getTime()));
  }
}
