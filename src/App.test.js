import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '@testing-library/jest-dom';

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

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Verifica que se muestre el mensaje de bienvenida
  test('renders welcome message', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText('Welcome to Mini X')).toBeInTheDocument();
  });

  // Test 2: Verifica que se muestre el formulario de login
  test('renders login form', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText('Enter your Gmail address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  // Test 3: Verifica la validación del formato de email
  test('validates email format', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByPlaceholderText('Enter your Gmail address'), {
      target: { value: 'invalid@hotmail.com' }
    });
    fireEvent.click(screen.getByText('Sign Up'));

    expect(screen.getByText('Only Gmail accounts are allowed. Please use a valid Gmail address.')).toBeInTheDocument();
  });
});
