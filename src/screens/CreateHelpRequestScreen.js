import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { helpRequestsAPI } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { extractErrorMessage } from '../utils/errors';

export default function CreateHelpRequestScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!title.trim() || !description.trim() || !location.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    animateButton();
    setSubmitting(true);
    try {
      const res = await helpRequestsAPI.create(title.trim(), description.trim(), location.trim());
      Alert.alert(
        'Posted!',
        'Your help request has been submitted. The community will see it shortly.',
        [{
          text: 'View it', onPress: () => {
            navigation.replace('HelpRequestDetail', { uuid: res.data.uuid });
          }
        }]
      );
    } catch (e) {
      Alert.alert('Error', extractErrorMessage(e, 'Failed to create request.'));
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = description.length;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Feather name="heart" size={32} color="#fff" style={styles.headerEmoji} />
          <View>
            <Text style={styles.headerTitle}>Ask for Help</Text>
            <Text style={styles.headerSubtitle}>Your community is here for you</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="What do you need help with?"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              returnKeyType="next"
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWithIcon}>
              <Feather name="map-pin" size={16} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputInner]}
                placeholder="Where do you need help? (e.g. Downtown, Park Ave)"
                placeholderTextColor={COLORS.textMuted}
                value={location}
                onChangeText={setLocation}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
              <Text style={[styles.charCount, charCount > 800 && styles.charCountWarn]}>
                {charCount}/1000
              </Text>
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Describe what kind of help you need. The more details, the better your chances of getting help!"
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
          </View>

          {/* Tips */}
          <View style={styles.tipsBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Feather name="info" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.tipsTitle}>Tips for a better response</Text>
            </View>
            <Text style={styles.tipItem}>• Be specific about what you need</Text>
            <Text style={styles.tipItem}>• Include when you need help (urgency)</Text>
            <Text style={styles.tipItem}>• Mention any special requirements</Text>
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.9}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Post Help Request</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: 12,
    ...SHADOW.lg,
  },
  headerEmoji: { marginRight: 2 },
  headerTitle: { fontSize: 18, color: '#fff', ...FONTS.bold },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOW.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    ...FONTS.semiBold,
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  required: { color: COLORS.error },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 52,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
  },
  inputIcon: { marginRight: 8 },
  inputInner: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  textArea: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 130,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  charCountWarn: { color: COLORS.warning },
  tipsBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  tipsTitle: { fontSize: 13, color: COLORS.primary, ...FONTS.semiBold },
  tipItem: { fontSize: 12, color: COLORS.primary, lineHeight: 22 },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.lg,
    marginBottom: SPACING.sm,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, ...FONTS.bold },
  cancelBtn: {
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.textSecondary, ...FONTS.medium, fontSize: 14 },
});
