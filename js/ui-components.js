// ⚠️ AUTO-GENERATED from src/ui/*.tsx — do not edit by hand.
// Regenerate with:  npm run build:ui

// node_modules/preact/dist/preact.module.js
var n;
var l;
var u;
var t;
var i;
var r;
var o;
var e;
var f;
var c;
var a;
var s;
var h;
var p;
var v;
var y;
var d = {};
var w = [];
var _ = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var g = Array.isArray;
function m(n2, l3) {
  for (var u4 in l3) n2[u4] = l3[u4];
  return n2;
}
function b(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function k(l3, u4, t3) {
  var i4, r3, o3, e3 = {};
  for (o3 in u4) "key" == o3 ? i4 = u4[o3] : "ref" == o3 ? r3 = u4[o3] : e3[o3] = u4[o3];
  if (arguments.length > 2 && (e3.children = arguments.length > 3 ? n.call(arguments, 2) : t3), "function" == typeof l3 && null != l3.defaultProps) for (o3 in l3.defaultProps) void 0 === e3[o3] && (e3[o3] = l3.defaultProps[o3]);
  return x(l3, e3, i4, r3, null);
}
function x(n2, t3, i4, r3, o3) {
  var e3 = { type: n2, props: t3, key: i4, ref: r3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o3 ? ++u : o3, __i: -1, __u: 0 };
  return null == o3 && null != l.vnode && l.vnode(e3), e3;
}
function S(n2) {
  return n2.children;
}
function C(n2, l3) {
  this.props = n2, this.context = l3;
}
function $(n2, l3) {
  if (null == l3) return n2.__ ? $(n2.__, n2.__i + 1) : null;
  for (var u4; l3 < n2.__k.length; l3++) if (null != (u4 = n2.__k[l3]) && null != u4.__e) return u4.__e;
  return "function" == typeof n2.type ? $(n2) : null;
}
function I(n2) {
  if (n2.__P && n2.__d) {
    var u4 = n2.__v, t3 = u4.__e, i4 = [], r3 = [], o3 = m({}, u4);
    o3.__v = u4.__v + 1, l.vnode && l.vnode(o3), q(n2.__P, o3, u4, n2.__n, n2.__P.namespaceURI, 32 & u4.__u ? [t3] : null, i4, null == t3 ? $(u4) : t3, !!(32 & u4.__u), r3), o3.__v = u4.__v, o3.__.__k[o3.__i] = o3, D(i4, o3, r3), u4.__e = u4.__ = null, o3.__e != t3 && P(o3);
  }
}
function P(n2) {
  if (null != (n2 = n2.__) && null != n2.__c) return n2.__e = n2.__c.base = null, n2.__k.some(function(l3) {
    if (null != l3 && null != l3.__e) return n2.__e = n2.__c.base = l3.__e;
  }), P(n2);
}
function A(n2) {
  (!n2.__d && (n2.__d = true) && i.push(n2) && !H.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)(H);
}
function H() {
  try {
    for (var n2, l3 = 1; i.length; ) i.length > l3 && i.sort(e), n2 = i.shift(), l3 = i.length, I(n2);
  } finally {
    i.length = H.__r = 0;
  }
}
function L(n2, l3, u4, t3, i4, r3, o3, e3, f4, c3, a3) {
  var s3, h3, p3, v3, y2, _2, g2, m3 = t3 && t3.__k || w, b2 = l3.length;
  for (f4 = T(u4, l3, m3, f4, b2), s3 = 0; s3 < b2; s3++) null != (p3 = u4.__k[s3]) && (h3 = -1 != p3.__i && m3[p3.__i] || d, p3.__i = s3, _2 = q(n2, p3, h3, i4, r3, o3, e3, f4, c3, a3), v3 = p3.__e, p3.ref && h3.ref != p3.ref && (h3.ref && J(h3.ref, null, p3), a3.push(p3.ref, p3.__c || v3, p3)), null == y2 && null != v3 && (y2 = v3), (g2 = !!(4 & p3.__u)) || h3.__k === p3.__k ? (f4 = j(p3, f4, n2, g2), g2 && h3.__e && (h3.__e = null)) : "function" == typeof p3.type && void 0 !== _2 ? f4 = _2 : v3 && (f4 = v3.nextSibling), p3.__u &= -7);
  return u4.__e = y2, f4;
}
function T(n2, l3, u4, t3, i4) {
  var r3, o3, e3, f4, c3, a3 = u4.length, s3 = a3, h3 = 0;
  for (n2.__k = new Array(i4), r3 = 0; r3 < i4; r3++) null != (o3 = l3[r3]) && "boolean" != typeof o3 && "function" != typeof o3 ? ("string" == typeof o3 || "number" == typeof o3 || "bigint" == typeof o3 || o3.constructor == String ? o3 = n2.__k[r3] = x(null, o3, null, null, null) : g(o3) ? o3 = n2.__k[r3] = x(S, { children: o3 }, null, null, null) : void 0 === o3.constructor && o3.__b > 0 ? o3 = n2.__k[r3] = x(o3.type, o3.props, o3.key, o3.ref ? o3.ref : null, o3.__v) : n2.__k[r3] = o3, f4 = r3 + h3, o3.__ = n2, o3.__b = n2.__b + 1, e3 = null, -1 != (c3 = o3.__i = O(o3, u4, f4, s3)) && (s3--, (e3 = u4[c3]) && (e3.__u |= 2)), null == e3 || null == e3.__v ? (-1 == c3 && (i4 > a3 ? h3-- : i4 < a3 && h3++), "function" != typeof o3.type && (o3.__u |= 4)) : c3 != f4 && (c3 == f4 - 1 ? h3-- : c3 == f4 + 1 ? h3++ : (c3 > f4 ? h3-- : h3++, o3.__u |= 4))) : n2.__k[r3] = null;
  if (s3) for (r3 = 0; r3 < a3; r3++) null != (e3 = u4[r3]) && 0 == (2 & e3.__u) && (e3.__e == t3 && (t3 = $(e3)), K(e3, e3));
  return t3;
}
function j(n2, l3, u4, t3) {
  var i4, r3;
  if ("function" == typeof n2.type) {
    for (i4 = n2.__k, r3 = 0; i4 && r3 < i4.length; r3++) i4[r3] && (i4[r3].__ = n2, l3 = j(i4[r3], l3, u4, t3));
    return l3;
  }
  n2.__e != l3 && (t3 && (l3 && n2.type && !l3.parentNode && (l3 = $(n2)), u4.insertBefore(n2.__e, l3 || null)), l3 = n2.__e);
  do {
    l3 = l3 && l3.nextSibling;
  } while (null != l3 && 8 == l3.nodeType);
  return l3;
}
function O(n2, l3, u4, t3) {
  var i4, r3, o3, e3 = n2.key, f4 = n2.type, c3 = l3[u4], a3 = null != c3 && 0 == (2 & c3.__u);
  if (null === c3 && null == e3 || a3 && e3 == c3.key && f4 == c3.type) return u4;
  if (t3 > (a3 ? 1 : 0)) {
    for (i4 = u4 - 1, r3 = u4 + 1; i4 >= 0 || r3 < l3.length; ) if (null != (c3 = l3[o3 = i4 >= 0 ? i4-- : r3++]) && 0 == (2 & c3.__u) && e3 == c3.key && f4 == c3.type) return o3;
  }
  return -1;
}
function z(n2, l3, u4) {
  "-" == l3[0] ? n2.setProperty(l3, null == u4 ? "" : u4) : n2[l3] = null == u4 ? "" : "number" != typeof u4 || _.test(l3) ? u4 : u4 + "px";
}
function N(n2, l3, u4, t3, i4) {
  var r3, o3;
  n: if ("style" == l3) if ("string" == typeof u4) n2.style.cssText = u4;
  else {
    if ("string" == typeof t3 && (n2.style.cssText = t3 = ""), t3) for (l3 in t3) u4 && l3 in u4 || z(n2.style, l3, "");
    if (u4) for (l3 in u4) t3 && u4[l3] == t3[l3] || z(n2.style, l3, u4[l3]);
  }
  else if ("o" == l3[0] && "n" == l3[1]) r3 = l3 != (l3 = l3.replace(s, "$1")), o3 = l3.toLowerCase(), l3 = o3 in n2 || "onFocusOut" == l3 || "onFocusIn" == l3 ? o3.slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + r3] = u4, u4 ? t3 ? u4[a] = t3[a] : (u4[a] = h, n2.addEventListener(l3, r3 ? v : p, r3)) : n2.removeEventListener(l3, r3 ? v : p, r3);
  else {
    if ("http://www.w3.org/2000/svg" == i4) l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n2) try {
      n2[l3] = null == u4 ? "" : u4;
      break n;
    } catch (n3) {
    }
    "function" == typeof u4 || (null == u4 || false === u4 && "-" != l3[4] ? n2.removeAttribute(l3) : n2.setAttribute(l3, "popover" == l3 && 1 == u4 ? "" : u4));
  }
}
function V(n2) {
  return function(u4) {
    if (this.l) {
      var t3 = this.l[u4.type + n2];
      if (null == u4[c]) u4[c] = h++;
      else if (u4[c] < t3[a]) return;
      return t3(l.event ? l.event(u4) : u4);
    }
  };
}
function q(n2, u4, t3, i4, r3, o3, e3, f4, c3, a3) {
  var s3, h3, p3, v3, y2, d3, _2, k3, x2, M, $2, I2, P2, A2, H2, T2 = u4.type;
  if (void 0 !== u4.constructor) return null;
  128 & t3.__u && (c3 = !!(32 & t3.__u), o3 = [f4 = u4.__e = t3.__e]), (s3 = l.__b) && s3(u4);
  n: if ("function" == typeof T2) try {
    if (k3 = u4.props, x2 = T2.prototype && T2.prototype.render, M = (s3 = T2.contextType) && i4[s3.__c], $2 = s3 ? M ? M.props.value : s3.__ : i4, t3.__c ? _2 = (h3 = u4.__c = t3.__c).__ = h3.__E : (x2 ? u4.__c = h3 = new T2(k3, $2) : (u4.__c = h3 = new C(k3, $2), h3.constructor = T2, h3.render = Q), M && M.sub(h3), h3.state || (h3.state = {}), h3.__n = i4, p3 = h3.__d = true, h3.__h = [], h3._sb = []), x2 && null == h3.__s && (h3.__s = h3.state), x2 && null != T2.getDerivedStateFromProps && (h3.__s == h3.state && (h3.__s = m({}, h3.__s)), m(h3.__s, T2.getDerivedStateFromProps(k3, h3.__s))), v3 = h3.props, y2 = h3.state, h3.__v = u4, p3) x2 && null == T2.getDerivedStateFromProps && null != h3.componentWillMount && h3.componentWillMount(), x2 && null != h3.componentDidMount && h3.__h.push(h3.componentDidMount);
    else {
      if (x2 && null == T2.getDerivedStateFromProps && k3 !== v3 && null != h3.componentWillReceiveProps && h3.componentWillReceiveProps(k3, $2), u4.__v == t3.__v || !h3.__e && null != h3.shouldComponentUpdate && false === h3.shouldComponentUpdate(k3, h3.__s, $2)) {
        u4.__v != t3.__v && (h3.props = k3, h3.state = h3.__s, h3.__d = false), u4.__e = t3.__e, u4.__k = t3.__k, u4.__k.some(function(n3) {
          n3 && (n3.__ = u4);
        }), w.push.apply(h3.__h, h3._sb), h3._sb = [], h3.__h.length && e3.push(h3);
        break n;
      }
      null != h3.componentWillUpdate && h3.componentWillUpdate(k3, h3.__s, $2), x2 && null != h3.componentDidUpdate && h3.__h.push(function() {
        h3.componentDidUpdate(v3, y2, d3);
      });
    }
    if (h3.context = $2, h3.props = k3, h3.__P = n2, h3.__e = false, I2 = l.__r, P2 = 0, x2) h3.state = h3.__s, h3.__d = false, I2 && I2(u4), s3 = h3.render(h3.props, h3.state, h3.context), w.push.apply(h3.__h, h3._sb), h3._sb = [];
    else do {
      h3.__d = false, I2 && I2(u4), s3 = h3.render(h3.props, h3.state, h3.context), h3.state = h3.__s;
    } while (h3.__d && ++P2 < 25);
    h3.state = h3.__s, null != h3.getChildContext && (i4 = m(m({}, i4), h3.getChildContext())), x2 && !p3 && null != h3.getSnapshotBeforeUpdate && (d3 = h3.getSnapshotBeforeUpdate(v3, y2)), A2 = null != s3 && s3.type === S && null == s3.key ? E(s3.props.children) : s3, f4 = L(n2, g(A2) ? A2 : [A2], u4, t3, i4, r3, o3, e3, f4, c3, a3), h3.base = u4.__e, u4.__u &= -161, h3.__h.length && e3.push(h3), _2 && (h3.__E = h3.__ = null);
  } catch (n3) {
    if (u4.__v = null, c3 || null != o3) if (n3.then) {
      for (u4.__u |= c3 ? 160 : 128; f4 && 8 == f4.nodeType && f4.nextSibling; ) f4 = f4.nextSibling;
      o3[o3.indexOf(f4)] = null, u4.__e = f4;
    } else {
      for (H2 = o3.length; H2--; ) b(o3[H2]);
      B(u4);
    }
    else u4.__e = t3.__e, u4.__k = t3.__k, n3.then || B(u4);
    l.__e(n3, u4, t3);
  }
  else null == o3 && u4.__v == t3.__v ? (u4.__k = t3.__k, u4.__e = t3.__e) : f4 = u4.__e = G(t3.__e, u4, t3, i4, r3, o3, e3, c3, a3);
  return (s3 = l.diffed) && s3(u4), 128 & u4.__u ? void 0 : f4;
}
function B(n2) {
  n2 && (n2.__c && (n2.__c.__e = true), n2.__k && n2.__k.some(B));
}
function D(n2, u4, t3) {
  for (var i4 = 0; i4 < t3.length; i4++) J(t3[i4], t3[++i4], t3[++i4]);
  l.__c && l.__c(u4, n2), n2.some(function(u5) {
    try {
      n2 = u5.__h, u5.__h = [], n2.some(function(n3) {
        n3.call(u5);
      });
    } catch (n3) {
      l.__e(n3, u5.__v);
    }
  });
}
function E(n2) {
  return "object" != typeof n2 || null == n2 || n2.__b > 0 ? n2 : g(n2) ? n2.map(E) : void 0 !== n2.constructor ? null : m({}, n2);
}
function G(u4, t3, i4, r3, o3, e3, f4, c3, a3) {
  var s3, h3, p3, v3, y2, w3, _2, m3 = i4.props || d, k3 = t3.props, x2 = t3.type;
  if ("svg" == x2 ? o3 = "http://www.w3.org/2000/svg" : "math" == x2 ? o3 = "http://www.w3.org/1998/Math/MathML" : o3 || (o3 = "http://www.w3.org/1999/xhtml"), null != e3) {
    for (s3 = 0; s3 < e3.length; s3++) if ((y2 = e3[s3]) && "setAttribute" in y2 == !!x2 && (x2 ? y2.localName == x2 : 3 == y2.nodeType)) {
      u4 = y2, e3[s3] = null;
      break;
    }
  }
  if (null == u4) {
    if (null == x2) return document.createTextNode(k3);
    u4 = document.createElementNS(o3, x2, k3.is && k3), c3 && (l.__m && l.__m(t3, e3), c3 = false), e3 = null;
  }
  if (null == x2) m3 === k3 || c3 && u4.data == k3 || (u4.data = k3);
  else {
    if (e3 = "textarea" == x2 && null != k3.defaultValue ? null : e3 && n.call(u4.childNodes), !c3 && null != e3) for (m3 = {}, s3 = 0; s3 < u4.attributes.length; s3++) m3[(y2 = u4.attributes[s3]).name] = y2.value;
    for (s3 in m3) y2 = m3[s3], "dangerouslySetInnerHTML" == s3 ? p3 = y2 : "children" == s3 || s3 in k3 || "value" == s3 && "defaultValue" in k3 || "checked" == s3 && "defaultChecked" in k3 || N(u4, s3, null, y2, o3);
    for (s3 in k3) y2 = k3[s3], "children" == s3 ? v3 = y2 : "dangerouslySetInnerHTML" == s3 ? h3 = y2 : "value" == s3 ? w3 = y2 : "checked" == s3 ? _2 = y2 : c3 && "function" != typeof y2 || m3[s3] === y2 || N(u4, s3, y2, m3[s3], o3);
    if (h3) c3 || p3 && (h3.__html == p3.__html || h3.__html == u4.innerHTML) || (u4.innerHTML = h3.__html), t3.__k = [];
    else if (p3 && (u4.innerHTML = ""), L("template" == t3.type ? u4.content : u4, g(v3) ? v3 : [v3], t3, i4, r3, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o3, e3, f4, e3 ? e3[0] : i4.__k && $(i4, 0), c3, a3), null != e3) for (s3 = e3.length; s3--; ) b(e3[s3]);
    c3 && "textarea" != x2 || (s3 = "value", "progress" == x2 && null == w3 ? u4.removeAttribute("value") : null != w3 && (w3 !== u4[s3] || "progress" == x2 && !w3 || "option" == x2 && w3 != m3[s3]) && N(u4, s3, w3, m3[s3], o3), s3 = "checked", null != _2 && _2 != u4[s3] && N(u4, s3, _2, m3[s3], o3));
  }
  return u4;
}
function J(n2, u4, t3) {
  try {
    if ("function" == typeof n2) {
      var i4 = "function" == typeof n2.__u;
      i4 && n2.__u(), i4 && null == u4 || (n2.__u = n2(u4));
    } else n2.current = u4;
  } catch (n3) {
    l.__e(n3, t3);
  }
}
function K(n2, u4, t3) {
  var i4, r3;
  if (l.unmount && l.unmount(n2), (i4 = n2.ref) && (i4.current && i4.current != n2.__e || J(i4, null, u4)), null != (i4 = n2.__c)) {
    if (i4.componentWillUnmount) try {
      i4.componentWillUnmount();
    } catch (n3) {
      l.__e(n3, u4);
    }
    i4.base = i4.__P = null;
  }
  if (i4 = n2.__k) for (r3 = 0; r3 < i4.length; r3++) i4[r3] && K(i4[r3], u4, t3 || "function" != typeof n2.type);
  t3 || b(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function Q(n2, l3, u4) {
  return this.constructor(n2, u4);
}
function R(u4, t3, i4) {
  var r3, o3, e3, f4;
  t3 == document && (t3 = document.documentElement), l.__ && l.__(u4, t3), o3 = (r3 = "function" == typeof i4) ? null : i4 && i4.__k || t3.__k, e3 = [], f4 = [], q(t3, u4 = (!r3 && i4 || t3).__k = k(S, null, [u4]), o3 || d, d, t3.namespaceURI, !r3 && i4 ? [i4] : o3 ? null : t3.firstChild ? n.call(t3.childNodes) : null, e3, !r3 && i4 ? i4 : o3 ? o3.__e : t3.firstChild, r3, f4), D(e3, u4, f4);
}
n = w.slice, l = { __e: function(n2, l3, u4, t3) {
  for (var i4, r3, o3; l3 = l3.__; ) if ((i4 = l3.__c) && !i4.__) try {
    if ((r3 = i4.constructor) && null != r3.getDerivedStateFromError && (i4.setState(r3.getDerivedStateFromError(n2)), o3 = i4.__d), null != i4.componentDidCatch && (i4.componentDidCatch(n2, t3 || {}), o3 = i4.__d), o3) return i4.__E = i4;
  } catch (l4) {
    n2 = l4;
  }
  throw n2;
} }, u = 0, t = function(n2) {
  return null != n2 && void 0 === n2.constructor;
}, C.prototype.setState = function(n2, l3) {
  var u4;
  u4 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m({}, this.state), "function" == typeof n2 && (n2 = n2(m({}, u4), this.props)), n2 && m(u4, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), A(this));
}, C.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), A(this));
}, C.prototype.render = S, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l3) {
  return n2.__v.__b - l3.__v.__b;
}, H.__r = 0, f = Math.random().toString(8), c = "__d" + f, a = "__a" + f, s = /(PointerCapture)$|Capture$/i, h = 0, p = V(false), v = V(true), y = 0;

