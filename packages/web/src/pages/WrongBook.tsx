import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { answerApi } from '../api';

const WrongBook: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await answerApi.getWrong();
      if (res.data.success) setData(res.data.data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const removeWrong = async (questionId: string) => {
    await answerApi.removeWrong(questionId);
    message.success('已移除');
    fetchData();
  };

  const clearAll = async () => {
    await answerApi.clearWrong();
    message.success('已清空');
    fetchData();
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title', render: (t: string, r: any) => <a onClick={() => navigate(`/questions/${r.id}`)}>{t}</a> },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty' },
    {
      title: '操作', key: 'action',
      render: (_: any, record: any) => (
        <Popconfirm title="确定移除？" onConfirm={() => removeWrong(record.id)}>
          <Button type="link" danger>移除</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>错题本</h2>
        <Popconfirm title="确定清空所有错题？" onConfirm={clearAll}>
          <Button danger>清空错题本</Button>
        </Popconfirm>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
    </div>
  );
};

export default WrongBook;
