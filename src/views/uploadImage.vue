<script setup lang="ts">
import { ref, shallowRef, reactive } from "vue";
import { ElMessage, ElIcon } from "element-plus";
import { CloseBold, Plus } from "@element-plus/icons-vue";

const imgUrl = ref("");

const aspectCropperRef = shallowRef();
const cropperConfig = reactive({
  isCropper: true,
  aspectRatioList: [
    { width: 200, height: 200 },
    { width: 350, height: 100 },
  ], //裁剪比例，可以添加多个
  maxSize: Infinity,
  loading: false,
  autoUpload: false, // 是否自动上传
});

/**
 * 添加文件
 * */
function filesChange(event: Event) {
  const file = (event.target as HTMLInputElement).files![0];
  if (!["image/png", "image/jpeg"].includes(file.type)) {
    ElMessage.error("不支持该格式文件");
    return (uploadfileRef.value!.value = "");
  }
  if (file.size > cropperConfig.maxSize) {
    ElMessage.warning(
      `图片的大小不能超过${cropperConfig.maxSize / 1024 / 1024}M,请重新选择`
    );
    return (uploadfileRef.value!.value = "");
  }

  cropperConfig.loading = true;
  if (cropperConfig.autoUpload) {
    // 自定义上传方法
  } else {
    const url = URL.createObjectURL(file);
    if (cropperConfig.isCropper) {
      aspectCropperRef.value?.openDialog(url, file.type);
    } else {
      cropperEnd(url);
    }
    cropperConfig.loading = false;
  }
}

/**
 * 裁剪完成
 * */
function cropperEnd(url: string) {
  imgUrl.value = url;
}

const uploadfileRef = ref<HTMLInputElement | undefined>();
/**
 * 选择文件
 * */
function selectFile() {
  uploadfileRef.value!.value = "";
  uploadfileRef.value?.click();
}

/**
 * 删除文件
 * */
function onDelete() {
  imgUrl.value = "";
}
</script>

<template>
  <div>
    <div v-if="imgUrl" class="content">
      <el-image
        :src="imgUrl"
        class="content_img"
        object-fit="contain"
        :preview-src-list="[imgUrl]"
      />
      <div class="content_del" @click="onDelete()">
        <el-icon :size="14" color="#ffffff"><CloseBold /></el-icon>
      </div>
    </div>
    <div
      v-else
      v-loading="cropperConfig.loading"
      :style="{ width: '120px', height: '120px' }"
      class="el-upload el-upload--picture-card"
      @click="selectFile"
    >
      <div class="upload-centont">
        <el-icon :size="14"><Plus /></el-icon>
      </div>
      <input
        ref="uploadfileRef"
        class="el-upload__input"
        type="file"
        @change="filesChange($event)"
      />
    </div>
    <!-- 裁剪弹窗 -->
    <vue-aspect-cropper
      ref="aspectCropperRef"
      :aspect-ratio-list="cropperConfig.aspectRatioList"
      :maxSize="cropperConfig.maxSize"
      :onlyCropper="!cropperConfig.autoUpload"
      @cropper-end="cropperEnd"
      @up-cropper-img="selectFile"
    ></vue-aspect-cropper>
  </div>
</template>

<style lang="scss" scoped>
.content {
  position: relative;
  width: 120px;
  height: 120px;

  &_img {
    width: 100%;
    height: 100%;
    border: 1px solid #eee;
    border-radius: 5px;
  }

  &_del {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 20px;
    height: 20px;
    background-color: red;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}
</style>
