<template>
  <div class="hello">
    <h1>Hello World {{ message }}</h1>
    <h2>
      環境変数: {{ str }}
    </h2>
  </div>
</template>

<script>
import { axios } from "/plugins/axios";

export default {
  components: {},
  data() {
    return {
      message: "",
      str: ""
    };
  },
  mounted() {
    //get_hoge()の実行結果を変数messageに渡す
    this.get_hoge().then((response) => {
      this.message = response.data.message;
    });
    this.str = process.env.VUE_APP_NEXT_PUBLIC_API_BASE_URL
  },
  methods: {
    //FastAPI(http://localhost:3000/api/hoge)にgetをリクエスト
    get_hoge() {
      return axios.get("/api/hoge");
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: #42b983;
}
</style>

