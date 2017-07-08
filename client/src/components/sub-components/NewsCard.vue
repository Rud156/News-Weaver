<template>
    <el-col :span="24" style="font-size: 20px; font-family: 'Signika', sans-serif">
        <el-card style="margin: 14px">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="6" :lg="6">
                    <img :src="news.image" width="100%" />
                    <div style="margin-top: 14px">
                        <a :href="news.URL" target="_blank" class="custom-button" style="color: #2ab7ca">
                            <icon name="external-link-square"></icon>
                            Open
                        </a>
                    </div>
                    <div class="custom-button" style="margin-top: 7px" @click="favourite(news)" v-if="favourite">
                        <icon name="star"></icon>
                        Favourite
                    </div>
                    <div class="custom-button" style="margin-top: 7px" @click="deleteNews(news.hash)" v-if="deleteNews">
                        <icon name="trash"></icon>
                        Delete
                    </div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="18" :lg="18">
                    <h4 style="font-family: 'Questrial', sans-serif; font-size: 21px">
                        <a :href="news.URL" target="_blank" style="color: #2ab7ca;">
                        {{news.title}}
                        </a>
                    </h4>
                    <div v-html="news.description" style="color: gray"></div>
                    <div style="float: right; padding: 7px; color: gray">
                        {{news.date | ago | capitalize}}
                    </div>
                </el-col>
            </el-row>
        </el-card>
    </el-col>
</template>

<script>
    import moment from 'moment';

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
            }
        },
        filters: {
            ago(date) {
                return moment(date).fromNow();
            }
        },
    };

</script>