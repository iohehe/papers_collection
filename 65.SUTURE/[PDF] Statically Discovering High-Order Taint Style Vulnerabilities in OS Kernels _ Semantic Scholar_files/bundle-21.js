(window.webpackJsonp=window.webpackJsonp||[]).push([[21],{898:function(e,t,a){"use strict";a.r(t);var r,n,o,s=a(619),i=a(617),c=a(618),l=a(620),u=a(736),p=a(730),h=a(719),d=a(728),m=a(737),b=a(654),O=a(378),g=a(8),E=a.n(g),S=a(9),y=a.n(S);class f extends S.PureComponent{render(){return y.a.createElement("div",{className:"author-page-header flex-row"},y.a.createElement(O.a,{className:"icon",icon:"author",width:"24",height:"24"}),y.a.createElement("div",{className:"author-page-header-meta"},y.a.createElement("h1",{className:"author-page-title"},this.props.authorName),y.a.createElement("span",{className:"author-entity-label"},"Author")))}}r=f,n="propTypes",o={authorName:E.a.string.isRequired},n in r?Object.defineProperty(r,n,{value:o,enumerable:!0,configurable:!0,writable:!0}):r[n]=o;var j=a(516),_=a(517),v=a(614),T=a(37),C=a(391),D=a(19),N=a(377),w=a.n(N);class R extends S.PureComponent{getStatValue(e){const{authorDetail:{author:{statistics:{totalInfluentialCitationCount:t}}}}=this.props;switch(e){case v.a.CitationStatTypes.INFLUENTIAL:return D.f(t||0)}}renderStatExplanation(e){const t=C.c(e),a=t?S.createElement("p",{dangerouslySetInnerHTML:{__html:t}}):null;return S.createElement("div",{className:"author-stat-content"},S.createElement("p",{dangerouslySetInnerHTML:{__html:C.b(e)}}),a)}renderStat(e){const{authorDetail:{author:{statistics:{totalInfluentialCitationCount:t}}}}=this.props;if(e===v.a.CitationStatTypes.INFLUENTIAL&&(t||0)<1)return null;const a=this.getStatValue(e),r=w()("author-stat-number",{"is-key":e===v.a.CitationStatTypes.INFLUENTIAL}),n=S.createElement("div",{className:"flex-row author-stats-label-inner"},C.a(e),S.createElement("span",{className:r},a));return S.createElement(_.a,{className:"author-stat",collapsibleContent:this.renderStatExplanation(e),label:n,showToggleIcon:!0})}renderStats(){return S.createElement("div",{className:"author-page-statistics"},S.createElement(j.a,{className:"author-page-statistics-list"},this.renderStat(v.a.CitationStatTypes.INFLUENTIAL)))}renderEmptyMessage(){return S.createElement("div",{className:"inline-message"},Object(T.c)(e=>e.author.emptyStats.message))}render(){const{authorDetail:{author:{statistics:e}}}=this.props;return e.hasDisplayableStats()?this.renderStats():this.renderEmptyMessage()}}var P=a(142);class x extends S.Component{render(){const{authorStore:e}=this.context,t=e.authorDetail;return t?S.createElement("div",{className:"author-page-content",role:"main",id:"main-content"},S.createElement(f,{authorName:t.author.name}),S.createElement(R,{authorDetail:t})):null}}!function(e,t,a){t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a}(x,"contextTypes",{authorStore:E.a.instanceOf(P.a).isRequired});class A extends S.Component{render(){return S.createElement(x,null)}}var I=a(738),L=a(386),k=a(382);class q extends S.Component{render(){return S.createElement(k.a,null,S.createElement("p",{style:{padding:"30px"}},S.createElement(L.a,{content:e=>e.authorOnboarding.mobileNotice.bodyText})))}}class F extends S.Component{render(){return S.createElement(q,null)}}!function(e,t,a){t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a}(F,"getPageTitle",()=>Object(T.c)(e=>e.authorOnboarding.mobileNotice.pageTitle));var M=a(606),U=a(411),Q=a(421),B=a(387),H=a(424),Y=a(413),G=a(533),V=a(140),X=a(51),W=a(100),z=(a(42),a(0)),J=a.n(z),K=a(190),Z=a.n(K);function $(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}class ee extends S.PureComponent{constructor(){super(...arguments),$(this,"getModalDOMElement",()=>{const e=Z.a.findDOMNode(this.refs.modal);return e instanceof Element?e:null}),$(this,"shouldBeVisible",e=>!e.isVisible&&this.props.isVisible),$(this,"shouldBeHidden",e=>e.isVisible&&!this.props.isVisible),$(this,"handleChangeSort",e=>{const{onChangeSort:t,onCloseModal:a}=this.props;t&&(t(e),window.setTimeout((function(){a()}),250))})}componentDidUpdate(e){const t=this.getModalDOMElement();t&&(this.shouldBeVisible(e)?X.a.requestAnimationFrame(()=>{t.classList.add("will-be-visible"),X.a.requestAnimationFrame(()=>t.classList.add("is-visible"))}):this.shouldBeHidden(e)&&(X.a.once(t,"transitionend",()=>{X.a.requestAnimationFrame(()=>t.classList.remove("will-be-visible"))}),t.classList.remove("is-visible")))}render(){const{activeSort:e,sorts:t}=this.props,a=t.map((t,a)=>{const r=e===t.id||""===e&&0===a,n=w()("flex-row-vcenter",{selected:r});return S.createElement("li",{key:t.id},S.createElement("span",{className:n,"data-test-id":t.id,onClick:()=>this.handleChangeSort(t.id)},S.createElement(O.a,{icon:"check",width:"16",height:"16"}),W.a.getString("sort.".concat(t.id,".label"))))},this);return S.createElement("section",{className:"mobile-modal",ref:"modal"},S.createElement("header",{className:"flex-row-vcenter"},S.createElement("h4",null,"Sort publications by"),S.createElement("span",{className:"flex-right",onClick:this.props.onCloseModal},S.createElement(O.a,{icon:"x",width:"24",height:"24"}))),S.createElement("ul",{className:"tappable-list sort-list bordered-list"},a))}}var te=a(463),ae=a(112),re=a(379),ne=a(97),oe=a(18),se=a(27);function ie(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}class ce extends S.PureComponent{constructor(){super(...arguments),ie(this,"_hasOverDrag",!1),ie(this,"onTouchStart",()=>{this.setupDrag()}),ie(this,"onTouchMove",e=>{e.preventDefault();const[t]=e.touches,{clientX:a,clientY:r}=t;if(null===this.state.dragStartX)return void this.setState({dragStartX:a,dragStartY:r,dragDeltaX:0});const{dragStartX:n}=this.state;if(!Object(D.i)(n)){let e;a<n?(e=a-n,e<-56?(e=-56-Math.sqrt(n-a-56),this._hasOverDrag||(this._hasOverDrag=!0,le(65))):this._hasOverDrag=!1):n<a&&(e=Math.sqrt(a-n),this._hasOverDrag||(this._hasOverDrag=!0,le(65))),this.setState({dragDeltaX:e})}}),ie(this,"onTouchCancel",()=>{this.cleanupAfterDrag()}),ie(this,"onTouchEnd",e=>{const{dragStartX:t,dragStartY:a,dragDeltaX:r}=this.state;if(e.touches.length>0||Object(D.i)(t)||Object(D.i)(a))return;this.cleanupAfterDrag();const[n]=e.changedTouches;if(!n)return;const{clientX:o,clientY:s}=n;Math.abs(t-o)>2*Math.abs(a-s)&&Object(se.b)(e=>{e.track("".concat("swipe.swipeLink",".swipe"))}),!Object(D.i)(r)&&r<-56&&(window.location.href=Object(oe.e)({routeName:"SWIPE",query:this.getLinkQuery()}))}),this.state={dragStartX:null,dragStartY:null,dragDeltaX:null}}componentDidMount(){Object(se.b)(e=>{e.track("".concat("swipe.swipeLink",".impression"))})}getLinkQuery(){const{paperIdList:e,returnLabel:t}=this.props,{history:a}=this.context;return{paper_ids:e.join(","),return_label:t,return_url:a.getRelativeHref()}}setupDrag(){const e=document.documentElement;Object(D.i)(e)||(e.addEventListener("touchmove",this.onTouchMove,{passive:!1}),e.addEventListener("touchend",this.onTouchEnd,!1),e.addEventListener("touchcancel",this.onTouchCancel,!1),this._hasOverDrag=!1)}cleanupAfterDrag(){const e=document.documentElement;Object(D.i)(e)||(e.removeEventListener("touchmove",this.onTouchMove),e.removeEventListener("touchend",this.onTouchEnd),e.removeEventListener("touchcancel",this.onTouchCancel),this.setState({dragStartX:null,dragStartY:null,dragDeltaX:null}),this._hasOverDrag=!1)}render(){const{paperIdList:e}=this.props,{dragDeltaX:t}=this.state;return 0===(Array.isArray(e)?e.length:e.size)?null:S.createElement("div",{className:"swipe-link"},S.createElement("div",{className:"swipe-link__backing"},S.createElement("div",{className:"swipe-link__backing__icon"},S.createElement(O.a,{icon:"arrow-lite",height:"8",width:"12"}))),S.createElement(re.a,{to:"SWIPE",query:this.getLinkQuery(),className:w()("swipe-link__button",{"swipe-link__button--is-dragging":!Object(D.i)(t)}),"data-heap-id":"swipe_link",onTouchStart:this.onTouchStart,style:Object(D.i)(t)?void 0:{transform:"translateX(".concat(t.toFixed(1),"px)")}},S.createElement("div",{className:"swipe-link__headline"},S.createElement("div",{className:"swipe-link__desc"},Object(T.c)(e=>e.swipe.link.description)),S.createElement("div",{className:"swipe-link__cta"},S.createElement("span",{className:"swipe-link__cta__text"},Object(T.c)(e=>e.swipe.link.cta)),S.createElement(O.a,{icon:"arrow-lite"}))),S.createElement("div",{className:"swipe-link__animation"},S.createElement("div",{className:"swipe-link__boxes"},S.createElement("div",{className:"swipe-link__box"}),S.createElement("div",{className:"swipe-link__box"}),S.createElement("div",{className:"swipe-link__box"}),S.createElement("div",{className:"swipe-link__box"}),S.createElement("div",{className:"swipe-link__box"}),S.createElement("div",{className:"swipe-link__box"})),S.createElement("div",{className:"swipe-link__hand"},S.createElement(O.a,{icon:"fa-hand"})))))}}function le(e){navigator.vibrate&&navigator.vibrate(e)}ie(ce,"contextTypes",{envInfo:E.a.instanceOf(ae.a).isRequired,history:E.a.instanceOf(ne.a).isRequired});var ue=a(464),pe=a(431),he=a(29),de=a(74),me=a(82),be=a(138),Oe=(a(98),a(116)),ge=a(73),Ee=a(120),Se=a(12),ye=a(17),fe=a(492),je=a(31),_e=a(390);function ve(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function Te(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}const Ce=new fe.a({showSortExplanation:!0,filtersExpandedByDefault:!0,showResultCount:!1,sortDisplayType:"tabs",scrollToTopOfPage:!1,searchResultLayout:{showSortStat:!0},sorts:je.a.authorPaperSearch()});class De extends S.PureComponent{constructor(e,t){super(e,t),Te(this,"loadPage",e=>{this.context.authorQueryStore.routeToPage(e,this.context.router),window.scrollTo(0,0)}),Te(this,"onShowSortModal",()=>{this.context.dispatcher.dispatch(Object(de.b)({id:he.b.SORT}))}),Te(this,"onChangeSort",e=>{this.context.authorQueryStore.routeToSort(e,this.context.router)}),Te(this,"onChangeYearFilter",(e,t)=>{const{authorQueryStore:a,router:r}=this.context;a.routeToYearRange(e,t,r)}),Te(this,"onCloseModal",()=>{this.context.dispatcher.dispatch(Object(de.a)())}),Te(this,"trackTitleClick",e=>{let{paper:t,eventData:a,compData:r}=e;const{analyticsLocation:n,authorQueryStore:o}=this.context;Object(B.g)({paper:t,analyticsLocation:n,eventData:a,compData:r});const s=Object(me.a)(o,{paperSha:t.id,paperIndex:a.index});Object(me.g)(s)}),this.state=function(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?ve(Object(a),!0).forEach((function(t){Te(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):ve(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}({visibleModalId:void 0},this.getStateFromAuthorStore(),{},this.getStateFromQueryStore());const{authorStore:a}=this.context;a.registerComponent(this,()=>{this.setState({author:a.authorDetail})}),this.context.authorQueryStore.registerComponent(this,()=>{this.setState(this.getStateFromQueryStore())}),this.context.modalStore.registerComponent(this,e=>{this.setState({visibleModalId:e||void 0})})}getStateFromAuthorStore(){const{authorStore:e}=this.context;return{author:e.authorDetail}}getStateFromQueryStore(){const{authorQueryStore:e}=this.context;return{queryStoreState:e._state,query:e._query,response:e._response,publicationSort:e.getQuery().sort}}renderStats(e){if(!(e.citationStats.numCitations>0||e.citationStats.hasKeyCitations()))return null;const{publicationSort:t}=this.state,a=t===je.a.INFLUENTIAL_CITATIONS.id,r=t===je.a.CITATION_ACCELERATION.id,n=t===je.a.CITATION_VELOCITY.id;return S.createElement(Y.default,{paper:e,hic:a,acceleration:r,velocity:n})}renderAuthorPapers(){const{author:e,query:t}=this.state;return this.state.response.results.map((a,r)=>{var n;return S.createElement(B.c,{key:a.id,paper:a,eventData:{authorId:null!=(n=e)&&null!=(n=n.author)?n.id:n,index:(t.page-1)*t.pageSize+r},onClickTitle:this.trackTitleClick},S.createElement(H.default,{paper:a,controls:this.renderStats(a),className:"author-papers__paper-card",footer:S.createElement(Q.a,{paper:a}),abstract:S.createElement(ue.a,{paper:a,query:t.queryString,className:"tldr__paper-card"})}))})}render(){const{query:e,author:t,response:a}=this.state,r=w()("author-papers",{"is-filtering":this.state.queryStoreState===Se.a.FILTERING});return S.createElement("div",{className:r,role:"main",id:"main-content"},S.createElement(G.a,{className:"author-page-content__filters dropdown-filters-breakpoints__ahp",config:pe.a,onChangeYearFilter:this.onChangeYearFilter,query:this.state.query,response:this.state.response,sortControl:S.createElement(te.a,{className:"dropdown-filters__sort-control",onChangeSort:this.onChangeSort,options:Ce.sorts,displayType:Ce.sortDisplayType,sort:e.sort}),injectQueryStore:this.context.authorQueryStore,doFullQueryReset:!0}),S.createElement(V.c,{feature:e=>e.Swipe},S.createElement(V.b,null,()=>{var e;return S.createElement(ce,{paperIdList:a.results.map(e=>e.id),returnLabel:"Back To ".concat((null!=(e=t)&&null!=(e=e.author)?e.name:e)||"Author")})})),this.renderAuthorPapers(),S.createElement(U.default,{onPaginate:this.loadPage,pageNumber:this.state.query.page,totalPages:this.state.response.totalPages,maxVisiblePageButtons:4,size:U.SIZE.LARGE}),S.createElement(ee,{isVisible:this.state.visibleModalId===he.b.SORT,onChangeSort:this.onChangeSort,onCloseModal:this.onCloseModal,activeSort:this.state.query.sort,sorts:je.a.authorPaperSearch()}))}}Te(De,"contextTypes",{analyticsLocation:E.a.object,authorStore:E.a.instanceOf(P.a).isRequired,modalStore:E.a.instanceOf(Ee.a).isRequired,authorQueryStore:E.a.instanceOf(Oe.a).isRequired,router:E.a.object.isRequired,api:E.a.instanceOf(be.a).isRequired,dispatcher:E.a.instanceOf(ye.a).isRequired});var Ne=Object(_e.b)(ge.a.AuthorHomePage.Publications)(De),we=a(660),Re=a(724),Pe=a(542),xe=a(7);const Ae={componentDidUpdate(e,t){const a=this.getModalDOMElement();a?this.shouldBeVisible(e,t)?X.a.requestAnimationFrame(()=>{a.classList.add("will-be-visible"),X.a.requestAnimationFrame(()=>a.classList.add("is-visible"))}):this.shouldBeHidden(e,t)&&(X.a.once(a,"transitionend",()=>{X.a.requestAnimationFrame(()=>a.classList.remove("will-be-visible"))}),a.classList.remove("is-visible")):xe.a.warn('Unable to find ref "modal", no animation will be triggered.')}},Ie={getModalDOMElement(){return Z.a.findDOMNode(this.refs.modal)},shouldBeVisible(e){return!e.isVisible&&this.props.isVisible},shouldBeHidden(e){return e.isVisible&&!this.props.isVisible}};var Le=a(21),ke=a.n(Le);function qe(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}class Fe extends S.PureComponent{constructor(){super(...arguments),qe(this,"onCloseModal",()=>{this.context.dispatcher.dispatch(Object(de.a)())}),ke()(this,Ie),ke()(this,Ae)}renderTitle(){return this.context.modalStore._visibleModalData?this.context.modalStore._visibleModalData.author.name:null}renderDetails(){return this.context.modalStore._visibleModalData?y.a.createElement(Pe.a,{author:this.context.modalStore._visibleModalData,type:this.context.modalStore._key}):null}render(){return y.a.createElement("div",{className:"mobile-modal",ref:"modal"},y.a.createElement("header",{className:"flex-row-vcenter"},this.renderTitle(),y.a.createElement("span",{className:"flex-right",onClick:this.onCloseModal},y.a.createElement(O.a,{icon:"x",width:"24",height:"24"}))),this.renderDetails())}}qe(Fe,"propTypes",{isVisible:E.a.bool.isRequired}),qe(Fe,"contextTypes",{dispatcher:E.a.instanceOf(ye.a).isRequired,modalStore:E.a.instanceOf(Ee.a).isRequired});var Me=a(383);function Ue(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function Qe(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}class Be extends S.Component{constructor(){super(...arguments),Qe(this,"onClickShowPublications",()=>{this.setState({showPublications:!0,showInfluenceGraph:!1})}),Qe(this,"onClickShowInfluenceGraph",()=>{this.setState({showPublications:!1,showInfluenceGraph:!0})});const{authorStore:e,modalStore:t,authorQueryStore:a}=this.context;this.state=function(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?Ue(Object(a),!0).forEach((function(t){Qe(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):Ue(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}({},this.getStateFromAuthorStore(),{showPublications:!0,showInfluenceGraph:!1,visibleModalId:null}),e.registerComponent(this,()=>{this.setState(this.getStateFromAuthorStore())}),a.registerComponent(this,()=>{this.setState(this.getStateFromQueryStore())}),t.registerComponent(this,e=>{this.setState({visibleModalId:e||null})})}getStateFromQueryStore(){const{authorStore:e,authorQueryStore:t}=this.context;return{loading:e.isLoading()||t.isLoading()}}getStateFromAuthorStore(){const{authorStore:e,authorQueryStore:t}=this.context;return{loading:e.isLoading()||t.isLoading(),authorDetail:e.authorDetail}}renderLoading(){return S.createElement("div",{className:"content flex-row-vcenter",role:"main",id:"main-content"},S.createElement(Me.a,{className:"flex-centered",width:"32",height:"32",testId:"icon-loading-ahp"}))}renderContent(){const{showPublications:e,showInfluenceGraph:t,authorDetail:a}=this.state;return S.createElement("div",{className:"content author-page__content"},S.createElement(M.a,{showAHPExplanation:!0}),S.createElement("ul",{className:"author-page-content-tabs__list"},S.createElement("li",{key:"publications",onClick:this.onClickShowPublications,className:w()({"is-active":e})},S.createElement(O.a,{icon:"tab-papers",width:"9",height:"12"}),Object(T.c)(e=>e.author.tabs.papers)),S.createElement("li",{key:"influence",onClick:this.onClickShowInfluenceGraph,className:w()({"is-active":t})},S.createElement(O.a,{icon:"tab-influence",width:"21",height:"21"}),S.createElement("span",{className:"author-page-content-tab__influence-label"},Object(T.c)(e=>e.author.tabs.influence)))),S.createElement("div",{className:"author-page-content-tabs__content"},e&&S.createElement(Ne,null),t&&S.createElement(S.Fragment,null,S.createElement(Re.a,{authorDetail:a}),S.createElement(Fe,{isVisible:this.state.visibleModalId===he.b.INFLUENTIAL_PAPERS}))),!!a&&S.createElement("div",{className:"author-page__author-recomendations-container"},S.createElement(we.a,{recommendations:a.recommendedAuthors,maxResults:4})))}render(){const{loading:e}=this.state;return S.createElement(k.a,{footer:!e,className:"author-page"},e?this.renderLoading():this.renderContent())}}Qe(Be,"contextTypes",{authorStore:E.a.instanceOf(P.a).isRequired,modalStore:E.a.instanceOf(Ee.a).isRequired,authorQueryStore:E.a.instanceOf(Oe.a).isRequired});var He=a(1),Ye=a(38);class Ge extends S.Component{static getPageTitle(e){var t;let{authorStore:a}=e;const{authorDetail:r}=a,n=null!=(t=r)&&null!=(t=t.author)?t.name:t;return n?Object(T.c)(e=>e.author.pageTitleWithAuthor,n):Object(T.c)(e=>e.author.pageTitleWithoutAuthor)}static getPageMetaDescription(e){let{authorStore:t}=e;const{authorDetail:a}=t;if(a)return a.authorPageMetaDescription()}static getCanonicalUrl(e){if(e.params.slug){const{authorId:t,slug:a}=e.params;return Object(oe.e)({routeName:"AUTHOR_PROFILE",params:{authorId:t,slug:a}})}}static willRouteTo(e,t){const{authorId:a,slug:r}=t.params,n=t.path;return n===oe.b.AUTHOR_PAPERS||n===oe.b.AUTHOR_INFLUENCE?new Ye.a({routeName:"AUTHOR_DETAILS",replace:!0,params:t.params,query:t.query}):(e.authorStore.isNewOrCanonicalAuthor(a,r)&&e.dispatcher.dispatch({actionType:He.a.actions.AUTHOR_QUERY_UPDATED,query:{}}),Oe.a.executeAHPQuery(e,t))}render(){return S.createElement(Be,this.props)}}var Ve=a(664),Xe=a(665),We=a(666),ze=a(667),Je=a(668);function Ke(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}class Ze extends S.Component{constructor(){super(...arguments),Ke(this,"showFeedbackModal",()=>{const{dispatcher:e}=this.context;e.dispatch(Object(de.b)({id:he.b.FEEDBACK}))})}render(){return S.createElement(k.a,null,S.createElement("section",{className:"content padded",role:"main",id:"main-content"},S.createElement(Je.a,{onClickContactUs:this.showFeedbackModal})))}}function $e(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}Ke(Ze,"contextTypes",{dispatcher:E.a.instanceOf(ye.a).isRequired});class et extends S.Component{render(){return S.createElement(Ze,null)}}$e(et,"getPageMetaDescription",()=>Object(T.c)(e=>e.metaDescription.crawlerPage.content)),$e(et,"getPageTitle",()=>[Object(T.c)(e=>e.metaDescription.crawlerPage.title),Object(T.c)(e=>e.general.appName)].join(" | "));var tt=a(669),at=a(670),rt=a(671),nt=a(672),ot=a(381);function st(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}class it extends S.Component{render(){return S.createElement(ot.a,{footer:!1,load:{importer:()=>a.e(20).then(a.bind(null,880)),chunkName:"mobile-FAQPage",moduleId:880}})}}st(it,"getPageMetaDescription",()=>Object(T.c)(e=>e.metaDescription.faqPage.content)),st(it,"getPageTitle",()=>[Object(T.c)(e=>e.faq.mobileTitle),Object(T.c)(e=>e.general.appName)].join(" | "));var ct=a(673),lt=a(581),ut=a(674),pt=a(675),ht=a(582),dt=a(583),mt=a(676),bt=a(584),Ot=a(677),gt=a(678),Et=a(739),St=a(679),yt=a(681),ft=a(726),jt=a(682),_t=a(720),vt=a(683),Tt=a(409),Ct=a(684),Dt=a(748),Nt=a(576),wt=a(685),Rt=a(115);function Pt(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function xt(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?Pt(Object(a),!0).forEach((function(t){At(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):Pt(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function At(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}class It extends S.PureComponent{constructor(){super(...arguments),At(this,"trackAuthorClick",e=>{let{paper:t,eventData:a,compData:r}=e;const{analyticsLocation:n,queryStore:o}=this.context;Object(B.d)({paper:t,analyticsLocation:n,eventData:a,compData:r});const{authorId:s}=r,i=Object(me.a)(o,{paperSha:t.id,paperIndex:a.index});Object(me.c)(xt({},i,{authorId:parseInt(s)}))}),At(this,"trackCiteClick",e=>{let{paper:t,eventData:a,compData:r}=e;const{analyticsLocation:n,queryStore:o}=this.context;Object(B.e)({paper:t,analyticsLocation:n,eventData:a,compData:r});const s=Object(me.a)(o,{paperSha:t.id,paperIndex:a.index});Object(me.d)(s)}),At(this,"trackLibraryClick",e=>{let{paper:t,eventData:a,compData:r}=e;const{analyticsLocation:n,queryStore:o}=this.context;Object(B.f)({paper:t,analyticsLocation:n,compData:r,eventData:a});const s=Object(me.a)(o,{paperSha:t.id,paperIndex:a.index});Object(me.e)(s)}),At(this,"trackPaperClick",e=>{let{paper:t,eventData:a,compData:r}=e;const{analyticsLocation:n,queryStore:o}=this.context;Object(B.h)({paper:t,analyticsLocation:n,compData:r,eventData:a});const{linkType:s,linkUrl:i}=r,c=Object(me.a)(o,{paperSha:t.id,paperIndex:a.index});Object(me.f)(xt({},c,{linkType:s,linkUrl:i}))}),At(this,"trackTitleClick",e=>{let{paper:t,eventData:a,compData:r}=e;const{analyticsLocation:n,queryStore:o}=this.context;Object(B.g)({paper:t,analyticsLocation:n,eventData:a,compData:r});const s=Object(me.a)(o,{paperSha:t.id,paperIndex:a.index});Object(me.g)(s)})}componentDidUpdate(e){if(!J.a.is(e.searchResults,this.props.searchResults)&&!this.props.searchResults.results.isEmpty()){const e=X.a.scrollTop(),t=this.refs["search-result-".concat(this.props.searchResults.results.size-1)];if(t){const a=X.a.offsetFromBody(t);a<e&&X.a.scrollTop(a-20)}}}render(){const{searchResults:e,queryState:t,showInfluentialCount:a}=this.props,{results:r,query:n,modifiedQueryString:o,querySuggestions:s}=e;if(r.isEmpty()){const t=s.isEmpty()?void 0:s.first().text;return S.createElement(Nt.a,{isMobile:!0,query:n.queryString,hasFacets:e.hasFacets(),suggestedQuery:t})}{const e=w()("results-list",{"results-are-updating":"filtering"===t});return S.createElement("div",{className:e},o?S.createElement(wt.a,{originalQuery:n.queryString,modifiedQuery:o}):null,S.createElement(V.c,{feature:e=>e.Swipe},S.createElement(V.b,null,()=>S.createElement(ce,{paperIdList:r.map(e=>e.id),returnLabel:"Back to Search"}))),r.map((e,t)=>S.createElement(B.c,{key:e.id,paper:e,eventData:{index:(n.page-1)*n.pageSize+t},onClickAuthor:this.trackAuthorClick,onClickCite:this.trackCiteClick,onClickLibrary:this.trackLibraryClick,onClickViewPaper:this.trackPaperClick,onClickTitle:this.trackTitleClick},S.createElement(H.default,{paper:e,className:"search-papers__paper-card",controls:S.createElement(Y.default,{paper:e,hic:a}),footer:S.createElement(Q.a,{paper:e}),abstract:S.createElement(ue.a,{paper:e,query:n.queryString,className:"tldr__paper-card"})}))))}}}At(It,"contextTypes",{analyticsLocation:E.a.object,queryStore:E.a.instanceOf(Rt.a).isRequired});var Lt=Object(_e.b)(ge.a.Serp)(It);function kt(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function qt(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?kt(Object(a),!0).forEach((function(t){Ft(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):kt(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function Ft(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}const Mt=new fe.a;class Ut extends S.PureComponent{constructor(){super(...arguments),Ft(this,"onChangeSort",e=>{const{queryStore:t,router:a}=this.context;this.setState({showInfluentialCount:e===je.a.INFLUENTIAL_CITATIONS.id}),t.routeToSort(e,a)}),Ft(this,"onChangeYearFilter",(e,t)=>{const{queryStore:a,router:r}=this.context;a.routeToYearRange(e,t,r)}),Ft(this,"loadPage",e=>{this.context.queryStore.routeToPage(e.toString(),this.context.router)});const{queryStore:e}=this.context;this.state=qt({},this.stateFromQueryStore()),e.registerComponent(this,()=>{this.setState(qt({},this.stateFromQueryStore()))})}stateFromQueryStore(){const{queryStore:e}=this.context;return{query:e.getQuery(),queryResponse:e.getQueryResponse(),showInfluentialCount:e.getQuery().sort===je.a.INFLUENTIAL_CITATIONS.id,isLoading:e.isLoading(),queryState:e.getQueryState()}}componentDidUpdate(e,t){t.query.page!==this.state.query.page&&X.a.scrollTop(0)}isFiltering(){return this.state.queryState===Se.a.FILTERING}renderLoading(){return S.createElement(k.a,{className:"search",header:S.createElement(Tt.a,{submitSearchOnFieldOfStudyChange:!0}),footer:!1},S.createElement("div",{className:"content flex-row-vcenter"},S.createElement(Me.a,{className:"flex-centered",width:"32",height:"32",testId:"icon-loading-serp"})))}renderSearchResults(){const{query:e,queryResponse:t,queryState:a,showInfluentialCount:r}=this.state,{matchedEntity:n,matchedAuthors:o,totalPages:s}=t;return S.createElement(k.a,{className:"search",header:S.createElement(Tt.a,{submitSearchOnFieldOfStudyChange:!0})},S.createElement("section",{className:"content",role:"main",id:"main-content"},S.createElement(G.a,{className:"dropdown-filters-breakpoints__serp",config:pe.d,query:e,response:t,showResultCount:!0,onChangeYearFilter:this.onChangeYearFilter,sortControl:S.createElement(te.a,{className:"dropdown-filters__sort-control",onChangeSort:this.onChangeSort,options:Mt.sorts,displayType:Mt.sortDisplayType,sort:e.sort}),injectQueryStore:this.context.queryStore}),n?S.createElement(Dt.a,{entity:n,truncationLimit:90,includeAlertButton:!1,includeRelated:!1}):null,o.isEmpty()?null:S.createElement(Ct.a,{queryString:e.queryString,authors:o}),S.createElement(Lt,{searchResults:t,queryState:a,showInfluentialCount:r}),S.createElement(U.default,{className:"pagination",onPaginate:this.loadPage,pageNumber:e.page,totalPages:s,maxVisiblePageButtons:4,size:U.SIZE.LARGE})))}render(){const{isLoading:e}=this.state;return e?this.renderLoading():this.renderSearchResults()}}Ft(Ut,"contextTypes",{queryStore:E.a.instanceOf(Rt.a).isRequired,router:E.a.object.isRequired});var Qt=a(5),Bt=a(114);class Ht extends S.Component{static getPageTitle(e){let{queryStore:t}=e;const a=Object(T.c)(e=>e.general.appName);return"".concat(t.getQueryString()," | ").concat(a)}static async willRouteTo(e,t){const{api:a,authStore:r}=e,{query:{serverSideSearch:n}}=t;if(!Object(Qt.a)()&&!n)return Rt.a.setQueryAndLoadingState(e,t);const o=await Rt.a.executeSearchQuery(e,t);if(!o.resultData)return o;const{matchedEntity:s}=o.resultData;return r.hasAuthenticatedUser()&&s?[o,a.findAlertByQueryTypeAndValue(Bt.c.ENTITY_PAPER,s.id)]:o}render(){return S.createElement(Ut,null)}}var Yt=a(686),Gt=a(687),Vt=a(688),Xt=a(740),Wt=a(741),zt=a(689);t.default=[Object(zt.a)({component:h.a,routes:[Object(zt.a)({path:oe.b.HOME,exact:!0,component:pt.a}),Object(zt.a)({path:oe.b.ENTITY_LANDING,exact:!0,component:at.a}),Object(zt.a)({path:oe.b.ENTITY_BY_ID,exact:!0,component:rt.a}),Object(zt.a)({path:oe.b.ENTITY,component:nt.a}),Object(zt.a)({path:oe.b.SEARCH,component:Ht}),Object(zt.a)({path:oe.b.PAPER_LANDING,exact:!0,component:yt.a}),Object(zt.a)({path:oe.b.PAPER_DETAIL_BY_ID,exact:!0,component:Et.a}),Object(zt.a)({path:oe.b.PAPER_DETAIL_PDF_REDIRECT,exact:!0,component:Et.a}),Object(zt.a)({path:oe.b.PAPER_DETAIL,component:St.a,routes:[Object(zt.a)({path:oe.b.PAPER_DETAIL_FIGURE,component:gt.a})]}),Object(zt.a)({path:oe.b.AUTHOR_ONBOARDING,component:F}),Object(zt.a)({path:oe.b.AUTHOR_PROFILE_BY_CLAIMED,component:b.a}),Object(zt.a)({path:oe.b.AUTHOR_CLAIM,component:d.a}),Object(zt.a)({path:oe.b.AUTHOR_CLAIM_COMPLETE,component:m.a}),Object(zt.a)({path:oe.b.AUTHOR_LANDING,exact:!0,component:I.a}),Object(zt.a)({path:oe.b.AUTHOR_PROFILE_BY_ID,exact:!0,component:Ge}),Object(zt.a)({path:oe.b.AUTHOR_PROFILE,component:Ge,routes:[Object(zt.a)({path:oe.b.AUTHOR_DETAILS,exact:!0,component:A})]}),Object(zt.a)({path:oe.b.FEEDS,exact:!0,component:ct.a}),Object(zt.a)({path:oe.b.FEEDS_FEED,component:lt.a,routes:[Object(zt.a)({path:oe.b.FEEDS_RECOMMENDATIONS,component:ut.a})]}),Object(zt.a)({path:oe.b.ACCOUNT,component:s.a,routes:[Object(zt.a)({path:oe.b.ACCOUNT_MANAGE,component:c.a}),Object(zt.a)({path:oe.b.ACCOUNT_CONTACT,component:i.a}),Object(zt.a)({path:oe.b.ACCOUNT_ALERTS,component:p.a})]}),Object(zt.a)({path:oe.b.ALERTS,component:u.a}),Object(zt.a)({path:oe.b.ALERTS_UNSUBSCRIBE,component:Xt.a}),Object(zt.a)({path:oe.b.ALERTS_UNSUBSCRIBE_ALL,component:Xt.a}),Object(zt.a)({path:oe.b.LIBRARY_WITH_FOLDERS,component:mt.a,routes:[Object(zt.a)({path:oe.b.LIBRARY_ALL_ENTRIES,component:ht.b}),Object(zt.a)({path:oe.b.LIBRARY_UNSORTED_ENTRIES,component:bt.b}),Object(zt.a)({path:oe.b.LIBRARY_FOLDER,component:dt.b})]}),Object(zt.a)({path:oe.b.USER_VERIFY_EMAIL,component:Wt.a}),Object(zt.a)({path:oe.b.SIGN_IN,component:Yt.a}),Object(zt.a)({path:oe.b.SIGN_OUT,component:Gt.a}),Object(zt.a)({path:oe.b.ADD_ENROLLMENT_REDIRECT,component:l.a}),Object(zt.a)({path:oe.b.REMOVE_ENROLLMENT_REDIRECT,component:jt.a}),Object(zt.a)({path:oe.b.CRAWLER,component:et}),Object(zt.a)({path:oe.b.FAQ,component:it}),Object(zt.a)({path:oe.b.PRODUCT_PAGE,component:vt.a}),Object(zt.a)({path:oe.b.ABOUT_ROOT,component:vt.a}),Object(zt.a)({path:oe.b.ABOUT_PAGE,component:vt.a}),Object(zt.a)({path:oe.b.RESEARCH_ROOT,component:vt.a}),Object(zt.a)({path:oe.b.RESEARCH_PAGE,component:vt.a}),Object(zt.a)({path:oe.b.RESOURCES_ROOT,component:vt.a}),Object(zt.a)({path:oe.b.RESOURCES_PAGE,component:vt.a}),Object(zt.a)({path:oe.b.CORD19_HOME,exact:!0,component:Ve.a}),Object(zt.a)({path:oe.b.CORD19_ABOUT,component:Xe.a}),Object(zt.a)({path:oe.b.CORD19_GET_STARTED,component:ze.a}),Object(zt.a)({path:oe.b.CORD19_DOWNLOAD,component:We.a}),Object(zt.a)({path:oe.b.DEBUG_COMPONENT_LIBRARY_PREVIEW,component:tt.a}),Object(zt.a)({path:oe.b.RESEARCH_HOMEPAGE,exact:!0,component:_t.a}),Object(zt.a)({path:oe.b.RECOMMENDATIONS,exact:!0,component:ft.a}),Object(zt.a)({path:oe.b.SWIPE,component:Vt.a}),Object(zt.a)({path:oe.b.NOT_FOUND,exact:!0,component:Ot.a}),Object(zt.a)({component:Ot.a})]})]}}]);
//# sourceMappingURL=bundle-21.js.map