(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{886:function(e,t,a){"use strict";a.r(t);var n=a(393),o=a(398),i=a(378),r=a(401),s=a(384),l=a(73),c=a(518),p=a(17),d=a(519),m=a(47),h=a(8),u=a.n(h),E=a(9),b=a.n(E);const f="left=100,top=100,width=800,height=500,toolbar=1,resizable=0";class k extends E.PureComponent{trackShareEvent(e){const t=s.a.create(l.a.SHARE,{socialType:e.id});Object(m.a)(t)}mkEmailLink(){const e=encodeURIComponent("".concat(window.location.href,"?utm_source=").concat(d.a.EMAIL.id)),t=encodeURIComponent(this.props.title||""),a=this.props.message?"".concat(encodeURIComponent(this.props.message),": ").concat(e):e;return"mailto:?to=&subject=".concat(t,"&body=").concat(a)}onClickShareLink(e){this.trackShareEvent(e);const t=encodeURIComponent("".concat(window.location.href,"?utm_source=").concat(e.id)),a=encodeURIComponent(this.props.title||"");switch(e){case d.a.FACEBOOK:window.open(Object(c.b)(t),"_blank",f);break;case d.a.TWITTER:window.open(Object(c.c)(t,a),"_blank",f)}}render(){return E.createElement("ul",null,E.createElement("li",{className:"share-option share-option--email"},E.createElement("a",{className:"share-option__link flex-row-vcenter",href:this.mkEmailLink(),target:"_blank",onClick:()=>this.trackShareEvent(d.a.EMAIL)},E.createElement(i.a,{icon:"email",width:"25",height:"25"}),E.createElement("span",{"data-test-id":"share-link-email"},d.a.EMAIL.name))),E.createElement("li",{className:"share-option flex-row-vcenter share-option--twitter",onClick:()=>this.onClickShareLink(d.a.TWITTER)},E.createElement(i.a,{icon:"twitter",width:"25",height:"25"}),E.createElement("span",{"data-test-id":"share-link-twitter"},d.a.TWITTER.name)),E.createElement("li",{className:"share-option flex-row-vcenter share-option--facebook",onClick:()=>this.onClickShareLink(d.a.FACEBOOK)},E.createElement(i.a,{icon:"facebook",width:"25",height:"25"}),E.createElement("span",{"data-test-id":"share-link-facebook"},d.a.FACEBOOK.name)))}}var w,C,g;w=k,C="contextTypes",g={dispatcher:u.a.instanceOf(p.a).isRequired},C in w?Object.defineProperty(w,C,{value:g,enumerable:!0,configurable:!0,writable:!0}):w[C]=g;var v=a(474),_=a(377),N=a.n(_);class x extends E.PureComponent{render(){const e=N()("share-button button",this.props.className);return E.createElement(v.a,{tooltipContent:E.createElement(k,{message:this.props.message,title:this.props.title}),tooltipPosition:this.props.tooltipPosition,className:"share flex-row-vcenter",tooltipClassName:"share-tooltip"},E.createElement(r.a,{className:e,text:"Share",iconProps:{icon:"share",width:"15",height:"15"}}))}}!function(e,t,a){t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a}(x,"defaultProps",{tooltipPosition:"bottom-left"});var O=a(97),P=a(37),I=a(145),S=a(18),T=a(700),R=a.n(T);a.d(t,"default",(function(){return y}));class y extends b.a.Component{constructor(){super(...arguments),this.onClickBackground=this.onClickBackground.bind(this),this.onClickClose=this.onClickClose.bind(this),this.onStartVideo=this.onStartVideo.bind(this)}onClickBackground(e){e.stopPropagation();const{target:t}=e;t instanceof HTMLElement&&t.className.split(" ").find(e=>"pdp-video"===e)&&this.closeModal()}onClickClose(e){e.stopPropagation(),this.closeModal()}onStartVideo(){const e=this.getVideo();if(!e)return;const{uniqueId:t,url:a}=e;Object(m.a)(s.a.create(l.a.PaperDetail.VIDEO_START,{uniqueId:t,url:a}))}closeModal(){const{history:e,paperStore:t}=this.context,{slug:a,id:n}=t.getPaperDetail().paper,o=Object(S.e)({routeName:"PAPER_DETAIL",params:{slug:a,paperId:n}});e.replace(o)}getVideo(){const{paperStore:e}=this.context,{featuredContent:t}=e.getPaperDetail(),{uniqueId:a}=this.props;return a&&t.find(e=>e.uniqueId===a)||null}render(){const e=this.getVideo();if(!e)return null;const{title:t,url:a,summary:r,channel:s,datePosted:l}=e,c=Object(P.c)(e=>e.paperDetail.featured.video.shareTitle,t);return b.a.createElement("div",{className:"pdp-video",onClick:this.onClickBackground},b.a.createElement("a",{className:"close-modal-link flex-row-vcenter",onClick:this.onClickClose},b.a.createElement("span",null,Object(P.c)(e=>e.paperDetail.featured.video.closeButtonLabel)),b.a.createElement(i.a,{icon:"x",className:"flex-right",width:"30",height:"30"})),b.a.createElement("div",{className:"pdp-video__modal"},b.a.createElement(n.a,null,b.a.createElement(o.a,null,b.a.createElement("h4",{className:"pdp-video__title text--lg"},t),b.a.createElement("div",{className:"flex-row flex-center flex-space-between pdp-video__publish-info"},b.a.createElement("ul",null,s&&b.a.createElement("li",{className:"pdp-video__publish-info-item"},s),l&&b.a.createElement("li",{className:"pdp-video__publish-info-item"},l.format("MMM Do, YYYY"))),b.a.createElement(x,{title:c,className:"button--primary flex-right",tooltipPosition:"bottom-right"})))),b.a.createElement("div",{className:"pdp-video__video"},b.a.createElement(R.a,{controls:!0,url:a,height:480,width:800,onStart:this.onStartVideo})),b.a.createElement("div",{className:"pdp-video__summary"},r)))}}!function(e,t,a){t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a}(y,"contextTypes",{history:u.a.instanceOf(O.a).isRequired,paperStore:u.a.instanceOf(I.b).isRequired})}}]);
//# sourceMappingURL=bundle-17.js.map