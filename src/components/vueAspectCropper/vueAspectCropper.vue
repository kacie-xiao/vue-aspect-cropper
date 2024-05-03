<script lang="ts" setup>
import { reactive, nextTick, ref, shallowRef } from "vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { ElMessage } from "element-plus";

export interface aspectRatioInterface {
  width: number;
  height: number;
}

const $props = withDefaults(
  defineProps<{
    title: string;
    aspectRatioList: aspectRatioInterface[];
    maxSize: number;
    upCropper: boolean;
  }>(),
  {
    title: "裁剪图片",
    aspectRatioList: () => [{ width: 1, height: 1 }],
    maxSize: Infinity,
    upCropper: true,
  }
);

const $emits = defineEmits(["cropperEnd", "upCropperImg"]);

//初始化比例
const aspectRatioActive = ref<number>(0);
const cropperImgRef = shallowRef<HTMLImageElement>();
const isShowDialog = ref<boolean>(false);
const state = reactive({
  cropperImg: "",
  cropper: null,
  cropperloading: false,
  cropperType: "",
});

// 打开弹窗
function openDialog(url: string, type?: string) {
  if (type) {
    state.cropperType = type;
  }
  if (cropperImgRef.value) {
    state.cropperImg = url;
    (state.cropper as any).replace(url);
    nextTick(() => {
      isShowDialog.value = true;
    });
  } else {
    state.cropperImg = url;
    isShowDialog.value = true;
    nextTick(() => {
      initCropper();
    });
  }
}

// 关闭弹窗
function closeDialog() {
  isShowDialog.value = false;
  nextTick(() => {
    state.cropperImg = "";
    state.cropperType = "";
  });
}

//重新选择图片
function upCropperImg() {
  $emits("upCropperImg");
}

// 更换
function cropperEnd() {
  state.cropperloading = true;
  (<any>state.cropper).getCroppedCanvas().toBlob((blob: Blob | null) => {
    if (blob) {
      if (blob.size < $props.maxSize) {
        $emits("cropperEnd", URL.createObjectURL(blob));
        URL.revokeObjectURL(state.cropperImg);
        state.cropperloading = false;
        closeDialog();
      } else {
        ElMessage.warning(
          `图片的大小不超过${$props.maxSize / 1024 / 1024}M,请重新选择`
        );
        state.cropperloading = false;
      }
    } else {
      ElMessage.error("剪裁失败");
      state.cropperloading = false;
    }
  }, state.cropperType);
}

// 初始化cropperjs图片裁剪
function initCropper() {
  if (cropperImgRef.value) {
    const item = $props.aspectRatioList[aspectRatioActive.value];
    (<any>state.cropper) = new Cropper(cropperImgRef.value, {
      viewMode: 1,
      dragMode: "none",
      aspectRatio: item.width / item.height,
      background: true,
      autoCropArea: 1,
      zoomOnWheel: false,
      minCropBoxHeight: 100,
    });
  }
}

//修改比例
function switchActive(index: number) {
  if (aspectRatioActive.value === index) return;
  aspectRatioActive.value = index;
  const item = $props.aspectRatioList[aspectRatioActive.value];
  (<any>state.cropper).setAspectRatio(item.width / item.height);
}

defineExpose({
  openDialog,
});
</script>
<template>
  <el-dialog
    v-model="isShowDialog"
    title="图片剪裁"
    :before-close="closeDialog"
  >
    <div style="width: 100%">
      <div class="cropper-warp">
        <div class="cropper-warp-left">
          <img
            style="width: 100%"
            ref="cropperImgRef"
            :src="state.cropperImg"
            alt=""
          />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="footer">
        <el-space alignment="space-between" size="small">
          <el-button
            v-for="(item, index) in aspectRatioList"
            :key="index"
            :type="index === aspectRatioActive ? 'primary' : 'default'"
            @click="switchActive(index)"
          >
            {{ `${item.width} ` + ":" + ` ${item.height}` }}
          </el-button>
        </el-space>
        <el-space size="small">
          <el-button @click="closeDialog">取 消</el-button>
          <el-button v-if="upCropper" type="danger" @click="upCropperImg">
            重新选择
          </el-button>
          <el-button
            :disabled="state.cropperloading"
            :loading="state.cropperloading"
            type="primary"
            @click="cropperEnd"
          >
            完 成
          </el-button>
        </el-space>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.cropper-warp {
  display: flex;
  height: 50vh;

  .cropper-warp-left {
    position: relative;
    display: inline-block;
    flex: 1;
    border: 1px solid var(--el-border-color);
    background: var(--el-color-white);
    overflow: hidden;
    background-repeat: no-repeat;
    cursor: move;
    border-radius: var(--el-border-radius-base);

    .cropper-warp-left-img {
      width: 100%;
      height: 100%;
    }
  }

  .cropper-warp-right {
    width: 150px;
    height: 350px;

    .cropper-warp-right-title {
      text-align: center;
      height: 20px;
      line-height: 20px;
    }

    .cropper-warp-right-item {
      margin: 15px 0;

      .cropper-warp-right-value {
        display: flex;

        .cropper-warp-right-value-img {
          width: 100px;
          height: 100px;
          margin: auto;
        }

        .cropper-size {
          width: 50px;
          height: 50px;
        }
      }

      .cropper-warp-right-label {
        text-align: center;
        font-size: 12px;
        color: var(--el-text-color-primary);
        height: 30px;
        line-height: 30px;
      }
    }
  }
}
.footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
