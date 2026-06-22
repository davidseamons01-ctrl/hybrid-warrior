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
  var s3, h3, p3, v3, y3, _2, g2, m3 = t3 && t3.__k || w, b2 = l3.length;
  for (f4 = T(u4, l3, m3, f4, b2), s3 = 0; s3 < b2; s3++) null != (p3 = u4.__k[s3]) && (h3 = -1 != p3.__i && m3[p3.__i] || d, p3.__i = s3, _2 = q(n2, p3, h3, i4, r3, o3, e3, f4, c3, a3), v3 = p3.__e, p3.ref && h3.ref != p3.ref && (h3.ref && J(h3.ref, null, p3), a3.push(p3.ref, p3.__c || v3, p3)), null == y3 && null != v3 && (y3 = v3), (g2 = !!(4 & p3.__u)) || h3.__k === p3.__k ? (f4 = j(p3, f4, n2, g2), g2 && h3.__e && (h3.__e = null)) : "function" == typeof p3.type && void 0 !== _2 ? f4 = _2 : v3 && (f4 = v3.nextSibling), p3.__u &= -7);
  return u4.__e = y3, f4;
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
  var s3, h3, p3, v3, y3, d3, _2, k3, x2, M, $2, I2, P2, A3, H2, T3 = u4.type;
  if (void 0 !== u4.constructor) return null;
  128 & t3.__u && (c3 = !!(32 & t3.__u), o3 = [f4 = u4.__e = t3.__e]), (s3 = l.__b) && s3(u4);
  n: if ("function" == typeof T3) try {
    if (k3 = u4.props, x2 = T3.prototype && T3.prototype.render, M = (s3 = T3.contextType) && i4[s3.__c], $2 = s3 ? M ? M.props.value : s3.__ : i4, t3.__c ? _2 = (h3 = u4.__c = t3.__c).__ = h3.__E : (x2 ? u4.__c = h3 = new T3(k3, $2) : (u4.__c = h3 = new C(k3, $2), h3.constructor = T3, h3.render = Q), M && M.sub(h3), h3.state || (h3.state = {}), h3.__n = i4, p3 = h3.__d = true, h3.__h = [], h3._sb = []), x2 && null == h3.__s && (h3.__s = h3.state), x2 && null != T3.getDerivedStateFromProps && (h3.__s == h3.state && (h3.__s = m({}, h3.__s)), m(h3.__s, T3.getDerivedStateFromProps(k3, h3.__s))), v3 = h3.props, y3 = h3.state, h3.__v = u4, p3) x2 && null == T3.getDerivedStateFromProps && null != h3.componentWillMount && h3.componentWillMount(), x2 && null != h3.componentDidMount && h3.__h.push(h3.componentDidMount);
    else {
      if (x2 && null == T3.getDerivedStateFromProps && k3 !== v3 && null != h3.componentWillReceiveProps && h3.componentWillReceiveProps(k3, $2), u4.__v == t3.__v || !h3.__e && null != h3.shouldComponentUpdate && false === h3.shouldComponentUpdate(k3, h3.__s, $2)) {
        u4.__v != t3.__v && (h3.props = k3, h3.state = h3.__s, h3.__d = false), u4.__e = t3.__e, u4.__k = t3.__k, u4.__k.some(function(n3) {
          n3 && (n3.__ = u4);
        }), w.push.apply(h3.__h, h3._sb), h3._sb = [], h3.__h.length && e3.push(h3);
        break n;
      }
      null != h3.componentWillUpdate && h3.componentWillUpdate(k3, h3.__s, $2), x2 && null != h3.componentDidUpdate && h3.__h.push(function() {
        h3.componentDidUpdate(v3, y3, d3);
      });
    }
    if (h3.context = $2, h3.props = k3, h3.__P = n2, h3.__e = false, I2 = l.__r, P2 = 0, x2) h3.state = h3.__s, h3.__d = false, I2 && I2(u4), s3 = h3.render(h3.props, h3.state, h3.context), w.push.apply(h3.__h, h3._sb), h3._sb = [];
    else do {
      h3.__d = false, I2 && I2(u4), s3 = h3.render(h3.props, h3.state, h3.context), h3.state = h3.__s;
    } while (h3.__d && ++P2 < 25);
    h3.state = h3.__s, null != h3.getChildContext && (i4 = m(m({}, i4), h3.getChildContext())), x2 && !p3 && null != h3.getSnapshotBeforeUpdate && (d3 = h3.getSnapshotBeforeUpdate(v3, y3)), A3 = null != s3 && s3.type === S && null == s3.key ? E(s3.props.children) : s3, f4 = L(n2, g(A3) ? A3 : [A3], u4, t3, i4, r3, o3, e3, f4, c3, a3), h3.base = u4.__e, u4.__u &= -161, h3.__h.length && e3.push(h3), _2 && (h3.__E = h3.__ = null);
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
  var s3, h3, p3, v3, y3, w3, _2, m3 = i4.props || d, k3 = t3.props, x2 = t3.type;
  if ("svg" == x2 ? o3 = "http://www.w3.org/2000/svg" : "math" == x2 ? o3 = "http://www.w3.org/1998/Math/MathML" : o3 || (o3 = "http://www.w3.org/1999/xhtml"), null != e3) {
    for (s3 = 0; s3 < e3.length; s3++) if ((y3 = e3[s3]) && "setAttribute" in y3 == !!x2 && (x2 ? y3.localName == x2 : 3 == y3.nodeType)) {
      u4 = y3, e3[s3] = null;
      break;
    }
  }
  if (null == u4) {
    if (null == x2) return document.createTextNode(k3);
    u4 = document.createElementNS(o3, x2, k3.is && k3), c3 && (l.__m && l.__m(t3, e3), c3 = false), e3 = null;
  }
  if (null == x2) m3 === k3 || c3 && u4.data == k3 || (u4.data = k3);
  else {
    if (e3 = "textarea" == x2 && null != k3.defaultValue ? null : e3 && n.call(u4.childNodes), !c3 && null != e3) for (m3 = {}, s3 = 0; s3 < u4.attributes.length; s3++) m3[(y3 = u4.attributes[s3]).name] = y3.value;
    for (s3 in m3) y3 = m3[s3], "dangerouslySetInnerHTML" == s3 ? p3 = y3 : "children" == s3 || s3 in k3 || "value" == s3 && "defaultValue" in k3 || "checked" == s3 && "defaultChecked" in k3 || N(u4, s3, null, y3, o3);
    for (s3 in k3) y3 = k3[s3], "children" == s3 ? v3 = y3 : "dangerouslySetInnerHTML" == s3 ? h3 = y3 : "value" == s3 ? w3 = y3 : "checked" == s3 ? _2 = y3 : c3 && "function" != typeof y3 || m3[s3] === y3 || N(u4, s3, y3, m3[s3], o3);
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
function y2(n2, u4) {
  var i4 = p2(t2++, 3);
  !c2.__s && C2(i4.__H, u4) && (i4.__ = n2, i4.u = u4, r2.__H.__h.push(i4));
}
function A2(n2) {
  return o2 = 5, T2(function() {
    return { current: n2 };
  }, []);
}
function T2(n2, r3) {
  var u4 = p2(t2++, 7);
  return C2(u4.__H, r3) && (u4.__ = n2(), u4.__H = r3, u4.__h = n2), u4.__;
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
function C2(n2, t3) {
  return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {
    return t4 !== n2[r3];
  });
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
    /* @__PURE__ */ u3(
      Toggle,
      {
        id: "s-share-maxes",
        checked: f4.shareMaxes,
        title: "Share maxes with gym partners",
        desc: "let people you lift with see your strength numbers so shared lifts auto-scale to each person. Off = partners do a quick calibration set instead.",
        onChange: (v3) => set("shareMaxes", v3)
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
          /* @__PURE__ */ u3("span", { dangerouslySetInnerHTML: { __html: ex.rx } })
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
function RunExtra({ distId, hrId }) {
  return /* @__PURE__ */ u3(S, { children: [
    /* @__PURE__ */ u3("div", { class: "run-extra-col", children: [
      /* @__PURE__ */ u3("label", { children: "Distance (mi)" }),
      /* @__PURE__ */ u3("input", { type: "number", class: "input-sm", id: distId, min: "0", step: "0.01", inputmode: "decimal", placeholder: "3.0", "aria-label": "Distance in miles" })
    ] }),
    /* @__PURE__ */ u3("div", { class: "run-extra-col", children: [
      /* @__PURE__ */ u3("label", { children: "Avg HR" }),
      /* @__PURE__ */ u3("input", { type: "number", class: "input-sm", id: hrId, min: "0", step: "1", inputmode: "numeric", placeholder: "bpm", "aria-label": "Average heart rate" })
    ] })
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
        /* @__PURE__ */ u3("div", { class: "ex-rx-lg", dangerouslySetInnerHTML: { __html: p3.rxText } }),
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
      p3.benchmark ? /* @__PURE__ */ u3("div", { class: "ex-benchmark", children: [
        /* @__PURE__ */ u3("p", { class: "ex-benchmark-note", children: "Complete the test, then log your result to recalculate your pace zones." }),
        /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta btn-block ex-bench-log", "data-kind": p3.benchmark, onClick: () => a3.benchmarkLog(p3.benchmark), children: "\u{1F4C8} Log result & set my pace zones" })
      ] }) : /* @__PURE__ */ u3(S, { children: [
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
          p3.runEx ? /* @__PURE__ */ u3(RunExtra, { distId: "tq-dist" + i4, hrId: "tq-hr" + i4 }) : null,
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
            p3.runEx ? /* @__PURE__ */ u3(RunExtra, { distId: "t-dist" + i4, hrId: "t-hr" + i4 }) : null,
            /* @__PURE__ */ u3(OutcomeSelect, { id: "t-o" + i4 }),
            /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm btn-secondary-solid ex-copyprev", "data-i": i4, onClick: (e3) => a3.copyPrev(e3.currentTarget), children: "Copy previous set" }),
            /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta btn-sm ex-save", "data-i": i4, onClick: (e3) => a3.saveAll(e3.currentTarget), children: "Save all" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u3("div", { id: "expdf-" + i4, class: "ex-pdf-area" })
    ] })
  ] });
}
function mountExerciseCard(container, props) {
  R(/* @__PURE__ */ u3(ExerciseCard, { ...props }), container);
}

// src/ui/session-cards.tsx
function ReadinessCard({ readiness, onSelect }) {
  const Btn = ({ v: v3, emoji, label, on }) => /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm readiness-btn" + (on ? " readiness-on" : ""), "data-ready": v3, onClick: () => onSelect(v3), children: [
    /* @__PURE__ */ u3("span", { style: "font-size:15px", children: emoji }),
    " ",
    label
  ] });
  return /* @__PURE__ */ u3("div", { class: "card section readiness-card", children: [
    /* @__PURE__ */ u3("div", { style: "font-size:13px;font-weight:600;margin-bottom:6px", children: "How are you feeling?" }),
    /* @__PURE__ */ u3("div", { class: "readiness-row", children: [
      /* @__PURE__ */ u3(Btn, { v: "strong", emoji: "\u{1F4AA}", label: "Strong", on: readiness === "strong" }),
      /* @__PURE__ */ u3(Btn, { v: "normal", emoji: "\u{1F44D}", label: "Normal", on: readiness === "normal" || !readiness }),
      /* @__PURE__ */ u3(Btn, { v: "fatigued", emoji: "\u{1F634}", label: "Fatigued", on: readiness === "fatigued" })
    ] }),
    readiness === "fatigued" ? /* @__PURE__ */ u3("p", { style: "font-size:11px;color:var(--gold);margin-top:8px;line-height:1.45", children: "Loads eased ~5% for this session only \u2014 your program stays intact." }) : readiness === "strong" ? /* @__PURE__ */ u3("p", { style: "font-size:11px;color:var(--mint);margin-top:8px;line-height:1.45", children: "Targets nudged up ~3% \u2014 push it today." }) : null
  ] });
}
function mountReadinessCard(container, props) {
  R(/* @__PURE__ */ u3(ReadinessCard, { ...props }), container);
}
function SessionFeelCard({ sf, savedLbl, finalized, dayIso, onFeel, onClear }) {
  const FBtn = ({ v: v3, label }) => /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm " + (sf === v3 ? "btn-fire" : "btn-secondary-solid"), "data-sfeel": v3, onClick: () => onFeel(v3), children: label });
  return /* @__PURE__ */ u3("div", { class: "card section", id: "session-after-card", children: [
    /* @__PURE__ */ u3("div", { style: "font-size:13px;font-weight:600;margin-bottom:4px", children: "Rate intensity" }),
    /* @__PURE__ */ u3("p", { style: "font-size:11px;color:var(--text3);margin-bottom:10px;line-height:1.45", children: [
      "Rough session RPE \u2014 pairs with ",
      /* @__PURE__ */ u3("b", { style: "color:var(--text)", children: "Complete session" }),
      " below so tomorrow's targets stay honest."
    ] }),
    sf ? /* @__PURE__ */ u3("div", { style: "font-size:12px;color:var(--mint);margin-bottom:6px", children: [
      "Saved: ",
      /* @__PURE__ */ u3("b", { children: savedLbl })
    ] }) : null,
    /* @__PURE__ */ u3("div", { class: "row", style: "flex-wrap:wrap;gap:8px", children: [
      /* @__PURE__ */ u3(FBtn, { v: "easy", label: "Light \xB7 ~RPE 6" }),
      /* @__PURE__ */ u3(FBtn, { v: "ok", label: "Solid \xB7 ~RPE 7\u20138" }),
      /* @__PURE__ */ u3(FBtn, { v: "hard", label: "Hard \xB7 ~RPE 9+" }),
      sf ? /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm btn-ghost", id: "sfeel-clear", onClick: () => onClear(), children: "Clear" }) : null
    ] }),
    finalized ? /* @__PURE__ */ u3("p", { style: "font-size:11px;color:var(--mint);margin-top:10px;margin-bottom:0", children: [
      "Adaptation applied for ",
      dayIso,
      "."
    ] }) : /* @__PURE__ */ u3("p", { style: "font-size:11px;color:var(--text3);margin-top:10px;margin-bottom:0", children: "When you're done lifting, tap Complete session in the bar below." })
  ] });
}
function mountSessionFeelCard(container, props) {
  R(/* @__PURE__ */ u3(SessionFeelCard, { ...props }), container);
}
function WarmupChecklist({ mode, items, text, onToggle }) {
  if (mode === "text") {
    return /* @__PURE__ */ u3("div", { class: "card section", style: "border-left:3px solid var(--ice)", children: [
      /* @__PURE__ */ u3("div", { style: "font-size:11px;font-weight:700;color:var(--ice);margin-bottom:4px", children: "Warm-up" }),
      /* @__PURE__ */ u3("div", { style: "font-size:12px;color:var(--text2)", children: text })
    ] });
  }
  return /* @__PURE__ */ u3("div", { class: "card section wu-card", style: "border-left:3px solid var(--ice)", children: [
    /* @__PURE__ */ u3("div", { style: "font-size:11px;font-weight:700;color:var(--ice);margin-bottom:8px", children: "Warm-up checklist" }),
    /* @__PURE__ */ u3("ul", { class: "wu-list", children: items.map((it) => /* @__PURE__ */ u3("li", { class: "wu-item", children: /* @__PURE__ */ u3("label", { class: "wu-label", children: [
      /* @__PURE__ */ u3("input", { type: "checkbox", class: "wu-step-cb", "data-wu-idx": it.idx, checked: it.checked, onChange: (e3) => onToggle(it.idx, e3.target.checked) }),
      /* @__PURE__ */ u3("span", { class: "wu-text", children: it.line })
    ] }) }, it.idx)) })
  ] });
}
function mountWarmupChecklist(container, props) {
  R(/* @__PURE__ */ u3(WarmupChecklist, { ...props }), container);
}

// src/ui/workout-tools.tsx
function WorkoutTools({ eqHome, qmOn, actions: a3 }) {
  return /* @__PURE__ */ u3("details", { class: "train-tools section", children: [
    /* @__PURE__ */ u3("summary", { class: "train-tools-summary", children: "Workout tools" }),
    /* @__PURE__ */ u3("div", { class: "train-tools-body", children: [
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-secondary-solid" + (eqHome ? " btn-fire" : ""), id: "train-eq-toggle", onClick: () => a3.eqToggle(), children: eqHome ? "Equipment: Home" : "Equipment: Gym" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-secondary-solid" + (qmOn ? " btn-fire" : ""), id: "train-quick", onClick: () => a3.quickToggle(), children: qmOn ? "15-min mode on" : "Minimum session (~15 min)" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost", id: "train-open-plates", onClick: () => a3.openPlates(), children: "Plate helper" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost", id: "train-open-health", onClick: () => a3.openHealth(), children: "Health metrics" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost", id: "train-open-ease", onClick: () => a3.openEase(), children: "Ease load\u2026" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost btn-sm", id: "train-adjust-schedule", title: "Re-open choices for missed sessions", children: "Adjust schedule" }),
      /* @__PURE__ */ u3("div", { class: "caffeine-timer-row", children: [
        /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-secondary-solid btn-sm", id: "caffeine-start", onClick: (e3) => a3.caffeineToggle(e3.currentTarget), children: "\u2615 Pre-workout (45 min)" }),
        /* @__PURE__ */ u3("span", { id: "caffeine-time", class: "caffeine-time-label" })
      ] })
    ] })
  ] });
}
function mountWorkoutToolsCard(container, props) {
  R(/* @__PURE__ */ u3(WorkoutTools, { ...props }), container);
}

