import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateHelpRequestScreen from '../CreateHelpRequestScreen';
import { AuthContext } from '../../context/AuthContext';
import { helpRequestsAPI } from '../../api/client';

jest.mock('@expo/vector-icons', () => ({ Feather: 'Icon' }));
jest.mock('../../api/client', () => ({
  helpRequestsAPI: { create: jest.fn() },
}));

const mockNavigation = { replace: jest.fn(), goBack: jest.fn() };
const mockUser = { name: 'Test User', uuid: 'user-uuid-1' };

describe('CreateHelpRequestScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  const renderScreen = () =>
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <CreateHelpRequestScreen navigation={mockNavigation} />
      </AuthContext.Provider>
    );

  it('renders all form fields', () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    expect(getByText('Ask for Help')).toBeTruthy();
    expect(getByPlaceholderText('What do you need help with?')).toBeTruthy();
    expect(getByPlaceholderText(/Where do you need help/)).toBeTruthy();
    expect(getByPlaceholderText(/Describe what kind of help/)).toBeTruthy();
  });

  it('calls helpRequestsAPI.create with correct values on submit', async () => {
    helpRequestsAPI.create.mockResolvedValueOnce({ data: { uuid: 'req-1' } });

    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('What do you need help with?'), 'Move furniture');
    fireEvent.changeText(getByPlaceholderText(/Where do you need help/), 'Downtown');
    fireEvent.changeText(
      getByPlaceholderText(/Describe what kind of help/),
      'Need 2 people to move a couch.'
    );

    fireEvent.press(getByText('Post Help Request'));

    await waitFor(() => {
      expect(helpRequestsAPI.create).toHaveBeenCalledWith(
        'Move furniture',
        'Need 2 people to move a couch.',
        'Downtown'
      );
    });
  });

  it('shows character count for title', () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    fireEvent.changeText(getByPlaceholderText('What do you need help with?'), 'Hello');
    expect(getByText('5/100')).toBeTruthy();
  });

  it('navigates back when Cancel is pressed', () => {
    const { getByText } = renderScreen();
    fireEvent.press(getByText('Cancel'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
