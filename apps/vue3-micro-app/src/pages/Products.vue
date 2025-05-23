<template>
  <div>
    <a-typography-title :level="2" style="margin-bottom: 24px">
      产品管理
    </a-typography-title>

    <a-card>
      <!-- 搜索和操作栏 -->
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between">
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索产品名称"
            allow-clear
            style="width: 300px"
            @search="handleSearch"
          />
          <a-select
            v-model:value="categoryFilter"
            style="width: 120px"
            @change="handleCategoryChange"
          >
            <a-select-option value="all">全部分类</a-select-option>
            <a-select-option value="electronics">电子产品</a-select-option>
            <a-select-option value="clothing">服装</a-select-option>
            <a-select-option value="books">图书</a-select-option>
          </a-select>
        </a-space>
        
        <a-button type="primary" @click="handleAdd">
          <template #icon>
            <PlusOutlined />
          </template>
          添加产品
        </a-button>
      </div>

      <!-- 产品表格 -->
      <a-table
        :columns="columns"
        :data-source="filteredProducts"
        :loading="loading"
        row-key="id"
        :pagination="{
          total: filteredProducts.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'price'">
            ¥{{ record.price.toFixed(2) }}
          </template>
          
          <template v-if="column.key === 'stock'">
            <a-tag :color="record.stock < 10 ? 'red' : 'green'">
              {{ record.stock }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'action'">
            <a-space size="middle">
              <a-button type="link" @click="handleEdit(record)">
                <template #icon>
                  <EditOutlined />
                </template>
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个产品吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" danger>
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '@/store';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';

const productStore = useProductStore();

const loading = ref(false);
const searchText = ref('');
const categoryFilter = ref('all');

// 模拟产品数据
const mockProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 7999,
    category: 'electronics',
    stock: 50,
  },
  {
    id: '2',
    name: '连衣裙',
    price: 299,
    category: 'clothing',
    stock: 5,
  },
  {
    id: '3',
    name: 'JavaScript高级程序设计',
    price: 89,
    category: 'books',
    stock: 20,
  },
  {
    id: '4',
    name: 'MacBook Pro',
    price: 12999,
    category: 'electronics',
    stock: 15,
  },
];

const columns = [
  {
    title: '产品名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '价格',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    customRender: ({ text }: { text: string }) => {
      const categoryMap: Record<string, string> = {
        electronics: '电子产品',
        clothing: '服装',
        books: '图书',
      };
      return categoryMap[text] || text;
    },
  },
  {
    title: '库存',
    dataIndex: 'stock',
    key: 'stock',
  },
  {
    title: '操作',
    key: 'action',
  },
];

const filteredProducts = computed(() => {
  return productStore.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.value.toLowerCase());
    const matchesCategory = categoryFilter.value === 'all' || product.category === categoryFilter.value;
    return matchesSearch && matchesCategory;
  });
});

const handleSearch = (value: string) => {
  searchText.value = value;
};

const handleCategoryChange = (value: string) => {
  categoryFilter.value = value;
};

const handleAdd = () => {
  console.log('添加产品');
};

const handleEdit = (record: any) => {
  console.log('编辑产品:', record);
  productStore.setSelectedProduct(record);
};

const handleDelete = (record: any) => {
  console.log('删除产品:', record);
  productStore.deleteProduct(record.id);
};

onMounted(() => {
  // 初始化产品数据
  mockProducts.forEach(product => {
    productStore.addProduct(product);
  });
});
</script>
