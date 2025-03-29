<template>
  <div class="shoppable-container">
    <div id="shoppy" class="shoppable-products" >
      <div v-if="!productCollection" class="no-products">
        <span>This video is shoppable</span>
      </div>
      <div v-else class="group-scroll" ref="shoppableList">
        <transition-group name="shuffle" tag="ul">
          <li v-for="collection in productCollection"
            class="product-group" 
            :key="collection.hash">
            <ul v-if="collection.productData">
              <!-- product collection can now have a message -->
              <li v-if="collection.message">
                <video-product-card :message="collection.message">
                </video-product-card>
              </li>
              <li v-for="(product, index) in collection.productData" :key="product.code">
                <video-product-card
                  :data="product"
                  :ref="`vpc${product.code}`"
                  :separator="index > 0"
                >
                </video-product-card>
              </li>
            </ul>
            <!-- only message -->
            <ul v-else>
              <li>
                <video-product-card :message="collection.message">
                </video-product-card>
              </li>
            </ul>
          </li>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import VideoProductCard from "../components/shoppable/VideoProductCard.vue";
import { useCueStore } from "@/state/cueStore"; // <-- use Pinia store
import md5 from 'crypto-js/md5';
import { ref, onMounted, watch } from "vue";

export default {
  props: {
    videoPlayerRef: Object,
  },

  setup(props) {
    console.log("Item Selector PROPS :: ", props);

    const cueStore = useCueStore(); // <-- initialize store

    const scrollItemToView = ref(null);
    const productCollection = ref([]);
    const metaFileSrc = ref(null);
    const shoppableList = ref(null);
    const vttTrack = ref({});
    
    // same logic...
    const fetchCollection = (collection) => {
      const fetchPromises = [];
      if (collection.products) {
        collection.products.forEach((product) => {
          const promise = fetch(`mocks/product/${product}.json`);
          fetchPromises.push(promise);
        });
        Promise.all(fetchPromises)
          .then((responses) => Promise.all(responses.map((r) => r.json())))
          .then((data) => {
            const found = productCollection.value.find(el => el.hash === collection.hash);
            found.productData = data;
          })
          .catch((error) => console.error(error));
      }
    };

    const processCodeEntries = (collectionId) => {
      const found = productCollection.value.find(el => el.hash === collectionId);
      productCollection.value = productCollection.value.filter(el => el.hash !== collectionId);
      productCollection.value.unshift(found);
      fetchCollection(found);
    };

    const addToBucket = (val) => {
      const data = { products: val.productIds };
      const productsHash = md5(data.products.toString()).toString();
      const productColl = { hash: productsHash, products: data.products };

      if (!productCollection.value.some((e) => e.hash === productsHash)) {
        productCollection.value.unshift(productColl);
      } else {
        const found = productCollection.value.find((el) => el.hash === productsHash);
        productCollection.value = productCollection.value.filter((el) => el.hash !== productsHash);
        productCollection.value.unshift(found);
      }
      shoppableList.value.scrollTop = 0;
    };

    watch(
      () => cueStore.vttObj,
      (newVttObj) => {
        if (!newVttObj) return;

        const video = props.videoPlayerRef;
        const { vttType, vttCues } = newVttObj;
        const track = video.addTextTrack(vttType);
        vttCues.forEach(cue => {
          const newCue = new VTTCue(cue.startTime, cue.endTime, JSON.stringify(cue.text));
          track.addCue(newCue);
        });

        track.oncuechange = (e) => {
          const meta = [...e.target.activeCues].map(t => t.text).join(" ");
          if (meta) {
            const data = JSON.parse(meta);
            const productsHash = md5(meta).toString();
            const productColl = {
              hash: productsHash,
              products: Array.isArray(data.productArray) ? data.productArray : null,
              message: data.msg,
            };

            if (!productCollection.value.some(e => e.hash === productsHash)) {
              productCollection.value.unshift(productColl);
              fetchCollection(productColl);
            } else {
              processCodeEntries(productsHash);
              shoppableList.value.scrollTop = 0;
            }

            if (data.pause) {
              video.pause();
              setTimeout(() => video.play(), 3000);
            }
          }
        };
      },
      { immediate: true, deep: true }
    );

    onMounted(() => {
      vttTrack.value = cueStore.vttObj; // <-- use store method
    });

    return {
      vttTrack,
      metaFileSrc,
      productCollection,
      scrollItemToView,
      shoppableList,
      addToBucket
    };
  },

  components: {
    VideoProductCard
  },
};
</script>

