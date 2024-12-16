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
                    <svg class="icon" :class="item.isOpen?'rotate':''" aria-hidden="true">
                        <use xlink:href="#icon-jiantou"></use>
                    </svg>
                    <span>{{ item.label }}</span>
                </div>
                <ul v-if="item.isOpen">
                    <li 
                        class="itemList" 
                        v-for="child in item.children" 
                        :key="child.label" 
                        @click="toggleItem(item,child.label)" 
                        @dblclick="dbtoggleItem(child.label)"
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
            <div class="info">
            </div>
        </div>
        <div @click="closeSymbol" class="delete">
            <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-guanbi"></use>
            </svg>
        </div>
    </main>
</template>

<script setup lang="ts">
import { ref, computed , onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
const router = useRouter()

const canvas = ref()
const canvasDiv = ref()
let ctx: CanvasRenderingContext2D | null = null;

onMounted(()=>{
    if (canvas.value) {
        ctx = canvas.value.getContext('2d');
        canvas.value.width = canvasDiv.value.clientWidth;
        canvas.value.height = canvasDiv.value.clientHeight;
    }
})
// 初始化菜单数据
const menu = ref([
    {
        label: "符号库1",
        isOpen: false,  // 是否展开
        children: [
            { label: "rect" },
            { label: "triangle" }
        ]
    },
    {
        label: "符号库2",
        isOpen: false,  // 是否展开
        children: [
            { label: "object3" },
            { label: "object4" }
        ]
    }
]);

// 搜索框的输入值
const searchQuery = ref('');

// 选中的菜单和子项
const chooseMenu = ref<string>();
const chooseItem = ref<string>();

const filteredMenu = computed(() => {
    if (!searchQuery.value) {
        return menu.value; // 如果没有输入搜索条件，返回完整菜单
    }

    return menu.value.map(item => {
        // 过滤出匹配的子项
        const filteredChildren = item.children.filter(child => 
            child.label.toLowerCase().includes(searchQuery.value.toLowerCase())
        );

        // 父项本身匹配或者有子项匹配时，才保留
        const hasMatchingChild = filteredChildren.length > 0 || item.label.toLowerCase().includes(searchQuery.value.toLowerCase());

        // 如果父项匹配搜索关键字，或者有匹配的子项，保留该父项及其所有子项
        if (hasMatchingChild) {
            return {
                ...item,
                children: item.label.toLowerCase().includes(searchQuery.value.toLowerCase())?item.children:filteredChildren,  // 只返回匹配的子项
                isOpen: true     // 展开匹配的父项
            };
        }
        // 如果父项不匹配，也不包含匹配的子项，则不返回该父项
    }).filter(Boolean); // 过滤掉未返回的项
});


// 切换菜单展开和收起
const toggleMenu = (index: number) => {
    // 关闭其他菜单
    menu.value.forEach((item, idx) => {
        if (idx !== index) {
            item.isOpen = false;
        }
    });
    // 切换当前菜单的展开状态
    menu.value[index].isOpen = !menu.value[index].isOpen;
    chooseMenu.value = menu.value[index].label;
    chooseItem.value = menu.value[index].label; // 重置选中的子项
}

// 切换子项
const toggleItem = (item,name: string) => {
    chooseItem.value = name;
    chooseMenu.value = item.label;
    draw(chooseItem.value)
}

const dbtoggleItem = (name: string) => {
    if(searchQuery.value){
        searchQuery.value = ''
    }else{
        window.placeItemName = name
        console.log(window.placeItemName)
    }
}

const draw = async (name:string)=>{
    const fnString = await window.api.getDrawFn(name)
    const drawFn = new Function(fnString)
    console.log(canvas.value.width, canvas.value.height)
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.beginPath()
    ctx.closePath()
    drawFn(canvas.value.width/2, canvas.value.height/2,ctx)
}

window.addEventListener("resize",()=>{
    canvas.value.width = canvasDiv.value.clientWidth;
    canvas.value.height = canvasDiv.value.clientHeight;
    draw(chooseItem.value)
})

const closeSymbol = ()=>{
    router.push("/page")
}

</script>

<style lang="scss" scoped>
.icon {
    height: 0.8em;
    width: 0.8em;
    margin-right: 5px;
    vertical-align: center;
}

.rotate{
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
        overflow-y: auto;  /* 使内容超出时出现垂直滚动条 */
        border: 1px solid #dee2e6;
        font-size: 14px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        .serch {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 5px 0;

            input {
                width: 90%;
                outline: none;
            }
        }
    }

    .rightPart {
        flex: 3;
        height: 100%;
        display: flex;
        flex-direction: column;

        .canvasDiv{
            flex: 1;
            background-color: #dee2e6;
        }

        .info{
            flex: 1;
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

    .delete{
        position: absolute;
        top: 0px;
        right: 0px;
    }
}
</style>