// node_modules/preact/hooks/dist/hooks.module.js
var t2;
var r2;
var u2;
var i2;
var o2 = 0;
var f2 = [];
var c2 = l;
var e2 = c2.__b;
var a2 = c2.__r;
var v2 = c2.diffed;
var l2 = c2.__c;
var m2 = c2.unmount;
var s2 = c2.__;
function p2(n2, t3) {
  c2.__h && c2.__h(r2, n2, o2 || t3), o2 = 0;
  var u4 = r2.__H || (r2.__H = { __: [], __h: [] });
  return n2 >= u4.__.length && u4.__.push({}), u4.__[n2];
}
function d2(n2) {
  return o2 = 1, h2(D2, n2);
}
function h2(n2, u4, i4) {
  var o3 = p2(t2++, 2);
  if (o3.t = n2, !o3.__c && (o3.__ = [i4 ? i4(u4) : D2(void 0, u4), function(n3) {
    var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);
    t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
  }], o3.__c = r2, !r2.__f)) {
    var f4 = function(n3, t3, r3) {
      if (!o3.__c.__H) return true;
      var u5 = o3.__c.__H.__.filter(function(n4) {
        return n4.__c;
      });
      if (u5.every(function(n4) {
        return !n4.__N;
      })) return !c3 || c3.call(this, n3, t3, r3);
      var i5 = o3.__c.props !== n3;
      return u5.some(function(n4) {
        if (n4.__N) {
          var t4 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i5 = true);
        }
      }), c3 && c3.call(this, n3, t3, r3) || i5;
    };
    r2.__f = true;
    var c3 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;
    r2.componentWillUpdate = function(n3, t3, r3) {
      if (this.__e) {
        var u5 = c3;
        c3 = void 0, f4(n3, t3, r3), c3 = u5;
      }
      e3 && e3.call(this, n3, t3, r3);
    }, r2.shouldComponentUpdate = f4;
  }
  return o3.__N || o3.__;
}
function j2() {
  for (var n2; n2 = f2.shift(); ) {
    var t3 = n2.__H;
    if (n2.__P && t3) try {
      t3.__h.some(z2), t3.__h.some(B2), t3.__h = [];
    } catch (r3) {
      t3.__h = [], c2.__e(r3, n2.__v);
    }
  }
}
c2.__b = function(n2) {
  r2 = null, e2 && e2(n2);
}, c2.__ = function(n2, t3) {
  n2 && t3.__k && t3.__k.__m && (n2.__m = t3.__k.__m), s2 && s2(n2, t3);
}, c2.__r = function(n2) {
  a2 && a2(n2), t2 = 0;
  var i4 = (r2 = n2.__c).__H;
  i4 && (u2 === r2 ? (i4.__h = [], r2.__h = [], i4.__.some(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
  })) : (i4.__h.some(z2), i4.__h.some(B2), i4.__h = [], t2 = 0)), u2 = r2;
}, c2.diffed = function(n2) {
  v2 && v2(n2);
  var t3 = n2.__c;
  t3 && t3.__H && (t3.__H.__h.length && (1 !== f2.push(t3) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t3.__H.__.some(function(n3) {
    n3.u && (n3.__H = n3.u), n3.u = void 0;
  })), u2 = r2 = null;
}, c2.__c = function(n2, t3) {
  t3.some(function(n3) {
    try {
      n3.__h.some(z2), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B2(n4);
      });
    } catch (r3) {
      t3.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t3 = [], c2.__e(r3, n3.__v);
    }
  }), l2 && l2(n2, t3);
}, c2.unmount = function(n2) {
  m2 && m2(n2);
  var t3, r3 = n2.__c;
  r3 && r3.__H && (r3.__H.__.some(function(n3) {
    try {
      z2(n3);
    } catch (n4) {
      t3 = n4;
    }
  }), r3.__H = void 0, t3 && c2.__e(t3, r3.__v));
};
var k2 = "function" == typeof requestAnimationFrame;
function w2(n2) {
  var t3, r3 = function() {
    clearTimeout(u4), k2 && cancelAnimationFrame(t3), setTimeout(n2);
  }, u4 = setTimeout(r3, 35);
  k2 && (t3 = requestAnimationFrame(r3));
}
function z2(n2) {
  var t3 = r2, u4 = n2.__c;
  "function" == typeof u4 && (n2.__c = void 0, u4()), r2 = t3;
}
function B2(n2) {
  var t3 = r2;
  n2.__c = n2.__(), r2 = t3;
}
function D2(n2, t3) {
  return "function" == typeof t3 ? t3(n2) : t3;
}