// src/ui/focus-shell.tsx
var BLOCK_SEL = "button,a,input,select,textarea,label,iframe,.ex-log-grid,.quick-log-row,.feel-chips";
function FocusShell(p3) {
  const a3 = p3.actions;
  const n2 = p3.n, idx = p3.idx, tx = -(idx * 100) / n2;
  const sx = A2(null);
  return /* @__PURE__ */ u3("div", { id: "p-today", class: "train-focus-mode train-session-active", children: [
    p3.showClearDate ? /* @__PURE__ */ u3("div", { class: "session-banner", role: "status", children: [
      /* @__PURE__ */ u3("span", { children: [
        "Viewing ",
        /* @__PURE__ */ u3("b", { style: "color:var(--text)", children: p3.trainSessionDate }),
        " \u2014 not today on the calendar."
      ] }),
      " ",
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-sm btn-secondary-solid", id: "train-clear-date", children: "Back to today" })
    ] }) : null,
    p3.showCatchBanner ? /* @__PURE__ */ u3("div", { class: "session-banner", role: "status", children: "Catch-up session loaded \u2014 this is the workout that moved from a missed day. Log when done; the queue clears after you train." }) : null,
    /* @__PURE__ */ u3("div", { class: "focus-session-bar", children: [
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost btn-sm", id: "focus-exit", onClick: () => a3.exit(), children: "\u2190 Full session" }),
      /* @__PURE__ */ u3("span", { class: "focus-session-title", children: "Focused workout" }),
      /* @__PURE__ */ u3("div", { class: "focus-session-dots-wrap", "aria-label": "Exercise pagination", role: "status", children: /* @__PURE__ */ u3("div", { class: "focus-session-dots", children: Array.from({ length: n2 }, (_2, i4) => /* @__PURE__ */ u3("span", { class: i4 === idx ? "on" : "", title: `Exercise ${i4 + 1} of ${n2}` }, i4)) }) })
    ] }),
    /* @__PURE__ */ u3("div", { class: "hero-title", style: "font-size:17px;margin-bottom:2px", children: p3.day }),
    /* @__PURE__ */ u3("div", { class: "breadcrumb", style: "font-size:12px;margin-bottom:8px", children: p3.breadcrumb }),
    /* @__PURE__ */ u3(
      "div",
      {
        class: "focus-session-viewport",
        onPointerDown: (e3) => {
          if (!e3.isPrimary) return;
          const t3 = e3.target;
          if (t3.closest && t3.closest(BLOCK_SEL)) return;
          sx.current = e3.clientX;
        },
        onPointerUp: (e3) => {
          if (!e3.isPrimary || sx.current === null) return;
          const d3 = e3.clientX - sx.current;
          sx.current = null;
          if (Math.abs(d3) < 50) return;
          if (d3 < 0) a3.next();
          else a3.prev();
        },
        onPointerCancel: () => {
          sx.current = null;
        },
        children: /* @__PURE__ */ u3("div", { class: "focus-session-track", style: `width:${n2 * 100}%;transform:translateX(${tx}%)`, children: Array.from({ length: n2 }, (_2, i4) => /* @__PURE__ */ u3("div", { class: "focus-session-slide", style: `width:${100 / n2}%;flex-shrink:0`, children: /* @__PURE__ */ u3("div", { class: "exercise-card-host", "data-card-i": i4 }) }, i4)) })
      }
    ),
    /* @__PURE__ */ u3("div", { class: "focus-nav-row", children: [
      idx > 0 ? /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-secondary-solid btn-sm", id: "focus-prev", "aria-label": "Previous exercise", onClick: () => a3.prev(), children: "\u2039 Previous" }) : null,
      idx < n2 - 1 ? /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost btn-sm", id: "focus-next-skip", "aria-label": "Next exercise", onClick: () => a3.next(), children: "Next \u203A" }) : null
    ] }),
    /* @__PURE__ */ u3("p", { class: "focus-hint", children: [
      "Use ",
      /* @__PURE__ */ u3("b", { style: "color:var(--text)", children: "\u2039 \u203A" }),
      " to change lifts. Tap ",
      /* @__PURE__ */ u3("b", { style: "color:var(--text)", children: "Save all" }),
      " to log this exercise."
    ] }),
    /* @__PURE__ */ u3("div", { class: "train-session-footer", children: /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-mint btn-block session-finalize-sync", children: p3.finalized ? "Session complete" : "Complete session" }) }),
    /* @__PURE__ */ u3("div", { style: "display:contents", dangerouslySetInnerHTML: { __html: p3.overlayHtml } })
  ] });
}
function mountFocusShell(container, props) {
  R(/* @__PURE__ */ u3(FocusShell, { ...props }), container);
}

// src/ui/session-summary.tsx
function SessionSummary(p3) {
  return /* @__PURE__ */ u3("div", { class: "ss-overlay", role: "dialog", "aria-modal": "true", "aria-labelledby": "ss-title", onClick: (e3) => {
    if (e3.target === e3.currentTarget) p3.onClose();
  }, children: /* @__PURE__ */ u3("div", { class: "ss-card", children: [
    /* @__PURE__ */ u3("button", { type: "button", class: "ss-close", "aria-label": "Close", onClick: () => p3.onClose(), children: "\xD7" }),
    /* @__PURE__ */ u3("div", { class: "ss-kicker", children: "\u2713 Session Complete" }),
    /* @__PURE__ */ u3("div", { class: "ss-date", id: "ss-title", children: p3.dateLabel }),
    /* @__PURE__ */ u3("div", { class: "ss-hero", children: [
      /* @__PURE__ */ u3("div", { class: "ss-hero-num", children: p3.volume }),
      /* @__PURE__ */ u3("div", { class: "ss-hero-lbl", children: [
        p3.volumeUnit,
        " total volume"
      ] })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ss-stats", children: p3.stats.map((s3) => /* @__PURE__ */ u3("div", { class: "ss-stat" + (s3.accent ? " ss-stat-accent" : ""), children: [
      /* @__PURE__ */ u3("div", { class: "ss-stat-val", children: s3.value }),
      /* @__PURE__ */ u3("div", { class: "ss-stat-lbl", children: s3.label })
    ] }, s3.label)) }),
    p3.prs.length ? /* @__PURE__ */ u3("div", { class: "ss-section ss-prs", children: [
      /* @__PURE__ */ u3("div", { class: "ss-section-lbl", children: "\u{1F3C6} Personal Records" }),
      p3.prs.map((pr, i4) => /* @__PURE__ */ u3("div", { class: "ss-pr-row", children: [
        /* @__PURE__ */ u3("span", { class: "ss-pr-name", children: pr.name }),
        /* @__PURE__ */ u3("span", { class: "ss-pr-detail", children: pr.detail })
      ] }, i4))
    ] }) : null,
    p3.runLabel ? /* @__PURE__ */ u3("div", { class: "ss-line", children: [
      /* @__PURE__ */ u3("span", { class: "ss-line-lbl", children: "Cardio" }),
      /* @__PURE__ */ u3("span", { class: "ss-line-val", children: p3.runLabel })
    ] }) : null,
    p3.feelLabel ? /* @__PURE__ */ u3("div", { class: "ss-line", children: [
      /* @__PURE__ */ u3("span", { class: "ss-line-lbl", children: "Felt" }),
      /* @__PURE__ */ u3("span", { class: "ss-line-val", children: p3.feelLabel })
    ] }) : null,
    /* @__PURE__ */ u3("div", { class: "ss-section", children: [
      /* @__PURE__ */ u3("div", { class: "ss-section-lbl", children: "Muscles worked" }),
      /* @__PURE__ */ u3("div", { class: "ss-anatomy", dangerouslySetInnerHTML: { __html: p3.anatomyHtml } })
    ] }),
    p3.adaptationApplied ? /* @__PURE__ */ u3("p", { class: "ss-adapt", children: "Adaptation applied \u2014 tomorrow's targets are updated." }) : null,
    /* @__PURE__ */ u3("div", { class: "ss-actions", children: [
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-secondary-solid btn-block", onClick: () => p3.onViewLog(), children: "View log" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta btn-block", onClick: () => p3.onClose(), children: "Done" })
    ] })
  ] }) });
}
function mountSessionSummary(container, props) {
  R(/* @__PURE__ */ u3(SessionSummary, { ...props }), container);
}

