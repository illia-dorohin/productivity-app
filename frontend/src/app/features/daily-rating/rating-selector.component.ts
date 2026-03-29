import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-rating-selector',
  imports: [],
  template: `
    <div class="rating-selector" role="radiogroup" [attr.aria-label]="description() ?? 'Rating'">
      @for (n of options; track n) {
        <button
          class="rating-btn"
          [class.selected]="value() === n"
          [class]="'rating-' + n"
          [attr.aria-checked]="value() === n"
          role="radio"
          (click)="select(n)"
        >
          {{ n }}
        </button>
      }
    </div>
  `,
  styles: `
    @use '../../../styles/variables' as *;
    @use '../../../styles/mixins' as *;

    .rating-selector {
      display: flex;
      gap: $space-2;
    }

    .rating-btn {
      width: 44px;
      height: 44px;
      border-radius: $radius-full;
      @include glass-inset;
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-secondary;
      transition: all $transition-normal;
      @include press-effect;

      &.selected {
        color: white;
        box-shadow: $shadow-sm;
        transform: scale(1.05);
      }

      &.selected.rating-1 { background: $rating-1; }
      &.selected.rating-2 { background: $rating-2; }
      &.selected.rating-3 { background: $rating-3; color: $text-primary; }
      &.selected.rating-4 { background: $rating-4; }
      &.selected.rating-5 { background: $rating-5; }
    }

    @media (prefers-color-scheme: dark) {
      .rating-btn {
        background: rgba(118, 118, 128, 0.18);
        color: $text-secondary-dark;
      }
    }
  `,
})
export class RatingSelectorComponent {
  readonly value = input(0);
  readonly description = input<string | undefined>();
  readonly valueChange = output<number>();

  readonly options = [1, 2, 3, 4, 5];

  select(n: number): void {
    this.valueChange.emit(n);
  }
}
