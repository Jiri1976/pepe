import { Component, DestroyRef, inject, OnInit, signal, ViewChild, CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule, Calendar } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { ShiftService } from '../../services/shift.service';
import { NavButtonStaticComponent } from "../../components/ui-buttons/nav-button-static/nav-button-static.component";
import { NavButtonActiveComponent } from "../../components/ui-buttons/nav-button-active/nav-button-active.component";
import { ConfirmService } from '../../services/confirm.service';
import { OverlayModule } from 'primeng/overlay';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';
import { tap } from 'rxjs';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { SpinnerComponent } from "../../components/spinner/spinner.component";
import { SelectUserComponent } from '../../components/shifts/select-user/select-user.component';
import { ShiftCard } from '../../models/shifts/shiftCard.interface';
import { ShiftCardComponent } from '../../components/shifts/shift-card/shift-card.component';
import Swiper from 'swiper';


@Component({
  selector: 'app-plans',
  imports: [
    CommonModule,
    CalendarModule,
    ConfirmComponent,
    DialogModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    NavButtonStaticComponent,
    NavButtonActiveComponent,
    OverlayModule,
    DatePickerModule,
    CalendarModule,
    SpinnerComponent,
    SelectUserComponent,
    ShiftCardComponent
  ],
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShiftsComponent implements OnInit {
  private swiper!: Swiper;
  private MONTHS_NAMES = ["LED", "ÚNO", "BŘE", "DUB", "KVĚ", "ČER", "ČRV", "SRP", "ZÁŘ", "ŘÍJ", "LIS", "PRO"];
  private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  private authService = inject(AuthService);
  private shiftService = inject(ShiftService);
  private confirmService = inject(ConfirmService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private errorHandlingService = inject(ErrorHandlingService);
  // private cdr = inject(ChangeDetectorRef);
  defaultDate = new Date(new Date().getFullYear(), new Date().getMonth());
  maxDate: Date = new Date(new Date().getFullYear(), new Date().getMonth());
  filteredUsers = signal<any[]>([]);
  monthYear = signal<string>(this.MONTHS_NUM[new Date().getMonth()] + new Date().getFullYear());
  loggedUser = this.authService.getUser();
  destination = signal(this.loggedUser.role === 'Master' ? this.loggedUser.destination : 'F-M');
  isLoading = signal(false);
  visibleModal = signal(false);
  users = signal<{ userName: string, userId: number }[]>([]);
  cards = signal<ShiftCard[]>([]);
  currentIndex = signal<number>(0);
  calendarText = signal<string>(this.MONTHS_NAMES[new Date().getMonth()] + ' ' + new Date().getFullYear().toString().substring(2));
  formShiftVisible = signal(false);

  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;
  @ViewChild('calendar', { static: false }) calendar!: Calendar;
  @ViewChild('timeFrom', { static: false }) timeFrom!: Calendar;
  @ViewChild('timeTo', { static: false }) timeTo!: Calendar;

  ngOnInit(): void {
    this.getCards();
  }

  onSwiperInit(event: any) {
    setTimeout(() => {
      const swiper = (this.swiperRef.nativeElement as any).swiper;
      if (swiper) {
        swiper.on('slideChange', () => {
          console.log('Slide changed! Index:', swiper.activeIndex);
        });
      }
    });
  }

  onCardUpdate(updatedCard: ShiftCard) {
    let _cards = [...this.cards()];
    let cardForUpdate = _cards.find(c => c.userId === updatedCard.userId);
    cardForUpdate = updatedCard;
    this.cards.set(_cards);
  }

  openModal() {
    if (!this.formShiftVisible()) {
      this.visibleModal.set(true);
    }
  }

  onOpenShiftForm() {
    this.formShiftVisible.set(true);
    const swiper = (this.swiperRef.nativeElement as any).swiper;
    swiper.allowTouchMove = false;
  }

  onCloseShiftForm() {
    this.formShiftVisible.set(false);
    const swiper = (this.swiperRef.nativeElement as any).swiper;
    swiper.allowTouchMove = true;
  }

  onSelectUser(userId: number) {
    this.swiper = this.swiperRef.nativeElement.swiper;

    let index = this.users().findIndex(u => u.userId === userId);
    this.swiper.slideTo(index);
  }

  onSlideChange(event: Event) {
    const swiperInstance = (event.target as any).swiper as Swiper;
    this.currentIndex.set(swiperInstance.activeIndex);
  }

  onSelectDestination(destination: string) {
    this.destination.set(destination);
    this.getCards();
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
    this.calendar.hideOverlay();
    this.calendar.cd.detectChanges();
    let _monthYear = this.MONTHS_NUM[new Date(this.calendar.value).getMonth()] + new Date(this.calendar.value).getFullYear();
    this.monthYear.set(_monthYear);
    this.calendarText.set(this.MONTHS_NAMES[new Date(this.calendar.value).getMonth()] + ' ' + new Date(this.calendar.value).getFullYear().toString().substring(2));
    this.getCards();
  }

  onAdd() {
    this.shiftService.resetSelectedShift();
  }

  onReset() {
    this.confirmService.confirm('Opravdu chceš znovu nahrát karty?')
      .then((confirmed) => {
        if (confirmed) {
          this.formShiftVisible.set(false);
          const swiper = (this.swiperRef.nativeElement as any).swiper;
          swiper.allowTouchMove = true;
          this.getCards();
        }
      });
  }

  onOpenPDF() {
    this.confirmService.confirm('Opravdu chceš stáhnout PDF soubor?')
      .then((confirmed) => {
        if (confirmed) {


        }
      });
  }

  isPassedMonth() {
    let today = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    // let _monthYear = this.proposalCard().monthYear.length === 5 ? '0' + this.proposalCard().monthYear : this.proposalCard().monthYear;

    // let day = new Date(parseInt(_monthYear.substring(2, 6)), parseInt(_monthYear.substring(0, 2)) - 1, 1);
    // if (day >= today) {
    //   return false;
    // }
    return true;
  }

  private preparePDFData() {

  }

  private getCards() {
    this.isLoading.set(true);
    const subscription = this.shiftService.getUsersShiftCards(this.monthYear(), this.destination()).pipe(
      tap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess === true) {
          const result = response.result;
          if (result.length > 0) {
            let _cards = result.sort((a: any, b: any) =>
              a.user.localeCompare(b.user)
            );
            let _users = _cards.map((card: any) => { return { userName: card.user, userId: card.userId } });
            this.users.set(_users);
            this.cards.set(_cards);
          }
          this.isLoading.set(false);


        }
      }),
    ).subscribe({
      next: () => { },
      error: error => this.handleError(error)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}