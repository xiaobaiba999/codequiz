import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { favoriteApi } from '../api';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await favoriteApi.list();
      if (res.data.success) setData(res.data.data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const removeFavorite = async (questionId: string) => {
    await favoriteApi.remove(questionId);
    message.success('已取消收藏');
    fetchData();
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title', render: (t: string, r: any) => <a onClick={() => navigate(`/questions/${r.id}`)}>{t}</a> },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty' },
    {
      title: '操作', key: 'action',
      render: (_: any, record: any) => (
        <Popconfirm title="取消收藏？" onConfirm={() => removeFavorite(record.id)}>
          <Button type="link" danger>取消收藏</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <h2>收藏夹</h2>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
    </div>
  );
};

export default Favorites;
