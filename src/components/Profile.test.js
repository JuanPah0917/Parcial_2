import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';
import '@testing-library/jest-dom';

// Mock Sentry
jest.mock('@sentry/react', () => ({
  captureException: jest.fn()
}));

// Mock navegación
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock Firebase
jest.mock('../firebaseConfig', () => ({
  auth: {
    currentUser: {
      uid: 'test-uid',
      email: 'test@gmail.com'
    },
    signOut: jest.fn().mockResolvedValue()
  },
  db: {
    collection: jest.fn()
  }
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({
    docs: []
  }),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(),
  doc: jest.fn(),
  deleteDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  increment: jest.fn(),
  addDoc: jest.fn()
}));

describe('Profile Component', () => {
  const mockSetEmail = jest.fn();
  const mockSetPassword = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Verifica que se renderice el perfil
  test('renders profile page correctly', async () => {
    render(
      <BrowserRouter>
        <Profile setEmail={mockSetEmail} setPassword={mockSetPassword} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
      expect(screen.getByText('Create a New Post')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  // Test 2: Verifica la funcionalidad de cierre de sesión
  test('handles sign out correctly', async () => {
    render(
      <BrowserRouter>
        <Profile setEmail={mockSetEmail} setPassword={mockSetPassword} />
      </BrowserRouter>
    );

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockSetEmail).toHaveBeenCalledWith('');
      expect(mockSetPassword).toHaveBeenCalledWith('');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // Test 3: Verifica el mensaje cuando no hay posts
  test('shows empty state message when no posts', async () => {
    render(
      <BrowserRouter>
        <Profile setEmail={mockSetEmail} setPassword={mockSetPassword} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('You have no posts yet.')).toBeInTheDocument();
    });
  });
});