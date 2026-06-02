import{a as Xe}from"./chunk-3VVD3NY5.js";import{a as $e}from"./chunk-KAPK7IU5.js";import{a as Ye,b as S}from"./chunk-IHVON4EP.js";import{a as I}from"./chunk-4BVXQHVT.js";import{e as le,f as A}from"./chunk-FCQHLITK.js";import{a as Qe,b as Ze}from"./chunk-5XNY7AZD.js";import"./chunk-WKNK5ZOT.js";import{a as We}from"./chunk-FOAKA6L2.js";import{a as ze,b as je}from"./chunk-QR2DMFNF.js";import{i as N}from"./chunk-UGKHWWQI.js";import{b as Re,c as Le,d as ae,e as He}from"./chunk-HYBR6CAI.js";import{U as re,_ as Ue}from"./chunk-LADG4UK2.js";import{d as ie,e as Ne,g as Ie,h as oe,i as Ae,j as V,k as Be}from"./chunk-SWFSIMMU.js";import{b as qe}from"./chunk-FRDT7FJR.js";import"./chunk-YYNZKITJ.js";import{X as Te,aa as ge,ia as Fe,ja as Ve,la as ne,v as te,x as Ee}from"./chunk-KJSJG3MU.js";import{$ as B,Ab as ee,Bb as w,Cb as ue,Fa as xe,Ga as Me,Ha as H,Ia as $,Ka as C,L as se,La as x,Lb as P,M as j,N as Ce,O as g,Oa as O,Ob as he,Pa as y,Pb as T,Qa as m,Ra as o,S as s,Sa as r,T as d,Ta as _,Ua as k,Va as q,Wa as Se,_ as U,_a as b,a as be,ab as f,bb as Y,ca as R,cb as u,db as we,eb as Pe,gc as F,kb as D,la as a,lb as E,mb as Q,ob as pe,oc as ke,pb as Oe,pc as De,qb as me,rb as p,sb as Z,tb as fe,ua as M,ub as W,va as L,vb as ye,wb as X,xa as de,xb as G,ya as ce,yb as K,zb as J}from"./chunk-Z2DARKJN.js";var Ge=`
    .p-textarea {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('textarea.color');
        background: dt('textarea.background');
        padding-block: dt('textarea.padding.y');
        padding-inline: dt('textarea.padding.x');
        border: 1px solid dt('textarea.border.color');
        transition:
            background dt('textarea.transition.duration'),
            color dt('textarea.transition.duration'),
            border-color dt('textarea.transition.duration'),
            outline-color dt('textarea.transition.duration'),
            box-shadow dt('textarea.transition.duration');
        appearance: none;
        border-radius: dt('textarea.border.radius');
        outline-color: transparent;
        box-shadow: dt('textarea.shadow');
    }

    .p-textarea:enabled:hover {
        border-color: dt('textarea.hover.border.color');
    }

    .p-textarea:enabled:focus {
        border-color: dt('textarea.focus.border.color');
        box-shadow: dt('textarea.focus.ring.shadow');
        outline: dt('textarea.focus.ring.width') dt('textarea.focus.ring.style') dt('textarea.focus.ring.color');
        outline-offset: dt('textarea.focus.ring.offset');
    }

    .p-textarea.p-invalid {
        border-color: dt('textarea.invalid.border.color');
    }

    .p-textarea.p-variant-filled {
        background: dt('textarea.filled.background');
    }

    .p-textarea.p-variant-filled:enabled:hover {
        background: dt('textarea.filled.hover.background');
    }

    .p-textarea.p-variant-filled:enabled:focus {
        background: dt('textarea.filled.focus.background');
    }

    .p-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .p-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .p-textarea.p-invalid::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }

    .p-textarea-fluid {
        width: 100%;
    }

    .p-textarea-resizable {
        overflow: hidden;
        resize: none;
    }

    .p-textarea-sm {
        font-size: dt('textarea.sm.font.size');
        padding-block: dt('textarea.sm.padding.y');
        padding-inline: dt('textarea.sm.padding.x');
    }

    .p-textarea-lg {
        font-size: dt('textarea.lg.font.size');
        padding-block: dt('textarea.lg.padding.y');
        padding-inline: dt('textarea.lg.padding.x');
    }
`;var At=`
    ${Ge}

    /* For PrimeNG */
    .p-textarea.ng-invalid.ng-dirty {
        border-color: dt('textarea.invalid.border.color');
    }
    .p-textarea.ng-invalid.ng-dirty::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }
`;var Ke=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=L({type:n});static \u0275inj=j({})}return n})();var Je=`
    .p-floatlabel {
        display: block;
        position: relative;
    }

    .p-floatlabel label {
        position: absolute;
        pointer-events: none;
        top: 50%;
        transform: translateY(-50%);
        transition-property: all;
        transition-timing-function: ease;
        line-height: 1;
        font-weight: dt('floatlabel.font.weight');
        inset-inline-start: dt('floatlabel.position.x');
        color: dt('floatlabel.color');
        transition-duration: dt('floatlabel.transition.duration');
    }

    .p-floatlabel:has(.p-textarea) label {
        top: dt('floatlabel.position.y');
        transform: translateY(0);
    }

    .p-floatlabel:has(.p-inputicon:first-child) label {
        inset-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-floatlabel:has(input:focus) label,
    .p-floatlabel:has(input.p-filled) label,
    .p-floatlabel:has(input:-webkit-autofill) label,
    .p-floatlabel:has(textarea:focus) label,
    .p-floatlabel:has(textarea.p-filled) label,
    .p-floatlabel:has(.p-inputwrapper-focus) label,
    .p-floatlabel:has(.p-inputwrapper-filled) label,
    .p-floatlabel:has(input[placeholder]) label,
    .p-floatlabel:has(textarea[placeholder]) label {
        top: dt('floatlabel.over.active.top');
        transform: translateY(0);
        font-size: dt('floatlabel.active.font.size');
        font-weight: dt('floatlabel.active.font.weight');
    }

    .p-floatlabel:has(input.p-filled) label,
    .p-floatlabel:has(textarea.p-filled) label,
    .p-floatlabel:has(.p-inputwrapper-filled) label {
        color: dt('floatlabel.active.color');
    }

    .p-floatlabel:has(input:focus) label,
    .p-floatlabel:has(input:-webkit-autofill) label,
    .p-floatlabel:has(textarea:focus) label,
    .p-floatlabel:has(.p-inputwrapper-focus) label {
        color: dt('floatlabel.focus.color');
    }

    .p-floatlabel-in .p-inputtext,
    .p-floatlabel-in .p-textarea,
    .p-floatlabel-in .p-select-label,
    .p-floatlabel-in .p-multiselect-label,
    .p-floatlabel-in .p-multiselect-label:has(.p-chip),
    .p-floatlabel-in .p-autocomplete-input-multiple,
    .p-floatlabel-in .p-cascadeselect-label,
    .p-floatlabel-in .p-treeselect-label {
        padding-block-start: dt('floatlabel.in.input.padding.top');
        padding-block-end: dt('floatlabel.in.input.padding.bottom');
    }

    .p-floatlabel-in:has(input:focus) label,
    .p-floatlabel-in:has(input.p-filled) label,
    .p-floatlabel-in:has(input:-webkit-autofill) label,
    .p-floatlabel-in:has(textarea:focus) label,
    .p-floatlabel-in:has(textarea.p-filled) label,
    .p-floatlabel-in:has(.p-inputwrapper-focus) label,
    .p-floatlabel-in:has(.p-inputwrapper-filled) label,
    .p-floatlabel-in:has(input[placeholder]) label,
    .p-floatlabel-in:has(textarea[placeholder]) label {
        top: dt('floatlabel.in.active.top');
    }

    .p-floatlabel-on:has(input:focus) label,
    .p-floatlabel-on:has(input.p-filled) label,
    .p-floatlabel-on:has(input:-webkit-autofill) label,
    .p-floatlabel-on:has(textarea:focus) label,
    .p-floatlabel-on:has(textarea.p-filled) label,
    .p-floatlabel-on:has(.p-inputwrapper-focus) label,
    .p-floatlabel-on:has(.p-inputwrapper-filled) label,
    .p-floatlabel-on:has(input[placeholder]) label,
    .p-floatlabel-on:has(textarea[placeholder]) label {
        top: 0;
        transform: translateY(-50%);
        border-radius: dt('floatlabel.on.border.radius');
        background: dt('floatlabel.on.active.background');
        padding: dt('floatlabel.on.active.padding');
    }

    .p-floatlabel:has([class^='p-'][class$='-fluid']) {
        width: 100%;
    }

    .p-floatlabel:has(.p-invalid) label {
        color: dt('floatlabel.invalid.color');
    }
`;var lt=["*"],st=`
    ${Je}

    /* For PrimeNG */
    .p-floatlabel:has(.ng-invalid.ng-dirty) label {
        color: dt('floatlabel.invalid.color');
    }
`,dt={root:({instance:n})=>["p-floatlabel",{"p-floatlabel-over":n.variant==="over","p-floatlabel-on":n.variant==="on","p-floatlabel-in":n.variant==="in"}]},et=(()=>{class n extends Ue{name="floatlabel";style=st;classes=dt;static \u0275fac=(()=>{let e;return function(t){return(e||(e=R(n)))(t||n)}})();static \u0275prov=se({token:n,factory:n.\u0275fac})}return n})();var tt=new Ce("FLOATLABEL_INSTANCE"),ct=(()=>{class n extends Le{componentName="FloatLabel";_componentStyle=g(et);$pcFloatLabel=g(tt,{optional:!0,skipSelf:!0})??void 0;bindDirectiveInstance=g(ae,{self:!0});onAfterViewChecked(){this.bindDirectiveInstance.setAttrs(this.ptms(["host","root"]))}variant="over";static \u0275fac=(()=>{let e;return function(t){return(e||(e=R(n)))(t||n)}})();static \u0275cmp=M({type:n,selectors:[["p-floatlabel"],["p-floatLabel"],["p-float-label"]],hostVars:2,hostBindings:function(i,t){i&2&&me(t.cx("root"))},inputs:{variant:"variant"},features:[ue([et,{provide:tt,useExisting:n},{provide:Re,useExisting:n}]),de([ae]),ce],ngContentSelectors:lt,decls:1,vars:0,template:function(i,t){i&1&&(we(),Pe(0))},dependencies:[F,re,He],encapsulation:2,changeDetection:0})}return n})(),nt=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=L({type:n});static \u0275inj=j({imports:[ct,re,re]})}return n})();var pt=["datePicker"],ot=(()=>{class n{constructor(){this.store=g(S),this.minDate=he(),this.maxDate=he(),this.picker=T("datePicker"),this.value=null}ngOnInit(){let e=this.formField().value();this.value=e?new Date(e):null}open(){queueMicrotask(()=>this.picker()?.showOverlay())}onChange(e){if(!e)return;let i=(e.getDate()>9?e.getDate():"0"+e.getDate())+"."+(e.getMonth()>8?e.getMonth()+1:"0"+(e.getMonth()+1))+"."+e.getFullYear();this.formField().value.set(i),this.store.shiftModel.set({date:i,from:ge("11:00",i),to:ge(Te(i)?"23:00":"22:00",i),perso:""})}static{this.\u0275fac=function(i){return new(i||n)}}static{this.\u0275cmp=M({type:n,selectors:[["app-date-picker"]],viewQuery:function(i,t){i&1&&D(t.picker,pt,5),i&2&&E()},inputs:{formField:"formField",date:"date",minDate:[1,"minDate"],maxDate:[1,"maxDate"]},decls:2,vars:6,consts:[["datePicker",""],["dateFormat","dd.mm.yy",3,"ngModelChange","onBlur","ngModel","minDate","maxDate","readonlyInput","showIcon","showOnFocus"]],template:function(i,t){if(i&1){let l=b();o(0,"p-datepicker",1,0),K("ngModelChange",function(v){return s(l),G(t.date,v)||(t.date=v),d(v)}),f("onBlur",function(){return s(l),d(t.formField().markAsTouched())})("ngModelChange",function(v){return s(l),d(t.onChange(v))}),r()}i&2&&(X("ngModel",t.date),m("minDate",t.minDate())("maxDate",t.maxDate())("readonlyInput",!0)("showIcon",!1)("showOnFocus",!1))},dependencies:[F,A,le,V,ie,oe],encapsulation:2})}}return n})();var _e=(n,c)=>c.kind;function mt(n,c){if(n&1&&(o(0,"p"),p(1),r()),n&2){let e=c.$implicit;a(),Z(e.message)}}function ft(n,c){if(n&1&&(o(0,"div",14),O(1,mt,2,1,"p",null,_e),r()),n&2){let e=u();a(),y(e.form.from().errors())}}function ut(n,c){if(n&1&&(o(0,"p"),p(1),r()),n&2){let e=c.$implicit;a(),Z(e.message)}}function ht(n,c){if(n&1&&(o(0,"div",14),O(1,ut,2,1,"p",null,_e),r()),n&2){let e=u();a(),y(e.form.to().errors())}}function gt(n,c){if(n&1&&(o(0,"p",24),p(1),r()),n&2){let e=c.$implicit;a(),Z(e.message)}}function _t(n,c){if(n&1&&(o(0,"div",14),O(1,gt,2,1,"p",24,_e),r()),n&2){let e=u();a(),y(e.form.perso().errors())}}function vt(n,c){if(n&1&&(o(0,"div",25)(1,"div",6)(2,"div",28)(3,"label",26),p(4,"Upravil"),r()(),o(5,"div")(6,"div",9),_(7,"input",27),r()()(),o(8,"div",6)(9,"div",28)(10,"label",26),p(11,"Upraveno"),r()(),o(12,"div")(13,"div",9),_(14,"input",27),r()()()()),n&2){let e=u(2),i=w(1);a(7),m("placeholder",i.updatedBy),a(7),m("placeholder",e.getTime(i.updatedAt))}}function bt(n,c){if(n&1&&(o(0,"div",25)(1,"div",6)(2,"div",7)(3,"label",26),p(4,"Zapsal"),r()(),o(5,"div")(6,"div",9),_(7,"input",27),r()()(),o(8,"div",6)(9,"div",7)(10,"label",26),p(11,"Zaps\xE1no"),r()(),o(12,"div")(13,"div",9),_(14,"input",27),r()()()(),C(15,vt,15,2,"div",25)),n&2){let e=u(),i=w(1);a(7),m("placeholder",i.createdBy),a(7),m("placeholder",e.getTime(i.createdAt)),a(),x(i.updatedBy!==null?15:-1)}}function Ct(n,c){if(n&1){let e=b();o(0,"button",29),f("click",function(){s(e);let t=u();return d(t.onHideForm())}),_(1,"i",30),p(2,"\xA0Zp\u011Bt"),r()}}function xt(n,c){n&1&&(_(0,"i",33),p(1,"\xA0Smazat "))}function Mt(n,c){n&1&&(_(0,"span",34),p(1," Odstra\u0148uji... "))}function St(n,c){if(n&1){let e=b();o(0,"button",31),f("click",function(){s(e);let t=u();return d(t.onHideForm())}),_(1,"i",30),p(2,"\xA0Zp\u011Bt"),r(),o(3,"button",32),f("click",function(){s(e);let t=u();return d(!t.shiftsStore.isDeleting()&&t.onDelete())}),C(4,xt,2,0)(5,Mt,2,0),r()}if(n&2){let e=u();a(4),x(e.shiftsStore.isDeleting()?5:4)}}function wt(n,c){if(n&1){let e=b();o(0,"button",35),f("click",function(){s(e);let t=u();return d(t.onSave())}),_(1,"i",36),p(2),r()}if(n&2){let e=u(),i=w(1);m("disabled",e.form().invalid()||e.isUnchanged()&&i.id>0),a(2),fe("\xA0",i.id===0?"Zapsat":"Upravit")}}function Pt(n,c){if(n&1&&(o(0,"button",23),_(1,"span",34),p(2),r()),n&2){u();let e=w(1);a(2),fe(" ",e.id>0?"Ukl\xE1d\xE1m...":"Upravuji..."," ")}}var rt=(()=>{class n{constructor(){this.shiftsStore=g(S),this.authStore=g(ne),this.MAX_PERSO=100,this.dialogRef=g(te,{optional:!0}),this.timeToString=Ve,this.getPosition=Fe,this.selectedShift=this.shiftsStore.selectedShift,this.card=this.shiftsStore.currentCard,this.monthYear=this.shiftsStore.monthYear,this.minDate=this.getMinDate(this.shiftsStore.monthYear()),this.maxDate=this.shiftsStore.isPastCard()?this.getMaxDate(this.shiftsStore.monthYear()):new Date,this.form=ze(this.shiftsStore.shiftModel,e=>{Ye(e)}),this.isUnchanged=P(()=>{let e=this.originalShift(),i=this.formSnapshot();return e?e.date===i.date&&e.from===i.from&&e.to===i.to&&e.perso===i.perso:!0}),this.formSnapshot=P(()=>{let e=this.form().value(),i=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"numeric",hour12:!1}).format(e.from),t=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"numeric",hour12:!1}).format(e.to);return{date:e.date,from:i,to:t,perso:e.perso}}),this.originalShift=P(()=>{let e=this.selectedShift();return e?{date:e.date,from:e.from,to:e.to,perso:e.perso}:null}),this.showPersoError=P(()=>this.form.perso().invalid()),this.showTimeFromError=P(()=>this.setShowError(this.form.from())),this.showTimeToError=P(()=>this.setShowError(this.form.to()))}onDelete(){this.shiftsStore.requestDeleteShift()}onHideForm(){this.shiftsStore.isSaving()||this.dialogRef?.close()}onPersoInput(e){let i=e.target.value;this.form.perso().value.set(i)}getTime(e){let i=e.split("T")[0],t=e.split("T")[1].substring(0,5);return`${i.split("-")[2]}.${i.split("-")[1]}.${i.split("-")[0]} ${t}`}onSave(){let e=be({},this.selectedShift());e.date=this.form.date().value(),e.from=this.timeToString(this.form.from().value()),e.to=this.timeToString(this.form.to().value()),e.perso=this.form.perso().value(),this.shiftsStore.createUpdateShift(e)}getMinDate(e){return new Date(parseInt(e.substring(2,6)),parseInt(e.substring(0,2))-1,1)}getMaxDate(e){return new Date(parseInt(e.substring(2,6)),parseInt(e.substring(0,2)),0)}setShowError(e){return e.invalid()||e.dirty()}static{this.\u0275fac=function(i){return new(i||n)}}static{this.\u0275cmp=M({type:n,selectors:[["app-shift-form"]],decls:51,vars:29,consts:[["datePicker",""],[1,"form-div"],["aria-hidden","true",1,"background-wrapper"],[1,"background-shape"],[1,"row"],[1,"title","d-flex","justify-content-center","align-items-center","flex-row","w-100"],[1,"col-6"],[1,"label","mt-2"],["for","username",1,"font-semibold","w-6rem"],[1,"card","flex","justify-content-center"],[1,"calendarDivShift",3,"click"],[3,"minDate","maxDate","formField","date"],[1,"card","flex","justify-content-center","timefromDiv"],[3,"formField","proposalDate"],[1,"error"],[1,"card","flex","justify-content-center","timetoDiv"],["for","float-input",1,"fw-bold"],[1,"persoDiv"],["id","float-input","rows","7","cols","34",3,"input","blur","value"],[1,"counter"],[1,"col-6","inline"],["type","button",1,"w-100","cancel","fw-bold","d-flex","flex-row","justify-content-center","align-items-center"],["type","submit","id","addBtn",1,"btn","w-100","fw-bold","d-flex","flex-row","justify-content-center","align-items-center",3,"disabled"],["id","loadingBtn","type","button",1,"btn","w-100","loading","fw-bold","d-flex","flex-row","justify-content-center","align-items-center"],[1,"perso"],["hide","",1,"row"],[1,"font-semibold","w-6rem"],["disabled","",3,"placeholder"],[1,"label"],["type","button",1,"w-100","cancel","fw-bold","d-flex","flex-row","justify-content-center","align-items-center",3,"click"],[1,"bi","bi-caret-left"],["type","button",1,"w-50","cancel","fw-bold","me-1","d-flex","flex-row","justify-content-center","align-items-center",3,"click"],["type","button",1,"w-50","fw-bold","delete","ms-1","d-flex","flex-row","justify-content-center","align-items-center",3,"click"],[1,"bi","bi-trash"],[1,"spinner-border","spinner-border-sm","text-white","me-1"],["type","submit","id","addBtn",1,"btn","w-100","fw-bold","d-flex","flex-row","justify-content-center","align-items-center",3,"click","disabled"],[1,"bi","bi-pencil-square"]],template:function(i,t){if(i&1){let l=b();o(0,"div",1),J(1),o(2,"form")(3,"div",2),_(4,"div",3),r(),o(5,"div",4)(6,"div",5)(7,"h1"),p(8),r()()(),o(9,"div",4)(10,"div",6)(11,"div",7)(12,"label",8),p(13,"Datum"),r()(),o(14,"div")(15,"div",9)(16,"div",10),f("click",function(){s(l);let v=Q(18);return d(v.open())}),_(17,"app-date-picker",11,0),H(),r()()(),o(19,"div",7)(20,"label",8),p(21,"Za\u010D\xE1tek"),r()(),o(22,"div")(23,"div",12),_(24,"app-d-picker",13),H(),r(),C(25,ft,3,0,"div",14),r(),o(26,"div",7)(27,"label",8),p(28,"Konec"),r()(),o(29,"div")(30,"div",15),_(31,"app-d-picker",13),H(),r(),C(32,ht,3,0,"div",14),r()(),o(33,"div",6)(34,"div",7)(35,"label",16),p(36,"Perso"),r()(),o(37,"div",17)(38,"textarea",18),f("input",function(v){return s(l),d(t.onPersoInput(v))})("blur",function(){return s(l),d(t.form.perso().markAsTouched())}),p(39,"                    "),r(),o(40,"div",19),p(41),r(),C(42,_t,3,0,"div",14),r()()(),C(43,bt,16,3),o(44,"div",4)(45,"div",20),C(46,Ct,3,0,"button",21)(47,St,6,1),r(),o(48,"div",6),C(49,wt,3,2,"button",22)(50,Pt,3,1,"button",23),r()()()()}if(i&2){a();let l=ee(t.selectedShift());a(7),ye("",l.id===0?"Nov\xE1 sm\u011Bna":"Upravit sm\u011Bnu"," - ",t.card().userName," ",t.card().userSurname.charAt(0).toUpperCase(),". - ",t.getPosition(t.card().userPosition)),a(9),m("minDate",t.minDate)("maxDate",t.maxDate)("date",l.date),$(t.form.date,"formField"),a(7),m("proposalDate",t.form.date().value()),$(t.form.from,"formField"),a(),x(t.showTimeFromError()?25:-1),a(6),m("proposalDate",t.form.date().value()),$(t.form.to,"formField"),a(),x(t.showTimeToError()?32:-1),a(6),pe("invalid",t.form.perso().invalid()),m("value",t.form.perso().value()),a(2),pe("counterError",t.form.perso().value().length>t.MAX_PERSO),a(),W(" ",t.form.perso().value().length,"/ ",t.MAX_PERSO," "),a(),x(t.showPersoError()?42:-1),a(),x(l&&l.id>0?43:-1),a(3),x(l.id===0?46:47),a(3),x(t.shiftsStore.isSaving()?50:49)}},dependencies:[F,Be,Ae,Ne,I,N,V,Ie,A,Ke,nt,Xe,je,$e,We,ot],styles:["cdk-dialog-container[_nghost-%COMP%], cdk-dialog-container   [_nghost-%COMP%]{display:flex;flex-direction:column;justify-content:center;align-items:center;background-color:var(--white);filter:drop-shadow(0 0 2em rgba(0,0,0,.5));padding:2em;border-radius:7px}[_ngcontent-%COMP%]::placeholder{color:var(--main-dark);font-weight:700}.form-div[_ngcontent-%COMP%]{border:1px solid var(--main-border-color);font-weight:500;font-style:normal;font-size:.8rem;background:var(--main);border-radius:7px}.form-div[_ngcontent-%COMP%]   .background-wrapper[_ngcontent-%COMP%]{position:absolute;right:0;bottom:0;z-index:-10;overflow:hidden;filter:blur(64px);transform:translateZ(0)}.form-div[_ngcontent-%COMP%]   .background-wrapper[_ngcontent-%COMP%]   .background-shape[_ngcontent-%COMP%]{position:relative;left:50%;z-index:-10;aspect-ratio:1155/678;width:36.125rem;max-width:none;transform:translate(-50%) rotate(30deg);opacity:.3;background:linear-gradient(to top right,#ff80b5,#9089fc);clip-path:polygon(74.1% 44.1%,100% 61.6%,97.5% 26.9%,85.5% .1%,80.7% 2%,72.5% 32.5%,60.2% 62.4%,52.4% 68.1%,47.5% 58.3%,45.2% 34.5%,27.5% 76.7%,.1% 64.9%,17.9% 100%,27.6% 76.8%,76.1% 97.7%,74.1% 44.1%)}.form-div[_ngcontent-%COMP%]   #addBtn[_ngcontent-%COMP%], .form-div[_ngcontent-%COMP%]   #loadingBtn[_ngcontent-%COMP%]{color:var(--white);background:var(--main-dark);height:30px;cursor:pointer;opacity:1;font-size:13px;letter-spacing:1px;border-radius:7px}.form-div[_ngcontent-%COMP%]   #addBtn[_ngcontent-%COMP%]   .bi[_ngcontent-%COMP%], .form-div[_ngcontent-%COMP%]   #loadingBtn[_ngcontent-%COMP%]   .bi[_ngcontent-%COMP%]{font-size:1.3rem}.form-div[_ngcontent-%COMP%]   #addBtn[_ngcontent-%COMP%]:disabled{background:var(--main-disabled)}.form-div[_ngcontent-%COMP%]   #loadingBtn.loading[_ngcontent-%COMP%]{background:var(--main-dark);pointer-events:none}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]{min-width:500px;min-height:30px!important;margin:20px}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .title[_ngcontent-%COMP%]{height:60px;padding-left:0!important;padding-right:0!important;letter-spacing:1px}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .title[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{font-size:1.3rem;color:var(--main-dark);font-weight:700;margin:0}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   .label[_ngcontent-%COMP%]{text-align:left!important;color:var(--main-dark);letter-spacing:1px}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   .label[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{font-weight:600}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]{border:none;--bs-card-bg: none !important}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:disabled{border:1px solid var(--main-border-color);background:var(--expander-primary-light);text-align:center;border-radius:7px}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   .label.invalid[_ngcontent-%COMP%]{color:var(--main-red)}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   .p-textarea[_ngcontent-%COMP%]{border-radius:none!important}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%], .form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   textarea.p-textarea[_ngcontent-%COMP%], .form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:disabled{border:1px solid var(--main-border-color);font-size:.9rem;color:var(--main-dark);resize:none;background:transparent;border-radius:7px!important;font-weight:500}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:active, .form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus{border:1px solid var(--main-border-color)!important;outline:none}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   textarea.invalid[_ngcontent-%COMP%]{border:1px solid var(--main-red)!important;color:var(--main-red)}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   .counter[_ngcontent-%COMP%]{position:absolute;right:60px;font-size:.75rem;color:var(--main-disabled)}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   .counter.counterError[_ngcontent-%COMP%]{color:var(--main-red);font-weight:500}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   .cancel[_ngcontent-%COMP%], .form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   .delete[_ngcontent-%COMP%]{height:30px;color:var(--white);letter-spacing:1px;border-radius:7px}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   .cancel[_ngcontent-%COMP%]{border:1px solid var(--main-back);background:var(--main-back)}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   .delete[_ngcontent-%COMP%]{border:1px solid var(--main-red);background:var(--main-red)}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]   .spinner-border[_ngcontent-%COMP%]{--bs-spinner-width: 1.4rem;--bs-spinner-height: 1.4rem}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col-6.inline[_ngcontent-%COMP%]{display:flex}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col[_ngcontent-%COMP%]{display:flex;flex-direction:column;justify-content:center!important;padding-left:0!important;padding-right:0!important}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col[_ngcontent-%COMP%]   .timefromDiv[_ngcontent-%COMP%], .form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col[_ngcontent-%COMP%]   .timetoDiv[_ngcontent-%COMP%]{visibility:var(--visibility)}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col[_ngcontent-%COMP%]   p-datepicker.shiftFrom[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{position:relative!important;top:0!important;height:10px!important}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .col.persoDiv[_ngcontent-%COMP%]{visibility:var(--visibility)}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .error[_ngcontent-%COMP%]{text-align:left;width:100%}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .error[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:.75rem;color:var(--main-red);font-weight:500;margin-top:-4px!important;position:absolute;left:60px}.form-div[_ngcontent-%COMP%]   .row[_ngcontent-%COMP%]   .error[_ngcontent-%COMP%]   p.perso[_ngcontent-%COMP%]{left:auto;margin-top:0!important}.form-div[_ngcontent-%COMP%]   .flex[_ngcontent-%COMP%]{visibility:var(--visibility)}"]})}}return n})();var Ot=["scrollContainer"],yt=(n,c)=>c.userId;function kt(n,c){if(n&1){let e=b();k(0,"div",6),Y("click",function(){s(e);let t=u();return d(t.onClose())}),Se(1,"i",7),q()}}function Dt(n,c){if(n&1){let e=b();k(0,"div",8),Y("click",function(){let t=s(e).$implicit,l=u();return d(l.onSelectUser(t.userId))}),k(1,"p"),p(2),q()()}if(n&2){let e=c.$implicit;a(2),W("",e.userName," ",e.userSurname)}}var at=(()=>{class n{constructor(){this.store=g(S),this.dialogRef=g(te,{optional:!0}),this.scrollContainer=T("scrollContainer"),this.sectionStyles=U({width:"25rem",maxHeight:"500px","overflow-y":this.store.uniqueUsers().length>11?"auto":"hidden"}),B(()=>{let e=this.scrollContainer();e&&requestAnimationFrame(()=>{requestAnimationFrame(()=>{e.nativeElement.scrollTop=0})})})}onSelectUser(e){let i=this.store.uniqueUsers().findIndex(t=>t.userId===e);this.store.slideTo(i),this.dialogRef?.close()}onClose(){this.dialogRef?.close()}static{this.\u0275fac=function(i){return new(i||n)}}static{this.\u0275cmp=M({type:n,selectors:[["app-select-user"]],viewQuery:function(i,t){i&1&&D(t.scrollContainer,Ot,5),i&2&&E()},decls:8,vars:3,consts:[["scrollContainer",""],[1,"select-user"],[1,"close_btn","position-absolute","d-flex","justify-content-center","flex-column","align-items-center"],[1,"user","d-flex","justify-content-center","w-100","flex-column","align-items-center"],[1,"close","d-flex","justify-content-center","w-100"],[1,"closeBtn","fw-bold",3,"click"],[1,"close_btn","position-absolute","d-flex","justify-content-center","flex-column","align-items-center",3,"click"],[1,"bi","bi-x","fw-bold"],[1,"user","d-flex","justify-content-center","w-100","flex-column","align-items-center",3,"click"]],template:function(i,t){if(i&1){let l=b();k(0,"div",1,0),C(2,kt,2,0,"div",2),O(3,Dt,3,2,"div",3,yt),k(5,"div",4)(6,"button",5),Y("click",function(){return s(l),d(t.onClose())}),p(7,"Zav\u0159\xEDt"),q()()()}if(i&2){Oe(t.sectionStyles());let l=t.store.uniqueUsers();a(2),x(l.length>11?2:-1),a(),y(l)}},dependencies:[I,N],styles:["cdk-dialog-container[_nghost-%COMP%], cdk-dialog-container   [_nghost-%COMP%]{display:flex;flex-direction:column;justify-content:center;align-items:center;background-color:var(--white);filter:drop-shadow(0 0 2em rgba(0,0,0,.5));padding:2em;border-radius:7px}.select-user[_ngcontent-%COMP%]   .user[_ngcontent-%COMP%]{height:30px;border:1px solid var(--main-dark);margin:10px 0;border-radius:7px}.select-user[_ngcontent-%COMP%]   .user[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:var(--main-dark);font-weight:500;margin-bottom:0!important;font-size:14px}.select-user[_ngcontent-%COMP%]   .user[_ngcontent-%COMP%]:hover{cursor:pointer;box-shadow:#00000059 0 5px 15px;background:var(--main-dark)}.select-user[_ngcontent-%COMP%]   .user[_ngcontent-%COMP%]:hover   p[_ngcontent-%COMP%]{color:var(--white)}.select-user[_ngcontent-%COMP%]   .close[_ngcontent-%COMP%]{margin-top:15px}.select-user[_ngcontent-%COMP%]   .close[_ngcontent-%COMP%]   .closeBtn[_ngcontent-%COMP%]{background:var(--main-dark);color:var(--white);border:1px solid var(--main-dark);height:30px;width:120px;transform:.3s;font-size:14px;border-radius:7px}.select-user[_ngcontent-%COMP%]   .close[_ngcontent-%COMP%]   .closeBtn[_ngcontent-%COMP%]:active{opacity:.7}.select-user[_ngcontent-%COMP%]   .close_btn[_ngcontent-%COMP%]{height:20px;width:20px;right:10px;top:10px;background-color:var(--main-red);color:var(--white);transition:.2s;cursor:pointer;border-radius:7px}.select-user[_ngcontent-%COMP%]   .close_btn[_ngcontent-%COMP%]:hover{opacity:.7}"]})}}return n})();var Et=["calendar"];function Tt(n,c){if(n&1){let e=b();o(0,"app-nav-button",13,2),f("click",function(t){s(e);let l=u();return d(l.onToggleCalendar(t))}),r(),o(2,"app-nav-button",14),f("click",function(){s(e);let t=u();return d(t.shiftsStore.uniqueUsers().length>0&&t.openModal())}),r()}if(n&2){let e=u();a(2),m("disabled",e.shiftsStore.uniqueUsers().length===0)}}function Ft(n,c){if(n&1){let e=b();o(0,"app-nav-button",15),f("click",function(){s(e);let t=u();return d(t.shiftsStore.pdfCards().length!==0&&t.shiftsStore.allToPdf())}),r()}if(n&2){let e=u(),i=w(1);m("hidden",i)("disabled",e.shiftsStore.pdfCards().length===0)("loading",e.shiftsStore.isPdfLoading())}}var ti=(()=>{class n{constructor(){this.authStore=g(ne),this.shiftsStore=g(S),this.dialog=g(Ee),this.router=g(De),this.calendar=T("calendar"),this.pathname=U(window.location.pathname),this.openAddSiftDialogEffect=B(()=>{this.shiftsStore.isAddShiftDialogRequested()&&(this.dialog.openDialogs.length>0||this.dialog.open(rt,{disableClose:!1}).closed.subscribe(()=>{this.shiftsStore.clearAddShiftDialogRequest()}))}),B(()=>{this.calendar&&(this.shiftsStore.showCalendar()?(this.calendar()?.showOverlay(),this.calendar()?.cd.detectChanges()):(this.calendar()?.hideOverlay(),this.calendar()?.cd.detectChanges()))})}onCalendarClickOutside(e,i){let t=e.target;i?.contains(t)||this.shiftsStore.closeCalendar()}onSelectDestination(e){this.shiftsStore.setDestination(e)}onSelectMonth(){let e=qe[this.calendar()?.value.getMonth()]+this.calendar()?.value.getFullYear();this.shiftsStore.setMonthYear(e)}onToggleCalendar(e){e.stopPropagation(),this.shiftsStore.toggleCalendar()}openModal(){this.dialog.open(at,{disableClose:!1})}changeDestination(e){e!==this.shiftsStore.destination()&&this.shiftsStore.setDestination(e)}toDaily(){this.pathname.update(()=>"/shifts/daily"),this.router.navigate(["shifts/daily"])}toShifts(){this.pathname.update(()=>"/shifts"),this.router.navigate(["shifts"])}reload(){this.pathname()==="/shifts"?this.shiftsStore.getCards():this.pathname()==="/shifts/daily"&&this.shiftsStore.getShiftsForToday()}addShift(){if(this.pathname()==="/shifts")this.shiftsStore.addShift();else if(this.pathname()==="/shifts/daily"){if(this.shiftsStore.oneConcurrentErrors())return;if(this.shiftsStore.todaysShifts().users.length===0){this.shiftsStore.error("Nen\xED mo\u017En\xE9 p\u0159idat sm\u011Bnu, proto\u017Ee pro dne\u0161n\xED den nejsou na\u010Dteni \u017E\xE1dn\xED u\u017Eivatel\xE9.");return}this.shiftsStore.addNewDailyShift()}}static{this.\u0275fac=function(i){return new(i||n)}}static{this.\u0275cmp=M({type:n,selectors:[["app-plans"]],viewQuery:function(i,t){i&1&&D(t.calendar,Et,5),i&2&&E()},decls:17,vars:16,consts:[["nav",""],["calendar",""],["toggleBtn",""],[1,"sidenav","position-fixed","h-100"],["icon","bi-plus",1,"save",3,"click","hidden","disabled"],["icon","bi-arrow-clockwise",3,"click"],["label","F-M",3,"click","hidden","inactive"],["label","OVA",3,"click","hidden","inactive"],["icon","bi-filetype-pdf",3,"hidden","disabled","loading"],["icon","bi-hourglass",3,"click","inactive"],["icon","bi-house",3,"click","inactive"],[1,"shifts-calendar","position-absolute"],["name","deadline","view","month","dateFormat","mm-yy",3,"ngModelChange","onSelect","onClickOutside","ngModel","readonlyInput","maxDate"],["icon","bi-calendar",3,"click"],["icon","bi-people",3,"click","disabled"],["icon","bi-filetype-pdf",3,"click","hidden","disabled","loading"]],template:function(i,t){if(i&1){let l=b();o(0,"div",3),J(1),o(2,"app-navigation",null,0),Me("fade-out"),xe("fade-in"),o(4,"app-nav-button",4),f("click",function(){return s(l),d(t.addShift())}),r(),o(5,"app-nav-button",4),f("click",function(){return s(l),d(!t.shiftsStore.isPastCard()&&t.addShift())}),r(),C(6,Tt,3,1),o(7,"app-nav-button",5),f("click",function(){return s(l),d(t.reload())}),r(),o(8,"app-nav-button",6),f("click",function(){return s(l),d(t.changeDestination("F-M"))}),r(),o(9,"app-nav-button",7),f("click",function(){return s(l),d(t.changeDestination("OVA"))}),r(),C(10,Ft,1,3,"app-nav-button",8),o(11,"app-nav-button",9),f("click",function(){return s(l),d(t.toDaily())}),r(),o(12,"app-nav-button",10),f("click",function(){return s(l),d(t.toShifts())}),r()()(),o(13,"div",11)(14,"p-datepicker",12,1),K("ngModelChange",function(v){return s(l),G(t.shiftsStore.defaultDate,v)||(t.shiftsStore.defaultDate=v),d(v)}),f("onSelect",function(){return s(l),d(t.onSelectMonth())})("onClickOutside",function(v){s(l);let ve=Q(3);return d(t.onCalendarClickOutside(v,ve.toggleBtn?ve.toggleBtn.nativeElement:void 0))}),r()(),_(16,"router-outlet")}if(i&2){let l;a();let h=ee(((l=t.authStore.user())==null?null:l.role)!=="Admin");a(3),m("hidden",h)("disabled",t.shiftsStore.oneConcurrentErrors()),a(),m("hidden",!h)("disabled",t.shiftsStore.isPastCard()===!0||t.shiftsStore.oneConcurrentErrors()),a(),x(t.pathname()==="/shifts"?6:-1),a(2),m("hidden",h)("inactive",t.shiftsStore.destination()!=="F-M"),a(),m("hidden",h)("inactive",t.shiftsStore.destination()!=="OVA"),a(),x(t.pathname()==="/shifts"?10:-1),a(),m("inactive",t.pathname()==="/shifts"),a(),m("inactive",t.pathname()==="/shifts/daily"),a(2),X("ngModel",t.shiftsStore.defaultDate),m("readonlyInput",!0)("maxDate",t.shiftsStore.maxDate())}},dependencies:[I,N,le,A,V,ie,oe,Qe,Ze,ke],styles:[".sidenav[_ngcontent-%COMP%]{z-index:9999}.shifts-calendar[_ngcontent-%COMP%]{width:190px;height:50px;top:70px;left:10px!important;z-index:999999}"]})}}return n})();export{ti as ShiftsComponent};
