import { Component, DestroyRef, inject, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA, ElementRef, computed, effect, viewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { ShiftService } from '../../services/shift.service';
import { tap } from 'rxjs';
import { ShiftCard } from '../../models/shifts/shiftCard.interface';
import { ShiftCardComponent } from '../../components/shifts/shift-card/shift-card.component';
import Swiper from 'swiper';
import { ShiftsNavComponent } from "../../components/shifts/shifts-nav/shifts-nav.component";
import { FormsModule } from '@angular/forms';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { Shift } from '../../models/shifts/shift.interface';
import { UniqueUser } from '../../models/shifts/uniqueUser.interface';
import { Dialog } from '@angular/cdk/dialog';
import { ShiftFormComponent } from '../../components/shifts/shift-form/shift-form.component';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-plans',
  imports: [
    ConfirmComponent,
    DialogModule,
    ButtonModule,
    ShiftCardComponent,
    ShiftsNavComponent,
    DatePicker,
    DatePickerModule,
    FormsModule
  ],
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShiftsComponent implements OnInit {
  private swiper!: Swiper;
  private MONTHS = ["LEDEN", "ÚNOR", "BŘEZEN", "DUBEN", "KVĚTEN", "ČERVEN", "ČERVENEC", "SRPEN", "ZÁŘÍ", "ŘÍJEN", "LISTOPAD", "PROSINEC"];
  private MONTHS_NAMES = ["LED", "ÚNO", "BŘE", "DUB", "KVĚ", "ČER", "ČRV", "SRP", "ZÁŘ", "ŘÍJ", "LIS", "PRO"];
  private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  private authService = inject(AuthService);
  private shiftService = inject(ShiftService);
  private destroyRef = inject(DestroyRef);
  private toaster = inject(ToasterService);
  private dialog = inject(Dialog);
  monthYear = signal<string>(this.MONTHS_NUM[new Date().getMonth()] + new Date().getFullYear());
  loggedUser = this.authService.getUser();
  destination = signal(this.loggedUser.role === 'Master' ? this.loggedUser.destination : 'F-M');
  isLoading = signal(false);
  selectedUserId = computed(() => this.shiftService.selectedUserId());
  currentIndex = signal<number>(0);
  calendarText = signal<string>(this.MONTHS_NAMES[new Date().getMonth()] + ' ' + new Date().getFullYear().toString().substring(2));
  pdfOn = signal(false);
  empty = new Array(45);
  defaultDate = new Date(new Date().getFullYear(), new Date().getMonth());
  maxDate: Date = new Date(new Date().getFullYear(), new Date().getMonth());
  uniqueUsers = computed(() => this.shiftService.uniqueUsers());
  calendar = viewChild<DatePicker>('calendar');
  swiperRef = viewChild<ElementRef>('swiperRef');

  ngOnInit(): void {
    this.getCards();
  }

  formShiftEffect = effect(() => {
    if (this.selectedUserId() > -1) {
      this.onSelectUser(this.selectedUserId());
    }
  })

  onSwiperInit(event: any) {
    setTimeout(() => {
      const swiper = (this.swiperRef()?.nativeElement as any).swiper;
      if (swiper) {
        swiper.on('slideChange', () => { });
      }
    });
  }

  onSlideChange(event: Event) {
    const swiperInstance = (event.target as any).swiper as Swiper;
    this.shiftService.selectedCard.set(this.uniqueUsers()[swiperInstance.activeIndex].cards[0]);
    this.currentIndex.set(swiperInstance.activeIndex);
  }

  slideToCard(index: number) {
    this.swiper = this.swiperRef()?.nativeElement.swiper;
    this.swiper.slideTo(index);
  }

  onSelectDestination(destination: string) {
    this.destination.set(destination);
    this.currentIndex.set(0);
    this.getCards();
  }

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
    let date = this.calendar()?.value;
    let _monthYear = this.MONTHS_NUM[new Date(date).getMonth()] + new Date(date).getFullYear();
    this.monthYear.set(_monthYear);
    this.calendarText.set(this.MONTHS_NAMES[new Date(date).getMonth()] + ' ' + new Date(date).getFullYear().toString().substring(2));
    this.currentIndex.set(0);
    this.getCards();
  }

  onAllToPdf() {
    this.pdfOn.set(true);
    const subscription = this.shiftService.generateAllToPDF(this.shiftService.pdfCards(), this.destination()).pipe(
      tap(response => {
        if (response === null) {
          this.pdfOn.set(false);
          this.toaster.error('Něco se pokazilo, zkus to znovu.');
        } else if (response.isSuccess === false) {
          this.pdfOn.set(false);
          this.toaster.error(response.errorMessage);
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
      error: () => this.pdfOn.set(false)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onReset() {
    if (this.uniqueUsers().length > 0) {
      const swiper = (this.swiperRef()?.nativeElement as any).swiper;
      swiper.allowTouchMove = true;
    }
    this.currentIndex.set(0);
    this.getCards();
  }

  toggleSwipping(disable: boolean) {
    const swiper = (this.swiperRef()?.nativeElement as any).swiper;
    if (!disable) {
      swiper.allowTouchMove = false;
    } else {
      swiper.allowTouchMove = true;
    }
  }

  onAddShift() {
    if (this.uniqueUsers().length === 0) {
      return;
    }

    this.shiftService.setMonthYear(this.shiftService.selectedCard()!.monthYear);
    let _shift: Shift = {
      id: 0,
      shiftCardId: this.shiftService.selectedCard()!.id,
      userId: this.shiftService.selectedCard()!.userId,
      position: this.shiftService.selectedCard()!.userPosition,
      destination: this.shiftService.selectedCard()!.destination,
      date: '',
      from: '11:00',
      to: '22:00',
      hours: '',
      perso: ''
    }

    if (this.isPastCard()) {
      _shift.date = `01.${this.shiftService.selectedCard()!.monthYear.substring(0, 2)}.${this.shiftService.selectedCard()!.monthYear.substring(2, 6)}`;
    } else {
      let day = new Date().getDate() < 10 ? '0' + new Date().getDate() : (new Date().getDate()).toString();
      _shift.date = `${day}.${this.shiftService.selectedCard()!.monthYear.substring(0, 2)}.${this.shiftService.selectedCard()!.monthYear.substring(2, 6)}`;
      _shift.to = this.isFridayOrSaturday(_shift.date) ? '23:00' : '22:00';
    }
    this.shiftService.setSelectedShift(_shift);
    this.dialog.open(ShiftFormComponent, { disableClose: false });
  }

  isPastCard() {
    if (this.isLoading() || this.uniqueUsers().length === 0) {
      return true;
    }

    let currentDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let cardDate = new Date(parseInt(this.monthYear().substring(2, 6)), parseInt(this.monthYear().substring(0, 2)) - 1, 1);
    if (cardDate < currentDate) {
      return true;
    }
    return false;
  }

  missingCardsMessage() {
    if (this.isPastCard()) {
      return `Směny pro ${this.MONTHS[parseInt(this.monthYear().substring(0, 2)) - 1].toLowerCase()} ${this.monthYear().substring(2, 6)} nejsou uloženy.`;
    } else {
      return `Chybí uživatelé na pobočce - ${this.destination()}.`;
    }
  }

  private filterUsers(cards: ShiftCard[]) {
    let unique: UniqueUser[] = [];
    cards.forEach((card) => {
      let isListed = false;
      let isListedIndex = -1;
      unique.forEach((uni, index) => {
        if (card.userId === uni.userId) {
          isListed = true;
          isListedIndex = index;
        }
      });

      if (isListed) {
        unique[isListedIndex].cards.push(card);
      } else {
        unique.push({
          userId: card.userId,
          userName: card.userName,
          userSurname: card.userSurname,
          cards: [card]
        });
      }
    });
    this.shiftService.uniqueUsers.set(unique);
    this.shiftService.selectedCard.set(this.uniqueUsers()[0].cards[0]);
    this.shiftService.checkAllToPdf()
  }

  private onSelectUser(userId: number) {
    this.swiper = this.swiperRef()?.nativeElement.swiper;
    let index = this.uniqueUsers().findIndex(u => u.userId === userId);
    this.shiftService.selectedCard.set(this.uniqueUsers()[index].cards[0]);
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
          this.isLoading.set(false);
          this.toaster.error('Něco se pokazilo, zkus to znovu.');
        } else if (response.isSuccess === false) {
          this.isLoading.set(false);
          this.toaster.error(response.errorMessage);
        } else if (response.isSuccess === true) {
          if (response.result.length > 0) {
            this.filterUsers(response.result);
            setTimeout(() => {
              this.slideToCard(this.currentIndex());
            }, 100);
          } else {
            this.shiftService.uniqueUsers.set([]);
            this.shiftService.checkAllToPdf();
          }
          this.isLoading.set(false);
        }
      }),
    ).subscribe({
      next: () => { },
      error: () => this.isLoading.set(false)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}