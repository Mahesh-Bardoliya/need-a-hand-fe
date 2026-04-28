import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { helpRequestsAPI, helpOffersAPI } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { extractErrorMessage } from '../utils/errors';
import { timeAgo } from '../utils/date';

export default function HelpRequestDetailScreen({ route, navigation }) {
  const { uuid } = route.params;
  const { user } = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerMessage, setOfferMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequest = async () => {
    try {
      const res = await helpRequestsAPI.getByUUID(uuid);
      setRequest(res.data);
    } catch {
      Alert.alert('Error', 'Help request not found.');
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [uuid]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequest();
  };

  const isOwner = user && request && user.uuid === request.user?.uuid;
  const hasAlreadyOffered = request?.help_offers?.some(
    (o) => o.helper?.uuid === user?.uuid
  );

  const handleDelete = () => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this help request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await helpRequestsAPI.delete(uuid);
              Alert.alert('Deleted', 'Your help request has been deleted.');
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete request.');
            }
          },
        },
      ]
    );
  };

  const handleOfferHelp = async () => {
    if (!offerMessage.trim()) {
      Alert.alert('Message required', 'Please write a message for your offer.');
      return;
    }
    setSubmitting(true);
    try {
      await helpOffersAPI.create(uuid, offerMessage.trim());
      setOfferModalVisible(false);
      setOfferMessage('');
      Alert.alert('Offer Sent!', 'Your offer to help has been submitted.');
      fetchRequest();
    } catch (e) {
      Alert.alert('Error', extractErrorMessage(e, 'Failed to submit offer.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptOffer = (offerUuid) => {
    Alert.alert(
      'Accept Offer',
      'Accept this person\'s offer to help? This will close your request.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await helpOffersAPI.accept(offerUuid);
              Alert.alert('Accepted!', 'The offer has been accepted.');
              fetchRequest();
            } catch (e) {
              Alert.alert('Error', extractErrorMessage(e, 'Failed to accept offer.'));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!request) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Status banner */}
        <View style={[styles.statusBanner, request.is_active ? styles.activeBanner : styles.inactiveBanner]}>
          <Text style={[styles.statusBannerText, request.is_active ? styles.activeText : styles.inactiveText]}>
            {request.is_active ? '● Active — Help needed!' : '○ Closed — Help found'}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Title & Meta */}
          <Text style={styles.title}>{request.title}</Text>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={14} color={COLORS.textSecondary} style={styles.metaIcon} />
            <Text style={styles.metaText}>{request.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Feather name="clock" size={14} color={COLORS.textSecondary} style={styles.metaIcon} />
            <Text style={styles.metaText}>{timeAgo(request.created_at)}</Text>
          </View>

          {/* Requestor */}
          <View style={styles.requestorCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{request.user?.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <View>
              <Text style={styles.requestorName}>{request.user?.name}</Text>
              <Text style={styles.requestorUsername}>@{request.user?.username}</Text>
            </View>
            <View style={styles.requestorStats}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="users" size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.statText}>{request.user?.total_help_requests_count} requests</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{request.description}</Text>
          </View>

          {/* Owner actions */}
          {isOwner && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Feather name="trash-2" size={16} color={COLORS.error} style={{ marginRight: 8 }} />
              <Text style={styles.deleteBtnText}>Delete Request</Text>
            </TouchableOpacity>
          )}

          {/* Offers section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Help Offers ({request.help_offers?.length || 0})
            </Text>
            {request.help_offers?.length === 0 && (
              <View style={styles.noOffers}>
                <Feather name="moon" size={36} color={COLORS.textMuted} style={styles.noOffersEmoji} />
                <Text style={styles.noOffersText}>No offers yet. Be the first to help!</Text>
              </View>
            )}
            {request.help_offers?.map((offer) => (
              <View key={offer.uuid} style={[styles.offerCard, offer.is_accepted && styles.acceptedOfferCard]}>
                <View style={styles.offerHeader}>
                  <View style={styles.offerAvatar}>
                    <Text style={styles.offerAvatarText}>{offer.helper?.name?.[0]?.toUpperCase() || '?'}</Text>
                  </View>
                  <View style={styles.offerHelperInfo}>
                    <Text style={styles.offerHelperName}>{offer.helper?.name}</Text>
                    <Text style={styles.offerHelperUsername}>@{offer.helper?.username}</Text>
                  </View>
                  {offer.is_accepted && (
                    <View style={styles.acceptedBadge}>
                      <Feather name="check" size={12} color={COLORS.success} style={{ marginRight: 4 }} />
                      <Text style={styles.acceptedBadgeText}>Accepted</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.offerMessage}>{offer.message}</Text>
                <Text style={styles.offerTime}>{timeAgo(offer.created_at)}</Text>

                {isOwner && !offer.is_accepted && request.is_active && (
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptOffer(offer.uuid)}
                  >
                    <Feather name="check" size={14} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.acceptBtnText}>Accept this offer</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Offer Help Button — only for non-owners, active requests, not already offered */}
      {!isOwner && request.is_active && !hasAlreadyOffered && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.offerBtn} onPress={() => setOfferModalVisible(true)}>
            <Feather name="heart" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.offerBtnText}>Offer to Help</Text>
          </TouchableOpacity>
        </View>
      )}

      {hasAlreadyOffered && !isOwner && (
        <View style={styles.bottomBar}>
          <View style={styles.alreadyOffered}>
            <Feather name="check-circle" size={16} color={COLORS.tag.active.text} style={{ marginRight: 8 }} />
            <Text style={styles.alreadyOfferedText}>You've already offered to help!</Text>
          </View>
        </View>
      )}

      {/* Offer Modal */}
      <Modal
        visible={offerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOfferModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.modalTitle}>Offer Your Help </Text>
              <Feather name="heart" size={20} color={COLORS.textPrimary} />
            </View>
            <Text style={styles.modalSubtitle}>Write a message to the requester</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Hi! I'd love to help you with this. I can..."
              placeholderTextColor={COLORS.textMuted}
              value={offerMessage}
              onChangeText={setOfferMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setOfferModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleOfferHelp}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Send Offer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusBanner: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeBanner: { backgroundColor: COLORS.tag.active.bg },
  inactiveBanner: { backgroundColor: COLORS.tag.inactive.bg },
  statusBannerText: { fontSize: 13, ...FONTS.semiBold },
  activeText: { color: COLORS.tag.active.text },
  inactiveText: { color: COLORS.tag.inactive.text },
  content: { padding: SPACING.md },
  title: {
    fontSize: 22,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    lineHeight: 30,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaIcon: { marginRight: 2 },
  metaText: { fontSize: 13, color: COLORS.textSecondary, ...FONTS.medium },
  requestorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
    gap: 12,
    ...SHADOW.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 18, color: COLORS.primary, ...FONTS.bold },
  requestorName: { fontSize: 15, color: COLORS.textPrimary, ...FONTS.semiBold },
  requestorUsername: { fontSize: 12, color: COLORS.textMuted },
  requestorStats: { marginLeft: 'auto' },
  statText: { fontSize: 12, color: COLORS.textSecondary },
  section: { marginTop: SPACING.lg },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  deleteBtn: {
    marginTop: SPACING.md,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteBtnText: { color: COLORS.error, ...FONTS.semiBold, fontSize: 14 },
  noOffers: { alignItems: 'center', paddingVertical: 30 },
  noOffersEmoji: { marginBottom: 8 },
  noOffersText: { fontSize: 14, color: COLORS.textSecondary },
  offerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.border,
    ...SHADOW.sm,
  },
  acceptedOfferCard: { borderLeftColor: COLORS.success },
  offerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  offerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerAvatarText: { fontSize: 14, color: COLORS.primary, ...FONTS.bold },
  offerHelperInfo: { flex: 1 },
  offerHelperName: { fontSize: 14, color: COLORS.textPrimary, ...FONTS.semiBold },
  offerHelperUsername: { fontSize: 11, color: COLORS.textMuted },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  acceptedBadgeText: { fontSize: 11, color: COLORS.success, ...FONTS.semiBold },
  offerMessage: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 6 },
  offerTime: { fontSize: 11, color: COLORS.textMuted, marginBottom: 10 },
  acceptBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: { color: '#fff', ...FONTS.semiBold, fontSize: 13 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  offerBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.lg,
  },
  offerBtnText: { color: '#fff', fontSize: 16, ...FONTS.bold },
  alreadyOffered: {
    flexDirection: 'row',
    backgroundColor: COLORS.tag.active.bg,
    height: 54,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alreadyOfferedText: { color: COLORS.tag.active.text, ...FONTS.semiBold },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, color: COLORS.textPrimary, ...FONTS.bold, marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.md },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 110,
    marginBottom: SPACING.md,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.textSecondary, ...FONTS.semiBold },
  submitBtn: {
    flex: 2,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.lg,
  },
  submitBtnText: { color: '#fff', ...FONTS.bold, fontSize: 15 },
});
