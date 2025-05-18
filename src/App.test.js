import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '@testing-library/jest-dom';
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';

// Mock navegación
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock Firebase
jest.mock('./firebaseConfig', () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    sendPasswordResetEmail: jest.fn()
  }
}));

// Crea un GrowthBook de prueba
const growthbook = new GrowthBook({
  features: {
    "show-experiment-button": { defaultValue: true }
  }
});

const renderWithProviders = (ui) => {
  return render(
    <GrowthBookProvider growthbook={growthbook}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </GrowthBookProvider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Verifica que se muestre el mensaje de bienvenida
  test('renders welcome message', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('Welcome to Mini X')).toBeInTheDocument();
  });

  // Test 2: Verifica que se muestre el formulario de login
  test('renders login form', () => {
    renderWithProviders(<App />);
    expect(screen.getByPlaceholderText('Enter your Gmail address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  // Test 3: Verifica la validación del formato de email
  test('validates email format', () => {
    renderWithProviders(<App />);
    fireEvent.change(screen.getByPlaceholderText('Enter your Gmail address'), {
      target: { value: 'invalid@hotmail.com' }
    });
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByText('Only Gmail accounts are allowed. Please use a valid Gmail address.')).toBeInTheDocument();
  });
});
