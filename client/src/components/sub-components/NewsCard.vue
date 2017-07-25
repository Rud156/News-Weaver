<template>
    <el-col :span="24" style="font-size: 20px; font-family: 'Signika', sans-serif">
        <el-card style="margin: 14px; position: relative">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="8" :lg="8">
                    <img :src="news.image" width="100%" onerror="this.onerror = null; this.src = 'http://localhost:3000/images/place-holder.png'"
                    />
                    <div style="margin-top: 14px">
                        <a :href="news.URL" target="_blank" class="custom-button" style="color: #2ab7ca; display: block">
                            <icon name="external-link-square"></icon>
                            Open
                        </a>
                    </div>
                    <div class="custom-button" style="margin-top: 7px" @click="favourite(news)" v-if="favourite">
                        <icon name="star"></icon>
                        Favourite
                    </div>
                    <el-row>
                        <el-col :span="12">
                            <div class="custom-button" style="margin-top: 7px" @click="deleteNews(news.hash)" v-if="deleteNews">
                                <icon name="trash"></icon>
                                Delete
                            </div>
                        </el-col>
                        <el-col :span="12">
                            <div class="custom-button" style="margin-top: 7px" @click="editNews(news)" v-if="editNews">
                                <icon name="pencil"></icon>
                                Edit
                            </div>
                        </el-col>
                    </el-row>
                </el-col>
                <el-col :xs="24" :sm="24" :md="16" :lg="16">
                    <h4 style="font-family: 'Questrial', sans-serif; font-size: 21px">
                        <a :href="news.URL" target="_blank" style="color: #2ab7ca;">
                        {{news.title}}
                        </a>
                    </h4>
                    <div v-html="news.description" style="color: gray"></div>
                </el-col>
            </el-row>
            <div style="padding: 7px; color: gray; position: absolute; bottom: 21px; right: 21px">
                {{news.date | ago | capitalize}}
            </div>
        </el-card>
    </el-col>
</template>

<script>
    export default {
        props: {
            news: {
                type: Object,
                required: true
            },
            favourite: {
                type: Function
            },
            deleteNews: {
                type: Function
            },
            editNews: {
                type: Function
            }
        }
    };

</script>