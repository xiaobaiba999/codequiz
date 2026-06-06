import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../store/auth';
import { authApi } from '../api';
import { useThemeStore } from '../store/theme';

const LoginScreen = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { isDark } = useThemeStore();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('提示', '请填写邮箱和密码');
      return;
    }

    setLoading(true);
    try {
      const api = isRegister ? authApi.register : authApi.login;
      const data: any = isRegister ? { email, password, nickname } : { email, password };
      const res = await api(data);
      if (res.data.success) {
        setAuth(res.data.data);
      }
    } catch (err: any) {
      Alert.alert('错误', err.response?.data?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const bg = isDark ? '#1a1a1a' : '#f5f5f5';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: textColor }]}>CodeQuiz</Text>

      {isRegister && (
        <TextInput style={[styles.input, { backgroundColor: cardBg, color: textColor }]} placeholder="昵称" value={nickname} onChangeText={setNickname} placeholderTextColor="#999" />
      )}

      <TextInput style={[styles.input, { backgroundColor: cardBg, color: textColor }]} placeholder="邮箱" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#999" />
      <TextInput style={[styles.input, { backgroundColor: cardBg, color: textColor }]} placeholder="密码" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#999" />

      <Button title={isRegister ? '注册' : '登录'} onPress={handleSubmit} disabled={loading} />

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)} style={styles.switchBtn}>
        <Text style={{ color: '#1677ff' }}>{isRegister ? '已有账号？登录' : '没有账号？注册'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  input: { height: 48, borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
  switchBtn: { marginTop: 16, alignItems: 'center' },
});

export default LoginScreen;
