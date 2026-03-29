# Design System — Liquid Glass

Натхнення: Apple Liquid Design (macOS Tahoe / iOS 26).
Ключові принципи: прозорість, глибина, м'якість, плавність.

---

## Філософія

- **Glassmorphism** — frosted glass ефекти з `backdrop-filter: blur()`
- **Depth through layers** — фон → підкладка → карточки → елементи
- **Generous spacing** — багато повітря, 8px grid
- **Fluid motion** — плавні анімації, spring-based transitions
- **Minimal chrome** — мінімум рамок і ліній, розділення через простір та розмиття

---

## Кольори

### Base Palette

```scss
// Background layers (light mode)
$bg-base:        #F2F1F6;           // основний фон (сірувато-фіолетовий)
$bg-elevated:    rgba(255, 255, 255, 0.72);  // піднята поверхня (glass card)
$bg-overlay:     rgba(255, 255, 255, 0.52);  // модальна підкладка

// Background layers (dark mode)
$bg-base-dark:       #1C1C1E;
$bg-elevated-dark:   rgba(44, 44, 46, 0.72);
$bg-overlay-dark:    rgba(44, 44, 46, 0.52);

// Text
$text-primary:    #1D1D1F;          // заголовки, основний текст
$text-secondary:  #6E6E73;          // підписи, мета
$text-tertiary:   #AEAEB2;          // плейсхолдери
$text-primary-dark:   #F5F5F7;
$text-secondary-dark: #98989D;

// Accent (primary action color)
$accent:          #007AFF;          // Apple Blue
$accent-hover:    #0056CC;
$accent-light:    rgba(0, 122, 255, 0.12);  // фон для виділення
```

### Semantic Colors

```scss
// Rating scale (1-5)
$rating-1:  #FF3B30;   // червоний — погано
$rating-2:  #FF9500;   // помаранчевий — нижче середнього
$rating-3:  #FFCC00;   // жовтий — середньо
$rating-4:  #34C759;   // зелений — добре
$rating-5:  #30D158;   // яскраво-зелений — відмінно

// Status (tasks)
$status-not-started:  #8E8E93;   // сірий
$status-in-progress:  #007AFF;   // синій
$status-done:         #34C759;   // зелений

// Priority
$priority-high:    #FF3B30;
$priority-medium:  #FF9500;
$priority-low:     #8E8E93;

// Metric group accents (для графіків та іконок)
$group-productivity:   #007AFF;   // синій
$group-brain-rot:      #AF52DE;   // фіолетовий
$group-health:         #34C759;   // зелений
$group-mental-health:  #5AC8FA;   // блакитний
$group-relationships:  #FF2D55;   // рожевий
```

---

## Типографіка

```scss
// Font stack (Apple-like)
$font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
              'Helvetica Neue', 'Segoe UI', system-ui, sans-serif;

// Scale (modular, base 16px)
$font-size-xs:     12px;    // мета, timestamps
$font-size-sm:     14px;    // підписи, secondary text
$font-size-base:   16px;    // основний текст
$font-size-lg:     20px;    // section headers
$font-size-xl:     24px;    // page titles
$font-size-2xl:    34px;    // hero numbers (Overall Score)
$font-size-3xl:    48px;    // великий score display

// Weights
$font-weight-regular:   400;
$font-weight-medium:    500;
$font-weight-semibold:  600;
$font-weight-bold:      700;

// Line heights
$line-height-tight:    1.2;    // заголовки
$line-height-normal:   1.5;    // текст
$line-height-relaxed:  1.7;    // довгий текст
```

---

## Spacing (8px grid)

```scss
$space-1:   4px;
$space-2:   8px;
$space-3:   12px;
$space-4:   16px;
$space-5:   20px;
$space-6:   24px;
$space-8:   32px;
$space-10:  40px;
$space-12:  48px;
$space-16:  64px;
```

---

## Glass Effects

