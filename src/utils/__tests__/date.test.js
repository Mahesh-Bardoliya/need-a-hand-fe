import { timeAgo } from '../date';

describe('timeAgo', () => {
  const now = new Date();

  it('returns "Just now" for dates less than a minute ago', () => {
    expect(timeAgo(new Date(now - 30_000))).toBe('Just now');
  });

  it('returns minutes ago for dates within an hour', () => {
    expect(timeAgo(new Date(now - 5 * 60_000))).toBe('5m ago');
  });

  it('returns 1 minute ago', () => {
    expect(timeAgo(new Date(now - 60_000))).toBe('1m ago');
  });

  it('returns hours ago for dates within a day', () => {
    expect(timeAgo(new Date(now - 3 * 3600_000))).toBe('3h ago');
  });

  it('returns 1 hour ago', () => {
    expect(timeAgo(new Date(now - 3600_000))).toBe('1h ago');
  });

  it('returns days ago for dates more than a day ago', () => {
    expect(timeAgo(new Date(now - 2 * 86400_000))).toBe('2d ago');
  });

  it('handles ISO string dates', () => {
    const yesterday = new Date(now - 86400_000).toISOString();
    expect(timeAgo(yesterday)).toBe('1d ago');
  });

  it('returns empty string for null/undefined input', () => {
    expect(timeAgo(null)).toBe('');
    expect(timeAgo(undefined)).toBe('');
  });

  it('returns empty string for empty string input', () => {
    expect(timeAgo('')).toBe('');
  });
});
