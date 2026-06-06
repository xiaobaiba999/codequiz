import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../store/auth';
import { useThemeStore } from '../store/theme';
import { userApi, authApi } from '../api';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const bg = isDark ? '#1a1a1a' : '#f5f5f5';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  const updateProfile = async () => {
    try {
      const res = await userApi.updateProfile({ nickname });
      if (res.data.success) Alert.alert('成功', '更新成功');
    } catch (err: any) { Alert.alert('错误', err.response?.data?.message || '更新失败'); }
  };

  const changePassword = async () => {
    try {
      const res = await userApi.changePassword({ oldPassword: oldPwd, newPassword: newPwd });
      if (res.data.success) { Alert.alert('成功', '密码已修改'); setOldPwd(''); setNewPwd(''); }
    } catch (err: any) { Alert.alert('错误', err.response?.data?.message || '修改失败'); }
  };

  const handleLogout = async () => {
    try { await authApi.logout(); } finally { logout(); }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: textColor }]}>个人中心</Text>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.label, { color: textColor }]}>昵称</Text>
        <TextInput style={[styles.input, { color: textColor }]} value={nickname} onChangeText={setNickname} />
        <Text style={[styles.label, { color: textColor }]}>邮箱</Text>
        <TextInput style={[styles.input, { color: '#999' }]} value={user?.email || ''} editable={false} />
        <TouchableOpacity style={styles.btn} onPress={updateProfile}><Text style={styles.btnText}>保存</Text></TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.label, { color: textColor }]}>修改密码</Text>
        <TextInput style={[styles.input, { color: textColor }]} placeholder="旧密码" secureTextEntry value={oldPwd} onChangeText={setOldPwd} placeholderTextColor="#999" />
        <TextInput style={[styles.input, { color: textColor }]} placeholder="新密码" secureTextEntry value={newPwd} onChangeText={setNewPwd} placeholderTextColor="#999" />
        <TouchableOpacity style={styles.btn} onPress={changePassword}><Text style={styles.btnText}>修改密码</Text></TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <TouchableOpacity style={styles.rowBtn} onPress={toggleTheme}>
          <Text style={{ color: textColor }}>{isDark ? '切换亮色模式' : '切换暗色模式'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logoutBtn]} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  btn: { backgroundColor: '#1677ff', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  rowBtn: { padding: 12 },
  logoutBtn: { padding: 16, alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#ff4d4f', fontSize: 16 },
});

export default ProfileScreen;