// src/ui/personal-records.tsx
function PersonalRecords(p3) {
  return /* @__PURE__ */ u3("div", { class: "pr-board card dash-span-full", children: [
    /* @__PURE__ */ u3("div", { class: "card-h", children: [
      /* @__PURE__ */ u3("h2", { children: "Personal Records" }),
      /* @__PURE__ */ u3("span", { class: "badge badge-fire", children: "e1RM" })
    ] }),
    /* @__PURE__ */ u3("div", { class: "pr-total", children: [
      /* @__PURE__ */ u3("div", { class: "pr-total-num", children: p3.totalHas ? p3.total : "\u2014" }),
      /* @__PURE__ */ u3("div", { class: "pr-total-lbl", children: [
        p3.unit,
        " \xB7 Big 3 estimated total"
      ] })
    ] }),
    /* @__PURE__ */ u3("div", { class: "pr-big3", children: p3.big3.map((b2) => /* @__PURE__ */ u3("div", { class: "pr-lift" + (b2.has ? "" : " pr-lift-empty"), children: [
      /* @__PURE__ */ u3("div", { class: "pr-lift-label", children: b2.label }),
      /* @__PURE__ */ u3("div", { class: "pr-lift-e1rm", children: [
        b2.has ? b2.e1rm : "\u2014",
        b2.has ? /* @__PURE__ */ u3("span", { class: "pr-unit", children: p3.unit }) : null
      ] }),
      /* @__PURE__ */ u3("div", { class: "pr-lift-set", children: b2.set }),
      b2.date ? /* @__PURE__ */ u3("div", { class: "pr-lift-date", children: b2.date }) : null
    ] }, b2.label)) }),
    p3.others.length ? /* @__PURE__ */ u3("div", { class: "pr-others", children: [
      /* @__PURE__ */ u3("div", { class: "pr-others-lbl", children: "More lifts" }),
      p3.others.map((o3, i4) => /* @__PURE__ */ u3("div", { class: "pr-row", children: [
        /* @__PURE__ */ u3("span", { class: "pr-row-name", children: o3.name }),
        /* @__PURE__ */ u3("span", { class: "pr-row-meta", children: [
          /* @__PURE__ */ u3("b", { children: [
            o3.e1rm,
            " ",
            p3.unit
          ] }),
          " \xB7 ",
          o3.set
        ] })
      ] }, i4))
    ] }) : null
  ] });
}
function mountPersonalRecords(container, props) {
  R(/* @__PURE__ */ u3(PersonalRecords, { ...props }), container);
}

// src/ui/strength-progress.tsx
function Sparkline({ points }) {
  const W = 100, H2 = 32, P2 = 3;
  const min = Math.min(...points), max = Math.max(...points), range = max - min || 1;
  const X = (i4) => P2 + (points.length < 2 ? 0 : i4 / (points.length - 1) * (W - 2 * P2));
  const Y = (v3) => P2 + (1 - (v3 - min) / range) * (H2 - 2 * P2);
  const line = points.map((v3, i4) => `${X(i4).toFixed(2)},${Y(v3).toFixed(2)}`).join(" ");
  const area = `${X(0).toFixed(2)},${H2 - P2} ${line} ${X(points.length - 1).toFixed(2)},${H2 - P2}`;
  return /* @__PURE__ */ u3("svg", { class: "sp-spark", viewBox: `0 0 ${W} ${H2}`, preserveAspectRatio: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ u3("polygon", { class: "sp-spark-area", points: area }),
    /* @__PURE__ */ u3("polyline", { class: "sp-spark-line", points: line }),
    /* @__PURE__ */ u3("circle", { class: "sp-spark-dot", cx: X(points.length - 1), cy: Y(points[points.length - 1]), r: "2" })
  ] });
}
function StrengthProgress(p3) {
  const lifts = p3.lifts.filter((l3) => l3.has);
  return /* @__PURE__ */ u3("div", { class: "sp-board card dash-span-full", children: [
    /* @__PURE__ */ u3("div", { class: "card-h", children: [
      /* @__PURE__ */ u3("h2", { children: "Strength Progress" }),
      /* @__PURE__ */ u3("span", { class: "badge badge-ice", children: "e1RM" })
    ] }),
    lifts.length ? /* @__PURE__ */ u3("div", { class: "sp-lifts", children: lifts.map((l3) => /* @__PURE__ */ u3("div", { class: "sp-lift", children: [
      /* @__PURE__ */ u3("div", { class: "sp-lift-head", children: [
        /* @__PURE__ */ u3("span", { class: "sp-lift-label", children: l3.label }),
        /* @__PURE__ */ u3("span", { class: "sp-lift-cur", children: [
          l3.current,
          /* @__PURE__ */ u3("span", { class: "sp-unit", children: [
            " ",
            p3.unit
          ] })
        ] }),
        l3.deltaPct !== 0 ? /* @__PURE__ */ u3("span", { class: "sp-delta " + (l3.deltaPct > 0 ? "up" : "down"), children: [
          l3.deltaPct > 0 ? "\u25B2" : "\u25BC",
          " ",
          Math.abs(l3.deltaPct),
          "%"
        ] }) : null
      ] }),
      /* @__PURE__ */ u3(Sparkline, { points: l3.points })
    ] }, l3.label)) }) : /* @__PURE__ */ u3("p", { class: "sp-empty", children: "Log a main lift across two sessions to see your trend." }),
    p3.volumeBars.length ? /* @__PURE__ */ u3("div", { class: "sp-vol-section", children: [
      /* @__PURE__ */ u3("div", { class: "sp-section-lbl", children: [
        "Weekly volume \xB7 ",
        p3.unit
      ] }),
      /* @__PURE__ */ u3("div", { class: "sp-vol", children: p3.volumeBars.map((b2, i4) => /* @__PURE__ */ u3("div", { class: "sp-vol-col-wrap", title: `${b2.week}: ${b2.value.toLocaleString()} ${p3.unit}`, children: [
        /* @__PURE__ */ u3("div", { class: "sp-vol-col", style: `height:${p3.volumeMax > 0 ? Math.max(3, b2.value / p3.volumeMax * 100) : 3}%` }),
        /* @__PURE__ */ u3("div", { class: "sp-vol-x", children: b2.week })
      ] }, i4)) })
    ] }) : null
  ] });
}
function mountStrengthProgress(container, props) {
  R(/* @__PURE__ */ u3(StrengthProgress, { ...props }), container);
}

// src/ui/training-heatmap.tsx
function Stat({ val, label }) {
  return /* @__PURE__ */ u3("div", { class: "hm-stat", children: [
    /* @__PURE__ */ u3("div", { class: "hm-stat-val", children: val }),
    /* @__PURE__ */ u3("div", { class: "hm-stat-lbl", children: label })
  ] });
}
function TrainingHeatmap(p3) {
  return /* @__PURE__ */ u3("div", { class: "hm-board card dash-span-full", children: [
    /* @__PURE__ */ u3("div", { class: "card-h", children: [
      /* @__PURE__ */ u3("h2", { children: "Training Consistency" }),
      p3.currentStreak > 0 ? /* @__PURE__ */ u3("span", { class: "badge badge-fire", children: [
        "\u{1F525} ",
        p3.currentStreak,
        " day streak"
      ] }) : null
    ] }),
    /* @__PURE__ */ u3("div", { class: "hm-stats", children: [
      /* @__PURE__ */ u3(Stat, { val: p3.currentStreak, label: "Current" }),
      /* @__PURE__ */ u3(Stat, { val: p3.longestStreak, label: "Longest" }),
      /* @__PURE__ */ u3(Stat, { val: p3.thisMonth, label: "This month" }),
      /* @__PURE__ */ u3(Stat, { val: p3.totalDays, label: "Total days" })
    ] }),
    /* @__PURE__ */ u3("div", { class: "hm-grid-wrap", children: /* @__PURE__ */ u3("div", { class: "hm-grid", children: p3.weeks.map((wk, i4) => /* @__PURE__ */ u3("div", { class: "hm-col", children: wk.map((c3, j3) => /* @__PURE__ */ u3("div", { class: "hm-cell hm-l" + c3.level + (c3.isToday ? " hm-today" : ""), title: c3.title }, j3)) }, i4)) }) }),
    /* @__PURE__ */ u3("div", { class: "hm-foot", children: [
      /* @__PURE__ */ u3("span", { class: "hm-caption", children: [
        "Last ",
        p3.windowWeeks,
        " weeks"
      ] }),
      /* @__PURE__ */ u3("span", { class: "hm-legend", children: [
        "Less",
        /* @__PURE__ */ u3("span", { class: "hm-cell hm-l0" }),
        /* @__PURE__ */ u3("span", { class: "hm-cell hm-l1" }),
        /* @__PURE__ */ u3("span", { class: "hm-cell hm-l2" }),
        /* @__PURE__ */ u3("span", { class: "hm-cell hm-l3" }),
        /* @__PURE__ */ u3("span", { class: "hm-cell hm-l4" }),
        "More"
      ] })
    ] })
  ] });
}
function mountTrainingHeatmap(container, props) {
  R(/* @__PURE__ */ u3(TrainingHeatmap, { ...props }), container);
}

// src/ui/achievements.tsx
function AchievementsWall(p3) {
  return /* @__PURE__ */ u3("div", { class: "ach-board card dash-span-full", children: [
    /* @__PURE__ */ u3("div", { class: "card-h", children: [
      /* @__PURE__ */ u3("h2", { children: "Achievements" }),
      /* @__PURE__ */ u3("span", { class: "badge badge-fire", children: [
        p3.earnedCount,
        "/",
        p3.totalCount,
        " unlocked"
      ] })
    ] }),
    /* @__PURE__ */ u3("div", { class: "ach-grid", children: p3.badges.map((b2, i4) => /* @__PURE__ */ u3("div", { class: "ach-item " + (b2.earned ? "ach-earned" : "ach-locked"), children: [
      /* @__PURE__ */ u3("div", { class: "ach-icon", children: b2.icon }),
      /* @__PURE__ */ u3("div", { class: "ach-title", children: b2.title }),
      /* @__PURE__ */ u3("div", { class: "ach-desc", children: b2.desc }),
      b2.earned ? /* @__PURE__ */ u3("div", { class: "ach-status", children: "\u2713 Unlocked" }) : /* @__PURE__ */ u3("div", { class: "ach-progress", children: [
        /* @__PURE__ */ u3("div", { class: "ach-bar", children: /* @__PURE__ */ u3("div", { class: "ach-bar-fill", style: `width:${b2.progressPct}%` }) }),
        /* @__PURE__ */ u3("div", { class: "ach-prog-lbl", children: b2.progressLabel })
      ] })
    ] }, i4)) })
  ] });
}
function mountAchievements(container, props) {
  R(/* @__PURE__ */ u3(AchievementsWall, { ...props }), container);
}

