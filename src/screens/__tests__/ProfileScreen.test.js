import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../ProfileScreen';
import { AuthContext } from '../../context/AuthContext';

jest.mock('@expo/vector-icons', () => ({ Feather: 'Icon' }));
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useFocusEffect: (cb) => require('react').useEffect(() => { cb(); }, []),
  };
});

const mockNavigation = { navigate: jest.fn() };

const mockUser = {
  name: 'Jane Doe',
  username: 'janedoe',
  email: 'jane@test.com',
  uuid: 'user-uuid-1',
  total_help_requests_count: 3,
  total_help_offers_count: 2,
  help_requests: [
    {
      uuid: 'req-1',
      title: 'Help moving boxes',
      location: 'City',
      is_active: true,
      help_offers: [],
      created_at: new Date().toISOString(),
    },
  ],
  help_offers: [
    {
      uuid: 'offer-1',
      help_request_title: 'Help with garden',
      help_request_uuid: 'req-2',
      message: 'I can help!',
      is_accepted: true,
      created_at: new Date().toISOString(),
    },
  ],
};

describe('ProfileScreen', () => {
  const mockLogout = jest.fn();
  const mockFetchProfile = jest.fn();

  const renderScreen = (userOverride = mockUser) =>
    render(
      <AuthContext.Provider value={{
        user: userOverride,
        logout: mockLogout,
        isLoading: false,
        fetchProfile: mockFetchProfile,
      }}>
        <ProfileScreen navigation={mockNavigation} />
      </AuthContext.Provider>
    );

  beforeEach(() => jest.clearAllMocks());

  it('renders the user name, username and email', () => {
    const { getByText } = renderScreen();
    expect(getByText('Jane Doe')).toBeTruthy();
    expect(getByText('@janedoe')).toBeTruthy();
    expect(getByText('jane@test.com')).toBeTruthy();
  });

  it('renders stat counts', () => {
    const { getByText } = renderScreen();
    expect(getByText('3')).toBeTruthy(); // total_help_requests_count
    expect(getByText('2')).toBeTruthy(); // total_help_offers_count
  });

  it('renders help request items', () => {
    const { getByText } = renderScreen();
    expect(getByText('Help moving boxes')).toBeTruthy();
  });

  it('renders help offers items with accepted state', () => {
    const { getByText, getAllByText } = renderScreen();
    expect(getByText('Help with garden')).toBeTruthy();
    expect(getAllByText('Accepted').length).toBeGreaterThan(0);
  });

  it('shows loading spinner when user is null', () => {
    const { UNSAFE_getByType } = renderScreen(null);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('calls fetchProfile on mount', () => {
    renderScreen();
    expect(mockFetchProfile).toHaveBeenCalled();
  });
});
