import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import Landing from '../Landing';

describe('1. Интерфейсті тестілеу (UI Testing)', () => {
  it('Басты бет дұрыс жүктелуі керек (Home page renders)', () => {
    render(<Landing onPlay={() => {}} onDatabase={() => {}} />);
    
    // Тексеру: Мәтіндердің оқылуы
    expect(screen.getByText(/QUIZ BATTLE/i)).toBeDefined();
    expect(screen.getByText(/Ойынды бастау/i)).toBeDefined();
  });
});

describe('2. Навигацияны тестілеу (Navigation)', () => {
  it('Батырмалар дұрыс бетке бағыттауы тиіс', () => {
    render(<App />);
    
    // Басында Landing беті ашылады
    const playBtn = screen.getByText(/Ойынды бастау/i);
    expect(playBtn).toBeDefined();

    // "Ойынды бастау" бассақ, Setup беті ашылады
    fireEvent.click(playBtn);
    expect(screen.getByText(/Ойын баптауы/i)).toBeDefined();
  });
});