// src/ui/body-metrics.tsx
function Spark({ points }) {
  const W = 100, H2 = 34, P2 = 3;
  const min = Math.min(...points), max = Math.max(...points), range = max - min || 1;
  const X = (i4) => P2 + i4 / (points.length - 1) * (W - 2 * P2);
  const Y = (v3) => P2 + (1 - (v3 - min) / range) * (H2 - 2 * P2);
  const line = points.map((v3, i4) => `${X(i4).toFixed(1)},${Y(v3).toFixed(1)}`).join(" ");
  const area = `${X(0).toFixed(1)},${H2 - P2} ${line} ${X(points.length - 1).toFixed(1)},${H2 - P2}`;
  return /* @__PURE__ */ u3("svg", { class: "bm-spark", viewBox: `0 0 ${W} ${H2}`, preserveAspectRatio: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ u3("polygon", { class: "bm-spark-area", points: area }),
    /* @__PURE__ */ u3("polyline", { class: "bm-spark-line", points: line }),
    /* @__PURE__ */ u3("circle", { class: "bm-spark-dot", cx: X(points.length - 1), cy: Y(points[points.length - 1]), r: "2" })
  ] });
}
function BodyMetrics(p3) {
  const dir = p3.deltaDir > 0 ? "up" : p3.deltaDir < 0 ? "down" : "flat";
  return /* @__PURE__ */ u3("div", { class: "bm-board card dash-span-full", children: [
    /* @__PURE__ */ u3("div", { class: "card-h", children: /* @__PURE__ */ u3("h2", { children: "Body Metrics" }) }),
    p3.hasWeight ? /* @__PURE__ */ u3("div", { class: "bm-weight", children: [
      /* @__PURE__ */ u3("div", { class: "bm-weight-num", children: [
        p3.currentWeight,
        /* @__PURE__ */ u3("span", { class: "bm-unit", children: [
          " ",
          p3.unit
        ] })
      ] }),
      p3.deltaLabel ? /* @__PURE__ */ u3("div", { class: "bm-delta " + dir, children: p3.deltaLabel }) : null,
      p3.weightPoints.length >= 2 ? /* @__PURE__ */ u3(Spark, { points: p3.weightPoints }) : null,
      p3.goalLabel ? /* @__PURE__ */ u3("div", { class: "bm-goal", children: [
        /* @__PURE__ */ u3("div", { class: "bm-goal-bar", children: /* @__PURE__ */ u3("div", { class: "bm-goal-fill", style: `width:${p3.goalPct}%` }) }),
        /* @__PURE__ */ u3("div", { class: "bm-goal-lbl", children: [
          p3.goalLabel,
          " \xB7 ",
          p3.goalPct,
          "%"
        ] })
      ] }) : null
    ] }) : null,
    p3.comp.length ? /* @__PURE__ */ u3("div", { class: "bm-comp" + (p3.hasWeight ? "" : " bm-comp-top"), children: [
      /* @__PURE__ */ u3("div", { class: "bm-section-lbl", children: "Composition" }),
      /* @__PURE__ */ u3("div", { class: "bm-comp-grid", children: p3.comp.map((c3, i4) => /* @__PURE__ */ u3("div", { class: "bm-tile", children: [
        /* @__PURE__ */ u3("div", { class: "bm-tile-val", children: c3.value }),
        /* @__PURE__ */ u3("div", { class: "bm-tile-lbl", children: c3.label }),
        c3.sub ? /* @__PURE__ */ u3("div", { class: "bm-tile-sub", children: c3.sub }) : null
      ] }, i4)) })
    ] }) : null
  ] });
}
function mountBodyMetrics(container, props) {
  R(/* @__PURE__ */ u3(BodyMetrics, { ...props }), container);
}

// src/ui/partner-entry.tsx
function PartnerEntry(p3) {
  const a3 = p3.actions;
  return /* @__PURE__ */ u3("div", { class: "pn-entry card", children: [
    /* @__PURE__ */ u3("div", { class: "card-h", children: /* @__PURE__ */ u3("h2", { children: "Lift Together" }) }),
    p3.mode === "idle" ? /* @__PURE__ */ u3("div", { class: "pn-idle", children: [
      /* @__PURE__ */ u3("p", { class: "pn-sub", children: "Train with a friend in person \u2014 share a few big lifts at each of your own loads, then split to your own accessories." }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta btn-block pn-start", onClick: () => a3.startSession(), disabled: !!p3.busy, children: p3.busy ? "Starting\u2026" : "Start a session" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-secondary-solid btn-block pn-open-join", onClick: () => a3.openJoin(), children: "Join with a code" }),
      p3.joinError ? /* @__PURE__ */ u3("div", { class: "pn-error", children: p3.joinError }) : null
    ] }) : null,
    p3.mode === "hosting" ? /* @__PURE__ */ u3("div", { class: "pn-hosting", children: [
      /* @__PURE__ */ u3("div", { class: "pn-code", "aria-label": `Join code ${p3.code || ""}`, children: [...p3.code || ""].map((c3, i4) => /* @__PURE__ */ u3("span", { class: "pn-code-char", children: c3 }, i4)) }),
      /* @__PURE__ */ u3("p", { class: "pn-sub", children: [
        "Have your partner tap ",
        /* @__PURE__ */ u3("b", { children: "Join with a code" }),
        " and enter this \u2014 or scan the QR."
      ] }),
      /* @__PURE__ */ u3("div", { class: "pn-qr", "data-code": p3.code }),
      /* @__PURE__ */ u3("p", { class: "pn-waiting", children: "Waiting for partners to join\u2026" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost btn-block pn-cancel", onClick: () => a3.cancel(), children: "Cancel" })
    ] }) : null,
    p3.mode === "joining" ? /* @__PURE__ */ u3(
      "form",
      {
        class: "pn-joining",
        onSubmit: (e3) => {
          e3.preventDefault();
          const inp = e3.currentTarget.querySelector(".pn-code-input");
          a3.submitJoin(inp ? inp.value : "");
        },
        children: [
          /* @__PURE__ */ u3("label", { children: "Session code" }),
          /* @__PURE__ */ u3("input", { class: "pn-code-input", type: "text", inputmode: "text", autocomplete: "off", spellcheck: false, placeholder: "ABC23X", maxlength: 8, "aria-label": "Session code" }),
          p3.joinError ? /* @__PURE__ */ u3("div", { class: "pn-error", children: p3.joinError }) : null,
          /* @__PURE__ */ u3("button", { type: "submit", class: "btn btn-cta btn-block pn-submit", disabled: !!p3.busy, children: "Join" }),
          /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost btn-block pn-cancel", onClick: () => a3.cancel(), children: "Back" })
        ]
      }
    ) : null
  ] });
}
function mountPartnerEntry(container, props) {
  R(/* @__PURE__ */ u3(PartnerEntry, { ...props }), container);
}

// src/ui/partner-lobby.tsx
function PartnerLobby(p3) {
  const a3 = p3.actions;
  const me = p3.participants.find((x2) => x2.uid === p3.meUid);
  const everyoneReady = p3.participants.length > 0 && p3.participants.every((x2) => x2.ready);
  const canStart = p3.isHost && p3.participants.length >= 2 && everyoneReady;
  return /* @__PURE__ */ u3("div", { class: "pn-lobby card", children: [
    /* @__PURE__ */ u3("div", { class: "card-h", children: [
      /* @__PURE__ */ u3("h2", { children: "Lobby" }),
      /* @__PURE__ */ u3("span", { class: "badge badge-fire", children: [
        p3.participants.length,
        " in"
      ] })
    ] }),
    /* @__PURE__ */ u3("div", { class: "pn-roster", children: p3.participants.map((x2) => /* @__PURE__ */ u3("div", { class: "pn-member" + (x2.uid === p3.meUid ? " pn-me" : ""), children: [
      /* @__PURE__ */ u3("span", { class: "pn-dot " + (x2.online ? "pn-on" : "pn-off"), title: x2.online ? "Online" : "Offline" }),
      /* @__PURE__ */ u3("span", { class: "pn-name", children: x2.name }),
      x2.role === "host" ? /* @__PURE__ */ u3("span", { class: "badge badge-ice pn-role", children: "Host" }) : null,
      !x2.maxesShared ? /* @__PURE__ */ u3("span", { class: "pn-noshare", title: "Maxes not shared", children: "\u{1F512}" }) : null,
      /* @__PURE__ */ u3("span", { class: "pn-ready " + (x2.ready ? "pn-is-ready" : "pn-not-ready"), children: x2.ready ? "\u2713 Ready" : "Not ready" })
    ] }, x2.uid)) }),
    /* @__PURE__ */ u3("div", { class: "pn-lobby-actions", children: [
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-block " + (me && me.ready ? "btn-secondary-solid" : "btn-cta") + " pn-toggle-ready", onClick: () => a3.toggleReady(!(me && me.ready)), children: me && me.ready ? "Not ready" : "I'm ready" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost btn-sm pn-invite", onClick: () => a3.invite(), children: "Invite a gym-buddy" }),
      p3.isHost ? /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-mint btn-block pn-start-session", disabled: !canStart, onClick: () => a3.start(), children: canStart ? "Continue \u2192 pick shared lifts" : p3.participants.length < 2 ? "Waiting for a partner\u2026" : "Waiting for everyone to ready up\u2026" }) : /* @__PURE__ */ u3("p", { class: "pn-hint", children: "Your host starts the session once everyone's ready." }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost btn-sm pn-leave", onClick: () => a3.leave(), children: "Leave" })
    ] })
  ] });
}
function mountPartnerLobby(container, props) {
  R(/* @__PURE__ */ u3(PartnerLobby, { ...props }), container);
}

// src/ui/shared-block-proposal.tsx
var SRC_LABEL = {
  logged: "",
  estimated: "est.",
  calibrated: "set",
  none: ""
};
function SharedBlockProposal(p3) {
  const a3 = p3.actions;
  const myCalib = p3.lifts.some((l3) => l3.loads.some((x2) => x2.needsCalibration && x2.uid === p3.meUid));
  return /* @__PURE__ */ u3("div", { class: "sbp card", children: [
    /* @__PURE__ */ u3("div", { class: "card-h", children: [
      /* @__PURE__ */ u3("h2", { children: "Shared lifts" }),
      /* @__PURE__ */ u3("span", { class: "badge badge-fire", children: "Together" })
    ] }),
    /* @__PURE__ */ u3("p", { class: "sbp-sub", children: "Done together at each lifter's own load, then you split to your own accessories." }),
    /* @__PURE__ */ u3("div", { class: "sbp-vibes", role: "tablist", "aria-label": "Intensity", children: p3.vibes.map((v3) => /* @__PURE__ */ u3("button", { type: "button", class: "sbp-vibe" + (v3.id === p3.vibe ? " on" : ""), "aria-selected": v3.id === p3.vibe, onClick: () => a3.setVibe(v3.id), children: v3.label }, v3.id)) }),
    p3.lifts.length ? p3.lifts.map((l3) => /* @__PURE__ */ u3("div", { class: "sbp-lift", children: [
      /* @__PURE__ */ u3("div", { class: "sbp-lift-head", children: [
        /* @__PURE__ */ u3("span", { class: "sbp-lift-name", children: l3.name }),
        /* @__PURE__ */ u3("span", { class: "sbp-lift-scheme", children: [
          l3.scheme.sets,
          "\xD7",
          l3.scheme.reps,
          " \xB7 ",
          l3.scheme.intensityPct,
          "%"
        ] }),
        /* @__PURE__ */ u3("button", { type: "button", class: "sbp-remove", "aria-label": `Remove ${l3.name}`, onClick: () => a3.removeLift(l3.eid), children: "\xD7" })
      ] }),
      /* @__PURE__ */ u3("div", { class: "sbp-lift-reason", children: l3.reason }),
      /* @__PURE__ */ u3("div", { class: "sbp-loads", children: l3.loads.map((x2) => /* @__PURE__ */ u3("div", { class: "sbp-load" + (x2.needsCalibration ? " sbp-needs-cal" : ""), children: [
        /* @__PURE__ */ u3("span", { class: "sbp-load-name", children: x2.name }),
        x2.needsCalibration ? x2.uid === p3.meUid ? /* @__PURE__ */ u3("button", { type: "button", class: "sbp-cal-btn", onClick: () => a3.calibrate(l3.eid, x2.uid), children: "Set a max" }) : /* @__PURE__ */ u3("span", { class: "sbp-load-pending", children: "sets on their phone" }) : /* @__PURE__ */ u3("span", { class: "sbp-load-val", children: [
          x2.load,
          /* @__PURE__ */ u3("span", { class: "sbp-load-unit", children: [
            " ",
            x2.unit
          ] }),
          SRC_LABEL[x2.maxSource] ? /* @__PURE__ */ u3("span", { class: "sbp-load-src", children: [
            " ",
            SRC_LABEL[x2.maxSource]
          ] }) : null
        ] })
      ] }, x2.uid)) })
    ] }, l3.eid)) : /* @__PURE__ */ u3("p", { class: "sbp-empty", children: "No shared lift works for everyone's equipment/goals \u2014 add one manually." }),
    /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost btn-sm btn-block sbp-add", onClick: () => a3.addLift(), children: "+ Add a lift" }),
    /* @__PURE__ */ u3("div", { class: "sbp-actions", children: [
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-secondary-solid sbp-back", onClick: () => a3.back(), children: "Back" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta btn-block sbp-confirm", disabled: myCalib || !p3.lifts.length, onClick: () => a3.confirm(), children: myCalib ? "Set your max first" : "Start lifting \u2192" })
    ] })
  ] });
}
function mountSharedBlockProposal(container, props) {
  R(/* @__PURE__ */ u3(SharedBlockProposal, { ...props }), container);
}

