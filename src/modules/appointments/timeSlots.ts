/** Horarios cada 30 minutos (00:00 ... 23:30) para los selectores de hora de las citas. */
export const timeSlots: string[] = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0');
  return `${hour}:${index % 2 === 0 ? '00' : '30'}`;
});

export const timeSlotOptions = timeSlots.map(slot => ({ value: slot, label: slot }));
