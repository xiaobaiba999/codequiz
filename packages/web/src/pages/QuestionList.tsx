import React, { useEffect, useState } from 'react';
import { Table, Input, Select, Tag, Button, Space, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { questionApi } from '../api';

// 题目类型和难度枚举
type QuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'FILL_BLANK' | 'PROGRAMMING';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const { Search } = Input;

const typeLabels: Record<string, string> = {
  SINGLE_CHOICE: '单选题',
  MULTI_CHOICE: '多选题',
  FILL_BLANK: '填空题',
  PROGRAMMING: '编程题',
};

const difficultyColors: Record<string, string> = {
  EASY: 'green',
  MEDIUM: 'orange',
  HARD: 'red',
};

const QuestionList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState<string | undefined>();
  const [difficulty, setDifficulty] = useState<string | undefined>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await questionApi.list({ page, pageSize: 20, keyword, type, difficulty });
      if (res.data.success) {
        setData(res.data.data.items);
        setTotal(res.data.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, type, difficulty]);

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/questions/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag>{typeLabels[type] || type}</Tag>,
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (d: string) => <Tag color={difficultyColors[d]}>{d}</Tag>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => tags?.map(t => <Tag key={t}>{t}</Tag>),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_: any, record: any) => {
        if (record.completed) return <Tag color="green">已完成</Tag>;
        return <Tag>未做</Tag>;
      },
    },
  ];

  return (
    <div>
      <h2>题库</h2>
      <Space style={{ marginBottom: 16 }} wrap className="mobile-filter-area">
        <Search
          placeholder="搜索题目"
          allowClear
          onSearch={(v) => { setKeyword(v); setPage(1); fetchData(); }}
          style={{ width: 250 }}
        />
        <Select
          placeholder="题目类型"
          allowClear
          style={{ width: 120 }}
          onChange={(v) => { setType(v); setPage(1); }}
          options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))}
        />
        <Select
          placeholder="难度"
          allowClear
          style={{ width: 120 }}
          onChange={(v) => { setDifficulty(v); setPage(1); }}
          options={[
            { value: 'EASY', label: '简单' },
            { value: 'MEDIUM', label: '中等' },
            { value: 'HARD', label: '困难' },
          ]}
        />
      </Space>

      {/* 桌面端表格视图 */}
      <div className="desktop-table-view">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
        />
      </div>

      {/* 移动端卡片列表视图 */}
      <div className="mobile-card-list">
        {data.map((item) => (
          <Card
            key={item.id}
            className="mobile-question-card"
            onClick={() => navigate(`/questions/${item.id}`)}
            size="small"
          >
            <div className="card-title">{item.title}</div>
            <div className="card-tags">
              <Tag>{typeLabels[item.type] || item.type}</Tag>
              <Tag color={difficultyColors[item.difficulty]}>{item.difficulty}</Tag>
              {item.completed ? <Tag color="green">已完成</Tag> : <Tag>未做</Tag>}
            </div>
          </Card>
        ))}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Space>
            <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
            <span>{page} / {Math.ceil(total / 20) || 1}</span>
            <Button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}>下一页</Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default QuestionList;
