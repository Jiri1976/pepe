import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SpinnerDirective } from '../../directives/spinner.directive';

@Component({
    selector: 'app-spinner',
    imports: [CommonModule],
    templateUrl: './spinner.component.html',
    styleUrl: './spinner.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [
        {
            directive: SpinnerDirective,
            inputs: ['nullWidthHeight', 'marginTop']
        }
    ]
})
export class SpinnerComponent { }
