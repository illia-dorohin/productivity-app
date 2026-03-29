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
          [class]="'level-' + (n + 3)"
          [attr.aria-checked]="value() === n"
          role="radio"
          (click)="select(n)"
        >
          {{ n > 0 ? '+' + n : n }}
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

      &.selected.level-1 { background: $rating-1; }
      &.selected.level-2 { background: $rating-2; }
      &.selected.level-3 { background: $rating-3; color: $text-primary; }
      &.selected.level-4 { background: $rating-4; }
      &.selected.level-5 { background: $rating-5; }
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
  readonly value = input<number | null>(null);
  readonly description = input<string | undefined>();
  readonly valueChange = output<number | null>();

  readonly options = [-2, -1, 0, 1, 2];

  select(n: number): void {
    this.valueChange.emit(this.value() === n ? null : n);
  }
}
