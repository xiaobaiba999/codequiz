import React, { useEffect, useState } from 'react';
import { Modal, Typography, Tag, List, Button } from 'antd';
import { GiftOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CURRENT_VERSION = '1.2.0';
const CHANGELOG: Record<string, string[]> = {
  '1.2.0': [
    '✨ 新增 Word/文档 智能导入题库',
    '🌿 新增护眼模式 — 三档主题切换',
    '🎨 UI 全面升级：圆角、阴影、动画',
    '📱 PWA 安装支持，手机桌面直达',
    '🔔 版本检查与更新通知',
    '📦 APK 安装包 + OTA 热更新',
  ],
  '1.1.0': ['🚀 免费 Vercel + Neon 部署', '🔐 用户认证系统完善'],
  '1.0.0': ['🎉 CodeQuiz 正式上线', '📝 四种题型支持', '🏆 模拟考试功能'],
};

const STORAGE_KEY = 'codequiz-last-seen-version';

const UpdateNotification: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (!lastSeen) {
      // 首次使用
      setIsNewUser(true);
      setVisible(true);
      localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    } else if (lastSeen !== CURRENT_VERSION) {
      // 版本更新
      setIsNewUser(false);
      setVisible(true);
      localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    }
  }, []);

  if (!visible) return null;

  return (
    <Modal
      title={
        <span>
          <GiftOutlined style={{ color: '#1677ff', marginRight: 8 }} />
          {isNewUser ? '欢迎使用 CodeQuiz！' : `🎉 已更新至 v${CURRENT_VERSION}`}
        </span>
      }
      open={visible}
      onCancel={() => setVisible(false)}
      footer={
        <Button type="primary" onClick={() => setVisible(false)}>
          {isNewUser ? '开始刷题' : '知道了'}
        </Button>
      }
      width={450}
    >
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary">
          {isNewUser
            ? 'CodeQuiz 是一款跨平台刷题应用，支持多种题型和智能导入。'
            : '本次更新内容：'}
        </Text>
      </div>
      {isNewUser ? (
        <List
          size="small"
          dataSource={[
            '📝 单选、多选、填空、编程四种题型',
            '📄 Word/TXT 智能导入题库',
            '🌿 浅色 / 护眼 / 暗夜三档主题',
            '📱 PWA 安装到手机桌面',
            '📊 学习统计 + 错题本',
          ]}
          renderItem={(item) => (
            <List.Item style={{ border: 'none', padding: '2px 0' }}>
              <Text>{item}</Text>
            </List.Item>
          )}
        />
      ) : (
        Object.entries(CHANGELOG).map(([ver, items]) => (
          <div key={ver} style={{ marginBottom: 8 }}>
            <Tag color={ver === CURRENT_VERSION ? 'blue' : 'default'}>
              v{ver} {ver === CURRENT_VERSION ? '(本次)' : ''}
            </Tag>
            <List
              size="small"
              dataSource={items}
              renderItem={(item) => (
                <List.Item style={{ border: 'none', padding: '2px 0 2px 16px' }}>
                  <Text style={{ fontSize: 13 }}>{item}</Text>
                </List.Item>
              )}
            />
          </div>
        ))
      )}
    </Modal>
  );
};

export default UpdateNotification;
