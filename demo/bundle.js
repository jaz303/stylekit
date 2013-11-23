;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var stylekit = require('../');

window.init = function() {

    var styleSet = stylekit();

    styleSet.vars.set('MAIN_COLOR', 'red');
    styleSet.vars.set('SECONDARY_COLOR', 'pink');

    var b1 = styleSet.block();
    b1.appendCSS('h1 { color: $MAIN_COLOR; }');
    b1.commit();

    var b2 = styleSet.block();
    b2.appendCSS('div { border: 5px solid $MAIN_COLOR; background: $SECONDARY_COLOR; padding: 30px; })');
    b2.commit();

    function bindInput(name, v) {
        var input = document.querySelector('input[name=' + name + ']');
        input.value = styleSet.vars.get(v);
        document.querySelector('input[type=button]').addEventListener('click', function() {
            styleSet.vars.set(v, input.value);
        });
    }

    bindInput('main', 'MAIN_COLOR');
    bindInput('secondary', 'SECONDARY_COLOR');

}
},{"../":2}],2:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};var styleTag    = require('style-tag'),
    wmap        = require('wmap');

var VAR_RE      = /\$[\w-]+/g;

//
//

function StyleSet(doc) {
    
    this._document = doc || global.document || document;
    this._blocks = [];
    
    this.vars = wmap();
    
    this.vars.getInt = function(key) {
        var val = this.get(key);
        return (typeof val === 'undefined')
                ? Number.NaN
                : parseInt(val, 10);
    }

    this.vars.getFloat = function(key) {
        var val = this.get(key);
        return (typeof val === 'undefined')
                ? Number.NaN
                : parseFloat(val, 10);
    }

}

StyleSet.prototype.block = function() {
    var block = new StyleBlock(this);
    this._blocks.push(block);
    return block;
}

//
//

function StyleBlock(set) {
    this._styleSet = set;
    this._styleTag = null;
    this._unwatch = null;

    this._css = '';
}

StyleBlock.prototype.appendCSS = function(css) {
    this._checkMutable();
    this._css += css;
    return this;
}

StyleBlock.prototype.commit = function() {

    if (this._styleTag !== null)
        return;

    this._watchReferencedVariables();

    this._styleTag = styleTag(this._styleSet._document, this._cssWithVariableExpansion());

}

StyleBlock.prototype.destroy = function() {
    if (this._styleTag) {
        this._styleTag.destroy();
        this._styleTag = false;
        this._unwatch();
        this._unwatch = null;
    }
}

StyleBlock.prototype._watchReferencedVariables = function() {

    var referencedVariables = this._css.match(VAR_RE).map(function(v) { return v.substr(1); });

    this._unwatch = this._styleSet.vars.watch(referencedVariables, function() {
        this._styleTag(this._cssWithVariableExpansion());
    }.bind(this));

}

StyleBlock.prototype._cssWithVariableExpansion = function() {
    var vars = this._styleSet.vars;
    return this._css.replace(VAR_RE, function(m) {
        return vars.get(m.substr(1));
    });
}

StyleBlock.prototype._checkMutable = function() {
    if (this._styleTag !== null) {
        throw new Error("style block is immutable - style tag already created");
    }
}

//
//

module.exports = function(doc) {
    return new StyleSet(doc);
}
},{"style-tag":3,"wmap":4}],3:[function(require,module,exports){
// adapted from
// http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
module.exports = function(doc, initialCss) {
    
    if (typeof doc === 'string') {
        initialCss = doc;
        doc = null;
    }

    doc = doc || document;

    var head    = doc.getElementsByTagName('head')[0],
        style   = doc.createElement('style');

    style.type = 'text/css';
    head.appendChild(style);

    function set(css) {
        css = '' + (css || '');
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            while (style.childNodes.length) {
                style.removeChild(style.firstChild);
            }
            style.appendChild(doc.createTextNode(css));
        }
    }

    set(initialCss || '');

    set.el = style;
    set.destroy = function() {
        head.removeChild(style);
    }

    return set;

}
},{}],4:[function(require,module,exports){
function WMap(parent) {
    this._entries = {};
    this._watchers = {};
}

WMap.prototype.get = function(key) {
    return this._entries[key];
}

WMap.prototype.set = function(key, value) {
    var vb = this._entries[key];
    this._entries[key] = value;
    this._dispatch(key, vb, value);
}

WMap.prototype.remove = function(key) {
    var vb = this._entries[key];
    delete this._entries[key];
    this._dispatch(key, vb, undefined);
}

WMap.prototype.watch = function(keys, cb) {

    if (!Array.isArray(keys))
        keys = [keys];

    if (keys.length === 0)
        return function() {};

    var ws = this._watchers;

    keys.forEach(function(k) {
        (k in ws) ? ws[k].push(cb) : (ws[k] = [cb]);
    }, this);

    return function() {
        keys.forEach(function(k) {
            var kws = ws[k];
            for (var i = 0; i < kws.length; ++i) {
                if (kws[i] === cb) {
                    kws.splice(i, 1);
                    return;
                }
            }
        });
    };

}

WMap.prototype._dispatch = function(key, oldValue, newValue) {

    var ws = this._watchers[key];

    if (!ws)
        return;

    ws.forEach(function(c) { c(key, oldValue, newValue); });

}

module.exports = function() {
    return new WMap();
}

},{}]},{},[1])
;