// node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var f3 = 0;
var i3 = Array.isArray;
function u3(e3, t3, n2, o3, i4, u4) {
  t3 || (t3 = {});
  var a3, c3, p3 = t3;
  if ("ref" in p3) for (c3 in p3 = {}, t3) "ref" == c3 ? a3 = t3[c3] : p3[c3] = t3[c3];
  var l3 = { type: e3, props: p3, key: n2, ref: a3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f3, __i: -1, __u: 0, __source: i4, __self: u4 };
  if ("function" == typeof e3 && (a3 = e3.defaultProps)) for (c3 in a3) void 0 === p3[c3] && (p3[c3] = a3[c3]);
  return l.vnode && l.vnode(l3), l3;
}

// src/ui/social.tsx
var LB_TABS = [
  ["hybrid", "Hybrid Total"],
  ["bench", "Bench 1RM"],
  ["squat", "Squat 1RM"],
  ["deadlift", "Deadlift 1RM"],
  ["volume", "Month Volume"],
  ["miles", "Month Miles"],
  ["level", "Warrior Level"],
  ["streak", "Current Streak"]
];
function rankMedal(rank) {
  return rank === 1 ? "\u{1F947}" : rank === 2 ? "\u{1F948}" : rank === 3 ? "\u{1F949}" : String(rank);
}
function MeCard({ handle, stats, actions }) {
  const cell = (val, lab) => /* @__PURE__ */ u3("div", { children: [
    /* @__PURE__ */ u3("div", { class: "cm-val", children: val || "\u2014" }),
    /* @__PURE__ */ u3("div", { class: "cm-lab", children: lab })
  ] });
  return /* @__PURE__ */ u3("div", { class: "card section community-me-card", children: [
    /* @__PURE__ */ u3("div", { class: "community-me-head", children: [
      /* @__PURE__ */ u3("div", { children: [
        /* @__PURE__ */ u3("div", { class: "community-me-handle", children: handle }),
        /* @__PURE__ */ u3("div", { class: "community-me-tag", children: [
          "Lv ",
          stats.level,
          " \xB7 ",
          stats.streak,
          "d streak"
        ] })
      ] }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm btn-ghost", onClick: () => actions.editHandle(), children: "Edit handle" })
    ] }),
    /* @__PURE__ */ u3("div", { class: "community-me-stats", children: [
      cell(stats.bench1RM, "Bench 1RM"),
      cell(stats.squat1RM, "Squat 1RM"),
      cell(stats.deadlift1RM, "Deadlift 1RM"),
      cell(stats.monthMiles || 0, "Mo Miles")
    ] }),
    /* @__PURE__ */ u3("div", { class: "community-me-actions", children: [
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm btn-secondary-solid", onClick: () => actions.pushStats(), children: "\u21BB Push my stats" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm btn-ghost", onClick: () => actions.leave(), children: "Leave community" })
    ] })
  ] });
}
function JoinCard({ actions }) {
  const [val, setVal] = d2("");
  return /* @__PURE__ */ u3("div", { class: "card section community-join-card", children: [
    /* @__PURE__ */ u3("div", { class: "community-join-icon", children: "\u{1F91D}" }),
    /* @__PURE__ */ u3("h3", { class: "community-join-title", children: "Join the Hybrid Community" }),
    /* @__PURE__ */ u3("p", { class: "community-join-desc", children: "Pick a handle and share your training stats anonymously. Compare on leaderboards, motivate other athletes, and earn community recognition." }),
    /* @__PURE__ */ u3("div", { class: "community-join-form", children: [
      /* @__PURE__ */ u3(
        "input",
        {
          type: "text",
          class: "input-sm",
          placeholder: "Your handle (e.g. SteelMike)",
          maxlength: 24,
          autocomplete: "off",
          value: val,
          onInput: (e3) => setVal(e3.target.value)
        }
      ),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta btn-block", onClick: () => actions.join(val), children: "Join community" })
    ] }),
    /* @__PURE__ */ u3("div", { class: "community-privacy-note", children: "Your handle and stats become visible to other users. Your email, real name, body weight, and notes stay private." })
  ] });
}
function Leaderboards({ tab, rows, actions }) {
  return /* @__PURE__ */ u3("div", { class: "card section social-leaderboard-card", children: [
    /* @__PURE__ */ u3("div", { class: "card-h", children: /* @__PURE__ */ u3("h2", { children: "\u{1F3C6} Live Leaderboards" }) }),
    /* @__PURE__ */ u3("div", { class: "lb-tabs", children: LB_TABS.map(([id, label]) => /* @__PURE__ */ u3("button", { type: "button", class: "lb-tab" + (tab === id ? " on" : ""), onClick: () => actions.setLeaderTab(id), children: label })) }),
    /* @__PURE__ */ u3("div", { class: "lb-rows", children: rows.length === 0 ? /* @__PURE__ */ u3("div", { class: "social-empty", children: "No community data yet \u2014 be the first to share your stats!" }) : rows.map((r3) => /* @__PURE__ */ u3("div", { class: "lb-row" + (r3.me ? " lb-me" : ""), children: [
      /* @__PURE__ */ u3("span", { class: "lb-rank", children: rankMedal(r3.rank) }),
      /* @__PURE__ */ u3("span", { class: "lb-handle", children: [
        r3.handle,
        r3.me ? /* @__PURE__ */ u3("span", { class: "lb-me-tag", children: " you" }) : null
      ] }),
      /* @__PURE__ */ u3("span", { class: "lb-meta", children: [
        "Lv ",
        r3.level,
        r3.sex === "female" ? " \xB7 \u2640" : r3.sex === "male" ? " \xB7 \u2642" : ""
      ] }),
      /* @__PURE__ */ u3("span", { class: "lb-val", children: r3.display })
    ] })) })
  ] });
}
function MotivationWall({ optedIn, posts, actions }) {
  const [text, setText] = d2("");
  const submit = () => {
    actions.post(text);
    setText("");
  };
  return /* @__PURE__ */ u3("div", { class: "card section social-feed-card", children: [
    /* @__PURE__ */ u3("div", { class: "card-h", children: /* @__PURE__ */ u3("h2", { children: "\u{1F4AC} Motivation Wall" }) }),
    optedIn ? /* @__PURE__ */ u3("div", { class: "feed-composer", children: [
      /* @__PURE__ */ u3(
        "textarea",
        {
          maxlength: 280,
          rows: 2,
          placeholder: "Drop motivation, share a PR, or hype the squad\u2026",
          value: text,
          onInput: (e3) => setText(e3.target.value)
        }
      ),
      /* @__PURE__ */ u3("div", { class: "feed-composer-row", children: [
        /* @__PURE__ */ u3("span", { class: "feed-charcount", children: [
          text.length,
          "/280"
        ] }),
        /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm btn-cta", onClick: submit, children: "Post" })
      ] })
    ] }) : /* @__PURE__ */ u3("div", { class: "feed-locked", children: "Join the community above to post & react." }),
    /* @__PURE__ */ u3("div", { class: "feed-list", children: posts.length === 0 ? /* @__PURE__ */ u3("div", { class: "social-empty", children: "No motivation messages yet \u2014 drop the first one!" }) : posts.map((p3) => /* @__PURE__ */ u3("div", { class: "feed-post", children: [
      /* @__PURE__ */ u3("div", { class: "feed-post-head", children: [
        /* @__PURE__ */ u3("span", { class: "feed-handle", children: p3.handle }),
        /* @__PURE__ */ u3("span", { class: "feed-ago", children: p3.ago }),
        p3.own ? /* @__PURE__ */ u3("button", { type: "button", class: "feed-del", title: "Delete", onClick: () => actions.del(p3.id), children: "\xD7" }) : null
      ] }),
      /* @__PURE__ */ u3("div", { class: "feed-body", style: "white-space:pre-wrap", children: p3.text }),
      /* @__PURE__ */ u3("div", { class: "feed-foot", children: /* @__PURE__ */ u3(
        "button",
        {
          type: "button",
          class: "feed-heart" + (p3.liked ? " liked" : ""),
          "aria-label": "React",
          onClick: () => actions.heart(p3.id),
          children: [
            p3.liked ? "\u2764\uFE0F" : "\u{1F90D}",
            " ",
            p3.hearts
          ]
        }
      ) })
    ] })) })
  ] });
}
function SocialView(p3) {
  if (p3.mode === "signed-out") {
    return /* @__PURE__ */ u3("div", { class: "social-shell", children: /* @__PURE__ */ u3("div", { class: "social-header", children: [
      /* @__PURE__ */ u3("h1", { class: "social-title", children: "Community" }),
      /* @__PURE__ */ u3("p", { class: "social-subtitle", children: "Sign in to connect with other hybrid athletes." })
    ] }) });
  }
  if (p3.mode === "offline") {
    return /* @__PURE__ */ u3("div", { class: "social-shell", children: [
      /* @__PURE__ */ u3("div", { class: "social-header", children: [
        /* @__PURE__ */ u3("h1", { class: "social-title", children: "Community" }),
        /* @__PURE__ */ u3("p", { class: "social-subtitle", children: "Community features need an internet connection." })
      ] }),
      /* @__PURE__ */ u3("div", { class: "card section", style: "text-align:center;padding:24px", children: [
        /* @__PURE__ */ u3("div", { style: "font-size:28px;margin-bottom:8px", children: "\u{1F4E1}" }),
        /* @__PURE__ */ u3("p", { style: "font-size:13px;color:var(--text2)", children: "You're working offline. Sign in with cloud sync to access the global community." })
      ] })
    ] });
  }
  return /* @__PURE__ */ u3("div", { class: "social-shell", children: [
    /* @__PURE__ */ u3("div", { class: "social-header", children: [
      /* @__PURE__ */ u3("h1", { class: "social-title", children: "Community" }),
      /* @__PURE__ */ u3("p", { class: "social-subtitle", children: [
        "Global hybrid athletes training together.",
        " ",
        p3.totalAthletes > 0 ? /* @__PURE__ */ u3(S, { children: [
          /* @__PURE__ */ u3("b", { children: p3.totalAthletes }),
          " athletes connected."
        ] }) : "Be the first to join."
      ] })
    ] }),
    p3.optedIn ? /* @__PURE__ */ u3(MeCard, { handle: p3.handle, stats: p3.myStats, actions: p3.actions }) : /* @__PURE__ */ u3(JoinCard, { actions: p3.actions }),
    /* @__PURE__ */ u3(Leaderboards, { tab: p3.leaderTab, rows: p3.leaderRows, actions: p3.actions }),
    /* @__PURE__ */ u3(MotivationWall, { optedIn: p3.optedIn, posts: p3.posts, actions: p3.actions }),
    /* @__PURE__ */ u3("div", { class: "card section social-challenge-card community-info-card", children: [
      /* @__PURE__ */ u3("div", { class: "social-challenge-badge", children: "\u{1F3C5}" }),
      /* @__PURE__ */ u3("div", { class: "social-challenge-info", children: [
        /* @__PURE__ */ u3("div", { class: "social-challenge-name", children: "How leaderboards work" }),
        /* @__PURE__ */ u3("div", { class: "social-challenge-desc", children: 'Your best 1RM estimates and monthly running miles are updated automatically when you log workouts. Hit "Push my stats" to force-refresh. Hearts on motivation posts count as community recognition.' })
      ] })
    ] })
  ] });
}
function mountSocial(container, props) {
  R(/* @__PURE__ */ u3(SocialView, { ...props }), container);
}

