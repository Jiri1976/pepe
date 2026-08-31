import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-bleeding',
  imports: [],
  templateUrl: './bleeding.component.html',
  styleUrls: ['./bleeding.component.scss'],
})
export class BleedingComponent implements AfterViewInit, OnDestroy {
  @Input() label = 'Bleeding';
  @Input() href = '#';
  @Input() target: string | null = null;
  @Input() color = '#f00';
  @Input() particleCount = 3;
  @Input() minDistance = 150;
  @Input() maxDistance = 250;

  @ViewChild('box') box!: ElementRef<HTMLDivElement>;

  filterId = `gooey-${Math.random().toString(36).slice(2, 9)}`;
  private intervalId?: number;

  ngAfterViewInit(): void {
    this.intervalId = window.setInterval(() => {
      for (let i = 0; i < this.particleCount; i++) {
        this.createParticle();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }

  createParticle(): void {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const angle = Math.random() * 2 * Math.PI;
    const distance =
      this.minDistance + Math.random() * (this.maxDistance - this.minDistance);

    const dx = `${Math.cos(angle) * distance}px`;
    const dy = `${Math.sin(angle) * distance}px`;

    particle.style.setProperty('--dx', dx);
    particle.style.setProperty('--dy', dy);
    particle.style.left = '50%';
    particle.style.top = '50%';
    particle.style.background = this.color;

    this.box.nativeElement.appendChild(particle);

    setTimeout(() => particle.remove(), 2000);
  }
}
