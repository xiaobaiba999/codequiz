import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Upload, Avatar, message, Divider, Tag, Space, Modal, Typography, List, Badge } from 'antd';
import {
  UserOutlined, SunOutlined, MoonOutlined, EyeOutlined,
  ReloadOutlined, InfoCircleOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { userApi } from '../api';
import { useAuthStore } from '../store/auth';
import { useThemeStore, ThemeMode } from '../store/theme';

const { Text, Paragraph } = Typography;

// 版本信息
const CURRENT_VERSION = '1.2.0';
const CHANGELOG: Record<string, string[]> = {
  '1.2.0': [
    '✨ 新增 Word/文档 智能导入题库功能',
    '🌿 新增护眼模式（三档主题切换）',
    '🎨 UI 全面升级：圆角、阴影、过渡动画',
    '📱 支持 PWA 安装，手机桌面一键打开',
    '🔔 新增版本检查与更新通知',
  ],
  '1.1.0': [
    '🚀 免费部署到 Vercel + Neon',
    '🔐 完善用户认证和注册流程',
    '📊 新增学习统计页面',
  ],
  '1.0.0': [
    '🎉 CodeQuiz 正式上线',
    '📝 支持单选、多选、填空、编程题',
    '🏆 模拟考试与错题本功能',
  ],
};

const themeLabels: Record<ThemeMode, { icon: React.ReactNode; label: string; color: string }> = {
  light: { icon: <SunOutlined />, label: '浅色模式', color: '#faad14' },
  dark: { icon: <MoonOutlined />, label: '暗夜模式', color: '#722ed1' },
  eyecare: { icon: <EyeOutlined />, label: '护眼模式', color: '#52c41a' },
};

const Profile: React.FC = () => {
  const { user, setAuth } = useAuthStore();
  const { mode, setTheme } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [changelogVisible, setChangelogVisible] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');

  // 检查更新
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    setCheckingUpdate(true);
    try {
      // 从你的 API 或 GitHub releases 获取最新版本
      const res = await fetch('https://api.github.com/repos/xiaobaiba999/codequiz/releases/latest');
      if (res.ok) {
        const data = await res.json();
        const remoteVersion = data.tag_name?.replace('v', '');
        if (remoteVersion && remoteVersion !== CURRENT_VERSION) {
          setHasUpdate(true);
          setLatestVersion(remoteVersion);
        }
      }
    } catch {
      // GitHub API 可能被限流，静默失败
    } finally {
      setCheckingUpdate(false);
    }
  };

  const onUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      const res = await userApi.updateProfile(values);
      if (res.data.success) {
        setAuth({ accessToken: useAuthStore.getState().token!, refreshToken: useAuthStore.getState().refreshToken!, user: res.data.data });
        message.success('更新成功');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values: any) => {
    try {
      const res = await userApi.changePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword });
      if (res.data.success) message.success('密码修改成功');
    } catch (err: any) {
      message.error(err.response?.data?.message || '修改失败');
    }
  };

  return (
    <div>
      <h2>个人中心</h2>

      {/* 更新通知弹窗 */}
      {hasUpdate && (
        <Card
          style={{ marginBottom: 16, borderColor: '#1677ff', background: mode === 'dark' ? '#111d2c' : '#e6f4ff' }}
        >
          <Space>
            <Badge status="processing" />
            <Text strong>发现新版本 v{latestVersion}</Text>
            <Button
              type="primary"
              size="small"
              onClick={() => setChangelogVisible(true)}
            >
              查看更新
            </Button>
          </Space>
        </Card>
      )}

      <Card style={{ marginBottom: 16, maxWidth: 600 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={80} icon={<UserOutlined />} src={user?.avatar} />
        </div>
        <Form initialValues={{ nickname: user?.nickname, email: user?.email }} onFinish={onUpdateProfile}>
          <Form.Item label="昵称" name="nickname"><Input /></Form.Item>
          <Form.Item label="邮箱"><Input value={user?.email} disabled /></Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
          </Form.Item>
        </Form>

        <Divider />

        <h4>修改密码</h4>
        <Form onFinish={onChangePassword}>
          <Form.Item name="oldPassword" rules={[{ required: true, message: '请输入旧密码' }]}>
            <Input.Password placeholder="旧密码" />
          </Form.Item>
          <Form.Item name="newPassword" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '至少6位' }]}>
            <Input.Password placeholder="新密码" />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit">修改密码</Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 主题设置 */}
      <Card title="外观设置" style={{ marginBottom: 16, maxWidth: 600 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(Object.entries(themeLabels) as [ThemeMode, typeof themeLabels['light']][]).map(([key, val]) => (
            <Card
              key={key}
              size="small"
              hoverable
              style={{
                width: 160,
                textAlign: 'center',
                borderColor: mode === key ? val.color : undefined,
                borderWidth: mode === key ? 2 : 1,
                cursor: 'pointer',
              }}
              onClick={() => setTheme(key)}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{val.icon}</div>
              <Text strong style={{ color: mode === key ? val.color : undefined }}>
                {val.label}
              </Text>
              {mode === key && <div style={{ marginTop: 4 }}><Tag color={val.color}>当前</Tag></div>}
            </Card>
          ))}
        </div>
      </Card>

      {/* 版本信息 */}
      <Card title="关于" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <InfoCircleOutlined />
              <span>当前版本</span>
            </Space>
            <Tag color="blue">v{CURRENT_VERSION}</Tag>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <ReloadOutlined spin={checkingUpdate} />
              <span>检查更新</span>
            </Space>
            <Button size="small" onClick={checkForUpdates} loading={checkingUpdate}>
              {hasUpdate ? `有新版本 v${latestVersion}` : '已是最新'}
            </Button>
          </div>
          <Button
            type="link"
            icon={<CheckCircleOutlined />}
            onClick={() => setChangelogVisible(true)}
          >
            查看更新日志
          </Button>
        </div>
      </Card>

      {/* 更新日志弹窗 */}
      <Modal
        title="更新日志"
        open={changelogVisible}
        onCancel={() => setChangelogVisible(false)}
        footer={null}
        width={500}
      >
        {Object.entries(CHANGELOG).map(([version, items]) => (
          <div key={version} style={{ marginBottom: 16 }}>
            <Tag color={version === CURRENT_VERSION ? 'blue' : 'default'}>
              v{version} {version === CURRENT_VERSION ? '(当前)' : ''}
            </Tag>
            <List
              size="small"
              dataSource={items}
              renderItem={(item) => (
                <List.Item style={{ border: 'none', padding: '4px 0' }}>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </div>
        ))}
        <Paragraph type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
          💡 提示：本应用为 PWA，刷新页面即可获取最新版本。
          <br />
          📱 安卓用户可通过 PWABuilder 打包 APK 安装包。
        </Paragraph>
      </Modal>
    </div>
  );
};

export default Profile;
