import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await login(form.email.trim(), form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.eyebrow}>StudySwap Mobile</Text>
        <Text style={styles.title}>Login and access your purchased notes</Text>
        <Text style={styles.subtitle}>
          Simple student app. Log in and open your notes quickly.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={form.email}
            onChangeText={(email) => setForm((prev) => ({ ...prev, email }))}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={form.password}
            onChangeText={(password) => setForm((prev) => ({ ...prev, password }))}
            placeholder="Enter your password"
            secureTextEntry
            style={styles.input}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4ff',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5
  },
  eyebrow: {
    color: '#2563eb',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 12
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 10
  },
  subtitle: {
    color: '#475569',
    marginTop: 10,
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 22
  },
  fieldGroup: {
    marginBottom: 16
  },
  label: {
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbe4f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15
  },
  button: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center'
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16
  },
  error: {
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 4
  }
});

export default LoginScreen;
