import { Locator } from '@playwright/test';

// A generic table component: finds cells by column header name, so tests keep working if columns move
export class DataTable {
  readonly root: Locator;

  // root is the table itself, e.g. page.getByRole('table', { name: 'vitals' })
  constructor(root: Locator) {
    this.root = root;
  }

  getRow(text: string) {
    return this.root.getByRole('row').filter({ hasText: text });
  }

  async getCell(rowText: string, columnHeader: string) {
    // Wait for the header to render before reading the column order
    await this.root.getByRole('columnheader', { name: columnHeader }).waitFor();
    const headers = await this.root.getByRole('columnheader').allInnerTexts();
    const columnIndex = headers.findIndex((header) => header.trim() === columnHeader);
    if (columnIndex === -1) {
      throw new Error(`Column "${columnHeader}" not found. Columns are: ${headers.join(', ')}`);
    }

    // nth() is fine here: a cell's position in the row is exactly what the header index tells us
    return this.getRow(rowText).getByRole('cell').nth(columnIndex);
  }
}
