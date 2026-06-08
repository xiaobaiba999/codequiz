import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './styles/global.css';
import { useThemeStore, ThemeMode } from './store/theme';

const themeTokens: Record<ThemeMode, any> = {
  light: {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1677ff',
      borderRadius: 8,
      colorBgContainer: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  },
  dark: {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#4096ff',
      borderRadius: 8,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  },
  eyecare: {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: '#5b8c5a',
      borderRadius: 8,
      colorBgContainer: '#f5f0e8',
      colorBgLayout: '#efe8d8',
      colorBgElevated: '#faf5ec',
      colorText: '#4a4a3a',
      colorTextSecondary: '#6b6b55',
      colorBorder: '#d4c8a8',
      colorSuccess: '#6b9b5a',
      colorWarning: '#c9a84c',
      colorError: '#c46b5a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  },
};

const Root = () => {
  const { mode } = useThemeStore();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={themeTokens[mode]}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
