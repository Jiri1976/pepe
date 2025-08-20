import { Component, DestroyRef, inject, OnInit, signal, ViewChild, CUSTOM_ELEMENTS_SCHEMA, ElementRef, computed, effect } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { ShiftService } from '../../services/shift.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';
import { tap } from 'rxjs';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { ShiftCard } from '../../models/shifts/shiftCard.interface';
import { ShiftCardComponent } from '../../components/shifts/shift-card/shift-card.component';
import Swiper from 'swiper';
import { ShiftsNavComponent } from "../../components/shifts/shifts-nav/shifts-nav.component";
import { PageAnimation } from '../../animations/page.animation';
import { FormsModule } from '@angular/forms';
import { CalendarModule, Calendar } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { Shift } from '../../models/shifts/shift.interface';

@Component({
  selector: 'app-plans',
  imports: [
    ConfirmComponent,
    DialogModule,
    ButtonModule,
    ShiftCardComponent,
    ShiftsNavComponent,
    CalendarModule,
    DatePickerModule,
    FormsModule
  ],
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    PageAnimation
  ]
})
export class ShiftsComponent implements OnInit {
  private swiper!: Swiper;
  private MONTHS = ["LEDEN", "ÚNOR", "BŘEZEN", "DUBEN", "KVĚTEN", "ČERVEN", "ČRVENEC", "SRPEN", "ZÁŘÍ", "ŘÍJEN", "LISTOPAD", "PROSINEC"];
  private MONTHS_NAMES = ["LED", "ÚNO", "BŘE", "DUB", "KVĚ", "ČER", "ČRV", "SRP", "ZÁŘ", "ŘÍJ", "LIS", "PRO"];
  private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  private authService = inject(AuthService);
  private shiftService = inject(ShiftService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private errorHandlingService = inject(ErrorHandlingService);
  filteredUsers = signal<any[]>([]);
  monthYear = signal<string>(this.MONTHS_NUM[new Date().getMonth()] + new Date().getFullYear());
  loggedUser = this.authService.getUser();
  destination = signal(this.loggedUser.role === 'Master' ? this.loggedUser.destination : 'F-M');
  isLoading = signal(false);
  users = computed(() => this.shiftService.users());
  selectedUserId = computed(() => this.shiftService.selectedUserId());
  cards = signal<ShiftCard[]>([]);
  currentIndex = signal<number>(0);
  calendarText = signal<string>(this.MONTHS_NAMES[new Date().getMonth()] + ' ' + new Date().getFullYear().toString().substring(2));
  formShiftVisible = computed(() => this.shiftService.shiftFormVisible());
  pdfOn = signal(false);
  empty = new Array(45);
  defaultDate = new Date(new Date().getFullYear(), new Date().getMonth());
  maxDate: Date = new Date(new Date().getFullYear(), new Date().getMonth());
  @ViewChild('calendar', { static: false }) calendar!: Calendar;
  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;

  ngOnInit(): void {
    this.getCards();
  }

  formShiftEffect = effect(() => {
    if (this.formShiftVisible()) {
      const swiper = (this.swiperRef.nativeElement as any).swiper;
      swiper.allowTouchMove = false;
    } else {
      if (!this.isLoading()) {
        setTimeout(() => {
          if (this.cards().length > 0) {
            const swiper = (this.swiperRef.nativeElement as any).swiper;
            swiper.allowTouchMove = true;
          }
        }, 100);
      }
    }

    if (this.selectedUserId() > -1) {
      this.onSelectUser(this.selectedUserId());
    }
  })

  onSwiperInit(event: any) {
    setTimeout(() => {
      const swiper = (this.swiperRef.nativeElement as any).swiper;
      if (swiper) {
        swiper.on('slideChange', () => { });
      }
    });
  }

  onCardUpdate(updatedCard: ShiftCard) {
    let _cards = [...this.cards()];
    let cardForUpdate = _cards.find(c => c.userId === updatedCard.userId);
    cardForUpdate = updatedCard;
    this.cards.set(_cards);
  }

  onSlideChange(event: Event) {
    const swiperInstance = (event.target as any).swiper as Swiper;
    this.currentIndex.set(swiperInstance.activeIndex);
  }

  slideToCard(index: number) {
    this.swiper = this.swiperRef.nativeElement.swiper;
    this.swiper.slideTo(index);
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
    let date = this.calendar.value;
    let _monthYear = this.MONTHS_NUM[new Date(date).getMonth()] + new Date(date).getFullYear();
    this.monthYear.set(_monthYear);
    this.calendarText.set(this.MONTHS_NAMES[new Date(date).getMonth()] + ' ' + new Date(date).getFullYear().toString().substring(2));
    this.getCards();
  }

  onAllToPdf() {
    let _cards = this.cards().filter(c => c.shifts.length > 0);
    if (_cards.length === 0) {
      this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Chybí uložené směny.' });
      return;
    }
    this.pdfOn.set(true);
    const subscription = this.shiftService.generateAllToPDF(_cards, this.destination()).pipe(
      tap(response => {
        if (response === null) {
          this.pdfOn.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.pdfOn.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else {
          this.pdfOn.set(false);
          const binary = atob(response.result);
          const uint8Array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            uint8Array[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([uint8Array], { type: 'application/pdf' });
          var url = window.URL.createObjectURL(blob);
          const a = document.createElement('a')
          a.href = url;
          a.download = `${this.MONTHS[parseInt(this.monthYear().substring(0, 2)) - 1]} ${this.monthYear().substring(2, 6)} - ${this.destination()}.pdf`;
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

  onReset() {
    const swiper = (this.swiperRef.nativeElement as any).swiper;
    swiper.allowTouchMove = true;
    this.getCards();
  }

  toggleSwipping(disable: boolean) {
    const swiper = (this.swiperRef.nativeElement as any).swiper;
    if (!disable) {
      swiper.allowTouchMove = false;
    } else {
      swiper.allowTouchMove = true;
    }
  }

  onAddShift() {
    if (this.cards().length === 0) {
      return;
    }
    let card = { ...this.cards()[this.currentIndex()] };
    this.shiftService.setMonthYear(card.monthYear);
    let _shift: Shift = {
      id: 0,
      shiftCardId: card.id,
      userId: card.userId,
      position: card.userPosition,
      date: '',
      from: '11:00',
      to: '22:00',
      hours: '',
      perso: ''
    }

    if (this.isPastCard()) {
      _shift.date = `01.${card.monthYear.substring(0, 2)}.${card.monthYear.substring(2, 6)}`;
    } else {
      let day = new Date().getDate() < 10 ? '0' + new Date().getDate() : (new Date().getDate()).toString();
      _shift.date = `${day}.${card.monthYear.substring(0, 2)}.${card.monthYear.substring(2, 6)}`;
      _shift.to = this.isFridayOrSaturday(_shift.date) ? '23:00' : '22:00';
    }
    this.shiftService.setSelectedShift(_shift);
    this.shiftService.shiftFormVisible.set(true);
  }

  isPastCard() {
    if (this.isLoading() || this.cards().length === 0) {
      return true;
    }
    let card = { ...this.cards()[this.currentIndex()] };
    let currentDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let cardDate = new Date(parseInt(card.monthYear.substring(2, 6)), parseInt(card.monthYear.substring(0, 2)) - 1, 1);
    if (cardDate < currentDate) {
      return true;
    }
    return false;
  }

  private onSelectUser(userId: number) {
    this.swiper = this.swiperRef.nativeElement.swiper;
    let index = this.users().findIndex(u => u.userId === userId);
    this.swiper.slideTo(index);
    this.shiftService.selectedUserId.set(-1);
  }

  private isFridayOrSaturday(date: string) {
    var day = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (day.getDay() == 5 || day.getDay() == 6) {
      return true;
    }
    return false;
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
            this.shiftService.users.set(_users);
            this.cards.set(_cards);
            setTimeout(() => {
              this.slideToCard(this.currentIndex());
            }, 100)
          } else {
            this.shiftService.users.set([]);
            this.cards.set([]);
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