const app = new Vue({
    el: "#app",
    data:{
        url: '',
        slug: '',
        errror:'',
        formVisible: true,
        created: null,
    },
    methods:{
        async createUrl(){
            const response = await fetch('/url',{
                method : 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body:JSON.stringify({
                    url: this.url,
                    slug : this.slug || undefined,
                }),
            });
            if(response.ok){
                const result = await response.json();
                this.formVisible  = false;
                this.created = `https://vsg-sh.herokuapp.com/${result.slug}`;
            }
            else if(res.status === 429){
                this.error = 'You are sending too many requests. Try again in 30 seconds.';
            }
            else{
                const result = await response.json();
                this.error = result.message;
            }
        }
    }
})
