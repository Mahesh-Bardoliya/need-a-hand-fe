import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { Feather } from '@expo/vector-icons';

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, authError, clearError } = useContext(AuthContext);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = async () => {
    if (isLoading) return;
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    animateButton();
    clearError();
    await register(name.trim(), username.trim(), email.trim(), password);
  };

  const fields = [
    { label: 'Full Name', icon: 'user', value: name, setter: setName, placeholder: 'Your full name', autoCapitalize: 'words' },
    { label: 'Username', icon: 'at-sign', value: username, setter: setUsername, placeholder: 'Choose a username', autoCapitalize: 'none' },
    { label: 'Email', icon: 'mail', value: email, setter: setEmail, placeholder: 'your@email.com', autoCapitalize: 'none', keyboardType: 'email-address' },
  ];

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
        {/* Logo Area */}
        <View style={styles.logoArea}>
          <View style={styles.logoBox}>
            <Feather name="heart" size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>Need a Hand?</Text>
          <Text style={styles.tagline}>Join your community help network</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>Start helping & getting help today</Text>

          {authError ? (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color="#B91C1C" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}

          {fields.map((f) => (
            <View key={f.label} style={styles.inputGroup}>
              <Text style={styles.label}>{f.label}</Text>
              <View style={styles.inputWrapper}>
                <Feather name={f.icon} size={16} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  value={f.value}
                  onChangeText={f.setter}
                  autoCapitalize={f.autoCapitalize || 'none'}
                  keyboardType={f.keyboardType || 'default'}
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={16} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.registerBtn, isLoading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.registerBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => {
              clearError();
              navigation.navigate('Login');
            }}
          >
            <Text style={styles.loginBtnText}>I already have an account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: SPACING.xl }} />
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
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: 50,
    paddingBottom: SPACING.xl,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOW.lg,
  },
  appName: {
    fontSize: 24,
    color: COLORS.textPrimary,
    ...FONTS.extraBold,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOW.md,
  },
  cardTitle: {
    fontSize: 22,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    ...FONTS.medium,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  eyeBtn: {
    padding: 6,
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOW.lg,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 16,
    ...FONTS.bold,
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 13,
  },
  loginBtn: {
    height: 54,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  loginBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    ...FONTS.semiBold,
  },
});
