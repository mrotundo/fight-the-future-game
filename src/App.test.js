import { render, screen } from '@testing-library/react';
import App from './App';

test('renders game canvas', () => {
  render(<App />);
  const canvas = screen.getByTestId('game-canvas');
  expect(canvas).toBeInTheDocument();
});
