import{p as wr}from"./callBound-Uz6qjr9w.js";import{g as Dr}from"./index-RfLt4OUa.js";var dr={},J={};J.byteLength=Or;J.toByteArray=Gr;J.fromByteArray=qr;var L=[],_=[],$r=typeof Uint8Array<"u"?Uint8Array:Array,Q="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(var W=0,Pr=Q.length;W<Pr;++W)L[W]=Q[W],_[Q.charCodeAt(W)]=W;_[45]=62;_[95]=63;function xr(l){var f=l.length;if(f%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var s=l.indexOf("=");s===-1&&(s=f);var d=s===f?0:4-s%4;return[s,d]}function Or(l){var f=xr(l),s=f[0],d=f[1];return(s+d)*3/4-d}function jr(l,f,s){return(f+s)*3/4-s}function Gr(l){var f,s=xr(l),d=s[0],g=s[1],a=new $r(jr(l,d,g)),p=0,F=g>0?d-4:d,m;for(m=0;m<F;m+=4)f=_[l.charCodeAt(m)]<<18|_[l.charCodeAt(m+1)]<<12|_[l.charCodeAt(m+2)]<<6|_[l.charCodeAt(m+3)],a[p++]=f>>16&255,a[p++]=f>>8&255,a[p++]=f&255;return g===2&&(f=_[l.charCodeAt(m)]<<2|_[l.charCodeAt(m+1)]>>4,a[p++]=f&255),g===1&&(f=_[l.charCodeAt(m)]<<10|_[l.charCodeAt(m+1)]<<4|_[l.charCodeAt(m+2)]>>2,a[p++]=f>>8&255,a[p++]=f&255),a}function Wr(l){return L[l>>18&63]+L[l>>12&63]+L[l>>6&63]+L[l&63]}function Yr(l,f,s){for(var d,g=[],a=f;a<s;a+=3)d=(l[a]<<16&16711680)+(l[a+1]<<8&65280)+(l[a+2]&255),g.push(Wr(d));return g.join("")}function qr(l){for(var f,s=l.length,d=s%3,g=[],a=16383,p=0,F=s-d;p<F;p+=a)g.push(Yr(l,p,p+a>F?F:p+a));return d===1?(f=l[s-1],g.push(L[f>>2]+L[f<<4&63]+"==")):d===2&&(f=(l[s-2]<<8)+l[s-1],g.push(L[f>>10]+L[f>>4&63]+L[f<<2&63]+"=")),g.join("")}var tr={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */tr.read=function(l,f,s,d,g){var a,p,F=g*8-d-1,m=(1<<F)-1,y=m>>1,i=-7,h=s?g-1:0,w=s?-1:1,E=l[f+h];for(h+=w,a=E&(1<<-i)-1,E>>=-i,i+=F;i>0;a=a*256+l[f+h],h+=w,i-=8);for(p=a&(1<<-i)-1,a>>=-i,i+=d;i>0;p=p*256+l[f+h],h+=w,i-=8);if(a===0)a=1-y;else{if(a===m)return p?NaN:(E?-1:1)*(1/0);p=p+Math.pow(2,d),a=a-y}return(E?-1:1)*p*Math.pow(2,a-d)};tr.write=function(l,f,s,d,g,a){var p,F,m,y=a*8-g-1,i=(1<<y)-1,h=i>>1,w=g===23?Math.pow(2,-24)-Math.pow(2,-77):0,E=d?0:a-1,S=d?1:-1,R=f<0||f===0&&1/f<0?1:0;for(f=Math.abs(f),isNaN(f)||f===1/0?(F=isNaN(f)?1:0,p=i):(p=Math.floor(Math.log(f)/Math.LN2),f*(m=Math.pow(2,-p))<1&&(p--,m*=2),p+h>=1?f+=w/m:f+=w*Math.pow(2,1-h),f*m>=2&&(p++,m/=2),p+h>=i?(F=0,p=i):p+h>=1?(F=(f*m-1)*Math.pow(2,g),p=p+h):(F=f*Math.pow(2,h-1)*Math.pow(2,g),p=0));g>=8;l[s+E]=F&255,E+=S,F/=256,g-=8);for(p=p<<g|F,y+=g;y>0;l[s+E]=p&255,E+=S,p/=256,y-=8);l[s+E-S]|=R*128};/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */(function(l){const f=J,s=tr,d=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;l.Buffer=i,l.SlowBuffer=er,l.INSPECT_MAX_BYTES=50;const g=2147483647;l.kMaxLength=g;const{Uint8Array:a,ArrayBuffer:p,SharedArrayBuffer:F}=globalThis;i.TYPED_ARRAY_SUPPORT=m(),!i.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function m(){try{const e=new a(1),r={foo:function(){return 42}};return Object.setPrototypeOf(r,a.prototype),Object.setPrototypeOf(e,r),e.foo()===42}catch{return!1}}Object.defineProperty(i.prototype,"parent",{enumerable:!0,get:function(){if(i.isBuffer(this))return this.buffer}}),Object.defineProperty(i.prototype,"offset",{enumerable:!0,get:function(){if(i.isBuffer(this))return this.byteOffset}});function y(e){if(e>g)throw new RangeError('The value "'+e+'" is invalid for option "size"');const r=new a(e);return Object.setPrototypeOf(r,i.prototype),r}function i(e,r,t){if(typeof e=="number"){if(typeof r=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return S(e)}return h(e,r,t)}i.poolSize=8192;function h(e,r,t){if(typeof e=="string")return R(e,r);if(p.isView(e))return N(e);if(e==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof e);if(k(e,p)||e&&k(e.buffer,p)||typeof F<"u"&&(k(e,F)||e&&k(e.buffer,F)))return D(e,r,t);if(typeof e=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');const n=e.valueOf&&e.valueOf();if(n!=null&&n!==e)return i.from(n,r,t);const o=H(e);if(o)return o;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof e[Symbol.toPrimitive]=="function")return i.from(e[Symbol.toPrimitive]("string"),r,t);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof e)}i.from=function(e,r,t){return h(e,r,t)},Object.setPrototypeOf(i.prototype,a.prototype),Object.setPrototypeOf(i,a);function w(e){if(typeof e!="number")throw new TypeError('"size" argument must be of type number');if(e<0)throw new RangeError('The value "'+e+'" is invalid for option "size"')}function E(e,r,t){return w(e),e<=0?y(e):r!==void 0?typeof t=="string"?y(e).fill(r,t):y(e).fill(r):y(e)}i.alloc=function(e,r,t){return E(e,r,t)};function S(e){return w(e),y(e<0?0:$(e)|0)}i.allocUnsafe=function(e){return S(e)},i.allocUnsafeSlow=function(e){return S(e)};function R(e,r){if((typeof r!="string"||r==="")&&(r="utf8"),!i.isEncoding(r))throw new TypeError("Unknown encoding: "+r);const t=O(e,r)|0;let n=y(t);const o=n.write(e,r);return o!==t&&(n=n.slice(0,o)),n}function b(e){const r=e.length<0?0:$(e.length)|0,t=y(r);for(let n=0;n<r;n+=1)t[n]=e[n]&255;return t}function N(e){if(k(e,a)){const r=new a(e);return D(r.buffer,r.byteOffset,r.byteLength)}return b(e)}function D(e,r,t){if(r<0||e.byteLength<r)throw new RangeError('"offset" is outside of buffer bounds');if(e.byteLength<r+(t||0))throw new RangeError('"length" is outside of buffer bounds');let n;return r===void 0&&t===void 0?n=new a(e):t===void 0?n=new a(e,r):n=new a(e,r,t),Object.setPrototypeOf(n,i.prototype),n}function H(e){if(i.isBuffer(e)){const r=$(e.length)|0,t=y(r);return t.length===0||e.copy(t,0,0,r),t}if(e.length!==void 0)return typeof e.length!="number"||K(e.length)?y(0):b(e);if(e.type==="Buffer"&&Array.isArray(e.data))return b(e.data)}function $(e){if(e>=g)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+g.toString(16)+" bytes");return e|0}function er(e){return+e!=e&&(e=0),i.alloc(+e)}i.isBuffer=function(r){return r!=null&&r._isBuffer===!0&&r!==i.prototype},i.compare=function(r,t){if(k(r,a)&&(r=i.from(r,r.offset,r.byteLength)),k(t,a)&&(t=i.from(t,t.offset,t.byteLength)),!i.isBuffer(r)||!i.isBuffer(t))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(r===t)return 0;let n=r.length,o=t.length;for(let u=0,c=Math.min(n,o);u<c;++u)if(r[u]!==t[u]){n=r[u],o=t[u];break}return n<o?-1:o<n?1:0},i.isEncoding=function(r){switch(String(r).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},i.concat=function(r,t){if(!Array.isArray(r))throw new TypeError('"list" argument must be an Array of Buffers');if(r.length===0)return i.alloc(0);let n;if(t===void 0)for(t=0,n=0;n<r.length;++n)t+=r[n].length;const o=i.allocUnsafe(t);let u=0;for(n=0;n<r.length;++n){let c=r[n];if(k(c,a))u+c.length>o.length?(i.isBuffer(c)||(c=i.from(c)),c.copy(o,u)):a.prototype.set.call(o,c,u);else if(i.isBuffer(c))c.copy(o,u);else throw new TypeError('"list" argument must be an Array of Buffers');u+=c.length}return o};function O(e,r){if(i.isBuffer(e))return e.length;if(p.isView(e)||k(e,p))return e.byteLength;if(typeof e!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof e);const t=e.length,n=arguments.length>2&&arguments[2]===!0;if(!n&&t===0)return 0;let o=!1;for(;;)switch(r){case"ascii":case"latin1":case"binary":return t;case"utf8":case"utf-8":return Z(e).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return t*2;case"hex":return t>>>1;case"base64":return pr(e).length;default:if(o)return n?-1:Z(e).length;r=(""+r).toLowerCase(),o=!0}}i.byteLength=O;function V(e,r,t){let n=!1;if((r===void 0||r<0)&&(r=0),r>this.length||((t===void 0||t>this.length)&&(t=this.length),t<=0)||(t>>>=0,r>>>=0,t<=r))return"";for(e||(e="utf8");;)switch(e){case"hex":return br(this,r,t);case"utf8":case"utf-8":return ir(this,r,t);case"ascii":return Ar(this,r,t);case"latin1":case"binary":return Ur(this,r,t);case"base64":return Cr(this,r,t);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Rr(this,r,t);default:if(n)throw new TypeError("Unknown encoding: "+e);e=(e+"").toLowerCase(),n=!0}}i.prototype._isBuffer=!0;function M(e,r,t){const n=e[r];e[r]=e[t],e[t]=n}i.prototype.swap16=function(){const r=this.length;if(r%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let t=0;t<r;t+=2)M(this,t,t+1);return this},i.prototype.swap32=function(){const r=this.length;if(r%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let t=0;t<r;t+=4)M(this,t,t+3),M(this,t+1,t+2);return this},i.prototype.swap64=function(){const r=this.length;if(r%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let t=0;t<r;t+=8)M(this,t,t+7),M(this,t+1,t+6),M(this,t+2,t+5),M(this,t+3,t+4);return this},i.prototype.toString=function(){const r=this.length;return r===0?"":arguments.length===0?ir(this,0,r):V.apply(this,arguments)},i.prototype.toLocaleString=i.prototype.toString,i.prototype.equals=function(r){if(!i.isBuffer(r))throw new TypeError("Argument must be a Buffer");return this===r?!0:i.compare(this,r)===0},i.prototype.inspect=function(){let r="";const t=l.INSPECT_MAX_BYTES;return r=this.toString("hex",0,t).replace(/(.{2})/g,"$1 ").trim(),this.length>t&&(r+=" ... "),"<Buffer "+r+">"},d&&(i.prototype[d]=i.prototype.inspect),i.prototype.compare=function(r,t,n,o,u){if(k(r,a)&&(r=i.from(r,r.offset,r.byteLength)),!i.isBuffer(r))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof r);if(t===void 0&&(t=0),n===void 0&&(n=r?r.length:0),o===void 0&&(o=0),u===void 0&&(u=this.length),t<0||n>r.length||o<0||u>this.length)throw new RangeError("out of range index");if(o>=u&&t>=n)return 0;if(o>=u)return-1;if(t>=n)return 1;if(t>>>=0,n>>>=0,o>>>=0,u>>>=0,this===r)return 0;let c=u-o,x=n-t;const I=Math.min(c,x),C=this.slice(o,u),A=r.slice(t,n);for(let B=0;B<I;++B)if(C[B]!==A[B]){c=C[B],x=A[B];break}return c<x?-1:x<c?1:0};function q(e,r,t,n,o){if(e.length===0)return-1;if(typeof t=="string"?(n=t,t=0):t>2147483647?t=2147483647:t<-2147483648&&(t=-2147483648),t=+t,K(t)&&(t=o?0:e.length-1),t<0&&(t=e.length+t),t>=e.length){if(o)return-1;t=e.length-1}else if(t<0)if(o)t=0;else return-1;if(typeof r=="string"&&(r=i.from(r,n)),i.isBuffer(r))return r.length===0?-1:nr(e,r,t,n,o);if(typeof r=="number")return r=r&255,typeof a.prototype.indexOf=="function"?o?a.prototype.indexOf.call(e,r,t):a.prototype.lastIndexOf.call(e,r,t):nr(e,[r],t,n,o);throw new TypeError("val must be string, number or Buffer")}function nr(e,r,t,n,o){let u=1,c=e.length,x=r.length;if(n!==void 0&&(n=String(n).toLowerCase(),n==="ucs2"||n==="ucs-2"||n==="utf16le"||n==="utf-16le")){if(e.length<2||r.length<2)return-1;u=2,c/=2,x/=2,t/=2}function I(A,B){return u===1?A[B]:A.readUInt16BE(B*u)}let C;if(o){let A=-1;for(C=t;C<c;C++)if(I(e,C)===I(r,A===-1?0:C-A)){if(A===-1&&(A=C),C-A+1===x)return A*u}else A!==-1&&(C-=C-A),A=-1}else for(t+x>c&&(t=c-x),C=t;C>=0;C--){let A=!0;for(let B=0;B<x;B++)if(I(e,C+B)!==I(r,B)){A=!1;break}if(A)return C}return-1}i.prototype.includes=function(r,t,n){return this.indexOf(r,t,n)!==-1},i.prototype.indexOf=function(r,t,n){return q(this,r,t,n,!0)},i.prototype.lastIndexOf=function(r,t,n){return q(this,r,t,n,!1)};function gr(e,r,t,n){t=Number(t)||0;const o=e.length-t;n?(n=Number(n),n>o&&(n=o)):n=o;const u=r.length;n>u/2&&(n=u/2);let c;for(c=0;c<n;++c){const x=parseInt(r.substr(c*2,2),16);if(K(x))return c;e[t+c]=x}return c}function mr(e,r,t,n){return z(Z(r,e.length-t),e,t,n)}function Fr(e,r,t,n){return z(Mr(r),e,t,n)}function Br(e,r,t,n){return z(pr(r),e,t,n)}function Er(e,r,t,n){return z(kr(r,e.length-t),e,t,n)}i.prototype.write=function(r,t,n,o){if(t===void 0)o="utf8",n=this.length,t=0;else if(n===void 0&&typeof t=="string")o=t,n=this.length,t=0;else if(isFinite(t))t=t>>>0,isFinite(n)?(n=n>>>0,o===void 0&&(o="utf8")):(o=n,n=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");const u=this.length-t;if((n===void 0||n>u)&&(n=u),r.length>0&&(n<0||t<0)||t>this.length)throw new RangeError("Attempt to write outside buffer bounds");o||(o="utf8");let c=!1;for(;;)switch(o){case"hex":return gr(this,r,t,n);case"utf8":case"utf-8":return mr(this,r,t,n);case"ascii":case"latin1":case"binary":return Fr(this,r,t,n);case"base64":return Br(this,r,t,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Er(this,r,t,n);default:if(c)throw new TypeError("Unknown encoding: "+o);o=(""+o).toLowerCase(),c=!0}},i.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function Cr(e,r,t){return r===0&&t===e.length?f.fromByteArray(e):f.fromByteArray(e.slice(r,t))}function ir(e,r,t){t=Math.min(e.length,t);const n=[];let o=r;for(;o<t;){const u=e[o];let c=null,x=u>239?4:u>223?3:u>191?2:1;if(o+x<=t){let I,C,A,B;switch(x){case 1:u<128&&(c=u);break;case 2:I=e[o+1],(I&192)===128&&(B=(u&31)<<6|I&63,B>127&&(c=B));break;case 3:I=e[o+1],C=e[o+2],(I&192)===128&&(C&192)===128&&(B=(u&15)<<12|(I&63)<<6|C&63,B>2047&&(B<55296||B>57343)&&(c=B));break;case 4:I=e[o+1],C=e[o+2],A=e[o+3],(I&192)===128&&(C&192)===128&&(A&192)===128&&(B=(u&15)<<18|(I&63)<<12|(C&63)<<6|A&63,B>65535&&B<1114112&&(c=B))}}c===null?(c=65533,x=1):c>65535&&(c-=65536,n.push(c>>>10&1023|55296),c=56320|c&1023),n.push(c),o+=x}return Ir(n)}const or=4096;function Ir(e){const r=e.length;if(r<=or)return String.fromCharCode.apply(String,e);let t="",n=0;for(;n<r;)t+=String.fromCharCode.apply(String,e.slice(n,n+=or));return t}function Ar(e,r,t){let n="";t=Math.min(e.length,t);for(let o=r;o<t;++o)n+=String.fromCharCode(e[o]&127);return n}function Ur(e,r,t){let n="";t=Math.min(e.length,t);for(let o=r;o<t;++o)n+=String.fromCharCode(e[o]);return n}function br(e,r,t){const n=e.length;(!r||r<0)&&(r=0),(!t||t<0||t>n)&&(t=n);let o="";for(let u=r;u<t;++u)o+=Lr[e[u]];return o}function Rr(e,r,t){const n=e.slice(r,t);let o="";for(let u=0;u<n.length-1;u+=2)o+=String.fromCharCode(n[u]+n[u+1]*256);return o}i.prototype.slice=function(r,t){const n=this.length;r=~~r,t=t===void 0?n:~~t,r<0?(r+=n,r<0&&(r=0)):r>n&&(r=n),t<0?(t+=n,t<0&&(t=0)):t>n&&(t=n),t<r&&(t=r);const o=this.subarray(r,t);return Object.setPrototypeOf(o,i.prototype),o};function U(e,r,t){if(e%1!==0||e<0)throw new RangeError("offset is not uint");if(e+r>t)throw new RangeError("Trying to access beyond buffer length")}i.prototype.readUintLE=i.prototype.readUIntLE=function(r,t,n){r=r>>>0,t=t>>>0,n||U(r,t,this.length);let o=this[r],u=1,c=0;for(;++c<t&&(u*=256);)o+=this[r+c]*u;return o},i.prototype.readUintBE=i.prototype.readUIntBE=function(r,t,n){r=r>>>0,t=t>>>0,n||U(r,t,this.length);let o=this[r+--t],u=1;for(;t>0&&(u*=256);)o+=this[r+--t]*u;return o},i.prototype.readUint8=i.prototype.readUInt8=function(r,t){return r=r>>>0,t||U(r,1,this.length),this[r]},i.prototype.readUint16LE=i.prototype.readUInt16LE=function(r,t){return r=r>>>0,t||U(r,2,this.length),this[r]|this[r+1]<<8},i.prototype.readUint16BE=i.prototype.readUInt16BE=function(r,t){return r=r>>>0,t||U(r,2,this.length),this[r]<<8|this[r+1]},i.prototype.readUint32LE=i.prototype.readUInt32LE=function(r,t){return r=r>>>0,t||U(r,4,this.length),(this[r]|this[r+1]<<8|this[r+2]<<16)+this[r+3]*16777216},i.prototype.readUint32BE=i.prototype.readUInt32BE=function(r,t){return r=r>>>0,t||U(r,4,this.length),this[r]*16777216+(this[r+1]<<16|this[r+2]<<8|this[r+3])},i.prototype.readBigUInt64LE=P(function(r){r=r>>>0,G(r,"offset");const t=this[r],n=this[r+7];(t===void 0||n===void 0)&&Y(r,this.length-8);const o=t+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24,u=this[++r]+this[++r]*2**8+this[++r]*2**16+n*2**24;return BigInt(o)+(BigInt(u)<<BigInt(32))}),i.prototype.readBigUInt64BE=P(function(r){r=r>>>0,G(r,"offset");const t=this[r],n=this[r+7];(t===void 0||n===void 0)&&Y(r,this.length-8);const o=t*2**24+this[++r]*2**16+this[++r]*2**8+this[++r],u=this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+n;return(BigInt(o)<<BigInt(32))+BigInt(u)}),i.prototype.readIntLE=function(r,t,n){r=r>>>0,t=t>>>0,n||U(r,t,this.length);let o=this[r],u=1,c=0;for(;++c<t&&(u*=256);)o+=this[r+c]*u;return u*=128,o>=u&&(o-=Math.pow(2,8*t)),o},i.prototype.readIntBE=function(r,t,n){r=r>>>0,t=t>>>0,n||U(r,t,this.length);let o=t,u=1,c=this[r+--o];for(;o>0&&(u*=256);)c+=this[r+--o]*u;return u*=128,c>=u&&(c-=Math.pow(2,8*t)),c},i.prototype.readInt8=function(r,t){return r=r>>>0,t||U(r,1,this.length),this[r]&128?(255-this[r]+1)*-1:this[r]},i.prototype.readInt16LE=function(r,t){r=r>>>0,t||U(r,2,this.length);const n=this[r]|this[r+1]<<8;return n&32768?n|4294901760:n},i.prototype.readInt16BE=function(r,t){r=r>>>0,t||U(r,2,this.length);const n=this[r+1]|this[r]<<8;return n&32768?n|4294901760:n},i.prototype.readInt32LE=function(r,t){return r=r>>>0,t||U(r,4,this.length),this[r]|this[r+1]<<8|this[r+2]<<16|this[r+3]<<24},i.prototype.readInt32BE=function(r,t){return r=r>>>0,t||U(r,4,this.length),this[r]<<24|this[r+1]<<16|this[r+2]<<8|this[r+3]},i.prototype.readBigInt64LE=P(function(r){r=r>>>0,G(r,"offset");const t=this[r],n=this[r+7];(t===void 0||n===void 0)&&Y(r,this.length-8);const o=this[r+4]+this[r+5]*2**8+this[r+6]*2**16+(n<<24);return(BigInt(o)<<BigInt(32))+BigInt(t+this[++r]*2**8+this[++r]*2**16+this[++r]*2**24)}),i.prototype.readBigInt64BE=P(function(r){r=r>>>0,G(r,"offset");const t=this[r],n=this[r+7];(t===void 0||n===void 0)&&Y(r,this.length-8);const o=(t<<24)+this[++r]*2**16+this[++r]*2**8+this[++r];return(BigInt(o)<<BigInt(32))+BigInt(this[++r]*2**24+this[++r]*2**16+this[++r]*2**8+n)}),i.prototype.readFloatLE=function(r,t){return r=r>>>0,t||U(r,4,this.length),s.read(this,r,!0,23,4)},i.prototype.readFloatBE=function(r,t){return r=r>>>0,t||U(r,4,this.length),s.read(this,r,!1,23,4)},i.prototype.readDoubleLE=function(r,t){return r=r>>>0,t||U(r,8,this.length),s.read(this,r,!0,52,8)},i.prototype.readDoubleBE=function(r,t){return r=r>>>0,t||U(r,8,this.length),s.read(this,r,!1,52,8)};function T(e,r,t,n,o,u){if(!i.isBuffer(e))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>o||r<u)throw new RangeError('"value" argument is out of bounds');if(t+n>e.length)throw new RangeError("Index out of range")}i.prototype.writeUintLE=i.prototype.writeUIntLE=function(r,t,n,o){if(r=+r,t=t>>>0,n=n>>>0,!o){const x=Math.pow(2,8*n)-1;T(this,r,t,n,x,0)}let u=1,c=0;for(this[t]=r&255;++c<n&&(u*=256);)this[t+c]=r/u&255;return t+n},i.prototype.writeUintBE=i.prototype.writeUIntBE=function(r,t,n,o){if(r=+r,t=t>>>0,n=n>>>0,!o){const x=Math.pow(2,8*n)-1;T(this,r,t,n,x,0)}let u=n-1,c=1;for(this[t+u]=r&255;--u>=0&&(c*=256);)this[t+u]=r/c&255;return t+n},i.prototype.writeUint8=i.prototype.writeUInt8=function(r,t,n){return r=+r,t=t>>>0,n||T(this,r,t,1,255,0),this[t]=r&255,t+1},i.prototype.writeUint16LE=i.prototype.writeUInt16LE=function(r,t,n){return r=+r,t=t>>>0,n||T(this,r,t,2,65535,0),this[t]=r&255,this[t+1]=r>>>8,t+2},i.prototype.writeUint16BE=i.prototype.writeUInt16BE=function(r,t,n){return r=+r,t=t>>>0,n||T(this,r,t,2,65535,0),this[t]=r>>>8,this[t+1]=r&255,t+2},i.prototype.writeUint32LE=i.prototype.writeUInt32LE=function(r,t,n){return r=+r,t=t>>>0,n||T(this,r,t,4,4294967295,0),this[t+3]=r>>>24,this[t+2]=r>>>16,this[t+1]=r>>>8,this[t]=r&255,t+4},i.prototype.writeUint32BE=i.prototype.writeUInt32BE=function(r,t,n){return r=+r,t=t>>>0,n||T(this,r,t,4,4294967295,0),this[t]=r>>>24,this[t+1]=r>>>16,this[t+2]=r>>>8,this[t+3]=r&255,t+4};function ur(e,r,t,n,o){ar(r,n,o,e,t,7);let u=Number(r&BigInt(4294967295));e[t++]=u,u=u>>8,e[t++]=u,u=u>>8,e[t++]=u,u=u>>8,e[t++]=u;let c=Number(r>>BigInt(32)&BigInt(4294967295));return e[t++]=c,c=c>>8,e[t++]=c,c=c>>8,e[t++]=c,c=c>>8,e[t++]=c,t}function cr(e,r,t,n,o){ar(r,n,o,e,t,7);let u=Number(r&BigInt(4294967295));e[t+7]=u,u=u>>8,e[t+6]=u,u=u>>8,e[t+5]=u,u=u>>8,e[t+4]=u;let c=Number(r>>BigInt(32)&BigInt(4294967295));return e[t+3]=c,c=c>>8,e[t+2]=c,c=c>>8,e[t+1]=c,c=c>>8,e[t]=c,t+8}i.prototype.writeBigUInt64LE=P(function(r,t=0){return ur(this,r,t,BigInt(0),BigInt("0xffffffffffffffff"))}),i.prototype.writeBigUInt64BE=P(function(r,t=0){return cr(this,r,t,BigInt(0),BigInt("0xffffffffffffffff"))}),i.prototype.writeIntLE=function(r,t,n,o){if(r=+r,t=t>>>0,!o){const I=Math.pow(2,8*n-1);T(this,r,t,n,I-1,-I)}let u=0,c=1,x=0;for(this[t]=r&255;++u<n&&(c*=256);)r<0&&x===0&&this[t+u-1]!==0&&(x=1),this[t+u]=(r/c>>0)-x&255;return t+n},i.prototype.writeIntBE=function(r,t,n,o){if(r=+r,t=t>>>0,!o){const I=Math.pow(2,8*n-1);T(this,r,t,n,I-1,-I)}let u=n-1,c=1,x=0;for(this[t+u]=r&255;--u>=0&&(c*=256);)r<0&&x===0&&this[t+u+1]!==0&&(x=1),this[t+u]=(r/c>>0)-x&255;return t+n},i.prototype.writeInt8=function(r,t,n){return r=+r,t=t>>>0,n||T(this,r,t,1,127,-128),r<0&&(r=255+r+1),this[t]=r&255,t+1},i.prototype.writeInt16LE=function(r,t,n){return r=+r,t=t>>>0,n||T(this,r,t,2,32767,-32768),this[t]=r&255,this[t+1]=r>>>8,t+2},i.prototype.writeInt16BE=function(r,t,n){return r=+r,t=t>>>0,n||T(this,r,t,2,32767,-32768),this[t]=r>>>8,this[t+1]=r&255,t+2},i.prototype.writeInt32LE=function(r,t,n){return r=+r,t=t>>>0,n||T(this,r,t,4,2147483647,-2147483648),this[t]=r&255,this[t+1]=r>>>8,this[t+2]=r>>>16,this[t+3]=r>>>24,t+4},i.prototype.writeInt32BE=function(r,t,n){return r=+r,t=t>>>0,n||T(this,r,t,4,2147483647,-2147483648),r<0&&(r=4294967295+r+1),this[t]=r>>>24,this[t+1]=r>>>16,this[t+2]=r>>>8,this[t+3]=r&255,t+4},i.prototype.writeBigInt64LE=P(function(r,t=0){return ur(this,r,t,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))}),i.prototype.writeBigInt64BE=P(function(r,t=0){return cr(this,r,t,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))});function sr(e,r,t,n,o,u){if(t+n>e.length)throw new RangeError("Index out of range");if(t<0)throw new RangeError("Index out of range")}function fr(e,r,t,n,o){return r=+r,t=t>>>0,o||sr(e,r,t,4),s.write(e,r,t,n,23,4),t+4}i.prototype.writeFloatLE=function(r,t,n){return fr(this,r,t,!0,n)},i.prototype.writeFloatBE=function(r,t,n){return fr(this,r,t,!1,n)};function hr(e,r,t,n,o){return r=+r,t=t>>>0,o||sr(e,r,t,8),s.write(e,r,t,n,52,8),t+8}i.prototype.writeDoubleLE=function(r,t,n){return hr(this,r,t,!0,n)},i.prototype.writeDoubleBE=function(r,t,n){return hr(this,r,t,!1,n)},i.prototype.copy=function(r,t,n,o){if(!i.isBuffer(r))throw new TypeError("argument should be a Buffer");if(n||(n=0),!o&&o!==0&&(o=this.length),t>=r.length&&(t=r.length),t||(t=0),o>0&&o<n&&(o=n),o===n||r.length===0||this.length===0)return 0;if(t<0)throw new RangeError("targetStart out of bounds");if(n<0||n>=this.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("sourceEnd out of bounds");o>this.length&&(o=this.length),r.length-t<o-n&&(o=r.length-t+n);const u=o-n;return this===r&&typeof a.prototype.copyWithin=="function"?this.copyWithin(t,n,o):a.prototype.set.call(r,this.subarray(n,o),t),u},i.prototype.fill=function(r,t,n,o){if(typeof r=="string"){if(typeof t=="string"?(o=t,t=0,n=this.length):typeof n=="string"&&(o=n,n=this.length),o!==void 0&&typeof o!="string")throw new TypeError("encoding must be a string");if(typeof o=="string"&&!i.isEncoding(o))throw new TypeError("Unknown encoding: "+o);if(r.length===1){const c=r.charCodeAt(0);(o==="utf8"&&c<128||o==="latin1")&&(r=c)}}else typeof r=="number"?r=r&255:typeof r=="boolean"&&(r=Number(r));if(t<0||this.length<t||this.length<n)throw new RangeError("Out of range index");if(n<=t)return this;t=t>>>0,n=n===void 0?this.length:n>>>0,r||(r=0);let u;if(typeof r=="number")for(u=t;u<n;++u)this[u]=r;else{const c=i.isBuffer(r)?r:i.from(r,o),x=c.length;if(x===0)throw new TypeError('The value "'+r+'" is invalid for argument "value"');for(u=0;u<n-t;++u)this[u+t]=c[u%x]}return this};const j={};function X(e,r,t){j[e]=class extends t{constructor(){super(),Object.defineProperty(this,"message",{value:r.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${e}]`,this.stack,delete this.name}get code(){return e}set code(o){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:o,writable:!0})}toString(){return`${this.name} [${e}]: ${this.message}`}}}X("ERR_BUFFER_OUT_OF_BOUNDS",function(e){return e?`${e} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"},RangeError),X("ERR_INVALID_ARG_TYPE",function(e,r){return`The "${e}" argument must be of type number. Received type ${typeof r}`},TypeError),X("ERR_OUT_OF_RANGE",function(e,r,t){let n=`The value of "${e}" is out of range.`,o=t;return Number.isInteger(t)&&Math.abs(t)>2**32?o=lr(String(t)):typeof t=="bigint"&&(o=String(t),(t>BigInt(2)**BigInt(32)||t<-(BigInt(2)**BigInt(32)))&&(o=lr(o)),o+="n"),n+=` It must be ${r}. Received ${o}`,n},RangeError);function lr(e){let r="",t=e.length;const n=e[0]==="-"?1:0;for(;t>=n+4;t-=3)r=`_${e.slice(t-3,t)}${r}`;return`${e.slice(0,t)}${r}`}function Tr(e,r,t){G(r,"offset"),(e[r]===void 0||e[r+t]===void 0)&&Y(r,e.length-(t+1))}function ar(e,r,t,n,o,u){if(e>t||e<r){const c=typeof r=="bigint"?"n":"";let x;throw u>3?r===0||r===BigInt(0)?x=`>= 0${c} and < 2${c} ** ${(u+1)*8}${c}`:x=`>= -(2${c} ** ${(u+1)*8-1}${c}) and < 2 ** ${(u+1)*8-1}${c}`:x=`>= ${r}${c} and <= ${t}${c}`,new j.ERR_OUT_OF_RANGE("value",x,e)}Tr(n,o,u)}function G(e,r){if(typeof e!="number")throw new j.ERR_INVALID_ARG_TYPE(r,"number",e)}function Y(e,r,t){throw Math.floor(e)!==e?(G(e,t),new j.ERR_OUT_OF_RANGE(t||"offset","an integer",e)):r<0?new j.ERR_BUFFER_OUT_OF_BOUNDS:new j.ERR_OUT_OF_RANGE(t||"offset",`>= ${t?1:0} and <= ${r}`,e)}const Sr=/[^+/0-9A-Za-z-_]/g;function _r(e){if(e=e.split("=")[0],e=e.trim().replace(Sr,""),e.length<2)return"";for(;e.length%4!==0;)e=e+"=";return e}function Z(e,r){r=r||1/0;let t;const n=e.length;let o=null;const u=[];for(let c=0;c<n;++c){if(t=e.charCodeAt(c),t>55295&&t<57344){if(!o){if(t>56319){(r-=3)>-1&&u.push(239,191,189);continue}else if(c+1===n){(r-=3)>-1&&u.push(239,191,189);continue}o=t;continue}if(t<56320){(r-=3)>-1&&u.push(239,191,189),o=t;continue}t=(o-55296<<10|t-56320)+65536}else o&&(r-=3)>-1&&u.push(239,191,189);if(o=null,t<128){if((r-=1)<0)break;u.push(t)}else if(t<2048){if((r-=2)<0)break;u.push(t>>6|192,t&63|128)}else if(t<65536){if((r-=3)<0)break;u.push(t>>12|224,t>>6&63|128,t&63|128)}else if(t<1114112){if((r-=4)<0)break;u.push(t>>18|240,t>>12&63|128,t>>6&63|128,t&63|128)}else throw new Error("Invalid code point")}return u}function Mr(e){const r=[];for(let t=0;t<e.length;++t)r.push(e.charCodeAt(t)&255);return r}function kr(e,r){let t,n,o;const u=[];for(let c=0;c<e.length&&!((r-=2)<0);++c)t=e.charCodeAt(c),n=t>>8,o=t%256,u.push(o),u.push(n);return u}function pr(e){return f.toByteArray(_r(e))}function z(e,r,t,n){let o;for(o=0;o<n&&!(o+t>=r.length||o>=e.length);++o)r[o+t]=e[o];return o}function k(e,r){return e instanceof r||e!=null&&e.constructor!=null&&e.constructor.name!=null&&e.constructor.name===r.name}function K(e){return e!==e}const Lr=function(){const e="0123456789abcdef",r=new Array(256);for(let t=0;t<16;++t){const n=t*16;for(let o=0;o<16;++o)r[n+o]=e[t]+e[o]}return r}();function P(e){return typeof BigInt>"u"?Nr:e}function Nr(){throw new Error("BigInt not supported")}})(dr);const Qr=dr.Buffer;var rr={exports:{}},v,yr;function zr(){if(yr)return v;yr=1;var l=1e3,f=l*60,s=f*60,d=s*24,g=d*7,a=d*365.25;v=function(i,h){h=h||{};var w=typeof i;if(w==="string"&&i.length>0)return p(i);if(w==="number"&&isFinite(i))return h.long?m(i):F(i);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(i))};function p(i){if(i=String(i),!(i.length>100)){var h=/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(i);if(h){var w=parseFloat(h[1]),E=(h[2]||"ms").toLowerCase();switch(E){case"years":case"year":case"yrs":case"yr":case"y":return w*a;case"weeks":case"week":case"w":return w*g;case"days":case"day":case"d":return w*d;case"hours":case"hour":case"hrs":case"hr":case"h":return w*s;case"minutes":case"minute":case"mins":case"min":case"m":return w*f;case"seconds":case"second":case"secs":case"sec":case"s":return w*l;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return w;default:return}}}}function F(i){var h=Math.abs(i);return h>=d?Math.round(i/d)+"d":h>=s?Math.round(i/s)+"h":h>=f?Math.round(i/f)+"m":h>=l?Math.round(i/l)+"s":i+"ms"}function m(i){var h=Math.abs(i);return h>=d?y(i,h,d,"day"):h>=s?y(i,h,s,"hour"):h>=f?y(i,h,f,"minute"):h>=l?y(i,h,l,"second"):i+" ms"}function y(i,h,w,E){var S=h>=w*1.5;return Math.round(i/w)+" "+E+(S?"s":"")}return v}function Jr(l){s.debug=s,s.default=s,s.coerce=m,s.disable=a,s.enable=g,s.enabled=p,s.humanize=zr(),s.destroy=y,Object.keys(l).forEach(i=>{s[i]=l[i]}),s.names=[],s.skips=[],s.formatters={};function f(i){let h=0;for(let w=0;w<i.length;w++)h=(h<<5)-h+i.charCodeAt(w),h|=0;return s.colors[Math.abs(h)%s.colors.length]}s.selectColor=f;function s(i){let h,w=null,E,S;function R(...b){if(!R.enabled)return;const N=R,D=Number(new Date),H=D-(h||D);N.diff=H,N.prev=h,N.curr=D,h=D,b[0]=s.coerce(b[0]),typeof b[0]!="string"&&b.unshift("%O");let $=0;b[0]=b[0].replace(/%([a-zA-Z%])/g,(O,V)=>{if(O==="%%")return"%";$++;const M=s.formatters[V];if(typeof M=="function"){const q=b[$];O=M.call(N,q),b.splice($,1),$--}return O}),s.formatArgs.call(N,b),(N.log||s.log).apply(N,b)}return R.namespace=i,R.useColors=s.useColors(),R.color=s.selectColor(i),R.extend=d,R.destroy=s.destroy,Object.defineProperty(R,"enabled",{enumerable:!0,configurable:!1,get:()=>w!==null?w:(E!==s.namespaces&&(E=s.namespaces,S=s.enabled(i)),S),set:b=>{w=b}}),typeof s.init=="function"&&s.init(R),R}function d(i,h){const w=s(this.namespace+(typeof h>"u"?":":h)+i);return w.log=this.log,w}function g(i){s.save(i),s.namespaces=i,s.names=[],s.skips=[];let h;const w=(typeof i=="string"?i:"").split(/[\s,]+/),E=w.length;for(h=0;h<E;h++)w[h]&&(i=w[h].replace(/\*/g,".*?"),i[0]==="-"?s.skips.push(new RegExp("^"+i.slice(1)+"$")):s.names.push(new RegExp("^"+i+"$")))}function a(){const i=[...s.names.map(F),...s.skips.map(F).map(h=>"-"+h)].join(",");return s.enable(""),i}function p(i){if(i[i.length-1]==="*")return!0;let h,w;for(h=0,w=s.skips.length;h<w;h++)if(s.skips[h].test(i))return!1;for(h=0,w=s.names.length;h<w;h++)if(s.names[h].test(i))return!0;return!1}function F(i){return i.toString().substring(2,i.toString().length-2).replace(/\.\*\?$/,"*")}function m(i){return i instanceof Error?i.stack||i.message:i}function y(){console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.")}return s.enable(s.load()),s}var Hr=Jr;(function(l,f){var s={};f.formatArgs=g,f.save=a,f.load=p,f.useColors=d,f.storage=F(),f.destroy=(()=>{let y=!1;return()=>{y||(y=!0,console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."))}})(),f.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"];function d(){return typeof window<"u"&&window.process&&(window.process.type==="renderer"||window.process.__nwjs)?!0:typeof navigator<"u"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)?!1:typeof document<"u"&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||typeof window<"u"&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||typeof navigator<"u"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31||typeof navigator<"u"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)}function g(y){if(y[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+y[0]+(this.useColors?"%c ":" ")+"+"+l.exports.humanize(this.diff),!this.useColors)return;const i="color: "+this.color;y.splice(1,0,i,"color: inherit");let h=0,w=0;y[0].replace(/%[a-zA-Z%]/g,E=>{E!=="%%"&&(h++,E==="%c"&&(w=h))}),y.splice(w,0,i)}f.log=console.debug||console.log||(()=>{});function a(y){try{y?f.storage.setItem("debug",y):f.storage.removeItem("debug")}catch{}}function p(){let y;try{y=f.storage.getItem("debug")}catch{}return!y&&typeof wr<"u"&&"env"in wr&&(y=s.DEBUG),y}function F(){try{return localStorage}catch{}}l.exports=Hr(f);const{formatters:m}=l.exports;m.j=function(y){try{return JSON.stringify(y)}catch(i){return"[UnexpectedJSONParseError]: "+i.message}}})(rr,rr.exports);var Vr=rr.exports;const vr=Dr(Vr);export{Qr as B,vr as D,Vr as b};