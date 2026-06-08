import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Drawer, Segmented, Tooltip } from 'antd';
import {
  BookOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  HeartOutlined,
  BarChartOutlined,
  UserOutlined,
  MenuOutlined,
  SunOutlined,
  MoonOutlined,
  EyeOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import { useThemeStore } from '../store/theme';
import { useAuthStore } from '../store/auth';
import { authApi } from '../api';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/questions', icon: <BookOutlined />, label: '题库' },
  { key: '/practice', icon: <ThunderboltOutlined />, label: '刷题' },
  { key: '/exam', icon: <FileTextOutlined />, label: '模拟考试' },
  { key: '/wrong', icon: <HeartOutlined />, label: '错题本' },
  { key: '/favorites', icon: <HeartOutlined />, label: '收藏夹' },
  { key: '/stats', icon: <BarChartOutlined />, label: '学习统计' },
  { key: '/profile', icon: <UserOutlined />, label: '个人中心' },
  { key: '/import', icon: <ImportOutlined />, label: '导入题库' },
];

const bottomTabItems = [
  { key: '/questions', icon: <BookOutlined />, label: '题库' },
  { key: '/practice', icon: <ThunderboltOutlined />, label: '刷题' },
  { key: '/stats', icon: <BarChartOutlined />, label: '统计' },
  { key: '/profile', icon: <UserOutlined />, label: '我的' },
];

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, setTheme } = useThemeStore();
  const isDark = mode === 'dark' || mode === 'eyecare';
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      navigate('/login');
    }
  };

  const handleMenuClick = (info: { key: string }) => {
    navigate(info.key);
    setDrawerVisible(false);
  };

  const selectedKey = '/' + location.pathname.split('/')[1];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
        className="main-header"
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{ display: 'none', marginRight: 16 }}
            className="mobile-menu-btn"
          />
          <h2 style={{ margin: 0, color: isDark ? '#fff' : '#1677ff', cursor: 'pointer' }} onClick={() => navigate('/questions')}>
            CodeQuiz
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="header-right">
          <Segmented
            size="small"
            value={mode}
            onChange={(v) => setTheme(v as any)}
            options={[
              { value: 'light', icon: <SunOutlined />, label: <Tooltip title="浅色模式">☀️</Tooltip> },
              { value: 'eyecare', icon: <EyeOutlined />, label: <Tooltip title="护眼模式">🌿</Tooltip> },
              { value: 'dark', icon: <MoonOutlined />, label: <Tooltip title="暗夜模式">🌙</Tooltip> },
            ]}
          />
          <span style={{ color: isDark ? '#fff' : undefined }} className="header-username">{user?.nickname || '用户'}</span>
          <Button type="link" onClick={handleLogout}>退出</Button>
        </div>
      </Header>

      <Layout>
        <Sider
          width={200}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          style={{ display: 'block' }}
          className="desktop-sider"
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>

        <Layout style={{ padding: '24px' }} className="main-content-layout">
          <Content style={{ padding: 24, margin: 0, minHeight: 280, borderRadius: 8 }} className="main-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      {/* 移动端抽屉菜单 */}
      <Drawer
        title="CodeQuiz"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Drawer>

      {/* 移动端底部导航栏 */}
      <div className="mobile-bottom-tab">
        {bottomTabItems.map((item) => (
          <div
            key={item.key}
            className={`mobile-tab-item ${selectedKey === item.key ? 'active' : ''}`}
            onClick={() => navigate(item.key)}
          >
            <span className="mobile-tab-icon">{item.icon}</span>
            <span className="mobile-tab-label">{item.label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sider { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
          .main-header { padding: 0 12px !important; }
          .header-username { display: none !important; }
          .header-right .ant-segmented { display: none !important; }
          .main-content-layout { padding: 12px !important; }
          .main-content { padding: 12px !important; }
        }
      `}</style>
    </Layout>
  );
};

export default MainLayout;
