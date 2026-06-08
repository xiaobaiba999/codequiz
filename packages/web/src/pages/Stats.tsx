import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Select } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { statsApi } from '../api';

const Stats: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState<string>('week');

  useEffect(() => {
    statsApi.get({ period }).then(res => {
      if (res.data.success) setStats(res.data.data);
    });
  }, [period]);

  if (!stats) return <Card loading />;

  return (
    <div>
      <h2>学习统计</h2>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}><Card><Statistic title="总做题数" value={stats.totalAnswered} /></Card></Col>
        <Col xs={12} sm={12} md={6}><Card><Statistic title="正确数" value={stats.totalCorrect} /></Card></Col>
        <Col xs={12} sm={12} md={6}><Card><Statistic title="正确率" value={stats.overallAccuracy} suffix="%" /></Card></Col>
        <Col xs={12} sm={12} md={6}><Card><Statistic title="连续天数" value={stats.streakDays} suffix="天" /></Card></Col>
      </Row>

      <Card title="正确率趋势" extra={<Select value={period} onChange={setPeriod} style={{ width: 120 }} options={[{ value: 'week', label: '近7天' }, { value: 'month', label: '近30天' }]} />}>
        <ResponsiveContainer width="100%" height={300} className="mobile-chart">
          <LineChart data={stats.dailyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="accuracy" stroke="#1677ff" name="正确率(%)" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="分类掌握度" style={{ marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={300} className="mobile-chart">
          <BarChart data={stats.categoryStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tag" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="accuracy" fill="#1677ff" name="正确率(%)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Stats;
