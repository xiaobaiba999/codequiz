import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Upload, Avatar, message, Divider } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { userApi } from '../api';
import { useAuthStore } from '../store/auth';
import { useThemeStore } from '../store/theme';

const Profile: React.FC = () => {
  const { user, setAuth } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [loading, setLoading] = useState(false);

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
      <Card style={{ maxWidth: 500 }}>
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

        <Divider />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>暗色模式</span>
          <Button onClick={toggleTheme}>{isDark ? '切换亮色' : '切换暗色'}</Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
