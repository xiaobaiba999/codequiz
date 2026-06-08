import React, { useState } from 'react';
import { Card, Radio, Button, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { questionApi } from '../api';

const Practice: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'sequential' | 'random'>('sequential');
  const [category, setCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const startPractice = async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, pageSize: 100 };
      if (category !== 'all') params.tags = category;

      const res = await questionApi.list(params);
      if (res.data.success) {
        const items = res.data.data.items;
        if (items.length === 0) {
          message.warning('没有找到符合条件的题目');
          return;
        }

        if (mode === 'random') {
          items.sort(() => Math.random() - 0.5);
        }

        // 跳转到第一题
        navigate(`/questions/${items[0].id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>刷题模式</h2>
      <Card style={{ maxWidth: 500 }} className="mobile-full-width">
        <div style={{ marginBottom: 24 }}>
          <h4>练习模式</h4>
          <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
            <Space wrap>
              <Radio.Button value="sequential">顺序练习</Radio.Button>
              <Radio.Button value="random">随机练习</Radio.Button>
            </Space>
          </Radio.Group>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h4>题目分类</h4>
          <Radio.Group value={category} onChange={(e) => setCategory(e.target.value)}>
            <Space wrap>
              <Radio.Button value="all">全部</Radio.Button>
              <Radio.Button value="操作系统">操作系统</Radio.Button>
              <Radio.Button value="数据结构">数据结构</Radio.Button>
              <Radio.Button value="前端基础">前端基础</Radio.Button>
              <Radio.Button value="计算机网络">计算机网络</Radio.Button>
              <Radio.Button value="数据库">数据库</Radio.Button>
            </Space>
          </Radio.Group>
        </div>

        <Button type="primary" size="large" onClick={startPractice} loading={loading} block>
          开始练习
        </Button>
      </Card>
    </div>
  );
};

export default Practice;
