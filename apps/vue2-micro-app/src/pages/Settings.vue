<template>
  <div>
    <a-card title="应用设置">
      <a-form layout="vertical">
        <a-form-item label="主题设置">
          <a-radio-group v-model="currentTheme" @change="handleThemeChange">
            <a-radio value="light">浅色主题</a-radio>
            <a-radio value="dark">深色主题</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="应用设置">
          <a-switch
            v-model="notificationEnabled"
            checked-children="开启"
            un-checked-children="关闭"
          />
          <span style="margin-left: 8px;">启用通知</span>
        </a-form-item>



        <a-form-item label="语言设置">
          <a-select v-model="language" style="width: 200px;">
            <a-select-option value="zh-CN">简体中文</a-select-option>
            <a-select-option value="en-US">English</a-select-option>
            <a-select-option value="ja-JP">日本語</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="系统信息" style="margin-top: 24px;">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="用户代理">
          {{ userAgent }}
        </a-descriptions-item>
        <a-descriptions-item label="屏幕分辨率">
          {{ screenResolution }}
        </a-descriptions-item>
        <a-descriptions-item label="时区">
          {{ timezone }}
        </a-descriptions-item>
        <a-descriptions-item label="语言">
          {{ browserLanguage }}
        </a-descriptions-item>
        <a-descriptions-item label="在线状态">
          <a-tag :color="isOnline ? 'green' : 'red'">
            {{ isOnline ? '在线' : '离线' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Cookie 启用">
          <a-tag :color="cookieEnabled ? 'green' : 'red'">
            {{ cookieEnabled ? '启用' : '禁用' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="操作" style="margin-top: 24px;">
      <a-space>
        <a-button @click="resetSettings" icon="reload">重置设置</a-button>
        <a-button @click="exportSettings" icon="download">导出设置</a-button>
        <a-button @click="showImportModal" icon="upload">导入设置</a-button>
        <a-button @click="clearCache" icon="delete" type="danger">清除缓存</a-button>
      </a-space>
    </a-card>

    <!-- 导入设置模态框 -->
    <a-modal
      v-model="importModalVisible"
      title="导入设置"
      @ok="handleImportSettings"
    >
      <a-upload-dragger
        :fileList="fileList"
        :beforeUpload="beforeUpload"
        @remove="handleRemove"
      >
        <p class="ant-upload-drag-icon">
          <a-icon type="inbox" />
        </p>
        <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p class="ant-upload-hint">支持单个文件上传，仅支持 JSON 格式</p>
      </a-upload-dragger>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      currentTheme: 'light',
      notificationEnabled: true,
      language: 'zh-CN',
      importModalVisible: false,
      fileList: [],
      isOnline: navigator.onLine,
    };
  },
  computed: {
    userAgent() {
      return navigator.userAgent;
    },
    screenResolution() {
      return `${screen.width} x ${screen.height}`;
    },
    timezone() {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    },
    browserLanguage() {
      return navigator.language;
    },
    cookieEnabled() {
      return navigator.cookieEnabled;
    },
  },
  mounted() {
    // 监听在线状态变化
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  },
  beforeDestroy() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    handleThemeChange() {
      this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.$message.success('主题已切换');
    },
    resetSettings() {
      this.notificationEnabled = true;
      this.language = 'zh-CN';
      this.currentTheme = 'light';
      this.$message.success('设置已重置');
    },
    exportSettings() {
      const settings = {
        theme: this.currentTheme,
        notification: this.notificationEnabled,
        language: this.language,
        exportTime: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(settings, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vue2-app-settings.json';
      a.click();
      URL.revokeObjectURL(url);

      this.$message.success('设置已导出');
    },
    showImportModal() {
      this.importModalVisible = true;
    },
    beforeUpload(file) {
      this.fileList = [file];
      return false; // 阻止自动上传
    },
    handleRemove() {
      this.fileList = [];
    },
    handleImportSettings() {
      if (this.fileList.length === 0) {
        this.$message.error('请选择要导入的文件');
        return;
      }

      const file = this.fileList[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target.result);

          if (settings.notification !== undefined) {
            this.notificationEnabled = settings.notification;
          }

          if (settings.language !== undefined) {
            this.language = settings.language;
          }

          if (settings.theme !== undefined) {
            this.currentTheme = settings.theme;
          }

          this.$message.success('设置已导入');
          this.importModalVisible = false;
          this.fileList = [];
        } catch (error) {
          this.$message.error('文件格式错误');
        }
      };

      reader.readAsText(file);
    },
    clearCache() {
      // 模拟清除缓存
      localStorage.clear();
      sessionStorage.clear();
      this.$message.success('缓存已清除');
    },
    updateOnlineStatus() {
      this.isOnline = navigator.onLine;
    },
  },
};
</script>

<style scoped>
.ant-upload-drag {
  margin-bottom: 16px;
}
</style>
