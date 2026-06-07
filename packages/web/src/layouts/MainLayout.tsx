import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Switch, Drawer } from 'antd';
import {
  BookOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  HeartOutlined,
  BarChartOutlined,
  UserOutlined,
  MenuOutlined,
  BulbOutlined,
  BulbFilled,
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

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeStore();
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            checkedChildren={<BulbFilled />}
            unCheckedChildren={<BulbOutlined />}
          />
          <span style={{ color: isDark ? '#fff' : undefined }}>{user?.nickname || '用户'}</span>
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

        <Layout style={{ padding: '24px' }}>
          <Content style={{ padding: 24, margin: 0, minHeight: 280, borderRadius: 8 }}>
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

      <style>{`
        @media (max-width: 768px) {
          .desktop-sider { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </Layout>
  );
};

export default MainLayout;
