<template>
  <main>
    <div class="leftMenu">
      <!-- 搜索框 -->
      <div class="serch">
        <input type="text" v-model="searchQuery" placeholder="搜索符号库" />
      </div>
      <!-- 菜单列表 -->
      <div class="menuList" v-for="(item, index) in filteredMenu" :key="item.label">
        <div
          class="menuName"
          @click="toggleMenu(index)"
          :style="item.label === chooseItem ? 'background-color: #dee2e6;' : ''"
        >
          <svg class="icon" :class="item.isOpen ? 'rotate' : ''" aria-hidden="true">
            <use xlink:href="#icon-jiantou"></use>
          </svg>
          <span>{{ item.label }}</span>
        </div>
        <ul v-if="item.isOpen">
          <li
            class="itemList"
            v-for="child in item.children"
            :key="child.label"
            @click="toggleItem(item, child.label);draw();"
            @dblclick="dbtoggleItem(item.label,child.label)"
            :style="child.label === chooseItem ? 'background-color: #dee2e6;' : ''"
          >
            <span>{{ child.label }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="rightPart">
      <div class="canvasDiv" ref="canvasDiv">
        <canvas ref="canvas"></canvas>
      </div>
      <div class="infos">
        <template v-if="symbolInfos">
          <div class="type">
            <span>{{ 'type' }}</span>
            <span>:</span>
            <span>{{ useSymbolStore().$state.currentComponent&&useSymbolStore().$state.currentComponent.type }}</span>
          </div>
          <div
            class="info"
            v-for="(value, key) in symbolInfos"
            :key="key"
            v-show="typeof value != 'object'"
          >
            <span>{{ key }}</span>
            <span>:</span>
            <input v-model="symbolInfos[key]"/>
          </div>
          <!-- <div class="tooltip">
            <span>{{ 'tooltip' }}</span>
          </div> -->
          <!-- <div class="info" v-for="(value, key) in symbolInfos.toolTip" :key="key">
            <span>{{ key }}</span>
            <span>:</span>
            <input v-model="symbolInfos.toolTip[key]" />
          </div> -->
        </template>
      </div>
    </div>
    <div @click="closeSymbol" class="closeSymbol">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-guanbi"></use>
      </svg>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch ,defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useSymbolStore } from '../store'
import axios from 'axios'
const router = useRouter()
const canvas = ref()
const canvasDiv = ref()
let ctx: CanvasRenderingContext2D | null = null

onMounted(async() => {
  const menuData = await window.api.getSymbolLibrary()
  menu.value = JSON.parse(menuData)
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    canvas.value.width = canvasDiv.value.clientWidth
    canvas.value.height = canvasDiv.value.clientHeight
  }
})

watch(
  () => useSymbolStore().$state.currentComponent,
  (newval, oldval) => {
    console.log(
      useSymbolStore().$state.currentComponent
    )
  }
)

let symbolInfos = computed(()=>{
  if(useSymbolStore().$state.currentComponent){
    return {
      centerX:useSymbolStore().$state.currentComponent.centerX,
      centerY: useSymbolStore().$state.currentComponent.centerY,
      toolTip: useSymbolStore().$state.currentComponent.toolTip
    }
  }else{
    return {
      centerX:undefined,
      centerY: undefined,
      toolTip: undefined
    }
  }
})

// 初始化菜单数据
const menu = ref([
  {
    label: '符号库1',
    isOpen: false, // 是否展开
    children: [{ label: 'rect' }, { label: 'triangle' }]
  },
  {
    label: '符号库2',
    isOpen: false, // 是否展开
    children: [{ label: 'object3' }, { label: 'object4' }]
  }
])

// 搜索框的输入值
const searchQuery = ref('')

// 选中的菜单和子项
const chooseMenu = ref<string>()
const chooseItem = ref<string>()

const filteredMenu = computed(() => {
  if (!searchQuery.value) {
    return menu.value // 如果没有输入搜索条件，返回完整菜单
  }

  return menu.value
    .map((item) => {
      // 过滤出匹配的子项
      const filteredChildren = item.children.filter((child) =>
        child.label.toLowerCase().includes(searchQuery.value.toLowerCase())
      )

      // 父项本身匹配或者有子项匹配时，才保留
      const hasMatchingChild =
        filteredChildren.length > 0 ||
        item.label.toLowerCase().includes(searchQuery.value.toLowerCase())

      // 如果父项匹配搜索关键字，或者有匹配的子项，保留该父项及其所有子项
      if (hasMatchingChild) {
        return {
          ...item,
          children: item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
            ? item.children
            : filteredChildren, // 只返回匹配的子项
          isOpen: true // 展开匹配的父项
        }
      }
      // 如果父项不匹配，也不包含匹配的子项，则不返回该父项
    })
    .filter(Boolean) // 过滤掉未返回的项
})


