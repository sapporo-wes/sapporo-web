(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{442:function(t,e,o){"use strict";var r=o(0).a.extend({data:function(){return{version:"1.0.8"}}}),n=o(77),c=o(126),l=o.n(c),f=o(511),component=Object(n.a)(r,(function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("v-footer",{attrs:{color:t.$colors.indigo.darken1,absolute:"",app:"",height:"24",padless:""}},[o("div",{staticClass:"mx-auto my-auto"},[o("span",{staticClass:"white--text",style:{fontSize:"12px"}},[t._v("\n      sapporo-web "+t._s(t.version)+" © Bioinformation and DDBJ Center\n    ")])])])}),[],!1,null,null,null);e.a=component.exports;l()(component,{VFooter:f.a})},467:function(t,e,o){var content=o(468);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,o(33).default)("bb35a8d6",content,!0,{sourceMap:!1})},468:function(t,e,o){var r=o(32)(!1);r.push([t.i,".theme--light.v-footer{background-color:#f5f5f5;color:rgba(0,0,0,.87)}.theme--dark.v-footer{background-color:#272727;color:#fff}.v-sheet.v-footer{border-radius:0}.v-sheet.v-footer:not(.v-sheet--outlined){box-shadow:0 0 0 0 rgba(0,0,0,.2),0 0 0 0 rgba(0,0,0,.14),0 0 0 0 rgba(0,0,0,.12)}.v-sheet.v-footer.v-sheet--shaped{border-radius:24px 0}.v-footer{align-items:center;display:flex;flex:0 1 auto!important;flex-wrap:wrap;padding:6px 16px;position:relative;transition-duration:.2s;transition-property:background-color,left,right;transition-timing-function:cubic-bezier(.4,0,.2,1)}.v-footer:not([data-booted=true]){transition:none!important}.v-footer--absolute,.v-footer--fixed{z-index:3}.v-footer--absolute{position:absolute}.v-footer--absolute:not(.v-footer--inset){width:100%}.v-footer--fixed{position:fixed}.v-footer--padless{padding:0}",""]),t.exports=r},511:function(t,e,o){"use strict";o(13),o(9),o(12),o(23),o(18),o(24);var r=o(2),n=(o(44),o(155),o(467),o(96)),c=o(222),l=o(128),f=o(25),d=o(1);function h(object,t){var e=Object.keys(object);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(object);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(object,t).enumerable}))),e.push.apply(e,o)}return e}function v(t){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?h(Object(source),!0).forEach((function(e){Object(r.a)(t,e,source[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(source)):h(Object(source)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(source,e))}))}return t}e.a=Object(f.a)(n.a,Object(c.a)("footer",["height","inset"]),l.a).extend({name:"v-footer",props:{height:{default:"auto",type:[Number,String]},inset:Boolean,padless:Boolean,tag:{type:String,default:"footer"}},computed:{applicationProperty:function(){return this.inset?"insetFooter":"footer"},classes:function(){return v(v({},n.a.options.computed.classes.call(this)),{},{"v-footer--absolute":this.absolute,"v-footer--fixed":!this.absolute&&(this.app||this.fixed),"v-footer--padless":this.padless,"v-footer--inset":this.inset})},computedBottom:function(){if(this.isPositioned)return this.app?this.$vuetify.application.bottom:0},computedLeft:function(){if(this.isPositioned)return this.app&&this.inset?this.$vuetify.application.left:0},computedRight:function(){if(this.isPositioned)return this.app&&this.inset?this.$vuetify.application.right:0},isPositioned:function(){return Boolean(this.absolute||this.fixed||this.app)},styles:function(){var t=parseInt(this.height);return v(v({},n.a.options.computed.styles.call(this)),{},{height:isNaN(t)?t:Object(d.g)(t),left:Object(d.g)(this.computedLeft),right:Object(d.g)(this.computedRight),bottom:Object(d.g)(this.computedBottom)})}},methods:{updateApplication:function(){var t=parseInt(this.height);return isNaN(t)?this.$el?this.$el.clientHeight:0:t}},render:function(t){var data=this.setBackgroundColor(this.color,{staticClass:"v-footer",class:this.classes,style:this.styles});return t(this.tag,data,this.$slots.default)}})},624:function(t,e,o){"use strict";o.r(e);o(14),o(36),o(41),o(199);var r=o(0),n=o(200),c=o(442),l={components:{AppBar:n.a,AppFooter:c.a},computed:{stateContent:function(){return JSON.stringify(this.$store.state,null,2)}},methods:{dumpState:function(){var t=new Blob([this.stateContent],{type:"application/json"}),e=window.URL.createObjectURL(t),link=document.createElement("a");link.download="sapporo-web_state_".concat(this.$dayjs().local().format("YYYY-MM-DD_HH:mm:ss"),".json"),link.href=e,link.click(),link.remove(),window.URL.revokeObjectURL(e)},clearState:function(){this.$store.dispatch("services/clearServices"),this.$store.dispatch("workflows/clearWorkflows"),this.$store.dispatch("runs/clearRuns")},forceClearState:function(){this.$store.dispatch("services/clearServices",{force:!0}),this.$store.dispatch("workflows/clearWorkflows",{force:!0}),this.$store.dispatch("runs/clearRuns")}}},f=r.a.extend(l),d=o(77),h=o(126),v=o.n(h),m=o(434),w=o(428),x=o(435),y=o(438),O=o(427),j=o(436),component=Object(d.a)(f,(function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("v-app",[o("app-bar"),t._v(" "),o("v-main",{staticClass:"background"},[o("v-container",{attrs:{fluid:""}},[o("v-card",{staticClass:"mx-auto",attrs:{"max-width":"1200"}},[o("div",{staticClass:"d-flex flex-column mx-6 my-4"},[o("div",{staticClass:"d-flex mb-4"},[o("v-btn",{attrs:{color:"info",outlined:""},domProps:{textContent:t._s("Dump State")},on:{click:function(e){return e.stopPropagation(),t.dumpState.apply(null,arguments)}}}),t._v(" "),o("v-btn",{staticClass:"ml-4",attrs:{color:"error",outlined:""},domProps:{textContent:t._s("Clear State")},on:{click:function(e){return e.stopPropagation(),t.clearState.apply(null,arguments)}}}),t._v(" "),o("v-btn",{staticClass:"ml-4",attrs:{color:"error",outlined:""},on:{click:function(e){return e.stopPropagation(),t.forceClearState.apply(null,arguments)}}},[o("v-icon",{attrs:{left:""},domProps:{textContent:t._s("mdi-bomb")}}),t._v(" "),o("span",{domProps:{textContent:t._s("Force Clear State")}})],1)],1),t._v(" "),o("div",{style:{whiteSpace:"pre-wrap",wordWrap:"break-word"},domProps:{textContent:t._s(t.stateContent)}})])])],1)],1),t._v(" "),o("app-footer")],1)}),[],!1,null,null,null);e.default=component.exports;v()(component,{VApp:m.a,VBtn:w.a,VCard:x.a,VContainer:y.a,VIcon:O.a,VMain:j.a})}}]);