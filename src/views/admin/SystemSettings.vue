<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 系统设置表单
const settingsForm = ref({
  siteName: '',
  siteDescription: '',
  siteKeywords: '',
  siteLogo: '',
  allowRegister: true,
  allowComment: true,
  maxUploadSize: 100,
  allowedVideoTypes: ['mp4', 'avi', 'mov'],
  maintenanceMode: false
});

// 获取系统设置
const getSettings = async () => {
  try {
    // TODO: 调用后端API获取系统设置
    // 模拟数据
    settingsForm.value = {
      siteName: '视频网站',
      siteDescription: '一个分享视频的平台',
      siteKeywords: '视频,分享,娱乐',
      siteLogo: '',
      allowRegister: true,
      allowComment: true,
      maxUploadSize: 100,
      allowedVideoTypes: ['mp4', 'avi', 'mov'],
      maintenanceMode: false
    };
  } catch (error) {
    console.error('获取系统设置失败', error);
    ElMessage.error('获取系统设置失败');
  }
};

// 保存系统设置
const saveSettings = async () => {
  try {
    // TODO: 调用后端API保存系统设置
    ElMessage.success('保存成功');
  } catch (error) {
    console.error('保存系统设置失败', error);
    ElMessage.error('保存系统设置失败');
  }
};

// 处理Logo上传
const handleLogoUpload = (file) => {
  // TODO: 实现Logo上传逻辑
  return false;
};

onMounted(() => {
  getSettings();
});
</script>

<template>
  <div class="system-settings">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
        </div>
      </template>

      <el-form
        ref="settingsForm"
        :model="settingsForm"
        label-width="120px"
        class="settings-form"
      >
        <!-- 基本设置 -->
        <el-divider>基本设置</el-divider>
        
        <el-form-item label="网站名称">
          <el-input v-model="settingsForm.siteName" />
        </el-form-item>
        
        <el-form-item label="网站描述">
          <el-input
            v-model="settingsForm.siteDescription"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        
        <el-form-item label="网站关键词">
          <el-input
            v-model="settingsForm.siteKeywords"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        
        <el-form-item label="网站Logo">
          <el-upload
            class="logo-uploader"
            action="/api/upload"
            :show-file-list="false"
            :before-upload="handleLogoUpload"
          >
            <img v-if="settingsForm.siteLogo" :src="settingsForm.siteLogo" class="logo">
            <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <!-- 功能设置 -->
        <el-divider>功能设置</el-divider>
        
        <el-form-item label="允许注册">
          <el-switch v-model="settingsForm.allowRegister" />
        </el-form-item>
        
        <el-form-item label="允许评论">
          <el-switch v-model="settingsForm.allowComment" />
        </el-form-item>
        
        <el-form-item label="最大上传大小(MB)">
          <el-input-number
            v-model="settingsForm.maxUploadSize"
            :min="1"
            :max="1000"
          />
        </el-form-item>
        
        <el-form-item label="允许的视频格式">
          <el-select
            v-model="settingsForm.allowedVideoTypes"
            multiple
            placeholder="请选择允许的视频格式"
          >
            <el-option label="MP4" value="mp4" />
            <el-option label="AVI" value="avi" />
            <el-option label="MOV" value="mov" />
            <el-option label="WMV" value="wmv" />
            <el-option label="FLV" value="flv" />
          </el-select>
        </el-form-item>

        <!-- 系统维护 -->
        <el-divider>系统维护</el-divider>
        
        <el-form-item label="维护模式">
          <el-switch v-model="settingsForm.maintenanceMode" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.system-settings {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-form {
  max-width: 800px;
  margin: 0 auto;
}

.logo-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.logo-uploader:hover {
  border-color: #409EFF;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.logo {
  width: 178px;
  height: 178px;
  display: block;
}

:deep(.el-divider__text) {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

@media screen and (max-width: 768px) {
  .settings-form {
    max-width: 100%;
  }
}
</style> 