import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';
import { AuthContext } from '../../context/AuthContext';
import { helpRequestsAPI } from '../../api/client';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock focus effect - use useEffect to simulate focus
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useFocusEffect: (callback) => {
      require('react').useEffect(() => {
        callback();
      }, []);
    },
  };
});

// Mock API
jest.mock('../../api/client', () => ({
  helpRequestsAPI: {
    paginate: jest.fn(),
  },
}));

// Mock Feather icons
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Icon',
}));

const mockRequests = {
  data: {
    items: [
      {
        uuid: '1',
        title: 'Help moving couch',
        description: 'Need help moving a heavy couch',
        location: 'Downtown',
        is_active: true,
        created_at: new Date().toISOString(),
        user: { name: 'John Doe' },
        help_offers: [],
      },
      {
        uuid: '2',
        title: 'Fixing laptop',
        description: 'Screen is broken',
        location: 'Uptown',
        is_active: false,
        created_at: new Date().toISOString(),
        user: { name: 'Jane Smith' },
        help_offers: [1],
      },
    ],
  },
};

describe('HomeScreen', () => {
  const mockUser = { name: 'Test User' };

  beforeEach(() => {
    jest.clearAllMocks();
    helpRequestsAPI.paginate.mockResolvedValue(mockRequests);
  });

  const renderHomeScreen = () => {
    return render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <HomeScreen navigation={mockNavigation} />
      </AuthContext.Provider>
    );
  };

  it('renders correctly and fetches data on mount', async () => {
    const { getByText } = renderHomeScreen();
    
    expect(getByText('Hello, Test ')).toBeTruthy();
    
    await waitFor(() => {
      expect(helpRequestsAPI.paginate).toHaveBeenCalled();
      expect(getByText('Help moving couch')).toBeTruthy();
    });
  });

  it('updates search when typing', async () => {
    const { getByPlaceholderText } = renderHomeScreen();
    const searchInput = getByPlaceholderText('Search help requests...');
    
    fireEvent.changeText(searchInput, 'couch');
    
    await waitFor(() => {
      expect(helpRequestsAPI.paginate).toHaveBeenCalledWith(expect.objectContaining({
        search: 'couch',
      }));
    });
  });

  it('applies filters on chip press', async () => {
    const { getByText } = renderHomeScreen();
    
    await waitFor(() => expect(helpRequestsAPI.paginate).toHaveBeenCalled());

    const activeFilter = getByText('Active');
    fireEvent.press(activeFilter);
    
    await waitFor(() => {
      expect(helpRequestsAPI.paginate).toHaveBeenCalledWith(expect.objectContaining({
        query: { is_active: true },
      }));
    });
  });

  it('navigates to detail screen on card press', async () => {
    const { getByText } = renderHomeScreen();
    
    await waitFor(() => {
      const card = getByText('Help moving couch');
      fireEvent.press(card);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('HelpRequestDetail', { uuid: '1' });
    });
  });
});