// src/ui/profile-settings.tsx
function Num({ label, value, step, onInput }) {
  return /* @__PURE__ */ u3("div", { children: [
    /* @__PURE__ */ u3("label", { children: label }),
    /* @__PURE__ */ u3("input", { type: "number", step: step || "any", value, onInput: (e3) => onInput(e3.target.value) })
  ] });
}
function Toggle({ id, checked, onChange, title, desc }) {
  return /* @__PURE__ */ u3("div", { class: "settings-toggle-row", style: "margin-top:10px;padding:12px;background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border-lit)", children: /* @__PURE__ */ u3("label", { class: "settings-switch-label", children: [
    /* @__PURE__ */ u3("input", { type: "checkbox", checked, onChange: (e3) => onChange(e3.target.checked) }),
    /* @__PURE__ */ u3("span", { children: [
      /* @__PURE__ */ u3("b", { style: "color:var(--text)", children: title }),
      " \u2014 ",
      desc
    ] })
  ] }) });
}
function ProfileSettings(props) {
  const [f4, setF] = d2(props.initial);
  const set = (k3, v3) => setF((p3) => ({ ...p3, [k3]: v3 }));
  const u4 = props.massLabel;
  const a3 = props.actions;
  return /* @__PURE__ */ u3("div", { class: "card settings-section", id: "settings-profile", "data-k": "profile strength bench squat deadlift weight measurement body sex women life equipment style appearance theme light dark oled units metric audio altitude biometric save", children: [
    /* @__PURE__ */ u3("div", { class: "card-h", children: /* @__PURE__ */ u3("h2", { children: "Training & profile" }) }),
    /* @__PURE__ */ u3("div", { class: "grid3 settings-1rm-grid", children: [
      /* @__PURE__ */ u3(Num, { label: `Bench 1RM (${u4})`, value: f4.bench, onInput: (v3) => set("bench", v3) }),
      /* @__PURE__ */ u3(Num, { label: `Squat 1RM (${u4})`, value: f4.squat, onInput: (v3) => set("squat", v3) }),
      /* @__PURE__ */ u3(Num, { label: `Deadlift 1RM (${u4})`, value: f4.dead, onInput: (v3) => set("dead", v3) })
    ] }),
    /* @__PURE__ */ u3("div", { class: "grid3", style: "margin-top:8px", children: [
      /* @__PURE__ */ u3(Num, { label: `Weight (${u4})`, value: f4.weight, onInput: (v3) => set("weight", v3) }),
      /* @__PURE__ */ u3(Num, { label: `Goal Wt (${u4})`, value: f4.goalWt, onInput: (v3) => set("goalWt", v3) }),
      /* @__PURE__ */ u3("div", { children: [
        /* @__PURE__ */ u3("label", { children: "4mi pace" }),
        /* @__PURE__ */ u3("input", { class: "input-mmss", value: f4.run, placeholder: "35:00", inputmode: "numeric", autocomplete: "off", spellcheck: false, "aria-label": "Four mile time as mm:ss", onInput: (e3) => set("run", e3.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ u3("div", { class: "grid3", style: "margin-top:8px", children: [
      /* @__PURE__ */ u3(Num, { label: "Waist (in)", step: "0.1", value: f4.waist, onInput: (v3) => set("waist", v3) }),
      /* @__PURE__ */ u3(Num, { label: "Hips (in)", step: "0.1", value: f4.hips, onInput: (v3) => set("hips", v3) }),
      /* @__PURE__ */ u3(Num, { label: "Shoulders (in)", step: "0.1", value: f4.shoulders, onInput: (v3) => set("shoulders", v3) })
    ] }),
    /* @__PURE__ */ u3("div", { class: "grid3", style: "margin-top:8px", children: [
      /* @__PURE__ */ u3(Num, { label: "Body Fat %", step: "0.1", value: f4.bodyFat, onInput: (v3) => set("bodyFat", v3) }),
      /* @__PURE__ */ u3(Num, { label: "Neck (in)", step: "0.1", value: f4.neck, onInput: (v3) => set("neck", v3) }),
      /* @__PURE__ */ u3(Num, { label: "Age", step: "1", value: f4.age, onInput: (v3) => set("age", v3) })
    ] }),
    /* @__PURE__ */ u3("div", { class: (props.isFemale ? "grid3" : "grid2") + " settings-sex-row", style: "margin-top:8px", children: [
      /* @__PURE__ */ u3("div", { children: [
        /* @__PURE__ */ u3("label", { children: "Sex" }),
        /* @__PURE__ */ u3("select", { value: f4.sex, onChange: (e3) => set("sex", e3.target.value), children: [
          /* @__PURE__ */ u3("option", { value: "male", children: "Male" }),
          /* @__PURE__ */ u3("option", { value: "female", children: "Female" })
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { children: [
        /* @__PURE__ */ u3("label", { children: "Life Stage" }),
        /* @__PURE__ */ u3("select", { value: f4.lifeStage, onChange: (e3) => set("lifeStage", e3.target.value), children: [
          /* @__PURE__ */ u3("option", { value: "general", children: "General" }),
          /* @__PURE__ */ u3("option", { value: "pregnancy", children: "Pregnancy" }),
          /* @__PURE__ */ u3("option", { value: "postpartum", children: "Postpartum" })
        ] })
      ] }),
      props.isFemale ? /* @__PURE__ */ u3("div", { children: [
        /* @__PURE__ */ u3("label", { children: "Women's Mode" }),
        /* @__PURE__ */ u3("select", { value: f4.womenMode, onChange: (e3) => set("womenMode", e3.target.value), children: props.womenModeOptions.map(([v3, l3]) => /* @__PURE__ */ u3("option", { value: v3, children: l3 })) })
      ] }) : null
    ] }),
    /* @__PURE__ */ u3("div", { class: "grid2", style: "margin-top:8px", children: [
      /* @__PURE__ */ u3("div", { children: [
        /* @__PURE__ */ u3("label", { children: "Equipment" }),
        /* @__PURE__ */ u3("select", { value: f4.equipment, onChange: (e3) => set("equipment", e3.target.value), children: [
          /* @__PURE__ */ u3("option", { value: "gym", children: "Gym" }),
          /* @__PURE__ */ u3("option", { value: "home", children: "Home" })
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { children: [
        /* @__PURE__ */ u3("label", { children: "Session Style" }),
        /* @__PURE__ */ u3("select", { value: f4.style, onChange: (e3) => set("style", e3.target.value), children: [
          /* @__PURE__ */ u3("option", { value: "balanced", children: "Balanced" }),
          /* @__PURE__ */ u3("option", { value: "burner", children: "Burner (10-20 min)" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ u3(
      Toggle,
      {
        id: "s-light",
        checked: f4.light,
        title: "Light mode",
        desc: "bright backgrounds and higher contrast for daytime use.",
        onChange: (v3) => {
          set("light", v3);
          a3.applyAppearance(v3, f4.oled);
        }
      }
    ),
    /* @__PURE__ */ u3(
      Toggle,
      {
        id: "s-oled",
        checked: f4.oled,
        title: "True Black (OLED)",
        desc: "pure #000000 backgrounds to save battery on AMOLED screens.",
        onChange: (v3) => {
          set("oled", v3);
          a3.applyAppearance(f4.light, v3);
        }
      }
    ),
    /* @__PURE__ */ u3("div", { style: "margin-top:10px", children: [
      /* @__PURE__ */ u3("label", { children: "Weight & load units" }),
      /* @__PURE__ */ u3(
        "select",
        {
          value: f4.units,
          onChange: (e3) => {
            const v3 = e3.target.value;
            set("units", v3);
            a3.applyUnits(v3);
          },
          children: [
            /* @__PURE__ */ u3("option", { value: "imperial", children: "Imperial (lb)" }),
            /* @__PURE__ */ u3("option", { value: "metric", children: "Metric (kg)" })
          ]
        }
      )
    ] }),
    props.isFemale ? /* @__PURE__ */ u3("div", { style: "margin-top:8px;padding:10px;background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border-lit)", children: /* @__PURE__ */ u3("label", { style: "display:flex;gap:10px;align-items:flex-start;cursor:pointer;font-size:12px;color:var(--text2);line-height:1.45", children: [
      /* @__PURE__ */ u3("input", { type: "checkbox", style: "margin-top:3px;flex-shrink:0", checked: f4.womenSimpleUi, onChange: (e3) => set("womenSimpleUi", e3.target.checked) }),
      /* @__PURE__ */ u3("span", { children: [
        /* @__PURE__ */ u3("b", { style: "color:var(--text)", children: "Simpler layout & colors" }),
        " \u2014 Pinterest-style cards on Home, shorter Plan, pastels. How-to videos prefer female coaches. Turn off anytime."
      ] })
    ] }) }) : null,
    /* @__PURE__ */ u3("div", { style: "margin-top:8px", children: [
      /* @__PURE__ */ u3("label", { children: "When time is tight (Train tab)" }),
      /* @__PURE__ */ u3("select", { value: f4.quick, onChange: (e3) => set("quick", e3.target.value), children: [
        /* @__PURE__ */ u3("option", { value: "0", children: "Full session" }),
        /* @__PURE__ */ u3("option", { value: "15", children: "~15 min \u2014 first two lifts only" })
      ] })
    ] }),
    /* @__PURE__ */ u3(
      Toggle,
      {
        id: "s-audio-cues",
        checked: f4.audioCues,
        title: "Audio cues",
        desc: "announce next exercise and target weight when the rest timer finishes. Uses device speech synthesis.",
        onChange: (v3) => {
          set("audioCues", v3);
          a3.setAudioCues(v3);
        }
      }
    ),
    /* @__PURE__ */ u3(
      Toggle,
      {
        id: "s-altitude",
        checked: f4.altitude,
        title: "Training at altitude",
        desc: "automatically adjust target running paces 5% slower to account for reduced oxygen availability.",
        onChange: (v3) => {
          set("altitude", v3);
          a3.setAltitude(v3);
        }
      }
    ),
    props.biometricAvailable ? /* @__PURE__ */ u3(
      Toggle,
      {
        id: "s-biometric",
        checked: f4.biometric,
        title: "Biometric lock",
        desc: "require FaceID / TouchID when opening the app.",
        onChange: async (v3) => {
          const ok = await a3.setBiometric(v3);
          set("biometric", v3 ? !!ok : false);
        }
      }
    ) : null,
    /* @__PURE__ */ u3("button", { class: "btn btn-cta btn-block", style: "margin-top:10px", onClick: () => a3.save(f4), children: "Save & recalculate" }),
    /* @__PURE__ */ u3("details", { class: "settings-adapt-fold settings-section", "data-k": "adaptation reset bench squat dead run multiplier advanced deload", children: [
      /* @__PURE__ */ u3("summary", { class: "settings-adapt-sum", children: "Advanced \xB7 adaptation multipliers" }),
      /* @__PURE__ */ u3("div", { class: "settings-adapt-body", children: [
        /* @__PURE__ */ u3("p", { style: "font-size:11px;color:var(--text3);margin:0 0 10px;line-height:1.45", children: "These drift from 1.000 as you log. Reset only if prescriptions feel systematically off." }),
        /* @__PURE__ */ u3("div", { style: "display:flex;gap:10px;font-size:12px;color:var(--text2);flex-wrap:wrap;font-variant-numeric:tabular-nums", children: [
          /* @__PURE__ */ u3("span", { children: [
            "B ",
            /* @__PURE__ */ u3("b", { children: props.adapt.bench.toFixed(3) })
          ] }),
          /* @__PURE__ */ u3("span", { children: [
            "S ",
            /* @__PURE__ */ u3("b", { children: props.adapt.squat.toFixed(3) })
          ] }),
          /* @__PURE__ */ u3("span", { children: [
            "D ",
            /* @__PURE__ */ u3("b", { children: props.adapt.dead.toFixed(3) })
          ] }),
          /* @__PURE__ */ u3("span", { children: [
            "R ",
            /* @__PURE__ */ u3("b", { children: props.adapt.run.toFixed(3) })
          ] })
        ] }),
        /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost btn-sm", style: "margin-top:8px", onClick: () => a3.resetAdaptation(), children: "Reset to 1.000" })
      ] })
    ] })
  ] });
}
function mountProfileSettings(container, props) {
  R(/* @__PURE__ */ u3(ProfileSettings, { ...props }), container);
}

// src/ui/plan.tsx
function Html({ html }) {
  return /* @__PURE__ */ u3("div", { style: "display:contents", dangerouslySetInnerHTML: { __html: html } });
}
function ExRow({ ex, day, drag, setDrag, over, setOver, reorder }) {
  const isDragging = !!drag && drag.eid === ex.eid && drag.date === day.dateIso;
  const isOver = over === ex.eid && !!drag && drag.date === day.dateIso && drag.eid !== ex.eid;
  const cls = "pw-ex-row pw-ex-drag" + (isDragging ? " pw-ex-dragging" : "") + (isOver ? " pw-ex-drop-over" : "");
  return /* @__PURE__ */ u3(
    "div",
    {
      class: cls,
      draggable: true,
      "data-date": day.dateIso,
      "data-eid": ex.eid,
      onDragStart: (e3) => {
        setDrag({ eid: ex.eid, date: day.dateIso });
        try {
          e3.dataTransfer.setData("text/plain", ex.eid);
          e3.dataTransfer.effectAllowed = "move";
        } catch {
        }
      },
      onDragOver: (e3) => {
        if (!drag || drag.date !== day.dateIso) return;
        e3.preventDefault();
        try {
          e3.dataTransfer.dropEffect = "move";
        } catch {
        }
        if (over !== ex.eid) setOver(ex.eid);
      },
      onDragLeave: () => {
        if (over === ex.eid) setOver(null);
      },
      onDrop: (e3) => {
        if (!drag || drag.date !== day.dateIso) return;
        e3.preventDefault();
        const fromEid = drag.eid;
        setOver(null);
        if (fromEid && fromEid !== ex.eid) reorder(day.dateIso, fromEid, ex.eid);
      },
      onDragEnd: () => {
        setDrag(null);
        setOver(null);
      },
      children: [
        /* @__PURE__ */ u3("span", { class: "pw-ex-drag-hint", "aria-hidden": "true", title: "Drag to reorder", children: "\u22EE\u22EE" }),
        /* @__PURE__ */ u3("span", { class: `pw-phase-tag ${day.phaseClass}`, title: day.phaseName, children: day.phaseAbbrev }),
        /* @__PURE__ */ u3("div", { class: "pw-ex-main", children: [
          /* @__PURE__ */ u3("b", { children: ex.name }),
          /* @__PURE__ */ u3("span", { children: ex.rx })
        ] })
      ]
    }
  );
}
function DayCard({ day, drag, setDrag, over, setOver, reorder }) {
  return /* @__PURE__ */ u3(
    "div",
    {
      class: "pw-day" + (day.isToday ? " pw-day-today" : ""),
      style: `border-left:3px solid ${day.phaseColor};padding-left:10px;border-radius:8px;box-sizing:border-box`,
      children: [
        /* @__PURE__ */ u3("div", { class: "pw-day-label", children: [
          /* @__PURE__ */ u3("span", { class: "pw-date-line", style: `color:${day.phaseColor}`, children: day.dateLong }),
          " ",
          /* @__PURE__ */ u3("span", { class: "pw-day-dow", children: day.dow }),
          " ",
          /* @__PURE__ */ u3("span", { class: "pw-meta-muted", children: [
            "\xB7 Sess ",
            day.sessIdx,
            "/",
            day.total
          ] }),
          day.isToday ? /* @__PURE__ */ u3(S, { children: [
            " ",
            /* @__PURE__ */ u3("span", { class: "badge badge-ice pw-today-badge", children: "Today" })
          ] }) : null,
          day.estMin > 0 ? /* @__PURE__ */ u3(S, { children: [
            " ",
            /* @__PURE__ */ u3("span", { class: "pw-est-min", title: "Rough session length", children: [
              "~",
              day.estMin,
              " min"
            ] })
          ] }) : null,
          " ",
          /* @__PURE__ */ u3("span", { class: "badge pw-focus-badge", title: "Session theme", children: day.focusHead })
        ] }),
        day.recovery ? /* @__PURE__ */ u3("div", { class: "pw-ex-row pw-ex-recovery", children: [
          /* @__PURE__ */ u3("span", { class: `pw-phase-tag ${day.phaseClass}`, title: day.phaseName, children: day.phaseAbbrev }),
          /* @__PURE__ */ u3("span", { children: "Recovery \u2014 walk or easy mobility" })
        ] }) : day.exercises.map((ex) => /* @__PURE__ */ u3(ExRow, { ex, day, drag, setDrag, over, setOver, reorder }, ex.eid)),
        day.finisher ? /* @__PURE__ */ u3("div", { class: "pw-finisher-block", role: "group", "aria-label": "Finisher", children: [
          /* @__PURE__ */ u3("span", { class: "pw-finisher-label", children: "Finisher" }),
          /* @__PURE__ */ u3("div", { class: "pw-finisher-txt", children: day.finisher })
        ] }) : null
      ]
    }
  );
}
function WeekCard({ wk, drag, setDrag, over, setOver, a: a3 }) {
  return /* @__PURE__ */ u3("div", { class: "pw-card" + (wk.isCurrent ? " pw-current" : ""), children: [
    /* @__PURE__ */ u3("div", { class: "pw-head", "data-w": wk.week, onClick: () => a3.toggleWeek(wk.week), children: [
      /* @__PURE__ */ u3("span", { class: "arrow" + (wk.isOpen ? " open" : ""), children: "\u25B8" }),
      /* @__PURE__ */ u3("span", { style: "font-weight:700;font-size:13px", children: [
        "Week ",
        wk.week
      ] }),
      /* @__PURE__ */ u3("span", { class: `badge ${wk.phaseBadgeClass}`, style: "font-size:9px", children: [
        wk.phaseName,
        wk.deload ? " \xB7 Deload" : ""
      ] }),
      wk.isCurrent ? /* @__PURE__ */ u3("span", { class: "badge badge-ice", style: "font-size:9px", children: "This training week" }) : null,
      /* @__PURE__ */ u3("span", { style: "font-size:10px;color:var(--text3);margin-left:auto", children: wk.logLabel })
    ] }),
    /* @__PURE__ */ u3("div", { class: "pw-body" + (wk.isOpen ? " open" : ""), children: wk.isOpen ? wk.days && wk.days.length ? /* @__PURE__ */ u3(S, { children: [
      /* @__PURE__ */ u3(Html, { html: wk.rhythmHtml }),
      wk.days.map((day) => /* @__PURE__ */ u3(DayCard, { day, drag, setDrag, over, setOver, reorder: a3.reorder }, day.dateIso))
    ] }) : /* @__PURE__ */ u3("div", { class: "pw-ex-row", style: "color:var(--text3)", children: wk.emptyReason }) : null })
  ] });
}
function PlanView(props) {
  const a3 = props.actions;
  const c3 = props.context;
  const hm = props.heatmap;
  const ws = props.women;
  const [drag, setDrag] = d2(null);
  const [over, setOver] = d2(null);
  return /* @__PURE__ */ u3("div", { class: "plan-root", children: [
    /* @__PURE__ */ u3("div", { class: "section", children: [
      /* @__PURE__ */ u3("div", { class: "row", style: "justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px", children: [
        /* @__PURE__ */ u3("h2", { style: "font-size:18px;font-weight:600;letter-spacing:-0.02em", children: "Thirteen-week block" }),
        /* @__PURE__ */ u3("div", { class: "row", style: "gap:8px;align-items:center", children: [
          /* @__PURE__ */ u3("span", { style: "font-size:12px;color:var(--text3)", children: "Loads follow your logs" }),
          /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm btn-ghost", id: "plan-compact-toggle", onClick: () => a3.toggleCompact(), children: props.toggleLabel })
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { class: "plan-context-card card section", children: /* @__PURE__ */ u3("div", { class: "plan-context-inner", children: [
        /* @__PURE__ */ u3("div", { children: [
          /* @__PURE__ */ u3("div", { class: "plan-context-kicker", children: "You are here" }),
          /* @__PURE__ */ u3("div", { class: "plan-context-title", children: [
            "Week ",
            c3.week,
            " of 13 \xB7 ",
            c3.phaseName
          ] }),
          /* @__PURE__ */ u3("div", { class: "plan-context-sub", children: [
            c3.slots,
            " session",
            c3.slotsPlural ? "s" : "",
            " per training week \xB7 bar loads follow your logs"
          ] })
        ] }),
        /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-secondary-solid btn-sm", id: "plan-jump-current", onClick: () => a3.jumpCurrent(), children: "Open this week" })
      ] }) }),
      /* @__PURE__ */ u3(Html, { html: props.anchorSummaryHtml }),
      ws ? /* @__PURE__ */ u3("div", { class: "card plan-hide-women", style: "margin-bottom:10px;border-left:3px solid var(--mint)", children: [
        /* @__PURE__ */ u3("div", { class: "card-h", children: [
          /* @__PURE__ */ u3("h2", { children: "Women's Program Summary" }),
          /* @__PURE__ */ u3("span", { class: "badge badge-mint", children: ws.label })
        ] }),
        /* @__PURE__ */ u3("div", { style: "font-size:12px;color:var(--text2);margin-bottom:8px", children: [
          "Baseline: ",
          /* @__PURE__ */ u3("b", { style: "color:var(--text)", children: ws.tier }),
          " \xB7 Life stage: ",
          /* @__PURE__ */ u3("b", { style: "color:var(--text)", children: ws.life }),
          " \xB7 Equipment: ",
          /* @__PURE__ */ u3("b", { style: "color:var(--text)", children: ws.eq }),
          " \xB7 Session style: ",
          /* @__PURE__ */ u3("b", { style: "color:var(--text)", children: ws.style })
        ] }),
        /* @__PURE__ */ u3("div", { style: "display:grid;gap:4px", children: ws.tracks.map((t3, i4) => /* @__PURE__ */ u3("div", { style: "font-size:11px;color:var(--text2)", children: [
          "\u2022 ",
          t3
        ] }, i4)) }),
        ws.fa.length ? /* @__PURE__ */ u3("div", { style: "margin-top:8px;font-size:10px;color:var(--text3)", children: [
          "Goals: ",
          ws.fa.join(" \xB7 ")
        ] }) : null
      ] }) : null,
      /* @__PURE__ */ u3("div", { class: "card plan-hide-women", style: "margin-bottom:10px", children: [
        /* @__PURE__ */ u3("div", { class: "card-h", children: /* @__PURE__ */ u3("h2", { children: "Expected Changes Heatmap" }) }),
        /* @__PURE__ */ u3("div", { class: "row", style: "gap:14px", children: [
          /* @__PURE__ */ u3("div", { style: "font-size:11px;color:var(--text2)", children: [
            "Glutes ",
            /* @__PURE__ */ u3("b", { style: "color:var(--mint)", children: [
              hm.glutes,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ u3("div", { style: "font-size:11px;color:var(--text2)", children: [
            "Core ",
            /* @__PURE__ */ u3("b", { style: "color:var(--mint)", children: [
              hm.core,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ u3("div", { style: "font-size:11px;color:var(--text2)", children: [
            "Back ",
            /* @__PURE__ */ u3("b", { style: "color:var(--mint)", children: [
              hm.back,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ u3("div", { style: "font-size:11px;color:var(--text2)", children: [
            "Posture ",
            /* @__PURE__ */ u3("b", { style: "color:var(--mint)", children: [
              hm.posture,
              "%"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { class: "plan-timeline-wrap plan-hide-women", children: [
        /* @__PURE__ */ u3("div", { class: "timeline", role: "list", "aria-label": "Training weeks 1 to 13", children: props.timeline.map((t3) => /* @__PURE__ */ u3(
          "div",
          {
            class: `tl-wk ${t3.phaseClass} ${t3.current ? "current" : ""} ${t3.complete ? "complete" : ""}`,
            "data-w": t3.week,
            role: "listitem",
            title: `Week ${t3.week} \xB7 ${t3.phaseName}${t3.deload ? " \xB7 Deload" : ""}`,
            onClick: () => a3.selectWeek(t3.week),
            children: t3.week
          },
          t3.week
        )) }),
        /* @__PURE__ */ u3("p", { class: "plan-timeline-hint", children: "Tap a number to expand that week \xB7 color = phase (legend below)." })
      ] }),
      /* @__PURE__ */ u3("p", { class: "plan-hide-women", style: "font-size:11px;color:var(--text3);margin:8px 0 0;line-height:1.45", children: [
        "Weeks are ",
        /* @__PURE__ */ u3("b", { style: "color:var(--text2)", children: "training weeks" }),
        " (",
        c3.slots,
        " session",
        c3.slotsPlural ? "s" : "",
        " each, in order from your start date \u2014 not Mon\u2013Sun buckets)."
      ] }),
      /* @__PURE__ */ u3("details", { class: "plan-phase-legend card section plan-hide-women", children: [
        /* @__PURE__ */ u3("summary", { class: "plan-phase-legend-sum", children: "How phase colors work" }),
        /* @__PURE__ */ u3("p", { class: "plan-phase-legend-note", children: [
          "Weeks ",
          /* @__PURE__ */ u3("b", { children: "4" }),
          " and ",
          /* @__PURE__ */ u3("b", { children: "8" }),
          " are deloads inside Hypertrophy and Strength. Week ",
          /* @__PURE__ */ u3("b", { children: "13" }),
          " is test / consolidation."
        ] }),
        /* @__PURE__ */ u3("ul", { class: "plan-phase-legend-list", children: [
          /* @__PURE__ */ u3("li", { children: [
            /* @__PURE__ */ u3("span", { class: "plan-phase-swatch tl-wk phase-hyp", "aria-hidden": "true" }),
            " Hypertrophy \u2014 weeks 1\u20134"
          ] }),
          /* @__PURE__ */ u3("li", { children: [
            /* @__PURE__ */ u3("span", { class: "plan-phase-swatch tl-wk phase-str", "aria-hidden": "true" }),
            " Strength \u2014 weeks 5\u20138"
          ] }),
          /* @__PURE__ */ u3("li", { children: [
            /* @__PURE__ */ u3("span", { class: "plan-phase-swatch tl-wk phase-peak", "aria-hidden": "true" }),
            " Peak \u2014 weeks 9\u201312"
          ] }),
          /* @__PURE__ */ u3("li", { children: [
            /* @__PURE__ */ u3("span", { class: "plan-phase-swatch tl-wk phase-test", "aria-hidden": "true" }),
            " Test \u2014 week 13"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u3(Html, { html: props.nextDotsHtml })
    ] }),
    /* @__PURE__ */ u3("div", { class: "stack", id: "pw-list", children: props.weeks.map((wk) => /* @__PURE__ */ u3(WeekCard, { wk, drag, setDrag, over, setOver, a: a3 }, wk.week)) })
  ] });
}
function mountPlan(container, props) {
  R(/* @__PURE__ */ u3(PlanView, { ...props }), container);
}

// src/ui/exercise-card.tsx
function Html2({ html }) {
  return /* @__PURE__ */ u3("div", { style: "display:contents", dangerouslySetInnerHTML: { __html: html } });
}
function Stepper({ id, value, delta, min, step, label, repLab, onStep }) {
  return /* @__PURE__ */ u3("div", { children: [
    /* @__PURE__ */ u3("label", { children: label ?? repLab }),
    /* @__PURE__ */ u3("div", { class: "stepper", children: [
      /* @__PURE__ */ u3("button", { type: "button", class: "step-btn", "data-target": id, "data-delta": -delta, onClick: (e3) => onStep(e3.currentTarget), children: "\u2212" }),
      /* @__PURE__ */ u3("input", { type: "number", class: "input-sm", id, value, min, step }),
      /* @__PURE__ */ u3("button", { type: "button", class: "step-btn", "data-target": id, "data-delta": delta, onClick: (e3) => onStep(e3.currentTarget), children: "+" })
    ] })
  ] });
}
function LoadCol({ id, val, wStep, unit, i: i4, onStep }) {
  return /* @__PURE__ */ u3("div", { children: [
    /* @__PURE__ */ u3("label", { children: [
      "Load (",
      unit,
      ")"
    ] }),
    /* @__PURE__ */ u3("div", { class: "stepper", children: [
      /* @__PURE__ */ u3("button", { type: "button", class: "step-btn", "data-target": id, "data-delta": -wStep, onClick: (e3) => onStep(e3.currentTarget), children: "\u2212" }),
      /* @__PURE__ */ u3("input", { type: "number", class: "input-sm", id, value: val, min: "0", step: "any" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "step-btn", "data-target": id, "data-delta": wStep, onClick: (e3) => onStep(e3.currentTarget), children: "+" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "icon-btn q-load-helper", "data-i": i4, title: "Open bar load helper", "aria-label": "Open bar load helper for load", children: "\u{1F3CB}\uFE0F" })
    ] })
  ] });
}
function PaceCol({ id, val }) {
  return /* @__PURE__ */ u3("div", { children: [
    /* @__PURE__ */ u3("label", { children: "Pace (mm:ss/mi)" }),
    /* @__PURE__ */ u3("input", { type: "text", class: "input-sm input-mmss", id, value: val, placeholder: "8:42", inputmode: "numeric", autocomplete: "off", spellcheck: false, "aria-label": "Pace per mile" })
  ] });
}
function OutcomeSelect({ id }) {
  return /* @__PURE__ */ u3("div", { children: [
    /* @__PURE__ */ u3("label", { children: "Outcome" }),
    /* @__PURE__ */ u3("select", { id, class: "input-sm", children: [
      /* @__PURE__ */ u3("option", { value: "ok", children: "Completed" }),
      /* @__PURE__ */ u3("option", { value: "fail", children: "Failed rep target" }),
      /* @__PURE__ */ u3("option", { value: "time", children: "Time-capped" })
    ] })
  ] });
}
function ExerciseCard(p3) {
  const { i: i4, unit } = p3;
  const a3 = p3.actions;
  return /* @__PURE__ */ u3("div", { class: "ex-card" + (p3.done ? " ex-done" : ""), id: "exc-" + i4, "data-eid": p3.eid, children: [
    /* @__PURE__ */ u3("div", { class: "ex-top ex-top-row", children: [
      /* @__PURE__ */ u3("div", { class: "ex-check", children: p3.done ? "\u2713" : "" }),
      /* @__PURE__ */ u3("div", { class: "ex-num", children: p3.num }),
      /* @__PURE__ */ u3("div", { class: "ex-info", children: [
        /* @__PURE__ */ u3("div", { class: "ex-name-lg", children: p3.exNm }),
        /* @__PURE__ */ u3("div", { class: "ex-rx-lg", children: p3.rxText }),
        /* @__PURE__ */ u3(Html2, { html: p3.plateMathHtml }),
        p3.lastLine ? /* @__PURE__ */ u3("div", { class: "ex-last-inline", style: "font-size:11px;color:var(--ice);margin-top:2px", children: p3.lastLine }) : null,
        /* @__PURE__ */ u3(Html2, { html: p3.ghostHtml }),
        /* @__PURE__ */ u3("div", { class: "ex-reason", children: p3.reason }),
        /* @__PURE__ */ u3(Html2, { html: p3.cueRowHtml })
      ] }),
      /* @__PURE__ */ u3("div", { class: "ex-actions ex-actions-stack", children: [
        /* @__PURE__ */ u3("div", { class: "ex-actions-primary", children: [
          /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm btn-secondary-solid ex-rest", "data-i": i4, title: `Rest timer (${p3.restTitle})`, onClick: (e3) => a3.rest(e3.currentTarget), children: [
            "Rest \xB7 ",
            p3.restHuman
          ] }),
          /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm btn-cta ex-toggle", "data-i": i4, onClick: (e3) => a3.toggleBody(e3.currentTarget), children: "Details & video" })
        ] }),
        /* @__PURE__ */ u3("div", { class: "ex-actions-secondary", children: [
          /* @__PURE__ */ u3("button", { type: "button", class: "ex-link-btn ex-skip", "data-eid": p3.eid, title: "Remove from today's checklist", onClick: (e3) => a3.skip(e3.currentTarget), children: "Skip" }),
          /* @__PURE__ */ u3("span", { class: "ex-actions-sep", "aria-hidden": "true", children: "\xB7" }),
          /* @__PURE__ */ u3("button", { type: "button", class: "ex-link-btn ex-swap", "data-orig": p3.originalEid, title: "Replace with a similar movement", children: "Swap" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ex-body", id: "exb-" + i4, children: [
      /* @__PURE__ */ u3("div", { class: "ex-video", children: [
        /* @__PURE__ */ u3(Html2, { html: p3.mainVideoHtml }),
        /* @__PURE__ */ u3(Html2, { html: p3.quickVideoHtml })
      ] }),
      /* @__PURE__ */ u3(Html2, { html: p3.howBlockHtml }),
      /* @__PURE__ */ u3("div", { class: "fig-wrap", children: [
        /* @__PURE__ */ u3("div", { class: "fig-title", children: "Muscle emphasis" }),
        /* @__PURE__ */ u3(Html2, { html: p3.anatomyHtml }),
        /* @__PURE__ */ u3("div", { class: "fig-legend", children: [
          /* @__PURE__ */ u3("span", { children: [
            /* @__PURE__ */ u3("span", { class: "dot", style: "background:#00e676;opacity:1" }),
            "Primary"
          ] }),
          /* @__PURE__ */ u3("span", { children: [
            /* @__PURE__ */ u3("span", { class: "dot", style: "background:#00e676;opacity:.72" }),
            "Secondary"
          ] }),
          /* @__PURE__ */ u3("span", { children: [
            /* @__PURE__ */ u3("span", { class: "dot", style: "background:#00e676;opacity:.45" }),
            "Tertiary"
          ] }),
          /* @__PURE__ */ u3("span", { children: [
            /* @__PURE__ */ u3("span", { class: "dot", style: "background:#ff6b35;opacity:.65" }),
            "Burn"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { class: "feel-chips", children: [
        /* @__PURE__ */ u3("span", { children: p3.feelLead }),
        /* @__PURE__ */ u3("button", { type: "button", class: "feel-chip", "data-feel": "easy", "data-i": i4, onClick: (e3) => a3.feelClick(e3.currentTarget), children: "Too easy (RPE < 7)" }),
        /* @__PURE__ */ u3("button", { type: "button", class: "feel-chip on", "data-feel": "ok", "data-i": i4, onClick: (e3) => a3.feelClick(e3.currentTarget), children: "Just right (RPE 7-8)" }),
        /* @__PURE__ */ u3("button", { type: "button", class: "feel-chip", "data-feel": "hard", "data-i": i4, onClick: (e3) => a3.feelClick(e3.currentTarget), children: "Too hard (RPE 9+)" })
      ] }),
      /* @__PURE__ */ u3(Html2, { html: p3.runRpeSelectHtml }),
      /* @__PURE__ */ u3("div", { class: "ex-note-wrap", children: [
        /* @__PURE__ */ u3("label", { class: "ex-note-label", children: [
          "My notes for ",
          p3.exNm
        ] }),
        /* @__PURE__ */ u3("textarea", { class: "ex-note-input", "data-eid": p3.eid, placeholder: "Cues, grip width, stance notes\u2026", rows: 2, maxlength: 500, value: p3.savedNote, onInput: (e3) => a3.noteInput(e3.currentTarget) }),
        p3.savedNote ? /* @__PURE__ */ u3("span", { class: "ex-note-saved", children: "Saved" }) : null
      ] }),
      /* @__PURE__ */ u3("div", { class: "quick-log-row", children: [
        /* @__PURE__ */ u3("span", { class: "quick-set-indicator", id: "tq-set-lbl" + i4, style: "font-size:11px;color:var(--text3);align-self:center", children: [
          "Set ",
          p3.activeSet,
          " of ",
          p3.sets
        ] }),
        /* @__PURE__ */ u3(Stepper, { id: "tq-r" + i4, value: p3.reps, delta: 1, min: 1, repLab: p3.repLab, onStep: a3.step }),
        p3.runEx ? /* @__PURE__ */ u3(PaceCol, { id: "tq-w" + i4, val: p3.quickWVal }) : /* @__PURE__ */ u3(LoadCol, { id: "tq-w" + i4, val: p3.quickWVal, wStep: p3.wStep, unit, i: i4, onStep: a3.step }),
        /* @__PURE__ */ u3(OutcomeSelect, { id: "tq-o" + i4 }),
        p3.runEx && p3.hasShoe ? /* @__PURE__ */ u3("div", { id: "shoe-pick-" + i4, children: /* @__PURE__ */ u3(Html2, { html: p3.shoeHtml }) }) : null,
        /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta btn-block q-save", "data-i": i4, onClick: (e3) => a3.logSet(e3.currentTarget), children: "Complete set & start rest" })
      ] }),
      /* @__PURE__ */ u3("details", { class: "ex-logall-details", style: "margin-top:6px", children: [
        /* @__PURE__ */ u3("summary", { style: "font-size:11px;color:var(--text3);cursor:pointer", children: "Log all sets at once" }),
        /* @__PURE__ */ u3("div", { class: "ex-log-grid", style: "margin-top:8px", children: [
          /* @__PURE__ */ u3(Stepper, { id: "t-s" + i4, value: p3.sets, delta: 1, min: 1, label: "Sets", onStep: a3.step }),
          /* @__PURE__ */ u3(Stepper, { id: "t-r" + i4, value: p3.reps, delta: 1, min: 1, repLab: p3.repLab, onStep: a3.step }),
          p3.runEx ? /* @__PURE__ */ u3(PaceCol, { id: "t-w" + i4, val: p3.gridWVal }) : /* @__PURE__ */ u3(LoadCol, { id: "t-w" + i4, val: p3.gridWVal, wStep: p3.wStep, unit, i: i4, onStep: a3.step }),
          /* @__PURE__ */ u3(OutcomeSelect, { id: "t-o" + i4 }),
          /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm btn-secondary-solid ex-copyprev", "data-i": i4, onClick: (e3) => a3.copyPrev(e3.currentTarget), children: "Copy previous set" }),
          /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta btn-sm ex-save", "data-i": i4, onClick: (e3) => a3.saveAll(e3.currentTarget), children: "Save all" })
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { id: "expdf-" + i4, class: "ex-pdf-area" })
    ] })
  ] });
}
function mountExerciseCard(container, props) {
  R(/* @__PURE__ */ u3(ExerciseCard, { ...props }), container);
}
export {
  ExerciseCard,
  PlanView,
  ProfileSettings,
  SocialView,
  mountExerciseCard,
  mountPlan,
  mountProfileSettings,
  mountSocial
};
