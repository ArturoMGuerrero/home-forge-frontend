import * as XLSX from 'xlsx';

export type ExportColumn<T> = {
  header: string;
  key: keyof T | ((item: T) => string | number | boolean | null | undefined);
  width?: number;
};

export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  sheetName: string = 'Datos'
) {
  // Crear las filas con headers
  const headers = columns.map(col => col.header);

  // Crear las filas de datos
  const rows = data.map(item =>
    columns.map(col => {
      if (typeof col.key === 'function') {
        return col.key(item);
      }
      return item[col.key];
    })
  );

  // Combinar headers y datos
  const worksheetData = [headers, ...rows];

  // Crear el worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Aplicar anchos de columna si se especificaron
  const columnWidths = columns.map(col => ({
    wch: col.width || 15
  }));
  worksheet['!cols'] = columnWidths;

  // Crear el workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generar el archivo
  const timestamp = new Date().toISOString().slice(0, 10);
  const fullFileName = `${fileName}-${timestamp}.xlsx`;

  // Descargar
  XLSX.writeFile(workbook, fullFileName);
}

export function formatCurrency(value: number | undefined, currency: string = 'MXN'): string {
  if (value === undefined) return '';
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(date: string | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-MX');
}

export function formatDateTime(date: string | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
