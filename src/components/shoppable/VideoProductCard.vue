<template>
  <transition name="fade">
    <div v-if="data" class="product-card" :class="{'high-light': highlight}"
      @click="atcProduct(data.code)">
      <div class="product-img">
        <img :src="data.data.product.galleryImageList.galleryImage[0].url" />
      </div>
      <div class="product-details" :class="{'separator': separator}">
        <div class="product-name">{{ data.data.product.name }}</div>
        <div class="color">Color: {{ data.data.product.colorName }}</div>
        <div>{{ data.data.product.price.formattedValue }}</div>
      </div>
    </div>
    <div v-else>
      <div class="details" :class="{'separator': separator}">
        <div class="message" v-html="message"></div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref } from "vue";

export default {
  props: {
    data: {
      type: Object,
      default: null
    },
    message: String,
    highlight: {
        type: Boolean,
        default: false,
    },
    separator: {
      type: Boolean,
      default: false,
    }
  },

  setup(props, {emit}) {
    console.log("Item Selector PROPS :: ", props);

    const product = ref(null);

    // methods
    const atcProduct = (code) => {
        emit("open-modal", code);
    }

    return {
      product,
      atcProduct
    };
  },
};
</script>

<style scoped lang="scss">

.fade-enter-active,
.fade-leave-active {
  background: white;
  transition: all 1.2s ease-in-out;
  transform-origin: left bottom;
  position: relative;
  transform: scale(1);
  max-height: 110px;
}

.fade-enter-from,
.fade-leave-to {
  transform: scale(0);
  max-height: 20px;
  background: white;
}

.details {
  font-family: Arial, Helvetica, sans-serif;
  .message {
    margin: 10px;
    font-size: 13px;
  }
}


.product-card {
  width: 100%;
  display: grid;
  grid-gap: 5px;
  font-family: Arial, Helvetica, sans-serif;
  background: white;
  grid-template-columns: 90px 1fr;
  grid-template-rows: 90px;
  .product-details {
    &.separator {
      border-top: 2px solid #d6d6d6;
    }
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    font-size: 13px;
    font-weight: 400;
    text-align: left;
    line-height: 16px;
  }
  .product-img {
    // z-index: 100;
    margin: auto;
    height: 100%;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      &:hover {
        transform: scaleX(-1);
      }
      // z-index: 0;
      // overflow: hidden;
    }
  }
}
</style>