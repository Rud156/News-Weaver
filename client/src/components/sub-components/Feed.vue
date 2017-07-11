<template>
    <el-card style="margin: 14px 0">
        <div slot="header" class="clearfix">
            <el-row style="margin-bottom: 14px">
                <el-col :span="12">
                    <span @click="viewFeed(feed)">
                        <icon name="eye" class="custom-button" scale="1.2"></icon>
                    </span>
                </el-col>
                <el-col :span="12">
                    <span @click="deleteFeed(feed)">
                        <icon name="trash" class="custom-button" scale="1.2"></icon>
                    </span>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="6">
                    <img :src="favicon" alt="title" height="25px" />
                </el-col>
                <el-col :span="18">
                    {{title}}
                </el-col>
            </el-row>
        </div>
        <div style="padding: 14px">
            {{description}}
        </div>
    </el-card>
</template>

<script>
    export default {
        props: {
            feed: {
                type: Object,
                required: true
            },
            deleteFeed: {
                type: Function,
                required: true
            },
            viewFeed: {
                type: Function,
                required: true
            }
        },
        data() {
            return {
                title: this.feed.title,
                description: this.feed.description,
                favicon: this.feed.favicon,
                feedURL: this.feed.feedURL,
                siteURL: this.feed.siteURL,
                category: this.feed.category
            };
        }
    };

</script>