// 切换菜单展开和收起
const toggleMenu = (index: number) => {
  // 关闭其他菜单
  menu.value.forEach((item, idx) => {
    if (idx !== index) {
      item.isOpen = false
    }
  })
  // 切换当前菜单的展开状态
  menu.value[index].isOpen = !menu.value[index].isOpen
  chooseMenu.value = menu.value[index].label
  chooseItem.value = menu.value[index].label // 重置选中的子项
}

// 切换子项
const toggleItem = (item, name: string) => {
  chooseItem.value = name
  chooseMenu.value = item.label

}

const emit = defineEmits(["placeItem"])

const dbtoggleItem = (libraryName:string,symbolName: string) => {
  if (searchQuery.value) {
    searchQuery.value = ''
  } 
  window.placeItemName = {libraryName:libraryName,symbolName:symbolName}
  emit("placeItem",libraryName,symbolName)
}

const draw = () => {
  
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // 获取当前组件的图标数据
  const currentComponent = useSymbolStore().$state.currentComponent;
  console.log(currentComponent);
  if (!currentComponent) return;

  // 计算画布中心点
  const canvasCenterX = canvas.value.width / 2;
  const canvasCenterY = canvas.value.height / 2;

  // 根据图标类型和数据绘制图标
  switch (currentComponent.type) {
    case 'Component':
      // 绘制 tooltip
      if (currentComponent.toolTip && currentComponent.toolTip.show) {
        const toolTipX = currentComponent.toolTip.offsetX + canvasCenterX;
        const toolTipY = currentComponent.toolTip.offsetY + canvasCenterY;
        drawText(ctx, toolTipX, toolTipY, currentComponent.toolTip.content);
      }

      // 绘制 pins
      currentComponent.pins.forEach((pin) => {
        const fromX = pin.from_offsetX + canvasCenterX;
        const fromY = pin.from_offsetY + canvasCenterY;
        const toX = pin.to_offsetX + canvasCenterX;
        const toY = pin.to_offsetY + canvasCenterY;
        drawLine(ctx, fromX, fromY, toX, toY);
      });

      // 绘制 symbols
      currentComponent.symbols.forEach((symbol) => {
        if (symbol.type === 'Line') {
          const fromX = symbol.from_offsetX + canvasCenterX;
          const fromY = symbol.from_offsetY + canvasCenterY;
          const toX = symbol.to_offsetX + canvasCenterX;
          const toY = symbol.to_offsetY + canvasCenterY;
          drawLine(ctx, fromX, fromY, toX, toY);
        }
      });
      break;
    // 其他图标类型的绘制逻辑...
    default:
      console.log('Unsupported icon type');
  }
};

const drawLine = (ctx, fromX, fromY, toX, toY) => {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = 'black'; // 设置线条颜色
  ctx.lineWidth = 2; // 设置线条宽度
  ctx.stroke(); // 绘制线条
};

const drawText = (ctx, x, y, text) => {
  ctx.font = '10px Arial'; // 设置字体样式
  ctx.fillStyle = 'black'; // 设置文本颜色
  ctx.fillText(text, x, y); // 绘制文本
};

window.addEventListener('resize', () => {
  canvas.value.width = canvasDiv.value.clientWidth
  canvas.value.height = canvasDiv.value.clientHeight
  // draw(chooseItem.value)
})

const closeSymbol = () => {
  router.push('/page')
}
</script>

<style lang="scss" scoped>
.icon {
  height: 0.8em;
  width: 0.8em;
  margin-right: 5px;
  vertical-align: center;
}

.rotate {
  transform: rotate(90deg);
}

main {
  display: flex;
  height: 100%;
  width: 100%;

  .leftMenu {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto; /* 使内容超出时出现垂直滚动条 */
    border: 1px solid #dee2e6;
    font-size: 14px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    .serch {
      display: flex;
      align-items: center;
    }

    .serch input[type="text"] {
      width: 100%;
      height: 30px;
      padding: 0 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      outline: none;
      transition: border 0.3s ease-in-out;
    }

    .serch input[type="text"]:focus {
      border-color: #007bff;
    }
    
  }

  .rightPart {
  flex: 3;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa; /* 为.rightPart添加一个背景颜色 */

  .canvasDiv {
    flex: 1;
    background-color: #ffffff;
    border: 1px solid #ccc; /* 为canvasDiv添加一个边框 */
    border-radius: 4px; /* 为canvasDiv添加圆角 */
    overflow: hidden; /* 如果canvas内容超出，隐藏超出部分 */
  }

  .infos {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;


    .info {
      justify-self: center; /* 水平居中 */
      align-self: center; /* 垂直居中 */
      input {
        width: 50px;
        border: none;
        outline: none;
        border-bottom: 1px solid #1c4f81;
        text-align: center;
        font-size: 14px; /* 设置字体大小 */
      }
    }
  }
}
  .menuList {
    width: 100%;
    .menuName {
      height: 20px;
      width: 100%;
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 2px;
    }

    ul > li {
      padding: 2px 0;
      padding-left: 20px;
      cursor: pointer;
      &:hover {
        background-color: #f8f9fa;
      }
    }
  }

  .closeSymbol {
    position: absolute;
    top: 0px;
    right: 0px;
  }
}
</style>
