import{_ as C,I as N,a as S,u as L,c as R}from"./Button-KibTbxDG.js";import{R as l}from"./index-RfLt4OUa.js";import{P as o}from"./index-4QtD-hFu.js";import{g as d}from"./callBound-4MCeDK1M.js";var b,P,_,E,j=["children"],W=["children"],G=l.forwardRef(function(t,r){var a=t.children,n=C(t,j);return l.createElement(N,S({width:16,height:16,viewBox:"0 0 16 16",xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",ref:r},n),b||(b=l.createElement("path",{d:"M8.5 11L8.5 6.5 6.5 6.5 6.5 7.5 7.5 7.5 7.5 11 6 11 6 12 10 12 10 11zM8 3.5c-.4 0-.8.3-.8.8S7.6 5 8 5c.4 0 .8-.3.8-.8S8.4 3.5 8 3.5z"})),P||(P=l.createElement("path",{d:"M8,15c-3.9,0-7-3.1-7-7s3.1-7,7-7s7,3.1,7,7S11.9,15,8,15z M8,2C4.7,2,2,4.7,2,8s2.7,6,6,6s6-2.7,6-6S11.3,2,8,2z"})),a)}),J=l.forwardRef(function(t,r){var a=t.children,n=C(t,W);return l.createElement(N,S({width:16,height:16,viewBox:"0 0 16 16",xmlns:"http://www.w3.org/2000/svg",fill:"currentColor",ref:r},n),_||(_=l.createElement("path",{d:"M13,14H3c-0.6,0-1-0.4-1-1V3c0-0.6,0.4-1,1-1h5v1H3v10h10V8h1v5C14,13.6,13.6,14,13,14z"})),E||(E=l.createElement("path",{d:"M10 1L10 2 13.3 2 9 6.3 9.7 7 14 2.7 14 6 15 6 15 1z"})),a)}),$=["paragraph","lineCount","width","heading","className"];function s(){return s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var a in r)Object.prototype.hasOwnProperty.call(r,a)&&(e[a]=r[a])}return e},s.apply(this,arguments)}function f(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function B(e,t){if(e==null)return{};var r=H(e,t),a,n;if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],!(t.indexOf(a)>=0)&&Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}function H(e,t){if(e==null)return{};var r={},a=Object.keys(e),n,i;for(i=0;i<a.length;i++)n=a[i],!(t.indexOf(n)>=0)&&(r[n]=e[n]);return r}var V=[.973051493507435,.15334737213558558,.5671034553053769];function O(e,t,r){return Math.floor(V[r%3]*(t-e+1))+e}var m=function(t){var r,a=t.paragraph,n=t.lineCount,i=t.width,I=t.heading,v=t.className,p=B(t,$),g=L(),u=R((r={},f(r,"".concat(g,"--skeleton__text"),!0),f(r,"".concat(g,"--skeleton__heading"),I),f(r,v,v),r)),w=parseInt(i,10),k=i.includes("px"),M=i.includes("%");if(M&&a){for(var x=[],c=0;c<n;c++){var T=O(0,75,c)+"px";x.push(l.createElement("p",s({className:u,style:{width:"calc(".concat(i," - ").concat(T,")")},key:c},p)))}return l.createElement("div",null,x)}if(k&&a){for(var y=[],h=0;h<n;h++){var z=O(w-75,w,h)+"px";y.push(l.createElement("p",s({className:u,style:{width:z},key:h},p)))}return l.createElement("div",null,y)}return l.createElement("p",s({className:u,style:{width:i}},p))};m.propTypes={className:o.string,heading:o.bool,lineCount:o.number,paragraph:o.bool,width:o.string};m.defaultProps={paragraph:!1,width:"100%",heading:!1,lineCount:3};const K=m,Q=(e,t)=>e?d(e,t)||d(e,"extracted_metadata.title")||d(e,"extracted_metadata.filename")||e.document_id:"";export{G as I,J as L,K as S,Q as g};