// src/ui/match-board.tsx
var rxFor = (p3, eid) => p3.rx.find((r3) => r3.eid === eid);
function loadLabel(rx, unit) {
  if (!rx) return { text: "\u2026", cls: "mb-load-wait" };
  if (rx.source === "needs-calibration") return { text: "Set a max", cls: "mb-load-cal" };
  if (rx.load <= 0) return { text: `BW \xB7 ${rx.sets}\xD7${rx.reps}`, cls: "mb-load-bw" };
  return { text: `${rx.load} ${unit} \xB7 ${rx.sets}\xD7${rx.reps}${rx.source === "estimated" ? " est." : ""}`, cls: rx.source === "estimated" ? "mb-load-est" : "mb-load-prog" };
}
function Tile(p3) {
  const { item } = p3;
  const load = item.load > 0 ? `${item.load} ${p3.unit}` : "BW";
  return /* @__PURE__ */ u3("button", { type: "button", class: `mb-tile${p3.inJoint ? " in" : ""}`, onClick: p3.onTap, "aria-pressed": p3.inJoint, children: [
    /* @__PURE__ */ u3("span", { class: "mb-tile-name", children: item.name }),
    /* @__PURE__ */ u3("span", { class: "mb-tile-rx", children: [
      item.sets,
      "\xD7",
      item.reps,
      " \xB7 ",
      load
    ] }),
    /* @__PURE__ */ u3("span", { class: "mb-tile-mark", children: p3.inJoint ? "\u2713 shared" : "+ share" })
  ] });
}
function MatchBoard(p3) {
  const a3 = p3.actions;
  const me = p3.participants.find((x2) => x2.uid === p3.meUid);
  const others = p3.participants.filter((x2) => x2.uid !== p3.meUid);
  const jointEids = new Set(p3.joints.map((j3) => j3.eid));
  const myNeedsCal = (me?.rx || []).filter((r3) => jointEids.has(r3.eid) && r3.source === "needs-calibration");
  const canStart = p3.joints.length > 0 && myNeedsCal.length === 0;
  return /* @__PURE__ */ u3("div", { class: "mb-flow", children: [
    /* @__PURE__ */ u3("div", { class: "mb-head", children: [
      /* @__PURE__ */ u3("h2", { children: "Build today together" }),
      /* @__PURE__ */ u3("span", { class: "mb-sub", children: "Tap your lifts into the middle to do them together \u2014 each at your own load. The rest you'll do solo." })
    ] }),
    /* @__PURE__ */ u3("div", { class: "mb-board", children: [
      /* @__PURE__ */ u3("div", { class: "mb-col mb-col-me", children: [
        /* @__PURE__ */ u3("div", { class: "mb-col-h", children: "Your plan" }),
        me && me.dayPlan.length ? me.dayPlan.map((it) => /* @__PURE__ */ u3(Tile, { item: it, unit: p3.unit, inJoint: jointEids.has(it.eid), onTap: () => a3.toggle(it) }, it.eid)) : /* @__PURE__ */ u3("div", { class: "mb-empty", children: "No lifts programmed today \u2014 your partner can still pull you into theirs." })
      ] }),
      /* @__PURE__ */ u3("div", { class: "mb-col mb-col-joint", children: [
        /* @__PURE__ */ u3("div", { class: "mb-col-h", children: [
          "Together ",
          /* @__PURE__ */ u3("span", { class: "mb-count", children: p3.joints.length })
        ] }),
        p3.joints.length === 0 ? /* @__PURE__ */ u3("div", { class: "mb-empty", children: "Nothing shared yet. Tap a lift from either side." }) : null,
        p3.joints.map((j3) => /* @__PURE__ */ u3("div", { class: "mb-joint-lift", children: [
          /* @__PURE__ */ u3("div", { class: "mb-joint-top", children: [
            /* @__PURE__ */ u3("span", { class: "mb-joint-name", children: j3.name }),
            /* @__PURE__ */ u3("button", { type: "button", class: "mb-remove", "aria-label": `Remove ${j3.name}`, onClick: () => a3.remove(j3.eid), children: "\xD7" })
          ] }),
          p3.participants.map((pt) => {
            const rx = rxFor(pt, j3.eid);
            const lbl = loadLabel(rx, p3.unit);
            const mine = pt.uid === p3.meUid;
            return /* @__PURE__ */ u3("div", { class: "mb-load-row", children: [
              /* @__PURE__ */ u3("span", { class: "mb-load-who", children: pt.name }),
              lbl.cls === "mb-load-cal" ? mine ? /* @__PURE__ */ u3("button", { type: "button", class: "mb-load-cal", onClick: () => rx && a3.calibrate(rx), children: "Set a max" }) : /* @__PURE__ */ u3("span", { class: "mb-load-wait", children: "sets on their phone" }) : /* @__PURE__ */ u3("span", { class: `mb-load ${lbl.cls}`, children: lbl.text })
            ] }, pt.uid);
          })
        ] }, j3.eid))
      ] }),
      /* @__PURE__ */ u3("div", { class: "mb-col mb-col-partner", children: others.map((o3) => /* @__PURE__ */ u3("div", { class: "mb-partner", children: [
        /* @__PURE__ */ u3("div", { class: "mb-col-h", children: [
          o3.name,
          "'s plan"
        ] }),
        o3.dayPlan.length ? o3.dayPlan.map((it) => /* @__PURE__ */ u3("div", { class: `mb-ptile${jointEids.has(it.eid) ? " in" : ""}`, children: [
          /* @__PURE__ */ u3("span", { class: "mb-tile-name", children: it.name }),
          /* @__PURE__ */ u3("span", { class: "mb-tile-rx", children: [
            it.sets,
            "\xD7",
            it.reps,
            it.load > 0 ? ` \xB7 ${it.load} ${p3.unit}` : ""
          ] }),
          jointEids.has(it.eid) ? /* @__PURE__ */ u3("span", { class: "mb-tile-mark", children: "\u2713" }) : null
        ] }, it.eid)) : /* @__PURE__ */ u3("div", { class: "mb-empty", children: "No lifts today." })
      ] }, o3.uid)) })
    ] }),
    /* @__PURE__ */ u3("div", { class: "mb-actions", children: [
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost mb-back", onClick: () => a3.back(), children: "Back" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta mb-start", disabled: !canStart || !!p3.busy, onClick: () => a3.start(), children: p3.joints.length === 0 ? "Pick a shared lift" : myNeedsCal.length ? "Set your max first" : "Start lifting \u2192" })
    ] })
  ] });
}
function mountMatchBoard(container, props) {
  R(/* @__PURE__ */ u3(MatchBoard, { ...props }), container);
}

// src/core/strength.ts
function epley(w3, r3) {
  return r3 <= 0 || w3 <= 0 ? 0 : w3 * (1 + r3 / 30);
}

// src/core/partner.ts
var VIBE_SCHEMES = {
  strength: { sets: 5, reps: 3, intensityPct: 85 },
  hypertrophy: { sets: 4, reps: 8, intensityPct: 70 },
  pump: { sets: 3, reps: 12, intensityPct: 60 }
};
var PARTNER_COMPOUNDS = [
  { eid: "squat", name: "Back Squat", tags: ["legs", "quads", "glutes", "posterior", "strength"], equipment: "barbell", increment: 5 },
  { eid: "frontsquat", name: "Front Squat", tags: ["legs", "quads", "core", "strength"], equipment: "barbell", increment: 5 },
  { eid: "bench", name: "Bench Press", tags: ["push", "chest", "upper", "strength"], equipment: "barbell", increment: 5 },
  { eid: "incline", name: "Incline Bench", tags: ["push", "chest", "shoulders", "upper"], equipment: "barbell", increment: 5 },
  { eid: "deadlift", name: "Deadlift", tags: ["hinge", "posterior", "glutes", "back", "strength"], equipment: "barbell", increment: 5 },
  { eid: "rdl", name: "Romanian Deadlift", tags: ["hinge", "posterior", "glutes", "hamstrings"], equipment: "barbell", increment: 5 },
  { eid: "hipthrust", name: "Hip Thrust", tags: ["glutes", "posterior", "legs"], equipment: "barbell", increment: 5 },
  { eid: "ohp", name: "Overhead Press", tags: ["push", "shoulders", "upper", "strength"], equipment: "barbell", increment: 5 },
  { eid: "row", name: "Barbell Row", tags: ["pull", "back", "upper", "posterior"], equipment: "barbell", increment: 5 },
  { eid: "pullup", name: "Pull-up", tags: ["pull", "back", "upper"], equipment: "bodyweight", increment: 0 },
  { eid: "lunge", name: "Walking Lunge", tags: ["legs", "quads", "glutes"], equipment: "dumbbell", increment: 5 },
  { eid: "legpress", name: "Leg Press", tags: ["legs", "quads", "glutes"], equipment: "machine", increment: 10 }
];
function roundToIncrement(load, increment) {
  if (!(increment > 0)) return Math.max(0, Math.round(load));
  return Math.max(0, Math.round(load / increment) * increment);
}
function scaleLoad(max, intensityPct, increment = 5) {
  if (!(max > 0) || !(intensityPct > 0)) return 0;
  return roundToIncrement(max * intensityPct / 100, increment);
}
function calibrationToMax(weight, reps) {
  return Math.round(epley(weight, reps));
}
var BW_MULT = {
  squat: 1.4,
  frontsquat: 1.1,
  bench: 1,
  incline: 0.85,
  deadlift: 1.75,
  rdl: 1.4,
  hipthrust: 1.6,
  ohp: 0.6,
  row: 0.9,
  lunge: 0.5,
  legpress: 2.2,
  pullup: 0
};
var EXP_FACTOR = { beginner: 0.65, intermediate: 1, advanced: 1.3 };
function estimateMaxFromBodyweight(eid, bodyweightLb, experience = "intermediate") {
  const m3 = BW_MULT[eid];
  if (m3 == null || !(bodyweightLb > 0)) return 0;
  const f4 = EXP_FACTOR[experience] ?? 1;
  return Math.round(bodyweightLb * m3 * f4 / 5) * 5;
}
function resolveMax(user, eid) {
  const logged = Number(user.maxes?.[eid]) || 0;
  if (logged > 0) return { value: logged, source: "logged" };
  const est = user.bodyweightLb ? estimateMaxFromBodyweight(eid, user.bodyweightLb, user.experience) : 0;
  if (est > 0) return { value: est, source: "estimated" };
  return { value: 0, source: "none" };
}
function fitScore(user, c3) {
  const focus = new Set(user.focus || []);
  let s3 = 0;
  for (const t3 of c3.tags) if (focus.has(t3)) s3++;
  return s3;
}
function canPerform(user, c3) {
  if ((user.blockedEids || []).includes(c3.eid)) return false;
  if (c3.equipment !== "bodyweight" && !(user.equipment || []).includes(c3.equipment)) return false;
  return true;
}
function suggestSharedLifts(users, catalog = PARTNER_COMPOUNDS, opts = {}) {
  const max = opts.max ?? 3;
  const out = [];
  for (const c3 of catalog) {
    if (!users.length || !users.every((u4) => canPerform(u4, c3))) continue;
    const fits = users.map((u4) => fitScore(u4, c3));
    const minFit = Math.min(...fits);
    const sumFit = fits.reduce((a3, b2) => a3 + b2, 0);
    const continuity = users.filter((u4) => (u4.todayEids || []).includes(c3.eid)).length;
    const jointScore = minFit * 100 + sumFit * 10 + continuity;
    if (jointScore <= 0) continue;
    const reason = continuity ? "In a program today, fits everyone" : minFit > 0 ? "Fits everyone's goals" : "Shared compound";
    out.push({ eid: c3.eid, name: c3.name, jointScore, reason });
  }
  out.sort((a3, b2) => b2.jointScore - a3.jointScore || a3.eid.localeCompare(b2.eid));
  return out.slice(0, Math.max(0, max));
}
function buildSharedLiftPlan(sug, users, scheme, increment = 5) {
  const loads = users.map((u4) => {
    const rm = resolveMax(u4, sug.eid);
    return {
      uid: u4.uid,
      name: u4.name,
      load: scaleLoad(rm.value, scheme.intensityPct, increment),
      maxSource: rm.source,
      needsCalibration: rm.source === "none"
    };
  });
  return { eid: sug.eid, name: sug.name, scheme, loads };
}

