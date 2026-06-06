import React, { useEffect, useState } from 'react';
import { Table, Input, Select, Tag, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { questionApi } from '../api';
import { QuestionType, Difficulty } from '@codequiz/types';

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
      <Space style={{ marginBottom: 16 }} wrap>
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
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
      />
    </div>
  );
};

export default QuestionList;
