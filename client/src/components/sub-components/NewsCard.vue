<template>
    <el-col :span="24" style="font-size: 20px">
        <el-card style="margin: 14px">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="6" :lg="6">
                    <img :src="news.image" width="100%" />
                    <div style="margin-top: 14px" @click="view(news)">
                        <a :href="news.URL" target="_blank" class="custom-button" style="color: #2ab7ca">
                            <icon name="external-link-square"></icon>
                            Open
                        </a>
                    </div>
                    <div class="custom-button" style="margin-top: 7px" @click="favourite(news.hash)">
                        <icon name="star"></icon>
                        Favourite
                    </div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="18" :lg="18">
                    <h5>
                        <a :href="news.URL" target="_blank" style="color: #2ab7ca">
                        {{news.title}}
                        </a>
                    </h5>
                    <div v-html="news.description"></div>
                    <div style="float: right; padding: 7px">
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
                type: Function,
                required: true
            }
        },
        filters: {
            ago(date) {
                return moment(date).fromNow();
            }
        },
    };

</script>