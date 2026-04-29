import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Setup from '../Setup';

describe('3. Формаларды тестілеу (Forms Testing)', () => {
  it('Бос форма жібергенде немесе бірдей ойыншылар болғанда қате хабарлама шығады', () => {
    // LocalStorage бос болған кезде ойыншылар аттары бос ('') болады
    render(<Setup onStart={() => {}} onBack={() => {}} />);
    
    // "Бастау" батырмасын басу
    const submitBtn = screen.getByText(/Бастау/i);
    fireEvent.click(submitBtn);
    
    // Бос форма жіберген кезде қате шығуын тексеру
    expect(screen.getByText(/Екі ойыншының атын енгізіңіз!|Ойыншылардың аттары бірдей болмауы керек!/i)).toBeDefined();
  });
});
