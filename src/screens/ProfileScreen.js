import React, { useContext, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { timeAgo } from '../utils/date';

export default function ProfileScreen({ navigation }) {
  const { user, logout, isLoading, fetchProfile } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>{user.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userUsername}>@{user.username}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.total_help_requests_count ?? 0}</Text>
            <Text style={styles.statLabel}>Requests</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.total_help_offers_count ?? 0}</Text>
            <Text style={styles.statLabel}>Offers Given</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>
              {user.help_offers?.filter((o) => o.is_accepted).length ?? 0}
            </Text>
            <Text style={styles.statLabel}>Accepted Offers</Text>
          </View>
        </View>
      </View>

      {/* My Help Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Help Requests</Text>
          <Text style={styles.sectionCount}>{user.help_requests?.length || 0}</Text>
        </View>
        {user.help_requests?.length === 0 && (
          <View style={styles.emptySection}>
            <Feather name="list" size={32} color={COLORS.textMuted} style={styles.emptyEmoji} />
            <Text style={styles.emptyText}>No help requests yet</Text>
          </View>
        )}
        {user.help_requests?.map((req) => (
          <TouchableOpacity
            key={req.uuid}
            style={styles.requestItem}
            onPress={() => navigation.navigate('Home', {
              screen: 'HelpRequestDetail',
              params: { uuid: req.uuid },
            })}
            activeOpacity={0.8}
          >
            <View style={styles.requestItemLeft}>
              <View style={[styles.requestDot, req.is_active ? styles.dotActive : styles.dotInactive]} />
              <View style={styles.requestItemContent}>
                <Text style={styles.requestItemTitle} numberOfLines={1}>{req.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                  <Feather name="map-pin" size={11} color={COLORS.textMuted} style={{ marginRight: 2 }} />
                  <Text style={styles.requestItemMeta}>{req.location}  ·  </Text>
                  <Feather name="message-circle" size={11} color={COLORS.textMuted} style={{ marginRight: 2 }} />
                  <Text style={styles.requestItemMeta}>{req.help_offers?.length || 0} offers  ·  {timeAgo(req.created_at)}</Text>
                </View>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.textMuted} style={styles.chevron} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Offers I've Made */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Offers I've Made</Text>
          <Text style={styles.sectionCount}>{user.help_offers?.length || 0}</Text>
        </View>
        {user.help_offers?.length === 0 && (
          <View style={styles.emptySection}>
            <Feather name="heart" size={32} color={COLORS.textMuted} style={styles.emptyEmoji} />
            <Text style={styles.emptyText}>You haven't offered help yet</Text>
          </View>
        )}
        {user.help_offers?.map((offer) => (
          <View key={offer.uuid} style={styles.offerItem}>
            <View style={styles.offerItemLeft}>
              {offer.is_accepted ? (
                <View style={styles.offerAccepted}>
                  <Feather name="check" size={16} color={COLORS.success} />
                </View>
              ) : (
                <View style={styles.offerPending}>
                  <Feather name="clock" size={16} color="#D97706" />
                </View>
              )}
              <View style={styles.offerItemContent}>
                <Text style={styles.offerItemTitle} numberOfLines={1}>
                  {offer.help_request_title}
                </Text>
                <Text style={styles.offerItemMeta} numberOfLines={1}>
                  "{offer.message}"
                </Text>
                <Text style={styles.offerItemTime}>{timeAgo(offer.created_at)}</Text>
              </View>
            </View>
            {offer.is_accepted && (
              <View style={styles.acceptedTag}>
                <Text style={styles.acceptedTagText}>Accepted</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.error} size="small" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="log-out" size={16} color={COLORS.error} style={{ marginRight: 8 }} />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarLargeText: {
    fontSize: 40,
    color: '#fff',
    ...FONTS.bold,
  },
  userName: {
    fontSize: 22,
    color: '#fff',
    ...FONTS.bold,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    color: '#fff',
    ...FONTS.extraBold,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 4,
  },
  section: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    ...FONTS.bold,
  },
  sectionCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    ...SHADOW.sm,
  },
  emptyEmoji: { marginBottom: 6 },
  emptyText: { fontSize: 13, color: COLORS.textMuted },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  requestItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requestDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: { backgroundColor: COLORS.success },
  dotInactive: { backgroundColor: COLORS.error },
  requestItemContent: { flex: 1 },
  requestItemTitle: {
    fontSize: 14,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
    marginBottom: 4,
  },
  requestItemMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  offerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  offerItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  offerAccepted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerAcceptedText: { fontSize: 14 },
  offerPending: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerPendingText: { fontSize: 14 },
  offerItemContent: { flex: 1 },
  offerItemTitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
    marginBottom: 3,
  },
  offerItemMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  offerItemTime: { fontSize: 11, color: COLORS.textMuted },
  acceptedTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginLeft: 8,
  },
  acceptedTagText: {
    fontSize: 11,
    color: COLORS.success,
    ...FONTS.semiBold,
  },
  logoutBtn: {
    height: 56,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  logoutBtnText: {
    color: COLORS.error,
    fontSize: 16,
    ...FONTS.semiBold,
  },
});
