interface Props { value: number; onChange: (v: number) => void; max?: number }

export default function QtyStepper({ value, onChange, max = 20 }: Props) {
  return (
    <div className="stepper" role="group" aria-label="Quantity">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(value - 1)}>−</button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}