// src/ui/calibration-sheet.tsx
function CalibrationSheet(p3) {
  const [w3, setW] = d2("");
  const [r3, setR] = d2("5");
  const max = calibrationToMax(Number(w3) || 0, Number(r3) || 0);
  return /* @__PURE__ */ u3("div", { class: "cal-overlay", role: "dialog", "aria-modal": "true", "aria-labelledby": "cal-title", onClick: (e3) => {
    if (e3.target === e3.currentTarget) p3.onCancel();
  }, children: /* @__PURE__ */ u3("div", { class: "cal-sheet", children: [
    /* @__PURE__ */ u3("div", { class: "cal-title", id: "cal-title", children: [
      "Set your ",
      p3.liftName,
      " max"
    ] }),
    /* @__PURE__ */ u3("p", { class: "cal-sub", children: "No logged max yet \u2014 do one solid set and enter it. We'll estimate your working load and refine it as you train." }),
    /* @__PURE__ */ u3("div", { class: "cal-row", children: [
      /* @__PURE__ */ u3("div", { children: [
        /* @__PURE__ */ u3("label", { children: [
          "Weight (",
          p3.unit,
          ")"
        ] }),
        /* @__PURE__ */ u3("input", { type: "number", class: "cal-w input-sm", value: w3, min: "0", step: "any", inputmode: "decimal", onInput: (e3) => setW(e3.target.value) })
      ] }),
      /* @__PURE__ */ u3("div", { children: [
        /* @__PURE__ */ u3("label", { children: "Reps" }),
        /* @__PURE__ */ u3("input", { type: "number", class: "cal-r input-sm", value: r3, min: "1", inputmode: "numeric", onInput: (e3) => setR(e3.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ u3("div", { class: "cal-est", children: max > 0 ? /* @__PURE__ */ u3(S, { children: [
      "\u2248 ",
      /* @__PURE__ */ u3("b", { children: [
        max,
        " ",
        p3.unit
      ] }),
      " estimated 1RM"
    ] }) : "Enter a set above" }),
    /* @__PURE__ */ u3("div", { class: "cal-actions", children: [
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost cal-cancel", onClick: () => p3.onCancel(), children: "Cancel" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta btn-block cal-submit", disabled: !(max > 0), onClick: () => p3.onSubmit(max), children: "Set max" })
    ] })
  ] }) });
}
function mountCalibrationSheet(container, props) {
  R(/* @__PURE__ */ u3(CalibrationSheet, { ...props }), container);
}

// src/core/qr.ts
var ECC_L = [
  { ec: 7, data: 19, align: [] },
  // v1, 21×21
  { ec: 10, data: 34, align: [6, 18] },
  // v2, 25×25
  { ec: 15, data: 55, align: [6, 22] },
  // v3, 29×29
  { ec: 20, data: 80, align: [6, 26] },
  // v4, 33×33
  { ec: 26, data: 108, align: [6, 30] }
  // v5, 37×37
];
var EXP = new Array(512);
var LOG = new Array(256);
(function initGF() {
  let x2 = 1;
  for (let i4 = 0; i4 < 255; i4++) {
    EXP[i4] = x2;
    LOG[x2] = i4;
    x2 <<= 1;
    if (x2 & 256) x2 ^= 285;
  }
  for (let i4 = 255; i4 < 512; i4++) EXP[i4] = EXP[i4 - 255];
})();
var gfMul = (a3, b2) => a3 === 0 || b2 === 0 ? 0 : EXP[LOG[a3] + LOG[b2]];
function reedSolomon(data, n2) {
  let gen = [1];
  for (let i4 = 0; i4 < n2; i4++) {
    const next = new Array(gen.length + 1).fill(0);
    for (let j3 = 0; j3 < gen.length; j3++) {
      next[j3] ^= gen[j3];
      next[j3 + 1] ^= gfMul(gen[j3], EXP[i4]);
    }
    gen = next;
  }
  const res = data.concat(new Array(n2).fill(0));
  for (let i4 = 0; i4 < data.length; i4++) {
    const coef = res[i4];
    if (coef !== 0) for (let j3 = 1; j3 < gen.length; j3++) res[i4 + j3] ^= gfMul(gen[j3], coef);
  }
  return res.slice(data.length);
}
function utf8(text) {
  const out = [];
  for (const b2 of new TextEncoder().encode(text)) out.push(b2);
  return out;
}
var getBit = (x2, i4) => (x2 >>> i4 & 1) !== 0;
function newGrid(size) {
  const mod = [];
  const fn = [];
  for (let r3 = 0; r3 < size; r3++) {
    mod.push(new Array(size).fill(false));
    fn.push(new Array(size).fill(false));
  }
  return { mod, fn };
}
function placeFinder(mod, fn, R2, C3, size) {
  for (let dr = -1; dr <= 7; dr++) {
    for (let dc = -1; dc <= 7; dc++) {
      const r3 = R2 + dr, c3 = C3 + dc;
      if (r3 < 0 || r3 >= size || c3 < 0 || c3 >= size) continue;
      fn[r3][c3] = true;
      let dark = false;
      if (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) {
        const d3 = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
        dark = d3 === 3 || d3 <= 1;
      }
      mod[r3][c3] = dark;
    }
  }
}
function placeAlignment(mod, fn, cr, cc) {
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      fn[cr + dr][cc + dc] = true;
      mod[cr + dr][cc + dc] = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
    }
  }
}
function formatBits(mask) {
  const data = 1 << 3 | mask;
  let rem = data;
  for (let i4 = 0; i4 < 10; i4++) rem = rem << 1 ^ (rem >> 9) * 1335;
  return (data << 10 | rem) ^ 21522;
}
function reserveFormat(fn, size) {
  for (let i4 = 0; i4 < 9; i4++) {
    fn[8][i4] = true;
    fn[i4][8] = true;
  }
  for (let i4 = 0; i4 < 8; i4++) {
    fn[8][size - 1 - i4] = true;
    fn[size - 1 - i4][8] = true;
  }
}
function drawFormat(mod, size, mask) {
  const bits = formatBits(mask);
  for (let i4 = 0; i4 < 6; i4++) mod[i4][8] = getBit(bits, i4);
  mod[7][8] = getBit(bits, 6);
  mod[8][8] = getBit(bits, 7);
  mod[8][7] = getBit(bits, 8);
  for (let i4 = 9; i4 < 15; i4++) mod[8][14 - i4] = getBit(bits, i4);
  for (let i4 = 0; i4 < 8; i4++) mod[8][size - 1 - i4] = getBit(bits, i4);
  for (let i4 = 8; i4 < 15; i4++) mod[size - 15 + i4][8] = getBit(bits, i4);
  mod[size - 8][8] = true;
}
var MASK_FN = [
  (r3, c3) => (r3 + c3) % 2 === 0,
  (r3) => r3 % 2 === 0,
  (_r, c3) => c3 % 3 === 0,
  (r3, c3) => (r3 + c3) % 3 === 0,
  (r3, c3) => (Math.floor(r3 / 2) + Math.floor(c3 / 3)) % 2 === 0,
  (r3, c3) => r3 * c3 % 2 + r3 * c3 % 3 === 0,
  (r3, c3) => (r3 * c3 % 2 + r3 * c3 % 3) % 2 === 0,
  (r3, c3) => ((r3 + c3) % 2 + r3 * c3 % 3) % 2 === 0
];
function penalty(mod, size) {
  let p3 = 0;
  for (let i4 = 0; i4 < size; i4++) {
    let runR = 1, runC = 1;
    for (let j3 = 1; j3 < size; j3++) {
      if (mod[i4][j3] === mod[i4][j3 - 1]) {
        runR++;
        if (runR === 5) p3 += 3;
        else if (runR > 5) p3++;
      } else runR = 1;
      if (mod[j3][i4] === mod[j3 - 1][i4]) {
        runC++;
        if (runC === 5) p3 += 3;
        else if (runC > 5) p3++;
      } else runC = 1;
    }
  }
  for (let r3 = 0; r3 < size - 1; r3++)
    for (let c3 = 0; c3 < size - 1; c3++)
      if (mod[r3][c3] === mod[r3][c3 + 1] && mod[r3][c3] === mod[r3 + 1][c3] && mod[r3][c3] === mod[r3 + 1][c3 + 1]) p3 += 3;
  const A3 = [true, false, true, true, true, false, true, false, false, false, false];
  const B3 = [false, false, false, false, true, false, true, true, true, false, true];
  const matches = (get, start) => {
    for (let pat = 0; pat < 11; pat++) if (get(start + pat) !== A3[pat]) return matchB(get, start);
    return true;
  };
  const matchB = (get, start) => {
    for (let pat = 0; pat < 11; pat++) if (get(start + pat) !== B3[pat]) return false;
    return true;
  };
  for (let i4 = 0; i4 < size; i4++)
    for (let j3 = 0; j3 <= size - 11; j3++) {
      if (matches((k3) => mod[i4][k3], j3)) p3 += 40;
      if (matches((k3) => mod[k3][i4], j3)) p3 += 40;
    }
  let dark = 0;
  for (let r3 = 0; r3 < size; r3++) for (let c3 = 0; c3 < size; c3++) if (mod[r3][c3]) dark++;
  const ratio = dark * 100 / (size * size);
  p3 += Math.floor(Math.abs(ratio - 50) / 5) * 10;
  return p3;
}
function qrMatrix(text) {
  const bytes = utf8(text);
  const need = 4 + 8 + bytes.length * 8;
  let vi = -1;
  for (let i4 = 0; i4 < ECC_L.length; i4++) if (ECC_L[i4].data * 8 >= need) {
    vi = i4;
    break;
  }
  if (vi < 0) return null;
  const spec = ECC_L[vi];
  const size = 17 + 4 * (vi + 1);
  const bits = [];
  const push = (val, len) => {
    for (let i4 = len - 1; i4 >= 0; i4--) bits.push(getBit(val, i4));
  };
  push(4, 4);
  push(bytes.length, 8);
  for (const b2 of bytes) push(b2, 8);
  const cap = spec.data * 8;
  for (let i4 = 0; i4 < 4 && bits.length < cap; i4++) bits.push(false);
  while (bits.length % 8 !== 0) bits.push(false);
  const padBytes = [236, 17];
  for (let i4 = 0; bits.length < cap; i4++) push(padBytes[i4 % 2], 8);
  const dataCw = [];
  for (let i4 = 0; i4 < bits.length; i4 += 8) {
    let b2 = 0;
    for (let j3 = 0; j3 < 8; j3++) b2 = b2 << 1 | (bits[i4 + j3] ? 1 : 0);
    dataCw.push(b2);
  }
  const all = dataCw.concat(reedSolomon(dataCw, spec.ec));
  const { mod, fn } = newGrid(size);
  placeFinder(mod, fn, 0, 0, size);
  placeFinder(mod, fn, 0, size - 7, size);
  placeFinder(mod, fn, size - 7, 0, size);
  for (let i4 = 8; i4 < size - 8; i4++) {
    const v3 = i4 % 2 === 0;
    if (!fn[6][i4]) {
      mod[6][i4] = v3;
      fn[6][i4] = true;
    }
    if (!fn[i4][6]) {
      mod[i4][6] = v3;
      fn[i4][6] = true;
    }
  }
  if (spec.align.length) {
    const first = spec.align[0], last = spec.align[spec.align.length - 1];
    for (const r3 of spec.align) for (const c3 of spec.align) {
      if (r3 === first && c3 === first || r3 === first && c3 === last || r3 === last && c3 === first) continue;
      placeAlignment(mod, fn, r3, c3);
    }
  }
  reserveFormat(fn, size);
  fn[size - 8][8] = true;
  let bi = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j3 = 0; j3 < 2; j3++) {
        const col = right - j3;
        const upward = (right + 1 & 2) === 0;
        const row = upward ? size - 1 - vert : vert;
        if (!fn[row][col] && bi < all.length * 8) {
          mod[row][col] = getBit(all[bi >> 3], 7 - (bi & 7));
          bi++;
        }
      }
    }
  }
  let best = -1, bestPenalty = Infinity;
  for (let m3 = 0; m3 < 8; m3++) {
    for (let r3 = 0; r3 < size; r3++) for (let c3 = 0; c3 < size; c3++) if (!fn[r3][c3] && MASK_FN[m3](r3, c3)) mod[r3][c3] = !mod[r3][c3];
    drawFormat(mod, size, m3);
    const pen = penalty(mod, size);
    if (pen < bestPenalty) {
      bestPenalty = pen;
      best = m3;
    }
    for (let r3 = 0; r3 < size; r3++) for (let c3 = 0; c3 < size; c3++) if (!fn[r3][c3] && MASK_FN[m3](r3, c3)) mod[r3][c3] = !mod[r3][c3];
  }
  for (let r3 = 0; r3 < size; r3++) for (let c3 = 0; c3 < size; c3++) if (!fn[r3][c3] && MASK_FN[best](r3, c3)) mod[r3][c3] = !mod[r3][c3];
  drawFormat(mod, size, best);
  return mod;
}
function qrSvg(text, opts = {}) {
  const m3 = qrMatrix(text);
  if (!m3) return null;
  const margin = opts.margin ?? 4;
  const n2 = m3.length;
  const dim = n2 + margin * 2;
  let path = "";
  for (let r3 = 0; r3 < n2; r3++) for (let c3 = 0; c3 < n2; c3++) if (m3[r3][c3]) path += `M${c3 + margin} ${r3 + margin}h1v1h-1z`;
  return `<svg viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="${dim}" height="${dim}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
}

// src/core/partner-match.ts
function liftKeyForName(name) {
  const s3 = String(name || "").toLowerCase();
  if (s3.includes("bench")) return "bench";
  if (s3.includes("deadlift") || s3.includes("rdl") || s3.includes("romanian")) return "deadlift";
  if (s3.includes("hip thrust") || s3.includes("hipthrust")) return "hipthrust";
  if (s3.includes("overhead") || s3.includes("ohp") || s3.includes("military") || s3.includes("shoulder press")) return "ohp";
  if (s3.includes("pull-up") || s3.includes("pullup") || s3.includes("pull up") || s3.includes("chin-up") || s3.includes("chinup")) return "pullup";
  if (s3.includes("row")) return "row";
  if (s3.includes("squat")) return "squat";
  return s3.trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "lift";
}
function resolveJointRx(lifter, joint) {
  const mine = lifter.dayPlan.find((it) => it.eid === joint.eid);
  const base = { key: joint.key, eid: joint.eid, name: joint.name, unit: lifter.unit };
  if (mine) {
    return { ...base, sets: mine.sets, reps: mine.reps, load: mine.load, source: "programmed" };
  }
  const sch = lifter.scheme;
  const skey = joint.key || liftKeyForName(joint.name);
  const max = lifter.strengthByKey[skey] || 0;
  if (max > 0) {
    const inc = lifter.incrementByKey && lifter.incrementByKey[skey] || 5;
    return { ...base, sets: sch.sets, reps: sch.reps, load: scaleLoad(max, sch.intensityPct, inc), source: "estimated" };
  }
  if ((lifter.bodyweightKeys || []).includes(skey) || (lifter.bodyweightKeys || []).includes(joint.eid)) {
    return { ...base, sets: sch.sets, reps: sch.reps, load: 0, source: "estimated" };
  }
  return { ...base, sets: sch.sets, reps: sch.reps, load: 0, source: "needs-calibration" };
}
function buildJointPlan(lifter, joints) {
  return joints.map((j3) => resolveJointRx(lifter, j3));
}
function jointLiftsFromMap(map) {
  return Object.values(map || {}).filter((j3) => !!j3).sort((a3, b2) => (a3.addedAt || 0) - (b2.addedAt || 0) || a3.eid.localeCompare(b2.eid));
}

// src/core/partner-pairing.ts
function participantFromUser(u4, opts) {
  return {
    uid: u4.uid,
    handle: u4.handle,
    name: u4.name || u4.handle,
    role: opts.role,
    maxes: opts.shareMaxes ? u4.maxes || {} : {},
    maxesShared: !!opts.shareMaxes,
    focus: u4.focus || [],
    equipment: u4.equipment || [],
    dayPlan: u4.dayPlan || [],
    ready: false,
    lastSeen: opts.now ?? Date.now(),
    progress: { sharedDone: 0, splitDone: 0 }
  };
}
function newPartnerSession(host, opts) {
  const now = opts.now ?? Date.now();
  const host0 = participantFromUser(host, { role: "host", shareMaxes: opts.shareMaxes ?? false, now });
  return {
    id: opts.id,
    hostUid: host.uid,
    status: "lobby",
    createdAt: now,
    updatedAt: now,
    vibe: opts.vibe ?? "hypertrophy",
    joinCode: opts.code ?? null,
    participants: { [host.uid]: host0 },
    sharedLifts: [],
    jointLifts: {},
    liveState: { currentLiftIndex: 0, turn: null, restEndsAt: null }
  };
}
function isOnline(p3, now = Date.now(), staleMs = 3e4) {
  return !!p3 && now - p3.lastSeen <= staleMs;
}
var FLOW = {
  lobby: ["proposing", "abandoned"],
  proposing: ["active", "lobby", "abandoned"],
  active: ["split", "abandoned"],
  split: ["complete", "abandoned"],
  complete: [],
  abandoned: []
};
function canTransition(from, to) {
  return to === "abandoned" ? from !== "complete" : (FLOW[from] || []).includes(to);
}
var JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var DEFAULT_CODE_TTL_MS = 10 * 60 * 1e3;
function makeJoinCode(len = 6, rand = Math.random) {
  let s3 = "";
  for (let i4 = 0; i4 < len; i4++) s3 += JOIN_CODE_ALPHABET[Math.floor(rand() * JOIN_CODE_ALPHABET.length)];
  return s3;
}
function normalizeJoinCode(input) {
  return String(input || "").toUpperCase().replace(/[\s-]+/g, "");
}
function codeRecord(code, sessionId, hostUid, opts = {}) {
  const now = opts.now ?? Date.now();
  return { code: normalizeJoinCode(code), sessionId, hostUid, expiresAt: now + (opts.ttlMs ?? DEFAULT_CODE_TTL_MS) };
}
function isCodeExpired(rec, now = Date.now()) {
  return !rec || now >= rec.expiresAt;
}

// src/core/partner-session.ts
async function hostCreateSession(be, host, opts = {}) {
  const id = be.newId();
  const code = normalizeJoinCode(opts.code ?? makeJoinCode(opts.codeLen ?? 6));
  const session = newPartnerSession(host, { id, code, vibe: opts.vibe, shareMaxes: opts.shareMaxes, now: be.now() });
  await be.createSession(session);
  await be.putCode(codeRecord(code, id, host.uid, { ttlMs: opts.ttlMs, now: be.now() }));
  return { session, code };
}
async function joinByCode(be, user, codeInput, opts = {}) {
  const code = normalizeJoinCode(codeInput);
  const rec = await be.getCode(code);
  if (!rec) return { ok: false, error: "not-found" };
  if (isCodeExpired(rec, be.now())) return { ok: false, error: "expired" };
  const session = await be.getSession(rec.sessionId);
  if (!session) return { ok: false, error: "gone" };
  if (session.status === "abandoned" || session.status === "complete") return { ok: false, error: "closed" };
  if (!session.participants[user.uid]) {
    const p3 = participantFromUser(user, { role: "guest", shareMaxes: !!opts.shareMaxes, now: be.now() });
    await be.patchSession(rec.sessionId, { participants: { [user.uid]: p3 }, updatedAt: be.now() });
  }
  return { ok: true, session: await be.getSession(rec.sessionId) };
}
async function setReadyRemote(be, id, uid, ready) {
  await be.patchSession(id, { participants: { [uid]: { ready, lastSeen: be.now() } }, updatedAt: be.now() });
}
async function heartbeat(be, id, uid) {
  await be.patchSession(id, { participants: { [uid]: { lastSeen: be.now() } } });
}
async function toggleJointLift(be, id, joint, eid) {
  await be.patchSession(id, { jointLifts: { [eid]: joint }, updatedAt: be.now() });
}
async function publishJointRx(be, id, uid, rx) {
  await be.patchSession(id, { participants: { [uid]: { jointRx: rx } }, updatedAt: be.now() });
}
async function transition(be, id, to) {
  const s3 = await be.getSession(id);
  if (!s3 || !canTransition(s3.status, to)) return false;
  await be.patchSession(id, { status: to, updatedAt: be.now() });
  return true;
}

// src/ui/partner-app.tsx
var ERR = { "not-found": "No session with that code.", expired: "That code has expired.", gone: "That session is no longer available.", closed: "That session has already ended." };
function toUsers(session, ctx) {
  return Object.values(session.participants).map((p3) => ({
    uid: p3.uid,
    name: p3.name,
    maxes: p3.maxes,
    focus: p3.focus || [],
    equipment: p3.equipment || [],
    bodyweightLb: p3.uid === ctx.uid ? ctx.bodyweightLb : void 0,
    experience: p3.uid === ctx.uid ? ctx.experience : void 0
  }));
}
function incrFor(eid, catalog = PARTNER_COMPOUNDS) {
  return catalog.find((c3) => c3.eid === eid)?.increment ?? 5;
}
function PartnerApp(p3) {
  const { backend, ctx } = p3;
  const me = { uid: ctx.uid, handle: ctx.handle, name: ctx.name, maxes: ctx.maxes, focus: ctx.focus, equipment: ctx.equipment, dayPlan: ctx.dayPlan || [] };
  const [view, setView] = d2("entry");
  const [sessionId, setSessionId] = d2(null);
  const [session, setSession] = d2(null);
  const [feed, setFeed] = d2([]);
  const [code, setCode] = d2("");
  const [joinError, setJoinError] = d2("");
  const [busy, setBusy] = d2(false);
  const [vibe, setVibe] = d2("hypertrophy");
  const [removed, setRemoved] = d2(/* @__PURE__ */ new Set());
  const [calib, setCalib] = d2(null);
  const [calibratedMaxes, setCalibratedMaxes] = d2({});
  const [setupNeeded, setSetupNeeded] = d2(false);
  const triedInitial = A2(false);
  const onCalibSubmit = (max) => {
    if (calib) setCalibratedMaxes((m3) => ({ ...m3, [calib.key]: max }));
    setCalib(null);
  };
  const withCalib = (content) => /* @__PURE__ */ u3(S, { children: [
    content,
    calib ? /* @__PURE__ */ u3(CalibrationSheet, { liftName: calib.liftName, unit: ctx.unit, onSubmit: onCalibSubmit, onCancel: () => setCalib(null) }) : null
  ] });
  y2(() => {
    if (!sessionId) return;
    const u1 = backend.watchSession(sessionId, (s3) => setSession(s3));
    const u22 = backend.watchFeed(sessionId, (f4) => setFeed(f4));
    const ms = p3.heartbeatMs ?? 1e4;
    const hb = ms > 0 ? setInterval(() => {
      heartbeat(backend, sessionId, ctx.uid).catch(() => {
      });
    }, ms) : null;
    return () => {
      u1();
      u22();
      if (hb) clearInterval(hb);
    };
  }, [sessionId]);
  y2(() => {
    if (p3.initialJoinCode && !triedInitial.current) {
      triedInitial.current = true;
      doJoin(p3.initialJoinCode);
    }
  }, []);
  function describeErr(e3) {
    if (e3?.code === "permission-denied" || /insufficient permissions|PERMISSION_DENIED/i.test(e3?.message || "")) {
      setSetupNeeded(true);
      return "Partner Sessions need a one-time server setup.";
    }
    return "Couldn't start: " + (e3?.message || "network error \u2014 check your connection.");
  }
  async function startSession() {
    setBusy(true);
    setJoinError("");
    try {
      const r3 = await hostCreateSession(backend, me, { vibe, shareMaxes: ctx.shareMaxes });
      setCode(r3.code);
      setSessionId(r3.session.id);
    } catch (e3) {
      if (typeof console !== "undefined") console.error("[partner] hostCreateSession failed", e3);
      const msg = describeErr(e3);
      setJoinError(msg);
      p3.onToast?.(msg);
    } finally {
      setBusy(false);
    }
  }
  async function doJoin(raw) {
    setBusy(true);
    setJoinError("");
    try {
      const r3 = await joinByCode(backend, me, raw, { shareMaxes: ctx.shareMaxes });
      if (r3.ok) {
        setSessionId(r3.session.id);
        setCode(r3.session.joinCode || "");
      } else setJoinError(ERR[r3.error] || "Could not join.");
    } catch (e3) {
      if (typeof console !== "undefined") console.error("[partner] joinByCode failed", e3);
      const msg = describeErr(e3);
      setJoinError(msg);
      p3.onToast?.(msg);
    } finally {
      setBusy(false);
    }
  }
  const meReady = !!(session && session.participants[ctx.uid]?.ready);
  const isHost = !!(session && session.hostUid === ctx.uid);
  const now = backend.now();
  const suggestions = T2(() => {
    if (!session) return [];
    return suggestSharedLifts(toUsers(session, ctx), ctx.catalog ?? PARTNER_COMPOUNDS).filter((s3) => !removed.has(s3.eid));
  }, [session && JSON.stringify(session.participants), vibe, removed]);
  const proposalLifts = T2(() => {
    if (!session) return [];
    const users = toUsers(session, ctx);
    const scheme = VIBE_SCHEMES[vibe];
    return suggestions.map((s3) => {
      const plan = buildSharedLiftPlan(s3, users, scheme, incrFor(s3.eid, ctx.catalog ?? PARTNER_COMPOUNDS));
      return {
        eid: s3.eid,
        name: s3.name,
        reason: s3.reason,
        scheme,
        loads: plan.loads.map((l3) => ({ uid: l3.uid, name: l3.name, load: l3.load, unit: ctx.unit, maxSource: l3.maxSource, needsCalibration: l3.needsCalibration }))
      };
    });
  }, [suggestions, vibe, session && JSON.stringify(session.participants)]);
  const qrHtml = T2(() => {
    if (!code) return null;
    const base = typeof location !== "undefined" ? location.origin + location.pathname : "";
    return qrSvg(base + "#join=" + code);
  }, [code]);
  const myLifter = T2(() => ({
    dayPlan: ctx.dayPlan || [],
    scheme: ctx.scheme || VIBE_SCHEMES.hypertrophy,
    strengthByKey: { ...ctx.strengthByKey || {}, ...calibratedMaxes },
    bodyweightKeys: ctx.bodyweightKeys || [],
    unit: ctx.unit
  }), [ctx, calibratedMaxes]);
  const joints = T2(() => jointLiftsFromMap(session?.jointLifts), [session && JSON.stringify(session.jointLifts)]);
  const myRx = T2(() => buildJointPlan(myLifter, joints), [myLifter, joints]);
  y2(() => {
    if (!sessionId || !session || session.status !== "proposing") return;
    const mine = session.participants[ctx.uid]?.jointRx || [];
    if (JSON.stringify(mine) !== JSON.stringify(myRx)) publishJointRx(backend, sessionId, ctx.uid, myRx).catch(() => {
    });
  }, [sessionId, session?.status, JSON.stringify(myRx)]);
  if (!session) {
    if (setupNeeded) {
      return /* @__PURE__ */ u3("div", { class: "pn-entry card pn-setup", children: [
        /* @__PURE__ */ u3("div", { class: "card-h", children: /* @__PURE__ */ u3("h2", { children: "Almost there" }) }),
        /* @__PURE__ */ u3("p", { class: "pn-sub", children: "Lift Together needs a quick one-time server permission update before the first session can be created. This is an owner-level setup step \u2014 once it's done, partner sessions work for everyone." }),
        /* @__PURE__ */ u3("ol", { class: "pn-setup-steps", children: [
          /* @__PURE__ */ u3("li", { children: [
            "Open the ",
            /* @__PURE__ */ u3("b", { children: "Firebase console" }),
            " \u2192 Firestore Database \u2192 ",
            /* @__PURE__ */ u3("b", { children: "Rules" }),
            "."
          ] }),
          /* @__PURE__ */ u3("li", { children: [
            "Add the ",
            /* @__PURE__ */ u3("code", { children: "partner_sessions" }),
            ", ",
            /* @__PURE__ */ u3("code", { children: "session_codes" }),
            " & ",
            /* @__PURE__ */ u3("code", { children: "partner_invites" }),
            " rules, then ",
            /* @__PURE__ */ u3("b", { children: "Publish" }),
            "."
          ] }),
          /* @__PURE__ */ u3("li", { children: [
            "Come back and tap ",
            /* @__PURE__ */ u3("b", { children: "Try again" }),
            "."
          ] })
        ] }),
        /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta btn-block pn-setup-retry", onClick: () => {
          setSetupNeeded(false);
          setJoinError("");
        }, children: "Try again" }),
        /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost btn-block", onClick: () => p3.onExit(), children: "Close" })
      ] });
    }
    return /* @__PURE__ */ u3(
      PartnerEntry,
      {
        mode: view === "joining" ? "joining" : "idle",
        code,
        joinError,
        busy,
        actions: { startSession, openJoin: () => setView("joining"), submitJoin: (c3) => doJoin(c3), cancel: () => {
          setView("entry");
          setJoinError("");
        } }
      }
    );
  }
  if (session.status === "lobby") {
    const roster = Object.values(session.participants).map((x2) => ({
      uid: x2.uid,
      name: x2.name,
      handle: x2.handle,
      role: x2.role,
      ready: x2.ready,
      online: isOnline(x2, now),
      maxesShared: x2.maxesShared
    }));
    return /* @__PURE__ */ u3("div", { class: "pn-flow", children: [
      isHost && code ? /* @__PURE__ */ u3("div", { class: "pn-lobby-code", children: [
        "Join code: ",
        /* @__PURE__ */ u3("b", { children: code })
      ] }) : null,
      isHost && qrHtml ? /* @__PURE__ */ u3("div", { class: "pn-qr", "aria-label": "Scan to join", dangerouslySetInnerHTML: { __html: qrHtml } }) : null,
      /* @__PURE__ */ u3(
        PartnerLobby,
        {
          participants: roster,
          meUid: ctx.uid,
          isHost,
          actions: {
            toggleReady: (r3) => setReadyRemote(backend, session.id, ctx.uid, r3),
            start: () => transition(backend, session.id, "proposing"),
            invite: () => {
              try {
                const url = location.origin + location.pathname + "#join=" + code;
                const done = () => p3.onToast?.("Invite link copied \u2014 text it to your partner.");
                if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done, done);
                else done();
              } catch {
              }
            },
            leave: () => p3.onExit()
          }
        }
      )
    ] });
  }
  if (session.status === "proposing") {
    const participants = Object.values(session.participants).map((x2) => ({
      uid: x2.uid,
      name: x2.name,
      dayPlan: x2.dayPlan || [],
      rx: x2.uid === ctx.uid ? myRx : x2.jointRx || []
    }));
    return withCalib(
      /* @__PURE__ */ u3(
        MatchBoard,
        {
          meUid: ctx.uid,
          participants,
          joints,
          unit: ctx.unit,
          busy,
          actions: {
            toggle: (item) => {
              const isIn = joints.some((j3) => j3.eid === item.eid);
              const jl = isIn ? null : { eid: item.eid, key: liftKeyForName(item.name), name: item.name, addedBy: ctx.uid, addedAt: backend.now() };
              toggleJointLift(backend, session.id, jl, item.eid).catch(() => {
              });
            },
            remove: (eid) => {
              toggleJointLift(backend, session.id, null, eid).catch(() => {
              });
            },
            calibrate: (rx) => setCalib({ eid: rx.eid, key: rx.key, liftName: rx.name }),
            start: async () => {
              await publishJointRx(backend, session.id, ctx.uid, myRx).catch(() => {
              });
              p3.onStartJoint?.(myRx);
            },
            back: () => transition(backend, session.id, "lobby")
          }
        }
      )
    );
  }
  if (session.status === "active" || session.status === "split") {
    return /* @__PURE__ */ u3("div", { class: "pn-split card", children: [
      /* @__PURE__ */ u3("div", { class: "card-h", children: /* @__PURE__ */ u3("h2", { children: "Training together" }) }),
      /* @__PURE__ */ u3("p", { class: "pn-sub", children: "Your shared lifts are loaded on your Train tab \u2014 do them together at each of your own loads, then finish your own accessories. Your partner does theirs." }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta btn-block", onClick: () => p3.onGoToSplit?.(), children: "Go to my workout" }),
      /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-ghost btn-block", onClick: () => p3.onExit(), children: "Leave session" })
    ] });
  }
  return /* @__PURE__ */ u3("div", { class: "pn-done card", children: [
    /* @__PURE__ */ u3("div", { class: "card-h", children: /* @__PURE__ */ u3("h2", { children: session.status === "abandoned" ? "Session ended" : "Nice work together" }) }),
    /* @__PURE__ */ u3("button", { type: "button", class: "btn btn-cta btn-block", onClick: () => p3.onExit(), children: "Done" })
  ] });
}
function mountPartnerApp(container, props) {
  R(/* @__PURE__ */ u3(PartnerApp, { ...props }), container);
}
export {
  AchievementsWall,
  BodyMetrics,
  CalibrationSheet,
  ExerciseCard,
  FocusShell,
  MatchBoard,
  PartnerApp,
  PartnerEntry,
  PartnerLobby,
  PersonalRecords,
  PlanView,
  ProfileSettings,
  ReadinessCard,
  SessionFeelCard,
  SessionSummary,
  SharedBlockProposal,
  SocialView,
  StrengthProgress,
  TrainingHeatmap,
  WarmupChecklist,
  WorkoutTools,
  mountAchievements,
  mountBodyMetrics,
  mountCalibrationSheet,
  mountExerciseCard,
  mountFocusShell,
  mountMatchBoard,
  mountPartnerApp,
  mountPartnerEntry,
  mountPartnerLobby,
  mountPersonalRecords,
  mountPlan,
  mountProfileSettings,
  mountReadinessCard,
  mountSessionFeelCard,
  mountSessionSummary,
  mountSharedBlockProposal,
  mountSocial,
  mountStrengthProgress,
  mountTrainingHeatmap,
  mountWarmupChecklist,
  mountWorkoutToolsCard
};
