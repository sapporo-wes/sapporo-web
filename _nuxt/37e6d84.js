(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{182:function(e,r,t){"use strict";var n=t(32);r.a=function(e,r){r("colors",n.a)}},183:function(e,r,t){"use strict";var n=t(276),o=t.n(n),c=t(277),f=new o.a({isCompression:!1});r.a=function(e){window.onNuxtReady((function(){Object(c.a)({storage:{getItem:function(e){return f.get(e)},setItem:function(e,r){return f.set(e,r)},removeItem:function(e){return f.remove(e)}}})(e.store)}))}},184:function(e,r,t){"use strict";var n=t(20),o=t.n(n),c=t(278),f=t.n(c),l=t(84),d=t.n(l);o.a.extend(d.a),o.a.extend(f.a),o.a.tz.setDefault(o.a.tz.guess()),r.a=function(e,r){r("dayjs",o.a)}},185:function(e,r,t){"use strict";var n=t(0),o=t(279),c=t.n(o);n.a.use(c.a)},186:function(e,r,t){"use strict";t(33),t(15),t(46),t(35),t(8),t(44),t(51),t(38);var n=t(5),o=(t(60),t(50),t(24),t(59),t(67),t(280));function c(e,r){var t;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(t=function(e,r){if(!e)return;if("string"==typeof e)return f(e,r);var t=Object.prototype.toString.call(e).slice(8,-1);"Object"===t&&e.constructor&&(t=e.constructor.name);if("Map"===t||"Set"===t)return Array.from(e);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return f(e,r)}(e))||r&&e&&"number"==typeof e.length){t&&(e=t);var i=0,n=function(){};return{s:n,n:function(){return i>=e.length?{done:!0}:{done:!1,value:e[i++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,c=!0,l=!1;return{s:function(){t=e[Symbol.iterator]()},n:function(){var e=t.next();return c=e.done,e},e:function(e){l=!0,o=e},f:function(){try{c||null==t.return||t.return()}finally{if(l)throw o}}}}function f(e,r){(null==r||r>e.length)&&(r=e.length);for(var i=0,t=new Array(r);i<r;i++)t[i]=e[i];return t}r.a=function(e){window.onNuxtReady(Object(n.a)(regeneratorRuntime.mark((function r(){var t,n,f,l,d,w;return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:if("'true'"!==(null===(t=e.env)||void 0===t?void 0:t.LOAD_PRE_REGISTERED_SERVICES)){r.next=21;break}n=e.store.getters["services/services"],f=n.map((function(e){return e.name})),l=c(o),r.prev=4,l.s();case 6:if((d=l.n()).done){r.next=13;break}if(w=d.value,f.includes(w.name)){r.next=11;break}return r.next=11,e.store.dispatch("services/submitService",{name:w.name,endpoint:w.endpoint,preRegistered:!0});case 11:r.next=6;break;case 13:r.next=18;break;case 15:r.prev=15,r.t0=r.catch(4),l.e(r.t0);case 18:return r.prev=18,l.f(),r.finish(18);case 21:case"end":return r.stop()}}),r,null,[[4,15,18,21]])}))))}},190:function(e,r,t){"use strict";var n=t(0).a.extend({}),o=(t(314),t(64)),c=t(93),f=t.n(c),l=t(425),d=t(415),w=t(414),v=t(421),k=t(273),component=Object(o.a)(n,(function(){var e=this,r=e.$createElement,n=e._self._c||r;return n("v-app-bar",{attrs:{color:e.$colors.indigo.darken2,app:"",elevation:"8",absolute:""}},[n("v-toolbar-title",[n("nuxt-link",{staticClass:"white--text text-decoration-none",attrs:{to:"/"}},[n("img",{staticClass:"mt-1",attrs:{src:t(313),alt:"logo",height:"60"}})])],1),e._v(" "),n("v-spacer"),e._v(" "),"/state"!==e.$route.path?n("v-btn",{staticClass:"mr-4",attrs:{color:"white",nuxt:"",outlined:"",to:"state"}},[n("v-icon",{staticClass:"mr-2",attrs:{color:"white"},domProps:{textContent:e._s("mdi-database")}}),e._v("\n    State\n  ")],1):e._e(),e._v(" "),n("v-btn",{staticClass:"text-capitalize",attrs:{color:"white",href:"https://github.com/ddbj/SAPPORO-web",outlined:""}},[n("v-icon",{staticClass:"mr-2",attrs:{color:"white"},domProps:{textContent:e._s("mdi-github")}}),e._v("\n    GitHub\n  ")],1)],1)}),[],!1,null,"fcda48d6",null);r.a=component.exports;f()(component,{VAppBar:l.a,VBtn:d.a,VIcon:w.a,VSpacer:v.a,VToolbarTitle:k.a})},192:function(e,r,t){"use strict";t(24),t(9),t(59),t(67),t(33);var n={data:function(){return{type:"",id:""}},computed:{items:function(){var e=[{text:"Home",nuxt:!0,to:"/"}];if("service"===this.type){var r=this.$store.getters["services/service"](this.id);r&&e.push({text:r.name,nuxt:!0,to:"/services?serviceId=".concat(r.id)})}else if("workflow"===this.type){var t=this.$store.getters["workflows/workflow"](this.id);if(t){var n=this.$store.getters["services/service"](t.serviceId);n&&e.push({text:n.name,nuxt:!0,to:"/services?serviceId=".concat(n.id)}),e.push({text:t.name,nuxt:!0,to:"/workflows?workflowId=".concat(t.id)})}}else if("run"===this.type){var o=this.$store.getters["runs/run"](this.id);if(o){var c=this.$store.getters["workflows/workflow"](o.workflowId);if(c){var f=this.$store.getters["services/service"](o.serviceId);f&&e.push({text:f.name,nuxt:!0,to:"/services?serviceId=".concat(f.id)}),e.push({text:c.name,nuxt:!0,to:"/workflows?workflowId=".concat(c.id)})}e.push({text:o.name,nuxt:!0,to:"/runs?runId=".concat(o.id)})}}return e}},created:function(){for(var e=this.$route.query,r=0,t=Object.keys(e);r<t.length;r++){var n=t[r];if(n.includes("Id")){this.type=n.slice(0,-2);var o=e[n]||"";Array.isArray(o)&&(o=o[0]||""),this.id=o;break}}}},o=t(0).a.extend(n),c=t(64),f=t(93),l=t.n(f),d=t(426),w=t(414),component=Object(c.a)(o,(function(){var e=this,r=e.$createElement,t=e._self._c||r;return t("v-breadcrumbs",{staticClass:"pt-2",attrs:{items:e.items,large:""},scopedSlots:e._u([{key:"divider",fn:function(){return[t("v-icon",{domProps:{textContent:e._s("mdi-chevron-right")}})]},proxy:!0}])})}),[],!1,null,null,null);r.a=component.exports;l()(component,{VBreadcrumbs:d.a,VIcon:w.a})},231:function(e,r,t){var content=t(315);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,t(27).default)("c361493e",content,!0,{sourceMap:!1})},280:function(e){e.exports=JSON.parse('[{"name":"Pre-registered Service","endpoint":"http://localhost:1122"}]')},291:function(e,r,t){e.exports=t(292)},313:function(e,r,t){e.exports=t.p+"img/logo.ad3f00d.svg"},314:function(e,r,t){"use strict";t(231)},315:function(e,r,t){var n=t(26)(!1);n.push([e.i,".v-list-item__icon[data-v-fcda48d6]:first-child{margin-right:16px}",""]),e.exports=n},361:function(e,r,t){var content=t(362);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,t(27).default)("f19ab706",content,!0,{sourceMap:!1})},362:function(e,r,t){var n=t(26)(!1);n.push([e.i,'.background{background:#e7ebf4}.text-decoration-none{text-decoration:none}.card-header{font-family:"Quicksand",sans-serif;font-size:1.75rem;font-weight:600}font{color:#424242}',""]),e.exports=n},363:function(e,r,t){"use strict";t.r(r)},364:function(e,r,t){"use strict";t.r(r),t.d(r,"state",(function(){return _})),t.d(r,"getters",(function(){return R})),t.d(r,"mutations",(function(){return O})),t.d(r,"actions",(function(){return j}));t(46),t(8),t(44),t(51);var n=t(65),o=t(5),c=t(7),f=t(17),l=(t(60),t(103),t(11),t(50),t(9),t(24),t(23),t(173),t(33),t(57),t(30),t(59),t(67),t(15),t(35),t(38),t(20)),d=t.n(l),w=t(84),v=t.n(w),k=t(0),m=t(32),h=t(72),I=t(62);function y(e,r){var t;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(t=function(e,r){if(!e)return;if("string"==typeof e)return x(e,r);var t=Object.prototype.toString.call(e).slice(8,-1);"Object"===t&&e.constructor&&(t=e.constructor.name);if("Map"===t||"Set"===t)return Array.from(e);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return x(e,r)}(e))||r&&e&&"number"==typeof e.length){t&&(e=t);var i=0,n=function(){};return{s:n,n:function(){return i>=e.length?{done:!0}:{done:!1,value:e[i++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,c=!0,f=!1;return{s:function(){t=e[Symbol.iterator]()},n:function(){var e=t.next();return c=e.done,e},e:function(e){f=!0,o=e},f:function(){try{c||null==t.return||t.return()}finally{if(f)throw o}}}}function x(e,r){(null==r||r>e.length)&&(r=e.length);for(var i=0,t=new Array(r);i<r;i++)t[i]=e[i];return t}d.a.extend(v.a);var _=function(){return{}},R={run:function(e){return function(r){return e[r]}},runs:function(e){return Object.values(e)},runsByIds:function(e,r){return function(e){return e.map((function(e){return r.run(e)})).filter((function(e){return e}))}},runIds:function(e){return Object.keys(e)},tableItems:function(e,r,t,n){return function(e){var t,o=[],c=y(r.runsByIds(e));try{for(c.s();!(t=c.n()).done;){var f=t.value,l=n["services/service"](f.serviceId),w=n["workflows/workflow"](f.workflowId);o.push({runId:f.id,runName:f.name,serviceId:f.serviceId,serviceName:l?l.name:"",workflowId:f.workflowId,workflowName:w?w.name:"",workflowTypeVersion:"".concat(w?w.type:""," ").concat(w?w.version:""),addedDate:d()(f.addedDate).local().format("YYYY-MM-DD HH:mm:ss"),state:f.state,stateColor:r.stateColor(f.id)})}}catch(e){c.e(e)}finally{c.f()}return o}},stateColor:function(e,r){return function(e){var t=r.run(e);if(t){var n=t.state;if("UNKNOWN"===n)return m.a.grey.darken1;if("QUEUED"===n)return m.a.lightBlue.darken1;if("INITIALIZING"===n)return m.a.lightBlue.darken1;if("RUNNING"===n)return m.a.indigo.darken1;if("PAUSED"===n)return m.a.lightBlue.darken1;if("COMPLETE"===n)return m.a.green.darken1;if("EXECUTOR_ERROR"===n)return m.a.red.darken1;if("SYSTEM_ERROR"===n)return m.a.red.darken1;if("CANCELED"===n)return m.a.amber.darken1;if("CANCELING"===n)return m.a.amber.darken1}return m.a.grey.darken1}}},O={clearRuns:function(e){for(var r=0,t=Object.keys(e);r<t.length;r++){var n=t[r];n in e&&k.a.delete(e,n)}},deleteRun:function(e,r){r in e&&k.a.delete(e,r)},addRun:function(e,r){k.a.set(e,r.id,r)},setProp:function(e,r){if(r.runId in e&&(k.a.set(e[r.runId],r.key,r.value),"object"===Object(f.a)(r.value)&&"run_id"in r.value))for(var t=r.value,n=0,o=Object.entries(t);n<o.length;n++){var l=Object(c.a)(o[n],2),d=l[0],w=l[1];if(null===w||"object"!==Object(f.a)(w))k.a.set(e[r.runId].runLog,d,w);else for(var v=0,m=Object.entries(w);v<m.length;v++){var h=Object(c.a)(m[v],2),I=h[0],y=h[1];k.a.set(e[r.runId].runLog[d],I,y)}}}},j={clearRuns:function(e){(0,e.commit)("clearRuns")},executeRun:function(e,r){var t=this;return Object(o.a)(regeneratorRuntime.mark((function o(){var c,f,l,data,w,v,i,k,m,y,x,_,R;return regeneratorRuntime.wrap((function(o){for(;;)switch(o.prev=o.next){case 0:if(c=e.dispatch,f=e.commit,l=e.rootGetters,data=new FormData,r.workflow.preRegistered?(data.append("workflow_name",r.workflow.name),data.append("tags",r.tags)):(data.append("workflow_url",r.workflow.url),data.append("workflow_type",r.workflow.type),data.append("workflow_type_version",r.workflow.version),"workflow_name"in(w=JSON.parse(r.tags))||(w.workflow_name=r.workflow.name),data.append("tags",JSON.stringify(w))),data.append("workflow_engine_name",r.wfEngineName),data.append("workflow_engine_parameters",r.wfEngineParams),data.append("workflow_params",r.wfParams),data.append("workflow_attachment",r.wfAttachmentText),!Object(h.f)(r.workflow.url)&&l["services/workflowAttachment"](r.service.id)&&(v=r.workflow.url.split("/").slice(-1)[0],[].concat(Object(n.a)(JSON.parse(r.wfAttachmentText).map((function(e){return e.file_name})).map((function(e){return e.split("/").slice(-1)[0]}))),Object(n.a)(r.fileNames.filter((function(e){return e})).map((function(e){return e.split("/").slice(-1)[0]})))).includes(v)||data.append("workflow_attachment[]",new Blob([r.workflow.content]),r.workflow.url)),l["services/workflowAttachment"](r.service.id))for(i=0;i<r.workflowAttachment.length;i++)(k=r.workflowAttachment[i])&&((m=r.fileNames[i])?data.append("workflow_attachment[]",k,m):data.append("workflow_attachment[]",k));return o.next=11,Object(I.e)(t.$axios,r.service.endpoint,data);case 11:return y=o.sent.run_id,o.next=14,Object(I.c)(t.$axios,r.service.endpoint,y);case 14:return x=o.sent,o.next=17,Object(I.b)(t.$axios,r.service.endpoint,y);case 17:return _=o.sent,c("services/addRunId",{serviceId:r.service.id,runId:y},{root:!0}),c("workflows/addRunId",{workflowId:r.workflow.id,runId:y},{root:!0}),R=d()().utc().format(),f("addRun",{name:r.runName,state:x.state,addedDate:R,updatedDate:R,serviceId:r.service.id,workflowId:r.workflow.id,id:y,runLog:_}),o.abrupt("return",y);case 23:case"end":return o.stop()}}),o)})))()},deleteRuns:function(e,r){return Object(o.a)(regeneratorRuntime.mark((function t(){var n,o,c,f,l,d,w;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:n=e.commit,o=e.dispatch,c=e.getters,f=y(r),t.prev=2,f.s();case 4:if((l=f.n()).done){t.next=15;break}if(d=l.value,!(w=c.run(d))){t.next=13;break}return t.next=10,o("services/removeRunId",{serviceId:w.serviceId,runId:d},{root:!0});case 10:return t.next=12,o("workflows/removeRunId",{workflowId:w.workflowId,runId:d},{root:!0});case 12:n("deleteRun",d);case 13:t.next=4;break;case 15:t.next=20;break;case 17:t.prev=17,t.t0=t.catch(2),f.e(t.t0);case 20:return t.prev=20,f.f(),t.finish(20);case 23:case"end":return t.stop()}}),t,null,[[2,17,20,23]])})))()},addRun:function(e,r){var t=e.commit,n=e.dispatch;n("services/addRunId",{serviceId:r.serviceId,runId:r.runId},{root:!0}),n("workflows/addRunId",{workflowId:r.workflowId,runId:r.runId},{root:!0});var o=d()().utc().format();t("addRun",{name:r.runName,state:r.runLog.state,addedDate:o,updatedDate:o,serviceId:r.serviceId,workflowId:r.workflowId,id:r.runId,runLog:r.runLog})},updateRun:function(e,r){var t=this;return Object(o.a)(regeneratorRuntime.mark((function n(){var o,c,f,l,w,v;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(o=e.commit,c=e.rootGetters,f=e.getters,!(l=f.run(r))){n.next=11;break}if(!(w=c["services/service"](l.serviceId))){n.next=11;break}return n.next=7,Object(I.b)(t.$axios,w.endpoint,r);case 7:v=n.sent,o("setProp",{key:"state",value:v.state,runId:l.id}),o("setProp",{key:"runLog",value:v,runId:l.id}),o("setProp",{key:"updatedDate",value:d()().utc().format(),runId:l.id});case 11:case"end":return n.stop()}}),n)})))()},updateAllRunsState:function(e){return Object(o.a)(regeneratorRuntime.mark((function r(){var t,n,o,c,f,l,d;return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:t=e.rootGetters,n=e.dispatch,o=t["services/services"],c=[],f=y(o),r.prev=4,f.s();case 6:if((l=f.n()).done){r.next=15;break}return d=l.value,r.t0=c,r.next=11,n("updateAllRunsStateByService",d.id);case 11:r.t1=r.sent,r.t0.push.call(r.t0,r.t1);case 13:r.next=6;break;case 15:r.next=20;break;case 17:r.prev=17,r.t2=r.catch(4),f.e(r.t2);case 20:return r.prev=20,f.f(),r.finish(20);case 23:Promise.all(c);case 24:case"end":return r.stop()}}),r,null,[[4,17,20,23]])})))()},updateAllRunsStateByService:function(e,r){var t=this;return Object(o.a)(regeneratorRuntime.mark((function n(){var o,c,f,l,w,v,k,m,h,x,_,R,O,j,S,A;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(o=e.commit,c=e.rootGetters,!(f=c["services/service"](r))){n.next=35;break}if(l=d()().utc().format(),!c["services/getRuns"](f.id)){n.next=15;break}return n.next=7,Object(I.a)(t.$axios,f.endpoint);case 7:w=n.sent,v={},k=y(w.runs);try{for(k.s();!(m=k.n()).done;)h=m.value,v[h.run_id]=h}catch(e){k.e(e)}finally{k.f()}x=y(f.runIds);try{for(x.s();!(_=x.n()).done;)R=_.value,o("setProp",R in v?{key:"state",value:v[R].state,runId:R}:{key:"state",value:"UNKNOWN",runId:R}),o("setProp",{key:"updatedDate",value:l,runId:R})}catch(e){x.e(e)}finally{x.f()}n.next=35;break;case 15:O=y(f.runIds),n.prev=16,O.s();case 18:if((j=O.n()).done){n.next=27;break}return S=j.value,n.next=22,Object(I.c)(t.$axios,f.endpoint,S).catch((function(e){return{state:"UNKNOWN"}}));case 22:A=n.sent.state,o("setProp",{key:"state",value:A,runId:S}),o("setProp",{key:"updatedDate",value:l,runId:S});case 25:n.next=18;break;case 27:n.next=32;break;case 29:n.prev=29,n.t0=n.catch(16),O.e(n.t0);case 32:return n.prev=32,O.f(),n.finish(32);case 35:case"end":return n.stop()}}),n,null,[[16,29,32,35]])})))()},cancelRun:function(e,r){var t=this;return Object(o.a)(regeneratorRuntime.mark((function n(){var o,c,f,l;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(o=e.rootGetters,c=e.getters,!(f=c.run(r))||!["QUEUED","INITIALIZING","RUNNING","PAUSED"].includes(f.state)){n.next=7;break}if(!(l=o["services/service"](f.serviceId))){n.next=7;break}return n.next=7,Object(I.f)(t.$axios,l.endpoint,r);case 7:case"end":return n.stop()}}),n)})))()}}},390:function(e,r,t){"use strict";t.r(r),t.d(r,"state",(function(){return _})),t.d(r,"getters",(function(){return R})),t.d(r,"mutations",(function(){return O})),t.d(r,"actions",(function(){return j}));t(33),t(8),t(44),t(51);var n=t(65),o=t(5),c=t(17),f=t(7),l=(t(60),t(103),t(9),t(50),t(173),t(24),t(11),t(242),t(243),t(244),t(245),t(246),t(247),t(248),t(249),t(250),t(251),t(252),t(253),t(254),t(255),t(256),t(257),t(258),t(259),t(260),t(15),t(35),t(38),t(23),t(46),t(20)),d=t.n(l),w=t(84),v=t.n(w),k=t(187),m=t(0),h=t(32),I=t(62);function y(e,r){var t;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(t=function(e,r){if(!e)return;if("string"==typeof e)return x(e,r);var t=Object.prototype.toString.call(e).slice(8,-1);"Object"===t&&e.constructor&&(t=e.constructor.name);if("Map"===t||"Set"===t)return Array.from(e);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return x(e,r)}(e))||r&&e&&"number"==typeof e.length){t&&(e=t);var i=0,n=function(){};return{s:n,n:function(){return i>=e.length?{done:!0}:{done:!1,value:e[i++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,c=!0,f=!1;return{s:function(){t=e[Symbol.iterator]()},n:function(){var e=t.next();return c=e.done,e},e:function(e){f=!0,o=e},f:function(){try{c||null==t.return||t.return()}finally{if(f)throw o}}}}function x(e,r){(null==r||r>e.length)&&(r=e.length);for(var i=0,t=new Array(r);i<r;i++)t[i]=e[i];return t}d.a.extend(v.a);var _=function(){return{}},R={service:function(e){return function(r){return e[r]}},services:function(e){return Object.values(e)},serviceIds:function(e){return Object.keys(e)},registeredOnlyMode:function(e,r){return function(e){var t=r.service(e);return!!t&&!0===t.serviceInfo.tags.registered_only_mode}},getRuns:function(e,r){return function(e){var t=r.service(e);return!t||!1!==t.serviceInfo.tags.get_runs}},workflowAttachment:function(e,r){return function(e){var t=r.service(e);return!t||!1!==t.serviceInfo.tags.workflow_attachment}},stateColor:function(e,r){return function(e){var t=r.service(e);if(t){var n=t.state;if("Available"===n)return h.a.green.darken1;if("Disconnect"===n)return h.a.red.darken1;if("Unknown"===n)return h.a.grey.darken1}return h.a.grey.darken1}},serviceFilteredByWorkflowId:function(e,r,t,n){return function(e){var t=n["workflows/workflow"](e);if(t)return r.service(t.serviceId)}},serviceFilteredByRunId:function(e,r,t,n){return function(e){var t=n["runs/run"](e);if(t)return r.service(t.serviceId)}},workflowEngines:function(e,r){return function(e){var t=r.service(e);return t?Object.entries(t.serviceInfo.workflow_engine_versions).map((function(e){var r=Object(f.a)(e,2);return{name:r[0],version:r[1]}})):[]}},workflowLanguages:function(e,r){return function(e){var t=r.service(e);return t?Object.entries(t.serviceInfo.workflow_type_versions).map((function(e){var r=Object(f.a)(e,2);return{name:r[0],versions:r[1].workflow_type_version}})):[]}},workflowEngineVersion:function(e,r){return function(e){var t,n=y(r.workflowEngines(e.serviceId));try{for(n.s();!(t=n.n()).done;){var o=t.value;if(o.name===e.workflowEngine)return o.version}}catch(e){n.e(e)}finally{n.f()}return""}}},O={clearServices:function(e,r){for(var t=0,n=Object.keys(e);t<n.length;t++){var o=n[t];!(o in e)||!r&&e[o].preRegistered||m.a.delete(e,o)}},deleteService:function(e,r){m.a.delete(e,r)},setService:function(e,r){m.a.set(e,r.id,r)},setProp:function(e,r){if(r.serviceId in e&&(m.a.set(e[r.serviceId],r.key,r.value),"object"===Object(c.a)(r.value)&&"workflow_type_versions"in r.value))for(var t=r.value,n=0,o=Object.entries(t);n<o.length;n++){var l=Object(f.a)(o[n],2),d=l[0],w=l[1];if(null===w||"object"!==Object(c.a)(w))m.a.set(e[r.serviceId].serviceInfo,d,w);else for(var v=0,k=Object.entries(w);v<k.length;v++){var h=Object(f.a)(k[v],2),I=h[0],y=h[1];m.a.set(e[r.serviceId].serviceInfo[d],I,y)}}}},j={clearServices:function(e,r){(0,e.commit)("clearServices",!!(null==r?void 0:r.force))},submitService:function(e,r){var t=this;return Object(o.a)(regeneratorRuntime.mark((function n(){var o,c,f,l,w,v,m,h,x,_,R,O;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return o=e.commit,c=e.dispatch,n.next=3,Object(I.d)(t.$axios,r.endpoint).then((function(e){return{serviceInfo:e,state:"Available"}})).catch((function(e){return{serviceInfo:{workflow_type_versions:{},supported_wes_versions:[],supported_filesystem_protocols:[],workflow_engine_versions:{},default_workflow_engine_parameters:[],system_state_counts:{},auth_instructions_url:"",contact_info_url:"",tags:{},executable_workflows:[]},state:"Disconnect"}}));case 3:if(f=n.sent,l=f.serviceInfo,w=f.state,v=Object(k.a)(),m=[],!l.executable_workflows){n.next=28;break}h=y(l.executable_workflows),n.prev=10,h.s();case 12:if((x=h.n()).done){n.next=20;break}return _=x.value,n.next=16,c("workflows/addWorkflow",{serviceId:v,workflow:_,preRegistered:!0},{root:!0});case 16:R=n.sent,m.push(R);case 18:n.next=12;break;case 20:n.next=25;break;case 22:n.prev=22,n.t0=n.catch(10),h.e(n.t0);case 25:return n.prev=25,h.f(),n.finish(25);case 28:return O=d()().utc().format(),o("setService",{name:r.name,endpoint:r.endpoint,state:w,addedDate:O,updateDate:O,preRegistered:r.preRegistered,id:v,workflowIds:m,runIds:[],serviceInfo:l}),n.abrupt("return",v);case 31:case"end":return n.stop()}}),n,null,[[10,22,25,28]])})))()},deleteServices:function(e,r){var t,n=e.commit,o=e.dispatch,c=e.getters,f=r.map((function(e){return c.service(e)})).filter((function(e){return e&&!e.preRegistered})),l=f.flatMap((function(e){return e.workflowIds})),d=f.flatMap((function(e){return e.runIds})),w=y(f);try{for(w.s();!(t=w.n()).done;){n("deleteService",t.value.id)}}catch(e){w.e(e)}finally{w.f()}o("workflows/deleteWorkflows",{workflowIds:l,force:!0},{root:!0}),o("runs/deleteRuns",d,{root:!0})},updateService:function(e,r){var t=this;return Object(o.a)(regeneratorRuntime.mark((function c(){var f,l,w,v,k;return regeneratorRuntime.wrap((function(c){for(;;)switch(c.prev=c.next){case 0:if(f=e.commit,l=e.getters,w=e.rootGetters,v=e.dispatch,!(k=l.service(r))){c.next=6;break}return c.next=5,Object(I.d)(t.$axios,k.endpoint).then(function(){var e=Object(o.a)(regeneratorRuntime.mark((function e(t){var o,c,l,d,m;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(f("setProp",{key:"serviceInfo",value:t,serviceId:r}),!t.executable_workflows){e.next=20;break}o=new Set(t.executable_workflows.map((function(e){return e.workflow_name}))),c=new Set(w["workflows/workflowsByIds"](k.workflowIds).filter((function(e){return e.preRegistered})).map((function(e){return e.name}))),l=y(new Set([].concat(Object(n.a)(o),Object(n.a)(c)))),e.prev=5,m=regeneratorRuntime.mark((function e(){var n,f;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=d.value,!o.has(n)||!c.has(n)){e.next=6;break}return e.next=4,v("workflows/updateWorkflow",{serviceId:r,workflowId:w["workflows/workflowsByIds"](k.workflowIds).filter((function(e){return e.name===n}))[0].id,workflow:t.executable_workflows.filter((function(e){return e.workflow_name===n}))[0]},{root:!0});case 4:e.next=14;break;case 6:if(!o.has(n)||c.has(n)){e.next=13;break}return e.next=9,v("workflows/addWorkflow",{serviceId:r,workflow:t.executable_workflows.filter((function(e){return e.workflow_name===n}))[0],preRegistered:!0},{root:!0});case 9:f=e.sent,v("addWorkflowId",{serviceId:r,workflowId:f}),e.next=14;break;case 13:!o.has(n)&&c.has(n)&&v("workflows/deleteWorkflows",{workflowIds:[w["workflows/workflowsByIds"](k.workflowIds).filter((function(e){return e.name===n}))[0].id],force:!0},{root:!0});case 14:case"end":return e.stop()}}),e)})),l.s();case 8:if((d=l.n()).done){e.next=12;break}return e.delegateYield(m(),"t0",10);case 10:e.next=8;break;case 12:e.next=17;break;case 14:e.prev=14,e.t1=e.catch(5),l.e(e.t1);case 17:return e.prev=17,l.f(),e.finish(17);case 20:f("setProp",{key:"state",value:"Available",serviceId:r});case 21:case"end":return e.stop()}}),e,null,[[5,14,17,20]])})));return function(r){return e.apply(this,arguments)}}()).catch((function(e){f("setProp",{key:"state",value:"Disconnect",serviceId:r})}));case 5:f("setProp",{key:"updatedDate",value:d()().utc().format(),serviceId:r});case 6:case"end":return c.stop()}}),c)})))()},updateAllServices:function(e){return Object(o.a)(regeneratorRuntime.mark((function r(){var t,n,o,c,f,l;return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:t=e.getters,n=e.dispatch,o=[],c=y(t.serviceIds);try{for(c.s();!(f=c.n()).done;)l=f.value,o.push(n("updateService",l))}catch(e){c.e(e)}finally{c.f()}return r.next=6,Promise.all(o);case 6:case"end":return r.stop()}}),r)})))()},addWorkflowId:function(e,r){var t=e.commit,o=e.getters.service(r.serviceId);o&&t("setProp",{key:"workflowIds",value:Array.from(new Set([].concat(Object(n.a)(o.workflowIds),[r.workflowId]))),serviceId:r.serviceId})},removeWorkflowId:function(e,r){var t=e.commit,n=e.getters.service(r.serviceId);n&&t("setProp",{key:"workflowIds",value:n.workflowIds.filter((function(e){return e!==r.workflowId})),serviceId:r.serviceId})},addRunId:function(e,r){var t=e.commit,o=e.getters.service(r.serviceId);o&&t("setProp",{key:"runIds",value:Array.from(new Set([].concat(Object(n.a)(o.runIds),[r.runId]))),serviceId:r.serviceId})},removeRunId:function(e,r){var t=e.commit,n=e.getters.service(r.serviceId);n&&t("setProp",{key:"runIds",value:n.runIds.filter((function(e){return e!==r.runId})),serviceId:r.serviceId})}}},392:function(e,r,t){"use strict";t.r(r),t.d(r,"state",(function(){return I})),t.d(r,"getters",(function(){return y})),t.d(r,"mutations",(function(){return x})),t.d(r,"actions",(function(){return _}));t(8),t(44),t(51);var n=t(65),o=t(5),c=(t(60),t(103),t(11),t(50),t(9),t(24),t(23),t(33),t(57),t(30),t(242),t(243),t(46),t(35),t(244),t(245),t(246),t(247),t(248),t(249),t(250),t(251),t(252),t(253),t(254),t(255),t(256),t(257),t(258),t(259),t(260),t(15),t(38),t(20)),f=t.n(c),l=t(84),d=t.n(l),w=t(187),v=t(0),k=t(72);function m(e,r){var t;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(t=function(e,r){if(!e)return;if("string"==typeof e)return h(e,r);var t=Object.prototype.toString.call(e).slice(8,-1);"Object"===t&&e.constructor&&(t=e.constructor.name);if("Map"===t||"Set"===t)return Array.from(e);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return h(e,r)}(e))||r&&e&&"number"==typeof e.length){t&&(e=t);var i=0,n=function(){};return{s:n,n:function(){return i>=e.length?{done:!0}:{done:!1,value:e[i++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,c=!0,f=!1;return{s:function(){t=e[Symbol.iterator]()},n:function(){var e=t.next();return c=e.done,e},e:function(e){f=!0,o=e},f:function(){try{c||null==t.return||t.return()}finally{if(f)throw o}}}}function h(e,r){(null==r||r>e.length)&&(r=e.length);for(var i=0,t=new Array(r);i<r;i++)t[i]=e[i];return t}f.a.extend(d.a);var I=function(){return{}},y={workflow:function(e){return function(r){return e[r]}},workflows:function(e){return Object.values(e)},workflowsByIds:function(e,r){return function(e){return e.map((function(e){return r.workflow(e)})).filter((function(e){return e}))}},workflowIds:function(e){return Object.keys(e)},workflowFilteredByRunId:function(e,r,t,n){return function(e){var t=n["runs/run"](e);if(t)return r.workflow(t.workflowId)}},tableItems:function(e,r){return function(e){var t,n=[],o=m(r.workflowsByIds(e));try{for(o.s();!(t=o.n()).done;){var c=t.value;n.push({workflowId:c.id,workflowName:c.name,workflowTypeVersion:"".concat(c.type," ").concat(c.version),date:c.preRegistered?f()(c.updatedDate).local().format("YYYY-MM-DD HH:mm:ss"):f()(c.addedDate).local().format("YYYY-MM-DD HH:mm:ss"),preRegistered:c.preRegistered})}}catch(e){o.e(e)}finally{o.f()}return n}}},x={clearWorkflows:function(e,r){for(var t=0,n=Object.keys(e);t<n.length;t++){var o=n[t];!(o in e)||!r&&e[o].preRegistered||v.a.delete(e,o)}},deleteWorkflow:function(e,r){v.a.delete(e,r)},setWorkflow:function(e,r){v.a.set(e,r.id,r)},setProp:function(e,r){r.workflowId in e&&v.a.set(e[r.workflowId],r.key,r.value)}},_={clearWorkflows:function(e,r){(0,e.commit)("clearWorkflows",!!(null==r?void 0:r.force))},submitWorkflow:function(e,r){var t=e.commit,n=e.dispatch,o=Object(w.a)();n("services/addWorkflowId",{serviceId:r.serviceId,workflowId:o},{root:!0});var c=f()();return t("setWorkflow",{name:r.name,type:r.type,version:r.version,url:r.url,content:r.content,addedDate:c,updatedDate:c,preRegistered:r.preRegistered,preRegisteredWorkflowAttachment:[],serviceId:r.serviceId,id:o,runIds:[]}),o},addWorkflow:function(e,r){var t=this;return Object(o.a)(regeneratorRuntime.mark((function n(){var o,c,content,l,d,v,h,I,y,x,_,R,O;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(o=e.commit,c=Object(w.a)(),content="",!Object(k.f)(r.workflow.workflow_url)){n.next=13;break}return n.next=6,Object(k.b)(t.$axios,r.workflow.workflow_url);case 6:return l=n.sent,n.next=9,t.$axios.$get(l);case 9:d=n.sent,content="string"==typeof d?d:JSON.stringify(d,null,2),n.next=39;break;case 13:v=r.workflow.workflow_url.split("/").slice(-1)[0],h=m(r.workflow.workflow_attachment),n.prev=15,h.s();case 17:if((I=h.n()).done){n.next=31;break}if(y=I.value,x=y.file_name.split("/").slice(-1)[0],v!==x){n.next=29;break}return n.next=23,Object(k.b)(t.$axios,y.file_url);case 23:return _=n.sent,n.next=26,t.$axios.$get(_);case 26:return R=n.sent,content="string"==typeof R?R:JSON.stringify(R,null,2),n.abrupt("break",31);case 29:n.next=17;break;case 31:n.next=36;break;case 33:n.prev=33,n.t0=n.catch(15),h.e(n.t0);case 36:return n.prev=36,h.f(),n.finish(36);case 39:return O=f()(),o("setWorkflow",{name:r.workflow.workflow_name,type:r.workflow.workflow_type,version:r.workflow.workflow_type_version,url:r.workflow.workflow_url,content:content,addedDate:O,updatedDate:O,preRegistered:r.preRegistered,preRegisteredWorkflowAttachment:r.workflow.workflow_attachment,serviceId:r.serviceId,id:c,runIds:[]}),n.abrupt("return",c);case 42:case"end":return n.stop()}}),n,null,[[15,33,36,39]])})))()},updateWorkflow:function(e,r){var t=this;return Object(o.a)(regeneratorRuntime.mark((function n(){var o,content,c,l,d,w,v,h,I,y,x;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(o=e.commit,content="",!Object(k.f)(r.workflow.workflow_url)){n.next=12;break}return n.next=5,Object(k.b)(t.$axios,r.workflow.workflow_url);case 5:return c=n.sent,n.next=8,t.$axios.$get(c);case 8:l=n.sent,content="string"==typeof l?l:JSON.stringify(l,null,2),n.next=38;break;case 12:d=r.workflow.workflow_url.split("/").slice(-1)[0],w=m(r.workflow.workflow_attachment),n.prev=14,w.s();case 16:if((v=w.n()).done){n.next=30;break}if(h=v.value,I=h.file_name.split("/").slice(-1)[0],d!==I){n.next=28;break}return n.next=22,Object(k.b)(t.$axios,h.file_url);case 22:return y=n.sent,n.next=25,t.$axios.$get(y);case 25:return x=n.sent,content="string"==typeof x?x:JSON.stringify(x,null,2),n.abrupt("break",30);case 28:n.next=16;break;case 30:n.next=35;break;case 32:n.prev=32,n.t0=n.catch(14),w.e(n.t0);case 35:return n.prev=35,w.f(),n.finish(35);case 38:o("setProp",{key:"type",value:r.workflow.workflow_type,workflowId:r.workflowId}),o("setProp",{key:"version",value:r.workflow.workflow_type_version,workflowId:r.workflowId}),o("setProp",{key:"url",value:r.workflow.workflow_url,workflowId:r.workflowId}),o("setProp",{key:"content",value:content,workflowId:r.workflowId}),o("setProp",{key:"updatedDate",value:f()(),workflowId:r.workflowId}),o("setProp",{key:"preRegisteredWorkflowAttachment",value:r.workflow.workflow_attachment,workflowId:r.workflowId});case 44:case"end":return n.stop()}}),n,null,[[14,32,35,38]])})))()},deleteWorkflows:function(e,r){var t,n=e.commit,o=e.dispatch,c=e.getters,f=e.rootGetters,l=r.workflowIds.map((function(e){return c.workflow(e)})).filter((function(e){return e&&(!!r.force||!e.preRegistered)})),d=l.flatMap((function(e){return e.runIds})),w=m(l);try{for(w.s();!(t=w.n()).done;){var v=t.value;o("services/removeWorkflowId",{serviceId:v.serviceId,workflowId:v.id},{root:!0}),n("deleteWorkflow",v.id)}}catch(e){w.e(e)}finally{w.f()}var k,h=m(d);try{for(h.s();!(k=h.n()).done;){var I=k.value,y=f["runs/run"](I);y&&(o("services/removeRunId",{serviceId:y.serviceId,runId:I},{root:!0}),n("runs/deleteRun",I,{root:!0}))}}catch(e){h.e(e)}finally{h.f()}},addRunId:function(e,r){var t=e.commit,o=e.getters.workflow(r.workflowId);o&&t("setProp",{key:"runIds",value:Array.from(new Set([].concat(Object(n.a)(o.runIds),[r.runId]))),workflowId:r.workflowId})},removeRunId:function(e,r){var t=e.commit,n=e.getters.workflow(r.workflowId);n&&t("setProp",{key:"runIds",value:n.runIds.filter((function(e){return e!==r.runId})),workflowId:r.workflowId})}}},62:function(e,r,t){"use strict";t.d(r,"d",(function(){return o})),t.d(r,"a",(function(){return c})),t.d(r,"e",(function(){return f})),t.d(r,"b",(function(){return l})),t.d(r,"f",(function(){return d})),t.d(r,"c",(function(){return w}));var n=t(5),o=(t(23),t(60),function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.$get("".concat(t,"/service-info"));case 2:return n=e.sent,e.abrupt("return",n);case 4:case"end":return e.stop()}}),e)})));return function(r,t){return e.apply(this,arguments)}}()),c=function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(r,t){var n;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.$get("".concat(t,"/runs"));case 2:return n=e.sent,e.abrupt("return",n);case 4:case"end":return e.stop()}}),e)})));return function(r,t){return e.apply(this,arguments)}}(),f=function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(r,t,data){var n,o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n={"content-type":"multipart/form-data"},e.next=3,r.$post("".concat(t,"/runs"),data,{headers:n});case 3:return o=e.sent,e.abrupt("return",o);case 5:case"end":return e.stop()}}),e)})));return function(r,t,n){return e.apply(this,arguments)}}(),l=function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(r,t,n){var o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.$get("".concat(t,"/runs/").concat(n));case 2:return o=e.sent,e.abrupt("return",o);case 4:case"end":return e.stop()}}),e)})));return function(r,t,n){return e.apply(this,arguments)}}(),d=function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(r,t,n){var o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.$post("".concat(t,"/runs/").concat(n,"/cancel"));case 2:return o=e.sent,e.abrupt("return",o);case 4:case"end":return e.stop()}}),e)})));return function(r,t,n){return e.apply(this,arguments)}}(),w=function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(r,t,n){var o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.$get("".concat(t,"/runs/").concat(n,"/status"));case 2:return o=e.sent,e.abrupt("return",o);case 4:case"end":return e.stop()}}),e)})));return function(r,t,n){return e.apply(this,arguments)}}()},72:function(e,r,t){"use strict";t.d(r,"e",(function(){return f})),t.d(r,"f",(function(){return l})),t.d(r,"b",(function(){return d})),t.d(r,"c",(function(){return w})),t.d(r,"d",(function(){return v})),t.d(r,"a",(function(){return k})),t.d(r,"g",(function(){return m}));var n=t(5),o=(t(60),t(189),t(15),t(35),t(38),t(69),t(33),t(57),t(30),t(23),t(79),t(146)),c=t.n(o),f=function(content){try{return JSON.parse(content)}catch(e){try{return c.a.load(content)}catch(e){}}return!1},l=function(e){var r;try{r=new URL(e)}catch(e){return!1}return"http:"===r.protocol||"https:"===r.protocol},d=function(){var e=Object(n.a)(regeneratorRuntime.mark((function e(r,t){var n,o,c,f;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("github.com"!==(n=new URL(t)).host){e.next=10;break}return o=n.pathname.split("/").slice(1,3).join("/"),c=n.pathname.split("/").slice(5).join("/"),n.host="api.github.com",n.pathname="repos/".concat(o,"/contents/").concat(c),f=n.toString(),e.next=9,r.$get(f).then((function(e){return e.download_url}));case 9:return e.abrupt("return",e.sent);case 10:return e.abrupt("return",t);case 11:case"end":return e.stop()}}),e)})));return function(r,t){return e.apply(this,arguments)}}(),w=function(content){try{return JSON.parse(content),!0}catch(e){}return!1},v=function(content){try{return c.a.load(content),!0}catch(e){}return!1},k=function(content){return w(content)?"application/json":v(content)?"text/yaml":"default"},m=function(content){return v(content)?JSON.stringify(c.a.load(content),null,2):content}},85:function(e,r,t){"use strict";var n=t(190),o=t(192),c=t(0),f={components:{AppBar:n.a,Breadcrumbs:o.a},props:{error:{}},methods:{backToHome:function(){this.$router.push("/"),location.reload()}}},l=c.a.extend(f),d=t(64),w=t(93),v=t.n(w),k=t(422),m=t(415),h=t(423),I=t(427),y=t(424),component=Object(d.a)(l,(function(){var e=this,r=e.$createElement,t=e._self._c||r;return t("v-app",[t("app-bar"),e._v(" "),t("v-main",{staticClass:"background"},[t("v-container",{attrs:{fluid:""}},[t("breadcrumbs"),e._v(" "),t("v-card",{staticClass:"mx-auto",attrs:{elevation:"8","max-width":"1200"}},[t("div",{staticClass:"d-flex flex-column px-6 pt-4"},[t("div",{staticClass:"card-header",style:{color:e.$vuetify.theme.themes.light.error},domProps:{textContent:e._s("Error occurred!!")}}),e._v(" "),t("div",{staticClass:"mx-6",domProps:{textContent:e._s("An unexpected error has occurred.")}}),e._v(" "),t("div",{staticClass:"mx-6 mt-2 mb-4 elevation-2",style:{whiteSpace:"pre-wrap",wordWrap:"break-word",outline:"solid 1px "+e.$colors.grey.lighten1},domProps:{textContent:e._s(""+JSON.stringify(e.error,null,2))}})]),e._v(" "),t("div",{staticClass:"d-flex justify-end pb-4"},[t("v-btn",{staticClass:"mr-12",attrs:{outlined:"",color:e.$colors.grey.darken2},domProps:{textContent:e._s("Back to Home")},on:{click:function(r){return r.stopPropagation(),e.backToHome(r)}}})],1)])],1)],1)],1)}),[],!1,null,null,null);r.a=component.exports;v()(component,{VApp:k.a,VBtn:m.a,VCard:h.a,VContainer:I.a,VMain:y.a})}},[[291,10,4,11]]]);