<style scoped lang="scss">

.shuffle-move {
  transition: transform 1.2s;
}

.shuffle-enter-active,
.shuffle-leave-active {
  background: white;
  transition: all .5s ease-in-out;
  transform-origin: left top;
  position: relative;
  transform: scale(1);
  max-height: 800px;
}

.shuffle-enter-from,
.shuffle-leave-to {
  transform: scale(0);
  max-height: 20px;
  background: white;
}

.admin-console {
  position: relative;
  left: 10px;
  width: 130px;
  background: #000000;
  color: white;
  font-size: 12px;
  // End
  &:after {
    position: absolute;
    z-index: -1;
    content: "";
    right: -5%;
    top: 0;
    height: 100%;
    width: 100%;
    transform: skewX(-10deg);
  }
  &:before {
    z-index: -1;
    content: "";
    position: absolute;
    left: -5%;
    top: 0;
    height: 100%;
    width: 100%;
    transform: skewX(10deg);
  }
  .menu-expander {
    height: 20px;
    transition-duration: .250s;
    &.opened {
      transform: rotate(180deg);
      transition-duration: .250s;
    }
    &:after {
      content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' height='24' viewBox='0 0 24 24' width='24'%3E%3Cpath d='M0 0h24v24H0V0z' fill='none'/%3E%3Cpath d='M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z'/%3E%3C/svg%3E");
      transition-property: transform;
      transform-origin: 22px 14px;
      transition-duration: .250s;
    }
  }
}

.shoppable-container {
  box-sizing: border-box;
  display: flex;
  flex: 0 1 auto;
  flex-direction: row;
  flex-wrap: wrap;
  position: relative;
  max-height: 840px;
  .external-msg {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 20px;
    font-weight: 400;
    text-align: left;
    line-height: 34px;
    width: 100%;
    text-align: center;
    margin: 10px 0;
    border: 1px solid #aae4aa;
    border-radius: 20px;
    background: #c9f6c9;
    color: blue;
  }
  .shoppable-products {
    display: flex;
    width: 30vw;
    max-height: 400px;
    min-width: 376px;
    justify-content: center;
    background: linear-gradient(to right, #3d3d3d, #0a0a0af2);
    // position: relative;
    // left: -340px;
    .group-scroll {
      overflow-y: auto;
      margin: 8px 0;
      -ms-overflow-style: none;  /* hide sroll Edge */
      scrollbar-width: none;  /* hide scroll Firefox */
      &::-webkit-scrollbar {
        display: none; /* hide scroll chrome */
      }
    }
    .product-group {
      &:nth-child(1) {
        margin: 0 15px 10px 10px;
        background: #ffffff;
        border-left: 4px solid #ff0101;
      }
      ul {
        margin: 0;
        li {
          padding: 3px;
        }
      }
      min-width: 360px;
      margin: 25px 15px 10px 10px;
      background: #ffffff;
      border-left: 4px solid #cfcfcf;
      box-shadow: 6px 6px 2px 0px #bdbdbd;
      @media (max-width: 508px) {
        min-width: 70vw;
      }
    }
    ul {
      margin: 0;
      padding: 0;
      list-style-type: none;
    }
    .no-products {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      text-transform: uppercase;
      font-weight: 600;
      font-family: sans-serif;
    }
  }
  @media (max-width: 508px) {
    .video-container, .shoppable-products {
      min-width: 100%;
    }
  }
}
</style>