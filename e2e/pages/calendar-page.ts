import { type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export class CalendarPage {
  constructor(private readonly page: Page) {}

  async analyzeCriticalA11y() {
    const results = await new AxeBuilder({ page: this.page }).analyze();
    const violations = results.violations.filter((violation) =>
      ['critical'].includes(violation.impact || ''),
    );
    return { results, violations };
  }
}