```scss
// Primary glass card
@mixin glass-card {
  background: $bg-elevated;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.08);
}

// Subtle glass (navigation, sidebar)
@mixin glass-subtle {
  background: rgba(255, 255, 255, 0.52);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

// Inset / input field
@mixin glass-inset {
  background: rgba(118, 118, 128, 0.08);
  border-radius: 10px;
  border: none;
}

// Dark mode overrides
@mixin glass-card-dark {
  background: $bg-elevated-dark;
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.3);
}
```

---

## Border Radius

```scss
$radius-sm:    8px;     // кнопки, інпути, чіпи
$radius-md:    12px;    // менші карточки, dropdown
$radius-lg:    16px;    // основні карточки
$radius-xl:    20px;    // великі секції
$radius-full:  9999px;  // pills, аватари
```

---

## Shadows

```scss
// Layered shadows (Apple style — завжди декілька шарів)
$shadow-sm:
  0 1px 2px rgba(0, 0, 0, 0.04),
  0 2px 8px rgba(0, 0, 0, 0.06);

$shadow-md:
  0 2px 8px rgba(0, 0, 0, 0.04),
  0 8px 32px rgba(0, 0, 0, 0.08);

$shadow-lg:
  0 4px 16px rgba(0, 0, 0, 0.06),
  0 16px 48px rgba(0, 0, 0, 0.12);

// Glow (for accent elements)
$shadow-glow: 0 4px 16px rgba(0, 122, 255, 0.3);
```

---

## Анімації

```scss
// Transitions
$transition-fast:    150ms cubic-bezier(0.4, 0, 0.2, 1);
$transition-normal:  250ms cubic-bezier(0.4, 0, 0.2, 1);
$transition-slow:    400ms cubic-bezier(0.4, 0, 0.2, 1);

// Spring-like (for interactive elements)
$transition-spring:  500ms cubic-bezier(0.34, 1.56, 0.64, 1);

// Scale on press
@mixin press-effect {
  transition: transform $transition-fast;
  &:active {
    transform: scale(0.97);
  }
}

// Fade in (for page/card entrance)
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## Компоненти — Design Tokens

### Rating Selector (1-5)
- 5 кнопок в ряд, pill-shaped
- Невибрані: `glass-inset` стиль
- Вибрана: заповнена кольором відповідної оцінки (`$rating-1` ... `$rating-5`)
- Плавна анімація переходу кольору
- Touch target: мінімум 44x44px (Apple HIG)

### Glass Card
- `glass-card` mixin
- Padding: `$space-5` (20px)
- Rounded: `$radius-lg` (16px)
- Hover: підняття тіні (`$shadow-md` → `$shadow-lg`)

### Navigation
- Bottom tab bar на мобільному (5 вкладок: Rating, Reports, Tasks, Notes, Settings)
- Sidebar на десктопі
- `glass-subtle` mixin для фону навігації
- Active tab: accent color + subtle glow

### Buttons
- Primary: solid `$accent`, білий текст, `$radius-sm`
- Secondary: `glass-inset`, `$text-primary`, `$radius-sm`
- Ghost: transparent, accent text
- Всі: `press-effect` mixin, min height 44px

### Input Fields
- `glass-inset` mixin
- Padding: `$space-3` `$space-4`
- Focus: subtle `$accent` ring (box-shadow)
- Placeholder: `$text-tertiary`

---

## Responsive Breakpoints

```scss
$breakpoint-sm:   640px;    // мобільний landscape
$breakpoint-md:   768px;    // планшет
$breakpoint-lg:   1024px;   // десктоп
$breakpoint-xl:   1280px;   // широкий десктоп

// Mobile-first mixins
@mixin tablet  { @media (min-width: $breakpoint-md) { @content; } }
@mixin desktop { @media (min-width: $breakpoint-lg) { @content; } }
```

### Layout
- **Mobile** (<768px): single column, bottom tab bar, cards full-width
- **Tablet** (768-1023px): wider cards, optional sidebar
- **Desktop** (1024px+): sidebar navigation, multi-column where appropriate

---

## Dark Mode

- Автоматичне перемикання через `prefers-color-scheme`
- Ручний toggle в Settings
- Всі кольори мають dark-варіанти
- Glass ефекти працюють в обох режимах (різна прозорість)
